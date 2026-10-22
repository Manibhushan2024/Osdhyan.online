# Operating Systems: what DSSSB TGT CS and similar exams stress (research, 22 Oct 2026)

**Evidence.** The Victory Key looked at 12 official DSSSB TGT CS papers (1,130 subject questions). It ranks **OS including Linux first: 104 questions, 9.2%, about 8–9 per paper**. Its most-asked single topic is **Linux/Unix commands and shell: 25 questions in 9 of the 12 papers**. Virtual memory and page replacement has 15. For PGT, OS ranks 4th (9.7%). By my count, 11 of our 33 official questions (4 papers, 2023–24) are Linux items; the brief says 13 because it also counts file-system items. KnowledgeGate's DSSSB Section-B course spends the most lessons on Memory Management (35), Linux (35), Synchronisation (26), CPU Scheduling (25), Unix (21) and Deadlock (21). Official syllabus items: "15. Operating Systems" and "19. Linux Environment".

YouTube (I could read titles and summaries only): Gate Smashers' OS syllabus video names memory, disk scheduling, synchronisation and deadlock as the key areas. A KnowledgeGate one-shot starts with OS types, kernels and system calls. Adda247 (V. K. Pandey) runs DSSSB 2026 OS classes. One video is titled "DSSSB TGT CS – Operating System PYQ + MCQ".

## (a) Ranked topics

| # | Topic (chapter) | Evidence | Priority |
|---|---|---|---|
| 1 | File/directory commands: rm, rmdir, cp, mv, ls, wildcards (os_linux) | 3 PYQs; TVK #1 topic; KG 56 lessons | Must |
| 2 | grep, pipes, filters (os_linux) | 1 PYQ | Must |
| 3 | chmod, umask, default 644 (os_linux) | 2 PYQs | Must |
| 4 | Directory tree (/etc, /bin, /dev, /usr), ext4 (os_linux) | 3 PYQs | Must |
| 5 | Shells and prompts (os_linux) | 2 PYQs | Must |
| 6 | Virtual memory, page faults, FIFO/LRU/Optimal, Belady (os_memory) | 3 PYQs; TVK 15 Qs; Unacademy; Gate Smashers | Must |
| 7 | Process states, PCB (os_process) | 2 PYQs; JRF Adda | Must |
| 8 | System-call categories (os_intro) | 2 PYQs | Must |
| 9 | Scheduling terms and criteria (os_sched) | 2 PYQs; KG 25 | Must |
| 10 | Scheduling algorithms, Gantt numericals (os_sched) | All syllabi; KG blog | Must |
| 11 | Deadlock conditions, prevention, Banker's (os_sync) | 1 PYQ; KG 21; Gate Smashers | Must |
| 12 | Semaphores, critical section, classic problems (os_sync) | 1 PYQ; KG 26 | Must |
| 13 | Dispatcher, context switch, schedulers (os_process) | 2 PYQs | Must |
| 14 | Paging, segmentation, TLB, fragmentation (os_memory) | KG 35; Gate Smashers | Should |
| 15 | Disk scheduling (os_storage) | 1 PYQ; KG 12; UGC NET 2020 (6 items) | Should |
| 16 | File-system blocks, inode, allocation (os_storage) | 1 PYQ | Should |
| 17 | NTFS/FAT, Windows (os_storage) | 1 PYQ; KG Windows 26 | Should |
| 18 | OS definition and services (os_intro) | 2 PYQs | Should |
| 19 | Monolithic vs microkernel (os_intro) | 1 PYQ; KG one-shot | Should |
| 20 | fork/exec/wait/join, zombie, orphan (os_process) | 1 PYQ; UGC NET | Should |
| 21 | IPC: pipes, sockets, shared memory (os_process) | 1 PYQ | Should |
| 22 | Threads: user vs kernel (os_process) | Gate Smashers; KG | Should |
| 23 | Types of OS, RTOS (os_intro) | Gate Smashers; KG 22 | Should |
| 24 | ps, kill, top, &, redirection (os_linux) | Linux trend | Should |
| 25 | File seek and access methods (os_storage) | 1 PYQ | Good to know |
| 26 | Interrupts, DMA, spooling, RAID (os_storage) | General syllabi | Good to know |

## (b) Recurring question styles
- "Which command…?" or "What does `rm doc*` do?", with fake commands as options (Delete, Erase, Rdir, "Alpha cell").
- Pick the FALSE or NOT-true statement (scheduling terms, kernels, Linux directories, NTFS, OS services).
- Statement I/II items (Belady's anomaly, context switching).
- Match the following (states, system-call categories).
- Fill in a textbook definition ("illusion of a very large main memory").
- Wording follows Silberschatz closely, so keep its terms.
- Numericals are rare in DSSSB TGT but common in KVS/NVS/UGC NET, so include a few.

## (c) High-frequency facts
1. `rm` deletes files; `rm -r` deletes directories; `rmdir` deletes only empty directories.
2. `grep` prints matching lines; `-i` ignores case, `-v` inverts, `-c` counts, `-n` numbers lines.
3. `chmod` takes the permission change and the file name(s); 755 = rwxr-xr-x.
4. A file gets 666 − umask and a directory 777 − umask; with umask 022 that is 644 and 755.
5. `chown` changes the owner and `chgrp` the group.
6. `ls -l` gives a long listing; `ls -a` shows hidden files.
7. `pwd` shows the current directory; `cd ..` goes to the parent.
8. `cp` copies; `mv` moves or renames; `touch` creates an empty file.
9. `head`/`tail` show 10 lines by default; `wc -l` counts lines.
10. `|` pipes output on; `>` overwrites; `>>` appends; `<` reads input from a file.
11. `ps` lists processes; `kill -9` sends SIGKILL; `&` runs a command in the background; `man` shows the manual.
12. Prompts: `$` for a normal user, `#` for root, `%` for the C shell.
13. Shells: sh, bash (the Linux default), csh, ksh, tcsh, zsh.
14. /etc = configuration, /bin = essential commands, /dev = devices, /tmp = temporary files, /root = root's home.
15. ext4 is the default; /etc/passwd holds accounts and /etc/shadow holds password hashes.
16. An inode stores metadata but not the file name.
17. An OS is the interface between user and hardware. Compiling code is not an OS service.
18. A monolithic kernel uses one address space; a microkernel moves services to user space.
19. States: new → ready → running → waiting → terminated. Memory is freed on termination.
20. The dispatcher gives the CPU to the selected process. Context switching is pure overhead.
21. The long-term scheduler sets the degree of multiprogramming; the medium-term scheduler swaps.
22. TAT = CT − AT and WT = TAT − BT. A good scheduler has high throughput and low TAT.
23. SJF gives the minimum average waiting time. FCFS suffers the convoy effect. A huge RR quantum behaves like FCFS.
24. Aging prevents starvation.
25. Deadlock needs mutual exclusion, hold and wait, no preemption and circular wait. Banker's algorithm is for avoidance.
26. A semaphore is accessed only by atomic wait() (P) and signal() (V).
27. A critical-section solution needs mutual exclusion, progress and bounded waiting.
28. A page fault happens when the referenced page is not in RAM.
29. FIFO can show Belady's anomaly; LRU and Optimal cannot.
30. Thrashing means heavy paging and low CPU utilisation.
31. Paging causes internal fragmentation; segmentation causes external fragmentation.
32. SSTF can starve requests; SCAN is the "elevator"; C-SCAN gives more uniform waiting.
33. A socket is an endpoint of communication (IP address + port).
34. Seek needs no actual I/O. The volume control block holds block counts and free-block details.

## (d) Gaps (stressed by sources, absent from our 33 PYQs)
- Scheduling Gantt numericals.
- Banker's algorithm and resource-allocation graphs.
- Peterson's solution; producer–consumer, readers–writers and dining philosophers.
- Paging, TLB and effective access time; thrashing.
- Page-fault counting.
- Disk head-movement numericals.
- Threads; RTOS and other OS types.
- File allocation methods.
- Linux process and text commands (ps, kill, chown, find, sort, cut), vi, shell scripting.

## (e) Sources
- The Victory Key, DSSSB analysis: https://thevictorykey.com/dsssb
- KnowledgeGate Section B course: https://www.knowledgegate.ai/courses/DSSSB-TGT-COMPUTER-SCIENCE-PAPER-2
- KnowledgeGate PYQ analysis: https://www.knowledgegate.ai/blog/dsssb-tgt-computer-science-previous-year-analysis — "Recurrence decides order, not the official boundaries of the next paper."
- KnowledgeGate syllabus by block: https://www.knowledgegate.ai/blog/dsssb-computer-science-syllabus-what-to-study-in-each-block
- PW syllabus: https://www.pw.live/teaching/exams/dsssb-tgt-computer-science-syllabus
- Syllabus4u: https://syllabus4u.com/dsssb-tgt-computer-science-syllabus/
- Gate Smashers OS syllabus (summary): https://videohighlight.com/v/bkSWJJZNgf8
- OS PYQ + MCQ video: https://www.youtube.com/watch?v=W2BDFO46pIw
- OS important MCQ video: https://www.youtube.com/watch?v=556qrm4Umb8
- Adda247 OS classes: https://www.youtube.com/watch?v=xyvF6eJliIA
- Adda247 previous papers: https://www.adda247.com/teaching-jobs-exam/dsssb-tgt-computer-science-previous-year-question-paper/
- Unacademy virtual-memory lessons: https://unacademy.com/lesson/most-imprortant-topic-virtual-memory-and-based-questions/09PODQ0B
- SamagraCS UGC NET 2020: https://samagracs.com/ugc-net-computer-science-previous-year-question-analysis-2020-2019-2018/
- JRF Adda UGC NET topics: https://www.jrfadda.com/exams/ugc-net/ugc-net-computer-science-most-expected-questions-based-on-previous-year-papers
- Our data: `dsssb/os_pyq_analysis.json` (33 questions).
