# Networks — Fast Revision Sheet

## 1. How to use this sheet
- Read it top to bottom once in the last 60–90 minutes. Do not open the chapter notes again.
- ⭐ = asked in a real DSSSB TGT paper (June 2023 or February 2024). Say these out loud.
- Read Sections 15 and 16 last. They cover the two wrong official keys and the traps that cost the most marks.

### Top 25 facts DSSSB asks again and again
1. ⭐ The **physical layer** sends data as a **bit stream**. A **repeater** works **only** at the physical layer.
2. ⭐ The transport PDU is the **segment (TPDU)**. The TCP/IP **internet layer** uses **packets (datagrams)**.
3. ⭐ The transport protocols are **TCP, UDP and SCTP**. FTP and DNS are application layer, ICMP is network layer, ARP/RARP are network/link.
4. ⭐ TCP is **connection-oriented**, opens with a **3-way handshake** and takes data as a **byte stream**. "TCP is connectionless" is the FALSE option.
5. ⭐ **UDP** sends datagrams **without setting up a connection**. The paper printed it as "Unit Datagram Protocol".
6. ⭐ **Flow control** is the transport feature that **prevents data loss**.
7. ⭐ In **slow start**, cwnd **roughly doubles every RTT**. +1 MSS per RTT is congestion avoidance.
8. ⭐ **Error control and flow control are NOT network-layer functions.** Routing, intra-domain routing and congestion control are.
9. ⭐ At the data link layer, **error control** is based on **ARQ** (retransmission).
10. ⭐ **Virtual-circuit** networks need circuit setup; **datagram** networks do not. Packets routed independently are **datagrams** in a **datagram network**.
11. ⭐ **Congestion** = too many packets causing delay and loss. The **routing algorithm** manages routing tables and makes routing decisions.
12. ⭐ Mask **255.255.240.0** = /20, so 12 host bits and **4094 hosts**. A 4-byte IPv4 address = **network address + host address**.
13. ⭐ **IMAP = port 143** (POP3 110, SMTP 25, HTTP 80, HTTPS 443).
14. ⭐ **λ = propagation speed × period** (= speed ÷ frequency). A sine wave is described by **peak amplitude, frequency and phase**. Wavelength is **not** one of the three.
15. ⭐ **Coaxial cable** is rated by **RG (Radio Government)** numbers. Twisted pair is rated by Category.
16. ⭐ The fibre **core's refractive index is greater than the cladding's**, so light is **totally internally reflected**. ⭐ Unguided media need **no conductor** and can use **ground propagation** (both statements true).
17. ⭐ **Point-to-point** = a **dedicated** link between two devices. Timesharing belongs to multipoint, so the answer is "Only I".
18. ⭐ **Bus** = every station on one **backbone cable**. ⭐ **P2P has no dedicated server**. ⭐ In client–server, the central controller is the **server** and the others are **clients**.
19. ⭐ **RSA is NOT symmetric** (AES, DES and RC4 are). ⭐ The **Triple DES key is 168 bits**.
20. ⭐ A **transposition** cipher reorders letters but does not disguise them. ⭐ Encryption transforms the **plain text**.
21. ⭐ **Authentication** = verifying a user's identity. ⭐ The key used to encrypt traffic between end systems is the **session key**.
22. ⭐ **BTS = Base Transceiver Station.** ⭐ The **VLR informs the HLR** about location changes.
23. ⭐ The **foreign agent** is the **router** in the foreign network. ⭐ The **COA** is the current tunnel endpoint and can be obtained via DHCP (the official key said FA; see Section 15).
24. ⭐ **TDMA** = one frequency channel shared by **time slots**. ⭐ Satellite to terrestrial cellular = **inter-system handover**.
25. ⭐ A Wi-Fi router is **fixed and wireless**. ⭐ The essentials for the Internet are **NIC and TCP/IP**. ⭐ Visiting site after site = **web surfing**. ⭐ The purpose of worldwide interconnection = **messages for communication**.

---

## 2. OSI master table ⭐

| # | Layer | Job in 5 words | PDU | Address | Protocols | Devices |
|---|---|---|---|---|---|---|
| 7 | Application | Network services to the user | Message | URL, e-mail (specific) | HTTP, FTP, SMTP, POP3, IMAP, DNS, Telnet, SSH, SNMP, DHCP | Gateway, proxy firewall |
| 6 | Presentation | Translate, encrypt, compress the data | Data | — | ASCII, EBCDIC, JPEG, MPEG (SSL/TLS often listed) | Gateway |
| 5 | Session | Dialog control and sync checkpoints | Data | — | RPC, NetBIOS | Gateway |
| 4 | Transport | Process-to-process, end-to-end reliability | **Segment (TPDU)** ⭐ / user datagram | **Port (16-bit)** | **TCP, UDP, SCTP** ⭐ | Gateway, L4 firewall |
| 3 | Network | Source-to-destination routing, logical addressing | **Packet / datagram** ⭐ | **IP (32/128-bit)** | IPv4, IPv6, ICMP, IGMP, IPsec, OSPF | **Router**, L3 switch |
| 2 | Data link | Hop-to-hop frames, error control | **Frame** | **MAC (48-bit)** | Ethernet 802.3, Wi-Fi 802.11, PPP, HDLC | **Bridge, switch**, NIC, AP |
| 1 | Physical | Move raw bits over medium ⭐ | **Bits** | — | RS-232, 10Base-T, DSL | **Repeater ⭐, hub**, modem |

- Mnemonics: bottom-up **"Please Do Not Throw Sausage Pizza Away"**; top-down **"All People Seem To Need Data Processing"**. PDUs top-down after message: **"Some People Fear Birds"** (Segment, Packet, Frame, Bits).
- Layers 1–3 work hop by hop (in every router). Layers 4–7 work end to end (in hosts only).
- Only the **data link layer adds a trailer** (CRC). The other layers add headers only.
- MAC addresses change at every hop. IP addresses stay the same end to end.
- Session = dialog control and checkpoints. Presentation = translation, encryption, compression.

| OSI | TCP/IP (4-layer) | Forouzan 5-layer |
|---|---|---|
| 7, 6, 5 | Application | Application |
| 4 | Transport | Transport |
| 3 | **Internet** (packets ⭐) | Network |
| 2, 1 | Link (network access) | Data link, Physical |


---

## 3. Devices table ⭐

| Device | Layer | What it does | Collision domains | Broadcast domains |
|---|---|---|---|---|
| Passive hub | Below L1 | Just a connector | — | — |
| **Repeater** ⭐ | 1 only | **Regenerates** bits (not an amplifier), extends one LAN, no filtering | 1 (no split) | 1 |
| Hub | 1 | Multiport repeater, floods all ports | **1 for all ports** | 1 |
| Modem | 1 | Digital ↔ analog (modulation/demodulation) | — | — |
| NIC | 1 + 2 | Holds the 48-bit MAC | — | — |
| Bridge | 2 | Filters frames by MAC; spanning tree stops loops | 1 per port | 1 |
| **Switch (L2)** | 2 | Multiport bridge, full duplex | **1 per port** | **1** (unless VLANs) |
| Access point | 2 | Joins Wi-Fi stations to the wired LAN | Shared air | 1 |
| Brouter | 2 + 3 | Bridges non-routable, routes routable traffic | 1 per port | Depends |
| L3 switch | 3 | Router in hardware | 1 per port | 1 per VLAN |
| **Router** | 3 | Routes by IP, does not forward broadcasts | 1 per interface | **1 per interface** |
| Gateway | All (1–7) | Protocol converter between unlike networks | — | Separate networks |
| Firewall | 3/4 (packet filter) or 7 (proxy) | Allows or denies traffic by rules | — | — |

- Only a **router** (or a VLAN or L3 switch) splits broadcast domains. A switch splits collision domains only.
- Quick count: a switch with 10 PCs = 10 collision domains, 1 broadcast domain. A router with 3 hub-LANs = 3 and 3.

---

## 4. Topologies and network types

| Topology | Links for n devices | Ports per device | One failure | Example |
|---|---|---|---|---|
| **Mesh** | **n(n−1)/2** (simplex n(n−1)) | **n−1** | Very little effect | Telephone regional backbone |
| Star | n | 1 | Link: 1 device. **Hub fails: all down** | Ethernet LAN with a switch |
| **Bus** ⭐ | 1 backbone + drop lines + 2 terminators | 1 | **Backbone break: all down** | 10Base2/10Base5 |
| Ring | n | 2 | One break can kill the ring (dual ring fixes it) | Token Ring 802.5, FDDI |
| Tree | n−1 (hierarchy) | Varies | Root hub cuts off branches | Cable TV, campus |
| Hybrid | Mixed | Mixed | Depends | Large enterprise |

- Mesh numbers: n = 4 → 6 links; 5 → 10; 6 → 15; 8 → 28; 10 → 45.
- Bus is multipoint. Mesh, star and ring use point-to-point links. Every ring device has a repeater, and data moves one way.

| Type | Range | Example |
|---|---|---|
| PAN | ~10 m | Bluetooth (802.15) |
| LAN | Room to campus (few km) | Ethernet 802.3, Wi-Fi 802.11 |
| CAN | 1–5 km campus | University |
| MAN | City (~50 km) | Cable TV, WiMAX 802.16 |
| WAN | Country or continent | Leased lines, satellite |
| GAN | Whole planet | The Internet |

- ⭐ **P2P**: no dedicated server, equal peers, about **10 computers**, each user sets sharing permissions. ⭐ **Client–server**: one **server**, many **clients**; server failure stops the service.
- Intranet = private and employees only. Extranet = intranet plus authorised outsiders.
- Data flow: simplex (keyboard, TV), half-duplex (walkie-talkie), full-duplex (telephone).
- ⭐ Point-to-point = dedicated link. Multipoint = shared spatially or **timeshared**.

---

## 5. Physical layer: formulas and media

| Formula | Use | Quick example |
|---|---|---|
| **f = 1/T** | Frequency from period | T = 1 ms → 1 kHz |
| **λ = v × T = v/f** ⭐ | Wavelength | 100 MHz in air → 3 m |
| Bit length = v × bit duration | Metres per bit | 1 Mbps at 2×10⁸ m/s → 200 m |
| **Baud = bit rate / bits per symbol** | Signal rate | 4800 bps, 16-QAM (4 bits) → 1200 baud |
| **Nyquist C = 2B log₂L** | Noiseless channel | 3 kHz, L = 2 → 6 kbps |
| **Shannon C = B log₂(1 + SNR)** | Noisy channel: upper limit | 1 MHz, SNR 63 → 6 Mbps |
| **SNR_dB = 10 log₁₀ SNR** | Convert dB to ratio first | 30 dB → 1000 |
| dB (power) = 10 log(P₂/P₁); voltage 20 log | Gain or loss | Half power = −3 dB |
| T_t = L/R; T_p = d/s | Transmission vs propagation delay | 8000 bits at 10 Mbps = 0.8 ms |
| Sampling fs ≥ 2 f_max | PCM | Voice 4 kHz → 8000 samples/s → 64 kbps |

- ⭐ The three sine-wave parameters are **peak amplitude** (volts), **frequency** (Hz, f = 1/T) and **phase** (degrees; 360° = 2π). **Wavelength is not one of them.**
- Bit rate counts bits per second. Baud counts signal elements per second. Baud ≤ bit rate.
- Shannon gives the limit. Nyquist tells you how many levels you need. Shannon has no L in it.

| Medium | Rated by | Key numbers | Connector |
|---|---|---|---|
| Twisted pair (UTP/STP) | **Category** | Cat 3 = 10 Mbps (10Base-T); Cat 5 = 100 Mbps; Cat 5e/6 = 1 Gbps; Cat 6a = 10 Gbps at 100 m; Cat 7 = 10 Gbps shielded; Cat 8 = 25/40 Gbps at 30 m | RJ-45 (RJ-11 phone) |
| **Coaxial** ⭐ | **RG number** | **RG-59** = 75 Ω, cable TV; **RG-58** = 50 Ω, thin Ethernet 10Base2; **RG-11** = thick Ethernet 10Base5 | BNC, BNC-T, terminator |
| **Optical fibre** ⭐ | Mode / index | **n(core) > n(cladding) → TIR** above the critical angle (sin θc = n₂/n₁) | SC, ST, MT-RJ |

| Fibre mode | Core | Use |
|---|---|---|
| Multimode step-index | Thick, 50–100 μm | Short links (high modal dispersion) |
| Multimode graded-index | Index falls from the centre | LAN, campus |
| Single-mode | ≈ 8–10 μm, laser | Long distance, undersea |

- Fibre: immune to EMI, high bandwidth, repeaters about every 50 km. It is unidirectional and costly.

| Wireless ⭐ | Band | Behaviour | Use |
|---|---|---|---|
| Radio | 3 kHz – 1 GHz | Omnidirectional, passes walls | AM/FM, TV |
| Microwave | 1 – 300 GHz | Unidirectional, line of sight | Cellular, satellite, WLAN |
| Infrared | 300 GHz – 400 THz | Cannot pass walls | TV remote, IrDA |

- ⭐ Propagation: **ground** (< 2 MHz), **sky** via the ionosphere (2–30 MHz), **line of sight** (> 30 MHz).
- Multiplexing (one link): FDM (analog), WDM (light), TDM (digital). T-1 = 1.544 Mbps (24 channels), E-1 = 2.048 Mbps.
- Spread spectrum: FHSS (Bluetooth) and DSSS (802.11b).

| Switching ⭐ | Setup? | Path | Order | Example |
|---|---|---|---|---|
| Circuit | Yes: setup → transfer → teardown | Dedicated, reserved | In order | Telephone |
| **Datagram** packet | **No** | Each packet routed independently | May be out of order | **Internet (IP)** |
| **Virtual circuit** packet | **Yes** | Same path for all; short VCI | In order | X.25, Frame Relay, ATM |
| Message | No | Store-and-forward of the whole message | — | Telegraph |

---

## 6. Data link layer

| Method | Rule | Power |
|---|---|---|
| Simple parity | Add 1 bit to make the count of 1s even (or odd) | Detects any **odd** number of errors; misses even numbers |
| 2-D parity | Row + column parity | Catches 1, 2, 3-bit errors; misses some 4-bit rectangles |
| Checksum | One's-complement sum, then complement; receiver gets all 0s | Internet uses 16-bit words (IP, TCP, UDP) |
| **CRC** | Append r zeros (r = generator bits − 1), **modulo-2 (XOR) division**, append the remainder | Remainder 0 = accept; finds all bursts ≤ r; Ethernet uses **CRC-32** |
| **Hamming** | **2^r ≥ m + r + 1**; parity bits at positions 1, 2, 4, 8 | 4 data → 3 parity (7,4); 7 → 4; 8 → 4; 16 → 5; 32 → 6 |
| Hamming distance | d = number of 1s in x XOR y | **Detect s: d_min = s + 1. Correct t: d_min = 2t + 1** |

- d_min 3 → detect 2, correct 1. d_min 5 → correct 2.
- Framing: bit stuffing inserts a 0 after **five** 1s (flag 01111110, HDLC). Byte stuffing uses ESC (PPP).

| ARQ ⭐ (error control) | Sender window | Receiver window | On loss |
|---|---|---|---|
| Stop-and-Wait | 1 | 1 | Resend the one frame |
| Go-Back-N | **≤ 2^m − 1** (m = 3 → 7) | 1 | Resend lost frame **and all after it** |
| Selective Repeat | **≤ 2^(m−1)** (m = 3 → 4) | = sender | Resend **only** the lost frame (NAK) |

- Stop-and-Wait efficiency = 1/(1 + 2a), where a = Tp/Tt. Piggybacking = ACK carried inside a data frame.
- Flow control = how much to send. Error control = did it arrive correctly; if not, resend (ARQ).

| Random access | Number to remember |
|---|---|
| Pure ALOHA | S = G·e^(−2G); max **18.4%** at G = 0.5; vulnerable time 2 Tfr |
| Slotted ALOHA | S = G·e^(−G); max **36.8%** at G = 1; vulnerable time Tfr |
| CSMA | Listen before talk: 1-persistent (Ethernet), non-persistent, p-persistent |
| **CSMA/CD** | Wired Ethernet: jam signal, binary exponential back-off; min frame L = 2 × Tp × R → **64 bytes at 10 Mbps** |
| **CSMA/CA** | Wi-Fi: IFS, contention window, ACK, **RTS/CTS** (fixes the hidden-station problem) |

- Controlled access: reservation, polling (poll and select), token passing (Token Ring 802.5, FDDI).
- ⭐ **FDMA** = separate frequency bands (1G). **TDMA** = same frequency, different **time slots** (GSM: 8 slots per 200 kHz). **CDMA** = same band at the same time, separated by orthogonal **codes** (3G). NDMA and PDMA do not exist.

| Ethernet / Wi-Fi / Bluetooth | Numbers |
|---|---|
| MAC address | **48 bits**, first 24 bits = OUI; broadcast FF:FF:FF:FF:FF:FF |
| Ethernet frame | **64–1518 bytes**, payload **46–1500** (MTU 1500), CRC-32; preamble 7 + SFD 1 not counted |
| 100Base-TX / 1000Base-T | Cat 5, 100 m / Cat 5e/6, 4 pairs, 100 m |
| 802.11b / a / g | 2.4 GHz 11 Mbps / **5 GHz** 54 Mbps / 2.4 GHz 54 Mbps |
| 802.11n / ac / ax | Wi-Fi 4 (MIMO, 600 Mbps) / Wi-Fi 5 (5 GHz) / Wi-Fi 6 (OFDMA; 6E adds 6 GHz) |
| Bluetooth 802.15.1 | 2.4 GHz, FHSS 79 channels, 1600 hops/s, ~10 m |
| Piconet | **1 master + 7 active slaves = 8 devices** (255 parked); scatternet = linked piconets |

---

## 7. IP addressing

| Class | First octet | Leading bits | Default mask | Networks | Hosts per network |
|---|---|---|---|---|---|
| A | 1–126 (127 = loopback) | 0 | /8 | 126 usable | 16,777,214 |
| B | 128–191 | 10 | /16 | 16,384 | 65,534 |
| C | 192–223 | 110 | /24 | 2,097,152 | 254 |
| D | 224–239 | 1110 | — | Multicast | — |
| E | 240–255 | 1111 | — | Reserved | — |

| Special address | Meaning |
|---|---|
| 10.0.0.0/8, 172.16.0.0/12 (to **172.31**), 192.168.0.0/16 | **Private** (RFC 1918); need NAT |
| 127.0.0.1 | Loopback |
| 169.254.0.0/16 | APIPA / link-local (no DHCP answer) |
| 255.255.255.255 | Limited broadcast (never routed) |
| 0.0.0.0 | This host; 0.0.0.0/0 = default route |
| Host bits all 0 / all 1 | Network address / directed broadcast |

| /n | Mask | Host bits h | Usable hosts (2^h − 2) |
|---|---|---|---|
| /16 | 255.255.0.0 | 16 | 65,534 |
| /17 | 255.255.128.0 | 15 | 32,766 |
| /18 | 255.255.192.0 | 14 | 16,382 |
| /19 | 255.255.224.0 | 13 | 8,190 |
| **/20** ⭐ | **255.255.240.0** | 12 | **4,094** |
| /21 | 255.255.248.0 | 11 | 2,046 |
| /22 | 255.255.252.0 | 10 | 1,022 |
| /23 | 255.255.254.0 | 9 | 510 |
| /24 | 255.255.255.0 | 8 | 254 |
| /25 | 255.255.255.128 | 7 | 126 |
| /26 | 255.255.255.192 | 6 | 62 |
| /27 | 255.255.255.224 | 5 | 30 |
| /28 | 255.255.255.240 | 4 | 14 |
| /29 | 255.255.255.248 | 3 | 6 |
| /30 | 255.255.255.252 | 2 | 2 (router links) |

- Mask octet values: 128, 192, 224, 240, 248, 252, 254, 255 (1 to 8 bits on).

**6-step subnetting method**
1. Count the mask's 1-bits → n. Host bits h = 32 − n.
2. Hosts = 2^h − 2. Subnets = 2^(borrowed bits), where borrowed = n − default prefix.
3. Find the "interesting" octet (not 255 and not 0). Block size = 256 − that value.
4. Network = the largest multiple of the block size ≤ the IP's octet; later octets become 0.
5. Broadcast = network + block − 1; later octets become 255.
6. First host = network + 1. Last host = broadcast − 1.

**Ultra-short examples**
- ⭐ 255.255.240.0 → 8 + 8 + 4 = /20 → h = 12 → 4096 − 2 = **4094** (not 4096, 2048 or 1024).
- 192.168.10.75/26 → block 64 → network **.64**, broadcast **.127**, hosts .65–.126 (62).
- 172.16.77.200/20 → block 16 in the 3rd octet → network **172.16.64.0**, broadcast **172.16.79.255**.

| IPv6 essentials | |
|---|---|
| Size | **128 bits**, 8 groups of 4 hex digits |
| Header | Fixed **40 bytes** + extension headers; no checksum |
| "::" | Replaces zero groups, **only once** |
| Types | Unicast, multicast, **anycast**; **no broadcast** |
| Hop Limit | Replaces TTL; only the source fragments |
| Special | ::1 loopback, fe80::/10 link-local, ff00::/8 multicast |
| Transition | Dual stack, tunnelling, NAT64 |

- IPv4 header 20–60 bytes. TTL drops by 1 per hop. Fragment offset counts 8-byte units. Only the destination reassembles.
- Protocol field: 1 ICMP, 2 IGMP, 6 TCP, 17 UDP, 89 OSPF.

**Helper protocols**
- **ARP**: IP → MAC. Request is broadcast, reply is unicast.
- **RARP**: MAC → IP (obsolete; replaced by BOOTP/DHCP).
- **ICMP**: error and query messages, IP protocol 1, no ports. ping = Echo Request/Reply (8/0). traceroute uses Time Exceeded (11).
- **DHCP**: gives IP, mask, gateway and DNS on a lease; UDP 67/68; DORA = Discover, Offer, Request, Acknowledge.
- **NAT**: private ↔ public addresses. **PAT** = many hosts share one public IP, told apart by port.
- **IGMP**: multicast group membership.

| Routing | Distance vector | Link state | Path vector |
|---|---|---|---|
| Algorithm | Bellman–Ford | Dijkstra | AS-path list |
| Shares | Whole table, **neighbours only** | Own links (LSP), **flooded to all** | Paths with policy |
| Problem | Count-to-infinity (split horizon fixes it) | More CPU and memory | — |
| Protocol | **RIP**: hop count, **max 15** (16 = infinity), 30 s, **UDP 520** | **OSPF**: areas, backbone area 0, IP protocol 89 | **BGP**: exterior, inter-AS, **TCP 179** |

- IGP = inside one AS (RIP, OSPF, IS-IS, EIGRP). EGP = between ASes (BGP). Lookup uses longest-prefix match.
- ⭐ Routing algorithm = decides the output line and builds the routing tables.
- ⭐ Congestion control: open loop (prevention) and closed loop (choke packet, backpressure). **Leaky bucket** = constant output, drops packets. **Token bucket** = allows bursts, drops tokens.

---

## 8. Transport layer

| Point | TCP | UDP |
|---|---|---|
| Connection | **Connection-oriented** ⭐ | **Connectionless** ⭐ |
| Reliability | ACK, retransmission, ordering | None (best effort) |
| Unit | Byte stream → segments | Message → user datagram |
| Header | **20–60 bytes** | **8 bytes** |
| Flow / congestion control | Yes / Yes | No / No |
| Broadcast / multicast | No | Yes |
| IP protocol no. | 6 | 17 |
| Users | HTTP, FTP, SMTP, POP3, IMAP, SSH, Telnet, BGP | DNS, DHCP, SNMP, TFTP, NTP, RIP, VoIP, streaming |

- ⭐ Transport protocols: TCP, UDP, **SCTP** (multistreaming, multihoming, IP protocol 132).
- Socket = IP address + port. Ports are 16 bits: well-known 0–1023, registered 1024–49151, dynamic 49152–65535.
- **3-way handshake** ⭐: SYN (seq x) → SYN+ACK (seq y, ack x+1) → ACK (ack y+1). Close: FIN → ACK → FIN → ACK. TIME_WAIT = 2 × MSL.
- SYN and FIN each use one sequence number. The ACK number = the next byte expected.
- ⭐ **Flow control** = receiver's window (rwnd) → stops buffer overflow → **prevents data loss**. Sender window = min(rwnd, cwnd).
- **Congestion control** protects the network (cwnd). Flow control protects the receiver.
- ⭐ **Slow start**: cwnd starts at 1 MSS, +1 MSS per ACK, so it **doubles every RTT** (1, 2, 4, 8) up to ssthresh.
- **Congestion avoidance**: +1 MSS per RTT (linear). **AIMD** = additive increase, multiplicative decrease.
- **Timeout**: ssthresh = cwnd/2 and cwnd = 1 MSS (both Tahoe and Reno). **3 duplicate ACKs**: fast retransmit; Reno also does fast recovery (cwnd = ssthresh).

---

## 9. MASTER PORTS TABLE

| Protocol | Port | TCP/UDP | Use |
|---|---|---|---|
| FTP data | **20** | TCP | File data (active mode) |
| FTP control | **21** | TCP | Commands (out-of-band) |
| SSH / SFTP / SCP | **22** | TCP | Encrypted login and file copy |
| Telnet | **23** | TCP | Plaintext remote login |
| SMTP | **25** | TCP | Send / relay mail (push) |
| DNS | **53** | UDP (TCP for zone transfer) | Name ↔ IP |
| DHCP / BOOTP server | **67** | UDP | Hands out addresses |
| DHCP / BOOTP client | **68** | UDP | Asks for an address |
| TFTP | **69** | UDP | Trivial file transfer, no login |
| HTTP | **80** | TCP | Web |
| Kerberos | 88 | TCP/UDP | Authentication tickets |
| POP3 | **110** | TCP | Pull mail, download-and-delete |
| NNTP | 119 | TCP | Usenet news |
| NTP | **123** | UDP | Clock sync |
| IMAP4 ⭐ | **143** | TCP | Pull mail, stays on server |
| SNMP | **161** | UDP | Agent queries (get/set) |
| SNMP trap | **162** | UDP | Alerts to manager |
| BGP | **179** | TCP | Inter-AS routing |
| LDAP | 389 | TCP | Directory |
| Mobile IP registration | 434 | UDP | MN registers its COA with the HA |
| HTTPS | **443** | TCP (UDP for HTTP/3) | HTTP over TLS |
| SMTPS | 465 | TCP | SMTP over TLS |
| RIP | 520 | UDP | Distance-vector routing |
| SMTP submission | 587 | TCP | Client → mail server |
| IMAPS | 993 | TCP | IMAP over TLS |
| POP3S | 995 | TCP | POP3 over TLS |
| MySQL | 3306 | TCP | Database (registered) |
| RDP | **3389** | TCP | Remote desktop |
| HTTP alternate | 8080 | TCP | Proxy / test server |

- These are IP protocol numbers, not ports: ICMP 1, IGMP 2, TCP 6, UDP 17, ESP 50, AH 51, EIGRP 88, OSPF 89, SCTP 132.
- Memory chain: 20-21 FTP · 22 SSH · 23 Telnet · 25 SMTP · 53 DNS · 67-68 DHCP · 69 TFTP · 80 HTTP · 110 POP3 · 123 NTP · 143 IMAP · 161-162 SNMP · 443 HTTPS.

---

## 10. Application protocols

- **DNS** = distributed, hierarchical name → IP lookup: root → TLD → authoritative. Host to resolver is **recursive** (final answer); resolver to servers is **iterative** (referrals). Answers are cached for their TTL.

| DNS record | Holds |
|---|---|
| A / AAAA | Name → IPv4 / IPv6 |
| CNAME | Alias → canonical name |
| MX | Mail server of the domain |
| NS | Authoritative name server |
| PTR | IP → name (reverse) |
| SOA / TXT | Zone details / free text (SPF) |

| HTTP method | Does | Status class | Meaning |
|---|---|---|---|
| GET | Fetch (data in URL) | 1xx | Informational (100) |
| POST | Submit (data in body) | 2xx | Success (200 OK, 201) |
| PUT | Create or replace | 3xx | Redirect (301, 304 Not Modified) |
| DELETE | Remove | 4xx | Client error (401, 403, 404) |
| HEAD | Headers only | 5xx | Server error (500, 503) |

- HTTP is **stateless**; cookies add state. HTTP/1.1 = persistent connections; HTTP/2 = multiplexing; HTTP/3 = QUIC over UDP.
- **FTP** uses two TCP connections: **21 control** (open all session) and **20 data** (one per file). Passive mode = the client opens the data connection.
- **SMTP pushes** mail (sender → server → server). **POP3 (110) and IMAP (143) pull** it. POP3 downloads and deletes; IMAP keeps mail and folders on the server.
- **MIME** lets 7-bit SMTP carry attachments and non-ASCII data (base64). It is an extension, not a transfer protocol.
- Webmail uses HTTP/HTTPS between browser and server. The sender's server finds the receiver's server via the **MX record**.

---

## 11. Security

| Class | Type | Members | Key / block |
|---|---|---|---|
| Classical | **Substitution** (disguises letters, keeps order) | Caesar (shift 3: HELLO → KHOOR), monoalphabetic, Vigenère (polyalphabetic), Playfair (digraphs), one-time pad | — |
| Classical | **Transposition** ⭐ (reorders, no disguise) | Rail fence, columnar | — |
| Symmetric (one key) | Block | **DES** | **56-bit key**, 64-bit block, 16 rounds |
| Symmetric | Block | **3DES** ⭐ | **168 bits** (3 × 56); 112 with 2 keys or as effective strength; 48 rounds, EDE |
| Symmetric | Block | **AES** (Rijndael) | **128/192/256** key, 128-bit block, 10/12/14 rounds |
| Symmetric | Block | IDEA / Blowfish | 128 / 32–448 bits; 64-bit block |
| Symmetric | Stream | **RC4** | Variable key (WEP) |
| Asymmetric (key pair) | Public key | **RSA** ⭐ | Factoring large primes; encryption + signatures |
| Asymmetric | Public key | **Diffie–Hellman** | **Key exchange only** |
| Asymmetric | Public key | **ECC** / ElGamal | Small keys (256-bit ECC ≈ 3072-bit RSA) / discrete log |
| Asymmetric | Public key | **DSA** | **Signatures only** |
| Hash (no key) | Digest | **MD5 128**, **SHA-1 160**, SHA-256 256, SHA-512 512 | One-way, gives integrity |

- Keys needed: symmetric n(n−1)/2; asymmetric 2n.
- ⭐ **Plaintext** → encryption + key → **ciphertext**. ⭐ **Session key** = temporary symmetric key for one session, exchanged using public-key crypto.
- CIA = confidentiality, integrity, availability. ⭐ **Authentication** = verify identity. Authorisation = permissions. AAA = authentication → authorisation → accounting.
- **Digital signature**: sign with the **sender's private key**, verify with the **sender's public key**. It gives authentication, integrity and non-repudiation, but **not** confidentiality.
- Confidentiality: encrypt with the **receiver's public key**.
- MAC/HMAC = hash + shared key (no non-repudiation). Certificate = X.509, signed by a CA. PKI includes the CRL.
- SSL/TLS sit between application and TCP. HTTPS = 443. IPsec: **AH** = authentication only; **ESP** = encryption. Tunnel mode protects the whole packet.

| Firewall type | Layer | Decides by |
|---|---|---|
| Packet filter | Network/transport | IP, port, protocol (stateless) |
| Stateful inspection | Network/transport | State table of connections |
| Circuit-level gateway | Session | TCP handshake validity (SOCKS) |
| Application proxy | Application | Content; slowest, most secure |
| NGFW | 3–7 | Deep inspection + built-in IPS |

- **IDS** = detects and **alerts** (passive copy). **IPS** = detects and **blocks** (inline). DMZ = public servers between the Internet and the LAN.

| Malware | Key feature |
|---|---|
| Virus | Needs a host file and user action |
| Worm | Self-spreads over the network (Morris 1988) |
| Trojan | Looks useful, hides harm, does not replicate |
| Ransomware | Encrypts files, demands payment (WannaCry 2017) |
| Spyware / Adware | Steals info / shows ads |
| Rootkit | Hides deep and gives root access |
| Keylogger | Records keystrokes |
| Botnet | Zombie machines used for DDoS and spam |

- Phishing = fake mail or site. Pharming = DNS poisoning. Spoofing = faked identity. MITM, SQL injection, XSS.

---

## 12. Internet and web basics

- **ARPANET 1969** (US DoD; 4 nodes: UCLA, SRI, UCSB, Utah). It was the first packet-switched network.
- ARPANET switched to **TCP/IP on 1 Jan 1983**. Cerf and Kahn are the "fathers of the Internet".
- NSFNET 1986. **WWW proposed by Tim Berners-Lee at CERN in 1989**; public in 1991. Mosaic 1993. VSNL brought the public Internet to India on 15 Aug 1995.
- Internet = network of networks (hardware + TCP/IP). WWW = a **service** on it (HTTP, HTML, URLs).
- URL `https://www.example.com:443/notes/index.html?id=5#top` = scheme, host, port, path, query, fragment.
- Domains read right to left: TLD (.in, .com) → second level → host.
- **Browser** (Chrome, Firefox) = client. **Search engine** (Google, Bing) = finds pages. **Web server** (Apache, Nginx, IIS) = serves pages. Chrome is a browser; Google is a search engine.
- **ISP** = Internet Service Provider (Tier 1 backbone, Tier 2 regional, Tier 3 local). IXP = exchange point (NIXI).
- ⭐ Essentials: device + **NIC/modem + TCP/IP** + ISP + browser. ⭐ **Web surfing** = visiting site after site. ⭐ Purpose of interconnection = **messages for communication**.
- E-mail: **To** = main recipient; **CC** = copy visible to all; **BCC** = hidden copy.
- Cookie = small file stored by the server in the browser. Cache = local copy for speed.

---

## 13. Mobile and wireless

| GSM part ⭐ | Full form | Role |
|---|---|---|
| MS | Mobile Station | ME (IMEI) + SIM (IMSI, Ki) |
| **BTS** ⭐ | **Base Transceiver Station** | Radio and antennas of a cell; transmits and receives |
| BSC | Base Station Controller | Controls several BTSs, channels, handover; BSS = BSC + BTSs |
| MSC | Mobile Switching Centre | Call setup, routing, switching; GMSC links to PSTN |
| **HLR** ⭐ | Home Location Register | **Permanent** subscriber database; knows the current VLR |
| **VLR** ⭐ | Visitor Location Register | **Temporary** data for mobiles in its MSC area; **informs the HLR** |
| AuC | Authentication Centre | Keys; A3 (authentication), A8 (cipher key); A5 encrypts the air link |
| EIR | Equipment Identity Register | IMEI white, grey and **black** (stolen) lists |

- GSM 900: uplink 890–915 MHz, downlink 935–960 MHz. 124 carriers of 200 kHz × 8 TDMA slots. Slot ≈ 577 µs; frame ≈ 4.615 ms. GSM = FDMA + TDMA, hard handover.
- Interfaces: Um (MS–BTS), Abis (BTS–BSC), A (BSC–MSC).

| Gen | Technology | Rate | Key point |
|---|---|---|---|
| 1G | Analog, FDMA (AMPS) | ~2.4 kbps | Voice only |
| 2G | GSM (TDMA), IS-95 | 9.6–14.4 kbps | Digital, SMS, SIM |
| 2.5G / 2.75G | GPRS / EDGE | 171 kbps / ~384 kbps | Packet switching (SGSN, GGSN) |
| 3G | UMTS/WCDMA, CDMA2000 | 384 kbps – 2 Mbps | Mobile Internet; soft handover; Node B, RNC |
| 4G | LTE (eNodeB), WiMAX | 100 Mbps moving / 1 Gbps still | All-IP, OFDMA, VoLTE |
| 5G | NR (gNodeB) | up to 20 Gbps | ~1 ms latency; India 1 Oct 2022 |

| Mobile IP ⭐ | Meaning |
|---|---|
| MN | Mobile node; keeps its home IP |
| CN | Correspondent node, the host talking to the MN |
| **HA** | Home Agent: router in the **home** network; intercepts and **tunnels** packets to the COA |
| **FA** ⭐ | Foreign Agent: **router in the foreign network** the MN is attached to; decapsulates |
| **COA** ⭐ | Care-of address = **current tunnel endpoint**. FA-COA = FA's address. **Co-located COA = got by the MN itself via DHCP** |
| Tunnelling | IP-in-IP encapsulation (HA → COA) |

- Steps: agent discovery → registration (MN → FA → HA, UDP 434) → tunnelling.
- Triangular routing: CN → HA → MN, but MN → CN goes direct.

| Orbit | Altitude | Notes |
|---|---|---|
| GEO | **≈ 35,786 km** | 24 h; 3 satellites cover almost all (not the poles); ~250 ms one way |
| MEO | Between LEO and GEO | **GPS ≈ 20,200 km**; 6–12 h |
| LEO | ≈ 500–1,500 km (Schiller); 500–2,000 km (Forouzan) | Low delay; Iridium (66), Starlink |

| Satellite handover ⭐ | Between |
|---|---|
| Intra-satellite | Spot beams of the same satellite |
| Inter-satellite | Two satellites |
| Gateway | Ground gateways |
| **Inter-system** ⭐ | **Satellite ↔ terrestrial cellular** |

- Uplink frequency > downlink (C band 6/4 GHz). Footprint = area a beam covers.
- ⭐ Device categories: fixed + wired (desktop), mobile + wired (laptop on a cable), **fixed + wireless (Wi-Fi router / AP)**, mobile + wireless (smartphone). A Wi-Fi dongle moves with the laptop, so it is not fixed.
- Hard handover = break-before-make (GSM). Soft handover = make-before-break (CDMA). Cluster size N = i² + ij + j²; N = 7 is classic.

---

## 14. Full forms you must know

| Abbreviation | Full form |
|---|---|
| OSI | Open Systems Interconnection |
| TCP | Transmission Control Protocol |
| UDP | User Datagram Protocol |
| SCTP | Stream Control Transmission Protocol |
| TPDU | Transport Protocol Data Unit |
| MAC | Media Access Control |
| NIC | Network Interface Card |
| ARP | Address Resolution Protocol |
| RARP | Reverse Address Resolution Protocol |
| ICMP | Internet Control Message Protocol |
| DHCP | Dynamic Host Configuration Protocol |
| NAT | Network Address Translation |
| CIDR | Classless Inter-Domain Routing |
| MSS | Maximum Segment Size |
| ARQ | Automatic Repeat reQuest |
| CRC | Cyclic Redundancy Check |
| HDLC | High-level Data Link Control |
| PPP | Point-to-Point Protocol |
| CSMA/CD | Carrier Sense Multiple Access with Collision Detection |
| CSMA/CA | Carrier Sense Multiple Access with Collision Avoidance |
| FDMA | Frequency Division Multiple Access |
| TDMA ⭐ | Time Division Multiple Access |
| CDMA | Code Division Multiple Access |
| VLAN | Virtual Local Area Network |
| PAN / LAN | Personal / Local Area Network |
| MAN / WAN | Metropolitan / Wide Area Network |
| RG ⭐ | Radio Government (coax rating) |
| RIP | Routing Information Protocol |
| OSPF | Open Shortest Path First |
| BGP | Border Gateway Protocol |
| DNS | Domain Name System |
| HTTP / HTTPS | HyperText Transfer Protocol / HTTP Secure |
| HTML | HyperText Markup Language |
| URL | Uniform Resource Locator |
| FTP / TFTP | File Transfer Protocol / Trivial FTP |
| SMTP | Simple Mail Transfer Protocol |
| POP3 | Post Office Protocol version 3 |
| IMAP ⭐ | Internet Message Access Protocol |
| MIME | Multipurpose Internet Mail Extensions |
| SNMP | Simple Network Management Protocol |
| SSH | Secure Shell |
| SSL / TLS | Secure Sockets Layer / Transport Layer Security |
| VPN | Virtual Private Network |
| IDS / IPS | Intrusion Detection / Prevention System |
| DES / 3DES ⭐ | Data Encryption Standard / Triple DES |
| AES | Advanced Encryption Standard |
| RSA ⭐ | Rivest–Shamir–Adleman |
| MD5 / SHA | Message Digest 5 / Secure Hash Algorithm |
| GSM | Global System for Mobile communication |
| SIM | Subscriber Identity Module |
| IMEI | International Mobile Equipment Identity |
| BTS ⭐ | Base Transceiver Station |
| BSC | Base Station Controller |
| MSC | Mobile Switching Centre |
| HLR ⭐ / VLR ⭐ | Home Location Register / Visitor Location Register |
| AuC / EIR | Authentication Centre / Equipment Identity Register |
| GPRS | General Packet Radio Service |
| UMTS | Universal Mobile Telecommunications System |
| LTE | Long Term Evolution |
| HA / FA ⭐ | Home Agent / Foreign Agent |
| COA ⭐ | Care-of Address |
| ISP | Internet Service Provider |
| ARPANET | Advanced Research Projects Agency Network |
| WWW ⭐ | World Wide Web |
| CC / BCC | Carbon Copy / Blind Carbon Copy |

---

## 15. Official answers to treat with care

| Paper | Question | Official key | Textbook answer | Why |
|---|---|---|---|---|
| 25 Jun 2023, shift 2 | "Which layer is responsible for sending data as a **bit stream**?" | Data link layer | **Physical layer** | Forouzan: the physical layer carries a bit stream over the medium. The data link layer groups bits into **frames**. |
| 25 Jun 2023, shift 2 | "______ is the address of the **current tunnel endpoint** for MN that can be chosen via **DHCP**." | FA | **COA** (co-located COA) | Schiller: the COA is the tunnel endpoint. A co-located COA is obtained by the MN itself, e.g. via DHCP. The FA is a **router**, not an address. |

- **What to answer:** mark the **textbook answer** (physical layer; COA). It is what every standard book says, and a provisional key can be challenged during the objection window.
- If the same wording comes again, still mark the textbook answer. Do not try to guess the key.
- The rest of the 2023–24 keys match the standard books, so trust the normal rules everywhere else.

---

## 16. Last 10 traps
- [ ] 1. **Bit stream = physical layer.** Frames = data link. Repeater = physical **only**.
- [ ] 2. **Segment** = transport (TPDU); **packet/datagram** = network/internet; user datagram = UDP (transport).
- [ ] 3. **Error and flow control are NOT network-layer functions.** Routing and congestion control are.
- [ ] 4. **4094, not 4096**: always subtract 2. Host count uses the mask's 0-bits; subnet count uses the borrowed bits.
- [ ] 5. **Slow start doubles per RTT**, not per ACK. +1 MSS per RTT is congestion avoidance. After a timeout, cwnd = 1.
- [ ] 6. **λ = speed × period** (not × frequency). Wavelength is **not** a sine-wave parameter.
- [ ] 7. **RG → coax**, **Category → twisted pair**. Core index > cladding.
- [ ] 8. **3DES = 168** (56 is DES, 112 is two-key/effective). RC4 is symmetric; RSA, DH, ECC and DSA are asymmetric. Sign with the **sender's private** key.
- [ ] 9. **VLR informs HLR** (not the reverse). BTS = **Transceiver**. GSM = hard handover. TDMA = time slots; NDMA/PDMA do not exist.
- [ ] 10. **FA = router, COA = address** (tunnel endpoint, DHCP → co-located). Inter-system handover = satellite ↔ terrestrial. GBN window 2^m − 1, SR 2^(m−1). Piconet = 7 active slaves (8 devices).
