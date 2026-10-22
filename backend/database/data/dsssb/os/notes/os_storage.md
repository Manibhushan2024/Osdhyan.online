# File Systems, Disk Scheduling & I/O

**In 30 seconds**
- A **file** is a named collection of related information recorded on secondary storage; the OS sees it through its **FCB** (file control block, called the **inode** in UNIX).
- Six basic file operations: create, write, read, **reposition within a file (file seek — needs no actual I/O)** ⭐, delete, truncate.
- On-disk structures: **boot control block** (info to boot the OS), **volume control block** ⭐ (number of blocks, block size, free-block count and pointers — *superblock* in UFS, part of the *master file table* in NTFS), directory structure, per-file FCB.
- Allocation: **contiguous** (fast, external fragmentation), **linked / FAT** (no fragmentation, poor direct access), **indexed / inode** (direct access, index-block overhead).
- **NTFS** ⭐ supports journaling, ACL security, **compression** and **encryption (EFS)**, small clusters and huge volumes. **ext4** ⭐ is the default Linux file system.
- Disk access time = **seek time + rotational latency + transfer time**; seek time dominates.
- **SSTF** ⭐ serves the nearest request: **average response time decreases**, throughput rises; drawbacks are **starvation** and **high variance**.
- I/O techniques: polling → interrupts → **DMA** (block transfer with no CPU per byte); buffering, caching and **spooling** (printer queue).

---

## 1. File concept

A **file** is a named collection of related information that is recorded on secondary storage (Silberschatz). From the user's view it is the smallest unit of logical secondary storage: data cannot be written to disk unless it is inside a file.

### File attributes (Silberschatz list)
| Attribute | Meaning |
|---|---|
| Name | The only attribute kept in human-readable form |
| Identifier | Unique tag (a number) that identifies the file inside the file system — not human-readable |
| Type | Needed by systems that support different file types |
| Location | Pointer to the device and to the location of the file on it |
| Size | Current size (bytes, words or blocks), possibly the maximum allowed size |
| Protection | Access-control information: who can read, write, execute |
| Timestamps and user identification | Time of creation, last modification and last use; owner |

All this information is kept in the **directory structure** and the file's **FCB**.

### File operations ⭐ Asked in DSSSB
| Operation | What the OS does |
|---|---|
| **Create** | Find space in the file system; make a new entry in the directory |
| **Write** | System call gives file name and data; OS keeps a **write pointer** to the place where the next write occurs |
| **Read** | OS keeps a **read pointer**; both pointers are usually one **current-file-position pointer** |
| **Reposition within a file** ⭐ | Directory is searched and the current-file-position pointer is set to a given value. **Repositioning need not involve any actual I/O. Also known as a file seek.** |
| **Delete** | Search the directory, release all file space, erase the directory entry |
| **Truncate** | Erase the contents but keep all attributes; length becomes zero and the space is released |

Other operations (append, rename, copy) are built from these six. ⭐ **PYQ 2024**: "Which file operation need not involve any actual I/O and is also known as File Seek?" → **Repositioning within a file**.

### Open files
- `open()` searches the directory once and copies the FCB into memory, so later calls do not search again. It returns a pointer into the open-file table (**file descriptor** in UNIX, **file handle** in Windows).
- **Per-process open-file table**: the file pointer and access rights of this process.
- **System-wide open-file table**: process-independent data — the file's location on disk, size, dates, and the **file-open count** (how many processes have it open). When the count reaches 0, the entry is removed.
- Data kept for each open file: **file pointer**, **file-open count**, **disk location**, **access rights**.
- **File locks**: *shared* lock (like a reader lock — many processes may hold it) and *exclusive* lock (like a writer lock). *Mandatory* locking (Windows) is enforced by the OS; *advisory* locking (most UNIX) is left to programs.

### File types and extensions
| Type | Usual extensions | Purpose |
|---|---|---|
| Executable | exe, com, bin or none | Ready-to-run machine-language program |
| Object | obj, o | Compiled, not linked |
| Source code | c, cpp, java, py, asm | Source in various languages |
| Batch / script | bat, sh | Commands to the command interpreter |
| Markup / text | txt, xml, html, tex | Text data, documents |
| Word processor | docx, odt, rtf | Formatted documents |
| Library | lib, a, so, dll | Routines for programmers |
| Print or view | pdf, jpg, gif, png | Format for printing or viewing |
| Archive | zip, tar, rar | Related files grouped (often compressed) |
| Multimedia | mp3, mp4, avi, mov | Audio/video |

Windows relies on the **extension** to decide the type. UNIX uses a **magic number** stored at the start of some files; an extension is only a hint (the `file` command reads the content).

## 2. Access methods
| Method | How it works | Typical use |
|---|---|---|
| **Sequential** | Records processed in order, one after another: *read next*, *write next*, *reset* to the beginning. Based on the tape model. | Editors, compilers — the most common method |
| **Direct (relative)** | File is a numbered sequence of fixed-length logical records; *read n*, *write n*, *position to n* in any order. Based on the disk model. | Databases, airline reservation |
| **Indexed** | An index holds pointers to blocks; search the index, then access the record directly. Large files use a multilevel index (e.g. IBM ISAM). | Large keyed files |

Sequential access is easily simulated on a direct-access file (keep a variable `cp` = current position); simulating direct access on a sequential file is very inefficient.

## 3. Directory structures
A directory is a symbol table that translates file names into their FCBs. Operations: search, create, delete, list, rename, traverse the file system.

| Structure | Idea | Problems / features |
|---|---|---|
| **Single-level** | One directory for all files of all users | Unique names needed; **naming** and **grouping** problems |
| **Two-level** | A **master file directory (MFD)** points to a **user file directory (UFD)** per user | Users isolated; same name allowed for different users; path = user name + file name; no grouping/sharing |
| **Tree-structured** | Directories inside directories, one root; most common | **Absolute** path (from root) and **relative** path (from the current directory); efficient search and grouping |
| **Acyclic graph** | Tree + shared subdirectories/files through **links** (no cycles) | One file has several names (aliasing); deletion needs a **reference count** (UNIX hard links) or leaves **dangling pointers** |
| **General graph** | Links may create **cycles** | Traversal may loop forever; **garbage collection** needed to reclaim space |

Directory implementation: a **linear list** (simple, slow linear search) or a **hash table** (fast lookup; collisions and a fixed size are the issues).

## 4. Mounting, sharing and protection
- **Mounting**: a file system must be **mounted** before processes can use it. The OS is given the device name and a **mount point** — the location in the existing tree (usually an empty directory) where the new file system is attached. UNIX mounts on directories (`mount /dev/sdb1 /mnt`); Windows gives each volume a **drive letter** (C:, D:).
- **Sharing**: multi-user systems record an **owner** (who can change attributes and grant access) and a **group** for each file. Remote sharing uses distributed file systems such as **NFS** (UNIX) and **CIFS/SMB** (Windows) in a client–server model.
- **Consistency semantics**: **UNIX semantics** — a write is visible to other users at once; **session semantics** (AFS) — visible only to sessions opened after the file is closed; **immutable shared files** — cannot be modified.
- **Protection**: controlled access by type of operation — **read, write, execute, append, delete, list**.
  - **Access-control list (ACL)**: each file has a list of user names and the access allowed to each. Complete but long.
  - Condensed form used by UNIX: three classes — **owner (user), group, others (universe)** — with **rwx** bits each, i.e. 9 bits per file. Modern systems combine both (Linux POSIX ACLs, NTFS ACLs).
  - Password per file is another, weaker method.

## 5. File-system implementation

### Layered file system (top to bottom)
Application programs → **logical file system** (metadata, directory, FCBs, protection) → **file-organisation module** (logical → physical block translation, free-space manager) → **basic file system** (generic block commands, buffers and caches) → **I/O control** (device drivers, interrupt handlers) → devices.

### On-disk structures ⭐ Asked in DSSSB
| Structure | Per | Contents | UFS name | NTFS name |
|---|---|---|---|---|
| **Boot control block** | Volume | Information needed by the system **to boot an OS from that volume**; empty if the volume has no OS; usually the first block | Boot block | Partition boot sector |
| **Volume control block** ⭐ | Volume | **Volume (partition) details: number of blocks in the partition, block size, free-block count and free-block pointers, free-FCB count and FCB pointers** | **Superblock** | Stored in the **master file table (MFT)** |
| **Directory structure** | File system | Organises the files: file names with their FCB numbers | File names + inode numbers | Stored in the MFT |
| **FCB** | File | Details of the file; has a **unique identifier number** to allow association with a directory entry | **Inode** | Stored in the MFT (a relational database, a row per file) |

⭐ **PYQ 2024**: "Which statement is correct for a Volume Control Block?" → **It contains the number of blocks in the partition.** Distractors: "information to boot an OS" = boot control block; "unique identifier number to associate with a directory entry" = FCB; "used to organise the files" = directory structure.

**Typical FCB contents**: file permissions; file dates (create, access, write); file owner, group, ACL; file size; file data blocks or pointers to them.

**In-memory structures**: mount table, directory-structure cache, system-wide open-file table, per-process open-file table, buffers holding file-system blocks.

## 6. Allocation methods
| Method | Directory keeps | Advantages | Disadvantages |
|---|---|---|---|
| **Contiguous** | Start block + length | Simple; fast sequential **and** direct access (block b + i); minimal seeks | **External fragmentation**; hard to grow a file; size must be known; compaction needed |
| **Linked** | First (and last) block; each block points to the next | **No external fragmentation**; file can grow freely | Only **sequential** access is efficient; pointer space in every block; one broken pointer loses the rest |
| **FAT** (linked variant) | Start block; a **File Allocation Table** at the start of the volume has one entry per block holding the next block number | Next-block chain cached in memory, so random access is faster; free blocks marked 0 | Table must be read (many head seeks if not cached) |
| **Indexed** | Address of the file's **index block** (array of block addresses; entry i → block i) | **Direct access** without external fragmentation | Index block is wasted for tiny files; large files need linked/multilevel/combined schemes |

Clustering blocks reduces pointer overhead at the cost of internal fragmentation. **Extents** (a contiguous chunk + a link to the next) are used by ext4, NTFS and others.

### UNIX inode (combined scheme)
An inode holds attributes plus **15 block pointers**: **12 direct**, **1 single indirect**, **1 double indirect**, **1 triple indirect**. Small files need no index blocks; huge files are still addressable.

**Numerical — maximum file size.** Block size 4 KB, disk-block address 4 bytes.
- Pointers per index block = 4096 / 4 = **1024**.
- Direct: 12 × 4 KB = **48 KB**
- Single indirect: 1024 × 4 KB = **4 MB**
- Double indirect: 1024² × 4 KB = **4 GB**
- Triple indirect: 1024³ × 4 KB = **4 TB**
- Maximum ≈ 4 TB + 4 GB + 4 MB + 48 KB = **4,402,345,721,856 bytes (≈ 4 TB)**.

With 1 KB blocks and 4-byte pointers: 256 pointers per block → (12 + 256 + 256² + 256³) × 1 KB = 17,247,252,480 bytes ≈ **16 GB**.

**Which pointer holds byte 5,000,000?** (4 KB blocks) Logical block = ⌊5,000,000 / 4096⌋ = **1220**. Blocks 0–11 are direct, 12–1035 single indirect, so block 1220 is reached through the **double indirect** pointer.

## 7. Free-space management
| Method | Idea | Note |
|---|---|---|
| **Bit vector (bitmap)** | One bit per block; in Silberschatz **1 = free, 0 = allocated** | Easy to find the first free block or n consecutive free blocks; the map must be in memory. 1 TB disk with 4 KB blocks → 2²⁸ bits = **32 MB** of bitmap |
| **Linked list** | Free blocks linked together; head pointer kept in memory/disk | No wasted space but traversal is slow (rarely needed); FAT merges free-space accounting into the table |
| **Grouping** | First free block stores addresses of **n** free blocks; the first n − 1 are free, the last holds the next n addresses | Many free blocks found quickly |
| **Counting** | Store (address of first free block, **count** of contiguous free blocks after it) | Short list when space is freed in runs |

Bitmap example: blocks 2, 3, 4, 5, 8–13, 17, 18, 25–27 free → `00111100111111000110000001110000…`. First free block number = (bits per word) × (number of all-zero words) + offset of the first 1 bit.

**Recovery**: a **consistency checker** (`fsck` in UNIX, `chkdsk` in Windows) compares directory data with data blocks. **Journaling (log-based transaction-oriented)** file systems write each metadata change to a log as a transaction; after a crash only the log is replayed (ext3, ext4, NTFS, XFS, JFS).

## 8. File systems compared ⭐
| File system | Origin | Key facts |
|---|---|---|
| **FAT12** | MS-DOS, floppies | 12-bit entries, up to 4,084 clusters |
| **FAT16** | MS-DOS | 16-bit entries; volumes up to 2 GB (4 GB with 64 KB clusters) |
| **FAT32** | Windows 95 OSR2 (1996) | 28 usable bits per entry; **max file size 4 GB − 1 byte**; universal on USB drives; no journaling, no permissions |
| **exFAT** | Microsoft, 2006 | For flash/SD cards (SDXC); files far larger than 4 GB; light-weight, no journaling |
| **NTFS** ⭐ | Windows NT 3.1 (1993) | Default Windows FS; see list below |
| **ext2** | Linux, 1993 | No journal; fast but slow fsck |
| **ext3** | Linux, 2001 | ext2 + **journaling**; backward compatible |
| **ext4** ⭐ | Linux, 2008 | **Default on most Linux distributions**; journaling, **extents**, delayed allocation, files up to 16 TB, volumes up to 1 EB, faster fsck |
| **XFS / Btrfs** | Linux | XFS default on RHEL 7+; Btrfs (copy-on-write, snapshots) default on Fedora and openSUSE |
| **HFS+** | Apple, 1998 | Mac OS Extended, journaled |
| **APFS** | Apple, 2017 | Replaced HFS+; for SSDs; copy-on-write, snapshots, native encryption |
| **ISO 9660** | 1988 standard | CD-ROM file system (read-only); **UDF** for DVD/Blu-ray |

### NTFS ⭐ Asked in DSSSB
- **Master File Table (MFT)**: every file and directory is a record in the MFT; small files fit inside their MFT record.
- **Journaling** (`$LogFile`) — recoverable after a crash.
- **Security**: per-file **ACLs** (security descriptors).
- **Compression** ⭐ of files and folders is built in, and **encryption** with **EFS** (Encrypting File System). A file cannot be NTFS-compressed and EFS-encrypted at the same time.
- **Small clusters** (default 4 KB) → efficient use of space; very **large volumes and files**; improved performance, reliability and scalability over FAT.
- Disk quotas, hard links, sparse files, alternate data streams, Unicode names up to 255 characters, Volume Shadow Copy.
- File attributes: **read-only, hidden, system, archive, not content indexed, off-line, temporary, compressed** (plus encrypted).

⭐ **PYQ 2023**: "NOT true about NTFS?" → "**It does not support compression of files and directories**" (false — NTFS does support compression).

## 9. Disk structure and access time
- A hard disk has **platters** coated with magnetic material; each surface has a **read-write head** on a **disk arm**; all arms move together.
- Surface → concentric **tracks** → **sectors** (512 bytes traditionally, 4 KB on Advanced Format disks). A **cylinder** is the set of tracks at one arm position on all surfaces.
- Disk addressed as a 1-D array of **logical blocks**; sector 0 is the first sector of the first track on the outermost cylinder.
- **Seek time**: move the arm to the right cylinder (usually the largest component).
- **Rotational latency**: wait for the sector to rotate under the head. Average = **half a rotation**.
- **Transfer time**: data actually read/written.
- **Positioning (random-access) time** = seek time + rotational latency. **Access time** = seek + latency + transfer.
- Hard disks use **CAV** (constant angular velocity); CDs use **CLV** (constant linear velocity). SSDs have no seek or latency.

**Numerical.** 7200 RPM, average seek 4 ms, 100 sectors per track. Read one sector.
- One rotation = 60,000 / 7200 = **8.33 ms**; average latency = 8.33 / 2 = **4.17 ms**
- Transfer one sector = 8.33 / 100 = **0.083 ms**
- Average access time = 4 + 4.17 + 0.083 = **8.25 ms**

**Capacity**: 16 surfaces × 1024 tracks × 64 sectors × 512 bytes = **512 MB**.

## 10. Disk scheduling
Goal: minimise seek time (head movement) and maximise bandwidth.
**Common request queue (Silberschatz)**: 98, 183, 37, 122, 14, 124, 65, 67; head at **53**; cylinders **0–199**.

| Algorithm | Rule | Service order | Head movement |
|---|---|---|---|
| **FCFS** | Serve in arrival order; fair, no starvation | 53→98→183→37→122→14→124→65→67 | **640** |
| **SSTF** ⭐ | Serve the request with the **least seek time from the current head position** | 53→65→67→37→14→98→122→124→183 | **236** |
| **SCAN** (elevator), moving toward 0 | Sweep to one end serving requests, then reverse | 53→37→14→**0**→65→67→98→122→124→183 | **236** |
| SCAN, moving toward 199 | Same, other direction | 53→65→…→183→**199**→37→14 | **331** |
| **C-SCAN**, moving toward 199 | Sweep to the end, jump back to cylinder 0 **without serving**, sweep again | 53→65→67→98→122→124→183→**199**→**0**→14→37 | **382** (183 if the return jump is not counted) |
| **LOOK**, moving toward 0 | Like SCAN but turns at the **last request**, not the disk end | 53→37→14→65→…→183 | **208** |
| LOOK, moving toward 199 | | 53→65→…→183→37→14 | **299** |
| **C-LOOK**, moving toward 199 | Like C-SCAN but goes only to the last request, then jumps to the lowest request | 53→65→…→183→14→37 | **322** (153 if the jump 183→14 is not counted) |

FCFS steps: 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2 = 640.
SSTF steps: 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236 (average 29.5 per request).

### SSTF ⭐ Asked in DSSSB
- **Advantage (official answer): average response time decreases**; total seek time falls and **throughput increases**.
- **Disadvantages**: **starvation** of far-away requests, **high variance of response time** (it favours some requests), and overhead of computing seek distances in advance.
- SSTF is a form of SJF scheduling; it is **not optimal** (here 53→37→14→65… gives 208).

**Choosing**: SSTF is common and natural; **SCAN and C-SCAN** perform better under **heavy load** (no starvation); **C-SCAN** gives a **more uniform waiting time**. Modern Linux uses mq-deadline, BFQ or none (for NVMe SSDs).

## 11. RAID
RAID = Redundant Array of Independent (Inexpensive) Disks: **striping** for speed, **mirroring/parity** for reliability.

| Level | Technique | Min disks | Usable capacity (N disks) | Survives |
|---|---|---|---|---|
| **RAID 0** | Block striping, **no redundancy** | 2 | N | 0 failures (fastest, least reliable) |
| **RAID 1** | **Mirroring** (shadowing) | 2 | N / 2 | 1 disk per mirror |
| RAID 2 / 3 | Bit-level ECC / byte-level dedicated parity | — | — | Obsolete |
| RAID 4 | Block striping, **dedicated** parity disk | 3 | N − 1 | 1 (parity disk is a bottleneck) |
| **RAID 5** | Block striping, **distributed parity** | 3 | N − 1 | 1 |
| **RAID 6** | Distributed **dual parity** (P + Q) | 4 | N − 2 | 2 |
| **RAID 10 (1+0)** | Stripe of mirrors | 4 | N / 2 | 1 per mirror pair |

Example with 2 TB disks: RAID 5 on 5 disks → **8 TB**; RAID 6 on 5 disks → **6 TB**; RAID 10 on 4 disks → **4 TB**; RAID 0 on 4 disks → 8 TB.

## 12. I/O systems
- **Hardware**: devices connect through a **port** or **bus** (PCIe, USB) to a **controller**; the controller has registers: *data-in, data-out, status, control*. Access by special I/O instructions or **memory-mapped I/O**.
- **Polling (busy waiting)**: the CPU repeatedly reads the device's busy bit — wastes CPU when the device is slow.
- **Interrupts**: the device raises the **interrupt-request line**; the CPU saves state and jumps to the **interrupt handler** through the **interrupt vector**. Maskable vs non-maskable interrupts.
- **DMA (Direct Memory Access)**: for large transfers. CPU writes a DMA command block (source, destination, count); the **DMA controller** moves the whole block between device and memory and **interrupts the CPU only when done**. It may "steal" memory cycles (**cycle stealing**). Avoids **programmed I/O** (byte-by-byte by the CPU).
- **Device drivers**: device-specific kernel modules that present a uniform interface to the kernel I/O subsystem (block, character, network devices).
- **Blocking** I/O suspends the process; **non-blocking** returns at once with whatever is available; **asynchronous** I/O returns at once and signals completion later.
- **Kernel I/O subsystem services**:
  - **I/O scheduling** — reorder requests (disk scheduling).
  - **Buffering** — memory area holding data **in transit** between two devices or a device and an application; copes with **speed mismatch**, **transfer-size mismatch**, and **copy semantics**. **Double buffering** decouples producer and consumer.
  - **Caching** — fast memory holding a **copy** of data (a buffer may hold the only copy).
  - **Spooling** (Simultaneous Peripheral Operations On-Line) — a buffer on disk holding output for a device such as a **printer** that cannot accept interleaved data streams; jobs are printed one at a time from the spool queue.
  - Device reservation, error handling, **I/O protection** (all I/O instructions are privileged).

## 13. Protection vs security
**Protection** is an *internal* problem: the mechanism for controlling the access of programs, processes or users to the resources defined by the computer system (access matrix, domains, ACLs, capability lists, principle of least privilege). **Security** is the wider problem of defending the system against *external and internal attacks* — viruses, worms, denial of service, identity theft — and needs protection plus user **authentication**, **encryption** and physical and human safeguards. In short: protection = "who may access what"; security = "keeping intruders and threats out".

---

## Exam traps
1. **Seek / reposition needs no actual I/O** — it only changes the file pointer. Reading, deleting and truncating all touch the disk.
2. Truncate keeps the file's **attributes**; delete removes the directory entry too.
3. Volume control block = **number of blocks, block size, free-block count/pointers**. Boot information = **boot control block**; unique identifier per file = **FCB/inode**.
4. Superblock (UFS) and MFT (NTFS) hold the volume control block — the inode is the FCB, not the VCB.
5. NTFS **does** support compression *and* encryption (EFS); FAT32 supports neither, and has no journaling or permissions.
6. Default Linux file system = **ext4**, not ext3 (ext3 added journaling; ext2 had none).
7. SSTF's **advantage** = lower average response time / higher throughput; **high variance** and **starvation** are *disadvantages* — do not choose them for "advantage".
8. SSTF is **not optimal**; SCAN/C-SCAN avoid starvation.
9. C-SCAN does not serve requests on the return sweep; whether the return jump is counted in head movement depends on the question — read it.
10. LOOK/C-LOOK turn at the **last request**, SCAN/C-SCAN go to the **disk end** (0 or 199).
11. In Silberschatz's bit vector **1 = free**; average rotational latency is **half** a rotation.
12. RAID 0 has **no** redundancy; RAID 5 loses one disk's capacity, RAID 6 two.

## One-liners for revision
1. File = named collection of related information on secondary storage.
2. The only human-readable attribute is the file **name**.
3. Identifier = unique number tag inside the file system.
4. Six basic file operations: create, write, read, reposition (seek), delete, truncate.
5. File seek = reposition within a file — no actual I/O ⭐.
6. Read and write share one current-file-position pointer.
7. Open-file data: file pointer, file-open count, disk location, access rights.
8. UNIX file descriptor = index into the open-file table; Windows calls it a file handle.
9. Shared lock ≈ reader lock; exclusive lock ≈ writer lock.
10. UNIX identifies some file types by a magic number.
11. Sequential access is based on the tape model; direct access on the disk model.
12. Two-level directory: MFD + one UFD per user.
13. Tree directory gives absolute and relative path names.
14. Acyclic-graph directory allows sharing; deletion uses reference counts.
15. General-graph directory needs garbage collection.
16. Mount point = directory where a file system is attached.
17. UNIX protection classes: owner, group, others (universe).
18. ACL = list of users with their allowed access for one file.
19. Boot control block = information to boot the OS from that volume.
20. Volume control block = blocks count, block size, free-block count and pointers ⭐.
21. VCB is the superblock in UFS and lives in the MFT in NTFS.
22. FCB = inode in UNIX; it holds permissions, dates, owner, size and block pointers.
23. Contiguous allocation suffers external fragmentation.
24. Linked allocation supports only efficient sequential access.
25. FAT = linked allocation with the chain kept in a table at the start of the volume.
26. Indexed allocation gives direct access without external fragmentation.
27. Inode: 12 direct + single + double + triple indirect pointers.
28. 4 KB blocks, 4 B pointers → max file ≈ 4 TB.
29. Free-space methods: bit vector, linked list, grouping, counting.
30. Journaling replays the log after a crash; fsck/chkdsk check consistency.
31. FAT32 maximum file size = 4 GB − 1 byte.
32. exFAT is meant for flash drives and SD cards.
33. NTFS: MFT, journaling, ACLs, compression, EFS encryption, quotas ⭐.
34. ext4 = default Linux file system; adds extents ⭐.
35. APFS replaced HFS+ on Apple devices; ISO 9660 is the CD-ROM file system.
36. Cylinder = all tracks at one arm position.
37. Access time = seek + rotational latency + transfer.
38. 7200 RPM → 8.33 ms per rotation, 4.17 ms average latency.
39. SSTF: average response time decreases ⭐; drawbacks starvation, high variance.
40. SCAN = elevator algorithm; C-SCAN gives more uniform waiting time.
41. Silberschatz queue from 53: FCFS 640, SSTF 236, SCAN (toward 0) 236.
42. RAID 5 = distributed parity, survives one disk failure.
43. DMA transfers a whole block and interrupts the CPU once at the end.
44. Spooling holds printer output on disk; a buffer handles speed mismatch.
45. Protection is internal access control; security also handles external threats.

## Quick self-check
1. Which file operation is also called file seek? — **Repositioning within a file; it needs no actual I/O.**
2. What does truncating a file keep? — **All its attributes; only the contents (length) are erased.**
3. Superblock is the UFS name of which structure? — **Volume control block.**
4. Where is the information to boot an OS from a volume? — **Boot control block.**
5. Which allocation method suffers from external fragmentation? — **Contiguous.**
6. Block 4 KB, pointer 4 B: how many pointers per index block, and max inode file size? — **1024; ≈ 4 TB.**
7. Queue 98, 183, 37, 122, 14, 124, 65, 67, head 53: SSTF head movement? — **236 cylinders.**
8. Same queue, FCFS? — **640 cylinders.**
9. Advantage of SSTF? — **Average response time decreases (throughput rises).**
10. Does NTFS support file compression? — **Yes (and EFS encryption, ACLs, journaling).**
11. Average rotational latency of a 6000 RPM disk? — **One rotation = 10 ms, so 5 ms.**
12. Which RAID level stripes with distributed dual parity? — **RAID 6.**
