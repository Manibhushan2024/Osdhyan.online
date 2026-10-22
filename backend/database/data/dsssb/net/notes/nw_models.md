# OSI & TCP/IP Models, PDUs & Network Devices

**In 30 seconds**
- The **OSI model** (by ISO) has 7 layers. From bottom to top they are Physical, Data link, Network, Transport, Session, Presentation, Application. Mnemonic: **"Please Do Not Throw Sausage Pizza Away"**.
- **Physical layer** = sends the **bit stream** over the medium. ⭐ Asked in DSSSB
- **Delivery scope:** data link = hop to hop (**frames**), network = source host to destination host (**packets**), transport = process to process (**segments**).
- **PDUs** ⭐ Asked in DSSSB: message (application), **segment / TPDU** (transport) ⭐, **packet / datagram** (network or internet layer) ⭐, frame (data link), bits (physical).
- **TCP/IP** has 4 layers (Link, Internet, Transport, Application), or 5 in Forouzan. Its application layer covers OSI layers 5–7.
- **Addresses:** MAC = 48 bits, IPv4 = 32 bits (4 bytes), IPv6 = 128 bits, port = 16 bits, specific address = URL or e-mail.
- **Devices:** **repeater and hub = layer 1 only** ⭐, bridge and switch = layer 2, router = layer 3, gateway = all layers.
- A **switch** gives each port its own **collision domain**. A **router** separates **broadcast domains**.

---

## 1. Why layering?
- It splits one complex communication task into **smaller, manageable sub-tasks**.
- Each layer **uses the services of the layer below** and **gives services to the layer above**, across a defined **interface**.
- **Peer-to-peer processes:** layer x on one machine "talks" to layer x on the other machine by following that layer's **protocol**.
- **Modularity:** a change inside one layer does not affect the others, as long as the interface stays the same.
- **Standardisation and interoperability:** equipment from different vendors can work together. This is an **open system**.
- **Open system (Forouzan):** *a set of protocols that allows any two different systems to communicate regardless of their underlying architecture.*
- **OSI** = Open Systems Interconnection. It was developed by **ISO** and introduced in the late 1970s. It is a **reference model** for understanding and designing networks, not a protocol.

---

## 2. OSI model: the big table

| # | Layer | Key function | PDU | Address used | Protocols / standards | Devices |
|---|---|---|---|---|---|---|
| 7 | **Application** | Gives network services to the user | Message (data) | Specific address (URL, e-mail) | HTTP, FTP, SMTP, POP3, IMAP, DNS, Telnet, SSH, SNMP, DHCP | Gateway, application (proxy) firewall |
| 6 | **Presentation** | Translation, encryption, compression | Data | — | ASCII, EBCDIC, JPEG, MPEG, MIDI, XDR (SSL/TLS is often listed here) | Gateway |
| 5 | **Session** | Dialog control, synchronisation (checkpoints) | Data | — | RPC, NetBIOS | Gateway |
| 4 | **Transport** | Process-to-process delivery, end-to-end flow and error control | **Segment (TPDU)** / user datagram | **Port address (16 bits)** | TCP, UDP, SCTP | Gateway, layer-4 firewall |
| 3 | **Network** | Source-to-destination delivery, logical addressing, routing | **Packet / datagram** | **Logical (IP) address** | IPv4, IPv6, ICMP, IGMP, IPsec, OSPF (ARP/RARP link layers 2 and 3) | **Router**, layer-3 switch, brouter, packet-filter firewall |
| 2 | **Data link** | Hop-to-hop delivery of frames, framing, physical addressing, flow, error and access control | **Frame** | **Physical (MAC) address (48 bits)** | Ethernet (802.3), Wi-Fi MAC (802.11), PPP, HDLC, Token Ring | **Bridge, switch**, NIC, access point |
| 1 | **Physical** | Moves individual **bits** over the medium | **Bits** | — | RS-232, 10Base-T, DSL, encoding standards | **Repeater, hub**, modem, cables, connectors |

**Mnemonics**
- Bottom to top (1 → 7): **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way.
- Top to bottom (7 → 1): **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing.
- Upper layers 5–7 are the **user support** layers. Layer 4 links the two groups. Lower layers 1–3 are the **network support** layers.
- Layers 1–3 work **hop by hop** (in every router). Layers 4–7 work **end to end** (only in the hosts).

---

## 3. Each layer in detail (Forouzan wording)

### Layer 1: Physical ⭐ Asked in DSSSB
**Definition:** *responsible for movements of individual bits from one hop (node) to the next.* It coordinates the functions needed to **carry a bit stream over a physical medium**.

| It defines | Meaning |
|---|---|
| Physical characteristics of interfaces and medium | Cable types, connectors, pins |
| **Representation of bits** | Encoding of 0s and 1s into electrical or optical signals |
| **Data rate** | Bits per second (the duration of one bit) |
| **Synchronisation of bits** | The sender and receiver clocks must match |
| **Line configuration** | Point-to-point or multipoint |
| **Physical topology** | Mesh, star, ring, bus |
| **Transmission mode** | Simplex, half-duplex or full-duplex |

- **2023 PYQ:** "Which layer is responsible for sending data as a bit stream?" The correct answer is the **physical layer**. The official key showed "data link layer". That is a key error: the data link layer groups bits into **frames**.

### Layer 2: Data link
**Definition:** *responsible for moving frames from one hop (node) to the next.* It turns the raw physical layer into a **reliable link**.

| Function | What it does |
|---|---|
| **Framing** | Divides the bit stream into manageable units called **frames** |
| **Physical addressing** | Adds a header with the **MAC** addresses of the sender and the receiver (the next hop) |
| **Flow control** | Stops a fast sender from overwhelming the receiver |
| **Error control** ⭐ | Detects and **retransmits damaged, lost or duplicate frames**, using a **trailer** (for example, CRC). It is based on **ARQ (Automatic Repeat reQuest)**. |
| **Access control** | Decides which device controls a **shared link** at a given time (CSMA/CD, token passing) |

- **Sublayers** (IEEE): **LLC** (Logical Link Control, upper) and **MAC** (Media Access Control, lower).
- **2024 PYQ:** "In the data link layer, _____ is based on automatic repeat request." The answer is **error control**.

### Layer 3: Network
**Definition:** *responsible for the source-to-destination delivery of a packet, possibly across multiple networks (links).*

| Function | What it does |
|---|---|
| **Logical addressing** | Adds the **IP addresses** of the source and destination, which are universal and work across networks |
| **Routing** ⭐ | Routers choose the **path** and route or switch packets to the final destination |
| Others (Tanenbaum) | **Congestion control**, quality of service, internetworking (fragmentation) |

- The **routing algorithm** *manages routing tables and makes routing decisions* ⭐ Asked in DSSSB.
- **2023 PYQ:** which is **NOT** a network-layer function? The answer is **"error control and flow control"**. Routing, intra-domain routing and congestion control **are** network-layer functions.
- **Datagram network** (connectionless): packets are called **datagrams** and are routed independently. A **virtual-circuit network** needs **circuit setup** first ⭐ Asked in DSSSB.
- **Congestion** = too many packets in (part of) the network, causing delay and loss ⭐ Asked in DSSSB.

### Layer 4: Transport
**Definition:** *responsible for process-to-process delivery of the entire message.* A **process** is an application program running on a host.

| Function | What it does |
|---|---|
| **Service-point (port) addressing** | Delivers to the correct **process** by its **port number** |
| **Segmentation and reassembly** | Splits a message into **segments**, each with a **sequence number**, and reassembles them at the destination |
| **Connection control** | **Connectionless** (UDP) or **connection-oriented** (TCP: connect, transfer, release) |
| **Flow control** ⭐ | Done **end to end** (sliding window). It **prevents data loss** (2023 PYQ). |
| **Error control** | Done **process to process**: the whole message arrives without error, loss or duplication. Errors are fixed by **retransmission**. |

- **Transport protocols** ⭐ Asked in DSSSB: **TCP, UDP and SCTP**. FTP and DNS are application layer, ICMP is network layer, and ARP/RARP work at the network/data-link boundary.
- **Data link vs transport:** both do flow and error control. The data link layer does it on **one link (hop)**. The transport layer does it **end to end**.

### Layer 5: Session
**Definition:** *the network dialog controller. It establishes, maintains and synchronizes the interaction among communicating systems.*

| Function | What it does |
|---|---|
| **Dialog control** | Lets two systems talk in **half-duplex** (one at a time) or **full-duplex** |
| **Synchronisation** | Adds **checkpoints (synchronisation points)**. Example: when sending a 2,000-page file, a checkpoint every 100 pages means a crash at page 523 only requires pages 501–523 to be sent again. |

### Layer 6: Presentation
**Definition:** *concerned with the syntax and semantics of the information exchanged between two systems.*

| Function | What it does |
|---|---|
| **Translation** | Changes sender-dependent formats (for example, ASCII and EBCDIC) into a common format, and back at the receiver |
| **Encryption** | Changes plaintext into ciphertext for privacy. **Decryption** reverses it. |
| **Compression** | Reduces the number of bits (important for audio and video) |

### Layer 7: Application
**Definition:** *enables the user, whether human or software, to access the network*. It provides user interfaces and support for services.

| Service | Example |
|---|---|
| Network virtual terminal | Remote login (Telnet) |
| File transfer, access and management (FTAM) | FTP |
| Mail services | SMTP, POP3, IMAP |
| Directory services | DNS, X.500 |

---

## 4. Encapsulation and decapsulation
- **Encapsulation (sender, going down the layers):** each layer adds its **header** to the data from the layer above.
  - L7 data → L6 adds H6 → L5 adds H5 → L4 adds H4 (segment) → L3 adds H3 (packet) → L2 adds **H2 + trailer T2** (frame) → L1 converts it to **bits**.
- The **trailer is added only at the data link layer** (it carries error-detection bits such as CRC).
- **Decapsulation (receiver, going up the layers):** each layer removes its own header or trailer, reads it and passes the payload upward.
- **Routers** decapsulate only up to **layer 3**, then re-encapsulate with a new frame (new MAC addresses) for the next hop. **IP addresses stay the same. MAC addresses change at every hop.**

```
Sender                                   Receiver
  Data            (Application)             Data
  H4|Data         Segment  (Transport)      H4|Data
  H3|H4|Data      Packet   (Network)        H3|H4|Data
  H2|...|T2       Frame    (Data link)      H2|...|T2
  010110...       Bits     (Physical)  -->  010110...
```

---

## 5. TCP/IP model and its mapping to OSI

| OSI layer | TCP/IP layer (4-layer: Tanenbaum, RFC 1122) | 5-layer (Forouzan) | Main protocols |
|---|---|---|---|
| 7 Application | **Application** | Application | HTTP, FTP, SMTP, DNS, Telnet, SNMP, DHCP |
| 6 Presentation | **Application** | Application | (merged) |
| 5 Session | **Application** | Application | (merged) |
| 4 Transport | **Transport** | Transport | **TCP, UDP, SCTP** |
| 3 Network | **Internet** | Network | **IP**, ICMP, IGMP, ARP, RARP |
| 2 Data link | **Link (host-to-network / network access)** | Data link | Ethernet, Wi-Fi, PPP |
| 1 Physical | **Link** | Physical | Medium-dependent |

| Point | OSI | TCP/IP |
|---|---|---|
| Layers | 7 | 4 (or 5) |
| Developed by | ISO, as a model **before** the protocols | DARPA (ARPANET). The **protocols came first** and the model was described afterwards. |
| Nature | Reference model, general | Practical, used on the Internet |
| Separate session and presentation layers | Yes | No (they are part of the application layer) |
| Network layer | Connectionless **and** connection-oriented | **Connectionless only** (IP) |
| Transport layer | Connection-oriented | Both (TCP connection-oriented, UDP connectionless) |
| Service, interface and protocol distinction | Clear | Not clear |

- The TCP/IP **internet layer** works with **packets (datagrams)** ⭐ Asked in DSSSB.
- IP is an **unreliable, connectionless, best-effort** datagram protocol.
- **UDP** sends encapsulated IP datagrams **without establishing a connection** ⭐ Asked in DSSSB (the paper misprinted it as "Unit Datagram Protocol"; it is the User Datagram Protocol).

---

## 6. PDUs per layer ⭐ Asked in DSSSB

| Layer (OSI / TCP-IP) | PDU name | Remember |
|---|---|---|
| Application / Presentation / Session | **Message (data)** | Produced by the application |
| **Transport** | **Segment** (TCP) or **user datagram** (UDP). Tanenbaum calls it a **TPDU** (Transport Protocol Data Unit). | "Messages sent from transport entity to transport entity" = **segment** (2023 PYQ) |
| **Network / Internet** | **Packet**, also called a **datagram** (IP datagram) | "Internet layer is associated with **packets**" (2023 PYQ) |
| **Data link** | **Frame** | Has a header **and** a trailer |
| **Physical** | **Bits** (symbols, signals) | Bit stream |

- Do not confuse **"user datagram"** (UDP, transport layer) with **"IP datagram"** (network layer).
- Mnemonic, top to bottom: **"Some People Fear Birds"** (Segment, Packet, Frame, Bits).

---

## 7. Addresses (four levels, Forouzan)

| Address | Layer | Size | Example | Changes hop to hop? |
|---|---|---|---|---|
| **Physical (link / MAC)** | Data link | **48 bits = 6 bytes**, written as 12 hex digits | 07:01:02:01:2C:4B | **Yes**, it changes at every hop |
| **Logical (IP)** | Network | **IPv4 = 32 bits (4 bytes)**, **IPv6 = 128 bits (16 bytes)** | 192.168.1.10 | No, it stays the same end to end |
| **Port** | Transport | **16 bits** (0–65535) | 80 (HTTP), 25 (SMTP), 143 (IMAP) | No |
| **Specific (user-friendly)** | Application | Variable | URL www.example.com, e-mail user@example.com | — |

- An IPv4 address (4 bytes) has a **network address (netid)** and a **host address (hostid)** ⭐ Asked in DSSSB.
- MAC addresses are burned into the **NIC**. The first 24 bits are the **OUI** (the manufacturer's ID).
- **ARP** maps IP → MAC. **RARP** maps MAC → IP.

---

## 8. Network (connecting) devices ⭐ Asked in DSSSB

### Forouzan's five categories
| Category | Device |
|---|---|
| Below the physical layer | **Passive hub** (just a connector) |
| Physical layer | **Repeater**, **active hub** |
| Physical + data link layers | **Bridge**, **two-layer switch** |
| Physical + data link + network layers | **Router**, **three-layer switch** |
| All five (or seven) layers | **Gateway** |

### Device by device
- **NIC (Network Interface Card / LAN adapter):** connects a computer to the network. It holds the **48-bit MAC address**. Works at **layers 1 and 2**.
- **Repeater** ⭐ Asked in DSSSB (works **only in the physical layer**):
  - *"A repeater receives a signal and, before it becomes too weak or corrupted, **regenerates** the original bit pattern."*
  - It is **not an amplifier**. An amplifier also amplifies noise. A repeater regenerates a clean signal.
  - It **connects segments of the same LAN**, extending the cable length. It does **not** connect two different LANs.
  - It has **no filtering**: it forwards every bit. It cannot read addresses.
- **Hub:** a **multiport repeater** (an active hub). It sends incoming bits out of **all** other ports. All ports are **one collision domain and one broadcast domain**. It is half-duplex and uses a shared bandwidth.
- **Bridge:** works at the **physical and data link layers**.
  - It reads **MAC addresses** and **filters** frames, forwarding a frame only to the segment where its destination lives.
  - It uses a table. A **transparent (learning) bridge** builds its table itself, and the **spanning tree** algorithm prevents loops.
  - It splits collision domains, one per port, but **does not split broadcast domains**.
- **Switch (two-layer):** a **bridge with many ports**, designed for faster performance.
  - **Each port is its own collision domain.** It is full-duplex with dedicated bandwidth per port.
  - The whole switch is **one broadcast domain** (unless it is divided into VLANs).
  - **Layer-3 switch:** a router implemented in fast hardware, so it routes by IP.
- **Router:** a **three-layer device** (physical, data link, network).
  - It **routes packets by their logical (IP) addresses** using a **routing table**, and it connects LANs and WANs.
  - **Each interface is a separate collision domain and a separate broadcast domain.** Routers **do not forward broadcasts**.
  - Each interface has its own IP and MAC address.
- **Gateway:** *normally a computer that operates in all five layers of the Internet or seven layers of OSI model.*
  - It is a **protocol converter**: it connects networks that use **different protocols or models** (for example, an e-mail gateway or a VoIP-to-PSTN gateway).
  - Today the term is also used for a **default gateway**, meaning the router that leads out of a LAN.
- **Brouter (bridge router):** it **routes** routable protocols (such as IP) and **bridges** non-routable ones. It works at **layers 2 and 3**.
- **Modem (modulator–demodulator):** **modulation** converts digital to analog for sending over telephone or cable lines. **Demodulation** converts analog back to digital. It works at the **physical layer**. Examples: dial-up (V.90, V.92), DSL, cable modem.
- **Access point (AP):** connects **wireless** stations to a **wired** LAN (802.11). It acts like a **layer-2 bridge** between Wi-Fi and Ethernet.
- **Firewall:** a device or software that **filters traffic** between a trusted and an untrusted network using rules.
  - A **packet-filter firewall** works at the **network and transport layers** (it checks IP addresses and ports).
  - A **proxy (application-level) firewall** works at the **application layer**.

### Device comparison table
| Device | OSI layer | Works on | Filtering / intelligence | Collision domains | Broadcast domains |
|---|---|---|---|---|---|
| Repeater | 1 | Signals (bits) | None, regenerates only | 1 (does not split) | 1 |
| Hub | 1 | Bits | None, floods all ports | **1 for all ports** | 1 |
| Bridge | 2 | Frames (MAC) | Filters by MAC | 1 per port | 1 |
| Switch (L2) | 2 | Frames (MAC) | Forwards by MAC table | **1 per port** | **1** (no VLANs) |
| Layer-3 switch | 3 | Packets (IP) | Routes in hardware | 1 per port | 1 per VLAN or interface |
| Router | 3 | Packets (IP) | Routes by routing table | 1 per interface | **1 per interface** |
| Brouter | 2 and 3 | Frames and packets | Bridges plus routes | 1 per port | Depends |
| Gateway | All (1–7) | Messages | Protocol conversion | — | Separate networks |
| Modem | 1 | Signals | Modulation only | — | — |
| NIC | 1 and 2 | Bits and frames | Has the MAC address | — | — |
| Access point | 2 | Wireless frames | Bridges WLAN and LAN | Shared (one wireless medium) | 1 |
| Firewall | 3/4 (packet filter) or 7 (proxy) | Packets or messages | Allows or denies by rules | — | — |

---

## 9. Collision domain vs broadcast domain

| Term | Meaning | Split by |
|---|---|---|
| **Collision domain** | The part of a network where two frames sent at the same time **collide** (a shared medium) | Bridge, switch, router (each port is a new domain) |
| **Broadcast domain** | The set of devices that receive a **broadcast frame** (destination FF:FF:FF:FF:FF:FF) sent by any one of them | **Router** (or a VLAN or layer-3 switch) only |

**Counting rules**
- Hub or repeater: every device connected to it is in **one** collision domain.
- Switch or bridge: count **one collision domain per used port** (a hub hanging off a port is one domain).
- Router: count **one broadcast domain per used interface**. Each interface is also a collision domain.
- With no router (and no VLANs), the whole network is **1 broadcast domain**.

### Worked example 1
**Setup:** one hub with 8 PCs.
- All 8 PCs share the hub, so there is **1 collision domain**.
- There is no router, so there is **1 broadcast domain**.

### Worked example 2
**Setup:** one switch whose 3 ports each connect to a hub, and each hub has 4 PCs.
- Each switch port is a separate collision domain, and each hub with its 4 PCs is one shared domain. So there are **3 collision domains**.
- A switch does not block broadcasts, so there is **1 broadcast domain**.
- If the switch instead connected 12 PCs directly, there would be 12 collision domains and still 1 broadcast domain.

### Worked example 3
**Setup:** a router with 2 interfaces.
- Interface A goes to a **switch** that has 5 PCs.
- Interface B goes to a **hub** that has 4 PCs.

**Collision domains**
- Switch side: the switch uses 6 ports (5 PCs plus 1 uplink to the router), and each port is a collision domain. That gives **6**.
- Hub side: the hub, its 4 PCs and the router interface share 1 domain. That gives **1**.
- Total = 6 + 1 = **7 collision domains**.

**Broadcast domains**
- One per router interface = **2 broadcast domains**.

---

## Exam traps
1. The **bit stream** is the **physical layer**, not the data link layer. The 2023 official key wrongly showed data link.
2. A **repeater works only in the physical layer**. It **regenerates** the signal; it is not an amplifier, and it has no filtering.
3. A **hub** is a multiport repeater (layer 1). It is **not** a switch. All its ports are one collision domain.
4. **Switch and bridge = layer 2** (MAC). **Router = layer 3** (IP). A layer-3 switch is a router in hardware.
5. **Switches split collision domains, not broadcast domains.** Only **routers** (or VLANs) split broadcast domains.
6. **Error control and flow control are NOT network-layer functions.** They belong to the data link layer (hop) and the transport layer (end to end). Routing and congestion control **are** network-layer functions.
7. The transport PDU is a **segment (TPDU)**, not a packet. The network/internet-layer PDU is a **packet or datagram**.
8. "User datagram" (UDP) is a **transport** PDU. "IP datagram" is a **network** PDU.
9. The **trailer is added only by the data link layer**. All other layers add only headers.
10. **Dialog control and synchronisation (checkpoints)** = session layer. **Translation, encryption and compression** = presentation layer.
11. In TCP/IP, the **application layer** covers OSI session, presentation and application. There are no separate session or presentation layers.
12. **MAC = 48 bits** and changes every hop. **IPv4 = 32 bits** and stays the same end to end. **Port = 16 bits**.

## One-liners for revision
1. OSI = Open Systems Interconnection, developed by ISO.
2. OSI is a reference model, not a protocol.
3. The 7 layers from bottom to top are Physical, Data link, Network, Transport, Session, Presentation, Application.
4. Mnemonic: Please Do Not Throw Sausage Pizza Away.
5. The physical layer moves individual bits (the bit stream) from one hop to the next.
6. The physical layer defines bit representation, data rate, bit synchronisation, line configuration, topology and transmission mode.
7. The data link layer moves frames from one hop to the next.
8. Data link functions: framing, physical addressing, flow control, error control and access control.
9. Data-link error control is based on ARQ (retransmission).
10. The data link sublayers are LLC and MAC.
11. The network layer delivers packets from source host to destination host.
12. Network functions: logical addressing and routing (plus congestion control).
13. The routing algorithm manages routing tables and makes routing decisions.
14. The transport layer delivers process to process.
15. Transport functions: port addressing, segmentation and reassembly, connection control, flow and error control.
16. Transport protocols are TCP, UDP and SCTP.
17. The session layer is the dialog controller: dialog control and synchronisation (checkpoints).
18. The presentation layer handles translation, encryption and compression.
19. The application layer provides services to the user (FTAM, mail, directory, virtual terminal).
20. The application-layer PDU is a message.
21. The transport-layer PDU is a segment (TPDU) or user datagram.
22. The network-layer PDU is a packet or datagram.
23. The data-link PDU is a frame. The physical-layer PDU is bits.
24. Encapsulation = each layer adds a header going down. Only the data link layer adds a trailer.
25. TCP/IP has 4 layers: Link, Internet, Transport, Application (Forouzan uses 5).
26. The TCP/IP application layer = OSI layers 5, 6 and 7.
27. IP is connectionless, unreliable and best effort.
28. The MAC address is 48 bits (6 bytes, in hex).
29. IPv4 is 32 bits (4 bytes). IPv6 is 128 bits.
30. A port number is 16 bits (0–65535).
31. A specific address is a URL or an e-mail address.
32. A repeater works at the physical layer only and regenerates the signal.
33. A hub is a multiport repeater with one collision domain.
34. A bridge works at the data link layer and filters by MAC address.
35. A switch is a multiport bridge, and each port is its own collision domain.
36. A router works at the network layer, routes by IP and separates broadcast domains.
37. A gateway works at all layers and converts protocols.
38. A brouter is a bridge plus a router.
39. A modem does modulation and demodulation (digital ↔ analog).
40. An access point connects wireless stations to a wired LAN.

## Quick self-check
1. **Which layer is responsible for sending data as a bit stream?**
   The physical layer.
2. **What is the transport-layer PDU called in Tanenbaum?**
   A segment, or TPDU.
3. **What PDU is the TCP/IP internet layer associated with?**
   Packets (datagrams).
4. **At which layer does a repeater work?**
   Only the physical layer.
5. **Which layer adds a trailer?**
   The data link layer.
6. **Which layer handles checkpoints and dialog control?**
   The session layer.
7. **Is "error control and flow control" a network-layer function?**
   No. It belongs to the data link and transport layers.
8. **How many bits are in a MAC address and in a port number?**
   48 bits and 16 bits.
9. **A switch has 10 PCs, one per port. How many collision and broadcast domains are there?**
   10 collision domains and 1 broadcast domain.
10. **A router connects 3 LANs, and each LAN is built on a hub. How many broadcast and collision domains are there?**
    3 broadcast domains and 3 collision domains.
