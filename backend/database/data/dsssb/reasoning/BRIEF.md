# General Intelligence & Reasoning (Section A) for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT candidate who wants SHORT method notes that cover everything in Section A Reasoning, to revise fast and solve each question in under a minute. Plain, exact English; tables of methods, each with a two-line worked example.
Exam: 20 reasoning questions per paper (Section A, common to all DSSSB posts). 1 mark, −0.25 per wrong answer. Most questions are easy; speed and accuracy matter more than depth.

## Owner's syllabus rows
| key | chapter | syllabus line | Q/paper |
|---|---|---|---|
| rea_verbal (old) | Verbal reasoning | analogy, classification, number/letter series, coding–decoding, syllogism, blood relation, direction, ranking, statement–conclusion/argument/course of action, Venn diagram, mathematical operations, clock & calendar, alphabet test | about 17–19 |
| rea_nonverbal (old) | Non-verbal (text-safe) | counting figures, dice, cube cutting and painting, matrix coding, figure series, mirror and water images, paper folding — always described in words | about 1–3 |

## What the 4 official DSSSB TGT CS papers (2023–24) actually asked — 61 reasoning questions
Files: `pyq_explanations/todo_gen.json` (section "General Intelligence & Reasoning") joined to `pyq_explanations/done_gen.json` by `qid` (explanation, subtopic, difficulty); built into `reasoning_pyq_analysis.json` by `scripts/content/make-section-a-pyq.py`. Difficulty: 40 easy, 18 medium, 3 hard. Papers: 24 Jun 2023 s3 (14), 25 Jun 2023 s1 (15), 25 Jun 2023 s2 (15), 7 Feb 2024 s2 (17).

| Chapter | PYQs | What exactly was asked |
|---|---|---|
| rea_analogy | 15 | **Odd one out — number pairs (5)**: second = first × 4.5, × 5, × 7, × 3 + 2 (one pair breaks the rule) and a trap set where all four pairs are × 3 but only 27 is not prime (13-39, 27-81, 23-69, 17-51). **Odd one out — letter-cluster codes (3)**: word : code pairs where three use the same coding rule. **Odd letter groups (2)**: MKH/MPR/WUR/KIF, WXUZ/EFCG/NOLQ/IJGL. **Letter analogy / word-code analogy (3)**: NQT : ORU :: ADH : BEI; MATTER : BNUUSF (pairs reversed, +1). **Number analogy (2)**: 442 : 633 :: 313 : 504 (constant +191); 6 : 180 :: 8 : 448 :: 10 : 900 (n²(n − 1)). |
| rea_series | 8 | **Letter series (2)**: PMT, QOW, RQZ, SSC, TUF; NRCH, IYNJ, FJUE, AQFB, XBMW. **Position in a given letter string (1)**: 7th to the left of 11th from the right. **Number series (1)**: 200, 197, 206, 179, 260, 17 (−3, +9, −27, +81, −243). **Counting in a number string (1)**: even numbers followed by odd, not preceded by even. **Alphabet test (1)**: letters in the same position as in the alphabet. **Meaningful word (1)**: letters 1, 3, 5, 8, 12, 15, 18 → CHOLERA, middle L. **Coding (1)**: STOPWARS → POTSSRAW (halves reversed). |
| rea_arrange | 14 | **Ranking in a row/class (5)**: position from other end, "x places behind his friend", interchange of seats, picture-hall row. **Coded blood relations (3)**: P # Q / @ / & and +, −, ×, ÷ codes. **Shadow direction (2)**: morning: the coach's westward shadow falls in front of Messi → Messi faces east; evening shadow walk. **Comparison ordering (2)**: third youngest, heaviest. **Linear arrangement (2)**: 7 friends in a row; letters A–I with vowel gaps. |
| rea_logic | 24 | **Mathematical operations (8)**: sign replacement to balance `a * b * c * d * e * f` (4), which two signs to interchange (2), symbol substitution (1), interchange of two numbers (1). **Statement & conclusions (4)**, **course of action (3)**, **statement & arguments (1)**. **Syllogism (2)** with three statements. **Coded inequalities (1)**: #, $, = symbols. **Data sufficiency (2)**: shortest person; coding HUMAN. **Approximation (3)**: BODMAS with decimals rounded. |
| rea_nonverbal | 0 | Not asked in these four papers, but other DSSSB papers (and the owner's syllabus) include dice, cube painting, counting figures, mirror images and paper folding — keep one chapter, always described in words. |

Lessons: (1) odd-one-out number pairs and sign-replacement equations are near-certain — at least 3–4 marks per paper; (2) statement questions follow fixed rules (no assumptions, no extreme actions); (3) ranking formula `total = left + right − 1` covers five questions; (4) nothing needed a figure.

## Chapters (use these exact keys and titles)
| key | chapter title | PYQs | pack questions |
|---|---|---|---|
| rea_analogy | Analogy & Classification | 15 | 40 |
| rea_series | Series, Coding–Decoding & Alphabet Tests | 8 | 40 |
| rea_arrange | Blood Relations, Direction, Ranking, Clock & Calendar | 14 | 40 |
| rea_logic | Syllogism, Statements, Venn Diagrams & Mathematical Operations | 24 | 40 |
| rea_nonverbal | Non-verbal Reasoning (Figures, Dice, Cubes, Paper Folding) | 0 | 40 |

## Question bank
`questions_a.json` (rea_analogy, rea_series, rea_arrange — 120) and `questions_b.json` (rea_logic, rea_nonverbal — 80). Built from `gen/rea_verbal.json` and `gen/rea_nonverbal.json` (re-keyed; subtopic kept; 4 flawed items fixed; 16 near-duplicates left out) plus 26 new PYQ-style items. `pyq_concept: true` when the sub-topic was asked in 2023–24. Checks and fixes: `review.md`.

## Rules
Every method must be shown with a two-line worked example; use techniques, not stories. Never a question or note that needs a drawing — describe dice, cubes, nets, folds and mirror images in words. Every notes file: "**In 30 seconds**" (6–8 bullets) → method tables with worked examples and shortcuts → "## Exam traps" (8) → "## One-liners for revision" (40) → "## Quick self-check" (10 Q&A); ⭐ where the concept was asked in 2023–24. Numbers in every example must be re-checked by hand. Avoid ambiguous items: an odd-one-out must not have a second property (odd/even, prime) that picks a different option.
