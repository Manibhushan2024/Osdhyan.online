# Algorithm Design Techniques

**In 30 seconds**
- **Divide and conquer ⭐**: divide → conquer (recursively) → combine. Binary search, merge sort ⭐, quick sort, Strassen, closest pair, max–min, Karatsuba.
- **NOT divide and conquer ⭐**: all-pairs shortest path / Floyd–Warshall (DP), 0/1 knapsack (DP), Prim, Kruskal, Dijkstra (greedy), linear search (brute force).
- **Greedy**: take the locally best choice, never reconsider — fractional knapsack, Huffman, activity selection, job sequencing, Prim, Kruskal, Dijkstra.
- **Dynamic programming**: optimal substructure + **overlapping** subproblems; store answers — 0/1 knapsack, LCS, matrix chain, Floyd–Warshall, Bellman–Ford.
- **Backtracking ⭐**: depth-first search of a state-space tree with a bounding function — sum of subsets, N-Queens, graph colouring, Hamiltonian cycle.
- **Sum of subsets ⭐**: w = {2, 7, 8, 9, 15}, m = 17 → **11100, 10001, 00110**.
- **Branch and bound**: BFS/least-cost search with bounds, for **optimisation** problems (0/1 knapsack, TSP).
- **Optimisation problem ⭐** = find the **best** among feasible solutions; decision problem = yes/no answer.

---

## 1. Overview of techniques

| Technique | Core idea | Use when | Classic examples |
|---|---|---|---|
| Brute force | Try every possibility directly | n is small; as a baseline | Linear search, bubble/selection sort, naive string match, TSP by all permutations |
| **Divide and conquer** | Split into independent subproblems, solve, combine | Subproblems do **not** overlap | Merge sort, quick sort, binary search, Strassen |
| Greedy | Locally optimal choice at each step | Greedy-choice property holds | Fractional knapsack, Huffman, Prim, Kruskal, Dijkstra |
| Dynamic programming | Solve each subproblem once, store in a table | Subproblems **overlap** + optimal substructure | 0/1 knapsack, LCS, Floyd–Warshall, matrix chain |
| Backtracking | DFS over a state-space tree, abandon dead ends | Find all/any solutions meeting constraints | N-Queens, sum of subsets, graph colouring |
| Branch and bound | BFS/LC search with bounds, prune non-promising nodes | Optimisation over a huge space | 0/1 knapsack, TSP, job assignment |
| Randomised | Uses random choices | Avoid bad worst-case inputs | Randomised quick sort, Monte Carlo tests |

---

## 2. Brute force
Straightforward approach based directly on the problem statement: enumerate all candidates and check each. Easy to design and always correct, but often slow: linear search O(n), selection/bubble sort O(n²), naive string matching O(mn), TSP by trying all (n − 1)! tours, subset problems O(2ⁿ). **Exhaustive search** is brute force over combinatorial objects (permutations, subsets).

---

## 3. Divide and conquer ⭐ Asked in DSSSB

### 3.1 Steps
1. **Divide** the problem into smaller sub-problems of the same type (usually independent).
2. **Conquer** each sub-problem recursively (solve directly when small enough).
3. **Combine** the sub-solutions into the solution of the original problem.

General recurrence: **T(n) = a·T(n/b) + f(n)** (a sub-problems of size n/b, f(n) = divide + combine cost) — solved with the Master theorem.

### 3.2 Applications ⭐ and their recurrences

| Application | Recurrence | Time |
|---|---|---|
| **Binary search** | T(n) = T(n/2) + 1 | O(log n) |
| **Merge sort ⭐** | T(n) = 2T(n/2) + n | O(n log n) all cases |
| **Quick sort** | best/avg T(n) = 2T(n/2) + n; worst T(n) = T(n − 1) + n | O(n log n) avg; O(n²) worst |
| Max–min (find both) | T(n) = 2T(n/2) + 2 | **3n/2 − 2** comparisons (n a power of 2) vs 2n − 2 naive |
| Ordinary D&C matrix multiplication | T(n) = 8T(n/2) + n² | O(n³) |
| **Strassen's matrix multiplication** | T(n) = **7**T(n/2) + n² | O(n^log₂7) = **O(n^2.81)** |
| Karatsuba integer multiplication | T(n) = 3T(n/2) + n | O(n^log₂3) = O(n^1.585) |
| Closest pair of points | T(n) = 2T(n/2) + O(n) | O(n log n) (brute force O(n²)) |
| Finding k-th smallest (quickselect) | T(n) = T(n/2) + n average | O(n) average |
| Exponentiation xⁿ by squaring | T(n) = T(n/2) + 1 | O(log n) |
| FFT, convex hull (quickhull), counting inversions | T(n) = 2T(n/2) + n | O(n log n) |

Strassen uses **7 multiplications and 18 additions/subtractions** of n/2 × n/2 matrices instead of 8 multiplications.

**Master theorem in one table** — T(n) = aT(n/b) + f(n); compare f(n) with n^(log_b a):
| Case | Condition | Result | Example |
|---|---|---|---|
| 1 | f(n) smaller (polynomially) | Θ(n^(log_b a)) | Strassen: a = 7, b = 2, f = n² < n^2.81 → Θ(n^2.81) |
| 2 | f(n) equal | Θ(n^(log_b a) · log n) | Merge sort: a = 2, b = 2, f = n = n¹ → Θ(n log n); binary search: a = 1, f = 1 = n⁰ → Θ(log n) |
| 3 | f(n) larger (+ regularity) | Θ(f(n)) | T(n) = 2T(n/2) + n² → Θ(n²) |

**Max–min worked idea**: split the array into halves, find (max, min) of each half recursively, then 2 comparisons combine them (max of the two maxima, min of the two minima); a pair of 2 elements needs 1 comparison. For n = 8 this gives 10 comparisons, against 2n − 2 = 14 for the straightforward scan.

### 3.3 What is NOT divide and conquer ⭐ (favourite "which is NOT" options)
| Problem / algorithm | Real technique |
|---|---|
| All-pairs shortest path (**Floyd–Warshall**) ⭐ | Dynamic programming |
| 0/1 knapsack, LCS, matrix-chain multiplication, Bellman–Ford | Dynamic programming |
| Prim's, Kruskal's MST, Dijkstra's shortest path | Greedy |
| Fractional knapsack, Huffman coding, job sequencing | Greedy |
| N-Queens, sum of subsets, graph colouring | Backtracking |
| Linear search, bubble sort, selection sort | Brute force |
| Insertion sort | Decrease (incremental) |

**D&C vs DP**: both break the problem into sub-problems; D&C sub-problems are **independent** (merge sort halves never repeat), DP sub-problems **overlap**, so DP stores results.

---

## 4. Greedy method

### 4.1 Terms
- **Feasible solution**: satisfies the constraints. **Objective function**: value to maximise/minimise. **Optimal solution**: feasible solution with the best objective value.
- **Greedy-choice property**: a globally optimal solution can be reached by making the locally optimal choice. Plus **optimal substructure**.
- Greedy never revisits a choice → fast, but correct only for problems with these properties (e.g. fails for 0/1 knapsack).

### 4.2 Fractional knapsack (worked)
n = 3, capacity M = 20, profits p = (25, 24, 15), weights w = (18, 15, 10). **Greedy rule: decreasing p/w.**

| Item | p | w | p/w |
|---|---|---|---|
| 1 | 25 | 18 | 1.39 |
| 2 | 24 | 15 | **1.60** |
| 3 | 15 | 10 | 1.50 |

Take item 2 fully (weight 15, profit 24, capacity left 5) → item 3 fraction 5/10 = ½ (profit 7.5) → full.
**x = (0, 1, ½), profit = 31.5** (optimal). Greedy by largest profit gives 28.2, by smallest weight 31.0 — only the ratio rule is optimal. Time O(n log n) for sorting.

### 4.3 Activity selection
Choose the maximum number of non-overlapping activities: **sort by finish time**, pick the first, then each next activity whose start ≥ last finish.
CLRS set — s = (1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12), f = (4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16) → selected **{a1, a4, a8, a11}** (4 activities). O(n log n).

### 4.4 Huffman coding (worked)
Optimal **prefix-free** variable-length code: repeatedly merge the **two least frequent** nodes (min-priority queue).
Frequencies (per 100 characters): a 45, b 13, c 12, d 16, e 9, f 5.

| Step | Merge | New node |
|---|---|---|
| 1 | f 5 + e 9 | 14 |
| 2 | c 12 + b 13 | 25 |
| 3 | 14 + d 16 | 30 |
| 4 | 25 + 30 | 55 |
| 5 | a 45 + 55 | 100 (root) |

Codes (left = 0, right = 1): **a 0, c 100, b 101, d 111, f 1100, e 1101**.
Total bits = 45·1 + 13·3 + 12·3 + 16·3 + 9·4 + 5·4 = **224** vs fixed 3-bit code 300 → average 2.24 bits/char. Time O(n log n). Exact 0/1 labels can differ by tie-breaking, but code **lengths** and total cost stay optimal.
- **Prefix property**: no code is a prefix of another, so decoding is unambiguous: 1100 0 101 → **f a b**.
- Most frequent character → shortest code (a, 1 bit); least frequent → longest (f, e: 4 bits). Leaves = n characters, internal nodes = n − 1 merges.
- Cost = Σ frequency × depth = sum of all internal-node weights (14 + 25 + 30 + 55 + 100 = 224) — a quick check in the exam.

### 4.5 Job sequencing with deadlines (worked)
Each job takes one unit of time; profit only if finished by its deadline. **Sort by profit descending; place each job in the latest free slot ≤ its deadline.**
n = 4, p = (100, 10, 15, 27), d = (2, 1, 2, 1):

| Job (by profit) | Deadline | Action |
|---|---|---|
| J1 (100) | 2 | slot 2 |
| J4 (27) | 1 | slot 1 |
| J3 (15) | 2 | slots 1, 2 full → reject |
| J2 (10) | 1 | full → reject |

Schedule **J4, J1**, profit **127** (optimal; checked against all subsets). O(n²) simple version.

### 4.6 Greedy graph algorithms
| Algorithm | Greedy choice | Time |
|---|---|---|
| Prim's MST | cheapest edge from the tree to a new vertex | O(V²) matrix; O(E log V) heap |
| Kruskal's MST | cheapest edge overall that forms no cycle (union–find) | O(E log E) |
| Dijkstra's SSSP | nearest unfinished vertex | O(V²); O((V + E) log V) heap; fails with negative edges |

Prim grows **one tree** from a start vertex (good for dense graphs); Kruskal grows a **forest** by sorting all edges (good for sparse graphs). Both give an MST of V − 1 edges; if all edge weights are distinct the MST is unique, so both give the same total weight.

---

## 5. Dynamic programming

### 5.1 Two properties
1. **Optimal substructure**: an optimal solution contains optimal solutions of sub-problems.
2. **Overlapping sub-problems**: the same sub-problems recur, so store them.

| Memoisation | Tabulation |
|---|---|
| Top-down: recursion + cache | Bottom-up: fill a table iteratively |
| Solves only needed sub-problems | Solves all sub-problems in order |
| Recursion stack overhead | No recursion; usually faster |

Principle of optimality (Bellman). DP usually trades **space for time**.

### 5.2 Fibonacci
Naive recursion fib(n) = fib(n − 1) + fib(n − 2) is exponential (fib(5) makes **15** calls, fib(10) **177**). DP/memoisation → **O(n)** time; keeping only the last two values → O(1) space.

### 5.3 0/1 knapsack (worked table)
K[i][c] = max(K[i − 1][c], K[i − 1][c − wᵢ] + vᵢ) if wᵢ ≤ c, else K[i − 1][c].
Capacity W = 5; items (w, v): 1 (2, 3), 2 (3, 4), 3 (4, 5), 4 (5, 6).

| i \ c | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 (2,3) | 0 | 0 | 3 | 3 | 3 | 3 |
| 2 (3,4) | 0 | 0 | 3 | 4 | 4 | **7** |
| 3 (4,5) | 0 | 0 | 3 | 4 | 5 | 7 |
| 4 (5,6) | 0 | 0 | 3 | 4 | 5 | **7** |

Answer **7** with items {1, 2} (weight 5). Time **O(nW)** — pseudo-polynomial. Greedy fails for 0/1: in §4.2's data, ratio-greedy picks item 2 (24) and nothing else fits, but item 1 alone gives 25 (the 0/1 optimum).

### 5.4 Longest common subsequence (worked)
L[i][j] = L[i − 1][j − 1] + 1 if xᵢ = yⱼ, else max(L[i − 1][j], L[i][j − 1]).
X = ABCBDAB, Y = BDCABA:

| | ∅ | B | D | C | A | B | A |
|---|---|---|---|---|---|---|---|
| ∅ | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| A | 0 | 0 | 0 | 0 | 1 | 1 | 1 |
| B | 0 | 1 | 1 | 1 | 1 | 2 | 2 |
| C | 0 | 1 | 1 | 2 | 2 | 2 | 2 |
| B | 0 | 1 | 1 | 2 | 2 | 3 | 3 |
| D | 0 | 1 | 2 | 2 | 2 | 3 | 3 |
| A | 0 | 1 | 2 | 2 | 3 | 3 | 4 |
| B | 0 | 1 | 2 | 2 | 3 | 4 | **4** |

LCS length **4**; LCSs: **BCBA, BCAB, BDAB**. Time and space O(mn). (Smaller check: ABCDGH vs AEDFHR → ADH, length 3.)

### 5.5 Matrix-chain multiplication
Find the parenthesisation with the fewest scalar multiplications (multiplying p×q by q×r costs pqr).
- A(10×30), B(30×5), C(5×60): (AB)C = 1500 + 3000 = **4500**; A(BC) = 9000 + 18000 = 27000.
- Dimensions (5, 4, 6, 2, 7): minimum **158** with ((A1(A2A3))A4).
- m[i][j] = min over k of m[i][k] + m[k + 1][j] + p₍ᵢ₋₁₎pₖpⱼ → **O(n³)** time, O(n²) space. Number of parenthesisations of n matrices = Catalan number C(n − 1): 1, 1, 2, 5, 14, 42.

### 5.6 Floyd–Warshall (all-pairs shortest path) ⭐ (the "NOT D&C" answer)
D⁽ᵏ⁾[i][j] = min(D⁽ᵏ⁻¹⁾[i][j], D⁽ᵏ⁻¹⁾[i][k] + D⁽ᵏ⁻¹⁾[k][j]) for k = 1..n → **O(V³)** time, O(V²) space. Handles negative edges (no negative cycles). Example: edges 1→2 (3), 1→4 (7), 2→1 (8), 2→3 (2), 3→1 (5), 3→4 (1), 4→1 (2) give distance row from vertex 1 = (0, 3, 5, 6).
Bellman–Ford (single source, negative edges allowed) is also DP: O(VE).

### 5.7 Coin change
Coins {1, 3, 4}, amount 6. Greedy (largest first): 4 + 1 + 1 = **3 coins**. DP: 3 + 3 = **2 coins** (optimal). Number of ways to make 6 = 4. Greedy is optimal for "canonical" systems like {1, 2, 5, 10} but not in general. DP time O(n × amount).

### 5.8 Greedy vs dynamic programming

| Point | Greedy | Dynamic programming |
|---|---|---|
| Decision | One locally best choice per step, final | Considers all choices via sub-problem table |
| Optimality | Only if greedy-choice property holds | Always optimal (with optimal substructure) |
| Sub-problems | One sub-problem left after each choice | Many overlapping sub-problems |
| Speed / memory | Faster, little memory | Slower, needs a table |
| Knapsack | Fractional knapsack | 0/1 knapsack |
| Shortest path | Dijkstra | Bellman–Ford, Floyd–Warshall |
| Coin change | Canonical coins only | Any coin set |

---

## 6. Backtracking ⭐ Asked in DSSSB

### 6.1 Terms
- Solution as a vector (x₁, x₂, …, xₙ); explicit constraints limit each xᵢ (e.g. xᵢ ∈ {0, 1}), implicit constraints relate them (sum = m, no two queens attack).
- **State-space tree**: all choices drawn as a tree; explored **depth-first**.
- **Live node**: generated but not fully expanded; **E-node**: currently being expanded; **dead node**: not expanded further.
- **Bounding function**: kills a node that cannot lead to a solution (**pruning**). A node is **promising** if it may still lead to a solution.
- Typically finds **all** solutions (or any one) of a constraint problem; worst case still exponential.

### 6.2 Sum of subsets ⭐ (worked, exactly as asked in DSSSB)
w[1:5] = {2, 7, 8, 9, 15} (sorted ascending), m = 17. xᵢ = 1 means wᵢ is included.
Bounding at level k (s = sum chosen so far, r = sum of remaining weights):
- go left (include wₖ) only if s + wₖ ≤ m;
- go right (exclude wₖ) only if s + r − wₖ ≥ m (the rest can still reach m).

DFS order (include first):
| Path | Running sum | Result |
|---|---|---|
| include 2, 7, 8 | 2 → 9 → 17 | **11100** ✔ |
| include 2, exclude 7, 8, 9, include 15 | 2 → 17 | **10001** ✔ |
| exclude 2, 7; include 8, 9 | 8 → 17 | **00110** ✔ |

Solutions: **{2, 7, 8} = 11100, {2, 15} = 10001, {8, 9} = 00110** — official answer option "11100; 10001; 00110". (Check the traps: 10101 = 2 + 8 + 15 = 25 ✗; 00111 = 8 + 9 + 15 = 32 ✗; 11000 = 9 ✗.) Verified by enumerating all 32 subsets.
Classic Horowitz instance: w = {5, 10, 12, 13, 15, 18}, m = 30 → 110010, 101100, 001001.

### 6.3 N-Queens
Place n queens on an n × n board so no two share a row, column or diagonal (queen i in row i, column xᵢ; diagonal clash when |xᵢ − xⱼ| = |i − j|).
- **4-Queens: 2 solutions — (2, 4, 1, 3) and (3, 1, 4, 2)** (mirror images).
- Solutions: n = 5 → 10, n = 6 → 4, **n = 8 → 92**. No solution for n = 2, 3.

**Backtracking trace for 4-Queens** (column of the queen in rows 1, 2, 3, 4):
| Partial placement | What happens |
|---|---|
| (1, 3) | row 3: every column attacked → backtrack |
| (1, 4, 2) | row 4: every column attacked → backtrack; (1, 4, 3) diagonal clash |
| (1, –) exhausted | backtrack to row 1, move queen to column 2 |
| (2, 4, 1, 3) | **first solution** |

Continuing the search gives the second solution (3, 1, 4, 2). Without pruning there are 4⁴ = 256 leaf placements; the bounding function cuts most of them.

```
(2,4,1,3)      (3,1,4,2)
. Q . .        . . Q .
. . . Q        Q . . .
Q . . .        . . . Q
. . Q .        . Q . .
```

### 6.4 Graph colouring
**m-colouring decision**: can the vertices be coloured with m colours so that adjacent vertices differ? Minimum m = **chromatic number χ(G)**. Backtracking assigns colours vertex by vertex, rejecting a colour already used by a neighbour. Examples: even cycle C4 → 2, odd cycle C5 → 3, complete graph K4 → 4; C4 has 18 proper 3-colourings. Planar graphs need at most 4 colours. Worst case O(n·mⁿ).

**Worked trace** — vertices A, B, C, D; edges AB, AC, BC, BD, CD (two triangles sharing BC); colours tried in order 1, 2, 3:
| Vertex | Colours rejected (clash with) | Colour given |
|---|---|---|
| A | — | 1 |
| B | 1 (A) | 2 |
| C | 1 (A), 2 (B) | 3 |
| D | 2 (B), 3 (C) | 1 |

First solution **(1, 2, 3, 1)**. With m = 2 there is no solution (triangle ABC needs 3 colours), so χ = 3; with m = 3 there are exactly 6 colourings (A, B, C take the 3 colours in 3! ways, D is forced to A's colour). The state-space tree has m levels of branching per vertex: m + m² + … + mⁿ nodes without pruning.

### 6.5 Hamiltonian cycle
Find a cycle visiting every vertex exactly once and returning to the start. Backtracking adds an unvisited vertex adjacent to the last one; at the end checks the edge back to the start. NP-complete. (Euler circuit = every **edge** once, solvable in polynomial time.)

---

## 7. Branch and bound
Explores the state-space tree **breadth-first or by least cost**, computing a **bound** for each node; a node whose bound cannot beat the best solution found so far is pruned. Used for **optimisation** problems.
- **FIFO B&B**: live nodes kept in a queue (BFS). **LIFO B&B**: stack. **LC (least-cost) B&B**: priority queue ordered by a cost function ĉ(x) — usually fastest.
- **0/1 knapsack**: upper bound at a node = current profit + fractional (greedy) fill of the remaining capacity; prune if the bound ≤ best profit so far.
- **TSP**: lower bound from the **reduced cost matrix** (subtract row and column minima). Example: 4 cities with distances 1–2 = 10, 1–3 = 15, 1–4 = 20, 2–3 = 35, 2–4 = 25, 3–4 = 30 → optimal tour 1–2–4–3–1, length **80**. Brute force needs (n − 1)! tours; DP (Held–Karp) O(n²2ⁿ).

### Backtracking vs branch and bound
| Point | Backtracking | Branch and bound |
|---|---|---|
| Problem type | Decision / find all feasible solutions | Optimisation |
| Search order | Depth-first | BFS (FIFO), LIFO or least-cost |
| Pruning | Bounding function (feasibility) | Bounds on the objective value (cost) |
| Memory | Low (one path) | Higher (many live nodes) |
| Examples | N-Queens, sum of subsets, graph colouring, Hamiltonian cycle | 0/1 knapsack, TSP, job assignment |

### How to spot the technique in an MCQ
| Clue in the question | Technique |
|---|---|
| "split into halves", "recursively sort and merge", "pivot" | Divide and conquer |
| "locally optimal", "largest ratio first", "minimum edge first", "shortest finish time" | Greedy |
| "table", "overlapping sub-problems", "memoisation", "principle of optimality" | Dynamic programming |
| "state-space tree", "bounding function", "all solutions", "DFS with pruning" | Backtracking |
| "least-cost search", "upper/lower bound on cost", "FIFO/LC search" | Branch and bound |
| "try all possibilities", "exhaustive" | Brute force |

## 8. Randomised algorithms
Use random numbers to make choices, so the running time or output is a random variable. **Las Vegas** algorithms always give the correct answer but running time varies (randomised quick sort: expected O(n log n) on every input, worst O(n²) is improbable). **Monte Carlo** algorithms run in fixed time but may be wrong with small probability (Miller–Rabin primality test, Karger's min-cut). Randomisation defeats adversarial "worst-case" inputs; hashing with a random function (universal hashing) is another example.

---

## 9. Problem classes: P, NP, NP-complete, NP-hard

| Class | Meaning | Examples |
|---|---|---|
| **P** | Decision problems solvable in **polynomial time** by a deterministic algorithm | Sorting, searching, MST, shortest path, LCS, 2-colouring |
| **NP** | Solution can be **verified** in polynomial time (solvable in polynomial time by a non-deterministic machine) | All of P, SAT, Hamiltonian cycle, subset sum |
| **NP-complete** | In NP **and** every NP problem reduces to it in polynomial time | **SAT (first, Cook's theorem)**, 3-SAT, clique, vertex cover, Hamiltonian cycle, subset sum, 0/1 knapsack (decision), graph k-colouring (k ≥ 3), TSP (decision) |
| **NP-hard** | At least as hard as every NP problem; need not be in NP (may not be a decision problem) | TSP optimisation, 0/1 knapsack optimisation, **halting problem** (undecidable) |

- **P ⊆ NP**; whether P = NP is unsolved. NP-complete = NP ∩ NP-hard.
- If any one NP-complete problem is solved in polynomial time, then P = NP.
- To prove X NP-complete: show X ∈ NP and reduce a known NP-complete problem to X.
- 0/1 knapsack DP O(nW) is **pseudo-polynomial** (polynomial in the value W, exponential in its bit length) — it does not put knapsack in P.

## 10. Optimisation ⭐ vs decision problems
| Type | Asks | Example |
|---|---|---|
| **Optimisation ⭐** | The **best** (min/max) solution among feasible ones | Shortest path, minimum spanning tree, maximum profit knapsack |
| Decision | Yes/No | "Is there a tour of length ≤ k?", "Is the graph 3-colourable?" |
| Search | Find any solution | Find one 8-queens placement |
| Enumeration | List all solutions | All subsets with sum m |
| Counting | How many solutions | Number of 8-queens solutions (92) |

DSSSB asked: "problems that require identifying the best solution from a given set of solutions" → **Optimisation** ⭐. Each optimisation problem has a decision version (add a threshold k); NP-completeness is defined on decision problems.

---

## Exam traps
1. **All-pairs shortest path (Floyd–Warshall) is DP, not divide and conquer** ⭐ — binary search, quick sort and Strassen are D&C.
2. Merge sort is **divide and conquer** only — not greedy, not backtracking ⭐.
3. Dijkstra, Prim and Kruskal are **greedy**, even though they solve graph problems that look "recursive".
4. **0/1 knapsack → DP (or B&B); fractional knapsack → greedy.** Greedy by p/w is not optimal for 0/1.
5. Sum of subsets: check each option by adding the weights — 10101 = 25 and 00111 = 32 are the planted wrong vectors ⭐.
6. D&C sub-problems are independent; **overlapping** sub-problems signal DP.
7. Backtracking uses **DFS**; branch and bound uses **BFS/least-cost** search and suits optimisation.
8. Strassen: **7** multiplications, O(n^2.81) — not 8, not O(n³).
9. 4-Queens has exactly **2** solutions; 8-Queens has **92**.
10. Huffman merges the **two smallest** frequencies; the result is a prefix code — the exact bits depend on tie-breaking, the total cost does not.
11. NP-hard problems need not be in NP; NP-complete problems must be in NP.
12. "Optimisation" = best solution; "decision" = yes/no ⭐.

## One-liners for revision
1. D&C steps: divide, conquer, combine.
2. Binary search: D&C, T(n) = T(n/2) + 1, O(log n).
3. Merge sort: D&C ⭐, T(n) = 2T(n/2) + n, O(n log n) ⭐.
4. Quick sort: D&C, worst T(n) = T(n − 1) + n = O(n²).
5. Strassen: 7 multiplications, O(n^log₂7) ≈ O(n^2.81).
6. Karatsuba: 3 multiplications, O(n^1.585).
7. Max–min by D&C: 3n/2 − 2 comparisons.
8. Closest pair by D&C: O(n log n).
9. Floyd–Warshall: DP, O(V³) ⭐ (not D&C).
10. Greedy: locally optimal choice, never undone.
11. Greedy needs greedy-choice property + optimal substructure.
12. Fractional knapsack: sort by p/w; example answer 31.5.
13. Activity selection: sort by finish time.
14. Huffman: merge two least frequencies; O(n log n).
15. Huffman example total cost 224 bits for 100 characters.
16. Job sequencing: sort by profit, latest free slot before deadline.
17. Prim, Kruskal, Dijkstra: greedy.
18. Dijkstra fails with negative edge weights.
19. DP needs optimal substructure + overlapping sub-problems.
20. Memoisation = top-down; tabulation = bottom-up.
21. 0/1 knapsack DP: O(nW), pseudo-polynomial.
22. LCS DP: O(mn); LCS(ABCBDAB, BDCABA) = 4.
23. Matrix chain DP: O(n³); count of orders = Catalan number.
24. Naive Fibonacci exponential; DP Fibonacci O(n).
25. Bellman–Ford: DP, O(VE), allows negative edges.
26. Coin {1, 3, 4} for 6: greedy 3 coins, DP 2 coins.
27. Backtracking = DFS + bounding function.
28. Sum of subsets {2, 7, 8, 9, 15}, m = 17: 11100, 10001, 00110 ⭐.
29. 4-Queens: (2, 4, 1, 3) and (3, 1, 4, 2).
30. Chromatic number of an odd cycle = 3, of Kₙ = n.
31. Hamiltonian cycle: every vertex once; NP-complete.
32. Branch and bound: FIFO, LIFO, LC search; for optimisation.
33. TSP brute force (n − 1)!; Held–Karp DP O(n²2ⁿ).
34. Las Vegas: always correct; Monte Carlo: maybe wrong, fixed time.
35. P ⊆ NP; P = NP is open.
36. SAT was the first NP-complete problem (Cook).
37. NP-complete = in NP and NP-hard.
38. Halting problem is NP-hard but undecidable.
39. Optimisation problem: best among feasible solutions ⭐.
40. Decision problem: yes/no answer.

## Quick self-check
1. Which is NOT divide and conquer: binary search, all-pairs shortest path, quick sort, Strassen? — **All-pairs shortest path** (DP) ⭐
2. Design technique of merge sort? — **Divide and conquer** ⭐
3. Solutions of sum of subsets w = {2, 7, 8, 9, 15}, m = 17? — **11100, 10001, 00110** ⭐
4. Problems that need the best solution from a set of feasible solutions are called? — **Optimisation problems** ⭐
5. Maximum profit for fractional knapsack M = 20, p = (25, 24, 15), w = (18, 15, 10)? — **31.5**
6. Which technique does Kruskal's algorithm use? — **Greedy**
7. Two properties required for DP? — **Optimal substructure and overlapping sub-problems**
8. Number of solutions of the 4-Queens problem? — **2**
9. Time complexity of Strassen's algorithm? — **O(n^2.81)**
10. Backtracking explores the state-space tree in which order? — **Depth-first**
