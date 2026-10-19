# Data Structures & Algorithms: DSSSB TGT Computer Science Revision Notes

## 1. One-page summary

- Expect about 8-10 DSA questions. Favourites are infix/postfix conversion, traversals, sorting complexities and stability, binary search counts, stack/queue applications and Big-O of loops.
- Learn complexities as a table, not one by one. Many questions are "which has the worst case O(n²)?".
- For a trace question (heap insert, BST delete, hashing, bubble pass), write the array on paper step by step. Most wrong options are a mistake made at one step.
- Linear structures: array, stack, queue, linked list. Non-linear structures: tree, graph. Static: array. Dynamic: linked list.

## 2. Arrays

- Elements are stored contiguously, so index access is O(1). Insertion or deletion at the front or middle is O(n) because of shifting.
- Row-major: Address(A[i][j]) = B + [(i − Lr) × N + (j − Lc)] × w, where N = number of columns.
- Column-major: Address(A[i][j]) = B + [(j − Lc) × M + (i − Lr)] × w, where M = number of rows.
- Number of elements in A[l1..u1][l2..u2] = (u1 − l1 + 1) × (u2 − l2 + 1).
- A triangular n × n matrix has n(n + 1)/2 possibly non-zero elements. A sparse matrix is stored as (row, column, value) triplets.

## 3. Operations on data structures

| Structure | Access | Search | Insert | Delete | Remark |
|---|---|---|---|---|---|
| Array (unsorted) | O(1) | O(n) | O(1) at end, O(n) at front | O(n) | Contiguous memory |
| Sorted array | O(1) | O(log n) | O(n) | O(n) | Binary search possible |
| Singly linked list | O(n) | O(n) | O(1) at head | O(1) at head, O(n) at tail | No random access |
| Doubly linked list | O(n) | O(n) | O(1) with node pointer | O(1) with node pointer | Extra prev pointer |
| Stack (push/pop) | top only | O(n) | O(1) | O(1) | LIFO |
| Queue (enqueue/dequeue) | front only | O(n) | O(1) | O(1) | FIFO |
| BST (balanced / skewed) | – | O(log n) / O(n) | O(log n) / O(n) | O(log n) / O(n) | Inorder gives sorted output |
| Binary heap | max/min O(1) | O(n) | O(log n) | O(log n) delete-root | Build heap O(n) |
| Hash table | – | O(1) average, O(n) worst | O(1) average | O(1) average | Collisions decide the worst case |

## 4. Stacks

- Overflow happens on a push to a full stack. Underflow happens on a pop from an empty stack.
- Applications: function calls and recursion, expression conversion and evaluation, bracket matching, undo, backtracking, DFS, reversing a string.
- Precedence: ^ (right-associative) > * / % > + − (left-associative).
- A + B * C − D / E → postfix A B C * + D E / −.
- (A + B) * (C − D) → prefix * + A B − C D.
- A + B ^ C ^ D * E → postfix A B C D ^ ^ E * +.
- Postfix evaluation: scan left to right and push operands. For an operator, pop the right operand first, then the left operand, and push the result. Example: 5 3 + 8 2 − * 4 / = 12.
- Stack permutations: with input 1 2 3 4, an output that pops 3 before 2 and then 1 before 2 is impossible.

## 5. Queues

- FIFO: insert at the rear, delete at the front. BFS, CPU scheduling, printer spooling and buffering use queues.
- Circular queue (array of size N, one slot kept empty): full when (rear + 1) % N == front; empty when front == rear (or front == −1 in the counter version). The next index is (i + 1) % N.
- Deque: insertion and deletion at both ends. Input-restricted: insert at one end only. Output-restricted: delete at one end only.
- Priority queue: best built with a heap (O(log n) insert and delete).
- A queue needs 2 stacks; a stack needs 2 queues (or 1 queue with rotation).

## 6. Linked lists

- Node = data + next (+ prev for doubly linked). In a circular list the last node points to the first.
- No binary search, because there is no O(1) access to the middle.
- Reverse in place: O(n) time, O(1) extra space (prev, curr, next).
- Slow/fast pointers find the middle node and detect a cycle (Floyd).
- Recursion that prints after the recursive call prints the list in reverse.

## 7. Trees, BST, AVL and heaps

| Fact | Formula / rule |
|---|---|
| Edges in a tree with n nodes | n − 1 |
| Maximum nodes at level l (root = 0) | 2^l |
| Maximum nodes with height h (root height 0) | 2^(h+1) − 1 |
| Minimum height with n nodes | ⌊log₂ n⌋ |
| Full binary tree | Leaves = internal nodes + 1 |
| Complete binary tree with n nodes | ⌈n/2⌉ leaves |
| Distinct BSTs with n keys | Catalan number = (2n)! / ((n + 1)! n!): 1, 2, 5, 14, 42 |
| Heap in a 1-based array | Children 2i and 2i + 1, parent ⌊i/2⌋ |
| AVL balance factor | −1, 0 or +1 |

- Traversals: preorder (Root-Left-Right), inorder (Left-Root-Right), postorder (Left-Right-Root), level order (queue).
- Inorder together with preorder or postorder determines a unique binary tree. Preorder + postorder alone does not.
- BST deletion: a leaf is removed; a node with one child is bypassed; a node with two children is replaced by its inorder successor (minimum of the right subtree) or its predecessor.
- Heap insert: add at the end and sift up. Delete root: move the last element to the root and sift down, swapping with the larger child in a max-heap.
- Expression tree: its postorder gives postfix and its preorder gives prefix.

## 8. Graphs

- Representations: an adjacency matrix takes O(V²) space and gives an O(1) edge test. An adjacency list takes O(V + E) and suits sparse graphs.
- Handshaking lemma: the sum of the degrees = 2E. A simple undirected graph has at most n(n − 1)/2 edges; a directed one has at most n(n − 1).
- BFS uses a queue and gives the shortest path in an unweighted graph. DFS uses a stack or recursion and is used for cycle detection and topological sort. Both are O(V + E) with lists.
- Topological order exists only for a DAG.
- MST: Kruskal sorts the edges and uses union-find, O(E log E). Prim grows the tree from a vertex. Dijkstra finds single-source shortest paths and fails with negative edges, where Bellman-Ford is used instead.

## 9. Searching and sorting

| Algorithm | Best | Average | Worst | Extra space | Stable? | Note |
|---|---|---|---|---|---|---|
| Linear search | O(1) | O(n) | O(n) | O(1) | – | Average comparisons (n + 1)/2 |
| Binary search | O(1) | O(log n) | O(log n) | O(1) | – | Sorted + random access. Maximum comparisons ⌊log₂ n⌋ + 1 |
| Interpolation search | O(1) | O(log log n) | O(n) | O(1) | – | Uniform data |
| Bubble sort | O(n) (with flag) | O(n²) | O(n²) | O(1) | Yes | Largest element bubbles to the end each pass |
| Selection sort | O(n²) | O(n²) | O(n²) | O(1) | No | Only n − 1 swaps |
| Insertion sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Shifts = inversions; best for nearly sorted data |
| Merge sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | Divide and conquer |
| Quick sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No | Worst case on sorted input with an end pivot |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No | Build heap O(n) |
| Counting sort | O(n + k) | O(n + k) | O(n + k) | O(k) | Yes | Not comparison-based |
| Radix sort | O(d(n + k)) | O(d(n + k)) | O(d(n + k)) | O(n + k) | Yes | Digit by digit |

Comparison sorting needs Ω(n log n) comparisons in the worst case.

## 10. Hashing

- A collision means two keys get the same index. The load factor α = n / m.
- Chaining keeps a linked list per slot, so α can exceed 1.
- Open addressing:
  - Linear probing (h + i) suffers primary clustering.
  - Quadratic probing (h + i²) suffers secondary clustering.
  - Double hashing (h1 + i·h2) reduces both.
- Example: k mod 11, linear probing, keys 14, 25, 36, 47 all hash to 3 and land at 3, 4, 5, 6.

## 11. Recursion and complexity

- Every recursion needs a base case; otherwise the result is a stack overflow. The call stack holds the activation records.
- Tower of Hanoi needs 2ⁿ − 1 moves. Naive fib(n) makes an exponential number of calls (fib(5) makes 15 calls).
- Loops: nested n × n is O(n²); i = i * 2 is O(log n); n × doubling is O(n log n); j ≤ i gives n(n + 1)/2, which is O(n²).
- Master theorem T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a):
  - 2T(n/2) + n = Θ(n log n) (merge sort).
  - T(n/2) + 1 = Θ(log n) (binary search).
  - 4T(n/2) + n = Θ(n²).
- Notations: O is an upper bound, Ω a lower bound, Θ a tight bound, and o / ω are strict bounds. Growth order: 1 < log n < √n < n < n log n < n² < n³ < 2ⁿ < n! < nⁿ.

## 12. Frequently asked in DSSSB

- Infix to postfix or prefix conversion and postfix evaluation.
- Traversal outputs, and rebuilding a tree from inorder + preorder.
- Sorting: worst/best complexity, stability, which sort uses divide and conquer, bubble or selection pass output.
- Binary search conditions and the maximum number of comparisons.
- Stack vs queue applications; circular queue full condition; deque types.
- Big-O of code fragments and the order of growth.

## 13. Fifteen one-liners

1. A stack is LIFO and a queue is FIFO.
2. Recursion and DFS use a stack; BFS and level order use a queue.
3. Inorder traversal of a BST gives the keys in sorted order.
4. A tree with n nodes has n − 1 edges.
5. Building a heap takes O(n); heap sort takes O(n log n) in every case.
6. Merge sort is O(n log n) in all cases but needs O(n) extra space.
7. Quick sort's worst case is O(n²).
8. Insertion sort is O(n) on sorted input.
9. Heap, quick and selection sort are unstable.
10. Binary search needs a sorted array and runs in O(log n).
11. An adjacency matrix takes O(V²) space and an adjacency list takes O(V + E).
12. The sum of the degrees of an undirected graph = 2 × edges.
13. Linear probing causes primary clustering.
14. Three keys give 5 distinct BSTs (Catalan number).
15. Tower of Hanoi with n discs needs 2ⁿ − 1 moves.

## 14. Five traps

1. **Postfix operand order.** For − and /, the first popped value is the RIGHT operand: in "8 2 −" the result is 6, not −6.
2. **Height convention.** Check whether the root is at height 0 or 1. With height h counted from 0 the maximum is 2^(h+1) − 1 nodes; counted from 1 it is 2^h − 1.
3. **BST worst case.** BST search is O(n) for a skewed tree. O(log n) holds only for a balanced tree.
4. **Column-major formula.** In column-major order multiply by the number of ROWS, and subtract the lower bounds first.
5. **Circular-queue conditions.** front == rear means empty, not full, in the one-empty-slot method. The full condition is (rear + 1) % N == front.
