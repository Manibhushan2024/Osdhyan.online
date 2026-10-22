# Review of questions_a.json (100 questions)

Every question was solved independently and checked against its key. A Python script re-ran all numerical items: loop counts at n = 16, 256, 4096 and 65536 (Q17–Q26), array and triangular-matrix addresses (Q36–Q44), linked-list pointer traces (Q53, Q54), infix→postfix/prefix conversions (Q61–Q67), postfix/prefix evaluation and stack contents (Q68–Q72), stack-permutation enumeration and Catalan C5 = 42 (Q83, Q84), the circular-queue trace (Q77), fractional and 0/1 knapsack (Q88, Q94), activity selection and job sequencing by brute force (Q89, Q91), Huffman cost (Q90), LCS (Q95), sum of subsets (Q96), 4-queens (Q97), Hanoi, recursion calls and digit sum (Q31–Q35). Fact items were checked against CLRS and Horowitz–Sahni.

Result: all 100 keys are correct, and every explanation matches its key. No explanation refers to an option by letter. There are no duplicate stems or options. Answer positions are 25/25/25/25.

## Changes

| Q | Problem | Fix |
|---|---|---|
| 17, 19, 20, 21, 22, 23, 25, 26 | The stem asked "What is the time complexity", but Q13 in the same set (correctly) teaches that Big-O is only an upper bound. Under that reading, looser options such as O(n log n) in Q19 or O(log n), O(√n) and O(n) in Q22 are also true. | Stem changed to "What is the tightest Big-O time complexity of the following code?" Keys are unchanged. |
| 82 | The distractor "O(n) worst case, O(n) amortised" is also a true (loose) upper bound. | Stem now ends "...the amortised cost per operation (tightest bounds)?" Key is unchanged. |

Keys changed: 0. Stems reworded: 9.
