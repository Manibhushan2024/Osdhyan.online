# Non-verbal Reasoning (text-safe): DSSSB TGT Revision Notes

## 1. One-page summary

- Expect 3–6 questions out of 20 reasoning questions. Typical types: counting figures, dice, cube cutting and painting, mirror or water images, paper folding and punching, matrix coding, figure series.
- Most of these have a formula or a fixed rule. Learn the formulas and you can answer in under 30 seconds.
- Draw a rough sketch on the rough sheet for dice, folding and figure questions. A 5-second sketch prevents most errors.
- Negative marking is 0.25. Counting questions are the riskiest; if you are unsure, check with the formula.

## 2. Counting figures

| Figure | Formula / count |
|---|---|
| n points on a straight line | Line segments = n(n − 1)/2 |
| Triangle with lines from one vertex to the opposite side, making k points on that side (including both ends) | k(k − 1)/2 triangles |
| Same, with h horizontal lines (including the base) cutting all of them | h × k(k − 1)/2 |
| Square with both diagonals | 8 triangles |
| Square with both diagonals and both mid-lines | 16 triangles |
| Equilateral triangle divided into n rows (n² small triangles) | n = 2: 5, n = 3: 13, n = 4: 27 |
| Pentagon with all diagonals | 35 triangles |
| n × n grid of squares | Squares = 1² + 2² + … + n² = n(n + 1)(2n + 1)/6 |
| m × n grid (m ≤ n) | Squares = sum of (m − k + 1)(n − k + 1) for k = 1 to m |
| m × n grid | Rectangles (including squares) = C(m + 1, 2) × C(n + 1, 2) |

- Chessboard (8 × 8): 204 squares and 1296 rectangles.
- 4 × 4 grid: 30 squares, 100 rectangles. 3 × 3 grid: 14 squares, 36 rectangles.
- Method for irregular figures: label every point with a letter, then count triangles size by size (single regions, then two regions combined, and so on). Never count by staring at the figure.

## 3. Dice

| Rule | Detail |
|---|---|
| Standard die | Opposite faces add to 7: 1–6, 2–5, 3–4 |
| Side faces | On a standard die the four side faces always total 21 − 7 = 14 |
| Adjacent faces | Every face touches 4 faces; it never touches its opposite |
| Never seen together | If a number is shown with four different numbers in various views, the fifth (never seen with it) is opposite |
| One common face in the same position | If the other four faces seen are all different, the faces in corresponding positions are opposite (the die was turned 180°) |
| Two common faces | The third faces of the two views are opposite (they are the two faces touching both common faces) |
| Rolling right | Left face comes to the top; top goes to the right |
| Rolling away from you | Front face comes to the top; top goes to the back |

Cube nets described in words:

| Net | Opposite pairs |
|---|---|
| Row of four squares A B C D plus one above and one below | A–C, B–D, the two attached squares opposite each other |
| Row of three squares | The two end squares are opposite |
| Two rows of three (staircase) | Ends of each row are opposite; the two middles are opposite |

- In a net, two squares separated by exactly one square in a straight line are opposite. Squares that touch along an edge are adjacent.

## 4. Cube cutting and painting

A cube painted on all faces and cut into n × n × n equal cubes:

| Type of small cube | Count | n = 3 | n = 4 | n = 5 | n = 6 |
|---|---|---|---|---|---|
| Three faces painted (corners) | 8 | 8 | 8 | 8 | 8 |
| Two faces painted (edges) | 12(n − 2) | 12 | 24 | 36 | 48 |
| One face painted (face centres) | 6(n − 2)² | 6 | 24 | 54 | 96 |
| No face painted (core) | (n − 2)³ | 1 | 8 | 27 | 64 |
| Total | n³ | 27 | 64 | 125 | 216 |

- n = side of big cube ÷ side of small cube (10 cm cube into 2 cm cubes: n = 5).
- Minimum cuts for n³ pieces: 3(n − 1). 27 pieces: 6 cuts. 64 pieces: 9 cuts.
- Maximum pieces with k cuts parallel to faces: share the cuts as equally as possible among the three directions and multiply (cuts + 1). 7 cuts → 2, 2, 3 → 3 × 3 × 4 = 36.
- Cuboid a × b × c painted and cut into unit cubes: no face = (a − 2)(b − 2)(c − 2); one face = 2[(a − 2)(b − 2) + (b − 2)(c − 2) + (a − 2)(c − 2)]; two faces = 4[(a − 2) + (b − 2) + (c − 2)]; three faces = 8.
- Coloured faces: a red face meets each adjacent face along one edge. With opposite faces in the same colour, there are 4 red–green edges, each with (n − 2) cubes having only red and green.
- Only some faces painted: count from the actual geometry, do not apply the standard formulas blindly.

## 5. Paper folding and punching

| Situation | Result on unfolding |
|---|---|
| Folded k times (each halves), one punch | 2^k holes |
| Strip folded in half k times in one direction | 2^k sections, 2^k − 1 creases |
| Cut on the fold line | The cut and its mirror join: semicircle → circle, triangle → diamond |
| Cut at the corner where two folds meet | One shape at the centre of the sheet |
| Cut at the corner opposite the fold corner (folded in quarters) | All four corners of the sheet are cut |
| Single vertical fold, punch near one corner | Holes mirrored across the fold line |

- Unfold in reverse order: undo the last fold first and mirror the holes across that fold line each time.
- Paper size after folding: halve the dimension perpendicular to each fold line.

## 6. Mirror and water images

| Item | Rule |
|---|---|
| Clock mirror image | Mirror time = 11:60 − actual time (for times after 12:00, use 23:60) |
| Times unchanged in mirror | 12:00 and 6:00 |
| Vertical mirror | Left–right reversed; word order reverses |
| Water image | Top–bottom reversed; word order stays |
| Letters symmetric about a vertical line | A H I M O T U V W X Y |
| Letters symmetric about a horizontal line | B C D E H I K O X |
| Letters symmetric both ways | H I O X |

## 7. Matrix and grid coding

- Each letter has several possible codes (row then column). Check each option letter by letter; one wrong pair rejects the whole option.
- Fast method: in each option, check the letter that has the fewest possible codes, or the last letter, first.
- Watch the order stated in the question: some grids use column then row.
- Number matrices: test rows first, then columns. Common rules: a² + b², (a + b) × k, a ÷ b, a × b − c, powers down a column.

## 8. Figure series described in words

- Rotations: add all the turns, subtract multiples of 360°, then read the direction. Clockwise and anticlockwise turns cancel.
- Positions moving around a polygon with n vertices: take the total steps modulo n.
- Letters at corners moving one place clockwise: each corner receives the letter from the previous corner (anticlockwise neighbour).
- Count-based series (lines, dots, sides): check the differences, then second differences.

## 9. Fifteen quick-revision one-liners

1. Opposite faces of a standard die sum to 7.
2. The four side faces of a standard die always total 14.
3. Number never seen with X in any view is opposite X.
4. Cube cut n³: corners 8, edges 12(n − 2), faces 6(n − 2)², core (n − 2)³.
5. 27 pieces need 6 cuts; 64 pieces need 9 cuts.
6. Squares in an n × n grid = n(n + 1)(2n + 1)/6; 8 × 8 gives 204.
7. Rectangles in a 3 × 3 grid = 36.
8. Square with two diagonals = 8 triangles; add mid-lines = 16.
9. Pentagon with all diagonals = 35 triangles.
10. k folds, one punch = 2^k holes.
11. Cut on the fold doubles the shape into a symmetric whole.
12. Mirror clock time = 11:60 − given time.
13. Water image keeps word order; mirror image reverses it.
14. In a row of four net squares, alternate squares are opposite.
15. In grid coding, one wrong pair is enough to reject an option.

## 10. Five common traps

1. Using the all-faces-painted formulas when only some faces are painted. Draw the layer and count.
2. In dice, assuming the die is standard when the question does not say so. Use the views, not the 7-rule.
3. Counting only the smallest squares or triangles. Always count every size.
4. Mirror clock: subtracting from 12:00 instead of 11:60 gives wrong minutes.
5. Grid coding questions that use column-then-row order. The row-then-column option is placed as a distractor.
