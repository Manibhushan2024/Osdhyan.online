# Processes, Threads & Inter-Process Communication

**In 30 seconds**
- **Process** = *a program in execution*. A program is a **passive** entity (file on disk); a process is an **active** entity (with a program counter and resources).
- **5 states**: **New** (being created) → **Ready** (waiting to be assigned to a processor) → **Running** (instructions being executed) → **Waiting/Blocked** (waiting for an event such as I/O) → **Terminated** (finished). ⭐ Asked in DSSSB
- The OS **releases all memory** of a process when it goes from **running → terminated** (exit). Ready or waiting processes still own their memory. ⭐ Asked in DSSSB
- **PCB** stores state, PC, registers, scheduling, memory, accounting and I/O info. **Context switch** = save old process state in its PCB, load new one; it is **pure overhead**. ⭐ Asked in DSSSB
- **Dispatcher** = the module that *gives control of the CPU to the process selected by the short-term scheduler*. Its delay = **dispatch latency**. ⭐ Asked in DSSSB
- **fork()** creates a child (returns **0 in child**, **child's PID in parent**, −1 on error). n successive forks → **2ⁿ processes**. **fork() and join()** together make a complete process subroutine. ⭐ Asked in DSSSB
- **IPC** models: **shared memory** (fast) and **message passing**. A **socket** = *an endpoint for communication* = **IP address + port**. ⭐ Asked in DSSSB
- **Thread** = basic unit of CPU utilisation (thread ID, PC, registers, stack); threads of a process share code, data and open files. Models: many-to-one, one-to-one (Linux, Windows), many-to-many.

---

## 1. Process vs program

| | **Program** | **Process** |
|---|---|---|
| Nature | **Passive** entity: a file of instructions on disk (executable) | **Active** entity: a program in execution |
| Lifetime | Exists until deleted | Created, runs, terminates |
| Resources | None | CPU time, memory, files, I/O devices |
| Relation | One program can create **many processes** (two users running the same browser) | Each process has its own PCB |

- A program becomes a process when its executable file is **loaded into memory**.

### Process in memory (low address → high address)
| Section | Holds |
|---|---|
| **Text** | The executable code |
| **Data** | **Global and static** variables |
| **Heap** | Memory **dynamically allocated** at run time (`malloc`, `new`); grows **upward** |
| **Stack** | **Temporary data**: function parameters, return addresses, **local variables**; grows **downward** |

- Also part of the process: the **program counter** and the contents of the **CPU registers** (current activity).

---

## 2. Process states ⭐ Asked in DSSSB

| State | Silberschatz definition |
|---|---|
| **New** | *The process is being created.* |
| **Running** | *Instructions are being executed.* |
| **Waiting (Blocked)** | *The process is waiting for some event to occur (such as an I/O completion or reception of a signal).* |
| **Ready** | *The process is waiting to be assigned to a processor.* |
| **Terminated** | *The process has finished execution.* |

- *Only one process can be running on any processor core at any instant*; many may be ready or waiting.

**PYQ 2024 (match the following):** I. New, II. Running, III. Ready with 1. waiting to be assigned to a processor, 2. instructions are being executed, 3. being created → **I-3, II-2, III-1**.

### Transitions
| From → To | Event (label in diagram) |
|---|---|
| New → Ready | **Admitted** (by the long-term scheduler) |
| Ready → Running | **Scheduler dispatch** |
| Running → Ready | **Interrupt** (e.g. time quantum expired, higher-priority process arrived) |
| Running → Waiting | **I/O or event wait** |
| Waiting → Ready | **I/O or event completion** |
| Running → Terminated | **Exit** — the OS now **frees the memory** and other resources ⭐ |

- **Impossible directly**: Waiting → Running (must go to Ready first), Ready → Waiting (a process must run to request I/O), New → Running, Terminated → anything.

**PYQ 2023:** The OS completely releases the memory allocated to a process after it transitions from **running to terminated**. (Sleeping→ready, ready→running and running→sleeping only change its scheduling state; the memory is still allocated.)

### Suspended states (7-state model)
- When memory is short, the **medium-term scheduler** swaps a process out to disk:
  - **Ready → Ready-Suspended** (swapped out while ready).
  - **Waiting → Blocked-Suspended** (swapped out while waiting).
  - **Blocked-Suspended → Ready-Suspended** when its event occurs.
  - **Ready-Suspended → Ready** when swapped back in (**resume / activate**).

---

## 3. Process Control Block (PCB) — "task control block"

Each process is represented in the OS by a PCB. Contents:
| Field | Holds |
|---|---|
| **Process state** | new, ready, running, waiting, … |
| **Program counter** | Address of the **next instruction** to execute |
| **CPU registers** | Accumulators, index registers, stack pointer, general-purpose registers, condition codes |
| **CPU-scheduling information** | Process **priority**, pointers to scheduling queues |
| **Memory-management information** | Base and limit registers, **page tables** or segment tables |
| **Accounting information** | CPU time used, time limits, account numbers, **process ID (PID)** |
| **I/O status information** | List of I/O devices allocated, **list of open files** |

- In Linux the PCB is the C structure **`task_struct`**.

---

## 4. Context switching ⭐ Asked in DSSSB

- *Switching the CPU to another process requires performing a **state save** of the current process and a **state restore** of a different process. This task is known as a **context switch**.*
- *When a context switch occurs, the kernel saves the context of the old process in its PCB and loads the saved context of the new process scheduled to run.*
- **What is saved**: program counter, CPU registers, process state, memory-management information (all in the PCB).
- *Context-switch time is **pure overhead**, because the system does no useful work while switching.* Typical speed: a few **microseconds**.
- Its speed depends on **hardware support** (e.g. processors with **multiple register sets** only change a pointer), memory speed and the number of registers.
- Switching between **threads** of the same process is **faster** than between processes (address space need not change).

**PYQ 2024:** I. The kernel saves the context of the old process in its PCB. II. Context-switch time is pure overhead. → **Both I and II** are correct.

---

## 5. Scheduling queues and schedulers

- **Job queue**: all processes in the system. **Ready queue**: processes in main memory, ready and waiting to execute (usually a **linked list of PCBs**). **Device (wait) queues**: processes waiting for a particular I/O device.

| | **Long-term scheduler** (job scheduler) | **Short-term scheduler** (CPU scheduler) | **Medium-term scheduler** |
|---|---|---|---|
| Job | Selects processes from the disk pool and **loads them into memory** (New → Ready) | Selects one **ready** process and allocates the CPU | **Swaps** processes out of memory and back in |
| Frequency | **Infrequent** (minutes) | **Very frequent** (at least once every 100 ms) — must be **fast** | Intermediate |
| Controls | **Degree of multiprogramming** | Which process runs next | **Reduces** the degree of multiprogramming |
| Notes | Should pick a good **mix of I/O-bound and CPU-bound** processes; may be absent in time-sharing systems (UNIX, Windows) | Works with the dispatcher | Used in time-sharing systems |

- **I/O-bound process**: spends more time doing I/O; many short CPU bursts. **CPU-bound process**: spends more time computing; few long CPU bursts.

### Dispatcher ⭐ Asked in DSSSB
- *The dispatcher is the module that gives control of the CPU to the process selected by the short-term scheduler.* Its functions:
  1. **Switching context** from one process to another.
  2. **Switching to user mode**.
  3. **Jumping to the proper location** in the user program to resume it.
- **Dispatch latency** = *the time it takes for the dispatcher to stop one process and start another running.* It should be as small as possible because the dispatcher runs on every switch.
- **Scheduler decides**; **dispatcher acts** (actually allocates the CPU).

**PYQ 2024:** Which part of the OS allocates the CPU to the next scheduled process? → **Dispatcher** (not scheduler, file manager or I/O handler).

---

## 6. Process creation

- Processes form a **tree**. Each has a unique integer **PID**. In Linux the root of the tree is **systemd** (older: **init**), PID **1**.
- **Resource sharing options**: parent and child share all, some, or no resources.
- **Execution options**: parent runs **concurrently** with children, or parent **waits** until some or all children terminate.
- **Address-space options**: child is a **duplicate** of the parent (same program and data), or child has a **new program** loaded into it.

### UNIX system calls
| Call | Effect |
|---|---|
| **`fork()`** | Creates a new process: a **copy of the parent's address space**. Returns **0 to the child**, the **child's PID (> 0) to the parent**, **−1** if it fails |
| **`exec()`** family (`execlp`, `execvp`, …) | **Replaces** the process's memory image with a new program; does **not** return on success; PID unchanged |
| **`wait()`** | Parent waits for a child to terminate; gets its exit status and PID |
| **`exit()`** | Terminates the process; status passed to parent |
| `getpid()` / `getppid()` | Own PID / parent's PID |

- Windows: **`CreateProcess()`** both creates the process and loads the program (like fork + exec), with ten parameters.
- Modern fork uses **copy-on-write**: pages are shared until one process writes.

```c
pid_t pid = fork();
if (pid < 0)        { /* error */ }
else if (pid == 0)  { execlp("/bin/ls", "ls", NULL); }  /* child */
else                { wait(NULL); printf("Child Complete"); } /* parent */
```

### fork() counting puzzles (verified by script)
**Rule:** each `fork()` executed by every existing process **doubles** them. **n forks in sequence → 2ⁿ processes, 2ⁿ − 1 children.**

**Example 1:** `fork(); fork(); fork(); printf("hello\n");`
| After | Processes |
|---|---|
| 1st fork | 2 |
| 2nd fork | 4 |
| 3rd fork | 8 |
- **8 processes, 7 child processes, "hello" printed 8 times.** (`for(i=0;i<4;i++) fork();` → 16 processes.)

**Example 2:** `for (i = 0; i < 3; i++) { fork(); printf("x\n"); }`
| Iteration | Processes after fork | Lines printed in this iteration |
|---|---|---|
| i = 0 | 2 | 2 |
| i = 1 | 4 | 4 |
| i = 2 | 8 | 8 |
- **8 processes; "x" printed 2 + 4 + 8 = 14 times.**

**Example 3:** `if (fork() && fork()) fork(); printf("A\n");`
1. First fork: parent gets PID (> 0, true); **child gets 0 → `&&` short-circuits**, child skips the rest. (2 processes)
2. Only the original parent evaluates the second fork: it gets true; the new child gets 0 → condition false. (3 processes)
3. Only the original parent (both true) executes the third fork. (4 processes)
- **4 processes; "A" printed 4 times.**

**Also verified:** `fork() || fork();` → **3** processes (child of the first fork evaluates the second). `fork() && fork() || fork();` → **5** processes. `if (fork() == 0) fork();` → **3** processes.

---

## 7. fork and join ⭐ Asked in DSSSB

- Early concurrency constructs (Conway; Dennis & Van Horn): **`fork L`** starts a new concurrent computation at label L; **`join`** recombines two (or count) concurrent computations into one — the computation that reaches the join last continues, the others terminate.
- *fork and join are used in conjunction to make a complete process subroutine*: fork splits the work, join waits and merges it back. The order is **fork first, then join**.
- Modern equivalents: `fork()` + `wait()` for processes; `pthread_create()` + `pthread_join()` for threads.

**PYQ 2023:** "____ and ____ are used in conjunction for making a complete process subroutine." → **fork(), join()**.

---

## 8. Process termination ⭐ Asked in DSSSB

- A process terminates when it executes its last statement and calls **`exit()`**. It may return a status value to its parent (via `wait()`).
- *All the resources of the process — including physical and virtual memory, open files, and I/O buffers — are deallocated by the operating system.*
- A parent may terminate a child (UNIX `kill()`, Windows `TerminateProcess()`) because the child **exceeded its resources**, its **task is no longer required**, or the **parent is exiting**.
- **Cascading termination**: some OSes do not allow a child to exist if its parent has terminated, so all descendants are terminated.

| Term | Meaning |
|---|---|
| **Zombie process** | Has **terminated**, but its parent has **not yet called `wait()`**; its entry remains in the process table. All processes are briefly zombies |
| **Orphan process** | Its **parent terminated** without calling `wait()`; in UNIX/Linux it is **adopted by init/systemd**, which calls `wait()` periodically |

---

## 9. Cooperating processes and IPC ⭐ Asked in DSSSB

- **Independent process**: cannot affect or be affected by others; shares no data. **Cooperating process**: can affect or be affected by others.
- Reasons for cooperation: **information sharing**, **computation speed-up**, **modularity**, **convenience**.
- **IPC (inter-process communication)** = mechanism that lets cooperating processes exchange data.

### Shared memory vs message passing
| | **Shared memory** | **Message passing** |
|---|---|---|
| How | A region of memory is shared; processes read/write it directly | Processes exchange messages with **send()** and **receive()** |
| Speed | **Faster** — system calls only to **establish** the region | Slower — **system call (kernel) for every message** |
| Best for | Large amounts of data, same machine | **Smaller amounts** of data; **distributed systems** |
| Synchronisation | Processes must synchronise themselves (producer–consumer, bounded/unbounded buffer) | Built into send/receive |
| Conflicts | Must be avoided by the programmer | None to avoid |

### Message-passing design issues
- **Direct** communication (name the process: `send(P, msg)`) vs **indirect** (through **mailboxes / ports**).
- **Synchronisation**: **blocking (synchronous)** send/receive vs **non-blocking (asynchronous)**. Blocking send + blocking receive = **rendezvous**.
- **Buffering** (queue of messages): **zero capacity** (sender blocks until receiver takes it — no buffering), **bounded capacity** (length n), **unbounded capacity** (sender never blocks).

### Pipes
| | **Ordinary (anonymous) pipe** | **Named pipe** |
|---|---|---|
| Direction | **Unidirectional** (producer writes to the write end, consumer reads from the read end) | **Bidirectional** possible (UNIX FIFO: half-duplex; Windows: full-duplex) |
| Relationship | Needs a **parent–child** relationship | **No parent–child** relationship needed; several processes |
| Lifetime | Ends when the processes end | **Persists** after processes finish |
| UNIX call | **`pipe(int fd[2])`**: **fd[0] = read end**, **fd[1] = write end** | **`mkfifo()`** — called **FIFO** |
| Shell use | The `\|` operator, e.g. `ls \| grep txt` | — |

### Sockets ⭐ Asked in DSSSB
- *A socket is defined as an **endpoint for communication**.* A pair of processes communicating over a network uses **a pair of sockets**, one for each process.
- *A socket is identified by an **IP address concatenated with a port number*** — e.g. **161.25.19.8:1625**.
- Servers listen on **well-known ports** (below **1024**): FTP 21, SSH 22, Telnet 23, SMTP 25, HTTP 80, HTTPS 443.
- **Connection-oriented (TCP)** sockets and **connectionless (UDP)** sockets. **127.0.0.1** = loopback (the same machine).
- **PYQ 2023:** Endpoint of IPC → **Socket** (a port is only a number; a pipe is a channel; a tunnel is not an IPC endpoint).

### Remote Procedure Call (RPC)
- *Abstracts the procedure-call mechanism for use between systems with network connections.* The client calls a **stub**, which **marshals** (packs) parameters and sends a message to the server's port; the server stub unmarshals and runs the procedure.
- **XDR (external data representation)** solves **big-endian vs little-endian** differences. A **matchmaker (rendezvous) daemon** gives the port of a service. Java's version is **RMI**.

### Signals (UNIX)
- A **signal** notifies a process that a particular event has occurred. Delivered synchronously (illegal memory access, divide by 0) or asynchronously (Ctrl+C).
- Common: **SIGINT (2)** Ctrl+C, **SIGKILL (9)** cannot be caught, **SIGSEGV (11)** segmentation fault, **SIGTERM (15)** default of `kill`, **SIGCHLD** child ended.

---

## 10. Threads

- **Thread** = *a basic unit of CPU utilisation*; it has a **thread ID, program counter, register set and stack**. It **shares** with other threads of the same process its **code section, data section and OS resources** (open files, signals).
- A traditional (**heavyweight**) process has a single thread of control.
- **Benefits**: **responsiveness**, **resource sharing**, **economy** (creating a thread and switching threads is cheaper than for processes — Solaris: creating a process ~30× slower), **scalability** (threads run in parallel on multicore).
- **Concurrency** = more than one task making progress (possible on one core by interleaving). **Parallelism** = more than one task running **simultaneously** (needs multiple cores).

### Process vs thread
| Feature | **Process** | **Thread** |
|---|---|---|
| Weight | Heavyweight | **Lightweight** |
| Address space | Its **own** | **Shares** the process's address space |
| Creation / context switch | Slower, costlier | **Faster, cheaper** |
| Communication | Needs IPC (via kernel) | Through **shared memory** directly |
| Private items | Code, data, heap, files, PCB | Only **thread ID, PC, registers, stack** |
| Failure | One crash does not directly affect others | One faulty thread can crash the whole process |
| Independence | Independent | Interdependent |

### User threads vs kernel threads
| | **User-level threads** | **Kernel-level threads** |
|---|---|---|
| Managed by | A **thread library** in user space, **without kernel support** | The **OS kernel** |
| Kernel aware? | **No** (kernel sees one process) | **Yes** |
| Speed | **Fast** to create and switch (no system call) | Slower (needs kernel mode) |
| Blocking call | Can **block the whole process** (many-to-one) | Blocks only that thread |
| Multiprocessor | Cannot run in parallel (many-to-one) | Can run in parallel |
| Examples | POSIX Pthreads (as a library), GNU Portable Threads | Windows, Linux, macOS kernel threads |

### Multithreading models
| Model | Mapping | Pros | Cons | Examples |
|---|---|---|---|---|
| **Many-to-one** | Many user threads → **one** kernel thread | Efficient (managed in user space) | **One blocking call blocks the entire process**; **no parallelism** on multicore | Solaris **Green threads**, GNU Portable Threads |
| **One-to-one** | Each user thread → **its own** kernel thread | **More concurrency**; another thread runs when one blocks; parallel on multicore | Creating a user thread **requires creating a kernel thread** (overhead; may limit the number of threads) | **Linux, Windows** |
| **Many-to-many** | Many user threads → a **smaller or equal** number of kernel threads | Best of both; create as many user threads as needed | Complex to implement | Older Solaris, Windows ThreadFiber |
| **Two-level** | Many-to-many **plus** a user thread can be **bound** to a kernel thread | Flexible | Complex | IRIX, HP-UX, Tru64 UNIX |

### Thread libraries
- **POSIX Pthreads** (UNIX/Linux/macOS): `pthread_create()`, **`pthread_join()`** (wait for a thread), `pthread_exit()`. Pthreads is a **specification**, not an implementation.
- **Windows threads**: `CreateThread()`, `WaitForSingleObject()`.
- **Java threads**: extend the `Thread` class or implement the **`Runnable`** interface; `start()` creates the thread and calls `run()`; `join()` waits.
- **Implicit threading**: **thread pools**, OpenMP, fork-join model, Grand Central Dispatch.
- Linux does not distinguish processes and threads: both are **tasks**, created with **`clone()`** (flags decide how much is shared).

---

## Exam traps
1. **Ready ≠ waiting.** Ready = waiting **for the CPU**; Waiting/Blocked = waiting **for an event (I/O)**. "Waiting to be assigned to a processor" is **Ready**.
2. **Memory is released on running → terminated**, not on ready → running or running → sleeping.
3. A process cannot go **waiting → running** directly; it must go to **ready** first.
4. **Scheduler selects; dispatcher allocates** the CPU. "Gives control of the CPU" = dispatcher.
5. **Context-switch time is pure overhead** — the statement is TRUE, and the old state is saved in **its own PCB** (not the new process's).
6. **fork() returns 0 to the child**, not to the parent. Parent gets the **child's PID**.
7. **n forks → 2ⁿ processes, 2ⁿ − 1 children.** Ask yourself whether the question asks for *processes* or *child processes*.
8. **fork() + printf inside a loop** prints 2 + 4 + 8…, not 2ⁿ times.
9. **exec() does not create a new process**; it replaces the current program (PID stays).
10. **Socket = endpoint**, identified by IP + port. A port alone is **not** the endpoint.
11. **Shared memory is faster** than message passing; message passing is better for **distributed** systems.
12. **Many-to-one**: one blocking system call blocks **all** threads; **Linux and Windows use one-to-one**.

## One-liners for revision
1. A process is a program in execution.
2. A program is passive; a process is active.
3. Process memory: text, data, heap, stack.
4. Local variables and return addresses are on the stack; malloc memory is on the heap.
5. New = being created.
6. Running = instructions are being executed.
7. Waiting = waiting for some event (I/O completion, signal).
8. Ready = waiting to be assigned to a processor.
9. Terminated = finished execution.
10. Memory is fully released after running → terminated.
11. Running → ready happens on an interrupt (quantum expiry).
12. Running → waiting happens on an I/O or event wait.
13. The PCB is also called the task control block.
14. PCB holds state, PC, registers, scheduling, memory, accounting and I/O status.
15. Linux PCB = task_struct.
16. Context switch saves the old state in its PCB and loads the new one.
17. Context-switch time is pure overhead.
18. Long-term scheduler controls the degree of multiprogramming.
19. Short-term (CPU) scheduler runs at least every 100 ms.
20. Medium-term scheduler does swapping.
21. The dispatcher gives control of the CPU to the process chosen by the short-term scheduler.
22. Dispatch latency = time to stop one process and start another.
23. fork() returns 0 to the child and the child's PID to the parent.
24. exec() replaces the process image with a new program.
25. wait() makes the parent wait for a child.
26. 3 forks in sequence → 8 processes, 7 children.
27. fork and join together make a complete process subroutine.
28. Zombie: terminated but parent has not called wait().
29. Orphan: parent ended; adopted by init/systemd.
30. Reasons for cooperation: information sharing, speed-up, modularity, convenience.
31. Two IPC models: shared memory and message passing.
32. Zero-capacity buffer = no buffering; sender must wait.
33. Ordinary pipes are unidirectional and need a parent–child relationship.
34. pipe(fd): fd[0] read end, fd[1] write end.
35. Named pipe in UNIX = FIFO (mkfifo).
36. A socket is an endpoint for communication = IP address + port.
37. Well-known ports are below 1024; HTTP is port 80.
38. RPC uses stubs and marshalling; XDR handles byte order.
39. A thread has its own ID, PC, registers and stack, and shares code, data and files.
40. Linux and Windows use the one-to-one threading model.

## Quick self-check
1. **Match: New, Running, Ready with "being created", "instructions being executed", "waiting to be assigned to a processor".**
   New–being created; Running–instructions being executed; Ready–waiting to be assigned to a processor.
2. **After which transition does the OS release all memory of a process?**
   Running → terminated.
3. **Which OS component gives the CPU to the process selected by the short-term scheduler?**
   The dispatcher.
4. **Are both true? (I) The kernel saves the old process's context in its PCB. (II) Context-switch time is pure overhead.**
   Yes, both I and II.
5. **How many processes exist after `fork(); fork(); fork();`?**
   8 (7 children).
6. **How many times is "x" printed by `for(i=0;i<3;i++){ fork(); printf("x\n"); }`?**
   14.
7. **Which two calls together make a complete process subroutine?**
   fork() and join().
8. **What is an endpoint of inter-process communication?**
   A socket.
9. **Which scheduler controls the degree of multiprogramming?**
   The long-term (job) scheduler.
10. **In which threading model does one blocking system call block the entire process?**
    Many-to-one.
