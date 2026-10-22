# Introduction, OS Structure & System Calls

**In 30 seconds**
- **Operating system** = *a program that manages the computer hardware and acts as an intermediary between the computer user and the computer hardware*. It is the **bridge / interface** between user and hardware. ⭐ Asked in DSSSB
- It is a **resource allocator** (CPU, memory, files, I/O) and a **control program** (controls execution of user programs and I/O devices). The program running at all times is the **kernel**.
- **Dual mode**: mode bit **0 = kernel (monitor/supervisor) mode**, **1 = user mode**. Privileged instructions run only in kernel mode. A **timer** stops a program from holding the CPU for ever.
- **OS services**: user interface, program execution, I/O, file-system manipulation, communication, error detection, resource allocation, accounting, protection & security. **Translating source into machine code is NOT an OS service** (the compiler does it). ⭐ Asked in DSSSB
- **System calls** = the programming interface to OS services. Six categories: **process control, file management, device management, information maintenance, communications, protection**. "Wait for time" → **process control**; "attach or detach remote devices" → **communications**. ⭐ Asked in DSSSB
- **Monolithic kernel** (Linux, traditional UNIX): all services in **one kernel address space**, fast, hard to extend. **Microkernel** (Mach, QNX, MINIX 3): minimal kernel, services in **user space**, communicate by **message passing**, small, easy to extend, slower. ⭐ Asked in DSSSB
- **Kernel** = core of the OS. **Shell** = command interpreter between user and kernel.
- UNIX: **1969, Bell Labs** (Ken Thompson, Dennis Ritchie). Linux: **1991, Linus Torvalds**.

---

## 1. What is an operating system? ⭐ Asked in DSSSB

**Definition (Silberschatz–Galvin):** *An operating system is a program that manages a computer's hardware. It also provides a basis for application programs and acts as an intermediary between the computer user and the computer hardware.*

**PYQ (2023):** "Which type of computer program acts as a **bridge** between a computer user and the computer hardware?" → **Operating system** (not "Kernel", which is only its core; not RAM; not "User thread").

### Components of a computer system
| Layer (top to bottom) | Examples |
|---|---|
| Users | People, machines, other computers |
| Application programs | Word processor, browser, compiler, database |
| **Operating system** | Windows, Linux, macOS, Android |
| Computer hardware | CPU, memory, I/O devices |

### Two views of the OS
| View | Meaning |
|---|---|
| **User view** | Ease of use and convenience (PC); performance and fair sharing (mainframe); battery life (mobile) |
| **System view** | **Resource allocator**: manages CPU time, memory, storage, I/O and decides between conflicting requests. **Control program**: *manages the execution of user programs to prevent errors and improper use of the computer* |

- **Kernel** = *the one program running at all times on the computer*. Everything else is a **system program** (ships with the OS) or an **application program**.
- Other names for an OS: **resource manager**, **control program**, **extended / virtual machine** (Tanenbaum: it hides ugly hardware behind clean abstractions).

### Goals of an OS
| Goal | Meaning |
|---|---|
| **Convenience** | Make the computer easy to use (primary goal for PCs) |
| **Efficiency** | Use the hardware efficiently (primary goal for large shared systems) |
| **Ability to evolve** | Allow new functions without disturbing service |

---

## 2. Computer-system organisation

### Interrupts
- A modern OS is **interrupt driven**. Hardware raises an **interrupt** by sending a signal to the CPU (usually over the system bus). Software raises a **trap (exception)**: by an error (divide by zero, invalid memory access) or by a **system call** (also called a *monitor call*).
- On an interrupt the CPU stops, saves the return address, and jumps through the **interrupt vector** (a table of addresses of **interrupt service routines, ISRs**).
- **Polling** = the CPU repeatedly checks the device. Interrupts avoid this waste.
- **DMA (direct memory access)**: the device controller moves a whole block between device and memory with **one interrupt per block**, not one per byte.

### Dual-mode operation
| | **User mode** | **Kernel mode** (supervisor, system, monitor, privileged) |
|---|---|---|
| **Mode bit** | **1** | **0** |
| Who runs | User applications | OS code |
| Privileged instructions | Not allowed (illegal → trap to OS) | Allowed |

- **Privileged instructions**: I/O control, timer management, interrupt management, switching to kernel mode, setting the base/limit registers.
- A **system call** changes the mode from user to kernel; the OS switches back to user mode before returning control to the user program.
- Intel 8088 had **no** mode bit, so **MS-DOS** had no protection: one bad program could crash the whole system.

### Timer
- A **timer** interrupts the computer after a set period so that a user program cannot get stuck in an infinite loop or **hold the CPU for ever**. Loading the timer is a **privileged** instruction.

---

## 3. Types of operating systems

### Batch
- Jobs with similar needs are **batched** and run together by an operator; **no interaction** with the user while the job runs. Example: early IBM mainframes. Problem: the CPU sits idle during I/O.

### Multiprogramming
- *Multiprogramming increases CPU utilisation by organising jobs (code and data) so that the CPU always has one to execute.* Several jobs are kept in memory; when one waits for I/O, the CPU switches to another.
- **Degree of multiprogramming** = number of processes in memory.

### Time-sharing (multitasking)
- *A logical extension of multiprogramming*: the CPU switches among jobs **so frequently** that each user can **interact** with his or her program while it runs. **Response time** should be short (typically **< 1 second**). Uses CPU scheduling and virtual memory. Example: UNIX, MULTICS.

### Multiprocessing (parallel / tightly coupled systems)
- Two or more processors share the bus, clock, memory and devices.
- **Advantages**: increased **throughput**, **economy of scale**, increased **reliability** (graceful degradation / fault tolerance).

| | **Asymmetric multiprocessing** | **Symmetric multiprocessing (SMP)** |
|---|---|---|
| Roles | **Boss–worker**: one boss processor schedules and gives work to the workers | All processors are **peers**; each performs all OS tasks |
| Use | Older / special systems | Almost all modern systems (Windows, Linux, macOS) |

- **Multicore** = several computing cores on one chip; it is a form of multiprocessing.

### Others
| Type | Key idea | Examples |
|---|---|---|
| **Multithreaded** | One process has several threads of control | Windows, Linux, Solaris |
| **Real-time (RTOS)** | Correct result **within a fixed time limit (deadline)** | VxWorks, QNX, FreeRTOS, RTLinux |
| – **Hard real-time** | Deadline **must** be met; missing it = system failure | Airbag, pacemaker, missile control, industrial robot |
| – **Soft real-time** | Critical tasks get priority, but a missed deadline is tolerated | Multimedia streaming, online games, VoIP |
| **Distributed** | *A collection of physically separate, possibly heterogeneous computer systems networked together* that looks like **one system**; loosely coupled, no shared memory or clock | Amoeba, LOCUS, cloud platforms |
| **Network OS** | *Provides features such as file sharing across the network*; each computer runs its own OS and knows the others exist | Novell NetWare, Windows Server, UNIX/Linux servers |
| **Embedded** | Built into a device for one dedicated job | Washing machine, car engine controller, router |
| **Mobile** | For phones and tablets: touch UI, battery, sensors | Android, iOS |

### Comparison table
| Type | Users interact? | Many jobs in memory? | Main aim |
|---|---|---|---|
| Batch | No | No (one at a time) | Throughput of similar jobs |
| Multiprogramming | Not necessarily | Yes | **CPU utilisation** |
| Time-sharing | **Yes** | Yes | **Short response time** |
| Multiprocessing | Yes | Yes | **Throughput, reliability** (many CPUs) |
| Real-time | Limited | Yes | **Meet deadlines** |
| Distributed | Yes | Spread over many machines | Resource sharing, speed-up, reliability |

---

## 4. Operating-system services ⭐ Asked in DSSSB

**Services helpful to the user**
| Service | Meaning |
|---|---|
| **User interface** | CLI (command line), GUI (windows, mouse), touch-screen, batch |
| **Program execution** | Load a program into memory, run it, end it normally or abnormally |
| **I/O operations** | Users cannot control I/O devices directly, so the OS does I/O for them |
| **File-system manipulation** | Create, delete, read, write, search files and directories; manage permissions |
| **Communications** | Exchange of information between processes (same computer or over a network), by **shared memory** or **message passing** |
| **Error detection** | Detect and correct errors in CPU, memory, I/O devices and user programs |

**Services for efficient operation of the system itself**
| Service | Meaning |
|---|---|
| **Resource allocation** | Allocate CPU, memory, files and devices among many users/jobs |
| **Accounting** | Keep track of which users use how much and what kinds of resources |
| **Protection and security** | Protection = control of access to system resources; security = defending the system from outsiders (authentication, passwords) |

**NOT OS services (distractors)** — these are done by other software:
- **Translating source code into machine code** → compiler / interpreter / assembler. ⭐ (PYQ 2023: the answer)
- Editing a document, spreadsheet calculation, browsing the web → application programs.
- Designing the circuit / manufacturing hardware → not software at all.

---

## 5. System calls ⭐ Asked in DSSSB

- **System calls** *provide an interface to the services made available by an operating system*. They are usually written in C/C++ (low-level parts in assembly).
- Programmers normally use an **API** (application programming interface) instead of raw system calls: **Windows API (Win32)**, **POSIX API** (UNIX, Linux, macOS), **Java API** (JVM). The **system-call interface** in the run-time library maps the API call to the system call, using a **number** for each system call.
- Example: C's `printf()` (a library function) internally invokes the **`write()`** system call.

### Passing parameters to the OS (3 ways)
1. **In registers** (simplest; limited by number of registers).
2. **In a block (table) in memory**, and the **address of the block** is passed in a register (Linux, Solaris).
3. **Pushed onto the stack** by the program and **popped** off by the OS.
- Block and stack methods do **not limit** the number or length of parameters.

### Six categories (Silberschatz–Galvin)
| Category | Typical system calls |
|---|---|
| **Process control** | end, abort; load, execute; create process, terminate process; get/set process attributes; **wait for time**; **wait event, signal event**; **allocate and free memory** |
| **File management (file manipulation)** | create file, delete file; open, close; **read, write, reposition**; get/set file attributes |
| **Device management (device manipulation)** | **request device, release device**; read, write, reposition; get/set device attributes; **logically attach or detach devices** |
| **Information maintenance** | get/set time or date; get/set system data; get/set process, file or device attributes |
| **Communications** | **create, delete communication connection**; **send, receive messages**; **transfer status information**; **attach or detach remote devices** |
| **Protection** | get/set file permissions; allow/deny user access |

**PYQ 2024:** "Which system call includes 'wait for time'?" → **Process control**.
**PYQ 2024:** "Which command is used in the **communication** system call?" → **Attach or detach remote devices**. (Request/release device = device management; allocate/free memory = process control; read, write, reposition = file management.)

### Windows and UNIX examples
| Category | Windows | UNIX / Linux |
|---|---|---|
| Process control | `CreateProcess()`, `ExitProcess()`, `WaitForSingleObject()` | **`fork()`**, **`exit()`**, **`wait()`**, `exec()` |
| File management | `CreateFile()`, `ReadFile()`, `WriteFile()`, `CloseHandle()` | **`open()`**, **`read()`**, **`write()`**, **`close()`**, `lseek()` |
| Device management | `SetConsoleMode()`, `ReadConsole()`, `WriteConsole()` | **`ioctl()`**, `read()`, `write()` |
| Information maintenance | `GetCurrentProcessID()`, `SetTimer()`, `Sleep()` | **`getpid()`**, `alarm()`, `sleep()` |
| Communications | `CreatePipe()`, `CreateFileMapping()`, `MapViewOfFile()` | **`pipe()`**, **`shmget()`** / `shm_open()`, `mmap()` |
| Protection | `SetFileSecurity()`, `InitializeSecurityDescriptor()`, `SetSecurityDescriptorGroup()` | **`chmod()`**, `umask()`, `chown()` |

- `fork()` creates a new process; `exec()` loads a new program into it; `wait()` lets the parent wait for the child; `exit()` ends it.
- `ioctl()` = "I/O control", a catch-all for device-specific operations.

### System programs (system utilities)
They give a convenient environment for program development and execution. Categories: **file management** (ls, cp, rm), **status information** (date, free memory, df), **file modification** (text editors), **programming-language support** (**compilers, assemblers, debuggers, interpreters**), **program loading and execution** (loaders, linkers), **communications** (email, remote login, ssh), **background services** (**daemons** in UNIX, *services* in Windows).
- So a compiler is a **system program**, but compiling is **not an OS service**.

---

## 6. Operating-system structures

### Simple structure (MS-DOS)
- Not divided into modules carefully; interfaces and levels of functionality **not well separated**. Application programs can access basic I/O routines **directly** → one faulty program can crash the whole system. Written to provide the most functionality in the least space.

### Monolithic structure ⭐ Asked in DSSSB
- *Place all of the functionality of the kernel into a single, static binary file that runs in a single address space.* Original UNIX = kernel + system programs.
- **Examples**: traditional **UNIX**, **Linux**, MS-DOS (simple monolithic), BSD.
- **Pros**: very **fast** (little overhead in the system-call interface; components call each other directly).
- **Cons**: **hard to implement, extend and maintain**; a bug in any part (for example a driver) can crash the whole kernel.

### Layered approach
- OS broken into layers: **layer 0 = hardware**, **highest layer N = user interface**. Each layer uses only the services of **lower** layers.
- **Pros**: simple to **construct and debug** (debug layer by layer). **Cons**: hard to **define the layers**, and **less efficient** (a call passes through many layers). Example: **THE** system (Dijkstra).

### Microkernel ⭐ Asked in DSSSB
- *Removes all nonessential components from the kernel and implements them as user-level programs that reside in separate address spaces.* The kernel keeps only minimal process and memory management plus **communication (message passing)**.
- **Mach** (Carnegie Mellon, mid-1980s) is the classic example. Others: **QNX** (real-time), **MINIX 3** (Tanenbaum), **L4**.
- **Pros**: **easy to extend** (new services added in user space without changing the kernel), easy to **port**, more **security and reliability** (a failed service does not crash the kernel).
- **Cons**: **performance** suffers from the overhead of message passing and mode switches.

### Monolithic vs microkernel
| Feature | **Monolithic** | **Microkernel** |
|---|---|---|
| Where services run | **All in kernel space, one (same) address space** | Kernel space holds the minimum; other services in **user space, separate address spaces** |
| Kernel size | **Large** | **Small** |
| Speed | **Faster** | Slower (message-passing overhead) |
| Extending | **Difficult** (recompile/rebuild kernel) | **Easy** |
| Code needed to design | Less | **More** |
| Crash of one service | Can crash the whole system | Rest of system keeps running |
| Communication | Direct function calls | **Message passing (IPC)** |
| Examples | **Linux**, UNIX, MS-DOS | **Mach, QNX, MINIX 3, L4** |

**PYQ 2023 — Which statement is FALSE?** "In a monolithic kernel, both user services and kernel services are kept in a **separate address space**." → **FALSE** (they share **one** address space; separate address spaces = microkernel). TRUE statements: microkernel is smaller; a monolithic kernel is not easy to extend; designing a microkernel needs more code.

### Modules (loadable kernel modules)
- The kernel has core components and **links in extra services (modules) dynamically**, at boot or run time — for example device drivers, file systems.
- *Any module can call any other module*, so it is **more flexible than layered** and **more efficient than a microkernel** (no message passing).
- Used by **Linux** (monolithic **plus** loadable modules), **Solaris**, macOS.

### Hybrid systems
- Most real OSes combine structures. **Windows** (NT kernel): largely monolithic for speed but keeps microkernel features (subsystems as user-mode processes). **macOS / iOS**: **XNU** kernel = **Mach** microkernel + **BSD UNIX** parts + dynamically loadable kernel extensions. **Android**: modified **Linux kernel** + libraries + **Android Runtime (ART)**.

### Kernel vs shell
| | **Kernel** | **Shell** |
|---|---|---|
| What | Core of the OS; manages CPU, memory, devices, system calls | **Command interpreter**: reads user commands and asks the kernel to run them |
| Position | Innermost, talks to hardware | Outer layer, talks to the user |
| Runs in | Kernel mode | User mode (it is an ordinary program) |
| Examples | Linux kernel, NT kernel, XNU | bash, sh, csh, ksh, zsh; Windows cmd.exe, PowerShell |

---

## 7. Booting (bootstrapping)

1. Power on → CPU starts executing the **bootstrap program** stored in **firmware (ROM/EEPROM/flash)**.
2. **BIOS** (Basic Input/Output System) runs **POST** (power-on self-test), finds a boot device, and loads the **boot block / MBR** (first sector, **512 bytes**) of the disk.
3. The **bootloader** (Linux: **GRUB**; Windows: Windows Boot Manager) loads the **kernel** into memory.
4. The kernel initialises hardware, mounts the root file system and starts the first process (**init / systemd**, PID 1).

- **UEFI** (Unified Extensible Firmware Interface) is the modern **replacement for BIOS**: supports **GPT** disks (> 2 TB), faster boot, **Secure Boot**, a single complete boot manager.
- **Cold boot** = starting from power off; **warm boot** = restart without cutting power.

---

## 8. Virtual machines

- *The fundamental idea behind a virtual machine is to abstract the hardware of a single computer into several different execution environments*, so each one seems to have its own private computer.
- The **host** runs a **virtual machine manager (VMM) / hypervisor**; each **guest** is usually an OS.
| Type | Runs on | Examples |
|---|---|---|
| **Type 1 (bare-metal)** | **Directly on hardware** | VMware ESXi, Xen, Microsoft Hyper-V |
| **Type 2 (hosted)** | **As an application on a host OS** | VirtualBox, VMware Workstation, Parallels |
- **Process / programming-environment VM**: the **JVM** runs Java bytecode on any OS; .NET CLR similar.
- Benefits: isolation (protection), run several OSes on one machine, testing and development, server consolidation.

---

## 9. Famous operating systems — timeline
| Year | OS | Fact |
|---|---|---|
| 1956 | GM-NAA I/O | Often called the first OS (IBM 704) |
| 1964 | IBM OS/360 | One OS family for a whole range of machines |
| 1965 | MULTICS | Time-sharing (MIT, Bell Labs, GE); inspired UNIX |
| **1969** | **UNIX** | **Bell Labs, Ken Thompson and Dennis Ritchie**; rewritten in **C** in 1973 |
| 1981 | MS-DOS | Microsoft, for the IBM PC; single-user, single-tasking, command line |
| 1984 | Mac OS (System 1) | Apple; popular GUI |
| 1985 | Windows 1.0 | Microsoft; GUI shell on MS-DOS |
| 1987 | MINIX | Andrew Tanenbaum, for teaching; microkernel |
| **1991** | **Linux** | **Linus Torvalds** (Finland); open source kernel under GPL |
| 1993 | Windows NT | Hybrid kernel; base of XP, 7, 10, 11 |
| 2001 | Mac OS X (now macOS) | UNIX-based, XNU kernel |
| 2007 | iOS | Apple iPhone |
| 2008 | **Android** | First phone 2008; **Google** (bought Android Inc. 2005); Linux kernel |

---

## Exam traps
1. **OS vs kernel:** the program that acts as the bridge between user and hardware is the **operating system**. The kernel is only its core part.
2. **Mode bit:** **0 = kernel**, **1 = user**. Do not reverse them.
3. **Compiling is not an OS service.** The compiler is a system program/language processor, but "translate source into machine code" is **not** an OS service.
4. **"Attach or detach remote devices" = communications.** "**Logically** attach or detach devices" = **device management**. Watch the word *remote*.
5. **"Wait for time" and "wait event/signal event" = process control**, not device management or communications.
6. **Allocate and free memory** = **process control** (there is no separate "memory" category in Silberschatz's list).
7. **read, write, reposition** appear in **both** file management and device management; "request/release device" is **only** device management.
8. **Monolithic = one (same) address space**; **microkernel = separate address spaces**. Microkernel is **smaller** but needs **more code to design** and is **slower**.
9. **Linux is monolithic** (with loadable modules), **not** a microkernel. **Mach, QNX, MINIX** are microkernels. Windows and macOS are **hybrid**.
10. **Time-sharing** is a **logical extension of multiprogramming**; its aim is short **response time**, while multiprogramming aims at **CPU utilisation**.
11. **Hard real-time** must never miss a deadline; soft real-time only gives priority. Do not call a multimedia player hard real-time.
12. **Network OS** = each machine keeps its own OS; **distributed OS** = many machines appear as **one** system.

## One-liners for revision
1. An OS is a program that acts as an intermediary between the user and the computer hardware.
2. The OS is a resource allocator and a control program.
3. The kernel is the one program running at all times on the computer.
4. Goals of an OS: convenience, efficiency, ability to evolve.
5. A modern OS is interrupt driven.
6. A trap (exception) is a software-generated interrupt caused by an error or a system call.
7. The interrupt vector holds the addresses of the interrupt service routines.
8. DMA transfers a whole block with one interrupt per block.
9. Mode bit 0 = kernel mode; mode bit 1 = user mode.
10. Privileged instructions can run only in kernel mode.
11. A timer prevents a user program from holding the CPU for ever.
12. Multiprogramming increases CPU utilisation.
13. Time-sharing = multitasking with fast switching so users can interact; response time < 1 second.
14. SMP: all processors are peers; asymmetric: boss–worker.
15. Multiprocessor advantages: throughput, economy of scale, reliability.
16. Hard real-time: deadline must be met (airbag); soft real-time: multimedia.
17. Distributed OS: separate computers appear as one system.
18. Network OS provides file sharing across a network; each machine has its own OS.
19. OS services: UI, program execution, I/O, file system, communication, error detection, resource allocation, accounting, protection & security.
20. Translating source into machine code is not an OS service.
21. A system call is the interface between a running program and the OS.
22. Programmers use APIs: Win32, POSIX, Java API.
23. printf() calls the write() system call.
24. Parameters pass by registers, a memory block (address in register) or the stack.
25. Six system-call categories: process control, file, device, information maintenance, communications, protection.
26. Wait for time → process control.
27. Attach or detach remote devices → communications.
28. Request/release device → device management.
29. get time/date → information maintenance.
30. fork() creates a process; exec() loads a new program; wait() waits for a child.
31. ioctl() is the UNIX device-control call; CreateProcess() is the Windows equivalent of fork().
32. MS-DOS has a simple structure with no protection.
33. Layered: layer 0 = hardware, top layer = user interface.
34. Monolithic kernel: all services in one address space; fast but hard to extend.
35. Microkernel: minimal kernel, services in user space, message passing; Mach is the classic.
36. Linux = monolithic kernel with loadable kernel modules.
37. macOS XNU = Mach + BSD (hybrid).
38. The shell is the command interpreter; the kernel is the core.
39. BIOS → POST → MBR (512 bytes) → bootloader (GRUB) → kernel → init/systemd.
40. UNIX 1969 Bell Labs (Thompson, Ritchie); Linux 1991 Linus Torvalds.

## Quick self-check
1. **Which program acts as a bridge between a computer user and the hardware?**
   The operating system.
2. **What is the value of the mode bit in kernel mode?**
   0 (user mode = 1).
3. **Which is NOT an OS service: program execution, IPC, resource management, translating source into machine code?**
   Translating source into machine code (done by a compiler).
4. **"Wait for time" belongs to which category of system calls?**
   Process control.
5. **"Attach or detach remote devices" belongs to which category?**
   Communications.
6. **"Request device, release device" belongs to which category?**
   Device management.
7. **TRUE or FALSE: In a monolithic kernel, user services and kernel services are in separate address spaces.**
   FALSE — they share one address space; separation is a microkernel feature.
8. **Name a microkernel OS and a monolithic OS.**
   Microkernel: Mach (also QNX, MINIX 3). Monolithic: Linux (also traditional UNIX).
9. **Which hardware feature stops a user program from running an infinite loop for ever?**
   The timer.
10. **Who created Linux and when?**
    Linus Torvalds, 1991.
