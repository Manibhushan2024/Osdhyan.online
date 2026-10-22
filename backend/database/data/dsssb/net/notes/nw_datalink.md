# Data Link Layer, Error Control & Medium Access

**In 30 seconds**
- The data link layer (OSI layer 2) gives **node-to-node (hop-to-hop) delivery** of **frames**: framing, physical (MAC) addressing, flow control, error control and medium access.
- IEEE splits it into two sublayers: **LLC** (logical link control, upper) and **MAC** (media access control, lower).
- **Error control is based on ARQ — Automatic Repeat reQuest = retransmission of damaged/lost frames.** ⭐ Asked in DSSSB
- **Flow control** = sender must not overwhelm the receiver; **error control** = detect and retransmit.
- Detection: parity, checksum, **CRC**; correction: **Hamming code** (2^r ≥ m + r + 1).
- ARQ windows: Stop-and-Wait = 1; **Go-Back-N ≤ 2^m − 1**; **Selective Repeat ≤ 2^(m−1)**.
- Random access: ALOHA (pure 18.4%, slotted 36.8%), CSMA, **CSMA/CD (Ethernet)**, **CSMA/CA (Wi-Fi)**.
- Channelization: FDMA, **TDMA (same frequency, different time slots)**, CDMA (codes). ⭐ Asked in DSSSB

---

## 1. Role and sublayers

| Function | What it means |
|---|---|
| **Framing** | Divide the bit stream into frames with header/trailer |
| **Physical addressing** | Add source and destination **MAC** addresses of the hop |
| **Flow control** | Stop a fast sender from flooding a slow receiver |
| **Error control** | Detect damaged/lost/duplicate frames and **retransmit (ARQ)** |
| **Access control** | Decide who uses a shared medium (MAC protocols) |

| Sublayer | IEEE | Job |
|---|---|---|
| **LLC** (upper) | IEEE 802.2 | Flow and error control, interface to network layer, multiplexes network protocols — common to all LANs |
| **MAC** (lower) | 802.3, 802.11, 802.5 … | Medium-access method, framing format, MAC addressing — differs per LAN type |

- PDU = **frame**. Devices: **bridge, (layer-2) switch, NIC**. (Hub and repeater = physical layer.)
- **Error and flow control are NOT network-layer functions** (DSSSB 2023 asked this) — they belong to the data link layer (hop) and transport layer (end-to-end).

---

## 2. Framing

| Type | Idea | Example |
|---|---|---|
| Fixed-size | No boundaries needed; size itself delimits | **ATM cell (53 bytes)** |
| Character count | Header says how many characters follow | Early protocols (fails if count is corrupted) |
| **Character-oriented (byte stuffing)** | 8-bit flag byte marks start/end; an **ESC** byte is stuffed before any flag/ESC inside the data | **PPP** |
| **Bit-oriented (bit stuffing)** | Flag **01111110**; after **five consecutive 1s** in data, sender stuffs a **0** | **HDLC** |

### Byte stuffing (worked)
Data: `A FLAG B ESC C` → sent: `FLAG | A ESC FLAG B ESC ESC C | FLAG`.
Receiver removes each ESC and treats the next byte as data. (PPP: flag 0x7E, escape 0x7D.)

### Bit stuffing (worked)
- Rule: after 5 consecutive 1s, insert a 0 (whatever the next bit is). Receiver deletes the 0 that follows five 1s.
- **Data:** `0001111111001111101000`
- Scan: `00011111` → five 1s → stuff 0 → `000111110`; continue `11001111 1` → five 1s again → stuff 0.
- **Sent:** `000111110110011111001000` (two 0s added).
- **Second example:** data `01111110111111` (looks like a flag) → sent `0111110101111101`. The flag pattern can never appear inside data.

---

## 3. Errors

| Type | Meaning | Where common |
|---|---|---|
| **Single-bit error** | Only 1 bit changes | Rare in serial links (noise usually lasts longer than one bit) |
| **Burst error** | 2 or more bits change; **burst length** = first corrupted bit to last corrupted bit | Most common |

**Worked:** noise lasting 1/100 s corrupts 0.01 × 1000 = **10 bits** at 1 kbps but **10,000 bits** at 1 Mbps. Higher rate → longer bursts.

- **Redundancy** (extra bits) makes detection/correction possible. Detection says *whether* an error occurred; correction finds *which* bits.
- Correction methods: **retransmission (ARQ)** or **forward error correction (FEC)** (e.g., Hamming).
- Coding: block coding (dataword k bits → codeword n bits, r = n − k redundant) and convolution coding.

---

## 4. Error detection

### 4.1 Parity check
- **Simple (even) parity:** add 1 bit so the total number of 1s is even. `1011001` has four 1s → parity **0** → `10110010`.
- Detects **all odd numbers of bit errors**; **misses any even number** (2, 4 …).
- **Two-dimensional parity:** row parity + column parity.

| Data (7 bits) | Row parity |
|---|---|
| 1100111 | 1 |
| 1011101 | 1 |
| 0111001 | 0 |
| 0101001 | 1 |
| **Column parity: 0101010** | **1** |

- 2-D parity detects all 1-, 2- and 3-bit errors; **some 4-bit errors (rectangle pattern) go undetected**.

### 4.2 Checksum (worked, one's-complement)
**4-bit example:** data 7, 11, 12, 0, 6.
1. Sum = 7 + 11 + 12 + 0 + 6 = **36** = `100100`.
2. Wrap the extra bits: `0100` + `10` = `0110` = **6**.
3. Checksum = complement = 15 − 6 = **9** (`1001`). Send 7, 11, 12, 0, 6, **9**.
4. Receiver: 7+11+12+0+6+9 = 45 = `101101` → `1101` + `10` = `1111` → complement = **0000 → accept**.

**8-bit example:** words `10011001`, `11100010`, `00100100`.
Sum = `1 10011111` → wrap → `10011111 + 1` = `10100000` → checksum = **`01011111`**. Receiver's complemented sum = `00000000` ✓.

- The Internet checksum (IP, TCP, UDP) uses the same idea with **16-bit words**.

### 4.3 Cyclic Redundancy Check (CRC)
- Sender appends **r zeros** (r = degree of generator = generator bits − 1), divides using **modulo-2 (XOR) division**, and replaces the zeros with the **remainder**.
- Receiver divides the codeword by the same generator: **remainder 0 → accept**, non-zero → error.
- Generator polynomial ↔ bits: **x³ + x² + 1 = 1101**; x³ + x + 1 = 1011; x⁴ + x + 1 = 10011.

**Worked division:** data `100100`, generator `1101` (x³ + x² + 1), r = 3 → dividend `100100000`.

| Step | Bits under divisor | XOR with | Result |
|---|---|---|---|
| 1 | 1001 | 1101 | 0100 → bring down → 1000 |
| 2 | 1000 | 1101 | 0101 → bring down → 1010 |
| 3 | 1010 | 1101 | 0111 → bring down → 1110 |
| 4 | 1110 | 1101 | 0011 → bring down two bits (leading 0 gives quotient bit 0) → 1100 |
| 5 | 1100 | 1101 | **001 = remainder** |

- Quotient = `111011` (not needed); **remainder = 001** → **codeword = 100100 001**.
- Receiver check: `100100001 ÷ 1101` → remainder `000` ✓. If a bit flips (`100000001`), remainder = `011` → error detected.
- Other verified results: `1001` with `1011` → remainder **110**, codeword `1001110`; `1101011011` with `10011` → remainder **1110**, codeword `11010110111110` (Tanenbaum).

**CRC power:** detects all single-bit errors, all double-bit errors (with a good generator), all odd-number errors if (x + 1) is a factor, and **all burst errors of length ≤ r**. Ethernet and Wi-Fi use **CRC-32**; HDLC uses CRC-16 (CCITT).

---

## 5. Error correction: Hamming code

### 5.1 How many parity (redundant) bits?
**2^r ≥ m + r + 1** (m data bits, r parity bits).

| Data bits m | Parity bits r | Codeword n |
|---|---|---|
| 4 | 3 | 7 — Hamming (7,4) |
| 7 (ASCII) | 4 | 11 |
| 8 | 4 | 12 |
| 16 | 5 | 21 |
| 32 | 6 | 38 |
| 64 | 7 | 71 |

Check m = 4: r = 2 → 4 ≥ 7? No. r = 3 → 8 ≥ 8 ✓.

### 5.2 Worked Hamming (7,4), even parity
- Parity bits sit at **powers of 2**: positions 1, 2, 4. Data at 3, 5, 6, 7.
- P1 checks positions 1, 3, 5, 7; P2 checks 2, 3, 6, 7; P4 checks 4, 5, 6, 7.
- **Data 1011** → D3 = 1, D5 = 0, D6 = 1, D7 = 1.
  - P1 = D3 ⊕ D5 ⊕ D7 = 1 ⊕ 0 ⊕ 1 = **0**
  - P2 = D3 ⊕ D6 ⊕ D7 = 1 ⊕ 1 ⊕ 1 = **1**
  - P4 = D5 ⊕ D6 ⊕ D7 = 0 ⊕ 1 ⊕ 1 = **0**
  - **Codeword (positions 1→7): 0 1 1 0 0 1 1**
- **Error at position 5** → received `0110111`.
  - C1 (1,3,5,7) = 0⊕1⊕1⊕1 = 1; C2 (2,3,6,7) = 1⊕1⊕1⊕1 = 0; C4 (4,5,6,7) = 0⊕1⊕1⊕1 = 1.
  - Syndrome C4C2C1 = **101 = 5** → flip bit 5 → corrected. Syndrome 000 = no error.
- (Books differ on where data bits go; the method is the same.)

### 5.3 Hamming distance
- **d(x, y)** = number of positions where two codewords differ = number of 1s in x ⊕ y. **Worked:** d(10101, 11110): XOR = 01011 → **3**.
- **d_min** = smallest distance between any two valid codewords. Code {00000, 01011, 10101, 11110} → d_min = **3**.

| Goal | Condition | d_min = 3 gives | d_min = 4 gives | d_min = 5 gives |
|---|---|---|---|---|
| **Detect s errors** | **d_min ≥ s + 1** | detect 2 | detect 3 | detect 4 |
| **Correct t errors** | **d_min ≥ 2t + 1** | correct 1 | correct 1 | correct 2 |

- Simple parity code: d_min = 2 → detects 1, corrects 0. Hamming (7,4): d_min = 3.

---

## 6. Flow control vs error control ⭐ Asked in DSSSB

| | Flow control | Error control |
|---|---|---|
| Question answered | "**How much** may the sender send before waiting?" | "**Did it arrive correctly**? If not, resend." |
| Mechanism | Window / ACK pacing, receiver buffer | **ARQ** (ACK, NAK, timer, retransmission) + CRC |
| Protects against | Buffer overflow at receiver | Damaged, lost, duplicate frames |
| DSSSB answer | — | "**Error control** is based on automatic repeat request" (2024) |

**ARQ = Automatic Repeat reQuest**: the receiver detects errors (CRC) and the sender **retransmits** frames that are damaged, lost or not acknowledged before the **timer** expires. Sequence numbers prevent duplicates. ⭐ Asked in DSSSB

Protocols (Forouzan): **noiseless** — Simplest, Stop-and-Wait; **noisy** — Stop-and-Wait ARQ, Go-Back-N ARQ, Selective Repeat ARQ.

| Protocol | Sender window | Receiver window | Sequence numbers (m bits) | On error |
|---|---|---|---|---|
| **Stop-and-Wait ARQ** | 1 | 1 | 0, 1 (m = 1) | Resend the one frame after timeout |
| **Go-Back-N ARQ** | **≤ 2^m − 1** | 1 | 0 … 2^m − 1 | Resend the lost frame **and all after it** |
| **Selective Repeat ARQ** | **≤ 2^(m−1)** | = sender window | 0 … 2^m − 1 | Resend **only** the damaged/lost frame (uses **NAK**) |

| m | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| GBN max window | 1 | 3 | **7** | 15 | 31 | 63 | 127 |
| SR max window | 1 | 2 | **4** | 8 | 16 | 32 | 64 |

- **GBN worked:** m = 3, sender sends frames 0–6; frame 3 is lost → after timeout it resends **3, 4, 5, 6** (4 frames). Selective Repeat would resend **only 3**.
- GBN uses **cumulative ACKs**; receiver discards out-of-order frames (simple receiver, more bandwidth wasted). SR buffers out-of-order frames (complex receiver, efficient on noisy links).

### Efficiency numerical
- Tt = frame size / bandwidth; Tp = distance / speed; **a = Tp / Tt**.
- **Stop-and-Wait efficiency η = 1 / (1 + 2a)**; window protocols **η = W / (1 + 2a)** (max 1). Throughput = η × bandwidth.

**Worked:** frame 1000 bits, link 1 Mbps, Tp = 10 ms.
1. Tt = 1000 / 10⁶ = **1 ms**; a = 10 / 1 = **10**.
2. Stop-and-Wait: η = 1 / 21 = **4.76%** → throughput ≈ **47.6 kbps**.
3. To reach 100%: W ≥ 1 + 2a = **21 frames** → GBN needs 2^m − 1 ≥ 21 → **m = 5**; SR needs 2^(m−1) ≥ 21 → **m = 6**.
4. GBN with m = 3 (W = 7): η = 7 / 21 = **33.3%** → ≈ 333 kbps.

Forouzan's bandwidth-delay view: 1 Mbps, round trip 20 ms → BDP = 20,000 bits; a 1000-bit Stop-and-Wait frame uses 1000/20,000 = **5%** of the link.

- **Piggybacking**: the ACK rides inside a data frame going the other way — saves bandwidth in bidirectional traffic.

---

## 7. HDLC and PPP

### HDLC (High-level Data Link Control) — bit-oriented, ISO
- Frame: **Flag (01111110) | Address | Control | Information | FCS (CRC) | Flag**.
- Configurations/modes: **NRM** (Normal Response Mode — unbalanced, a primary station polls secondaries; point-to-point or multipoint) and **ABM** (Asynchronous Balanced Mode — combined stations, peers, point-to-point). (ISO also defines ARM, rarely used.)

| Frame | Control field starts | Carries |
|---|---|---|
| **I-frame** (information) | 0 | User data + piggybacked ACK (N(S), N(R)) |
| **S-frame** (supervisory) | 10 | Control only: **RR** (receive ready), **RNR** (receive not ready), **REJ** (reject = Go-Back-N), **SREJ** (selective reject) |
| **U-frame** (unnumbered) | 11 | Link management: SNRM, SABM, DISC, UA … |

### PPP (Point-to-Point Protocol) — byte-oriented
- Used on dial-up, DSL (PPPoE) and router-to-router serial links.
- Frame: Flag **0x7E** | Address **0xFF** (broadcast) | Control **0x03** | Protocol (2 bytes) | Payload (default max 1500 bytes) | FCS (2 or 4 bytes) | Flag.
- Sub-protocols: **LCP** (Link Control Protocol — set up/test link), authentication **PAP** (two-way, password in plaintext) and **CHAP** (three-way challenge–response, more secure), **NCP** (e.g., **IPCP** to configure IP).
- Phases: dead → establish → authenticate → network → open → terminate.
- PPP provides **error detection (FCS) but no flow control and no retransmission**; corrupted frames are silently dropped. No MAC addressing needed (only two parties).

---

## 8. Multiple access (medium access control)

```
Multiple-access protocols
├── Random access:     ALOHA, CSMA, CSMA/CD, CSMA/CA
├── Controlled access: Reservation, Polling, Token passing
└── Channelization:    FDMA, TDMA, CDMA
```

### 8.1 ALOHA
- **Pure ALOHA** (University of Hawaii, 1970): send whenever ready; collision → wait random back-off and resend. **Vulnerable time = 2 × Tfr**. Throughput **S = G·e^(−2G)**, max at G = 0.5 → **1/(2e) = 18.4%**.
- **Slotted ALOHA**: send only at slot start. **Vulnerable time = Tfr**. **S = G·e^(−G)**, max at G = 1 → **1/e = 36.8%**.
- G = average frames generated per frame time.

**Worked:** 200-bit frames on a 200 kbps channel → Tfr = 1 ms (capacity 1000 frames/s); pure-ALOHA vulnerable time = 2 ms.

| Offered load | G | Pure ALOHA S | Successful frames/s | Slotted S | Successful frames/s |
|---|---|---|---|---|---|
| 1000 frames/s | 1 | e⁻² = 0.135 | **≈ 135** | e⁻¹ = 0.368 | **≈ 368** |
| 500 frames/s | 0.5 | 0.184 (max) | **≈ 184** | 0.303 | ≈ 303 |
| 250 frames/s | 0.25 | 0.152 | ≈ 152 | 0.195 | ≈ 195 |

(Successful frames/s = S × channel capacity = S × 1000. Some guides instead multiply S by the offered load, e.g., 500 × 0.184 = 92; the frame count above is the consistent one, and the percentage S is what MCQs ask.)

### 8.2 CSMA — "listen before talk"
Reduces (not removes) collisions; vulnerable time = **propagation time Tp**.

| Persistence | If channel busy | If idle | Trade-off |
|---|---|---|---|
| **1-persistent** | Keep sensing continuously | Send immediately (prob. 1) | Highest collision chance; used by Ethernet |
| **Non-persistent** | Wait a **random** time, then sense again | Send immediately | Fewer collisions, lower efficiency (idle gaps) |
| **p-persistent** | Keep sensing | Send with probability **p**; with 1 − p wait for next slot | For slotted channels; balances both |

### 8.3 CSMA/CD — Collision Detection (classic wired Ethernet)
- Station transmits while monitoring; on collision it sends a **jam signal**, aborts, and uses **binary exponential back-off**: after the n-th collision pick K at random from 0 … 2^n − 1 (n capped at 10), wait K × slot time; give up after 15 retries.
- **Minimum frame size condition:** the sender must still be transmitting when the collision news returns → **Tfr ≥ 2 × Tp**, i.e., **L_min = 2 × Tp × R**.
- **Worked 1 (10 Mbps Ethernet):** 2 × Tp (worst case incl. repeater delays) = **51.2 μs** → L_min = 10⁷ × 51.2 × 10⁻⁶ = **512 bits = 64 bytes**.
- **Worked 2:** 1 Gbps, 1 km cable, speed 2 × 10⁸ m/s → Tp = 5 μs → L_min = 2 × 5×10⁻⁶ × 10⁹ = **10,000 bits = 1250 bytes**.
- Works only on wired media where a station can hear while sending. **Not needed on full-duplex switched Ethernet.**

### 8.4 CSMA/CA — Collision Avoidance (Wi-Fi, IEEE 802.11)
- Wireless stations cannot detect collisions reliably (signal too weak, **hidden-station problem**), so they **avoid** them:
  - **IFS (interframe space)**: wait DIFS after sensing idle; SIFS (shorter) before CTS/ACK/data → priority to replies.
  - **Contention window**: random number of slots; timer pauses while the channel is busy.
  - **Positive ACK**: no ACK → assume collision → retransmit.
  - **RTS/CTS** handshake + **NAV** (network allocation vector): others stay quiet for the announced time. Solves the **hidden-station** problem.

| | CSMA/CD | CSMA/CA |
|---|---|---|
| Medium | Wired (Ethernet 802.3) | Wireless (Wi-Fi 802.11) |
| Approach | Detect collision, then recover | Avoid collision before it happens |
| Tools | Jam signal, back-off | IFS, contention window, ACK, RTS/CTS |

### 8.5 Controlled access
| Method | How | Example |
|---|---|---|
| **Reservation** | A reservation frame with one mini-slot per station precedes data frames | Satellite links |
| **Polling** | **Primary** controls the link: **poll** (asks secondaries "anything to send?") and **select** (tells a secondary to receive) | HDLC NRM, Bluetooth |
| **Token passing** | A special frame (**token**) circulates in a **logical ring**; only the holder sends | **Token Ring (802.5)**, Token Bus (802.4), FDDI |

### 8.6 Channelization ⭐ Asked in DSSSB
| Method | Shares by | Key point |
|---|---|---|
| **FDMA** | **Frequency** — each user gets its own band (+ guard bands), all the time | 1G analog cellular (AMPS) |
| **TDMA** | **Time** — users share the **same frequency channel**, each gets its own **time slot** | **GSM (8 slots per 200 kHz carrier)**, needs synchronisation and guard times. **DSSSB 2023 answer** |
| **CDMA** | **Code** — everyone uses the whole band at the same time with **orthogonal codes** | IS-95, 3G (WCDMA) |

**CDMA worked (4 stations, Walsh codes):** C1 = [+1 +1 +1 +1], C2 = [+1 −1 +1 −1], C3 = [+1 +1 −1 −1], C4 = [+1 −1 −1 +1]. Bit 0 → −1, bit 1 → +1, silent → 0.
- Station 1 sends 0 (−1), station 2 sends 1 (+1), station 3 silent (0), station 4 sends 1 (+1).
- Channel = (−1)C1 + (+1)C2 + 0·C3 + (+1)C4 = **[+1, −3, −1, −1]**.
- Recover station 2: ([+1, −3, −1, −1] · [+1 −1 +1 −1]) / 4 = (1 + 3 − 1 + 1)/4 = **+1 → bit 1** ✓. Station 3 gives 0 → silent.
- Walsh codes: W₁ = [+1]; W₂ₙ = [[Wₙ, Wₙ], [Wₙ, −Wₙ]]. Any two codes are **orthogonal** (inner product 0); number of stations must be a power of 2.

---

## 9. Ethernet (IEEE 802.3)

- **MAC address = 48 bits (6 bytes)**, written as 12 hex digits, e.g., `4A:30:10:21:10:1A`. First 24 bits = **OUI** (manufacturer). Total addresses 2⁴⁸ ≈ 2.8 × 10¹⁴.
- Least significant bit of the **first byte**: 0 = **unicast**, 1 = **multicast**; all 1s (`FF:FF:FF:FF:FF:FF`) = **broadcast**.
  - `4A` = 0100 101**0** → unicast. `47` = 0100 011**1** → multicast.
- **Frame format:**

| Preamble | SFD | Destination | Source | Type/Length | Data + padding | CRC |
|---|---|---|---|---|---|---|
| 7 bytes | 1 byte | 6 | 6 | 2 | **46–1500** | 4 (CRC-32) |

- Frame size (destination → CRC): **minimum 64 bytes** (6+6+2+46+4), **maximum 1518 bytes** (6+6+2+1500+4). Preamble/SFD are not counted (physical-layer add-on). Data < 46 bytes is padded. MTU = 1500 bytes.

| Standard | Speed | Medium | Max segment | Notes |
|---|---|---|---|---|
| 10Base5 | 10 Mbps | Thick coax (RG-11) | 500 m | Bus |
| 10Base2 | 10 Mbps | Thin coax (RG-58) | 185 m | Bus |
| **10Base-T** | 10 Mbps | **Cat 3 UTP**, 2 pairs | 100 m | Star (hub), Manchester |
| 10Base-F | 10 Mbps | Fibre | 2000 m | Star |
| **100Base-TX** | 100 Mbps (Fast) | **Cat 5 UTP / STP**, 2 pairs | 100 m | 4B/5B + MLT-3 |
| 100Base-FX | 100 Mbps | Fibre | ~2 km | 4B/5B + NRZ-I |
| **1000Base-T** | 1 Gbps (Gigabit) | **Cat 5e/6 UTP, 4 pairs** | 100 m | 4D-PAM5 |
| 1000Base-SX / LX | 1 Gbps | Multimode / single-mode fibre | 550 m / 5 km | Short / long wave |
| 10GBase-T / SR / LR | 10 Gbps | Cat 6a / fibre | 100 m / 300 m / 10 km | Full duplex only |

- Name decoding: **10Base-T** = 10 Mbps, **Base**band, **T**wisted pair. (5/2 = 500/185 m coax.)
- **Switched Ethernet**: each switch port is its own collision domain; **full-duplex** links → no collisions → **CSMA/CD not used**. A hub forms one collision domain; a switch breaks collision domains, a router breaks broadcast domains.

## 10. Wireless LAN (IEEE 802.11) and Bluetooth

| Standard | Year | Band | Max rate | Technique |
|---|---|---|---|---|
| 802.11 (legacy) | 1997 | 2.4 GHz (and IR) | 1–2 Mbps | FHSS / DSSS |
| **802.11b** | 1999 | 2.4 GHz | **11 Mbps** | DSSS |
| **802.11a** | 1999 | **5 GHz** | **54 Mbps** | OFDM |
| **802.11g** | 2003 | 2.4 GHz | **54 Mbps** | OFDM |
| **802.11n (Wi-Fi 4)** | 2009 | 2.4 + 5 GHz | up to 600 Mbps | **MIMO**, OFDM |
| **802.11ac (Wi-Fi 5)** | 2013 | 5 GHz | up to ~6.9 Gbps | MU-MIMO, wider channels |
| **802.11ax (Wi-Fi 6/6E)** | 2019/2020 | 2.4 + 5 (+ 6 GHz for 6E) | up to ~9.6 Gbps | **OFDMA** |

- Architecture: **BSS** (basic service set — stations + optional **AP**); BSS without AP = **ad hoc** (IBSS); **ESS** = several BSSs joined by a distribution system.
- MAC: **DCF** (CSMA/CA, mandatory) and **PCF** (polling by AP, optional). An 802.11 frame can carry **4 address fields**.

**Bluetooth (IEEE 802.15.1)** — wireless PAN, 2.4 GHz ISM band, **FHSS (79 channels of 1 MHz, 1600 hops/s)**, range ≈ 10 m.
- **Piconet:** **1 primary (master) + up to 7 active secondaries = up to 8 devices**; up to 255 more can be *parked*.
- **Scatternet:** piconets joined together — a secondary in one piconet can be the primary of another.
- Layers: radio, baseband (TDD-TDMA), L2CAP. Basic rate 1 Mbps (EDR 2–3 Mbps); **Bluetooth Low Energy** for wearables.

## 11. VLAN and ARP

**VLAN (Virtual LAN)**
- Splits one physical switched LAN into **separate logical LANs (broadcast domains)** by software, not wiring.
- Membership by port, MAC address, IP address or multicast group.
- **IEEE 802.1Q** tagging inserts a 4-byte tag; **VLAN ID = 12 bits → 4096 values, 4094 usable**. Trunk links carry many VLANs.
- Benefits: less broadcast traffic, security, easy regrouping. Traffic between VLANs needs a **router or layer-3 switch**.

**ARP (cross-reference: nw_network)**
- **ARP maps an IP (logical) address → MAC (physical) address** inside one network.
- **Request = broadcast** ("Who has 192.168.1.5?"); **reply = unicast** with the MAC. Results are cached in the ARP table.
- ARP messages are carried directly in an Ethernet frame (EtherType 0x0806). **RARP** does the reverse (MAC → IP), now replaced by BOOTP/DHCP.

---

## Exam traps
1. **ARQ = retransmission → error control**, not flow control or framing (DSSSB 2024).
2. Error and flow control are **data-link (and transport)** functions, **not network-layer** functions.
3. **TDMA** = same frequency, different time slots; **FDMA** = different frequencies; NDMA and PDMA do not exist.
4. Go-Back-N window is **2^m − 1**; Selective Repeat is **2^(m−1)** — don't swap them. For m = 3: 7 vs 4.
5. Bit stuffing inserts a 0 after **five** 1s (not six); the flag itself has six 1s.
6. Simple parity **cannot detect an even number** of bit errors.
7. In CRC, append **(generator length − 1)** zeros, i.e., the polynomial's degree, not the generator length.
8. Detect s errors: d_min = **s + 1**; correct t errors: d_min = **2t + 1**.
9. Pure ALOHA max **18.4%** (vulnerable 2 Tfr); slotted **36.8%** (vulnerable Tfr).
10. **CSMA/CD → wired Ethernet; CSMA/CA → Wi-Fi.** RTS/CTS solves the hidden-station problem.
11. Ethernet frame 64–1518 bytes **excludes** the 8-byte preamble + SFD; payload 46–1500 bytes.
12. Bluetooth piconet = **8 active devices** (1 primary + 7 secondaries), not 7 or 255.

## One-liners for revision
1. Data link layer = hop-to-hop delivery of frames.
2. Sublayers: LLC (802.2) above MAC.
3. Layer-2 devices: bridge, switch; layer-1: hub, repeater.
4. ATM uses fixed-size 53-byte cells.
5. PPP = byte stuffing (flag 0x7E, ESC 0x7D).
6. HDLC = bit stuffing, flag 01111110.
7. Burst error length = first to last corrupted bit.
8. Parity detects odd numbers of errors only.
9. 2-D parity can miss a 4-bit rectangle error.
10. Checksum uses one's-complement addition; Internet checksum is 16-bit.
11. CRC uses modulo-2 (XOR) division.
12. CRC detects all bursts of length ≤ degree r.
13. Ethernet uses CRC-32.
14. Hamming parity bits: 2^r ≥ m + r + 1.
15. 4 data bits → 3 parity bits (7,4); 7 data bits → 4.
16. Hamming parity bits sit at positions 1, 2, 4, 8 …
17. Syndrome gives the position of the wrong bit.
18. Hamming distance = number of 1s in XOR.
19. ARQ = Automatic Repeat reQuest.
20. Stop-and-Wait window = 1; sequence numbers 0 and 1.
21. GBN resends the lost frame and all after it.
22. Selective Repeat resends only the lost frame; uses NAK.
23. Stop-and-Wait efficiency = 1/(1 + 2a), a = Tp/Tt.
24. Piggybacking = ACK carried in a data frame.
25. HDLC frames: I, S, U; modes NRM and ABM.
26. S-frames: RR, RNR, REJ, SREJ.
27. PPP authentication: PAP (2-way), CHAP (3-way).
28. Pure ALOHA S = G e^(−2G); slotted S = G e^(−G).
29. 1-persistent CSMA sends immediately when idle.
30. CSMA/CD minimum frame: L = 2 × Tp × R → 64 bytes on 10 Mbps Ethernet.
31. Binary exponential back-off: K from 0 to 2^n − 1.
32. CSMA/CA uses IFS, contention window, ACK, RTS/CTS.
33. Token passing → Token Ring 802.5, FDDI.
34. Polling: poll and select functions of the primary.
35. CDMA codes are orthogonal Walsh sequences.
36. MAC address = 48 bits; broadcast = FF:FF:FF:FF:FF:FF.
37. Ethernet frame: min 64, max 1518 bytes.
38. 802.11a = 5 GHz 54 Mbps; 802.11b = 2.4 GHz 11 Mbps; 802.11g = 2.4 GHz 54 Mbps.
39. VLAN ID = 12 bits (802.1Q).
40. ARP: IP → MAC; request broadcast, reply unicast.

## Quick self-check
1. In the data link layer, which function is based on automatic repeat request? — **Error control.**
2. Bit-stuff the data `0111111111` (a 0 then nine 1s). — A 0 is stuffed after the first five 1s: **`01111101111`**.
3. How many parity bits for 16 data bits in Hamming code? — **5** (2⁵ = 32 ≥ 22).
4. d_min of a code is 5. Errors it can correct? — **2** (5 ≥ 2×2 + 1).
5. Maximum sender window in Go-Back-N with 4-bit sequence numbers? — **15.** In Selective Repeat? — **8.**
6. Maximum throughput of slotted ALOHA? — **36.8% (1/e).**
7. Minimum Ethernet frame for 100 Mbps, 2 km, 2 × 10⁸ m/s? — Tp = 10 μs → 2 × 10⁻⁵ × 10⁸ = **2000 bits (250 bytes).**
8. Which access method lets users share the same frequency using different time slots? — **TDMA.**
9. Maximum devices in an active Bluetooth piconet? — **8** (1 primary + 7 secondaries).
10. Is `47:20:1B:2E:08:EE` unicast or multicast? — 47 = 0100 0111, LSB 1 → **multicast.**
