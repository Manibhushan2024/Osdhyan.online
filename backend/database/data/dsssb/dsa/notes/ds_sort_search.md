# Searching, Sorting & Hashing

**In 30 seconds**
- **Linear search**: works on any list; best 1, worst n, average (n + 1)/2 comparisons → O(n).
- **Binary search**: needs a **sorted** array; worst-case comparisons = ⌊log₂ n⌋ + 1 → O(log n).
- **Selection sort ⭐**: best = average = worst = **O(n²)**, always n(n − 1)/2 comparisons, at most n − 1 swaps, not stable.
- **Merge sort ⭐**: **divide and conquer**, O(n log n) in best, average and worst case, O(n) extra space, stable.
- **Quick sort**: average O(n log n), worst O(n²) (already sorted input with first/last element as pivot), in-place, not stable.
- **O(n) best case** only for adaptive sorts: optimised bubble sort and insertion sort on already sorted input.
- **Any comparison sort needs Ω(n log n)** comparisons in the worst case; counting/radix/bucket beat it because they do not compare.
- **Hashing**: average O(1) search; collisions solved by chaining or open addressing (linear → primary clustering, quadratic → secondary clustering, double hashing → least clustering).

---

## 1. Searching

### 1.1 Linear (sequential) search
Check A[0], A[1], … one by one until the key is found or the list ends. Works on **unsorted** data, arrays and linked lists.

| Case | Comparisons | Order |
|---|---|---|
| Best (key at first position) | 1 | O(1) |
| Worst (key at last position or absent) | n | O(n) |
| Average, successful (each position equally likely) | (1 + 2 + … + n)/n = **(n + 1)/2** | O(n) |
| Unsuccessful | n (n + 1 with a sentinel) | O(n) |

**Sentinel search**: put the key at A[n] so the loop needs no "end of array" test; it saves one test per step but not the order of growth.

### 1.2 Binary search
**Requirement**: the array must be **sorted** (and support direct access by index — so it is not efficient on a linked list).
Idea: compare the key with the middle element; if smaller search the left half, if larger the right half. Each comparison halves the search space → **decrease and conquer / divide and conquer** (DSSSB lists it as a D&C application ⭐).

**Iterative (C-style pseudocode)**
```
int bsearch(int A[], int n, int key) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;          // lo + (hi - lo)/2 avoids overflow
        if (A[mid] == key) return mid;
        else if (key < A[mid]) hi = mid - 1;
        else lo = mid + 1;
    }
    return -1;                            // not found
}
```
**Recursive**
```
int bs(int A[], int lo, int hi, int key) {
    if (lo > hi) return -1;
    int mid = (lo + hi) / 2;
    if (A[mid] == key) return mid;
    if (key < A[mid]) return bs(A, lo, mid - 1, key);
    return bs(A, mid + 1, hi, key);
}
```
Recurrence: T(n) = T(n/2) + 1 → **O(log n)**. Space: iterative O(1), recursive O(log n) stack.

**Worked trace** — A = [5, 9, 13, 18, 22, 27, 31, 36, 40, 44, 50] (n = 11, index 0–10)

Search 40:

| Step | lo | hi | mid | A[mid] | Action |
|---|---|---|---|---|---|
| 1 | 0 | 10 | 5 | 27 | 40 > 27 → lo = 6 |
| 2 | 6 | 10 | 8 | 40 | **found** at index 8 (2 comparisons) |

Search 23 (absent):

| Step | lo | hi | mid | A[mid] | Action |
|---|---|---|---|---|---|
| 1 | 0 | 10 | 5 | 27 | 23 < 27 → hi = 4 |
| 2 | 0 | 4 | 2 | 13 | 23 > 13 → lo = 3 |
| 3 | 3 | 4 | 3 | 18 | 23 > 18 → lo = 4 |
| 4 | 4 | 4 | 4 | 22 | 23 > 22 → lo = 5 > hi → **not found** (4 comparisons) |

**Number of comparisons (key-to-element, three-way counted once)**
- Worst case (successful or unsuccessful): **⌊log₂ n⌋ + 1**. n = 11 → ⌊3.46⌋ + 1 = **4**; n = 100 → 7; n = 1000 → 10; n = 1024 → 11.
- Best case: 1 (key at the middle).
- Average successful for n = 11: per element 3,4,2,3,4,1,3,4,2,3,4 → total 33 → **3.0**. In general ≈ log₂ n − 1 for large n.
- Binary search decision tree: height ⌊log₂ n⌋, so worst path = height + 1 comparisons.

### 1.3 Interpolation search
For sorted, **uniformly distributed** keys. Probe where the key "should" be, like opening a dictionary near "S":
pos = lo + ⌊(key − A[lo]) × (hi − lo) / (A[hi] − A[lo])⌋.
Example (same A, key 40): pos = 0 + ⌊35 × 10/45⌋ = 7 → A[7] = 36 < 40 → lo = 8 → pos = 8 → found.
Average **O(log log n)**; worst **O(n)** (skewed data such as 1, 2, 3, …, 10⁹).

### 1.4 Jump (block) search
Sorted array. Jump ahead by block size m, then do a linear search inside the block where the key must lie. Best block size **m = √n**; time **O(√n)**. Order of speed: linear O(n) > jump O(√n) > binary O(log n).

### 1.5 Search complexity summary
| Method | Needs sorted? | Best | Average | Worst | Space |
|---|---|---|---|---|---|
| Linear | No | O(1) | O(n) | O(n) | O(1) |
| Binary | Yes | O(1) | O(log n) | O(log n) | O(1) iter / O(log n) rec |
| Interpolation | Yes + uniform | O(1) | O(log log n) | O(n) | O(1) |
| Jump | Yes | O(1) | O(√n) | O(√n) | O(1) |
| Hashing | No | O(1) | O(1) | O(n) | O(n) |
| BST search | — | O(1) | O(log n) | O(n) (skewed) | — |

---

## 2. Sorting terminology

| Term | Meaning | Examples |
|---|---|---|
| **In-place** | Uses only O(1) extra memory (a few variables; quick sort's O(log n) stack is still called in-place) | Bubble, selection, insertion, quick, heap, shell |
| **Stable** | Equal keys keep their original relative order | Bubble, insertion, merge, counting, radix, bucket (with a stable inner sort) |
| **Adaptive** | Runs faster when input is already (nearly) sorted | Insertion, optimised bubble, shell |
| **Internal sort** | All data fits in main memory (RAM) | All the algorithms below |
| **External sort** | Data on disk/tape, too large for RAM | External (k-way) merge sort |
| **Comparison sort** | Orders elements only by comparing pairs; lower bound Ω(n log n) | Bubble, selection, insertion, merge, quick, heap, shell |
| **Non-comparison sort** | Uses digit/key values as indices | Counting, radix, bucket |

**Inversion**: a pair (i, j) with i < j but A[i] > A[j]. Bubble sort's swaps = insertion sort's shifts = number of inversions. Maximum inversions = n(n − 1)/2 (reverse-sorted array).

---

## 3. The sorting algorithms — one array for every trace

**A = [42, 23, 74, 11, 65, 58]** (n = 6, 7 inversions). Sorted: [11, 23, 42, 58, 65, 74].

### 3.1 Bubble sort
**Idea**: compare adjacent pairs and swap if out of order; after pass k the k-th largest element has "bubbled" to its final place at the end. **Optimised** version stops when a pass makes no swap.

| Pass | Array after the pass | Swaps in pass |
|---|---|---|
| 1 | [23, 42, 11, 65, 58, **74**] | 4 |
| 2 | [23, 11, 42, 58, **65, 74**] | 2 |
| 3 | [11, 23, 42, **58, 65, 74**] | 1 |
| 4 | [11, 23, 42, 58, 65, 74] | 0 → stop |

Comparisons = 5 + 4 + 3 + 2 = **14**; swaps = **7** (= inversions).
- Comparisons (no early stop): n(n − 1)/2. Max passes n − 1.
- Best (sorted, optimised): one pass, n − 1 comparisons, 0 swaps → **O(n)**. Without the flag: O(n²) even when sorted.
- Average/worst O(n²); worst swaps n(n − 1)/2 (reverse order). In-place, **stable**, adaptive (optimised).

### 3.2 Selection sort ⭐ Asked in DSSSB
**Idea**: in pass i find the **minimum** of the unsorted part A[i..n−1] and swap it into position i.

| Pass | Minimum found | Array after the pass | Swap? |
|---|---|---|---|
| 1 | 11 | [**11**, 23, 74, 42, 65, 58] | 42 ↔ 11 |
| 2 | 23 | [11, **23**, 74, 42, 65, 58] | none (already in place) |
| 3 | 42 | [11, 23, **42**, 74, 65, 58] | 74 ↔ 42 |
| 4 | 58 | [11, 23, 42, **58**, 65, 74] | 74 ↔ 58 |
| 5 | 65 | [11, 23, 42, 58, **65**, 74] | none |

Comparisons = 5 + 4 + 3 + 2 + 1 = **15 = n(n − 1)/2**, whatever the input. Swaps here = 3; the textbook code that always swaps does exactly n − 1 = 5.
- **Best = average = worst = O(n²)** ⭐ (the scan for the minimum never stops early) — it is **not adaptive**.
- Swaps: **at most n − 1** → O(n) swaps, the fewest of the simple sorts; good when writing to memory is costly.
- In-place; **not stable** (e.g. [5a, 5b, 2] → 2 is swapped with 5a → [2, 5b, 5a]).

### 3.3 Insertion sort
**Idea**: like arranging playing cards — take the next element (key) and shift bigger elements of the sorted left part one place right, then insert the key.

| Pass | Key | Array after the pass | Shifts |
|---|---|---|---|
| 1 | 23 | [23, 42, 74, 11, 65, 58] | 1 |
| 2 | 74 | [23, 42, 74, 11, 65, 58] | 0 |
| 3 | 11 | [11, 23, 42, 74, 65, 58] | 3 |
| 4 | 65 | [11, 23, 42, 65, 74, 58] | 1 |
| 5 | 58 | [11, 23, 42, 58, 65, 74] | 2 |

Comparisons = **10**, shifts = **7** (= inversions).
- Best (already sorted): n − 1 comparisons, 0 shifts → **O(n)**. Worst (reverse): n(n − 1)/2 comparisons → O(n²). Average O(n²).
- **Best simple sort for small or nearly sorted data**; online (can sort as data arrives); in-place, **stable**, adaptive.
- Binary insertion sort cuts comparisons to O(n log n) but shifts stay O(n²) → still O(n²).

### 3.4 Merge sort ⭐ Asked in DSSSB
**Idea (divide and conquer ⭐)**: **Divide** the array into two halves, **conquer** by sorting each half recursively, **combine** by merging two sorted halves in linear time.

Trace (mid = (lo + hi)/2, left half gets the extra element):
```
                 [42 23 74 11 65 58]
           [42 23 74]           [11 65 58]
         [42 23]  [74]        [11 65]  [58]
        [42] [23]            [11] [65]
merge:  [23 42]              [11 65]
merge:  [23 42 74]           [11 58 65]
merge:        [11 23 42 58 65 74]
```
Key comparisons = 1 + 2 + 1 + 2 + 5 = **11**.
- Recurrence **T(n) = 2T(n/2) + n → O(n log n)** in **best, average ⭐ and worst** cases (log₂ n levels × O(n) merge work per level).
- Merging two sorted lists of sizes m and n needs at most **m + n − 1** comparisons (at least min(m, n)).
- Extra space **O(n)** (auxiliary array) → **not in-place** (array version); **stable** (take from the left half on ties).
- Best choice for **linked lists** (no random access needed, O(1) extra space for lists) and for **external sorting**.

### 3.5 Quick sort
**Idea (divide and conquer)**: choose a **pivot**, **partition** so that smaller elements go left and larger go right, then sort the two parts recursively. The work is in the *divide* step; there is no combine step (contrast: merge sort's work is in the combine step).

**Lomuto partition (pivot = last element)**: first partition of A, pivot = 58
```
j scans 42 (≤58, i=0), 23 (≤58, i=1), 74 (>58), 11 (≤58, i=2: swap 74↔11), 65 (>58)
→ [42 23 11 74 65 58] → swap pivot with A[i+1]=74 → [42 23 11 | 58 | 65 74]
```
| Call | Pivot | Result | Comparisons |
|---|---|---|---|
| A[0..5] | 58 | [42, 23, 11, **58**, 65, 74] | 5 |
| A[0..2] | 11 | [**11**, 23, 42, 58, 65, 74] | 2 |
| A[1..2] | 42 | [11, 23, **42**, 58, 65, 74] | 1 |
| A[4..5] | 74 | [11, 23, 42, 58, 65, **74**] | 1 |

Total comparisons = **9**.

**Hoare-style partition (pivot = first element = 42)**: i moves right while A[i] < pivot, j moves left while A[j] > pivot; swap A[i], A[j]; when they cross, swap pivot with A[j].
```
i stops at 74 (index 2), j stops at 11 (index 3) → swap → [42 23 11 74 65 58]
i stops at 74 (index 3), j stops at 11 (index 2) → crossed → swap pivot with A[2]
→ [11 23 | 42 | 74 65 58]
```

**Complexity**
| Case | When | Recurrence | Time |
|---|---|---|---|
| Best | pivot splits into equal halves | T(n) = 2T(n/2) + n | O(n log n) |
| Average | random input | — | O(n log n) (≈ 1.39 n log₂ n comparisons) |
| Worst | **already sorted or reverse sorted input with first/last element pivot**; all keys equal (Lomuto) | T(n) = T(n − 1) + n | **O(n²)**, n(n − 1)/2 comparisons |

- Space: O(log n) stack on average, O(n) worst. Called **in-place**. **Not stable**.
- Fixes for the worst case: **randomised pivot**, **median-of-three** pivot. Usually the fastest sort in practice (good cache use, small constants).

### 3.6 Heap sort
**Idea**: build a **max-heap** (O(n) by bottom-up heapify), then repeatedly swap the root (maximum) with the last element, shrink the heap by one and heapify the root (O(log n)).

| Step | Heap part | Sorted part |
|---|---|---|
| Build max-heap | [74, 65, 58, 11, 23, 42] | — |
| Extract 74 | [65, 42, 58, 11, 23] | [74] |
| Extract 65 | [58, 42, 23, 11] | [65, 74] |
| Extract 58 | [42, 11, 23] | [58, 65, 74] |
| Extract 42 | [23, 11] | [42, 58, 65, 74] |
| Extract 23 | [11] | [23, 42, 58, 65, 74] |

- **O(n log n) in all cases**, O(1) extra space → **in-place**; **not stable**; not adaptive.
- Ascending order uses a max-heap; descending uses a min-heap.

### 3.7 Shell sort
**Idea**: insertion sort on elements a **gap** apart, with shrinking gaps (Shell's sequence n/2, n/4, …, 1). Moves far-away elements early, so the final gap-1 pass is nearly sorted (insertion sort's best case).
- Gap 3: groups (42, 11), (23, 65), (74, 58) → [11, 23, 58, 42, 65, 74]
- Gap 1: → [11, 23, 42, 58, 65, 74]

Worst O(n²) with Shell's gaps; about O(n^1.5) with Knuth's (1, 4, 13, …) or Hibbard's gaps; O(n log² n) with Pratt's. In-place, **not stable**. Generalisation of insertion sort ("diminishing increment sort").

### 3.8 Counting sort (non-comparison)
For integers in a small range 0..k. Count each value, take cumulative counts (= final positions), place elements scanning **right to left** (keeps it stable).
Input [4, 2, 2, 8, 3, 3, 1], k = 8:
- count[0..8] = [0, 1, 2, 2, 1, 0, 0, 0, 1]
- cumulative = [0, 1, 3, 5, 6, 6, 6, 6, 7]
- output = [1, 2, 2, 3, 3, 4, 8]

Time **O(n + k)**, space **O(n + k)**, **stable**, not in-place. Bad when k ≫ n.

### 3.9 Radix sort (LSD)
Sort by the least significant digit first, then the next digit, … using a **stable** sort (counting sort) for each digit.
Input [170, 45, 75, 90, 802, 24, 2, 66]:
| Digit | Result |
|---|---|
| units | [170, 90, 802, 2, 24, 45, 75, 66] |
| tens | [802, 2, 24, 45, 66, 170, 75, 90] |
| hundreds | [2, 24, 45, 66, 75, 90, 170, 802] |

Time **O(d(n + k))** (d digits, base k), space O(n + k), stable. Linear when d is constant.

### 3.10 Bucket sort
For keys uniformly spread in [0, 1): put x into bucket ⌊n·x⌋, sort each bucket (insertion sort), concatenate.
[0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68] → B1 {0.12, 0.17}, B2 {0.21, 0.23, 0.26}, B3 {0.39}, B6 {0.68}, B7 {0.72, 0.78}, B9 {0.94}.
Average **O(n + k)**; worst **O(n²)** (everything in one bucket); space O(n + k); stable if the inner sort is stable.

---

## 4. MASTER TABLE ⭐ (learn this one table)

| Algorithm | Best | Average | Worst | Extra space | Stable | In-place | Technique |
|---|---|---|---|---|---|---|---|
| Bubble (optimised) | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | Brute force / exchange |
| **Selection ⭐** | **O(n²)** | O(n²) | **O(n²)** | O(1) | **No** | Yes | Brute force / selection |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | Incremental (decrease and conquer) |
| **Merge ⭐** | O(n log n) | **O(n log n)** | O(n log n) | **O(n)** | **Yes** | **No** | **Divide and conquer** |
| Quick | O(n log n) | O(n log n) | **O(n²)** | O(log n) stack | No | Yes | Divide and conquer (partition) |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No | Yes | Selection using a heap (transform and conquer) |
| Shell | O(n log n) | ≈ O(n^1.25–1.5) | O(n²) (Shell gaps) | O(1) | No | Yes | Diminishing increment insertion |
| Counting | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | No | Non-comparison (counting) |
| Radix | O(d(n + k)) | O(d(n + k)) | O(d(n + k)) | O(n + k) | Yes | No | Non-comparison (digit-wise) |
| Bucket | O(n + k) | O(n + k) | O(n²) | O(n + k) | Yes* | No | Non-comparison (scatter–gather) |

\*if each bucket is sorted with a stable sort.

**Quick facts from the table**
- O(n log n) **guaranteed** + in-place → **heap sort**. O(n log n) guaranteed + stable → **merge sort**.
- Fewest swaps → **selection sort** (≤ n − 1). Fewest comparisons on sorted input → insertion / optimised bubble (n − 1).
- Same complexity in all three cases → selection O(n²), merge O(n log n), heap O(n log n), counting O(n + k).
- Worst case of quick sort = O(n²) = worst case of bubble/insertion/selection.

**Which sort to choose?**
| Situation | Best choice | Why |
|---|---|---|
| Small n or nearly sorted data | Insertion sort | O(n) on sorted input, tiny overhead |
| Memory writes are expensive | Selection sort | at most n − 1 swaps |
| Guaranteed O(n log n), stability needed | Merge sort | stable, same time in all cases |
| Guaranteed O(n log n), no extra memory | Heap sort | in-place, O(1) space |
| Fastest in practice for random data in RAM | Quick sort (random / median-of-3 pivot) | small constants, cache-friendly |
| Linked list | Merge sort | needs only sequential access |
| Integers in a small range | Counting sort | O(n + k) |
| Fixed-length keys (phone numbers, dates) | Radix sort | O(d(n + k)) |
| Data larger than main memory | External merge sort | sequential disk access |

**Classic counts (n elements)**
| Algorithm | Comparisons | Swaps / moves |
|---|---|---|
| Bubble (no flag) | n(n − 1)/2 always | best 0, worst n(n − 1)/2 |
| Selection | n(n − 1)/2 always | ≤ n − 1 |
| Insertion | best n − 1, worst n(n − 1)/2 | shifts = inversions |
| Quick (worst) | n(n − 1)/2 | — |
| Merge two lists m, n | ≤ m + n − 1 | — |

---

## 5. Lower bound for comparison sorting
Any comparison sort can be drawn as a **decision tree**: each internal node is one comparison, each leaf is one of the **n!** possible orderings. A binary tree of height h has at most 2ʰ leaves, so 2ʰ ≥ n! → h ≥ log₂(n!) = **Ω(n log n)** (Stirling). Hence merge sort and heap sort are **asymptotically optimal** comparison sorts.
Minimum worst-case comparisons ⌈log₂ n!⌉: n = 3 → 3, n = 4 → 5, n = 5 → 7.
Counting, radix and bucket sort do not compare keys, so this bound does not apply to them.

## 6. External sorting
When data is too large for main memory (files on disk), use **external merge sort**: (1) read memory-sized chunks, sort each internally and write it back as a sorted **run**; (2) repeatedly **k-way merge** the runs (a min-heap/selection tree picks the smallest front element) until one sorted file remains. Cost is measured in **disk I/O passes**, not comparisons; fewer passes come from longer runs (replacement selection gives runs about twice the memory size on average) and a larger merge order k. Polyphase merge and balanced merge are variants used with tapes.

---

## 7. Hashing

### 7.1 Basic idea
A **hash table** stores keys in an array of m slots (buckets). A **hash function** h(k) maps a key to a slot index 0..m − 1, so insert, search and delete take **O(1) on average**, independent of n. A **collision** happens when two different keys get the same slot (h(k₁) = h(k₂)); colliding keys are called **synonyms**.
Good hash function: easy to compute, spreads keys uniformly, uses every part of the key, minimises collisions.

### 7.2 Hash functions
| Method | Formula / rule | Example |
|---|---|---|
| **Division** | h(k) = k mod m; choose **m prime**, not near a power of 2 | 1234 mod 11 = **2** |
| **Mid-square** | square the key, take the middle r digits | 3205² = 10**27**2025 → middle two digits **72** |
| **Folding (shift)** | split key into equal parts and add (drop carry) | 123456789 → 123 + 456 + 789 = 1368 → **368** (m = 1000) |
| **Folding (boundary)** | reverse alternate (outer) parts, then add | 321 + 456 + 987 = 1764 → **764** |
| **Multiplication** | h(k) = ⌊m · (k·A mod 1)⌋, 0 < A < 1, Knuth: A ≈ 0.618 (golden ratio − 1); m can be a power of 2 | k = 100, m = 10: 100 × 0.618034 = 61.8034 → 0.8034 × 10 → **8** |
| Digit analysis / extraction | pick certain digits of the key | — |
| Universal hashing | choose h at random from a family | protects against bad inputs |

### 7.3 Load factor
**α = n / m** (keys stored / table size).
- Chaining: α can exceed 1; average chain length = α. Unsuccessful search Θ(1 + α); successful Θ(1 + α/2).
- Open addressing: α ≤ 1 always. Expected probes (uniform hashing): unsuccessful ≤ **1/(1 − α)**, successful ≤ (1/α) ln(1/(1 − α)). At α = 0.5 → 2 probes; α = 0.9 → 10 probes.
- Linear probing (Knuth): unsuccessful ≈ ½(1 + 1/(1 − α)²), successful ≈ ½(1 + 1/(1 − α)). At α = 0.75 → 8.5 and 2.5.

### 7.4 Collision resolution
**(a) Separate chaining (open hashing)**: each slot holds a linked list of all keys hashing there. Simple, deletion easy, never "full", but needs extra memory for pointers.
**(b) Open addressing (closed hashing)**: all keys live inside the table; on collision **probe** other slots: hᵢ(k) = (h(k) + f(i)) mod m, i = 0, 1, 2, …

| Technique | f(i) | Problem |
|---|---|---|
| **Linear probing** | i → slots h, h+1, h+2, … | **Primary clustering**: long runs of filled slots grow and slow everything |
| **Quadratic probing** | i² → h, h+1, h+4, h+9, … | **Secondary clustering**: keys with the same home slot follow the same probe path; may fail to find a free slot when α > ½ (guaranteed to succeed only if m is prime and α ≤ ½) |
| **Double hashing** | i · h₂(k) | Almost no clustering; h₂(k) must never be 0 and should be relatively prime to m (e.g. h₂(k) = R − (k mod R), R prime < m) |

Deletion in open addressing uses a **"deleted" marker (tombstone)** — emptying a slot would break the probe chain for later searches (lazy deletion).

### 7.5 Worked insertion sequences (verified by script)

**Sequence 1** — m = 10, h(k) = k mod 10, keys 89, 18, 49, 58, 69 (in this order)

| Key | Home h(k) | Linear probing | Quadratic probing | Double hashing h₂ = 7 − (k mod 7) |
|---|---|---|---|---|
| 89 | 9 | 9 | 9 | 9 |
| 18 | 8 | 8 | 8 | 8 |
| 49 | 9 | 9 ✗ → **0** | 9 ✗ → 9+1 = **0** | h₂ = 7: 9 ✗ → (9+7) mod 10 = **6** |
| 58 | 8 | 8 ✗, 9 ✗, 0 ✗ → **1** | 8 ✗, 9 ✗ → 8+4 = **2** | h₂ = 5: 8 ✗ → 13 mod 10 = **3** |
| 69 | 9 | 9 ✗, 0 ✗, 1 ✗ → **2** | 9 ✗, 0 ✗ → 9+4 = 13 → **3** | h₂ = 1: 9 ✗ → **0** |

Final tables:
| Slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| Linear | 49 | 58 | 69 | – | – | – | – | – | 18 | 89 |
| Quadratic | 49 | – | 58 | 69 | – | – | – | – | 18 | 89 |
| Double | 69 | – | – | 58 | – | – | 49 | – | 18 | 89 |

Chaining: slot 8 → 18 → 58; slot 9 → 89 → 49 → 69. Note the linear-probing cluster 8-9-0-1-2 (primary clustering).

**Sequence 2** — m = 11, h(k) = k mod 11, keys 22, 1, 13, 11, 24, 33, 18, 42, 31

| Key | Home | Linear probing: probes → slot | Quadratic probing: slot |
|---|---|---|---|
| 22 | 0 | → 0 | 0 |
| 1 | 1 | → 1 | 1 |
| 13 | 2 | → 2 | 2 |
| 11 | 0 | 0, 1, 2 ✗ → **3** | 0, 1 ✗ → 0+4 = **4** |
| 24 | 2 | 2, 3 ✗ → **4** | 2 ✗ → 2+1 = **3** |
| 33 | 0 | 0–4 ✗ → **5** | 0, 1, 4 ✗ → 0+9 = **9** |
| 18 | 7 | → 7 | 7 |
| 42 | 9 | → 9 | 9 ✗ → **10** |
| 31 | 9 | 9 ✗ → **10** | 9, 10, 2, 7, 3, 1, … all full → **cannot be inserted** |

| Slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Linear | 22 | 1 | 13 | 11 | 24 | 33 | – | 18 | – | 42 | 31 |
| Quadratic | 22 | 1 | 13 | 24 | 11 | – | – | 18 | – | 33 | 42 |

Lesson: with α > ½ quadratic probing can fail even though slots 5, 6, 8 are empty (9 + i² mod 11 reaches only 6 different slots). Chaining: 0 → 22, 11, 33; 1 → 1; 2 → 13, 24; 7 → 18; 9 → 42, 31.

**Sequence 3** — m = 7, h(k) = k mod 7, keys 76, 93, 40, 47, 10, 55 (a GATE-style favourite)

| Key | Home | Linear probing | Double hashing h₂ = 5 − (k mod 5) |
|---|---|---|---|
| 76 | 6 | 6 | 6 |
| 93 | 2 | 2 | 2 |
| 40 | 5 | 5 | 5 |
| 47 | 5 | 5, 6 ✗ → **0** | h₂ = 3: (5+3) mod 7 = **1** |
| 10 | 3 | 3 | 3 |
| 55 | 6 | 6, 0 ✗ → **1** | h₂ = 5: (6+5) mod 7 = **4** |

| Slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Linear | 47 | 55 | 93 | 10 | – | 40 | 76 |
| Double | – | 47 | 93 | 10 | 55 | 40 | 76 |

(Quadratic probing gives the same table as linear here: 47 → 5, 6, 9 mod 7 = 2 ✗, 14 mod 7 = 0 ✓; 55 → 6, 0, 3 ✗, 15 mod 7 = 1 ✓.)

### 7.6 Rehashing
When α crosses a threshold (≈ 0.7–0.75 for chaining, 0.5 for open addressing/quadratic) or an insertion fails, create a new table of about **double size (next prime)** and re-insert every key with the new hash function — O(n) for that step, **amortised O(1)** per insertion.
Example: m = 5 with keys 12, 17, 8, 3 (linear probing) → [3, –, 12, 17, 8], α = 0.8. Rehash to m = 11: 12 → 1, 17 → 6, 8 → 8, 3 → 3; α drops to 0.36.

### 7.7 Complexity with hashing
| Operation | Average | Worst (all keys collide) |
|---|---|---|
| Search / insert / delete | **O(1)** | **O(n)** |

Hashing does **not** keep keys in order: finding min/max, sorted output or range queries are O(n) — use a BST or sorted array for those. A **perfect hash function** has no collisions for a fixed key set (O(1) worst case).

### 7.8 Applications
Symbol tables in compilers, database indexing, caches, dictionaries / sets (Python dict, Java HashMap), password storage (cryptographic hashes), duplicate detection, spell checkers, Rabin–Karp string matching, routers, blockchain, file integrity checksums.

---

## Exam traps
1. **Selection sort best case is O(n²), not O(n)** ⭐ — it still scans the whole unsorted part every pass.
2. **Merge sort is O(n log n) in all three cases** ⭐; O(n²) belongs to quick sort's worst case.
3. Merge sort is **not in-place** (O(n) extra) but **is stable**; heap sort is in-place but **not stable**.
4. Quick sort's worst case is triggered by an **already sorted** array (first/last pivot) — the "best" input for insertion sort is the worst for naive quick sort.
5. Binary search needs a **sorted** array; on a linked list it loses its advantage (no O(1) middle access).
6. Worst-case binary search comparisons = **⌊log₂ n⌋ + 1**, not log₂ n (n = 1000 → 10, n = 1024 → 11).
7. Bubble sort is O(n) on sorted input **only with the swap flag**; the plain version is O(n²).
8. Selection sort makes O(n²) comparisons but only **O(n) swaps**; insertion sort makes O(n²) shifts in the worst case.
9. Counting/radix sort "beat" O(n log n) because they are **not comparison sorts** — the Ω(n log n) bound is only for comparison sorts.
10. **Linear probing → primary clustering; quadratic → secondary clustering**; do not swap them.
11. Load factor in open addressing is ≤ 1; with chaining it may exceed 1.
12. In open addressing, deleting by emptying a slot breaks searches — use a "deleted" marker.

## One-liners for revision
1. Linear search average successful comparisons = (n + 1)/2.
2. Linear search works on unsorted data and linked lists.
3. Binary search requires sorted data with random access.
4. Binary search worst-case comparisons = ⌊log₂ n⌋ + 1.
5. Binary search recurrence: T(n) = T(n/2) + 1 → O(log n).
6. Interpolation search: O(log log n) average, O(n) worst.
7. Jump search block size √n, time O(√n).
8. Stable sort: equal keys keep their input order.
9. In-place sort: O(1) extra memory.
10. Adaptive sort: faster on nearly sorted input (insertion, optimised bubble).
11. Bubble sort: after pass k, the k largest are in place.
12. Bubble sort swaps = number of inversions.
13. Selection sort: n(n − 1)/2 comparisons always ⭐.
14. Selection sort: at most n − 1 swaps.
15. Selection sort is unstable and non-adaptive.
16. Insertion sort best case O(n) on sorted input.
17. Insertion sort is best for small or nearly sorted arrays.
18. Merge sort technique: divide and conquer ⭐.
19. Merge sort: T(n) = 2T(n/2) + n = O(n log n) ⭐.
20. Merging lists of size m and n: at most m + n − 1 comparisons.
21. Merge sort is preferred for linked lists and external sorting.
22. Quick sort: work done in partition (divide), no combine step.
23. Quick sort worst O(n²): T(n) = T(n − 1) + n.
24. Randomised or median-of-three pivot avoids the sorted-input worst case.
25. Heap sort: O(n log n) always, in-place, unstable.
26. Building a heap bottom-up takes O(n).
27. Shell sort = insertion sort with diminishing gaps.
28. Counting sort: O(n + k), stable, needs a small key range.
29. Radix sort: O(d(n + k)), uses a stable sort per digit, LSD first.
30. Bucket sort: O(n + k) average, O(n²) worst.
31. Comparison-sort lower bound Ω(n log n) via a decision tree with n! leaves.
32. External sorting = sorted runs + k-way merge.
33. Hash table average search O(1), worst O(n).
34. Division method: choose m prime, away from powers of 2.
35. Multiplication method: Knuth's A ≈ 0.618.
36. Load factor α = n/m.
37. Chaining = open hashing; open addressing = closed hashing.
38. Double hashing: h₂(k) ≠ 0 and coprime to m.
39. Rehashing doubles the table (next prime) and re-inserts all keys.
40. Hashing gives no ordering — no efficient min, max or range query.

## Quick self-check
1. Best- and worst-case time of selection sort? — **O(n²) and O(n²)** ⭐
2. Average-case time and design technique of merge sort? — **O(n log n); divide and conquer** ⭐
3. Maximum comparisons for binary search on 100 sorted elements? — **⌊log₂ 100⌋ + 1 = 7**
4. Average comparisons for a successful linear search on n elements? — **(n + 1)/2**
5. Which O(n log n) sort is in-place in the worst case? — **Heap sort**
6. Which input makes quick sort with last-element pivot take O(n²)? — **An already sorted (or reverse sorted) array**
7. Comparisons made by selection sort on 6 elements? — **15** (n(n − 1)/2)
8. Keys 89, 18, 49, 58, 69 into m = 10 by linear probing — where does 69 go? — **Slot 2**
9. Clustering caused by quadratic probing? — **Secondary clustering**
10. Name two stable sorts and one unstable sort. — **Merge, insertion (stable); quick/heap/selection (unstable)**
