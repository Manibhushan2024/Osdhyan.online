# Data Interpretation & Statistics

**In 30 seconds**
- 3 of the 76 numerical questions in the 2023–24 DSSSB TGT CS papers: two **percent-profit DI** ⭐ (line graph of percentage profit of companies A and B, with income and expenditure) and one **production–export table** ⭐. Statistics (mean, median, mode) was not asked in those papers but is in the syllabus — keep the formulas ready.
- Percent-profit DI ⭐: **Income = Expenditure × (1 + p/100)**; Profit = Income − Expenditure = Expenditure × p/100.
- "X is what % more/less than Y" → divide by **Y** (the value after "than") ⭐.
- Totals before percentages: add the rows or columns asked, then compare ⭐.
- Pie chart: central angle = value/total × 360°; 1% = 3.6°.
- Mean of a frequency table = Σfx/Σf; combined mean is weighted by group size.
- Median: middle value of ordered data; for even n, average of the two middle values.
- Empirical relation: **Mode = 3 Median − 2 Mean**.

## 1. Reading a DI set

| Step | What to do |
|---|---|
| 1 | Read the title, units (thousand, lakh, crore, %) and the years/categories |
| 2 | Note any formula given under the data (e.g. percentage profit) ⭐ |
| 3 | Rewrite the question as an equation before computing |
| 4 | Compute totals of only the rows/columns needed |
| 5 | Approximate when options are far apart; compute exactly when they are close (one decimal) ⭐ |

### Core DI formulas

| Quantity | Formula |
|---|---|
| Percentage change | (New − Old)/Old × 100 |
| X is what % of Y | X/Y × 100 |
| X is what % more than Y ⭐ | (X − Y)/Y × 100 |
| X is what % less than Y ⭐ | (Y − X)/Y × 100 |
| Ratio | Simplify X : Y by the HCF |
| Average per year | Sum ÷ number of years |
| Share of an item | Item ÷ total × 100 |
| Pie chart angle | Value/total × 360° |
| Pass / sold / exported % | Part ÷ whole × 100 for each row; overall = total part ÷ total whole |

**Worked example ⭐ (DSSSB, June 2023).** Cement production and export (million tonnes):

| Year | A Prod | A Exp | B Prod | B Exp |
|---|---|---|---|---|
| 2017 | 250 | 170 | 320 | 190 |
| 2018 | 340 | 275 | 360 | 280 |
| 2019 | 370 | 220 | 425 | 320 |
| 2020 | 450 | 245 | 470 | 275 |

Total export (2017 + 2019) is what % less than total production (2018 + 2020)?
Export = 170 + 190 + 220 + 320 = 900; production = 340 + 360 + 450 + 470 = 1620. (1620 − 900)/1620 × 100 = **44.4%**.
**Shortcut:** 720/1620 = 4/9 = 44.4% — cancel common factors before dividing.

**Worked example.** Pass data: P 180/240, Q 255/300, R 117/180, S 288/360, T 198/220. Highest pass %?
P 75, Q 85, R 65, S 80, T 90 → **T**. Overall = 1038/1300 ≈ **79.8%**.
**Shortcut:** compare fractions by a common base — T = 9/10 is obviously the largest.

**Worked example.** Laptops 40 (2020) → 60 (2023) = **50%** increase. Total of three items 95 (2021) → 125 (2024) = 30/95 = **31.6%** increase.

**Worked example.** Cars produced/sold (thousand): 2020 120/100, 2021 150/132, 2022 160/128, 2023 200/180, 2024 175/147. Unsold in all = 805 − 687 = **118 thousand**; highest sold % = **2023 (90%)**; 2023 sales are **80%** more than 2020.

## 2. Percentage-profit DI ⭐

| Given | Find | Formula |
|---|---|---|
| Expenditure E, profit p% | Income | I = E(1 + p/100) |
| Income I, profit p% | Expenditure | E = I/(1 + p/100) |
| E or I and p% | Profit | E × p/100 = I × p/(100 + p) |
| Equal incomes, profits p₁, p₂ | Ratio of expenditures | (100 + p₂) : (100 + p₁) |
| Equal expenditures, profits p₁, p₂ | Ratio of incomes | (100 + p₁) : (100 + p₂) |
| Expenditure ratio a : b, total income T | Each expenditure | E = ak, bk with a(1 + p₁) k + b(1 + p₂) k = T |

**Worked example ⭐ (DSSSB, June 2023).** 2018: A's profit 30%, B's 45%. B's expenditure ₹300 crore; A's income ₹390 crore. B's profit is what % more than A's?
B: 0.45 × 300 = 135. A: E = 390/1.3 = 300 → profit 90. (135 − 90)/90 × 100 = **50%**.
**Shortcut:** both expenditures turn out to be 300, so compare the profit rates directly: 45 vs 30 → 50% more.

**Worked example ⭐ (DSSSB, June 2023).** 2019: A's profit 40%, B's 30%. Total income ₹428.8 crore; expenditure A : B = 2 : 3. A's expenditure?
1.4 × 2k + 1.3 × 3k = 6.7k = 428.8 → k = 64 → A = **₹128 crore**.
**Shortcut:** check options: 128 → B = 192 → 179.2 + 249.6 = 428.8 ✓.

**Worked example.** X's profit 25% in 2020, expenditure ₹240 crore → income **₹300 crore**. Y's profit 35% in 2021, income ₹270 crore → expenditure 270/1.35 = **₹200 crore**.

**Worked example.** 2022: X 30%, Y 50%, equal expenditures, total income ₹504 crore → 2.8E = 504 → **E = ₹180 crore** each.

**Worked example.** 2019: X 20%, Y 30%, equal incomes → expenditures X : Y = 1.3 : 1.2 = **13 : 12**.

## 3. Mean ⭐

| Data type | Formula |
|---|---|
| Raw data | x̄ = Σx/n |
| Frequency table | x̄ = Σfx/Σf |
| Assumed mean A | x̄ = A + Σfd/Σf (d = x − A) |
| Combined mean | (n₁x̄₁ + n₂x̄₂)/(n₁ + n₂) |
| First n natural numbers | (n + 1)/2 |
| Corrected mean | (n x̄ − wrong + correct)/n |
| Add k to every value | Mean + k |
| Multiply every value by k | Mean × k |
| Sum of deviations from the mean | Always 0 |

**Worked example.** Mean of the first 10 natural numbers = 11/2 = **5.5**.

**Worked example.** x: 10, 20, 30, 40 with f: 3, 5, 8, 4 → Σfx = 530, Σf = 20 → **26.5**.
**Shortcut:** assumed mean 30: d = −20, −10, 0, 10 → Σfd = −60 − 50 + 0 + 40 = −70 → 30 − 70/20 = 26.5.

**Worked example.** 30 boys average 60 and 20 girls average 70 → (1800 + 1400)/50 = **64**.
**Shortcut:** the combined mean sits closer to the bigger group: 60 + 10 × 20/50 = 64.

**Worked example.** 30 students average 60; 75 was read for 45 → 60 − 30/30 = **59**.

**Worked example.** Mean of 5 numbers is 20; after removing one the mean of 4 is 18 → removed = 100 − 72 = **28**.

**Worked example.** Mean of 10 values is 25; add 5 to each, then multiply by 2 → (25 + 5) × 2 = **60**.

## 4. Median

| Data | Median |
|---|---|
| n odd (ordered) | ((n + 1)/2)th value |
| n even (ordered) | Average of (n/2)th and (n/2 + 1)th values |
| Grouped data | L + [(N/2 − cf)/f] × h |

(L = lower limit of the median class, cf = cumulative frequency before it, f = its frequency, h = class width.)

**Worked example.** 21, 15, 34, 18, 27, 40, 12 → ordered 12, 15, 18, 21, 27, 34, 40 → median **21**.

**Worked example.** 7, 3, 9, 4, 12, 6 → 3, 4, 6, 7, 9, 12 → (6 + 7)/2 = **6.5** (the mean is 6.83).

**Worked example.** Mean of 4, 7, x, 9, 10, 12 is 8 → x = 6 → ordered 4, 6, 7, 9, 10, 12 → median **8**.
**Shortcut:** always sort before picking the middle — the unsorted middle is a planted distractor.

**Worked example (grouped).** Classes 0–10, 10–20, 20–30, 30–40 with f = 5, 8, 12, 5 (N = 30). N/2 = 15 → median class 20–30 (cf before it 13) → 20 + (15 − 13)/12 × 10 = **21.67**.

## 5. Mode

| Data | Mode |
|---|---|
| Raw data | Value that occurs most often (there can be two: bimodal) |
| Grouped data | L + [(f₁ − f₀)/(2f₁ − f₀ − f₂)] × h |
| Empirical (moderately skewed) | Mode = 3 Median − 2 Mean |

(f₁ = frequency of the modal class, f₀ the class before, f₂ the class after.)

**Worked example.** 2, 3, 5, 3, 7, 5, 3, 8 → 3 appears three times → mode **3**.

**Worked example.** Mean 25, median 24 → mode = 72 − 50 = **22**.
**Shortcut:** median lies between mean and mode, about two-thirds of the way from mode to mean.

**Worked example (grouped).** Same table as above: modal class 20–30 (f₁ = 12, f₀ = 8, f₂ = 5) → 20 + (12 − 8)/(24 − 8 − 5) × 10 = 20 + 40/11 = **23.64**.

## 6. Spread: range, mean deviation, variance, standard deviation

| Measure | Formula |
|---|---|
| Range | Largest − smallest |
| Coefficient of range | (L − S)/(L + S) |
| Mean deviation (about mean) | Σ|x − x̄|/n |
| Variance σ² | Σ(x − x̄)²/n = (Σx²/n) − x̄² |
| Standard deviation σ | √variance |
| Add k to every value | SD unchanged |
| Multiply every value by k | SD × |k|; variance × k² |
| Coefficient of variation | σ/x̄ × 100 |
| First n natural numbers | Variance = (n² − 1)/12 |

**Worked example.** Range of 15, 22, 8, 31, 19 = 31 − 8 = **23**.

**Worked example.** SD of 2, 4, 6, 8, 10: mean 6, squared deviations 16, 4, 0, 4, 16 → variance 8 → SD = **2√2**.
**Shortcut:** these are 2 × (1, 2, 3, 4, 5); variance of 1…5 = (25 − 1)/12 = 2 → × 2² = 8.

**Worked example.** Mean deviation of 3, 5, 7, 9, 11: mean 7, deviations 4, 2, 0, 2, 4 → 12/5 = **2.4**.

**Worked example.** Each value is increased by 10: mean rises by 10, SD stays the same. Each value is doubled: mean and SD both double, variance × 4.

## 7. Charts written in text

| Chart | How DSSSB words it in text | Typical question |
|---|---|---|
| Table ⭐ | Rows by year / item, columns by company | Totals, % more/less, average, ratio |
| Bar graph | "Production in 2019 = 45 thousand…" | Year of maximum growth, % change |
| Line graph ⭐ | "Company A: 2018 = 30, 2019 = 40…" (percent profit) | Income/expenditure from percent profit |
| Pie chart | "Expenditure on items: Food 25%, Rent 15% …" or degrees | Angle, amount = % × total |

**Worked example (pie).** A family spends 25% on food out of ₹48,000. Food = ₹12,000; its angle = 0.25 × 360 = **90°**. An item shown as 54° is 54/360 = 15% of the total.
**Shortcut:** 1% = 3.6°, 10% = 36°, 25% = 90°.

**Worked example (pie in degrees).** A school's budget of ₹7.2 lakh is shown as Salaries 180°, Lab 72°, Library 36°, Sports 54°, Others 18°. Lab spending = 72/360 × 7.2 = **₹1.44 lakh**; Salaries are 180/72 = **2.5 times** Lab; Library + Sports = 90° = **25%** of the budget.
**Shortcut:** convert degrees to a fraction of 360 first (72° = 1/5, 54° = 3/20, 18° = 1/20).

**Worked example (percent pie with a total).** Of 1,200 students, 35% chose Science and 15% Commerce. Science exceeds Commerce by 20% of 1,200 = **240 students**.
**Shortcut:** subtract the percentages before multiplying by the total.

**Worked example (growth).** Sales 2019 → 2020: 40 → 50 (25% up); 2020 → 2021: 50 → 60 (20% up). Highest % growth is 2020 even though the absolute rise is the same.
**Shortcut:** the same absolute rise gives a bigger % on a smaller base.

## 8. A full bar-graph set worked in text

Data (sales of a bookshop, ₹ lakh): 2020 = 40, 2021 = 50, 2022 = 45, 2023 = 60, 2024 = 72.

| Question | Working | Answer |
|---|---|---|
| Average annual sales | (40 + 50 + 45 + 60 + 72)/5 = 267/5 | ₹53.4 lakh |
| Year with the highest % growth | 2021: 10/40 = 25%; 2022: −10%; 2023: 15/45 = 33.3%; 2024: 12/60 = 20% | 2023 |
| Year with the highest absolute growth | +10, −5, +15, +12 | 2023 |
| 2024 sales as % of 2020 | 72/40 × 100 | 180% |
| Ratio of 2022 to 2024 | 45 : 72 = 5 : 8 | 5 : 8 |
| Years above the average | 60 and 72 exceed 53.4 | 2 years (2023, 2024) |
| Overall % growth 2020 → 2024 | (72 − 40)/40 × 100 | 80% |

**Shortcut:** for "highest % growth" first shortlist the years with a large rise on a small base; you rarely need to compute every year.

## 9. Calculation speed for DI

| Trick | Example |
|---|---|
| Fraction equivalents | 1/8 = 12.5%, 1/12 = 8.33%, 1/16 = 6.25%, 1/9 = 11.11%, 1/11 = 9.09% |
| Split percentages | 37.5% = 25% + 12.5% → 37.5% of 640 = 160 + 80 = 240 |
| Compare fractions by cross-multiplying | 117/180 vs 255/300: 117 × 300 = 35100 < 255 × 180 = 45900 → second is bigger |
| Common denominator | 180/240 = 3/4; 288/360 = 4/5; 198/220 = 9/10 |
| One-decimal accuracy | When two options differ by less than 1%, carry one extra decimal ⭐ |
| Base-100 check | % change from 40 to 52 = 12/40 = 30% |

**Worked example.** Which is greater: 147/175 or 132/150? 147/175 = 0.84 and 132/150 = 0.88 → **132/150**.
**Shortcut:** reduce both to a denominator of 100 or 25 (21/25 vs 22/25).

**Worked example.** 72/63 as a percentage: 72/63 = 8/7 = 1 + 1/7 = 114.29% (1/7 = 14.28%).

**Worked example.** Total income ₹428.8 crore — instead of solving 6.7k = 428.8 by long division, note 6.7 × 64 = 428.8 (6.7 × 60 = 402, 6.7 × 4 = 26.8).

## Exam traps
1. "% more than" divides by the value after "than", not by the larger value ⭐.
2. Percentage profit is on **expenditure**, so Expenditure = Income ÷ (1 + p/100), not Income × (1 − p/100) ⭐.
3. Overall % = total part ÷ total whole — not the average of the row percentages.
4. Read units (thousand, lakh, crore) and "approximately / correct to one decimal" in the question ⭐.
5. Sort the data before finding the median.
6. Mode = 3 Median − 2 Mean (not 3 Mean − 2 Median).
7. Adding a constant changes the mean but not the SD or range.
8. Highest absolute increase ≠ highest percentage increase.

## One-liners for revision
1. % change = change/old × 100.
2. % more than Y → divide by Y ⭐.
3. % less than Y → divide by Y ⭐.
4. Income = expenditure × (1 + p/100) ⭐.
5. Expenditure = income ÷ (1 + p/100) ⭐.
6. Profit = expenditure × p/100.
7. Equal incomes → expenditures ∝ 1/(1 + p).
8. Overall % uses totals.
9. Pie: 1% = 3.6°.
10. 25% of a pie = 90°.
11. Average of a row = row total ÷ number of entries.
12. Ratio questions: cancel by the HCF.
13. Mean = Σx/n.
14. Frequency mean = Σfx/Σf.
15. Assumed mean: A + Σfd/Σf.
16. Combined mean is weighted.
17. Corrected mean = old + (correct − wrong)/n.
18. Mean of 1…n = (n + 1)/2.
19. Add k → mean + k.
20. Multiply by k → mean × k.
21. Σ(x − x̄) = 0.
22. Median: sort first.
23. Odd n: ((n + 1)/2)th value.
24. Even n: average of the two middle values.
25. Grouped median: L + (N/2 − cf)h/f.
26. Mode: most frequent value.
27. Grouped mode: L + (f₁ − f₀)h/(2f₁ − f₀ − f₂).
28. Mode = 3 Median − 2 Mean.
29. Range = max − min.
30. Mean deviation = Σ|x − x̄|/n.
31. Variance = mean of squares − square of mean.
32. SD = √variance.
33. Add k → SD unchanged.
34. Multiply by k → SD × k, variance × k².
35. Variance of 1…n = (n² − 1)/12.
36. CV = σ/mean × 100.
37. Same absolute rise → bigger % on the smaller base.
38. Close options → compute to one decimal ⭐.
39. Far options → approximate.
40. Write the DI question as an equation first ⭐.

## Quick self-check
1. B's expenditure ₹300 cr at 45% profit; A's income ₹390 cr at 30%. B's profit is what % more than A's? — **50%.**
2. Total income ₹428.8 cr, profits 40% and 30%, expenditures 2 : 3. A's expenditure? — **₹128 crore.**
3. 900 is what % less than 1620? — **44.4%.**
4. Income ₹270 cr at 35% profit — expenditure? — **₹200 crore.**
5. Equal incomes, profits 20% and 30% — expenditure ratio? — **13 : 12.**
6. 30 boys at 60, 20 girls at 70 — combined mean? — **64.**
7. Median of 12, 15, 18, 21, 27, 34, 40? — **21.**
8. Mean 25, median 24 — mode? — **22.**
9. SD of 2, 4, 6, 8, 10? — **2√2.**
10. Pie angle for 15%? — **54°.**
