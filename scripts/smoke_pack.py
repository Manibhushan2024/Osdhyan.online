#!/usr/bin/env python3
"""Subject-pack check (DBMS, Programming, ...): the pack series and its tests exist,
the main DSSSB series lists them under "<Name> Special", a test can be taken with
answers and solutions shown after submit, and the course has its PDFs.

usage: python -I scripts/smoke_pack.py <Name> [--api http://127.0.0.1:3000/api]
  Production servers never show OTP codes, so there set OSDHYAN_CHECK_LOGIN and
  OSDHYAN_CHECK_PASSWORD (an existing account) and the check signs in with a password.
       e.g. python -I scripts/smoke_pack.py DBMS ; python -I scripts/smoke_pack.py Programming
"""
import argparse
import glob
import json
import os
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from smoke_test import call  # noqa: E402
import smoke_dsssb  # noqa: E402
from smoke_dsssb import check, take  # noqa: E402


def pack_expectations(name):
    """What the pack's files define: number of tests, course chapters and PDFs (pack found by its pack.json name)."""
    data = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'database', 'data', 'dsssb')
    for cfg_path in glob.glob(os.path.join(data, '*', 'pack.json')):
        cfg = json.load(open(cfg_path, encoding='utf-8'))
        if cfg.get('name') == name:
            folder = os.path.dirname(cfg_path)
            spec = json.load(open(os.path.join(folder, 'question_sets.json'), encoding='utf-8'))
            manifest = json.load(open(os.path.join(folder, 'course_manifest.json'), encoding='utf-8'))
            return {'tests': len(spec['exams'][0]['series'][0]['tests']), 'chapters': len(manifest['chapters']),
                    'pdfs': sum(len(c['items']) for c in manifest['chapters'])}
    raise SystemExit(f'No pack named {name}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('name', help='pack name as in pack.json, e.g. DBMS or Programming')
    ap.add_argument('--api', default='http://127.0.0.1:3000/api')
    args = ap.parse_args()
    api, name = args.api, args.name

    if os.environ.get('OSDHYAN_CHECK_LOGIN'):
        s, p, _ = call(api, 'POST', '/auth/login', body={'login': os.environ['OSDHYAN_CHECK_LOGIN'],
                                                        'password': os.environ.get('OSDHYAN_CHECK_PASSWORD', '')})
    else:
        email = f'pack.check.{int(time.time())}@example.test'
        s, p, _ = call(api, 'POST', '/auth/send-otp', body={'email': email, 'purpose': 'signup'})
        s, p, _ = call(api, 'POST', '/auth/verify-otp', body={'email': email, 'otp': (p or {}).get('dev_otp'), 'name': 'Pack Check'})
    token = (p or {}).get('access_token')
    check('signed in', bool(token))

    s, series, _ = call(api, 'GET', '/test-series', token)
    dbms = next((x for x in series if x['name_en'].startswith(f'DSSSB TGT CS — {name}')), None)
    main_series = next((x for x in series if x['name_en'].startswith('DSSSB TGT Computer Science 2026')), None)
    check(f'{name} series listed', dbms is not None)
    call(api, 'POST', f"/test-series/{dbms['id']}/enroll", token)
    s, d, _ = call(api, 'GET', f"/test-series/{dbms['id']}", token)
    tests = d['content'].get(f'{name} Special', [])
    names = {t['name_en']: t for t in tests}
    exp = pack_expectations(name)
    expected = exp['tests']
    check(f'{expected} {name} tests', len(tests) == expected, str(len(tests)))
    full = next(t for n, t in names.items() if 'Most Expected Questions (Full Test)' in n)
    pyq = next(t for n, t in names.items() if 'Previous Year Questions' in n)

    s, m, _ = call(api, 'GET', f"/test-series/{main_series['id']}", token)
    check(f'main DSSSB series has a {name} Special tab', len(m['content'].get(f'{name} Special', [])) == expected)

    take(api, token, pyq['id'])
    take(api, token, full['id'], answer_all=False)

    s, h, _ = call(api, 'GET', '/courses/subjects?category=dsssb', token)
    subj = next((x for x in (h.get('data', h) if isinstance(h, dict) else h) if x['name_en'].lower().startswith(name.lower())), None)
    check(f'{name} course in DSSSB category', subj is not None)
    s, hier, _ = call(api, 'GET', f"/courses/subjects/{subj['id']}/hierarchy", token)
    mats = [mt for c in hier['data'] for t in c['topics'] for mt in t['materials']]
    check(f"course has {exp['chapters']} chapters and {exp['pdfs']} PDFs", len(hier['data']) == exp['chapters'] and len(mats) == exp['pdfs'], f"{len(hier['data'])} / {len(mats)}")
    url = mats[0].get('url') or (api.rsplit('/api', 1)[0] + '/storage/' + mats[0]['file_path'])
    if url.startswith('/'):
        url = api.rsplit('/api', 1)[0] + url
    with urllib.request.urlopen(url, timeout=30) as r:
        check('notes PDF downloads', r.read(5) == b'%PDF-', url)

    print('\nALL PASS' if smoke_dsssb.ok_all else '\nSOME CHECKS FAILED')
    sys.exit(0 if smoke_dsssb.ok_all else 1)


if __name__ == '__main__':
    main()
