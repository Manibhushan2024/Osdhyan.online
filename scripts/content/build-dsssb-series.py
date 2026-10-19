#!/usr/bin/env python3
"""Assemble the DSSSB TGT Computer Science 2026 test series.

Inputs (all under backend/database/data/dsssb unless noted):
  - transcribed/<paper>.json             vision transcription of official papers
  - pyq_raw.json                         text layer: question IDs + official answers
  - gen/<chapter_key>.json               generated chapter pools (GENERATION_SPEC.md)
  - notes/<chapter_key>.md               revision notes (-> PDF + HTML materials)
Output:
  - question_sets_dsssb_tgt_cs.json      spec for `php artisan osdhyan:import-question-sets`
  - backend/storage/app/public/materials/dsssb/*.pdf|html

usage: python build-dsssb-series.py [dir containing transcribed/]   (default: the data folder)
"""
import collections
import glob
import json
import os
import random
import re
import subprocess
import sys

random.seed(2026)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'backend', 'database', 'data', 'dsssb')
MATERIAL_DIR = os.path.join(ROOT, 'backend', 'storage', 'app', 'public', 'materials', 'dsssb')
SCRATCH = sys.argv[1] if len(sys.argv) > 1 else DATA
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

EXAM = {'name_en': 'DSSSB TGT Computer Science', 'name_hi': 'DSSSB TGT कंप्यूटर विज्ञान', 'slug': 'dsssb-tgt-cs', 'code': 'DSSSB_TGT_CS'}

# ── syllabus: chapter_key -> (section/subject, chapter title) ───────────────
CHAPTERS = {
    'ga_current': ('General Awareness', 'Current Affairs'),
    'ga_static': ('General Awareness', 'Static GK'),
    'rea_verbal': ('General Intelligence & Reasoning', 'Verbal Reasoning'),
    'rea_nonverbal': ('General Intelligence & Reasoning', 'Non-verbal Reasoning'),
    'num_arith': ('Arithmetical & Numerical Ability', 'Arithmetic'),
    'num_adv': ('Arithmetical & Numerical Ability', 'Advanced Maths & Data Interpretation'),
    'hindi': ('Hindi Language', 'हिंदी व्याकरण एवं भाषा'),
    'english': ('English Language', 'English Grammar & Comprehension'),
    'cs_prog': ('Computer Science', 'Programming (C / C++ / Java / Python)'),
    'cs_dbms': ('Computer Science', 'DBMS & SQL'),
    'cs_net': ('Computer Science', 'Computer Networks & Internet'),
    'cs_os': ('Computer Science', 'Operating Systems'),
    'cs_dsa': ('Computer Science', 'Data Structures & Algorithms'),
    'cs_fund': ('Computer Science', 'Computer Fundamentals & Digital Logic'),
    'cs_se': ('Computer Science', 'Software Engineering'),
    'cs_web': ('Computer Science', 'Web Technologies'),
    'cs_it': ('Computer Science', 'IT Tools & Emerging Technologies'),
    'teach': ('Teaching Methodology', 'Teaching Methodology'),
}

# Full-mock blueprint (real exam): per-chapter counts summing to 200, weighted by the
# 2023-24 official papers (CS ~90: Fundamentals & IT tools heaviest; Teaching ~10),
# capped so each pool still leaves 25 questions for its chapter test after 6 mocks.
MOCK_BLUEPRINT = {
    'ga_current': 6, 'ga_static': 14, 'rea_verbal': 15, 'rea_nonverbal': 5, 'num_arith': 15, 'num_adv': 5,
    'hindi': 20, 'english': 20,
    'cs_fund': 12, 'cs_it': 10, 'cs_prog': 17, 'cs_net': 12, 'cs_os': 10, 'cs_dbms': 10, 'cs_web': 8, 'cs_dsa': 6, 'cs_se': 5,
    'teach': 10,
}
assert sum(MOCK_BLUEPRINT.values()) == 200

SECTION_ORDER = ['General Intelligence & Reasoning', 'General Awareness', 'Arithmetical & Numerical Ability',
                 'English Language', 'Hindi Language', 'Computer Science', 'Teaching Methodology']

PAPERS = {  # label -> (title, date)
    '2023_06_24_s3': ('DSSSB TGT CS Official Paper — 24 June 2023 (Shift 3)', 2023),
    '2023_06_25_s1': ('DSSSB TGT CS Official Paper — 25 June 2023 (Shift 1)', 2023),
    '2023_06_25_s2': ('DSSSB TGT CS Official Paper — 25 June 2023 (Shift 2)', 2023),
    '2024_02_07_s2': ('DSSSB TGT CS Official Paper — 7 Feb 2024 (Shift 2)', 2024),
}


def norm_section(label):
    l = re.sub(r'\s+', ' ', label or '').lower()
    if 'reason' in l:
        return 'General Intelligence & Reasoning'
    if 'awareness' in l:
        return 'General Awareness'
    if 'arith' in l or 'numer' in l:
        return 'Arithmetical & Numerical Ability'
    if 'english' in l:
        return 'English Language'
    if 'hindi' in l:
        return 'Hindi Language'
    if 'teach' in l:
        return 'Teaching Methodology'
    return 'Computer Science'


def load_solutions():
    """pyq_explanations/done_*.json: qid -> {explanation_en/hi, chapter_key, subtopic, difficulty, key_doubt}."""
    sol = {}
    for path in sorted(glob.glob(os.path.join(DATA, 'pyq_explanations', 'done_*.json'))):
        try:
            sol.update({str(k): v for k, v in json.load(open(path, encoding='utf-8')).items()})
        except Exception as e:  # a half-written file must not break the build
            print(f'!! could not read {path}: {e}')
    print(f'PYQ solutions loaded: {len(sol)}')
    return sol


def load_pyq(solutions):
    """Merge transcription with the text layer (official answer + ids by question_id)."""
    raw = json.load(open(os.path.join(DATA, 'pyq_raw.json'), encoding='utf-8'))
    tests = []
    for label, (title, year) in PAPERS.items():
        path = os.path.join(SCRATCH, 'transcribed', f'{label}.json')
        if not os.path.exists(path):
            print(f'!! missing transcription {path}')
            continue
        trans = json.load(open(path, encoding='utf-8'))
        supp_path = os.path.join(DATA, 'pyq_supplement.json')
        if os.path.exists(supp_path):
            trans = json.load(open(supp_path, encoding='utf-8')).get(label, []) + trans
        by_id = {q['qid']: q for q in raw.get(label, []) if q.get('qid')}
        hi_by_id = {q['qid']: q for q in raw.get(label, []) if q.get('question_hi')}
        questions, dropped, disagreements = [], 0, 0
        seen = set()
        for t in trans:
            if t.get('has_figure') or any('[figure]' in (o or '') for o in t.get('options', [])):
                dropped += 1
                continue
            if len(t.get('options', [])) != 4 or not t.get('question'):
                dropped += 1
                continue
            qid = str(t.get('question_id') or '')
            key = qid or t['question'][:80]
            if key in seen:
                continue
            seen.add(key)
            official = by_id.get(qid)
            ans = t.get('correct')
            if official and official.get('answer_index') is not None:
                if ans is not None and ans - 1 != official['answer_index']:
                    disagreements += 1
                ans = official['answer_index'] + 1  # text-layer icon is authoritative
            if ans is None:
                dropped += 1
                continue
            section = norm_section(t.get('section'))
            hi = hi_by_id.get(qid, {})
            so = solutions.get(qid, {})
            ck = so.get('chapter_key')
            # Only file under a chapter of the same subject (a CS-section question tagged
            # 'teach' stays in Computer Science without a chapter).
            chapter = CHAPTERS[ck][1] if ck in CHAPTERS and CHAPTERS[ck][0] == section else None
            questions.append({
                'category': section,
                'chapter': chapter,
                'chapter_key': ck if ck in CHAPTERS else None,
                'subtopic': so.get('subtopic'),
                'key_doubt': bool(so.get('key_doubt')),
                'question_en': t['question'].strip(),
                'question_hi': (hi.get('question_hi') or None) if section not in ('Hindi Language',) else None,
                'options': [{'en': (o or '').strip(), 'hi': (hi.get('options_hi') or [None] * 4)[i] if hi.get('options_hi') else None} for i, o in enumerate(t['options'])],
                'answer_index': ans - 1,
                'explanation_en': so.get('explanation_en') or t.get('explanation_en'),
                'explanation_hi': so.get('explanation_hi') or t.get('explanation_hi'),
                'difficulty': so.get('difficulty') if so.get('difficulty') in ('easy', 'medium', 'hard') else 'medium',
                'source': {'paper': label, 'qid': qid, 'section_printed': t.get('section'), 'number': t.get('number')},
            })
        print(f'{label}: {len(questions)} usable, {dropped} dropped (figures/incomplete), {disagreements} answer disagreements vs official icon')
        tests.append({
            'title': title, 'year': year, 'paper_type': 'official',
            'subject': 'Computer Science', 'mode': 'pyq', 'category': 'Previous Year Papers',
            'duration_min': 120, 'negative_marking': 0.25,
            'description': f'Official DSSSB question paper ({len(questions)} text questions; figure-based questions removed). Official answer key applied.',
            'questions': questions,
        })
    return tests


POSITIONAL = re.compile(r'all of|none of|both|neither|above|below|\b[A-D1-4]\s*(and|&|,|or)\s*[A-D1-4]\b|\bonly\s*[A-D1-4]\b|सभी|इनमें से कोई|दोनों', re.I)
OPTION_REF = re.compile(r'\b[Oo]ption\s*[1-4A-D]\b|\([a-dA-D1-4]\)|विकल्प\s*[1-4]')


def shuffle_options(item, rng):
    """Shuffle generated options so the right answer is not biased to one position.
    Skipped when an option or the explanation refers to options by position."""
    opts = item['options']
    text = ' '.join((o.get('en') or '') + ' ' + (o.get('hi') or '') for o in opts)
    expl = (item.get('explanation_en') or '') + ' ' + (item.get('explanation_hi') or '')
    if POSITIONAL.search(text) or OPTION_REF.search(expl):
        return item
    order = list(range(len(opts)))
    rng.shuffle(order)
    item['options'] = [opts[i] for i in order]
    item['answer_index'] = order.index(item['answer_index'])
    return item


def load_pools():
    pools = {}
    for key in CHAPTERS:
        path = os.path.join(DATA, 'gen', f'{key}.json')
        if not os.path.exists(path):
            print(f'!! missing pool {key}')
            pools[key] = []
            continue
        items = json.load(open(path, encoding='utf-8'))
        clean, seen = [], set()
        for it in items:
            q = (it.get('question_en') or it.get('question_hi') or '').strip()
            opts = it.get('options') or []
            if not q or len(opts) != 4 or it.get('answer_index') not in (0, 1, 2, 3):
                continue
            # full stem + options: passage questions share a long common prefix
            fp = re.sub(r'\W+', ' ', (q + ' | ' + ' | '.join(str(o.get('en') or o.get('hi') or '') for o in opts)).lower())
            if fp in seen:
                continue
            seen.add(fp)
            section, chapter = CHAPTERS[key]
            clean.append({
                'category': section, 'chapter': chapter, 'subtopic': it.get('subtopic'),
                'question_en': q, 'question_hi': it.get('question_hi'),
                'options': [{'en': (o.get('en') or o.get('hi') or '').strip(), 'hi': o.get('hi')} for o in opts],
                'answer_index': it['answer_index'],
                'explanation_en': it.get('explanation_en'), 'explanation_hi': it.get('explanation_hi'),
                'difficulty': it.get('difficulty') if it.get('difficulty') in ('easy', 'medium', 'hard') else 'medium',
                'expected': bool(it.get('expected')),
                'chapter_key': key,
            })
        rng = random.Random(f'{key}-options')
        clean = [shuffle_options(q, rng) for q in clean]
        random.shuffle(clean)
        pools[key] = clean
        print(f'pool {key}: {len(clean)} usable of {len(items)}')
    return pools


def take(pool, n, used, avoid=()):
    """Take n questions not in `used`; prefer ones not in any `avoid` set, relaxing the
    last avoid set first when the pool runs short."""
    out = []
    for tier in range(len(avoid) + 1):
        blocked = avoid[:len(avoid) - tier]
        for q in pool:
            if len(out) >= n:
                return out
            if id(q) in used or any(id(q) in b for b in blocked):
                continue
            used.add(id(q))
            out.append(q)
    return out


def build_generated(pools, pyq_tests):
    """Selection order keeps the full mocks free of repeats:
    Most Expected (reserved first) -> Full Mocks 5-10 (disjoint) -> chapter tests -> section tests.
    Chapter/section tests prefer unseen questions and only then reuse Most-Expected ones;
    they never reuse a question that sits in a full mock."""
    tests = []
    expected_ids, mock_ids, chapter_ids = set(), set(), set()

    # Full Mocks 1-4 = the official papers, so the series has 10 full-length mocks.
    for i, t in enumerate(pyq_tests, 1):
        tests.append({**t, 'title': f'Full Mock Test {i} — Official Paper {t["title"].split("—", 1)[-1].strip()}',
                      'mode': 'full_mock', 'category': 'Full Mock Tests',
                      'description': 'The real DSSSB paper as a timed full mock (120 min, −0.25). ' + t['description']})

    # 1. Most Expected: up to 200 expected-flagged questions, spread across chapters.
    expected = [q for key in CHAPTERS for q in pools[key] if q['expected']]
    random.shuffle(expected)
    expected = expected[:200]
    for i, chunk in enumerate([expected[i:i + 100] for i in range(0, len(expected), 100)]):
        if len(chunk) < 30:
            break
        for q in chunk:
            expected_ids.add(id(q))
        chunk = sorted(chunk, key=lambda q: SECTION_ORDER.index(q['category']))
        tests.append({'title': f'Most Expected Questions — Set {i + 1}', 'subject': 'Computer Science', 'mode': 'full_mock',
                      'category': 'Most Expected', 'duration_min': 60, 'negative_marking': 0.25, 'questions': chunk,
                      'description': f'{len(chunk)} high-probability questions chosen from the 2023–24 paper trends, all sections.'})

    # 2. Full-length model mocks 5-10, disjoint, following the blueprint.
    for mock_no in range(5, 11):
        qs, short = [], False
        for key, n in MOCK_BLUEPRINT.items():
            got = take(pools[key], n, mock_ids, avoid=(expected_ids,))
            short |= len(got) < n
            qs.extend(got)
        if len(qs) < 150:
            print(f'!! mock {mock_no}: only {len(qs)} questions left, stopping')
            for q in qs:
                mock_ids.discard(id(q))
            break
        qs.sort(key=lambda q: SECTION_ORDER.index(q['category']))
        tests.append({'title': f'Full Mock Test {mock_no}', 'subject': 'Computer Science', 'mode': 'full_mock',
                      'category': 'Full Mock Tests', 'duration_min': 120, 'negative_marking': 0.25, 'questions': qs,
                      'description': f'{len(qs)} new questions in the real exam blueprint (Section A 100 + Section B 100, 120 min, −0.25).'
                                     + (' Some chapters are short of questions.' if short else '')})

    # 3. Chapter-wise tests (25 Q), never from a mock.
    for key, (section, chapter) in CHAPTERS.items():
        used = set(mock_ids)
        qs = take(pools[key], 25, used, avoid=(chapter_ids, expected_ids))
        chapter_ids.update(id(q) for q in qs)
        if len(qs) >= 10:
            tests.append({'title': f'Chapter Test — {chapter}', 'subject': section, 'chapter': chapter, 'mode': 'chapter',
                          'category': 'Chapter-wise Tests', 'duration_min': 25, 'negative_marking': 0.25, 'questions': qs,
                          'description': f'{len(qs)} questions on {chapter} ({section}).'})

    # 4. Section-wise tests (2 per section), never from a mock; prefer unseen.
    by_section = collections.defaultdict(list)
    for key, (section, _) in CHAPTERS.items():
        by_section[section].extend(pools[key])
    for section in SECTION_ORDER:
        pool = by_section[section][:]
        random.shuffle(pool)
        size = 50 if section == 'Computer Science' else 20
        section_ids = set()
        for n in (1, 2):
            used = set(mock_ids) | section_ids
            qs = take(pool, size, used, avoid=(chapter_ids, expected_ids))
            section_ids.update(id(q) for q in qs)
            if len(qs) >= 10:
                tests.append({'title': f'Section Test — {section} {n}', 'subject': section, 'mode': 'subject',
                              'category': 'Section-wise Tests', 'duration_min': int(size * 0.75) + 5, 'negative_marking': 0.25,
                              'questions': qs, 'description': f'{len(qs)} questions, {section} only, exam pattern.'})
    return tests


def write_trends(pyq_tests):
    """PYQ trend analysis -> notes/pyq_trends.md (becomes a downloadable material)."""
    rows = collections.Counter()
    sub = collections.defaultdict(collections.Counter)
    diff = collections.Counter()
    doubts = []
    total = 0
    for t in pyq_tests:
        for q in t['questions']:
            total += 1
            ck = q.get('chapter_key') or '?'
            rows[ck] += 1
            if q.get('subtopic'):
                sub[ck][q['subtopic']] += 1
            diff[q['difficulty']] += 1
            if q.get('key_doubt'):
                doubts.append((t['title'], q['source'].get('number'), q['question_en'][:90].replace('\n', ' ')))
    tagged = total - rows.get('?', 0)
    if tagged < total * 0.5:
        print(f'!! only {tagged}/{total} PYQs tagged; trend note skipped')
        return False
    papers = len(pyq_tests)
    lines = ['# DSSSB TGT Computer Science — Previous Year Trend Analysis', '',
             f'Based on {papers} official papers (2023–2024): {total} text questions with the official answer key.', '',
             '## Questions per chapter', '',
             '| Chapter | Section | Questions | Per paper | Most asked topics |', '|---|---|---|---|---|']
    for ck, n in sorted(rows.items(), key=lambda kv: -kv[1]):
        if ck == '?':
            continue
        section, chapter = CHAPTERS.get(ck, ('—', ck))
        top = ', '.join(f'{k} ({v})' for k, v in sub[ck].most_common(4))
        lines.append(f'| {chapter} | {section} | {n} | {n / papers:.1f} | {top} |')
    cs = [(ck, n) for ck, n in rows.items() if ck.startswith('cs_')]
    cs_total = sum(n for _, n in cs) or 1
    lines += ['', '## Computer Science weightage', '', '| Chapter | Share of CS questions |', '|---|---|']
    for ck, n in sorted(cs, key=lambda kv: -kv[1]):
        lines.append(f'| {CHAPTERS[ck][1]} | {100 * n / cs_total:.0f}% |')
    lines += ['', '## Difficulty mix', '', '| Level | Questions |', '|---|---|']
    for lvl in ('easy', 'medium', 'hard'):
        lines.append(f'| {lvl.title()} | {diff[lvl]} |')
    lines += ['', '## How to use this', '',
              '- Section A (General Awareness, Reasoning, Numerical, Hindi, English) is the scoring half: aim for 80+ of 100.',
              '- In Computer Science, start with the chapters at the top of the weightage table; they appear in every paper.',
              '- Take the chapter tests for your three weakest chapters first, then one full mock every 3–4 days.',
              '- A wrong answer costs 0.25 marks: answer only when you can rule out at least two options.']
    if doubts:
        lines += ['', '## Official answers our solvers questioned', '',
                  'The tests keep the official answer. The solution text explains the doubt.', '']
        lines += [f'- {t}, Q{n}: {q}…' for t, n, q in doubts]
    open(os.path.join(DATA, 'notes', 'pyq_trends.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print(f'trend note written ({tagged}/{total} PYQs tagged, {len(doubts)} key doubts)')
    return True


def md_to_pdf(md_path, out_base, title):
    import markdown
    body = markdown.markdown(open(md_path, encoding='utf-8').read(), extensions=['tables', 'fenced_code', 'toc'])
    html = f"""<!doctype html><html><head><meta charset='utf-8'><title>{title}</title><style>
body{{font-family:'Segoe UI','Noto Sans Devanagari','Mangal',sans-serif;max-width:820px;margin:28px auto;line-height:1.55;color:#111;padding:0 16px}}
h1{{border-bottom:2px solid #4f46e5;padding-bottom:6px}} h2{{color:#4f46e5;margin-top:28px}} table{{border-collapse:collapse;margin:10px 0;font-size:14px}}
td,th{{border:1px solid #bbb;padding:4px 8px;vertical-align:top}} th{{background:#eef}} pre{{background:#f4f4f8;padding:10px;overflow-x:auto;font-size:13px}} code{{background:#f4f4f8;padding:1px 4px}}
.footer{{margin-top:40px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}}
</style></head><body>{body}<div class='footer'>OSDHYAN · DSSSB TGT Computer Science 2026 · revision notes</div></body></html>"""
    open(out_base + '.html', 'w', encoding='utf-8').write(html)
    pdf = out_base + '.pdf'
    if os.path.exists(CHROME):
        url = 'file:///' + out_base.replace('\\', '/') + '.html'
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', f'--print-to-pdf={pdf}', url],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    return os.path.exists(pdf)


def build_materials():
    os.makedirs(MATERIAL_DIR, exist_ok=True)
    materials = []
    items = list(CHAPTERS.items()) + [('pyq_trends', ('Computer Science', 'PYQ Trend Analysis'))]
    for key, (section, chapter) in items:
        md = os.path.join(DATA, 'notes', f'{key}.md')
        if not os.path.exists(md):
            print(f'!! missing notes {key}')
            continue
        base = os.path.join(MATERIAL_DIR, key)
        ok = md_to_pdf(md, base, f'{chapter} — revision notes')
        rel = f'materials/dsssb/{key}.pdf' if ok else f'materials/dsssb/{key}.html'
        is_trend = key == 'pyq_trends'
        materials.append({'title': 'DSSSB TGT CS — Previous Year Trend Analysis' if is_trend else f'DSSSB TGT CS — {chapter} (Revision Notes)',
                          'subject': section, 'chapter': None if is_trend else chapter,
                          'description': 'Which chapters and topics were asked most in the 2023–24 official papers, and how to plan.' if is_trend
                          else f'Concise revision notes for {chapter}: key concepts, tables, frequently asked facts, traps.',
                          'file_path': rel, 'type': 'pdf' if ok else 'doc'})
        print(f'notes {key}: {"pdf" if ok else "html only"}')
    return materials


def main():
    pyq_tests = load_pyq(load_solutions())
    write_trends(pyq_tests)
    pools = load_pools()
    gen_tests = build_generated(pools, pyq_tests)
    materials = build_materials()

    # Series order: PYQ, mocks, most expected, section, chapter
    order = {'Previous Year Papers': 0, 'Full Mock Tests': 1, 'Most Expected': 2, 'Section-wise Tests': 3, 'Chapter-wise Tests': 4}
    def mock_no(t):
        m = re.search(r'Full Mock Test (\d+)', t['title'])
        return int(m.group(1)) if m else 0
    tests = sorted(pyq_tests + gen_tests, key=lambda t: (order.get(t['category'], 9), mock_no(t), t['title']))

    spec = {'exams': [{
        **EXAM,
        'materials': materials,
        'series': [{
            'name_en': 'DSSSB TGT Computer Science 2026 — Complete Test Series',
            'name_hi': 'DSSSB TGT कंप्यूटर विज्ञान 2026 — सम्पूर्ण टेस्ट सीरीज़',
            'description_en': 'Real exam pattern (200 Q, 120 min, −0.25): 4 official previous-year papers with the official key and solutions, 10 full-length mocks (1–4 are the official papers), most-expected sets, section-wise and chapter-wise tests for every syllabus chapter, with solutions. Revision notes for each chapter are in Materials.',
            'mode': 'mock', 'negative_marking': 0.25,
            'tests': tests,
        }],
    }]}
    out = os.path.join(DATA, 'question_sets_dsssb_tgt_cs.json')
    json.dump(spec, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    total = sum(len(t['questions']) for t in tests)
    print(f'\nwrote {out}: {len(tests)} tests, {total} questions, {len(materials)} materials')
    for cat in order:
        ts = [t for t in tests if t['category'] == cat]
        print(f'  {cat:22} {len(ts):3} tests  {sum(len(t["questions"]) for t in ts):5} questions')


if __name__ == '__main__':
    main()
