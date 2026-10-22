# Network Basics, Types & Topologies

**In 30 seconds**
- **Data communication** = exchange of data between two devices over a transmission medium. It has 5 components: message, sender, receiver, medium, protocol.
- Its effectiveness depends on 4 characteristics: **delivery, accuracy, timeliness, jitter**.
- Data flow is **simplex** (one way only), **half-duplex** (both ways, one at a time) or **full-duplex** (both ways at once).
- **Point-to-point** = a dedicated link between exactly two devices. **Multipoint** = more than two devices share one link (shared in space or in time). ⭐ Asked in DSSSB
- **Peer-to-peer** has no dedicated server and suits about 10 computers. In **client–server**, a central **server** serves the **clients** (workstations). ⭐ Asked in DSSSB
- **Topologies**: bus (one backbone cable) ⭐, star (central hub), ring (each node linked to 2 neighbours), mesh (n(n−1)/2 links, n−1 ports per device), tree, hybrid.
- By size, from small to large: PAN, LAN, CAN, MAN, WAN, Internet (GAN).
- **Total delay** = transmission (L/R) + propagation (d/s) + queuing + processing.

---

## 1. Data communication: components and characteristics

**Definition (Forouzan):** *Data communications are the exchange of data between two devices via some form of transmission medium such as a wire cable.*

### Five components
| Component | Meaning | Example |
|---|---|---|
| Message | The information (data) to be sent | Text, numbers, pictures, audio, video |
| Sender | The device that sends the message | Computer, phone, video camera |
| Receiver | The device that receives the message | Computer, phone, TV |
| Transmission medium | The physical path between sender and receiver | Twisted pair, coaxial cable, fibre, radio waves |
| Protocol | *A set of rules that govern data communications* | TCP/IP, HTTP |

**Key elements of a protocol:** **syntax** (the structure or format of the data), **semantics** (the meaning of each section of bits) and **timing** (when data should be sent and how fast).

### Four fundamental characteristics
| Characteristic | Meaning |
|---|---|
| **Delivery** | Data must reach the correct destination, and only the intended device or user. |
| **Accuracy** | Data must be delivered accurately. Altered data is unusable. |
| **Timeliness** | Data must arrive on time. Late audio or video is useless. Delivering data as it is produced is called **real-time** transmission. |
| **Jitter** | The **variation in packet arrival time**. Packets sent every 30 ms that arrive after 30 ms, then 40 ms, then 30 ms cause uneven audio or video. |

- **Data representation:** text (Unicode, ASCII), numbers (binary), images (bit patterns, pixels), audio and video (continuous or discrete signals).

---

## 2. Data flow (transmission mode)

| Mode | Direction | Link capacity | Example |
|---|---|---|---|
| **Simplex** | One way only, like a one-way street | The whole capacity is used in one direction | Keyboard → CPU, monitor, TV and radio broadcast |
| **Half-duplex** | Both ways, but **not at the same time** | The whole capacity is used by whichever device is sending | Walkie-talkie, CB radio |
| **Full-duplex (duplex)** | Both ways **at the same time** | Capacity is shared between the two directions (two paths, or one link divided) | Telephone |

---

## 3. Line configuration (type of connection) ⭐ Asked in DSSSB

**Network (Forouzan):** *a set of devices (often referred to as nodes) connected by communication links.* A **link** is a communications pathway that transfers data from one device to another.

| Feature | **Point-to-point** | **Multipoint (multidrop)** |
|---|---|---|
| Definition | *Provides a **dedicated link** between two devices* | *More than two specific devices share a single link* |
| Capacity | *The entire capacity of the link is reserved* for those two devices | Capacity is shared, either **spatially** (devices use the link at the same time) or **temporally (timeshared)** (devices take turns) |
| Example | TV remote and TV (infrared), a leased line, modem to modem | Bus LAN, mainframe with many terminals on one line |
| Topologies | Mesh, star (each device to the hub), ring | Bus |

- **2024 PYQ:** "I. It provides a dedicated link between two devices. II. It is a timeshared connection." The answer is **Only I**. Timesharing belongs to multipoint links.

---

## 4. Network criteria

| Criterion | Measured by |
|---|---|
| **Performance** | **Transit time** (time for a message to go from one device to another) and **response time** (time between an inquiry and its response). It depends on the number of users, the medium, the hardware and the software. It is evaluated by **throughput** and **delay**: we want more throughput and less delay, but the two often conflict. |
| **Reliability** | The **frequency of failure**, the **time a link takes to recover** from a failure, and the network's **robustness in a catastrophe**. |
| **Security** | Protecting data from unauthorised access and damage, and having policies to recover from breaches and data loss. |

---

## 5. Network types by size

| Type | Typical range | Owner | Example |
|---|---|---|---|
| **PAN** (Personal Area Network) | About 10 m, around one person | Individual | Bluetooth earphones, phone-to-laptop link (IEEE 802.15) |
| **LAN** (Local Area Network) | A room, building or campus (up to a few km) | Private | Ethernet (IEEE 802.3) or Wi-Fi (IEEE 802.11) in an office or school lab |
| **CAN** (Campus Area Network) | A campus of several buildings (about 1–5 km) | One organisation | University or military campus |
| **MAN** (Metropolitan Area Network) | A town or city (up to about 50 km) | Company or public body | Cable TV network, WiMAX (IEEE 802.16), a city bank network |
| **WAN** (Wide Area Network) | A country, continent or the world | Telecom companies (public or leased) | Leased-line network linking a company's branches, a satellite network |
| **GAN / Internet** | The whole planet | No single owner | The Internet, a network of networks |

- **Tanenbaum's scale:** 1 m = PAN; 10 m to 1 km = LAN; 10 km = MAN; 100–1,000 km = WAN; 10,000 km = the Internet.
- **LAN** features: high data rate, low error rate, private ownership, usually a broadcast medium.
- **WAN** features: lower speed, higher delay, uses **switched** or **point-to-point** links.
- An **internetwork (internet)** is formed when two or more networks are connected.

### Intranet vs extranet vs Internet
| Term | Who can use it | Note |
|---|---|---|
| **Internet** | Everyone in the world | A public, global network of networks that uses TCP/IP |
| **Intranet** | Only an organisation's own employees | A **private** network that uses Internet technology (TCP/IP, web browsers) |
| **Extranet** | Employees **plus authorised outsiders** (partners, suppliers, customers) | Part of an intranet opened to selected outsiders, usually through a VPN and login |

- **Essentials for using the Internet** ⭐ Asked in DSSSB: a **NIC or modem** (hardware), the **TCP/IP** protocol suite, an **ISP** connection and a **browser** (software). The answer was "NIC and TCP/IP". Monitor, keyboard and camera are not essential.
- **Purpose of the worldwide interconnection** ⭐ Asked in DSSSB: **messages for communication**.
- **Web surfing (browsing)** ⭐ Asked in DSSSB = visiting different websites on the Internet.

---

## 6. Network architecture: peer-to-peer vs client–server ⭐ Asked in DSSSB

| Point | **Peer-to-peer (P2P)** | **Client–server** |
|---|---|---|
| Dedicated server | **No**. Every computer is an equal **peer**. | **Yes**. The central controller is the **server**. ⭐ |
| Other computers | Peers act as **both client and server** | They are called **clients** (workstations) ⭐ |
| Size | Small, usually **up to about 10 computers** | Small to very large, scales well |
| Control | Decentralised. **Each user sets the sharing permissions** for their own resources. | Centralised. The administrator manages users, security and backup. |
| Cost | Cheap, easy to set up | Costly (server hardware, network OS, administrator) |
| Security | Weak, hard to manage | Strong, central |
| Failure | One peer failing does not stop the others | **Server failure stops all its services** (single point of failure) |
| Performance | Falls as the number of peers grows | Server can be upgraded, and it handles many requests |
| Example | Home network, Windows workgroup, BitTorrent | Web server, mail server, a school lab domain server |

**True/false statements from the exam (2023, "FALSE about peer-to-peer"):**
- "This network has a **dedicated server**." **FALSE**, and this was the answer.
- "It is useful for small environments, usually up to 10 computers." TRUE.
- "Special permissions are assigned to each computer for sharing the resources." TRUE.
- "All the computers are linked together with **equal privilege** and responsibilities." TRUE.

**Client–server (2023):** "the central controller is known as a **server**, while all other computers are called **clients**."

---

## 7. Physical topology ⭐ Asked in DSSSB

**Definition (Forouzan):** *the way in which a network is laid out physically*. It is the geometric representation of the relationship of all the links and devices to one another.

### Mesh
- **Fully connected:** every device has a **dedicated point-to-point link** to every other device.
- **Links** (duplex) = **n(n − 1)/2**. Simplex links = n(n − 1).
- **I/O ports per device** = **n − 1**. All ports together = n(n − 1).
- Advantages: dedicated links (no traffic problems), **robust** (one failed link does not disable the network), privacy and security, easy fault identification.
- Disadvantages: a lot of cabling and many I/O ports, so it is **expensive** and hard to install.
- Example: the backbone that connects the main telephone regional offices. WAN backbones often use a partial mesh.

### Star
- Every device has a dedicated point-to-point link **only to a central controller (hub or switch)**. There is **no direct traffic between devices**.
- Each device needs **1 link and 1 I/O port**, so n devices need n links.
- Advantages: cheaper than mesh, easy to install and reconfigure, robust (if one link fails only that device is affected), easy fault isolation.
- Disadvantage: **if the hub fails, the whole network is dead**.
- Example: **Ethernet LANs** with a hub or switch (the most common LAN topology).

### Bus ⭐ Asked in DSSSB
- A **multipoint** topology. **One long cable, the backbone**, links all the devices through **drop lines** and **taps**, with a **terminator** at each end.
- Advantages: easy to install, uses the **least cable**.
- Disadvantages: hard to reconnect or isolate a fault. Signal reflection at taps limits the number of devices. **A fault or break in the backbone stops all transmission**, even between devices on the same side.
- Example: early Ethernet (10Base5 thick and 10Base2 thin coaxial).

### Ring
- Each device has a dedicated point-to-point link **only with the two devices on either side**.
- The signal passes **in one direction**, from device to device. **Each device contains a repeater** that regenerates the bits and passes them on.
- n devices need n links.
- Advantages: easy to install. To add or remove a device, only two links change. Fault isolation is simple.
- Disadvantages: unidirectional traffic. **A single break can disable the whole ring.** This is solved with a **dual ring** or a switch that closes the break.
- Example: IBM **Token Ring** (IEEE 802.5) and FDDI (a dual ring).

### Tree and hybrid
- **Tree (hierarchical):** a variation of star. Secondary hubs connect to a central hub, so the devices form a hierarchy. If the root hub fails, its branches are cut off. It combines bus and star features. Example: cable TV distribution, a large school network.
- **Hybrid:** two or more topologies combined, for example a star backbone with bus or ring sub-networks.

### Topology comparison table
| Topology | Links for n devices | Ports per device | Cabling | Effect of one failure | Cost | Example |
|---|---|---|---|---|---|---|
| **Mesh** | n(n−1)/2 | n−1 | Maximum | Very little (other paths exist) | Highest | Telephone regional backbone |
| **Star** | n (to the hub) | 1 | More than bus | Link failure affects 1 device. **Hub failure stops everything.** | Moderate | Ethernet LAN with a switch |
| **Bus** | 1 backbone + n drop lines | 1 | **Least** | **Backbone break stops everything** | Lowest | 10Base2 Ethernet |
| **Ring** | n | 2 links (1 in, 1 out) | Moderate | **One break can disable the ring** (unless dual ring) | Moderate | Token Ring, FDDI |
| **Tree** | n − 1 (hierarchy) | Varies | Moderate to high | Root hub failure cuts off its branches | Moderate to high | Cable TV, campus |
| **Hybrid** | Mixed | Mixed | Mixed | Depends on its parts | High | Large enterprise |

**Mesh quick numbers**
| n | Links n(n−1)/2 | Ports per device n−1 |
|---|---|---|
| 4 | 6 | 3 |
| 5 | 10 | 4 |
| 6 | 15 | 5 |
| 10 | 45 | 9 |

---

## 8. Standards bodies

| Body | Full form | Known for |
|---|---|---|
| **ISO** | International Organization for Standardization | The **OSI model** (1970s–80s) |
| **ITU-T** | International Telecommunication Union – Telecommunication Standardization Sector (formerly **CCITT**) | Telephone and telecom standards: **V-series** (modems), **X.25** |
| **IEEE** | Institute of Electrical and Electronics Engineers | **Project 802**: 802.3 Ethernet, 802.5 Token Ring, 802.11 Wi-Fi, 802.15 Bluetooth/PAN, 802.16 WiMAX |
| **ANSI** | American National Standards Institute | US national standards body. It is the US member of ISO. |
| **EIA** | Electronic Industries Association | Interface standards: **RS-232**, EIA/TIA-568 cabling |
| **IETF** | Internet Engineering Task Force | Internet standards, published as **RFCs** (Request for Comments) |

- **Internet standard path:** **Internet Draft** (a working document valid for 6 months) → **RFC** → proposed standard → draft standard → Internet standard.
- **De facto** standards are not approved by a body but widely adopted. **De jure** standards are legislated by an official body.

---

## 9. Bandwidth, throughput, latency and delay

| Term | Definition |
|---|---|
| **Bandwidth (in Hz)** | The **range of frequencies** a channel can pass (for example, 4 kHz for a phone line) |
| **Bandwidth (in bps)** | The **number of bits per second** a channel or link can transmit (its rated capacity) |
| **Throughput** | **How fast we can actually send data** through a network. Throughput ≤ bandwidth. |
| **Latency (delay)** | **How long an entire message takes to arrive completely** at the destination, from when the first bit is sent |
| **Bandwidth–delay product** | Bandwidth × delay = the **number of bits that can fill the link** |
| **Jitter** | The variation in delay between packets |

### Delay formulas
| Delay | Formula | Depends on |
|---|---|---|
| **Transmission delay** | **T_t = L / R** (L = message size in bits, R = bandwidth in bps) | Message size and bandwidth |
| **Propagation delay** | **T_p = d / s** (d = distance, s = propagation speed, about 2 × 10^8 m/s in cable and 3 × 10^8 m/s in vacuum) | Distance and medium |
| **Queuing delay** | Time a packet waits in router queues | Network load |
| **Processing delay** | Time a router takes to examine the header | Router speed |
| **Total latency** | **= T_t + T_p + queuing + processing** | All of the above |

- **Units:** 1 Mbps = 10^6 bps. 1 byte = 8 bits. For data rates, k = 10^3 and M = 10^6.
- Transmission delay is the time to **put** the bits on the line. Propagation delay is the time for **one bit to travel** the distance.

### Worked numerical 1
A 1,000-byte frame is sent over a 10 Mbps link that is 2,000 km long. Propagation speed = 2 × 10^8 m/s. Find the total delay (ignore queuing and processing).
1. L = 1,000 × 8 = 8,000 bits.
2. T_t = L / R = 8,000 / (10 × 10^6) = 0.0008 s = **0.8 ms**.
3. T_p = d / s = (2,000 × 10^3 m) / (2 × 10^8 m/s) = 0.01 s = **10 ms**.
4. Total = 0.8 + 10 = **10.8 ms**. Propagation dominates for short messages.

### Worked numerical 2
A 5 MB file (1 MB = 10^6 bytes) is sent over a 100 Mbps link of 3,000 km. s = 2 × 10^8 m/s. Find the total delay.
1. L = 5 × 10^6 × 8 = 4 × 10^7 bits.
2. T_t = 4 × 10^7 / 10^8 = **0.4 s = 400 ms**.
3. T_p = (3 × 10^6 m) / (2 × 10^8 m/s) = 0.015 s = **15 ms**.
4. Total = 400 + 15 = **415 ms**. Transmission dominates for large files.

**Throughput example:** a 10 Mbps link carries on average 6,000 frames per minute, with 10,000 bits per frame.
- Throughput = (6,000 × 10,000) / 60 = **1 Mbps**, which is only one-tenth of the bandwidth.

**Bandwidth–delay example:** for a 1 Mbps link with a 10 ms propagation delay, the product is 10^6 × 0.01 = **10,000 bits** "in flight" on the link.

---

## Exam traps
1. **Point-to-point is dedicated, not timeshared.** Timesharing (temporal sharing) is a feature of **multipoint** links.
2. **P2P has no dedicated server.** "Has a dedicated server" is the FALSE statement.
3. In client–server, the central controller is the **server** and the others are **clients**, not "peers".
4. **Mesh links = n(n−1)/2** (duplex), not n(n−1). n(n−1) counts **simplex** links or **total ports**. Ports per device = **n−1**.
5. **Bus uses multipoint.** Mesh, star and ring use **point-to-point** links.
6. **Star:** a single link failure affects only that device, but **hub failure** stops the network. Do not mix this up with bus, where a **backbone failure** stops everything.
7. In a **ring**, each device has a **repeater** and data moves in **one direction**.
8. **Half-duplex** is both directions but **not at once** (walkie-talkie). The telephone is **full-duplex**.
9. **Jitter** is the **variation** in delay, not the delay itself.
10. **Throughput ≤ bandwidth.** Throughput is the actual rate. Bandwidth is the capacity.
11. **Transmission delay = L/R** depends on size. **Propagation delay = d/s** depends on distance. Do not swap them.
12. **Intranet** = private, for employees only. **Extranet** = an intranet plus authorised outsiders.

## One-liners for revision
1. Data communication = exchange of data between two devices via a transmission medium.
2. The 5 components are message, sender, receiver, transmission medium and protocol.
3. A protocol is a set of rules that govern data communications.
4. The 3 key elements of a protocol are syntax, semantics and timing.
5. The 4 characteristics of data communication are delivery, accuracy, timeliness and jitter.
6. Jitter is the uneven delay in packet arrival time.
7. Real-time transmission = delivering data as it is produced.
8. Simplex = one direction only (keyboard, monitor).
9. Half-duplex = both directions, one at a time (walkie-talkie).
10. Full-duplex = both directions at the same time (telephone).
11. A network is a set of nodes connected by communication links.
12. Point-to-point = a dedicated link between two devices.
13. Multipoint = more than two devices share one link, either spatially or by timesharing.
14. The 3 network criteria are performance, reliability and security.
15. Performance is measured by throughput and delay (also transit time and response time).
16. Reliability = frequency of failure, recovery time and robustness in a catastrophe.
17. PAN is about 10 m (Bluetooth).
18. A LAN covers a building or campus (Ethernet, Wi-Fi).
19. A MAN covers a city (cable TV network, WiMAX).
20. A WAN covers a country or continent.
21. The Internet is a network of networks (a GAN).
22. Intranet = private network using Internet technology.
23. Extranet = intranet plus authorised outsiders.
24. P2P has no dedicated server and suits about 10 computers.
25. In P2P, each peer acts as both client and server.
26. In client–server, the central computer is the server and the others are clients.
27. Bus = all stations on a single backbone cable, with terminators at both ends.
28. Star = all devices linked to a central hub, and hub failure stops the network.
29. Ring = each device linked to two neighbours, with a repeater in each device.
30. Mesh needs n(n−1)/2 links and n−1 ports per device.
31. A mesh of 5 nodes needs 10 links.
32. A tree is a hierarchical star.
33. A hybrid combines two or more topologies.
34. ISO created the OSI model.
35. IEEE 802.3 = Ethernet, 802.11 = Wi-Fi, 802.15 = Bluetooth, 802.16 = WiMAX.
36. The IETF publishes Internet standards as RFCs.
37. ITU-T was formerly called CCITT.
38. EIA is known for RS-232.
39. Transmission delay = L/R. Propagation delay = d/s.
40. Total latency = transmission + propagation + queuing + processing.

## Quick self-check
1. **Which line configuration provides a dedicated link between two devices?**
   Point-to-point.
2. **A walkie-talkie uses which data-flow mode?**
   Half-duplex.
3. **How many links does a fully connected mesh of 8 devices need?**
   8 × 7 / 2 = 28.
4. **How many I/O ports does each device need in a mesh of 8?**
   7.
5. **In which topology does a break in the backbone cable stop all transmission?**
   Bus.
6. **Which network type has no dedicated server?**
   Peer-to-peer.
7. **In a client–server network, what are the non-server computers called?**
   Clients (workstations).
8. **What is the variation in packet arrival time called?**
   Jitter.
9. **A 2,000-bit frame is sent on a 1 Mbps link. What is the transmission delay?**
   2,000 / 10^6 = 2 ms.
10. **A signal travels 4,000 km at 2 × 10^8 m/s. What is the propagation delay?**
    4 × 10^6 / 2 × 10^8 = 20 ms.
