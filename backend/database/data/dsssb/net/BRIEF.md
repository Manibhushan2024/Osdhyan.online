# Computer Networks + Internet for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT Computer Science candidate revising Networks to score full marks, and to revise FAST. Plain, exact English.
Exam: objective MCQ, 1 mark, −0.25 for a wrong answer. Networks is about 11 questions per paper — the second-heaviest CS area.

## Syllabus (owner's list)
OSI/TCP-IP layers, topologies, devices (hub/switch/router), IP addressing & subnetting, TCP/UDP, DNS/HTTP/FTP/SMTP,
network security (firewall, encryption), Internet & web basics.

## How DSSSB actually asks Networks (all 43 questions from the 4 official papers, 2023–2024)
Full list with options, official answers and solutions: `backend/database/data/dsssb/net_pyq_analysis.json`. READ IT FIRST.
DSSSB goes well beyond the syllabus line — the questions follow Forouzan / Tanenbaum chapter by chapter:
1. **Models & layers**: which layer sends a bit stream (physical), repeater works only in the physical layer, PDUs (segment/TPDU at transport, datagram/packet at internet layer, frame, bits), network-layer functions.
2. **Physical layer & media**: sine-wave parameters (Forouzan: peak amplitude, frequency/period and phase — wavelength is NOT one of the three describing parameters; official key agrees), wavelength λ = propagation speed × period = c/f, coaxial cable categorised by RG (Radio Government) ratings, optical fibre (core refractive index > cladding for total internal reflection), unguided media statements, line configuration (point-to-point vs multipoint), topologies (bus/star/ring/mesh/tree), P2P vs client-server (server vs clients/workstations).
3. **Data link**: ARQ-based error control (retransmission), flow control, multiple access (TDMA: same frequency, different time slots; FDMA; CDMA).
4. **Network layer**: subnet-mask host counts (255.255.240.0 → 2^12 − 2 = 4094 hosts), IPv4 is 4 bytes / 32 bits, datagram vs virtual-circuit, routing algorithm manages routing tables, congestion definition.
5. **Transport layer**: TCP features (connection-oriented, reliable, byte stream, full duplex), UDP (send encapsulated IP datagrams without establishing a connection), well-known ports (POP3 110, IMAP 143, SMTP 25, HTTP 80, HTTPS 443, FTP 20/21, Telnet 23, SSH 22, DNS 53, DHCP 67/68, SNMP 161), flow control prevents data loss (sliding window), congestion control — slow start (cwnd grows exponentially until threshold).
6. **Security**: symmetric (DES, 3DES, AES, Blowfish, IDEA, RC4) vs asymmetric (RSA, Diffie–Hellman, ECC, DSA), Triple DES key length (168 bits effective 112; 3 × 56), transposition cipher reorders letters without disguising them (substitution disguises), session key, authentication = verifying identity, plaintext/ciphertext.
7. **Internet & web**: web surfing/browsing, essentials for Internet communication (modem/NIC, ISP, TCP/IP, browser), purpose of internetworking.
8. **Mobile & wireless** (6 questions — not in the syllabus line but asked): GSM — BTS (Base Transceiver Station), BSC, MSC, HLR (permanent subscriber data) vs VLR (temporary data of visiting subscribers); Mobile IP — home agent, foreign agent (router in the foreign network the mobile node is attached to), care-of address (COA, the current tunnel endpoint for the mobile node, may be obtained via DHCP = co-located COA; the 2023 official key marked "FA" for this — teach COA and note the key's error); satellite handover (inter-system handover satellite ↔ terrestrial); categories of mobile computing devices (fixed and wired / mobile and wired / fixed and wireless / mobile and wireless).

## Chapters (use these exact keys and titles everywhere)
| key | chapter title |
|---|---|
| nw_basics | Network Basics, Types & Topologies |
| nw_models | OSI & TCP/IP Models, PDUs & Network Devices |
| nw_physical | Physical Layer: Signals, Transmission Media & Switching |
| nw_datalink | Data Link Layer, Error Control & Medium Access |
| nw_network | Network Layer: IP Addressing, Subnetting & Routing |
| nw_transport_app | Transport & Application Layer Protocols |
| nw_security | Network Security, Internet & Web Basics |
| nw_mobile | Mobile & Wireless Communication |

## Research input
`net/research/research.md` (when present) lists the topics that DSSSB-focused YouTube channels and exam websites stress most. Use it to decide emphasis.

## Facts must be correct
Use standard references (Forouzan "Data Communications and Networking", Tanenbaum "Computer Networks", RFCs for ports/protocols, Schiller "Mobile Communications" for GSM/Mobile IP). Show every subnetting/numerical step. Never invent protocols, port numbers or standards.
