# Review log — questions_a.json (101) and questions_b.json (99)

Reviewer pass, 2026-10-29. A random sample of 60 of the 200 questions (Python `random.seed(20261029)`, `random.sample(range(200), 60)` over a + b in file order) was re-solved independently: each stem was solved from scratch in a short Python script (exact fractions where needed, no look at the key or explanation), the computed value was matched to the option text, and then compared with `answer_index`. All other questions were read through once by hand with their working checked against the explanation.

## Result
- Items re-solved independently: 60 (28 from questions_a, 32 from questions_b)
- Keys changed: 0 — every sampled key matched the independent answer and exactly one option carried that value
- Keys found wrong in the hand read of the remaining 140: none
- Structural checks on all 200: valid JSON; fields exactly chapter_key, subtopic, difficulty, question_en, options, answer_index, explanation_en, pyq_concept; 4 distinct options each; answer_index in 0–3
- Duplicates: no exact duplicate (stem + options); near-matches flagged by a similarity scan are distinct questions sharing a DI table or an identity pattern (e.g. sec θ + tan θ = 4 asking sec θ − tan θ vs sin θ)
- Answer balance: A 50, B 50, C 50, D 50 (per file 25/25/25/26 and 25/25/25/24; per chapter 8–9 each). Balancing only swapped options in new questions or in questions whose options are not an ordered list; explanations quote values, never option letters
- Difficulty: easy 49, medium 108, hard 43
- Chapters: num_number 33, num_percent 34, num_time 34, num_algebra 33, num_geometry 33, num_data 33

## Source of the 200
- 158 re-keyed from gen/num_arith.json (120) and gen/num_adv.json (70). Left out (32): A20, A27, A28, A30, A31, A34, A36, A37, A40, A43, A44, A46, A52, A113, A115, A117, A118 (num_percent over-supply: trivial one-step items or overlaps with the statistics chapter) and A60, A63, A68, A74, A76, A77, A84, A90, A92, A95, A96, A98, A109, A110, A111 (num_time over-supply: one-step conversions and repeated patterns). Indices are 0-based positions in num_arith.json.
- 42 new: 9 num_number, 3 num_percent, 1 num_time, 9 num_algebra, 8 num_geometry, 12 num_data — each modelled on a 2023–24 PYQ concept with new numbers; every value was worked out by hand and re-computed in Python before writing.

## Sampled questions (file + 0-based index)
| Item | Chapter | Subtopic | Key | Independent re-solve |
|---|---|---|---|---|
| a3 | num_number | Number system – greatest number divisible | (C) 9996 | confirmed |
| a10 | num_number | HCF × LCM = product | (C) 180 | confirmed |
| a21 | num_number | Simplification – fractions with 'of' | (C) 24 | confirmed |
| a22 | num_number | Simplification – BODMAS with fractions | (D) 5/8 | confirmed |
| a25 | num_number | HCF – same remainder | (B) 62 | confirmed |
| a26 | num_number | LCM – remainder with divisibility | (C) 17 | confirmed |
| a31 | num_number | Simplification – BODMAS | (D) 16 | confirmed |
| a33 | num_percent | Percentage – successive change | (C) 4% decrease | confirmed |
| a34 | num_percent | Percentage – population growth | (B) 30,250 | confirmed |
| a37 | num_percent | Percentage – "more than / less than" | (A) 16 2/3% | confirmed |
| a46 | num_percent | Average – replacement | (B) 85 kg | confirmed |
| a47 | num_percent | Profit & loss – cost price from loss | (D) ₹800 | confirmed |
| a50 | num_percent | Profit & loss – equal selling prices | (D) Loss of 4% | confirmed |
| a51 | num_percent | Profit & loss – articles bought and sold | (C) 20% | confirmed |
| a54 | num_percent | Compound interest – annual | (D) ₹2,100 | confirmed |
| a57 | num_percent | Compound interest – principal from amount | (C) ₹5,000 | confirmed |
| a59 | num_percent | CI and SI – from SI to CI | (A) ₹512.50 | confirmed |
| a62 | num_percent | Problems on ages – present ages | (A) 46 years | confirmed |
| a65 | num_percent | Variation – direct and inverse | (B) 15 | confirmed |
| a66 | num_percent | Compound interest – equal instalments | (A) ₹12,100 | confirmed |
| a69 | num_time | Time & work – combined work | (B) 8 days | confirmed |
| a71 | num_time | Time & work – wages | (A) ₹1,800 | confirmed |
| a72 | num_time | Time & work – one person leaves | (C) 15 days | confirmed |
| a74 | num_time | Pipes & cisterns – inlet and outlet together | (C) 7.5 minutes | confirmed |
| a78 | num_time | Pipes & cisterns – pipe closed midway | (D) 14 hours | confirmed |
| a80 | num_time | Speed – late and early arrival | (B) 60 minutes | confirmed |
| a89 | num_time | Trains – crossing a platform | (C) 120 m | confirmed |
| a92 | num_time | Boats & streams – round trip | (D) 9 hours | confirmed |
| b0 | num_algebra | Algebra – x + 1/x identities | (C) 23 | confirmed |
| b2 | num_algebra | Algebra – identities | (B) 58 | confirmed |
| b5 | num_algebra | Algebra – quadratic equations | (B) 13 | confirmed |
| b7 | num_algebra | Algebra – linear equations | (A) 5 | confirmed |
| b11 | num_algebra | Algebra – x + 1/x identities | (A) 14 | confirmed |
| b12 | num_algebra | Trigonometry – standard angle values | (C) 1 | confirmed |
| b13 | num_algebra | Trigonometry – ratios from one ratio | (B) 3/5 | confirmed |
| b16 | num_algebra | Trigonometry – complementary angles | (A) 24° | confirmed |
| b20 | num_algebra | Trigonometry – identities | (B) 15/17 | confirmed |
| b23 | num_algebra | Trigonometry – heights and distances | (C) 10√3 m | confirmed |
| b24 | num_algebra | Algebra – surds √(a ± 2√b) | (B) 2√5 | confirmed |
| b27 | num_algebra | Algebra – linear equations | (A) 1350 | confirmed |
| b28 | num_algebra | Algebra – remainder theorem | (B) 3 | confirmed |
| b30 | num_algebra | Trigonometry – identities | (D) 1/2 | confirmed |
| b32 | num_algebra | Trigonometry – heights and distances | (B) 60√3 m | confirmed |
| b35 | num_geometry | Geometry – angles of a triangle | (A) 80° | confirmed |
| b37 | num_geometry | Geometry – circles | (A) 5 cm | confirmed |
| b47 | num_geometry | Mensuration – rectangle | (B) 25 cm | confirmed |
| b48 | num_geometry | Mensuration – rhombus | (A) 40 cm | confirmed |
| b62 | num_geometry | Mensuration – cone (cost of painting) | (C) 9856 m³ | confirmed |
| b66 | num_data | Data interpretation – table (pass percentage) | (D) T | confirmed |
| b67 | num_data | Data interpretation – table (pass percentage) | (A) 79.8% | confirmed |
| b72 | num_data | Data interpretation – table (production) | (C) 50% | confirmed |
| b74 | num_data | Data interpretation – table (production) | (D) 32.4 thousand | confirmed |
| b76 | num_data | Data interpretation – table (production) | (C) 31.6% | confirmed |
| b77 | num_data | Data interpretation – table (production) | (B) 1 | confirmed |
| b80 | num_data | Statistics – mode | (A) 3 | confirmed |
| b83 | num_data | Statistics – corrected mean | (A) 59 | confirmed |
| b86 | num_data | Statistics – range and standard deviation | (B) 2√2 | confirmed |
| b87 | num_data | Data interpretation – percentage profit (income and expenditure) | (B) ₹300 crore | confirmed |
| b93 | num_data | Data interpretation – table (average) | (C) 161 | confirmed |
| b95 | num_data | Statistics – combined mean | (B) 64 | confirmed |
