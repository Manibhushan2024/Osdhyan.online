# Transactions & Concurrency Control

**In 30 seconds**
- A **transaction** is a unit of program execution that accesses and possibly updates data items; it must run completely or not at all.
- **ACID**: Atomicity (recovery system, log), Consistency (programmer + integrity constraints), Isolation (concurrency-control system), Durability (recovery system).
- Two operations **conflict** if they belong to different transactions, touch the same data item, and at least one is a **write**.
- ⭐ Asked in DSSSB: a schedule is **conflict serializable** if and only if its **precedence graph has no cycle**.
- Recoverability hierarchy: strict ⊂ cascadeless ⊂ recoverable. Serializability hierarchy: serial ⊂ conflict serializable ⊂ view serializable.
- **Two-phase locking (2PL)** guarantees conflict serializability but **not** freedom from deadlock; strict 2PL also gives cascadeless (strict) schedules.
- Deadlock prevention by timestamps: **wait-die** (old waits, young dies) and **wound-wait** (old wounds young, young waits).
- Recovery: **write-ahead logging**, undo/redo, checkpoints, deferred vs immediate update, shadow paging.

---

## 1. What is a transaction?

Korth: a **transaction** is a *unit of program execution that accesses and possibly updates various data items*. Navathe: a transaction is an executing program that forms a *logical unit of database processing*; it includes one or more access operations (read, insert, delete, update).

A transaction is usually written between `BEGIN TRANSACTION` and `END TRANSACTION` (or `COMMIT`). A **read-only transaction** only reads; a **read-write transaction** also updates.

### Basic operations
| Operation | Meaning |
|---|---|
| `read(X)` / `R(X)` | Copy data item X from the database (buffer) into a local variable of the transaction. |
| `write(X)` / `W(X)` | Copy the local value back to data item X in the database buffer. |
| `commit` | The transaction ended successfully; its changes become permanent. |
| `abort` / `rollback` | The transaction ended unsuccessfully; its changes are undone. |

Note: `write(X)` updates the buffer in main memory; the block reaches disk later. This gap is exactly why recovery is needed.

Classic example, transfer Rs 50 from A to B:
```
T1: read(A); A := A - 50; write(A); read(B); B := B + 50; write(B)
```

---

## 2. ACID properties

| Property | Meaning | Who/what ensures it |
|---|---|---|
| **Atomicity** | All operations of the transaction are reflected in the database, or none are. | **Recovery system** (transaction-management component) using the **log** (undo old values) or **shadow paging**. |
| **Consistency** | Executing a transaction *in isolation* takes the database from one consistent state to another (e.g. A + B unchanged by a transfer). | The **application programmer** who codes the transaction, helped by DBMS **integrity constraints** (keys, foreign keys, CHECK). |
| **Isolation** | Even when transactions run concurrently, each one appears to run alone; intermediate results are hidden from others. | **Concurrency-control system** (locking, timestamps, validation). |
| **Durability** | After a transaction commits, its changes persist even if the system crashes. | **Recovery system** (recovery manager): log on stable storage, redo. |

Memory hook: **A** and **D** both belong to *recovery*; **I** belongs to *concurrency control*; **C** belongs to the *programmer*.

---

## 3. Transaction states

Described in words (Korth, with Navathe's extra "terminated" state):

1. **Active** – the initial state; the transaction stays here while it is executing reads and writes.
2. **Partially committed** – after the **final statement** has executed. Output may still be in main-memory buffers, so a failure can still stop it.
3. **Committed** – after successful completion, once the commit record is safely in the log.
4. **Failed** – after discovering that normal execution can no longer proceed (from Active or from Partially committed).
5. **Aborted** – after the transaction has been **rolled back** and the database restored to its state before the transaction started. The system may then **restart** the transaction (if the failure was hardware/software, not its own logic) or **kill** it.
6. **Terminated** – the transaction leaves the system (after committed or aborted).

Transitions: Active → Partially committed → Committed → Terminated; Active → Failed; Partially committed → Failed; Failed → Aborted → Terminated.

A transaction that completed successfully is **committed**; one that did not is **aborted**; either way it has **terminated**. A committed transaction cannot be undone by abort — only by a separate **compensating transaction**.

---

## 4. Schedules

A **schedule** is a sequence of operations of a set of transactions that preserves the order of operations *within* each transaction.

- **Serial schedule**: transactions run one after another with no interleaving. For n transactions there are **n!** serial schedules. Every serial schedule is consistent (if each transaction is).
- **Non-serial (concurrent) schedule**: operations of different transactions are interleaved.
- **Complete schedule**: every transaction in it ends with a commit or an abort.
- **Serializable schedule**: a non-serial schedule that is equivalent to some serial schedule.

Why allow concurrency at all? Better **throughput** and **resource utilisation** (CPU works while another transaction waits for disk) and lower **average response time**.

---

## 5. Concurrency problems (anomalies)

Timelines read top to bottom.

**Lost update** – two transactions read the same item, both update it, and one update overwrites the other.
```
T1: R(A)=100              T2:
                              R(A)=100
T1: A=A-10; W(A)=90
                              A=A+20; W(A)=120   -> T1's update is lost (should be 110)
```

**Dirty read (temporary update)** – a transaction reads a value written by another transaction that later aborts.
```
T1: R(A); W(A)=90
                              T2: R(A)=90 (dirty)
T1: ABORT  (A goes back to 100)  -> T2 used a value that never officially existed
```

**Unrepeatable (non-repeatable) read** – a transaction reads the same item twice and gets different values because another transaction changed it in between.
```
T1: R(A)=100
                              T2: W(A)=150; COMMIT
T1: R(A)=150  -> same read, different answer
```

**Phantom** – a transaction re-runs a query with a condition and finds **new rows** inserted (or rows deleted) by another transaction.
```
T1: SELECT COUNT(*) FROM emp WHERE dept=10   -> 5
                              T2: INSERT INTO emp (... dept=10); COMMIT
T1: SELECT COUNT(*) FROM emp WHERE dept=10   -> 6 (phantom row)
```

**Incorrect summary** – an aggregate is computed while another transaction is updating some of the items being summed, so some values are counted before and others after the update.
```
T3: sum := 0; R(A); sum += A
                              T1: R(X); X=X-50; W(X); R(Y); Y=Y+50; W(Y)
T3: R(X); sum += X   (after -50) ... R(Y) (before +50)  -> total is short by 50
```

Navathe's list of four: lost update, temporary update (dirty read), incorrect summary, unrepeatable read. The phantom is added by Korth and the SQL standard.

---

## 6. Conflicting operations ⭐ Asked in DSSSB

Two operations in a schedule **conflict** if all three hold:
1. they belong to **different transactions**,
2. they access the **same data item**,
3. **at least one of them is a write**.

| Pair (different txns, same item) | Conflict? |
|---|---|
| R–R | No |
| R–W | Yes |
| W–R | Yes |
| W–W | Yes |

Non-conflicting adjacent operations can be **swapped** without changing the result. If a schedule S can be turned into a serial schedule by a series of such swaps, S is **conflict equivalent** to that serial schedule and is **conflict serializable**.

---

## 7. Precedence graph method ⭐ Asked in DSSSB

**Steps**
1. Make one node per transaction.
2. For every pair of conflicting operations where Ti's operation comes **before** Tj's, draw an edge **Ti → Tj**.
3. If the graph has **a cycle**, the schedule is **not** conflict serializable.
4. If it is **acyclic**, it is conflict serializable; a **topological order** of the graph gives an equivalent serial schedule.

Tip: for each data item separately, list the operations in order and compare every later operation with every earlier one.

### Worked schedule 1 – serializable
`S: R1(A); W1(A); R2(A); R1(B); W2(A); W1(B); R2(B); W2(B)`

- Item A: R1(A), W1(A) come before R2(A), W2(A). Pairs W1(A)–R2(A), R1(A)–W2(A), W1(A)–W2(A) give **T1 → T2**.
- Item B: R1(B), W1(B) come before R2(B), W2(B). Same pattern: **T1 → T2**.
- Edges: {T1 → T2}. No cycle. **Conflict serializable, equivalent to T1, T2.**

### Worked schedule 2 – the actual DSSSB question (2023)
`S1: R1(A); R1(B); R2(A); R2(B); W2(B); W1(A)`
- A: R2(A) comes before W1(A) → **T2 → T1**. (R1(A) and R2(A) are both reads – no conflict.)
- B: R1(B) comes before W2(B) → **T1 → T2**.
- Edges T1 → T2 and T2 → T1: **cycle**. S1 is **not** conflict serializable.

`S2: R1(A); R2(A); R2(B); W2(B); R1(B); W1(A)`
- A: R2(A) before W1(A) → **T2 → T1**.
- B: W2(B) before R1(B) → **T2 → T1**.
- Only T2 → T1: no cycle. S2 **is** conflict serializable, equivalent to **T2, T1**.

Official answer: *S1 is not conflict serializable but S2 is.*

### Worked schedule 3 – three transactions (serializable)
`S: R1(X); R2(Y); R3(Y); W2(Y); W1(X); W3(X); R2(X); W2(X)`
- Y: R3(Y) before W2(Y) → T3 → T2. (R2(Y)–W2(Y) is the same transaction; R2(Y)–R3(Y) is read-read.)
- X: R1(X)/W1(X) before W3(X) → T1 → T3; R1(X)/W1(X) before R2(X)/W2(X) → T1 → T2; W3(X) before R2(X), W2(X) → T3 → T2.
- Edges: T1 → T2, T1 → T3, T3 → T2. Acyclic. Topological order: **T1, T3, T2** (the only one).

### Worked schedule 4 – tricky: a cycle hidden across three transactions
`S: R1(A); W2(A); R2(B); W3(B); R3(C); W1(C)`
- A: R1(A) before W2(A) → T1 → T2.
- B: R2(B) before W3(B) → T2 → T3.
- C: R3(C) before W1(C) → T3 → T1.
- Every *pair* looks harmless (only one edge between any two transactions), but **T1 → T2 → T3 → T1** is a cycle. **Not** conflict serializable.

### Worked schedule 5 – tricky: only reads clash
`S: R1(A); R2(A); R1(B); R2(B); W1(C); W2(D)`
- A and B are only read; C and D are each touched by one transaction. **No edges at all.** Conflict serializable, and **both** T1, T2 and T2, T1 are valid equivalent serial orders.

---

## 8. View serializability

Two schedules S and S′ on the same transactions are **view equivalent** if, for every data item Q:
1. **Initial read**: if Ti reads the initial value of Q in S, it does so in S′.
2. **Reads-from**: if Ti reads a value of Q written by Tj in S, it does so in S′.
3. **Final write**: the transaction that performs the final write of Q in S does so in S′.

A schedule is **view serializable** if it is view equivalent to some serial schedule.

Example (blind writes): `S: R1(A); W2(A); W1(A); W3(A)`
- Precedence edges: T1 → T2 (R1–W2), T2 → T1 (W2–W1), plus T1 → T3, T2 → T3. Cycle → **not conflict serializable**.
- Compare with serial T1, T2, T3: T1 reads the initial A in both; nobody else reads; final write of A is by T3 in both. **View serializable.**
- W2(A) and W3(A) are **blind writes** (writes without a preceding read of A in that transaction).

Facts:
- **Every conflict-serializable schedule is view serializable, but not conversely.**
- A view-serializable schedule that is not conflict serializable **always contains a blind write**.
- Testing view serializability is **NP-complete**; testing conflict serializability is polynomial (cycle check). That is why practical systems use conflict serializability.

---

## 9. Recoverability

| Schedule type | Rule (Tj reads/writes something written by Ti) |
|---|---|
| **Recoverable** | If Tj **reads** a data item written by Ti, then Ti **commits before Tj commits**. |
| **Cascadeless (avoids cascading rollback)** | Tj reads an item written by Ti only **after Ti has committed**. |
| **Strict** | No transaction may **read or write** an item X until the last transaction that wrote X has **committed or aborted**. |

**Non-recoverable example**: `W1(A); R2(A); C2; ... A1` – T2 read T1's value and committed; when T1 aborts, T2 cannot be undone.

**Cascading rollback**: one transaction's failure forces a chain of rollbacks.
```
T1: R(A); W(A)
          T2: R(A); W(A)
                    T3: R(A)
T1: ABORT  -> T2 must roll back -> T3 must roll back
```
This is recoverable (no one committed yet) but wasteful. Cascadeless schedules prevent it.

**Containment hierarchy**
- Serial ⊂ **Strict** ⊂ **Cascadeless** ⊂ **Recoverable** ⊂ All schedules.
- Serial ⊂ **Conflict serializable** ⊂ **View serializable** ⊂ All schedules.
- The two hierarchies are independent: a schedule can be serializable but not recoverable, and vice versa.

---

## 10. Lock-based concurrency control

### Lock modes
- **Shared (S) lock** – lock-S(Q): the holder can **read** Q but not write it.
- **Exclusive (X) lock** – lock-X(Q): the holder can **read and write** Q.

Compatibility matrix (requested mode vs held mode):

| Requested \ Held | S | X |
|---|---|---|
| **S** | Yes | No |
| **X** | No | No |

Many transactions can hold S on the same item; only one can hold X, and then no one else holds anything. **Lock conversion**: *upgrade* S → X (only in growing phase), *downgrade* X → S (only in shrinking phase).

Locking alone (lock, use, unlock immediately) does **not** guarantee serializability; a protocol is needed.

### Two-Phase Locking (2PL)
Each transaction issues lock and unlock requests in two phases:
1. **Growing phase** – may obtain locks but may not release any.
2. **Shrinking phase** – may release locks but may not obtain any new lock.

The point where the last lock is obtained is the **lock point**. Transactions can be serialized in the order of their lock points.

| Variant | Rule | Effect |
|---|---|---|
| **Basic 2PL** | Growing then shrinking. | Conflict serializable; cascading rollback and deadlock possible. |
| **Strict 2PL** | Hold all **exclusive** locks until commit/abort. | Conflict serializable + **strict/cascadeless**; deadlock still possible. Most widely used. |
| **Rigorous 2PL** | Hold **all** locks (S and X) until commit/abort. | Transactions serialized in **commit order**; deadlock still possible. |
| **Conservative (static) 2PL** | Lock **all** needed items **before** the transaction starts (predeclare read and write sets). | **Deadlock-free**, but low concurrency and needs advance knowledge. |

Key exam fact: **2PL ensures conflict serializability but does not prevent deadlock** (except the conservative variant). 2PL is sufficient but not necessary: some conflict-serializable schedules cannot be produced by 2PL.

Deadlock under 2PL:
```
T1: lock-X(A)                T2: lock-X(B)
T1: lock-X(B)  -> waits for T2
                             T2: lock-X(A)  -> waits for T1   => deadlock
```

---

## 11. Timestamp-ordering protocol

Each transaction Ti gets a unique timestamp **TS(Ti)** when it starts (system clock or counter); older transaction = smaller timestamp. The serial order enforced is **timestamp order**. Each item Q keeps:
- **W-timestamp(Q)** – largest TS of any transaction that wrote Q successfully.
- **R-timestamp(Q)** – largest TS of any transaction that read Q successfully.

**Ti issues read(Q)**
- If TS(Ti) < W-timestamp(Q): Ti wants a value already overwritten → **reject, roll back Ti**.
- Else execute; R-timestamp(Q) = max(R-timestamp(Q), TS(Ti)).

**Ti issues write(Q)**
- If TS(Ti) < R-timestamp(Q): a younger transaction already read the old value → **reject, roll back Ti**.
- If TS(Ti) < W-timestamp(Q): Ti is writing an obsolete value → **reject, roll back Ti**.
- Else execute; W-timestamp(Q) = TS(Ti).

A rolled-back transaction restarts with a **new** timestamp. Properties: conflict serializable, **deadlock-free** (no waiting), but **starvation** is possible and schedules may not be recoverable unless extended.

**Thomas' write rule** (modifies only the second write test): if TS(Ti) < W-timestamp(Q), the write is obsolete, so **ignore it** instead of rolling back Ti. The R-timestamp test is unchanged. It allows some schedules that are **view serializable but not conflict serializable**.

---

## 12. Optimistic (validation-based) protocol (brief)

Assumes conflicts are rare. Each transaction passes through three phases:
1. **Read phase** – reads items and writes only to **local** copies.
2. **Validation phase** – checks whether applying its writes would violate serializability.
3. **Write phase** – if validation succeeds, local updates are written to the database; otherwise the transaction is rolled back.

Validation test for Tj against every older Ti (TS(Ti) < TS(Tj)): either Ti finished before Tj started, or Ti finished its write phase before Tj started validation **and** Ti's write set does not intersect Tj's read set. Good for read-mostly workloads; no locks, no deadlock.

## 13. Multiple granularity (brief)

Data is a tree: **database → area → file (table) → page → record**. Locking a node implicitly locks all its descendants. **Intention locks** on ancestors announce locks lower down:
- **IS** (intention-shared), **IX** (intention-exclusive), **SIX** (shared + intention-exclusive), plus S and X.
- Locks are acquired **root to leaf** and released **leaf to root**.
- Coarse granularity = low overhead, low concurrency; fine granularity = high concurrency, high overhead.

| Requested \ Held | IS | IX | S | SIX | X |
|---|---|---|---|---|---|
| IS | Yes | Yes | Yes | Yes | No |
| IX | Yes | Yes | No | No | No |
| S | Yes | No | Yes | No | No |
| SIX | Yes | No | No | No | No |
| X | No | No | No | No | No |

---

## 14. Deadlock

A **deadlock** is a state in which each transaction in a set is waiting for an item locked by another transaction in the same set. (Coffman conditions: mutual exclusion, hold and wait, no preemption, circular wait.)

### Detection: wait-for graph
Nodes = transactions; edge **Ti → Tj** if Ti is waiting for a lock held by Tj. **Deadlock exists iff the wait-for graph has a cycle.** The system runs the detection algorithm periodically.

Do not confuse: **precedence graph** (edges from conflicting operations, tests serializability) vs **wait-for graph** (edges from waiting, tests deadlock).

### Prevention using timestamps
Suppose Ti requests an item held by Tj.

| Scheme | If Ti is **older** than Tj | If Ti is **younger** than Tj | Type |
|---|---|---|---|
| **Wait-die** | Ti **waits** | Ti **dies** (rolled back) | Non-preemptive |
| **Wound-wait** | Ti **wounds** Tj (Tj rolled back) | Ti **waits** | Preemptive |

Memory hook: in both schemes the **older transaction never gets rolled back** for asking; only younger ones are restarted. A restarted transaction keeps its **original timestamp**, so it eventually becomes the oldest and starvation is avoided. Wound-wait usually causes fewer rollbacks.

Other prevention: conservative 2PL (lock everything at start), ordering all data items and locking in that order, **timeout-based** schemes (wait a fixed time, then roll back).

### Recovery from deadlock
1. **Select a victim** – the transaction whose rollback costs least (computed work, locks held, how many more needed, number of transactions involved).
2. **Rollback** – total rollback (abort and restart) or partial rollback (to the point that breaks the deadlock).
3. **Avoid starvation** – include the number of times a transaction has been chosen as victim in the cost.

---

## 15. SQL isolation levels

| Isolation level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| **READ UNCOMMITTED** | Possible | Possible | Possible |
| **READ COMMITTED** | Not possible | Possible | Possible |
| **REPEATABLE READ** | Not possible | Not possible | Possible |
| **SERIALIZABLE** | Not possible | Not possible | Not possible |

- Syntax: `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;`
- The SQL standard default is **SERIALIZABLE**. Product defaults differ:

| DBMS | Default level | Note |
|---|---|---|
| MySQL (InnoDB) | REPEATABLE READ | supports all four |
| SQL Server | READ COMMITTED | also SNAPSHOT |
| Oracle | READ COMMITTED | supports READ COMMITTED and SERIALIZABLE (plus READ ONLY) |
| PostgreSQL | READ COMMITTED | READ UNCOMMITTED behaves as READ COMMITTED |

The standard forbids **dirty writes** (overwriting another transaction's uncommitted write) at every level, even READ UNCOMMITTED. The four levels are defined by the three read anomalies in the table.

---

## 16. Recovery basics

### Failure types
Transaction failure (logical error, system error such as deadlock), **system crash** (main memory lost, disk intact), **disk failure** (media lost; needs backup/archive). **Stable storage** (replicated, never loses data) holds the log.

### Log-based recovery
The **log** is a sequence of records on stable storage:
`<Ti start>`, `<Ti, X, old value, new value>`, `<Ti commit>`, `<Ti abort>`.
- **undo(Ti)** restores the **old values** of all items Ti wrote, going **backwards** through the log.
- **redo(Ti)** sets all items Ti wrote to the **new values**, going **forwards**.
- After a crash: a transaction with `<Ti start>` but no `<Ti commit>`/`<Ti abort>` is **undone**; one with `<Ti start>` and `<Ti commit>` is **redone**.

| Technique | When DB is updated | Undo needed? | Redo needed? |
|---|---|---|---|
| **Deferred update** (deferred modification) | Only after the transaction partially commits | **No** | **Yes** (NO-UNDO/REDO) |
| **Immediate update** (immediate modification) | While the transaction is still active | **Yes** | **Yes** (UNDO/REDO) |

Deferred-update logs need only the **new value**; immediate-update logs need **both old and new** values.

### Write-ahead logging (WAL) rule
- Before a block of data in main memory is written to the database on disk, **all log records pertaining to that block must already be on stable storage**.
- A transaction is committed only after its `<Ti commit>` record (and all its earlier log records) are on stable storage.
In short: **log first, data later.**

### Checkpoints
Without checkpoints, recovery would scan the whole log and redo many already-safe transactions. At a checkpoint the system (1) writes all log records in memory to stable storage, (2) writes all modified buffer blocks to disk, (3) writes a `<checkpoint L>` record (L = active transactions). After a crash, only transactions that were active at, or started after, the **last checkpoint** need attention; transactions that committed before it need nothing.

### Shadow paging
- Keeps two page tables: the **current page table** (modified during the transaction) and the **shadow page table** (never modified, kept on disk).
- A written page goes to a **new** disk block; only the current table points to it.
- **Commit** = atomically switch the database pointer to the current page table. **Abort** = discard the current table.
- Needs **no undo and no redo** (for a single transaction, no log needed). Drawbacks: data **fragmentation**, need for **garbage collection**, high commit overhead, hard to extend to concurrent transactions.

---

## 17. COMMIT, ROLLBACK, SAVEPOINT (Transaction Control Language)

- `COMMIT` – makes all changes of the current transaction permanent and ends it.
- `ROLLBACK` – undoes all changes of the current transaction and ends it.
- `SAVEPOINT name` – marks a point inside a transaction.
- `ROLLBACK TO SAVEPOINT name` – undoes work done after that savepoint only; the transaction stays **active** and earlier work is kept.
- `RELEASE SAVEPOINT name` – removes the savepoint (MySQL, PostgreSQL; Oracle has no RELEASE).

```sql
START TRANSACTION;
UPDATE acct SET bal = bal - 50 WHERE id = 1;
SAVEPOINT s1;
UPDATE acct SET bal = bal + 50 WHERE id = 2;
ROLLBACK TO SAVEPOINT s1;   -- second update undone, first one kept
COMMIT;                     -- first update made permanent
```

| Action | MySQL | SQL Server | Oracle |
|---|---|---|---|
| Start | `START TRANSACTION` or `BEGIN` | `BEGIN TRANSACTION` (`BEGIN TRAN`) | implicit (first DML) |
| Savepoint | `SAVEPOINT s1` | `SAVE TRANSACTION s1` | `SAVEPOINT s1` |
| Partial rollback | `ROLLBACK TO [SAVEPOINT] s1` | `ROLLBACK TRANSACTION s1` | `ROLLBACK TO [SAVEPOINT] s1` |
| Autocommit | ON by default | ON by default | Off (SQL*Plus) |

In Oracle and MySQL a DDL statement (CREATE, ALTER, DROP) causes an **implicit commit**.

---

## Exam traps
1. R–R on the same item is **not** a conflict; never draw an edge for two reads.
2. Operations of the **same** transaction never create an edge, even on the same item.
3. Edge direction follows **time order**: the earlier operation's transaction points to the later one's (Ti → Tj means Ti must come first in the serial order).
4. A cycle can run through **three or more** transactions even when no two transactions have edges both ways (worked schedule 4).
5. Consistency is ensured by the **programmer** (with integrity constraints), not by the concurrency-control system; isolation is concurrency control.
6. View serializable does **not** imply conflict serializable; the converse holds. Blind writes are the tell-tale sign.
7. 2PL guarantees serializability, **not** deadlock freedom and **not** (in basic form) cascadelessness.
8. Wait-die: the *younger* requester **dies**; wound-wait: the *older* requester **wounds**. In both, the restarted transaction keeps its old timestamp. In basic timestamp ordering, a rolled-back transaction gets a **new** timestamp.
9. Deferred update needs **no undo**; immediate update needs **both** undo and redo.
10. REPEATABLE READ still allows **phantoms**; only SERIALIZABLE removes all three anomalies.

## One-liners for revision
1. Transaction = unit of program execution that accesses and possibly updates data items.
2. Atomicity = all or nothing; ensured by the recovery system using the log.
3. Consistency = correct state to correct state; ensured by the programmer.
4. Isolation = concurrent execution looks serial; ensured by concurrency control.
5. Durability = committed changes survive crashes; ensured by the recovery manager.
6. Partially committed = final statement executed, not yet committed.
7. Failed → Aborted → restart or kill.
8. n transactions have n! serial schedules.
9. Complete schedule = every transaction ends in commit or abort.
10. Conflict = different transactions + same item + at least one write.
11. Conflict serializable ⇔ precedence graph is acyclic.
12. Topological order of the precedence graph = equivalent serial schedule.
13. Lost update = W–W problem; dirty read = W–R problem; unrepeatable read = R–W problem.
14. Phantom = new rows appear when a query is re-run.
15. Every conflict-serializable schedule is view serializable.
16. View serializability test is NP-complete.
17. Recoverable: the writer commits before the reader commits.
18. Cascadeless: read only committed data.
19. Strict: no read or write of X until X's last writer commits or aborts.
20. Strict ⊂ cascadeless ⊂ recoverable.
21. S–S locks compatible; anything with X incompatible.
22. 2PL = growing phase then shrinking phase; lock point ends growing.
23. Strict 2PL holds X locks till commit; rigorous 2PL holds all locks till commit.
24. Conservative 2PL is deadlock-free.
25. Timestamp ordering is deadlock-free but can starve.
26. Thomas' write rule ignores obsolete writes.
27. Wait-for graph cycle = deadlock.
28. Wait-die non-preemptive; wound-wait preemptive.
29. WAL: log record reaches stable storage before the data block.
30. Shadow paging needs no undo and no redo.

## Quick self-check
1. **Q:** Is `R1(A); R2(A); W1(B); W2(B)` conflict serializable? **A:** Yes. Only W1(B)–W2(B) conflicts (T1 → T2); equivalent to T1, T2.
2. **Q:** Which ACID property is the responsibility of the concurrency-control system? **A:** Isolation.
3. **Q:** In `R1(A); W2(A); R2(B); W1(B)`, what are the edges? **A:** T1 → T2 (A) and T2 → T1 (B); cycle, not conflict serializable.
4. **Q:** Which state comes right after the final statement executes? **A:** Partially committed.
5. **Q:** T2 reads A written by T1 and commits before T1 commits. What property is violated? **A:** Recoverability (the schedule is non-recoverable).
6. **Q:** Does 2PL prevent deadlock? **A:** No (only conservative 2PL does); it guarantees conflict serializability.
7. **Q:** Under wait-die, older T5 requests a lock held by younger T9. What happens? **A:** T5 waits.
8. **Q:** Under wound-wait, the same request? **A:** T5 wounds T9; T9 is rolled back.
9. **Q:** Which isolation level allows phantoms but not non-repeatable reads? **A:** REPEATABLE READ.
10. **Q:** Which recovery technique is NO-UNDO/REDO? **A:** Deferred update.
