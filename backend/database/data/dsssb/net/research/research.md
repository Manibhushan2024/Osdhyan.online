# DSSSB TGT CS: Networks and Internet weighting

Researched 2026-10-22. Tags: **SYL** = DSSSB TGT CS Section-B subject list (includes Computer Networks, TCP/IP Protocols, Network Security, Mobile Computing); **VK** = Victory Key analysis of 12 official TGT papers (CN 102/1,130 questions, 9.0%, rank 2 after OS; Mobile/GSM 15); **KG** = KnowledgeGate DSSSB Section-B curriculum; **PWU** = PW UGC NET Unit-9 PYQs; **PWK/PWE** = PW KVS PGT / EMRS TGT syllabi; **PWD** = PW DSSSB syllabus; **GS** = Gate Smashers CN Lec-1 (targets DSSSB, PGT/TGT); **UA** = Unacademy NVS/KVS/DSSSB lesson titles; **PYQ n** = hits in our 43 real questions.

YouTube pages gave titles only. DSSSB networking or PYQ videos exist, but no subtopics were visible.

## (a) Top 30 topics

| # | Topic | Evidence | Priority |
|---|---|---|---|
| 1 | OSI/TCP-IP layers, functions, PDUs | PYQ 5; GS, PWU, PWD, UA, SYL | Must |
| 2 | TCP vs UDP | PYQ 4; PWU ("most frequently asked"); KG | Must |
| 3 | Symmetric vs asymmetric; DES/3DES/AES/RSA key sizes | PYQ 2; SYL; PWU; KG | Must |
| 4 | Security basics: plain/cipher text, CIA, authentication, session key | PYQ 3; SYL; KG | Must |
| 5 | Substitution vs transposition; mono/poly ciphers | PYQ 1; PWU | Must |
| 6 | GSM architecture (BTS, BSC, MSC, HLR, VLR, AuC) | PYQ 2; VK; SYL; PWU; PWK/PWE | Must |
| 7 | Mobile IP (HA, FA, COA, tunnelling) | PYQ 2; SYL; KG | Must |
| 8 | IPv4 classes, masks, subnet host count | PYQ 2; PWU; KG; PWK/PWE | Must |
| 9 | Network devices and their layers | PYQ 2; PWK/PWE; KG | Must |
| 10 | Transmission media (coax RG, fibre TIR, twisted pair, wireless) | PYQ 4; PWK/PWE | Must |
| 11 | Circuit vs packet switching; datagram vs VC | PYQ 3; PWK/PWE | Must |
| 12 | Topologies | PYQ 1; PWK/PWE; UA | Must |
| 13 | PAN/LAN/MAN/WAN; P2P vs client-server | PYQ 2; PWK/PWE | Must |
| 14 | Application protocols and full forms | PYQ 2; PWK/PWE; KG | Must |
| 15 | Well-known ports | PYQ 1; PWU | Must |
| 16 | TCP congestion control, leaky/token bucket | PYQ 2; KG; PWU | Must |
| 17 | TDMA/FDMA/CDMA | PYQ 1; PWU | Should |
| 18 | Flow/error control: stop-and-wait, GBN, SR, ARQ, piggybacking | PYQ 2; KG; PWU; UGC NET June 2026 | Should |
| 19 | Signals: sine wave, wavelength, bandwidth, data rate | PYQ 2; PWK; KG | Should |
| 20 | Network-layer functions; routing (DV, LS, RIP, OSPF, BGP) | PYQ 2; PWD; KG | Should |
| 21 | Parity, checksum, CRC, Hamming | PYQ 0; PWU; KG | Should |
| 22 | ALOHA, CSMA/CD, CSMA/CA, Ethernet | PYQ 0; PWU; KG | Should |
| 23 | ARP, RARP, ICMP, DHCP | PYQ 0 (as distractors); PWU; KG | Should |
| 24 | Satellite systems and handovers | PYQ 1; SYL | Should |
| 25 | Mobile device classes, GPRS, WLL, 3G/4G | PYQ 1; PWK/PWE | Should |
| 26 | ARPANET, NSFNET, WWW, URL, browsing | PYQ 2; PWK/PWE; VK (Web Tech 58 Qs) | Should |
| 27 | Cyber threats, firewall, digital signature, hashing | PYQ 0; PWK/PWE; KG | Should |
| 28 | Line configuration; simplex/half/full duplex | PYQ 1 | Good to know |
| 29 | IPv6; IPv4/TCP/UDP headers | PWU | Good to know |
| 30 | Cloud computing basics | KG (inside CN module) | Good to know |

## (b) Recurring question styles

- **One-line definitions** ("this is called..."). This is the largest group.
- **Layer-device mapping** (repeater = physical).
- **Protocol-layer mapping** ("which are transport protocols?"), with ARP/ICMP/FTP as distractors.
- **PDU per layer** (segment, packet, frame).
- **Port numbers**, framed as service plus daemon (IMAP 143).
- **Subnetting numerical** (mask to host count), about one per paper.
- **Crypto classification and key length** ("which is NOT symmetric" = RSA; 3DES = 168).
- **Full forms** (BTS, HLR, VLR, COA).
- **GSM / Mobile IP role statements.**
- **Statement I/II and "which is FALSE"** items.
- **Physics-style data communication** (wavelength formula, fibre refractive index).
- 2 of the 43 official keys look wrong, so explanations must stand on their own.

## (c) 40 high-frequency facts

1. OSI layers, bottom up: Physical, Data Link, Network, Transport, Session, Presentation, Application.
2. TCP/IP model: Link, Internet, Transport, Application.
3. PDUs: bits, frames, packets, segments (TCP) or user datagrams (UDP), messages.
4. Repeater and hub: physical. Bridge and switch: data link. Router: network. Gateway: up to all layers.
5. MAC is 48-bit, IPv4 is 32-bit, IPv6 is 128-bit.
6. Socket = IP address + port.
7. TCP is connection-oriented and reliable, and uses a 3-way handshake (SYN, SYN-ACK, ACK).
8. UDP is connectionless with an 8-byte header. DNS, DHCP, SNMP, TFTP and streaming use it.
9. IPv4 and TCP headers are 20-60 bytes. The IPv6 base header is 40 bytes.
10. Classes by first octet: A 1-126, B 128-191, C 192-223, D multicast, E reserved. 127 is loopback.
11. Default masks are /8, /16 and /24. Usable hosts = 2^h - 2.
12. Private ranges: 10/8, 172.16/12, 192.168/16.
13. Ports: FTP 20/21, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67/68, HTTP 80, POP3 110, IMAP 143, SNMP 161, HTTPS 443.
14. Well-known ports are 0-1023.
15. ARP maps IP to MAC and RARP maps MAC to IP. ICMP reports errors and runs ping. DHCP assigns IPs dynamically.
16. Slow start doubles cwnd every RTT. Congestion avoidance adds 1 MSS per RTT. A timeout halves ssthresh.
17. Leaky bucket sends at a constant rate. Token bucket allows bursts.
18. Stop-and-wait has window 1. GBN sender window is at most 2^m - 1. SR uses 2^(m-1).
19. Piggybacking = the ACK carried on a data frame.
20. CRC uses modulo-2 division. Detecting s errors needs dmin = s + 1. Correcting t errors needs dmin = 2t + 1.
21. Maximum throughput: pure ALOHA 18.4%, slotted ALOHA 36.8%.
22. Ethernet 802.3 uses CSMA/CD. Wi-Fi 802.11 uses CSMA/CA. Bluetooth is 802.15.
23. A full mesh needs n(n-1)/2 links. Bus uses one backbone with terminators.
24. Coax is rated by RG number. Twisted pair is rated by Category.
25. Fibre works by total internal reflection, so the core's refractive index is higher than the cladding's.
26. Wavelength = speed x period = speed / frequency.
27. A sine wave is described by amplitude, frequency and phase.
28. Circuit and virtual-circuit networks need setup. Datagram networks do not.
29. DES has a 56-bit key, 64-bit blocks and 16 rounds. 3DES uses 168 bits (112 with two keys). AES uses 128/192/256-bit keys.
30. Symmetric: DES, 3DES, AES, RC4, IDEA, Blowfish. Asymmetric: RSA, Diffie-Hellman, ECC, DSA.
31. Hashes: MD5 is 128-bit, SHA-1 is 160-bit.
32. A digital signature is made with the sender's private key and checked with the sender's public key.
33. Transposition reorders letters. Substitution replaces them (Caesar is substitution).
34. Security goals (CIA): confidentiality, integrity, availability.
35. GSM: MS = ME + SIM. BTS and BSC form the BSS. Also MSC, HLR (permanent), VLR (temporary), AuC, EIR.
36. The VLR updates the HLR when a mobile moves.
37. Mobile IP: HA at home, FA abroad. The COA is a foreign-agent or co-located (DHCP) address, and packets are tunnelled.
38. TDMA shares by time slots, FDMA by frequency bands, CDMA by codes.
39. ARPANET (1969) was the first packet-switched network. NSFNET followed in 1986. Berners-Lee proposed the WWW in 1989.
40. A firewall filters traffic between trusted and untrusted networks. Phishing steals credentials through fake messages or sites.

## (d) Gaps: stressed by sources, absent from our 43 PYQs

- Devices beyond the repeater: hub, bridge, switch, router, gateway, modem, RJ45, Wi-Fi card.
- Ports beyond IMAP, and protocol full forms (HTTP, FTP, SMTP, POP3, DNS, DHCP, Telnet, VoIP, PPP).
- IP classes, private and special addresses, CIDR, IPv6.
- CRC and Hamming numericals.
- Sliding window and piggybacking.
- ALOHA, CSMA, Ethernet, IEEE 802 numbers.
- ARP, RARP, ICMP, DHCP. Routing protocols.
- DNS resolution and email flow (SMTP push vs POP/IMAP pull).
- Malware types, DoS, firewall, digital signature, hashing, SSL/TLS, IT Act.
- GPRS, WLL, 3G/4G/5G, CDMA, frequency reuse, Bluetooth.
- Multiplexing (FDM, TDM, WDM), Nyquist/Shannon capacity, transmission modes.
- ARPANET/NSFNET history, URL and domain names, web hosting.
- Cloud computing.

## (e) Sources

- https://sarkarisyllabus.com/dsssb-tgt-computer-science-syllabus/
- https://www.piyushwairale.com/blog/dsssb-tgt-computer-science-2026-675-vacancies-syllabus-exam-pattern-salary
- https://thevictorykey.com/dsssb
- https://www.knowledgegate.ai/courses/DSSSB-TGT-COMPUTER-SCIENCE-PAPER-2
- https://www.pw.live/teaching/exams/dsssb-tgt-computer-science-syllabus
- https://www.pw.live/teaching/exams/kvs-pgt-computer-science-syllabus
- https://www.pw.live/teaching/exams/emrs-tgt-computer-science-syllabus
- https://www.pw.live/ugc-net/exams/ugc-net-computer-science-unit-9-pyqs
- https://www.pw.live/ugc-net/exams/ugc-net-june-2026-computer-science-question-paper
- https://syllabus4u.com/dsssb-tgt-computer-science-syllabus/
- https://www.adda247.com/teaching-jobs-exam/dsssb-tgt-computer-science-previous-year-question-paper/
- https://www.careerpower.in/blog/dsssb-tgt-computer-science-previous-year-question-paper
- https://www.flipkart.com/neelkanth-dsssb-tgt-computer-science-teaching-methodology/p/itmf6775af2cdd6f
- Gate Smashers: https://videohighlight.com/v/JFF2vJaN0Cw and https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_
- YouTube: https://www.youtube.com/watch?v=G7DSs7wyUdk (Lalit Sir), https://www.youtube.com/watch?v=dL2SP95OLAk (Naveen Sir), https://www.youtube.com/watch?v=H8v-7fyOKSk (Vivek Kumar Pandey), https://www.youtube.com/watch?v=l66bRaaQ4ls (Neeraj Sir)
- Unacademy: https://unacademy.com/lesson/important-question-of-nvs-ugc-net-based-on-topology-in-networking/T7R6H9OF and https://unacademy.com/lesson/important-previous-year-questions-for-data-communication-and-networking/5B6F1213
- Local: C:\dev\test-series-platform\backend\database\data\dsssb\net_pyq_analysis.json
