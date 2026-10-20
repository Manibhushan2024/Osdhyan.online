#!/usr/bin/env python3
"""Build the DSSSB TGT CS "DBMS complete pack":

  inputs  backend/database/data/dsssb/dbms/notes/<chapter>.md        revision notes per chapter
          backend/database/data/dsssb/dbms/questions_theory.json     100 expected questions
          backend/database/data/dsssb/dbms/questions_practical.json  100 expected questions
          backend/database/data/dsssb/dbms_pyq_analysis.json         the 23 real DBMS questions (2023-24)
  outputs backend/storage/app/public/materials/dsssb/dbms/*.pdf (+ .html)
          backend/database/data/dsssb/dbms/question_sets_dbms.json   spec for osdhyan:import-question-sets
          backend/database/data/dsssb/dbms/course_manifest.json      what publish-dbms-course.py uploads

usage: python -I scripts/content/build-dbms-pack.py
"""
import collections
import html
import json
import os
import random
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'backend', 'database', 'data', 'dsssb')
DBMS = os.path.join(DATA, 'dbms')
OUT = os.path.join(ROOT, 'backend', 'storage', 'app', 'public', 'materials', 'dsssb', 'dbms')
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

CHAPTERS = [  # key, title, short
    ('db_intro', 'Introduction & Database Architecture', 'Introduction'),
    ('db_er', 'ER Model', 'ER Model'),
    ('db_relational', 'Relational Model, Keys & Relational Algebra', 'Relational Model & Keys'),
    ('db_normal', 'Functional Dependencies & Normalisation', 'Normalisation'),
    ('db_sql', 'SQL', 'SQL'),
    ('db_txn', 'Transactions & Concurrency Control', 'Transactions'),
    ('db_index', 'Indexing & File Organisation', 'Indexing'),
]
TITLE = dict((k, t) for k, t, _ in CHAPTERS)
SUBJECT = 'Computer Science'          # subject the questions belong to in the DSSSB exam
CHAPTER_PREFIX = 'DBMS — '            # question chapters: "DBMS — SQL", ...

CSS = """
body{font-family:'Segoe UI','Noto Sans Devanagari',Arial,sans-serif;max-width:860px;margin:26px auto;line-height:1.55;color:#111;padding:0 18px;font-size:14.5px}
h1{border-bottom:3px solid #4f46e5;padding-bottom:6px;margin-top:34px;page-break-before:always} h1:first-of-type{page-break-before:avoid}
h2{color:#4338ca;margin-top:26px;border-bottom:1px solid #e5e7eb;padding-bottom:3px} h3{color:#1e3a8a;margin-top:18px}
table{border-collapse:collapse;margin:10px 0;font-size:13px;width:100%} td,th{border:1px solid #bbb;padding:4px 7px;vertical-align:top} th{background:#eef2ff}
pre{background:#f4f4f8;padding:10px;overflow-x:auto;font-size:12.5px;border-radius:6px;white-space:pre-wrap} code{background:#f4f4f8;padding:1px 4px;border-radius:3px;font-size:12.5px}
blockquote{border-left:4px solid #f59e0b;background:#fffbeb;margin:10px 0;padding:6px 12px}
.cover{text-align:center;padding:60px 0 30px} .cover h1{border:0;font-size:30px;page-break-before:avoid} .cover p{font-size:15px;color:#374151}
.q{margin:12px 0;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;page-break-inside:avoid}
.q .stem{font-weight:600;white-space:pre-wrap} .q ol{margin:6px 0 6px 22px;padding:0} .ans{color:#065f46;font-weight:600;margin-top:4px} .why{color:#374151;font-size:13px}
.tag{display:inline-block;font-size:11px;padding:1px 6px;border-radius:9px;background:#eef2ff;color:#3730a3;margin-left:6px}
.footer{margin-top:40px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}
"""


def md_html(md_text):
    import markdown
    body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc', 'sane_lists'])
    return body.replace('⭐ Asked in DSSSB', '<span class="tag">⭐ Asked in DSSSB</span>')


def write_pdf(base, title, body_html):
    os.makedirs(os.path.dirname(base), exist_ok=True)
    page = (f"<!doctype html><html><head><meta charset='utf-8'><title>{html.escape(title)}</title><style>{CSS}</style></head>"
            f"<body>{body_html}<div class='footer'>OSDHYAN · DSSSB TGT Computer Science · DBMS complete pack</div></body></html>")
    open(base + '.html', 'w', encoding='utf-8').write(page)
    pdf = base + '.pdf'
    if os.path.exists(pdf):
        os.remove(pdf)
    url = 'file:///' + (base + '.html').replace('\\', '/')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', f'--print-to-pdf={pdf}', url],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    if not os.path.exists(pdf):
        raise SystemExit(f'PDF not produced: {pdf}')
    return pdf


# ── PYQs ────────────────────────────────────────────────────────────────────
PYQ_CHAPTER_RULES = [  # subtopic keyword -> chapter
    ('serializ', 'db_txn'), ('transaction', 'db_txn'),
    ('index', 'db_index'),
    ('closure', 'db_normal'), ('armstrong', 'db_normal'), ('normal form', 'db_normal'), ('functional', 'db_normal'),
    ('er model', 'db_er'), ('er to relational', 'db_er'), ('entity', 'db_er'),
    ('relational algebra', 'db_relational'), ('relational model', 'db_relational'), ('integrity', 'db_relational'), ('key', 'db_relational'),
    ('odbc', 'db_intro'), ('connectivity', 'db_intro'),
    ('sql', 'db_sql'),
]
PAPER_NAMES = {'2023_06_24_s3': '24 Jun 2023 (S3)', '2023_06_25_s1': '25 Jun 2023 (S1)',
               '2023_06_25_s2': '25 Jun 2023 (S2)', '2024_02_07_s2': '7 Feb 2024 (S2)'}


def pyq_chapter(sub):
    s = (sub or '').lower()
    for kw, ch in PYQ_CHAPTER_RULES:
        if kw in s:
            return ch
    return 'db_intro'


def load_pyq():
    items = json.load(open(os.path.join(DATA, 'dbms_pyq_analysis.json'), encoding='utf-8'))
    for it in items:
        it['chapter_key'] = pyq_chapter(it.get('subtopic'))
    return items


# ── Expected questions ──────────────────────────────────────────────────────
def load_questions():
    qs = []
    for name in ('questions_theory.json', 'questions_practical.json'):
        path = os.path.join(DBMS, name)
        if not os.path.exists(path):
            print(f'!! missing {name}')
            continue
        qs += json.load(open(path, encoding='utf-8'))
    clean, seen = [], set()
    for q in qs:
        opts = q.get('options') or []
        stem = (q.get('question_en') or '').strip()
        if q.get('chapter_key') not in TITLE or len(opts) != 4 or q.get('answer_index') not in (0, 1, 2, 3) or not stem:
            print('!! dropped malformed question:', stem[:60])
            continue
        fp = re.sub(r'\W+', ' ', (stem + '|' + '|'.join(o.get('en', '') for o in opts)).lower())
        if fp in seen:
            print('!! dropped duplicate:', stem[:60])
            continue
        seen.add(fp)
        clean.append(q)
    order = [k for k, _, _ in CHAPTERS]
    clean.sort(key=lambda q: order.index(q['chapter_key']))
    for i, q in enumerate(clean, 1):
        q['no'] = i
    return clean


def q_block(no, stem, options, answer_idx, why, extra=''):
    letters = 'ABCD'
    opts = ''.join(f'<li>{html.escape(o)}</li>' for o in options)
    return (f"<div class='q'><div class='stem'>Q{no}. {html.escape(stem)}{extra}</div>"
            f"<ol type='A'>{opts}</ol><div class='ans'>Answer: ({letters[answer_idx]}) {html.escape(options[answer_idx])}</div>"
            f"<div class='why'>{html.escape(why or '')}</div></div>")


def main():
    random.seed(2026)
    pyq = load_pyq()
    qs = load_questions()
    notes = {k: open(os.path.join(DBMS, 'notes', f'{k}.md'), encoding='utf-8').read()
             for k, _, _ in CHAPTERS if os.path.exists(os.path.join(DBMS, 'notes', f'{k}.md'))}
    missing = [k for k, _, _ in CHAPTERS if k not in notes]
    if missing:
        print('!! missing notes:', missing)

    pyq_by_ch = collections.Counter(p['chapter_key'] for p in pyq)
    q_by_ch = collections.Counter(q['chapter_key'] for q in qs)

    # 1. "How DSSSB asks DBMS" section (also used on the cover of the complete notes)
    rows = ''.join(f"<tr><td>{html.escape(t)}</td><td>{pyq_by_ch.get(k, 0)}</td><td>{q_by_ch.get(k, 0)}</td></tr>" for k, t, _ in CHAPTERS)
    analysis = (
        "<h2>How DSSSB asks DBMS</h2>"
        f"<p>In the 4 official DSSSB TGT Computer Science papers of 2023–24 there were <b>{len(pyq)} DBMS questions</b>, about 6 per paper. "
        "Most are one-line definitions in textbook wording (Korth, Navathe), SQL syntax and built-in function questions, and a few short numericals "
        "(attribute closure, conflict serializability). Learn the exact definitions, the SQL functions table and the three numerical methods in these notes.</p>"
        f"<table><tr><th>Chapter</th><th>Asked in 2023–24 papers</th><th>Most expected questions in this pack</th></tr>{rows}</table>"
    )

    os.makedirs(OUT, exist_ok=True)
    manifest = {'subject': 'DBMS (Database Management System)', 'chapters': []}

    # 2. Chapter PDFs
    for k, t, short in CHAPTERS:
        if k not in notes:
            continue
        pdf = write_pdf(os.path.join(OUT, f'{k}'), f'DBMS — {t}', md_html(notes[k]))
        manifest['chapters'].append({'key': k, 'title': f'{CHAPTERS.index((k, t, short)) + 1}. {t}', 'items': [
            {'title': f'{t} — revision notes', 'file': pdf},
        ]})
        print('notes pdf', k)

    # 3. Complete notes
    cover = ("<div class='cover'><h1>DBMS — Complete Notes</h1><p>DSSSB TGT Computer Science · every concept from basics to exam level</p>"
             "<p>ER model · keys · relational model & algebra · normalisation 1NF–BCNF · SQL · transactions · indexing</p></div>")
    toc = '<h2>Contents</h2><ol>' + ''.join(f'<li>{html.escape(t)}</li>' for k, t, _ in CHAPTERS if k in notes) + \
          '<li>Previous-year DBMS questions with solutions</li></ol>'
    pyq_html = '<h1>Previous-year DBMS questions (2023–24) with solutions</h1>' + ''.join(
        q_block(i, p['question'] or '', p['options'] or ['', '', '', ''], (p['answer'] or 1) - 1, p.get('explanation'),
                f"<span class='tag'>{PAPER_NAMES.get(p['paper'], p['paper'])}</span>")
        for i, p in enumerate(pyq, 1))
    full_body = cover + analysis + toc + ''.join(md_html(notes[k]) for k, _, _ in CHAPTERS if k in notes) + pyq_html
    complete_pdf = write_pdf(os.path.join(OUT, 'dbms_complete_notes'), 'DBMS — Complete Notes (DSSSB TGT CS)', full_body)
    pyq_pdf = write_pdf(os.path.join(OUT, 'dbms_pyq_2023_24'), 'DBMS — Previous-year questions 2023–24', analysis + pyq_html)
    print('complete notes pdf + pyq pdf')

    # 4. 200 most expected questions PDF (answers and reasons right under each question)
    parts = ["<div class='cover'><h1>DBMS — 200 Most Expected Questions</h1><p>DSSSB TGT Computer Science · with answers and short reasons</p>"
             "<p>Cover the answer line, attempt, then check. Questions marked ⭐ test a concept already asked in DSSSB papers.</p></div>"]
    for k, t, _ in CHAPTERS:
        chunk = [q for q in qs if q['chapter_key'] == k]
        if not chunk:
            continue
        parts.append(f'<h1>{html.escape(t)} ({len(chunk)} questions)</h1>')
        for q in chunk:
            star = "<span class='tag'>⭐ Asked in DSSSB</span>" if q.get('pyq_concept') else ''
            parts.append(q_block(q['no'], q['question_en'], [o['en'] for o in q['options']], q['answer_index'], q.get('explanation_en'), star))
    q_pdf = write_pdf(os.path.join(OUT, 'dbms_200_most_expected'), 'DBMS — 200 Most Expected Questions', ''.join(parts))
    print('200 questions pdf')

    manifest['chapters'].append({'key': 'db_practice', 'title': '8. Complete notes, previous-year questions & 200 most expected', 'items': [
        {'title': 'DBMS — complete notes (all chapters in one PDF)', 'file': complete_pdf},
        {'title': 'DBMS — previous-year questions 2023–24 with solutions', 'file': pyq_pdf},
        {'title': 'DBMS — 200 most expected questions with answers', 'file': q_pdf},
    ]})
    json.dump(manifest, open(os.path.join(DBMS, 'course_manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # 5. Online tests (question-set spec)
    def as_spec(q, chapter_key):
        return {'category': SUBJECT, 'chapter': CHAPTER_PREFIX + TITLE[chapter_key], 'question_en': q['question_en'], 'question_hi': None,
                'options': [{'en': o['en'], 'hi': None} for o in q['options']], 'answer_index': q['answer_index'],
                'explanation_en': q.get('explanation_en'), 'explanation_hi': None,
                'difficulty': q.get('difficulty') if q.get('difficulty') in ('easy', 'medium', 'hard') else 'medium'}

    tests = []
    pyq_spec = [{'category': SUBJECT, 'chapter': CHAPTER_PREFIX + TITLE[p['chapter_key']], 'question_en': p['question'],
                 'question_hi': None, 'options': [{'en': o, 'hi': None} for o in p['options']], 'answer_index': p['answer'] - 1,
                 'explanation_en': p.get('explanation'), 'explanation_hi': None, 'difficulty': p.get('difficulty') or 'medium'} for p in pyq]
    tests.append({'title': 'DBMS — Previous Year Questions (DSSSB 2023–24)', 'subject': SUBJECT, 'mode': 'pyq', 'category': 'DBMS Special',
                  'duration_min': 25, 'negative_marking': 0.25, 'questions': pyq_spec,
                  'description': f'All {len(pyq)} DBMS questions from the 4 official DSSSB TGT CS papers, with the official answers and solutions.'})
    for k, t, short in CHAPTERS:
        chunk = [as_spec(q, k) for q in qs if q['chapter_key'] == k]
        if not chunk:
            continue
        size = 35 if len(chunk) > 40 else len(chunk)
        parts_ = [chunk[i:i + size] for i in range(0, len(chunk), size)]
        for n, part in enumerate(parts_, 1):
            suffix = f' (Part {n})' if len(parts_) > 1 else ''
            tests.append({'title': f'DBMS Practice — {short}{suffix}', 'subject': SUBJECT, 'chapter': CHAPTER_PREFIX + t,
                          'mode': 'chapter', 'category': 'DBMS Special', 'duration_min': max(10, round(len(part) * 0.9)),
                          'negative_marking': 0.25, 'questions': part,
                          'description': f'{len(part)} most expected questions on {t}, with solutions.'})
    full = [as_spec(q, q['chapter_key']) for q in qs]
    tests.append({'title': f'DBMS — {len(full)} Most Expected Questions (Full Test)', 'subject': SUBJECT, 'mode': 'subject',
                  'category': 'DBMS Special', 'duration_min': round(len(full) * 0.75), 'negative_marking': 0.25, 'questions': full,
                  'description': 'Every most expected DBMS question in one timed test (45 seconds per question, −0.25).'})

    exam = {'name_en': 'DSSSB TGT Computer Science', 'name_hi': 'DSSSB TGT कंप्यूटर विज्ञान', 'slug': 'dsssb-tgt-cs', 'code': 'DSSSB_TGT_CS'}
    spec = {'exams': [{**exam, 'series': [
        {'name_en': 'DSSSB TGT CS — DBMS Complete (Notes + 200 Most Expected)', 'name_hi': 'DSSSB TGT CS — DBMS सम्पूर्ण',
         'description_en': 'DBMS from basics to exam level: previous-year questions, chapter-wise practice and the 200 most expected questions with solutions. Notes are in Courses → DSSSB TGT Computer Science → DBMS.',
         'mode': 'mock', 'negative_marking': 0.25, 'tests': tests},
        # Also list the same tests inside the main DSSSB series (category "DBMS Special")
        {'name_en': 'DSSSB TGT Computer Science 2026 — Complete Test Series', 'mode': 'mock', 'negative_marking': 0.25, 'tests': tests},
    ]}]}
    out = os.path.join(DBMS, 'question_sets_dbms.json')
    json.dump(spec, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'\nwrote {out}: {len(tests)} tests; {len(qs)} expected + {len(pyq)} PYQ questions')
    print('questions per chapter:', dict(q_by_ch))
    print('answer positions:', dict(collections.Counter(q['answer_index'] for q in qs)))


if __name__ == '__main__':
    main()
