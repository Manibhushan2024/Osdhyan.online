# OS — Fast Revision Sheet

## How to use this sheet
- Read it once from top to bottom in the last 60–90 minutes. ⭐ marks facts asked in DSSSB TGT papers of 2023–24 (33 real questions). Fix those first.
- Linux (Section 8) is the most-asked area: about one OS question in three. Never skip it.
- Options copy Silberschatz–Galvin wording, so pick the option that uses the textbook term over one that only sounds close.

## Top 25 facts DSSSB asks again and again
| # | Fact | Asked |
|---|---|---|
| 1 | The **operating system** is the bridge (interface) between the user and the hardware. The kernel is only its core | ⭐ |
| 2 | Translating source code into machine code is **not** an OS service; a compiler does it | ⭐ |
| 3 | "Wait for time" → **process control**; "attach or detach remote devices" → **communications** | ⭐ |
| 4 | A monolithic kernel keeps everything in **one** address space; separate address spaces mean a **microkernel** | ⭐ |
| 5 | New = being created; Ready = waiting to be assigned to a processor; Running = instructions being executed | ⭐ |
| 6 | Memory is fully released only after **running → terminated** | ⭐ |
| 7 | The **dispatcher** gives the CPU to the process the short-term scheduler selected | ⭐ |
| 8 | A context switch saves the old state in **its own PCB**, and context-switch time is **pure overhead** | ⭐ |
| 9 | **fork() and join()** together make a complete process subroutine | ⭐ |
| 10 | A **socket** is an endpoint of communication (IP address + port) | ⭐ |
| 11 | Burst time = the CPU time a process **needs for** execution, not the time it takes to start; TAT = CT − AT | ⭐ |
| 12 | A good OS has **high throughput and low turnaround time** | ⭐ |
| 13 | A semaphore is an integer accessed only through atomic **wait() (P)** and **signal() (V)** | ⭐ |
| 14 | "At least one resource must be non-sharable" = **mutual exclusion** | ⭐ |
| 15 | Virtual memory = **illusion of an extremely large main memory** | ⭐ |
| 16 | Page fault = accessing a page **not currently in main memory** | ⭐ |
| 17 | Only **FIFO** shows Belady's anomaly. LRU and OPT are stack algorithms and never do | ⭐ |
| 18 | File seek = **repositioning within a file**, which needs no actual I/O | ⭐ |
| 19 | The volume control block holds the **number of blocks in the partition** | ⭐ |
| 20 | NTFS **does** support compression, and also EFS encryption, ACLs and journaling | ⭐ |
| 21 | The advantage of SSTF is that **average response time decreases** | ⭐ |
| 22 | `rm` deletes files, `rm -r` deletes directories and `rmdir` deletes only empty ones; `rm doc*` deletes names **beginning** with doc | ⭐ |
| 23 | `grep` prints the lines that match a pattern; `chmod` takes the **permission change and the file names** | ⭐ |
| 24 | Default text-file permission is **rw-r--r-- (644)**. The bash prompt is **$** (# for root, % for csh). "Alpha cell" is not a shell | ⭐ |
| 25 | **/etc** = configuration files; temporary files go in /tmp (not /usr); the default Linux file system is **ext4** | ⭐ |

---

## 2. OS basics: types, services, system calls, kernels

### OS types
| Type | Key idea | Examples |
|---|---|---|
| Batch | Similar jobs are batched; no user interaction while they run | Early IBM mainframes |
| Multiprogramming | Several jobs in memory; when one waits for I/O the CPU runs another → **CPU utilisation** | — |
| Time-sharing (multitasking) | Logical extension of multiprogramming; switching is fast enough for users to interact; response < 1 s | UNIX, MULTICS |
| Multiprocessing | 2+ CPUs share bus, clock and memory → throughput, economy of scale, reliability. SMP = peers; asymmetric = boss–worker | Modern Windows, Linux (SMP) |
| Hard real-time | A missed deadline counts as system failure | Airbag, pacemaker, missile control |
| Soft real-time | Critical tasks get priority; a missed deadline is tolerated | Multimedia, VoIP, games |
| Distributed | Separate networked computers look like **one** system; no shared memory or clock | Amoeba, LOCUS |
| Network OS | Each machine keeps its own OS; files shared over the network | Novell NetWare, Windows Server |
| Embedded / Mobile | One dedicated job / phones | Router / Android, iOS |

- Mode bit: **0 = kernel**, **1 = user**. Privileged instructions run only in kernel mode. The **timer** stops a program from holding the CPU for ever.

### OS services ⭐
- **For the user:** user interface (CLI/GUI/batch), program execution, I/O operations, file-system manipulation, communications (shared memory or message passing), error detection.
- **For the system:** resource allocation, accounting, protection and security.
- **NOT services:** translating source into machine code ⭐ (compiler), editing documents, spreadsheets, web browsing (applications), building hardware.
- A compiler is a *system program*, but compiling is still not an OS service.

### System-call categories (six) ⭐
| Category | Typical calls | UNIX examples |
|---|---|---|
| **Process control** | end, abort; load, execute; create/terminate process; **wait for time** ⭐; wait event / signal event; **allocate and free memory** | fork(), exec(), wait(), exit() |
| **File management** | create, delete; open, close; **read, write, reposition**; get/set attributes | open(), read(), write(), close(), lseek() |
| **Device management** | **request / release device**; read, write, reposition; **logically** attach or detach devices | ioctl() |
| **Information maintenance** | get/set time or date, system data, attributes | getpid(), alarm(), sleep() |
| **Communications** | create/delete connection; send/receive messages; transfer status; **attach or detach remote devices** ⭐ | pipe(), shmget(), mmap() |
| **Protection** | get/set file permissions; allow/deny user access | chmod(), umask(), chown() |

- Parameters pass via registers, a memory block or the stack. `printf()` calls `write()`.

### Kernel types ⭐
| Type | Idea | Pros / cons | Examples |
|---|---|---|---|
| **Monolithic** | Every service in **one** kernel address space | Fast; hard to extend; one bad driver can crash all | Linux, traditional UNIX, BSD |
| **Microkernel** | Minimal kernel; services in **user space**, separate address spaces, message passing | Small, easy to extend, reliable; slower; needs **more code** to design | Mach, QNX, MINIX 3, L4 |
| **Layered** | Layer 0 = hardware … layer N = user interface; each layer uses only lower layers | Easy to debug; layers hard to define; less efficient | THE (Dijkstra) |
| **Modular** | Core plus loadable modules (drivers, file systems) at boot or run time | More flexible than layered, faster than microkernel | Linux, Solaris, macOS |
| **Hybrid** | Mix of structures | Speed plus modularity | Windows NT, macOS/iOS XNU (Mach + BSD) |

- Kernel = core (kernel mode). Shell = command interpreter (user mode).
- UNIX: 1969, Bell Labs (Thompson, Ritchie). Linux: 1991, Linus Torvalds. Boot: BIOS → POST → MBR (512 B) → GRUB → kernel → init/systemd (PID 1).

---

## 3. Processes and threads

### States and transitions ⭐
| State | Meaning |
|---|---|
| New | Being created |
| Ready | Waiting to be assigned to a processor |
| Running | Instructions are being executed |
| Waiting (Blocked) | Waiting for an event (I/O completion, signal) |
| Terminated | Finished execution |

| Transition | Cause |
|---|---|
| New → Ready | Admitted (long-term scheduler) |
| Ready → Running | Scheduler dispatch |
| Running → Ready | Interrupt (quantum expired, higher priority arrived) |
| Running → Waiting | I/O or event wait |
| Waiting → Ready | I/O or event completion |
| Running → Terminated | Exit: **all memory freed** ⭐ |

- Impossible directly: Waiting → Running, Ready → Waiting, New → Running.

### PCB (task control block)
- Process state · program counter · CPU registers · scheduling info (priority, queue pointers) · memory info (base/limit, page tables) · accounting (CPU time, PID) · I/O status (devices, open files). Linux: `task_struct`.

### Schedulers vs dispatcher ⭐
| Component | Job | Frequency | Key fact |
|---|---|---|---|
| Long-term (job) | Disk pool → memory (New → Ready) | Infrequent | Controls **degree of multiprogramming** |
| Short-term (CPU) | Picks one ready process | Very frequent (≤ 100 ms) | Must be fast |
| Medium-term | Swaps out and in | Intermediate | Reduces multiprogramming |
| **Dispatcher** ⭐ | **Gives the CPU** to the chosen process: switch context, switch to user mode, jump to the right location | Every switch | Delay = **dispatch latency** |

- The scheduler **decides**; the dispatcher **acts**.

### Context switch ⭐
- Saves the old state in **its own PCB**, loads the new one; **pure overhead**. A thread switch is cheaper than a process switch.

### fork() and friends
| Item | Answer |
|---|---|
| fork() returns | **0** to child, **child's PID** to parent, **−1** on error |
| n forks in sequence | **2ⁿ processes**, **2ⁿ − 1 children** |
| `fork(); fork(); fork();` | 8 processes, 7 children |
| `for(i=0;i<3;i++){ fork(); printf("x"); }` | 8 processes; "x" printed 2 + 4 + 8 = **14** times |
| `fork() \|\| fork();` | 3 processes |
| `if (fork() && fork()) fork();` | 4 processes |
| exec() | Replaces the program image; no new process; PID unchanged |
| fork + join ⭐ | Together a complete process subroutine (fork first) |

- **Zombie:** has terminated but the parent has not called wait(); its entry stays in the process table.
- **Orphan:** the parent has ended; init/systemd adopts it. Windows `CreateProcess()` = fork + exec.

### IPC methods ⭐
| Method | Key facts |
|---|---|
| Shared memory | **Fastest**; system calls only to set up; processes synchronise themselves |
| Message passing | send()/receive(); kernel involved per message; good for small data and distributed systems; direct or via mailboxes |
| Ordinary pipe | **Unidirectional**; needs parent–child; `pipe(fd)`: fd[0] read, fd[1] write |
| Named pipe (FIFO) | No parent–child needed; persists; `mkfifo` |
| **Socket** ⭐ | **Endpoint for communication** = IP + port (161.25.19.8:1625); TCP or UDP |
| RPC | Stubs marshal parameters; XDR fixes byte order |
| Signals | SIGINT 2 (Ctrl+C), SIGKILL 9 (cannot be caught), SIGTERM 15 (default of kill) |

### Threads
- A thread is the basic unit of CPU utilisation. It owns a **thread ID, PC, registers and stack** and shares code, data and open files with its process.

| | User-level threads | Kernel-level threads |
|---|---|---|
| Managed by | Thread library; kernel unaware | OS kernel |
| Create/switch | Fast | Slower |
| Blocking call | Can block the whole process | Blocks only that thread |
| Parallel on multicore | No (many-to-one) | Yes |

| Model | Mapping | Note | Example |
|---|---|---|---|
| Many-to-one | Many user → 1 kernel | One blocking call blocks all; no parallelism | Solaris Green threads |
| One-to-one | Each user → own kernel | More concurrency; kernel thread per thread | **Linux, Windows** |
| Many-to-many | Many user → ≤ that many kernel | Best of both; complex | Older Solaris |

---

## 4. CPU scheduling

### Criteria and formulas ⭐
| Criterion | Meaning | Goal |
|---|---|---|
| CPU utilisation | Busy time / total time | Max |
| Throughput | Processes completed per unit time | Max |
| Turnaround time | Submission → completion | Min |
| Waiting time | Total time in the ready queue | Min |
| Response time | Submission → first response | Min |

| Term | Formula / meaning |
|---|---|
| AT | Time of arrival in the ready queue |
| BT ⭐ | CPU time **needed for** execution |
| CT | Finish time, read from the Gantt chart |
| TAT | **CT − AT** |
| WT | **TAT − BT** |
| RT | First time on CPU − AT (= WT for non-preemptive) |
| Throughput | n ÷ schedule length |
| CPU utilisation | ΣBT ÷ total time × 100 |

- The algorithm changes only the **waiting time** in the ready queue. Non-preemptive scheduling happens only when a process waits or terminates.

### Algorithm comparison
| Algorithm | Preemptive? | Starvation? | Optimal for | Notes |
|---|---|---|---|---|
| FCFS | No | No | Simplicity | FIFO queue; **convoy effect**; bad for time-sharing |
| SJF | No | Yes | **Minimum average WT** | Next burst predicted: τₙ₊₁ = α tₙ + (1 − α) τₙ |
| SRTF | Yes | Yes | Lowest average WT with arrivals | = preemptive SJF |
| Priority | Either | Yes | Urgent work | Cure = **aging**; SJF is a special case |
| Round Robin | Yes | No | **Time-sharing**, response | q = 10–100 ms; huge q → FCFS; tiny q → switch overhead; max wait (n − 1)q |
| HRRN | No | No | Short jobs without starving long | Ratio = (W + S) ÷ S |
| MLQ | Between queues | Yes | Low overhead | Process **fixed** to a queue (foreground RR, background FCFS) |
| MLFQ | Yes | No (aging) | Most general | Processes **move** between queues; most complex |

- Real-time: **Rate-Monotonic** = shorter period → higher static priority; **EDF** = earliest deadline first.

### 6-step method for any Gantt numerical
1. Tabulate AT, BT (and priority). Note whether the algorithm is preemptive and the tie rule (ties → FCFS).
2. At each decision point, choose only from processes that **have already arrived**.
3. Non-preemptive: run to completion. SRTF/priority: re-check at **every arrival**. RR: re-check at quantum end, with new arrivals joining **before** the preempted process.
4. If nothing has arrived, mark the CPU **idle** until the next AT.
5. Draw the Gantt chart and read off each CT.
6. TAT = CT − AT, WT = TAT − BT, RT = first start − AT; average = sum ÷ n.

### Worked example (SRTF)
| P | AT | BT | CT | TAT | WT |
|---|---|---|---|---|---|
| P1 | 0 | 8 | 17 | 17 | 9 |
| P2 | 1 | 4 | 5 | 4 | 0 |
| P3 | 2 | 9 | 26 | 24 | 15 |
| P4 | 3 | 5 | 10 | 7 | 2 |

- Gantt: P1 0–1 · P2 1–5 (preempts P1: 4 < 7) · P4 5–10 · P1 10–17 · P3 17–26. Average TAT = 52/4 = **13**; average WT = 26/4 = **6.5**.
- Same data, average WT: FCFS **8.75**, SJF **7.75**, SRTF **6.5**, RR (q = 4) **11.75**.

---

## 5. Synchronisation and deadlock

### Critical section
- **Race condition:** the result depends on the order in which processes access shared data.

| Requirement | Meaning |
|---|---|
| Mutual exclusion | Only one process at a time in its critical section |
| Progress | If the CS is free, only processes wanting to enter decide, and the choice cannot be postponed indefinitely |
| Bounded waiting | There is a limit on how many times others may enter after a process requests entry (no starvation) |

### Tools in one line each
| Tool | One-liner |
|---|---|
| Peterson | Software solution for **2 processes** with `flag[2]` + `turn`; meets all three requirements; busy waits |
| TSL (test_and_set) | Atomic: returns the old value and sets it true; the simple form lacks bounded waiting |
| compare_and_swap | Atomic: writes the new value only if the current value equals the expected one |
| Mutex lock | acquire()/release(); the busy-waiting version is a **spinlock** (no context switch; good for short waits on multiprocessors) |
| **Semaphore** ⭐ | Integer accessed only through atomic **wait() and signal()** (Dijkstra) |
| Counting / binary | Unrestricted value / only 0 or 1 (acts like a mutex) |
| Monitor | Abstract data type in which only one process is active at a time; `x.wait()`, `x.signal()` (no effect if nobody waits) |

### wait / signal
```
wait(S)   { while (S <= 0) ; S--; }   // P (proberen = test), decrement
signal(S) { S++; }                    // V (verhogen = increment)
```
- Blocking version: S can go negative, and |S| = number of waiting processes.
- Final value = initial − #P + #V. Example: S = 10, 6 P, 4 V → **8**.

### Classical problems
| Problem | Semaphores | Key point |
|---|---|---|
| Bounded buffer (producer–consumer) | mutex = 1, empty = n, full = 0 | Producer must do wait(empty) before wait(mutex), or it can deadlock |
| Readers–writers | rw_mutex = 1, mutex = 1, read_count = 0 | First problem: writers may starve; second: readers may starve |
| Dining philosophers | chopstick[5] all = 1 | Naive version deadlocks. Fixes: at most 4 at the table; take both or none; odd/even asymmetric |

### Deadlock: 4 conditions, all at once ⭐
| Condition | Meaning | Prevention (deny it) |
|---|---|---|
| **Mutual exclusion** ⭐ | At least one resource is **non-sharable** | Make resources sharable (read-only files); usually impossible |
| Hold and wait | Holds one resource while waiting for more | Request everything at start, or only when holding none (low utilisation, starvation) |
| No preemption | Resources are released only voluntarily | If a request fails, preempt everything the process holds (works for CPU registers and memory only) |
| Circular wait | P0 → P1 → … → Pn → P0 | Number the resource types and request in **increasing order** |

- Handling: prevention · avoidance (Banker's) · detection + recovery · ignore (ostrich: Linux, Windows).
- RAG: no cycle → no deadlock. Cycle + single instances → deadlock. Cycle + multiple instances → only possible.
- Safe ⇒ no deadlock; unsafe ⇒ deadlock **possible**, not certain.

### Banker's 5-step method
1. **Need = Max − Allocation** for every process and resource type.
2. Available = Total − ΣAllocation. Set Work = Available.
3. Find an unfinished process with Need ≤ Work. If none exists, go to step 5.
4. Work = Work + its Allocation; mark it finished and add it to the safe sequence; return to step 3.
5. All finished → **safe** (the sequence is the answer); otherwise **unsafe**.

- Request check: Request > Need → error. Request > Available → wait. Otherwise pretend to allocate and run the safety test; if unsafe → wait.
- Silberschatz example: Available (3, 3, 2) gives safe sequence <P1, P3, P4, P0, P2>.

### Minimum resources
- n processes, each needing k: deadlock-free if **R ≥ n(k − 1) + 1**. 3 × 2 → 4; 4 × 3 → 9; 5 × 3 → 11. For unequal needs: Σ(kᵢ − 1) + 1. Deadlock is still possible at R = n(k − 1).

### Deadlock vs starvation vs livelock
| | Deadlock | Starvation | Livelock |
|---|---|---|---|
| State | Blocked for ever | Never gets the resource; others progress | Running, but no progress |
| Cause | All 4 conditions | Unfair policy (priority, LIFO) | Processes keep reacting to each other |
| Cure | Prevent / avoid / detect | **Aging** | Random back-off |

---

## 6. Memory management

### Basics
- The CPU generates the **logical** address; the memory unit sees the **physical** address. The **MMU** maps one to the other at run time (relocation 14000 + logical 346 = 14346).
- Dynamic loading needs **no** OS support; dynamic linking (DLLs, stub) **does**.

### Fits
| Fit | Rule | Note |
|---|---|---|
| First fit | First hole big enough | Fastest |
| Best fit | Smallest hole big enough | Leaves the smallest leftover |
| Worst fit | Largest hole | Leaves the largest leftover; worst performer |
| Next fit | First fit, starting where the last search ended | — |

- Holes 100, 500, 200, 300, 600 KB; requests 212, 417, 112, 426 KB → only **best fit** places all four.

### Fragmentation
| Type | Where | Cure |
|---|---|---|
| Internal | Waste **inside** a block: fixed partitions, paging (last page) | Smaller blocks |
| External | Free memory **scattered**: variable partitions, segmentation, contiguous files | Compaction (needs execution-time binding), paging |

### Paging formulas
| Quantity | Formula | Example |
|---|---|---|
| Offset bits | log₂(page size) | 4 KB → 12 |
| Number of pages | **2^(logical bits − offset bits)** | 32-bit, 4 KB → 2²⁰ |
| Frames | Physical memory ÷ frame size | 256 MB ÷ 4 KB = 65,536 |
| Page-table size | Pages × entry size | 2²⁰ × 4 B = **4 MB** |
| Physical address | Frame × page size + offset | 7 × 1024 + 13 = 7181 |
| EAT with TLB | **h(t + m) + (1 − h)(t + 2m)** | h 0.8, m 100 ns, t ≈ 0 → **120 ns** |
| EAT with page faults | **(1 − p) × ma + p × fault-service time** | 200 ns, 8 ms, p = 0.001 → 8,199.8 ns ≈ 8.2 µs |

- Two-level page table, 32-bit, 4 KB: 10 + 10 + 12. Inverted table = one entry per **frame**. TLB = associative memory caching page-table entries.

### Segmentation
- Address <segment, offset>; the segment table holds **base + limit**. If offset < limit, physical = base + offset; otherwise trap. Matches the user's view; causes **external** fragmentation. Example: <2, 53> with base 4300, limit 400 → 4353.

### Virtual memory and page faults ⭐
- **Virtual memory** runs processes not completely in memory, giving the **illusion of an extremely large main memory** ⭐. It is built on demand paging, whose lazy swapper (pager) loads a page only when needed.
- **Page fault** ⭐ = reference to a page not in memory (invalid bit) → trap to the OS. Fetching the page is the response, not the fault.
- Servicing: check validity → free frame → disk read → update tables → restart the instruction.

### Page replacement
| Algorithm | Victim | Belady? | Note |
|---|---|---|---|
| FIFO | Oldest page | **Yes** | Simple queue |
| OPT | Page not needed for the longest time **in the future** | No | Fewest faults; used only for comparison |
| LRU | Page not used for the longest time **in the past** | No | Counters or a stack |
| Clock (second chance) | Reference bit 0; if 1, clear it and move on | Can | Becomes FIFO if all bits are 1 |
| LFU / MFU | Smallest / largest use count | MFU can | — |

- String 7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1, 3 frames: FIFO **15**, LRU **12**, OPT **9**.
- **Belady** ⭐: string 1 2 3 4 1 2 5 1 2 3 4 5 under FIFO gives **9 faults with 3 frames but 10 with 4**. LRU goes 10 → 8 and OPT 7 → 6, so neither shows the anomaly.
- Count the first loads as faults unless the question says otherwise.

### Thrashing and working set
- **Thrashing** = a process spends more time paging than executing. Cause: too high a degree of multiprogramming with global replacement makes CPU utilisation collapse.
- **Working set** = pages used in the last Δ references. If D = ΣWSS > available frames, suspend a process. **Page-fault frequency** gives a process frames above an upper bound and takes them away below a lower bound. Local replacement limits the damage.

---

## 7. Storage: files, disks, RAID

### File operations ⭐
| Operation | What happens |
|---|---|
| Create | Find space; add a directory entry |
| Write / Read | Use the current-file-position pointer |
| **Reposition (seek)** ⭐ | Only sets the pointer: **no actual I/O** |
| Delete | Free the space and erase the directory entry |
| Truncate | Erase the contents but **keep the attributes** |

- Access methods: sequential (tape model), direct (disk model), indexed.

### Directory structures
| Structure | Key fact |
|---|---|
| Single-level | One directory for all users; naming and grouping problems |
| Two-level | MFD + one UFD per user; same names allowed for different users |
| Tree | Most common; absolute and relative paths |
| Acyclic graph | Sharing through links; deletion needs a reference count |
| General graph | Cycles allowed; needs garbage collection |

### Boot vs volume control block ⭐
| Structure | Contents | UFS name | NTFS |
|---|---|---|---|
| Boot control block | Info to **boot an OS** from that volume | Boot block | Partition boot sector |
| **Volume control block** ⭐ | **No. of blocks in the partition**, block size, free-block count and pointers, free-FCB count | **Superblock** | In the MFT |
| Directory structure | File names + FCB numbers | — | In the MFT |
| FCB | Per file: **unique identifier**, permissions, dates, size, block pointers | **Inode** | In the MFT |

### Allocation methods
| Method | Pros | Cons |
|---|---|---|
| Contiguous | Fast sequential **and** direct access | External fragmentation; hard to grow |
| Linked | No external fragmentation | Sequential access only; pointer in every block |
| FAT | Chain held in a table, so random access is faster | Table must be cached |
| Indexed | Direct access, no external fragmentation | Index-block overhead |

### Inode maximum file size
- An inode has **12 direct + 1 single + 1 double + 1 triple indirect** pointers.
- P = block size ÷ address size. **Max size = (12 + P + P² + P³) × block size.**
- 4 KB blocks with 4 B addresses: P = 1024 → 48 KB + 4 MB + 4 GB + 4 TB ≈ **4 TB**. With 1 KB blocks: P = 256 → ≈ **16 GB**.

### File systems compared
| FS | Key facts |
|---|---|
| FAT32 | Max file **4 GB − 1 byte**; no journaling, no permissions; USB drives |
| exFAT | Microsoft 2006, for flash/SD cards; files > 4 GB; no journaling |
| **NTFS** ⭐ | MFT, journaling, ACLs, **compression**, EFS encryption, quotas, 4 KB clusters, huge volumes |
| **ext4** ⭐ | **Default Linux FS**: journaling, extents, files up to 16 TB (ext2 had no journal; ext3 added one) |

### Disk time
- **Access time = seek + rotational latency + transfer.** Average latency = half a rotation. 7200 RPM → 8.33 ms per rotation → 4.17 ms latency.

### Disk scheduling (queue 98, 183, 37, 122, 14, 124, 65, 67; head 53; cylinders 0–199)
| Algorithm | Rule | Head movement | Note |
|---|---|---|---|
| FCFS | Arrival order | 640 | Fair, no starvation |
| **SSTF** ⭐ | Nearest request first | 236 | **Official advantage: average response time decreases.** Drawbacks: starvation, high variance |
| SCAN (toward 0) | Elevator; goes to the disk end and reverses | 236 | No starvation |
| C-SCAN (toward 199) | Serves one way; jumps back to 0 without serving | 382 (183 without the jump) | Most uniform wait |
| LOOK (toward 0) | Turns at the last request | 208 | — |
| C-LOOK (toward 199) | Jumps from the last request to the lowest | 322 (153 without the jump) | — |

### RAID
| Level | Technique | Min disks | Usable | Survives |
|---|---|---|---|---|
| 0 | Striping, no redundancy | 2 | N | 0 failures |
| 1 | Mirroring | 2 | N/2 | 1 per mirror |
| 4 | Striping + dedicated parity disk | 3 | N − 1 | 1 |
| 5 | Striping + distributed parity | 3 | N − 1 | 1 |
| 6 | Distributed dual parity | 4 | N − 2 | 2 |
| 10 | Stripe of mirrors | 4 | N/2 | 1 per pair |

---

## 8. LINUX MASTER TABLES (most asked)

### Directory hierarchy ⭐
| Directory | Holds |
|---|---|
| `/` | Root of the whole tree (not `/root`) |
| `/bin` | Essential command binaries (ls, cp, rm) |
| `/sbin` | System admin binaries (fdisk, mkfs, reboot) |
| `/boot` | Kernel image, initrd, GRUB |
| `/dev` | Device files (sda, tty, null) |
| `/etc` ⭐ | **Configuration files**: passwd, shadow, group, fstab, hosts, sudoers |
| `/home` | Normal users' home directories |
| `/root` | Root user's home |
| `/lib` | Shared libraries, kernel modules |
| `/media`, `/mnt` | Removable media / temporary mounts |
| `/opt` | Add-on third-party software |
| `/proc`, `/sys` | Virtual file systems of process/kernel/device info |
| `/tmp` | **Temporary files** (sticky bit) |
| `/usr` | User programs, libraries, documentation (**not** temporary files ⭐) |
| `/var` | Variable data: logs, mail, spool |

- `/etc/passwd` = accounts; `/etc/shadow` = password hashes. Default FS = **ext4** ⭐.
- `~` home, `.` current, `..` parent. Names are case-sensitive; a leading `.` hides a file.

### Shells and prompts ⭐
| Shell | Program | Note | Prompt |
|---|---|---|---|
| Bourne | `sh` | Original, Stephen Bourne | `$` |
| Bourne-Again | `bash` | **Default on Linux** (GNU) | **`$` user, `#` root** ⭐ |
| C shell | `csh` | Bill Joy; C-like syntax | `%` |
| TENEX C | `tcsh` | Enhanced csh | `%` |
| Korn | `ksh` | David Korn | `$` |
| Z shell | `zsh` | Default on macOS | `%` |
| fish, dash | `fish`, `dash` | Friendly / small, fast `/bin/sh` | `>` / `$` |

- Fake shells used as distractors: "Alpha cell" ⭐, "lsh", "gsh". The prompt string lives in `PS1`; `echo $SHELL` shows the login shell.

### Commands by category
**Files and directories**
| Command | Meaning |
|---|---|
| `pwd` / `cd` | Print current directory / change directory (`cd ..` goes to the parent) |
| `ls -l` / `ls -a` | Long listing / include hidden files |
| `touch` | Create an empty file or update its timestamps |
| `cp` (`-r`) | Copy (directories with -r) |
| `mv` | Move **or rename** |
| `rm` ⭐ | Delete files; `-r` directories; `-i` ask first; `-f` force |
| `rmdir` ⭐ | Delete **empty** directories only |
| `mkdir -p` | Make a directory, creating parents too |
| `ln` / `ln -s` | Hard link (same inode) / symbolic link (path) |

**Viewing**
| Command | Meaning |
|---|---|
| `cat` | Concatenate and display |
| `more` / `less` | Page forward / page both ways |
| `head` / `tail` | First / last **10** lines (`tail -f` follows a growing file) |
| `wc` | Lines, words, bytes (`-l`, `-w`, `-c`) |

**Searching**
| Command | Meaning |
|---|---|
| `grep` ⭐ | Print lines matching a pattern; `-i` ignore case, `-v` invert, `-c` count, `-n` line numbers, `-r` recursive |
| `find` | Find **files** in the tree by name, size, type, time |
| `locate` / `which` / `whereis` | Database name search / path of a command / binary + man page |

**Permissions**
| Command | Meaning |
|---|---|
| `chmod` ⭐ | Change permissions |
| `chown` / `chgrp` | Change owner / group |
| `umask` ⭐ | Set the default permission mask |

**Processes**
| Command | Meaning |
|---|---|
| `ps` / `top` | Snapshot of processes / live view |
| `kill PID` / `kill -9 PID` | SIGTERM (15) / SIGKILL (9, cannot be caught) |
| `cmd &`, `jobs`, `fg`, `bg` | Run in background, list jobs, bring to foreground, resume in background |
| `nice` / `renice` | Set priority (−20 highest, 19 lowest) |

**System**
| Command | Meaning |
|---|---|
| `uname -a`, `whoami`, `who` | Kernel info, current user, logged-in users |
| `df -h` / `du -sh` | Free space per file system / space used by a folder |
| `free -h`, `uptime` | RAM and swap use / time since boot |
| `man`, `history` | Manual page / previous commands |
| `sudo`, `su`, `passwd` | Run as root, switch user, change password |
| `mount` / `umount` | Attach / detach a file system |

**Archives**
| Command | Meaning |
|---|---|
| `tar -cvf` / `-xvf` / `-tvf` | Create / extract / list an archive (`z` gzip, `j` bzip2) |
| `gzip` / `gunzip` | Compress / decompress |

**Networking**
| Command | Meaning |
|---|---|
| `ping` | Test reachability |
| `ip` / `ifconfig` | Show or configure interfaces |
| `ssh` / `scp` | Secure login / secure copy (port 22) |
| `wget` / `curl` | Download from / transfer to or from a URL |

**Text tools**
| Command | Meaning |
|---|---|
| `sort` | Sort lines (`-n` numeric, `-r` reverse) |
| `uniq` | Remove **adjacent** duplicates (sort first) |
| `cut` | Cut columns or fields (`-d: -f1`) |
| `tr` | Translate characters, e.g. change case |
| `sed` | Stream editor: find and replace |
| `awk` | Pattern scanning and field processing |
| `diff` | Compare files line by line |
| `tee` | Write to a file **and** the screen |

### Permissions ⭐
- `ls -l` → `-rwxr-xr--`: the type comes first (`-` file, `d` directory, `l` link), then the user, group and others triples.
- **r = 4, w = 2, x = 1**; add them for each class. On a directory, x = enter it and w = create or delete entries.

| Octal | Symbolic | Use |
|---|---|---|
| 777 | rwxrwxrwx | Everyone everything (unsafe) |
| 755 | rwxr-xr-x | Programs, default directory |
| 750 | rwxr-x--- | Group-shared programs |
| 700 | rwx------ | Private directory |
| 666 | rw-rw-rw- | Base for new files |
| **644** ⭐ | **rw-r--r--** | **Default text file** |
| 600 | rw------- | Private file |
| 444 | r--r--r-- | Read-only for all |

- **umask rule:** new files start from 666 and directories from 777; the umask bits are **masked out** (mode AND NOT umask), not subtracted.
- umask 022 → file **644**, directory **755**. 002 → 664/775. 077 → 600/700. **023 → 644** (not 643) and 754.
- Special bits: SUID 4000 (`s`, e.g. passwd), SGID 2000, sticky 1000 (`t`, /tmp = 1777).

### chmod / chown / chgrp syntax
| Syntax | Effect |
|---|---|
| `chmod 755 file` | Octal mode; the two arguments are **mode + file names** ⭐ |
| `chmod u+x file` | Add execute for the owner (u user, g group, o others, a all) |
| `chmod go-w file` | Remove write from group and others |
| `chmod a=r file` | Set exactly r--r--r-- |
| `chmod -R 755 dir` | Apply recursively |
| `chown user:group file` | Change owner and group (root only) |
| `chgrp group file` | Change group only |

### Redirection, pipes, wildcards, chaining
| Symbol | Meaning |
|---|---|
| `>` / `>>` | Redirect stdout: overwrite / append |
| `<` | Read stdin from a file |
| `2>` / `2>&1` | Redirect errors / send errors where stdout goes |
| `\|` | Pipe: stdout of the left command → stdin of the right |
| `*` ⭐ | Any string: `rm doc*` deletes files **beginning** with doc; `*doc` = ending with doc |
| `?` | Exactly one character |
| `[abc]` / `[!abc]` | One character in / not in the set |
| `;` | Run the next command always |
| `&&` / `\|\|` | Run the next only if the first succeeds / fails |
| `&` | Run in the background |

- Streams: 0 = stdin, 1 = stdout, 2 = stderr. The **shell** expands wildcards before the command runs, and `*` skips hidden files.

### vi commands
| Command | Action |
|---|---|
| `i`, `a`, `o` | Enter insert mode (before cursor, after, new line below) |
| `Esc` | Back to command mode |
| `:w` / `:q` | Save / quit |
| `:wq`, `:x`, `ZZ` | Save and quit |
| `:q!` | **Quit without saving** |
| `dd`, `yy`, `p` | Delete line, copy line, paste |
| `x`, `u` | Delete character, undo |
| `/word`, `:%s/old/new/g` | Search, replace everywhere |

### Shell-script specials
| Symbol | Meaning |
|---|---|
| `#!/bin/bash` | Shebang: names the interpreter |
| `$0` | Script name |
| `$1` … `$9` | Positional arguments |
| `$#` | **Number of arguments** |
| `$@` / `$*` | All arguments |
| `$?` | **Exit status of the last command** (0 = success) |
| `$$` | PID of the current shell |
| `$!` | PID of the last background job |

- Run a script: `chmod +x s.sh` then `./s.sh`.

---

## 9. Full forms you must know
| Short | Full form |
|---|---|
| OS | Operating System |
| PCB | Process Control Block |
| PID | Process Identifier |
| IPC | Inter-Process Communication |
| RPC | Remote Procedure Call |
| API | Application Programming Interface |
| POSIX | Portable Operating System Interface |
| SMP | Symmetric Multiprocessing |
| RTOS | Real-Time Operating System |
| FCFS | First-Come, First-Served |
| SJF | Shortest Job First |
| SRTF | Shortest Remaining Time First |
| RR | Round Robin |
| HRRN | Highest Response Ratio Next |
| MLQ / MLFQ | Multilevel Queue / Multilevel Feedback Queue |
| AT / BT / CT | Arrival / Burst / Completion Time |
| TAT / WT / RT | Turnaround / Waiting / Response Time |
| CS | Critical Section |
| TSL | Test and Set Lock |
| RAG | Resource-Allocation Graph |
| MMU | Memory-Management Unit |
| TLB | Translation Look-aside Buffer |
| PTBR | Page-Table Base Register |
| EAT | Effective Access Time |
| FIFO | First In, First Out |
| LRU | Least Recently Used |
| LFU / MFU | Least / Most Frequently Used |
| PFF | Page-Fault Frequency |
| WSS | Working-Set Size |
| DMA | Direct Memory Access |
| BIOS | Basic Input/Output System |
| POST | Power-On Self-Test |
| MBR | Master Boot Record |
| UEFI | Unified Extensible Firmware Interface |
| FCB | File Control Block |
| VCB | Volume Control Block |
| MFT | Master File Table |
| FAT | File Allocation Table |
| NTFS | New Technology File System |
| exFAT | Extended File Allocation Table |
| ext4 | Fourth Extended File System |
| EFS | Encrypting File System |
| ACL | Access-Control List |
| SSTF | Shortest Seek Time First |
| C-SCAN | Circular SCAN |
| RAID | Redundant Array of Independent (Inexpensive) Disks |
| SPOOL | Simultaneous Peripheral Operations On-Line |
| GNU | GNU's Not Unix |
| GPL | GNU General Public License |
| FHS | Filesystem Hierarchy Standard |
| bash | Bourne-Again Shell |
| grep | Global Regular Expression Print |
| SUID / SGID | Set User ID / Set Group ID |

---

## 10. Last 12 traps
- [ ] **OS vs kernel:** the user–hardware bridge is the **OS**; the kernel is only its core.
- [ ] **Monolithic = one address space**; a microkernel is smaller but slower and needs **more** code to design.
- [ ] **Ready ≠ waiting:** ready waits for the CPU, waiting waits for I/O. Memory is freed only on **running → terminated**.
- [ ] **Scheduler selects, dispatcher allocates.** Context-switch time is pure overhead (TRUE).
- [ ] **n forks → 2ⁿ processes but 2ⁿ − 1 children.** Read whether the question wants processes or children.
- [ ] **Burst time is not "time to start"**; TAT = CT − AT (never CT − BT); response time ends at the **first** run.
- [ ] **wait = P = decrement, signal = V = increment**, not lock/acquire/release. Unsafe ≠ deadlocked.
- [ ] **OPT looks to the future, LRU to the past**; Belady's anomaly is FIFO only.
- [ ] **Paging → internal** fragmentation, **segmentation → external**. A TLB miss costs t + 2m.
- [ ] **Seek needs no I/O.** VCB = block counts; boot info = boot control block; unique file ID = FCB/inode.
- [ ] **SSTF's advantage** = lower average response time; starvation and high variance are its drawbacks.
- [ ] **Linux:** `rmdir` = empty directories only; `rm doc*` = names **starting** with doc; umask is **masked**, not subtracted (023 → 644); `$` user, `#` root; config in **/etc**, temp in **/tmp**.
