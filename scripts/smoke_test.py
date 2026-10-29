#!/usr/bin/env python3
"""End-to-end smoke test for the OSDHYAN API.

Walks the full student journey (register -> login -> list tests -> take a test
-> submit -> result -> analytics) and the core admin endpoints, printing a
PASS/FAIL line per step with its latency.

Usage:
    python scripts/smoke_test.py [--api http://127.0.0.1:8000/api]
                                 [--admin-login EMAIL --admin-password PASS]

Exit code is non-zero if any step fails.
"""
import argparse
import json
import random
import sys
import time
import urllib.error
import urllib.request

results = []


def call(api, method, path, token=None, body=None, raw=None, content_type=None):
    url = api.rstrip("/") + path
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if raw is not None:
        data = raw
        headers["Content-Type"] = content_type
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    start = time.perf_counter()
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                status, text = resp.status, resp.read().decode("utf-8", "replace")
            break
        except urllib.error.HTTPError as e:
            status, text = e.code, e.read().decode("utf-8", "replace")
            break
        except urllib.error.URLError as e:  # connection-level (TLS EOF, reset): nothing reached the server
            status, text = 0, str(e)
            if attempt < 3:
                time.sleep(1.5 * (attempt + 1))
                continue
            break
        except Exception as e:  # network error
            status, text = 0, str(e)
            break
    ms = int((time.perf_counter() - start) * 1000)
    try:
        payload = json.loads(text) if text else None
    except ValueError:
        payload = text
    return status, payload, ms


def step(name, status, payload, ms, ok_statuses=(200, 201)):
    ok = status in ok_statuses
    results.append(ok)
    detail = ""
    if not ok:
        detail = " -> " + (json.dumps(payload)[:300] if not isinstance(payload, str) else payload[:300])
    print(f"[{'PASS' if ok else 'FAIL'}] {status:>3} {ms:>6}ms  {name}{detail}")
    return ok


def unwrap(payload):
    """Accept both bare arrays/objects and {data: ...} envelopes."""
    if isinstance(payload, dict) and "data" in payload and not isinstance(payload.get("data"), (str, int)):
        return payload["data"]
    return payload


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://127.0.0.1:8000/api")
    ap.add_argument("--admin-login")
    ap.add_argument("--admin-password")
    args = ap.parse_args()
    api = args.api

    s, p, ms = call(api, "GET", "/health")
    step("health", s, p, ms)

    # ── Student journey ──────────────────────────────────────────────────────
    n = random.randint(10_000_000, 99_999_999)
    email = f"smoke{n}@example.test"
    password = "Smoke@12345"
    s, p, ms = call(api, "POST", "/auth/register", body={
        "name": "Smoke Student", "email": email, "phone": f"98{n}",
        "password": password, "password_confirmation": password,
    })
    step("student register", s, p, ms)

    s, p, ms = call(api, "POST", "/auth/login", body={"login": email, "password": password})
    step("student login", s, p, ms)
    token = (p or {}).get("access_token") if isinstance(p, dict) else None
    if not token:
        print("No token — cannot continue student journey")
        return finish()

    s, p, ms = call(api, "GET", "/user", token)
    step("current user", s, p, ms)

    s, p, ms = call(api, "GET", "/tests", token)
    step("list tests", s, p, ms)
    tests = unwrap(p) or []
    if not tests:
        print("No tests in DB — cannot continue")
        return finish()
    test_id = tests[0]["id"]

    s, p, ms = call(api, "GET", f"/tests/{test_id}", token)
    step(f"get test {test_id} (questions)", s, p, ms)
    questions = (p or {}).get("questions", []) if isinstance(p, dict) else []
    leaked = any("is_correct" in o for q in questions for o in q.get("options", []))
    step("test payload hides answers", 200 if not leaked else 500, "is_correct leaked", 0)

    s, p, ms = call(api, "POST", f"/tests/{test_id}/attempts", token)
    step("start attempt", s, p, ms)
    attempt = (p or {}).get("attempt", {}) if isinstance(p, dict) else {}
    attempt_id = attempt.get("id")
    if not attempt_id:
        return finish()
    rem = attempt.get("remaining_sec")
    step(f"server timer present (remaining_sec={rem})", 200 if isinstance(rem, int) and rem > 0 else 500, attempt, 0)

    s, p, ms = call(api, "POST", f"/tests/{test_id}/attempts", token)
    step("start again resumes same attempt", s if (p or {}).get("attempt", {}).get("id") == attempt_id else 500, p, ms)

    answers = []
    for q in questions[: min(20, len(questions))]:
        opts = q.get("options") or []
        if opts:
            answers.append({"question_id": q["id"], "selected_option_id": random.choice(opts)["id"],
                            "is_marked_for_review": False, "time_taken_sec": 5})
    if answers:
        s, p, ms = call(api, "POST", f"/attempts/{attempt_id}/responses", token, body=answers[0])
        step("save single response", s, p, ms)
        s, p, ms = call(api, "POST", f"/attempts/{attempt_id}/sync", token, body={"responses": answers})
        step(f"sync {len(answers)} responses", s, p, ms)

    s, p, ms = call(api, "GET", f"/attempts/{attempt_id}", token)
    step("get ongoing attempt", s, p, ms)

    # Final flush rides along with submit: change the last answer in the same request.
    final = answers[-1:] if answers else []
    s, p, ms = call(api, "POST", f"/attempts/{attempt_id}/complete", token, body={"responses": final})
    step("submit attempt (with final answers)", s, p, ms)
    first_score = p.get("total_score") if isinstance(p, dict) else None
    if isinstance(p, dict):
        print(f"        score={first_score} meta={json.dumps(p.get('metadata'))[:200]}")
        has_answers = any("is_correct" in o for q in (p.get("test") or {}).get("questions", []) for o in q.get("options", []))
        step("result includes answer key", 200 if has_answers else 500, "no is_correct in result", 0)

    s, p, ms = call(api, "POST", f"/attempts/{attempt_id}/complete", token)
    same = isinstance(p, dict) and p.get("total_score") == first_score
    step("double submit is idempotent (same score)", s if same else 500, p, ms)

    s, p, ms = call(api, "POST", f"/attempts/{attempt_id}/sync", token, body={"responses": answers[:1]})
    step("sync after submit rejected", s, p, ms, ok_statuses=(409,))

    s, p, ms = call(api, "POST", f"/attempts/{attempt_id}/sync", token,
                    body={"responses": [{"question_id": 999999999, "selected_option_id": 1}]})
    step("sync rejects foreign question", s, p, ms, ok_statuses=(409,))

    s, p, ms = call(api, "GET", f"/attempts/{attempt_id}", token)
    step("get result", s, p, ms)

    for path in ["/tests/%d/attempts" % test_id, "/tests/%d/latest-attempt" % test_id,
                 "/analytics/overview", "/analytics/topics", "/test-series", "/test-series/enrolled",
                 "/exams", "/courses/categories", "/study-goals", "/notes", "/achievements",
                 "/study-planner/dashboard", "/live-classes", "/support/tickets"]:
        s, p, ms = call(api, "GET", path, token)
        step(f"GET {path}", s, p, ms)

    # Students must not reach admin endpoints
    s, p, ms = call(api, "GET", "/admin/tests", token)
    step("student blocked from admin", s, p, ms, ok_statuses=(401, 403))

    # ── Admin ────────────────────────────────────────────────────────────────
    if args.admin_login:
        s, p, ms = call(api, "POST", "/auth/admin/login",
                        body={"login": args.admin_login, "password": args.admin_password})
        step("admin login", s, p, ms)
        atoken = (p or {}).get("access_token") if isinstance(p, dict) else None
        if atoken:
            for path in ["/admin/exams", "/admin/subjects", "/admin/tests", "/admin/test-series",
                         "/admin/questions/search?q=a", "/admin/analytics/overview", "/admin/users"]:
                s, p, ms = call(api, "GET", path, atoken)
                step(f"admin GET {path}", s, p, ms)

    return finish()


def finish():
    failed = results.count(False)
    print(f"\n{len(results) - failed}/{len(results)} passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
