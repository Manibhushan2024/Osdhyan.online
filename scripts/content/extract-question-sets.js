#!/usr/bin/env node
/**
 * Converts the question data files of the standalone "bpsc-aedo-app"
 * (data-*.js: `const xData = [{id, cat, q, opts[4] "A. text", ans 0-3, exp}]`)
 * into the JSON spec consumed by `php artisan osdhyan:import-question-sets`.
 *
 *   node scripts/content/extract-question-sets.js <app folder> <out.json>
 *
 * Sets without options (answer keys only) are skipped — they can't be tests.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const [, , srcDir, outFile] = process.argv;
if (!srcDir || !outFile) {
  console.error('usage: extract-question-sets.js <app folder> <out.json>');
  process.exit(1);
}

// Evaluate every data-*.js in one sandbox (they only declare consts).
const ctx = vm.createContext({});
for (const f of fs.readdirSync(srcDir).filter((f) => /^data-.*\.js$/.test(f))) {
  const src = fs.readFileSync(path.join(srcDir, f), 'utf8').replace(/^const /gm, 'var ');
  vm.runInContext(src, ctx, { filename: f });
}

const DEVANAGARI = /[ऀ-ॿ]/;
const isHindi = (s) => DEVANAGARI.test(s);

/** "A. पटना / Patna" → {hi:"पटना", en:"Patna"}; "B. Novel" → {en:"Novel"} */
function splitOption(raw) {
  let text = String(raw).replace(/^\s*[A-Ea-e][.)]\s*/, '').trim();
  const parts = text.split(/\s+\/\s+/);
  if (parts.length === 2 && isHindi(parts[0]) && !isHindi(parts[1])) {
    return { hi: parts[0].trim(), en: parts[1].trim() };
  }
  if (parts.length === 2 && !isHindi(parts[0]) && isHindi(parts[1])) {
    return { hi: parts[1].trim(), en: parts[0].trim() };
  }
  return isHindi(text) ? { hi: text, en: null } : { hi: null, en: text };
}

/** "हिन्दी प्रश्न\nEnglish question" → {hi, en}; single-language → that side */
function splitQuestion(raw) {
  const lines = String(raw).split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) {
    const hi = lines.filter(isHindi).join('\n');
    const en = lines.filter((l) => !isHindi(l)).join('\n');
    if (hi && en) return { hi, en };
  }
  const text = lines.join('\n');
  return isHindi(text) ? { hi: text, en: null } : { hi: null, en: text };
}

function toQuestion(item, fallbackCat) {
  if (!Array.isArray(item.opts) || item.opts.length < 2) return null;
  const q = splitQuestion(item.q);
  const exp = String(item.exp || '').replace(/\s*\|\s*/g, '\n• ').trim();
  const expIsHindi = isHindi(exp);
  return {
    source_id: String(item.id ?? ''),
    category: String(item.cat || fallbackCat || 'General').trim(),
    question_en: q.en,
    question_hi: q.hi,
    options: item.opts.map(splitOption),
    answer_index: Number(item.ans),
    explanation_en: exp && !expIsHindi ? (exp.startsWith('•') ? exp : '• ' + exp) : null,
    explanation_hi: exp && expIsHindi ? (exp.startsWith('•') ? exp : '• ' + exp) : null,
  };
}

function collect(names) {
  const out = [];
  for (const n of names) {
    const arr = ctx[n];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      const q = toQuestion(item);
      if (q && q.answer_index >= 0 && q.answer_index < q.options.length) out.push(q);
    }
  }
  return out;
}

function chunk(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

/** Build tests of `size` questions from a pool, titled "<prefix> N". */
function tests(prefix, pool, size, durationMin, subject) {
  return chunk(pool, size).map((qs, i) => ({
    title: `${prefix} ${i + 1}`,
    subject,
    duration_min: durationMin,
    questions: qs,
  }));
}

const spec = {
  exams: [
    {
      name_en: 'BPSC (Bihar Public Service Commission)',
      slug: 'bpsc',
      series: [
        {
          name_en: 'BPSC AEDO 2026 — Complete Test Series',
          name_hi: 'BPSC AEDO 2026 — सम्पूर्ण टेस्ट सीरीज़',
          description_en:
            'Everything for the Agriculture Extension & Development Officer exam: practice sets, most-expected questions (incl. Assertion–Reason), reasoning, and GS foundation & history deep-dive tests with detailed Hindi explanations. Negative marking 0.25 as per BPSC pattern.',
          mode: 'mock',
          negative_marking: 0.25,
          tests: [
            ...tests('AEDO Practice Set', collect(['pqData1', 'pqData2', 'pqData3', 'pqData4']), 50, 40, 'General Studies'),
            ...tests('AEDO Most Expected Set', collect(['eqData1', 'eqData2']), 50, 40, 'General Studies'),
            ...tests('AEDO Reasoning Set', collect(['mathData1', 'mathData2']), 50, 45, 'Reasoning'),
            ...tests('AEDO GS Foundation Test', collect(['bpscData1']), 100, 80, 'General Studies'),
            ...tests('AEDO History & Culture Test', collect(['bpscData2']), 100, 80, 'History & Culture'),
          ],
        },
      ],
    },
    {
      name_en: 'BSSC CGL (Bihar Staff Selection Commission)',
      slug: 'bssc-cgl',
      code: 'BSSC_CGL',
      series: [
        {
          name_en: 'BSSC CGL — Most Expected Question Sets',
          name_hi: 'BSSC CGL — अति संभावित प्रश्न सेट',
          description_en: 'Eight 125-question sets in Hindi + English covering Bihar GK, Indian history, geography, polity, science, maths and reasoning for BSSC CGL.',
          mode: 'mock',
          negative_marking: 0.25,
          tests: [1, 2, 3, 4, 5, 6, 7, 8]
            .map((i) => collect([`cglData${i}`]))
            .filter((qs) => qs.length)
            .map((qs, i) => ({ title: `BSSC CGL Expected Set ${i + 1}`, subject: 'General Studies', duration_min: 100, questions: qs })),
        },
      ],
    },
  ],
};

let total = 0;
for (const e of spec.exams) for (const s of e.series) for (const t of s.tests) total += t.questions.length;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(spec));
console.log(`wrote ${outFile}: ${total} questions in ${spec.exams.flatMap((e) => e.series.flatMap((s) => s.tests)).length} tests`);
for (const e of spec.exams) for (const s of e.series) console.log(` - ${s.name_en}: ${s.tests.length} tests, ${s.tests.reduce((n, t) => n + t.questions.length, 0)} questions`);
