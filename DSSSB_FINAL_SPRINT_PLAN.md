# OSDHYAN — DSSSB TGT Computer Science 2026: the final-sprint plan

Written 29 Oct 2026. Exam: **27 Nov – 4 Dec 2026** (DSSSB notice of 7 Oct 2026 for Advt 03/2026, post code 41/26, 675 vacancies). That is **4 weeks away**, so every phase below is sized to land before the exam, and the study plan is a 4-week sprint.

Sources and the exact exam-interface findings: `backend/database/data/dsssb/research/DSSSB_CBT_PATTERN.md`.

## What the real exam does (confirmed)

| Fact | Source |
|---|---|
| 200 questions, 200 marks, 120 minutes, −0.25 per wrong answer | DSSSB Advt 03/2026 |
| Section A: GA 20 · Reasoning 20 · Arithmetic 20 · Hindi 20 · English 20; Section B: CS + teaching methodology 100 | Advt 03/2026 |
| Qualifying: Gen/EWS 40 %, OBC 35 %, SC/ST/PwBD 30 % — in Section B **and** on the total | Advt 03/2026 para 5(v) |
| Conducted on TCS iON. The official mock opens **10 groups of 20 in order**; a group is **locked once submitted** and cannot be reopened; **one overall 120-minute timer**, no per-group timer | DSSSB official mock |
| Buttons: **Save & Next**, **Mark for Review & Next**, **Clear Response**, **Submit** (group) | DSSSB mock label files |
| A selection is not saved until Save & Next / Mark for Review & Next | DSSSB mock |
| **Answered & Marked for Review questions are NOT evaluated** | DSSSB mock config |
| Palette: Not Visited grey · Not Answered orange-red · Answered green · Marked purple · Answered & Marked purple + tick | DSSSB mock |
| Not confirmed by any official notice: that the 2026 hall exam uses the locked groups (2026 news reports say it does) | — |

## Phases

| # | Phase | What it delivers | Status |
|---|---|---|---|
| 0 | Research | The findings above, written into the simulator decisions | Done |
| 1 | **Exam engine** | Sections on tests; sequential locking; per-section timers (optional); server refuses answers to locked/unopened blocks; locking the last block submits; section-wise results; "answered & marked = not evaluated" rule; 10 automated tests | Backend done |
| 2 | **Real-exam interface** (web + app) | Instructions pages with the official declaration, group tabs, exact buttons and colours, save-on-Save&Next semantics, group summary and "Are you sure to submit this Group?" dialog, View-in English/Hindi, section-wise result table in results and the PDF report | In progress |
| 3 | **Full-paper mocks in the real format** | 4 official papers + 10 full mocks re-laid as 10 blocks in the notification order (GA, Reasoning, Arithmetic, Hindi, English, CS 1–5) | Done (local), deploy pending |
| 4 | **Revise the concept inside solutions** | Every question carries a concept key; wrong answers show the matching notes section right there ("Revise this concept"), with a link to the chapter PDF; the four new Section A packs plug in automatically | Backend done; web/app pending |
| 5 | **Complete Section A coverage** | New packs with short notes, fast-revision sheets, PYQs with solutions and 200 practice questions each: Reasoning, Numerical Ability, English, Hindi (GA already done) — so all 10 blocks have notes + tests | Writers running |
| 6 | **Sign-in that works on day one** | Firebase phone OTP (SMS) and e-mail-link sign-in on the website; Google sign-in; same on the app (needs one more app build) | In progress |
| 7 | **Your study plan** | Day-by-day plan to 26 Nov built around 2 office hours (short tasks) and 6–7 library hours (mocks + review), weekends for mocks; every task opens the real test or notes; progress tracking on web and app | In progress |
| 8 | **Ship** | Deploy API + website, rebuild the app (build 3), create your account, verify end to end, commit | Pending |

## Your 4-week sprint (the planner builds the day-by-day version)

- **Week 1 (30 Oct – 5 Nov):** Section B first — one CS subject a day in the library (notes PDF → chapter tests → wrong answers → Revise the concept). Office hours: Section A chapter tests (Reasoning, Arithmetic) in 30-minute slots. Saturday: Full Mock 5 in the real format; Sunday: review + weakest subject.
- **Week 2 (6 – 12 Nov):** Finish Section B (Fundamentals, SE, Web, IT, Teaching). Office hours: English and Hindi chapter tests + GA fast revision. Two full mocks (Wed, Sat), each followed by a 45-minute review of wrong answers.
- **Week 3 (13 – 19 Nov):** Mixed practice. Office: 200-most-expected sets per subject in 35-question practice tests. Library: a full mock on alternate days, the four official papers in exam format, section-wise analysis after each (target: Section B ≥ 60/100, total ≥ 120).
- **Week 4 (20 – 26 Nov):** One full mock every day in the morning library slot, fast-revision sheets of all 11 subjects in rotation, GA current affairs top-40 daily, Hindi/English vocabulary lists. Last two days: only fast-revision sheets and sleep.
- **Exam day rules the simulator trains you for:** never leave a question "Answered & Marked" — it scores zero; submit each group only after the summary shows what you want; the 120 minutes run across all 10 groups, so budget ~12 minutes per Section A group and ~12 per CS group.
