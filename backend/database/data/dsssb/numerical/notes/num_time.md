# Time & Work, Pipes, Speed–Distance, Trains, Boats, Mixtures

**In 30 seconds**
- 16 of the 76 numerical questions in the 2023–24 DSSSB TGT CS papers: average speed ⭐ (3, each with an unknown speed x), trains ⭐ (3), pipes with an outlet ⭐ (3), mixtures of two or three solutions ⭐ (3), time & work ⭐ (2), boats ⭐ (1), a usual-speed equation ⭐ (1).
- Work = rate × time. Take the **total work = LCM of the days**, then rates become whole numbers.
- Efficiency: "B is 33⅓% less efficient than A" → B's rate = 2/3 of A's ⭐.
- Pipes: inlet rate +, outlet / leak rate −; "part filled" = net rate × hours ⭐.
- Average speed = **total distance ÷ total time** — never the mean of the speeds ⭐.
- Trains: distance = length of train + length of the bridge / platform / tunnel / other train ⭐; km/h × 5/18 = m/s.
- Boats: downstream = b + s, upstream = b − s; b = (D + U)/2, s = (D − U)/2 ⭐.
- Mixtures: track the **quantity of each liquid**; alligation gives the mixing ratio (dearer − mean) : (mean − cheaper) ⭐.

## 1. Time and work ⭐

| Idea | Formula |
|---|---|
| One day's work | If A finishes in a days, A does 1/a per day |
| Together | 1/T = 1/a + 1/b (two people: T = ab/(a + b)) |
| Total-work method | Total work = LCM of the days; each rate = total/days |
| Efficiency | Rate ∝ efficiency; time ∝ 1/efficiency |
| "x% more efficient" | Rate × (100 + x)/100; time × 100/(100 + x) |
| Man-days | M₁D₁H₁/W₁ = M₂D₂H₂/W₂ |
| Pairs given (A + B, B + C, C + A) ⭐ | A + B + C = half the sum of the pair rates |
| Wages | Shared in the ratio of work done (rates × days) |
| Someone leaves k days before the end ⭐ | Let total time T: the leaver works T − k days |

**Worked example ⭐ (DSSSB, June 2023).** A does a work in 14 days; B is 33⅓% less efficient. They start together, A leaves 2 days before the end. Total time?
A = 1/14 per day; B = 2/3 × 1/14 = 1/21. (T − 2)/14 + T/21 = 1 → 3T − 6 + 2T = 42 → T = 48/5 = **9 3/5 days**.
**Shortcut:** total work = 42 units → A = 3, B = 2 per day. Pretend A also worked the last 2 days: extra 6 units → 48 = 5T → T = 9.6.

**Worked example ⭐ (DSSSB, Feb 2024).** X + Y take 60 days, Y + Z 90 days, X + Y + Z 45 days. X + Z?
Total work 180 units: X + Y = 3, Y + Z = 2, X + Y + Z = 4 → Z = 1, X = 2 → X + Z = 3 → **60 days**.
**Shortcut:** LCM of the given days as total work turns every rate into an integer.

**Worked example.** A + B = 8 days, B + C = 12, C + A = 24. Total 24 units: 3 + 2 + 1 = 6 = 2(A + B + C) → A + B + C = 3 per day → **8 days**.

**Worked example.** A + B = 12 days, A alone 20. B alone: 1/12 − 1/20 = 2/60 = 1/30 → **30 days**.
**Shortcut:** B = ab/(b − a) form: 12 × 20/(20 − 12) = 30.

**Worked example.** 12 men finish in 18 days. 9 men take 12 × 18/9 = **24 days**.

**Worked example.** A is twice as efficient as B; together 14 days. A = 2, B = 1 unit/day → work = 42 → B alone **42 days**.

**Worked example.** A (12 days) and B (18 days) earn ₹3,000 together. Rates 3 : 2 → A gets **₹1,800**.

## 2. Pipes and cisterns ⭐

| Idea | Formula |
|---|---|
| Inlet fills in a hours | +1/a per hour |
| Outlet / leak empties in b hours | −1/b per hour |
| Both open (a < b) | Fills in ab/(b − a) hours |
| Leak makes filling time t → T | Leak empties in tT/(T − t) |
| Part filled in h hours | h × net rate ⭐ |
| Pipe closed after h hours | Work done by all in h hours + rest by remaining pipes ⭐ |

**Worked example ⭐ (DSSSB, June 2023).** A fills in 20 h; B empties in 40 h. Both open for 30 h, then B is closed. Total time?
Net = 1/20 − 1/40 = 1/40 → in 30 h, 3/4 filled. Rest 1/4 by A in 5 h. Total **35 h**.
**Shortcut:** tank = 40 units: A = +2, B = −1 → 30 h × 1 = 30 units; 10 left ÷ 2 = 5 h.

**Worked example ⭐ (DSSSB, June 2023).** A and B fill in 18 and 27 h; C is an outlet. All open for 15 h → 5/36 filled. C empties one-third in?
A + B = 5/54. Net = (5/36)/15 = 1/108. C = 5/54 − 1/108 = 9/108 = 1/12 → full in 12 h → one-third in **4 h**.

**Worked example ⭐ (DSSSB, June 2023).** A fills in 40 h, B in x h, C empties in 10 h. All open: 1/6 emptied in 4 h. x?
Net emptying = 1/24 per hour → 1/10 − 1/40 − 1/x = 1/24 → 1/x = 3/40 − 1/24 = 1/30 → **x = 30**.

**Worked example.** A pipe fills in 15 h; with a leak, 20 h. Leak alone empties in 15 × 20/5 = **60 h**.

**Worked example.** A, B, C together fill in 6 h. After 2 h C is closed and A + B take 7 more hours. C alone?
Done 1/3; A + B = (2/3)/7 = 2/21; C = 1/6 − 2/21 = 1/14 → **14 h**.

## 3. Speed, time and distance ⭐

| Idea | Formula |
|---|---|
| Basic | Distance = speed × time |
| Units | km/h × 5/18 = m/s; m/s × 18/5 = km/h |
| Average speed ⭐ | Total distance ÷ total time |
| Equal distances at x and y | 2xy/(x + y) |
| Equal distances at x, y, z | 3xyz/(xy + yz + zx) |
| Equal times at x and y | (x + y)/2 |
| Relative speed | Same direction: difference; opposite: sum |
| Speed ratio a : b (same distance) | Time ratio b : a |
| At a/b of usual speed, late by t ⭐ | Usual time = t × a/(b − a) |
| Late t₁ at speed s₁, early t₂ at speed s₂ | Distance = s₁s₂(t₁ + t₂)/(s₂ − s₁) |

**Worked example ⭐ (DSSSB, June 2023).** 45 min at 80 km/h, 40 min at 48 km/h, 35 min at x km/h; average 72¼ km/h. x?
Distances 60 + 32 = 92 km. Total time 2 h → total distance 144.5 km → 35x/60 = 52.5 → **x = 90**.
**Shortcut:** when times are given, average speed = time-weighted mean: (45 × 80 + 40 × 48 + 35x)/120 = 72.25.

**Worked example ⭐ (DSSSB, June 2023).** 180 km at 45, 150 km at 50, 120 km at x; average 47 7/19 = 900/19 km/h. x?
Total time = 450 ÷ 900/19 = 9.5 h. 4 + 3 + 120/x = 9.5 → 120/x = 2.5 → **x = 48**.
**Shortcut:** convert the mixed fraction to an improper fraction at once (47 7/19 = 900/19).

**Worked example ⭐ (DSSSB, June 2023).** P → Q at 50, Q → R at 60, PQ : QR = 1 : 2, then R → P at 45. Average speed?
PQ = d, QR = 2d, RP = 3d. Time = d/50 + 2d/60 + 3d/45 = (3 + 5 + 10)d/150 = 3d/25. Distance 6d → **50 km/h**.
**Shortcut:** choose d = LCM-friendly 150 km: times 3 + 5 + 10 = 18 h for 900 km → 50.

**Worked example ⭐ (DSSSB, Feb 2024).** A truck leaves 8 h early and, to reach 600 km on time, goes 20 km/h slower. Usual speed?
600/(v − 20) − 600/v = 8 → v² − 20v − 1500 = 0 → **v = 50 km/h**.
**Shortcut:** test options: v = 50 → 600/30 − 600/50 = 20 − 12 = 8 ✓.

**Worked example.** Home → office at 40, back at 60: 2 × 40 × 60/100 = **48 km/h**.

**Worked example.** At 5/6 of his usual speed a man is 12 min late. Usual time = 12 × 5/(6 − 5) = **60 min**.

**Worked example.** At 4 km/h he is 5 min late, at 5 km/h 10 min early. Distance = 4 × 5 × (15/60)/(5 − 4) = **5 km**.

**Worked example.** A thief 200 m ahead runs at 10 km/h, the policeman at 11 km/h. Catch-up time = 0.2 km ÷ 1 km/h = 0.2 h → thief runs **2 km**.

**Worked example.** Equal thirds of a trip at 30, 40, 60 km/h → 3 ÷ (1/30 + 1/40 + 1/60) = 3 × 120/9 = **40 km/h** (not 43⅓).

## 4. Trains ⭐

| Train passes … | Distance covered |
|---|---|
| A pole / standing man / signal | Length of train L |
| A platform / bridge / tunnel of length P ⭐ | L + P |
| Another train (length M) | L + M, at relative speed |
| A man walking at speed m | L, at (train ± man) speed |

**Worked example ⭐ (DSSSB, June 2023).** A train passes bridges of 900 m and 420 m in 75 s and 50 s. Length?
Speed is the same: (L + 900)/75 = (L + 420)/50 → 50L + 45000 = 75L + 31500 → **L = 540 m**.
**Shortcut:** speed = difference of lengths ÷ difference of times = 480/25 = 19.2 m/s → L = 19.2 × 50 − 420 = 540.

**Worked example ⭐ (DSSSB, June 2023).** A train passes a 200 m tunnel in 36 s and a pole in 20 s. Time for 333 km?
16 s extra for 200 m → 12.5 m/s = 45 km/h → 333/45 = **7.4 h**.

**Worked example ⭐ (DSSSB, Feb 2024).** A 210 m train at 54 km/h crosses a 390 m platform: 600 m ÷ 15 m/s = **40 s**.
**Shortcut:** 36 km/h = 10 m/s, 54 = 15, 72 = 20, 90 = 25, 108 = 30 m/s.

**Worked example.** Trains 140 m and 160 m in opposite directions at 60 and 40 km/h: 300 m ÷ (100 × 5/18) = **10.8 s**.

**Worked example.** Trains 100 m and 150 m, same direction, 72 and 54 km/h: relative 5 m/s → 250/5 = **50 s**.

**Worked example.** A 110 m train passes a man walking towards it at 6 km/h in 6 s: relative 110/6 m/s = 66 km/h → train **60 km/h**.

**Worked example.** At 54 km/h a train takes 12 s to pass a man and 20 s to cross a platform → L = 180 m, L + P = 300 m → **P = 120 m**.

## 5. Boats and streams ⭐

| Idea | Formula |
|---|---|
| Downstream speed D | b + s |
| Upstream speed U | b − s |
| Boat in still water | b = (D + U)/2 ⭐ |
| Stream | s = (D − U)/2 |
| Round trip of distance d | d/D + d/U |
| Same distance, times t₁ (down) and t₂ (up) | b : s = (t₂ + t₁) : (t₂ − t₁) |

**Worked example ⭐ (DSSSB, June 2023).** Upstream speed is 40% of downstream. 15 km up and 15 km down take 4⅔ h. Speed in still water?
U = 0.4D → 15/(0.4D) + 15/D = 52.5/D = 14/3 → D = 11.25, U = 4.5 → b = 15.75/2 = **7 7/8 km/h**.
**Shortcut:** U : D = 2 : 5; let D = 5k, U = 2k → 15/2k + 15/5k = 10.5/k = 14/3 → k = 2.25.

**Worked example.** Still water 15 km/h, stream 5 km/h; 60 km down and back: 60/20 + 60/10 = **9 h**.

**Worked example.** 18 km down in 2 h and 12 km up in 2 h → D = 9, U = 6 → stream **1.5 km/h**.

**Worked example.** Rowing 6 km/h in still water, stream 2 km/h, round trip 3 h: d/8 + d/4 = 3 → **d = 8 km**.

**Worked example.** 30 km up + 44 km down = 10 h; 40 km up + 55 km down = 13 h. With u = 1/U, v = 1/D: 30u + 44v = 10, 40u + 55v = 13 → D = 11, U = 5 → **b = 8 km/h**.
**Shortcut:** make the upstream terms equal (× 4 and × 3) and subtract.

## 6. Mixtures and alligation ⭐

| Idea | Formula |
|---|---|
| Rule of alligation | Cheaper : Dearer = (Dearer − Mean) : (Mean − Cheaper) |
| Mixing solutions ⭐ | Add the quantity of each component separately |
| Water to add for a new ratio ⭐ | Keep the solute fixed: required water − present water |
| Repeated replacement (x litres of V, n times) | Pure left = V(1 − x/V)^n |
| Milkman sells at cost price and gains g% | Water : milk = g : 100 |
| Equal quantities of a : b and c : d mixed | Make each total the same (LCM), then add |

**Worked example ⭐ (DSSSB, June 2023).** A has acid : water = 2 : 5, B has 6 : 7. 7 L of A + 9 L of B. Acid in 312 mL of the mix?
Acid = 2 + 9 × 6/13 = 80/13 L in 16 L → fraction 5/13 → 312 × 5/13 = **120 mL**.
**Shortcut:** when the answer is asked for a sample, find the acid fraction of the whole mix first.

**Worked example ⭐ (DSSSB, June 2023).** A spirit : water 3 : 4, B 5 : 9. 5 L of A + 6 L of B. In 462 mL of it, how much water makes the ratio 1 : 2?
Spirit = 15/7 + 15/7 = 30/7, water = 20/7 + 27/7 = 47/7 → 30 : 47 (77 parts). In 462 mL: spirit 180, water 282. Need water 360 → add **78 mL**.

**Worked example ⭐ (DSSSB, June 2023).** A, B, C have alcohol : water 3 : 7, 4 : 11, 2 : 3. 4 L + 5 L + 3 L mixed. Alcohol %?
1.2 + 4/3 + 1.2 = 3.733 L in 12 L → **≈ 31%**.

**Worked example.** Rice at ₹40 and ₹55 mixed to be worth ₹46: (55 − 46) : (46 − 40) = 9 : 6 = **3 : 2**.
**Shortcut:** draw the cross — the difference on the opposite side gives each share.

**Worked example.** 40 L of milk : water = 3 : 1. Water to make it 3 : 2: milk 30 fixed → water should be 20 → add **10 L**.

**Worked example.** 60 L of milk; 12 L replaced by water twice → 60 × (4/5)² = **38.4 L** milk.

**Worked example.** Equal amounts of 2 : 3 and 3 : 4 milk–water mixtures: take 35 of each → milk 14 + 15 = 29, water 21 + 20 = 41 → **29 : 41**.

**Worked example.** A milkman sells mixture at cost price of milk and gains 20% → water : milk = 20 : 100 = **1 : 5**.

## Exam traps
1. Average speed is total distance ÷ total time; 40 and 60 average to 48, not 50 ⭐.
2. A train crossing a platform covers its own length **plus** the platform ⭐.
3. Always convert km/h to m/s (× 5/18) when lengths are in metres and time in seconds ⭐.
4. "33⅓% less efficient" means 2/3 of the rate, so 1.5 times the time ⭐.
5. An outlet's rate is subtracted even when the question says "pipes A, B and C" together ⭐.
6. In a mixture, add quantities of each component — never add or average the ratios ⭐.
7. Upstream speed is b − s; a boat cannot have upstream speed above the still-water speed.
8. When someone "leaves k days before completion", the leaver works T − k days, the others T days ⭐.

## One-liners for revision
1. Work rate = 1/days.
2. Two together: ab/(a + b).
3. Total work = LCM of days ⭐.
4. Time ∝ 1/efficiency.
5. 33⅓% less efficient → rate × 2/3 ⭐.
6. M₁D₁H₁/W₁ = M₂D₂H₂/W₂.
7. A + B + C = half of the sum of pairs.
8. Wages ∝ work done.
9. Leaver works T − k days ⭐.
10. Inlet +, outlet − ⭐.
11. Fill a, empty b: ab/(b − a).
12. Leak time = tT/(T − t).
13. Part filled = net rate × time ⭐.
14. km/h × 5/18 = m/s ⭐.
15. 54 km/h = 15 m/s; 72 km/h = 20 m/s.
16. Average speed = total distance/total time ⭐.
17. Equal distances: 2xy/(x + y).
18. Three equal distances: 3xyz/(xy + yz + zx).
19. Equal times: simple mean.
20. Same direction: subtract speeds.
21. Opposite direction: add speeds.
22. Speed ratio a : b → time ratio b : a.
23. a/b of usual speed, late t → usual time = ta/(b − a).
24. Usual-speed equations: test the options ⭐.
25. Train + pole: L ⭐.
26. Train + platform: L + P ⭐.
27. Two bridges: speed = Δlength/Δtime ⭐.
28. Two trains: L₁ + L₂ at relative speed.
29. Downstream b + s ⭐.
30. Upstream b − s ⭐.
31. b = (D + U)/2 ⭐.
32. s = (D − U)/2.
33. Alligation: (dearer − mean) : (mean − cheaper) ⭐.
34. Mixing solutions: add components ⭐.
35. Water to add: keep solute fixed ⭐.
36. Replacement: V(1 − x/V)^n.
37. Water free → its cost is 0 in alligation.
38. Milkman gain g% → water : milk = g : 100.
39. Equal quantities: equalise totals before adding.
40. Read "closest to" — compute to one decimal ⭐.

## Quick self-check
1. A 14 days, B 33⅓% less efficient, A leaves 2 days early. Total time? — **9 3/5 days.**
2. X + Y 60, Y + Z 90, X + Y + Z 45 days. X + Z? — **60 days.**
3. Fill 20 h, empty 40 h, both 30 h then fill alone. Total? — **35 h.**
4. 40 km/h out, 60 km/h back — average? — **48 km/h.**
5. 180 km at 45, 150 at 50, 120 at x; average 900/19. x? — **48.**
6. Train passes 900 m and 420 m bridges in 75 s and 50 s. Length? — **540 m.**
7. 210 m train at 54 km/h, 390 m platform. Time? — **40 s.**
8. Upstream = 40% of downstream; 15 km each way in 4⅔ h. Still-water speed? — **7 7/8 km/h.**
9. 7 L of 2 : 5 + 9 L of 6 : 7 acid solution; acid in 312 mL? — **120 mL.**
10. Rice ₹40 and ₹55 to make ₹46 — ratio? — **3 : 2.**
