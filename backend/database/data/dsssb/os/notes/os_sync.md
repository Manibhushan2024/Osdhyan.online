# Process Synchronisation & Deadlocks

**In 30 seconds**
- A **race condition** occurs when several processes access and manipulate the same data concurrently and the outcome depends on the particular order in which the accesses take place.
- A solution to the **critical-section problem** must satisfy three requirements: **mutual exclusion, progress, bounded waiting**.
- ⭐ Asked in DSSSB: a **semaphore** S is an integer variable that, apart from initialisation, is accessed only through two standard atomic operations: **wait()** (P) and **signal()** (V).
- Semaphore numerical: final value = initial value − (number of P) + (number of V). Example: S = 10, 6 P and 4 V → **8**.
- ⭐ Asked in DSSSB: deadlock needs four conditions **simultaneously**: **mutual exclusion** (at least one resource held in a **non-sharable** mode), **hold and wait**, **no preemption**, **circular wait**.
- Resource-allocation graph: **no cycle ⇒ no deadlock**; a cycle ⇒ deadlock **only if every resource type has a single instance**.
- Handling deadlocks: **prevention** (deny a condition), **avoidance** (safe state, Banker's algorithm), **detection + recovery**, or **ignore** (ostrich; used by most OSes, including Linux and Windows).
- n processes each needing k instances never deadlock if **R ≥ n(k − 1) + 1**.

---

## 1. Background: why synchronisation?

**Cooperating processes** share data (through shared memory or shared files). Concurrent access to shared data may result in **data inconsistency**.

Example (producer–consumer with a shared `counter`): `counter++` is really three machine instructions:
```
register1 = counter        register2 = counter
register1 = register1 + 1  register2 = register2 - 1
counter = register1        counter = register2
```
If these interleave, `counter` can end up 4 or 6 when the correct value is 5.

**Race condition** (Silberschatz): a situation where several processes access and manipulate the same data concurrently and the outcome of the execution depends on the particular order in which the access takes place. To guard against it, only one process at a time may manipulate the shared variable, so the processes must be **synchronised**.

---

## 2. The critical-section problem

Each process has a segment of code, the **critical section (CS)**, in which it may change shared variables, update a table, write a file, and so on. No two processes may execute in their critical sections at the same time.

General structure:
```
do {
    entry section        // request permission to enter
        critical section
    exit section
        remainder section
} while (true);
```

### Three requirements of a solution
| Requirement | Meaning (Silberschatz wording, shortened) |
|---|---|
| **Mutual exclusion** | If process Pi is executing in its critical section, no other process can be executing in its critical section. |
| **Progress** | If no process is in its CS and some processes wish to enter, only processes not in their remainder sections can take part in deciding who enters next, and this selection cannot be postponed indefinitely. |
| **Bounded waiting** | There is a bound (limit) on the number of times other processes may enter their CS after a process has made a request to enter and before that request is granted. |

- Mutual exclusion = safety; progress = no deadlock-like stalling; bounded waiting = no starvation.
- Assumption: each process runs at non-zero speed; nothing is assumed about relative speeds.
- Kernels: **preemptive kernel** (a process may be preempted in kernel mode; must be designed carefully for races) vs **non-preemptive kernel** (free from races on kernel data structures, since only one process is active in the kernel at a time).

---

## 3. Peterson's solution (software, 2 processes)

Shared data: `int turn;` and `boolean flag[2];`. For process Pi (the other is Pj, j = 1 − i):
```
do {
    flag[i] = true;          // I want to enter
    turn = j;                // but you go first if you also want to
    while (flag[j] && turn == j)
        ;                    // busy wait
    /* critical section */
    flag[i] = false;
    /* remainder section */
} while (true);
```
- Satisfies **all three** requirements: mutual exclusion, progress and bounded waiting.
- Restricted to **two processes** that alternate between CS and remainder section.
- Not guaranteed to work on modern architectures, because processors and compilers may **reorder** independent loads and stores; it is studied as a good algorithmic description.
- It uses **busy waiting**.

---

## 4. Hardware support for synchronisation

On a single processor, disabling interrupts while modifying a shared variable would work, but this is not feasible on a multiprocessor (time-consuming; messages to all processors delay entry). Modern machines provide special **atomic** instructions (executed as one uninterruptible unit).

### test_and_set()
```
boolean test_and_set(boolean *target) {
    boolean rv = *target;
    *target = true;
    return rv;
}
do {
    while (test_and_set(&lock))
        ;                       /* do nothing */
    /* critical section */
    lock = false;
    /* remainder section */
} while (true);
```
`lock` is initialised to false.

### compare_and_swap() (CAS)
```
int compare_and_swap(int *value, int expected, int new_value) {
    int temp = *value;
    if (*value == expected)
        *value = new_value;
    return temp;
}
while (compare_and_swap(&lock, 0, 1) != 0)
    ;                           /* do nothing */
```
- Both simple versions give **mutual exclusion but not bounded waiting**. Silberschatz adds a `waiting[n]` array to test_and_set to also satisfy bounded waiting (a process leaving its CS scans the array cyclically, so any waiting process enters within n − 1 turns).
- **Atomic variables** (e.g. atomic integer increment) are built on CAS.

---

## 5. Mutex locks

The simplest software tool: a process must **acquire()** the lock before entering a CS and **release()** it on exit. Boolean `available` shows whether the lock is free.
```
acquire() { while (!available) ; /* busy wait */  available = false; }
release() { available = true; }
```
Calls to acquire() and release() must be atomic (usually built with CAS).

- Main disadvantage: **busy waiting** — a process trying to enter loops continuously in acquire(). Such a lock is called a **spinlock** because the process "spins" waiting.
- Spinlock advantage: **no context switch** is needed. Spinlocks are useful on **multiprocessor** systems when locks are held for **short** times.

---

## 6. Semaphores ⭐ Asked in DSSSB

**Definition (Silberschatz):** a semaphore S is an **integer variable** that, apart from initialisation, is accessed only through two standard **atomic** operations: **wait()** and **signal()**.

| Operation | Other names | Origin (Dijkstra, Dutch) | Effect |
|---|---|---|---|
| wait(S) | **P(S)**, down, sleep | *proberen* = "to test" | decrement; block (or spin) if no unit available |
| signal(S) | **V(S)**, up, wakeup | *verhogen* = "to increment" | increment; wake a waiting process |

Classic (busy-waiting) definition:
```
wait(S) {
    while (S <= 0)
        ;            // busy wait
    S--;
}
signal(S) {
    S++;
}
```
All modifications of S in wait() and signal() must be executed **indivisibly**: when one process modifies S, no other process can simultaneously modify it.

### Counting vs binary semaphore
| Counting semaphore | Binary semaphore |
|---|---|
| Value ranges over an **unrestricted domain** | Value only **0 or 1** |
| Controls access to a resource with a **finite number of instances**; initialised to that number | Behaves like a **mutex lock**; used for mutual exclusion |
| Process wanting a resource does wait(), releasing does signal(); count 0 ⇒ all in use | Initialised to 1 for mutual exclusion |

**Ordering use:** to force statement S1 (in P1) before S2 (in P2), share `synch = 0`:
P1: `S1; signal(synch);`  P2: `wait(synch); S2;`

### Busy waiting vs blocking implementation
To avoid busy waiting, Silberschatz's semaphore has a value and a list of waiting processes:
```
typedef struct { int value; struct process *list; } semaphore;

wait(semaphore *S) {
    S->value--;
    if (S->value < 0) { add this process to S->list; sleep(); }
}
signal(semaphore *S) {
    S->value++;
    if (S->value <= 0) { remove a process P from S->list; wakeup(P); }
}
```
- In this implementation the value **can become negative**: its **magnitude = number of processes waiting** on the semaphore.
- `sleep()` (block) moves the process to a waiting queue; `wakeup(P)` moves it to the ready queue.
- Busy waiting is not completely removed — it is moved from the application's critical sections into the short critical sections of wait()/signal() themselves.
- Using a FIFO list gives bounded waiting; a LIFO list may cause **starvation**.

### Semaphore numericals (verified by script)
**Rule:** final value = initial − (number of P/wait) + (number of V/signal), assuming no process is left in an inconsistent state.

| Initial S | Operations | Final S | Note |
|---|---|---|---|
| 10 | 6 P, 4 V | 10 − 6 + 4 = **8** | Classic exam question |
| 7 | 20 P, 15 V | 7 − 20 + 15 = **2** | |
| 0 | 2 V then 5 P | 0 + 2 − 5 = **−3** | blocking semaphore: 3 processes waiting |
| 2 | 5 P | **−3** | first 2 P succeed, 3 processes blocked |
| 2 | 5 P then 1 V | **−2** | the V wakes one blocked process; 2 still waiting |

Step-by-step for S = 2, five P operations (blocking definition):
1. P → S = 1 (enters)
2. P → S = 0 (enters)
3. P → S = −1 (blocks; 1 waiting)
4. P → S = −2 (blocks; 2 waiting)
5. P → S = −3 (blocks; 3 waiting)

With the **busy-waiting** definition, S never goes below 0: after the same five P operations S = 0, two processes are inside and three are spinning.

### Problems with semaphores
- **Deadlock:** P0: `wait(S); wait(Q);` P1: `wait(Q); wait(S);` — each waits for the other's signal() forever.
- **Starvation** (indefinite blocking) if the waiting list is LIFO.
- **Priority inversion:** a high-priority process waits for a lock held by a low-priority one, which is preempted by a medium-priority process. Solved by the **priority-inheritance protocol** (the lock holder temporarily inherits the higher priority). Famous case: Mars Pathfinder.
- Programming errors: `signal(mutex) … wait(mutex)` (swapped: violates mutual exclusion), `wait(mutex) … wait(mutex)` (deadlock), omitting wait or signal.

---

## 7. Monitors and condition variables

A **monitor** is a high-level synchronisation construct: an abstract data type that includes shared variables plus a set of programmer-defined operations, and **only one process at a time can be active within the monitor**. The programmer does not code mutual exclusion explicitly — the compiler/runtime provides it.

```
monitor monitor_name {
    /* shared variable declarations */
    function P1 (...) { ... }
    function P2 (...) { ... }
    initialization_code (...) { ... }
}
```

**Condition variables** add tailor-made synchronisation: `condition x, y;`
- `x.wait()` — the invoking process is suspended until another process invokes `x.signal()`.
- `x.signal()` — resumes **exactly one** suspended process. **If no process is suspended, it has no effect** (the state of x is as if it was never executed).

| Semaphore signal() | Monitor x.signal() |
|---|---|
| Always changes the semaphore's state (increments) | No effect if no process is waiting |
| Low-level, error-prone | High-level, safer |

When P signals and Q is waiting, two options: **signal-and-wait** (P waits until Q leaves) or **signal-and-continue** (Q waits until P leaves). Concurrent Pascal: P leaves immediately after signalling. Java (`synchronized`, `wait()`, `notify()`) and C# use monitor-like mechanisms. Monitors can be implemented using semaphores.

---

## 8. Classical problems of synchronisation

### 8.1 Bounded-buffer (producer–consumer)
Buffer of n slots. Semaphores: **mutex = 1**, **empty = n**, **full = 0**.
```
Producer:                         Consumer:
do {                              do {
   /* produce an item */             wait(full);
   wait(empty);                      wait(mutex);
   wait(mutex);                      /* remove item from buffer */
   /* add item to buffer */          signal(mutex);
   signal(mutex);                    signal(empty);
   signal(full);                     /* consume the item */
} while (true);                   } while (true);
```
- `empty` counts empty slots, `full` counts filled slots, `mutex` protects the buffer.
- State check (n = 5, after 3 produce and 1 consume, nobody waiting): empty = **3**, full = **2**, mutex = **1**.
- Trap: if the producer does `wait(mutex)` **before** `wait(empty)` and the buffer is full, it sleeps holding mutex and the consumer can never enter → **deadlock**. The order of the two **wait** operations matters; the order of the signals does not.

### 8.2 Readers–writers
Many readers may read together; a writer needs **exclusive** access.
- **First readers–writers problem:** no reader waits unless a writer already has permission → **writers may starve**.
- **Second readers–writers problem:** once a writer is ready, it writes as soon as possible → **readers may starve**.

First-problem solution: **rw_mutex = 1**, **mutex = 1**, **read_count = 0**.
```
Writer:                           Reader:
do {                              do {
   wait(rw_mutex);                   wait(mutex);
   /* writing */                     read_count++;
   signal(rw_mutex);                 if (read_count == 1) wait(rw_mutex);  // first reader locks out writers
} while (true);                      signal(mutex);
                                     /* reading */
                                     wait(mutex);
                                     read_count--;
                                     if (read_count == 0) signal(rw_mutex); // last reader lets writers in
                                     signal(mutex);
                                  } while (true);
```
Some systems provide **reader–writer locks** (acquire in read mode or write mode).

### 8.3 Dining philosophers
Five philosophers, five chopsticks; a philosopher needs both neighbouring chopsticks to eat. Represents allocating several resources among several processes in a deadlock-free and starvation-free way.
```
semaphore chopstick[5];   // all initialised to 1
do {
   wait(chopstick[i]);
   wait(chopstick[(i + 1) % 5]);
   /* eat */
   signal(chopstick[i]);
   signal(chopstick[(i + 1) % 5]);
   /* think */
} while (true);
```
- Guarantees no two neighbours eat together, but **can deadlock**: all five pick up their left chopstick at once.
- Remedies: allow **at most four** philosophers at the table; pick up chopsticks **only if both are available** (inside a critical section); **asymmetric** solution — odd philosopher picks left first, even picks right first.
- Silberschatz's **monitor solution** (states THINKING, HUNGRY, EATING; a philosopher eats only if both neighbours are not eating) is **deadlock-free, but starvation is still possible**.

---

## 9. Deadlock: system model

A set of processes is in a **deadlocked state** when every process in the set is waiting for an event that can be caused only by another process in the set (the events are mainly resource acquisition and release).

A process uses a resource in this sequence: **request → use → release**. Resources are partitioned into **types** (CPU cycles, files, I/O devices, locks), each with some number of identical **instances**.

---

## 10. Necessary conditions ⭐ Asked in DSSSB

A deadlock can arise **only if all four** conditions hold **simultaneously** (Coffman conditions):

| # | Condition | Meaning |
|---|---|---|
| 1 | **Mutual exclusion** ⭐ | **At least one resource must be held in a non-sharable mode**: only one process at a time can use it; a requester must be delayed until it is released. |
| 2 | **Hold and wait** | A process holds at least one resource and is waiting to acquire additional resources held by other processes. |
| 3 | **No preemption** | Resources cannot be preempted; a resource is released only **voluntarily** by the process holding it, after it has completed its task. |
| 4 | **Circular wait** | A set {P0, P1, …, Pn} exists such that P0 waits for P1, P1 for P2, …, Pn−1 for Pn, and Pn for P0. |

- DSSSB 2024 asked: "In which condition of deadlock prevention at least one resource must be non-sharable?" → **Mutual exclusion**.
- Circular wait implies hold and wait, so the four are not completely independent.
- All four are **necessary**; together they are **sufficient** only for single-instance resources.

---

## 11. Resource-allocation graph (RAG)

- Vertices: processes (circles) **P** and resource types (rectangles) **R**, with a dot for each instance.
- **Request edge** Pi → Rj: Pi has requested an instance of Rj and is waiting.
- **Assignment edge** Rj → Pi: an instance of Rj has been allocated to Pi.
- **Claim edge** Pi ⇢ Rj (dashed): Pi may request Rj in future (used in avoidance).

| Graph | Conclusion |
|---|---|
| No cycle | **No deadlock** |
| Cycle, **single instance** per resource type | **Deadlock** (cycle is necessary and sufficient) |
| Cycle, **multiple instances** | Deadlock **possible, not certain** (cycle is necessary but not sufficient) |

Example: P1 holds R2 and requests R1; P2 holds R1 and requests R2 (one instance each) → cycle P1 → R1 → P2 → R2 → P1 → deadlock.

---

## 12. Methods for handling deadlocks

1. **Prevention** or **avoidance** — ensure the system never enters a deadlocked state.
2. **Detection and recovery** — allow deadlock, detect it, recover.
3. **Ignore** the problem and pretend deadlocks never occur — the **ostrich approach**, used by most operating systems, including Linux and Windows; the application developer must handle deadlocks.

### 12.1 Deadlock prevention — deny one condition
| Condition | How to deny it | Drawback |
|---|---|---|
| Mutual exclusion | Make resources **sharable** (e.g. read-only files need no exclusive access) | Cannot be denied in general: some resources (mutex locks, printers) are intrinsically non-sharable |
| Hold and wait | (a) request and be allocated **all** resources before execution; or (b) request resources **only when holding none** (release all first) | **Low resource utilisation**; **starvation** possible |
| No preemption | If a process holding resources requests one that cannot be immediately allocated, **all resources it currently holds are preempted** (implicitly released); it restarts when it can regain old + new ones. Or preempt from a waiting process that holds the wanted resource | Works only for resources whose state can be saved and restored (CPU registers, memory), not for mutex locks or semaphores |
| Circular wait | Impose a **total ordering** of resource types, F(Ri); each process requests resources only in **increasing order** of enumeration (or must release all Rj with F(Rj) ≥ F(Ri) before requesting Ri) | Ordering must be followed by programmers; lock-order verifiers (e.g. *witness* in BSD) help |

Example ordering: F(tape drive) = 1, F(disk drive) = 5, F(printer) = 12 — a process holding the disk may request the printer but not the tape drive.

### 12.2 Deadlock avoidance — safe state
Avoidance needs **advance information**: each process declares the **maximum number** of resources of each type it may need.

- **Safe state:** the system can allocate resources to each process (up to its maximum) in some order and still avoid deadlock; that is, a **safe sequence** <P1, P2, …, Pn> exists in which each Pi's remaining need can be satisfied by currently available resources plus those held by all Pj with j < i.
- **Safe ⇒ no deadlock. Unsafe ⇒ possibility of deadlock** (an unsafe state is not necessarily deadlocked). Deadlocked states ⊂ unsafe states.
- Avoidance algorithms keep the system **always in a safe state**; a request may be made to wait even if resources are free — so utilisation is lower.

**Single-resource example (verified):** 12 tape drives; Max/Allocated: P0 10/5, P1 4/2, P2 9/2. Available = 12 − 9 = 3. Needs: 5, 2, 7. Safe sequence **<P1, P0, P2>** (the only one): P1 needs 2 ≤ 3 → available 5; P0 needs 5 ≤ 5 → 10; P2 needs 7 ≤ 10 → 12. If P2 is given one more drive (available 2), no safe sequence exists → **unsafe**; so that request must wait.

**Resource-allocation-graph algorithm** (only for **single instance** of each type): add claim edges; a request Pi → Rj is granted only if converting it to an assignment edge Rj → Pi does **not form a cycle** (cycle detection needs O(n²) operations).

### 12.3 Banker's algorithm (multiple instances)
Named because a bank never allocates its cash so that it can no longer satisfy all customers. n = processes, m = resource types.

| Data structure | Meaning |
|---|---|
| **Available[m]** | number of available instances of each type |
| **Max[n][m]** | maximum demand of each process |
| **Allocation[n][m]** | instances currently allocated to each process |
| **Need[n][m]** | remaining need: **Need = Max − Allocation** |

**Safety algorithm** (O(m × n²)):
1. Work = Available; Finish[i] = false for all i.
2. Find i with Finish[i] = false and Need_i ≤ Work. If none, go to 4.
3. Work = Work + Allocation_i; Finish[i] = true; go to 2.
4. If Finish[i] = true for all i, the state is **safe**.

**Resource-request algorithm** for request Request_i:
1. If Request_i ≤ Need_i go on; else **error** (exceeded maximum claim).
2. If Request_i ≤ Available go on; else Pi **must wait** (resources not available).
3. Pretend to allocate: Available −= Request_i; Allocation_i += Request_i; Need_i −= Request_i. Run the safety algorithm: if **safe**, grant; if **unsafe**, Pi waits and the old state is restored.

#### Fully worked example (Silberschatz; verified by script)
Resources A = 10, B = 5, C = 7 instances. Snapshot at T0:

| Process | Allocation (A B C) | Max (A B C) | **Need = Max − Alloc** |
|---|---|---|---|
| P0 | 0 1 0 | 7 5 3 | **7 4 3** |
| P1 | 2 0 0 | 3 2 2 | **1 2 2** |
| P2 | 3 0 2 | 9 0 2 | **6 0 0** |
| P3 | 2 1 1 | 2 2 2 | **0 1 1** |
| P4 | 0 0 2 | 4 3 3 | **4 3 1** |
| Total allocated | 7 2 5 | | |

Available = (10, 5, 7) − (7, 2, 5) = **(3, 3, 2)**.

Safety algorithm (scan P0 → P4 repeatedly):

| Step | Process chosen | Need ≤ Work? | Work after release |
|---|---|---|---|
| start | — | — | (3, 3, 2) |
| 1 | P1 | (1,2,2) ≤ (3,3,2) ✓ | (5, 3, 2) |
| 2 | P3 | (0,1,1) ≤ (5,3,2) ✓ | (7, 4, 3) |
| 3 | P4 | (4,3,1) ≤ (7,4,3) ✓ | (7, 4, 5) |
| 4 | P0 | (7,4,3) ≤ (7,4,5) ✓ | (7, 5, 5) |
| 5 | P2 | (6,0,0) ≤ (7,5,5) ✓ | (10, 5, 7) |

Safe sequence **<P1, P3, P4, P0, P2>** → state is **safe**. (Silberschatz prints <P1, P3, P4, P2, P0>; it is also valid. The script found **16** safe sequences in all, and every one starts with P1 or P3 — only their needs fit (3, 3, 2) at first.)

**Request check 1:** P1 requests (1, 0, 2).
- (1,0,2) ≤ Need1 (1,2,2) ✓; (1,0,2) ≤ Available (3,3,2) ✓.
- Pretend: Available = (2, 3, 0); Allocation1 = (3, 0, 2); Need1 = (0, 2, 0).
- Safety: P1 → (5,3,2), P3 → (7,4,3), P4 → (7,4,5), P0 → (7,5,5), P2 → (10,5,7). Safe sequence <P1, P3, P4, P0, P2> → **grant immediately**.

**Request check 2** (in that new state): P4 requests (3, 3, 0) → (3,3,0) > Available (2,3,0) → **must wait** (resources not available).

**Request check 3** (in that new state): P0 requests (0, 2, 0) → resources are available, but the resulting Available = (2, 1, 0) leaves no process whose Need fits → **unsafe → not granted**.

### 12.4 Deadlock detection
**Single instance of each type — wait-for graph:** remove the resource nodes from the RAG and collapse edges: Pi → Pj means Pi waits for a resource held by Pj. **Deadlock exists if and only if the wait-for graph has a cycle.** Detecting a cycle needs O(n²) operations.

**Several instances — detection algorithm** (like Banker's, but uses current **Request** instead of Need):
1. Work = Available; Finish[i] = false if Allocation_i ≠ 0, else true.
2. Find i with Finish[i] = false and Request_i ≤ Work; if none, go to 4.
3. Work += Allocation_i; Finish[i] = true; go to 2.
4. If some Finish[i] = false, the system is deadlocked and **Pi is deadlocked**.

Worked example (Silberschatz; verified): A = 7, B = 2, C = 6; Available = (0, 0, 0).

| Process | Allocation | Request |
|---|---|---|
| P0 | 0 1 0 | 0 0 0 |
| P1 | 2 0 0 | 2 0 2 |
| P2 | 3 0 3 | 0 0 0 |
| P3 | 2 1 1 | 1 0 0 |
| P4 | 0 0 2 | 0 0 2 |

Sequence <P0, P2, P3, P1, P4> lets every process finish → **no deadlock**. Now let P2 request one more C (Request2 = 0 0 1): P0 can finish and return (0,1,0), but then no request fits → **P1, P2, P3, P4 are deadlocked**.

**When to invoke detection:** depends on how often deadlock occurs and how many processes it affects. Invoking it on every request that cannot be granted is costly; invoking it at fixed intervals (e.g. once per hour, or when CPU utilisation drops below 40%) is cheaper but cannot tell which process "caused" it.

### 12.5 Recovery from deadlock
**Process termination** (all resources of the killed process are reclaimed):
- **Abort all deadlocked processes** — sure, but expensive (lost computation).
- **Abort one process at a time** until the cycle is eliminated — detection must be re-run after each abort.
- Choosing whom to abort: priority, how long it has computed and how much longer it needs, resources used and still needed, how many processes must be terminated, interactive or batch.

**Resource preemption:**
1. **Selecting a victim** — minimise cost (number of resources held, time consumed).
2. **Rollback** — return the victim to some safe state and restart it from there; simplest is **total rollback** (abort and restart).
3. **Starvation** — the same process may always be picked as victim; fix by including the **number of rollbacks** in the cost factor.

---

## 13. Deadlock vs livelock vs starvation

| | Deadlock | Livelock | Starvation (indefinite blocking) |
|---|---|---|---|
| State of processes | **Blocked**, waiting forever | **Running** (not blocked) but making no progress | Ready/waiting but **never gets** the resource |
| Cause | All four conditions hold; circular wait | Processes keep retrying an action that keeps failing, reacting to each other | Unfair scheduling or policy (priority, LIFO queue, victim selection) |
| Who is affected | Every process in the set | Every process involved | Usually one low-priority process; others progress |
| Example | P1 holds R1 wants R2; P2 holds R2 wants R1 | Two people in a corridor both stepping aside the same way again and again | Low-priority process in priority scheduling |
| Cure | Prevention, avoidance, detection + recovery | Random back-off times (as in Ethernet) | **Aging** (raise priority with waiting time) |

- Deadlock implies starvation of the processes in it; starvation does not imply deadlock.

---

## 14. Minimum resources for deadlock freedom ⭐ formula

n processes share R identical instances; each needs at most k.
- **Worst case:** every process holds k − 1 and waits for one more → deadlock if total R = n(k − 1).
- One extra instance lets some process finish: **deadlock-free if R ≥ n(k − 1) + 1**.
- Unequal needs k1 … kn: **R ≥ Σ(ki − 1) + 1**.

| Question | Working | Answer |
|---|---|---|
| 3 processes, each needs 2 — minimum R? | 3 × 1 + 1 | **4** |
| 5 processes, each needs 3 | 5 × 2 + 1 | **11** |
| 4 processes, each needs 3 | 4 × 2 + 1 | **9** |
| Needs 3, 4, 5 (three processes) | 2 + 3 + 4 + 1 | **10** |
| R = 6, each needs 2 — max processes without deadlock? | n × 1 + 1 ≤ 6 → n ≤ 5 | **5** |
| R = 10, each needs 3 — max processes? | 2n + 1 ≤ 10 → n ≤ 4.5 | **4** |
| R = 13, n = 4 — max k each may need? | 4(k − 1) + 1 ≤ 13 → k ≤ 4 | **4** |

(All rows checked by brute force over every possible allocation.)

Question form "maximum R for which deadlock is **possible**" → R = n(k − 1) (e.g. 3 processes needing 2 each: deadlock possible with 3 instances).

---

## Exam traps
1. Semaphore operations are **wait()/signal()** (P/V) — not lock(), acquire() or release() (those are library/lock names). DSSSB 2024 answer: **signal()**.
2. **P = wait = decrement**; **V = signal = increment**. Do not swap them.
3. In the blocking implementation a semaphore **can be negative**; |value| = number of waiting processes. In the busy-waiting definition it never goes below 0.
4. A binary semaphore is not "a semaphore that is 0 or 1 sometimes" — its value is **restricted** to 0 and 1; a counting semaphore is unrestricted.
5. Mutual exclusion condition = "at least one resource held in a **non-sharable** mode" — not "all resources".
6. The four conditions are **necessary**, not sufficient (except with single-instance resources).
7. A cycle in a RAG with **multiple instances** does **not** guarantee deadlock.
8. **Unsafe ≠ deadlocked.** Unsafe only means deadlock may occur.
9. **Need = Max − Allocation**, not Max − Available. Available = Total − ΣAllocation.
10. Banker's: if Request > Need → **error**; if Request > Available → **wait**; if unsafe → **wait**.
11. Monitor `x.signal()` with no waiter has **no effect**; semaphore signal() always increments.
12. Peterson's solution is for **two** processes only and uses busy waiting; simple test_and_set does **not** satisfy bounded waiting.

## One-liners for revision
1. Race condition: outcome depends on the order of concurrent access to shared data.
2. Critical section: code segment that accesses shared data.
3. CS requirements: mutual exclusion, progress, bounded waiting.
4. Bounded waiting prevents starvation.
5. Peterson's solution: flag[2] + turn; two processes.
6. test_and_set and compare_and_swap are atomic hardware instructions.
7. Mutex lock: acquire() and release().
8. Spinlock: lock with busy waiting; no context switch; good for short waits on multiprocessors.
9. ⭐ Semaphore: integer accessed only through atomic wait() and signal().
10. wait = P (proberen, test); signal = V (verhogen, increment).
11. Semaphore was introduced by Dijkstra.
12. Counting semaphore: unrestricted values; binary: 0 or 1.
13. Binary semaphore ≈ mutex lock.
14. Final semaphore value = initial − #P + #V.
15. Negative semaphore value magnitude = number of blocked processes.
16. Blocking semaphore uses a waiting list with sleep() and wakeup().
17. Priority inversion solved by priority inheritance.
18. Monitor: only one process active inside at a time.
19. Condition variable operations: x.wait() and x.signal().
20. Bounded buffer semaphores: mutex = 1, empty = n, full = 0.
21. First readers–writers problem: writers may starve.
22. Second readers–writers problem: readers may starve.
23. Dining philosophers: 5 chopsticks, all semaphores initialised to 1; naive solution can deadlock.
24. Deadlock: each process waits for an event only another waiting process can cause.
25. Resource use sequence: request → use → release.
26. ⭐ Four conditions: mutual exclusion, hold and wait, no preemption, circular wait.
27. ⭐ Mutual exclusion: at least one resource held in a non-sharable mode.
28. Request edge P → R; assignment edge R → P; claim edge is dashed.
29. No cycle ⇒ no deadlock.
30. Cycle + single instance ⇒ deadlock.
31. Deny circular wait by ordering resources and requesting in increasing order.
32. Deny hold and wait by requesting all resources at once (low utilisation, starvation).
33. Safe state ⇒ no deadlock; unsafe ⇒ deadlock possible.
34. Banker's algorithm: avoidance with multiple instances; Need = Max − Allocation.
35. Safety algorithm complexity: O(m × n²).
36. RAG algorithm (claim edges) works only for single-instance resources.
37. Wait-for graph: detection for single-instance resources; cycle ⇔ deadlock.
38. Recovery: terminate processes or preempt resources (victim, rollback, starvation).
39. Ostrich approach: ignore deadlocks (Linux, Windows).
40. Deadlock-free if R ≥ n(k − 1) + 1.

## Quick self-check
1. A counting semaphore is initialised to 10; 6 P and 4 V operations are done. Final value? → **8**.
2. A semaphore apart from initialisation is accessed only through which operations? → **wait() and signal()** (P and V).
3. Which deadlock condition says at least one resource must be non-sharable? → **Mutual exclusion**.
4. Which CS requirement guarantees a process will not wait forever while others keep entering? → **Bounded waiting**.
5. A RAG has a cycle and each resource type has 2 instances. Is there a deadlock? → **Not necessarily**.
6. In the Banker's example (Available 3 3 2), which processes can be picked first? → **P1 or P3** only.
7. Need of P0 with Max (7,5,3) and Allocation (0,1,0)? → **(7,4,3)**.
8. Is an unsafe state always a deadlock? → **No**; it may lead to one.
9. 4 processes each need 3 units of a resource. Minimum units for deadlock freedom? → **9**.
10. Semaphores in bounded buffer and their initial values? → **mutex = 1, empty = n, full = 0**.
11. What happens if `x.signal()` is called and no process is waiting on x? → **Nothing** (no effect).
12. Which technique cures starvation in priority scheduling? → **Aging**.
