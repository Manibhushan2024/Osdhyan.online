# Data Structures & Algorithms for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT Computer Science candidate revising DSA to score full marks, and to revise FAST. Plain, exact English.
Exam: objective MCQ, 1 mark, −0.25 for a wrong answer. DSA is about 3–5 questions per paper.

## Syllabus (owner's list)
Array, stack, queue, linked list, tree/BST traversal, graph BFS/DFS, searching, sorting (all + complexity), hashing, Big-O.

## How DSSSB actually asks DSA (all 13 questions from the 4 official papers, 2023–2024)
Full list with options, official answers and solutions: `backend/database/data/dsssb/dsa_pyq_analysis.json`. READ IT FIRST.
1. **Algorithm basics**: characteristics of an algorithm (input, output, definiteness = each instruction clear and unambiguous, finiteness, effectiveness), representation easiest to turn into a program (pseudocode), problem types (optimisation problems = find the best solution among feasible ones; decision, search, enumeration).
2. **Complexity**: order of growth O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!).
3. **Design techniques**: divide and conquer (merge sort, quick sort, binary search, Strassen — and what is NOT D&C), backtracking (sum of subsets with a worked instance like w = {2,7,8,9,15}, m = 17).
4. **Sorting**: selection sort best and worst O(n²), merge sort average O(n log n) and technique divide and conquer.
5. **Linear structures**: queue FIFO definition and operations in C (front/rear, overflow/underflow), which structures are linear lists (array, stack, queue, linked list).
6. **Graphs**: path graph with n > 2 vertices has exactly 2 vertices of degree 1 and n − 2 of degree 2.

Questions are mostly definitions and complexity facts; numericals are short (traversal orders, postfix evaluation, number of comparisons/swaps, array address, hashing positions, BFS/DFS order, MST weight).

## Chapters (use these exact keys and titles everywhere)
| key | chapter title |
|---|---|
| ds_algo | Algorithms, Complexity & Recursion |
| ds_linear | Arrays & Linked Lists |
| ds_stack_queue | Stacks & Queues |
| ds_trees | Trees, BST, AVL, B-Trees & Heaps |
| ds_graphs | Graphs: Representation, Traversal, MST & Shortest Paths |
| ds_sort_search | Searching, Sorting & Hashing |
| ds_design | Algorithm Design Techniques |

## Research input
`dsa/research/research.md` (when present) lists topics that DSSSB-focused websites and YouTube channels stress most.

## Facts must be correct
Standard references: Cormen (CLRS), Horowitz–Sahni "Fundamentals of Computer Algorithms" (sum of subsets, design-technique wording), Lipschutz "Data Structures" (Schaum), Tanenbaum/Langsam for C implementations. Verify every traversal, conversion, sorting pass, hashing and graph numerical with a Python script.
