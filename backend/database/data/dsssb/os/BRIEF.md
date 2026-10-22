# Operating Systems for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT Computer Science candidate revising OS to score full marks, and to revise FAST. Plain, exact English.
Exam: objective MCQ, 1 mark, −0.25 for a wrong answer. OS is about 8–9 questions per paper (research on 12 papers ranks OS the most-asked CS area).

## Syllabus (owner's list)
Types, process/thread, scheduling algorithms, synchronisation, deadlock, memory management, paging, virtual memory, file systems, Linux commands basics.

## How DSSSB actually asks OS (all 33 questions from the 4 official papers, 2023–2024)
Full list with options, official answers and solutions: `backend/database/data/dsssb/os_pyq_analysis.json`. READ IT FIRST.
1. **Linux / Unix (13 of 33!)**: grep (search a pattern in files), chmod (its two arguments are the permission change and the file name(s) — `chmod 755 file`; the permission change can be written symbolically u/g/o/a ±= rwx or in octal), rm (files) and `rm doc*` wildcard behaviour, rmdir / rm -r (directories), default permissions for a new text file (666 − umask 022 = 644, rw-r--r--), shells (bash, sh, csh, ksh, zsh, tcsh, fish — distractors like "lsh"/"gsh"), bash prompt `$` for normal users and `#` for root, configuration files in /etc, Linux directory structure (/bin, /sbin, /home, /root, /var, /tmp, /usr, /dev, /proc, /boot, /lib, /mnt, /opt), default Linux file system (ext4).
2. **File systems**: NTFS facts, volume control block (per-volume details: number of blocks, block size, free-block count and pointers; superblock in UFS, master file table in NTFS), file operations (seek/reposition needs no actual I/O), disk scheduling (official answer: the advantage of SSTF is that average response time decreases — it reduces seek time and raises throughput; its drawbacks are starvation and high variance of response time).
3. **Processes**: process states match-the-following, OS releases memory after termination, fork and join for a complete process subroutine, IPC socket = endpoint, dispatcher allocates the CPU to the next scheduled process, context switching statements, system calls categories in Silberschatz's lists (process control incl. "wait for time" and "wait/signal event"; file management; device management incl. request/release device, read/write/reposition; information maintenance; communication incl. create/delete communication connection, send/receive messages, transfer status information, and attach or detach remote devices — the official answer).
4. **Scheduling**: terms true/false (burst, turnaround, waiting, response time), good scheduler criteria (max CPU utilisation & throughput, min turnaround/waiting/response).
5. **Synchronisation & deadlock**: semaphore accessed only through wait() and signal() (P/V), deadlock prevention — mutual exclusion condition (at least one resource must be held in a non-sharable mode), hold and wait, no preemption, circular wait.
6. **Memory**: page fault meaning, virtual memory = illusion of a very large main memory, Belady's anomaly (FIFO suffers; LRU and Optimal — stack algorithms — do not).
7. **General**: OS definition (interface/bridge between user and hardware), OS services (and what is NOT one), monolithic vs microkernel statements.

## Chapters (use these exact keys and titles everywhere)
| key | chapter title |
|---|---|
| os_intro | Introduction, OS Structure & System Calls |
| os_process | Processes, Threads & Inter-Process Communication |
| os_sched | CPU Scheduling |
| os_sync | Process Synchronisation & Deadlocks |
| os_memory | Memory Management & Virtual Memory |
| os_storage | File Systems, Disk Scheduling & I/O |
| os_linux | Linux / Unix Commands & Shell |

## Research input
`os/research/research.md` (when present) lists topics that DSSSB-focused websites and YouTube channels stress most.

## Facts must be correct
Standard references: Silberschatz–Galvin "Operating System Concepts" (definitions and wording), Tanenbaum "Modern Operating Systems", Linux man pages / GNU coreutils docs for commands. Every scheduling, page-replacement, Banker's and disk-scheduling numerical must be verified by a script (Gantt charts, averages, fault counts, head movement). For Linux, describe standard GNU/Linux (bash) behaviour.
