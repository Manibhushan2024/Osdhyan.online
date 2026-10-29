# Arithmetical & Numerical Ability (Section A) for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT candidate who wants SHORT, exact notes that cover all of Section A Arithmetical & Numerical Ability and lets them solve a question in under a minute. Plain English; formula tables, one worked example per formula, one shortcut per formula.
Exam: 20 numerical questions per paper (Section A, common to all DSSSB posts). 1 mark each, −0.25 per wrong answer. Level: SSC CGL Tier-1 — two or three steps, clean numbers, fractions and π = 22/7.

## Owner's syllabus rows
| key | chapter | syllabus line | Q/paper (2023–24 average) |
|---|---|---|---|
| num_number | Number System, LCM–HCF & Simplification | number system, divisibility, remainders, HCF/LCM, BODMAS, fractions, decimals, surd-free simplification | 2–3 |
| num_percent | Percentage, Ratio, Average, Ages, Profit–Loss, SI–CI | percentage, ratio & proportion, variation, partnership, average, ages, profit–loss–discount, simple & compound interest, instalments | 8–9 |
| num_time | Time & Work, Pipes, Speed–Distance, Trains, Boats, Mixtures | time & work, pipes & cisterns, speed–time–distance, average speed, trains, boats & streams, mixture & alligation | 4 |
| num_algebra | Algebra & Trigonometry Basics | identities, surds, linear/quadratic basics, trigonometric ratios, identities, heights & distances | 0–1 |
| num_geometry | Geometry & Mensuration | lines, triangles, circles; area and perimeter; cube, cuboid, cylinder, cone, sphere, hemisphere; melting & recasting | 2–3 |
| num_data | Data Interpretation & Statistics | tables and graphs written out in text, percentage profit DI, mean, median, mode, range | 1 |

## What the 4 official DSSSB TGT CS papers (2023–24) actually asked — 76 numerical questions
File: `numerical/numerical_pyq_analysis.json` (subtopic starts with the chapter key in brackets). READ IT. (The pack builder looks for `pyq_file` in `backend/database/data/dsssb/`; copy it there before running `build-subject-pack.py numerical`.)
- **Percentage, ratio, P&L, interest (35)**: percentage comparison (A is x% more than B and y% less than C), successive change, "8 times more", exam marks, population growth; profit & loss (selling at a fraction of SP, CP from loss %), successive discounts with an unknown x% (then a single discount of 2x% or 3x%); SI (amounts for two periods → rate; varying rates; instalments), CI (3 years, 2-year CI−SI, two equal instalments annual and half-yearly); partnership with capitals in a fractional ratio changed after 4 or 6 months (3 questions); direct–inverse variation (3); ages (2); ratio (2); average correction (1).
- **Time, work & distance (16)**: average speed with three legs and an unknown speed (3), usual-speed / early-start equation, trains crossing two bridges / tunnel and pole / platform, pipes with an outlet and a pipe closed after some hours, time & work with efficiency and a person leaving early, X+Y, Y+Z, X+Y+Z combinations, boats with upstream = 40% of downstream, mixtures of two or three solutions (acid/spirit/alcohol) and water to add.
- **Number system & simplification (10)**: long BODMAS fractions with 'of' and recurring decimals (4), HCF of differences — same remainder (3), divisibility by 88 / 9, LCM with remainder and divisible by 23, basic HCF.
- **Geometry & mensuration (10)**: cones recast into a sphere, cylinder = cone volume → curved surface, cylinder inscribed in a sphere, cone from painting cost, cylinder TSA → sphere, circular ring inside a square, circumcircle of a right triangle (28–45–53), rhombus → rectangle, % change in cuboid surface area, rectangle from area.
- **Data interpretation (3)**: percent-profit line graph (income/expenditure), production–export table.
- **Algebra (2)**: √(a + 2√b) − √(a − 2√b) surds. **Trigonometry and statistics: 0 in 2023–24**, but both are in the syllabus and in other DSSSB posts' papers — keep them short.

## Chapters (use these exact keys and titles)
| key | chapter title |
|---|---|
| num_number | Number System, LCM–HCF & Simplification |
| num_percent | Percentage, Ratio, Average, Ages, Profit–Loss, SI–CI |
| num_time | Time & Work, Pipes, Speed–Distance, Trains, Boats, Mixtures |
| num_algebra | Algebra & Trigonometry Basics |
| num_geometry | Geometry & Mensuration |
| num_data | Data Interpretation & Statistics |

## Question files
- `questions_a.json` — num_number 33, num_percent 34, num_time 34. `questions_b.json` — num_algebra 33, num_geometry 33, num_data 33. 200 in all.
- Source: 158 questions re-keyed from `gen/num_arith.json` and `gen/num_adv.json` (32 easy or overlapping items left out to balance the chapters) + 42 new questions modelled on the 2023–24 PYQ concepts (variation, partnership, CI instalments, three-leg average speed, surds, HCF same remainder, LCM + divisibility, cones → sphere, cylinder in sphere, ring area, circumcircle, percent-profit DI, production–sales DI, combined mean).
- Fields as in `ga/questions_static_a.json`: chapter_key, subtopic, difficulty, question_en, options[{en}], answer_index, explanation_en (numeric working), pyq_concept (true when the concept was asked in 2023–24).
- Review log: `review.md`.

## Rules
Every number must be exact; show the working in each explanation. Use π = 22/7 unless the answer is in terms of π. Every notes file: "**In 30 seconds**" (6–8 bullets) → formula tables, each formula with a worked DSSSB-level example and a shortcut → "## Exam traps" (8) → "## One-liners for revision" (40) → "## Quick self-check" (10 Q&A); ⭐ where the concept was asked in 2023–24.
