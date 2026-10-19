#!/usr/bin/env python3
"""Extract DSSSB official papers (NTA-style PDF printouts wrapped by Adda247)
into JSON: questions, options, section, Question IDs, and the correct option.

Answer detection: every option has a small radio icon image; the correct
option uses a different icon (xref) from the other three. Hindi papers of the
same shift share Question IDs, so they are merged as question_hi/option_hi.

usage: python extract-dsssb-pyq.py out.json "label=path.pdf" ["label=path.pdf" ...]
       (give the Hindi paper the same label with suffix _hi, e.g. 2024s2_hi)
"""
import collections
import json
import re
import sys

import fitz  # PyMuPDF

SECTION_MAP = {
    'general intelligence and reasoning ability': ('General Intelligence & Reasoning', 'A'),
    'general awareness': ('General Awareness', 'A'),
    'arithmetical and numerical ability': ('Arithmetical & Numerical Ability', 'A'),
    'test of english language and comprehension': ('English Language', 'A'),
    'test of hindi language and comprehension': ('Hindi Language', 'A'),
    'teaching methodology': ('Teaching Methodology', 'B'),
}


def norm_section(label: str):
    key = re.sub(r'\s+', ' ', label.replace(' ', '')).lower()  # 2024 PDFs have spaced letters
    key2 = re.sub(r'\s+', ' ', label).lower().strip()
    for k, v in SECTION_MAP.items():
        if k.replace(' ', '') == key or k == key2:
            return v
    if re.match(r'discipline\s*\d', key2) or re.match(r'discipline\d', key):
        return ('Computer Science', 'B')
    return (label.strip(), '?')


def page_items(page):
    """Return text lines with positions and small/large images with positions."""
    lines = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            s = ''.join(sp['text'] for sp in l['spans'])
            if s.strip():
                lines.append({'y': l['bbox'][1], 'x': l['bbox'][0], 'y2': l['bbox'][3], 'text': s})
    lines.sort(key=lambda r: (round(r['y']), r['x']))
    icons, figures = [], []
    for info in page.get_image_info(xrefs=True):
        x0, y0, x1, y1 = info['bbox']
        w, h = x1 - x0, y1 - y0
        if w < 30 and h < 20:
            icons.append({'y': y0, 'x': x0, 'xref': info['xref']})
        elif w > 60 or h > 30:
            figures.append({'y': y0, 'y2': y1, 'w': w, 'h': h})
    return lines, icons, figures


def parse_pdf(path):
    doc = fitz.open(path)
    questions = []
    section = ('Unknown', '?')
    for pno, page in enumerate(doc):
        text = page.get_text()
        m = re.search(r'Section\s*:\s*(.+)', text)
        if m:
            section = norm_section(m.group(1))
        lines, icons, figures = page_items(page)

        # Split lines into question chunks starting at "Q.<n>"
        starts = [i for i, l in enumerate(lines) if re.match(r'^Q\.\s*\d+', l['text'].strip())]
        for si, start in enumerate(starts):
            end = starts[si + 1] if si + 1 < len(starts) else len(lines)
            chunk = lines[start:end]
            qtext_lines, opts, qid, oids = [], {}, None, {}
            mode = 'q'
            for l in chunk:
                t = l['text'].strip()
                if l is chunk[0]:
                    t = re.sub(r'^Q\.\s*\d+\s*', '', t)
                mq = re.match(r'^Question ID\s*:\s*(\d+)', t)
                mo = re.match(r'^Option (\d) ID\s*:\s*(\d+)', t)
                if t == 'Ans':
                    mode = 'opts'
                    continue
                if mq:
                    qid = mq.group(1)
                    mode = 'ids'
                    continue
                if mo:
                    oids[int(mo.group(1))] = mo.group(2)
                    continue
                mopt = re.match(r'^([1-4])\.\s*(.*)$', t)
                # Options start at the first "1." line even if the "Ans" marker
                # sorted after it (same baseline); later "n." lines continue them.
                if mode in ('q', 'opts') and mopt and int(mopt.group(1)) == len(opts) + 1:
                    opts[int(mopt.group(1))] = {'text': mopt.group(2).strip(), 'y': l['y']}
                    mode = 'opts'
                    continue
                if mode == 'q':
                    qtext_lines.append(t)
                elif mode == 'opts' and opts:
                    last = max(opts)
                    opts[last]['text'] = (opts[last]['text'] + ' ' + t).strip()
            if len(opts) < 2:
                continue

            # Correct option = the one whose icon xref differs from the majority
            found = {}
            for n, o in opts.items():
                cands = sorted((ic for ic in icons if abs(ic['y'] - o['y']) < 14 and ic['x'] < 110), key=lambda ic: abs(ic['y'] - o['y']))
                if cands:
                    found[n] = cands[0]['xref']
            answer = None
            if len(found) >= 3:
                cnt = collections.Counter(found.values())
                if len(cnt) == 2:
                    minority = min(cnt, key=cnt.get)
                    if cnt[minority] == 1:
                        answer = next(n for n, x in found.items() if x == minority)

            qy0 = chunk[0]['y']
            qy1 = chunk[-1]['y2']
            has_figure = any(f['y'] >= qy0 - 2 and f['y'] <= qy1 for f in figures)
            empty_opts = sum(1 for o in opts.values() if not o['text'])

            questions.append({
                'qid': qid,
                'section': section[0],
                'part': section[1],
                'question': '\n'.join(qtext_lines).strip(),
                'options': [opts[n]['text'] if n in opts else '' for n in sorted(opts)],
                'option_ids': [oids.get(n) for n in sorted(opts)],
                'answer_index': (answer - 1) if answer else None,
                'has_figure': has_figure or empty_opts > 0 or not qtext_lines,
                'page': pno + 1,
            })
    return questions


def main():
    out = sys.argv[1]
    papers = {}
    for arg in sys.argv[2:]:
        label, path = arg.split('=', 1)
        papers[label] = parse_pdf(path)
        qs = papers[label]
        print(f'{label}: {len(qs)} questions, answers={sum(1 for q in qs if q["answer_index"] is not None)}, '
              f'figure/empty={sum(1 for q in qs if q["has_figure"])}, sections={collections.Counter(q["section"] for q in qs).most_common()}')

    # Merge Hindi papers into their English counterpart by Question ID
    merged = {}
    for label, qs in papers.items():
        if label.endswith('_hi'):
            continue
        hi = {q['qid']: q for q in papers.get(label + '_hi', [])}
        for q in qs:
            h = hi.get(q['qid'])
            q['question_hi'] = h['question'] if h else None
            q['options_hi'] = h['options'] if h and len(h['options']) == len(q['options']) else None
            if q['answer_index'] is None and h and h['answer_index'] is not None:
                q['answer_index'] = h['answer_index']
        merged[label] = qs
        if hi:
            print(f'{label}: merged Hindi for {sum(1 for q in qs if q["question_hi"])} questions')

    json.dump(merged, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote', out)


if __name__ == '__main__':
    main()
