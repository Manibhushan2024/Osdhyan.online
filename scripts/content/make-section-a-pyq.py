"""Build <pack>_pyq_analysis.json for the Section A packs from the official
papers (pyq_explanations/todo_*.json + done_*.json), in the same shape as
ga_pyq_analysis.json: [{qid, paper, question, options, answer (1-based),
subtopic, difficulty, explanation}]. The pack's pyq_rules map subtopic
keywords to chapter keys at build time.

usage: python -I scripts/content/make-section-a-pyq.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'backend', 'database', 'data', 'dsssb')
PX = os.path.join(DATA, 'pyq_explanations')

PACKS = {  # pack name → (todo file, done file, section-name substrings)
    'reasoning': ('todo_gen.json', 'done_gen.json', ['Reasoning']),
    'numerical': ('todo_gen.json', 'done_gen.json', ['Arithmetical', 'Numerical']),
    'english': ('todo_lang.json', 'done_lang.json', ['English']),
    'hindi': ('todo_lang.json', 'done_lang.json', ['Hindi']),
}


def load(name):
    d = json.load(open(os.path.join(PX, name), encoding='utf-8'))
    return d


def main():
    for pack, (todo_f, done_f, needles) in PACKS.items():
        todo = load(todo_f)
        done = load(done_f)
        done_by = done if isinstance(done, dict) else {d['qid']: d for d in done}
        items = todo if isinstance(todo, list) else list(todo.values())
        out = []
        for it in items:
            sec = str(it.get('section') or '')
            if not any(n.lower() in sec.lower() for n in needles):
                continue
            ex = done_by.get(it['qid'], {})
            sub = (ex.get('subtopic') or '').split('] ', 1)[-1]
            out.append({
                'qid': it['qid'], 'paper': it.get('paper'), 'question': it['question'],
                'question_hi': it.get('question_hi'), 'options': it['options'],
                'answer': it['answer'], 'subtopic': sub, 'difficulty': ex.get('difficulty') or 'medium',
                'explanation': ex.get('explanation_en') or ex.get('explanation') or '',
                'explanation_hi': ex.get('explanation_hi'),
            })
        path = os.path.join(DATA, f'{pack}_pyq_analysis.json')
        json.dump(out, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        missing = sum(1 for o in out if not o['explanation'])
        print(f'{pack}: {len(out)} PYQs ({missing} without explanation) → {os.path.basename(path)}')


if __name__ == '__main__':
    main()
