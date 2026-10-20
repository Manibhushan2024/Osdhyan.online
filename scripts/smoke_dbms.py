#!/usr/bin/env python3
"""DBMS pack check: the DBMS series and its tests exist with the right sizes,
the main DSSSB series lists them under "DBMS Special", a test can be taken with
answers and solutions shown after submit, and the DBMS course has its PDFs.

usage: python -I scripts/smoke_dbms.py [--api http://127.0.0.1:3000/api]
"""
import argparse
import os
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from smoke_test import call  # noqa: E402
import smoke_dsssb  # noqa: E402
from smoke_dsssb import check, take  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--api', default='http://127.0.0.1:3000/api')
    api = ap.parse_args().api

    email = f'dbms.check.{int(time.time())}@example.test'
    s, p, _ = call(api, 'POST', '/auth/send-otp', body={'email': email, 'purpose': 'signup'})
    s, p, _ = call(api, 'POST', '/auth/verify-otp', body={'email': email, 'otp': (p or {}).get('dev_otp'), 'name': 'DBMS Check'})
    token = (p or {}).get('access_token')
    check('signed in', bool(token))

    s, series, _ = call(api, 'GET', '/test-series', token)
    dbms = next((x for x in series if x['name_en'].startswith('DSSSB TGT CS — DBMS')), None)
    main_series = next((x for x in series if x['name_en'].startswith('DSSSB TGT Computer Science 2026')), None)
    check('DBMS series listed', dbms is not None)
    call(api, 'POST', f"/test-series/{dbms['id']}/enroll", token)
    s, d, _ = call(api, 'GET', f"/test-series/{dbms['id']}", token)
    tests = d['content'].get('DBMS Special', [])
    names = {t['name_en']: t for t in tests}
    check('10 DBMS tests', len(tests) == 10, str(len(tests)))
    full = next(t for n, t in names.items() if 'Most Expected Questions (Full Test)' in n)
    pyq = next(t for n, t in names.items() if 'Previous Year Questions' in n)

    s, m, _ = call(api, 'GET', f"/test-series/{main_series['id']}", token)
    check('main DSSSB series has a DBMS Special tab', len(m['content'].get('DBMS Special', [])) == 10)

    take(api, token, pyq['id'])
    take(api, token, full['id'], answer_all=False)

    s, h, _ = call(api, 'GET', '/courses/subjects?category=dsssb', token)
    subj = next((x for x in (h.get('data', h) if isinstance(h, dict) else h) if 'DBMS' in x['name_en']), None)
    check('DBMS course in DSSSB category', subj is not None)
    s, hier, _ = call(api, 'GET', f"/courses/subjects/{subj['id']}/hierarchy", token)
    mats = [mt for c in hier['data'] for t in c['topics'] for mt in t['materials']]
    check('course has 8 chapters and 10 PDFs', len(hier['data']) == 8 and len(mats) == 10, f"{len(hier['data'])} / {len(mats)}")
    url = mats[0].get('url') or (api.rsplit('/api', 1)[0] + '/storage/' + mats[0]['file_path'])
    if url.startswith('/'):
        url = api.rsplit('/api', 1)[0] + url
    with urllib.request.urlopen(url, timeout=30) as r:
        check('notes PDF downloads', r.read(5) == b'%PDF-', url)

    print('\nALL PASS' if smoke_dsssb.ok_all else '\nSOME CHECKS FAILED')
    sys.exit(0 if smoke_dsssb.ok_all else 1)


if __name__ == '__main__':
    main()
