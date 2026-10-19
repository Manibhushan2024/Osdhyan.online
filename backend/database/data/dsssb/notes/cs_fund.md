# Computer Fundamentals & Digital Logic: DSSSB TGT CS Revision Notes

## 1. One-page summary

- Expect 8-12 questions from this chapter in Section B. Number conversions, complements, gates, Boolean simplification and flip-flops are the most repeated; generations, memory types and storage units give quick marks.
- Numerical questions are fast if you know the shortcuts: group 3 bits for octal, 4 bits for hex, and "invert and add 1" for 2's complement.
- Wrong answers cost 0.25 mark. In conversion questions, check the last digit first (odd/even, last hex digit) to eliminate options quickly.

## 2. Number systems and conversions

| System | Base | Digits | Example |
|---|---|---|---|
| Binary | 2 | 0, 1 | (1011)2 = 11 |
| Octal | 8 | 0-7 | (734)8 = 476 |
| Decimal | 10 | 0-9 | 45 |
| Hexadecimal | 16 | 0-9, A-F | (2F)16 = 47 |

| Conversion | Method | Worked example |
|---|---|---|
| Decimal to binary (integer) | Divide by 2, read remainders bottom to top | 45 = 101101 |
| Decimal fraction to binary | Multiply by 2, read integer parts top to bottom | 0.625 = 0.101 |
| Binary to octal | Group 3 bits from the binary point | 11 010 110 = (326)8 |
| Binary to hex | Group 4 bits from the binary point | 1101 0110 = (D6)16 |
| Octal to hex | Go through binary | (734)8 = 111 011 100 = 1 1101 1100 = (1DC)16 |
| Any base to decimal | Sum of digit x base^position | (1234)5 = 125 + 50 + 15 + 4 = 194 |
| Decimal to octal | Divide by 8 | 156 = (234)8 |

- n bits give 2^n patterns: 8 bits = 256 values (0-255 unsigned).
- Unknown base: (121)b = 16 means b^2 + 2b + 1 = 16, so (b + 1)^2 = 16 and b = 3.
- Hex digit values to memorise: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.

## 3. Binary arithmetic and complements

| Representation (8-bit) | Range | Zeros |
|---|---|---|
| Unsigned | 0 to 255 | one |
| Sign-magnitude | -127 to +127 | two (+0, -0) |
| 1's complement | -127 to +127 | two |
| 2's complement | -128 to +127 | one |

- 1's complement: invert every bit. 01101 becomes 10010.
- 2's complement: invert and add 1, or copy bits from the right up to and including the first 1, then invert the rest. 00101100 becomes 11010100.
- General n-bit 2's complement range: -2^(n-1) to 2^(n-1) - 1.
- Reading a negative 2's complement number: 11110100 has MSB 1, so take its 2's complement (00001100 = 12): the value is -12.
- Subtraction A - B = A + (2's complement of B); discard the end carry. In 1's complement the end carry is added back (end-around carry).
- Overflow happens only when two numbers of the same sign give a result of the opposite sign (e.g. +100 + 50 in 8 bits gives a negative pattern).
- Binary addition rules: 1 + 1 = 10, 1 + 1 + 1 = 11.

## 4. Boolean algebra

| Law | Form |
|---|---|
| Identity | A + 0 = A, A . 1 = A |
| Null | A + 1 = 1, A . 0 = 0 |
| Idempotent | A + A = A, A . A = A |
| Complement | A + A' = 1, A . A' = 0 |
| Involution | (A')' = A |
| Absorption | A + AB = A, A(A + B) = A |
| Redundancy | A + A'B = A + B |
| Distributive | A(B + C) = AB + AC, A + BC = (A + B)(A + C) |
| De Morgan | (AB)' = A' + B', (A + B)' = A'B' |

- Duality: swap + with . and 0 with 1; the dual of a valid identity is also valid.
- Number of Boolean functions of n variables = 2^(2^n): 16 for two variables, 256 for three.
- Minterm = product term (SOP, Σm); maxterm = sum term (POS, ΠM).

## 5. Logic gates

| A | B | AND | OR | NAND | NOR | XOR | XNOR |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 0 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 | 0 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 | 0 | 1 |

- NAND and NOR are universal gates: any circuit can be built from either alone.
- Gate counts using NAND only: NOT = 1, AND = 2, OR = 3, XOR = 4. Using NOR only: NOT = 1, OR = 2, AND = 3, XOR = 5.
- Bubbled AND = NOR; bubbled OR = NAND (De Morgan).
- XOR of many inputs is 1 when the number of 1s is odd (odd-parity detector). XNOR is the equality (coincidence) gate.

## 6. Karnaugh maps

- Cells: 2^n (4 for two variables, 8 for three, 16 for four). Rows and columns follow Gray order 00, 01, 11, 10, so neighbours differ in one variable.
- Group 1s in sizes 1, 2, 4, 8, 16 (powers of 2), as large as possible; groups may wrap around edges and corners.
- A group of 2^k cells removes k variables: a pair removes 1, a quad removes 2, an octet removes 3.
- Don't-cares (d or X) may be treated as 1 if they make a bigger group, otherwise ignored.
- The four corners of a 4-variable map (m0, m2, m8, m10) form the quad B'D'.

## 7. Combinational circuits

| Circuit | Inputs to outputs | Key facts |
|---|---|---|
| Half adder | 2 to 2 | Sum = A XOR B, Carry = AB |
| Full adder | 3 to 2 | Sum = A XOR B XOR Cin, Cout = AB + Cin(A XOR B); built from 2 half adders + 1 OR |
| Half subtractor | 2 to 2 | Difference = A XOR B, Borrow = A'B |
| Multiplexer | 2^n data + n select to 1 | Data selector; 8:1 MUX needs 3 select lines |
| Demultiplexer | 1 to 2^n | Data distributor |
| Decoder | n to 2^n | 3-to-8 decoder; 4-to-16 from five 2-to-4 decoders |
| Encoder | 2^n to n | Priority encoder outputs the highest active input |
| Comparator | 2 numbers to >, =, < | Uses XNOR for equality |

- An n-bit ripple-carry adder uses n full adders; its delay grows with n. Carry look-ahead adders compute carries in parallel.

## 8. Sequential circuits: flip-flops, counters, registers

| Flip-flop | Characteristic equation | Special behaviour |
|---|---|---|
| SR | Q+ = S + R'Q (SR = 0) | S = R = 1 invalid |
| JK | Q+ = JQ' + K'Q | J = K = 1 toggles; race-around if level triggered |
| D | Q+ = D | Copies input; used in registers |
| T | Q+ = T XOR Q | T = 1 toggles; divides frequency by 2 |

| JK transition | J | K |
|---|---|---|
| 0 to 0 | 0 | X |
| 0 to 1 | 1 | X |
| 1 to 0 | X | 1 |
| 1 to 1 | X | 0 |

- Latch = level triggered; flip-flop = edge triggered. A flip-flop stores one bit.
- Race-around is removed by master-slave or edge-triggered design.
- Mod-N counter needs the smallest n with 2^n >= N: mod-10 needs 4 flip-flops.
- Ripple (asynchronous) counter: clock goes only to the first flip-flop, each output clocks the next; slower. Synchronous counter: common clock to all.
- Ring counter with n flip-flops: n states. Johnson (twisted-ring) counter: 2n states.
- Shift registers: SISO, SIPO, PISO, PIPO. Shift left = multiply by 2, shift right = divide by 2. Loading n bits serially takes n clock pulses.

## 9. Codes

| Code | Type | Example | Remember |
|---|---|---|---|
| BCD (8421) | Weighted | 59 = 0101 1001 | 1010-1111 are invalid |
| Excess-3 | Non-weighted, self-complementing | 47 = 0111 1010 | Add 3 to each digit |
| Gray | Non-weighted, unit distance | Binary 1011 = Gray 1110 | Used in K-maps and shaft encoders |
| ASCII | 7-bit (128 characters) | A = 65, a = 97, 0 = 48 | Extended ASCII is 8-bit |
| EBCDIC | 8-bit | IBM mainframes | Not ASCII-compatible |
| Unicode | Universal | UTF-8 (1-4 bytes), UTF-16, UTF-32 | Covers Devanagari |

- Binary to Gray: keep MSB, XOR adjacent binary bits. Gray to binary: keep MSB, XOR previous binary bit with next Gray bit.
- Parity: even parity makes the total number of 1s even. A single parity bit detects single-bit errors but cannot correct them; Hamming code can correct one-bit errors.

## 10. Hardware, memory hierarchy, storage units and generations

| Unit | Size |
|---|---|
| Nibble | 4 bits |
| Byte | 8 bits |
| KB | 1024 bytes |
| MB / GB / TB | 1024 KB / 1024 MB / 1024 GB |
| PB / EB / ZB / YB | each 1024 times the previous |

- Hierarchy, fastest to slowest: registers > cache (L1 > L2 > L3) > main memory (RAM) > SSD > hard disk > optical/tape. Cost per bit falls and capacity grows going down.
- SRAM (flip-flops, no refresh, used for cache) vs DRAM (capacitors, needs refresh, used for main memory).
- ROM family: PROM (one-time), EPROM (UV erase), EEPROM (electrical erase), flash (block-wise EEPROM used in pen drives and SSDs).
- Cache works because of locality of reference (temporal and spatial). Mapping: direct, associative, set-associative.
- Memory with k address lines and m data lines stores 2^k x m bits.
- CPU: ALU, CU, registers; PC holds the address of the next instruction, MAR the address being accessed, MDR/MBR the data, IR the current instruction.

| Generation | Technology | Examples |
|---|---|---|
| First (1940-56) | Vacuum tubes, machine language | ENIAC, UNIVAC, EDVAC |
| Second (1956-63) | Transistors, assembly, FORTRAN/COBOL | IBM 1401, IBM 7090 |
| Third (1964-71) | Integrated circuits, operating systems | IBM System/360 |
| Fourth (1971-present) | Microprocessor (VLSI) | Intel 4004, PCs |
| Fifth (present and beyond) | AI, ULSI, parallel processing | Expert systems |

## 11. Frequently asked in DSSSB

- Conversions between binary, octal, decimal and hex, including fractions.
- 2's complement of a number and the 8-bit range -128 to +127.
- Universal gates and minimum NAND/NOR gate counts.
- De Morgan's theorem and simplifications like A + A'B = A + B.
- K-map cell count and grouping results.
- Half adder and full adder expressions; MUX select lines.
- JK toggle condition, SR invalid state, flip-flops needed for a mod-N counter.
- Gray code and BCD conversions; ASCII values.
- Memory hierarchy order, SRAM vs DRAM, EPROM vs EEPROM.
- Generations and their key technology.

## 12. Fifteen one-liners

1. The base of the hexadecimal system is 16.
2. (2F)16 = 47 in decimal.
3. 8-bit 2's complement range is -128 to +127.
4. NAND and NOR are universal gates.
5. A two-input AND built from NAND gates needs 2 gates.
6. A 4-variable K-map has 16 cells.
7. Half adder Sum = A XOR B, Carry = AB.
8. An 8:1 MUX needs 3 select lines.
9. A JK flip-flop with J = K = 1 toggles.
10. A mod-10 counter needs 4 flip-flops.
11. A 4-bit Johnson counter has 8 states.
12. The Gray code of binary 1011 is 1110.
13. ASCII is a 7-bit code; 'A' = 65.
14. DRAM needs refreshing; SRAM does not.
15. Integrated circuits mark the third generation.

## 13. Five traps

1. 1's complement vs 2's complement: 1's only inverts; 2's inverts and adds 1. Options usually contain both.
2. BCD is not binary: 59 in BCD is 0101 1001, not 111011.
3. Gray conversion direction: binary to Gray XORs adjacent binary bits; Gray to binary XORs the running binary bit with the next Gray bit. Mixing them gives a plausible wrong option.
4. Select lines vs data inputs: an 8:1 MUX has 8 data inputs but only 3 select lines; a decoder has n inputs and 2^n outputs.
5. Ring vs Johnson vs binary counter: with 4 flip-flops they give 4, 8 and 16 states respectively.
