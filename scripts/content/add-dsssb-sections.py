"""Lay the real DSSSB CBT blocks over every full-length DSSSB TGT CS paper.

Section A: five subject blocks of 20 (General Intelligence & Reasoning, General
Awareness, Arithmetical & Numerical Ability, English, Hindi) in the paper's
order. Section B (Computer Science + Teaching Methodology, 100) is split into
five blocks of 20. Blocks are attempted one after another ("sequential"):
a block must be submitted before the next opens. No per-block timer unless
SECTION_MINUTES is set (overall paper time stays 120 min).

usage: python -I scripts/content/add-dsssb-sections.py [--minutes 12]
"""
import argparse
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SPEC = os.path.join(ROOT, 'backend', 'database', 'data', 'dsssb', 'question_sets_dsssb_tgt_cs.json')

SECTION_A = {
    'General Intelligence & Reasoning': ('rea', 'सामान्य बुद्धि एवं तर्कशक्ति'),
    'General Awareness': ('ga', 'सामान्य जागरूकता'),
    'Arithmetical & Numerical Ability': ('num', 'अंकगणितीय एवं संख्यात्मक योग्यता'),
    'English Language': ('eng', 'अंग्रेज़ी भाषा एवं बोध'),
    'Hindi Language': ('hin', 'हिंदी भाषा एवं बोध'),
}
SECTION_B = {'Computer Science', 'Teaching Methodology'}


def runs(questions):
    out = []
    for q in questions:
        c = q.get('category') or q.get('chapter')
        if out and out[-1][0] == c:
            out[-1][1] += 1
        else:
            out.append([c, 1])
    return out


def sections_for(test, minutes):
    qs = test['questions']
    r = runs(qs)
    cats = [c for c, _ in r]
    if not all(c in SECTION_A or c in SECTION_B for c in cats):
        return None
    a_runs = [(c, n) for c, n in r if c in SECTION_A]
    b_total = sum(n for c, n in r if c in SECTION_B)
    if len(a_runs) != 5 or b_total < 50 or any(c in SECTION_B for c, _ in r[:len(a_runs)]):
        return None

    # Notification order (Advt 03/2026): GA, Reasoning, Arithmetic, Hindi, English.
    # The questions themselves are re-ordered to match, so blocks stay contiguous.
    ORDER = ['General Awareness', 'General Intelligence & Reasoning', 'Arithmetical & Numerical Ability', 'Hindi Language', 'English Language']
    a_runs.sort(key=lambda cn: ORDER.index(cn[0]))
    grouped = {c: [q for q in qs if (q.get('category') or q.get('chapter')) == c] for c, _ in a_runs}
    b_qs = [q for q in qs if (q.get('category') or q.get('chapter')) in SECTION_B]
    qs[:] = [q for c, _ in a_runs for q in grouped[c]] + b_qs
    secs = []
    for c, n in a_runs:
        key, hi = SECTION_A[c]
        secs.append({'key': key, 'name_en': f'Section A · {c}', 'name_hi': f'खंड A · {hi}', 'count': n})
    # Section B → 5 near-equal blocks (20 each for a full 100).
    base, extra = divmod(b_total, 5)
    for i in range(5):
        n = base + (1 if i < extra else 0)
        label = 'Computer Science' if i < 4 else 'Computer Science & Teaching Methodology'
        secs.append({'key': f'cs{i + 1}', 'name_en': f'Section B · {label} (Block {i + 1})',
                     'name_hi': f'खंड B · {"कंप्यूटर विज्ञान" if i < 4 else "कंप्यूटर विज्ञान एवं शिक्षण विधि"} (खंड {i + 1})', 'count': n})
    if minutes:
        for s in secs:
            s['duration_min'] = minutes
    assert sum(s['count'] for s in secs) == len(qs)
    return secs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--minutes', type=int, default=0, help='per-block timer in minutes (0 = none, only the 120-min paper timer)')
    args = ap.parse_args()

    spec = json.load(open(SPEC, encoding='utf-8'))
    changed = 0
    for exam in spec['exams']:
        for series in exam['series']:
            for t in series['tests']:
                if t.get('mode') not in ('pyq', 'full_mock') or len(t.get('questions', [])) < 150:
                    continue
                secs = sections_for(t, args.minutes)
                if secs is None:
                    print('skip (unexpected layout):', t['title'])
                    continue
                t['sections'] = secs
                t['section_mode'] = 'sequential'
                t['evaluate_marked'] = False  # real DSSSB rule: answered + marked for review is not evaluated
                changed += 1
                print(f"{t['title'][:60]:60s} {len(secs)} blocks: {[s['count'] for s in secs]}")
    json.dump(spec, open(SPEC, 'w', encoding='utf-8'), ensure_ascii=False)
    print('tests with sections:', changed)


if __name__ == '__main__':
    main()
