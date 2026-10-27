# Fundamentals, SE, Web, IT & Teaching — Fast Revision Sheet

## How to use this sheet
- Pass 1 (60 min): read every table once and say the ⭐ rows aloud. ⭐ = asked in DSSSB TGT CS 2023–24 (238 questions: FUND 91, IT 65, TEACH 40, WEB 30, SE 12).
- Pass 2 (20 min): Top 30, Section 7 (disputed keys) and the Last 15 traps.
- Pass 3 (10 min): cover the right column of the full-forms table and recall it.

## Top 30 facts DSSSB asks again and again

| # | Fact | Tag |
|---|---|---|
| 1 | Unicode gives every character of every language a number; UTF-8 uses 8-bit units; ASCII is 7-bit, 128 characters, 1 (at most 2) languages ⭐ | FUND |
| 2 | Register indirect: the register holds the operand's address, e.g. ADD R1, [R2] ⭐ | FUND |
| 3 | RISC: fixed-length, easily decoded instructions; most energy-efficient ⭐ | FUND |
| 4 | IR holds the current instruction; ALU does addition and shifts; accumulator = word length (4 bytes on 32-bit) ⭐ | FUND |
| 5 | One-address instructions use an implied accumulator; DMA burst mode sends a whole block at once ⭐ | FUND |
| 6 | DRAM stores a bit in a capacitor; SRAM is "static"; flash = non-volatile RAM ⭐ | FUND |
| 7 | 4-way, 32 KB cache, 1 KB blocks, 32 GB memory → tag 22 bits ⭐ | FUND |
| 8 | Mod-6 + mod-8 in cascade = mod-48; 10-bit ripple counter at 10 MHz skips at tpd 10 ns ⭐ | FUND |
| 9 | 10.25 = 1010.01; 111111₂ = 63; (743)₈ in Gray = 100010010 ⭐ | FUND |
| 10 | BCD adder adds 0110 when sum > 9; 156 invalid input combinations ⭐ | FUND |
| 11 | Unequal intervals → Newton divided difference (or Lagrange); Poisson is discrete ⭐ | FUND |
| 12 | Random scan draws like a pencil; Liang–Barsky clips; Bézier uses control points ⭐ | FUND |
| 13 | Flowchart = graphical algorithm; connector = circle; Prolog = 5GL ⭐ | FUND |
| 14 | Linear (waterfall) = oldest, cannot handle changing requirements; low cost, long duration, high risk ⭐ | SE |
| 15 | Coupling lower, cohesion higher; design: system → architectural → detailed ⭐ | SE |
| 16 | Recovery testing forces failure; ISO 9126 efficiency = time and resource behaviour ⭐ | SE |
| 17 | href makes a link; VLINK = visited; HR has NOSHADE (no SHADE); `_top` = full window ⭐ | WEB |
| 18 | External CSS = `<link rel="stylesheet" href="style.css">`; `filter: grayscale(100%)`; Sass ⭐ | WEB |
| 19 | XML names never start with "xml" or a digit; external DTD `<!DOCTYPE root SYSTEM "file">`; DOM = tree ⭐ | WEB |
| 20 | ASP.NET control needs `runat="server"`; a servlet runs inside a container; ADO.NET has no "reachability" ⭐ | WEB |
| 21 | JavaScript = front end; PHP is NOT a front-end tool; the browser is the universal database front end ⭐ | WEB |
| 22 | Strategic information = long-term policy; DSS improves decision-making; OAS = word processing, e-mail, e-filing ⭐ | IT |
| 23 | KM = create, gather, store, transfer, apply; refining adds value; shared experience → tacit; in-house = lowest cost ⭐ | IT |
| 24 | Sole proprietorship is most common; public company 7, private 2, OPC 1; company = limited liability ⭐ | IT |
| 25 | Elasticity = degree of response; perfectly elastic = infinite change; demand = effective desire ⭐ | IT |
| 26 | OLX = C2C; subscription = fixed periodic fee; packing/shipping = delivery/fulfilment ⭐ | IT |
| 27 | IPR goes to the creator for a certain period; DPDP child = under 18; e-waste flows to India; IoT challenge = security ⭐ | IT |
| 28 | Piaget: pre-operational 2–7; propositional thinking = formal; horizontal decalage; play needs no toys ⭐ | TEACH |
| 29 | Project method: pupils set the aim and plan; heuristic = Armstrong; Kolb = experiential; peer assessment = AfL ⭐ | TEACH |
| 30 | DPEP inclusive 1997; Women's Policy 2001; 71st Amendment added Nepali; IPC: child below 7; ICDS: under 6 ⭐ | TEACH |

## 2. Fundamentals & Digital Logic [FUND]

### Generations

| Gen | Technology | Examples | Language |
|---|---|---|---|
| 1st (1940–56) | Vacuum tubes, magnetic drum | ENIAC, EDVAC, UNIVAC | Machine |
| 2nd (1956–63) | Transistors, magnetic core | IBM 1401, 7094 | Assembly, FORTRAN, COBOL |
| 3rd (1964–71) | ICs (SSI/MSI), OS | IBM System/360, PDP-8 | BASIC, Pascal, C |
| 4th (1971–) | Microprocessor, LSI/VLSI | Intel 4004, IBM PC | C, C++, 4GL, GUI |
| 5th | ULSI, AI, parallel | Expert systems, PARAM | Prolog, LISP |

| Language gen ⭐ | Meaning | Example |
|---|---|---|
| 1GL | Machine code | 0/1 opcodes |
| 2GL | Assembly; machine dependent ⭐ | MOV, ADD |
| 3GL | High-level | FORTRAN = Formula Translation ⭐, C, Java, Python |
| 4GL | Non-procedural, "what not how" | SQL, report generators |
| 5GL ⭐ | Logic/constraint, AI | Prolog ⭐, Mercury, OPS5 |

### Architecture

| Item | Fact |
|---|---|
| Types ⭐ | Von Neumann (one memory/bus), Harvard (separate), ISA, microarchitecture; software architecture is NOT one ⭐ |
| Flynn | SISD; SIMD (GPU, vector); MISD (rare); MIMD (multicore) |
| CPU | ALU ⭐ (addition, logic, shift) + CU (decodes, issues control signals) + registers |
| Bus ⭐ | A set of parallel lines ⭐; data bus bidirectional; address bus unidirectional (k lines → 2^k locations); control bus both |

| Register ⭐ | Holds |
|---|---|
| PC | Address of the next instruction |
| IR ⭐ | Instruction now being executed (used by CU) |
| MAR / MDR | Address / data of the memory access |
| AC ⭐ | ALU operand and result; size = word length (32-bit → 4 bytes ⭐) |
| SP / PSW / index | Stack top / flags (C, Z, S, O, P) / array offset |

| Format ⭐ | Example |
|---|---|
| Three-address | ADD R1, A, B |
| Two-address | ADD R1, A (commonest) |
| One-address ⭐ | ADD A — implied accumulator ⭐ |
| Zero-address | ADD on a stack (PUSH/POP) |

| Addressing mode ⭐ | Operand / effective address |
|---|---|
| Implied | Implicit (CMA, stack ops) |
| Immediate | In the instruction (MOV R1, #5) |
| Direct | EA = address field |
| Indirect | EA = M[address field] |
| Register | In a register (ADD R1, R2) |
| Register indirect ⭐ | Register holds the address — ADD R1, [R2] ⭐ |
| Autoincrement | Register indirect, then R ± 1 |
| Indexed / base / relative | Field + index register / base + displacement / PC + offset |

| RISC ⭐ | CISC |
|---|---|
| Few simple instructions, one per cycle | 100–250 complex instructions |
| Fixed-length, easily decoded ⭐ | Variable-length |
| Load/store only; many registers; hard-wired | Memory operands; microprogrammed |
| Heavy pipelining; most energy-efficient ⭐ (ARM) | Intel x86 |

| DMA mode ⭐ | How |
|---|---|
| Burst (block) ⭐ | Whole block in one continuous burst; CPU waits |
| Cycle stealing | One word per stolen bus cycle |
| Transparent | Only when the CPU is off the bus; slowest |

- DMA handshake: BR → BG. I/O speed: programmed < interrupt-driven < DMA.
- Boot ⭐: BIOS in ROM/flash (term by Gary Kildall); POST at power-on; bootstrap loader in ROM; CMOS powered by the motherboard battery ⭐.
- Devices ⭐: OMR reads pencil marks ⭐; OCR printed text; MICR cheques; VDU = output ⭐; dot matrix = impact ⭐ (laser, inkjet, thermal = non-impact).
- Insert key toggles insert/overwrite ⭐; magnetic tape = sequential only ⭐; disk access = seek + rotational latency + transfer.

### Memory
Hierarchy ⭐: registers → cache (L1, L2, L3) → RAM → SSD/HDD → optical/tape. Speed and cost fall, size rises; works by locality of reference.

| Memory ⭐ | Bit stored in / programmed | Key fact |
|---|---|---|
| SRAM | Flip-flop (4–6 transistors) | No refresh, "static" ⭐; fast → cache |
| DRAM ⭐ | Capacitor ⭐ + 1 transistor | Needs refresh; dense → main memory |
| Mask ROM / PROM | Factory / once by user | Never erased |
| EPROM | User | UV light, whole chip |
| EEPROM | User | Electrically, byte-wise |
| Flash ⭐ | User | Electrically, block-wise; non-volatile RAM ⭐ (pen drive, SSD) |

| Cache mapping ⭐ | Address split | Rule |
|---|---|---|
| Direct | Tag, Line, Word | Block j → line (j mod lines) |
| Fully associative | Tag, Word | Any line; no set bits |
| k-way set-associative | Tag, Set, Word | Sets = lines ÷ k; block j → set (j mod sets) |

- **Tag = address bits − set (or line) bits − word bits.** ⭐ 32 GB → 35 bits; 1 KB block → 10; 32 lines ÷ 4 = 8 sets → 3; tag = **22**.
- k address lines and m data lines → 2^k × m bits.

| Unit ⭐ | Value |
|---|---|
| Nibble / byte | 4 / 8 bits |
| KB, MB, GB, TB | 2^10, 2^20, 2^30, 2^40 bytes |
| PB, EB, ZB, YB | 2^50, 2^60, 2^70, 2^80 bytes |
| Checks ⭐ | 4 KB = 4,096 bytes (not 4,069 ⭐); 3 KB = 24,576 bits; 5 KB = 10,240 nibbles |

### Number systems and 2's complement ⭐

| Task | Method |
|---|---|
| Decimal integer → base b | Divide by b; remainders bottom-up |
| Decimal fraction → base b | Multiply by b; integer parts top-down |
| Base b → decimal | Σ digit × b^position |
| Binary ↔ octal / hex | Group 3 / 4 bits from the point |
| Examples ⭐ | 10.25 = 1010.01 ⭐; 111111 = 63 ⭐; 45 = 101101 = (55)₈ = (2D)₁₆; (3A.C)₁₆ = 58.75 |

- 1's complement = invert all bits; 2's complement = invert + 1.
- A − B = A + 2's complement of B, discard end carry (1's complement: add end-around carry).
- 8-bit ranges: unsigned 0 to 255; sign-magnitude/1's −127 to +127 (two zeros); 2's −128 to +127. General: −2^(n−1) to 2^(n−1) − 1.
- Overflow only when two same-sign numbers give the opposite sign.
- Arithmetic right shift copies the sign bit: 10100 (−12) → 11010 (−6) ⭐. Logical shift inserts 0.

### Codes

| Code ⭐ | Fact |
|---|---|
| BCD (8421) | 1010–1111 invalid; 59 = 0101 1001 |
| BCD adder ⭐ | Sum > 9 or carry → add 0110; invalid inputs 256 − 100 = 156 ⭐ |
| Excess-3 | BCD + 3; self-complementing; 47 = 0111 1010 |
| Gray ⭐ | Keep MSB, XOR neighbours; 1011 → 1110; (743)₈ → 100010010 ⭐ |
| ASCII ⭐ | 7-bit, 128 characters; 1 language, at most 2 ⭐; space 32, '0' 48, 'A' 65, 'a' 97 |
| EBCDIC / ISCII | 8-bit IBM mainframe / 8-bit Indian scripts |
| Unicode ⭐ | Every character of every language ⭐; U+0000 to U+10FFFF |
| Unicode formats ⭐ | UTF-8 ⭐ (8-bit units, 1–4 bytes, ASCII-compatible), UTF-16 (2 or 4 bytes), UTF-32 (4 bytes); UTF-17/35/61 do not exist |
| Parity / Hamming | Detects / corrects a 1-bit error |

### Boolean algebra, gates, K-maps

| Law | Form |
|---|---|
| Distributive ⭐ | A(B + C) = AB + AC; A + BC = (A + B)(A + C) |
| Identity / null | A·1 = A, A + 0 = A; A·0 = 0, A + 1 = 1 |
| Idempotent / complement | AA = A, A + A = A; AA' = 0, A + A' = 1 |
| De Morgan | (AB)' = A' + B'; (A + B)' = A'B' |
| Absorption | A + AB = A; A(A + B) = A; A + A'B = A + B |
| Consensus | AB + A'C + BC = AB + A'C |
| XOR ⭐ | A⊕0 = A; A⊕1 = A'; A⊕A = 0; (A⊕B⊕C)' = A⊕B⊙C ⭐ |

- ⭐ xy + x'z = (x' + y)(x + z)(y + z). Functions of n variables = 2^(2^n).

| Gate ⭐ | Expression | 00 | 01 | 10 | 11 |
|---|---|---|---|---|---|
| AND ⭐ | A·B (multiplication dot) | 0 | 0 | 0 | 1 |
| OR | A + B | 0 | 1 | 1 | 1 |
| NAND ⭐ | (AB)' | 1 | 1 | 1 | 0 |
| NOR | (A + B)' | 1 | 0 | 0 | 0 |
| XOR | A⊕B | 0 | 1 | 1 | 0 |
| XNOR | A⊙B | 1 | 0 | 0 | 1 |

- NAND and NOR are universal. NAND-only: NOT 1, AND 2, OR 3, XOR 4 gates. NOR-only: NOT 1, OR 2, AND 3, XOR 5.
- K-map ⭐: 2^n cells in Gray order 00, 01, 11, 10; groups of 1, 2, 4, 8, 16 — as large and as few as possible; wrap edges and corners; 2^k cells remove k variables; use don't-cares only if they enlarge a group.
- ⭐ Σ(0,2,4,5,6) = z' + xy'. Four corners of a 4-variable map = B'D'.

### Circuits, flip-flops, counters

| Circuit | Equation |
|---|---|
| Half adder | S = A⊕B, C = AB |
| Full adder | S = A⊕B⊕Cin; Cout = AB + Cin(A⊕B) |
| MUX 2^n:1 | n select lines (8:1 → 3) |
| Decoder n:2^n | With enable it works as a DEMUX |

| Flip-flop | Inputs → Q(next) | Equation |
|---|---|---|
| SR | 00 Q, 01 0, 10 1, 11 invalid | Q+ = S + R'Q |
| JK | 00 Q, 01 0, 10 1, 11 Q' (toggle) | Q+ = JQ' + K'Q |
| D | 0 → 0, 1 → 1 | Q+ = D |
| T | 0 → Q, 1 → Q' | Q+ = T⊕Q |

- Race-around (level JK, J = K = 1) is cured by master–slave or edge triggering.

| Counter ⭐ | Formula |
|---|---|
| Definition ⭐ | Stores how many times an event occurred, relative to a clock |
| Mod-N | ⌈log2 N⌉ flip-flops; output frequency f/N |
| Ripple ⭐ | n × tpd must be below the clock period: 10 bits, 100 ns → tpd 10 ns ⭐; fmax = 1/(n × tpd) (4 × 25 ns → 10 MHz) |
| Cascaded ⭐ | Moduli multiply: 6 × 8 = mod-48 ⭐ (6 FFs); two decade counters divide by 100 |
| Ring / Johnson / binary | n / 2n / 2^n states |

### Software, translators, flowcharts

| Item ⭐ | Fact |
|---|---|
| System software ⭐ | Controls hardware and provides instructions for computer operations ⭐; official key: written in low-level language ("high-level" = NOT true) |
| Software package ⭐ | Programs plus necessary documentation |
| Compiler ⭐ | Whole source → object code; errors listed after full scan |
| Interpreter | Line by line; stops at first error |
| Assembler ⭐ | Assembly → machine code; assembly is machine dependent |
| Linker / loader | Joins object files and libraries / loads into memory |

| Compiler phase ⭐ | Output |
|---|---|
| Lexical | Tokens |
| Syntax | Parse tree |
| Semantic ⭐ | Type checking; saves type information in the syntax tree/symbol table ⭐ |
| Intermediate code | Three-address code |
| Optimisation | Faster or smaller code |
| Code generation | Target machine code |

| Flowchart symbol ⭐ | Shape |
|---|---|
| Start/stop | Oval |
| Process | Rectangle |
| Decision | Diamond |
| Input/output | Parallelogram |
| Connector ⭐ | Small circle ⭐ (off-page: pentagon) |
| Predefined process | Rectangle with double sides |

- Flowchart = graphical representation of an algorithm ⭐. Input controls (validation, check digits, range checks) ensure correct data entry.

### Graphics one-liners
- Random scan ⭐ draws like a pencil (display file, smooth lines); raster scans row by row (frame buffer, jaggies).
- Frame buffer = resolution × bits per pixel (1024 × 768 × 8 bits = 768 KB).
- DDA and Bresenham draw lines; they do not clip. Clipping ⭐: Cohen–Sutherland, Liang–Barsky ⭐, Cyrus–Beck; polygons: Sutherland–Hodgman.
- Cohen–Sutherland ⭐: 4-bit outcodes; both 0000 → accept; AND ≠ 0000 → reject; otherwise the line intersects the window → clip ⭐.
- Projections ⭐: parallel (orthographic, isometric, oblique) vs perspective (vanishing points). Key: "orthogonal projection" and "horizontal view" cannot be framed together.
- Animation needs transformation operations ⭐: translate, scale, rotate, reflect, shear (3 × 3 homogeneous matrices).
- Bézier ⭐ = spline from control points, passes through first and last point; B-spline gives local control.
- Illumination ⭐ depends on light source, surface and observer — not the rendering algorithm. VR ⭐ = computer simulation of real-world activity.

### Maths, statistics, numerical quick facts

| Item ⭐ | Fact |
|---|---|
| Two dice ⭐ | P(sum neither 5 nor 9) = 28/36 = 7/9 |
| Probability ⭐ | Classical definition: Laplace; Bayesian = degree of belief obeying rules |
| Distributions ⭐ | Discrete: Poisson, binomial, geometric; continuous: normal, exponential |
| Mean ⭐ | Sum of deviations is zero only about the arithmetic mean |
| Range ⭐ | Max − min: 101 − 6 = 95 |
| Inferential ⭐ | Predicts from a sample; descriptive only summarises |
| Interpolation ⭐ | Estimating y inside the table; based on curve fitting; Gaussian process = nonlinear |
| Intervals ⭐ | Equal: Newton forward/backward, Gauss; unequal: Newton divided difference ⭐, Lagrange |
| Lagrange ⭐ | (1,1), (3,27), (4,64) → 8x² − 19x + 12 |
| Operators ⭐ | Δ = E − 1; ∇ = 1 − E⁻¹; Δⁿe^(ax+b) = (e^(ah) − 1)ⁿ e^(ax+b); μ² = (δ² + 4)/4 |
| p-series ⭐ | Σ1/nᵖ converges only if p > 1 |
| Others ⭐ | Cube x³, 6x²; tetrahedron abc/6; tangent ⟂ radius (155.2 mm); Euler degree 0 → 0; dy/dx = e^(x+y) → e^x + e^(−y) = c; quadratics are not solved by "convergence" |

## 3. Software Engineering [SE]

| Model | Core idea | Use when | Weakness |
|---|---|---|---|
| Waterfall ⭐ | Oldest (Royce 1970); strict order | Clear, stable requirements | Cannot handle change ⭐ |
| V-model | Each phase paired with a test | Safety-critical | Rigid |
| Incremental | Core first, then increments | Early partial delivery | Needs modular design |
| RAD ⭐ | Reuse, 60–90-day time-box, parallel teams | Modular system, tight deadline | Not for high technical risk |
| Prototyping | Quick model to clarify needs | Vague requirements | Mistaken for the product |
| Spiral | Boehm; risk-driven; a "meta-model" | Large, risky projects | Costly, complex |
| Concurrent | Activities exist in states | Many teams | Hard to manage |

- Pressman groups: sequential (waterfall, V — oldest paradigm ⭐), incremental (incremental, RAD), evolutionary (prototyping, spiral), concurrent.
- Waterfall ⭐: linear, document-driven, **low cost**, long duration, high risk; "high cost" is the NOT-true option.
- RAD phases ⭐: business modelling → data modelling → process modelling → application generation → testing & turnover. "Development modelling" is not one.
- Spiral quadrants: objectives → risk analysis → develop & verify → plan next loop.
- Agile Manifesto 2001: 4 values, 12 principles. Scrum roles: Product Owner, Scrum Master, Developers.
- Scrum events: Sprint (≤ 1 month), Planning, Daily Scrum (15 min), Review, Retrospective. Artifacts: Product Backlog, Sprint Backlog, Increment.
- XP: pair programming, TDD, refactoring. Kanban: limit work-in-progress.

| Functional ⭐ | Non-functional ⭐ |
|---|---|
| What the system does; core work tasks | How well; desirable qualities, not mandatory ⭐ |
| Issue a library book, OTP login | Loads in 2 s, 99.9% uptime, encryption |

- Design levels ⭐: system (most abstract) → architectural → detailed. Pressman levels: architectural, interface, component.
- Goal ⭐: **low coupling, high cohesion**.
- Cohesion best → worst: functional, sequential, communicational, procedural, temporal, logical, coincidental.
- Coupling best → worst: data, stamp, control, external, common, content.
- UML structural: class, component, deployment. Behavioural: use case, sequence (time order), activity, state machine. Hollow diamond = aggregation; filled = composition.

| Black box | White box |
|---|---|
| From the specification | From the code |
| Equivalence partitioning, BVA, decision table, cause–effect, state transition | Statement, branch, path coverage; basis path, loop, data-flow |

| Level | Point |
|---|---|
| Unit | Stubs (called) and drivers (caller) |
| Integration | Top-down (stubs), bottom-up (drivers), big bang, sandwich |
| System ⭐ | Whole system against the SRS |
| Acceptance | Alpha at developer's site; beta at user's site |

| System test ⭐ | Checks |
|---|---|
| Recovery ⭐ | Forces failure in many ways, verifies recovery |
| Security | Protection from improper access |
| Stress | Abnormal quantity, frequency or volume |
| Load / performance | Expected peak / speed and resources |

- **V(G) = E − N + 2P = decisions + 1 = regions.** 10 edges, 8 nodes → 4.
- Verification = building the product right; validation = building the right product. Regression = re-run old tests.

| Maintenance | Purpose | Share |
|---|---|---|
| Corrective | Fix bugs | ~21% |
| Adaptive | New OS, hardware, law | ~25% |
| Perfective | New features | ~50% (largest) |
| Preventive | Avoid future problems | ~4% |

- SCM ⭐ identifies, controls, audits and reports changes: SCIs, baselines, version control, change control (CCB), audit, status reporting.
- Risk ⭐: reactive vs proactive; identify → project → assess (RE = P × C) → RMMM. Strategies: avoid, transfer, mitigate, accept — "risk generation" is not one ⭐.

| ISO 9126 factor ⭐ | Sub-attributes |
|---|---|
| Functionality | Suitability, accuracy, security, interoperability |
| Reliability | Maturity, fault tolerance, recoverability |
| Usability | Understandability, learnability, operability |
| Efficiency ⭐ | Time behaviour, resource behaviour ⭐ |
| Maintainability | Analysability, changeability, testability |
| Portability | Adaptability, installability, replaceability |

| Level | CMM ⭐ | CMMI |
|---|---|---|
| 1 | Initial | Initial |
| 2 | Repeatable | Managed |
| 3 | Defined | Defined |
| 4 | Managed | Quantitatively Managed |
| 5 | Optimizing | Optimizing |

- CMM = Capability Maturity Model ⭐ (SEI, Carnegie Mellon).

| Basic COCOMO | a | b | c | d | 32 KLOC effort |
|---|---|---|---|---|---|
| Organic | 2.4 | 1.05 | 2.5 | 0.38 | 91.3 PM |
| Semi-detached | 3.0 | 1.12 | 2.5 | 0.35 | 145.5 PM |
| Embedded | 3.6 | 1.20 | 2.5 | 0.32 | 230.4 PM |

- Effort = a(KLOC)^b; time = c(Effort)^d; staff = effort ÷ time. FP = UFP × (0.65 + 0.01ΣFi).
- **MTBF = MTTF + MTTR**; availability = MTTF ÷ (MTTF + MTTR).

## 4. Web Technologies [WEB]

| HTML item ⭐ | Fact |
|---|---|
| `<head>` ⭐ | Container for information about the page: title, meta, link, style, script, base, noscript |
| Body colours ⭐ | bgcolor, background (image), text, link (unvisited), alink (active), vlink ⭐ (visited) |
| `<a href>` ⭐ | href = hypertext reference (destination) ⭐; `mailto:`; `#id` bookmark |
| target ⭐ | `_self` default; `_blank` new tab; `_parent` one frame up; `_top` ⭐ full window |
| `<hr>` ⭐ | size, width, align, noshade; there is no SHADE ⭐ |
| `<br>` ⭐ | Line break; void element |
| Comment ⭐ | `<!-- text -->` |
| Table | border; tr, th, td; caption; colspan, rowspan; cellpadding (inside a cell), cellspacing (between cells) |
| Form | action = server URL; method GET (default) or POST; file upload needs POST + `enctype="multipart/form-data"` |
| `<input type>` | text, password, radio (one shared name), checkbox, submit, reset, file, hidden; HTML5: email, number, date, range, color |
| DHTML / TDC ⭐ | DHTML = HTML + CSS + JS + DOM; TDC = Microsoft ActiveX control that sorts/filters a delimited data file ⭐ |

| CSS way ⭐ | Syntax | Scope |
|---|---|---|
| Inline | `<p style="color:red">` | One element; highest priority |
| Internal | `<style>…</style>` in head | One page |
| External ⭐ | `<link rel="stylesheet" type="text/css" href="style.css">` in head | Many pages |

| CSS item | Fact |
|---|---|
| Transitions ⭐ | Change values smoothly over a duration ⭐: property, duration (default 0s), timing-function (ease), delay |
| Animation | `@keyframes`; runs without a trigger |
| filter ⭐ | `grayscale(100%)` ⭐, blur, brightness, sepia, invert; value not quoted |
| Preprocessors ⭐ | Sass ⭐ (.scss/.sass, most widely used), Less, Stylus; not TypeScript or Git |
| Cascade | !important > inline > internal/external > browser; specificity inline 1000, ID 100, class 10, element 1 |
| Layout | Box: content, padding, border, margin; flex 1-D, grid 2-D |

**JavaScript essentials**
- `document.write()` ⭐ writes into the page; `"Hello"` then `"\nIndia"` → Hello India (whitespace collapses); without the newline → HelloIndia.
- DOM: getElementById, getElementsByClassName/TagName, querySelector(All), innerHTML, textContent, createElement, appendChild, addEventListener("click", fn).
- `var` is function-scoped and hoisted (undefined); `let` and `const` are block-scoped; `const` cannot be reassigned.
- `typeof null` = "object"; `"5" + 3` = "53"; `"5" - 3` = 2; `5 == "5"` true, `5 === "5"` false.
- Front end ⭐: HTML, CSS, JavaScript ⭐, jQuery, Angular, React, Sass, DevTools. Back end: PHP ⭐, Node.js, servlets, ASP.NET, Django, SQL. Browser = universal database front end ⭐.

**jQuery effects ⭐**: hide, show, toggle; fadeIn, fadeOut, fadeToggle, fadeTo; slideDown ⭐, slideUp, slideToggle; animate, stop, delay. Speeds: slow 600 ms, fast 200 ms, default 400 ms.

**AngularJS directives ⭐**: ng-app (starts the app), ng-model ⭐ (two-way binding), ng-bind (one-way), ng-init, ng-repeat, ng-controller, ng-show, ng-hide, ng-if, ng-click; `{{ 5 + 5 }}` → 10.

| XML item ⭐ | Fact |
|---|---|
| Purpose | Store and transport data (HTML displays) |
| Syntax | One root; every tag closed; proper nesting; case-sensitive; attribute values quoted |
| Names ⭐ | Start with a letter or underscore; no spaces; never begin with "xml" ⭐; `_id`, `first-name` valid; `1st` invalid |
| Well-formed vs valid | Valid = well-formed + follows DTD/XSD |
| External DTD ⭐ | `<!DOCTYPE root-element SYSTEM "file-name">` |
| Element declaration ⭐ | `<!ELEMENT element-name category>`; EMPTY, ANY, (#PCDATA) |
| XML processor ⭐ | Reads XML and gives access to its content and structure |

| DOM ⭐ | SAX |
|---|---|
| Whole document as an in-memory tree ⭐ | Event-based stream |
| Random access; read and modify | Sequential, read-only |
| High memory | Low memory, fast |

- Other parsers: JDOM, StAX, Xerces; "Shell" is NOT a parser ⭐.

| Server side ⭐ | Fact |
|---|---|
| CGI ⭐ | Standard for web server ↔ application program communication; one process per request |
| Servlet ⭐ | Java class inside a container (Tomcat); cannot run without one ⭐ |
| Servlet life cycle | Load → init() once → service() per request (doGet/doPost) → destroy() once |
| JSP | HTML + Java, compiled into a servlet; `<% %>`, `<%= %>`, `<%@ %>` |
| PHP | Rasmus Lerdorf 1994; `$var`; `$_GET`, `$_POST`, `$_SESSION` |
| ASP.NET control ⭐ | `<asp:Type ID="x" runat="server" />` ⭐ |
| ASP.NET event ⭐ | An action or occurrence (click, key press) that runs a handler ⭐; page: PreInit → Init → Load → control events → PreRender → Render → Unload |
| ADO.NET ⭐ | Interoperability, maintainability, programmability, performance, scalability — no "reachability" ⭐; DataReader connected, DataSet disconnected |

- E-commerce models (full table in Section 5): B2C Flipkart, C2C OLX, B2B IndiaMART, B2G GeM, G2C DigiLocker.

| Security | Defence |
|---|---|
| HTTPS (TLS) | Encrypts traffic; CA certificate proves identity |
| XSS | Injected script; output encoding, CSP, HttpOnly |
| SQL injection | Parameterised queries |
| CSRF | Anti-CSRF token, SameSite cookie |
| CAPTCHA | Blocks bots |

- HTTP status ⭐: 1xx informational; 2xx success (200, 201); 3xx redirect (301, 302, 304); 4xx client (400, 401, 403, 404); 5xx server (500, 502, 503). HTTP port 80, HTTPS 443; HTTP is stateless; GET in URL, POST in body.

## 5. IT Tools & Emerging Technologies [IT]

| Word | Action | Excel/PPT | Action |
|---|---|---|---|
| Ctrl+E / J | Centre / justify | F2 | Edit cell |
| Ctrl+K | Hyperlink | F4 | Toggle $ / repeat |
| Ctrl+Enter | Page break | Alt+= | AutoSum |
| F7 / Shift+F7 | Spelling / thesaurus | Ctrl+; | Insert date |
| Shift+F3 | Change case | F11 | Chart sheet |
| F12 | Save As | F5 / Shift+F5 | Show from start / current slide |

- Word: mail merge (main document + data source), track changes, styles → table of contents. PowerPoint: slide master; transition = between slides, animation = on an object.

| Excel function | Example → result |
|---|---|
| COUNT / COUNTA | 10, "Delhi", blank, 25, 0 → 3 / 4 |
| COUNTIF / SUMIF | 40, 60, 75, 50, 90: ">=50" → 4; ">50" sum → 225 |
| ROUND | ROUND(1234.567, −2) → 1200 |
| LEN / & | LEN("DSSSB") → 5; "TGT"&"CS" → TGTCS |
| VLOOKUP | Not found → #N/A |
| PMT | PMT(10%/12, 12, 100000) → −8,791.59 |

- Limits: Excel 2007+ = 1,048,576 rows × 16,384 columns (last XFD); 2003 = 65,536 × 256. $A$1 absolute, A1 relative.
- Errors: #DIV/0! (zero), #N/A (lookup missing), #REF! (deleted cell), #VALUE! (wrong type), #NAME? (misspelt function).
- Extensions: .docx/.dotx, .xlsx/.xlsm, .pptx/.ppsx/.potx, .pdf, .csv.

| System ⭐ | Purpose |
|---|---|
| Information system ⭐ | Interrelated components that collect, process, store, distribute information for decisions |
| TPS | Routine transactions (payroll, billing) |
| MIS ⭐ | Planned collection, storage and dissemination of information for management ⭐; components: people, hardware, software, data, procedures ("education procedures" NOT ⭐) |
| DSS ⭐ | Improves decision-making ⭐ (what-if, semi-structured) |
| EIS/ESS | Top executives, summarised |
| OAS ⭐ | Word processing, e-filing, e-mail, message switching, voice/data communication ⭐ |
| ES / KMS | Expert's rules (inference engine) / create and share knowledge |

| Information idea ⭐ | Fact |
|---|---|
| Data → information → knowledge ⭐ | Raw facts → processed → expertise from experience or education ⭐ |
| Quality categories ⭐ | Intrinsic (accuracy); contextual (relevance, timeliness); representational ⭐ (interpretability, format, coherence, compatibility); accessibility |
| Hardest to quantify ⭐ | Value |
| Levels ⭐ | Strategic ⭐ (top, long-term policy), tactical (middle), operational (day-to-day) |
| Other ⭐ | Organisation = formal social unit with goals; interdependence = parts depend on each other; operations research = applied maths; EDA = flexible hypothesis generation |

| KM item ⭐ | Fact |
|---|---|
| Definition ⭐ | Processes to create, gather, store, transfer and apply knowledge |
| Tacit vs explicit ⭐ | Shared experience, in heads ⭐ / codified, documented |
| Process ⭐ | Acquire → refine ⭐ (add value, find relationships) → store → share → apply |
| Wiig viewpoints ⭐ | Business; management ⭐ (organising, directing, monitoring); hands-on operational |
| Options ⭐ | In-house ⭐ (lowest cost, DSSSB key), off-the-shelf, outsourcing, end-user |
| Purposes / types ⭐ | Not "portability"; types expert-, experience-, efficiency-driven (not "expense") |
| Best practices ⭐ | Most successful solutions of an organisation or industry |

| E-commerce model ⭐ | Example |
|---|---|
| B2B | IndiaMART, Alibaba |
| B2C | Amazon, Flipkart |
| C2C ⭐ | OLX ⭐, eBay |
| C2B | Freelancers (Upwork) |
| B2G / G2C | GeM / DigiLocker |

- Revenue models ⭐: advertising, subscription ⭐ (fixed periodic fee), transaction fee, sales, affiliate.
- Processes ⭐: information → ordering → payment → delivery/fulfilment ⭐ (packing, loading, shipping) → service. "B" stakeholders include producers ⭐.
- History ⭐: Aldrich 1979; Amazon, eBay 1995; K. Vaitheeswaran = father of Indian e-commerce ⭐; UPI 2016.

| Business / accounting / economics ⭐ | Fact |
|---|---|
| Sole proprietorship ⭐ | One person; most common ⭐; unlimited liability |
| Partnership | 2–50; unlimited liability |
| Private / public / OPC ⭐ | Min 2 (max 200) / min 7 ⭐ / 1; company = limited liability ⭐ |
| LLP / cooperative | Min 2 / min 10 |
| Trade / commerce ⭐ | Sale and purchase / large-scale buying and selling plus aids |
| Organisation structure ⭐ | Relates people, work and resources |
| Financial accounting ⭐ | Recording, classifying, summarising in money terms, interpreting |
| Double entry ⭐ | Every transaction has a debit and a credit |
| Accounting cycle ⭐ | Journal → ledger → trial balance → adjustments → adjusted TB → financial statements → closing entries |
| Working capital ⭐ | Current assets − current liabilities |
| Drawings / fixed assets ⭐ | Owner's personal withdrawals / long-term assets |
| P&L account ⭐ | Shows net profit |
| Marginal revenue ⭐ | ΔTR ÷ ΔQ |
| Demand ⭐ | Effective desire = desire + ability + willingness to pay |
| Elasticity ⭐ | Degree of response; perfectly elastic = ∞ ⭐; inelastic = 0 |
| Diminishing marginal utility ⭐ | More stock → lower marginal utility |
| Inflation ⭐ | Demand-pull ⭐, cost-push, built-in; creeping → hyper |
| Forecasting ⭐ | Opinion survey = sales-force composite ⭐; new products: evolutionary, substitute, growth curve ⭐, opinion polling, vicarious ⭐ |
| Economic systems ⭐ | Capitalist ⭐ (free market), socialist, mixed (India); micro = individual unit ⭐ |

| Cyber law ⭐ | Fact |
|---|---|
| IT Act 2000 | In force 17 Oct 2000; amended 2008 |
| Sec 43 / 65 / 66 | Unauthorised access (compensation) / source-code tampering / computer offences |
| 66C / 66D / 66E | Identity theft / personation cheating / privacy |
| 66F / 67 / 72 | Cyber terrorism (life) / obscene material / confidentiality breach |
| 70B | CERT-In; 66A struck down (Shreya Singhal, 2015) |
| Remedies ⭐ | Compensation, fines, imprisonment ⭐ |
| DPDP 2023 ⭐ | Child = not completed 18 ⭐; Data Principal, Fiduciary, Processor; penalty up to ₹250 crore |
| IPR ⭐ | Recognition or financial benefit; holder = creator/inventor ⭐; certain period ⭐ |
| IPR terms | Copyright life + 60; patent 20; trademark 10 renewable; design 10 + 5 |
| E-waste ⭐ | Irreparable electronics ⭐; exported to India ⭐; exposure varies with type ⭐ |
| E-Waste Rules 2016 ⭐ | Two categories (IT & telecom; consumer electronics) ⭐; CFLs and mercury lamps; EPR; 2022 Rules from 1 Apr 2023 |

| Emerging tech ⭐ | Fact |
|---|---|
| Cloud | IaaS, PaaS, SaaS; public, private, hybrid; MeghRaj |
| AI types ⭐ | ANI acts smart without awareness; AGI thinks like a human; ASI smarter than humans ⭐ |
| AI ethics ⭐ | Black box ⭐ (unexplained models); k-anonymity; l-diversity; deepfakes are misuse |
| ML types | Supervised, unsupervised, reinforcement |
| IoT ⭐ | Sensors, actuators, connectivity, cloud; top challenge = security ⭐ |
| Big data | 5 Vs: volume, velocity, variety, veracity, value; Hadoop, Spark |
| Blockchain | Distributed immutable ledger; PoW/PoS; smart contracts |
| AR / VR | Overlay on real / fully immersive |
| 5G / edge | India 1 Oct 2022 / process near the source |

- Digital India (1 July 2015): DigiLocker, UPI (NPCI), Aadhaar (UIDAI), UMANG, BharatNet, e-Office, CSC. Children's social-media sharing must be monitored ⭐.

## 6. Teaching Methodology [TEACH]

| Bloom level | Original (1956) | Revised (2001) | Verbs |
|---|---|---|---|
| 1 | Knowledge | Remember | list, define |
| 2 | Comprehension | Understand | explain, summarise |
| 3 | Application | Apply | use, solve |
| 4 | Analysis | Analyse | compare, debug |
| 5 | Synthesis | Evaluate | judge, justify |
| 6 | Evaluation | Create | design, build |

- Synthesis became Create and moved to the top. Affective (Krathwohl): receiving → characterisation. Psychomotor (Dave): imitation → naturalisation. ABCD objective.
- Herbartian five steps: preparation → presentation → comparison/association → generalisation → application.
- Unit plan ⭐: form units/sub-units, content analysis, objectives, experiences, methods, aids, assessment methods.

| Method ⭐ | Fact |
|---|---|
| Project ⭐ | Kilpatrick; students set objective and plan ⭐ |
| Heuristic ⭐ | H. E. Armstrong ⭐; "I find out" |
| Problem solving | Dewey |
| Inductive / deductive | Examples → rule / rule → examples |
| Programmed | Skinner (linear), Crowder (branching) |
| Constructivist ⭐ | Learner-centred meaning-making ⭐; 5E: Engage, Explore, Explain, Elaborate, Evaluate |
| Subject-centred ⭐ | Confined to the textbook ⭐ |
| Play-way | Froebel, Montessori, Caldwell Cook |
| Micro-teaching | Allen, Stanford 1963; teach 6, feedback 6, re-plan 12, re-teach 6, re-feedback 6 |

- Dale's cone (1946): direct experience at the base, verbal symbols at the top. Diorama ⭐ = partly 3-D scene model; realia = real objects.
- Writing ⭐: lower forms copying, dictation; paragraph writing is NOT lower ⭐. Art education ⭐ = visual and performing arts.

| ICT platform ⭐ | Fact |
|---|---|
| DIKSHA | National teacher/student platform (2017), QR textbooks |
| SWAYAM | MOOCs (2017), Class 9 to PG |
| ePathshala | NCERT e-textbooks |
| NROER | Open educational resources repository |
| PM eVIDYA | 2020 multimode digital education |
| ICT assessment ⭐ | CBT, online quizzes, concept-map software, e-portfolios; paper reflection journal is NOT ⭐ |

| Evaluation ⭐ | Fact |
|---|---|
| Formative / summative | During, for feedback / end, for grading |
| For / of / as learning | Formative; peer assessment ⭐ / summative / self-reflection |
| Diagnostic | Finds causes → remedial teaching |
| Test qualities | Validity, reliability, objectivity, usability, discrimination |
| Tools | Rubric, checklist (yes/no), rating scale (degree), portfolio, anecdotal record |
| CCE / NEP | RTE Sec 29 / PARAKH, Holistic Progress Card |

- Lab checklist: U-shape layout, earthing, no food or water, CO₂ extinguisher, UPS, screens at eye level, stock register, backups, antivirus, displayed rules, FOSS, two pupils per computer at most.
- Seating ⭐: special-needs child near the board; performing arts need open space, not a board view ⭐.

| Piaget stage ⭐ | Age | Key ideas |
|---|---|---|
| Sensorimotor | 0–2 | Object permanence |
| Pre-operational ⭐ | 2–7 ⭐ | Symbolic play, egocentrism, animism, no conservation |
| Concrete operational | 7–11 | Conservation, reversibility, seriation |
| Formal operational ⭐ | 11+ | Propositional thinking, idealism ⭐ |

- Horizontal decalage ⭐: uneven conservation (number first, volume last). Play is natural; toys are not essential ⭐.

| Theorist | Idea |
|---|---|
| Vygotsky | ZPD, scaffolding, MKO |
| Bruner | Enactive → iconic → symbolic; spiral curriculum |
| Gagné | Nine events of instruction; eight learning types |
| Kohlberg | Pre-conventional, conventional, post-conventional (6 stages) |
| Erikson ⭐ | Trust, autonomy, initiative, industry, identity…; a neo-Freudian ⭐ |
| Marcia ⭐ | Moratorium ⭐ = exploring, no commitment; foreclosure = commitment, no exploration |
| Baumrind ⭐ | Authoritative best; give-and-take with parents → same with peers ⭐ |
| Skinner ⭐ | Positive reinforcement adds pleasant (high grades ⭐); negative removes unpleasant; both raise behaviour |
| Gardner | Eight multiple intelligences |
| VAK / Kolb ⭐ | Visual, auditory, kinaesthetic / experiential learning ⭐ |
| Neo-Freudians ⭐ | Adler, Jung, Horney, Erikson, Sullivan ⭐ |

- Language ⭐: cooing 2 months, babbling 6, one word 12, two words 18–24. Fast mapping ⭐ builds vocabulary. "Doggie" for all animals = over-extension ⭐.
- Broca and Wernicke ⭐ = left hemisphere. Auditory–visual coordination from birth ⭐; neonates see 1/8-inch stripes, 3-month-olds 1/64 ⭐.

| Inclusion / act ⭐ | Fact |
|---|---|
| RTE 2009 | Article 21A; ages 6–14; 25% EWS seats; no corporal punishment |
| RPWD 2016 | 21 disabilities; benchmark ≥ 40% |
| SSA / Samagra ⭐ | 2000–01, zero rejection, stipend for disabled girls ⭐ / 2018 merger |
| DPEP ⭐ | 1994; inclusive education added 1997 ⭐ |
| ICDS ⭐ | 2 Oct 1975; children below 6 ⭐ |
| POCSO 2012 / JJ 2015 | Child below 18 / 16–18 tried as adults for heinous offences |
| IPC 82 ⭐ | No offence by a child below 7 ⭐ |
| Intellectual disability ⭐ | Mild 50–70, moderate 35–49, severe 20–34, profound < 20 |
| Women's policy ⭐ | 2001 ⭐; Beti Bachao 2015 |

| Year | Commission / policy |
|---|---|
| 1854 / 1882 | Wood's Despatch / Hunter |
| 1948–49 / 1952–53 | Radhakrishnan / Mudaliar |
| 1964–66 | Kothari: 10+2+3 |
| 1968 / 1986 / 1992 | NPE / NPE / POA |
| 2005 / 2020 | NCF / NEP |

| Reformer ⭐ | Contribution |
|---|---|
| Gopal Hari Deshmukh ⭐ | "Lokhitwadi" ⭐ |
| Bal Gangadhar Tilak ⭐ | Kesari (Marathi ⭐), Mahratta |
| Phules | First girls' school, Pune 1848 |
| Raja Ram Mohan Roy | Brahmo Samaj; abolition of sati |
| Vidyasagar | Widow remarriage |

- NEP 2020: 5+3+3+4; coding from Class 6; mother tongue till Class 5; PARAKH; 360° progress card.
- Constitution ⭐: Eighth Schedule 22 languages; 71st (1992) Konkani, Manipuri, Nepali ⭐; 92nd (2003) Bodo, Dogri, Maithili, Santhali; Article 350A mother tongue.
- Community ⭐: hygiene and literacy work win acceptance; parent involvement increases achievement ⭐; obesity does not cause AIDS ⭐.

## 7. Official answers to treat with care

Learn the textbook answer; remember the official key in case the identical item reappears.

| # | Question (paper) | Official key | Textbook answer | Reason |
|---|---|---|---|---|
| 1 | Softer interpolants (2023) [FUND] | Piecewise constant | Polynomial and spline | Piecewise constant is a step function, the least smooth |
| 2 | Ensures data entered correctly (2023) [FUND] | Keyboards | Input controls | A keyboard cannot check correctness |
| 3 | 10100 ÷ 2 (2023) [FUND] | 01010 | 11010 | Signed division = arithmetic shift copying the sign |
| 4 | Σ1/∛(n²) (2023) [FUND] | Convergent | Divergent | p = 2/3 ≤ 1 |
| 5 | Web server ↔ program standard (2023) [WEB] | HTTP | CGI | HTTP links browser and server |
| 6 | Effective desire (2023) [IT] | Consumption | Demand | Demand = desire + ability + willingness |
| 7 | Most successful solutions (2023) [IT] | Knowledge management | Best practices | Laudon's definition |
| 8 | Existing product's growth → new demand (2023) [IT] | Substitute approach | Growth curve approach | Joel Dean's methods |
| 9 | Accounting cycle order (2023) [IT] | Closing entries before statements | Statements → closing entries | Closing resets accounts after reporting |
| 10 | Recognition or benefit from creation or invention (2024) [IT] | Copyright | IPR | Inventions are patents, not copyright |

## 8. Full forms you must know

| Short | Full form |
|---|---|
| ALU | Arithmetic Logic Unit |
| PC / IR | Program Counter / Instruction Register |
| MAR / MDR | Memory Address / Data Register |
| DMA | Direct Memory Access |
| BIOS | Basic Input/Output System |
| POST | Power-On Self-Test |
| CMOS | Complementary Metal-Oxide-Semiconductor |
| SRAM / DRAM | Static / Dynamic RAM |
| EEPROM | Electrically Erasable Programmable ROM |
| RISC / CISC | Reduced / Complex Instruction Set Computer |
| BCD | Binary Coded Decimal |
| ASCII | American Standard Code for Information Interchange |
| EBCDIC | Extended Binary Coded Decimal Interchange Code |
| UTF | Unicode Transformation Format |
| OMR / OCR | Optical Mark / Character Recognition |
| MICR | Magnetic Ink Character Recognition |
| VDU | Visual Display Unit |
| FORTRAN | Formula Translation |
| RAD | Rapid Application Development |
| SRS | Software Requirements Specification |
| UML | Unified Modeling Language |
| DFD | Data Flow Diagram |
| CMM | Capability Maturity Model |
| SCM | Software Configuration Management |
| RMMM | Risk Mitigation, Monitoring and Management |
| COCOMO | Constructive Cost Model |
| MTBF / MTTR | Mean Time Between Failures / To Repair |
| HTML | HyperText Markup Language |
| CSS | Cascading Style Sheets |
| XML | eXtensible Markup Language |
| DTD | Document Type Definition |
| DOM | Document Object Model |
| SAX | Simple API for XML |
| CGI | Common Gateway Interface |
| JSP / ASP | JavaServer Pages / Active Server Pages |
| ADO | ActiveX Data Objects |
| TDC | Tabular Data Control |
| HTTP | HyperText Transfer Protocol |
| AJAX | Asynchronous JavaScript and XML |
| XSS / CSRF | Cross-Site Scripting / Request Forgery |
| CAPTCHA | Completely Automated Public Turing test to tell Computers and Humans Apart |
| TPS | Transaction Processing System |
| MIS | Management Information System |
| DSS | Decision Support System |
| OAS | Office Automation System |
| EDI | Electronic Data Interchange |
| GeM | Government e-Marketplace |
| UPI | Unified Payments Interface |
| IPR | Intellectual Property Rights |
| DPDP | Digital Personal Data Protection |
| EPR | Extended Producer Responsibility |
| CERT-In | Indian Computer Emergency Response Team |
| IoT | Internet of Things |
| IaaS / PaaS / SaaS | Infrastructure / Platform / Software as a Service |
| NCF / NEP | National Curriculum Framework / Education Policy |
| RTE | Right to Education |
| RPWD | Rights of Persons with Disabilities |
| SSA | Sarva Shiksha Abhiyan |
| DPEP | District Primary Education Programme |
| ICDS | Integrated Child Development Services |
| POCSO | Protection of Children from Sexual Offences |
| CCE | Continuous and Comprehensive Evaluation |
| ZPD | Zone of Proximal Development |
| DIKSHA | Digital Infrastructure for Knowledge Sharing |
| SWAYAM | Study Webs of Active-Learning for Young Aspiring Minds |
| NROER | National Repository of Open Educational Resources |
| PARAKH | Performance Assessment, Review, and Analysis of Knowledge for Holistic Development |

## Last 15 traps
1. Arithmetic right shift copies the sign bit (11010); a logical shift inserts 0 (01010).
2. ADD R1, [R2] is register indirect, not register mode.
3. Ripple delay is per flip-flop: 100 ns ÷ 10 = 10 ns, not 100 ns.
4. Cascaded counters multiply (6 × 8 = 48), they do not add.
5. 4 KB = 4,096 bytes; watch the digit swap 4,069.
6. DDA and Bresenham draw lines; they do not clip.
7. Waterfall is low cost; "high cost" is the false option.
8. Coupling low, cohesion high; CMM level 4 = Managed, CMMI level 2 = Managed.
9. VLINK = visited, ALINK = active; HR has NOSHADE, not SHADE.
10. `<style>` never takes href; external CSS uses `<link>`.
11. XML names may start with an underscore, never a digit or "xml".
12. Public company 7, private 2, OPC 1; OLX is C2C.
13. DPDP child = under 18, not 16; copyright = life + 60 years.
14. Revised Bloom: Create is highest; negative reinforcement increases behaviour.
15. 71st Amendment added Nepali (Bodo came with the 92nd); Kesari was Marathi.
