#!/usr/bin/env python3
"""Build a DSSSB TGT CS "subject pack" (notes + PYQs + most expected questions).

Each pack lives in backend/database/data/dsssb/<pack>/ with a pack.json:
  {"name": "DBMS", "chapters": [[key, title, short], ...], "pyq_file": "...json",
   "pyq_rules": [[keyword, chapter_key], ...], "question_files": [...],
   "series_name": "...", "series_name_hi": "...", "course_subject": "...",
   "course_subject_hi": "...", "tagline": "...", "intro": "...", "practice_split": 35}
and inputs notes/<chapter>.md and the question JSON files (GENERATION_SPEC format;
code inside a question may be fenced with ```).

Outputs backend/storage/app/public/materials/dsssb/<pack>/*.pdf, and in the pack
folder question_sets.json (for osdhyan:import-question-sets) and course_manifest.json
(for publish-subject-course.py).

usage: python -I scripts/content/build-subject-pack.py <pack>      e.g. dbms, prog
"""
import collections
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'backend', 'database', 'data', 'dsssb')
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
SUBJECT = 'Computer Science'          # subject the questions belong to in the DSSSB exam
PAPER_NAMES = {'2023_06_24_s3': '24 Jun 2023 (S3)', '2023_06_25_s1': '25 Jun 2023 (S1)',
               '2023_06_25_s2': '25 Jun 2023 (S2)', '2024_02_07_s2': '7 Feb 2024 (S2)'}

CSS = """
body{font-family:'Segoe UI','Noto Sans Devanagari',Arial,sans-serif;max-width:860px;margin:26px auto;line-height:1.55;color:#111;padding:0 18px;font-size:14.5px}
h1{border-bottom:3px solid #4f46e5;padding-bottom:6px;margin-top:34px;page-break-before:always} h1:first-of-type{page-break-before:avoid}
h2{color:#4338ca;margin-top:26px;border-bottom:1px solid #e5e7eb;padding-bottom:3px} h3{color:#1e3a8a;margin-top:18px}
table{border-collapse:collapse;margin:10px 0;font-size:13px;width:100%} td,th{border:1px solid #bbb;padding:4px 7px;vertical-align:top} th{background:#eef2ff}
pre{background:#f4f4f8;padding:10px;overflow-x:auto;font-size:12.5px;border-radius:6px;white-space:pre-wrap;font-family:Consolas,'Courier New',monospace}
code{background:#f4f4f8;padding:1px 4px;border-radius:3px;font-size:12.5px;font-family:Consolas,'Courier New',monospace}
blockquote{border-left:4px solid #f59e0b;background:#fffbeb;margin:10px 0;padding:6px 12px}
.cover{text-align:center;padding:60px 0 30px} .cover h1{border:0;font-size:30px;page-break-before:avoid} .cover p{font-size:15px;color:#374151}
.q{margin:12px 0;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;page-break-inside:avoid}
.q .stem{font-weight:600;white-space:pre-wrap} .q pre{font-weight:400;margin:6px 0} .q ol{margin:6px 0 6px 22px;padding:0} .q li{white-space:pre-wrap}
.ans{color:#065f46;font-weight:600;margin-top:4px;white-space:pre-wrap} .why{color:#374151;font-size:13px;white-space:pre-wrap}
.tag{display:inline-block;font-size:11px;padding:1px 6px;border-radius:9px;background:#eef2ff;color:#3730a3;margin-left:6px;font-weight:600}
.footer{margin-top:40px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}
"""


def md_html(md_text):
    import markdown
    body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc', 'sane_lists'])
    return body.replace('⭐ Asked in DSSSB', '<span class="tag">⭐ Asked in DSSSB</span>')


def text_html(text):
    """Escape text; ``` fences become <pre> blocks."""
    parts = re.split(r'```[a-zA-Z+#]*\n?', text or '')
    out = []
    for i, p in enumerate(parts):
        if i % 2 == 1:
            out.append('<pre>' + html.escape(p.rstrip('\n')) + '</pre>')
        else:
            out.append(re.sub(r'`([^`\n]+)`', r'<code>\1</code>', html.escape(p)))
    return ''.join(out)


def write_pdf(base, title, body_html, footer):
    os.makedirs(os.path.dirname(base), exist_ok=True)
    page = (f"<!doctype html><html><head><meta charset='utf-8'><title>{html.escape(title)}</title><style>{CSS}</style></head>"
            f"<body>{body_html}<div class='footer'>{html.escape(footer)}</div></body></html>")
    open(base + '.html', 'w', encoding='utf-8').write(page)
    pdf = base + '.pdf'
    if os.path.exists(pdf):
        os.remove(pdf)
    url = 'file:///' + (base + '.html').replace('\\', '/')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', f'--print-to-pdf={pdf}', url],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=240)
    if not os.path.exists(pdf):
        raise SystemExit(f'PDF not produced: {pdf}')
    return pdf


def q_block(no, stem, options, answer_idx, why, extra=''):
    letters = 'ABCD'
    opts = ''.join(f'<li>{text_html(o)}</li>' for o in options)
    return (f"<div class='q'><div class='stem'>Q{no}. {text_html(stem)}{extra}</div>"
            f"<ol type='A'>{opts}</ol><div class='ans'>Answer: ({letters[answer_idx]}) {text_html(options[answer_idx])}</div>"
            f"<div class='why'>{text_html(why or '')}</div></div>")


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    pack = sys.argv[1]
    pdir = os.path.join(DATA, pack)
    cfg = json.load(open(os.path.join(pdir, 'pack.json'), encoding='utf-8'))
    chapters = [tuple(c) for c in cfg['chapters']]
    title_of = {k: t for k, t, _ in chapters}
    order = [k for k, _, _ in chapters]
    name = cfg['name']
    out_dir = os.path.join(ROOT, 'backend', 'storage', 'app', 'public', 'materials', 'dsssb', pack)
    footer = f'OSDHYAN · DSSSB TGT Computer Science · {name} complete pack'
    chapter_prefix = f'{name} — '

    # PYQs
    pyq = json.load(open(os.path.join(DATA, cfg['pyq_file']), encoding='utf-8'))
    for p in pyq:
        sub = (p.get('subtopic') or '').lower()
        p['chapter_key'] = next((ch for kw, ch in cfg['pyq_rules'] if kw in sub), order[0])

    # Expected questions
    qs, seen = [], set()
    for fn in cfg['question_files']:
        path = os.path.join(pdir, fn)
        if not os.path.exists(path):
            print(f'!! missing {fn}')
            continue
        for q in json.load(open(path, encoding='utf-8')):
            opts = q.get('options') or []
            stem = (q.get('question_en') or '').strip()
            if q.get('chapter_key') not in title_of or len(opts) != 4 or q.get('answer_index') not in (0, 1, 2, 3) or not stem:
                print('!! dropped malformed question:', stem[:60])
                continue
            fp = re.sub(r'\W+', ' ', (stem + '|' + '|'.join(o.get('en', '') for o in opts)).lower())
            if fp in seen:
                print('!! dropped duplicate:', stem[:60])
                continue
            seen.add(fp)
            qs.append(q)
    qs.sort(key=lambda q: order.index(q['chapter_key']))
    for i, q in enumerate(qs, 1):
        q['no'] = i

    notes = {k: open(os.path.join(pdir, 'notes', f'{k}.md'), encoding='utf-8').read()
             for k in order if os.path.exists(os.path.join(pdir, 'notes', f'{k}.md'))}
    if len(notes) < len(order):
        print('!! missing notes:', [k for k in order if k not in notes])

    pyq_by = collections.Counter(p['chapter_key'] for p in pyq)
    q_by = collections.Counter(q['chapter_key'] for q in qs)
    rows = ''.join(f"<tr><td>{html.escape(t)}</td><td>{pyq_by.get(k, 0)}</td><td>{q_by.get(k, 0)}</td></tr>" for k, t, _ in chapters)
    analysis = (f"<h2>How DSSSB asks {html.escape(name)}</h2><p>{cfg['intro'].format(n=len(pyq))}</p>"
                f"<table><tr><th>Chapter</th><th>Asked in 2023–24 papers</th><th>Most expected questions in this pack</th></tr>{rows}</table>")

    manifest = {'subject': cfg['course_subject'], 'subject_hi': cfg.get('course_subject_hi'), 'chapters': []}
    for n, (k, t, _) in enumerate(chapters, 1):
        if k in notes:
            pdf = write_pdf(os.path.join(out_dir, k), f'{name} — {t}', md_html(notes[k]), footer)
            manifest['chapters'].append({'key': k, 'title': f'{n}. {t}', 'items': [{'title': f'{t} — revision notes', 'file': pdf}]})
            print('notes pdf', k)

    cover = (f"<div class='cover'><h1>{html.escape(name)} — Complete Notes</h1><p>DSSSB TGT Computer Science · every concept from basics to exam level</p>"
             f"<p>{html.escape(cfg['tagline'])}</p></div>")
    toc = '<h2>Contents</h2><ol>' + ''.join(f'<li>{html.escape(t)}</li>' for k, t, _ in chapters if k in notes) + \
          f'<li>Previous-year {html.escape(name)} questions with solutions</li></ol>'
    pyq_html = f'<h1>Previous-year {html.escape(name)} questions (2023–24) with solutions</h1>' + ''.join(
        q_block(i, p['question'] or '', p['options'] or ['', '', '', ''], (p['answer'] or 1) - 1, p.get('explanation'),
                f"<span class='tag'>{PAPER_NAMES.get(p['paper'], p['paper'])}</span>")
        for i, p in enumerate(pyq, 1))
    # Optional fast-revision sheet (notes/quick_revision.md): its own PDF and the
    # first section of the complete notes, so a student can revise in one sitting.
    quick_md = os.path.join(pdir, 'notes', 'quick_revision.md')
    quick_html = md_html(open(quick_md, encoding='utf-8').read()) if os.path.exists(quick_md) else ''
    quick_pdf = None
    if quick_html:
        quick_pdf = write_pdf(os.path.join(out_dir, f'{pack}_fast_revision'), f'{name} — Fast Revision Sheet', quick_html, footer)
        toc = toc.replace('<ol>', '<ol><li>Fast revision sheet</li>', 1)
        print('fast revision pdf')
    complete = write_pdf(os.path.join(out_dir, f'{pack}_complete_notes'), f'{name} — Complete Notes (DSSSB TGT CS)',
                         cover + analysis + toc + quick_html + ''.join(md_html(notes[k]) for k in order if k in notes) + pyq_html, footer)
    pyq_pdf = write_pdf(os.path.join(out_dir, f'{pack}_pyq_2023_24'), f'{name} — Previous-year questions 2023–24', analysis + pyq_html, footer)
    print('complete notes + pyq pdf')

    parts = [f"<div class='cover'><h1>{html.escape(name)} — {len(qs)} Most Expected Questions</h1><p>DSSSB TGT Computer Science · with answers and short reasons</p>"
             "<p>Cover the answer line, attempt, then check. Questions marked ⭐ test a concept already asked in DSSSB papers.</p></div>"]
    for k, t, _ in chapters:
        chunk = [q for q in qs if q['chapter_key'] == k]
        if chunk:
            parts.append(f'<h1>{html.escape(t)} ({len(chunk)} questions)</h1>')
            for q in chunk:
                star = "<span class='tag'>⭐ Asked in DSSSB</span>" if q.get('pyq_concept') else ''
                parts.append(q_block(q['no'], q['question_en'], [o['en'] for o in q['options']], q['answer_index'], q.get('explanation_en'), star))
    q_pdf = write_pdf(os.path.join(out_dir, f'{pack}_{len(qs)}_most_expected'), f'{name} — {len(qs)} Most Expected Questions', ''.join(parts), footer)
    print('expected questions pdf')

    manifest['chapters'].append({'key': f'{pack}_practice', 'title': f'{len(chapters) + 1}. Complete notes, previous-year questions & {len(qs)} most expected', 'items': [
        *([{'title': f'{name} — fast revision sheet (revise everything quickly)', 'file': quick_pdf}] if quick_pdf else []),
        {'title': f'{name} — complete notes (all chapters in one PDF)', 'file': complete},
        {'title': f'{name} — previous-year questions 2023–24 with solutions', 'file': pyq_pdf},
        {'title': f'{name} — {len(qs)} most expected questions with answers', 'file': q_pdf},
    ]})
    json.dump(manifest, open(os.path.join(pdir, 'course_manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # Online tests
    def spec(q, ck):
        return {'category': SUBJECT, 'chapter': chapter_prefix + title_of[ck], 'question_en': q['question_en'], 'question_hi': None,
                'options': [{'en': o['en'], 'hi': None} for o in q['options']], 'answer_index': q['answer_index'],
                'explanation_en': q.get('explanation_en'), 'explanation_hi': None,
                'difficulty': q.get('difficulty') if q.get('difficulty') in ('easy', 'medium', 'hard') else 'medium'}

    category = f'{name} Special'
    tests = [{'title': f'{name} — Previous Year Questions (DSSSB 2023–24)', 'subject': SUBJECT, 'mode': 'pyq', 'category': category,
              'duration_min': max(10, round(len(pyq) * 1.0)), 'negative_marking': 0.25,
              'questions': [{'category': SUBJECT, 'chapter': chapter_prefix + title_of[p['chapter_key']], 'question_en': p['question'],
                             'question_hi': None, 'options': [{'en': o, 'hi': None} for o in p['options']], 'answer_index': p['answer'] - 1,
                             'explanation_en': p.get('explanation'), 'explanation_hi': None, 'difficulty': p.get('difficulty') or 'medium'} for p in pyq],
              'description': f'All {len(pyq)} {name} questions from the 4 official DSSSB TGT CS papers, with the official answers and solutions.'}]
    split = int(cfg.get('practice_split', 35))
    for k, t, short in chapters:
        chunk = [spec(q, k) for q in qs if q['chapter_key'] == k]
        if not chunk:
            continue
        size = split if len(chunk) > split + 5 else len(chunk)
        groups = [chunk[i:i + size] for i in range(0, len(chunk), size)]
        for n, part in enumerate(groups, 1):
            suffix = f' (Part {n})' if len(groups) > 1 else ''
            tests.append({'title': f'{name} Practice — {short}{suffix}', 'subject': SUBJECT, 'chapter': chapter_prefix + t, 'mode': 'chapter',
                          'category': category, 'duration_min': max(10, round(len(part) * 1.0)), 'negative_marking': 0.25, 'questions': part,
                          'description': f'{len(part)} most expected questions on {t}, with solutions.'})
    full = [spec(q, q['chapter_key']) for q in qs]
    tests.append({'title': f'{name} — {len(full)} Most Expected Questions (Full Test)', 'subject': SUBJECT, 'mode': 'subject', 'category': category,
                  'duration_min': round(len(full) * float(cfg.get('full_test_min_per_q', 0.75))), 'negative_marking': 0.25, 'questions': full,
                  'description': f'Every most expected {name} question in one timed test (−0.25 per wrong answer).'})

    exam = {'name_en': 'DSSSB TGT Computer Science', 'name_hi': 'DSSSB TGT कंप्यूटर विज्ञान', 'slug': 'dsssb-tgt-cs', 'code': 'DSSSB_TGT_CS'}
    out_spec = {'exams': [{**exam, 'series': [
        {'name_en': cfg['series_name'], 'name_hi': cfg.get('series_name_hi'), 'description_en': cfg['series_description'],
         'mode': 'mock', 'negative_marking': 0.25, 'tests': tests},
        {'name_en': 'DSSSB TGT Computer Science 2026 — Complete Test Series', 'mode': 'mock', 'negative_marking': 0.25, 'tests': tests},
    ]}]}
    out = os.path.join(pdir, 'question_sets.json')
    json.dump(out_spec, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'\nwrote {out}: {len(tests)} tests; {len(qs)} expected + {len(pyq)} PYQ questions')
    print('questions per chapter:', dict(q_by))
    print('answer positions:', dict(sorted(collections.Counter(q['answer_index'] for q in qs).items())))


if __name__ == '__main__':
    main()
