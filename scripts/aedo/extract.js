#!/usr/bin/env node
/**
 * Converts the question sets of the BPSC AEDO prep app (plain JS arrays:
 * {id, cat, q, opts["A. …"], ans 0-3, exp}) into the JSON spec read by
 * `php artisan osdhyan:import-sets`.
 *
 *   node scripts/aedo/extract.js <app folder> <out.json>
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const [,, src, out] = process.argv;
if (!src || !out) { console.error('usage: extract.js <app folder> <out.json>'); process.exit(1); }

const ctx = {}; vm.createContext(ctx);
for (const f of fs.readdirSync(src).filter(f => /^data-.*\.js$/.test(f))) {
    vm.runInContext(fs.readFileSync(path.join(src, f), 'utf8').replace(/^const /mg, 'var '), ctx, { filename: f });
}
const get = k => Array.isArray(ctx[k]) ? ctx[k] : [];

const isDevanagari = s => /[\u0900-\u097F]/.test(s || '');
const stripLabel = s => String(s ?? '').replace(/^\s*[A-Ea-e][.)]\s*/, '').trim();

/** "हिंदी / English" or "हिंदी\nEnglish" → {hi, en}; otherwise text goes to both. */
function split(text) {
    const t = String(text ?? '').trim();
    const parts = t.includes('\n') ? t.split('\n') : (t.includes(' / ') ? t.split(' / ') : null);
    if (parts && parts.length === 2) {
        const [a, b] = parts.map(x => x.trim());
        if (isDevanagari(a) && !isDevanagari(b)) return { hi: a, en: b };
        if (isDevanagari(b) && !isDevanagari(a)) return { hi: b, en: a };
    }
    return isDevanagari(t) ? { hi: t, en: t } : { hi: null, en: t };
}

function convert(items, fallbackCat) {
    const qs = [];
    for (const it of items) {
        if (!Array.isArray(it.opts) || it.opts.length < 2 || typeof it.ans !== 'number') continue;
        const q = split(it.q);
        const opts = it.opts.map(o => split(stripLabel(o)));
        const exp = String(it.exp ?? '').replace(/\s*\|\s*/g, '\n• ').trim();
        // Bilingual explanations ("हिंदी वाक्य। English sentence.") go to both columns.
        const latinWords = (exp.match(/[A-Za-z]{3,}/g) || []).length;
        const bilingual = isDevanagari(exp) && latinWords >= 6;
        qs.push({
            source_id: String(it.id ?? ''),
            category: String(it.cat || fallbackCat).trim(),
            question_en: q.en, question_hi: q.hi,
            options: opts.map(o => ({ en: o.en, hi: o.hi })),
            correct: it.ans,
            explanation_en: (!isDevanagari(exp) || bilingual) ? (exp || null) : null,
            explanation_hi: isDevanagari(exp) ? exp : null,
        });
    }
    return qs;
}

const chunk = (arr, n) => { const r = []; for (let i = 0; i < arr.length; i += n) r.push(arr.slice(i, i + n)); return r; };

function sets(prefix, items, size, durationMin, subject) {
    return chunk(items, size).map((qs, i) => ({
        name_en: `${prefix} ${i + 1}`,
        subject, duration_min: durationMin, question_mark: 1, negative_marking: 0.25, mode: 'mock',
        questions: qs,
    }));
}

const practice = convert([...get('pqData1'), ...get('pqData2'), ...get('pqData3'), ...get('pqData4')], 'General Studies');
const expected = convert([...get('eqData1'), ...get('eqData2')], 'General Studies');
const reasoning = convert([...get('mathData1'), ...get('mathData2')], 'Reasoning');
const foundation = convert(get('bpscData1'), 'General Studies');
const history = convert(get('bpscData2'), 'Indian History');
const cgl = [1,2,3,4,5,6,7,8].map(i => convert(get('cglData' + i), 'General Knowledge'));

const spec = {
    exams: [
        {
            match: 'bpsc', // existing exam slug to reuse; created if missing
            name_en: 'BPSC (Bihar Public Service Commission)', code: 'BPSC',
            series: [{
                name_en: 'BPSC AEDO 2026 — Complete Test Series',
                name_hi: 'BPSC AEDO 2026 — सम्पूर्ण टेस्ट सीरीज़',
                description_en: `${practice.length + expected.length + reasoning.length + foundation.length + history.length} questions with explanations: practice sets, most-expected (assertion–reason & statement) sets, reasoning, GS foundation and Indian history deep-dive — all in the BPSC AEDO pattern with −0.25 negative marking.`,
                is_published: true, is_paid: false,
                tests: [
                    ...sets('AEDO Practice Set', practice, 50, 40, 'General Studies'),
                    ...sets('AEDO Most Expected Set', expected, 50, 40, 'General Studies'),
                    ...sets('AEDO Reasoning Set', reasoning, 50, 45, 'Reasoning'),
                    ...sets('AEDO GS Foundation Test', foundation, 100, 80, 'General Studies'),
                    ...sets('AEDO History & Culture Test', history, 100, 80, 'Indian History'),
                ],
            }],
        },
        {
            match: 'bssc-cgl',
            name_en: 'BSSC CGL (Bihar Staff Selection Commission)', code: 'BSSC_CGL',
            series: [{
                name_en: 'BSSC CGL — Most Expected Question Sets',
                description_en: `${cgl.flat().length} bilingual questions with explanations across 8 sets: Bihar GK, History, Geography, Polity, Economy, Science, Reasoning and more.`,
                is_published: true, is_paid: false,
                tests: cgl.map((qs, i) => ({ name_en: `BSSC CGL Expected Set ${i + 1}`, subject: 'General Knowledge', duration_min: 90, question_mark: 1, negative_marking: 0.25, mode: 'mock', questions: qs })),
            }],
        },
    ],
};
fs.writeFileSync(out, JSON.stringify(spec));
const count = spec.exams.flatMap(e => e.series.flatMap(s => s.tests));
console.log(`tests=${count.length} questions=${count.reduce((n, t) => n + t.questions.length, 0)} -> ${out}`);
for (const e of spec.exams) for (const s of e.series) console.log(' ', s.name_en, '→', s.tests.length, 'tests,', s.tests.reduce((n, t) => n + t.questions.length, 0), 'Q');
