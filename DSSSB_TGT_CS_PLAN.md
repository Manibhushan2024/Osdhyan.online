# DSSSB TGT Computer Science 2026 — Test Series Build Plan

**Exam (one-tier CBT):** 200 questions · 200 marks · 2 hours · −0.25 per wrong answer.
Section A (100): General Awareness 20 · General Intelligence & Reasoning 20 · Arithmetical & Numerical Ability 20 · Hindi 20 · English 20.
Section B (100): Computer Science (~88) + Teaching Methodology (~12) — exactly the split seen in the official 2023/2024 papers.

**What we have:** 4 official papers (24 Jun 2023 S3, 25 Jun 2023 S1 & S2, 7 Feb 2024 S2 in English + Hindi) = 800 real questions with the official answer marked; the owner's 20-topic syllabus CSV (`backend/database/data/dsssb/syllabus_tgt_cs.csv`).
Trend inputs (public analyses): the exam is rated moderate; Section A is the scoring part, Section B is concept-based (NCERT/CBSE CS style); across 12 past papers the heaviest CS areas are Operating Systems, Computer Networks, Number systems & digital logic, DBMS/SQL, then programming/OOP, data structures, software engineering, web/IT tools.

## Phases

| Phase | Deliverable | How | Status |
|---|---|---|---|
| **1. PYQ bank** | 4 official papers as attemptable "Previous Year Paper" tests (real pattern, real timer, official answers) | Page images → transcription → cross-check with the text layer (question IDs, answer icons); Hindi merged by question ID for 2024 | done |
| **2. Solutions** | Every PYQ gets a short solution (why the answer is right, why others are wrong); answers where our solver disagrees with the key are flagged for review | solver + reviewer pass per section | done |
| **3. Topic tagging & trend analysis** | Each CS PYQ tagged to a syllabus chapter → weightage table, "what is asked most" report, difficulty tags | classifier pass over the PYQ bank | done |
| **4. Full-length model mocks** | Mock Tests 1–10 in the exact section split; Mocks 1–4 = the 4 official papers, Mocks 5–10 = 200 new questions each, weighted by the PYQ trend table | generated chapter-wise then assembled to the 200-Q blueprint | done |
| **5. Section-wise tests** | GA · Reasoning · Numerical · Hindi · English · Computer Science · Teaching Methodology — 2 tests each (20–100 Q) | generated | done |
| **6. Chapter-wise tests** | One 25-Q test per syllabus chapter (all 20 rows of the CSV, incl. every CS chapter: C/C++/Java/Python, DBMS+SQL, Networks, OS, DSA, Fundamentals+Digital, SE, Web, IT tools, Teaching methodology) | generated, sub-topic coverage checked against the CSV | done |
| **7. Most Expected set** | 200 high-probability questions built from the trend table (repeat-type questions, hot sub-topics) | generated | done |
| **8. Study material** | One concise revision note per chapter (key facts, formulas, PYQ-style traps) — downloadable (PDF + HTML) from Materials | generated + converted | done |
| **9. Publish** | Exam "DSSSB TGT Computer Science" with series **DSSSB TGT CS 2026 — Complete Test Series** grouped as Previous Year Papers / Full Mock Tests / Section-wise Tests / Chapter-wise Tests / Most Expected; free to start, price can be set in Admin | `osdhyan:import-question-sets` | done |
| **10. QA** | Play-through of a PYQ paper and a chapter test on the live link, sectional results, solutions visible after submit, smoke tests, commit | | done |

## Rules we follow for quality
- PYQs are verbatim; nothing is "improved". Official answer = the ticked option; our solver only flags disagreements.
- Generated questions follow the PYQ style per section (one-liners for GA, output-type for programming, statement/assertion for SE/OS) and never duplicate a PYQ.
- Every question has a solution; every chapter test covers the sub-topics listed in the syllabus CSV.
- Figure-based reasoning questions (mirror images, paper folding) are excluded from online tests because the figures cannot be reproduced as text.

## What shipped (20 Oct 2026)

| Group | Tests | Questions |
|---|---|---|
| Previous Year Papers | 4 | 773 (official key, every question with a solution) |
| Full Mock Tests | 10 | 1–4 official papers, 5–10 new (200 each, no repeats between mocks) |
| Most Expected | 2 | 200 |
| Section-wise Tests | 14 | 330 |
| Chapter-wise Tests | 18 | 450 (25 per chapter) |

- 2,683 unique questions, all with 4 options, an answer and a solution. 1,910 are new, written chapter-wise to `GENERATION_SPEC.md`.
- 19 downloadable PDFs in Materials: one revision note per chapter plus the PYQ trend analysis (`notes/pyq_trends.md`).
- Our solvers questioned 15 official answers. The tests keep the official answer, and each solution explains the doubt.
- Rebuild: `python -I scripts/content/build-dsssb-series.py`, then `php artisan osdhyan:import-question-sets database/data/dsssb/question_sets_dsssb_tgt_cs.json`. Check: `python -I scripts/smoke_dsssb.py`.
