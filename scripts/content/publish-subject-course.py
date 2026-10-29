#!/usr/bin/env python3
"""Publish a subject pack's notes as a course in the app, through the admin API.

Creates (or reuses) the subject named in backend/database/data/dsssb/<pack>/
course_manifest.json (built by build-subject-pack.py) in the DSSSB TGT Computer
Science exam with category DSSSB, one chapter per manifest chapter, a topic in
each, and uploads the PDFs. Re-running replaces files with the same title.

usage (root admin; the password is read from the environment, never stored):
  set OSDHYAN_ADMIN_EMAIL=admin@local.test
  set OSDHYAN_ADMIN_PASSWORD=...
  python -I scripts/content/publish-subject-course.py <pack> [--api http://127.0.0.1:3000/api]
"""
import argparse
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
import uuid

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'backend', 'database', 'data', 'dsssb')
TOPIC = 'Revision notes & practice'


def _urlopen_retry(req, tries=4):
    """Connection-level failures (TLS EOF, reset) never reached the server: retry them."""
    import time
    for attempt in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=300)
        except urllib.error.URLError as e:
            if isinstance(e, urllib.error.HTTPError) or attempt == tries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))


class Api:
    def __init__(self, base):
        self.base = base.rstrip('/')
        self.token = None

    def call(self, method, path, body=None, files=None):
        headers = {'Accept': 'application/json'}
        if self.token:
            headers['Authorization'] = 'Bearer ' + self.token
        data = None
        if files:
            boundary = uuid.uuid4().hex
            parts = []
            for k, v in (body or {}).items():
                parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
            for k, path_ in files.items():
                name = os.path.basename(path_)
                ctype = mimetypes.guess_type(name)[0] or 'application/octet-stream'
                parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"; filename="{name}"\r\nContent-Type: {ctype}\r\n\r\n'.encode()
                             + open(path_, 'rb').read() + b'\r\n')
            parts.append(f'--{boundary}--\r\n'.encode())
            data = b''.join(parts)
            headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'
        elif body is not None:
            data = json.dumps(body).encode()
            headers['Content-Type'] = 'application/json'
        req = urllib.request.Request(self.base + path, data=data, method=method, headers=headers)
        try:
            with _urlopen_retry(req) as r:
                raw = r.read()
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            raise SystemExit(f'{method} {path} -> {e.code}: {e.read()[:400]!r}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pack', help='pack folder name, e.g. dbms or prog')
    ap.add_argument('--api', default='http://127.0.0.1:3000/api')
    args = ap.parse_args()
    email = os.environ.get('OSDHYAN_ADMIN_EMAIL', 'admin@local.test')
    password = os.environ.get('OSDHYAN_ADMIN_PASSWORD')
    if not password:
        sys.exit('Set OSDHYAN_ADMIN_PASSWORD (root admin password) first.')
    manifest = json.load(open(os.path.join(DATA, args.pack, 'course_manifest.json'), encoding='utf-8'))

    api = Api(args.api)
    login = api.call('POST', '/auth/admin/login', {'login': email, 'password': password})
    api.token = login.get('access_token') or login.get('token')

    exam = next(e for e in api.call('GET', '/exams') if e.get('slug') == 'dsssb-tgt-cs')
    subjects = api.call('GET', '/admin/subjects')
    subjects = subjects.get('data', subjects) if isinstance(subjects, dict) else subjects
    subject = next((s for s in subjects if s['exam_id'] == exam['id'] and s['name_en'] == manifest['subject']), None)
    if not subject:
        subject = api.call('POST', '/admin/subjects', {'exam_id': exam['id'], 'name_en': manifest['subject'],
                                                       'name_hi': manifest.get('subject_hi'),
                                                       'category': 'DSSSB', 'is_published': True})
        subject = subject.get('data', subject)
        print('created subject', subject['id'])
    api.call('PUT', f"/admin/subjects/{subject['id']}", {'is_published': True, 'category': 'DSSSB'})

    def hierarchy():
        return api.call('GET', f"/admin/subjects/{subject['id']}/hierarchy")['data']

    for ch in manifest['chapters']:
        chapters = hierarchy()
        chapter = next((c for c in chapters if c['name_en'] == ch['title']), None)
        if not chapter:
            chapter = api.call('POST', '/admin/chapters', {'subject_id': subject['id'], 'name_en': ch['title']})['data']
            chapter['topics'] = []
        topic = next((t for t in chapter.get('topics', []) if t['name_en'] == TOPIC), None)
        if not topic:
            topic = api.call('POST', '/admin/topics', {'chapter_id': chapter['id'], 'name_en': TOPIC})['data']
            topic['materials'] = []
        for item in ch['items']:
            for old in [m for m in topic.get('materials', []) if m.get('title') == item['title']]:
                api.call('DELETE', f"/admin/materials/{old['id']}")
            api.call('POST', '/admin/materials/upload', {'topic_id': topic['id'], 'title': item['title'], 'is_published': 1},
                     files={'file': item['file']})
            print('uploaded', item['title'])
    # A subject that already existed (created by the question importer) may carry
    # chapters that only group questions and hold no notes. Hide those so the
    # course does not show empty chapters; the questions keep their chapter.
    hidden = 0
    for c in hierarchy():
        if not c.get('topics') and c.get('is_published', True):
            api.call('PUT', f"/admin/chapters/{c['id']}", {'is_published': 0})
            hidden += 1
    if hidden:
        print(f'hid {hidden} empty chapter(s) that only group questions')
    print(f"\nDone: subject #{subject['id']} \"{manifest['subject']}\" with {len(manifest['chapters'])} chapters.")


if __name__ == '__main__':
    main()
