# Trees, BST, AVL, B-Trees & Heaps

**In 30 seconds**
- A tree is a **non-linear**, hierarchical structure: n nodes, exactly **n − 1 edges**, one root, no cycles. ⭐ Asked in DSSSB (binary trees and graphs are *not* linear lists).
- Binary tree: max **2ⁱ** nodes at level i (root = level 0), max **2ʰ⁺¹ − 1** nodes for height h, and always **n₀ = n₂ + 1** (leaves = nodes of degree 2, plus 1).
- Traversals: **Pre = Root-L-R**, **In = L-Root-R**, **Post = L-R-Root**, **Level order = queue**. Inorder + (preorder or postorder) fixes a unique binary tree; preorder + postorder does not.
- **BST**: inorder gives sorted order; search/insert/delete are O(log n) on average but **O(n) in the worst case** (skewed tree from sorted input).
- **AVL**: balance factor = h(left) − h(right) ∈ {−1, 0, +1}; four rotations LL, RR, LR, RL; height O(log n), so every operation is O(log n).
- **B-tree of order m**: at most m children and m − 1 keys per node; every non-root node has at least ⌈m/2⌉ children; all leaves on one level. Used for disk-based indexes.
- **Binary heap**: complete binary tree in an array; insert and delete-max are O(log n), find-max O(1), **build-heap O(n)**, heap sort O(n log n) in every case.
- Distinct binary tree shapes (and distinct BSTs) with n keys = **Catalan number** Cₙ = (2n)! / ((n + 1)! n!) → 1, 1, 2, 5, 14, 42, 132.

---

## 1. Tree terminology

| Term | Meaning |
|---|---|
| Root | The only node with no parent |
| Parent / child | If edge u → v goes downward, u is the parent of v and v is a child of u |
| Siblings | Nodes with the same parent |
| Leaf (external / terminal node) | Node with no children (degree 0) |
| Internal (non-terminal) node | Node with at least one child |
| Degree of a node | Number of children it has |
| Degree of a tree | Maximum degree of any node in it |
| Level | Root is at level 0 (some books use 1); a child is one level below its parent |
| Depth of a node | Number of edges from the root to that node (= its level when the root is level 0) |
| Height of a node | Number of edges on the longest path from that node down to a leaf |
| Height of the tree | Height of the root (a single node has height 0; an empty tree −1) |
| Path / path length | A sequence of nodes joined by edges; length = number of edges |
| Ancestor / descendant | Any node on the path from the root to x / any node below x |
| Subtree | A node together with all its descendants |
| Forest | A set of disjoint trees (delete the root of a tree → you get a forest) |

**Convention warning.** Some books count height in *levels* (single node = height 1). Then max nodes = 2ʰ − 1 instead of 2ʰ⁺¹ − 1. In an MCQ, check which convention the options use.

## 2. Binary tree types

A **binary tree** is a tree in which every node has at most 2 children, called left and right (order matters).

| Type | Definition | Example property |
|---|---|---|
| Full / strict / proper (2-tree) | Every node has 0 or 2 children | With i internal nodes: n = 2i + 1 nodes, i + 1 leaves |
| Complete | All levels completely filled except possibly the last, which is filled **from the left** | Fits an array with no gaps; height = ⌊log₂ n⌋ |
| Perfect | All internal nodes have 2 children and all leaves are at the same level | n = 2ʰ⁺¹ − 1, leaves = 2ʰ |
| Skewed (left / right) | Every node has only a left (or only a right) child | Height = n − 1; behaves like a linked list |
| Extended binary tree | Replace every empty subtree by a special **external** node (square) | External nodes = internal nodes + 1; E = I + 2n (external path length = internal path length + 2n) |

Every perfect tree is full and complete. A complete tree need not be full, and a full tree need not be complete. Some Indian textbooks use "complete binary tree" to mean perfect; read the definition given in the question.

## 3. Binary tree properties and formulas

| Property | Formula (root at level 0, height in edges) |
|---|---|
| Max nodes at level i | 2ⁱ |
| Max nodes in a tree of height h | 2ʰ⁺¹ − 1 |
| Min nodes in a tree of height h | h + 1 (skewed tree) |
| Min height with n nodes | ⌈log₂(n + 1)⌉ − 1 = ⌊log₂ n⌋ |
| Max height with n nodes | n − 1 |
| Edges | n − 1 (every node except the root has exactly one parent edge) |
| Leaves vs degree-2 nodes | **n₀ = n₂ + 1** (n₁ does not matter) |
| Null (empty) child links in linked form | n + 1 (2n links in all, n − 1 are used) |
| Distinct binary tree shapes with n nodes | Catalan Cₙ = (2n)! / ((n + 1)! · n!) |
| Distinct BSTs with keys 1..n | Cₙ |
| Distinct labelled binary trees with n nodes | n! · Cₙ |

**Proof of n₀ = n₂ + 1.** Count nodes: n = n₀ + n₁ + n₂. Count edges: n − 1 = n₁ + 2n₂. Subtract: 1 = n₀ − n₂.

**Catalan values:** C₀ = 1, C₁ = 1, C₂ = 2, C₃ = 5, C₄ = 14, C₅ = 42, C₆ = 132, C₇ = 429 (checked by brute-force counting). With 3 labelled nodes: 3! × 5 = 30 binary trees.

## 4. Representation

**Array (sequential) representation** — best for complete trees and heaps.

| Indexing | Left child | Right child | Parent |
|---|---|---|---|
| 0-based (root at 0) | 2i + 1 | 2i + 2 | ⌊(i − 1)/2⌋ |
| 1-based (root at 1) | 2i | 2i + 1 | ⌊i/2⌋ |

A skewed tree of height h wastes space: it needs an array of 2ʰ⁺¹ − 1 cells for only h + 1 nodes.

**Linked representation** — each node is `struct node { int data; struct node *left, *right; };`. Space is exactly n nodes; n + 1 of the 2n pointers are NULL.

## 5. Traversals

| Traversal | Order | Data structure used | Use |
|---|---|---|---|
| Preorder | Root, Left, Right | Stack / recursion | Copy a tree, prefix expression |
| Inorder | Left, Root, Right | Stack / recursion | BST → sorted order, infix expression |
| Postorder | Left, Right, Root | Stack / recursion | Delete/free a tree, postfix expression |
| Level order (BFS) | Level by level, left to right | **Queue** | Shortest depth, printing by levels |

All four take O(n) time. Recursive ones use O(h) extra space; level order uses O(width).

**Shortcuts:** the first node of preorder and the last node of postorder are always the root. In inorder, the root splits the list into left subtree | right subtree.

### Example tree T1
```
        A
       / \
      B   C
     / \   \
    D   E   F
```
| Traversal | Result |
|---|---|
| Preorder | A B D E C F |
| Inorder | D B E A C F |
| Postorder | D E B F C A |
| Level order | A B C D E F |

### Example tree T2
```
          1
        /   \
       2     3
      / \     \
     4   5     6
        / \
       7   8
```
| Traversal | Result |
|---|---|
| Preorder | 1 2 4 5 7 8 3 6 |
| Inorder | 4 2 7 5 8 1 3 6 |
| Postorder | 4 7 8 5 2 6 3 1 |
| Level order | 1 2 3 4 5 6 7 8 |

### Example tree T3 — an expression tree for (a + b) * c − d / e
```
            -
          /   \
         *     /
        / \   / \
       +   c d   e
      / \
     a   b
```
| Traversal | Result | Meaning |
|---|---|---|
| Preorder | − * + a b c / d e | Prefix (Polish) form |
| Inorder | a + b * c − d / e | Infix form (add brackets to keep meaning) |
| Postorder | a b + c * d e / − | Postfix (reverse Polish) form |
| Level order | − * / + c d e a b | — |

**Expression tree rules:** leaves are operands, internal nodes are operators. Build it from postfix with a stack: push operands; for an operator pop two trees (first pop = right child), join them, push the new tree.

## 6. Reconstructing a tree from traversals (worked)

**Given:** Preorder = A B D G E C F H I, Inorder = D G B E A H F C I.

| Step | Preorder gives root | Inorder split (left \| root \| right) |
|---|---|---|
| 1 | A | D G B E \| A \| H F C I |
| 2 | Left part, next in preorder: B | D G \| B \| E |
| 3 | Next: D | (empty) \| D \| G → G is D's right child |
| 4 | E is a single node → right child of B | — |
| 5 | Right part, next in preorder: C | H F \| C \| I |
| 6 | Next: F | H \| F \| (empty) → H is F's left child |
| 7 | I is a single node → right child of C | — |

```
           A
         /   \
        B     C
       / \   / \
      D   E F   I
       \   /
        G H
```
**Check:** its postorder is G D E B H F I C A.

**From postorder + inorder:** same idea, but take roots from the **end** of postorder and build the **right** subtree first. Given Postorder = G D E B H F I C A and the same inorder, the last element A is the root, then C (root of the right part), then I, F, H, and so on; you get the same tree.

**Preorder + postorder is not enough.** A with only a left child B and A with only a right child B both give Pre = A B and Post = B A. (It is unique only when the tree is known to be full.)

## 7. Threaded binary trees

A binary tree with n nodes has n + 1 NULL links. A **threaded binary tree** reuses them:
- a NULL **left** link points to the node's **inorder predecessor**;
- a NULL **right** link points to the node's **inorder successor**;
- each node keeps two flag bits (lthread, rthread) to tell a thread from a real child link.

Result: inorder traversal needs **no stack and no recursion**. In T1 (inorder D B E A C F): E's left thread → B and right thread → A; C's left thread → A; F's left thread → C. D's left link and F's right link have no predecessor/successor (they point to a header node, if one is used). T1 has 6 nodes and 7 NULL links. Types: one-way (right threads only) and two-way (both).

## 8. Binary search tree (BST)

**BST property:** for every node, all keys in its left subtree < node key < all keys in its right subtree.
- **Inorder traversal of a BST gives keys in sorted (ascending) order.**
- Minimum = leftmost node; maximum = rightmost node.
- Inorder successor of x = leftmost node of x's right subtree (if the right subtree exists); otherwise the nearest ancestor of which x is in the left subtree.

**Search:** compare with the root; go left if smaller, right if larger; stop when found or at NULL.
**Insert:** search for the key; insert the new node where the search falls off the tree (always as a leaf).

### Building a BST (worked)
Insert 50, 30, 70, 20, 40, 60, 80, 35, 45, 65 in this order:
```
            50
          /    \
        30      70
       /  \    /  \
      20  40  60   80
         / \    \
        35 45    65
```
- Height = 3. Inorder = 20 30 35 40 45 50 60 65 70 80 (sorted, as expected).
- Preorder = 50 30 20 40 35 45 70 60 65 80. Postorder = 20 35 45 40 30 65 60 80 70 50.
- Searching 45 compares 50 → 30 → 40 → 45: **4 comparisons**.

### Delete — three cases (worked on the tree above, one after another)
| Case | Rule | Example | Result |
|---|---|---|---|
| 1. Leaf | Just remove it | Delete 20 | 30 now has only right child 40 |
| 2. One child | Link the parent directly to that child | Delete 60 (child 65) | 70 now has children 65 and 80 |
| 3. Two children | Replace the key by its **inorder successor** (minimum of the right subtree), then delete the successor (which has at most one child). The inorder predecessor (maximum of the left subtree) also works. | Delete 50 → successor is 65 | Root becomes 65 |

After deleting 20, 60, 50:
```
          65
        /    \
      30      70
        \       \
        40       80
       /  \
      35  45
```

### BST complexity
| Operation | Best | Average | Worst (skewed) |
|---|---|---|---|
| Search | O(1) (key at root) | O(log n) | O(n) |
| Insert | O(1) | O(log n) | O(n) |
| Delete | O(1) | O(log n) | O(n) |
| Find min / max | O(1) | O(log n) | O(n) |
| Inorder traversal | O(n) | O(n) | O(n) |

Inserting already-sorted keys (10, 20, 30, 40, 50) builds a right-skewed tree of height 4 = n − 1. This is why balanced trees (AVL, red–black, B-trees) exist. Building a BST of n keys costs O(n log n) on average and O(n²) in the worst case.

## 9. AVL trees (Adelson-Velsky and Landis, 1962)

- **Balance factor (BF) = height(left subtree) − height(right subtree).**
- AVL tree = BST in which **every node has BF ∈ {−1, 0, +1}**.
- After an insertion, walk up from the new node; the first node with BF = ±2 is rebalanced by a rotation.

| Case | Where the new key went (from the unbalanced node X) | BF of X | Fix |
|---|---|---|---|
| LL | Left subtree of the left child | +2 | One **right** rotation at X |
| RR | Right subtree of the right child | −2 | One **left** rotation at X |
| LR | Right subtree of the left child | +2 | Left rotation at the left child, then right rotation at X (double) |
| RL | Left subtree of the right child | −2 | Right rotation at the right child, then left rotation at X (double) |

All four three-key cases give the same balanced tree 20(10, 30):
| Insert order | Case | Result |
|---|---|---|
| 30, 20, 10 | LL at 30 | 20 with children 10, 30 |
| 10, 20, 30 | RR at 10 | 20 with children 10, 30 |
| 30, 10, 20 | LR at 30 | 20 with children 10, 30 |
| 10, 30, 20 | RL at 10 | 20 with children 10, 30 |

### Worked AVL insertion: 40, 20, 10, 25, 30, 22, 50
| Insert | Imbalance | Rotation | Tree after (root(left, right)) |
|---|---|---|---|
| 40 | — | — | 40 |
| 20 | — | — | 40(20, −) |
| 10 | BF(40) = +2, key in left of left | **LL** → right rotate 40 | 20(10, 40) |
| 25 | — | — | 20(10, 40(25, −)) |
| 30 | BF(40) = +2, key in right of left child 25 | **LR** → left rotate 25, right rotate 40 | 20(10, 30(25, 40)) |
| 22 | BF(20) = −2, key in left of right child 30 | **RL** → right rotate 30, left rotate 20 | 25(20(10, 22), 30(−, 40)) |
| 50 | BF(30) = −2, key in right of right child 40 | **RR** → left rotate 30 | 25(20(10, 22), 40(30, 50)) |

Final tree (every BF = 0):
```
            25
          /    \
        20      40
       /  \    /  \
      10  22  30   50
```
**Second example:** inserting 1, 2, 3, 4, 5, 6, 7 needs four RR rotations (at 1, 3, 2, 5) and ends as the perfect tree 4(2(1, 3), 6(5, 7)). A plain BST would have become a chain of height 6.

### AVL height bound
- Minimum nodes in an AVL tree of height h: N(h) = N(h − 1) + N(h − 2) + 1, with N(0) = 1, N(1) = 2 → 1, 2, 4, 7, 12, 20, 33, 54 (Fibonacci-like).
- Hence height < 1.44 log₂(n + 2), i.e. **O(log n)**. Search, insert and delete are all O(log n) in the worst case.
- Insertion needs at most **one** (single or double) rotation; deletion may need O(log n) rotations.

## 10. Red–black trees (one table)

| Property / fact | Statement |
|---|---|
| 1 | Every node is red or black |
| 2 | The root is black |
| 3 | Every leaf (NIL) is black |
| 4 | A red node has only black children (no two reds in a row) |
| 5 | Every path from a node to its descendant NIL leaves has the same number of black nodes (black-height) |
| Height | ≤ 2 log₂(n + 1) → O(log n) |
| Rotations | At most 2 per insertion, at most 3 per deletion |
| vs AVL | AVL is more strictly balanced (faster search); red–black does fewer rotations (faster updates) |
| Used in | C++ `std::map`, Java `TreeMap`, Linux scheduler |

## 11. B-trees and B+-trees

**Why:** on a disk, reading one block costs far more than comparing keys in memory. A B-tree node is one disk block holding many keys, so the tree is very short (height O(logₘ n)) and a search needs only a few disk reads. Database and file-system **indexes** use B-trees / B+-trees.

### B-tree of order m (Knuth: order = maximum number of children)
| Node | Children | Keys |
|---|---|---|
| Root (if not a leaf) | 2 to m | 1 to m − 1 |
| Other internal node | ⌈m/2⌉ to m | ⌈m/2⌉ − 1 to m − 1 |
| Leaf | 0 | ⌈m/2⌉ − 1 to m − 1 (root leaf: 1 to m − 1) |

Also: keys in a node are sorted; a node with k keys has k + 1 children; **all leaves are on the same level** (the tree grows only at the root).

| Order m | Keys per non-root node | Children per internal non-root node |
|---|---|---|
| 3 (2-3 tree) | 1–2 | 2–3 |
| 4 (2-3-4 tree) | 1–3 | 2–4 |
| 5 | 2–4 | 3–5 |

**Insertion:** always insert into the correct leaf. If the leaf now has m keys (overflow), **split** it: the median key moves up to the parent, the left and right halves become two nodes. If the parent overflows, split again; if the root splits, a new root is made and the height increases by 1.

### Worked insertion: order 3, keys 10, 20, 30, 40, 50, 60, 70
| Insert | Event | Tree (root{children}) |
|---|---|---|
| 10, 20 | — | [10 20] |
| 30 | Leaf [10 20 30] overflows → 20 goes up | [20]{[10] [30]} |
| 40 | — | [20]{[10] [30 40]} |
| 50 | Leaf [30 40 50] splits → 40 goes up | [20 40]{[10] [30] [50]} |
| 60 | — | [20 40]{[10] [30] [50 60]} |
| 70 | Leaf [50 60 70] splits → 60 up; root [20 40 60] splits → 40 up | [40]{[20]{[10] [30]} [60]{[50] [70]}} |

**Order 5** (max 4 keys): inserting 10, 20, 30, 40 fills one leaf; 50 causes overflow [10 20 30 40 50] → median 30 goes up: [30]{[10 20] [40 50]}. Then 60, 70 → [40 50 60 70]; 80 splits it with median 60 → [30 60]{[10 20] [40 50] [70 80]}.

**Deletion (idea):** if a node falls below the minimum, borrow a key from a sibling through the parent; if the sibling is also at minimum, merge the two nodes with the separating parent key.

### B+-tree
| Feature | B-tree | B+-tree |
|---|---|---|
| Where data/records are | In every node | **Only in the leaves** |
| Internal nodes | Keys + data | Only index (separator) keys |
| Duplicate keys | No | A separator key is **copied** up and also stays in a leaf |
| Leaves | Not linked | **Linked as a list** → fast range queries and sequential scan |
| Search | Can end at an internal node | Always goes down to a leaf |
| Use | General | Most DBMS and file-system indexes |

## 12. Heaps and priority queues

**Binary heap** = a **complete** binary tree stored in an array, with the heap property:
- **Max-heap:** every parent ≥ its children → maximum at the root.
- **Min-heap:** every parent ≤ its children → minimum at the root.
A heap is **not** sorted, and its inorder traversal is not sorted; only the root is guaranteed. In an n-node heap (0-based), the leaves are at indices ⌊n/2⌋ to n − 1.

**Heapify (sift-down) at i:** compare a[i] with its children; swap with the larger child (max-heap) if a child is bigger; repeat at the new position. O(log n).

### Insert into a max-heap (sift-up): 35, 33, 42, 10, 14, 19, 27, 44, 26, 31
New key goes at the end; while it is larger than its parent, swap upward.
| Insert | Array after (index 0 = root) |
|---|---|
| 35 | 35 |
| 33 | 35 33 |
| 42 | 42 33 35 (42 swaps with 35) |
| 10 | 42 33 35 10 |
| 14 | 42 33 35 10 14 |
| 19 | 42 33 35 10 14 19 |
| 27 | 42 33 35 10 14 19 27 |
| 44 | 44 42 35 33 14 19 27 10 (44 rises past 10, 33, 42) |
| 26 | 44 42 35 33 14 19 27 10 26 |
| 31 | 44 42 35 33 31 19 27 10 26 14 (31 swaps with 14) |

### Delete max
Remove the root 44, move the last element (14) to the root, then sift down: 14 ↔ 42, 14 ↔ 33, 14 ↔ 26.
Result: **42 33 35 26 31 19 27 10 14**.

### Build-heap (bottom-up, Floyd) on [4, 10, 3, 5, 1, 8, 7]
Call heapify for i = ⌊n/2⌋ − 1 down to 0 (n = 7 → i = 2, 1, 0).
| Step | Action | Array |
|---|---|---|
| start | — | 4 10 3 5 1 8 7 |
| i = 2 | 3 < child 8 → swap | 4 10 8 5 1 3 7 |
| i = 1 | 10 ≥ 5, 1 → no change | 4 10 8 5 1 3 7 |
| i = 0 | 4 ↔ 10, then 4 ↔ 5 | **10 5 8 4 1 3 7** |

**Build-heap is O(n), not O(n log n)**: most nodes are near the bottom and sift down only a short distance (Σ h·n/2ʰ⁺¹ = O(n)). Inserting n keys one by one costs O(n log n).

### Heap sort on the heap above
Repeat: swap root with the last element of the heap, shrink the heap by 1, heapify the root.
| Heap size after | Array (sorted tail after the bar) |
|---|---|
| 6 | 8 5 7 4 1 3 \| 10 |
| 5 | 7 5 3 4 1 \| 8 10 |
| 4 | 5 4 3 1 \| 7 8 10 |
| 3 | 4 1 3 \| 5 7 8 10 |
| 2 | 3 1 \| 4 5 7 8 10 |
| 1 | 1 \| 3 4 5 7 8 10 |

Heap sort: **O(n log n) best, average and worst**; in-place (O(1) extra); **not stable**. A max-heap gives ascending order.

### Priority queue
Elements leave in order of priority, not arrival.
| Implementation | Insert | Delete highest | Peek |
|---|---|---|---|
| Unsorted array / list | O(1) | O(n) | O(n) |
| Sorted array / list | O(n) | O(1) | O(1) |
| **Binary heap** | O(log n) | O(log n) | O(1) |

Uses: Dijkstra's and Prim's algorithms, CPU scheduling, Huffman coding, event simulation.

## 13. Two more trees (one line each)
- **Trie (prefix tree):** each edge is a character, a root-to-node path spells a prefix; search/insert a word of length L in O(L); used for dictionaries and autocomplete.
- **Segment tree:** a binary tree over array ranges that answers range queries (sum/min/max) and point updates in O(log n), build O(n), space about 4n.

## 14. Complexity summary

| Structure / operation | Search | Insert | Delete | Other |
|---|---|---|---|---|
| Binary tree (unordered) | O(n) | O(1) at a known spot | O(n) | Traversal O(n) |
| BST — average | O(log n) | O(log n) | O(log n) | Inorder = sorted |
| BST — worst (skewed) | O(n) | O(n) | O(n) | Sorted input |
| AVL tree | O(log n) | O(log n) | O(log n) | Height < 1.44 log₂ n |
| Red–black tree | O(log n) | O(log n) | O(log n) | Height ≤ 2 log₂(n + 1) |
| B-tree / B+-tree (order m) | O(log n) | O(log n) | O(log n) | O(logₘ n) disk reads |
| Binary heap | O(n) any key | O(log n) | O(log n) root | Find max/min O(1); build O(n) |
| Heap sort | — | — | — | O(n log n) all cases, not stable |
| Trie | O(L) | O(L) | O(L) | L = key length |
| Segment tree | Query O(log n) | Update O(log n) | — | Build O(n) |
| Pre/In/Post/Level traversal | — | — | — | O(n) time |

---

## Exam traps
1. **Trees and graphs are non-linear**; arrays, stacks, queues and linked lists are linear. ⭐ Asked in DSSSB.
2. Root at level 0 vs level 1 and height in edges vs in levels change the formulas (2ʰ⁺¹ − 1 vs 2ʰ − 1). Match the options.
3. **BST worst case is O(n)**, not O(log n): sorted insertions give a skewed tree.
4. Inorder of a **BST** is sorted; inorder of a **heap** is not.
5. **Build-heap is O(n)**; n separate insertions are O(n log n).
6. Heap sort is O(n log n) in every case, in-place, and **not stable**.
7. Preorder + postorder does **not** fix a unique binary tree; inorder is needed.
8. n₀ = n₂ + 1 holds for every binary tree, whatever n₁ is.
9. A binary tree with n nodes has **n + 1** NULL links (that is what threading reuses), and n − 1 edges.
10. B-tree of order m: **max keys = m − 1**, not m; min children of a non-root internal node = ⌈m/2⌉.
11. LR rotation = left rotation on the **left child**, then right rotation on the node; RL is the mirror.
12. "Complete" ≠ "full" ≠ "perfect"; a full (strict) tree with i internal nodes has i + 1 leaves.

## One-liners for revision
1. A tree with n nodes has n − 1 edges.
2. A tree is a connected acyclic graph.
3. Root has no parent; a leaf has no child.
4. Degree of a node = number of its children.
5. Siblings share the same parent.
6. Depth is measured from the root down; height from the node down to the deepest leaf.
7. Max nodes at level i = 2ⁱ.
8. Max nodes of height h = 2ʰ⁺¹ − 1.
9. Min height with n nodes = ⌊log₂ n⌋.
10. n₀ = n₂ + 1.
11. Full binary tree: n = 2i + 1, leaves = i + 1.
12. Complete tree: all levels full except the last, filled from the left.
13. Skewed tree height = n − 1.
14. Extended binary tree: external nodes = internal nodes + 1.
15. Array children (0-based): 2i + 1 and 2i + 2; parent ⌊(i − 1)/2⌋.
16. Array children (1-based): 2i and 2i + 1; parent ⌊i/2⌋.
17. Preorder: Root-Left-Right.
18. Inorder: Left-Root-Right.
19. Postorder: Left-Right-Root.
20. Level order uses a queue.
21. First of preorder = root = last of postorder.
22. Expression tree: preorder = prefix, inorder = infix, postorder = postfix.
23. Distinct binary trees / BSTs with n nodes = Catalan number (5 for n = 3, 14 for n = 4).
24. Threaded tree: NULL links point to inorder predecessor/successor.
25. Inorder of a BST is sorted ascending.
26. BST min = leftmost node; max = rightmost node.
27. BST delete with two children: replace by inorder successor (min of right subtree).
28. BST search: average O(log n), worst O(n).
29. AVL balance factor = h(left) − h(right), allowed −1, 0, +1.
30. LL → right rotation; RR → left rotation; LR and RL → double rotations.
31. AVL height < 1.44 log₂ n.
32. Red–black: root black, no red-red, equal black-height.
33. B-tree order m: up to m children and m − 1 keys; all leaves at one level.
34. B-tree overflow → split; median goes up; tree grows at the root.
35. B+-tree: data only in leaves, leaves linked for range queries.
36. Max-heap: parent ≥ children; root is the maximum.
37. Heap insert and delete: O(log n); find max: O(1).
38. Build-heap: O(n).
39. Heap sort: O(n log n), in-place, unstable.
40. A binary heap is the usual priority-queue implementation.

## Quick self-check
1. A binary tree has 20 leaves. How many nodes have two children? — **19** (n₂ = n₀ − 1).
2. Maximum nodes in a binary tree of height 4 (root height 0)? — **31** (2⁵ − 1).
3. Preorder of the tree whose inorder is D B E A C F and postorder is D E B F C A? — **A B D E C F** (tree T1).
4. Number of distinct BSTs with keys 1, 2, 3, 4? — **14**.
5. Insert 50, 30, 70, 20, 40 into an empty BST. What is the postorder? — **20 40 30 70 50**.
6. In a BST, which node replaces a deleted node that has two children? — Its **inorder successor** (smallest key in the right subtree), or the inorder predecessor.
7. AVL insertion of 10, 30, 20: which rotation and which root? — **RL** rotation; root **20**.
8. A B-tree of order 5: maximum and minimum keys in a non-root node? — Max **4**, min **2**.
9. Max-heap [10 5 8 4 1 3 7]: array after deleting the maximum? — **8 5 7 4 1 3** (the last element 7 moves to the root and swaps with its larger child 8).
10. Time to build a heap of n elements bottom-up? — **O(n)**.
