# Sectioned tests — API contract for the web and app players

Backend is done and tested (`backend/tests/Feature/SectionedAttemptTest.php`). Local API: http://127.0.0.1:8000/api.
Seeded local student: `POST /auth/login {"login":"student@local.test","password":"Student@123"}`.
Sectioned tests locally: the 4 "DSSSB TGT CS Official Paper …" and 10 "Full Mock Test …" in the
"DSSSB TGT Computer Science 2026 — Complete Test Series" (`GET /test-series`, then `GET /test-series/{id}` → `content`).

## Test payload (`GET /tests/{id}`, and `attempt.test` in `GET /attempts/{id}`)
```json
"section_mode": "sequential",          // or "free" (default; no restrictions)
"sections": [                           // in question order; from/count are 0-based index ranges into test.questions
  {"key":"rea","name_en":"Section A · General Intelligence & Reasoning","name_hi":"खंड A · …","from":0,"count":20,"duration_sec":null},
  {"key":"ga", …}, {"key":"num", …}, {"key":"eng", …}, {"key":"hin", …},
  {"key":"cs1","name_en":"Section B · Computer Science (Block 1)", …}, … {"key":"cs5", …}
]
```
`duration_sec` is a per-block timer (null = only the overall `duration_sec` of the test applies).
Tests without `sections` (or `sections: null`) behave exactly as today.

## Attempt payloads
`POST /tests/{id}/attempts` → `{attempt, is_resume}`; `GET /attempts/{id}`; both include, while in progress:
```json
"remaining_sec": 7100, "deadline_at": "...", "server_time": "...",
"section_state": {
  "mode": "sequential",
  "active_key": "ga",              // null when every block is locked (attempt is then completed)
  "all_locked": false,
  "sections": [
    {"key":"rea","name_en":"…","from":0,"count":20,"duration_sec":null,
     "status":"locked",             // "locked" | "active" | "pending"   ("open" in free mode)
     "started_at":"…","deadline_at":null,"remaining_sec":0,"locked_at":"…","locked_by":"student"},   // or "timer"
    {"key":"ga", "status":"active", "started_at":"…", "deadline_at":"… or null", "remaining_sec": 540|null, …},
    {"key":"num","status":"pending", …}
  ]
}
```
Resume: `responses[]` on the attempt still carry every saved answer (all blocks).

## Rules the server enforces (the UI must mirror them)
1. **Only the active block takes answers.** `POST /attempts/{id}/sync` drops answers for locked/pending blocks and returns
   `"locked_rejected": n` plus a fresh `section_state`. The UI must only let the student open questions of the active block
   (in sequential mode); questions of locked blocks are read-only (show the saved answer greyed), pending blocks hidden/disabled.
2. **Submit section** = `POST /attempts/{id}/sections/{key}/lock` with optional `{responses:[…]}` (the block's unsaved answers).
   Response: `{completed:false, section_state, remaining_sec}` → move to the new `active_key`'s first question.
   For the last block: `{completed:true, section_state, attempt}` → the attempt is submitted; go to the result page.
   409 `SECTION_NOT_ACTIVE` if the key is not the active block (re-read `section_state` from the response). 422 `NO_SECTIONS` on free tests.
3. **Block timer** (`duration_sec` set): when it reaches 0 the server locks the block itself and the next block starts at that
   moment (its own timer runs from the previous deadline). The UI counts down the block timer AND the overall timer; on block
   expiry it should call `GET /attempts/{id}` (or any sync) and apply the returned `section_state` — do not lock locally.
4. **Overall timer** (`remaining_sec` on the attempt) still ends everything; auto-submit exactly as today (`POST /attempts/{id}/complete`).
5. **Free mode** (`section_mode: "free"` with sections): sections are only labels/tabs; the student moves freely; no lock calls.

## Result
`GET /attempts/{id}` (completed) → `metadata.section_results`:
`[{key, name_en, name_hi, total, correct, incorrect, unattempted, marks, max_marks, accuracy}, …]` (+ existing `sectional_stats` by subject).
Show a section-wise table on the result page and the report.

## Expected CBT look (DSSSB/NTA/TCS-style)
- Instructions page → declaration checkbox → test. Header: test name, candidate name, overall timer (and active block timer).
- Block tabs/strip across the top: name + state (locked ✔ / active / not yet open 🔒). In sequential mode only the active tab is clickable.
- Left: question area with "Question N" (number within the whole paper), Hindi/English toggle, options as radio rows.
- Right: palette for the ACTIVE block only (numbers), legend: Not Visited (white/grey), Not Answered (red), Answered (green),
  Marked for Review (purple), Answered & Marked for Review (purple with green tick). Counts under the legend.
- Buttons: "Save & Next", "Mark for Review & Next", "Clear Response", "Save & Mark for Review"; "Submit Section" (sequential)
  with a confirmation that lists answered / not answered / marked / not visited for the block and warns it cannot be reopened;
  "Submit Test" only on the last block (sequential) or anywhere (free).
- Section summary before final submit (same counts per block). Phone layout: palette in a drawer, as the current player does.
If `backend/database/data/dsssb/research/DSSSB_CBT_PATTERN.md` exists, follow its "Decisions for our simulator" list for exact wording/colours.
