# Blood Relations, Direction, Ranking, Clock & Calendar

**In 30 seconds**
- Ranking ⭐ (5 PYQs): **total = left + right − 1**; position from the other end = total − position + 1; in an interchange question the new position of one person is the old position of the other.
- Coded blood relations ⭐ (3 PYQs): decode one symbol at a time from left to right, draw a small family tree in words (generation 1, 2, 3), mark gender only when the clue gives it.
- Direction ⭐: right turn = 90° clockwise, left turn = 90° anticlockwise. Add up north–south and east–west movements separately, then use Pythagoras (6-8-10, 5-12-13).
- Shadows ⭐: morning sun is in the east, so shadows fall **west**; evening shadows fall **east**. Shadow on your left in the morning → you face north; in the evening → you face south.
- Comparison ordering ⭐: write each clue as a chain with ">", then merge chains; "older than only O" means second from the bottom.
- Linear arrangement ⭐: number the seats 1 to n, place the definite clues (ends, "third to the right of") first, then the conditional ones.
- Clock: angle = |30H − 5.5M|; hands meet every 65 5/11 minutes; mirror time = 11:60 − time. Calendar: odd days (100 years = 5, 200 = 3, 300 = 1, 400 = 0); 0 = Sunday.
- Budget: 30 seconds for ranking and direction, 60 for a coded family chain or a seating puzzle.

## 1. Ranking and position in a row ⭐

| Situation | Formula | Worked example |
|---|---|---|
| Total from two ends | Total = L + R − 1 | Neha is 7th from the left and 12th from the right → 7 + 12 − 1 = **18**. |
| Other end | R = Total − L + 1 | 13th from the right in a row of 40 → 40 − 13 + 1 = **28th** from the left ⭐. |
| k places to the right | New L = L + k | Rohit is 40th from the right in 80 → 41st from the left; Ram is 15 to his right → **56th** ⭐. |
| "x places behind/above" in a class ⭐ | Same arithmetic on ranks | Ramesh is 15th from the top, 3 places behind Arvind → Arvind 12th; class of 50 → 50 − 12 + 1 = **39th** from the bottom ⭐. |
| People between two (no overlap) | Total − (L of A + R of B) | 40 students; Aman 14th from left, Bharat 18th from right → Bharat is 23rd from left; between = 23 − 14 − 1 = **8**. |
| Interchange ⭐ | After swapping, A's new place = B's old place | Raj 9th from top, Amit 14th from bottom; after swapping Raj is 19th from top → Amit's old place = 19th from top and 14th from bottom → 19 + 14 − 1 = **32**. |
| Interchange plus a third person ⭐ | Fix the swapped position using the third person, then use total = L + R − 1 | Sham (34th from left) is 5th to the left of Khalid's new place → Khalid now 39th from left = Kapil's old place, 29th from right → 39 + 29 − 1 = **67** ⭐. |
| Minimum people (positions may overlap) | Try both orders; the overlapping order gives the minimum | A is 10th from left, B 15th from right, 4 people between them. A left of B: 10 + 4 + 15 = 29. B left of A: B is 10 − 5 = 5th from left → 5 + 15 − 1 = **19** (minimum). |

Language check: "behind" or "below" in ranks means a **larger** rank number; "ahead" or "above" means a smaller one.

## 2. Comparison ordering ⭐

| Method | Worked example |
|---|---|
| Write every clue as a chain with ">" (taller, heavier, older), then join chains through common letters | R lighter than P but heavier than Q → P > R > Q. T heavier than P → T > P. U lighter than Q → Q > U; S lighter than U → U > S. Merged: **T > P > R > Q > U > S**; heaviest T ⭐. |
| "Older than only X" = second youngest; "younger than only X" = second oldest | L is older than only O → O youngest, L second youngest. With M > J > K > N > L > O, the third oldest is **K**. |
| If a person's place cannot be fixed, the answer must not depend on that person | If R is known only to be younger than S, never pick R for "third youngest" unless every placement gives R. |

## 3. Linear and circular seating ⭐

| Rule | Detail |
|---|---|
| Facing north | Your left = left end of the row. Facing south: reversed. |
| "Immediate right" | Next seat, no one between. "Second to the right" = one person between. |
| Place definite clues first | Ends, fixed positions, "third to the right of X". Then neighbours. Then "not" clues. |
| Circle facing the centre | Left = clockwise, right = anticlockwise. Facing outward: the opposite. |
| Two cases | If a clue allows two places, draw both; drop the case that breaks a later clue. |

Worked example (row, facing north): six friends P–U. R is at the left end. T is third to the right of R. P is the immediate right of T. S is second to the left of P. Q is not at an end. → R = 1, T = 4, P = 5, S = 3, Q = 2 (not an end), U = 6. **U is at the right end.**

DSSSB form ⭐: Q is second from the left and immediately left of R; S immediately right of R; P at the right end; T and P are neighbours of U → V(1) Q(2) R(3) S(4) T(5) U(6) P(7); immediate left of P = **U**.

## 4. Blood relations

### Relation glossary

| Clue | Relation | Clue | Relation |
|---|---|---|---|
| Father's brother | Paternal uncle (chacha/tau) | Mother's brother | Maternal uncle (mama) |
| Father's sister | Paternal aunt (bua) | Mother's sister | Maternal aunt (mausi) |
| Father's brother's wife | Paternal aunt (chachi) | Mother's brother's wife | Maternal aunt (mami) |
| Brother's / sister's son | Nephew | Brother's / sister's daughter | Niece |
| Uncle's or aunt's child | Cousin | Son's wife | Daughter-in-law |
| Wife's / husband's father | Father-in-law | Wife's brother; sister's husband | Brother-in-law |
| Father's father | Paternal grandfather | Mother's father | Maternal grandfather |
| Son's son | Grandson | Daughter's daughter | Granddaughter |

Collapse rules: "my father's only son" = me (if I am male); "my mother's only daughter" = me (if I am female); "my grandfather's only son" = my father (paternal side); "my brother's father" = my father.

### Pointing / photograph questions

| Method | Worked example |
|---|---|
| Start from the end of the sentence ("my …") and move backwards | "He is the son of my mother's only son" (Meena speaking) → mother's only son = Meena's brother → his son = Meena's **nephew**. |
| Use the "no brother or sister" clue to collapse | "I have no brother or sister, but that man's father is my father's son" → my father's son = me → that man is **my son**. |
| A woman and "only daughter of my mother" | "His mother is the only daughter of my mother" → his mother is the speaker herself → she is his **mother**. |

### Coded relations ⭐

| Method | Worked example |
|---|---|
| Decode each symbol between two letters; write generation levels (same, up one, down one) | P $ Q = P mother of Q; P * Q = P brother of Q; P % Q = P father of Q. X % Y * Z $ W → X father of Y; Y brother of Z (so Z is also X's child); Z mother of W → X is W's **maternal grandfather**. |
| Gender comes only from the symbol on that person | In "A # B @ C & D # E" ⭐ (# brother, @ father, & sister): A is B's brother; B is father of C; C, D, E are siblings → A is E's **paternal uncle**. |
| In-law chains | A + B husband, A − B wife, A × B mother, A ÷ B son. S ÷ T + U × V − W → S son of T; T husband of U; U mother of V; V wife of W → T is V's father → T is W's **father-in-law** (wife's father) ⭐. |
| Simple chain ⭐ | A + B brother, A − B sister, A × B father: P × Q − R + S → P father of Q; Q sister of R; R brother of S → P is **father** of S. |

Trap check: "A is the sister of B" says A is female but says nothing about B's gender. "Son" and "daughter" fix the child's gender only.

## 5. Direction and distance ⭐

### Turns

| Turn | Rule | Worked example |
|---|---|---|
| Right | 90° clockwise | Facing north, turn right → east. |
| Left | 90° anticlockwise | Facing south, turn left → east (your left hand points east when you face south). |
| About turn | 180° | Facing north-east → south-west. |
| Degree turns | Add clockwise, subtract anticlockwise | Facing east; 90° clockwise → south; then 135° anticlockwise → 45° past east → **north-east**. |
| Net rotation | Sum all turns, reduce by 360° | Arrow at north turns 45°, 90°, 135°, 180° clockwise = 450° = 90° → **east**. |

Compass in degrees from north, clockwise: N 0°, NE 45°, E 90°, SE 135°, S 180°, SW 225°, W 270°, NW 315°.

### Distance

| Method | Worked example |
|---|---|
| Net displacement: add north–south and east–west separately | 5 km east, 3 km north, 5 km west → east–west cancels → **3 km north**. |
| Pythagoras for the straight-line distance | 8 km north and 6 km east → √(64 + 36) = **10 km north-east**. |
| Coordinates for long walks | Start (0, 0): 10 m south → (0, −10); left (east) 8 → (8, −10); left (north) 4 → (8, −6) → distance 10 m, **south-east**. |
| Relative position | A is 5 m east of B, C is 5 m north of B, D is 5 m west of C → D (−5, 5), A (5, 0) → D is **north-west** of A. |

Pythagorean triples to remember: 3-4-5, 6-8-10, 5-12-13, 8-15-17, 7-24-25, 9-12-15, 20-21-29.

Direction labels: if both coordinates are non-zero, the answer is an in-between direction (north-east, south-west …) even when the two distances differ.

### Shadows ⭐

| Time | Sun | Shadow falls |
|---|---|---|
| Morning (after sunrise) | East | West |
| Evening (before sunset) | West | East |
| Noon | Overhead | Almost no shadow — not used in questions |

| Shadow is on your… | Morning: you face | Evening: you face |
|---|---|---|
| Front | West | East |
| Back | East | West |
| Left | North | South |
| Right | South | North |

Worked examples:
- Morning, shadow of a pole falls on Mohan's right → west is on his right → he faces **south**.
- Morning, the coach's shadow falls exactly in front of Messi ⭐ → the shadow points west, Messi is west of the coach facing him → Messi faces **east**.
- Evening ⭐: X faces the right-hand side of the shadow direction. Shadow points east; right of east is south → X faces south. Then right (west) 20, right (north) 10, left (west) 10, right (north) 20, right (east) 30 → west 30 − east 30 = 0; north 30 → **30 m north** ⭐.

## 6. Clock

| Fact / formula | Worked example |
|---|---|
| Angle = \|30H − 5.5M\| (take 360 − angle if above 180) | 3:30 → \|90 − 165\| = **75°**. 4:20 → \|120 − 110\| = **10°**. 7:20 → \|210 − 110\| = **100°**. |
| Hands together between H and H + 1: M = 60H ÷ 11 | Between 4 and 5: 240 ÷ 11 = **21 9/11** minutes past 4. |
| Hands opposite (180°): 5.5M = 30H + 180 (or 30H − 180) | Between 4 and 5: 5.5M = 300 → **54 6/11** minutes past 4. |
| Right angle (90°): 5.5M = 30H ± 90 | Between 4 and 5: M = 30 ÷ 5.5 = 5 5/11 or 210 ÷ 5.5 = **38 2/11** minutes. |
| Minute hand gains 5.5° per minute on the hour hand | They meet every 720 ÷ 11 = **65 5/11** minutes. |
| In 24 hours | Hands together 22 times; opposite 22 times; at right angles 44 times. |
| Gaining / losing clock | Gains 2 min per hour, set right at 6 a.m. → at the true 6 p.m. it shows 6:24 p.m. |
| Mirror image (vertical mirror) | Mirror time = 11:60 − actual. 4:20 → **7:40**; 9:15 in the mirror → actual **2:45**. For 11:00–12:59 use 23:60 − time (12:20 → 11:40). |
| Times that look the same in a mirror | 6:00 and 12:00 (hands on the vertical axis). |
| Water image (reflection below) | 18:30 − time; if the result is above 12:59, subtract 12. 2:00 → 16:30 → **4:30**. |

## 7. Calendar

| Fact | Detail and worked example |
|---|---|
| Odd days | Days left after removing complete weeks. Ordinary year = 1, leap year = 2. |
| Century odd days | 100 years = 5, 200 = 3, 300 = 1, 400 = 0. |
| Day code | 0 Sunday, 1 Monday, 2 Tuesday, 3 Wednesday, 4 Thursday, 5 Friday, 6 Saturday. |
| Leap year | Divisible by 4; a century year only if divisible by 400 (1900 no, 2000 yes). |
| Month odd days | 31-day month = 3; 30-day month = 2; February = 0 (1 in a leap year). |
| Same date next year | Moves 1 day forward, or 2 if 29 February falls in between. 15 Aug 2026 Saturday → 15 Aug 2027 **Sunday** → 15 Aug 2028 **Tuesday**. |
| Forward counting from a known day | 26 Jan 2026 is Monday. Days to 15 Aug: 5 + 28 + 31 + 30 + 31 + 30 + 31 + 15 = 201 = 28 weeks + 5 → **Saturday**. |
| Odd-day method for old dates | 15 Aug 1947: 1600 years → 0; 300 → 1; 46 years (11 leap) → 57 → 1; 1 Jan–15 Aug 1947 = 227 days → 3. Total 5 → **Friday**. |
| Repeating calendars | Add the odd days year by year until the total is a multiple of 7, and the leap status matches. 2026 → same calendar in **2037**; a leap year such as 2024 → **2052** (28 years). |
| Century first/last day | First day of a century can only be Monday, Tuesday, Thursday or Saturday; the last day can only be Sunday, Monday, Wednesday or Friday. |
| 1 January 2026 | **Thursday** (2025 began on Wednesday and was not a leap year). |

## Exam traps
1. **Ranks "behind"** ⭐: 3 places behind means a larger number (Ramesh 15th, Arvind 12th), not 18th.
2. **Interchange** ⭐: after a swap, use the OTHER person's old position; adding the two old positions is wrong.
3. **Left when facing south** ⭐: your left hand points east. Most direction errors come from turning as if you always face north.
4. **Shadow side** ⭐: in the morning a shadow on the RIGHT means you face SOUTH, not north; in the evening a shadow on the right means you face north.
5. **Gender not given**: "D is the child of C" does not make D a son. Options like "son/daughter" may both be wrong if the gender is unknown; pick the gender-free relation if one is offered.
6. **Maternal vs paternal** ⭐: the father's brother is a paternal uncle; the mother's brother is a maternal uncle. Coded chains usually test exactly this.
7. **Clock angle above 180°**: 30H − 5.5M can give 200°; the smaller angle is 360 − 200 = 160°.
8. **Century leap rule**: 1900 had no 29 February; 2000 did. Odd days for 100 years = 5, not 6.

## One-liners for revision
1. Total in a row = left + right − 1 ⭐.
2. From the other end = total − position + 1 ⭐.
3. Interchange: new place of A = old place of B ⭐.
4. "Behind" in rank = bigger number ⭐.
5. People between = difference of positions − 1.
6. Minimum persons: let the positions overlap.
7. "Older than only X": second youngest.
8. Merge ">" chains through common letters ⭐.
9. Facing north: left is west; facing south: left is east.
10. Circle facing centre: left = clockwise.
11. Place definite clues first in seating ⭐.
12. Father's brother = paternal uncle ⭐.
13. Mother's brother = maternal uncle (mama).
14. Mother's brother's wife = mami.
15. Brother's son = nephew; brother's daughter = niece.
16. Wife's father = father-in-law ⭐.
17. "My father's only son" = me (male speaker).
18. "My mother's only daughter" = me (female speaker).
19. Coded chains: decode left to right, one symbol at a time ⭐.
20. Sister of B says nothing about B's gender.
21. Right turn = 90° clockwise.
22. Left turn = 90° anticlockwise.
23. NE = 45°, SE = 135°, SW = 225°, NW = 315°.
24. Add N–S and E–W separately.
25. 6-8-10 and 5-12-13 triples.
26. Morning: shadow falls west ⭐.
27. Evening: shadow falls east ⭐.
28. Morning shadow on the left → facing north.
29. Evening shadow on the left → facing south.
30. Clock angle = |30H − 5.5M|.
31. Hands meet every 65 5/11 minutes.
32. Between 4 and 5, hands meet at 21 9/11 past 4.
33. Hands coincide 22 times a day; right angle 44 times.
34. Mirror time = 11:60 − actual.
35. Water image = 18:30 − actual.
36. Odd days: 100 years 5, 200 years 3, 300 years 1, 400 years 0.
37. Ordinary year shifts a date by 1 day; leap crossing by 2.
38. 15 August 1947 was a Friday.
39. 15 August 2026 is a Saturday.
40. A non-leap year's calendar often repeats after 11 years (2026 → 2037).

## Quick self-check
1. Kiran is 15th from the top and 25th from the bottom. Class size? — **39**.
2. In a row of 50, Kajal is 8th to the left of Rashmi, who is 25th from the left. Kajal from the right? — **34th** (Kajal 17th from left; 50 − 17 + 1).
3. Facing west, a man turns 135° anticlockwise. Direction now? — **South-east** (west 270° − 135° = 135°).
4. Walk 12 m north, 5 m east. Distance from the start? — **13 m** (5-12-13), north-east.
5. Evening; your shadow falls behind you. Which way do you face? — **West**.
6. "She is the wife of my mother's only brother." Relation? — **Maternal aunt (mami)**.
7. If A @ B = A is the father of B and A $ B = A is the sister of B, what is X in "X $ Y @ Z"? — **Z's paternal aunt (bua)**.
8. Angle at 9:30? — **105°** (|270 − 165|).
9. Mirror shows 3:25. Actual time? — **8:35** (11:60 − 3:25).
10. If 1 January 2026 is a Thursday, what day is 1 January 2027? — **Friday** (2026 is not a leap year).
