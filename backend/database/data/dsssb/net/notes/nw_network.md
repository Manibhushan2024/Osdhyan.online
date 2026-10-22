# Network Layer: IP Addressing, Subnetting & Routing

**In 30 seconds**
- The network layer moves **packets (datagrams) from source host to destination host** across many networks. Its jobs are logical (IP) addressing, routing, forwarding, fragmentation and congestion control. Framing, port addressing and end-to-end reliability belong to other layers.
- **IPv4 = 32 bits = 4 bytes**, written in dotted decimal. Every address has a **network part + host part**.
- **Usable hosts = 2^h − 2**, where h = number of 0-bits in the mask. For example, 255.255.240.0 → h = 12 → **4094 hosts**.
- **Block size = 256 − (value of the interesting mask octet)**. Subnets start at multiples of the block size. The network address is the first address of a block and the broadcast address is the last.
- **Datagram service** = connectionless: no setup, and each packet is routed on its own. **Virtual circuit** = connection-oriented: setup is required and all packets follow one path.
- **IPv6 = 128 bits**, written in hex with colons. "::" may be used **only once**. IPv6 has no broadcast (it uses unicast, multicast and anycast).
- **Routing algorithm** = the part of the network-layer software that decides the output line and builds the routing tables. Distance vector (Bellman–Ford, used by RIP), link state (Dijkstra, used by OSPF), path vector (BGP).
- **Congestion** = too many packets in (part of) the network, causing delay and loss. The leaky bucket gives a constant output rate. The token bucket lets bursts through.

---

## 1. What the network layer does ⭐ Asked in DSSSB

| Duty | Meaning |
|---|---|
| **Logical addressing** | Gives each interface a global IP address (network ID + host ID) |
| **Routing** | Finds the best path through the network and builds the routing tables |
| **Forwarding** | Inside one router: looks up the destination and sends the packet out of the correct interface |
| **Fragmentation & reassembly** | Splits a datagram that is bigger than the next link's MTU. Fragments are reassembled at the destination |
| **Congestion control** | Prevents or removes overload inside the subnet |
| **Internetworking** | Joins different physical networks into one internet |
| **Packetizing** | Encapsulates a transport segment in an IP datagram |

**NOT network-layer functions (common "which is NOT" options)**

| Function | Layer it belongs to |
|---|---|
| Framing, MAC (physical) addressing, hop-to-hop **error control and flow control** | Data link |
| End-to-end reliability, **port addressing**, segmentation, end-to-end flow control | Transport |
| Bit transmission, signals | Physical |
| Encryption and compression (in OSI) | Presentation |

> ⭐ **Asked in DSSSB (2023)**: "Which is NOT a network layer function? — *Error control and flow control*." Routing, intra-domain routing and congestion control ARE network-layer functions. (IPv4 does have a header checksum, but in the exam "error and flow control" is the textbook duty of the data link and transport layers.)

> ⭐ **Asked in DSSSB (2023)**: In the TCP/IP model the **internet layer** handles **packets/datagrams**. Segments belong to the transport layer, frames to the link layer, and bits to the physical layer.

**Routing vs forwarding.** Routing is network-wide. It is the slow process that *builds* the table (the control plane). Forwarding is local to one router. It is the fast process that *uses* the table for every packet (the data plane).

---

## 2. Datagram vs virtual-circuit service ⭐ Asked in DSSSB

> ⭐ **Asked (2023)**: "In connectionless services, packets are injected individually and routed independently… packets are called **datagrams** and the network a **datagram** network."
> ⭐ **Asked (2023)**: "Circuit setup is required in a **virtual-circuit network**" (and NOT in a datagram network).

| Point | Datagram (connectionless) | Virtual circuit (connection-oriented) |
|---|---|---|
| Setup phase | **Not needed** | **Needed** (setup → data transfer → teardown) |
| Address in each packet | Full source and destination address | Short **VC number / VCI** |
| Routing | Each packet routed independently | Route fixed at setup; all packets follow it |
| Order of arrival | May arrive out of order | Arrive in order |
| State in routers | None per flow | A table entry for every VC |
| Router failure | Only packets inside that router are lost | Every VC through it is broken |
| QoS / resource reservation | Hard | Easy (reserve at setup) |
| Examples | **IP (the Internet)** | X.25, Frame Relay, ATM, MPLS (label switching) |

Both services are kinds of **packet switching**. A virtual circuit is *not* a physical circuit like circuit switching in the telephone network.

---

## 3. IPv4 addresses ⭐ Asked in DSSSB

- **32 bits = 4 bytes** → 2^32 = 4,294,967,296 addresses.
- **Dotted-decimal** notation: four octets, each 0–255, for example 192.168.1.10.
- Each address = **network address (net ID) + host address (host ID)**. ⭐ *Asked (2023): the two parts of a 4-byte IP address are the "network address and host address", not MAC or port addresses.*
- An IP address identifies an **interface**, not a computer. A router with 3 interfaces has 3 IP addresses.

**Binary ↔ dotted decimal.** Use the place values 128 64 32 16 8 4 2 1.

| Dotted decimal | Binary |
|---|---|
| 192.168.1.10 | 11000000.10101000.00000001.00001010 |
| 172.16.254.1 | 10101100.00010000.11111110.00000001 |
| 10.0.0.1 | 00001010.00000000.00000000.00000001 |

- 11000000.10101000.00001010.11111111 → 128+64 = 192; 128+32+8 = 168; 8+2 = 10; 255 → **192.168.10.255**
- 10101100.00010000.00000101.00000001 → 128+32+8+4 = 172; 16; 4+1 = 5; 1 → **172.16.5.1**

Invalid examples: 256.1.1.1 (an octet is above 255), 10.1.1 (only 3 octets), and 012.3.4.5 (leading zeros are not allowed in standard notation).

---

## 4. Classful addressing

| Class | Leading bits | First-octet range | Default mask | Net/host octets | No. of networks | Usable hosts per network | Use |
|---|---|---|---|---|---|---|---|
| **A** | 0 | 0–127 (usable 1–126) | 255.0.0.0 (/8) | N.H.H.H | 2^7 = 128 (126 usable) | 2^24 − 2 = **16,777,214** | Very large networks |
| **B** | 10 | 128–191 | 255.255.0.0 (/16) | N.N.H.H | 2^14 = **16,384** | 2^16 − 2 = **65,534** | Medium |
| **C** | 110 | 192–223 | 255.255.255.0 (/24) | N.N.N.H | 2^21 = **2,097,152** | 2^8 − 2 = **254** | Small |
| **D** | 1110 | 224–239 | none | — | — | — | **Multicast** |
| **E** | 1111 | 240–255 | none | — | — | — | Reserved / experimental |

- Network 0 is reserved and **127 is loopback**, so Class A has 126 usable networks.
- Classful addressing wastes addresses (a firm needing 300 hosts had to take a whole Class B of 65,534). This is why **CIDR** (classless) replaced it in 1993.

**Quick class finder:** 1–126 A · 127 loopback · 128–191 B · 192–223 C · 224–239 D · 240–255 E.

---

## 5. Special and private addresses

| Address | Meaning |
|---|---|
| Host bits all 0 (e.g. 192.168.1.0/24) | **Network address**, which identifies the network itself. Not given to a host |
| Host bits all 1 (e.g. 192.168.1.255/24) | **Directed broadcast**, sent to all hosts of that network |
| **255.255.255.255** | **Limited broadcast**, to all hosts on *this* local network only. Routers never forward it |
| **0.0.0.0** | "This host / unspecified". Used as a source by a DHCP client that has no address yet; 0.0.0.0/0 is the **default route** |
| **127.0.0.0/8** (usually 127.0.0.1) | **Loopback**: the packet never leaves the host; used to test the TCP/IP stack |
| **169.254.0.0/16** | **APIPA / link-local**, self-assigned when no DHCP server answers |
| 224.0.0.0/4 | Multicast (Class D) |

**Private (RFC 1918) ranges:** not routable on the Internet, so they need NAT to reach it.

| Block | Range | Class-wise |
|---|---|---|
| **10.0.0.0/8** | 10.0.0.0 – 10.255.255.255 | 1 Class A |
| **172.16.0.0/12** | 172.16.0.0 – **172.31**.255.255 | 16 Class B |
| **192.168.0.0/16** | 192.168.0.0 – 192.168.255.255 | 256 Class C |

Trap: 172.32.0.1 is **public**, because the private range stops at 172.31.

---

## 6. Subnet masks and CIDR

- A **mask** is 32 bits: 1s mark the network + subnet part and 0s mark the host part. The 1s are always contiguous from the left.
- **CIDR /n** = the number of 1-bits. 255.255.255.0 = /24, and 255.255.240.0 = 8+8+4 = **/20**.
- **Network address = IP AND mask.**

**Mask-octet values (memorise):**

| Bits on in octet | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Octet value | 128 | 192 | 224 | 240 | 248 | 252 | 254 | 255 |
| Block size (256 − value) | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

**Prefix → hosts (last octet):**

| Prefix | Mask | Addresses | Usable hosts |
|---|---|---|---|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | **2** (point-to-point links) |
| /23 | 255.255.254.0 | 512 | 510 |
| /22 | 255.255.252.0 | 1024 | 1022 |
| /20 | 255.255.240.0 | 4096 | **4094** |
| /16 | 255.255.0.0 | 65,536 | 65,534 |

---

## 7. Subnetting step by step ⭐ Asked in DSSSB

**Formulas**
- h = host bits = 32 − n → **usable hosts = 2^h − 2** (minus the network and broadcast addresses).
- s = borrowed (subnet) bits = n − default prefix → **number of subnets = 2^s**. Older textbooks used 2^s − 2, dropping the all-0s and all-1s subnets. Use 2^s unless the question says otherwise.
- **Block size** = 256 − mask value in the "interesting" octet (the octet where the mask is neither 255 nor 0).

**The 5-step recipe for "IP + mask → network, broadcast, first, last"**
1. Find the interesting octet and its block size.
2. Find the largest multiple of the block size that is ≤ the IP's value in that octet → this gives the **network address** (later octets become 0).
3. Network + block size − 1 in that octet (later octets become 255) → **broadcast address**.
4. **First host** = network + 1. **Last host** = broadcast − 1.
5. **Hosts** = 2^h − 2.

### Worked numericals (all checked with Python's `ipaddress` module)

**N1. ⭐ Asked (2023): mask 255.255.240.0 — maximum hosts?**
240 = 11110000 → the mask has 8 + 8 + 4 = 20 ones (/20) → h = 32 − 20 = 12 → 2^12 − 2 = 4096 − 2 = **4094**. (Wrong options: 1024, 2048, 3072.)

**N2. 192.168.10.75/26**
- /26 → last-octet mask 192 → block size 64. Blocks: 0, 64, 128, 192.
- 75 lies in the 64 block → **network 192.168.10.64**, **broadcast 192.168.10.127**.
- First host **.65**, last host **.126**. Hosts = 2^6 − 2 = **62**.

**N3. 200.1.2.130/27 (Class C)**
- 224 → block size 32. Blocks: 0, 32, 64, 96, **128**, 160…
- Network **200.1.2.128**, broadcast **200.1.2.159**, hosts **.129 – .158**, 2^5 − 2 = **30** hosts.
- Borrowed bits = 27 − 24 = 3 → **8 subnets**.

**N4. Point-to-point link 10.0.0.9/30**
- 252 → block size 4. Blocks: 0, 4, **8**, 12.
- Network **10.0.0.8**, broadcast **10.0.0.11**, usable hosts **10.0.0.9 and 10.0.0.10** (2^2 − 2 = **2**). This is why /30 is used for router-to-router links.

**N5. Class B, borrow 4 bits: 172.16.0.0/16 → /20. Which subnet holds 172.16.77.200?**
- Subnets = 2^4 = **16**. Mask 255.255.**240**.0 → block size 16 in the **3rd** octet: 0, 16, 32, 48, **64**, 80…
- 77 lies in the 64 block → network **172.16.64.0**, broadcast **172.16.79.255**.
- First host **172.16.64.1**, last host **172.16.79.254**, hosts per subnet = 2^12 − 2 = **4094**.

**N6. Class C 192.168.1.0 needs at least 6 subnets. Find the mask and hosts per subnet.**
- 2^s ≥ 6 → s = 3 → /27 = 255.255.255.224 → **8 subnets of 30 hosts**.
- Subnets: .0, .32, .64, .96, .128, .160, .192, .224 (broadcasts .31, .63, .95, .127, .159, .191, .223, .255).

**N7. A Class B network needs at least 500 hosts per subnet.**
- 2^h − 2 ≥ 500 → h = 9 (510). Prefix = 32 − 9 = **/23 = 255.255.254.0**.
- Borrowed bits = 23 − 16 = 7 → **128 subnets**, each with **510 hosts**.
- Example: 150.20.13.9/23 → block size 2 in the 3rd octet → network **150.20.12.0**, broadcast **150.20.13.255**, hosts 150.20.12.1 – 150.20.13.254.

**N8. 10.25.130.66/12 (mask in the 2nd octet)**
- /12 → 255.**240**.0.0 → block size 16 in the 2nd octet: 0, **16**, 32…
- Network **10.16.0.0**, broadcast **10.31.255.255**, hosts = 2^20 − 2 = **1,048,574**.

**N9. Is 192.168.5.63/26 a valid host address?**
- Block size 64 → block 0–63 → .63 is the **broadcast** address → **not a host**. (Host range .1–.62.)

**N10. 192.168.1.200/29**
- 248 → block size 8: …192, **200**, 208 → network **192.168.1.200**, broadcast **.207**, hosts **.201–.206** (**6** hosts).

**N11. Are 172.16.5.10/22 and 172.16.6.20/22 on the same subnet? What about 172.16.8.1/22?**
- /22 → 255.255.**252**.0 → block size 4 in the 3rd octet: 0, **4**, **8**…
- 5 and 6 both fall in block 4 → both are in **172.16.4.0/22**, so they are on the **same subnet**. 8 falls in block 8 → 172.16.8.0/22 → **different subnet**.

**N12. Supernetting / route aggregation**
- Combine 200.10.0.0/24, 200.10.1.0/24, 200.10.2.0/24 and 200.10.3.0/24.
- 4 networks = 2^2 → shorten the prefix by 2 → **200.10.0.0/22** (the first network must start on a multiple of 4: 0 ✔).
- Likewise 192.168.16.0/24 … 192.168.23.0/24 (8 networks) → **192.168.16.0/21**.
- Rule: the number of networks must be a power of 2, they must be contiguous, and the first one must be divisible by that count.

### VLSM (Variable-Length Subnet Masking)
Give each subnet a mask that fits its own size. This avoids waste. **Assign the largest subnet first.**

Example: 192.168.20.0/24 for LANs of 100, 50 and 25 hosts plus two router links.

| Need | Prefix | Subnet | Usable range | Broadcast |
|---|---|---|---|---|
| 100 hosts | /25 (126) | 192.168.20.0/25 | .1 – .126 | .127 |
| 50 hosts | /26 (62) | 192.168.20.128/26 | .129 – .190 | .191 |
| 25 hosts | /27 (30) | 192.168.20.192/27 | .193 – .222 | .223 |
| WAN link 1 | /30 (2) | 192.168.20.224/30 | .225 – .226 | .227 |
| WAN link 2 | /30 (2) | 192.168.20.228/30 | .229 – .230 | .231 |

The space from .232 onwards is free. VLSM needs **classless routing protocols** (RIPv2, OSPF, EIGRP, BGP), not RIPv1.

---

## 8. IPv4 header (20–60 bytes)

| Field | Bits | Key fact |
|---|---|---|
| Version | 4 | 4 for IPv4 |
| HLEN / IHL | 4 | Header length in **4-byte words**: 5 (= 20 bytes) to 15 (= 60 bytes) |
| Service type (DSCP + ECN) | 8 | QoS / priority |
| Total length | 16 | Header + data; maximum **65,535** bytes |
| Identification | 16 | The same value in every fragment of one datagram |
| Flags | 3 | Reserved, **DF** (Don't Fragment), **MF** (More Fragments) |
| Fragment offset | 13 | Position of this fragment's data, in **units of 8 bytes** |
| **TTL** | 8 | Decreased by 1 at each router; the packet is discarded at 0 (an ICMP Time Exceeded message is sent). Prevents endless loops |
| **Protocol** | 8 | Upper-layer protocol: **1 ICMP, 2 IGMP, 6 TCP, 17 UDP, 89 OSPF** |
| **Header checksum** | 16 | Covers the **header only**; recomputed at every hop (because TTL changes) |
| Source / Destination address | 32 + 32 | IPv4 addresses |
| Options | 0–40 bytes | Record route, timestamp, etc. |

### Fragmentation example
A 4000-byte datagram (20-byte header + 3980 bytes of data) must cross a link with **MTU 1500**.
1. Maximum data per fragment = 1500 − 20 = 1480. 1480 is a multiple of 8, so it can be used as it is.
2. Fragments: 1480 + 1480 + 1020 = 3980 bytes of data.

| Fragment | Data bytes | Total length | Offset (data byte ÷ 8) | MF |
|---|---|---|---|---|
| 1 | 0–1479 | 1500 | 0 | 1 |
| 2 | 1480–2959 | 1500 | 1480/8 = **185** | 1 |
| 3 | 2960–3979 | 1040 | 2960/8 = **370** | 0 |

- **Only the destination reassembles** the fragments. Routers never do.
- Last fragment → MF = 0. Offset = 0 with MF = 1 → it is the first fragment.
- If DF = 1 and the packet is too large → it is dropped and ICMP "Fragmentation needed" is sent (this is how Path MTU Discovery works).

---

## 9. IPv6

| Feature | IPv6 |
|---|---|
| Address size | **128 bits (16 bytes)** → 2^128 addresses |
| Notation | **8 groups of 4 hex digits** separated by colons (hexadecimal colon notation) |
| Header | **Fixed 40 bytes**, with optional **extension headers** chained by the "Next Header" field |
| Removed from the header | Header checksum, fragmentation fields, HLEN, options |
| Fragmentation | Done **only by the source**; routers never fragment (they send ICMPv6 "Packet Too Big") |
| TTL equivalent | **Hop Limit** |
| New field | **Flow label** (20 bits), which marks packets of one flow for special handling |
| Address types | **Unicast, multicast, anycast**. **No broadcast** |
| Auto-configuration | SLAAC (stateless), or DHCPv6 |
| ARP replacement | **Neighbor Discovery Protocol** (ICMPv6) |
| Security | IPsec support built into the design |

**Zero compression rules**
1. Leading zeros in a group may be dropped: 0db8 → db8, 0042 → 42, 0000 → 0.
2. **One** run of consecutive all-zero groups may be replaced by "::". This can be done **only once**.
3. If there are two equal runs, compress the **first (leftmost)** one; compress the **longest** run.

| Full | Compressed |
|---|---|
| 2001:0db8:0000:0000:0000:ff00:0042:8329 | **2001:db8::ff00:42:8329** |
| FE80:0000:0000:0000:0202:B3FF:FE1E:8329 | **fe80::202:b3ff:fe1e:8329** |
| 0000:0000:0000:0000:0000:0000:0000:0001 | **::1** (loopback) |
| 2001:0db8:0000:0000:0001:0000:0000:0001 | **2001:db8::1:0:0:1** (two equal runs → the first is compressed) |
| 2001:0db8:0000:0001:0000:0000:0000:0001 | **2001:db8:0:1::1** |

To expand "::", count the groups shown and fill the gap with zero groups until there are 8 groups. For example, 2001:db8::1 → 2001:0db8:0000:0000:0000:0000:0000:0001.

**Special IPv6 addresses:** ::1 loopback · :: unspecified · **fe80::/10 link-local** · **ff00::/8 multicast** · fc00::/7 unique local (the "private" range) · 2000::/3 global unicast.

- **Unicast** = to one interface. **Multicast** = to every member of a group. **Anycast** = to the **nearest** one of a group (used by DNS root servers).

**IPv4 → IPv6 transition**
| Method | Idea |
|---|---|
| **Dual stack** | The host or router runs IPv4 and IPv6 side by side |
| **Tunnelling** | An IPv6 packet is carried inside an IPv4 packet across an IPv4-only region (6to4, Teredo) |
| **Header translation / NAT64** | Translates between IPv6 and IPv4 so that IPv6-only hosts can reach IPv4 servers (works with DNS64) |

---

## 10. NAT and PAT

- **NAT (Network Address Translation)** runs on the router or firewall. It rewrites **private source addresses into public ones** on the way out, and reverses the change on the way in. It saves IPv4 addresses and hides the internal network.
- **Static NAT**: 1 private ↔ 1 public, fixed (used for servers).
- **Dynamic NAT**: private addresses are mapped to addresses from a **pool** of public ones.
- **PAT / NAPT / NAT overload**: **many private hosts share one public IP**. Each connection is told apart by its **port number**. Home routers use this.
- Drawbacks: it breaks true end-to-end connectivity, and some protocols (IPsec, FTP active mode) need help to pass through it.

---

## 11. Helper protocols: ICMP, ARP, DHCP, IGMP

### ICMP (Internet Control Message Protocol)
- Carries **error and query messages** for IP. It is carried inside IP (protocol **1**) and has no port numbers. ICMP *reports* errors; it does not correct them.

| Type | Message |
|---|---|
| 0 / 8 | **Echo Reply / Echo Request** → used by **ping** |
| 3 | Destination Unreachable |
| 5 | Redirect (a better route exists) |
| 11 | **Time Exceeded** (TTL reached 0) → used by **traceroute** |
| 12 | Parameter Problem |
| 4 | Source Quench (old congestion signal, now deprecated) |

- **ping** tests reachability and round-trip time.
- **traceroute / tracert** sends probes with TTL = 1, 2, 3 …. Each router that drops a probe returns Time Exceeded, which reveals the path hop by hop.
- No ICMP error is sent about an ICMP error message, a broadcast or multicast packet, or a non-first fragment.

### ARP family
| Protocol | Known → Found | Notes |
|---|---|---|
| **ARP** | **IP → MAC** | The request is a **broadcast** and the reply is **unicast**. Results are kept in the ARP cache |
| **RARP** | **MAC → IP** | Used by old diskless machines. Obsolete; replaced by BOOTP and then DHCP |
| **InARP (Inverse ARP)** | Link-layer/VC address (e.g. Frame Relay DLCI) → IP | Finds the IP of the device at the other end of a virtual circuit |
| Proxy ARP | A router answers on behalf of a host on another network | |
| Gratuitous ARP | A host announces its own IP–MAC pair | Detects duplicate IPs |

### DHCP (Dynamic Host Configuration Protocol)
- Automatically gives a host its **IP address, subnet mask, default gateway and DNS server** for a **lease** time.
- Runs over **UDP: server port 67, client port 68**.
- **DORA**: **D**iscover (client broadcast) → **O**ffer (server) → **R**equest (client) → **A**cknowledge (server).
- A **DHCP relay agent** forwards broadcasts to a server on another subnet. If no server answers, Windows uses **APIPA 169.254.x.x**.

### IGMP (Internet Group Management Protocol)
- Hosts tell their **local multicast router** which **multicast groups** they want to join or leave. It is carried in IP (protocol **2**). (Its IPv6 equivalent is MLD.)

---

## 12. Routing ⭐ Asked in DSSSB

> ⭐ **Asked (2023)**: "The algorithm that manages routing tables and makes routing decisions in the network layer is called the **routing algorithm**." It is the part of the network-layer software that decides **which output line** an incoming packet is sent on.

**Routing table entries:** destination network, mask (prefix), **next hop**, outgoing interface, metric. Lookup uses **longest-prefix match**: the most specific route wins. **Default route 0.0.0.0/0** is used when nothing else matches.

| Static routing | Dynamic routing |
|---|---|
| Typed in by the administrator | Learnt automatically through routing protocols |
| No protocol overhead, secure, predictable | Adapts to failures and topology changes |
| Does not adapt; does not scale | Uses CPU, memory and bandwidth |
| Suits small or stub networks | Suits large networks |

Non-adaptive (static) algorithms are things like fixed tables and **flooding**. Adaptive (dynamic) algorithms are distance vector and link state.

**Flooding:** every incoming packet is sent out on every line except the one it arrived on. It is very robust and always finds the shortest path, but it creates many duplicates. These are controlled with a hop counter or sequence numbers. Link-state routers use it to spread their LSPs.

### Distance vector (Bellman–Ford)
- Each router keeps a vector of (destination, cost, next hop) and **sends its whole table to its neighbours only**, at regular intervals.
- Update rule: **D(x→y) = min over neighbours v of { cost(x,v) + D(v→y) }**.
- Small example: A reaches B at cost 2 and C at cost 5. B says "D is at 3" and C says "D is at 1". A's route to D = min(2 + 3, 5 + 1) = **5 via B**.
- **Count-to-infinity problem**: good news travels fast and bad news travels slowly. When a link fails, two routers keep raising each other's cost step by step.
- Fixes: **split horizon** (do not advertise a route back to the neighbour you learnt it from), **poison reverse** (advertise it back with cost = infinity), **hold-down timers**, triggered updates, and a **maximum hop count** (RIP: 16 = infinity).

### Link state (Dijkstra)
- Each router: (1) discovers its neighbours (HELLO packets), (2) measures the cost of each link, (3) builds a **Link-State Packet (LSP)**, (4) **floods** the LSP to **all** routers, (5) runs **Dijkstra's shortest-path algorithm** on the complete map.
- Every router knows the whole topology. Convergence is fast and there is no count-to-infinity, but it needs more memory and CPU.

### Path vector
- Like distance vector, but each advertisement carries the **whole list of autonomous systems (AS path)** on the route. A router rejects any path that already contains its own AS, which prevents loops. Routes are chosen by **policy**. Used by **BGP**.

| | Distance vector | Link state |
|---|---|---|
| Shares | Its whole routing table | Only its own links (LSP) |
| Sent to | Neighbours only | All routers (flooding) |
| Algorithm | Bellman–Ford | Dijkstra |
| View of the network | "Routing by rumour" | Complete map |
| Convergence | Slow; count-to-infinity | Fast |
| Example | RIP | OSPF, IS-IS |

### Routing protocols

| Protocol | Type | Metric / key facts | Runs over |
|---|---|---|---|
| **RIP** | Distance vector, interior | **Hop count, maximum 15** (16 = unreachable); updates every **30 s**; RIPv2 supports CIDR/VLSM | **UDP 520** |
| **OSPF** | Link state, interior | Cost (based on bandwidth); **areas** with **backbone area 0**; Dijkstra; fast convergence; supports VLSM | Directly on IP (protocol **89**) |
| **IS-IS** | Link state, interior | Used by large ISPs | Directly on the link layer |
| **EIGRP** | Advanced distance vector ("hybrid"), originally Cisco | **DUAL** algorithm; composite metric (bandwidth, delay) | IP protocol 88 |
| **BGP (v4)** | **Path vector, exterior** | **Inter-AS** routing of the Internet; policy-based; eBGP between ASes, iBGP inside one | **TCP 179** |

- **Autonomous System (AS)** = a group of networks under one administration, identified by an AS number.
- **Interior Gateway Protocols (IGP)** route **inside** an AS: RIP, OSPF, IS-IS, EIGRP.
- **Exterior Gateway Protocols (EGP)** route **between** ASes: **BGP**.

Other types: **hierarchical routing** (regions, to keep tables small), **broadcast routing** (reverse path forwarding, spanning tree) and **multicast routing** (DVMRP, PIM, MOSPF).

---

## 13. Congestion and congestion control ⭐ Asked in DSSSB

> ⭐ **Asked (2023)**: "Too many packets present in (a part of) the network causes packet delay and loss that degrades performance" → **congestion**. Not throttling, choking or collapse. (*Congestion collapse* is the extreme case in which useful throughput falls to almost zero.)

- Causes: input traffic faster than the output line, slow processors, too little buffer space. Note that **infinite buffers do not cure it**: packets time out and are re-sent anyway.
- **Flow control** = between **one sender and one receiver** (do not swamp the receiver). **Congestion control** = about the **whole network** (do not swamp the routers).

| Open-loop (prevention, before it happens) | Closed-loop (removal, after it happens) |
|---|---|
| Retransmission policy, window policy (selective repeat), acknowledgement policy, discard policy, **admission control**, traffic shaping | **Backpressure** (hop by hop), **choke packet** (router → source), **implicit signalling** (source infers it from delay or loss, as TCP does), **explicit signalling** (ECN bits) |

Other tools: load shedding (dropping packets, e.g. RED, Random Early Detection), and traffic-aware routing.

### Leaky bucket vs token bucket (traffic shaping)
| | Leaky bucket | Token bucket |
|---|---|---|
| Idea | Packets are poured into a bucket that leaks at a **constant rate** | Tokens are added at rate r up to capacity b; a packet must use a token to be sent |
| Output | **Constant rate**, always smooth | Bursty output allowed (up to b) while the average rate is kept at r |
| When idle | Saves no credit | **Saves tokens** up to b, so later bursts are allowed |
| When full | **Packets** are discarded | **Tokens** are discarded (packets wait) |
| Flexibility | Rigid | More flexible; most used |

**Token-bucket burst length:** S = C / (M − r), where C = bucket capacity, M = maximum line rate and r = token rate.
Example: C = 1 MB, M = 50 MB/s, r = 10 MB/s → S = 1 / (50 − 10) = **0.025 s = 25 ms** of full-speed burst.

### QoS (Quality of Service), briefly
- Flow characteristics: **reliability, delay, jitter (variation in delay), bandwidth**.
- Techniques: scheduling (FIFO, priority, weighted fair queuing), traffic shaping, admission control, resource reservation.
- Architectures: **IntServ** (per-flow reservation using **RSVP**) and **DiffServ** (per-class marking using the **DSCP** bits in the IP header).

---

## Exam traps
1. **255.255.240.0 → 4094 hosts**, not 4096. Always subtract 2 (network and broadcast).
2. **Host count uses the 0-bits** of the mask; subnet count uses the **borrowed** bits. Do not mix them up.
3. **127.x.x.x is loopback**, not Class A, so Class A usable networks = **126**.
4. **172.16–172.31** is private, but 172.32 is public. **169.254** is APIPA, not private RFC 1918.
5. **Circuit setup is needed only in a virtual-circuit network.** The datagram network (IP) needs no setup.
6. **Error control and flow control are NOT network-layer functions** in the exam's sense. Routing and congestion control ARE.
7. The **fragment offset is in 8-byte units**: 1480 bytes → offset 185, not 1480. Only the **destination** reassembles.
8. **IPv6 has no broadcast** and no header checksum; routers do not fragment. "::" may appear **only once**.
9. **RIP's maximum is 15 hops**; 16 means unreachable. RIP runs on **UDP 520**, BGP on **TCP 179**, and OSPF directly on IP (89), not on TCP or UDP.
10. **Distance vector → Bellman–Ford → neighbours only. Link state → Dijkstra → floods to all.** Do not swap them.
11. **The leaky bucket drops packets; the token bucket drops tokens.** Only the token bucket allows bursts.
12. **ARP maps IP → MAC; RARP maps MAC → IP.** ICMP has **no port number** (it is carried by IP, protocol 1).

## One-liners for revision
1. Network layer = host-to-host delivery of packets (datagrams).
2. Its five duties: logical addressing, routing, forwarding, fragmentation, congestion control.
3. Port addressing belongs to transport; MAC addressing and framing to the data link layer.
4. The internet layer's PDU = packet / datagram.
5. IPv4 address = 32 bits = 4 bytes = 4 octets.
6. IPv4 address = network address + host address.
7. Class A 1–126, B 128–191, C 192–223, D 224–239 (multicast), E 240–255 (reserved).
8. Leading bits: A 0, B 10, C 110, D 1110, E 1111.
9. Default masks: A /8, B /16, C /24.
10. Hosts per network: A 16,777,214; B 65,534; C 254.
11. Networks: A 128 (126 usable), B 16,384, C 2,097,152.
12. Private: 10/8, 172.16/12, 192.168/16.
13. Loopback = 127.0.0.1; APIPA = 169.254.0.0/16.
14. Limited broadcast = 255.255.255.255 (never forwarded by routers).
15. 0.0.0.0/0 = default route.
16. Usable hosts = 2^h − 2.
17. Block size = 256 − interesting mask octet.
18. /30 → 2 hosts, used for point-to-point links.
19. /26 → 62 hosts; /27 → 30; /28 → 14; /29 → 6.
20. Network address = IP AND mask.
21. Supernetting = joining contiguous networks with a shorter prefix (route aggregation).
22. VLSM = different masks for different subnets; assign the largest first.
23. CIDR replaced classful addressing in 1993.
24. IPv4 header = 20–60 bytes; HLEN is counted in 4-byte words.
25. TTL is decreased at each hop and the packet is discarded at 0.
26. Protocol field: 1 ICMP, 2 IGMP, 6 TCP, 17 UDP, 89 OSPF.
27. The IPv4 checksum covers the header only.
28. Fragment offset is counted in units of 8 bytes; the last fragment has MF = 0.
29. IPv6 = 128 bits, 8 hex groups, fixed 40-byte header.
30. IPv6 types: unicast, multicast, anycast — no broadcast.
31. Transition methods: dual stack, tunnelling, NAT64 (translation).
32. PAT = many private hosts share one public IP, told apart by ports.
33. ping = ICMP Echo Request/Reply; traceroute = TTL + Time Exceeded.
34. DHCP = DORA on UDP 67/68.
35. IGMP = multicast group membership.
36. Routing algorithm = decides the output line and manages routing tables.
37. Distance vector = Bellman–Ford; suffers count-to-infinity; fixed by split horizon.
38. Link state = flooding of LSPs + Dijkstra.
39. Path vector = BGP; AS-path list prevents loops.
40. RIP: hop count, max 15, UDP 520, 30-s updates.
41. OSPF: link state, areas, backbone area 0, IP protocol 89.
42. BGP: exterior, inter-AS, TCP 179.
43. Congestion = too many packets → delay and loss.
44. Open loop = prevention; closed loop = choke packet, backpressure.
45. Leaky bucket = constant rate; token bucket = allows bursts.

## Quick self-check
1. How many hosts can a network with mask 255.255.240.0 have? → **4094** (12 host bits).
2. Network and broadcast address of 192.168.10.75/26? → **192.168.10.64** and **192.168.10.127**.
3. How many usable hosts in a /30? → **2**.
4. Which subnet contains 172.16.77.200/20? → **172.16.64.0/20** (broadcast 172.16.79.255).
5. Smallest mask that gives 500 hosts per subnet? → **255.255.254.0 (/23)**, 510 hosts.
6. Summarise 200.10.0.0/24 – 200.10.3.0/24. → **200.10.0.0/22**.
7. In which network is circuit setup required? → **Virtual-circuit** network.
8. Compress 2001:0db8:0000:0000:0000:ff00:0042:8329. → **2001:db8::ff00:42:8329**.
9. A 4000-byte datagram crosses MTU 1500. What is the offset of the 3rd fragment? → **370** (2960/8).
10. Which protocol maps an IP address to a MAC address? → **ARP**.
11. Which routing protocol uses path vector and TCP port 179? → **BGP**.
12. Which traffic shaper allows bursts and discards tokens instead of packets? → **Token bucket**.
