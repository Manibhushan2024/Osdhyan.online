# DSA — Fast Revision Sheet

## How to use this sheet

- Read it once from top to bottom (45–60 min). ⭐ marks a fact asked in a DSSSB TGT CS paper, with the date and shift.
- Conventions: the root is at level 0 and height is counted in edges, unless a row says otherwise. Check which convention the options use.
- In the last 10 minutes, re-read only the Top 25 and the Last 12 traps.

## Top 25 facts DSSSB asks again and again

| # | Fact | Asked |
|---|---|---|
| 1 | **Definiteness** = each instruction is clear and unambiguous. Finiteness = it stops; effectiveness = each step can be carried out. | ⭐ 25 Jun 2023 S1 |
| 2 | **Pseudocode** is the easiest form to turn into a program. | ⭐ 24 Jun 2023 S3 |
| 3 | **Optimisation problem** = the best (min/max) solution among the feasible ones. | ⭐ 25 Jun 2023 S1 |
| 4 | **Array** is the basic linear list (stack, queue, linked list and circular queue are linear too). Trees and graphs are non-linear. | ⭐ 25 Jun 2023 S2 |
| 5 | Order of growth: **log n < n < n log n < n² < n² log n < 2ⁿ** | ⭐ 24 Jun 2023 S3 |
| 6 | **Queue = FIFO**: the first element inserted is the first removed. | ⭐ 25 Jun 2023 S1 |
| 7 | A queue inserts at the **REAR** and deletes at the **FRONT**. "Insert at front" and "delete at rear" are both false, so the answer is **neither**. | ⭐ 25 Jun 2023 S1 |
| 8 | **Selection sort: best = worst = O(n²)** (always n(n − 1)/2 comparisons) | ⭐ 25 Jun 2023 S2 |
| 9 | **Merge sort = divide and conquer** (not greedy, not backtracking) | ⭐ 25 Jun 2023 S2 |
| 10 | **Merge sort average = O(n log n)**, and so are its best and worst cases | ⭐ 25 Jun 2023 S2 |
| 11 | **All-pairs shortest path (Floyd–Warshall) is DP, NOT divide and conquer.** Binary search, quick sort and Strassen are D&C. | ⭐ 24 Jun 2023 S3 |
| 12 | **Path graph Pₙ (n > 2): n − 2 vertices of degree 2** (and 2 of degree 1) | ⭐ 24 Jun 2023 S3 |
| 13 | **Sum of subsets** w = {2, 7, 8, 9, 15}, m = 17 → **11100, 10001, 00110** | ⭐ 24 Jun 2023 S3 |
| 14 | A stack is LIFO. Infix→postfix conversion, postfix evaluation and recursion all use a stack. | – |
| 15 | A circular queue is full when **(rear + 1) % N == front**. | – |
| 16 | BFS uses a **queue** and DFS a **stack**. Both are O(V + E) with an adjacency list and O(V²) with a matrix. | – |
| 17 | Σ deg = 2E. Kₙ has n(n − 1)/2 edges. A tree has n − 1 edges. | – |
| 18 | The inorder of a BST is sorted. A BST is O(log n) on average and O(n) when skewed; an AVL tree is always O(log n). | – |
| 19 | n₀ = n₂ + 1. The maximum number of nodes at height h is 2ʰ⁺¹ − 1 (or 2ʰ − 1 if the root is at level 1). | – |
| 20 | There are **Cₙ = C(2n, n)/(n + 1)** distinct binary trees (and BSTs) with n nodes: 1, 2, 5, 14, 42. | – |
| 21 | Build-heap is **O(n)**. Heap insert and delete are O(log n). Heap sort is O(n log n) and **unstable**. | – |
| 22 | Quick sort is O(n log n) on average and **O(n²)** in the worst case (sorted input with a first/last pivot). | – |
| 23 | Stable: bubble, insertion, merge, counting, radix. Unstable: selection, quick, heap, shell. | – |
| 24 | Greedy: Prim, Kruskal, Dijkstra, Huffman, fractional knapsack. DP: 0/1 knapsack, LCS, matrix chain, Floyd, Bellman–Ford. | – |
| 25 | Dijkstra fails with negative edges. Bellman–Ford, O(VE), handles them. Floyd–Warshall is O(V³). | – |

---

## 1. Algorithm basics

**Characteristics (Horowitz–Sahni)**

| Characteristic | Meaning | Violated by |
|---|---|---|
| Input | **Zero or more** quantities | – |
| Output | **At least one** quantity | A procedure that produces nothing |
| ⭐ Definiteness | Each instruction is **clear and unambiguous** | "Add 6 or 7 to x" |
| Finiteness | **Terminates** after finitely many steps | `while(1){}` |
| Effectiveness | Each step is **basic enough** to do with pencil and paper | "Find the largest prime" |

- An algorithm **must terminate**, but a program need not (an OS, for example). "Indefiniteness" is a distractor.

**Representations**

| Form | Key point |
|---|---|
| Natural language | Easy to write, but can be ambiguous |
| Flowchart | A picture; hard to draw and change when large |
| ⭐ **Pseudocode** | **Easiest to convert into a program** (maps line by line onto code) |

- Flowchart symbols: **oval** = start/stop, **parallelogram** = input/output, **rectangle** = process, **diamond** = decision, small circle = on-page connector, pentagon = off-page connector.

**Problem types**

| Type | Asks | Example |
|---|---|---|
| ⭐ Optimisation | The **best** feasible solution | Shortest path, MST, 0/1 knapsack |
| Decision | Yes/No | Is n prime? Is there a subset with sum 17? |
| Search | Find any one solution | One 8-queens placement |
| Enumeration | List **all** solutions | All subsets with sum 17 |
| Counting | **How many** solutions | Number of spanning trees |

**Data structure classification**

| Basis | Kinds |
|---|---|
| ⭐ Arrangement | **Linear**: array, stack, queue, linked list. **Non-linear**: tree, graph |
| Built in? | Primitive (int, char, float, pointer) / non-primitive |
| Size | Static (array) / dynamic (linked list) |

- An **ADT** gives the values and operations (the *what*); the data structure gives the *how*.

---

## 2. Complexity

**Notations (CLRS)**

| Notation | Meaning | Limit of f/g as n → ∞ |
|---|---|---|
| **O(g)** | Upper bound: "at most" | finite |
| **Ω(g)** | Lower bound: "at least" | > 0 |
| **Θ(g)** | Tight bound: O and Ω together | finite and > 0 |
| o(g) | Strict upper bound | 0 |
| ω(g) | Strict lower bound | ∞ |

- n = O(n²) is true; O need not be tight. 3n² + 5n + 2 = Θ(n²).
- **Only Θ is symmetric.** Transitivity holds for all five; reflexivity only for O, Ω and Θ.
- The base of a log does not matter. The base of an exponential does: 2ⁿ⁺¹ = O(2ⁿ), but 4ⁿ = 2²ⁿ ≠ O(2ⁿ).
- log(n!) = Θ(n log n).

**Growth order** ⭐ 24 Jun 2023 S3

**1 < log n < √n < n < n log n < n² < n² log n < n³ < 2ⁿ < n! < nⁿ**

| f(n) | n = 10 | n = 100 |
|---|---|---|
| log₂ n | 3.32 | 6.64 |
| √n | 3.16 | 10 |
| n log₂ n | 33.2 | 664 |
| n² | 100 | 10,000 |
| n³ | 1,000 | 10⁶ |
| 2ⁿ | 1,024 | 1.27 × 10³⁰ |
| n! | 3,628,800 | 9.33 × 10¹⁵⁷ |

- The order is asymptotic: at n = 10, log₂ n is bigger than √n. √n wins for every n > 16.

**Loop pattern → complexity**

| Loop | Runs | Order |
|---|---|---|
| `i++` up to n, nested in `j++` up to n | n² | O(n²) |
| inner loop `j < i` | n(n − 1)/2 | O(n²) |
| `i *= 2` or `i /= 2` | about log₂ n | O(log n) |
| `i++` outer, `j *= 2` inner | n log n | O(n log n) |
| `i*i <= n` | √n | O(√n) |
| `i = i*i` | log log n | O(log log n) |
| `i *= 2` outer, `j <= i` inner | 1 + 2 + 4 + … < 2n | O(n) |
| `j += i` inside `i` up to n (harmonic) | n(1 + ½ + … + 1/n) | O(n log n) |

**Master theorem**: T(n) = aT(n/b) + f(n), with a ≥ 1 and b > 1. Compare f(n) with n^(log_b a).

| Case | Condition | Result |
|---|---|---|
| 1 | f is polynomially **smaller** | Θ(n^(log_b a)) |
| 2 | f = Θ(n^(log_b a) logᵏ n) (**equal**) | Θ(n^(log_b a) logᵏ⁺¹ n); for k = 0, multiply by log n |
| 3 | f is polynomially **larger** and a·f(n/b) ≤ c·f(n) with c < 1 | Θ(f(n)) |

- The theorem does not apply to T(n − 1) + n (subtraction), to 2T(n/2) + n/log n (gap) or to a < 1.

**Standard recurrences**

| Algorithm | Recurrence | Solution |
|---|---|---|
| Binary search, fast power | T(n/2) + 1 | O(log n) |
| ⭐ Merge sort, quick sort best/avg | 2T(n/2) + n | O(n log n) |
| Quick sort worst, recursive selection/insertion sort | T(n − 1) + n | O(n²) |
| Factorial, recursive linear search | T(n − 1) + 1 | O(n) |
| Binary-tree traversal | 2T(n/2) + 1 | O(n) |
| T(n) = 9T(n/3) + n | case 1 | Θ(n²) |
| T(n) = 4T(n/2) + n² | case 2 | Θ(n² log n) |
| T(n) = 2T(n/2) + n² | case 3 | Θ(n²) |
| Strassen | 7T(n/2) + n² | O(n^2.81) |
| **Tower of Hanoi** | 2T(n − 1) + 1 | **2ⁿ − 1 moves** (n = 3: 7; n = 5: 31) |
| Naive Fibonacci | T(n − 1) + T(n − 2) + 1 | O(2ⁿ) time, O(n) space; fib(5) makes 15 calls |

- Linear search: best 1, worst n, average successful **(n + 1)/2** comparisons.

---

## 3. MASTER COMPLEXITY TABLE (data-structure operations)

| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array (unsorted) | O(1) | O(n) | O(n) (O(1) at the end) | O(n) |
| Sorted array | O(1) | **O(log n)** | O(n) | O(n) |
| Singly linked list | O(n) | O(n) | O(1) at head / after a known node | O(1) at head; O(n) for a given node (needs predecessor) |
| Doubly linked list | O(n) | O(n) | O(1) at a known position | **O(1)** for a given node |
| Stack | O(1) top only | O(n) | push O(1) | pop O(1) |
| Queue | O(1) front only | O(n) | enqueue O(1) | dequeue O(1) |
| BST average | – | O(log n) | O(log n) | O(log n) |
| BST worst (skewed) | – | **O(n)** | O(n) | O(n) |
| AVL / red–black | – | O(log n) | O(log n) | O(log n) |
| Binary heap | max/min O(1) | O(n) | O(log n) | O(log n) (root) |
| Hash table average | – | **O(1)** | O(1) | O(1) |
| Hash table worst | – | **O(n)** | O(n) | O(n) |
| B-tree / B+ tree | – | O(log n) | O(log n) | O(log n) |

- Build-heap is O(n), while n separate inserts are O(n log n). Hashing gives no order, so min, max and range queries are O(n).

---

## 4. Arrays and linked lists

**Address formulas** (w = element size, B = base; elements per dimension = **UB − LB + 1**)

| Case | Formula | Tiny example |
|---|---|---|
| 1-D | B + w(k − LB) | A[5…50], B = 1200, w = 2: 46 elements; A[20] = 1200 + 2 × 15 = **1230** |
| 2-D row-major (C, Java) | B + w[(i − L₁)·**N** + (j − L₂)], N = number of columns | int A[10][20], B = 2000, w = 4: A[5][8] = 2000 + 4 × 108 = **2432** |
| 2-D column-major (FORTRAN, MATLAB) | B + w[(j − L₂)·**M** + (i − L₁)], M = number of rows | same array: 2000 + 4 × 85 = **2340** |
| Non-zero/negative LB, row-major | subtract the LB first | A[−2…5][3…8], B = 500, w = 2 (8 × 6 = 48 elements): A[2][6] = 500 + 2 × (4 × 6 + 3) = **554** |
| Same, column-major | – | 500 + 2 × (3 × 8 + 4) = **556** |
| 3-D row-major | B + w[(i − L₁)n₂n₃ + (j − L₂)n₃ + (k − L₃)] | A[2…5][1…4][3…7], B = 1000, w = 4: A[4][3][5] = 1000 + 4 × 52 = **1208** (column-major: **1168**) |

- In row-major the last subscript changes fastest; in column-major the first one does.
- Inserting at position k of n shifts **n − k + 1** elements; deleting shifts **n − k**.
- Elements stored: lower triangular **n(n + 1)/2** (10 × 10 → 55); tridiagonal **3n − 2** (100 → 298). Sparse triplet form takes **3(t + 1)** words.
- `char s[] = "HELLO"` takes **6 bytes** because of `'\0'`.

**List types**

| Type | Key property |
|---|---|
| Singly | One direction. Deleting needs the **predecessor**. Inserting in the middle changes 2 pointers. |
| Doubly | Both directions. Deletes a known node in **O(1)**. One extra pointer per node; inserting changes 4 pointers. |
| Circular singly | Last → first, no NULL. With a pointer to the **last** node, insert at front and at end are both O(1). |
| Circular doubly | head→prev = last and last→next = head |
| Header (sentinel) | A dummy first node removes the special cases. Grounded (ends in NULL) or circular. |

| Array | Linked list |
|---|---|
| Contiguous, static | Scattered, dynamic |
| Random access O(1) | Sequential access O(n) |
| Insert/delete in the middle O(n) | O(1) once the position is reached |
| Binary search possible | Binary search not efficient |

**Pointer tricks**

| Task | Method | Cost |
|---|---|---|
| Reverse | prev, cur, next pointers | O(n) time, O(1) space |
| Find the middle | slow moves 1 step, fast moves 2 | one pass |
| Detect a loop | **Floyd's tortoise and hare**; to find the loop start, reset one pointer to the head and move both 1 step | O(n) time, O(1) space |
| Merge two sorted lists | relink the nodes with a dummy head | O(m + n) |
| Insert after p | `t->next = p->next;` **then** `p->next = t;` | O(1) |

- **Overflow** = no free node (AVAIL = NULL, `malloc` returns NULL). **Underflow** = deleting from an empty list (START = NULL).
- Garbage collection works by **mark and sweep**. C has none, so you call `free()`. A dangling pointer points to freed memory.

---

## 5. Stacks and queues

| Structure | Rule | Empty / underflow | Full / overflow | Count |
|---|---|---|---|---|
| Array stack | **LIFO**, one end (top) | top == −1 | top == MAX − 1 | top + 1 |
| Linear queue | ⭐ **FIFO**, insert at the REAR, delete at the FRONT | front == −1 or front > rear | rear == MAX − 1 (even when slots at the front are free) | rear − front + 1 |
| Circular queue (front = rear = −1 at start, N slots used) | rear = (rear + 1) % N | front == −1 | **(rear + 1) % N == front** | (rear − front + N) % N + 1 |
| Circular queue (front = rear = 0, one slot kept empty) | capacity N − 1 | **front == rear** | (rear + 1) % N == front | (rear − front + N) % N |

- Push: `stack[++top] = x`. Pop: `return stack[top--]`. A linked stack or linked queue has O(1) operations and overflows only when `malloc` fails.
- Circular count example: N = 8, front = 6, rear = 2 → (2 − 6 + 8) % 8 + 1 = **5**.

**Deque and priority queue**

| Variant | Rule |
|---|---|
| Deque | Insert and delete at **both** ends |
| Input-restricted deque | Insert at one end; delete at both |
| Output-restricted deque | Insert at both ends; delete at one |
| Priority queue | Highest priority leaves first; equal priorities leave in FIFO order |
| PQ as a binary heap | Insert O(log n), delete O(log n), peek O(1) |
| PQ as an unsorted list / sorted list | Insert O(1) and delete O(n) / insert O(n) and delete O(1) |

**Infix → postfix in 5 rules** (scan left to right)
1. Operand → output.
2. `(` → push.
3. `)` → pop to the output until `(`; discard both brackets.
4. Operator → pop while the top has **higher** precedence, or **equal** precedence and the incoming operator is left-associative; then push it. A `^` does **not** pop a `^`. Nothing pops past a `(`.
5. At the end, pop everything.

| Precedence | Operators | Associativity |
|---|---|---|
| Highest | ^ | **Right**: A^B^C = A^(B^C) |
| Middle | * / % | Left |
| Lowest | + − | Left |

| Infix | Postfix | Prefix |
|---|---|---|
| A + B * C − D / E | ABC*+DE/− | −+A*BC/DE |
| (A + B) * (C − D) / E | AB+CD−*E/ | /*+AB−CDE |
| A + B ^ C ^ D * E | ABCD^^E*+ | +A*^B^CDE |
| A ^ B ^ C | ABC^^ | ^A^BC |
| A − B − C | AB−C− | −−ABC |

- **Postfix evaluation**: scan left to right and push operands. On an operator, pop **B** first, then **A**, and push A op B. Example: 5 6 2 + * 12 4 / − = **37**.
- **Prefix evaluation**: scan right to left; the first value popped is the **left** operand. Example: − + 7 * 4 5 + 2 0 = **25**.

**Applications**

| Stack | Queue |
|---|---|
| Function calls and recursion (activation records) | CPU scheduling (FCFS, round robin) |
| Infix/postfix conversion and evaluation | BFS and level-order traversal |
| Parenthesis matching (balanced if the stack is empty at the end) | Buffers: keyboard, I/O, network |
| Undo, browser Back, backtracking, DFS | Printer spooling, ticket systems |
| Reversing, decimal → binary | Priority queue: Dijkstra, Prim, Huffman |

- Queue from two stacks: enqueue O(1), dequeue **O(1) amortised**. Stack from two queues: push or pop becomes O(n).
- **Catalan numbers** Cₙ = (2n)!/((n + 1)! n!): 1, 2, **5**, **14**, 42, 132 for n = 1…6. They count stack permutations, binary tree shapes and bracketings. From input 123 the output **312 is impossible** (the 3-1-2 pattern).

---

## 6. Trees

**Terminology**: root (no parent), leaf (degree 0), internal node (≥ 1 child), degree of a node (number of children), depth (edges from the root), height (longest path down to a leaf; a single node has height 0), siblings (same parent), forest (disjoint trees). A tree with n nodes has **n − 1 edges**.

**Binary tree formulas**

| Property | Value |
|---|---|
| Max nodes at level i | 2ⁱ |
| Max nodes at height h | **2ʰ⁺¹ − 1** (2ʰ − 1 if the root is at level 1 / height counts levels) |
| Min nodes at height h | h + 1 (skewed) |
| Min height with n nodes | ⌊log₂ n⌋ |
| Max height | n − 1 |
| Leaves vs degree-2 nodes | **n₀ = n₂ + 1** |
| NULL links in linked form | **n + 1** |
| Full (strict) tree with i internal nodes | 2i + 1 nodes, i + 1 leaves |
| Perfect tree of height h | 2ʰ⁺¹ − 1 nodes, 2ʰ leaves |
| Distinct shapes / BSTs with n keys | **Cₙ**: 1, 1, 2, 5, 14, 42 (n = 0…5) |

- **Full** = every node has 0 or 2 children. **Complete** = every level full except the last, filled from the left. **Perfect** = full and complete with all leaves on one level.

**Traversals**

| Traversal | Order | Uses |
|---|---|---|
| Preorder | Root, Left, Right | Copy a tree, prefix form |
| Inorder | Left, Root, Right | BST → sorted, infix form |
| Postorder | Left, Right, Root | Delete a tree, postfix form |
| Level order | Level by level, with a **queue** | BFS |

Example: A(B(D, E), C(−, F)) → Pre **A B D E C F**, In **D B E A C F**, Post **D E B F C A**, Level **A B C D E F**.

- The first node of preorder and the last of postorder are the root. Inorder plus pre- or postorder gives a unique tree; **pre + post does not**.

**Balanced and search trees**

| Tree | Rule | Height / bound | Notes |
|---|---|---|---|
| BST | left < node < right | avg O(log n), worst n − 1 | Inorder = sorted. Delete with two children: replace by the inorder successor (min of the right subtree). |
| AVL | BF = h(L) − h(R) ∈ {−1, 0, +1} | < 1.44 log₂(n + 2); min nodes N(h) = 1, 2, 4, 7, 12, 20 | Insertion needs at most 1 (single or double) rotation |
| Red–black | Root black, no red–red, equal black-height | ≤ 2 log₂(n + 1) | ≤ 2 rotations per insert, ≤ 3 per delete; C++ map, Java TreeMap |
| B-tree, order m | ≤ m children, **≤ m − 1 keys**; non-root ≥ ⌈m/2⌉ children (≥ ⌈m/2⌉ − 1 keys); root ≥ 2 children | O(logₘ n) | All leaves on one level; overflow → split, median goes up; grows at the root |
| B+ tree | Data only in the leaves; leaves linked | O(logₘ n) | Fast range queries; DBMS indexes |
| Max-heap | Complete tree, parent ≥ children | ⌊log₂ n⌋ | Not sorted; leaves at indices ⌊n/2⌋ … n − 1 (0-based) |

- B-tree order 5: at most 4 keys and at least 2 per non-root node. Order 3 is a 2-3 tree; order 4 is a 2-3-4 tree.

**Heap array indices**

| Indexing | Left | Right | Parent |
|---|---|---|---|
| 0-based | 2i + 1 | 2i + 2 | ⌊(i − 1)/2⌋ |
| 1-based | 2i | 2i + 1 | ⌊i/2⌋ |

- Build-heap from [4, 10, 3, 5, 1, 8, 7] gives **10 5 8 4 1 3 7**, in O(n).

**AVL rotations**

| Case | New key went into | Fix |
|---|---|---|
| LL (BF +2) | left subtree of the left child | single **right** rotation |
| RR (BF −2) | right subtree of the right child | single **left** rotation |
| LR (BF +2) | right subtree of the left child | left at the child, then right at the node |
| RL (BF −2) | left subtree of the right child | right at the child, then left at the node |

- Inserting 10, 30, 20 → RL rotation, root 20. Inserting 1…7 into an AVL tree gives the perfect tree 4(2(1, 3), 6(5, 7)).

---

## 7. Graphs

**Formulas**

| Quantity | Value |
|---|---|
| Handshake | **Σ deg = 2E**, so the number of odd-degree vertices is even (directed: Σ in = Σ out = E) |
| Kₙ edges | **n(n − 1)/2** (directed: n(n − 1)); every degree n − 1 |
| Tree / forest of k trees | **n − 1** / n − k edges |
| ⭐ Path Pₙ (n > 2) | n − 1 edges; **2 vertices of degree 1, n − 2 of degree 2** (24 Jun 2023 S3) |
| Cycle Cₙ | n edges, all degrees 2 |
| Star K₁,ₙ₋₁ | centre degree n − 1, n − 1 leaves |
| K_{m,n} | mn edges |
| k-regular graph | nk/2 edges |
| Spanning trees of Kₙ (Cayley) | **nⁿ⁻²** (K₃ = 3, K₄ = 16) |
| Planar graph | V − E + F = 2; E ≤ 3V − 6 |

- Bipartite ⇔ no odd cycle ⇔ 2-colourable. χ(Kₙ) = n; χ of an even cycle = 2, of an odd cycle = 3; planar graphs need ≤ 4 colours.

**Representations**

| | Adjacency matrix | Adjacency list |
|---|---|---|
| Space | **O(V²)** | **O(V + E)** |
| Is (u, v) an edge? | **O(1)** | O(deg u) |
| List the neighbours | O(V) | O(deg u) |
| Best for | Dense graphs | Sparse graphs, traversals |

- The undirected matrix is symmetric, and its row sum is the degree. An incidence matrix is V × E.

**BFS vs DFS**

| Point | BFS | DFS |
|---|---|---|
| Data structure | **Queue** | **Stack** / recursion |
| Order | Level by level | Deep first, then backtrack |
| Time | O(V + E) list; O(V²) matrix | same |
| Unweighted shortest path | **Yes** | No |
| Tree analogue | Level order | Preorder |
| Uses | Shortest path, bipartite test, web crawler | Cycle detection (back edge), topological sort, SCC, mazes |

- Undirected DFS gives only tree and back edges. A directed graph has a cycle ⇔ DFS finds a back edge.
- **Topological sort**: only for a **DAG**, usually not unique. Kahn's method repeatedly removes an in-degree-0 vertex; the DFS method outputs the reverse of the finish order. Both are O(V + E).

**MST** (a spanning tree has **V − 1 edges**; distinct weights make the MST unique)

| Point | Prim | Kruskal |
|---|---|---|
| Idea | Grow one tree; take the cheapest edge leaving it | Sort all edges; add one if it forms no cycle |
| Needs | Priority queue / key array | Sorting + union–find |
| Time | O(V²) matrix; O(E log V) heap | O(E log E) = O(E log V) |
| Best for | Dense graphs | Sparse graphs |
| Technique | Greedy | Greedy |

**Shortest paths**

| Algorithm | Problem | Negative edges | Technique | Time |
|---|---|---|---|---|
| BFS | Single source, unweighted | – | Traversal | O(V + E) |
| Dijkstra | Single source | **No** | Greedy | O(V²); O((V + E) log V) with a heap |
| Bellman–Ford | Single source | Yes; detects negative cycles | DP | **O(VE)** (V − 1 passes) |
| ⭐ Floyd–Warshall | **All pairs** | Yes (no negative cycle) | **DP** | **O(V³)** |
| DAG shortest path | Single source | Yes | Topological order | O(V + E) |

**Euler vs Hamiltonian**

| | Euler | Hamiltonian |
|---|---|---|
| Visits | Every **edge** once | Every **vertex** once |
| Circuit | Connected, **all degrees even** | No easy test (NP-complete) |
| Path (not a circuit) | **Exactly 2** odd-degree vertices | Dirac (deg ≥ n/2) and Ore are sufficient conditions |
| Note | Königsberg has 4 odd vertices, so no Euler path | Kₙ (n ≥ 3) always has one; Kₙ has an Euler circuit only for odd n |

---

## 8. Sorting, searching and hashing

**SORTING MASTER TABLE**

| Algorithm | Best | Average | Worst | Space | Stable | In-place | Technique |
|---|---|---|---|---|---|---|---|
| Bubble (with flag) | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | Brute force / exchange |
| ⭐ Selection | **O(n²)** | O(n²) | **O(n²)** | O(1) | **No** | Yes | Brute force / selection |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | Incremental (decrease and conquer) |
| ⭐ Merge | O(n log n) | **O(n log n)** | O(n log n) | **O(n)** | Yes | **No** | **Divide and conquer** |
| Quick | O(n log n) | O(n log n) | **O(n²)** | O(log n) stack | No | Yes | Divide and conquer (partition) |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No | Yes | Transform and conquer (heap) |
| Shell | O(n log n) | ≈ O(n^1.25–1.5) | O(n²) (Shell's gaps) | O(1) | No | Yes | Diminishing-increment insertion |
| Counting | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | No | Non-comparison |
| Radix (LSD) | O(d(n + k)) | O(d(n + k)) | O(d(n + k)) | O(n + k) | Yes | No | Non-comparison, digit by digit |
| Bucket | O(n + k) | O(n + k) | O(n²) | O(n + k) | Yes* | No | Non-comparison, scatter–gather |

\*Bucket sort is stable only if each bucket is sorted with a stable sort.

- Selection sort always makes n(n − 1)/2 comparisons (15 for n = 6) and **at most n − 1 swaps**, the fewest of all.
- Bubble swaps = insertion shifts = the number of **inversions** (at most n(n − 1)/2).
- Plain bubble sort without the flag is O(n²) even on sorted input.
- Every comparison sort needs **Ω(n log n)** comparisons (a decision tree with n! leaves). Counting, radix and bucket sort escape this bound because they do not compare.
- Merging lists of sizes m and n takes at most m + n − 1 comparisons.

**Which sort when**

| Situation | Choice |
|---|---|
| Small or nearly sorted data | Insertion |
| Expensive writes | Selection (≤ n − 1 swaps) |
| Guaranteed O(n log n) and stable | Merge |
| Guaranteed O(n log n) with O(1) space | Heap |
| Fastest in practice | Quick (random or median-of-3 pivot) |
| Linked list, external (disk) data | Merge (external k-way merge) |
| Small integer range / fixed-length keys | Counting / radix |

**Searching**

| Method | Needs | Best | Average | Worst |
|---|---|---|---|---|
| Linear | nothing | O(1) | O(n), (n + 1)/2 | O(n) |
| Binary | sorted, random access | O(1) | O(log n) | O(log n): **⌊log₂ n⌋ + 1** comparisons (100 → 7, 1000 → 10, 1024 → 11) |
| Interpolation | sorted, uniform keys | O(1) | O(log log n) | O(n) |
| Jump | sorted | O(1) | O(√n) | O(√n), block size √n |
| Hashing | hash function | O(1) | O(1) | O(n) |

**Hashing**

| Item | Fact |
|---|---|
| Division | h(k) = k mod m with m **prime**, away from powers of 2 (1234 mod 11 = 2) |
| Mid-square | Square the key and take the middle digits (3205² = 10272025 → 72) |
| Multiplication | ⌊m(kA mod 1)⌋, Knuth's A ≈ 0.618 |
| Load factor | **α = n/m**. Chaining allows α > 1; open addressing needs α ≤ 1 |
| Chaining (open hashing) | A list per slot; average chain length α; easy deletion |
| Linear probing | h, h + 1, h + 2, … → **primary clustering** |
| Quadratic probing | h, h + 1, h + 4, h + 9, … → **secondary clustering**; can fail when α > ½ |
| Double hashing | h + i·h₂(k), h₂ ≠ 0 and coprime to m → least clustering |
| Deletion in open addressing | Use a "deleted" marker (tombstone) |
| Rehashing | About double the size (next prime) and re-insert everything; amortised O(1) |

- Example: m = 10, keys 89, 18, 49, 58, 69. Linear probing puts 49→0, 58→1, 69→2; quadratic 49→0, 58→2, 69→3; double hashing with h₂ = 7 − (k mod 7) puts 49→6, 58→3, 69→0.

---

## 9. Design techniques

| Technique | Idea | Classic examples | NOT examples |
|---|---|---|---|
| Brute force | Try every possibility | Linear search, bubble/selection sort, naive string match | – |
| ⭐ Divide and conquer | Divide → conquer → combine; **independent** sub-problems | Binary search, **merge sort**, quick sort, **Strassen** (7 mults, O(n^2.81)), max–min (3n/2 − 2), closest pair, Karatsuba | **Floyd–Warshall / APSP** ⭐, 0/1 knapsack, Prim, Kruskal, Dijkstra, linear search |
| Greedy | Locally best choice, never undone | Fractional knapsack (p/w), Huffman, activity selection (finish time), job sequencing, Prim, Kruskal, Dijkstra | 0/1 knapsack, coin change for arbitrary coins |
| Dynamic programming | Optimal substructure + **overlapping** sub-problems; store results | 0/1 knapsack O(nW), LCS O(mn), matrix chain O(n³), **Floyd–Warshall O(V³)**, Bellman–Ford, DP Fibonacci O(n) | Merge sort, binary search |
| Backtracking | DFS of a state-space tree + bounding function | **Sum of subsets**, N-Queens, graph colouring, Hamiltonian cycle | MST, sorting |
| Branch and bound | FIFO/LIFO/least-cost search with cost bounds | 0/1 knapsack, TSP, job assignment | N-Queens (all solutions) |

**Greedy vs DP**

| Point | Greedy | DP |
|---|---|---|
| Choice | One local choice per step | All choices through a table |
| Optimal? | Only if the greedy-choice property holds | Always (given optimal substructure) |
| Speed / memory | Fast, little memory | Slower, needs a table |
| Knapsack | Fractional | 0/1 |
| Shortest path | Dijkstra | Bellman–Ford, Floyd |
| Coins {1, 3, 4} for 6 | 4 + 1 + 1 = 3 coins | 3 + 3 = 2 coins |

- Worked answers: fractional knapsack M = 20, p = (25, 24, 15), w = (18, 15, 10) → **31.5**. Huffman a45 b13 c12 d16 e9 f5 → **224 bits**. LCS(ABCBDAB, BDCABA) = **4**. Matrix chain 10×30, 30×5, 5×60 → (AB)C = **4500**.

**Backtracking vs branch and bound**

| Point | Backtracking | Branch and bound |
|---|---|---|
| Problem | Decision, or all feasible solutions | Optimisation |
| Search | Depth-first | BFS (FIFO), LIFO or least-cost |
| Pruning | Feasibility (bounding function) | Bound on the objective |
| Memory | Low (one path) | Higher (many live nodes) |

**Sum of subsets mini example** ⭐ 24 Jun 2023 S3: w = {2, 7, 8, 9, 15}, m = 17

| Vector | Subset | Sum |
|---|---|---|
| 11100 | 2 + 7 + 8 | 17 ✔ |
| 10001 | 2 + 15 | 17 ✔ |
| 00110 | 8 + 9 | 17 ✔ |
| 10101 (trap) | 2 + 8 + 15 | 25 ✗ |
| 00111 (trap) | 8 + 9 + 15 | 32 ✗ |

- Bounds: include wₖ only if s + wₖ ≤ m; exclude it only if s + r − wₖ ≥ m.
- N-Queens: 4-Queens has **2** solutions, (2, 4, 1, 3) and (3, 1, 4, 2). 8-Queens has **92**.

**P / NP**
- **P**: solvable in polynomial time (sorting, MST, shortest path).
- **NP**: a solution can be **verified** in polynomial time. P ⊆ NP, and P = NP is unsolved.
- **NP-complete**: in NP and NP-hard. SAT was the first (Cook); also 3-SAT, clique, vertex cover, Hamiltonian cycle, subset sum, k-colouring (k ≥ 3).
- **NP-hard**: at least as hard as all of NP and need not be in NP (TSP optimisation, the halting problem).
- 0/1 knapsack's O(nW) is **pseudo-polynomial**, so it does not put knapsack in P.

---

## 10. Last 12 traps

- [ ] 1. **Definiteness**, not finiteness, means "clear and unambiguous". Input is zero or more; output is at least one.
- [ ] 2. A queue inserts at the **rear** and deletes at the **front**. A statement with the ends swapped is false.
- [ ] 3. **Selection sort best case is O(n²)**. Only insertion sort and flagged bubble sort are O(n) on sorted input.
- [ ] 4. Merge sort is O(n log n) in **all** cases, **stable** and **not in-place**. Heap sort is in-place and unstable.
- [ ] 5. **Floyd–Warshall / APSP is DP**, not divide and conquer. Prim, Kruskal and Dijkstra are greedy.
- [ ] 6. A path graph has **n − 2** vertices of degree 2. "2" is the count of degree-1 vertices.
- [ ] 7. n² log n lies **between** n² and n³, and n log n between n and n². 2²ⁿ ≠ O(2ⁿ).
- [ ] 8. Row-major multiplies by the **number of columns**. Always subtract the lower bound; elements = UB − LB + 1.
- [ ] 9. ^ is **right-associative**: A^B^C → ABC^^. In postfix evaluation the first value popped is the **right** operand.
- [ ] 10. The BST worst case is **O(n)**. Build-heap is **O(n)**. A B-tree of order m holds at most **m − 1** keys per node.
- [ ] 11. A spanning tree has **V − 1** edges, and Kₙ has **nⁿ⁻²** spanning trees. BFS uses a queue, DFS a stack.
- [ ] 12. Linear probing causes **primary** clustering and quadratic probing **secondary**. Binary search worst case = ⌊log₂ n⌋ + 1 comparisons.
