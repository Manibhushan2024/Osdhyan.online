# CPU Scheduling

**In 30 seconds**
- Process execution is a **cycle of CPU bursts and I/O bursts**. **Burst time** = CPU time a process **needs to execute** (not the time to start). ⭐ Asked in DSSSB
- **Non-preemptive**: once a process gets the CPU it keeps it until it **terminates or waits** (FCFS, SJF, non-preemptive priority, HRRN). **Preemptive**: the CPU can be taken away (SRTF, preemptive priority, RR).
- A good scheduler **maximises CPU utilisation and throughput** and **minimises turnaround, waiting and response time**. So: **high throughput, low turnaround time**. ⭐ Asked in DSSSB
- **TAT = CT − AT**, **WT = TAT − BT**, **RT = (first time on CPU) − AT**.
- **FCFS** → **convoy effect**. **SJF** → **optimal (minimum) average waiting time**, but long jobs may **starve**. **SRTF** = preemptive SJF.
- **Priority** → **starvation**, cured by **aging**. **Round Robin** = FCFS + preemption with a **time quantum**; huge quantum → FCFS, tiny quantum → too many context switches.
- **HRRN**: response ratio = **(W + S) / S**; highest ratio runs next; no starvation. **MLFQ** lets processes **move between queues**; MLQ does not.
- **Dispatcher** gives the CPU to the process the short-term scheduler selected. ⭐ Asked in DSSSB

---

## 1. Basic concepts

### CPU–I/O burst cycle
- *Process execution consists of a cycle of CPU execution and I/O wait.* It **begins with a CPU burst** and **ends with a CPU burst** (the final one ends with a request to terminate).
- **I/O-bound** program: many **short** CPU bursts. **CPU-bound** program: a few **long** CPU bursts.
- The **short-term scheduler (CPU scheduler)** selects a process from the **ready queue** and allocates the CPU to it. The ready queue need not be FIFO: it may be a FIFO queue, priority queue, tree or unordered list.

### When does scheduling happen? (Silberschatz's 4 cases)
| # | Event | Scheduling |
|---|---|---|
| 1 | Running → **waiting** (I/O request, `wait()` for a child) | Must choose a new process |
| 2 | Running → **ready** (interrupt, e.g. timer) | Choice — **preemptive** |
| 3 | Waiting → **ready** (I/O completion) | Choice — **preemptive** |
| 4 | Process **terminates** | Must choose a new process |
- Scheduling **only** in cases 1 and 4 = **non-preemptive (cooperative)**. Otherwise it is **preemptive**.
- Preemption can cause **race conditions** on shared data, so it needs synchronisation. Windows 3.x was non-preemptive; Windows 95 onward, macOS and Linux are preemptive.

### Dispatcher ⭐ Asked in DSSSB
- *The dispatcher is the module that gives control of the CPU to the process selected by the short-term scheduler.* It (1) **switches context**, (2) **switches to user mode**, (3) **jumps to the proper location** in the user program.
- **Dispatch latency** = *time it takes for the dispatcher to stop one process and start another running.*
- **PYQ 2024:** "Which part of the OS allocates the CPU to the next scheduled process?" → **Dispatcher**.

---

## 2. Scheduling criteria ⭐ Asked in DSSSB

| Criterion | Definition (Silberschatz) | Goal |
|---|---|---|
| **CPU utilisation** | Keep the CPU as busy as possible (40% lightly loaded to 90% heavily loaded in a real system) | **Maximise** |
| **Throughput** | *Number of processes that are completed per time unit* | **Maximise** |
| **Turnaround time** | *Interval from the time of submission of a process to the time of completion* — includes waiting to get into memory, waiting in the ready queue, executing on the CPU and doing I/O | **Minimise** |
| **Waiting time** | *Sum of the periods spent waiting in the ready queue* | **Minimise** |
| **Response time** | *Time from the submission of a request until the first response is produced* — the time it takes to **start** responding, not to output the full result | **Minimise** |

- *The CPU-scheduling algorithm does not affect the amount of time during which a process executes or does I/O; it affects only the amount of time that a process spends waiting in the ready queue.*
- For interactive systems it is often better to minimise the **variance** of response time.

**PYQ 2023:** The desirable property of a good OS → **High throughput and low turnaround time**.

### Terms and formulas
| Term | Meaning | Formula |
|---|---|---|
| **Arrival time (AT)** | Time at which a process **arrives in the ready queue** | Given |
| **Burst time (BT)** | **CPU time required by the process for its execution** | Given |
| **Completion time (CT)** | Time at which the process **completes its execution** | Read from the Gantt chart |
| **Turnaround time (TAT)** | Time difference between completion and arrival | **TAT = CT − AT** |
| **Waiting time (WT)** | Time spent waiting in the ready queue | **WT = TAT − BT** (when there is no I/O) |
| **Response time (RT)** | Arrival until the process **first gets the CPU** | **RT = first start − AT** |
| **Throughput** | Processes completed per unit time | **n / (total schedule length)** |
| **CPU utilisation** | Busy time / total time | **(Σ BT / total time) × 100%** |

- For **non-preemptive** algorithms, **RT = WT** for every process (each process runs only once).
- **Little's formula** (queueing): **n = λ × W** (queue length = arrival rate × average waiting time).

### True/false on scheduling terms ⭐ Asked in DSSSB
| Statement | |
|---|---|
| Burst time = time required by a process **to start** its execution | **FALSE** (it is the time needed **for** its execution) |
| Turnaround time = completion time − arrival time | TRUE |
| Completion time = time at which a process completes its execution | TRUE |
| Arrival time = time at which a process arrives in the ready queue | TRUE |
| Waiting time = turnaround time − burst time | TRUE |
| Response time = time until the process **finishes** | **FALSE** (until the **first** response / first run) |
| A good scheduler minimises throughput | **FALSE** (maximises) |
| Scheduling affects the time a process spends executing | **FALSE** (only waiting time) |

---

## 3. First-Come, First-Served (FCFS)

- *The process that requests the CPU first is allocated the CPU first.* Managed with a **FIFO queue**. **Non-preemptive**. Simplest; average waiting time is often **long**.
- **Convoy effect**: *all the other processes wait for the one big process to get off the CPU* → lower CPU and device utilisation. FCFS is **bad for time-sharing** systems.

### Numerical 1 — Convoy effect (Silberschatz)
| Process | AT | BT |
|---|---|---|
| P1 | 0 | 24 |
| P2 | 0 | 3 |
| P3 | 0 | 3 |

Order P1, P2, P3:
```
| P1                      | P2 | P3 |
0                         24   27   30
```
- WT: P1 = 0, P2 = 24, P3 = 27 → **average WT = 51/3 = 17**. Average TAT = (24 + 27 + 30)/3 = **27**.

Order P2, P3, P1:
```
| P2 | P3 | P1                      |
0    3    6                         30
```
- WT: P1 = 6, P2 = 0, P3 = 3 → **average WT = 9/3 = 3**. Short jobs first cut waiting time from 17 to 3.

### Numerical 2 — FCFS with arrival times (dataset A)
| Process | AT | BT |
|---|---|---|
| P1 | 0 | 8 |
| P2 | 1 | 4 |
| P3 | 2 | 9 |
| P4 | 3 | 5 |
```
| P1      | P2  | P3        | P4    |
0         8     12          21      26
```
| Process | CT | TAT = CT − AT | WT = TAT − BT | RT |
|---|---|---|---|---|
| P1 | 8 | 8 | 0 | 0 |
| P2 | 12 | 11 | 7 | 7 |
| P3 | 21 | 19 | 10 | 10 |
| P4 | 26 | 23 | 18 | 18 |
| **Average** | | **61/4 = 15.25** | **35/4 = 8.75** | 8.75 |
- Throughput = 4/26 processes per unit time; CPU utilisation = 100% (no idle time).

---

## 4. Shortest-Job-First (SJF) and SRTF

- *Associates with each process the length of the process's next CPU burst*; the CPU goes to the process with the **smallest next CPU burst**. Ties → FCFS. More exactly: **shortest-next-CPU-burst** algorithm.
- **SJF is provably optimal**: it gives the **minimum average waiting time** for a given set of processes.
- **Problem**: the length of the next CPU burst is **not known**. It is **predicted** by the **exponential average**: **τₙ₊₁ = α·tₙ + (1 − α)·τₙ** (tₙ = actual length of the nth burst, τ = prediction, 0 ≤ α ≤ 1, commonly **α = ½**). α = 0 → recent history ignored; α = 1 → only the last burst counts.
  - Example (α = ½, τ₀ = 10, bursts 6, 4, 6, 4, 13, 13, 13): predictions **10, 8, 6, 6, 5, 9, 11, 12** (verified).
- SJF is often used in **long-term** scheduling (users give a time limit).
- **Two versions**: **non-preemptive SJF**, and **preemptive SJF = SRTF (Shortest-Remaining-Time-First)**: a newly arrived process with a burst **shorter than what is left** of the running process **preempts** it.
- **Disadvantage**: **starvation** of long processes.

### Numerical 3 — Non-preemptive SJF (dataset A)
1. t = 0: only P1 has arrived → P1 runs 0–8 (it cannot be preempted).
2. t = 8: P2 (4), P3 (9), P4 (5) are waiting → shortest P2 runs 8–12.
3. t = 12: P4 (5) < P3 (9) → P4 runs 12–17, then P3 17–26.
```
| P1      | P2  | P4    | P3        |
0         8     12      17          26
```
| Process | AT | BT | CT | TAT | WT |
|---|---|---|---|---|---|
| P1 | 0 | 8 | 8 | 8 | 0 |
| P2 | 1 | 4 | 12 | 11 | 7 |
| P3 | 2 | 9 | 26 | 24 | 15 |
| P4 | 3 | 5 | 17 | 14 | 9 |
| **Average** | | | | **57/4 = 14.25** | **31/4 = 7.75** |

### Numerical 4 — SRTF / preemptive SJF (dataset A, Silberschatz)
1. t = 0: P1 starts (remaining 8).
2. t = 1: P2 arrives with 4 < P1's remaining 7 → **P1 preempted**, P2 runs 1–5.
3. t = 5: remaining P1 = 7, P3 = 9, P4 = 5 → P4 runs 5–10.
4. t = 10: P1 (7) < P3 (9) → P1 runs 10–17; then P3 17–26.
```
| P1 | P2  | P4    | P1      | P3        |
0    1     5       10        17          26
```
| Process | AT | BT | CT | TAT | WT | RT |
|---|---|---|---|---|---|---|
| P1 | 0 | 8 | 17 | 17 | 9 | 0 |
| P2 | 1 | 4 | 5 | 4 | 0 | 0 |
| P3 | 2 | 9 | 26 | 24 | 15 | 15 |
| P4 | 3 | 5 | 10 | 7 | 2 | 2 |
| **Average** | | | | **52/4 = 13** | **26/4 = 6.5** | 17/4 = 4.25 |
- Silberschatz's answer: average waiting time **6.5** for SRTF vs **7.75** for non-preemptive SJF.

---

## 5. Priority scheduling

- *A priority is associated with each process, and the CPU is allocated to the process with the highest priority.* Equal priority → FCFS. In Silberschatz, **low number = high priority** (state your convention in the exam if not given).
- **SJF is a special case** of priority scheduling where priority = inverse of the (predicted) next CPU burst.
- Priorities may be **internal** (time limits, memory needs, ratio of I/O to CPU burst) or **external** (importance, money paid, politics).
- Can be **preemptive** (a higher-priority arrival preempts the running process) or **non-preemptive** (the new process goes to the head of the ready queue).
- **Major problem: indefinite blocking (starvation)** — a low-priority process may wait for ever. (Rumour: when the IBM 7094 at MIT was shut down in 1973, a low-priority process submitted in 1967 had still not run.)
- **Solution: aging** — *gradually increasing the priority of processes that wait in the system for a long time* (e.g. +1 every 15 minutes).

### Numerical 5 — Priority (lower number = higher priority)
| Process | AT | BT | Priority |
|---|---|---|---|
| P1 | 0 | 5 | 3 |
| P2 | 1 | 3 | 1 |
| P3 | 2 | 1 | 4 |
| P4 | 3 | 2 | 2 |
| P5 | 4 | 3 | 5 |

**(a) Non-preemptive**
1. P1 runs 0–5 (alone at t = 0; no preemption).
2. t = 5: waiting P2 (1), P3 (4), P4 (2), P5 (5) → order **P2, P4, P3, P5**.
```
| P1    | P2  | P4 | P3| P5  |
0       5     8    10  11    14
```
| Process | CT | TAT | WT |
|---|---|---|---|
| P1 | 5 | 5 | 0 |
| P2 | 8 | 7 | 4 |
| P3 | 11 | 9 | 8 |
| P4 | 10 | 7 | 5 |
| P5 | 14 | 10 | 7 |
| **Average** | | **38/5 = 7.6** | **24/5 = 4.8** |

**(b) Preemptive**
1. t = 0: P1 starts. t = 1: P2 (priority 1) arrives → **preempts P1**; P2 runs 1–4.
2. t = 4: ready P1 (3), P3 (4), P4 (2), P5 (5) → P4 runs 4–6.
3. Then P1 (remaining 4) 6–10, P3 10–11, P5 11–14.
```
| P1| P2  | P4 | P1     | P3| P5  |
0   1     4    6        10  11    14
```
| Process | CT | TAT | WT | RT |
|---|---|---|---|---|
| P1 | 10 | 10 | 5 | 0 |
| P2 | 4 | 3 | 0 | 0 |
| P3 | 11 | 9 | 8 | 8 |
| P4 | 6 | 3 | 1 | 1 |
| P5 | 14 | 10 | 7 | 7 |
| **Average** | | **35/5 = 7** | **21/5 = 4.2** | 16/5 = 3.2 |

---

## 6. Round Robin (RR)

- *Designed especially for time-sharing systems.* Like FCFS but with **preemption**: each process gets a small unit of CPU time, the **time quantum (time slice)**, usually **10–100 ms**. The ready queue is a **circular FIFO queue**.
- If the burst is **< 1 quantum**, the process releases the CPU itself. Otherwise the **timer interrupts**, a **context switch** happens and the process goes to the **tail** of the ready queue.
- With **n** processes and quantum **q**, each gets **1/n of the CPU** in chunks of at most q, and **no process waits more than (n − 1) × q** time units for its next quantum.
- **RR is preemptive.** Average waiting time is often **long**; response time is good.

### Effect of the time quantum
| Quantum | Effect |
|---|---|
| **Very large** | RR becomes **FCFS** |
| **Very small** | **Processor sharing** — each of n processes seems to have its own CPU at 1/n speed, but **context-switch overhead becomes huge** |
| **Rule of thumb** | Quantum large compared with context-switch time; **80% of CPU bursts should be shorter than the quantum** |
- Average turnaround time **does not necessarily improve** as the quantum increases.

### Numerical 6 — RR, q = 4 (Silberschatz)
| Process | AT | BT |
|---|---|---|
| P1 | 0 | 24 |
| P2 | 0 | 3 |
| P3 | 0 | 3 |
```
| P1 | P2 | P3 | P1 | P1 | P1 | P1 | P1 |
0    4    7    10   14   18   22   26   30
```
- WT: P1 = 10 − 4 = 6, P2 = 4, P3 = 7 → **average WT = 17/3 = 5.67**. (FCFS in the same order gave 17.)

### Numerical 7 — RR, q = 2, with arrival times
Convention: a process that **arrives** at time t joins the queue **before** a process whose quantum expires at t.
| Process | AT | BT |
|---|---|---|
| P1 | 0 | 5 |
| P2 | 1 | 3 |
| P3 | 2 | 1 |
| P4 | 3 | 2 |
| P5 | 4 | 3 |

| Time | Runs | Ready queue after the slice |
|---|---|---|
| 0–2 | P1 (left 3) | P2, P3, P1 |
| 2–4 | P2 (left 1) | P3, P1, P4, P5, P2 |
| 4–5 | P3 (done) | P1, P4, P5, P2 |
| 5–7 | P1 (left 1) | P4, P5, P2, P1 |
| 7–9 | P4 (done) | P5, P2, P1 |
| 9–11 | P5 (left 1) | P2, P1, P5 |
| 11–12 | P2 (done) | P1, P5 |
| 12–13 | P1 (done) | P5 |
| 13–14 | P5 (done) | — |
```
| P1 | P2 | P3| P1 | P4 | P5 | P2| P1| P5|
0    2    4   5    7    9    11  12  13  14
```
| Process | CT | TAT | WT | RT |
|---|---|---|---|---|
| P1 | 13 | 13 | 8 | 0 |
| P2 | 12 | 11 | 8 | 1 |
| P3 | 5 | 3 | 2 | 2 |
| P4 | 9 | 6 | 4 | 4 |
| P5 | 14 | 10 | 7 | 5 |
| **Average** | | **43/5 = 8.6** | **29/5 = 5.8** | **12/5 = 2.4** |
- FCFS on the same set: average WT 4.6, average RT 4.6. **RR gives better response time (2.4) but worse waiting time** — the classic trade-off.

---

## 7. Highest Response Ratio Next (HRRN)

- **Non-preemptive**. At each decision, pick the process with the **highest response ratio**:
  **Response ratio = (W + S) / S = 1 + W/S**, where W = time spent waiting so far, S = expected service (burst) time.
- Short jobs are favoured (small S), but a long job's ratio **rises as it waits** → **no starvation** (built-in aging). Due to Brinch Hansen.

### Numerical 8 — HRRN
| Process | AT | BT |
|---|---|---|
| P1 | 0 | 3 |
| P2 | 2 | 6 |
| P3 | 4 | 4 |
| P4 | 6 | 5 |
| P5 | 8 | 2 |
1. t = 0: P1 runs 0–3. t = 3: only P2 waiting → P2 runs 3–9.
2. t = 9: P3 = (5 + 4)/4 = **2.25**, P4 = (3 + 5)/5 = 1.6, P5 = (1 + 2)/2 = 1.5 → **P3** runs 9–13.
3. t = 13: P4 = (7 + 5)/5 = 2.4, P5 = (5 + 2)/2 = **3.5** → **P5** runs 13–15; then P4 15–20.
```
| P1 | P2     | P3   | P5 | P4    |
0    3        9      13   15      20
```
| Process | CT | TAT | WT |
|---|---|---|---|
| P1 | 3 | 3 | 0 |
| P2 | 9 | 7 | 1 |
| P3 | 13 | 9 | 5 |
| P4 | 20 | 14 | 9 |
| P5 | 15 | 7 | 5 |
| **Average** | | **40/5 = 8** | **20/5 = 4** |

---

## 8. Multilevel Queue (MLQ)

- *Partitions the ready queue into several separate queues.* Processes are **permanently assigned** to one queue (by memory size, priority or process type). Example: **foreground (interactive)** queue with **RR**, **background (batch)** queue with **FCFS**.
- Silberschatz's five queues, highest to lowest: **system processes, interactive processes, interactive editing processes, batch processes, student processes**.
- Scheduling **among** queues: **fixed-priority preemptive** (a lower queue runs only when all higher queues are empty; a higher-queue arrival preempts it — **starvation possible**) or **time-slicing** (e.g. 80% of CPU to foreground RR, 20% to background FCFS).
- **Low scheduling overhead but inflexible.**

### Numerical 9 — MLQ (Queue 1 high: RR q = 2; Queue 2 low: FCFS; fixed-priority preemptive)
| Process | AT | BT | Queue |
|---|---|---|---|
| P1 | 0 | 5 | 2 |
| P2 | 1 | 3 | 1 |
| P3 | 2 | 2 | 1 |
| P4 | 3 | 4 | 2 |
1. t = 0: only P1 (queue 2) → runs. t = 1: P2 arrives in queue 1 → **P1 preempted**.
2. Queue 1 by RR q = 2: P2 1–3 (left 1), P3 3–5 (done), P2 5–6 (done).
3. Queue 1 empty → queue 2 FCFS: P1 (left 4) 6–10, P4 10–14.
```
| P1| P2  | P3  | P2| P1      | P4      |
0   1     3     5   6         10        14
```
| Process | CT | TAT | WT |
|---|---|---|---|
| P1 | 10 | 10 | 5 |
| P2 | 6 | 5 | 2 |
| P3 | 5 | 3 | 1 |
| P4 | 14 | 11 | 7 |
| **Average** | | **29/4 = 7.25** | **15/4 = 3.75** |

---

## 9. Multilevel Feedback Queue (MLFQ)

- *Allows a process to move between queues.* Processes are separated by their **CPU-burst characteristics**: a process that uses **too much CPU time is moved to a lower-priority queue**; I/O-bound and interactive processes stay in higher queues. A process that **waits too long** in a lower queue may be **moved up** (**aging** prevents starvation).
- Defined by: **number of queues**, **algorithm for each queue**, **method to upgrade**, **method to demote**, **method to choose the entry queue**.
- *The most general* CPU-scheduling algorithm, and also **the most complex**.
- Silberschatz example: **Q0 RR q = 8**, **Q1 RR q = 16**, **Q2 FCFS**; a new process enters Q0; a higher queue's arrival preempts a lower queue's process.

### Numerical 10 — MLFQ (Q0: q = 4; Q1: q = 8; Q2: FCFS)
| Process | AT | BT |
|---|---|---|
| P1 | 0 | 20 |
| P2 | 1 | 10 |
| P3 | 2 | 3 |
1. **Q0** (q = 4): P1 0–4 (left 16 → demoted to Q1); P2 4–8 (left 6 → Q1); P3 8–11 (done within its quantum).
2. **Q1** (q = 8): P1 11–19 (left 8 → demoted to Q2); P2 19–25 (done).
3. **Q2** (FCFS): P1 25–33 (done).
```
| P1 | P2 | P3 | P1      | P2    | P1      |
0    4    8    11        19      25        33
```
| Process | CT | TAT | WT | RT |
|---|---|---|---|---|
| P1 | 33 | 33 | 13 | 0 |
| P2 | 25 | 24 | 14 | 3 |
| P3 | 11 | 9 | 6 | 6 |
| **Average** | | **66/3 = 22** | **33/3 = 11** | 3 |
- The short job P3 finishes quickly in the top queue; the long job P1 sinks to FCFS.

---

## 10. Comparison table

| Algorithm | Preemptive? | Selection basis | Starvation? | Key fact |
|---|---|---|---|---|
| **FCFS** | No | Arrival order | No | Convoy effect; simplest |
| **SJF** | No | Shortest next burst | **Yes** | **Optimal average WT** (non-preemptive set) |
| **SRTF** | **Yes** | Shortest remaining time | **Yes** | Preemptive SJF; best average WT overall |
| **Priority** | Either | Highest priority | **Yes** | Cure = **aging** |
| **Round Robin** | **Yes** | FCFS + time quantum | No | Best for **time-sharing**; good response time |
| **HRRN** | No | Highest (W + S)/S | No | Favours short jobs, ages long ones |
| **MLQ** | Between queues | Fixed queue per process | **Yes** | Processes cannot move |
| **MLFQ** | Yes | Feedback; processes move | No (with aging) | Most general, most complex |

**Same data (dataset A), average waiting time:** FCFS **8.75**, SJF **7.75**, SRTF **6.5**, RR (q = 4) **11.75** (RR's average RT is low, 4.5).

---

## 11. Real-time CPU scheduling (basics)

- **Soft real-time**: critical processes get preference, no guarantee. **Hard real-time**: a task **must** be serviced by its deadline.
- Needs **preemptive, priority-based** scheduling. Two latencies matter: **interrupt latency** and **dispatch latency**.
- **Periodic** tasks: processing time **t**, deadline **d**, period **p**, with **0 ≤ t ≤ d ≤ p**; rate = 1/p. **Admission control**: the scheduler admits a task only if it can guarantee its deadline.

| | **Rate-Monotonic (RM)** | **Earliest-Deadline-First (EDF)** |
|---|---|---|
| Priority | **Static**: **shorter period = higher priority** | **Dynamic**: **earlier deadline = higher priority** |
| Preemptive | Yes | Yes |
| Optimality | Optimal among **static-priority** algorithms | Theoretically optimal |
| CPU-utilisation bound | **N(2^(1/N) − 1)**: 100% for N = 1, **≈ 83% for N = 2**, → **≈ 69%** as N → ∞ | Up to **100%** (theory) |
| Periodic needed? | Yes | No — needs only deadlines |

- Verified example: P1 (p = 50, t = 25), P2 (p = 80, t = 35), utilisation ≈ 94%. **RM**: P2 finishes at 85 → **misses deadline 80**. **EDF**: P2 finishes at 60 → **all deadlines met**.
- **Proportional-share** scheduling gives each application T shares of the CPU.

## 12. Multiprocessor scheduling (one paragraph)
In **asymmetric multiprocessing** one master processor makes all scheduling decisions and does system work while the others run only user code; in **symmetric multiprocessing (SMP)** each processor is **self-scheduling**, from a **common ready queue** or its own **private queue** (most common). **Processor affinity** keeps a process on the same processor so its cache stays warm (**soft affinity**: the OS tries; **hard affinity**: the process can demand it). **Load balancing** spreads work by **push migration** (a task moves work from overloaded CPUs) or **pull migration** (an idle CPU pulls a waiting task). On **multicore** chips, **hardware threads (hyper-threading / chip multithreading)** hide **memory stalls** by switching to another thread. Linux uses the **Completely Fair Scheduler (CFS)** (default from 2.6.23; replaced by EEVDF in kernel 6.6, 2023), and Windows uses a **32-level priority-based preemptive** scheduler.

---

## Exam traps
1. **Burst time ≠ time to start.** Burst time is the CPU time a process **needs to execute**. ⭐
2. A good OS has **high throughput and LOW turnaround time** — not high-high or low-low. ⭐
3. **TAT = CT − AT** (not CT − BT); **WT = TAT − BT**. Never mix the order.
4. **Response time** ends at the **first** run, not at completion. For non-preemptive algorithms, RT = WT.
5. **SJF is optimal for average waiting time**, but it needs the next burst length (not known in advance) and it can **starve** long jobs.
6. **SRTF is preemptive SJF.** "Shortest job first, preemptive" = SRTF.
7. **Starvation cure = aging**, not "increasing the quantum" or "more memory".
8. **RR with a huge quantum = FCFS**; with a tiny quantum = too many **context switches** (overhead), not "better throughput".
9. **FCFS and RR do not starve** a process; SJF, SRTF and priority can.
10. **MLQ**: processes are **permanently** assigned; **MLFQ**: processes **move** between queues.
11. The **dispatcher** allocates the CPU; the **scheduler** only selects. Scheduling algorithms change only **waiting time**.
12. **HRRN ratio = (W + S)/S** — waiting **plus** service in the numerator; it is non-preemptive.

## One-liners for revision
1. Process execution = a cycle of CPU bursts and I/O bursts.
2. Execution begins and ends with a CPU burst.
3. I/O-bound: many short CPU bursts; CPU-bound: few long bursts.
4. The short-term scheduler picks from the ready queue.
5. Non-preemptive scheduling occurs only when a process waits or terminates.
6. The dispatcher gives control of the CPU to the selected process.
7. Dispatch latency = time to stop one process and start another.
8. Maximise CPU utilisation and throughput.
9. Minimise turnaround, waiting and response time.
10. Throughput = processes completed per unit time.
11. Turnaround time = completion time − arrival time.
12. Waiting time = turnaround time − burst time.
13. Response time = first CPU time − arrival time.
14. Burst time = CPU time required for execution.
15. Scheduling algorithms affect only the waiting time.
16. FCFS is non-preemptive and uses a FIFO queue.
17. Convoy effect: short processes wait behind one long process (FCFS).
18. SJF gives the minimum average waiting time.
19. Next CPU burst is predicted by exponential averaging: τₙ₊₁ = α tₙ + (1 − α) τₙ.
20. SRTF = preemptive SJF.
21. SJF is a special case of priority scheduling.
22. Priority scheduling's problem is starvation (indefinite blocking).
23. Aging gradually raises the priority of long-waiting processes.
24. Round Robin is designed for time-sharing systems.
25. RR = FCFS + preemption by a time quantum.
26. Typical quantum: 10–100 ms.
27. Max wait for next quantum in RR = (n − 1) × q.
28. Very large quantum → FCFS; very small → processor sharing with heavy overhead.
29. 80% of CPU bursts should be shorter than the quantum.
30. HRRN response ratio = (waiting time + service time)/service time.
31. HRRN is non-preemptive and avoids starvation.
32. MLQ: separate queues, processes fixed to one queue.
33. Foreground queue → RR; background queue → FCFS.
34. MLFQ lets processes move between queues; most general and most complex.
35. In MLFQ, CPU-hungry processes move down; long waiters move up.
36. Rate-monotonic: shorter period = higher static priority.
37. EDF: earliest deadline = highest dynamic priority.
38. RM utilisation bound ≈ 83% for 2 tasks, ≈ 69% for many.
39. Processor affinity keeps a process on the same CPU for cache benefits.
40. Linux uses CFS; Windows uses 32-level priority-based preemptive scheduling.

## Quick self-check
1. **Which is FALSE: (a) Burst time is the time required by a process to start its execution; (b) TAT = CT − AT?**
   (a) — burst time is the CPU time needed for execution.
2. **Desirable property of a good OS: high/low throughput and high/low turnaround?**
   High throughput and low turnaround time.
3. **Three processes with bursts 24, 3, 3 arrive at 0 in that order. Average WT under FCFS?**
   (0 + 24 + 27)/3 = 17.
4. **Same three under RR with q = 4?**
   (6 + 4 + 7)/3 = 5.67.
5. **Which algorithm gives the minimum average waiting time?**
   SJF (its preemptive form SRTF for arrivals over time).
6. **Dataset P1(0,8), P2(1,4), P3(2,9), P4(3,5): average WT under SRTF?**
   6.5.
7. **What causes the convoy effect?**
   FCFS: short processes wait behind one long CPU-bound process.
8. **What is the remedy for starvation in priority scheduling?**
   Aging.
9. **A process has waited 6 units and needs 3 units. Its HRRN response ratio?**
   (6 + 3)/3 = 3.
10. **Which algorithm lets a process move between queues?**
    Multilevel feedback queue.
