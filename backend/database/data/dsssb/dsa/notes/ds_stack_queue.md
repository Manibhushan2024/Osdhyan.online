# Stacks & Queues

**In 30 seconds**

- A **stack** is **LIFO** (last in, first out). Insertion (push) and deletion (pop) both happen at one end, the **top**. Every operation is O(1).
- ⭐ A **queue** is **FIFO**: **the first element inserted is the first one removed**. ⭐ **Insertion (enqueue) happens at the REAR and deletion (dequeue) at the FRONT.**
- Array stack: **overflow** when top == MAX − 1 and **underflow** when top == −1. Array queue: **overflow** when rear == MAX − 1 and **underflow** when front == −1 or front > rear.
- A **circular queue** reuses freed slots: rear = (rear + 1) % N. It is **full** when (rear + 1) % N == front.
- **Infix → postfix:** operands go straight to the output, and operators wait on a stack. Pop operators of higher precedence, and of **equal** precedence too unless the incoming operator is **^ (right-associative)**.
- **Postfix evaluation:** push operands. On an operator, pop **B** first, then **A**, and push **A op B**.
- Variants: a **deque** (both ends), input- or output-restricted deques, and a **priority queue** (a binary heap gives O(log n) insert and delete).
- Applications: stacks handle function calls, recursion, expressions, parenthesis matching, undo, backtracking and DFS. Queues handle CPU scheduling, BFS, buffers and print spooling.

---

## 1. Stack

### 1.1 Stack ADT

A **stack** is a linear list in which insertion and deletion take place at **one end only**, called the **top**. The last element pushed is the first one popped: **LIFO**, or equivalently FILO. Picture a pile of plates.

| Operation | Effect | Time |
|---|---|---|
| `push(x)` | Puts x on top | O(1) |
| `pop()` | Removes and returns the top element | O(1) |
| `peek()` / `top()` | Returns the top element without removing it | O(1) |
| `isEmpty()` | True if there are no elements | O(1) |
| `isFull()` | True if the array is full (array version only) | O(1) |

### 1.2 Array implementation in C

```c
#define MAX 100
int stack[MAX];
int top = -1;                         /* empty stack */

void push(int x) {
    if (top == MAX - 1) { printf("Stack Overflow\n"); return; }
    stack[++top] = x;                 /* increment first, then store */
}

int pop(void) {
    if (top == -1) { printf("Stack Underflow\n"); return -1; }
    return stack[top--];              /* read first, then decrement */
}

int peek(void) {
    if (top == -1) { printf("Stack Empty\n"); return -1; }
    return stack[top];
}
```

- **Overflow:** pushing when the stack is full (**top == MAX − 1**).
- **Underflow:** popping when the stack is empty (**top == −1**).
- Number of elements = **top + 1**.

### 1.3 Linked implementation

Push means inserting at the **head** and pop means deleting at the **head**. Both are O(1), and the size is not fixed: overflow happens only when `malloc` returns NULL.

```c
struct node { int data; struct node *next; };
struct node *top = NULL;

void push(int x) {
    struct node *t = malloc(sizeof(struct node));
    if (t == NULL) { printf("Overflow\n"); return; }
    t->data = x; t->next = top; top = t;
}

int pop(void) {
    if (top == NULL) { printf("Underflow\n"); return -1; }
    struct node *t = top; int x = t->data;
    top = top->next; free(t);
    return x;
}
```

### 1.4 Applications of the stack

| Application | How the stack is used |
|---|---|
| **Function calls / recursion** | Each call pushes an *activation record* (parameters, local variables, return address). The record is popped when the function returns. Recursion that goes too deep causes a **stack overflow**. |
| **Expression conversion** | Infix to postfix or prefix, using an operator stack |
| **Expression evaluation** | Postfix and prefix evaluation, using an operand stack |
| **Parenthesis matching** | Push each opening bracket. On a closing bracket, pop and check that the pair matches. The expression is balanced if the stack is empty at the end. |
| **Undo / redo, browser Back button** | The latest action is undone first |
| **Backtracking** | Maze solving and N-Queens: push choices and pop to go back |
| **DFS** of a graph or tree | An explicit stack, or recursion |
| **Reversing** a string or list | Push everything, then pop everything |
| Others | Converting decimal to binary, Tower of Hanoi, the memory stack of a program |

**Parenthesis matching, worked:** `{ ( [ ] ) }`

| Read | Action | Stack |
|---|---|---|
| { | push | { |
| ( | push | { ( |
| [ | push | { ( [ |
| ] | pop [ (match) | { ( |
| ) | pop ( (match) | { |
| } | pop { (match) | empty → **balanced** |

`( ] )` fails at `]`, because the popped `(` does not match it. `( (` fails at the end, because the stack is not empty.

---

## 2. Infix, prefix and postfix expressions

| Form | Operator position | Example of A + B | Other name |
|---|---|---|---|
| **Infix** | Between the operands | A + B | – |
| **Prefix** | Before the operands | + A B | **Polish notation** (Łukasiewicz) |
| **Postfix** | After the operands | A B + | **Reverse Polish notation (RPN)** |

Prefix and postfix **need no brackets** and no precedence rules, so a stack can evaluate them in one left-to-right (or right-to-left) scan.

### 2.1 Precedence and associativity

| Precedence | Operators | Associativity |
|---|---|---|
| Highest | **^** (exponent) | **Right to left**: A^B^C = A^(B^C) |
| Middle | * / % | Left to right: A/B*C = (A/B)*C |
| Lowest | + − | Left to right: A−B+C = (A−B)+C |

### 2.2 Infix → postfix algorithm (operator stack)

Scan the infix expression from left to right.
1. **Operand:** append it to the output.
2. **`(`:** push it.
3. **`)`:** pop to the output until `(` appears, then discard both brackets.
4. **Operator `op`:** while the top of the stack is an operator **and** either (its precedence > prec(op)) **or** (its precedence = prec(op) **and** op is left-associative), pop it to the output. Then push op. Two consequences: an incoming **^** does *not* pop a **^**, and nothing pops past a `(`.
5. **End of input:** pop everything that is left to the output.

**Worked 1: A + B * C − D / E**

| Symbol | Stack (bottom → top) | Output |
|---|---|---|
| A | empty | A |
| + | + | A |
| B | + | A B |
| * | + * | A B |
| C | + * | A B C |
| − | − | A B C * + ← * pops (higher), + pops (equal, left-assoc) |
| D | − | A B C * + D |
| / | − / | A B C * + D |
| E | − / | A B C * + D E |
| end | empty | **A B C * + D E / −** |

**Worked 2: A + B ^ C ^ D * E** (right-associative ^)

| Symbol | Stack (bottom → top) | Output |
|---|---|---|
| A | empty | A |
| + | + | A |
| B | + | A B |
| ^ | + ^ | A B |
| C | + ^ | A B C |
| ^ | + ^ ^ ← equal precedence but **right-assoc**, so nothing pops | A B C |
| D | + ^ ^ | A B C D |
| * | + * ← both ^ pop (higher); + stays (lower) | A B C D ^ ^ |
| E | + * | A B C D ^ ^ E |
| end | empty | **A B C D ^ ^ E * +** |

If ^ were (wrongly) treated as left-associative, the output would be A B C ^ D ^ E * +, which means (B^C)^D.

**Worked 3: A + ( B * C − ( D / E ^ F ) * G ) * H** (Lipschutz)

| Symbol | Stack (bottom → top) | Output |
|---|---|---|
| A | empty | A |
| + | + | A |
| ( | + ( | A |
| B | + ( | A B |
| * | + ( * | A B |
| C | + ( * | A B C |
| − | + ( − | A B C * |
| ( | + ( − ( | A B C * |
| D | + ( − ( | A B C * D |
| / | + ( − ( / | A B C * D |
| E | + ( − ( / | A B C * D E |
| ^ | + ( − ( / ^ | A B C * D E |
| F | + ( − ( / ^ | A B C * D E F |
| ) | + ( − | A B C * D E F ^ / |
| * | + ( − * | A B C * D E F ^ / |
| G | + ( − * | A B C * D E F ^ / G |
| ) | + | A B C * D E F ^ / G * − |
| * | + * | A B C * D E F ^ / G * − |
| H | + * | A B C * D E F ^ / G * − H |
| end | empty | **A B C * D E F ^ / G * − H * +** |

### 2.3 Infix → prefix

**Method (reverse trick):**
1. Reverse the infix expression and swap `(` with `)`.
2. Convert the result to postfix with one change: on **equal** precedence, pop **only if the incoming operator is ^**. Left-associative operators do not pop their equals.
3. Reverse the output.

A quick alternative is to fully bracket the expression and move each operator in front of its own bracket.

**Worked 4: ( A + B ) * ( C − D ) / E**

Step 1: the reversed expression with swapped brackets is **E / ( D − C ) * ( B + A )**.

| Symbol | Stack (bottom → top) | Output |
|---|---|---|
| E | empty | E |
| / | / | E |
| ( | / ( | E |
| D | / ( | E D |
| − | / ( − | E D |
| C | / ( − | E D C |
| ) | / | E D C − |
| * | / * ← equal precedence, left-assoc, so / is **not** popped | E D C − |
| ( | / * ( | E D C − |
| B | / * ( | E D C − B |
| + | / * ( + | E D C − B |
| A | / * ( + | E D C − B A |
| ) | / * | E D C − B A + |
| end | empty | E D C − B A + * / |

Step 3: reversing gives the prefix **/ * + A B − C D E**.

**Summary of conversions** (every row checked against an expression-tree script):

| Infix | Postfix | Prefix |
|---|---|---|
| A + B * C − D / E | ABC*+DE/− | −+A*BC/DE |
| (A + B) * (C − D) / E | AB+CD−*E/ | /*+AB−CDE |
| A + B ^ C ^ D * E | ABCD^^E*+ | +A*^B^CDE |
| A + (B * C − (D / E ^ F) * G) * H | ABC*DEF^/G*−H*+ | +A*−*BC*/D^EFGH |
| A ^ B ^ C | ABC^^ | ^A^BC |
| A − B − C | AB−C− | −−ABC |
| A * (B + C) / D | ABC+*D/ | /*A+BCD |

### 2.4 Postfix evaluation

Scan from **left to right**. Push each operand. On an operator, pop **B** (the top) first, then **A**, and push **A op B**. At the end the stack holds exactly one value, the answer.

**Worked 5: 5 6 2 + * 12 4 / −**

| Symbol | Action | Stack |
|---|---|---|
| 5 | push | 5 |
| 6 | push | 5 6 |
| 2 | push | 5 6 2 |
| + | 6 + 2 = 8 | 5 8 |
| * | 5 × 8 = 40 | 40 |
| 12 | push | 40 12 |
| 4 | push | 40 12 4 |
| / | 12 / 4 = 3 | 40 3 |
| − | 40 − 3 = 37 | **37** |

**Worked 6: 6 2 3 + − 3 8 2 / + * 2 ^ 3 +**

| Symbol | Action | Stack |
|---|---|---|
| 6, 2, 3 | push | 6 2 3 |
| + | 2 + 3 = 5 | 6 5 |
| − | 6 − 5 = 1 | 1 |
| 3, 8, 2 | push | 1 3 8 2 |
| / | 8 / 2 = 4 | 1 3 4 |
| + | 3 + 4 = 7 | 1 7 |
| * | 1 × 7 = 7 | 7 |
| 2 | push | 7 2 |
| ^ | 7² = 49 | 49 |
| 3 | push | 49 3 |
| + | 49 + 3 = 52 | **52** |

### 2.5 Prefix evaluation

Scan from **right to left**. Push each operand. On an operator, pop **A** (the top) first, then **B**, and push **A op B**. The order is the reverse of postfix evaluation.

**Worked 7: − + 7 * 4 5 + 2 0**

| Symbol (right → left) | Action | Stack |
|---|---|---|
| 0, 2 | push | 0 2 |
| + | 2 + 0 = 2 | 2 |
| 5, 4 | push | 2 5 4 |
| * | 4 × 5 = 20 | 2 20 |
| 7 | push | 2 20 7 |
| + | 7 + 20 = 27 | 2 27 |
| − | 27 − 2 = 25 | **25** |

**Worked 8: * − 9 / 8 4 + 1 2**

| Symbol (right → left) | Action | Stack |
|---|---|---|
| 2, 1 | push | 2 1 |
| + | 1 + 2 = 3 | 3 |
| 4, 8 | push | 3 4 8 |
| / | 8 / 4 = 2 | 3 2 |
| 9 | push | 3 2 9 |
| − | 9 − 2 = 7 | 3 7 |
| * | 7 × 3 = 21 | **21** |

---

## 3. Queue ⭐

### 3.1 Queue ADT

A **queue** is a linear list in which **insertion happens at one end (REAR)** and **deletion at the other end (FRONT)**. The first element inserted is the first one removed: **FIFO**. Picture people in a ticket line.

⭐ **Asked in DSSSB (25 Jun 2023, S1):** *The operations of a ______ require that the first element inserted is the first one to be removed.* The options were union, graph, stack and queue. **Answer: queue.** A stack is LIFO.

⭐ **Asked in DSSSB (25 Jun 2023, S1):** *For a queue in C: (i) insertion can take place from the front end; (ii) deletion can take place from the rear end.* **Answer: Neither (i) nor (ii).** Both statements have the ends reversed: insertion is at the **rear** and deletion is at the **front**.

| Operation | Effect | Time |
|---|---|---|
| `enqueue(x)` (insert) | Adds x at the **rear** | O(1) |
| `dequeue()` (delete) | Removes the element at the **front** | O(1) |
| `peek()` / `front()` | Returns the front element | O(1) |
| `isEmpty()`, `isFull()` | Tests the state | O(1) |

### 3.2 Array implementation in C ⭐

```c
#define MAX 5
int queue[MAX];
int front = -1, rear = -1;            /* empty queue */

void enqueue(int x) {
    if (rear == MAX - 1) {            /* OVERFLOW condition */
        printf("Queue Overflow\n"); return;
    }
    if (front == -1) front = 0;       /* first insertion */
    queue[++rear] = x;                /* insert at REAR */
}

int dequeue(void) {
    if (front == -1 || front > rear) {   /* UNDERFLOW condition */
        printf("Queue Underflow\n"); return -1;
    }
    return queue[front++];               /* delete from FRONT */
}
```

- Initially front = rear = −1.
- **Overflow** when **rear == MAX − 1**.
- **Underflow** when **front == −1 or front > rear**.
- Number of elements = **rear − front + 1** when the queue is not empty.

**The wasted-space problem.** Rear only moves forward, so space freed at the front can never be reused. Trace with MAX = 5:

| Operation | front | rear | Result |
|---|---|---|---|
| enqueue 10, 20, 30, 40, 50 | 0 | 4 | queue holds 10 20 30 40 50 |
| dequeue | 1 | 4 | 10 removed |
| dequeue | 2 | 4 | 20 removed |
| enqueue 60 | 2 | 4 | **OVERFLOW**, because rear == MAX − 1, even though slots 0 and 1 are free |

There are two remedies: shift all the elements forward after each dequeue, which costs O(n), or use a **circular queue**.

### 3.3 Circular queue

The array is treated as a ring: after index N − 1 comes index 0.

```c
#define N 5
int cq[N], front = -1, rear = -1;

void enqueue(int x) {
    if ((rear + 1) % N == front) { printf("Overflow\n"); return; }   /* FULL */
    if (front == -1) front = 0;
    rear = (rear + 1) % N;
    cq[rear] = x;
}

int dequeue(void) {
    if (front == -1) { printf("Underflow\n"); return -1; }           /* EMPTY */
    int x = cq[front];
    if (front == rear) front = rear = -1;      /* the only element was removed */
    else front = (front + 1) % N;
    return x;
}
```

| Condition | Convention A (front = rear = −1 at start; all N slots used) | Convention B (front = rear = 0; front points one slot *before* the first element; N − 1 slots used) |
|---|---|---|
| Empty | front == −1 | **front == rear** |
| Full | **(rear + 1) % N == front** | **(rear + 1) % N == front** |
| Count | (rear − front + N) % N + 1 when not empty | **(rear − front + N) % N** |
| Capacity | N | N − 1 (one slot is always left empty) |

Convention B leaves one slot empty so that "full" and "empty" can be told apart without a separate counter. Another common fix is to keep a `count` variable.

**Trace (Convention A, N = 5):**

| Operation | front | rear | Count | Note |
|---|---|---|---|---|
| enqueue 10, 20, 30, 40, 50 | 0 | 4 | 5 | (4 + 1) % 5 = 0 = front, so the queue is full |
| enqueue 60 | 0 | 4 | 5 | **Overflow** |
| dequeue → 10 | 1 | 4 | 4 | – |
| dequeue → 20 | 2 | 4 | 3 | – |
| enqueue 60 | 2 | **0** | 4 | rear wraps around: (4 + 1) % 5 = 0 |
| enqueue 70 | 2 | 1 | 5 | full again |
| enqueue 80 | 2 | 1 | 5 | **Overflow**: (1 + 1) % 5 = 2 = front |

Count example: with N = 8, front = 6 and rear = 2 (Convention A), the count is (2 − 6 + 8) % 8 + 1 = **5**: positions 6, 7, 0, 1, 2.

### 3.4 Linked queue

Keep two pointers, **front** (for deletion) and **rear** (for insertion). Enqueue adds a node after rear, and dequeue removes the node at front. **Both are O(1)**, and there is no fixed size.

```c
struct node { int data; struct node *next; };
struct node *front = NULL, *rear = NULL;

void enqueue(int x) {
    struct node *t = malloc(sizeof(struct node));
    t->data = x; t->next = NULL;
    if (rear == NULL) front = rear = t;      /* first node */
    else { rear->next = t; rear = t; }
}

int dequeue(void) {
    if (front == NULL) { printf("Underflow\n"); return -1; }
    struct node *t = front; int x = t->data;
    front = front->next;
    if (front == NULL) rear = NULL;          /* the queue became empty */
    free(t);
    return x;
}
```

### 3.5 Deque (double-ended queue)

A **deque** allows insertion and deletion at **both** ends. It can therefore work as a stack *or* as a queue.

| Type | Insertion | Deletion |
|---|---|---|
| **Input-restricted deque** | At **one** end only | At **both** ends |
| **Output-restricted deque** | At **both** ends | At **one** end only |

A deque is usually implemented as a circular array or a doubly linked list. All four end operations are O(1).

### 3.6 Priority queue

In a **priority queue** each element has a **priority**, and the element with the highest priority is deleted first. Elements of **equal** priority are served in FIFO order. An **ascending** priority queue deletes the smallest element first, and a **descending** one deletes the largest first.

| Implementation | Insert | Delete highest | Peek highest |
|---|---|---|---|
| Unsorted array / unsorted linked list | O(1) | O(n) | O(n) |
| Sorted array (highest at the end) | O(n) | O(1) | O(1) |
| Sorted linked list (highest at the head) | O(n) | O(1) | O(1) |
| **Binary heap** (best overall) | **O(log n)** | **O(log n)** | **O(1)** |
| Array of queues, one per priority level (Lipschutz) | O(1) | O(number of levels) | – |

Building a heap from n elements takes O(n). Uses: CPU scheduling by priority, Dijkstra's and Prim's algorithms, Huffman coding, event simulation.

### 3.7 Applications of the queue

| Application | Why a queue |
|---|---|
| **CPU scheduling** (FCFS, Round Robin ready queue) | Processes are served in arrival order |
| **BFS** of a graph or tree, level-order traversal | Nodes are visited level by level |
| **Buffers** (keyboard, I/O, network packets, pipes) | Data is consumed in the order it was produced |
| **Printer spooling** | Print jobs are printed in the order they were sent |
| Call-centre or ticket systems, disk scheduling | Fair, first-come-first-served service |

---

## 4. Stack vs queue

| Basis | Stack | Queue |
|---|---|---|
| Principle | **LIFO** | **FIFO** |
| Ends used | One (top) | Two (front and rear) |
| Insertion | push, at the top | enqueue, at the rear |
| Deletion | pop, at the top | dequeue, at the front |
| Pointers (array) | top | front, rear |
| Empty (array) | top == −1 | front == −1 (or front > rear) |
| Full (array) | top == MAX − 1 | rear == MAX − 1 (circular: (rear+1) % N == front) |
| Graph traversal | DFS | BFS |
| Typical uses | Recursion, expressions, undo | Scheduling, buffers, spooling |

---

## 5. Simulating one structure with another

**A queue using two stacks (S1 for input, S2 for output)**

| Method | Enqueue | Dequeue |
|---|---|---|
| Lazy transfer (usual) | Push onto S1: **O(1)** | If S2 is empty, pop everything from S1 and push it onto S2; then pop S2. **O(n) worst case, O(1) amortised.** |
| Costly enqueue | Move S1 to S2, push x onto S1, move S2 back: **O(n)** | Pop S1: O(1) |

With lazy transfer each element is pushed and popped at most twice, so 5 enqueues and 5 dequeues take 20 primitive stack operations in total (verified). That is why the amortised cost is O(1).

**A stack using two queues (Q1, Q2)**

| Method | Push | Pop |
|---|---|---|
| Costly pop | Enqueue onto Q1: O(1) | Move n − 1 elements from Q1 to Q2, dequeue the last one, then swap the names Q1 and Q2: **O(n)** |
| Costly push | Enqueue x onto the empty Q2, move all of Q1 into Q2, swap the names: **O(n)** | Dequeue from Q1: O(1) |

At least **two** stacks are needed to build a queue, and at least two queues to build a stack (one queue is enough if you rotate it n − 1 times on every push).

## 6. Stack permutations (Catalan number)

The inputs 1, 2, …, n arrive in that order, and you may push or pop at any time. The number of different output orders is the **Catalan number**:

**Cₙ = (2n)! / ((n + 1)! · n!) = C(2n, n) / (n + 1)**

| n | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Stack permutations | 1 | 2 | **5** | **14** | 42 | 132 | 429 |
| All permutations n! | 1 | 2 | 6 | 24 | 120 | 720 | 5040 |

For input 1 2 3 the possible outputs are 123, 132, 213, 231 and 321. **312 is impossible**: once 3 is popped, 1 and 2 are both on the stack with 2 on top, so 2 must come out before 1.

Rule: an output is impossible if it contains values a, b, c, in that order, with b < c < a (the "3-1-2" pattern). For n = 4, the outputs 4321, 3421 and 2431 are possible, but 4231, 1423 and 3124 are not. The same Catalan numbers count the binary trees with n nodes and the ways to fully bracket n + 1 factors.

---

## Exam traps

1. A queue inserts at the **rear** and deletes at the **front**. "Insert at front" and "delete at rear" are both false, which gives "neither (i) nor (ii)".
2. A stack is LIFO and a queue is FIFO. "First inserted, first removed" means a **queue**.
3. In a stack, `stack[++top] = x` increments before storing, and `return stack[top--]` reads before decrementing. Mixing these up loses an element.
4. Linear queue overflow is **rear == MAX − 1**, even when slots at the front are free. That is the wasted-space problem, and the circular queue fixes it.
5. Circular queue full: **(rear + 1) % N == front**. Under Convention B, empty is **front == rear**, and the capacity is N − 1.
6. **^ is right-associative**: A^B^C → ABC^^, not AB^C^. When a ^ arrives on top of a ^, nothing pops.
7. In postfix evaluation the **first** value popped is the **right** operand: 8 2 / means 8 / 2, not 2 / 8. In prefix evaluation the first popped is the **left** operand.
8. Postfix keeps the **operands in the same order** as infix; only the operators move.
9. In the reverse method for prefix, equal-precedence left-associative operators are **not** popped. Applying the plain postfix rule gives the wrong prefix.
10. DFS uses a stack and BFS uses a queue. Recursion uses the system stack.
11. In a priority queue, elements with the same priority leave in FIFO order. A binary heap gives O(log n) for both insert and delete.
12. An **input**-restricted deque restricts insertion to one end. An **output**-restricted deque restricts deletion to one end.

## One-liners for revision

1. Stack = LIFO; queue = FIFO.
2. Push and pop happen at the top.
3. Array stack is empty when top == −1.
4. Array stack is full when top == MAX − 1.
5. Elements in an array stack = top + 1.
6. Pushing onto a full stack is overflow; popping from an empty stack is underflow.
7. Linked stack: push and pop at the head, both O(1).
8. Function calls use the stack of activation records.
9. Postfix is reverse Polish notation; prefix is Polish notation.
10. ^ has the highest precedence and is right-associative.
11. * / and + − are left-associative.
12. A + B * C → ABC*+.
13. (A + B) * C → AB+C*.
14. A ^ B ^ C → ABC^^.
15. Postfix evaluation scans left to right with an operand stack.
16. Prefix evaluation scans right to left.
17. 5 6 2 + * 12 4 / − = 37.
18. Parenthesis matching: balanced if the stack is empty at the end.
19. Queue: insert at the rear, delete at the front.
20. A linear queue starts with front = rear = −1.
21. Linear queue overflow: rear == MAX − 1.
22. Linear queue underflow: front == −1 or front > rear.
23. Elements in a linear queue = rear − front + 1.
24. Circular queue: rear = (rear + 1) % N.
25. Circular queue full: (rear + 1) % N == front.
26. A circular queue removes the wasted space of a linear queue.
27. Linked queue: enqueue at rear and dequeue at front, both O(1).
28. A deque allows insertion and deletion at both ends.
29. Input-restricted deque: insertion at one end only.
30. Output-restricted deque: deletion at one end only.
31. Priority queue: the highest priority leaves first; ties leave in FIFO order.
32. A heap-based priority queue has O(log n) insert and delete.
33. BFS uses a queue and DFS uses a stack.
34. CPU scheduling, printer spooling and buffers use queues.
35. Undo and backtracking use stacks.
36. A queue from two stacks has O(1) amortised dequeue.
37. A stack from two queues makes either push or pop O(n).
38. Stack permutations of n items = Catalan number Cₙ.
39. C₃ = 5 and C₄ = 14.
40. 312 cannot be produced from input 123 with a stack.

## Quick self-check

1. Which structure removes the first element inserted?
   **Answer:** A queue (FIFO).
2. In C, a queue inserts at which end and deletes at which end?
   **Answer:** Inserts at the rear and deletes at the front.
3. Convert (A + B) * C − D ^ E ^ F to postfix.
   **Answer:** AB+C*DEF^^−.
4. Convert A * B + C / D to prefix.
   **Answer:** +*AB/CD.
5. Evaluate the postfix expression 2 3 4 * + 5 −.
   **Answer:** 2 + 12 − 5 = **9**.
6. Evaluate the postfix expression 8 2 / 3 1 − ^.
   **Answer:** (8/2)^(3−1) = 4² = **16**.
7. Evaluate the prefix expression + 9 * 2 6.
   **Answer:** 9 + 12 = **21**.
8. In a circular queue of size 8 (Convention A) with front = 6 and rear = 2, how many elements are there?
   **Answer:** (2 − 6 + 8) % 8 + 1 = **5**.
9. What is the overflow condition of a linear array queue?
   **Answer:** rear == MAX − 1.
10. How many output orders can a stack produce from the inputs 1, 2, 3, 4?
    **Answer:** C₄ = **14**.
