# Operating Systems: DSSSB TGT Computer Science Revision Notes

## 1. One-page summary

- Expect about 8-10 OS questions in Section B. Roughly half are direct facts (definitions, conditions, commands) and half are short numericals (scheduling, page replacement, paging addresses, Banker's).
- Numericals reward a neat Gantt chart or frame table. Draw it and do not do it in your head.
- Waiting time = turnaround time − burst time. Turnaround time = completion time − arrival time. Response time = first CPU time − arrival time.
- Every negative mark (−0.25) hurts. In a numerical, eliminate the options that match a wrong method (FCFS instead of SJF, TAT instead of WT).

## 2. Types of operating system

| Type | Key idea | Example / use |
|---|---|---|
| Batch | Similar jobs grouped, no interaction while running | Early mainframes, payroll runs |
| Multiprogramming | Several jobs in memory; CPU switches when one waits for I/O | Increases CPU utilisation |
| Time-sharing (multitasking) | Short time slice per user, so the system feels interactive | UNIX terminals |
| Real-time (hard / soft) | Deadlines. Hard: a missed deadline is failure. Soft: it only lowers quality | Airbag, pacemaker / video streaming |
| Distributed | Many computers appear as one system | Clusters, Google file system |
| Network OS | Separate computers share files and printers over a network | Windows Server |

- Kernel types: monolithic (all services in kernel space, fast) and microkernel (only IPC, scheduling and basic memory in the kernel; drivers and file system in user space).
- SPOOL = Simultaneous Peripheral Operations On-Line (printer queue).

## 3. Process, thread and process states

- A process is a program in execution. Its details are kept in the PCB (Process Control Block): PID, state, program counter, registers, scheduling and memory information, open files.
- Threads of one process share code, data, heap and open files. Each thread has its own stack, registers and program counter. That is why a thread is called a lightweight process.
- Five-state model: New → Ready → Running → (Waiting/Blocked or Terminated). Running → Ready on a timer interrupt (preemption). Waiting → Ready when the I/O completes. Waiting → Running directly is NOT possible.
- Schedulers: long-term (job admission, controls the degree of multiprogramming), short-term (CPU scheduler, the most frequent), medium-term (swapping).
- The dispatcher gives the CPU to the selected process. Context switch time is pure overhead.
- Zombie: a child that has finished but whose parent has not called wait(). Orphan: a child whose parent has ended.
- n fork() calls in sequence create 2ⁿ processes in total (2ⁿ − 1 children).

## 4. CPU scheduling algorithms

| Algorithm | Preemptive? | Selection rule | Strength | Weakness |
|---|---|---|---|---|
| FCFS | No | Arrival order | Simple, fair in order | Convoy effect, high average WT |
| SJF | No | Shortest next burst | Minimum average WT (proved optimal) | Burst must be predicted; starvation |
| SRTF | Yes | Shortest remaining time | Optimal among preemptive | Starvation, many switches |
| Priority | Either | Highest priority (often the smallest number) | Supports importance | Starvation, cured by aging |
| Round Robin | Yes | FCFS order with time quantum q | Good response time, time-sharing | Large q behaves like FCFS; tiny q means too many switches |
| HRRN | No | Highest (W + S)/S | Favours short jobs without starving long ones | Needs burst estimate |
| Multilevel feedback queue | Yes | Processes move between queues | Most flexible | Complex to tune |

Worked example (all arrive at 0, bursts P1 = 6, P2 = 3, P3 = 1, q = 2):
RR Gantt: P1 0–2, P2 2–4, P3 4–5, P1 5–7, P2 7–8, P1 8–10. Completion 10, 8, 5. WT = 4, 5, 4, so the average WT is 4.33. FCFS gives WT 0, 6, 9, an average of 5.

- SJF burst prediction: τ(n+1) = α·t(n) + (1 − α)·τ(n).
- RR CPU efficiency with quantum q and switch cost s = q / (q + s).
- Throughput = processes completed per unit time.

## 5. Synchronisation

- Race condition: the result depends on the order of access to shared data.
- Critical-section requirements: mutual exclusion, progress and bounded waiting.
- Semaphore: wait (P) decrements and blocks if the value is below 0; signal (V) increments. A counting semaphore starts at the number of resources; a binary semaphore (mutex) starts at 1. A negative value = the number of blocked processes.
- Producer–consumer: mutex = 1, empty = n, full = 0.
- Peterson's solution: flag[2] + turn (two processes). A spinlock is a busy-waiting lock.
- Priority inversion is solved by the priority-inheritance protocol.

## 6. Deadlock

- Four necessary (Coffman) conditions: mutual exclusion, hold and wait, no preemption, circular wait.
- Prevention breaks one condition. Requesting all resources at once breaks hold and wait. Numbered resources requested in increasing order break circular wait.
- Avoidance: Banker's algorithm (safe state, Need = Max − Allocation). Detection uses a wait-for graph. Recovery: abort processes or preempt resources.
- RAG: with single-instance resources, a cycle means deadlock. With multiple instances, a cycle is necessary but not sufficient.
- No-deadlock guarantee for n processes each needing at most k units: R ≥ n(k − 1) + 1.

## 7. Memory management, paging and segmentation

| Concept | Remember |
|---|---|
| Internal fragmentation | Unused space inside an allocated block (fixed partitions, paging) |
| External fragmentation | Free holes between blocks (variable partitions, segmentation). Cured by compaction |
| First / best / worst fit | First suitable hole / smallest suitable hole / largest hole |
| Relocation + limit registers | Physical = base + logical, if logical < limit; otherwise a trap |
| Paging | Logical address = page number + offset. Physical = frame × page size + offset |
| Page-table size | (2^logical bits / page size) × entry size |
| TLB | EAT = h(t + m) + (1 − h)(t + 2m) |
| Segmentation | (segment, offset); trap if offset ≥ limit; user's view of memory |
| Inverted page table | One entry per physical frame |
| Multilevel paging | Pages the page table itself so it need not be contiguous |

Quick checks: 32-bit address with a 4 KB page gives 2^20 entries. With 4-byte entries the table is 4 MB. 64 MB / 4 KB = 16384 frames.

## 8. Virtual memory and page replacement

- Demand paging loads a page only when it is referenced. A page fault occurs when the referenced page is not in memory.
- EAT with faults = (1 − p) × memory time + p × fault service time.
- Thrashing: too few frames, so the process pages constantly and CPU utilisation collapses. The working-set model (based on locality of reference) prevents it.
- The dirty bit avoids writing back pages that were not modified.

| Algorithm | Replaces | Belady's anomaly? | Note |
|---|---|---|---|
| FIFO | Oldest loaded page | Yes | Simplest |
| Optimal (OPT) | Page used farthest in future | No | Fewest faults; needs the future, so it is only a benchmark |
| LRU | Page unused for the longest time | No | Stack algorithm; needs counters or a stack |
| LFU / MFU | Least / most frequently used | Possible | Rarely asked |
| Second chance (clock) | FIFO, but skips pages with reference bit 1 | Possible | Approximates LRU |

String 5 0 1 2 0 3 0 4 2 3 0 3 1 2 with 3 frames gives FIFO 12, LRU 11 and OPT 8 faults. The string 1 2 3 4 1 2 5 1 2 3 4 5 under FIFO gives 9 faults with 3 frames and 10 with 4 frames (Belady's anomaly).

## 9. File systems

| Allocation | How | Plus | Minus |
|---|---|---|---|
| Contiguous | Consecutive blocks | Fast sequential and direct access | External fragmentation, file growth |
| Linked | Each block points to the next | No external fragmentation | Slow direct access; pointer overhead |
| FAT | Linked pointers kept in one table | Faster random access than plain linked | Table must be cached |
| Indexed (inode) | An index block holds the addresses | Direct access, no fragmentation | Index-block overhead |

- The inode stores type, permissions, owner, size, timestamps, link count and block pointers, but NOT the file name. The name is in the directory entry.
- 12 direct pointers + 1 single indirect pointer, with 4 KB blocks and 4-byte pointers: 48 KB + 1024 × 4 KB = 4144 KB.
- Access methods: sequential, direct and indexed sequential. Directory structures: single-level, two-level, tree and acyclic graph (allows sharing).

## 10. Linux commands and system calls

| Command | Purpose |
|---|---|
| pwd, cd, ls -l, mkdir, rmdir | Current directory, change directory, long list, make and remove a directory |
| cp, mv, rm, cat, touch | Copy, move or rename, delete, display, create an empty file |
| chmod 754 f | rwx r-x r-- (r = 4, w = 2, x = 1) |
| chown, umask | Change owner; default permission mask (022 gives files 644 and directories 755) |
| grep, find, wc -l, sort, head, tail | Search text, search files, count lines, sort, show the first or last lines |
| ps, top, kill -9 PID | List processes, live view, SIGKILL |
| ln / ln -s | Hard link (same inode) / soft (symbolic) link |
| a \| b, >, >>, < | Pipe, redirect output (overwrite), append, redirect input |

System calls are the interface between a user program and the kernel, entered through a trap into kernel mode.
- Process control: fork, exec, exit, wait.
- File: open, read, write, close.
- Device: ioctl.
- Information: getpid, time.
- Communication: pipe, shmget.

fork() returns 0 in the child, the child's PID in the parent and −1 on failure. After fork, the parent and child have separate copies of their variables. exec replaces the program and keeps the PID.

## 11. Frequently asked in DSSSB

- Scheduling numericals (FCFS, SJF, RR average WT/TAT) and which algorithm is optimal or causes the convoy effect.
- Four deadlock conditions; Banker's = avoidance; safe sequence.
- Page-replacement fault counts (FIFO, LRU, OPT) and Belady's anomaly.
- Paging terms: page vs frame, TLB, internal vs external fragmentation, thrashing.
- Semaphore definition, critical section, producer–consumer.
- Linux commands: chmod values, ls, grep, pwd, kill; process states; PCB contents.

## 12. Fifteen one-liners

1. SJF gives the minimum average waiting time when all processes arrive together.
2. RR with a very large quantum becomes FCFS.
3. Aging is the cure for starvation in priority scheduling.
4. The dispatcher performs the context switch and the jump to user mode.
5. The PCB stores the state, program counter, registers and memory and I/O information of a process.
6. Banker's algorithm is used for deadlock avoidance, not prevention.
7. Ordering resources prevents circular wait.
8. Paging removes external fragmentation but not internal fragmentation.
9. Segmentation suffers external fragmentation.
10. FIFO is the algorithm that shows Belady's anomaly.
11. Optimal page replacement gives the fewest faults but cannot be implemented.
12. Thrashing means high paging activity and low CPU utilisation.
13. The inode does not hold the file name.
14. chmod 644 gives rw-r--r--.
15. fork() returns 0 to the child.

## 13. Five traps

1. **Waiting time vs turnaround time.** Options usually contain both; read the question word again before marking.
2. **Arrival times.** In SJF and SRTF only processes that have arrived can be chosen. Subtract the arrival time when computing WT and TAT.
3. **Semaphore value.** wait() decrements even when it blocks, so a negative value counts the waiting processes. It is not an error.
4. **Cycle in a RAG.** It guarantees deadlock only when every resource has a single instance.
5. **Page-table size.** Multiply the number of entries by the entry size. The number of entries alone is not the size, and 2^20 entries × 4 B = 4 MB, not 1 MB.
