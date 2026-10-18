#!/usr/bin/env python3
"""Exam-day load test for the OSDHYAN API.

Simulates N students taking the same mock test at the same time:

  login -> GET /tests -> GET /tests/{id} -> POST start attempt
        -> answer questions, syncing a batch every SYNC_EVERY seconds
        -> POST complete -> GET result

Prereqs (local / staging only, never production data):
  LOADTEST_USERS=2000 php artisan db:seed --class=LoadTestUsersSeeder

Usage:
  pip install aiohttp
  python scripts/load_test.py --api http://localhost:8000/api --users 500 \
      --ramp 60 --test-id 1 --exam-seconds 120

The exam is compressed: --exam-seconds is how long each virtual student
spends answering (real exams are 1-2 h; the request mix per second is what
matters). Prints p50/p95/p99 latency and error rate per endpoint.
"""
import argparse
import asyncio
import random
import statistics
import time
from collections import defaultdict

import aiohttp

stats = defaultdict(list)       # endpoint -> [latency ms]
errors = defaultdict(lambda: defaultdict(int))  # endpoint -> status -> count


async def req(session, method, url, name, token=None, json=None, timeout=60):
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    start = time.perf_counter()
    status = 0
    body = None
    try:
        async with session.request(method, url, json=json, headers=headers,
                                   timeout=aiohttp.ClientTimeout(total=timeout)) as r:
            status = r.status
            body = await r.json(content_type=None) if r.status != 204 else None
    except Exception as e:  # timeout / connection reset
        status = type(e).__name__
    ms = (time.perf_counter() - start) * 1000
    stats[name].append(ms)
    if not (isinstance(status, int) and 200 <= status < 300):
        errors[name][status] += 1
    return status, body


async def student(i, args, session, results):
    api = args.api.rstrip("/")
    email = f"loadtest{i}@example.test"
    s, b = await req(session, "POST", f"{api}/auth/login", "login",
                     json={"login": email, "password": "LoadTest@123"})
    if s != 200:
        results["failed_login"] += 1
        return
    token = b["access_token"]

    await req(session, "GET", f"{api}/tests", "list_tests", token)
    s, test = await req(session, "GET", f"{api}/tests/{args.test_id}", "get_test", token)
    if s != 200:
        results["failed_test"] += 1
        return
    questions = test.get("questions", [])

    s, b = await req(session, "POST", f"{api}/tests/{args.test_id}/attempts", "start_attempt", token)
    if s != 200:
        results["failed_start"] += 1
        return
    attempt_id = b["attempt"]["id"]

    # Answer questions spread over the exam window, syncing in batches.
    per_q = args.exam_seconds / max(1, len(questions))
    dirty = []
    last_sync = time.monotonic()
    for q in questions:
        await asyncio.sleep(per_q * random.uniform(0.5, 1.5))
        opts = q.get("options") or []
        if opts and random.random() < 0.85:
            dirty.append({"question_id": q["id"], "selected_option_id": random.choice(opts)["id"],
                          "is_marked_for_review": False, "time_taken_sec": int(per_q)})
        if dirty and time.monotonic() - last_sync >= args.sync_every:
            s, _ = await req(session, "POST", f"{api}/attempts/{attempt_id}/sync", "sync", token,
                             json={"responses": dirty})
            if s == 200:
                dirty = []
            last_sync = time.monotonic()

    s, b = await req(session, "POST", f"{api}/attempts/{attempt_id}/complete", "complete", token,
                     json={"responses": dirty})
    if s != 200:
        results["failed_submit"] += 1
        return
    await req(session, "GET", f"{api}/attempts/{attempt_id}", "result", token)
    await req(session, "GET", f"{api}/analytics/overview", "analytics", token)
    results["completed"] += 1


def pct(values, p):
    if not values:
        return 0
    values = sorted(values)
    k = min(len(values) - 1, int(round(p / 100 * (len(values) - 1))))
    return values[k]


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://localhost:8000/api")
    ap.add_argument("--users", type=int, default=200)
    ap.add_argument("--first-user", type=int, default=1)
    ap.add_argument("--ramp", type=float, default=30, help="seconds over which students arrive")
    ap.add_argument("--test-id", type=int, default=1)
    ap.add_argument("--exam-seconds", type=float, default=120)
    ap.add_argument("--sync-every", type=float, default=10)
    ap.add_argument("--connections", type=int, default=1000)
    args = ap.parse_args()

    results = defaultdict(int)
    conn = aiohttp.TCPConnector(limit=args.connections, ttl_dns_cache=300)
    started = time.perf_counter()
    async with aiohttp.ClientSession(connector=conn) as session:
        tasks = []
        for n in range(args.users):
            await asyncio.sleep(args.ramp / max(1, args.users))
            tasks.append(asyncio.create_task(student(args.first_user + n, args, session, results)))
        await asyncio.gather(*tasks)
    elapsed = time.perf_counter() - started

    total = sum(len(v) for v in stats.values())
    print(f"\n{args.users} students, {total} requests in {elapsed:.1f}s ({total / elapsed:.1f} req/s)")
    print(f"completed={results['completed']} " + " ".join(f"{k}={v}" for k, v in results.items() if k != "completed"))
    print(f"\n{'endpoint':<15}{'count':>7}{'p50 ms':>9}{'p95 ms':>9}{'p99 ms':>9}{'max ms':>9}  errors")
    for name in ["login", "list_tests", "get_test", "start_attempt", "sync", "complete", "result", "analytics"]:
        v = stats.get(name, [])
        if not v:
            continue
        err = ", ".join(f"{k}:{c}" for k, c in errors[name].items()) or "-"
        print(f"{name:<15}{len(v):>7}{statistics.median(v):>9.0f}{pct(v, 95):>9.0f}{pct(v, 99):>9.0f}{max(v):>9.0f}  {err}")


if __name__ == "__main__":
    asyncio.run(main())
