# Series, Coding–Decoding & Alphabet Tests

**In 30 seconds**
- Number series: write the **differences** under the terms. If they do not settle, take differences again, then try ratios, then split into two alternate series. DSSSB 2024 asked −3, +9, −27, +81, −243 ⭐ (differences that are powers of 3 with alternating signs).
- Letter series: convert to positions (EJOTY), and for multi-letter terms solve **each column separately** ⭐ (PMT, QOW, RQZ, SSC → TUF: +1, +2, +3).
- "kth to the left of the mth from the right" ⭐: convert everything to a position from the left (N − m + 1), then add or subtract.
- Counting in a string ⭐ (even number followed by odd, not preceded by even): mark candidates first, then check both neighbours; never count in your head.
- Alphabet test ⭐: "same position as in the alphabet" = compare each letter's place in the string with its alphabet number. Meaningful word ⭐: pick the letters by number, unscramble (1, 3, 5, 8, 12, 15, 18 → CHOLERA).
- Coding ⭐: find the rule from one letter column, confirm on a second. Know six rules: shift, reverse, opposite letter, pair/half reversal, position numbers, word-to-word.
- Word-to-word codes (sky is blue = ro mi ta): the code common to two sentences belongs to the word common to them.
- Budget 30–45 seconds; series and coding are mostly easy marks.

## 1. Number series — the method ladder

| Step | Test | Worked example |
|---|---|---|
| 1 | First differences constant or regular | 3, 6, 11, 18, 27, ? → differences 3, 5, 7, 9 → next 11 → **38**. |
| 2 | Second differences | 2, 5, 12, 25, 46, ? → differences 3, 7, 13, 21 → second differences 4, 6, 8 → next 10, so difference 31 → **77**. |
| 3 | Ratios (× or ÷) | 3, 6, 12, 24, ? → × 2 → **48**. 1, 2, 6, 24, 120, ? → × 1, × 2, × 3 … → **720**. |
| 4 | × n then ± | 5, 6, 14, 45, 184, ? → × 1 + 1, × 2 + 2, × 3 + 3, × 4 + 4 → 184 × 5 + 5 = **925**. |
| 5 | Squares / cubes | 4, 9, 16, 25, ? → **36**. 2, 9, 28, 65, ? → n³ + 1 → **126**. |
| 6 | Powers in the differences ⭐ | 200, 197, 206, 179, 260, ? → −3, +9, −27, +81, next −243 → **17**. |
| 7 | Two alternate series | 2, 10, 4, 20, 6, 30, ? → odd places 2, 4, 6, even places 10, 20, 30 → **8**. |
| 8 | Each term from the previous two | 1, 1, 2, 3, 5, 8, ? → add the last two → **13**. |
| 9 | Primes | 2, 3, 5, 7, 11, ? → **13**. 4, 9, 25, 49, ? → squares of primes → **121**. |
| 10 | Mixed operation cycle | 3, 6, 4, 8, 6, 12, ? → × 2, − 2, × 2, − 2 … → **10**. |

Speed rules:
- Terms rising slowly → differences. Terms rising very fast → ratios or × n + n.
- Terms going up and down → alternating signs or two series.
- Differences 1, 2, 4, 8 → powers of 2: 2, 3, 5, 9, 17, ? → **33**.
- Differences 2, 6, 12, 20, 30 → n(n + 1).

Useful lists: squares 1–25 (… 21² = 441, 22² = 484, 23² = 529, 24² = 576, 25² = 625); cubes 1–12 (… 11³ = 1331, 12³ = 1728); powers of 2 to 2¹⁰ = 1024; powers of 3: 3, 9, 27, 81, 243, 729.

### Wrong number in a series

| Method | Worked example |
|---|---|
| Find the rule from the majority of terms, then locate the term that breaks it | 3, 7, 15, 31, 64, 127 → rule × 2 + 1: 31 × 2 + 1 = 63, so **64** is wrong. |
| Check differences; the wrong term spoils two differences next to each other | 2, 5, 10, 17, 28, 37 → differences 3, 5, 7, 11, 9 → expected 9, 11 → the term should be 26; **28** is wrong. |

## 2. Letter series ⭐

| Type | Method | Worked example |
|---|---|---|
| Single letters, constant gap | Positions, add the gap | B, E, H, K, N, ? → +3 → **Q**. |
| Growing gaps | Gaps +2, +3, +4 … | A, C, F, J, O, ? → +2, +3, +4, +5, +6 → 21 = **U**. |
| Backward | Subtract | Z, X, U, Q, L, ? → −2, −3, −4, −5, −6 → 6 = **F**. |
| Multi-letter terms ⭐ | Treat each column as its own series | PMT, QOW, RQZ, SSC, ? → P Q R S **T** (+1), M O Q S **U** (+2), T W Z C **F** (+3, wrapping) → **TUF** ⭐. |
| Mixed columns | Each column may run a different rule | AMZ, BNY, COX, ? → A B C **D**, M N O **P**, Z Y X **W** → **DPW**. |
| Pairs with growing gaps | First letters, then follow | AB, DE, HI, MN, ? → first letters 1, 4, 8, 13 (+3, +4, +5) → 19 = S → **ST**. |
| Hard columns ⭐ | Write every column as numbers, allow wrap-around | NRCH, IYNJ, FJUE, AQFB, ? → first column 14, 9, 6, 1 (−5, −3, −5, −3) → 24 = X; second 18, 25, 10, 17 (+7, −15, +7, −15) → 2 = B → answer starts **XB** (XBMW ⭐). |

Wrap-around rule: if a position goes above 26, subtract 26; if below 1, add 26. Z + 3 = 29 − 26 = 3 = C. C − 5 = −2 + 26 = 24 = X.

### Repeating-block (blank-filling) series

| Method | Worked example |
|---|---|
| Guess the block length (2, 3, 4 …) from the letters you can see, write the series in blocks, fill the gaps | ba _ ba _ bac _ ac → block "bac": bac / bac / bac / bac → blanks **c, c, b**. |
| Block may grow or rotate | abcd / bcda / cdab / ? → each block starts one letter later → **dabc**. |

## 3. Position in a given string ⭐

Formula: in a string of N items, the **mth from the right** is the **(N − m + 1)th from the left**.

| Question form | Method | Worked example |
|---|---|---|
| kth to the left of the mth from the right ⭐ | Left position = N − m + 1 − k | String of 29 letters; 11th from the right = 19th from the left; 7th to its left = 12th from the left. |
| kth to the right of the mth from the left | Left position = m + k | In the English alphabet, 7th to the right of the 12th letter (L) = 19th = **S**. |
| Middle of a string | (N + 1) ÷ 2 for odd N | A 25-letter string has its middle at the 13th place. |
| Letters between two positions | Larger − smaller − 1 | Between the 8th from the left (H) and the 8th from the right (19th, S) in the alphabet: 19 − 8 − 1 = **10**. |

Always count the string once and write N above it. Most mistakes come from miscounting N.

## 4. Counting in a number or symbol string ⭐

Method: (1) circle every item that satisfies the main condition (e.g. "even number"), (2) for each circled item check the "followed by" neighbour, (3) then the "preceded by" neighbour, (4) count the survivors.

Worked example: 4 7 9 2 5 8 3 3 6 1 7 2 9 4 5 5 — odd numbers preceded by an even number and followed by an odd number: 7 (4 before, 9 after) ✓; 5 (2 before, 8 after) ✗; 3 (8 before, 3 after) ✓; 1 (6 before, 7 after) ✓; 9 (2 before, 4 after) ✗; 5 (4 before, 5 after) ✓ → **4**. (Odd numbers that come right after another odd number are skipped at once.)

Watch the words: "immediately followed by" = the very next item; "but not immediately preceded by" = the previous item must NOT satisfy the condition. The first item has no predecessor, so "not preceded by an even number" is true for it.

## 5. Alphabet tests ⭐

| Question form | Method | Worked example |
|---|---|---|
| Letter at a position | EJOTY | 18th letter = T − 2 = **R**. |
| kth to the left of the mth from the right (alphabet) | 27 − m gives the left position | 15th from the right = 12th = L; 5th to its left = 7th = **G**. |
| Same position as in the alphabet ⭐ | Number the string 1, 2, 3 … and compare with each letter's alphabet number | ABXDEQGH: A1 ✓, B2 ✓, X3 ✗, D4 ✓, E5 ✓, Q6 ✗, G7 ✓, H8 ✓ → **6**. |
| Word letters arranged alphabetically | Sort, then compare | FRIEND → D E F I N R; only N (5th) keeps its place → **1** letter. |
| Middle letter after sorting | Sort; middle = (n + 1) ÷ 2 | DELHI → D E H I L → **H**. |
| Meaningful word from given positions ⭐ | Convert numbers to letters, then unscramble | 1, 3, 5, 8, 12, 15, 18 → A C E H L O R → CHOLERA; middle letter **L** ⭐. |
| Pairs with same gap as in the alphabet | Compare gap in the word with gap in the alphabet, both directions | STORM: S–T (1, 1), T–R (2, 2), O–M (2, 2) → **3** pairs. |
| Dictionary order | Compare letter by letter | Arrange: Bridge, Bright, Brick, Bride → Brick, Bride, Bridge, Bright. |
| Letters used once | Tally | In "EXAMINATION", letters used once: E, X, M, T, O → **5**. |

## 6. Coding–decoding: the six rules ⭐

| Rule | How to spot | Worked example |
|---|---|---|
| Constant shift | Each code letter is the same distance from its word letter | TABLE → UBCMF (+1), so CHAIR → **DIBJS**. PAPER → OZODQ (−1), so STONE → **RSNMD**. |
| Growing shift | Shifts +1, +2, +3 … | DELHI → EGOLN (+1 to +5), so PUNE → **QWQI**. |
| Reverse then shift | Code is the word backwards, shifted | FRUIT → TIURF → UJVSG (+1), so LEMON → **OPNFM**. |
| Opposite letters | Sum of positions = 27 | GREEN → G↔T, R↔I, E↔V, E↔V, N↔M → **TIVVM**. |
| Half / pair reversal ⭐ | Same letters, re-ordered in blocks | STOPWARS → POTS + SRAW ⭐; LAPTOPST → **TPALTSPO**. |
| Letters to numbers | Code is digits | BAD → 2-1-4 → **214**. CAT → 3 + 1 + 20 = **24** (sum). ACE → 1 × 3 × 5 = **15** (product). |

### Letter–digit substitution

| Method | Worked example |
|---|---|
| Line up word and code, build a key table, then read the new word from the table | DELHI = 73541, CALCUTTA = 82589662 → C8 A2 L5 U9 T6 I1 → CALICUT = **8251896**. |

### Word-to-word codes (sentence coding) ⭐

| Method | Worked example |
|---|---|
| Take two sentences at a time; the common code is the common word | "sky is blue" = ro mi ta; "blue sea deep" = la mi su; "deep sky" = ta la. 1 & 2 share "blue" and "mi"; 1 & 3 share "sky" and "ta"; 2 & 3 share "deep" and "la". In sentence 2 the remaining word "sea" = **su**. |
| Code order is usually jumbled — never assume word order = code order | "good boy" = ka pa does not mean good = ka. |

### Substitution ("is called") coding

| Method | Worked example |
|---|---|
| Find the real answer first, then give its code name | If cloud is called white, white is called rain, rain is called green, green is called air: what is the colour of milk? Milk is white, and white is called **rain**. |

### Matrix (row–column) coding

| Method | Worked example |
|---|---|
| Code = row number then column number, unless told otherwise; check every letter of each option | 3 × 3 grid: row 1 A B C, row 2 D E F, row 3 G H I. HIDE → H (3, 2), I (3, 3), D (2, 1), E (2, 2) → **32 33 21 22**. If the question says column first, the code flips to 23 33 12 22. |

### Data sufficiency with codes ⭐

If each statement codes a full word by alphabet positions (FAHAD → 6-1-8-1-4; WATER → 23-1-20-5-18), **either statement alone** reveals the rule, and the rule codes any word. If a statement only shows a jumbled code, it is not sufficient alone.

## 7. Figure series written as letters/numbers

| Pattern | Worked example |
|---|---|
| Letter + number together | A2, C4, F8, J16, ? → letters +2, +3, +4, +5 → O; numbers × 2 → **O32**. |
| Count of lines | 1, 3, 6, 10, ? lines → +2, +3, +4, +5 → **15** (triangular numbers). |

## Exam traps
1. **Miscounting the string length** ⭐: count twice before using N − m + 1; a 29-letter string read as 28 shifts every answer by one place.
2. **"Left of" vs "right of" from the right end**: moving "to the left" always lowers the left-position number, whichever end you counted from.
3. **Column-wise letter series** ⭐: solving whole terms as words (PMT → QOW) wastes time; each column follows its own rule.
4. **Wrap-around**: Z + 1 = A; in PMT-type series the third column goes T, W, Z, C, F.
5. **Reverse then shift vs shift then reverse**: same result only for a constant shift.
6. **Sentence codes**: never match by order; match only by common words.
7. **Matrix codes**: check the order (row–column or column–row) and check every letter in every option — distractors are usually wrong in only one letter.
8. **"Not preceded by"** ⭐: the condition fails only if the previous item satisfies the property; the first item of the string automatically passes it.

## One-liners for revision
1. Number series: differences, second differences, ratios, alternate terms.
2. −3, +9, −27, +81, −243: powers of 3, signs alternating ⭐.
3. 1, 2, 4, 8 differences: next term adds 16.
4. × 1 + 1, × 2 + 2, × 3 + 3: the 5, 6, 14, 45, 184 pattern.
5. Factorials: 1, 2, 6, 24, 120, 720.
6. Triangular numbers: 1, 3, 6, 10, 15, 21, 28.
7. n(n + 1): 2, 6, 12, 20, 30, 42.
8. Fibonacci: each term is the sum of the previous two.
9. Ups and downs: alternating series or alternating signs.
10. Wrong-number questions: rule from the majority, then find the breaker.
11. Letter series: convert to numbers ⭐.
12. Multi-letter terms: one column at a time ⭐.
13. PMT, QOW, RQZ, SSC → TUF ⭐.
14. A, C, F, J, O → U (+2, +3, +4, +5, +6).
15. Wrap: above 26 subtract 26, below 1 add 26.
16. mth from the right = (N − m + 1)th from the left ⭐.
17. Alphabet: mth from the right = (27 − m)th from the left.
18. Letters between positions a and b = b − a − 1.
19. Middle of an odd string = (N + 1) ÷ 2.
20. Same-position letters: number the string and compare ⭐.
21. 1, 3, 5, 8, 12, 15, 18 → CHOLERA ⭐.
22. FRIEND sorted keeps only N in place.
23. DELHI sorted: D, E, H, I, L.
24. Count-in-string questions: circle, then check neighbours ⭐.
25. TABLE → UBCMF is +1.
26. PAPER → OZODQ is −1.
27. DELHI → EGOLN is +1, +2, +3, +4, +5.
28. FRUIT → UJVSG is reverse then +1.
29. GREEN → TIVVM uses opposite letters.
30. STOPWARS → POTSSRAW is half reversal ⭐.
31. BAD = 214 by positions; CAT = 24 by sum.
32. Sentence codes: common word ↔ common code.
33. "Is called" codes: find the real answer, then its new name.
34. Letter–digit codes: build a key table first.
35. Matrix codes: row then column unless stated.
36. Data sufficiency: a full positional code in one statement is enough ⭐.
37. A2, C4, F8, J16 → O32.
38. Squares of primes: 4, 9, 25, 49, 121, 169.
39. Powers of 3: 3, 9, 27, 81, 243, 729.
40. Never spend more than 45 seconds on one series.

## Quick self-check
1. 7, 10, 16, 25, 37, ? — **52** (differences 3, 6, 9, 12, 15).
2. 2, 6, 18, 54, ? — **162** (× 3).
3. 1, 4, 3, 16, 5, 36, 7, ? — **64** (odd places 1, 3, 5, 7; even places 2², 4², 6², 8²).
4. 5, 4, 12, 3, 19, ? (ups and downs: two series) — **2** (odd places 5, 12, 19 go +7; even places 4, 3, 2 go −1).
5. D, G, J, M, ? — **P** (+3).
6. BDF, CEG, DFH, ? — **EGI** (each column +1).
7. The 9th letter to the left of the 6th letter from the right end of the alphabet? — **L** (6th from the right = 21st, U; 21 − 9 = 12).
8. If MOUSE = NPVTF, what is RAT? — **SBU** (+1).
9. If BAG = 10 (sum of positions), what is DOG? — **26** (4 + 15 + 7).
10. "pit nam lo" = "go home now", "lo ka pit" = "go there now", "nam ra" = "home sweet". Codes for "home" and "there"? — **nam** (common to sentences 1 and 3) and **ka** (left over in sentence 2 once go/now take pit/lo).
