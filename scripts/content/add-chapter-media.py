#!/usr/bin/env python3
"""Add visual revision files (video overview, infographic) to a course chapter.

Finds the chapter by name in the DSSSB TGT Computer Science exam, creates the
topic "Video & infographic" in it if needed, and uploads each file with its
title. Re-running replaces files with the same title.

usage (root admin; the password is read from the environment, never stored):
  set OSDHYAN_ADMIN_EMAIL=admin@osdhyan.online
  set OSDHYAN_ADMIN_PASSWORD=...
  python -I scripts/content/add-chapter-media.py "Computer Fundamentals & Digital Logic" \
      "Video: Computer Fundamentals explained=C:/path/video.mp4" \
      "Infographic: Computer Fundamentals fast revision=C:/path/info.png" \
      --api https://8-234-95-50.sslip.io/api
"""
import argparse
import importlib.util
import os
import sys

TOPIC = 'Video & infographic'
HERE = os.path.dirname(os.path.abspath(__file__))

# Reuse the Api client (multipart upload, retries) from the course publisher.
_spec = importlib.util.spec_from_file_location('publish', os.path.join(HERE, 'publish-subject-course.py'))
_publish = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_publish)
Api = _publish.Api


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('chapter', help='chapter name, e.g. "Computer Fundamentals & Digital Logic"')
    ap.add_argument('items', nargs='+', help='"Title=path/to/file", optionally followed by "::description"')
    ap.add_argument('--subject', help='subject name; needed when several subjects share the chapter name')
    ap.add_argument('--api', default='http://127.0.0.1:3000/api')
    args = ap.parse_args()
    email = os.environ.get('OSDHYAN_ADMIN_EMAIL', 'admin@local.test')
    password = os.environ.get('OSDHYAN_ADMIN_PASSWORD')
    if not password:
        sys.exit('Set OSDHYAN_ADMIN_PASSWORD (root admin password) first.')
    items = []
    for raw in args.items:
        title, _, rest = raw.partition('=')
        path, _, description = rest.partition('::')
        if not path or not os.path.isfile(path):
            sys.exit(f'not a file: {raw}')
        items.append((title.strip(), path, description.strip()))

    api = Api(args.api)
    login = api.call('POST', '/auth/admin/login', {'login': email, 'password': password})
    api.token = login.get('access_token') or login.get('token')

    exam = next(e for e in api.call('GET', '/exams') if e.get('slug') == 'dsssb-tgt-cs')
    subjects = api.call('GET', '/admin/subjects')
    subjects = subjects.get('data', subjects) if isinstance(subjects, dict) else subjects
    chapter = None
    for s in (s for s in subjects if s['exam_id'] == exam['id'] and (not args.subject or s['name_en'] == args.subject)):
        for c in api.call('GET', f"/admin/subjects/{s['id']}/hierarchy")['data']:
            if c['name_en'] == args.chapter and c.get('is_published', True):
                chapter = c
                break
        if chapter:
            break
    if not chapter:
        sys.exit(f'chapter not found: {args.chapter}')

    topic = next((t for t in chapter.get('topics', []) if t['name_en'] == TOPIC), None)
    if not topic:
        topic = api.call('POST', '/admin/topics', {'chapter_id': chapter['id'], 'name_en': TOPIC})['data']
        topic['materials'] = []
        print('created topic', topic['id'])
    for title, path, description in items:
        for old in [m for m in topic.get('materials', []) if m.get('title') == title]:
            api.call('DELETE', f"/admin/materials/{old['id']}")
        body = {'topic_id': topic['id'], 'title': title, 'is_published': 1}
        if description:
            body['description'] = description
        res = api.call('POST', '/admin/materials/upload', body, files={'file': path})
        m = res.get('data', res)
        print('uploaded', title, '->', m.get('type'), m.get('file_path'))


if __name__ == '__main__':
    main()
