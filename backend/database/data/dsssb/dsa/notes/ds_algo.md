# Algorithms, Complexity & Recursion

**In 30 seconds**

- ⭐ An **algorithm** is a finite set of instructions that solves a problem. Its five characteristics are **input, output, definiteness, finiteness and effectiveness**. **Definiteness = each instruction is clear and unambiguous.**
- ⭐ **Pseudocode** is the representation that is **easiest to turn into a program**. Flowcharts and plain-English steps need more translation.
- ⭐ An **optimisation problem** asks for the **best** solution (minimum or maximum) among all feasible solutions. A decision problem asks yes/no, a counting problem asks "how many", and an enumeration problem asks you to list them all.
- ⭐ **Linear** data structures (array, stack, queue, linked list) keep their elements in a sequence. **Non-linear** ones (tree, graph) do not.
- ⭐ **Order of growth:** 1 < log n < √n < n < n log n < n² < n² log n < n³ < 2ⁿ < n! < nⁿ.
- The five notations: **O** is an upper bound, **Ω** a lower bound, **Θ** a tight bound, **o** a strict upper bound and **ω** a strict lower bound.
- **Master theorem:** for T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a). The bigger one wins. If they are equal, multiply by log n.
- Standard results: binary search O(log n), merge sort O(n log n) in every case, Tower of Hanoi needs **2ⁿ − 1** moves, and naive Fibonacci takes O(2ⁿ) time.

---

## 1. What is an algorithm?

An **algorithm** is a finite sequence of well-defined instructions which, when followed, solves a given problem in a finite amount of time (Horowitz–Sahni; Knuth). The word comes from al-Khwarizmi, a 9th-century Persian mathematician.

### 1.1 Characteristics ⭐

| Characteristic | Meaning (textbook wording) | Example of violating it |
|---|---|---|
| **Input** | **Zero or more** quantities are supplied from outside | – |
| **Output** | **At least one** quantity is produced | A procedure that prints nothing and returns nothing |
| ⭐ **Definiteness** | **Each instruction is clear and unambiguous** | "Add 6 or 7 to x"; "divide by a suitable number" |
| **Finiteness** | The algorithm **terminates after a finite number of steps** in every case | `while (1) { }` |
| **Effectiveness** | Every instruction is **basic enough to be carried out**, in principle by a person with pencil and paper, in finite time | "Find the largest prime number" |

⭐ **Asked in DSSSB (25 Jun 2023, S1):** *Which characteristic of an algorithm refers to "each instruction is clear and unambiguous"?* The options were Definiteness, Finiteness, Effectiveness and Indefiniteness. **Answer: Definiteness.**

How to tell the three similar ones apart:
- **Definiteness** is about whether an instruction is **clear**.
- **Finiteness** is about whether the algorithm **stops**.
- **Effectiveness** is about whether an instruction **can actually be carried out**.

### 1.2 Algorithm vs program

| Algorithm | Program |
|---|---|
| A design-time, language-independent description | Written in a particular programming language |
| **Must terminate** (finiteness) | Need not terminate. An operating system runs until shutdown, so it is a program but not an algorithm (Horowitz–Sahni). |
| Analysed with asymptotic notation | Run and tested on a machine |
| Written by a designer or analyst | Written by a programmer |

### 1.3 Ways to represent an algorithm ⭐

| Representation | Features |
|---|---|
| **Natural language** (step-by-step English) | Easy to write, but it can be ambiguous and wordy |
| **Flowchart** | A picture made of standard symbols. Good for showing control flow, but large flowcharts are hard to draw and to change. |
| ⭐ **Pseudocode** | Structured, code-like statements (IF … THEN, WHILE, FOR, RETURN) with no strict syntax. **The easiest to turn into a computer program**, because it maps almost line by line onto real code. |
| Program code | The final, executable form |

⭐ **Asked in DSSSB (24 Jun 2023, S3):** *Which is the easiest to transform into a computer program?* The options were Pseudo-code, Algorithm, Flowchart and None. **Answer: Pseudo-code.**

**Flowchart symbols**

| Symbol | Shape | Used for |
|---|---|---|
| Terminal | Oval (rounded rectangle) | Start / Stop |
| Input/Output | Parallelogram | Read / Print |
| Process | Rectangle | An assignment or calculation |
| Decision | Diamond | A condition with Yes/No branches |
| Flow line | Arrow | The direction of control |
| On-page connector | Small circle | Joins parts of the chart on the same page |
| Off-page connector | Pentagon ("home plate") | Continues the chart on another page |
| Predefined process | Rectangle with double vertical sides | A call to a sub-routine |

Pseudocode example (the largest of n numbers):

```text
Algorithm Max(A, n)
1. max ← A[1]
2. for i ← 2 to n do
3.     if A[i] > max then max ← A[i]
4. return max
```

### 1.4 Types of problems ⭐

| Type | Question it asks | Example |
|---|---|---|
| **Searching** | Is the item present, and where is it? | Linear or binary search for a key |
| **Sorting** | Arrange the items in order | Sort the marks in ascending order |
| **Decision** | Yes/No | "Is there a subset with sum 17?" "Is n prime?" |
| ⭐ **Optimisation** | **The best solution among the feasible ones** (minimum or maximum) | Shortest path, minimum spanning tree, 0/1 knapsack with maximum profit |
| **Enumeration** | List **all** solutions | List all subsets with sum 17 |
| **Counting** | **How many** solutions are there? | The number of spanning trees |
| Others (Levitin) | String processing, graph problems, combinatorial, geometric and numerical problems | – |

⭐ **Asked in DSSSB (25 Jun 2023, S1):** *the kind of problem that requires identifying the best solution from a given set of solutions*. The options were Training, Optimisation, Counting and Decision. **Answer: Optimisation.** A **feasible** solution satisfies the constraints, and an **optimal** solution is the best of the feasible ones.

---

## 2. Classification of data structures

```text
Data structures
├── Primitive: int, char, float, double, pointer
└── Non-primitive
    ├── Linear ⭐: array, stack, queue, linked list   (elements in a sequence)
    └── Non-linear: tree, graph                       (one element links to many)
```

| Basis | Kinds | Examples |
|---|---|---|
| Built in or not | Primitive / non-primitive | int / array, list |
| Arrangement | ⭐ **Linear** / non-linear | Array, stack, queue, linked list / tree, graph |
| Size | **Static** (size fixed at compile time) / **dynamic** (grows and shrinks at run time) | Array / linked list |
| Element types | Homogeneous / heterogeneous | Array / structure (struct) |

⭐ **Asked in DSSSB (25 Jun 2023, S2):** *Which data structure is categorised as a linear list?* The options were binary tree, graphs, circular queue and array. **Official answer: Array.** A circular queue is also linear, but the array is the basic linear list.

**Abstract Data Type (ADT):** a data type defined only by its **values and operations**, without saying how it is implemented. For example, the Stack ADT is push, pop, peek and isEmpty, and it can be implemented with an array or with a linked list. The ADT answers *what*; the data structure answers *how*.

---

## 3. Complexity analysis

- **Time complexity** is the number of basic operations, written as a function of the input size n.
- **Space complexity** is the memory used. Horowitz–Sahni write it as **S(P) = c + S_P**: a fixed part c (code, simple variables and constants) plus a variable part S_P (dynamic memory and the recursion stack).
- **A priori analysis** is done before running, using asymptotic notation. **A posteriori analysis** (profiling) measures actual running time.

### 3.1 Best, average and worst case

For a linear search of n elements:

| Case | When it happens | Comparisons |
|---|---|---|
| Best | The key is the first element | 1, so O(1) |
| Worst | The key is last or absent | n, so O(n) |
| Average (successful search) | Each position is equally likely | (n + 1)/2, so O(n) |

The worst case is what is usually quoted, because it is a **guarantee**.

### 3.2 Asymptotic notations (CLRS definitions)

| Notation | Formal definition | Meaning | Limit test (f/g as n → ∞) |
|---|---|---|---|
| **O(g)** | ∃ c > 0, n₀ such that 0 ≤ f(n) ≤ c·g(n) ∀ n ≥ n₀ | Upper bound ("at most") | finite |
| **Ω(g)** | ∃ c > 0, n₀ such that 0 ≤ c·g(n) ≤ f(n) ∀ n ≥ n₀ | Lower bound ("at least") | > 0 |
| **Θ(g)** | ∃ c₁, c₂ > 0, n₀ such that c₁g(n) ≤ f(n) ≤ c₂g(n) ∀ n ≥ n₀ | Tight bound ("exactly the order of") | finite and > 0 |
| **o(g)** | **For every** c > 0 ∃ n₀ such that 0 ≤ f(n) < c·g(n) | Strict upper bound | = 0 |
| **ω(g)** | **For every** c > 0 ∃ n₀ such that 0 ≤ c·g(n) < f(n) | Strict lower bound | = ∞ |

Worked examples:
- f(n) = 3n² + 5n + 2 is Θ(n²). For the upper bound, 3n² + 5n + 2 ≤ 10n² for n ≥ 1 (c₂ = 10). For the lower bound, 3n² ≤ f(n) (c₁ = 3).
- 3n² + 5n + 2 is also O(n³), but it is **not** Ω(n³). An O bound need not be tight.
- 2n = o(n²), but 2n² ≠ o(n²), because the limit of the ratio is 2, not 0.
- n²/2 = ω(n), but n²/2 ≠ ω(n²).
- f = Θ(g) ⇔ f = O(g) **and** f = Ω(g).

**Useful properties**
- Transitivity holds for all five notations. Reflexivity holds for O, Ω and Θ only. **Symmetry holds for Θ only.**
- Transpose symmetry: f = O(g) ⇔ g = Ω(f), and f = o(g) ⇔ g = ω(f).
- Drop constants and lower-order terms: 7n³ + 100n² + 9 = Θ(n³).
- The base of a logarithm does not matter, because log₂ n and log₁₀ n differ only by a constant factor. The base of an exponent **does** matter: 3ⁿ ≠ O(2ⁿ). Also 2ⁿ⁺¹ = O(2ⁿ), but 2²ⁿ = 4ⁿ ≠ O(2ⁿ).
- log(n!) = Θ(n log n) and n! = O(nⁿ).

### 3.3 Order of growth ⭐

**O(1) < O(log n) < O(√n) < O(n) < O(n log n) < O(n²) < O(n² log n) < O(n³) < O(2ⁿ) < O(n!) < O(nⁿ)**

| Function | n = 10 | n = 100 | Name |
|---|---|---|---|
| 1 | 1 | 1 | Constant |
| log₂ n | 3.32 | 6.64 | Logarithmic |
| √n | 3.16 | 10 | Square root |
| n | 10 | 100 | Linear |
| n log₂ n | 33.22 | 664.39 | Linearithmic |
| n² | 100 | 10,000 | Quadratic |
| n³ | 1,000 | 1,000,000 | Cubic |
| 2ⁿ | 1,024 | 1.27 × 10³⁰ | Exponential |
| n! | 3,628,800 | 9.33 × 10¹⁵⁷ | Factorial |
| nⁿ | 10¹⁰ | 10²⁰⁰ | – |

⭐ **Asked in DSSSB (24 Jun 2023, S3):** *Arrange O(n), O(n²), O(2ⁿ), O(log n), O(n log n), O(n² log n) in order of growth.* **Answer: O(log n), O(n), O(n log n), O(n²), O(n² log n), O(2ⁿ).** Multiplying by log n places a function **between** two neighbouring powers of n.

The order is **asymptotic**, meaning it holds for large n. At n = 10, log₂ n (3.32) is actually bigger than √n (3.16). log₂ n exceeds √n for every n strictly between 4 and 16, and √n wins for every n > 16.

### 3.4 Counting loops: ten worked snippets

Rule: count how many times the innermost statement runs. Nested independent loops multiply. A loop whose variable is multiplied or divided by a constant runs O(log n) times.

```c
/* 1. Two independent loops                          */
for (i = 0; i < n; i++)
  for (j = 0; j < n; j++) count++;          /* n*n          -> O(n^2)     */

/* 2. Dependent inner loop                           */
for (i = 0; i < n; i++)
  for (j = 0; j < i; j++) count++;          /* 0+1+..+(n-1) = n(n-1)/2 -> O(n^2) */

/* 3. Doubling loop                                  */
for (i = 1; i < n; i *= 2) count++;         /* ceil(log2 n) -> O(log n)   */

/* 4. Halving loop                                   */
for (i = n; i > 0; i /= 2) count++;         /* floor(log2 n)+1 -> O(log n) */

/* 5. Linear outer, logarithmic inner                */
for (i = 0; i < n; i++)
  for (j = 1; j < n; j *= 2) count++;       /* n*ceil(log2 n) -> O(n log n) */

/* 6. Square-root loop                               */
for (i = 1; i * i <= n; i++) count++;       /* floor(sqrt n) -> O(sqrt n) */

/* 7. Inner bound grows geometrically                */
for (i = 1; i <= n; i *= 2)
  for (j = 1; j <= i; j++) count++;         /* 1+2+4+..   < 2n -> O(n)    */

/* 8. Repeated squaring                              */
for (i = 2; i <= n; i = i * i) count++;     /* log2(log2 n)+1 -> O(log log n) */

/* 9. Harmonic loop                                  */
for (i = 1; i <= n; i++)
  for (j = 1; j <= n; j += i) count++;      /* n(1+1/2+..+1/n) -> O(n log n) */

/* 10. Inner variable NOT reset (two-pointer)        */
for (i = 0, j = 0; i < n; i++)
  while (j < n) { j++; count++; }           /* j moves n times in total -> O(n) */
```

Values counted by script:

| # | n = 16 | n = 64 | n = 100 | Order |
|---|---|---|---|---|
| 1 | 256 | 4,096 | 10,000 | n² |
| 2 | 120 | 2,016 | 4,950 | n² |
| 3 | 4 | 6 | 7 | log n |
| 4 | 5 | 7 | 7 | log n |
| 5 | 64 | 384 | 700 | n log n |
| 6 | 4 | 8 | 10 | √n |
| 7 | 31 | 127 | 127 | n |
| 8 | 3 | 3 | 3 | log log n (n = 256 gives 4; n = 65,536 gives 5) |
| 9 | 61 | 337 | 573 | n log n |
| 10 | 16 | 64 | 100 | n |

A triple dependent loop (i < n, j < i, k < j) runs C(n, 3) = n(n−1)(n−2)/6 times, which is 161,700 at n = 100, so it is O(n³).

### 3.5 Common complexities

| Algorithm / operation | Best | Average | Worst | Extra space |
|---|---|---|---|---|
| Array access by index | O(1) | O(1) | O(1) | – |
| Linear search | O(1) | O(n) | O(n) | O(1) |
| Binary search (sorted array) | O(1) | O(log n) | O(log n) | O(1) iterative |
| Bubble sort (with a swap flag) | O(n) | O(n²) | O(n²) | O(1) |
| Insertion sort | O(n) | O(n²) | O(n²) | O(1) |
| ⭐ Selection sort | **O(n²)** | O(n²) | **O(n²)** | O(1) |
| ⭐ Merge sort | O(n log n) | **O(n log n)** | O(n log n) | O(n) |
| Quick sort | O(n log n) | O(n log n) | O(n²) | O(log n) stack |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) |
| BST search | O(1) | O(log n) | O(n) (skewed) | – |
| BFS / DFS (adjacency list) | O(V + E) | O(V + E) | O(V + E) | O(V) |
| Matrix multiplication (naive) | O(n³) | O(n³) | O(n³) | – |

⭐ **Asked in DSSSB (25 Jun 2023, S2):** the best and worst case of selection sort are both **O(n²)**, because it always makes n(n−1)/2 comparisons. The average case of merge sort is **O(n log n)**. Details are in the *Searching, Sorting & Hashing* chapter.

---

## 4. Recursion

A function is **recursive** if it calls itself, either directly or indirectly (A calls B, and B calls A). Every recursive function needs:
1. a **base case**, which is solved without recursion and stops the calls, and
2. a **recursive case**, which moves towards the base case.

A missing or unreachable base case causes infinite recursion and then a **stack overflow**.

```c
int fact(int n) {               /* head-style: multiplication after the call  */
    if (n <= 1) return 1;       /* base case                                   */
    return n * fact(n - 1);     /* recursive case                              */
}
```

**Recursion tree for fib(4)** (naive `fib(n) = fib(n-1) + fib(n-2)`):

```text
                 fib(4)
               /        \
          fib(3)         fib(2)
          /    \         /    \
     fib(2)  fib(1)  fib(1)  fib(0)
     /    \
 fib(1)  fib(0)
```

That is **9 calls** in total. In general naive fib(n) makes 2·F(n+1) − 1 calls: fib(5) makes 15 and fib(10) makes 177. The same sub-problems are solved again and again, which is why naive Fibonacci is exponential, about Θ(φⁿ) with φ ≈ 1.618, and is usually quoted as O(2ⁿ). Memoisation (dynamic programming) reduces it to O(n).

**Tail recursion:** the recursive call is the **last action** of the function, with nothing left to do after it returns. A compiler can turn it into a loop (tail-call optimisation), so it needs only O(1) stack.

```c
int fact_tail(int n, int acc) {          /* call: fact_tail(n, 1)      */
    if (n <= 1) return acc;
    return fact_tail(n - 1, n * acc);    /* tail call                  */
}
```

| Recursion | Iteration |
|---|---|
| Ends at a base case | Ends when the loop condition becomes false |
| Uses the call stack, O(depth) extra space | O(1) extra space |
| Slower, because of call overhead | Faster |
| A missing base case gives a stack overflow | A wrong condition gives an infinite loop (no crash) |
| Natural for trees, divide and conquer, backtracking | Natural for simple repetition |

Every recursive algorithm can be written iteratively by using an explicit stack.

### 4.1 Recurrence relations

A recurrence expresses T(n) in terms of T on smaller inputs. There are four ways to solve one:
1. **Substitution:** guess the answer and prove it by induction. For T(n) = 2T(n/2) + n, guess T(n) ≤ c·n log n.
2. **Iteration (back substitution):** T(n) = T(n−1) + n = T(n−2) + (n−1) + n = … = 1 + 2 + … + n = n(n+1)/2, so Θ(n²).
3. **Recursion tree:** add up the cost of each level. For 2T(n/2) + n, every level costs n and there are log₂ n levels, so the total is Θ(n log n).
4. **Master theorem**, for divide-and-conquer recurrences.

### 4.2 Master theorem

For **T(n) = aT(n/b) + f(n)**, with a ≥ 1 and b > 1, compute the **watershed function n^(log_b a)** and compare it with f(n).

| Case | Condition | Result |
|---|---|---|
| 1 | f(n) = O(n^(log_b a − ε)) for some ε > 0 (f is polynomially **smaller**) | **T(n) = Θ(n^(log_b a))** |
| 2 | f(n) = Θ(n^(log_b a) · logᵏ n), k ≥ 0 (they are **equal**) | **T(n) = Θ(n^(log_b a) · logᵏ⁺¹ n)**. With k = 0 this is Θ(n^(log_b a) log n). |
| 3 | f(n) = Ω(n^(log_b a + ε)) **and** a·f(n/b) ≤ c·f(n) for some c < 1 (f is polynomially **larger**, plus the regularity condition) | **T(n) = Θ(f(n))** |

**Six worked examples**

| # | Recurrence | n^(log_b a) | Comparison | Case | Answer |
|---|---|---|---|---|---|
| 1 | T(n) = 2T(n/2) + n (merge sort) | n^(log₂2) = n | equal | 2 | **Θ(n log n)** |
| 2 | T(n) = T(n/2) + 1 (binary search) | n^(log₂1) = n⁰ = 1 | equal | 2 | **Θ(log n)** |
| 3 | T(n) = 9T(n/3) + n | n^(log₃9) = n² | n is smaller | 1 | **Θ(n²)** |
| 4 | T(n) = 7T(n/2) + n² (Strassen) | n^(log₂7) ≈ n^2.807 | n² is smaller | 1 | **Θ(n^2.81)** |
| 5 | T(n) = 3T(n/4) + n log n | n^(log₄3) ≈ n^0.793 | n log n is larger; regularity: 3(n/4)log(n/4) ≤ (3/4)n log n | 3 | **Θ(n log n)** |
| 6 | T(n) = 2T(n/2) + n² | n | n² is larger; regularity: 2(n/2)² = n²/2 ≤ ½·n² | 3 | **Θ(n²)** |

Bonus: T(n) = 4T(n/2) + n² gives n^(log₂4) = n², which equals f(n), so case 2 gives **Θ(n² log n)**. Each result above was checked numerically by evaluating T(n)/answer for growing n.

**When the theorem does not apply:**
- T(n) = T(n−1) + n, because the problem shrinks by subtraction, not division.
- T(n) = 2T(n/2) + n/log n, because f falls in the gap between cases 1 and 2 (it is smaller, but not *polynomially* smaller).
- a < 1, or a non-constant a such as T(n) = nT(n/2) + 1.

Note: not every recursive or "split" algorithm is divide and conquer. ⭐ **All-pairs shortest path (Floyd–Warshall) is dynamic programming** (asked 24 Jun 2023, S3). See *Algorithm Design Techniques*.

### 4.3 Standard recurrences table

| Algorithm | Recurrence | Solution |
|---|---|---|
| Binary search | T(n) = T(n/2) + 1 | O(log n) |
| ⭐ Merge sort | T(n) = 2T(n/2) + n | O(n log n) in all cases |
| Quick sort, best/average | T(n) = 2T(n/2) + n | O(n log n) |
| Quick sort, worst (sorted input, end pivot) | T(n) = T(n−1) + n | O(n²) |
| Factorial, recursive linear search | T(n) = T(n−1) + 1 | O(n) |
| Recursive selection/insertion sort | T(n) = T(n−1) + n | O(n²) |
| Binary-tree traversal | T(n) = 2T(n/2) + 1 | O(n) |
| Fast power xⁿ (squaring) | T(n) = T(n/2) + 1 | O(log n) |
| **Tower of Hanoi** | T(n) = 2T(n−1) + 1, T(1) = 1 | **2ⁿ − 1 moves**, O(2ⁿ) |
| Naive Fibonacci | T(n) = T(n−1) + T(n−2) + 1 | O(2ⁿ) (tight Θ(φⁿ)) |
| Strassen | T(n) = 7T(n/2) + n² | O(n^2.81) |

Tower of Hanoi moves: n = 3 needs 7, n = 4 needs 15, n = 5 needs 31, n = 10 needs 1,023, and n = 64 needs 2⁶⁴ − 1 = 18,446,744,073,709,551,615.

### 4.4 Amortised analysis

Amortised analysis gives the **average cost per operation over a worst-case sequence** of operations, without using probability. Take a dynamic array that **doubles** its capacity when it is full. One insertion can cost O(n), because the whole array is copied. But over 1,024 insertions the total copying is only 1 + 2 + 4 + … + 512 = 1,023 element moves, so the total work is under 3n. That makes the **amortised cost O(1) per insertion**. There are three methods: **aggregate** (total cost ÷ number of operations), **accounting** (overcharge cheap operations and store credit) and **potential** (a potential function on the data structure). Other standard examples are stack MULTIPOP, incrementing a binary counter, and a queue built from two stacks.

### 4.5 Space complexity of recursion

Extra space = **maximum recursion depth × size of one stack frame**, plus any auxiliary arrays.

| Algorithm | Recursion depth | Space |
|---|---|---|
| Recursive factorial or sum of n items | n | O(n) |
| Tail-recursive factorial, with tail-call optimisation | 1 | O(1) |
| Recursive binary search | log n | O(log n) (iterative: O(1)) |
| Naive Fibonacci | n (the longest path) | O(n), even though time is O(2ⁿ) |
| Merge sort | log n | O(n) auxiliary array + O(log n) stack |
| Quick sort | log n on average, n in the worst case | O(log n) average, O(n) worst |
| Tower of Hanoi | n | O(n) |

---

## Exam traps

1. **Definiteness** means clear and unambiguous. **Finiteness** means the algorithm stops. **Effectiveness** means each step can be carried out. "Indefiniteness" is a distractor.
2. An algorithm needs **zero or more** inputs but **at least one** output.
3. A program need not terminate (an OS, for example), but an algorithm must.
4. The representation easiest to turn into a program is **pseudocode**, not the flowchart and not "algorithm".
5. **Optimisation** means the best among feasible solutions. **Decision** means yes/no. **Enumeration** means list all. **Counting** means how many.
6. O is only an upper bound: n = O(n²) is true, and so is n = O(n). Θ is the tight bound. Do not read O as "exact".
7. n² log n sits **between** n² and n³, and n log n sits between n and n².
8. Growth order is asymptotic. For small n the order can flip: log₂ 10 > √10.
9. 2ⁿ⁺¹ = O(2ⁿ), but 2²ⁿ ≠ O(2ⁿ). The log base never matters; the exponential base does.
10. Selection sort is O(n²) even on sorted input. Merge sort is O(n log n) even in the best case.
11. Master theorem case 3 also needs the **regularity condition**. T(n) = T(n−1) + n cannot be solved with the Master theorem.
12. Naive Fibonacci uses **O(n) space** but **O(2ⁿ) time**. Space depends on depth, not on the total number of calls.

## One-liners for revision

1. Algorithm: a finite set of clear instructions that solves a problem.
2. The five characteristics: input, output, definiteness, finiteness, effectiveness.
3. Input: zero or more. Output: at least one.
4. Definiteness: every instruction is clear and unambiguous.
5. Finiteness: terminates after a finite number of steps.
6. Effectiveness: every step is basic and can be done with pencil and paper.
7. Pseudocode is the easiest representation to convert into a program.
8. Flowchart: diamond = decision, parallelogram = input/output, oval = start/stop, rectangle = process.
9. An optimisation problem finds the best of the feasible solutions.
10. A decision problem has a yes/no answer.
11. Linear data structures: array, stack, queue, linked list.
12. Non-linear data structures: tree, graph.
13. Array = static; linked list = dynamic.
14. An ADT specifies operations, not implementation.
15. S(P) = c + S_P: fixed part plus variable part.
16. Worst case gives a guarantee and is the usual measure.
17. Linear search average for a successful search: (n + 1)/2 comparisons.
18. O = upper bound; Ω = lower bound; Θ = tight bound.
19. o and ω are strict bounds; the limit of f/g is 0 or ∞.
20. f = Θ(g) exactly when f = O(g) and f = Ω(g).
21. Only Θ is symmetric.
22. Order: 1 < log n < √n < n < n log n < n² < n³ < 2ⁿ < n! < nⁿ.
23. log(n!) = Θ(n log n).
24. A loop with i *= 2 runs O(log n) times.
25. A loop with i*i ≤ n runs O(√n) times.
26. A loop with i = i*i runs O(log log n) times.
27. Dependent nested loop 0 + 1 + … + (n−1) = n(n−1)/2, which is O(n²).
28. Harmonic double loop = O(n log n).
29. Recursion needs a base case; without one you get a stack overflow.
30. Tail recursion: the recursive call is the last statement, so it can become a loop.
31. Master theorem: compare f(n) with n^(log_b a).
32. 2T(n/2) + n gives Θ(n log n).
33. T(n/2) + 1 gives Θ(log n).
34. 7T(n/2) + n² gives Θ(n^2.81) (Strassen).
35. T(n−1) + n gives Θ(n²).
36. Tower of Hanoi needs 2ⁿ − 1 moves.
37. Naive fib(n) makes 2F(n+1) − 1 calls.
38. A doubling dynamic array gives O(1) amortised insertion.
39. Recursion space = depth × frame size.
40. Floyd–Warshall (all-pairs shortest path) is DP, not divide and conquer.

## Quick self-check

1. Which characteristic says each instruction must be clear and unambiguous?
   **Answer:** Definiteness.
2. Which representation is easiest to convert into a program?
   **Answer:** Pseudocode.
3. Finding the shortest route among all valid routes is which type of problem?
   **Answer:** Optimisation.
4. Arrange in order: n log n, 2ⁿ, log n, n² log n, n.
   **Answer:** log n < n < n log n < n² log n < 2ⁿ.
5. How many times does `for (i = 1; i < 1024; i *= 2)` run?
   **Answer:** 10 (log₂ 1024).
6. What is the complexity of `for (i=0;i<n;i++) for (j=0;j<i;j++)`?
   **Answer:** n(n−1)/2 iterations, so O(n²).
7. Solve T(n) = 9T(n/3) + n.
   **Answer:** n^(log₃9) = n² is larger than n, so case 1 gives Θ(n²).
8. How many moves does the Tower of Hanoi need for 5 discs?
   **Answer:** 2⁵ − 1 = 31.
9. Is 2²ⁿ = O(2ⁿ)?
   **Answer:** No. 2²ⁿ = 4ⁿ, and 4ⁿ/2ⁿ = 2ⁿ → ∞.
10. What is the space complexity of recursive binary search?
    **Answer:** O(log n), for the recursion depth.
