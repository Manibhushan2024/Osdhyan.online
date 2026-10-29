# Non-verbal Reasoning (Figures, Dice, Cubes, Paper Folding)

**In 30 seconds**
- The 2023–24 TGT CS papers asked **no** picture-based question (0 of 61), but other DSSSB papers and the syllabus include them. Learn the formulas below: each question then takes 20–40 seconds, and every figure here is described in words.
- Counting: points on a base with one apex → C(p, 2) triangles; n × n grid → 1² + 2² + … + n² squares; m × n grid → C(m + 1, 2) × C(n + 1, 2) rectangles.
- Dice: a standard die has opposite faces adding to 7. Numbers seen together with a face are its neighbours; the one never seen with it is opposite. Two positions sharing two faces → the third faces are opposite.
- Rolling a die: the face on the side you roll **towards** goes to the bottom, and the face on the far side comes to the top (roll right → the left face comes up).
- Painted cube cut into n³: 8 corners (3 faces), 12(n − 2) edges (2 faces), 6(n − 2)² centres (1 face), (n − 2)³ hidden (0 faces).
- Paper folding: k folds → 2^k layers; one punch → 2^k holes. A cut on the fold opens into a full shape centred on the fold line.
- Mirror (vertical): order reversed, each letter flipped left–right; letters A H I M O T U V W X Y look the same. Water image: order kept, letters flipped top–bottom; B C D E H I K O X look the same.
- Clock in a mirror: 11:60 − time (see the Clock section of the arrangement chapter).

## 1. Counting figures

| Figure (in words) | Rule | Worked example |
|---|---|---|
| Triangle with lines from the apex to the base | p points on the base (including both corners) → C(p, 2) = p(p − 1) ÷ 2 triangles | 3 lines from A divide BC into 4 parts → 5 points → C(5, 2) = **10**. |
| Same, plus h lines parallel to the base | Each horizontal line (base included) gives C(p, 2) | 5 points and 1 extra parallel line → 2 × 10 = **20**. |
| Square with both diagonals | 4 small + 4 half-squares | **8** triangles. |
| Square with both diagonals and both mid-lines | 8 small + 4 (two small on each side) + 4 half-squares | **16** triangles. |
| Equilateral triangle, each side cut into n equal parts, lines parallel to the sides | n = 2 → 5; n = 3 → 13; n = 4 → 27 (formula: floor of n(n + 2)(2n + 1) ÷ 8) | n = 3: upright 6 + 3 + 1 = 10, inverted 3 → **13**. |
| Regular pentagon with all 5 diagonals (star inside) | Standard result | **35** triangles. |
| Squares in an n × n grid | 1² + 2² + … + n² = n(n + 1)(2n + 1) ÷ 6 | 4 × 4 → 16 + 9 + 4 + 1 = **30**. Chessboard 8 × 8 → **204**. |
| Squares in an m × n grid (m ≤ n) | Sum of (m − k + 1)(n − k + 1) for k = 1 … m | 2 × 4 → 8 + 3 = **11**. |
| Rectangles (including squares) in an m × n grid | C(m + 1, 2) × C(n + 1, 2) | 3 × 3 → 6 × 6 = **36**. 2 × 4 → 3 × 10 = **30**. |
| Line segments among p points on one line | C(p, 2) | 5 points → **10**. |
| Straight lines through p points, no three in a line | C(p, 2) | 6 points → **15** lines. |

Counting drill when no formula fits: label every corner with a letter, count the smallest pieces, then pieces made of 2 parts, 3 parts, and so on. Write the list; never count by eye.

## 2. Dice

### Facts

| Fact | Detail |
|---|---|
| Standard die | Opposite faces add to 7: 1–6, 2–5, 3–4 |
| Side faces of a standard die | Always total 21 − 7 = **14** |
| Visible faces | In one position you see 3 faces that meet at a corner; all three are mutually adjacent |
| A face's neighbours | Every face except itself and its opposite (4 neighbours) |

### Finding the opposite face

| Method | Worked example |
|---|---|
| Neighbour rule: collect every number seen with X; the one never seen is opposite X | Positions show (1, 2, 3), (1, 3, 6), (1, 6, 5) → 1 is seen with 2, 3, 6, 5 → **4** is opposite 1. |
| Ring rule: around a face the four neighbours form a ring; faces two steps apart in the ring are opposite | Around 1 the ring order is 2–3–6–5 (3 touches 2 and 6; 6 touches 5) → 2 opposite **6**, 3 opposite **5**. |
| Two common faces: if two positions show the same two faces, the two different faces are opposite | Position 1 shows 1, 2, 3; position 2 shows 1, 2, 6 → **3 and 6** are opposite (the two corners lie at the two ends of the edge between 1 and 2). |
| Same top, turned about the vertical axis | Position 1: 2 top, 5 front, 1 right; position 2: 2 top, 6 front, 3 right → a quarter turn would bring 1 or the left face to the front, so the turn was 180°: back = **6** (opposite 5), left = **3** (opposite 1). |
| Standard-die shortcut | Which number can never touch 4? Its opposite, 7 − 4 = **3**. |

### Rolling a die

| Roll direction | What comes to the top | Worked example (start: 1 top, 2 front, 3 right) |
|---|---|---|
| To the right (top goes to the right side) | The left face | Left = 7 − 3 = **4** on top. |
| To the left | The right face | **3** on top. |
| Away from you (top goes to the back) | The front face | **2** on top. |
| Towards you | The back face | Back = 7 − 2 = **5** on top. |

### Cube nets (six squares, described in words)

| Net shape | Opposite pairs | Worked example |
|---|---|---|
| Row of four with one square above and one below (cross / T shape) | In the row of four, 1st–3rd and 2nd–4th are opposite; the square above and the square below are opposite, wherever along the row they are attached | Row A B C D, E above B, F below B → A–C, B–D, **E–F**. Row P Q R S, T above P, U below S → **T–U**. |
| Two rows of three, offset by two squares (staircase) | In each straight run of three, the end squares are opposite; the two middle squares are opposite | Upper 1 2 3, lower 4 5 6 starting under 3 → 1–3, 4–6, **2–5**. |
| Any straight run of three squares | The first and third squares are opposite | In a run X Y Z, **X–Z**. |

Rule of thumb: two squares that touch in the net are always neighbours on the cube; squares separated by exactly one square in a straight line are opposite.

## 3. Cube cutting and painting

### All six faces painted, cube cut into n × n × n

| Small cubes with | Formula | n = 3 | n = 4 | n = 5 | n = 6 |
|---|---|---|---|---|---|
| 3 faces painted (corners) | 8 | 8 | 8 | 8 | 8 |
| 2 faces painted (edges) | 12(n − 2) | 12 | 24 | 36 | 48 |
| 1 face painted (face centres) | 6(n − 2)² | 6 | 24 | 54 | 96 |
| 0 faces painted (core) | (n − 2)³ | 1 | 8 | 27 | 64 |
| Total | n³ | 27 | 64 | 125 | 216 |

Check: the four rows always add to n³ (n = 4: 8 + 24 + 24 + 8 = 64).

| Variant | Method | Worked example |
|---|---|---|
| Work backwards | Solve the formula for n | 96 cubes have one face painted → 6(n − 2)² = 96 → n = 6 → two-face cubes = 12 × 4 = **48**. |
| Side length given | n = big side ÷ small side | 10 cm cube cut into 2 cm cubes → n = 5 → unpainted (n − 2)³ = **27**. |
| Cuboid a × b × c | Unpainted = (a − 2)(b − 2)(c − 2); one face on an a × b face = (a − 2)(b − 2) | 5 × 4 × 3 → unpainted 3 × 2 × 1 = **6**. 4 × 3 × 2 → one-face = 2 × (2 × 1) = **4**. |
| Two colours on opposite pairs | Red–green edges = 4 (each red face meets each green face) × (n − 2) | Red, green, blue on opposite pairs, n = 5 → red-and-green-only cubes = 4 × 3 = **12**. |
| Only one colour on one face | (n − 2)² per face | n = 4, two red faces → only-red cubes = 2 × 4 = **8**. |
| Only the four side faces painted | Top view: inner (n − 2)² columns are unpainted for every layer | n = 3 → centre column of 3 cubes → **3** unpainted. |
| Minimum cuts for n³ equal cubes | 3(n − 1) | 64 cubes (n = 4) → **9** cuts. |
| Maximum pieces from k straight cuts parallel to faces | Split k into three nearly equal parts a, b, c → (a + 1)(b + 1)(c + 1) | 7 cuts → 2, 2, 3 → 3 × 3 × 4 = **36**. |

## 4. Paper folding and cutting

| Situation (in words) | Rule | Worked example |
|---|---|---|
| Punch through a folded sheet | Holes = punches × 2^folds | Folded twice, one punch → **4** holes; folded three times, two punches → **16**. |
| Cut on the folded edge | The cut and its mirror image join across the fold into one shape | A semicircle cut on the fold opens into **one full circle** on the fold line; a triangle with its base on the fold opens into a **diamond (rhombus)**. |
| Cut at the corner where two fold lines meet | That corner is the centre of the original sheet | Quarter-circle cut there → **one circle at the centre**. |
| Cut at the corner opposite the fold corner | That corner holds all four original corners | One cut removes **all four corners**. |
| Fold once, hole near one corner | The hole is mirrored across the fold | Right half onto left, hole near top-left → holes near **top-left and top-right**. |
| Fold along a diagonal | Holes are mirrored across that diagonal | Square folded along one diagonal, then in half again → one punch makes **4** holes, symmetric about both diagonals. |
| Creases when a strip is folded k times in the same direction | 2^k sections → 2^k − 1 creases | 3 folds → 8 sections → **7** creases. |
| Size after folds | Each fold halves one side | 16 × 16 → vertical fold 8 × 16 → horizontal 8 × 8 → vertical **4 × 8**. |

Method for "where are the holes": unfold one fold at a time, in the reverse order, mirroring every hole across that fold line.

## 5. Mirror and water images

| Fact | Detail |
|---|---|
| Vertical mirror (to the right or left) | Order of letters reversed; each letter flipped left–right |
| Water image (reflection below) | Order of letters kept; each letter flipped upside down |
| Letters unchanged in a vertical mirror | A H I M O T U V W X Y (11 letters) |
| Letters unchanged in a water image | B C D E H I K O X |
| Letters unchanged in both | H I O X |
| Digits | 0 and 8 look the same in both; 1 (a plain stroke) too |

| Question form | Method | Worked example |
|---|---|---|
| Word that looks the same in a mirror | Palindrome built only from mirror-symmetric letters | MOM, WOW, TOOT ✓; DAD ✗ (D flips), NUN ✗ (N flips). |
| Word that looks the same in water | All letters from B C D E H I K O X; order unchanged, so no palindrome needed | CHOICE, HIDE, BOOK ✓; BRAVE ✗ (R, A, V flip). |
| Count symmetric letters | Tally from the list | EXAMINATION → X, A, M, I, A, T, I, O = **8** look the same in a vertical mirror. |
| Mirror image of a code | Reverse the order, flip each character | "AB12" in a vertical mirror reads as the flipped characters 2, 1, B, A from left to right. |
| Clock in a mirror | 11:60 − time | 4:20 → **7:40**; 6:00 and 12:00 look unchanged. |
| Clock in water | 18:30 − time (subtract 12 if above 12:59) | 2:00 → 4:30. |

## 6. Figure series written in words

| Pattern | Rule | Worked example |
|---|---|---|
| Rotation by growing angles | Add all turns; reduce by 360° | Arrow at north turns 45°, 90°, 135°, 180° clockwise → total 450° = 90° → **east**. |
| Fixed turn per step | k steps × angle | East, 90° anticlockwise each step, 5 steps → 450° = 90° → **north**. |
| Element moving around corners | Track one corner and its source | Letters on a square's corners move one corner clockwise each step; the top-left corner receives the bottom-left letter → after 3 steps it shows the letter that started at top-right. |
| Moving 1, 2, 3 … places | Cumulative sum, reduce by the number of places | Octagon vertices 1–8, star at 1, 2, 4, 7 → next +4 → 11 − 8 = **3**. |
| Shading moving k boxes in a ring | Box in figure f = start + k × (f − 1), minus the number of boxes as often as needed | 5 boxes, shading moves 2 each figure from box 1 → 1, 3, 5, 2, 4, **1** (figure 6). |
| Sides increasing | Count sides | Triangle, square, pentagon … the 6th figure is an octagon with **8** sides. |

## 7. Embedded figures, completion and grouping (concepts)

| Type | What to look for |
|---|---|
| Figure completion | The missing quarter mirrors the opposite quarter (symmetry about the centre lines). |
| Embedded figure | The small shape appears inside the big one in the **same size and orientation**. |
| Grouping | Put figures with the same number of sides, lines or dots together. |
| Odd figure | Count sides, dots, lines and angles; the odd one breaks one count. |

These need drawings, so text-based papers rarely ask them; know the ideas for the odd picture question.

## Exam traps
1. **Counting only the smallest pieces**: a 4 × 4 grid has 30 squares, not 16; a chessboard has 204, not 64.
2. **Squares vs rectangles**: in a 3 × 3 grid there are 14 squares but 36 rectangles.
3. **Dice that are not standard**: use the 7-rule only when the question says opposite faces add to 7; otherwise use the neighbour or common-face rule.
4. **Rolling direction**: rolling to the right brings the LEFT face to the top, not the right face.
5. **Cube formulas need n ≥ 2**: for a 2 × 2 × 2 cut every cube is a corner (8 cubes, 3 faces each).
6. **Cuboids with a side of 2**: (2 − 2) = 0, so those faces have no one-face cubes.
7. **Cut on the fold**: produces ONE combined shape, not two separate holes.
8. **Water image keeps the letter order**; only the mirror image reverses it. MOM is mirror-proof; CHOICE is water-proof.

## One-liners for revision
1. Apex lines: p base points → C(p, 2) triangles.
2. Square with both diagonals: 8 triangles.
3. Square with diagonals and mid-lines: 16 triangles.
4. Triangle cut 3 ways on each side: 13 triangles.
5. Triangle cut 4 ways on each side: 27 triangles.
6. Pentagon with all diagonals: 35 triangles.
7. Squares in n × n grid: sum of squares 1² to n².
8. 4 × 4 grid: 30 squares.
9. Chessboard: 204 squares.
10. Rectangles in a 3 × 3 grid: 36.
11. Rectangles in m × n: C(m + 1, 2) × C(n + 1, 2).
12. Segments among 5 points on a line: 10.
13. Standard die: opposite faces add to 7.
14. Side faces of a standard die total 14.
15. Never seen together → opposite.
16. Two common faces → the other two are opposite.
17. Ring of four around a face: alternate faces are opposite.
18. Roll right → left face comes up.
19. Roll away → front face comes up.
20. Net row of four: 1st–3rd and 2nd–4th opposite.
21. Squares above and below the row are opposite.
22. Straight run of three: ends opposite.
23. Painted cube: 8 corner cubes always.
24. Two faces painted: 12(n − 2).
25. One face painted: 6(n − 2)².
26. No face painted: (n − 2)³.
27. n = 4: 8, 24, 24, 8.
28. n = 5: 8, 36, 54, 27.
29. Cuboid unpainted: (a − 2)(b − 2)(c − 2).
30. Minimum cuts for n³ cubes: 3(n − 1).
31. 7 cuts give at most 36 pieces.
32. k folds → 2^k layers.
33. Holes = punches × 2^folds.
34. Cut on the fold → one whole shape on the fold line.
35. Strip folded 3 times → 7 creases.
36. Mirror-symmetric letters: A H I M O T U V W X Y.
37. Water-symmetric letters: B C D E H I K O X.
38. Symmetric both ways: H I O X.
39. Mirror clock = 11:60 − time; water clock = 18:30 − time.
40. Rotations: add the angles, then reduce by 360°.

## Quick self-check
1. A triangle has 4 lines from the apex to the base. How many triangles? — **15** (6 base points → C(6, 2)).
2. Squares in a 5 × 5 grid? — **55** (25 + 16 + 9 + 4 + 1).
3. Rectangles in a 2 × 3 grid? — **18** (C(3, 2) × C(4, 2) = 3 × 6).
4. A standard die shows 5 on top. Sum of the four side faces? — **14**.
5. Positions show (6, 2, 3), (6, 3, 4), (6, 4, 5). Which number is opposite 6? — **1** (never seen with 6).
6. A painted cube is cut into 27 cubes. How many have exactly two faces painted? — **12**.
7. A painted cube cut into 343 small cubes: how many have no paint? — **125** (n = 7, 5³).
8. Paper folded in half 4 times, one punch. Holes? — **16**.
9. Which word looks the same in a vertical mirror: TOT, TOP, POT, OPT? — **TOT**.
10. An arrow points south and turns 90° clockwise 3 times. Where does it point? — **East** (270° clockwise from south = 90° anticlockwise).
