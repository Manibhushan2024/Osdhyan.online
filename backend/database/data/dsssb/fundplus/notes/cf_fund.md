# Computer Fundamentals & Digital Logic

**In 30 seconds**
- Heaviest chapter: about 10 questions per paper. ⭐ = asked in DSSSB 2023–24.
- Numericals repeat: decimal↔binary with fractions, Gray code, 2's complement and arithmetic shift, cache tag bits, ripple-counter delay, cascaded counters, memory-unit conversions, BCD adder.
- Architecture is asked as much as digital logic: registers, ALU, bus, instruction formats, addressing modes, RISC vs CISC, DMA modes.
- Codes: ASCII 7-bit (128 chars), Unicode UTF-8/16/32, Gray = keep MSB then XOR neighbours.
- Software: compiler vs interpreter vs assembler, compiler phases (semantic analyser stores type info), flowchart connector = circle.
- Graphics block: random scan draws like a pencil, Cohen–Sutherland outcodes, Bézier curves, illumination parameters.
- A maths/statistics block also appears (dice, range, interpolation, finite differences, p-series); learn the quick-facts table.
- Four official keys in this chapter look wrong (input controls, arithmetic shift, p-series, interpolation smoothness); the textbook answer is given below, with the official key noted.

## 1. Generations, computer types, architecture

| Generation | Technology | Examples | Language |
|---|---|---|---|
| 1st (1940–56) | Vacuum tubes, magnetic drum | ENIAC, EDVAC, UNIVAC | Machine language |
| 2nd (1956–63) | Transistors, magnetic core | IBM 1401, IBM 7094 | Assembly, FORTRAN, COBOL |
| 3rd (1964–71) | Integrated circuits (SSI/MSI), OS | IBM System/360, PDP-8 | BASIC, Pascal, C |
| 4th (1971–now) | Microprocessor, LSI/VLSI | Intel 4004, IBM PC | C, C++, 4GLs, GUI |
| 5th (now/future) | ULSI, AI, parallel processing | Expert systems, PARAM | Prolog, LISP, natural language |

| Language generation ⭐ | Meaning | Examples |
|---|---|---|
| 1GL | Machine code (binary) | 0/1 opcodes |
| 2GL | Assembly (mnemonics), machine dependent | MOV, ADD |
| 3GL | High-level procedural / OOP | FORTRAN (Formula Translation ⭐), COBOL, C, Java, Python |
| 4GL | Non-procedural, "what not how" | SQL, report generators, MATLAB |
| 5GL ⭐ | Constraint/logic based, AI | **Prolog** ⭐, Mercury, OPS5 |

| Type | Key point | Example |
|---|---|---|
| Micro | Single-user, one microprocessor | PC, laptop |
| Mini | Multi-user, mid-size | PDP-11, VAX |
| Mainframe | Thousands of users, huge I/O | IBM z-series (banks, railways) |
| Super | Fastest, measured in FLOPS | PARAM (C-DAC), Cray, Frontier |

| Architecture ⭐ | Idea |
|---|---|
| Von Neumann | One memory and one bus for data and instructions; stored-program; "von Neumann bottleneck" |
| Harvard | Separate memories/buses for instructions and data; DSPs, microcontrollers |
| Instruction Set Architecture (ISA) | Programmer-visible instructions, registers, modes |
| Microarchitecture | How the ISA is implemented (pipelines, cache) |
| Software architecture | **NOT** a type of computer architecture ⭐ |

| Flynn class | Meaning | Example |
|---|---|---|
| SISD | Single instruction, single data | Classic uniprocessor |
| SIMD | One instruction on many data | Vector/array processor, GPU |
| MISD | Many instructions, one data | Rare; fault-tolerant systems |
| MIMD | Many instructions, many data | Multicore, clusters |

| RISC ⭐ | CISC |
|---|---|
| Few, simple instructions; one per cycle | Many (100–250) complex instructions |
| **Fixed-length, easily decoded** format ⭐ | Variable-length formats |
| Load/store: only LOAD/STORE touch memory | Instructions operate on memory operands |
| Hard-wired control, many registers | Microprogrammed control |
| Heavy pipelining; **most energy efficient** ⭐ (ARM) | Intel x86 |

## 2. Hardware and organisation

**CPU** = ALU + CU + registers. ALU ⭐ has the circuits for binary addition, logic and shift operations. CU decodes instructions and issues control signals.

| Register ⭐ | Holds |
|---|---|
| PC (program counter) | Address of the **next** instruction |
| IR (instruction register) ⭐ | Instruction **currently** being executed (used by CU) |
| MAR | Address of the memory location being accessed |
| MDR / MBR | Data read from / written to memory |
| AC (accumulator) ⭐ | ALU operand/result; size = word length (32-bit CPU → 4 bytes ⭐) |
| SP (stack pointer) | Top of stack |
| Flags / PSW | Carry, Zero, Sign, Overflow, Parity |
| Index register | Offset for indexed addressing |

| Bus ⭐ (a set of parallel lines ⭐) | Direction | Note |
|---|---|---|
| Data bus | Bidirectional | Width = word size |
| Address bus | Unidirectional (CPU → memory) | k lines address 2^k locations |
| Control bus | Both | Read/Write, interrupt, clock, bus request/grant |

| Instruction format ⭐ | Example | Note |
|---|---|---|
| Three-address | ADD R1, A, B | Short programs, long instructions |
| Two-address | ADD R1, A | Most common |
| One-address ⭐ | ADD A (AC ← AC + A) | **Implied accumulator** for all data manipulation |
| Zero-address | ADD (on stack) | Stack machine; PUSH/POP |

| Addressing mode ⭐ | Effective address / operand | Example |
|---|---|---|
| Implied | Operand implicit | CMA, stack ops |
| Immediate | Operand is in the instruction | MOV R1, #5 |
| Direct (absolute) | EA = address field | LOAD 500 |
| Indirect | EA = M[address field] | LOAD @500 |
| Register | Operand in a register | ADD R1, R2 |
| Register indirect ⭐ | Register holds the operand's address | **ADD R1, [R2]** ⭐ |
| Autoincrement/decrement | Register indirect, then R±1 | (R2)+ |
| Indexed | EA = address field + index register | Arrays |
| Base register | EA = base register + displacement | Relocation |
| Relative | EA = PC + offset | Branches |

**Instruction cycle**: Fetch (MAR ← PC; MDR ← M[MAR]; IR ← MDR; PC ← PC + 1) → Decode → Fetch operand (compute EA) → Execute → check interrupt.

| DMA mode ⭐ | How |
|---|---|
| Burst (block) transfer ⭐ | A block of many words sent in one **continuous burst**; CPU waits |
| Cycle stealing | DMA takes the bus for one word at a time, "stealing" a CPU cycle |
| Transparent | Transfers only when CPU is not using the bus; slowest, no CPU stall |

- DMA controller asks with Bus Request (BR), CPU replies with Bus Grant (BG). I/O methods: programmed I/O → interrupt-driven → DMA (fastest for bulk).
- Interrupts: hardware (maskable, non-maskable NMI), software (trap/INT), exceptions; CPU runs an ISR; priority by polling or daisy chain; vectored interrupts supply the ISR address.

| Boot item ⭐ | Fact |
|---|---|
| BIOS | Firmware in ROM/flash; term coined by Gary Kildall (not Babbage); UEFI is the modern replacement |
| POST | Power-On Self-Test run by BIOS at **start-up**, not shutdown |
| Bootstrap loader | Stored in ROM, not RAM; loads the OS |
| CMOS | Stores date, time and BIOS settings; **powered by the motherboard battery** ⭐ |

Ports: serial (COM), parallel (LPT, printers), USB, PS/2, VGA, HDMI, RJ-45 (Ethernet).

| Device ⭐ | Type | Use |
|---|---|---|
| OMR ⭐ | Input | Detects presence/absence of pencil/pen marks (OMR sheets) |
| OCR | Input | Printed text → editable text |
| MICR | Input | Magnetic-ink characters on cheques (E-13B) |
| Barcode / QR reader | Input | Product codes (UPC) |
| Light pen, digitizer, joystick | Input | Point on screen, trace drawings, games |
| VDU / monitor ⭐ | Output | Soft copy |
| Plotter | Output | Large engineering drawings (drum, flatbed) |
| Speaker, projector | Output | Sound, large display |

| Printers ⭐ | Examples | Note |
|---|---|---|
| Impact | **Dot matrix** ⭐, daisy wheel, line (drum/chain) | Noisy; carbon copies possible |
| Non-impact | Inkjet, laser, thermal, LED | Quiet, high quality; speed in PPM |

- Keyboard: **Insert toggles insert ↔ overwrite mode** ⭐; Caps/Num/Scroll Lock are toggle keys; Backspace deletes left, Delete deletes right.
- Monitors: CRT, LCD, LED, OLED, plasma (raster vs random scan in §8).

| Access method ⭐ | Media |
|---|---|
| Sequential only ⭐ | **Magnetic tape** |
| Direct (DASD) | Hard disk, CD, DVD |
| Random | RAM, ROM |

Disk access time = seek time + rotational latency + transfer time.

## 3. Memory

**Hierarchy** ⭐ (fast, costly, small → slow, cheap, large): registers → cache (L1 > L2 > L3) → main memory (RAM) → SSD/hard disk → optical/tape. Works because of locality of reference (temporal and spatial).

| SRAM | DRAM ⭐ |
|---|---|
| Bit in a flip-flop (4–6 transistors) | Bit in a **capacitor** ⭐ (+1 transistor) |
| No refresh ("static" ⭐: contents do not change by themselves) | Needs periodic refresh |
| Fast, costly, low density → cache | Slower, cheap, dense → main memory |

| ROM type ⭐ | Programmed | Erased |
|---|---|---|
| Mask ROM | At factory | Never |
| PROM | Once by user | Never |
| EPROM | By user | UV light, whole chip |
| EEPROM | By user | Electrically, byte-wise |
| Flash ⭐ | By user | Electrically, block-wise; **non-volatile RAM** (pen drive, SSD) |

| Cache mapping ⭐ | Address split | Note |
|---|---|---|
| Direct | Tag \| Line \| Word | Block j → line j mod (number of lines); cheapest; conflict misses |
| Fully associative | Tag \| Word | Any block in any line; costly comparators |
| k-way set-associative | Tag \| Set \| Word | Block j → set j mod (number of sets) |

Worked example ⭐: 4-way set-associative, 32 KB cache, block 1 KB, 8-bit word, 32 GB physical memory.
- Address = log2(32 GB = 2^35) = 35 bits; word/offset = log2(1 K) = 10 bits.
- Lines = 32 KB / 1 KB = 32; sets = 32 / 4 = 8 → set bits = 3.
- **Tag = 35 − 10 − 3 = 22 bits.**
- (Direct-mapped 64 KB cache, 16 B blocks, 32-bit address: offset 4, lines 4096 → 12 bits, tag 16.)
- Virtual memory: uses disk to give programs a larger logical address space; pages are mapped to frames by a page table (MMU, TLB).
- A memory with k address lines and m data lines holds 2^k × m bits.

| Unit ⭐ | Size |
|---|---|
| Bit, nibble, byte | 1 bit, 4 bits, 8 bits |
| KB | 1024 bytes (2^10) |
| MB, GB, TB | 2^20, 2^30, 2^40 bytes |
| PB, EB, ZB, YB | 2^50, 2^60, 2^70, 2^80 bytes |

Conversions ⭐: 5 KB = 10,240 nibbles ✓; 3 KB = 24,576 bits ✓; 2 KB = 4,096 nibbles ✓; **4 KB = 4,096 bytes, not 4,069** (the false statement).

## 4. Number systems and codes ⭐

| Conversion | Method |
|---|---|
| Decimal → base b (integer) | Divide by b; read remainders bottom-up |
| Decimal fraction → base b | Multiply by b; read integer parts top-down |
| Base b → decimal | Σ digit × b^position (negative powers after the point) |
| Binary ↔ octal / hex | Group 3 / 4 bits from the binary point |
| Octal ↔ hex | Go through binary |

| # | Worked example | Answer |
|---|---|---|
| 1 ⭐ | 10.25 → binary: 10 = 1010; 0.25×2 = 0.5 → 0, 0.5×2 = 1.0 → 1 | **1010.01** |
| 2 ⭐ | 111111₂ → decimal: 32+16+8+4+2+1 | **63** |
| 3 | 45 → binary, octal, hex | 101101, (55)₈, (2D)₁₆ |
| 4 | (734)₈ → 111 011 100 → decimal and hex | 476, (1DC)₁₆ |
| 5 | 0.8125 → binary: 1.625, 1.25, 0.5, 1.0 | 0.1101 |
| 6 | (3A.C)₁₆ → decimal: 3×16 + 10 + 12/16 | 58.75 |

- Binary addition: 1 + 1 = 10, 1 + 1 + 1 = 11. Subtraction: 0 − 1 = 1 borrow 1.
- 1's complement: invert all bits (01101 → 10010). 2's complement: invert and add 1 (00101100 → 11010100).
- A − B = A + 2's complement of B, discard end carry. 1's complement: add the end-around carry (9 − 5 → 00100).
- Example: 25 − 40 in 8 bits = 00011001 + 11011000 = 11110001 = −15.
- Overflow: only when two same-sign numbers give the opposite sign (100 + 50 in 8 bits → −106 pattern).

| n-bit range | 4-bit | 8-bit | General |
|---|---|---|---|
| Unsigned | 0 to 15 | 0 to 255 | 0 to 2^n − 1 |
| Sign-magnitude / 1's | −7 to +7 (two zeros) | −127 to +127 | ±(2^(n−1) − 1) |
| 2's complement | −8 to +7 (one zero) | −128 to +127 | −2^(n−1) to 2^(n−1) − 1 |

| Shift ⭐ | Fills | Effect |
|---|---|---|
| Logical left / right | 0 enters | Unsigned ×2 / ÷2 |
| Arithmetic left | 0 enters right | Signed ×2 (overflow if sign changes) |
| **Arithmetic right** ⭐ | **Sign bit copied** | **Signed ÷2**: 10100 (−12) → 11010 (−6) |

⭐ DSSSB asked "10100 (printed as 3's complement; read 2's) divided by 2": textbook answer **11010**; the official key 01010 is a logical shift (treats 10100 as unsigned 20).

| Code ⭐ | Fact | Example |
|---|---|---|
| BCD (8421) | Weighted; 1010–1111 invalid | 59 = 0101 1001 |
| BCD adder ⭐ | If sum > 9 or carry, **add 6 (0110)**; invalid inputs = 256 − 100 = **156** ⭐ | 7 + 8 = 1111 + 0110 = 1 0101 (15) |
| Excess-3 | BCD + 3; self-complementing | 47 = 0111 1010 |
| Gray ⭐ | Unit distance; K-maps, shaft encoders | Binary 1011 → Gray 1110 |
| ASCII ⭐ | 7-bit, 128 chars; 1 language, at most 2 ⭐ | 'A' 65, 'a' 97, '0' 48 |
| EBCDIC | 8-bit, IBM mainframes | — |
| ISCII | 8-bit Indian scripts | — |
| Unicode ⭐ | Unique number for every character of every language ⭐ | U+0000 to U+10FFFF |
| Parity | Even/odd count of 1s; detects 1-bit error | Hamming code corrects 1 bit |

- Binary → Gray: keep MSB, XOR each adjacent pair. Gray → binary: keep MSB, XOR previous binary bit with next Gray bit.
- ⭐ (743)₈ = 111 100 011 → Gray **100010010**.
- Unicode formats ⭐: **UTF-8** (8-bit units, 1–4 bytes, ASCII-compatible), UTF-16 (2 or 4 bytes), UTF-32 (fixed 4 bytes). "UTF-17/35/61" do not exist.

## 5. Boolean algebra, gates, K-maps

| Law | AND form | OR form |
|---|---|---|
| Commutative | AB = BA | A + B = B + A |
| Associative | (AB)C = A(BC) | (A + B) + C = A + (B + C) |
| Distributive ⭐ | A(B + C) = AB + AC | A + BC = (A + B)(A + C) |
| Identity / null | A·1 = A, A·0 = 0 | A + 0 = A, A + 1 = 1 |
| Idempotent / complement | AA = A, AA' = 0 | A + A = A, A + A' = 1 |
| De Morgan | (AB)' = A' + B' | (A + B)' = A'B' |
| Absorption | A(A + B) = A | A + AB = A; A + A'B = A + B |
| Consensus | (A+B)(A'+C)(B+C) = (A+B)(A'+C) | AB + A'C + BC = AB + A'C |

- ⭐ F = xy + x'z by distributive law (POS) = **(x' + y)(x + z)(y + z)**; the (y + z) term is the consensus, so (x' + y)(x + z) alone is also equal.
- Duality: swap AND↔OR and 0↔1. Functions of n variables: 2^(2^n).
- SOP = sum of minterms Σm (1-rows); POS = product of maxterms ΠM (0-rows). Minterm m5 (3 var) = xy'z; maxterm M5 = x' + y + z'.
- XOR ⭐: A⊕B = A'B + AB'; A⊕0 = A; A⊕1 = A'; A⊕A = 0; (A⊕B)' = A'⊕B = A⊙B. Multi-input XOR = 1 for an odd number of 1s.
- ⭐ (A⊕B⊕C)' = **A⊕B⊙C** (one XNOR flips the result). Chained 2-input XNORs: A⊙B⊙C = A⊕B⊕C.

| Gate ⭐ | Symbol described | Expression | 00 | 01 | 10 | 11 |
|---|---|---|---|---|---|---|
| AND ⭐ | D-shape | A·B (multiplication sign ⭐) | 0 | 0 | 0 | 1 |
| OR | Curved shield | A + B | 0 | 1 | 1 | 1 |
| NOT | Triangle + bubble | A' | single input: 0→1, 1→0 | | | |
| NAND ⭐ | AND + bubble | (AB)' | 1 | 1 | 1 | 0 |
| NOR | OR + bubble | (A + B)' | 1 | 0 | 0 | 0 |
| XOR | OR with extra curve | A⊕B | 0 | 1 | 1 | 0 |
| XNOR | XOR + bubble | A⊙B | 1 | 0 | 0 | 1 |

| Using NAND only ⭐ | Gates | Using NOR only | Gates |
|---|---|---|---|
| NOT = (AA)' | 1 | NOT | 1 |
| AND = NAND then NOT | 2 | OR | 2 |
| OR = (A'B')' | 3 | AND | 3 |
| XOR | 4 | XOR | 5 |

**K-map ⭐ rules**: 2^n cells (4, 8, 16) in Gray order 00, 01, 11, 10; group 1s in 1, 2, 4, 8, 16 cells, as large and as few as possible; groups wrap around edges and corners; a group of 2^k cells removes k variables; don't-cares (X) are used only if they enlarge a group.

| # | Function | Groups | Result |
|---|---|---|---|
| 1 ⭐ | F(x,y,z) = Σ(0,2,4,5,6) | Quad m0,2,4,6 (z = 0); pair m4,5 | **F = z' + xy'** |
| 2 | F(A,B,C,D) = Σ(0,1,2,4,5,6,8,9,12,13,14) | Octet C'; quads A'D' (0,2,4,6), BD' (4,6,12,14) | F = C' + A'D' + BD' |
| 3 | F = Σ(1,3,7,11,15) + d(0,2,5) | Quad CD (3,7,11,15); quad A'B' (0,1,2,3 using d0, d2) | F = CD + A'B' |

Four corners of a 4-variable map (m0, m2, m8, m10) = B'D'.

## 6. Combinational and sequential circuits

| Circuit | Equations / facts |
|---|---|
| Half adder | S = A⊕B, C = AB |
| Full adder | S = A⊕B⊕Cin, Cout = AB + Cin(A⊕B); 2 half adders + OR |
| Half subtractor | D = A⊕B, Borrow = A'B |
| Full subtractor | D = A⊕B⊕Bin, Bout = A'B + (A⊕B)'Bin |
| MUX 2^n:1 | Data selector; n select lines (8:1 → 3) |
| DEMUX 1:2^n | Data distributor |
| Decoder n:2^n | 3-to-8; enable input makes it a DEMUX |
| Encoder 2^n:n | Priority encoder gives highest active input |
| Comparator | A>B, A=B (XNOR), A<B |

| Flip-flop | Inputs → Q(next) | Characteristic equation |
|---|---|---|
| SR | 00 Q, 01 0, 10 1, 11 invalid | Q+ = S + R'Q (SR = 0) |
| JK | 00 Q, 01 0, 10 1, **11 Q' (toggle)** | Q+ = JQ' + K'Q |
| D | 0 → 0, 1 → 1 | Q+ = D (delay, registers) |
| T | 0 → Q, 1 → Q' | Q+ = T⊕Q (÷2 frequency) |

- Latch = level-triggered, flip-flop = edge-triggered; each stores 1 bit.
- Race-around: level-triggered JK with J = K = 1 toggles repeatedly while the clock is high; cured by **master–slave** (master on high, slave on low) or edge triggering.
- Counter ⭐: stores/displays how many times an event has occurred, relative to a clock. Mod-N needs ⌈log2 N⌉ flip-flops; output frequency = f/N.
- Ripple (asynchronous) ⭐: only FF0 gets the clock; delays add (n × tpd); slower, glitches. Synchronous: common clock; delay = one FF.
- Ring counter: n states; Johnson: 2n states; binary: 2^n (4 FFs → 4, 8, 16).

| Counter numerical ⭐ | Working | Answer |
|---|---|---|
| 10-bit ripple at 10 MHz skips a count when? | T = 100 ns; 10 × tpd = 100 ns | **tpd = 10 ns** |
| Mod-6 cascaded with mod-8 | 6 × 8 | **Mod-48** (needs 6 FFs) |
| 4-bit ripple, tpd 25 ns, fmax? | 1 / (4 × 25 ns) | 10 MHz |
| 1 MHz through two decade counters | 1 MHz / 100 | 10 kHz |

| Register | In → out | Note |
|---|---|---|
| SISO | Serial → serial | Delay line |
| SIPO | Serial → parallel | Serial-to-parallel conversion |
| PISO | Parallel → serial | Transmission |
| PIPO | Parallel → parallel | Fastest; storage |

Shift registers: n-bit serial load takes n clocks; shift left = ×2, shift right = ÷2; universal shift register does all four.

## 7. Software ⭐

| System software ⭐ | Application software |
|---|---|
| Runs and controls the hardware; provides instructions for computer operations ⭐ | Solves user tasks |
| OS, compilers, assemblers, linkers, loaders, utilities, device drivers | Word processors, spreadsheets, games, payroll |
| **Written in low-level language** (official key; "written in high-level" marked NOT true ⭐) | Written in high-level language |

- Software package ⭐ = a set of programs **with necessary documentation**. Firmware = software in ROM. Freeware, shareware, open source (GPL).

| Translator ⭐ | Input → output | Note |
|---|---|---|
| Compiler ⭐ | Whole source → object/target code | Fast execution; errors listed after full scan (C, C++) |
| Interpreter | Line by line, no object file | Stops at first error (BASIC, Python) |
| Assembler ⭐ | Assembly → machine code | Assembly is **machine dependent** ⭐ |
| Linker | Object files + libraries → executable | Resolves external references |
| Loader | Executable → memory | Relocation, starts execution |
| Cross-compiler | Code for another machine | Embedded systems |

| Compiler phase ⭐ | Output |
|---|---|
| Lexical analysis (scanner) | Tokens; removes spaces/comments (finite automata) |
| Syntax analysis (parser) | Parse/syntax tree (context-free grammar) |
| Semantic analysis ⭐ | Type checking; **gathers type info into syntax tree/symbol table** ⭐ |
| Intermediate code generation | Three-address code |
| Code optimisation | Faster/smaller IR |
| Code generation | Target machine code |

Symbol table manager and error handler serve all phases; front end = first four, back end = last two.

| Flowchart symbol ⭐ | Shape |
|---|---|
| Start/Stop (terminal) | Oval / rounded rectangle |
| Process | Rectangle |
| Decision | Diamond (rhombus) |
| Input/Output | Parallelogram |
| On-page connector ⭐ (links parts of program) | **Small circle** |
| Off-page connector | Pentagon (home plate) |
| Flow line | Arrow |
| Predefined process | Rectangle with double vertical sides |

- Flowchart ⭐ = graphical representation of an algorithm; algorithm = finite, definite steps; pseudocode = English-like steps.
- Input controls ⭐ (data validation): range, type, presence, length, format checks, check digit, double-entry verification. Textbook answer to "ensure data is correctly entered" = **input controls**; the official key said "Keyboards".

## 8. Computer graphics ⭐

| Raster scan | Random scan ⭐ |
|---|---|
| Beam sweeps row by row (like TV) | Beam moves **like a pencil**, drawing lines directly ⭐ |
| Frame (refresh) buffer stores pixel intensities | Display file/list stores line commands |
| Realistic shading/fill; jaggies (aliasing) | Smooth lines; poor fill; costlier |

- Pixel = smallest picture element; resolution = pixels (1024 × 768); frame buffer = resolution × bits per pixel (1024 × 768 × 8 bits = 768 KB); 24-bit colour = 16.7 million colours.
- Line/circle drawing (NOT clipping): DDA, Bresenham (integer only), midpoint circle.
- 2-D transformations ⭐: translation, scaling, rotation [cosθ −sinθ; sinθ cosθ], reflection, shear; homogeneous coordinates use 3 × 3 matrices; composite = matrix product; **animation needs transformation operations** ⭐.
- Projections ⭐: parallel (projectors parallel; orthographic front/top/side, isometric; oblique cavalier/cabinet; true size) vs perspective (projectors meet at centre of projection; 1/2/3 vanishing points; realistic, foreshortening). DSSSB key: "orthogonal projection and horizontal view" cannot be framed together.
- Clipping algorithms ⭐: line – Cohen–Sutherland, **Liang–Barsky** ⭐, Cyrus–Beck, midpoint subdivision; polygon – Sutherland–Hodgman, Weiler–Atherton.
- Cohen–Sutherland ⭐: 4-bit outcode (Top, Bottom, Right, Left) for 9 regions. Both codes 0000 → fully inside, accept. Codes AND ≠ 0000 (share an outside bit) → reject. Otherwise the line **intersects** the window → partially visible → clip ⭐.
- Curves ⭐: spline = piecewise polynomial; **Bézier** ⭐ from control points (Bernstein polynomials; passes through first and last point; n points → degree n − 1; global control); B-spline gives local control.
- Illumination ⭐ depends on light source, surface and observer position — **not on the rendering algorithm**. Ambient + diffuse (Lambert's cosine law) + specular (Phong). Shading: flat, Gouraud (interpolate intensity), Phong (interpolate normals). Hidden surfaces: Z-buffer, painter's algorithm.
- Virtual reality ⭐ = computer-generated interactive simulation of real-world activity (HMD, data glove); AR overlays graphics on the real view.

## 9. Maths & statistics quick facts DSSSB has asked

| Item ⭐ | Fact |
|---|---|
| Two dice | 36 outcomes; sum 5 or 9 has 8 → P(neither) = 28/36 = **7/9** |
| Classical probability | P = favourable / total equally likely; given by **Laplace** |
| Bayesian probability | Degree of belief, updated by rules (Bayes' theorem) |
| Discrete distributions | Binomial, **Poisson**, geometric; continuous: normal (Gaussian), exponential, log-normal, Rayleigh |
| Mean, median, mode | Average; middle value; most frequent |
| Sum of deviations | Zero only about the **arithmetic mean** |
| Range | Max − min: 101 − 6 = **95** |
| Descriptive vs inferential | Summarise data vs **predict/generalise from a sample** ⭐ |
| Interpolation | Estimating y for x inside x0…xn; based on curve fitting |
| Equal intervals | Newton forward (start of table), Newton backward (end), Gauss (middle) |
| Unequal intervals ⭐ | **Newton divided difference**, Lagrange |
| Lagrange ⭐ (1,1), (3,27), (4,64) | 8x² − 19x + 12 |
| Gaussian process | Nonlinear interpolation (kriging) |
| Operators ⭐ | Δf = f(x+h) − f(x); ∇f = f(x) − f(x−h); Ef = f(x+h); Δ = E − 1, ∇ = 1 − E⁻¹ |
| Δⁿe^(ax+b) | (e^(ah) − 1)ⁿ e^(ax+b) |
| Averaging operator | μ² = 1 + δ²/4 = (δ² + 4)/4 |
| p-series Σ1/nᵖ ⭐ | Converges only if p > 1; Σ1/n^(2/3) diverges (official key said convergent) |
| Cube of side x | Volume x³, surface area 6x² |
| Tangent ⭐ | Radius ⟂ tangent: AO = √(40² + 150²) = 155.2 mm |
| Others asked | Tetrahedron volume abc/6; Euler theorem (degree 0) → 0; dy/dx = e^(x+y) → e^x + e^(−y) = c; quadratics solved by factorisation, completing square, formula (not "convergence") |

Off-syllabus physics also appeared (SHM spring, photoelectric effect, double refraction, CO₂ laser vibrational transitions, polarisation, ground-state lifetime, LED band gap, heat units calorie/BTU/joule); do not spend time on them.

## Exam traps
1. Arithmetic right shift copies the sign bit (11010); a logical shift inserts 0 (01010).
2. One-address instructions use the implied accumulator; zero-address uses a stack.
3. ADD R1, [R2] is register indirect, not register mode.
4. Cache tag = address bits − set (or line) bits − word bits; for fully associative there are no set bits.
5. Ripple-counter delay is per flip-flop: total n × tpd must stay below the clock period (100 ns ÷ 10 = 10 ns, not 100 ns).
6. Cascaded counters multiply (6 × 8 = 48), they do not add (14).
7. 4 KB = 4,096 bytes; watch digit swaps like 4,069.
8. Random scan draws like a pencil; raster scans rows. DDA/Bresenham draw lines, they do not clip.
9. Prolog is 5GL; Java and Python are 3GL.
10. Dot matrix is impact; laser, inkjet and thermal are non-impact.

## One-liners for revision
1. Integrated circuits mark the 3rd generation; microprocessors the 4th.
2. FORTRAN = Formula Translation.
3. Software architecture is not a type of computer architecture.
4. RISC: fixed-length, easily decoded instructions; most energy efficient.
5. ALU performs binary addition and shift operations.
6. IR holds the instruction currently being executed.
7. PC holds the address of the next instruction.
8. Accumulator size = word length (4 bytes on a 32-bit CPU).
9. A bus is a set of parallel lines.
10. Address bus is unidirectional; data bus is bidirectional.
11. DMA burst mode sends a block in one continuous burst.
12. Cycle stealing transfers one word per stolen cycle.
13. CMOS is powered by the motherboard battery.
14. POST runs at power-on.
15. OMR reads pencil/pen marks; MICR reads cheques.
16. Magnetic tape is sequential-access only.
17. Insert key toggles insert and overwrite modes.
18. DRAM stores a bit in a capacitor; SRAM in a flip-flop.
19. Flash memory is non-volatile RAM.
20. 1 KB = 1024 bytes = 2048 nibbles.
21. 10.25 = 1010.01₂; 111111₂ = 63.
22. (743)₈ in Gray = 100010010.
23. 8-bit 2's complement range is −128 to +127.
24. BCD adder adds 6 when sum > 9; 156 invalid input combinations.
25. ASCII is 7-bit with 128 characters; 'A' = 65, 'a' = 97, '0' = 48.
26. UTF-8 uses 8-bit code units (1–4 bytes).
27. Unicode gives every character of every language a unique number.
28. NAND = (xy)'; NAND and NOR are universal.
29. AND output is 1 only when both inputs are 1; its symbol is the multiplication dot.
30. (A⊕B⊕C)' = A⊕B⊙C.
31. xy + x'z = (x' + y)(x + z)(y + z).
32. Σ(0,2,4,5,6) simplifies to z' + xy'.
33. JK with J = K = 1 toggles; master–slave removes race-around.
34. Mod-N counter needs ⌈log2 N⌉ flip-flops.
35. Compiler translates the whole source into object code.
36. Semantic analyser stores type information in the syntax tree/symbol table.
37. Flowchart connector is a circle; decision is a diamond.
38. Liang–Barsky is a clipping algorithm.
39. Bézier curves are built from control points.
40. Newton divided difference/Lagrange handle unequal intervals.

## Quick self-check
1. 4-way set-associative, 32 KB cache, 1 KB blocks, 32 GB memory: tag bits? **22**
2. Decimal 10.25 in binary? **1010.01**
3. 5-bit 2's complement 10100 divided by 2 (arithmetic shift)? **11010 (−12 → −6)**
4. 10-bit ripple counter at 10 MHz: minimum tpd that skips a count? **10 ns**
5. Mod-6 and mod-8 in cascade? **Mod-48**
6. Instruction format with an implied accumulator? **One-address**
7. Mode where a register holds the operand's address? **Register indirect**
8. Compiler phase that type-checks? **Semantic analysis**
9. Storage that supports only sequential access? **Magnetic tape**
10. Cohen–Sutherland: both outcodes 0000 means? **Line fully inside; accept**
