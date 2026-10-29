# Reasoning pack — answer review

Scope: `questions_a.json` (120: rea_analogy 40, rea_series 40, rea_arrange 40) and `questions_b.json` (80: rea_logic 40, rea_nonverbal 40).
Checks run by script: valid JSON, exactly 4 distinct options, `answer_index` 0–3, no duplicate stems, answers A/B/C/D = 50/50/50/50.

## Fixes made
| # | Item (source) | Problem | Fix |
|---|---|---|---|
| 1 | questions_a.json #92 (gen/rea_verbal #60) — morning, the pole's shadow on Mohan's right | **Wrong key.** Morning shadows fall west; west on your right means you face **south**. The key said North and the explanation mixed up left and right. | Key B (North) → **A (South)**; explanation rewritten. |
| 2 | questions_a.json #3 (gen/rea_verbal #3) — 7 : 56 :: 9 : ? | Ambiguous: option 72 fits a plain "× 8" rule just as 90 fits n(n + 1). | Option 72 replaced by 80; key (90) unchanged; explanation says why. |
| 3 | questions_a.json #20 (gen/rea_verbal #11) — 16, 25, 36, 48 | Ambiguous: 25 was the only odd number, a second defensible odd one. | 25 replaced by 64 in stem and options; key (48) unchanged. |
| 4 | questions_a.json #25 (gen/rea_verbal #16) — 24, 35, 48, 62 | Ambiguous: 35 was the only odd number. | 62 replaced by 65 (8² + 1; the rule needs 63); key position unchanged. |
| 5 | questions_b.json #39 (gen/rea_verbal #105) — 12 _ 4 _ 3 _ 6 = 15 | Key right, but the explanation gave the wrong option numbers for the distractors. | Explanation rewritten with each distractor's value. |

No other key was wrong. Beyond the random sample below, every one of the 200 questions was solved once by hand while re-keying (the Mohan's-shadow error was found that way; it also fell in the sample).

## How the 200 were built
- 174 re-keyed from `gen/rea_verbal.json` (117 of 120) and `gen/rea_nonverbal.json` (57 of 70); text, options, answers and subtopic kept (except the fixes above).
- Moved by content: 4 number-grid items → rea_analogy; 6 letter-matrix codes and 2 letter/number figure series → rea_series; 2 rotating-pointer items and 3 mirror-clock items → rea_arrange.
- Left out (near-duplicates of kept items, or weakest items over the 40-per-chapter cap; still in `gen/`, 1-based): rea_verbal #78, #83, #90; rea_nonverbal #10, #11, #12, #17, #20, #24, #25, #39, #41, #42, #44, #62, #66. Reason: 190 + 10 could not give about 40 per chapter (analogy had only 16 source items and non-verbal 70), so 16 items gave way to 26 new ones.
- 26 new PYQ-style items: 20 rea_analogy (number-pair odd one out, constant-difference and n²(n ± 1) analogies, word-code pairs, letter groups, word analogies), 1 rea_series (counting in a number string), 5 rea_arrange (seat interchange, rank from a friend, evening shadow, age ordering, seven-seat row). Their answer positions were chosen to even out A–D.
- `pyq_concept: true` on sub-topics asked in 2023–24 (all verbal sub-topics except Venn diagrams and clock & calendar, plus the new items); false for non-verbal items.

## Random re-check: 60 questions
Drawn with Python `random.seed(2026); random.sample(range(200), 60)` over the 200 in file order. Q = file (a = questions_a.json, b = questions_b.json) and position in that file.

| Q | Chapter | Stem (start) | Key | My working | Result |
|---|---|---|---|---|---|
| a1 | rea_analogy | Pen is to Write as Knife is to: | D — Cut | Pen → write is tool → function; knife → cut. | Agrees |
| a3 | rea_analogy | 7 : 56 :: 9 : ? | A — 90 | 7 × 8 = 56 = n(n + 1) → 9 × 10 = 90. | Agrees |
| a7 | rea_analogy | 3 : 28 :: 5 : ? | D — 126 | 3³ + 1 = 28 → 5³ + 1 = 126. | Agrees |
| a20 | rea_analogy | Select the odd number: 16, 64, 36, 48 | C — 48 | 16, 64, 36 are squares; 48 is not. | Agrees |
| a21 | rea_analogy | Select the odd number: 17, 23, 29, 39 | D — 39 | 39 = 3 × 13; the rest are prime. | Agrees |
| a23 | rea_analogy | Select the odd pair: (8, 64), (5, 25), (7, 49), (6, 48) | C — (6, 48) | 8², 5², 7² fit; 6² = 36, not 48. | Agrees |
| a24 | rea_analogy | Select the odd one out: Whale, Dolphin, Shark, Seal | B — Shark | Shark is a fish; whale, dolphin, seal are mammals. | Agrees |
| a26 | rea_analogy | Four number-pairs have been given, out of which three are alike in som | D — 30 - 132 | × 4.5 gives 63, 90, 117; 30 × 4.5 = 135 ≠ 132. | Agrees |
| a27 | rea_analogy | Three of the following number-pairs follow the same rule and one does  | A — 18 - 111 | × 6 + 5 gives 77, 95, 131; 18 → 113 ≠ 111. | Agrees |
| a29 | rea_analogy | In three of the following number-pairs the second number is obtained f | C — 6 - 35 | n² + 1 gives 50, 82, 122; 6² + 1 = 37 ≠ 35. | Agrees |
| a30 | rea_analogy | Four letter-cluster pairs have been given, out of which three are alik | D — PLANT : QMBOS | +1 per letter; PLANT → QMBOU, not QMBOS. | Agrees |
| a31 | rea_analogy | In the following, select the odd letter group from the given alternati | A — DGI | QOL, HFC, VTQ go −2, −3; DGI goes +3, +2. | Agrees |
| a37 | rea_analogy | Find the missing number in the grid. Row 1: 4, 5, 41; Row 2: 6, 2, 40; | A — 58 | 4² + 5² = 41, 6² + 2² = 40 → 3² + 7² = 58. | Agrees |
| a54 | rea_series | Complete the series: ZYX, WVU, TSR, ? | B — QPO | Letters run backwards without a break: …TSR, QPO. | Agrees |
| a58 | rea_series | If TABLE is coded as UBCMF, then how is CHAIR coded? | D — DIBJS | +1 per letter: CHAIR → DIBJS. | Agrees |
| a62 | rea_series | In a code language, 'sky is blue' is written as 'ro mi ta', 'blue sea  | A — su | deep = la, sky = ta, blue = mi → sea = su. | Agrees |
| a65 | rea_series | In a code, DELHI is written as EGOLN. How will PUNE be written in that | C — QWQI | Shifts +1, +2, +3, +4: PUNE → QWQI. | Agrees |
| a74 | rea_series | In a series of figures, each figure shows a letter and a number: A2, C | B — O32 | Letters +2, +3, +4, +5: J + 5 = O; numbers × 2 → O32. | Agrees |
| a75 | rea_series | Matrix I (rows 0–4, columns 0–4): | C — 00, 10, 22, 65, 77 | P00, E10, A22, R65, L77 all decode; other sets contain 69 = O, 58 = I, 03 = T. | Agrees |
| a80 | rea_series | A 4 × 4 letter grid is: Row 1: P L A N; Row 2: T R E S; Row 3: M O U D | D — 13 23 33 42 32 | Column then row: M13, O23, U33, S42, E32. | Agrees |
| a81 | rea_arrange | Pointing to a photograph, Ravi says, 'She is the daughter of my grandf | B — Sister | Grandfather's only son = Ravi's father → his daughter = sister. | Agrees |
| a82 | rea_arrange | A is the sister of B. C is the mother of B. D is the father of C. How  | D — Granddaughter | D is the father of A's mother C → granddaughter. | Agrees |
| a88 | rea_arrange | Pointing to a boy, Meena said, 'He is the son of my mother's only son. | B — Nephew | Mother's only son = Meena's brother → his son = nephew. | Agrees |
| a90 | rea_arrange | A person walks 8 km north, then turns right and walks 6 km. How far an | C — 10 km north-east | √(8² + 6²) = 10 km, north-east. | Agrees |
| a92 | rea_arrange | One morning after sunrise, Mohan stood facing a pole. The shadow of th | A — South | Morning shadow points west; west on his right ⇒ he faces SOUTH. File key said North → FIXED. | FIXED |
| a94 | rea_arrange | Sunita is facing north-west. She turns 90 degrees clockwise and then 1 | C — South-west | NW + 90° clockwise = NE; 180° turn → SW. | Agrees |
| a95 | rea_arrange | A is 5 m east of B. C is 5 m north of B. D is 5 m west of C. In which  | A — North-west | B(0,0): A(5,0), D(−5,5) → D is 10 W, 5 N of A → north-west. | Agrees |
| a97 | rea_arrange | In the evening, just before sunset, Rekha and Sohan stand facing each  | B — North | Evening shadows fall east; east on Rekha's left ⇒ she faces south; Sohan faces her ⇒ north. | Agrees |
| a102 | rea_arrange | Raj is 9th from the top in a class. Amit is 14th from the bottom. If t | B — 32 | Amit's place = 19th from top and 14th from bottom → 32. | Agrees |
| a103 | rea_arrange | P is heavier than Q but lighter than R. S is heavier than R. T is ligh | A — R | S > R > P > Q > T → R is second heaviest. | Agrees |
| a108 | rea_arrange | Seven people A, B, C, D, E, F and G sit in a row facing north. C sits  | D — F | C1, G2, B3, E4, A5, F6, D7 → F sits between A and D. | Agrees |
| a109 | rea_arrange | What is the angle between the hands of a clock at 3:30? | C — 75° | |30 × 3 − 5.5 × 30| = |90 − 165| = 75°. | Agrees |
| a113 | rea_arrange | On which day of the week did India become independent on 15 August 194 | D — Friday | 1946 years → 2 odd days; 1 Jan–15 Aug 1947 = 227 days → 3; total 5 → Friday. | Agrees |
| a116 | rea_arrange | An arrow initially points North. In step 1 it turns 45° clockwise, in  | C — East | 45 + 90 + 135 + 180 = 450° = 90° clockwise from north → east. | Agrees |
| a118 | rea_arrange | A wall clock shows 4:20. What time will its image in a plane mirror (p | B — 7:40 | 11:60 − 4:20 = 7:40. | Agrees |
| a119 | rea_arrange | The mirror image of a clock shows the time as 9:15. What is the actual | C — 2:45 | 11:60 − 9:15 = 2:45. | Agrees |
| b6 | rea_logic | Statements: Some tables are chairs. Some chairs are fans. | D — Either I or II follows | Some + Some gives nothing; I and II are complementary → either. | Agrees |
| b8 | rea_logic | Statements: All pencils are pens. No pen is a rubber. | B — Both I and II follow | All + No → no pencil is a rubber; the E-statement converts → both. | Agrees |
| b9 | rea_logic | Statement: Ravi scored 95% in Mathematics this year, whereas last year | D — Only II follows | Improvement is stated; "worked harder" guesses the cause → only II. | Agrees |
| b10 | rea_logic | Statement: The government has increased the tax on cigarettes by 50%. | B — Only I follows | Price rise is the likely effect; "every smoker quits" is extreme → only I. | Agrees |
| b12 | rea_logic | Statement: Only candidates holding a graduate degree can apply for the | A — Only I follows | Necessary condition gives I; eligibility ≠ selection → only I. | Agrees |
| b18 | rea_logic | Statement: Should students be given homework daily? | B — Only I is strong | Revision value is strong; teachers' convenience is weak → only I. | Agrees |
| b21 | rea_logic | Statement: Many people in a colony are suffering from dengue. | D — Only I follows | Fogging treats the cause; permanent evacuation is extreme → only I. | Agrees |
| b22 | rea_logic | Statement: The number of road accidents on a highway has increased due | C — Only I follows | Speed checks fit the cause; closing forever is extreme → only I. | Agrees |
| b23 | rea_logic | Statement: A large number of students of a school failed in Mathematic | A — Only I follows | Remedial classes help; dropping the subject is no solution → only I. | Agrees |
| b27 | rea_logic | Which Venn diagram best represents the relationship among Doctors, Sur | B — Surgeons lie wholly inside D | Every surgeon is a doctor; teachers separate. | Agrees |
| b28 | rea_logic | Which Venn diagram best represents the relationship among Pen, Pencil  | A — Pen and Pencil as two separa | Pen and pencil are disjoint, both stationery. | Agrees |
| b29 | rea_logic | In a class of 50 students, 30 play cricket, 25 play football and 10 pl | D — 5 | 50 − (30 + 25 − 10) = 5. | Agrees |
| b31 | rea_logic | In a survey of 120 students, 70 like tea, 60 like coffee and 30 like b | C — 70 | (70 − 30) + (60 − 30) = 70. | Agrees |
| b34 | rea_logic | If + means ×, × means −, − means ÷ and ÷ means +, then the value of 12 | A — 39 | 12 × 3 − 5 ÷ 5 + 4 = 36 − 1 + 4 = 39. | Agrees |
| b38 | rea_logic | If 2 # 3 = 8, 4 # 5 = 24 and 6 # 7 = 48, then 8 # 9 = ? | A — 80 | a(b + 1): 2 × 4, 4 × 6, 6 × 8 → 8 × 10 = 80. | Agrees |
| b40 | rea_logic | If + means ÷, − means ×, × means + and ÷ means −, then 36 + 9 − 4 × 5  | A — 18 | 36 ÷ 9 × 4 + 5 − 3 = 16 + 2 = 18. | Agrees |
| b44 | rea_nonverbal | A square has both its diagonals drawn and also the two lines joining t | C — 16 | 8 smallest + 4 (two on each side) + 4 half-squares = 16. | Agrees |
| b46 | rea_nonverbal | An equilateral triangle has each side divided into 4 equal parts, and  | C — 27 | Upright 10 + 6 + 3 + 1 = 20; inverted 6 + 1 = 7 → 27. | Agrees |
| b54 | rea_nonverbal | A standard die (opposite faces add up to 7) rests on a table with 3 on | A — 14 | 21 − (3 + 4) = 14. | Agrees |
| b55 | rea_nonverbal | A standard die (opposite faces add up to 7) shows 1 on top, 2 facing y | B — 4 | Rolling right brings the left face (7 − 3 = 4) to the top. | Agrees |
| b59 | rea_nonverbal | A cube net has two rows of three squares. The upper row has squares 1, | D — 5 | Runs of three: 1–3 and 4–6 opposite → 2–5. | Agrees |
| b67 | rea_nonverbal | A wooden cube has only its four vertical side faces painted (top and b | A — 3 | Only the centre column (3 cubes) touches no painted side. | Agrees |
| b71 | rea_nonverbal | Which word will look exactly the same in its water image (reflection i | A — CHOICE | C, H, O, I, C, E are all symmetric about a horizontal axis. | Agrees |
| b77 | rea_nonverbal | A square sheet of side 16 cm is folded in half along a vertical line,  | A — 4 cm × 8 cm | 16 × 16 → 8 × 16 → 8 × 8 → 4 × 8. | Agrees |

Result: 59 of 60 keys agreed with my own solution; 1 wrong key (Mohan's shadow) fixed.
