# Review log — questions_b.json (100 questions)

Method: every question was solved independently before reading the key. All numericals were recomputed with a Python script: traversals (Q8–Q12), tree reconstruction (Q14, Q15), BST build/height/delete (Q17, Q18, Q20), AVL rotations and minimum nodes (Q23–Q26), Catalan counts (Q6, Q7), B-tree limits (Q27, Q29), heap build/insert/delete (Q30–Q32), BFS/DFS (Q44, Q45, Q60), topological order (Q47), MST/Prim (Q49, Q50), Dijkstra (Q53), Euler degrees and path (Q58), counting formulas (Q36, Q37, Q52, Q59), binary search trace and worst case (Q62, Q64), sort passes, swaps and partition (Q80–Q87), hashing tables (Q93–Q98). Complexity, stability and in-place facts were checked against CLRS.

Result: all 100 answer keys are correct. No key was changed. Answer positions remain 25/25/25/25. No duplicates found (Q68 and Q74 both touch merge sort's O(n log n) but ask different things).

## Changes

| Q | Problem | Fix |
|---|---|---|
| 81 | Stem said only "Bubble sort (ascending)". The array after two passes depends on the scan direction; a right-to-left version (smallest value moves to the front) gives a different array. | Stem now states "adjacent elements compared left to right, so the largest value moves to the end in each pass". Key unchanged (index 3). |
| 85 | Scan direction not stated. With a right-to-left bubble sort, [5, 1, 2, 3, 4] needs 4 or more passes, so options 2 or 3 could be defended. | Stem now states "ascending, adjacent elements compared left to right". Explanation adds a note on why direction matters. Key unchanged (index 1). |
| 87 | "After partitioning, at which position does 36 end up?" assumes a partition that puts the pivot in its final place. Hoare's original partition (CLRS Problem 7-1) does not, so the stem was not fully precise. | Stem now states that the partition step puts the pivot into its final sorted place (Lomuto / Horowitz–Sahni style). Key unchanged (index 1). |
