# Indexing & File Organisation

**In 30 seconds**
- Data lives on disk in **blocks**; the cost of a query is counted in **block accesses**, not CPU steps.
- **Blocking factor** bfr = ⌊B / R⌋ records per block; number of blocks b = ⌈r / bfr⌉.
- ⭐ Asked in DSSSB: a **primary index** is *an ordered file whose records are of fixed length with two fields: the primary key and a pointer to a disk block* (Navathe). One entry per **block**, keyed on the block's **anchor record**.
- **Clustering index** = on a non-key ordering field; **secondary index** = on a non-ordering field (dense).
- **Dense** index = an entry for every search-key value/record; **sparse** = entries for only some (e.g. one per block).
- A file can have **at most one** primary *or* clustering index, but **many** secondary indexes.
- **B+-tree**: data pointers only in leaves, leaves linked → best for **range queries**; B-tree stores data pointers in every node.
- Hashing gives ~1 block access for **equality** search but is poor for range search.

---

## 1. Storage hierarchy and blocks

| Level | Examples | Volatile? | Speed / cost |
|---|---|---|---|
| Primary storage | CPU cache, main memory (RAM) | Volatile | Fastest, costliest per byte |
| Secondary storage | Flash/SSD, magnetic disk | Non-volatile | Slower, cheaper; holds the database |
| Tertiary storage | Optical disk, magnetic tape | Non-volatile | Slowest, cheapest; archives and backups |

- The disk is divided into **blocks** (pages), typically 4–16 KB. A block is the **unit of transfer** between disk and memory; reading one byte costs a whole block.
- **Disk access time = seek time + rotational latency + block transfer time.** Seek time dominates.
- The **buffer manager** keeps recently used blocks in main memory (buffer pool).
- Because a disk access is roughly a million times slower than a memory access, every file and index design tries to **minimise block accesses**.

## 2. Records and blocking factor

- A file is a sequence of **records**; a record is a collection of field values.
- **Fixed-length records**: every record has the same size (easy to locate the i-th record). **Variable-length records**: varying fields, repeating fields, or optional fields.
- **Unspanned** organisation: a record may not cross a block boundary (unused space is left at the end of a block). **Spanned**: a record may continue in the next block (needed when R > B).
- **Blocking factor** (unspanned, fixed length): **bfr = ⌊B / R⌋**.
- **Unused space per block** = B − bfr × R.
- **Number of blocks** for r records: **b = ⌈r / bfr⌉**.

**Numerical 1.** r = 30,000 records, R = 100 bytes, B = 1024 bytes (unspanned).
- bfr = ⌊1024 / 100⌋ = **10** records per block; unused = 1024 − 1000 = **24 bytes** per block.
- b = ⌈30,000 / 10⌉ = **3,000 blocks**.

---

## 3. File organisations

| Organisation | How records are placed | Insert cost | Search cost |
|---|---|---|---|
| **Heap (pile / unordered)** | In order of insertion; new record goes in the last block. | Very cheap: read last block, add, write back (~1–2 accesses). | Linear search: **b/2** on average (key found), **b** if absent or not a key. Delete leaves gaps → periodic reorganisation. |
| **Sequential (sorted / ordered)** | Sorted on an **ordering field**. | Expensive: must find the place and shift records (about half the file) — usually an **overflow file** is used and merged later. | Binary search on the ordering field: **⌈log₂ b⌉** accesses. Other fields: linear. Excellent for ordered/range reading. |
| **Hash (direct)** | A hash function h(K) on the **hash field** gives the bucket address. | Cheap (~1 access + write), unless the bucket overflows. | Equality on hash field: **~1 access**. Range search and other fields: poor (full scan). |
| **Clustered (multitable clustering)** | Related records of **several tables** (e.g. a department and its employees) are stored in the same block. | Moderate | Fast for the join they are clustered for; slow for scanning one table alone. |
| **B+-tree file organisation** | The **leaf level of a B+-tree stores the records themselves**. | log-time with node splits, stays balanced. | log-time for equality; range search follows leaf links. No degradation with growth. |

**Numerical 2** (same file, 3,000 blocks):
- Heap, search on a key: on average 3,000 / 2 = **1,500** block accesses.
- Sorted on that key, binary search: ⌈log₂ 3000⌉ = **12** block accesses (2¹¹ = 2048 < 3000 ≤ 4096 = 2¹²).

---

## 4. Index basics

An **index** is an auxiliary access structure that speeds up retrieval of records on certain fields, just like the index at the back of a book.

- **Search key** – the attribute (or set of attributes) used to look up records. (Not necessarily a key of the relation.)
- **Pointer** – a **block pointer** (address of a disk block) or a **record pointer** (block address + offset).
- **Index entry (index record)** – ⟨search-key value, pointer⟩.
- An index file is much smaller than the data file because entries are short and (often) fewer.

Two basic kinds (Korth): **ordered indices** (entries sorted on the search key) and **hash indices** (entries distributed by a hash function).

Evaluation criteria: access types supported (equality, range), access time, insertion time, deletion time, space overhead.

---

## 5. Ordered indices

### 5.1 Primary index ⭐ Asked in DSSSB
Navathe: a **primary index is an ordered file whose records are of fixed length with two fields**: the first field is of the same data type as the **ordering key field (primary key)** of the data file, and the second field is a **pointer to a disk block** (a block address).

- The data file must be **physically ordered on the key field** (unique value in every record).
- There is **one index entry for each block** of the data file, not for each record.
- The key value stored in each entry is that of the **first record in the block**, called the **anchor record** or **block anchor**.
- So a primary index is **non-dense (sparse)**: number of index entries = **number of data blocks**.
- Search: binary search on the index to find the entry with the largest key ≤ the search key, then read that one data block.
- Problem: inserting/deleting records changes anchors; handled with overflow chains or deletion markers.

**Numerical 3 – primary index** (file from Numerical 1: r = 30,000, b = 3,000, B = 1024). Key field V = 9 bytes, block pointer P = 6 bytes.
- Index entry size Rᵢ = 9 + 6 = **15 bytes**.
- Index blocking factor bfrᵢ = ⌊1024 / 15⌋ = **68** entries per block.
- Number of index entries rᵢ = number of data blocks = **3,000**.
- Index blocks bᵢ = ⌈3000 / 68⌉ = **45 blocks**.
- Binary search on the index: ⌈log₂ 45⌉ = **6** accesses, **+1** for the data block = **7 block accesses** (versus 12 without the index).

### 5.2 Clustering index
- The data file is physically ordered on a **non-key field** (values repeat), called the **clustering field**, e.g. employees sorted by Dept_no.
- A **clustering index** is again an ordered file of two fields: clustering-field value and a **block pointer**.
- **One entry for each distinct value** of the clustering field, pointing to the **first block** that contains a record with that value.
- It is **sparse** (non-dense). Insertion and deletion are messy, so a whole block (or chain of blocks) is often reserved for each value.
- Example: 3,000 data blocks ordered on Dept_no, 200 distinct departments, entry 15 bytes, bfrᵢ = 68 → index blocks = ⌈200 / 68⌉ = **3**.

### 5.3 Secondary index
- Built on a field that is **not** the ordering field of the file (the file may be unordered, or ordered on some other field).
- The indexing field may be a **candidate key** (unique values) or a **non-key** (repeating values).
- Secondary index on a key: **one entry per record** → **dense**. Entries hold a record pointer or block pointer.
- Secondary index on a non-key: options – (1) dense, one entry per record (repeated values); (2) variable-length entries with a list of pointers; (3) most common: one entry per distinct value pointing to a **block of record pointers** (an extra level of indirection).
- Needs more space and more entries than a primary index, but gives a big improvement over linear search.

**Numerical 4 – secondary index on a key field** (same file, V = 9, P = 6).
- Index entries = number of records = **30,000** (dense).
- bfrᵢ = 68 → index blocks = ⌈30,000 / 68⌉ = **442 blocks**.
- Binary search: ⌈log₂ 442⌉ = **9** accesses (2⁸ = 256 < 442 ≤ 512 = 2⁹), +1 data block = **10 block accesses**.
- Without the index, a linear search on this non-ordering field costs **1,500** on average.

### 5.4 Summary table (Navathe)

| Index type | Built on | Entries | Dense or sparse | Block anchoring |
|---|---|---|---|---|
| Primary | Ordering **key** field | One per **block** | Sparse | Yes |
| Clustering | Ordering **non-key** field | One per **distinct value** | Sparse | Yes / No |
| Secondary (key) | Non-ordering **key** field | One per **record** | Dense | No |
| Secondary (non-key) | Non-ordering non-key field | One per record or per distinct value | Dense or sparse | No |

A file can have **one physical order**, so **at most one primary or clustering index** (not both), but any number of **secondary indexes**.

Korth's terminology differs: Korth calls any index whose search key defines the file's sequential order a **clustering index** and says it is "also called a primary index"; an index whose search key order differs from the file order is a **non-clustering** or **secondary index**. The DSSSB question used Navathe's wording.

### 5.5 Dense vs sparse
- **Dense index**: an index entry appears for **every search-key value** (Korth) / every record (Navathe) in the data file.
- **Sparse (non-dense) index**: entries for **only some** search-key values; possible only when the file is **sorted on the search key**.
- Sparse: less space, less maintenance on insert/delete; dense: faster to find a record (can answer "does it exist?" from the index alone).
- A good compromise (Korth): a sparse index with **one entry per block**.

Example: 10 records with keys 10, 20, …, 100, stored 2 per block in key order (5 blocks).
- Dense index: **10** entries (10, 20, 30, …, 100).
- Sparse index (one per block): **5** entries (10, 30, 50, 70, 90). To find 60: largest entry ≤ 60 is 50 → read that block → 60 found.
- A secondary index must be **dense**, because the file is not ordered on its field.

---

## 6. Multilevel index

Binary search on a single-level index of bᵢ blocks needs ⌈log₂ bᵢ⌉ accesses. A **multilevel index** treats the index itself as an ordered file and builds a **primary (sparse) index on it**, repeating until the top level fits in **one block**.

- **Fan-out** fo = bfrᵢ (entries per index block). Each level reduces the size by a factor of fo.
- Number of levels t = ⌈log_fo (r₁)⌉, where r₁ = entries at the first level.
- Search cost = **t + 1** block accesses (one per level + the data block). Compare log_fo with log₂: much smaller.

**Numerical 5** (dense secondary index from Numerical 4, fo = 68):
- Level 1: 30,000 entries in **442** blocks.
- Level 2: one entry per level-1 block → ⌈442 / 68⌉ = **7** blocks.
- Level 3: ⌈7 / 68⌉ = **1** block (top level).
- t = 3 levels → **4 block accesses** (versus 10 with binary search).

Static multilevel indexes suffer on insert/delete, which leads to **dynamic multilevel indexes**: B-trees and B+-trees.

---

## 7. B-tree and B+-tree

Both are **balanced** search trees: every leaf is at the **same level**, and each node (except the root) is at least **half full**. A node occupies one disk block. "Order p" = maximum number of **tree pointers (children)** in a node (Navathe).

### B-tree of order p
- Internal node: ⟨P₁, ⟨K₁, Pr₁⟩, P₂, ⟨K₂, Pr₂⟩, …, ⟨K_{q−1}, Pr_{q−1}⟩, P_q⟩ with q ≤ p: up to **p tree pointers** and **p − 1 keys**, each key with its own **data (record) pointer**.
- Keys in a node are in ascending order; subtree P_i holds keys between K_{i−1} and K_i.
- Each node except root and leaves has at least **⌈p/2⌉ tree pointers**; the root has at least **2** (unless it is the only node).
- A search key value appears **exactly once** in the tree; search may stop at an internal node.

### B+-tree of order p
- **Internal nodes** hold only keys and **tree pointers** (no data pointers): up to **p tree pointers, p − 1 keys**; at least ⌈p/2⌉ tree pointers (root at least 2).
- **Leaf nodes** hold ⟨key, data pointer⟩ pairs, up to **p_leaf** of them (at least ⌈p_leaf/2⌉), plus **one next-leaf pointer** linking the leaves in key order.
- **All data pointers are in the leaves**; every key appears in a leaf, and some keys are **repeated** in internal nodes as separators.
- Every search goes from root to a leaf, so cost = **height** (+1 for the data block).

### Computing the order (Numerical 6)
B = 512 bytes, key V = 9 bytes, tree (block) pointer P = 7 bytes, record pointer Pr = 7 bytes.
- **B+-tree internal node**: p·P + (p − 1)·V ≤ B → 7p + 9(p − 1) ≤ 512 → 16p ≤ 521 → **p = 32**.
- **B+-tree leaf**: p_leaf·(Pr + V) + P ≤ B → 16·p_leaf + 7 ≤ 512 → **p_leaf = 31**.
- **B-tree node**: p·P + (p − 1)·(V + Pr) ≤ B → 7p + 16(p − 1) ≤ 512 → 23p ≤ 528 → **p = 22**.
- Capacity with 3 levels, nodes completely full:
  - B+-tree: root 32 children → 32 × 32 = 1,024 leaves × 31 = **31,744** record pointers.
  - B-tree: 1 + 22 + 484 = 507 nodes × 21 keys = **10,647** record pointers.
- B+ internal nodes have no data pointers, so they fit **more keys (higher fan-out)** → **shorter tree** for the same data.

Korth's convention: a B+-tree node has up to **n pointers and n − 1 keys**; a leaf holds between ⌈(n−1)/2⌉ and n − 1 values; an internal node has between ⌈n/2⌉ and n children. For N keys the height is at most ⌈log_{⌈n/2⌉}(N)⌉.

### Insertion and split basics (B+-tree)
1. Search down to the correct leaf and insert the key in sorted order.
2. If the leaf **overflows**, split it into two leaves (roughly half each) and insert a **copy** of a separator key (Korth: the smallest key of the new right leaf) into the parent.
3. If an internal node overflows, split it and **move** (not copy) the middle key up to its parent.
4. If the root splits, a new root is created and the **height grows by one** — the tree grows at the **root**, so it stays balanced.

Example (leaf holds at most 3 keys): insert 10, 20, 30 → leaf [10 20 30]. Insert 40 → overflow → leaves [10 20] and [30 40]; 30 is copied up to a new root [30]. A search for 25 goes left of 30; a range query 15–35 finds 20 in the left leaf then follows the **leaf link** to 30.

Deletion: remove from the leaf; if it falls below half full, **borrow** from a sibling or **merge** with it (which can shrink the height).

### B-tree vs B+-tree

| Feature | B-tree | B+-tree |
|---|---|---|
| Data pointers | In **all** nodes | Only in **leaves** |
| Key repetition | Each key once | Keys repeated in internal nodes |
| Leaf linking | No | Leaves linked (sequence set) |
| Fan-out / height | Lower fan-out, taller | Higher fan-out, shorter |
| Equality search | May end early at an internal node | Always goes to a leaf |
| Range query / sequential scan | Needs tree traversal | Find start leaf, then follow links — **best** |
| Use in DBMS | Less common | Default index in most DBMSs (MySQL InnoDB, SQL Server, Oracle) |

---

## 8. Hashing

- A **bucket** is a unit of storage (usually a block) holding one or more records. A **hash function** h maps a search-key value to a bucket number, e.g. **h(K) = K mod M** for M buckets.
- A good hash function is **uniform** (equal number of key values per bucket) and **random** (independent of key patterns).
- **Collision**: two keys hash to the same address. Resolution: **open addressing** (probe next free slot, e.g. linear probing), **chaining** (overflow area linked from the address), **multiple hashing** (apply a second hash function).
- **Bucket overflow**: a bucket has no room. Causes: **insufficient buckets** or **skew** (many records with the same key value, or a non-uniform hash function). Handled by **overflow buckets** linked in a chain (Korth calls this form **closed hashing**; the version with a fixed set of buckets and no chains is **open hashing**).

### Static hashing
- The number of buckets M is **fixed** in advance. If the file grows, chains lengthen and performance falls; if it shrinks, space is wasted. Reorganising means choosing a new h and rehashing everything.

### Dynamic hashing
The number of buckets changes as the file grows or shrinks.

**Extendible hashing**
- Uses a **directory** (bucket address table) of **2^d** entries, where **d = global depth**; the first (or last) d bits of the hash value index the directory.
- Each bucket has a **local depth d′ ≤ d**; several directory entries may share one bucket.
- On overflow: if **d′ < d**, split only the bucket and update pointers; if **d′ = d**, **double the directory** (d increases by 1), then split.
- Lookup takes at most **2 block accesses** (directory + bucket) if the directory is on disk.

**Linear hashing**
- **No directory.** Buckets are split **in a fixed linear order** (0, 1, 2, …) using a **split pointer**, regardless of which bucket overflowed; overflow records go to chains meanwhile.
- Uses two hash functions h_i(K) = K mod 2^i·M and h_{i+1}(K) = K mod 2^{i+1}·M.
- File grows one bucket at a time; splits can be triggered by overflow or by a **load-factor** threshold.

Hashing vs ordered index: hashing is best for **equality** (`WHERE id = 5`); ordered (B+-tree) indexes are needed for **range** (`WHERE marks BETWEEN 40 AND 60`) and `ORDER BY`.

---

## 9. Bitmap index (brief)
- For an attribute with few distinct values (**low cardinality**: gender, grade, region), keep one **bit vector per value**; bit i is 1 if record i has that value.
- Example: gender over 6 rows → M: 101001, F: 010110.
- Conditions are answered by fast bitwise **AND / OR / NOT**; very compact. Used in data warehouses (Oracle `CREATE BITMAP INDEX`). Poor for frequently updated or high-cardinality columns.

---

## 10. When to index and what it costs

**Index a column when** it appears often in WHERE conditions, JOIN conditions, ORDER BY / GROUP BY, the table is large, and the condition is **selective** (returns few rows).

**Costs of an index**
- Extra **storage** for the index file.
- Every **INSERT, DELETE, and UPDATE** of the indexed column must also update the index → slower writes.
- Little benefit on small tables or low-selectivity columns (except bitmaps).

Most DBMSs automatically create an index for **PRIMARY KEY** and **UNIQUE** constraints.

---

## 11. SQL for indexes

Indexes are **not defined by the ISO SQL standard**; `CREATE INDEX` is a vendor extension, but the basic form is common to all major products.

```sql
CREATE INDEX idx_emp_name ON employee (name);
CREATE INDEX idx_emp_dept_sal ON employee (dept_no, salary);   -- composite index
CREATE UNIQUE INDEX idx_emp_email ON employee (email);         -- rejects duplicate values
```

| Action | MySQL | SQL Server | Oracle / PostgreSQL |
|---|---|---|---|
| Create | `CREATE INDEX i ON t (c);` | `CREATE [CLUSTERED \| NONCLUSTERED] INDEX i ON t (c);` | `CREATE INDEX i ON t (c);` |
| Unique | `CREATE UNIQUE INDEX i ON t (c);` | `CREATE UNIQUE INDEX i ON t (c);` | `CREATE UNIQUE INDEX i ON t (c);` |
| Drop | `DROP INDEX i ON t;` or `ALTER TABLE t DROP INDEX i;` | `DROP INDEX i ON t;` (old form `DROP INDEX t.i`) | `DROP INDEX i;` |
| Special | `USING BTREE` / `USING HASH` | one clustered index per table | Oracle `CREATE BITMAP INDEX` |

A `UNIQUE INDEX` enforces uniqueness like a UNIQUE constraint. In SQL Server a table can have only **one clustered index** (it decides the physical order) but many non-clustered ones.

---

## Exam traps
1. A primary index has one entry per **block**, not per record — it is **sparse**.
2. "Ordered file, fixed-length records, two fields: primary key and block pointer" = **primary** index, not clustering (clustering is on a **non-key** field) and not secondary (non-ordering field).
3. A secondary index is **dense** (one entry per record when built on a key).
4. A file can have only **one** primary or clustering index but **many** secondary indexes.
5. Korth uses "primary index" = "clustering index"; Navathe separates them. Answer by the wording of the question.
6. Sparse indexes are possible only on a file **sorted** on the search key.
7. Multilevel search cost = number of levels **+ 1** (do not forget the data block).
8. Use **floor** for blocking factors and **ceiling** for block counts and log₂ of block counts.
9. In a B+-tree, data pointers are **only in leaves**; in a B-tree they are in every node. B+ wins on **range queries**.
10. Hashing gives ~1 access for equality but is poor for range queries; a B+-tree handles both, at log-time cost for equality.

## One-liners for revision
1. Block = unit of transfer between disk and main memory.
2. Access time = seek time + rotational latency + transfer time.
3. bfr = ⌊B / R⌋.
4. b = ⌈r / bfr⌉.
5. Heap file: cheap insert, linear search (b/2 average).
6. Sorted file: binary search ⌈log₂ b⌉, costly insert.
7. Hash file: ~1 access for equality search.
8. B+-tree file organisation stores records in the leaves.
9. Index entry = ⟨search-key value, pointer⟩.
10. Search key need not be a key of the relation.
11. Primary index = ordered file of fixed-length records with two fields: primary key and block pointer.
12. Anchor record = first record in a data block.
13. Primary index entries = number of data blocks.
14. Clustering index = on a non-key ordering field; one entry per distinct value.
15. Secondary index = on a non-ordering field; dense.
16. Dense index = entry for every search-key value.
17. Sparse index = entries for some values only.
18. Primary and clustering indexes are sparse.
19. Multilevel index fan-out = index blocking factor.
20. Multilevel search = t + 1 block accesses.
21. B-tree and B+-tree are balanced: all leaves at the same level.
22. Order p = maximum tree pointers in a node; p − 1 keys.
23. Non-root nodes have at least ⌈p/2⌉ tree pointers.
24. B+-tree leaves are linked for sequential access.
25. B+-tree has higher fan-out than a B-tree of the same block size.
26. Tree grows in height only when the root splits.
27. Extendible hashing: directory of 2^d entries, d = global depth.
28. Linear hashing: no directory, buckets split in linear order.
29. Bitmap index suits low-cardinality columns.
30. Indexes speed reads but slow INSERT, UPDATE and DELETE.

## Quick self-check
1. **Q:** B = 2048 bytes, R = 120 bytes. Blocking factor? **A:** ⌊2048/120⌋ = 17.
2. **Q:** 50,000 records at bfr 17 occupy how many blocks? **A:** ⌈50,000/17⌉ = 2,942.
3. **Q:** Which index is "an ordered file of fixed-length records with two fields: primary key and a pointer to a disk block"? **A:** Primary index.
4. **Q:** How many entries does a primary index have for a 3,000-block file of 30,000 records? **A:** 3,000 (one per block).
5. **Q:** Index on a non-key field on which the file is physically ordered? **A:** Clustering index.
6. **Q:** Is a secondary index on a key field dense or sparse? **A:** Dense.
7. **Q:** Single-level index of 45 blocks: block accesses with binary search including the data block? **A:** ⌈log₂ 45⌉ + 1 = 7.
8. **Q:** A 3-level multilevel index: block accesses to fetch a record? **A:** 4.
9. **Q:** Why are B+-trees preferred for range queries? **A:** All keys are in linked leaves; find the first key, then scan the leaf chain.
10. **Q:** In extendible hashing a bucket with local depth equal to global depth overflows. What happens? **A:** The directory doubles (global depth +1) and the bucket splits.
