# Number System, LCM–HCF & Simplification

**In 30 seconds**
- DSSSB asked 10 questions from this chapter in the four 2023–24 TGT CS papers: long BODMAS fractions with "of" ⭐ (4), HCF of differences for "same remainder" ⭐ (3), divisibility ⭐ (by 9 and by 88), LCM + remainder that is also divisible by a prime ⭐, and a plain HCF ⭐.
- **"of" is done before ÷ and ×** ⭐; then ÷ and × strictly from left to right; then + and −.
- Same remainder r when a, b, c are divided by the greatest n → **n = HCF(b − a, c − b)** ⭐; then r = a mod n.
- Least number leaving remainder r with x, y, z → **LCM(x, y, z) × k + r** ⭐; choose k so the extra condition (divisible by 11, 23 …) holds.
- Divisible by a composite number → test its **co-prime factors**: 72 = 8 × 9, 88 = 8 × 11 ⭐, 24 = 3 × 8.
- HCF × LCM = product of **two** numbers only.
- Unit digits repeat in a cycle of 4: divide the power by 4 and use the remainder (remainder 0 → 4th term).
- Mixed recurring decimal 0.4 7̄ = (47 − 4)/90; pure recurring 0.4̄7̄ = 47/99; 1.2̄ = 11/9 ⭐.

## 1. Types of numbers

| Type | Meaning | Examples / facts |
|---|---|---|
| Natural (N) | Counting numbers | 1, 2, 3 … (0 is not natural) |
| Whole (W) | Natural numbers + 0 | 0, 1, 2 … |
| Integers (Z) | Whole numbers and their negatives | … −2, −1, 0, 1, 2 … |
| Rational | Can be written p/q, q ≠ 0 | 3/4, −5, 0.75, 0.3̄ (terminating or recurring decimals) |
| Irrational | Non-terminating, non-recurring decimal | √2, √3, π, 0.1010010001… |
| Prime | Exactly two factors | 2, 3, 5, 7 … 2 is the only even prime; 1 is neither prime nor composite |
| Composite | More than two factors | 4, 6, 8, 9 … smallest composite is 4 |
| Co-prime | HCF = 1 (need not be prime) | (8, 15), (4, 9) |
| Twin primes | Primes differing by 2 | (3, 5), (11, 13), (17, 19) |
| Perfect number | Sum of proper factors = number | 6, 28, 496 |

- **Primes up to 100: 25** (2, 3, 5, 7, 11, 13, 17, 19, 23, 29 — 10 up to 30; 15 up to 50).
- To test if n is prime, divide by primes up to √n. Example: 221 → √221 ≈ 14.9; 221 = 13 × 17, so not prime.
- **Shortcut:** any prime greater than 3 is of the form 6k ± 1 (but not every 6k ± 1 is prime: 25, 35).

## 2. Divisibility rules ⭐

| Divisor | Rule | Quick check |
|---|---|---|
| 2 | Last digit even | 5,374 ✓ |
| 3 | Digit sum divisible by 3 | 7,341 → 15 ✓ |
| 4 | Last two digits divisible by 4 | 9,316 → 16 ✓ |
| 5 | Last digit 0 or 5 | |
| 6 | Divisible by 2 and 3 | |
| 8 | Last three digits divisible by 8 ⭐ | 7,104 → 104 = 8 × 13 ✓ |
| 9 | Digit sum divisible by 9 ⭐ | 8,595 → 27 ✓ |
| 10 | Last digit 0 | |
| 11 | (Sum of odd-place digits) − (sum of even-place digits) = 0 or multiple of 11 ⭐ | 3,685: (3 + 8) − (6 + 5) = 0 ✓ |
| 12 | Divisible by 3 and 4 | |
| 7 | Double the last digit, subtract from the rest; repeat | 343 → 34 − 6 = 28 ✓ |
| Composite (72, 88, 24, 36 …) | Split into **co-prime** factors and test each ⭐ | 72 = 8 × 9 (not 4 × 18) |

**Worked example ⭐ (DSSSB, Feb 2024).** For what value of M is 859M divisible by 9?
Digit sum = 8 + 5 + 9 + M = 22 + M. The next multiple of 9 is 27, so M = 5.
**Shortcut:** find the digit sum's remainder on 9 (22 → 4) and add what is missing (9 − 4 = 5).

**Worked example ⭐ (DSSSB, June 2023).** If 924x597y4 is divisible by 88, find the maximum of (5x − 3y).
88 = 8 × 11. For 8: 7y4 must be divisible by 8 → 704, 744, 784 → y = 0, 4 or 8.
For 11: the digits are 9, 2, 4, x, 5, 9, 7, y, 4. Odd places 9 + 4 + 5 + 7 + 4 = 29; even places 2 + x + 9 + y = 11 + x + y. The difference 18 − x − y must be 0 or a multiple of 11, so x + y = 7 (x + y = 18 would need x = y = 9, but y can only be 0, 4 or 8).
Pairs: (7, 0) → 35 − 0 = 35; (3, 4) → 15 − 12 = 3. Maximum = **35**.
**Shortcut:** fix y from the 8-test first (it has the fewest options), then use the 11-test for x.

**Worked example.** If 52x34y is divisible by 72, find the maximum of x + y.
8-test: 34y → only 344 works, so y = 4. 9-test: 5 + 2 + x + 3 + 4 + 4 = 18 + x → x = 0 or 9. Maximum x + y = 13.
**Shortcut:** for "maximum", try the largest digit (9) first in the 9-test.

## 3. Division, remainders and unit digits

| Fact | Formula |
|---|---|
| Division algorithm | Dividend = Divisor × Quotient + Remainder |
| Remainder of a sum / product | Take remainders first, then add / multiply, then take the remainder again |
| (a^n) mod m | Find a small power that leaves 1 (or −1) and break the power |
| (x^n − a^n) | Divisible by (x − a) for all n; by (x + a) for even n |
| (x^n + a^n) | Divisible by (x + a) for odd n |

**Worked example.** Remainder when 2^50 is divided by 7?
2^3 = 8 = 7 + 1 leaves 1. 2^50 = (2^3)^16 × 2^2 → 1 × 4 = **4**.
**Shortcut:** hunt for the power that gives remainder 1; the leftover power decides the answer.

**Worked example.** A number leaves remainder 27 when divided by 45. What is the remainder when it is divided by 15?
N = 45q + 27. 45q is divisible by 15, and 27 = 15 + 12 → remainder **12**.
**Shortcut:** if the second divisor is a factor of the first, just divide the first remainder by it.

### Unit-digit cycles

| Last digit of base | Cycle of unit digits | Cycle length |
|---|---|---|
| 0, 1, 5, 6 | same digit always | 1 |
| 4 | 4, 6 | 2 (odd power → 4, even → 6) |
| 9 | 9, 1 | 2 (odd → 9, even → 1) |
| 2 | 2, 4, 8, 6 | 4 |
| 3 | 3, 9, 7, 1 | 4 |
| 7 | 7, 9, 3, 1 | 4 |
| 8 | 8, 4, 2, 6 | 4 |

**Worked example.** Unit digit of 7^243? 243 ÷ 4 leaves 3 → third term of (7, 9, 3, 1) = **3**.
**Worked example.** Unit digit of 3^65 × 6^59 × 7^71: 3^65 → remainder 1 → 3; 6^59 → 6; 7^71 → remainder 3 → 3. 3 × 6 × 3 = 54 → **4**.
**Shortcut:** remainder 0 on division by 4 means the **4th** term (6 for 2 and 8, 1 for 3 and 7), not the first.

## 4. Factors, sums and counting

| Quantity | Formula (N = a^p × b^q × c^r) |
|---|---|
| Number of factors | (p + 1)(q + 1)(r + 1) |
| Sum of factors | (1 + a + … + a^p)(1 + b + … + b^q)(1 + c + … + c^r) |
| Number of odd factors | ignore the power of 2 |
| Perfect square | has an odd number of factors |
| Multiples of k from a to b | ⌊b/k⌋ − ⌊(a − 1)/k⌋ |

**Worked example.** Number of factors of 540: 540 = 2² × 3³ × 5 → 3 × 4 × 2 = **24**. Odd factors = 4 × 2 = 8.
**Shortcut:** write the prime powers once; every later question (factors, odd factors, sum) uses the same line.

**Worked example.** Sum of factors of 36 = 2² × 3²: (1 + 2 + 4)(1 + 3 + 9) = 7 × 13 = **91**.

**Worked example.** How many numbers between 100 and 200 are divisible by 7? First 105 (7 × 15), last 196 (7 × 28) → 28 − 15 + 1 = **14**.
**Shortcut:** count = (last multiple − first multiple)/k + 1.

### Standard sums

| Series | Sum |
|---|---|
| 1 + 2 + … + n | n(n + 1)/2 |
| 1² + 2² + … + n² | n(n + 1)(2n + 1)/6 |
| 1³ + 2³ + … + n³ | [n(n + 1)/2]² |
| First n odd numbers | n² |
| First n even numbers | n(n + 1) |
| Arithmetic progression | n/2 × (first + last); nth term = a + (n − 1)d |

**Worked example.** Sum of all two-digit multiples of 6: 12 to 96, count (96 − 12)/6 + 1 = 15, sum = 15/2 × 108 = **810**.
**Worked example.** 1² + 2² + … + 10² = 10 × 11 × 21/6 = **385**; 1³ + … + 10³ = 55² = **3025**.
**Shortcut:** the sum of cubes is the square of the sum of the numbers (55 → 3025).

## 5. HCF and LCM ⭐

| Idea | Method |
|---|---|
| HCF (highest common factor) | Lowest power of each **common** prime |
| LCM (lowest common multiple) | Highest power of **every** prime |
| Two numbers | HCF × LCM = product of the two numbers |
| Numbers as HCF multiples | If HCF = h, numbers are ha and hb with a, b co-prime |
| HCF of fractions | HCF of numerators ÷ LCM of denominators |
| LCM of fractions | LCM of numerators ÷ HCF of denominators |
| HCF of decimals | Make the decimal places equal, work as integers, put the point back |
| HCF always divides LCM | LCM is always a multiple of HCF |

**Worked example ⭐ (DSSSB, Feb 2024).** HCF of 12, 36 and 240?
12 = 2² × 3, 36 = 2² × 3², 240 = 2⁴ × 3 × 5 → 2² × 3 = **12**.
**Shortcut:** if the smallest number divides all the others, it is the HCF.

**Worked example.** HCF of two numbers is 12 and LCM 144; one number is 48. Other = 12 × 144/48 = **36**.
**Shortcut:** other number = HCF × LCM ÷ given number.

**Worked example.** HCF of 2/3, 4/9, 8/27 = HCF(2, 4, 8)/LCM(3, 9, 27) = **2/27**; their LCM = 8/3.

**Worked example.** Bells ring every 12, 18 and 30 minutes, together at 8:00 a.m. LCM = 180 min = 3 h → together again at **11:00 a.m.**
**Shortcut:** "together again / at the same time / smallest length that all fit" = LCM; "largest size / maximum number of equal groups" = HCF.

### Remainder problems (most asked) ⭐

| Question wording | Answer |
|---|---|
| Greatest number dividing a, b, c leaving the **same** remainder ⭐ | HCF of (b − a), (c − b), (c − a) |
| Greatest number dividing a and b leaving remainders r₁ and r₂ | HCF(a − r₁, b − r₂) |
| Least number which divided by x, y, z leaves remainder r in each case ⭐ | LCM(x, y, z) + r |
| … and is also divisible by p ⭐ | LCM × k + r, choose the smallest k that makes it divisible by p |
| Least number leaving remainders (x − d), (y − d), (z − d) | LCM(x, y, z) − d |
| Greatest n-digit number divisible by x, y, z | Largest n-digit number − (its remainder on division by the LCM) |
| Smallest n-digit number divisible by x, y, z | Smallest n-digit number + (LCM − remainder) |

**Worked example ⭐ (DSSSB, June 2023).** When 1529, 2178 and 2886 are divided by the greatest number n, the remainder is r each time. Find 3n − 2r.
Differences: 2178 − 1529 = 649 = 11 × 59; 2886 − 2178 = 708 = 12 × 59 → n = 59. r = 1529 − 59 × 25 = 1529 − 1475 = 54. 3n − 2r = 177 − 108 = **69**.
**Shortcut:** you only need two differences; check that n is bigger than r.

**Worked example ⭐ (DSSSB, June 2023).** 3336, 4188 and 5679 leave the same remainder q when divided by a two-digit number p. Find p − q.
Differences 852 = 4 × 213 and 1491 = 7 × 213 → HCF = 213 = 3 × 71. The only two-digit divisor is 71 (3 is one digit). q = 3336 − 71 × 46 = 3336 − 3266 = 70 → p − q = **1**.
**Shortcut:** when the question says "two-digit", factorise the HCF and pick the factor in range.

**Worked example ⭐ (DSSSB, June 2023).** x is the least number which divided by 30, 36, 40 and 54 leaves remainder 4, and x is divisible by 23. Digit sum of x?
LCM = 2³ × 3³ × 5 = 1080 → x = 1080k + 4. 1080 = 23 × 47 − 1, so x leaves (−k + 4) on division by 23 → k = 4 → x = 4324 = 23 × 188. Digit sum = **13**.
**Shortcut:** write the LCM as (multiple of p) ± small number; then the k you need is obvious.

**Worked example.** Least number which divided by 12, 15, 20, 54 leaves 8 and is divisible by 11: LCM = 540 = 11 × 49 + 1 → remainder k + 8 → k = 3 → 1628, digit sum **17**.

**Worked example.** Greatest 4-digit number divisible by 12, 15 and 20: LCM = 60; 9999 = 60 × 166 + 39 → 9999 − 39 = **9960**.

## 6. Simplification and BODMAS ⭐

| Step | Order |
|---|---|
| 1 | **V**inculum (bar) — line over numbers |
| 2 | **B**rackets: ( ) then { } then [ ] |
| 3 | **O**f (multiplication written as "of") ⭐ |
| 4 | **D**ivision and **M**ultiplication — strictly left to right ⭐ |
| 5 | **A**ddition and **S**ubtraction — left to right |

**Worked example ⭐ (DSSSB, Feb 2024).** 33 ÷ 11 + 75 ÷ 5 × 2 − 6 ÷ 12 × 30
= 3 + (15 × 2) − (0.5 × 30) = 3 + 30 − 15 = **18**.
**Shortcut:** underline each ÷/× block first, evaluate each block left to right, then add/subtract.

**Worked example ⭐ (DSSSB, June 2023).** [(6 2/5 ÷ 5 1/3 of 4 1/2) − (1 1/3 ÷ 3 3/5 of 5/6) + 2/5] ÷ [3/4 − 2 2/3 ÷ 1 1/5 of 5/9 + 4 1/4]
"of" first: 16/3 × 9/2 = 24 → 32/5 ÷ 24 = 4/15; 18/5 × 5/6 = 3 → 4/3 ÷ 3 = 4/9; numerator = 4/15 − 4/9 + 2/5 = (12 − 20 + 18)/45 = 2/9.
Denominator: 6/5 × 5/9 = 2/3 → 8/3 ÷ 2/3 = 4 → 3/4 − 4 + 17/4 = 1. Value = **2/9**.
**Shortcut:** convert every mixed number to an improper fraction before anything else; the "of" pairs are designed to give whole numbers.

**Worked example.** 3/4 of 2 2/3 ÷ 1 1/3 of 3/8 + 1/2 = 2 ÷ 1/2 + 1/2 = **4 1/2**. (Doing ÷ before "of" gives a wrong 1 1/16.)

### Fractions and decimals

| Conversion | Rule | Example |
|---|---|---|
| Pure recurring | Recurring digits ÷ as many 9s | 0.3̄6̄ = 36/99 = 4/11 |
| Mixed recurring | (All digits − non-recurring digits) ÷ (9s for recurring, then 0s for non-recurring) | 0.4 7̄ = (47 − 4)/90 = 43/90 |
| With whole part ⭐ | Add the whole number | 1.2̄ = 1 + 2/9 = 11/9 |
| Comparing fractions | Cross-multiply, or convert to decimals | 5/7 vs 7/10: 50 vs 49 → 5/7 bigger |
| a/b + c/d | (ad + bc)/bd | |

**Worked example ⭐ (DSSSB, June 2023).** (5 1/9 − 7 7/8 ÷ 9 9/20) ÷ 1.2̄ − (5 1/4 ÷ 3/7 of 1/4 × 2/7) × 3/14 + 3/4
63/8 × 20/189 = 5/6; 46/9 − 5/6 = 77/18; 1.2̄ = 11/9 → 77/18 × 9/11 = 7/2.
3/7 of 1/4 = 3/28; 21/4 ÷ 3/28 = 49; 49 × 2/7 = 14; 14 × 3/14 = 3. Value = 7/2 − 3 + 3/4 = **1 1/4**.
**Shortcut:** convert recurring decimals to fractions at the very start.

### Algebraic identities that speed up arithmetic

| Identity | Arithmetic use |
|---|---|
| a² − b² = (a − b)(a + b) | (25² − 15²) ÷ 40 = 10 × 40 ÷ 40 = 10 |
| (a + b)² = a² + 2ab + b² | 0.8² + 0.2² + 2 × 0.8 × 0.2 = 1² = 1 |
| (a − b)² = a² − 2ab + b² | 99² = (100 − 1)² = 9801 |
| (a + b)(a − b) | 103 × 97 = 10000 − 9 = 9991 |
| a³ + b³ = (a + b)(a² − ab + b²) | (5.3³ + 4.7³)/(5.3² − 5.3 × 4.7 + 4.7²) = 5.3 + 4.7 = 10 |
| a³ − b³ = (a − b)(a² + ab + b²) | (7³ − 3³)/(49 + 21 + 9) = 4 |

**Worked example.** (0.75³ + 0.25³)/(0.75² − 0.75 × 0.25 + 0.25²) = 0.75 + 0.25 = **1**.
**Shortcut:** when the denominator looks like a² ± ab + b², the answer is a ± b.

### Squares, cubes and roots

| Fact | Use |
|---|---|
| A perfect square never ends in 2, 3, 7, 8 | Eliminate options fast |
| Digital root of a square is 1, 4, 7 or 9 | 1521 → 9 ✓ (39²) |
| Square of a number ending in 5: n5² = n(n + 1) followed by 25 | 65² = 42 25 = 4225 |
| √ of a decimal: make pairs of decimal places | √0.0169 = 0.13 |
| Cube root of a perfect cube: last digit of cube → last digit of root (2↔8, 3↔7, others same) | ∛2197 = 13 |

**Worked example.** √1521 ÷ 13 + 2⁵ = 39 ÷ 13 + 32 = **35**.
**Shortcut:** for √ of a 4-digit number, the first two digits give the tens digit (15 → 3), the last digit gives two candidates (1 → 1 or 9); pick by comparing with 35² = 1225 … 1521 > 1225 → 39.

## Exam traps
1. "of" is not the same as × in priority: 2 ÷ 1/2 of 4 = 2 ÷ 2 = 1, not 16 ⭐.
2. ÷ and × are done left to right: 6 ÷ 12 × 30 = 15, not 1/60 ⭐.
3. Same-remainder questions use **differences**, not the numbers themselves ⭐.
4. "Divisible by 72" means test 8 and 9, never 4 and 18 or 6 and 12 (not co-prime) ⭐.
5. HCF × LCM = product works for two numbers only, not three.
6. Unit-digit power with remainder 0 on division by 4 → the 4th term of the cycle (e.g. 7^4k ends in 1), not the 1st.
7. 1 is neither prime nor composite; 2 is the only even prime; 0 is a whole number but not natural.
8. 0.47̄ (only 7 recurring) = 43/90, not 47/99 or 47/90 — read which digits carry the bar.

## One-liners for revision
1. Primes below 100: 25.
2. Smallest prime 2; smallest composite 4; smallest odd prime 3.
3. Co-prime numbers have HCF 1.
4. Divisible by 8: last three digits ⭐.
5. Divisible by 9: digit sum ⭐.
6. Divisible by 11: difference of alternate digit sums is 0 or 11k ⭐.
7. Composite divisor: test co-prime factors ⭐.
8. 88 = 8 × 11; 72 = 8 × 9 ⭐.
9. Dividend = divisor × quotient + remainder.
10. Unit digits of 2, 3, 7, 8 repeat every 4 powers.
11. 4 and 9 cycle every 2 powers; 0, 1, 5, 6 never change.
12. Number of factors = product of (power + 1).
13. A perfect square has an odd number of factors.
14. 1 + 2 + … + n = n(n + 1)/2.
15. Sum of first n odd numbers = n².
16. Sum of squares = n(n + 1)(2n + 1)/6.
17. Sum of cubes = [n(n + 1)/2]².
18. AP sum = n/2 × (first + last).
19. HCF: lowest powers of common primes.
20. LCM: highest powers of all primes.
21. HCF × LCM = product of two numbers.
22. HCF of fractions = HCF(num) ÷ LCM(den).
23. LCM of fractions = LCM(num) ÷ HCF(den).
24. Same remainder → HCF of differences ⭐.
25. Remainders r₁, r₂ → HCF(a − r₁, b − r₂).
26. Same remainder r → LCM + r ⭐.
27. Extra divisibility → LCM × k + r, find k ⭐.
28. Remainders (x − d), (y − d) → LCM − d.
29. Bells/lights together → LCM.
30. Largest tile / equal groups → HCF.
31. BODMAS: bracket, of, ÷×, +− ⭐.
32. ÷ and × left to right ⭐.
33. Mixed numbers → improper fractions first.
34. Pure recurring: divide by 9s.
35. Mixed recurring: 9s then 0s.
36. 1.2̄ = 11/9 ⭐.
37. (a³ + b³)/(a² − ab + b²) = a + b.
38. Squares never end in 2, 3, 7, 8.
39. n5² = n(n + 1) then 25.
40. HCF always divides LCM.

## Quick self-check
1. Value of M if 859M is divisible by 9? — **5.**
2. Greatest number dividing 1529, 2178, 2886 with the same remainder? — **59 (remainder 54).**
3. Least number which divided by 30, 36, 40, 54 leaves 4 and is divisible by 23? — **4324.**
4. 33 ÷ 11 + 75 ÷ 5 × 2 − 6 ÷ 12 × 30 = ? — **18.**
5. Unit digit of 7^243? — **3.**
6. Number of factors of 540? — **24.**
7. HCF of 12, 36, 240? — **12.**
8. LCM of 12, 18, 24? — **72.**
9. 0.47̄ as a fraction (7 recurring)? — **43/90.**
10. HCF 12, LCM 144, one number 48 — the other? — **36.**
