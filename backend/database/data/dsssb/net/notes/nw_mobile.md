# Mobile & Wireless Communication

**In 30 seconds**
- GSM radio side: **MS (ME + SIM) → BTS (Base Transceiver Station) → BSC → MSC**. ⭐ Asked in DSSSB
- **HLR** = permanent database of home subscribers; **VLR** = temporary database of visitors in an MSC area. The **VLR informs the HLR** of location changes. ⭐ Asked in DSSSB
- **TDMA** = many users share the same (wide) frequency channel in **different time slots**; FDMA = different frequency bands; CDMA = different codes. ⭐ Asked in DSSSB
- Mobile IP: **Foreign agent (FA)** = router in the foreign network to which the mobile node is attached. ⭐ Asked in DSSSB
- **Care-of address (COA)** = current tunnel endpoint for the mobile node; a **co-located COA** can be obtained via **DHCP**. ⭐ Asked in DSSSB (official 2023 key said "FA" — the correct answer is COA)
- Satellite **inter-system handover** = between satellite network and terrestrial cellular network. ⭐ Asked in DSSSB
- Mobile computing categories: fixed & wired, mobile & wired, **fixed & wireless (Wi-Fi router/access point)**, mobile & wireless. ⭐ Asked in DSSSB
- Bluetooth piconet = **1 master + up to 7 active slaves**; Wi-Fi = IEEE 802.11; WiMAX = 802.16; Zigbee = 802.15.4.

---

## 1. Wireless basics

- Wireless communication uses **electromagnetic waves through free space** (unguided media): radio waves (omnidirectional; AM/FM, cellular, Wi-Fi), **microwaves** (line of sight; terrestrial links, satellite) and **infrared** (short range, cannot pass walls; TV remotes, IrDA).
- **ISM bands** (Industrial, Scientific, Medical) are licence-free: 900 MHz, **2.4 GHz**, 5.8 GHz — used by Wi-Fi, Bluetooth, Zigbee, microwave ovens.
- Problems of wireless: **multipath fading**, attenuation (path loss), interference, limited bandwidth, security (open air), shadowing.
- **Uplink** = mobile → base station; **downlink** = base station → mobile. Duplexing: **FDD** (two frequencies) or **TDD** (one frequency, alternate time).

## 2. Cellular concept

| Idea | Meaning |
|---|---|
| **Cell** | Small area covered by one base station; drawn as a **hexagon** |
| **Frequency reuse** | The same set of frequencies is reused in cells far enough apart to avoid **co-channel interference** |
| **Cluster** | Group of N cells that together use the whole available spectrum once |
| **Cluster size N** | N = i² + ij + j² → allowed values 1, 3, 4, 7, 9, 12…; **N = 7** is the classic value |
| **Reuse distance** | D = R√(3N) (R = cell radius); larger N → less interference but fewer channels per cell |
| Cell splitting / sectoring | Smaller cells or directional antennas (120° sectors) to increase capacity |
| Cell sizes | Macro (km) > micro > pico > femto (home) |

### Handoff / handover
Moving a call from one channel or base station to another without dropping it.

| Hard handover | Soft handover |
|---|---|
| **Break-before-make**: old link released before new link made | **Make-before-break**: connected to two or more base stations at once |
| Used in FDMA/TDMA systems — **GSM** | Used in **CDMA** systems (IS-95, WCDMA/UMTS) |
| Brief interruption possible | Smoother, fewer dropped calls |

Handover by scope (Schiller, for GSM):
1. **Intra-cell** — new channel/time slot within the **same cell** (to escape interference).
2. **Inter-cell, intra-BSC** — to a **neighbouring cell** controlled by the same BSC.
3. **Inter-BSC, intra-MSC** — between cells of different BSCs under one MSC.
4. **Inter-MSC** — between cells belonging to different MSCs.

## 3. Generations 1G–5G

| Gen | Period | Technology | Data rate (typical / peak) | Key feature |
|---|---|---|---|---|
| **1G** | 1980s | Analog, **FDMA** — AMPS (USA), NMT, TACS | ~2.4 kbps | **Voice only**, analog, no security |
| **2G** | 1991 (GSM, Finland) | Digital — **GSM (TDMA + FDMA)**, IS-95 (CDMA) | 9.6–14.4 kbps | Digital voice, **SMS**, encryption, SIM |
| **2.5G** | ~2000 | **GPRS** | up to 171.2 kbps (theoretical) | **Packet switching**, always-on data, MMS |
| **2.75G** | ~2003 | **EDGE** (EGPRS) | up to ~384 kbps | 8-PSK modulation on GSM |
| **3G** | 2001+ | **UMTS/WCDMA**, CDMA2000, TD-SCDMA (IMT-2000) | 384 kbps – 2 Mbps | Mobile Internet, video calls |
| **3.5G** | 2006+ | HSPA / HSPA+ | 14.4 – 42 Mbps | Faster 3G data |
| **4G** | 2009+ | **LTE / LTE-Advanced**, WiMAX (IMT-Advanced) | 100 Mbps moving / 1 Gbps stationary | **All-IP**, **OFDMA**, MIMO, VoLTE, HD streaming |
| **5G** | 2019+ (India 1 Oct 2022) | **5G NR** (IMT-2020) | up to **20 Gbps** peak | ~1 ms latency, mmWave, massive MIMO, IoT (eMBB, URLLC, mMTC) |

## 4. GSM architecture ⭐ Asked in DSSSB

GSM = **Global System for Mobile communication** (ETSI standard; originally Groupe Spécial Mobile). Schiller divides it into three subsystems:

**Radio subsystem (RSS)** = MS + BSS

| Element | Full form | Role |
|---|---|---|
| **MS** | Mobile Station | The user's phone = **ME (Mobile Equipment)** + **SIM** |
| SIM | Subscriber Identity Module | Stores **IMSI**, secret key **Ki**, PIN/PUK, contacts; makes the phone personal |
| ME | Mobile Equipment | The handset hardware, identified by the **IMEI** (15 digits) |
| **BTS** ⭐ | **Base Transceiver Station** | Radio equipment and antennas of a cell; **transmits and receives** radio signals to/from MS; modulation, channel coding, encryption over the air |
| **BSC** | Base Station Controller | Controls several BTSs; allocates radio channels, manages handover between its BTSs |
| BSS | Base Station Subsystem | BSC + its BTSs |

**Network and switching subsystem (NSS)**

| Element | Full form | Role |
|---|---|---|
| **MSC** | Mobile Switching Centre | Switching exchange: call set-up, routing, handover between BSCs; connects BSSs |
| **GMSC** | Gateway MSC | MSC that connects GSM to **other networks** (PSTN, ISDN, other operators); asks the HLR where to route an incoming call |
| **HLR** ⭐ | **Home Location Register** | **Permanent** central database of all subscribers of the operator: IMSI, MSISDN (phone number), services subscribed, **current location (which VLR/MSC)** |
| **VLR** ⭐ | **Visitor Location Register** | **Temporary** database of all mobiles **currently in its MSC area** (including roamers); copies needed data from HLR; usually built into the MSC |

**Operation subsystem (OSS)**

| Element | Full form | Role |
|---|---|---|
| **AuC** | Authentication Centre | Holds keys Ki; generates authentication triplets (algorithms **A3** for authentication, **A8** for cipher key; **A5** encrypts the air link) |
| **EIR** | Equipment Identity Register | Database of **IMEIs**: white (valid), grey (watch), **black list (stolen/blocked phones)** |
| OMC | Operation and Maintenance Centre | Monitors and manages the network |

**HLR vs VLR** ⭐ Asked in DSSSB

| HLR | VLR |
|---|---|
| Permanent | Temporary |
| One logical HLR per operator network | One per MSC area |
| Holds all home subscribers | Holds only subscribers currently visiting its area |
| Knows which VLR the mobile is in now | Informs the HLR when a mobile enters its area (**location update**) |

DSSSB wording: "**VLR is responsible for the MS to inform the HLR about location changes**" — true.

Interfaces: **Um** (air interface, MS–BTS), **Abis** (BTS–BSC), **A** (BSC–MSC).

### GSM frequency bands and TDMA frames

| Band | Uplink (MS → BTS) | Downlink (BTS → MS) |
|---|---|---|
| **GSM 900** | 890–915 MHz | 935–960 MHz |
| **GSM 1800 (DCS)** | 1710–1785 MHz | 1805–1880 MHz |
| GSM 1900 (PCS, Americas) | 1850–1910 MHz | 1930–1990 MHz |
| GSM 850 | 824–849 MHz | 869–894 MHz |

- GSM 900: 25 MHz each way, **124 carriers of 200 kHz** (FDMA), **duplex spacing 45 MHz** (FDD).
- Each carrier is split by **TDMA into 8 time slots**; one slot ≈ **577 µs**; one TDMA frame (8 slots) ≈ **4.615 ms**.
- Gross bit rate per carrier ≈ 270.8 kbit/s; modulation **GMSK**; full-rate speech 13 kbit/s; circuit data 9.6 kbit/s.
- Frames group into a 26-multiframe (traffic) and 51-multiframe (control), then superframe and hyperframe.
- So GSM = **FDMA + TDMA** (with FDD and optional slow frequency hopping).

## 5. GPRS, EDGE, UMTS, LTE

| System | What to remember |
|---|---|
| **GPRS** (General Packet Radio Service) | Packet-switched data on GSM; new nodes **SGSN** (Serving GPRS Support Node) and **GGSN** (Gateway GPRS Support Node, link to the Internet); billing by data volume; uses up to 8 slots |
| **EDGE** (Enhanced Data rates for GSM Evolution) | **8-PSK** modulation triples GPRS rates (~384 kbps) |
| **UMTS** (Universal Mobile Telecommunications System) | 3G; air interface **WCDMA**, **5 MHz** channels; base station = **Node B**, controller = **RNC**; USIM; soft handover |
| **LTE** (Long Term Evolution) | 4G; base station **eNodeB**; core **EPC** (MME, S-GW, P-GW); **OFDMA downlink, SC-FDMA uplink**; all-IP, voice as **VoLTE** |
| 5G NR | Base station **gNodeB**; 5G core; OFDMA; sub-6 GHz and mmWave |

## 6. Multiple access in cellular systems

| Method | How the channel is shared | Used in |
|---|---|---|
| **FDMA** | Each user gets a **separate frequency band** for the whole call | 1G (AMPS) |
| **TDMA** ⭐ Asked in DSSSB | Users share **the same frequency channel** but get **different time slots** | GSM (with FDMA), IS-136 |
| **CDMA** | All users use the same frequency at the same time; separated by **unique spreading codes** (spread spectrum) | IS-95, CDMA2000, WCDMA |
| **OFDMA** | Users get sets of **orthogonal subcarriers** (and time) | LTE, 5G, Wi-Fi 6 |
| SDMA | Separate users in **space** by directional/beam-forming antennas | Smart antennas, massive MIMO |

"NDMA" and "PDMA" in the exam options are not standard schemes.

## 7. Mobile IP ⭐ Asked in DSSSB

Problem: an IP address identifies a fixed network location. When a laptop moves to another network its old address no longer routes. **Mobile IP** (IETF; RFC 3344 / RFC 5944 for IPv4) lets a mobile node keep its **home address** while moving. (Schiller, ch. 8.)

| Term | Meaning |
|---|---|
| **MN** — Mobile Node | The device that moves and keeps its home IP address |
| **CN** — Correspondent Node | Any host communicating with the MN |
| Home network | The subnet the MN's home address belongs to |
| Foreign network | The network the MN is currently visiting |
| **HA** — Home Agent | Router in the **home network**; tracks the MN's COA, intercepts packets for the MN and **tunnels** them to the COA |
| **FA** — Foreign Agent ⭐ | **Router in the foreign network to which the MN is currently attached**; decapsulates tunnelled packets and delivers them to the MN; often the MN's default router |
| **COA** — Care-of Address ⭐ | **Address of the current tunnel endpoint for the MN**; tells where the MN is now |

**Two kinds of COA**

| Foreign-agent COA | Co-located COA |
|---|---|
| COA is an **IP address of the FA**; tunnel ends at the FA | MN gets a **temporary topologically correct address itself**, e.g. **via DHCP**; tunnel ends **at the MN** |
| Many MNs can share one FA COA | One address per MN; works with no FA |

Key-error note: the 2023 question "______ is the address of the current tunnel endpoint for MN that can be chosen via DHCP" had the official key **FA**. The FA is a router, not an address; the correct answer is **COA** (co-located COA). Learn COA.

### How Mobile IP works

1. **Agent discovery** — HA and FA periodically broadcast **agent advertisements** (an extension of ICMP router advertisements) listing COAs; an MN that cannot wait sends an **agent solicitation**. The MN learns whether it is at home or in a foreign network.
2. **Registration** — the MN registers its COA with the HA: **MN → FA → HA** (registration request; with a co-located COA, MN → HA directly). The HA records a **mobility binding** (home address ↔ COA, lifetime) and sends a registration reply. Registration messages travel over **UDP port 434**.
3. **Tunnelling and encapsulation** — the CN sends to the MN's home address as normal. The HA intercepts the packet, **encapsulates** it inside a new IP header (source = HA, destination = COA) and sends it through the **tunnel**. Default method: **IP-in-IP encapsulation** (RFC 2003); alternatives: minimal encapsulation, GRE. At the tunnel end (FA or MN) the packet is **decapsulated** and delivered.
4. **Reverse direction** — the MN sends packets **directly to the CN** with its home address as source (via the FA as default router).

**Triangular routing**: CN → HA → COA → MN, but MN → CN directly. The path forms a triangle, which is inefficient when the MN is near the CN but far from home. Fixes: **route optimisation** (CN keeps a binding cache and tunnels straight to the COA) and **reverse tunnelling** (MN → FA → HA → CN, needed where firewalls drop packets with "foreign" source addresses).

## 8. Satellite systems ⭐ Asked in DSSSB

| Orbit | Altitude | Period | Features / examples |
|---|---|---|---|
| **GEO** (Geostationary) | **~35,786 km** above the equator | ~24 h (appears fixed) | 3 satellites cover almost the whole Earth (not the poles); fixed dish antennas; large footprint; **delay ~250 ms one way** (ground–satellite–ground); TV broadcast, VSAT, INSAT/GSAT |
| **MEO** (Medium Earth Orbit) | between LEO and GEO (~2,000–35,786 km; Forouzan: between the two Van Allen belts) | ~6–12 h | Fewer satellites than LEO, moderate delay; **GPS (~20,200 km)**, Galileo, ICO |
| **LEO** (Low Earth Orbit) | ~500–2,000 km (Schiller: 500–1,500 km) | ~95–120 min | Low delay (~10 ms), small footprint, needs many satellites and frequent handover; **Iridium (66 satellites)**, Globalstar, Starlink |

- **Footprint**: the area on Earth's surface covered by a satellite's signal (beam). Spot beams split a footprint into smaller cells.
- Bands: C (6/4 GHz up/down), Ku (14/12 GHz), Ka (30/20 GHz). Uplink frequency > downlink frequency.

**Satellite handover types (Schiller)**

| Handover | Between |
|---|---|
| **Intra-satellite** | Two **spot beams (cells) of the same satellite** |
| **Inter-satellite** | **Two different satellites** (satellite moving out of range; may use inter-satellite links) |
| **Gateway** | **Ground gateways** — satellite moves away from the current gateway, or the user changes gateway |
| **Inter-system** ⭐ | **Satellite network ↔ terrestrial cellular network** (e.g. phone switches to cheaper GSM when on land coverage) |

## 9. Mobile computing devices ⭐ Asked in DSSSB

Schiller's four categories of mobility and wireless:

| Category | Example |
|---|---|
| **Fixed and wired** | Desktop PC in an office (neither moves nor uses wireless) |
| **Mobile and wired** | Laptop carried from place to place but plugged in by cable (e.g. hotel LAN) |
| **Fixed and wireless** ⭐ | Device stays in one place but uses wireless — **Wi-Fi router / access point**, wireless LAN installed in a historic building where cabling is not allowed |
| **Mobile and wireless** | Smartphone, tablet — moves and stays connected wirelessly (true mobile computing) |

A Wi-Fi dongle plugged into a laptop moves with the laptop — it is not a "fixed" device.

Device types by size (Schiller): sensor, embedded controller, pager, mobile phone, PDA, pocket computer, notebook/laptop.

## 10. Wireless technologies

### Wi-Fi (IEEE 802.11, wireless LAN)

| Standard | Band | Max rate |
|---|---|---|
| 802.11 (1997) | 2.4 GHz | 2 Mbps |
| 802.11b | 2.4 GHz | 11 Mbps |
| 802.11a | 5 GHz | 54 Mbps |
| 802.11g | 2.4 GHz | 54 Mbps |
| 802.11n (Wi-Fi 4) | 2.4 / 5 GHz | 600 Mbps (MIMO) |
| 802.11ac (Wi-Fi 5) | 5 GHz | ~6.9 Gbps |
| 802.11ax (Wi-Fi 6 / 6E) | 2.4 / 5 / **6 GHz** (6E) | ~9.6 Gbps (OFDMA) |
| 802.11be (Wi-Fi 7) | 2.4 / 5 / 6 GHz | ~46 Gbps |

- MAC uses **CSMA/CA** (collision avoidance, RTS/CTS), not CSMA/CD.
- **Infrastructure mode** (stations talk via an **access point**; BSS, ESS; network name = **SSID**) vs **ad hoc mode** (IBSS, station to station).
- Security: WEP (RC4, broken) → WPA (TKIP) → **WPA2 (AES-CCMP)** → WPA3 (SAE).

### Bluetooth (IEEE 802.15.1, WPAN)
- **2.4 GHz ISM band**, frequency-hopping spread spectrum (**1600 hops/s**, 79 channels of 1 MHz in classic Bluetooth).
- **Piconet** = **1 master + up to 7 active slaves** (8 active devices; up to 255 parked).
- **Scatternet** = two or more piconets linked by a device that belongs to both.
- Range ~10 m (class 2) up to ~100 m (class 1); Bluetooth Low Energy (BLE) for wearables. Named after King Harald "Bluetooth".

### Other short- and wide-range technologies

| Technology | Standard / band | Key facts |
|---|---|---|
| **Zigbee** | **IEEE 802.15.4**, 2.4 GHz (also 868/915 MHz) | Low power, low data rate (**250 kbps**), mesh networks; home automation, sensors |
| **NFC** | **13.56 MHz** | Very short range (**~4 cm, max ~10 cm**), up to 424 kbps; contactless payments, tap-to-pair |
| **RFID** | LF 125 kHz, HF 13.56 MHz, UHF 860–960 MHz | Tag (passive = no battery, powered by reader; active = battery) + reader; FASTag, inventory, ID cards |
| **WiMAX** | **IEEE 802.16** (802.16e = mobile) | **Wireless MAN**, broadband over several km (up to ~50 km line of sight); a 4G candidate |
| IrDA | Infrared | Line of sight, ~1 m |

### MANET (Mobile Ad hoc Network)
An **infrastructure-less**, self-configuring network of mobile nodes connected wirelessly; **every node acts as a router** and topology changes all the time. Routing protocols: **reactive** (on-demand) — **AODV, DSR**; **proactive** (table-driven) — **DSDV, OLSR**. Uses: battlefield, disaster relief, vehicular networks (VANET).

### WAP (Wireless Application Protocol)
An early (late-1990s) protocol stack that let **2G/2.5G phones access Internet content**. Pages were written in **WML** (Wireless Markup Language) and scripts in WMLScript; a **WAP gateway** translated between the phone and web servers. Layers include WAE, WSP, WTP, WTLS (security) and WDP. Replaced by full HTML browsers on smartphones.

---

## Exam traps

1. **BTS = Base Transceiver Station** — not "Transfer Station" or "Basic Transceiver".
2. **HLR is permanent, VLR is temporary.** The VLR informs the HLR about location changes, not the other way round.
3. The **SIM** stores the IMSI; the **IMEI** identifies the handset and is checked in the **EIR**.
4. **GSM uses hard handover**; **soft handover** belongs to CDMA (UMTS/WCDMA).
5. **TDMA** = same frequency, different time slots; FDMA = different frequencies. NDMA/PDMA are not real methods.
6. **FA is a router; COA is an address.** "Current tunnel endpoint … chosen via DHCP" = **COA** (co-located COA), even though the 2023 key said FA.
7. With a **co-located COA**, the tunnel ends at the **MN itself**; with a foreign-agent COA it ends at the FA.
8. Triangular routing: only the CN → MN direction goes via the HA; MN → CN goes direct.
9. **Inter-system handover** = satellite ↔ terrestrial; gateway handover = between ground gateways; intra-satellite = between spot beams of one satellite.
10. **GEO altitude ≈ 35,786 km above the Earth's surface** (≈ 36,000 km rounded); the orbit radius from the Earth's centre is ≈ 42,164 km — do not mix the two.
11. A **Wi-Fi router/access point** is **fixed and wireless**; a laptop on a LAN cable is mobile and wired.
12. Bluetooth piconet: **7 active slaves**, not 8 (8 devices including the master). Wi-Fi uses CSMA/CA, not CSMA/CD.

## One-liners for revision

1. Wireless = unguided media: radio, microwave, infrared.
2. Cells are drawn as hexagons.
3. Frequency reuse uses the same frequencies in distant cells.
4. Cluster size N = i² + ij + j²; classic value 7.
5. Hard handover = break-before-make (GSM).
6. Soft handover = make-before-break (CDMA).
7. Intra-cell handover changes channel within the same cell.
8. 1G = analog voice, FDMA (AMPS).
9. 2G = digital GSM, SMS.
10. 2.5G = GPRS (packet switching); 2.75G = EDGE.
11. 3G = UMTS/WCDMA; 4G = LTE (OFDMA, all-IP); 5G = NR (~1 ms latency).
12. GSM = Global System for Mobile communication.
13. MS = ME + SIM.
14. BTS = Base Transceiver Station. ⭐
15. BSC controls several BTSs; BSS = BTS + BSC.
16. MSC is the switching centre; GMSC connects to other networks.
17. HLR = permanent home-subscriber database. ⭐
18. VLR = temporary database of visiting subscribers. ⭐
19. AuC handles authentication keys; EIR holds IMEI black/white/grey lists.
20. GSM 900 uplink 890–915 MHz, downlink 935–960 MHz.
21. GSM carrier = 200 kHz, 8 TDMA time slots.
22. GSM time slot ≈ 577 µs; TDMA frame ≈ 4.615 ms.
23. TDMA = same frequency, different time slots. ⭐
24. CDMA separates users by codes; OFDMA by subcarriers.
25. Mobile IP lets a mobile node keep its home IP address.
26. Foreign agent = router in the foreign network the MN is attached to. ⭐
27. Home agent tunnels packets to the COA.
28. COA = current tunnel endpoint for the MN. ⭐
29. Co-located COA is obtained by the MN itself, e.g. via DHCP. ⭐
30. Default Mobile IP tunnel = IP-in-IP encapsulation.
31. Triangular routing: CN → HA → MN, MN → CN direct.
32. GEO ≈ 35,786 km, period 24 h, ~250 ms one-way delay.
33. LEO ≈ 500–2,000 km (Iridium, Starlink); GPS (≈ 20,200 km) is in MEO.
34. Footprint = area covered by a satellite beam.
35. Inter-system handover = satellite ↔ terrestrial cellular. ⭐
36. Fixed and wireless device example = Wi-Fi router. ⭐
37. Wi-Fi = IEEE 802.11; bands 2.4, 5 and 6 GHz.
38. Bluetooth = 2.4 GHz; piconet = 1 master + 7 active slaves; scatternet = linked piconets.
39. Zigbee = 802.15.4; WiMAX = 802.16; NFC = 13.56 MHz, ~4 cm.
40. MANET: every node is a router; AODV and DSR are reactive protocols.

## Quick self-check

1. What does BTS stand for? — **Base Transceiver Station.**
2. Which GSM database holds permanent subscriber data? — **HLR** (VLR holds temporary data of visitors).
3. Who informs the HLR when a mobile moves into a new area? — **The VLR** (location update).
4. Users sharing one wide frequency channel in different time slots — which method? — **TDMA.**
5. In Mobile IP, the router in the foreign network to which the MN is attached is the? — **Foreign agent (FA).**
6. The address of the current tunnel endpoint for the MN, which can be obtained via DHCP? — **COA** (co-located care-of address).
7. Handover from a satellite network to a terrestrial cellular network? — **Inter-system handover.**
8. A Wi-Fi router belongs to which mobile computing category? — **Fixed and wireless.**
9. Maximum active slaves in a Bluetooth piconet? — **7.**
10. Which handover does GSM use, hard or soft? — **Hard handover** (soft is used in CDMA/UMTS).
