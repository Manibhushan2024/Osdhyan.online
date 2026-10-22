# Review of questions_a.json (OS, 100 MCQs)

Reviewer: independent examiner, 2026-10-22.
Scope: all 100 questions (os_intro 25, os_process 30, os_sched 25, os_sync 20).
Answer positions: 25 / 25 / 25 / 25 (unchanged).

## Result

No changes were needed. Every question was solved independently before the key was read, and every key, stem, distractor set and explanation was found correct and unambiguous.

| Q | Problem | Fix |
|---|---|---|
| none | none | none |

## How it was checked

- **Scheduling numericals (Q68–Q80)**: re-simulated by script (FCFS, non-preemptive SJF, SRTF, preemptive and non-preemptive priority, RR with the standard queue convention, HRRN, exponential averaging). All Gantt charts, completion times and averages match the keys and the explanations. Q71 already states the RR arrival-vs-preempted queue convention; Q72 and Q76 have all arrivals at t = 0, so no convention is needed. No numerical has a tie that depends on an unstated rule.
- **fork() programs (Q42–Q46)**: simulated with a process-tree replay script: Q42 = 8, Q43 = 14 (stem states output is written immediately, so stdio buffering cannot change the count), Q44 = 5, Q45 = 5, Q46 = child 15 then parent 3 (parent calls wait()).
- **Semaphores (Q87, Q88)**: 7 − 15 + 9 = 1; 4 − 6 = −2 with 2 blocked.
- **Banker's / minimum resources (Q94, Q95, Q98, Q99)**: Available = (1, 2, 1) confirmed from totals; only option 1 of Q94 and only option 0 of Q95 are safe; brute force confirms 9 instances (Q98) and 4 processes (Q99).
- **Q3**: 1 − 0.8³ = 0.488.
- **Theory**: checked against Silberschatz–Galvin: OS definition, kernel, multiprogramming / time sharing, batch / real-time / distributed / multiprocessor terms, mode bit (kernel 0, user 1), privileged instructions (reading the clock is not privileged), traps, OS-service groups, system-call categories (wait for time, allocate/free memory and wait/signal event under process control; create/delete connection and attach/detach remote devices under communications), parameter passing, microkernel, layered and modular structure, process states and transitions, PCB, context switch, schedulers and dispatcher, fork/exec/wait, zombie and orphan, IPC (shared memory, sockets, pipes, signals), thread sharing, benefits and models, CS requirements, Peterson, test_and_set, semaphores, monitors, bounded buffer, deadlock conditions, prevention, avoidance, RAG and wait-for graph, starvation vs deadlock.
- **Duplicates**: no duplicate or near-duplicate questions (stem similarity only from shared templates such as "Which statement about ... is correct?"); every question has 4 distinct options.
