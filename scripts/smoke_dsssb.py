#!/usr/bin/env python3
"""DSSSB TGT CS series check: sign in by e-mail OTP (test mode), find the series,
enrol, take a chapter test and a full mock (answer everything), submit, and confirm
scores, sections and solutions come back. Also checks the study materials download.

usage: python scripts/smoke_dsssb.py [--api http://127.0.0.1:3000/api]
"""
import argparse
import os
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from smoke_test import call  # noqa: E402

ok_all = True


def check(label, cond, extra=''):
    global ok_all
    ok_all &= bool(cond)
    print(f"{'PASS' if cond else 'FAIL'}  {label} {extra}")


def take(api, token, test_id, answer_all=True):
    s, p, _ = call(api, 'GET', f'/tests/{test_id}', token)
    qs = (p or {}).get('questions', [])
    check(f'test {test_id} loads', s == 200 and qs, f'({len(qs)} questions)')
    check('  no answer key leaked', not any('is_correct' in o for q in qs for o in q.get('options', [])))
    s, p, _ = call(api, 'POST', f'/tests/{test_id}/attempts', token)
    attempt = (p or {}).get('id') or (p or {}).get('attempt', {}).get('id')
    check('  attempt started', s in (200, 201) and attempt)
    picked = [{'question_id': q['id'], 'selected_option_id': q['options'][0]['id']} for q in qs if q.get('options')]
    if not answer_all:
        picked = picked[:10]
    s, p, _ = call(api, 'POST', f'/attempts/{attempt}/complete', token, body={'responses': picked})
    check('  submitted', s == 200)
    s, p, _ = call(api, 'GET', f'/attempts/{attempt}', token)
    a = (p or {}).get('attempt', p) or {}
    tq = ((p or {}).get('test') or {}).get('questions') or []
    with_expl = sum(1 for q in tq if q.get('explanation_en'))
    with_key = sum(1 for q in tq if any(o.get('is_correct') for o in q.get('options', [])))
    check('  answer key shown after submit', with_key == len(tq) and tq, f'({with_key}/{len(tq)})')
    check('  result has score', a.get('score') is not None or a.get('total_score') is not None, f"score={a.get('score', a.get('total_score'))}")
    check('  solutions visible after submit', with_expl == len(tq) and tq, f'({with_expl}/{len(tq)} with explanation)')
    return attempt


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--api', default='http://127.0.0.1:3000/api')
    api = ap.parse_args().api

    email = f'dsssb.check.{int(time.time())}@example.test'
    s, p, _ = call(api, 'POST', '/auth/send-otp', body={'email': email, 'purpose': 'signup'})
    otp = (p or {}).get('dev_otp')
    check('OTP sent (test mode)', s == 200 and otp)
    s, p, _ = call(api, 'POST', '/auth/verify-otp', body={'email': email, 'otp': otp, 'name': 'DSSSB Check'})
    token = (p or {}).get('access_token') or (p or {}).get('token')
    check('signed in with OTP', s == 200 and token)
    if not token:
        sys.exit(1)

    s, p, _ = call(api, 'GET', '/test-series', token)
    series = next((x for x in (p or []) if 'DSSSB' in (x.get('name_en') or '')), None)
    check('DSSSB series listed', series is not None)
    sid = series['id']
    s, p, _ = call(api, 'POST', f'/test-series/{sid}/enroll', token)
    check('enrolled', s in (200, 201), f'({s})')
    s, p, _ = call(api, 'GET', f'/test-series/{sid}', token)
    content = (p or {}).get('content', {})
    counts = {k: len(v) for k, v in content.items()}
    check('series groups', set(counts) >= {'Previous Year Papers', 'Full Mock Tests', 'Most Expected', 'Section-wise Tests', 'Chapter-wise Tests'}, str(counts))
    mocks = [t['name_en'] for t in content.get('Full Mock Tests', [])]
    check('10 full mocks', len(mocks) == 10)

    chapter = content['Chapter-wise Tests'][0]
    take(api, token, chapter['id'])
    mock = next(t for t in content['Full Mock Tests'] if t['name_en'].startswith('Full Mock Test 5'))
    take(api, token, mock['id'])
    pyq = content['Previous Year Papers'][0]
    take(api, token, pyq['id'], answer_all=False)

    s, p, _ = call(api, 'GET', '/study-materials?search=DSSSB', token)
    items = p.get('data', p) if isinstance(p, dict) else (p or [])
    dsssb = [m for m in items if 'DSSSB' in (m.get('title') or '')]
    check('DSSSB study materials listed', len(dsssb) >= 1, f'({len(dsssb)})')
    if dsssb:
        path = dsssb[0].get('file_path') or ''
        url = api.rsplit('/api', 1)[0] + '/storage/' + path.lstrip('/')
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                body = r.read(8)
            check('material downloads as PDF', body.startswith(b'%PDF'), url)
        except Exception as e:
            check('material downloads', False, f'{url} {e}')

    print('\nALL PASS' if ok_all else '\nSOME CHECKS FAILED')
    sys.exit(0 if ok_all else 1)


if __name__ == '__main__':
    main()
