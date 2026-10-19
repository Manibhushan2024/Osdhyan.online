# Computer Networks & Internet: DSSSB TGT CS Revision Notes

## 1. One-page summary

- Expect 8–12 questions from networks in Section B. Most are one-line facts (layer of a device, port of a protocol, class of an IP address); 2–3 are numericals (subnetting, mesh links, download time).
- Learn three tables cold: OSI layers with devices and protocols, well-known ports, and IPv4 classes. Together they cover about half the questions.
- Subnetting questions are solved with one idea: block size = 256 − the last non-255 octet of the mask.
- −0.25 per wrong answer: in "which layer" questions, eliminate by PDU (bits / frame / packet / segment) first.

## 2. OSI and TCP/IP models

| # | OSI layer | PDU | Main job | Devices | Protocols / examples | TCP/IP layer |
|---|---|---|---|---|---|---|
| 7 | Application | Data | User services | Gateway | HTTP, HTTPS, FTP, SMTP, POP3, IMAP, DNS, DHCP, Telnet, SSH, SNMP | Application |
| 6 | Presentation | Data | Translation, encryption, compression | Gateway | SSL/TLS (often placed here), JPEG, MPEG, ASCII/Unicode | Application |
| 5 | Session | Data | Dialogue control, synchronisation, checkpoints | Gateway | NetBIOS, RPC, PPTP | Application |
| 4 | Transport | Segment (TCP) / Datagram (UDP) | End-to-end delivery, port addressing, flow and error control, segmentation | Gateway, L4 firewall | TCP, UDP, SCTP | Transport |
| 3 | Network | Packet | Logical (IP) addressing, routing | Router, L3 switch | IPv4, IPv6, ICMP, IGMP, RIP, OSPF, BGP | Internet |
| 2 | Data Link | Frame | Physical (MAC) addressing, framing, error detection, media access | Switch, bridge, NIC | Ethernet (802.3), Wi-Fi (802.11), PPP, HDLC | Network Access |
| 1 | Physical | Bits | Signals, cables, connectors, bit timing | Hub, repeater, modem | RJ45, coaxial, fibre, DSL | Network Access |

- ARP sits between layers 2 and 3; most exams place it at the Network layer (TCP/IP Internet layer). Read the options.
- Mnemonic top-down: **All People Seem To Need Data Processing**. Bottom-up: **Please Do Not Throw Sausage Pizza Away**.
- Encapsulation at the sender: Data → Segment → Packet → Frame → Bits. The receiver reverses it.
- Addresses: port number (Transport), IP address (Network), MAC address (Data Link, 48 bits = 12 hex digits).
- The TCP/IP model has 4 layers (Application, Transport, Internet, Network Access); some books show 5 by splitting the link layer into Data Link and Physical.

## 3. Devices at a glance

| Device | Layer | Decision based on | Collision domains | Broadcast domains |
|---|---|---|---|---|
| Repeater | 1 | Just regenerates the signal | Not split | Not split |
| Hub | 1 | Sends to all ports | One for all ports | One |
| Bridge | 2 | MAC address filtering | One per port | One |
| Switch | 2 | MAC address table | One per port | One (unless VLANs) |
| Router | 3 | Destination IP, routing table | One per interface | One per interface |
| Gateway | All 7 | Converts between different protocol suites | — | — |
| Modem | 1 | Digital ↔ analog (modulation / demodulation) | — | — |

Exam numerical: 24 PCs on one switch → 24 collision domains, 1 broadcast domain. On one hub → 1 and 1.

## 4. Topologies and media

- Mesh links = n(n−1)/2; ports per device = n−1 (10 devices → 45 links; 8 devices → 28 links).
- Bus needs terminators (stop signal reflection); ring fails if one node or link fails (unless dual ring); star fails if the hub fails but not if one cable fails; tree = stars hanging on a bus backbone.
- Twisted pair (RJ45, Cat 5e/Cat 6; twisting reduces crosstalk), coaxial (cable TV), optical fibre (light, total internal reflection, immune to EMI; single-mode = long distance, laser; multimode = short distance, LED).
- Unguided media: radio, microwave (line of sight), infrared (cannot pass walls), satellite (geostationary ≈ 36,000 km).
- 100BASE-TX = 100 Mbps, baseband signalling, twisted pair.
- Transmission modes: simplex (radio broadcast, keyboard → CPU), half duplex (walkie-talkie), full duplex (telephone).

## 5. IPv4 classes and special addresses

| Class | First octet | Leading bits | Default mask | Hosts per network | Use |
|---|---|---|---|---|---|
| A | 1–126 | 0 | 255.0.0.0 (/8) | 16,777,214 | Very large networks |
| B | 128–191 | 10 | 255.255.0.0 (/16) | 65,534 | Medium networks |
| C | 192–223 | 110 | 255.255.255.0 (/24) | 254 | Small networks |
| D | 224–239 | 1110 | — | — | Multicast |
| E | 240–255 | 1111 | — | — | Experimental |

- 127.x.x.x is loopback (127.0.0.1). 0.0.0.0 = "this host" / default route. 255.255.255.255 = limited broadcast.
- Private (RFC 1918): 10.0.0.0/8, 172.16.0.0–172.31.255.255, 192.168.0.0/16. They reach the Internet through NAT.
- APIPA / link-local: 169.254.0.0/16 (self-assigned when DHCP fails).

## 6. Subnetting in four steps

1. Host bits h = 32 − prefix. Usable hosts = 2^h − 2.
2. Borrowed bits b give 2^b subnets.
3. Block size = 256 − the interesting octet of the mask (/26 → 192 → block 64).
4. Network address = largest multiple of the block size ≤ host octet; broadcast = next block − 1.

| Prefix | Mask (last octet) | Block size | Usable hosts |
|---|---|---|---|
| /25 | 128 | 128 | 126 |
| /26 | 192 | 64 | 62 |
| /27 | 224 | 32 | 30 |
| /28 | 240 | 16 | 14 |
| /29 | 248 | 8 | 6 |
| /30 | 252 | 4 | 2 |

- Worked example: 192.168.10.77/26 → block 64 → subnets .0, .64, .128, .192 → network 192.168.10.64, broadcast .127, usable .65–.126.
- Need 6 subnets from a /24 → 2^3 = 8 ≥ 6 → /27 (255.255.255.224) → 30 hosts each.
- Summarising four /24 networks 192.168.0–3.0 → 192.168.0.0/22.
- /20 = 255.255.240.0; a /22 has 1022 usable hosts.

## 7. IPv4 vs IPv6

| Feature | IPv4 | IPv6 |
|---|---|---|
| Size | 32 bits (≈ 4.3 billion) | 128 bits (≈ 3.4 × 10^38) |
| Notation | Dotted decimal, 4 octets (0–255) | 8 groups of 4 hex digits; `::` allowed once |
| Header | 20–60 bytes, has checksum | Fixed 40 bytes, no checksum |
| Address types | Unicast, multicast, broadcast | Unicast, multicast, anycast (no broadcast) |
| Loopback | 127.0.0.1 | ::1 |
| Configuration | Manual / DHCP | SLAAC / DHCPv6 |
| Loop-prevention field | TTL | Hop Limit |

## 8. TCP vs UDP

| TCP | UDP |
|---|---|
| Connection-oriented (3-way handshake SYN, SYN-ACK, ACK; FIN to close) | Connectionless |
| Reliable, ordered, acknowledgements, retransmission | Best effort, no ordering |
| Flow control (sliding window) and congestion control | Neither |
| Header 20–60 bytes | Header 8 bytes |
| HTTP, HTTPS, FTP, SMTP, POP3, IMAP, SSH, Telnet | DNS queries, DHCP, TFTP, SNMP, VoIP, live streaming, games |

## 9. Well-known ports

| Port | Protocol | Port | Protocol |
|---|---|---|---|
| 20 / 21 | FTP data / control | 80 | HTTP |
| 22 | SSH (encrypted) | 110 | POP3 |
| 23 | Telnet (plain text) | 123 | NTP |
| 25 | SMTP | 143 | IMAP |
| 53 | DNS | 161 / 162 | SNMP / SNMP trap |
| 67 / 68 | DHCP server / client | 443 | HTTPS |
| 69 | TFTP (UDP) | 3306 / 3389 | MySQL / Remote Desktop |

Port numbers are 16-bit (0–65535): well-known 0–1023, registered 1024–49151, dynamic 49152–65535.

## 10. Protocols, security, wireless and Internet basics

- DNS: name → IP. Records: A (IPv4), AAAA (IPv6), MX (mail server), CNAME (alias), PTR (reverse lookup), NS. TLDs: generic (.com, .org, .edu) and country-code (.in).
- E-mail: SMTP sends (push); POP3 downloads and usually deletes from the server; IMAP keeps mail on the server and synchronises all devices.
- HTTP is stateless; cookies and sessions add state. Status codes: 200 OK, 301 Moved Permanently, 404 Not Found, 500 Internal Server Error.
- DHCP gives IP, mask, gateway and DNS. ARP: IP → MAC; RARP: MAC → IP. ICMP is used by ping and traceroute.
- Routing: RIP (distance vector, max 15 hops, 16 = unreachable), OSPF (link state, Dijkstra), BGP (between autonomous systems / ISPs).
- Security: firewall (packet filter at L3/L4; application gateway or proxy at L7); DMZ holds public servers; VPN = encrypted tunnel over the Internet; IDS detects, IPS blocks.
- Cryptography: symmetric = one shared key (DES, AES); asymmetric = public/private pair (RSA). Confidentiality → encrypt with the receiver's public key. Digital signature → sign with the sender's private key. Hashes (SHA-256) are one-way.
- Wi-Fi = IEEE 802.11 (Wi-Fi 4 = n, Wi-Fi 5 = ac, Wi-Fi 6 = ax), 2.4 / 5 / 6 GHz, CSMA/CA, SSID = network name, WEP is broken → use WPA2/WPA3. Ethernet = 802.3, CSMA/CD.
- Bluetooth = IEEE 802.15.1, PAN, about 10 m, 2.4 GHz; a piconet has 1 master and up to 7 active slaves.
- PAN < LAN < MAN (city) < WAN (country / world). Intranet = internal only; extranet = intranet opened to partners.
- URL parts: scheme://host:port/path?query#fragment. An ISP provides Internet access. ARPANET (1969) was the forerunner of the Internet; the WWW was created by Tim Berners-Lee at CERN (1989).
- Speed numericals: convert bytes to bits (× 8) before dividing by Mbps.

## 11. Frequently asked in DSSSB

- The layer of a given device (hub, switch, router, gateway) or protocol (ICMP, ARP, TCP, HTTP).
- Port numbers of HTTP, HTTPS, FTP, SMTP, DNS, POP3 and Telnet.
- IP class from the first octet, default masks and number of hosts in a /n network.
- Mesh link formula n(n−1)/2; counting collision and broadcast domains.
- Full forms and purpose of DNS, DHCP, ARP, URL, ISP, VPN, SMTP, MAC.
- IPv6 length and notation; TCP vs UDP differences; which medium is immune to EMI.

## 12. Fifteen one-liners

1. OSI has 7 layers; TCP/IP has 4.
2. Router = Network layer; switch and bridge = Data Link; hub and repeater = Physical.
3. A gateway can operate at all seven layers.
4. PDU at Transport = segment, Network = packet, Data Link = frame, Physical = bits.
5. MAC address = 48 bits; IPv4 = 32 bits; IPv6 = 128 bits.
6. Class C default mask = 255.255.255.0.
7. /27 gives 30 usable hosts; /26 gives 62.
8. 127.0.0.1 and ::1 are the loopback addresses.
9. HTTP 80, HTTPS 443, FTP 20/21, SMTP 25, DNS 53.
10. SMTP sends mail; POP3 and IMAP retrieve it.
11. TCP handshake: SYN → SYN-ACK → ACK.
12. The UDP header is only 8 bytes.
13. Wi-Fi = IEEE 802.11; Ethernet = IEEE 802.3; Bluetooth = 802.15.1.
14. Optical fibre is immune to electromagnetic interference.
15. In RIP a hop count of 16 means unreachable.

## 13. Five traps

1. **127 is not a usable Class A network.** The Class A range is 1–126; 127 is reserved for loopback.
2. **Usable hosts subtract 2.** A /24 has 256 addresses but 254 usable hosts; options without the −2 are planted.
3. **Bits vs bytes.** A 100 MB file on an 8 Mbps link takes 100 s, not 12.5 s.
4. **IPv6 has no broadcast**, and `::` may appear only once in an address.
5. **Swapped port pairs.** FTP control is 21 and data is 20; SSH is 22 and Telnet 23; HTTPS still runs on TCP (443). Options often swap these.
