#!/usr/bin/env python3
"""Smoke test for the revenue modules: live classes, payments, tuition + chat.

Runs after scripts/smoke_test.py. Creates throw-away users (student, teacher,
and uses the given admin) and walks each flow end to end. Requires
PAYMENTS_FAKE=true on the backend for the checkout step (or it reports the
503 "not configured" path as PASS).

Usage:
  python scripts/smoke_modules.py --api http://127.0.0.1:8000/api \
      --admin-login admin@local.test --admin-password <pw>
"""
import argparse
import json
import random
import sys
import time
import urllib.error
import urllib.request

results = []


def call(api, method, path, token=None, body=None):
    url = api.rstrip("/") + path
    headers = {"Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    start = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            status, text = r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        status, text = e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        status, text = 0, str(e)
    ms = int((time.perf_counter() - start) * 1000)
    try:
        payload = json.loads(text) if text else None
    except ValueError:
        payload = text
    return status, payload, ms


def step(name, status, payload, ms, ok=(200, 201)):
    good = status in ok
    results.append(good)
    detail = "" if good else " -> " + (json.dumps(payload, ensure_ascii=False)[:300] if not isinstance(payload, str) else payload[:300])
    print(f"[{'PASS' if good else 'FAIL'}] {status:>3} {ms:>6}ms  {name}{detail}")
    return good


def unwrap(p):
    if isinstance(p, dict) and "data" in p:
        return p["data"]
    return p


def make_user(api, role):
    n = random.randint(10_000_000, 99_999_999)
    email = f"{role}{n}@example.test"
    pw = "Smoke@12345"
    body = {"name": f"Smoke {role}", "email": email, "phone": f"96{n}", "password": pw, "password_confirmation": pw}
    if role == "teacher":
        body["role"] = "teacher"
    s, p, ms = call(api, "POST", "/auth/register", body=body)
    step(f"register {role}", s, p, ms)
    s, p, ms = call(api, "POST", "/auth/login", body={"login": email, "password": pw})
    step(f"login {role}", s, p, ms)
    return (p or {}).get("access_token") if isinstance(p, dict) else None, p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://127.0.0.1:8000/api")
    ap.add_argument("--admin-login", required=True)
    ap.add_argument("--admin-password", required=True)
    args = ap.parse_args()
    api = args.api

    s, p, ms = call(api, "POST", "/auth/admin/login", body={"login": args.admin_login, "password": args.admin_password})
    step("admin login", s, p, ms)
    admin = (p or {}).get("access_token")

    student, _ = make_user(api, "student")
    teacher, tlogin = make_user(api, "teacher")
    teacher_id = (tlogin or {}).get("user", {}).get("id") if isinstance(tlogin, dict) else None
    if not (student and teacher and admin):
        return finish()

    # ── Teacher onboarding (tuition) ─────────────────────────────────────────
    s, p, ms = call(api, "POST", "/teacher/register", teacher, body={
        "headline": "BPSC & SSC GS tutor", "bio": "8 years experience", "subjects": ["History", "Polity"],
        "exams": ["BPSC", "SSC"], "teaching_mode": "both", "city": "Patna", "areas": ["Boring Road"],
        "fee_per_hour": 500, "experience_years": 8, "qualifications": "MA History", "languages": ["Hindi", "English"],
    })
    step("teacher registers profile", s, p, ms)
    s, p, ms = call(api, "GET", "/teacher/profile", teacher)
    step("teacher reads own profile", s, p, ms)

    s, p, ms = call(api, "GET", "/tuition/teachers?city=Patna", student)
    step("student searches teachers", s, p, ms)
    listed = [t.get("user_id") or t.get("id") for t in (unwrap(p) or [])] if isinstance(unwrap(p), list) else []
    step("unverified teacher hidden from search", 200 if teacher_id not in listed else 500, listed, 0)

    s, p, ms = call(api, "GET", "/admin/teachers?status=pending", admin)
    step("admin lists pending teachers", s, p, ms)
    pending = unwrap(p) or []
    pid = None
    for t in pending if isinstance(pending, list) else []:
        if t.get("user_id") == teacher_id or t.get("id") == teacher_id or (t.get("user") or {}).get("id") == teacher_id:
            pid = t.get("id")
    s, p, ms = call(api, "POST", f"/admin/teachers/{pid or teacher_id}/verify", admin)
    step("admin verifies teacher", s, p, ms)

    s, p, ms = call(api, "GET", "/tuition/teachers?city=Patna", student)
    body = unwrap(p) or []
    leaked = any(k in json.dumps(body) for k in ['"phone"', '"email"'])
    step("verified teacher visible, no contact leak", 200 if (s == 200 and not leaked) else 500, "contact info leaked" if leaked else body, ms)

    # ── Student requirement → lead → proposal → accept → chat ────────────────
    s, p, ms = call(api, "POST", "/tuition/requests", student, body={
        "subject": "History", "exam": "BPSC", "mode": "home", "city": "Patna", "area": "Kankarbagh",
        "budget_per_hour": 400, "preferred_timing": "Evenings", "description": "Need help with modern history.",
    })
    step("student posts requirement", s, p, ms)
    req = (p or {}).get("request") if isinstance(p, dict) else None
    req_id = (req or unwrap(p) or {}).get("id") if isinstance(req or unwrap(p), dict) else None

    s, p, ms = call(api, "GET", "/tuition/leads", teacher)
    step("teacher sees matching leads", s, p, ms)
    lead_ids = [l.get("id") for l in (unwrap(p) or [])] if isinstance(unwrap(p), list) else []
    step("lead contains the new requirement", 200 if req_id in lead_ids else 500, lead_ids, 0)

    s, p, ms = call(api, "POST", f"/tuition/requests/{req_id}/proposals", teacher, body={"message": "I can start this week.", "fee_per_hour": 450})
    step("teacher sends proposal", s, p, ms)
    prop = (p or {}).get("proposal") if isinstance(p, dict) else None
    prop_id = (prop or unwrap(p) or {}).get("id") if isinstance(prop or unwrap(p), dict) else None
    s, p, ms = call(api, "POST", f"/tuition/requests/{req_id}/proposals", teacher, body={"message": "again", "fee_per_hour": 450})
    step("second proposal rejected", s, p, ms, ok=(409, 422, 403))

    s, p, ms = call(api, "POST", f"/tuition/requests/{req_id}/proposals/{prop_id}/accept", student)
    step("student accepts proposal", s, p, ms)
    conv_id = None
    if isinstance(p, dict):
        conv_id = p.get("conversation_id") or (p.get("conversation") or {}).get("id") or (unwrap(p) or {}).get("conversation_id")

    s, p, ms = call(api, "GET", "/conversations", student)
    step("student lists conversations", s, p, ms)
    convs = unwrap(p) or []
    if not conv_id and isinstance(convs, list) and convs:
        conv_id = convs[0].get("id")
    s, p, ms = call(api, "POST", f"/conversations/{conv_id}/messages", student, body={"body": "Hello sir, when can we start?"})
    step("student sends chat message", s, p, ms)
    s, p, ms = call(api, "GET", f"/conversations/{conv_id}/messages", teacher)
    step("teacher reads chat", s, p, ms)
    msgs = unwrap(p) or []
    step("message delivered", 200 if any("Hello sir" in json.dumps(m) for m in (msgs if isinstance(msgs, list) else [])) else 500, msgs, 0)

    outsider, _ = make_user(api, "student")
    s, p, ms = call(api, "GET", f"/conversations/{conv_id}/messages", outsider)
    step("outsider blocked from chat", s, p, ms, ok=(403, 404))

    # ── Live classes ─────────────────────────────────────────────────────────
    s, p, ms = call(api, "POST", "/live-classes", teacher, body={
        "title": "Smoke live class", "description": "test", "subject": "History", "provider": "jitsi",
        "scheduled_at": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(time.time() + 600)), "duration_min": 60, "max_participants": 100,
    })
    step("teacher schedules live class", s, p, ms)
    lc = (p or {}).get("class") if isinstance(p, dict) else None
    lc = lc or unwrap(p) or {}
    lc_id = lc.get("id") if isinstance(lc, dict) else None
    s, p, ms = call(api, "POST", "/live-classes", student, body={"title": "x", "provider": "jitsi", "scheduled_at": "2030-01-01T10:00:00", "duration_min": 30})
    step("student cannot schedule", s, p, ms, ok=(403,))
    s, p, ms = call(api, "GET", "/live-classes?status=upcoming", student)
    step("student lists upcoming classes", s, p, ms)
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/go-live", teacher)
    step("teacher goes live", s, p, ms)
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/join", student)
    step("student joins live class", s, p, ms)
    if isinstance(p, dict):
        txt = json.dumps(p)
        step("join payload has no private key", 200 if "PRIVATE KEY" not in txt else 500, "", 0)
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/messages", student, body={"body": "Sir, please repeat the last point"})
    step("student posts class chat", s, p, ms)
    s, p, ms = call(api, "GET", f"/live-classes/{lc_id}/messages?after=0", teacher)
    step("teacher reads class chat", s, p, ms)
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/raise-hand", student)
    step("student raises hand", s, p, ms)
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/polls", teacher, body={"question": "Capital of Bihar?", "options": ["Patna", "Gaya"]})
    step("teacher creates poll", s, p, ms)
    poll = (p or {}).get("poll") if isinstance(p, dict) else None
    poll = poll or unwrap(p) or {}
    poll_id = poll.get("id") if isinstance(poll, dict) else None
    opts = poll.get("options") if isinstance(poll, dict) else None
    opt_id = (opts[0].get("id") if isinstance(opts, list) and opts and isinstance(opts[0], dict) else "1")
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/polls/{poll_id}/vote", student, body={"option_id": opt_id})
    step("student votes", s, p, ms)
    s, p, ms = call(api, "GET", f"/live-classes/{lc_id}/state", student)
    step("class state", s, p, ms)
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/end", student)
    step("student cannot end class", s, p, ms, ok=(403,))
    s, p, ms = call(api, "POST", f"/live-classes/{lc_id}/end", teacher)
    step("teacher ends class", s, p, ms)

    # ── Payments ─────────────────────────────────────────────────────────────
    s, p, ms = call(api, "GET", "/payments/config", student)
    step("payments config", s, p, ms)
    cfg = p if isinstance(p, dict) else {}
    s, p, ms = call(api, "POST", "/admin/test-series", admin, body={
        "name_en": "Smoke Paid Series", "exam_id": 1, "is_published": True, "is_paid": True, "price": 299, "mrp": 999, "validity_days": 365,
    })
    step("admin creates paid series", s, p, ms)
    series = unwrap(p) or {}
    sid = series.get("id") if isinstance(series, dict) else None
    s, p, ms = call(api, "POST", f"/test-series/{sid}/enroll", student)
    step("enroll on paid series requires payment", s, p, ms, ok=(402,))
    s, p, ms = call(api, "POST", f"/test-series/{sid}/checkout", student)
    if cfg.get("fake"):
        step("fake checkout enrolls", s, p, ms)
        s, p, ms = call(api, "GET", "/orders", student)
        step("student sees order", s, p, ms)
        s, p, ms = call(api, "GET", f"/test-series/{sid}", student)
        step("series shows access", 200 if (s == 200 and (unwrap(p) or {}).get("has_access")) else 500, p, ms)
    elif cfg.get("configured"):
        step("razorpay order created", s, p, ms)
    else:
        step("checkout reports not configured", s, p, ms, ok=(503,))
    s, p, ms = call(api, "GET", "/admin/orders/summary", admin)
    step("admin revenue summary", s, p, ms)

    return finish()


def finish():
    failed = results.count(False)
    print(f"\n{len(results) - failed}/{len(results)} passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
