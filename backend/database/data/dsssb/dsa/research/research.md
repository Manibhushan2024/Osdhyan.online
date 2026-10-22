# DSA: what DSSSB TGT CS and similar exams stress (research, 22 Oct 2026)

**Evidence.** The Victory Key looked at 12 official DSSSB TGT CS papers (1,130 subject questions). It ranks Data Structures 10th, with 42 questions (3.7%, about 3–4 per paper). Algorithms is not in its top 12. For PGT, DS has 3.6%. Our 13 official questions (4 papers, 2023–24) are mostly definitions and complexity facts. KnowledgeGate's DSSSB Section-B course spends the most lessons on Tree (56), Stack (38), Linked List (20), Graphs (17), and Queue/Hashing/Array (15 each). Its algorithm modules are Sorting (44), Analysis (26), Time Complexity (22), Greedy (12), DP (12), Shortest Paths (11) and MST (6). Its PYQ analysis says DS items test operations, traversals, search, sorting and choosing a structure, often by tracing the state after each step.

YouTube (I could read titles only): Jenny's Lectures DS series has infix/prefix/postfix (3.4, 3.6) and expression trees (3.12–3.13). A Hindi DAA playlist (channel unconfirmed) has the Master theorem, Kruskal, Dijkstra and Huffman. Unacademy's UGC NET DSA course has hashing and AVL lessons. I could not verify Abdul Bari's playlist pages.

## (a) Ranked topics

| # | Topic (chapter) | Evidence | Priority |
|---|---|---|---|
| 1 | Asymptotic notation, order of growth (ds_algo) | 1 PYQ; UGC NET Jun-2020: 3 Qs; KG 48 lessons | Must |
| 2 | Sorting complexities, stability, passes (ds_sort_search) | 2 PYQs; KG 44 lessons | Must |
| 3 | Divide and conquer, and "which is NOT D&C" (ds_design) | 2 PYQs | Must |
| 4 | Queue: FIFO, front/rear, circular, deque, priority (ds_stack_queue) | 2 PYQs | Must |
| 5 | Stack uses: infix→postfix, postfix evaluation, recursion (ds_stack_queue) | KG 38; Jenny's; NVS set | Must |
| 6 | Binary tree properties and traversals (ds_trees) | KG 56 (largest module) | Must |
| 7 | BST operations; inorder = sorted (ds_trees) | KG; GfG quiz bank | Must |
| 8 | Algorithm characteristics, pseudocode, flowchart (ds_algo) | 2 PYQs | Must |
| 9 | Linear vs non-linear structures (ds_linear) | 1 PYQ; NVS set | Must |
| 10 | Linear vs binary search (ds_sort_search) | Owner syllabus; KG | Must |
| 11 | Graph basics: degree, representation (ds_graphs) | 1 PYQ; KG 17 | Should |
| 12 | BFS/DFS (ds_graphs) | JRF Adda: comparisons very common | Should |
| 13 | MST: Prim vs Kruskal (ds_graphs) | JRF Adda; UGC NET 2020 | Should |
| 14 | Dijkstra, Bellman-Ford, Floyd-Warshall (ds_graphs) | 1 PYQ (APSP); KG 11 | Should |
| 15 | Hashing and collisions (ds_sort_search) | UGC NET item; Unacademy; KG 15 | Should |
| 16 | Heaps, heap sort (ds_trees) | UGC NET item | Should |
| 17 | Linked lists vs arrays (ds_linear) | KG 20; NVS set | Should |
| 18 | Array address calculation, sparse matrix (ds_linear) | KG 15 | Should |
| 19 | Recurrences, Master theorem (ds_algo) | JRF Adda | Should |
| 20 | Backtracking: sum of subsets, N-Queens (ds_design) | 1 PYQ | Should |
| 21 | Greedy: knapsack, Huffman, job sequencing (ds_design) | KG 12; DAA playlist | Should |
| 22 | DP: 0/1 knapsack, LCS, Floyd (ds_design) | KG 12 | Should |
| 23 | AVL balance and rotations (ds_trees) | Unacademy AVL 1–2 | Should |
| 24 | Problem types, P/NP (ds_algo) | 1 PYQ | Good to know |
| 25 | B/B+, N-ary and expression trees (ds_trees) | UGC NET; Jenny's | Good to know |

## (b) Recurring question styles
- One-line complexity recall ("best and worst case of selection sort").
- Arrange functions in order of growth.
- Name the technique, or pick the one that is NOT divide and conquer.
- Statement (i)/(ii) items on queue or stack operations.
- Definitions: definiteness, optimisation problem, linear list, FIFO/LIFO.
- Small worked instance (sum of subsets as bit vectors). Expect postfix values, traversal orders, hash slots and MST weights. Wrong options come from one-step slips.

## (c) High-frequency facts
1. A stack is LIFO. A queue is FIFO: enqueue at the rear, dequeue at the front.
2. A circular queue of size n is full when (rear + 1) % n == front.
3. Infix→postfix conversion, postfix evaluation and recursion all use a stack.
4. BFS uses a queue and DFS uses a stack. Both are O(V + E) with an adjacency list.
5. An adjacency matrix takes O(V²) space; an adjacency list takes O(V + E).
6. Sum of degrees = 2E. Kₙ has n(n − 1)/2 edges. A tree with n vertices has n − 1 edges.
7. A path graph (n > 2) has two degree-1 vertices and n − 2 degree-2 vertices.
8. Inorder traversal of a BST gives sorted order.
9. A binary tree of height h (root at level 1) has at most 2ʰ − 1 nodes.
10. In a full binary tree, leaves = internal nodes + 1.
11. With n unlabelled nodes there are C(2n, n)/(n + 1) distinct binary trees (Catalan number).
12. A BST is O(log n) on average and O(n) when skewed. An AVL tree guarantees O(log n).
13. The AVL balance factor must be −1, 0 or +1. Rotations are LL, RR, LR and RL.
14. Build-heap is O(n). Heap insert/delete is O(log n). Heap sort is O(n log n) and unstable.
15. Binary search is O(log n) and needs sorted, random-access data. Linear search is O(n).
16. Bubble and insertion sort are O(n²) in the worst case and O(n) on already-sorted input.
17. Selection sort is O(n²) in every case, with at most n − 1 swaps.
18. Merge sort is O(n log n) in every case, uses O(n) extra space and is stable.
19. Quick sort is O(n log n) on average and O(n²) in the worst case (sorted input, end pivot).
20. Stable sorts: bubble, insertion, merge, counting, radix. Unstable sorts: selection, quick, heap.
21. Order of growth: 1 < log n < n < n log n < n² < n³ < 2ⁿ < n!.
22. Big-O is an upper bound, Ω is a lower bound and Θ is a tight bound.
23. T(n) = 2T(n/2) + n gives Θ(n log n). T(n) = T(n/2) + 1 gives Θ(log n).
24. Divide and conquer: binary search, merge sort, quick sort, Strassen (7 multiplications, O(n^2.81)).
25. Greedy: Prim, Kruskal, Dijkstra, Huffman, fractional knapsack, job sequencing.
26. Dynamic programming: 0/1 knapsack, Floyd-Warshall (O(V³)), LCS, matrix-chain, Bellman-Ford.
27. Backtracking: N-Queens, sum of subsets, graph colouring.
28. An MST has V − 1 edges. Kruskal is O(E log E).
29. Dijkstra fails on negative edges. Bellman-Ford handles them and detects negative cycles.
30. Load factor α = n/m. Linear probing causes primary clustering; chaining keeps colliding keys in lists.
31. Row-major address: Base + w × ((i − lr) × cols + (j − lc)).
32. The characteristics of an algorithm are input, output, definiteness, finiteness and effectiveness.
33. Pseudocode is the easiest representation to turn into a program.
34. Tower of Hanoi needs 2ⁿ − 1 moves.

## (d) Gaps (stressed by sources, absent from our 13 PYQs)
- Stacks and expressions.
- Tree traversals and rebuilding a tree from traversals.
- BST, AVL and heaps.
- Binary search.
- Hashing.
- Linked lists and array address calculation.
- BFS/DFS, MST and Dijkstra.
- Greedy and DP lists; the Master theorem.
- Quick sort and heap sort; sort stability.

## (e) Sources
- The Victory Key, DSSSB analysis: https://thevictorykey.com/dsssb
- KnowledgeGate Section B course: https://www.knowledgegate.ai/courses/DSSSB-TGT-COMPUTER-SCIENCE-PAPER-2
- KnowledgeGate PYQ analysis: https://www.knowledgegate.ai/blog/dsssb-tgt-computer-science-previous-year-analysis
- KnowledgeGate syllabus by block: https://www.knowledgegate.ai/blog/dsssb-computer-science-syllabus-what-to-study-in-each-block
- Syllabus4u DSSSB TGT CS: https://syllabus4u.com/dsssb-tgt-computer-science-syllabus/
- SamagraCS UGC NET 2020 analysis: https://samagracs.com/ugc-net-computer-science-previous-year-question-analysis-2020-2019-2018/
- JRF Adda UGC NET expected topics: https://www.jrfadda.com/exams/ugc-net/ugc-net-computer-science-most-expected-questions-based-on-previous-year-papers — MST is a "favorite topic in competitive examinations".
- Testbook repeated UGC NET topics: https://testbook.com/news/topics-are-repeated-in-the-ugc-net-exam/
- Jenny's Lectures titles: https://old.fbpe.org/infix-prefix-and-postfix-notation.html
- DAA playlist listing: https://www.classcentral.com/classroom/youtube-design-and-analysis-of-algorithms-daa-46806
- Unacademy UGC NET DSA: https://unacademy.com/course/complete-course-on-data-structures-and-algorithms---nta-ugc-net-june-2023/HN3TORZL
- NVS PGT CS set: https://www.scribd.com/document/476741308/NVS-P-Computer-Science-Questions-with-Answer-Computer-Science-Questions-and-Answers-CSE-MCQ
- GfG BST quiz: https://www.geeksforgeeks.org/quizzes/top-mcqs-on-binary-search-tree-bst-data-structure-with-answers/
- Our data: `dsssb/dsa_pyq_analysis.json` (13 questions).
