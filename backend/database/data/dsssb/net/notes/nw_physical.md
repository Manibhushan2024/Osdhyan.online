# Physical Layer: Signals, Transmission Media & Switching

**In 30 seconds**
- The physical layer (OSI layer 1) moves a **raw bit stream** as signals: voltages on copper, light in fibre, radio waves in air. A **repeater** works only at this layer. ⭐ Asked in DSSSB
- A sine wave is described by exactly **three parameters: peak amplitude, frequency (f = 1/T) and phase**. Wavelength is a *derived* characteristic, not one of the three. ⭐ Asked in DSSSB
- **Wavelength λ = propagation speed × period = c / f.** ⭐ Asked in DSSSB
- Data-rate limits: **Nyquist (noiseless) = 2B log₂L**; **Shannon (noisy) = B log₂(1 + SNR)**, where SNR is a plain ratio, not dB.
- Guided media: twisted pair (rated by **Category**), coaxial (rated by **RG = Radio Government**), optical fibre (core refractive index **>** cladding, so **total internal reflection**). ⭐ Asked in DSSSB
- Unguided media carry electromagnetic waves **without a physical conductor**, by ground, sky or line-of-sight propagation. ⭐ Asked in DSSSB
- Multiplexing: FDM (analog), WDM (light), TDM (digital). Spread spectrum: FHSS and DSSS.
- Switching: circuit, packet (datagram = no setup; virtual circuit = **setup required**), message. ⭐ Asked in DSSSB

---

## 1. Data and signals

| Term | Analog | Digital |
|---|---|---|
| Data | Continuous (human voice) | Discrete (text in memory, 0/1) |
| Signal | Infinitely many values in a range | Limited number of levels (e.g., 2) |

- **Periodic signal**: repeats a pattern every period. **Aperiodic**: no repeating pattern.
- In data communication we commonly use **periodic analog signals** (a carrier) and **aperiodic digital signals** (data).

### 1.1 Sine wave: the three describing parameters ⭐ Asked in DSSSB

| Parameter | Meaning | Unit |
|---|---|---|
| **Peak amplitude** | Highest intensity (strength) of the signal | volts (or watts) |
| **Frequency f** | Cycles per second; **f = 1/T** | hertz (Hz) |
| **Phase** | Position of the wave relative to time 0 | degrees or radians |

- **Period T** is just the other face of frequency (T = 1/f), so "frequency/period" count as one parameter.
- **Wavelength is NOT one of the three parameters** (DSSSB 2024 official key). It depends on the medium too.
- Phase: 360° = 2π rad = one full cycle. **Example:** shift of 1/6 cycle = 360/6 = **60° = π/3 ≈ 1.047 rad**.
- Frequency 0 = signal never changes. Infinite frequency = changes instantly.

| Unit of period | Equivalent | Unit of frequency | Equivalent |
|---|---|---|---|
| ms | 10⁻³ s | kHz | 10³ Hz |
| μs | 10⁻⁶ s | MHz | 10⁶ Hz |
| ns | 10⁻⁹ s | GHz | 10⁹ Hz |
| ps | 10⁻¹² s | THz | 10¹² Hz |

**Worked:** T = 1 ms → f = 1/10⁻³ = **1000 Hz = 1 kHz**.

### 1.2 Wavelength ⭐ Asked in DSSSB

**λ = propagation speed × period = propagation speed / frequency** (in air/vacuum: λ = c/f, c = 3 × 10⁸ m/s).

- **Worked 1:** FM signal f = 100 MHz in air → λ = 3×10⁸ / 10⁸ = **3 m**.
- **Worked 2:** red light f = 4 × 10¹⁴ Hz → λ = 3×10⁸ / 4×10¹⁴ = 0.75 × 10⁻⁶ m = **0.75 μm**.
- Trap option: "speed × frequency" is wrong (that would grow with frequency).

### 1.3 Time domain vs frequency domain
- **Time-domain plot**: amplitude vs time (shows the shape).
- **Frequency-domain plot**: peak amplitude vs frequency. A pure sine wave is a **single spike**.
- **Composite signal**: made of many sine waves (Fourier analysis). Periodic composite → **discrete** frequencies; aperiodic composite → **continuous** range.

### 1.4 Bandwidth (Hz vs bps)
- **Bandwidth in Hz** = highest frequency − lowest frequency of a composite signal or channel.
  **Worked:** components at 100, 300, 500, 700, 900 Hz → B = 900 − 100 = **800 Hz**.
- **Bandwidth in bps** = the bit rate a channel/link can carry. The two are proportional.
- A digital signal theoretically needs infinite bandwidth; a **low-pass** channel (starts at 0 Hz) suits it. A **band-pass** channel (does not start at 0) needs modulation.

### 1.5 Bit rate, bit length, baud rate

| Quantity | Formula | Unit |
|---|---|---|
| Bit rate N | bits sent per second | bps |
| Bit interval | 1/N | s |
| Bit length | propagation speed × bit duration | metres |
| Baud (signal) rate S | signal elements per second = N / r, r = bits per signal element = log₂L | baud |

- **Worked (bit rate):** 100 pages/s, 24 lines/page, 80 characters/line, 8 bits/character → 100 × 24 × 80 × 8 = **1,536,000 bps ≈ 1.536 Mbps**.
- **Worked (bit length):** 1 Mbps on a cable with speed 2 × 10⁸ m/s → bit duration 1 μs → bit length = 2×10⁸ × 10⁻⁶ = **200 m**.
- **Worked (baud):** 4800 bps using 16-QAM (log₂16 = 4 bits per signal element) → S = 4800/4 = **1200 baud**.
- **Worked (reverse):** 1000 signal elements/s, each carrying 4 bits → N = **4000 bps**.
- Baud rate ≤ bit rate when each element carries ≥ 1 bit. Bandwidth needed depends on **baud**, not bit rate.

---

## 2. Data-rate limits

### 2.1 Nyquist bit rate (noiseless channel)
**BitRate = 2 × B × log₂L** (B in Hz, L = number of signal levels)

| Example | Working | Answer |
|---|---|---|
| B = 3000 Hz, L = 2 | 2 × 3000 × 1 | **6000 bps** |
| B = 3000 Hz, L = 4 | 2 × 3000 × 2 | **12,000 bps** |
| Send 265 kbps over B = 20 kHz, how many levels? | 265,000 = 2 × 20,000 × log₂L → log₂L = 6.625 → L ≈ 98.7 | Not a power of 2: use **128 levels (280 kbps)** or 64 levels (240 kbps) |

- More levels = higher rate but the receiver must distinguish them; noise limits this in practice.

### 2.2 Shannon capacity (noisy channel)
**C = B × log₂(1 + SNR)** — the theoretical **maximum**; independent of number of levels.

- **SNR_dB = 10 log₁₀(SNR)** → SNR = 10^(SNR_dB/10). Always convert dB to a ratio first.
- Shortcut when SNR ≫ 1: **C ≈ B × SNR_dB / 3**.

| Example | Working | Answer |
|---|---|---|
| SNR = 0 (pure noise) | C = B log₂1 | **0** — cannot send data |
| Telephone line B = 3000 Hz, SNR = 3162 | 3000 × log₂3163 | **≈ 34,881 bps** |
| B = 3000 Hz, SNR_dB = 36 | SNR = 10^3.6 ≈ 3981; 3000 × log₂3982 | **≈ 35,878 bps** (shortcut 3000×36/3 = 36,000) |
| B = 2 MHz, SNR_dB = 30 | SNR = 1000; 2×10⁶ × log₂1001 | **≈ 19.93 Mbps** |

### 2.3 Using both together (Forouzan pattern)
Channel B = 1 MHz, SNR = 63.
1. Shannon upper limit: C = 10⁶ × log₂(64) = 10⁶ × 6 = **6 Mbps**.
2. Choose a safer rate, say **4 Mbps**.
3. Nyquist for levels: 4×10⁶ = 2 × 10⁶ × log₂L → log₂L = 2 → **L = 4 levels**.

> Rule: **Shannon gives the upper limit; Nyquist tells you how many levels you need.**

---

## 3. Transmission impairments and decibels

| Impairment | Cause | Remedy |
|---|---|---|
| **Attenuation** | Loss of energy (resistance, heat) | **Amplifier** (analog) / repeater (digital) |
| **Distortion** | Composite signal changes shape: components travel at **different speeds** (phase delay) | Equalisation |
| **Noise** | Thermal (random electron motion), induced (motors), **crosstalk** (one wire on another), impulse (lightning, spikes) | Shielding, twisting, error control |

**Decibel:** dB = 10 log₁₀(P₂/P₁) for power; **dB = 20 log₁₀(V₂/V₁)** for voltage. Negative dB = loss (attenuation), positive = gain.

| Worked | Answer |
|---|---|
| Power drops to half (P₂ = 0.5 P₁) | 10 log 0.5 = **−3 dB** |
| Power amplified 10 times | **+10 dB** (100 times = +20 dB) |
| Voltage halves | 20 log 0.5 = **−6 dB** |
| Points 1→2 lose 3 dB, 2→3 amplifier +7 dB, 3→4 lose 3 dB | dB values simply add: −3 + 7 − 3 = **+1 dB** |
| Cable loss 0.3 dB/km, 5 km, input 2 mW | Loss = 1.5 dB; P = 2 × 10^(−0.15) = **≈ 1.42 mW** |
| Signal 10 mW, noise 1 μW | SNR = 10⁻² / 10⁻⁶ = 10,000 → SNR_dB = **40 dB** |

### Performance terms (quick)
- **Throughput**: actual rate achieved (≤ bandwidth).
- **Latency** = propagation time + transmission time + queuing time + processing delay.
- **Propagation time** = distance / propagation speed. **Transmission time** = message size / bandwidth.
- **Worked:** 2.5 KB e-mail, 1 Gbps link, 12,000 km cable at 2.4 × 10⁸ m/s → propagation = 12×10⁶ / 2.4×10⁸ = **50 ms**; transmission = 20,000 bits / 10⁹ = **0.020 ms**. Propagation dominates for short messages.
- **Bandwidth-delay product** = bandwidth × delay = bits that fill the link. 1 Mbps × 20 ms = **20,000 bits**.
- **Jitter**: variation in delay between packets (hurts voice/video).

---

## 4. Digital-to-digital: line coding

Converts a bit sequence into a digital signal. Goals: **no DC component, self-synchronisation (clock recovery), little baseline wandering, built-in error detection, low bandwidth**.

| Scheme | Family | Rule | Notes |
|---|---|---|---|
| **Unipolar NRZ** | Unipolar | 1 = +V, 0 = 0 V | DC component, costly in power; not used for data |
| **NRZ-L** | Polar | **Level** decides the bit (one level for 1, the other for 0) | Long runs of 0s or 1s → loss of sync, baseline wandering |
| **NRZ-I** | Polar | **Inversion** (transition at start of bit) = 1; no change = 0 | Long 1s fine, long 0s still a problem |
| **RZ** | Polar | Goes to 0 in the middle of each bit; 3 levels | 2 signal changes per bit → more bandwidth |
| **Manchester** | Polar biphase | Transition **in the middle** of every bit; IEEE 802.3: 0 = high→low, 1 = low→high | Self-clocking, no DC; **classic 10 Mbps Ethernet**; needs 2× NRZ bandwidth |
| **Differential Manchester** | Polar biphase | Always a mid-bit transition (clock); **0 = extra transition at start, 1 = no transition at start** | **Token Ring (IEEE 802.5)** |
| **AMI** | Bipolar | 0 = 0 V; **1 = alternating +V/−V** | No DC; errors detected by violated alternation; long 0s lose sync (fixed by B8ZS/HDB3 scrambling) |
| **Pseudoternary** | Bipolar | 1 = 0 V; 0 = alternating ± | Mirror of AMI |
| 2B1Q, 8B6T, 4D-PAM5 | Multilevel | Several bits per signal element | DSL, 100Base-T4, 1000Base-T |
| MLT-3 | Multitransition | 3 levels, cycles through them on 1s | 100Base-TX |

**Worked trace for bits 1 0 1 1 0** (H = high, L = low; NRZ-I and differential Manchester start from low/high respectively as stated):

| Bit | 1 | 0 | 1 | 1 | 0 |
|---|---|---|---|---|---|
| NRZ-L (1 = H) | H | L | H | H | L |
| NRZ-I (start L) | H | H | L | H | H |
| Manchester (IEEE) | L→H | H→L | L→H | L→H | H→L |
| Diff. Manchester (previous level H) | H→L | H→L | L→H | H→L | H→L |
| AMI | + | 0 | − | + | 0 |

- **Block coding** adds redundancy for sync: **4B/5B** (100Base-FX/TX), **8B/10B** (Gigabit fibre).
- Conventions for "which level means 1" vary between books; DSSSB asks the *idea* (level vs inversion vs mid-bit transition).

---

## 5. Digital-to-analog modulation (shift keying)

| Method | What changes | Bits/signal element | Notes |
|---|---|---|---|
| **ASK** | Amplitude | 1 (binary); OOK = on/off | Most noise-sensitive; used for optical fibre (on/off light) |
| **FSK** | Frequency | 1 (BFSK) | Less noise trouble; needs more bandwidth: B = (1+d)S + 2Δf |
| **PSK** | Phase | BPSK 1, **QPSK 2**, 8-PSK 3 | Less noise-sensitive than ASK, no extra bandwidth like FSK |
| **QAM** | Amplitude **and** phase | 16-QAM 4, 64-QAM 6, 256-QAM 8 | Highest rate; used in modems, DSL, cable, Wi-Fi |

- ASK/PSK bandwidth: **B = (1 + d) × S** (d = 0 to 1, a filtering factor).
  **Worked:** available 100 kHz, d = 1 → S = 100 kHz / 2 = **50 kbaud** → binary ASK carries **50 kbps**.
- **Constellation diagram**: dots show amplitude (distance from origin) and phase (angle) of each signal element.

## 6. Analog-to-analog modulation

| Method | Carrier property changed | Bandwidth | Typical |
|---|---|---|---|
| **AM** | Amplitude | **B_AM = 2B** | AM radio 530–1700 kHz, 10 kHz per station |
| **FM** | Frequency | **B_FM = 2(1 + β)B** | FM radio 88–108 MHz, **200 kHz per station** |
| **PM** | Phase | B_PM = 2(1 + β)B (β smaller) | Some systems needing simpler hardware |

**Worked:** 5 kHz audio by AM → 2 × 5 = **10 kHz**. 15 kHz audio by FM with β = 4 → 2 × 5 × 15 = **150 kHz**.

## 7. Analog-to-digital: PCM

Steps: **Sampling (PAM) → Quantisation → Encoding**.
- **Nyquist sampling theorem:** sampling rate **fs ≥ 2 × f_max** (highest frequency in the signal).
- Bits per sample n_b with L = 2^n_b levels. **Bit rate = fs × n_b**.
- Quantisation error: **SQNR_dB ≈ 6.02 n_b + 1.76** (each extra bit adds about 6 dB).
- Sampling types: ideal, natural, flat-top (sample-and-hold, most common).

| Worked | Answer |
|---|---|
| Voice, f_max = 4 kHz | fs = **8000 samples/s** |
| 8 bits per sample | 8000 × 8 = **64 kbps** (one DS-0 voice channel) |
| Minimum bandwidth for that PCM stream | n_b × B_analog = 8 × 4 kHz = **32 kHz** |
| SQNR with 8 bits | 6.02 × 8 + 1.76 ≈ **49.9 dB** |
| Audio CD, f_max = 20 kHz | fs ≥ **40 kHz** (CD uses 44.1 kHz) |

- **Delta modulation (DM)**: sends 1 bit per sample (up/down step) — simpler, cheaper than PCM.
- Transmission modes: **parallel** (n wires, short distance) vs **serial** — asynchronous (start bit 0 + stop bit 1 per byte, gaps allowed), synchronous (continuous bit stream, no gaps), isochronous (fixed rate, real-time).

---

## 8. Transmission media

```
Transmission media
├── Guided (wired):   twisted pair | coaxial | optical fibre
└── Unguided (wireless): radio waves | microwaves | infrared
```
Media lie **below** the physical layer (sometimes called "layer 0").

### 8.1 Twisted-pair cable
- Two insulated copper wires twisted together: twisting makes noise affect both wires equally, so the receiver (which takes the **difference**) cancels it. More twists per inch = better.
- **UTP** (unshielded) — cheap, common in LANs. **STP** (shielded, metal foil/braid) — less crosstalk, bulkier, costlier (IBM).
- Connector: **RJ-45** (8 pins) for Ethernet; **RJ-11** for telephone.
- Rated by **Category (Cat)** set by EIA/TIA:

| Category | Bandwidth | Typical use / data rate |
|---|---|---|
| Cat 1 | very low | Telephone voice |
| Cat 2 | ~1 MHz | Up to 4 Mbps (old T-1 / token ring) |
| **Cat 3** | 16 MHz | **10 Mbps LAN (10Base-T)** |
| Cat 4 | 20 MHz | 16 Mbps Token Ring |
| **Cat 5 / 5e** | 100 MHz | 100 Mbps; Cat 5e → **1 Gbps (1000Base-T)** |
| **Cat 6** | 250 MHz | 1 Gbps (10 Gbps up to ~55 m) |
| Cat 6a | 500 MHz | 10 Gbps up to 100 m |
| Cat 7 | 600 MHz | 10 Gbps, fully shielded (S/FTP) |
| **Cat 8** | 2000 MHz | 25/40 Gbps, up to 30 m (data centres) |

- Uses: telephone local loop, DSL, Ethernet LANs.

### 8.2 Coaxial cable ⭐ Asked in DSSSB
- Structure (inside → out): **central copper conductor → insulator (dielectric) → outer conductor (metal foil/braid, also a shield) → plastic jacket**.
- Higher bandwidth than twisted pair but attenuates faster, so needs repeaters often.
- **Categorised by RG (Radio Government) ratings** — DSSSB 2024. (Twisted pair is rated by Category, not RG.)

| RG rating | Impedance | Use |
|---|---|---|
| **RG-59** | 75 Ω | **Cable TV** |
| **RG-58** | 50 Ω | **Thin Ethernet (10Base2, "Thinnet")** |
| **RG-11** | 50 Ω (as listed by Forouzan) | **Thick Ethernet (10Base5, "Thicknet")** |

- Connectors: **BNC** (Bayonet Neill–Concelman) connector, **BNC T** connector (branch to a computer on a bus), **BNC terminator** (end of the cable, stops reflections).
- Uses: cable TV networks (now hybrid fibre-coax, HFC), old bus Ethernet, CCTV.

### 8.3 Optical fibre ⭐ Asked in DSSSB
- Carries signals as **light**. Structure: **core** (glass/plastic) surrounded by **cladding**, then buffer and jacket.
- **Core refractive index > cladding refractive index**, so light going from denser (core) to rarer (cladding) at an angle **greater than the critical angle** is **totally internally reflected** and stays in the core (DSSSB 2023).
- **Critical angle:** sin θc = n₂/n₁. **Worked:** n₁ = 1.50, n₂ = 1.45 → θc = sin⁻¹(0.9667) ≈ **75.2°**. Numerical aperture NA = √(n₁² − n₂²) ≈ **0.384**. Speed in core = c/n₁ = **2 × 10⁸ m/s**.
- Angle < critical → refraction into cladding (light lost); = critical → travels along boundary; > critical → reflection.

| Mode | Core | Behaviour | Use |
|---|---|---|---|
| **Multimode step-index** | Thick (50–100 μm), sudden index change | Many beams, zig-zag paths → high **modal dispersion** | Short links |
| **Multimode graded-index** | Index decreases gradually from centre | Beams curve, arrive closer together | LANs, campus |
| **Single-mode** | Very thin (≈ 8–10 μm), step index, laser source | One nearly horizontal beam; least dispersion | **Long distance**, telephone backbone, undersea |

- Sources: **LED** (multimode), **laser/ILD** (single mode). Detector: photodiode. Common wavelengths 850, 1310, 1550 nm.
- Connectors: **SC** (subscriber channel, push-pull), **ST** (straight tip, bayonet), **MT-RJ** (duplex, RJ-45 size).
- **Advantages:** very high bandwidth, low attenuation (repeaters every ~50 km vs ~5 km for copper), **immune to electromagnetic interference**, light and thin, hard to tap (secure), resistant to corrosion.
- **Disadvantages:** costly installation and maintenance (skilled splicing), **unidirectional** (two fibres for two-way), fragile.

### 8.4 Comparison

| Feature | Twisted pair | Coaxial | Optical fibre |
|---|---|---|---|
| Signal | Electrical | Electrical | **Light** |
| Rating system | Category | **RG** | Mode / index profile |
| Bandwidth | Lowest | Medium | **Highest** |
| EMI immunity | Low | Better (shielded) | **Immune** |
| Cost | Cheapest | Medium | Highest |
| Connector | RJ-45 | BNC | SC / ST |

### 8.5 Unguided media ⭐ Asked in DSSSB
Unguided media **transport electromagnetic waves without using a physical conductor** (DSSSB 2024: both statements "no conductor" and "can travel by ground propagation" are true).

**Propagation modes**

| Mode | Frequency | How | Example |
|---|---|---|---|
| **Ground** | Below ~2 MHz | Wave hugs the earth's curvature | AM long-wave, navigation |
| **Sky** | ~2–30 MHz | Reflected by the **ionosphere** → long distances | Short-wave radio, amateur radio |
| **Line-of-sight** | Above ~30 MHz | Straight line, antennas must see each other | Microwave, satellite, TV |

**Wireless categories**

| Type | Range (Forouzan) | Direction | Key points | Uses |
|---|---|---|---|---|
| **Radio waves** | 3 kHz – 1 GHz | **Omnidirectional** | Penetrate walls; travel long distances; interference | AM/FM radio, TV, paging, cordless phones |
| **Microwaves** | 1 – 300 GHz | **Unidirectional** (aligned antennas) | Line-of-sight; towers needed; poor wall penetration at high f | Cellular phones, satellite, **wireless LANs**, point-to-point links |
| **Infrared** | 300 GHz – 400 THz | Line-of-sight, short range | **Cannot penetrate walls** (no interference between rooms); useless in sunlight | TV remotes, IrDA between devices |

- Antennas: **dish** (parabolic) and **horn** for microwaves; omnidirectional for radio.
- **Satellite** = microwave relay in the sky.
  - **GEO** ≈ **35,786 km**, orbit synchronised with earth; **3 satellites** cover the whole earth; delay ≈ 0.25 s one way.
  - **MEO** (between LEO and GEO; **GPS** at ≈ 20,200 km) and **LEO** (≈ 500–2000 km; satellite phones, Starlink-type).
  - **Uplink frequency > downlink** (C band 6/4 GHz; also Ku, Ka bands). Footprint = area covered.

### 8.6 Line configuration (cross-reference: nw_basics) ⭐ Asked in DSSSB
- **Point-to-point**: dedicated link between exactly two devices (TV remote and TV, leased line).
- **Multipoint (multidrop)**: several devices share one link — capacity shared **spatially or by time (timeshared)**. So "timeshared" is **not** a point-to-point property (DSSSB 2024: answer "Only I").

---

## 9. Multiplexing and spread spectrum

**Multiplexing** = many signals share one link (n inputs → MUX → 1 link → DEMUX → n outputs). Used when the link capacity exceeds each device's need.

| Technique | Signal | Idea | Example |
|---|---|---|---|
| **FDM** | Analog | Each signal gets its own frequency band; **guard bands** prevent overlap | Radio/TV broadcasting, 1G cellular |
| **WDM** | Analog (light) | FDM for **optical fibre**; prism/diffraction combines colours; **DWDM** = dense | SONET backbones |
| **Synchronous TDM** | Digital | Each input gets a **fixed slot** in every frame, **even if it has nothing to send** | T-1/E-1 telephone lines |
| **Statistical TDM** | Digital | Slots allotted **on demand**; each slot carries an **address**; no empty slots | Data links with bursty traffic |

**Worked numericals**
1. **FDM:** 5 channels × 100 kHz, guard band 10 kHz between neighbours → 5 × 100 + 4 × 10 = **540 kHz**.
2. **Synchronous TDM:** 4 inputs of 64 kbps, 1 byte per slot → frame = 4 × 8 = 32 bits; frame rate = 64,000/8 = 8000 frames/s; link = 32 × 8000 = **256 kbps**.
3. **Framing bit:** 3 inputs of 1 kbps, 1 bit per slot plus 1 framing bit per frame → 4 bits × 1000 frames/s = **4 kbps**.
4. **T-1 line:** 24 channels × 8 bits + 1 framing bit = 193 bits per frame × 8000 = **1.544 Mbps**. **E-1**: 32 × 64 kbps = **2.048 Mbps**.

- Digital hierarchy: DS-0 64 kbps → DS-1/T-1 1.544 Mbps (24 voice) → DS-3/T-3 44.736 Mbps (672 voice).
- Problems in TDM with unequal rates: multilevel multiplexing, multiple-slot allocation, **pulse stuffing** (bit padding).
- Statistical TDM output capacity is **less than** the sum of input capacities.

**Spread spectrum** — spreads a signal over a much wider band (B_ss ≫ B) for **privacy and anti-jamming**; used in wireless.

| | FHSS | DSSS |
|---|---|---|
| Idea | Carrier **hops** between frequencies in a pseudorandom pattern | Each bit replaced by **n chips** (spreading code) |
| Example | **Bluetooth** (79 channels, 1600 hops/s), original 802.11 | **802.11b** (Barker code, 11 chips per bit), CDMA phones |

---

## 10. Switching

```
Switched networks
├── Circuit switching (physical layer)
├── Packet switching
│    ├── Datagram (network layer, connectionless)  e.g., Internet IP
│    └── Virtual circuit (connection-oriented)     e.g., X.25, Frame Relay, ATM
└── Message switching (store-and-forward, whole message; Forouzan: application layer)
```

### 10.1 Circuit switching
- **Three phases: setup → data transfer → teardown.** Resources (channel/slot) are **reserved** for the whole call.
- No addressing inside data; constant delay; wasteful when the line is idle. Example: traditional telephone network.
- Total delay = setup time + transmission time + propagation time + teardown time.

### 10.2 Datagram vs virtual-circuit ⭐ Asked in DSSSB (two questions, 2023)

| Feature | **Datagram network** | **Virtual-circuit network** |
|---|---|---|
| Connection | **Connectionless** | **Connection-oriented** |
| **Setup / teardown phase** | **Not required** | **Required** (DSSSB answer) |
| Packet called | **Datagram** (DSSSB answer) | Packet/cell on a virtual circuit |
| Address carried | Full destination address in every packet | Short **VCI** (virtual-circuit identifier), local to each link |
| Path | Each packet routed **independently**; may differ | All packets follow the **same path** fixed at setup |
| Order at destination | May arrive **out of order** | Arrive **in order** |
| Table at switch/router | Routing table (destination-based) | Switching table (incoming/outgoing port + VCI) |
| Resource reservation | None (on demand) | Can reserve at setup |
| If a router fails | Packets rerouted around it | Circuit broken, must be re-established |
| Delay | Varies per packet | Setup delay once, then smaller |
| Example | **Internet (IP)** | **X.25, Frame Relay, ATM** |

> Memory hook: **"Datagram = Don't set up; VC = Very Careful setup."**

### 10.3 Message switching
- Whole message is **stored and forwarded** at each node (no size limit, no dedicated path).
- Needs large storage; high delay; used by old telegraph systems; ideas reused in e-mail.

| | Circuit | Packet | Message |
|---|---|---|---|
| Dedicated path | Yes | No | No |
| Unit | Continuous stream | Packets | Whole message |
| Store-and-forward | No | Yes | Yes |
| Resource use | Inefficient | Efficient | Efficient but slow |

---

## Exam traps
1. **Wavelength is not** one of the three sine-wave parameters — they are peak amplitude, frequency (period) and phase.
2. λ = speed × **period** (or speed ÷ frequency), never speed × frequency or speed + anything.
3. Bandwidth in **Hz** (frequency range) differs from bandwidth in **bps** (data rate).
4. In Shannon's formula use the **ratio** SNR, not the dB value: 30 dB → SNR = 1000.
5. Nyquist assumes a **noiseless** channel; Shannon gives the **upper limit** for a noisy one; levels don't appear in Shannon.
6. **RG ratings → coaxial cable**; **Category → twisted pair**; RJ-45 is twisted pair, BNC is coaxial.
7. Core index is **greater** than cladding — the reverse would let light refract out.
8. Nyquist sampling rate is **2 × the highest frequency** (f_max), not 2 × the lowest or the average frequency; and it is samples/s, not bps.
9. FDM, WDM, TDM are **multiplexing** (physical layer, one link); FDMA, TDMA, CDMA are **multiple access** (data link layer, shared medium).
10. Synchronous TDM wastes empty slots; statistical TDM needs an **address** in each slot.
11. Circuit setup is required in **virtual-circuit** networks, not datagram networks; packets in a datagram network can arrive out of order.
12. A **repeater** regenerates bits — physical layer only; an **amplifier** boosts analog signals including noise.

## One-liners for revision
1. Physical layer = transmits a raw **bit stream** over the medium.
2. Sine wave parameters = **peak amplitude, frequency, phase**.
3. f = 1/T; 1 kHz ↔ 1 ms.
4. λ = propagation speed × period = c/f.
5. 100 MHz in air → λ = 3 m.
6. One full cycle = 360° = 2π rad.
7. Pure sine wave in frequency domain = one spike.
8. Bandwidth (Hz) = f_high − f_low.
9. Bit length = propagation speed × bit duration.
10. Baud rate = bit rate / bits per signal element.
11. Nyquist: 2B log₂L (noiseless).
12. Shannon: B log₂(1 + SNR) (noisy).
13. SNR_dB = 10 log₁₀ SNR; 30 dB = 1000.
14. Halving power = −3 dB; voltage dB uses 20 log.
15. dB losses and gains simply add along a path.
16. Impairments: attenuation, distortion, noise.
17. Crosstalk = noise induced by one wire on another.
18. Manchester = mid-bit transition; used by 10 Mbps Ethernet.
19. Differential Manchester = Token Ring.
20. NRZ-I: inversion means 1.
21. AMI: 0 = zero volts, 1 = alternating ±.
22. 4B/5B and 8B/10B are block codes.
23. QPSK = 2 bits/symbol; 16-QAM = 4 bits/symbol.
24. QAM varies both amplitude and phase.
25. AM bandwidth = 2B; FM = 2(1+β)B; FM station = 200 kHz.
26. Nyquist sampling: fs ≥ 2 f_max; voice → 8000 samples/s → 64 kbps.
27. PCM = sampling + quantisation + encoding.
28. Twisted pair twisting cancels noise; UTP uses RJ-45.
29. Cat 5e/Cat 6 → Gigabit Ethernet; Cat 8 → 25/40 Gbps.
30. Coaxial cable rated by RG: RG-59 TV, RG-58 thin Ethernet, RG-11 thick Ethernet.
31. Coax connectors: BNC, BNC-T, terminator.
32. Optical fibre works by total internal reflection; n_core > n_cladding.
33. Single-mode fibre = thinnest core, longest distance, laser source.
34. Fibre is immune to EMI but unidirectional and costly to install.
35. Radio = omnidirectional; microwave = unidirectional line-of-sight; infrared = can't cross walls.
36. Sky propagation uses the ionosphere (2–30 MHz).
37. GEO orbit ≈ 35,786 km; 3 satellites cover earth.
38. T-1 = 1.544 Mbps (24 channels); E-1 = 2.048 Mbps (32 channels).
39. FHSS → Bluetooth; DSSS → 802.11b.
40. Datagram: no setup, independent routing; virtual circuit: setup, same path, VCI.

## Quick self-check
1. Which is NOT a parameter of a sine wave: phase, wavelength, frequency, peak amplitude? — **Wavelength.**
2. A signal has frequency 200 MHz in air. Its wavelength? — 3×10⁸ / 2×10⁸ = **1.5 m.**
3. A noiseless channel of 4 kHz uses 8 levels. Maximum bit rate? — 2 × 4000 × 3 = **24 kbps.**
4. A channel of 1 MHz has SNR 63. Shannon capacity? — 10⁶ × log₂64 = **6 Mbps.**
5. A signal loses half its power. Attenuation in dB? — **−3 dB.**
6. Minimum sampling rate for a signal whose highest frequency is 10 kHz? — **20,000 samples/s.**
7. Which guided medium is classified by Radio Government ratings? — **Coaxial cable.**
8. Why is the core's refractive index higher than the cladding's? — So light is **totally internally reflected** inside the core.
9. Which wireless waves cannot penetrate walls? — **Infrared.**
10. In which network is circuit setup required: datagram or virtual-circuit? — **Virtual-circuit.**
