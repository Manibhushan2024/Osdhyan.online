# Arrays & Linked Lists

**In 30 seconds**

- ⭐ **Linear lists** keep their elements in a sequence: **array**, stack, queue and linked list. Trees and graphs are non-linear.
- An **array** is a fixed-size block of **contiguous** memory holding elements of the same type, so **any element can be reached in O(1)** with an address formula.
- **Row-major:** LOC(A[i][j]) = B + w[(i − L₁)·N + (j − L₂)], where N is the number of columns. **Column-major:** LOC = B + w[(j − L₂)·M + (i − L₁)], where M is the number of rows. C uses row-major.
- Number of elements in a dimension = **UB − LB + 1**. A lower-triangular matrix has **n(n+1)/2** non-zeros and a tridiagonal one has **3n − 2**.
- A **linked list** is a chain of nodes (data + pointer) that grows at run time. Access is O(n) and insert/delete at a known position is O(1).
- Singly, doubly and circular lists, plus header (sentinel) nodes. You need the **predecessor** to delete in a singly list.
- Classic pointer tricks: reverse with 3 pointers, find the middle with slow/fast pointers, detect a loop with **Floyd's** tortoise and hare, merge two sorted lists in O(m + n).
- **Overflow** means no free memory for a new node (AVAIL = NULL). **Underflow** means deleting from an empty list (START = NULL).

---

## 1. Arrays

An **array** is a finite, ordered collection of **homogeneous** elements stored in **consecutive memory locations** and accessed by an **index**. It is a **static** structure: its size is fixed when it is declared.

⭐ **Asked in DSSSB (25 Jun 2023, S2):** *Which data structure is categorised as a linear list?* The options were binary tree, graphs, circular queue and array. **Official answer: Array.**

### 1.1 One-dimensional array

- Number of elements = **UB − LB + 1**
- **LOC(A[k]) = Base + w × (k − LB)**, where w is the size of one element in bytes or words. In C, LB = 0, so LOC(A[k]) = Base + w·k.

**Worked:** A[5 … 50], Base = 1200, w = 2.
- Elements = 50 − 5 + 1 = **46**
- LOC(A[20]) = 1200 + 2 × (20 − 5) = 1200 + 30 = **1230**

### 1.2 Two-dimensional array

A 2-D array A[L₁ … U₁][L₂ … U₂] has M = U₁ − L₁ + 1 rows and N = U₂ − L₂ + 1 columns, so it holds M × N elements.

| Order | Stored as | Address of A[i][j] | Used by |
|---|---|---|---|
| **Row-major** | Row 1 completely, then row 2, … | **B + w[(i − L₁)·N + (j − L₂)]** | C, C++, Java, Python (NumPy default) |
| **Column-major** | Column 1 completely, then column 2, … | **B + w[(j − L₂)·M + (i − L₁)]** | FORTRAN, MATLAB, R |

Memory trick: in row-major you skip **whole rows** first, so multiply by the **number of columns** N. In column-major you skip **whole columns**, so multiply by the **number of rows** M.

**Worked 1 (0-based, as in C):** `int A[10][20]`, Base = 2000, w = 4. Find A[5][8]. Here M = 10 and N = 20.
- Row-major: 2000 + 4 × (5 × 20 + 8) = 2000 + 4 × 108 = **2432**
- Column-major: 2000 + 4 × (8 × 10 + 5) = 2000 + 4 × 85 = **2340**

**Worked 2 (non-zero and negative lower bounds):** A[−2 … 5][3 … 8], Base = 500, w = 2. Find A[2][6].
- M = 5 − (−2) + 1 = 8 rows and N = 8 − 3 + 1 = 6 columns, so there are **48 elements**.
- Row-major: 500 + 2 × [(2 − (−2)) × 6 + (6 − 3)] = 500 + 2 × (24 + 3) = **554**
- Column-major: 500 + 2 × [(6 − 3) × 8 + (2 − (−2))] = 500 + 2 × (24 + 4) = **556**

**Worked 3 (find the base):** A[1 … 20][1 … 30] is stored row-major with w = 4, and A[5][10] is at address 1736. What is the base?
- Offset = (5 − 1) × 30 + (10 − 1) = 129 elements = 516 bytes
- Base = 1736 − 516 = **1220**

### 1.3 Multi-dimensional arrays

For A[L₁…U₁][L₂…U₂][L₃…U₃], with dimension sizes n₁, n₂, n₃:
- Row-major: **B + w[(i − L₁)·n₂·n₃ + (j − L₂)·n₃ + (k − L₃)]**, where the last subscript changes fastest.
- Column-major: **B + w[(k − L₃)·n₁·n₂ + (j − L₂)·n₁ + (i − L₁)]**, where the first subscript changes fastest.

**Worked 4:** A[2…5][1…4][3…7], Base = 1000, w = 4. Find A[4][3][5].
- n₁ = 4, n₂ = 4, n₃ = 5, so there are 4 × 4 × 5 = **80 elements**.
- Row-major: (4−2)·4·5 + (3−1)·5 + (5−3) = 40 + 10 + 2 = 52, so the address is 1000 + 4 × 52 = **1208**.
- Column-major: (5−3)·4·4 + (3−1)·4 + (4−2) = 32 + 8 + 2 = 42, so the address is 1000 + 4 × 42 = **1168**.

### 1.4 Array operations

| Operation | Time | Note |
|---|---|---|
| Access / update A[i] | **O(1)** | Through the address formula (random access) |
| Traversal | O(n) | Visit every element once |
| Linear search | O(n) | Works on unsorted data |
| Binary search | O(log n) | Needs sorted data |
| Insert at the end (space available) | O(1) | – |
| Insert at position k (1-based) | O(n) | **n − k + 1** elements shift right |
| Delete at position k | O(n) | **n − k** elements shift left |
| Insert or delete at the beginning | O(n) | Every element shifts |
| Merge two arrays | O(m + n) | – |

### 1.5 Special matrices: storage counts

For an n × n matrix, storing only the elements that may be non-zero:

| Matrix | Elements stored | n = 6 | n = 10 | n = 100 |
|---|---|---|---|---|
| Full | n² | 36 | 100 | 10,000 |
| Diagonal | n | 6 | 10 | 100 |
| Lower (or upper) triangular | **n(n + 1)/2** | 21 | 55 | 5,050 |
| Strictly lower triangular | n(n − 1)/2 | 15 | 45 | 4,950 |
| **Tridiagonal** (\|i − j\| ≤ 1) | **3n − 2** | 16 | 28 | 298 |

Index formulas for a 1-based A[i][j] packed into a 1-D array B[0 …] (checked by script for n = 6):

| Matrix and order | Offset of A[i][j] in B | Example (n = 6) |
|---|---|---|
| Lower triangular, row-major (i ≥ j) | **i(i − 1)/2 + (j − 1)** | A[5][3]: 10 + 2 = **12** |
| Lower triangular, column-major | (j − 1)n − (j − 1)(j − 2)/2 + (i − j) | A[5][3]: 12 − 1 + 2 = **13** |
| Upper triangular, row-major (i ≤ j) | (i − 1)n − (i − 1)(i − 2)/2 + (j − i) | A[2][4]: 6 − 0 + 2 = **8** |
| Tridiagonal, row-major | **2i + j − 3** | A[4][5]: 8 + 5 − 3 = **10** |

Address = Base + w × offset.

### 1.6 Sparse matrices

A **sparse matrix** has most of its elements equal to zero. Storing every element wastes space, so we store only the non-zeros.

**Triplet (3-tuple) representation:** one row (row, col, value) per non-zero. Row 0 is a header holding (rows, cols, number of non-zeros). For t non-zeros this needs **3(t + 1)** words.

The example matrix below is 5 × 6 with 6 non-zeros (0-based indices):

```text
0 0 3 0 0 0
0 0 0 0 0 7
0 4 0 0 0 0
0 0 0 0 0 0
9 0 0 0 5 2
```

| Row | Col | Value |
|---|---|---|
| 5 | 6 | 6 ← header |
| 0 | 2 | 3 |
| 1 | 5 | 7 |
| 2 | 1 | 4 |
| 4 | 0 | 9 |
| 4 | 4 | 5 |
| 4 | 5 | 2 |

Dense storage takes 30 words and the triplet takes 21 words. The triplet form saves space only when **3(t + 1) < m × n**. Sparse matrices can also be stored as **linked lists**, with one node per non-zero holding (row, col, value, next), or with orthogonal row and column lists.

### 1.7 Strings as arrays

In C a string is a **character array ended by the null character `'\0'`**.

```c
char s[] = "HELLO";      /* 6 bytes: H E L L O \0  ->  sizeof(s) = 6, strlen(s) = 5 */
```

- Declaring `char s[5] = "HELLO";` leaves no room for `'\0'`, so the array is not a valid C string.
- Length is O(n) with `strlen` (it scans up to `'\0'`). Accessing one character, s[i], is O(1).

---

## 2. Linked lists

A **linked list** is a linear collection of **nodes**. Each node holds data and a pointer (link) to the next node. The nodes need **not** be contiguous: logical order comes from the links, not from where the nodes sit in memory. START (or HEAD) points to the first node, and the last node's link is **NULL**.

```c
struct node {
    int data;
    struct node *next;
};
struct node *head = NULL;   /* empty list */
```

### 2.1 Types

| Type | Structure | Key property |
|---|---|---|
| **Singly** | data + next | Can be traversed in one direction only |
| **Doubly** | prev + data + next | Can be traversed both ways. A node can be deleted in O(1) if you have a pointer to it. Costs an extra pointer per node. |
| **Circular singly** | The last node's next points to the first | No NULL at the end. With a pointer to the **last** node, inserting at the front and at the end are both O(1). |
| **Circular doubly** | head->prev = last and last->next = head | Can be traversed both ways and in a loop |
| **Header (sentinel) list** | A dummy **header node** comes before the first real node | The list is never "really" empty, so insert and delete need no special case for the first node. The header can store a count. Lipschutz calls it a **grounded** header list if the last node points to NULL, and a **circular** header list if the last node points back to the header. |

### 2.2 Traversal

```c
void traverse(struct node *head) {
    struct node *p = head;
    while (p != NULL) {          /* circular list: do { ... } while (p != head) */
        printf("%d ", p->data);
        p = p->next;
    }
}
```

### 2.3 Insertion

```c
struct node *newnode(int x) {
    struct node *t = (struct node *) malloc(sizeof(struct node));
    if (t == NULL) { printf("Overflow"); exit(1); }   /* no free memory */
    t->data = x; t->next = NULL;
    return t;
}

/* (a) At the beginning: O(1) */
void insert_begin(struct node **head, int x) {
    struct node *t = newnode(x);
    t->next = *head;
    *head = t;
}

/* (b) At the end: O(n) (O(1) if a tail pointer is kept) */
void insert_end(struct node **head, int x) {
    struct node *t = newnode(x), *p = *head;
    if (p == NULL) { *head = t; return; }
    while (p->next != NULL) p = p->next;
    p->next = t;
}

/* (c) After position pos (1-based): O(n) to reach it, O(1) to link */
void insert_after(struct node *head, int pos, int x) {
    struct node *p = head;
    for (int i = 1; i < pos && p != NULL; i++) p = p->next;
    if (p == NULL) return;                 /* invalid position */
    struct node *t = newnode(x);
    t->next = p->next;                     /* step 1: new node points ahead */
    p->next = t;                           /* step 2: predecessor points to new */
}
```

The order of the two statements in (c) matters. If you write `p->next = t` first, you lose the rest of the list.

### 2.4 Deletion

```c
/* (a) From the beginning: O(1) */
void delete_begin(struct node **head) {
    if (*head == NULL) { printf("Underflow"); return; }
    struct node *t = *head;
    *head = t->next;
    free(t);
}

/* (b) From the end: O(n) - must find the second-last node */
void delete_end(struct node **head) {
    if (*head == NULL) { printf("Underflow"); return; }
    struct node *p = *head;
    if (p->next == NULL) { free(p); *head = NULL; return; }
    while (p->next->next != NULL) p = p->next;
    free(p->next);
    p->next = NULL;
}

/* (c) Node with a given key: O(n) - keep the predecessor q */
void delete_key(struct node **head, int key) {
    struct node *p = *head, *q = NULL;
    while (p != NULL && p->data != key) { q = p; p = p->next; }
    if (p == NULL) return;                 /* not found */
    if (q == NULL) *head = p->next;        /* deleting the first node */
    else q->next = p->next;
    free(p);
}
```

**Doubly linked list.** To delete node p, set `p->prev->next = p->next; p->next->prev = p->prev;` which takes O(1) with no search for the predecessor. Inserting in the middle changes **4 pointers**; a singly list changes **2**.

### 2.5 Complexity summary

| Operation | Singly | Doubly | Circular (pointer to last) |
|---|---|---|---|
| Access k-th element | O(n) | O(n) | O(n) |
| Search | O(n) | O(n) | O(n) |
| Insert at beginning | O(1) | O(1) | O(1) |
| Insert at end | O(n) (O(1) with tail) | O(n) (O(1) with tail) | O(1) |
| Delete at beginning | O(1) | O(1) | O(1) |
| Delete at end | O(n) | O(1) with tail | O(n) (singly circular) |
| Delete a given node (pointer known) | O(n) (needs predecessor) | **O(1)** | O(n) |

Binary search is **not** efficient on a linked list, because there is no O(1) access to the middle element.

### 2.6 Standard list algorithms

**Reverse a list** (iteratively, O(n) time, O(1) space):

```c
struct node *reverse(struct node *head) {
    struct node *prev = NULL, *cur = head, *nxt;
    while (cur != NULL) {
        nxt = cur->next;   /* save the rest  */
        cur->next = prev;  /* turn the link  */
        prev = cur;        /* move prev      */
        cur = nxt;         /* move cur       */
    }
    return prev;           /* new head       */
}
```

Example: 10 → 20 → 30 → 40 becomes **40 → 30 → 20 → 10**.

**Find the middle** (slow/fast pointers, one pass):

```c
struct node *middle(struct node *head) {
    struct node *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;          /* 1 step  */
        fast = fast->next->next;    /* 2 steps */
    }
    return slow;
}
```

- For 1 → 2 → 3 → 4 → 5 the middle is **3**.
- For 1 → 2 → 3 → 4 → 5 → 6 the function returns **4**, the second middle. With the condition `fast->next && fast->next->next` it returns 3, the first middle.

**Detect a loop: Floyd's cycle-finding (tortoise and hare).** Move slow 1 step and fast 2 steps. If they ever meet, there is a loop. If fast reaches NULL, there is none. To find the **start of the loop**, put one pointer back at the head and move both 1 step at a time; they meet at the loop start. This takes O(n) time and O(1) space.

Worked: 1 → 2 → 3 → 4 → 5 → 6 → back to 3.

| Step | slow | fast |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 2 | 3 |
| 2 | 3 | 5 |
| 3 | 4 | 3 |
| 4 | **5** | **5** ← they meet |

Now restart one pointer at 1 and keep the other at 5, moving each 1 step: (1, 5) → (2, 6) → (3, 3). They meet at node **3**, the loop start.

**Merge two sorted lists** in O(m + n) time, by relinking the nodes with no new ones:

```c
struct node *merge(struct node *a, struct node *b) {
    struct node dummy, *t = &dummy;
    while (a && b) {
        if (a->data <= b->data) { t->next = a; a = a->next; }
        else                    { t->next = b; b = b->next; }
        t = t->next;
    }
    t->next = (a != NULL) ? a : b;   /* attach the leftover part */
    return dummy.next;
}
```

Example: [1, 4, 7, 9] and [2, 3, 8] merge to **[1, 2, 3, 4, 7, 8, 9]**.

### 2.7 Polynomial representation

Each term is a node (coefficient, exponent, next), kept in **decreasing order of exponent**.

```c
struct term { int coef; int exp; struct term *next; };
```

- P₁ = 5x³ + 4x² + 2 is stored as (5,3) → (4,2) → (2,0).
- P₂ = 3x³ − 4x² + 6x + 1 is stored as (3,3) → (−4,2) → (6,1) → (1,0).
- To add them, walk both lists like a merge. When the exponents are equal, add the coefficients and drop the term if the sum is 0.
- P₁ + P₂ = **8x³ + 6x + 3**, stored as (8,3) → (6,1) → (3,0). The x² terms cancel.

---

## 3. Array vs linked list

| Basis | Array | Linked list |
|---|---|---|
| Memory | Contiguous | Scattered, joined by pointers |
| Size | Fixed (static) | Grows and shrinks at run time (dynamic) |
| Access | **Random, O(1)** | **Sequential, O(n)** |
| Insert/delete in the middle | O(n), because of shifting | O(1) once the position is reached |
| Extra memory | None | One pointer per node (two in doubly) |
| Memory waste | Unused slots if over-allocated | No unused slots |
| Cache performance | Good (locality) | Poor |
| Binary search | Possible, O(log n) | Not efficient |
| Overflow | When the array is full | Only when the heap is exhausted |

---

## 4. Memory management

- **Dynamic allocation in C:**
  - `malloc(size)` returns uninitialised memory.
  - `calloc(n, size)` returns memory set to zero.
  - `realloc(p, size)` resizes a block.
  - `free(p)` returns memory to the heap.
  - Memory comes from the **heap**. `malloc` returns **NULL** when no memory is left.
- **Free-storage list (AVAIL list, Lipschutz):** unused nodes are kept in a list called AVAIL. Inserting a node takes one from AVAIL, and deleting a node returns it to AVAIL.
- **Overflow:** trying to insert when AVAIL = NULL (no free memory).
- **Underflow:** trying to delete from an empty list (START = NULL).
- **Garbage collection:** the system automatically finds memory that is no longer reachable and returns it to the free list. The classic method is **mark and sweep**: mark every reachable node, then sweep up the unmarked ones. It runs when free memory is low. Java and Python have it; **C does not**, so you must call `free()`.
- **Memory leak:** allocated memory that is never freed and can no longer be reached.
- **Dangling pointer:** a pointer that still refers to memory after it has been freed.

---

## 5. Skip list (one paragraph)

A **skip list** (Pugh, 1990) is a sorted linked list with extra "express lane" levels. Level 0 contains every element. Each higher level contains a random subset (each node is promoted with probability ½), so a search starts at the top level, moves right while the next key is smaller, then drops down a level. Search, insertion and deletion take **O(log n) expected** time and **O(n) in the worst case**. Expected space is O(n). It is a simpler, randomised alternative to balanced search trees.

---

## Exam traps

1. Elements in a dimension = **UB − LB + 1**, not UB − LB. A[−2…5] has 8 elements.
2. Row-major multiplies the row offset by the **number of columns**, and column-major multiplies the column offset by the **number of rows**. Swapping these is the most common error.
3. Always subtract the **lower bound** before multiplying. Use (i − L₁), not i, unless the array is 0-based.
4. C is row-major and FORTRAN is column-major.
5. A lower-triangular matrix stores n(n+1)/2 elements and a tridiagonal one stores 3n − 2, not 3n.
6. `char s[] = "HELLO"` needs **6** bytes, because of `'\0'`.
7. In a singly list, insert at the beginning is O(1) but delete at the end is O(n), even with a tail pointer, because you need the second-last node.
8. A doubly list deletes a known node in O(1), but it costs an extra pointer per node.
9. During insertion, link the new node to the successor **before** changing the predecessor's link.
10. Binary search on a linked list is not O(log n), because reaching the middle takes O(n).
11. Floyd's algorithm uses O(1) extra space. Marking visited nodes in a hash set uses O(n).
12. "Linear list" in a PYQ means **array** (also stack, queue and linked list). A circular queue is still linear, and a circular linked list is still a linear structure.

## One-liners for revision

1. An array is homogeneous, contiguous and indexed.
2. Array access is O(1): random access.
3. 1-D address: Base + w(k − LB).
4. Elements = UB − LB + 1.
5. Row-major: B + w[(i − L₁)N + (j − L₂)].
6. Column-major: B + w[(j − L₂)M + (i − L₁)].
7. C and Java are row-major. FORTRAN and MATLAB are column-major.
8. In row-major order the last subscript changes fastest.
9. In column-major order the first subscript changes fastest.
10. Inserting at position k of n shifts n − k + 1 elements.
11. Deleting at position k of n shifts n − k elements.
12. A lower-triangular matrix has n(n+1)/2 non-zero positions.
13. A tridiagonal matrix has 3n − 2 non-zero positions.
14. Lower-triangular row-major offset: i(i−1)/2 + (j−1).
15. Triplet sparse storage takes 3(t + 1) words.
16. A C string ends with '\0'.
17. A linked list node is data + pointer to the next node.
18. The last node of a singly list points to NULL.
19. In a circular list the last node points to the first.
20. A doubly list node has prev and next pointers.
21. A header node is a dummy first node that simplifies the edge cases.
22. Insert at the head of a list: O(1).
23. Insert at the tail without a tail pointer: O(n).
24. Searching a linked list: O(n).
25. Reverse a list with prev, cur and next pointers: O(n) time, O(1) space.
26. Middle of a list: slow moves 1 step, fast moves 2.
27. Floyd's cycle detection: tortoise and hare, O(1) space.
28. Merging two sorted lists takes O(m + n).
29. Polynomial node: coefficient, exponent, next.
30. malloc returns NULL when memory is exhausted, which is overflow.
31. Deleting from an empty list is underflow.
32. AVAIL is the list of free nodes.
33. Garbage collection reclaims unreachable memory; mark and sweep is the classic method.
34. C has no automatic garbage collection.
35. Skip list: expected O(log n) search.

## Quick self-check

1. A[1…10][1…15] is stored row-major with Base = 100 and w = 1. Where is A[3][4]?
   **Answer:** 100 + (2 × 15 + 3) = **133**.
2. Same array, stored column-major. Where is A[3][4]?
   **Answer:** 100 + (3 × 10 + 2) = **132**.
3. How many elements does A[−3…4][0…5] have?
   **Answer:** 8 × 6 = **48**.
4. How many elements does a 10 × 10 lower-triangular matrix need to store?
   **Answer:** 10 × 11/2 = **55**.
5. How many non-zero positions does a 100 × 100 tridiagonal matrix have?
   **Answer:** 3 × 100 − 2 = **298**.
6. Which list lets you delete a node in O(1) when you have a pointer only to that node?
   **Answer:** A doubly linked list.
7. What is the time to insert at the end of a singly linked list with no tail pointer?
   **Answer:** O(n).
8. Which algorithm detects a loop in O(1) extra space?
   **Answer:** Floyd's cycle-finding (tortoise and hare).
9. What happens if you insert into a linked list when AVAIL = NULL?
   **Answer:** Overflow.
10. Which data structure is a linear list: binary tree, graph or array?
    **Answer:** Array.
