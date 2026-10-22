# Transport & Application Layer Protocols

**In 30 seconds**
- The transport layer gives **process-to-process** delivery. A **port number** (16 bits, 0–65535) picks out the process. **Socket = IP address + port number.**
- The transport-layer protocols are **TCP, UDP and SCTP**. The transport PDU is the **segment** (TPDU); for UDP it is the user datagram.
- **UDP** = connectionless, unreliable, **8-byte header**. It sends datagrams *without setting up a connection*. Used by DNS, DHCP, SNMP, TFTP, VoIP/RTP and streaming.
- **TCP** = connection-oriented, reliable, **byte-stream**, full duplex, **20–60-byte header**. Opens with a **3-way handshake** (SYN, SYN+ACK, ACK) and closes with FIN/ACK.
- **Flow control** (sliding window, rwnd) stops the receiver's buffer overflowing, which **prevents data loss**. **Congestion control** (cwnd) protects the network.
- **Slow start:** cwnd starts at 1 MSS and **doubles every RTT** (exponential) until ssthresh. After that comes **congestion avoidance**: +1 MSS per RTT (additive increase). On a loss, cwnd is cut (multiplicative decrease).
- Ports: **FTP 20/21, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67/68, TFTP 69, HTTP 80, POP3 110, NTP 123, IMAP 143, SNMP 161/162, BGP 179, HTTPS 443, RDP 3389**.
- Application layer: DNS turns names into IPs; HTTP is stateless (cookies add state); SMTP *pushes* mail; POP3/IMAP *pull* it.

---

## 1. Transport-layer basics ⭐ Asked in DSSSB

| Delivery type | Layer | Address used |
|---|---|---|
| Node-to-node (hop-to-hop) | Data link | MAC address |
| Host-to-host | Network | IP address |
| **Process-to-process (end-to-end)** | **Transport** | **Port number** |

> ⭐ **Asked (2023)**: "Which are transport layer protocols?" → **TCP, UDP and SCTP**. FTP and DNS are application layer; ICMP, ARP and RARP are network layer; Telnet is application layer.
> ⭐ **Asked (2023)**: Messages sent from transport entity to transport entity are called **segments** (TPDU, Transport Protocol Data Unit). Packet = network layer; frame = data link layer.

**Transport-layer duties:** port addressing, **segmentation and reassembly**, connection control, **end-to-end flow control**, **end-to-end error control**, congestion control (in TCP), and **multiplexing / demultiplexing**. Multiplexing means many processes share one IP. Demultiplexing means each arriving segment is handed to the right process by its port number.

### Port numbers (16 bits → 0 to 65,535)
| Range | Name | Assigned by | Example |
|---|---|---|---|
| **0 – 1023** | **Well-known** (system) ports | IANA | 80 HTTP, 25 SMTP |
| **1024 – 49151** | **Registered** (user) ports | Registered with IANA | 3306 MySQL, 3389 RDP |
| **49152 – 65535** | **Dynamic / private / ephemeral** | Chosen by the client's OS for the session | Client side of a web connection |

- A **server** listens on a well-known port, and the **client** uses a temporary ephemeral port.
- **Socket address = IP address + port** (e.g. 203.0.113.5:443).
- A TCP connection is identified by its **4-tuple**: (source IP, source port, destination IP, destination port).

---

## 2. UDP (User Datagram Protocol) ⭐ Asked in DSSSB

> ⭐ **Asked (2023)**: "Which protocol provides a way for applications to **send encapsulated IP datagrams without having to establish a connection**?" → **UDP**. The official option was printed as "Unit Datagram Protocol"; the correct name is **User Datagram Protocol** (RFC 768). TCP, Telnet and rlogin all need a connection.

**Features**
- **Connectionless**: no handshake and no teardown. Each datagram is independent.
- **Unreliable**: no ACKs, no retransmission, no ordering, **no flow control and no congestion control**.
- **Message-oriented**: it keeps the boundaries between messages (TCP does not).
- Error checking only: a **checksum** (optional in IPv4, mandatory in IPv6). A bad datagram is simply dropped.
- Very little overhead → **fast**, low delay. It also supports **broadcast and multicast**.

**UDP header = 8 bytes (fixed)**
| Field | Bits |
|---|---|
| Source port | 16 |
| Destination port | 16 |
| Length (header + data) | 16 (maximum 65,535) |
| Checksum | 16 |

**Where UDP is used:** DNS queries (53), DHCP (67/68), SNMP (161/162), TFTP (69), NTP (123), RIP (520), **RTP / VoIP / video streaming / online games**, multicast, and **QUIC** (the base of HTTP/3).
**Why:** these jobs need speed or simple request–reply exchanges. They can tolerate a little loss, and a late packet is no use anyway.

---

## 3. TCP (Transmission Control Protocol) ⭐ Asked in DSSSB

> ⭐ **Asked (2023)**: "Which is FALSE about TCP?" → "It is a **connection-less** protocol." These are TRUE: it uses a 3-way handshake, it receives data from the application as a single (byte) stream, and it is connection-oriented.

**Features**
| Feature | Meaning |
|---|---|
| **Connection-oriented** | A logical connection is set up (3-way handshake) before any data is sent |
| **Reliable** | ACKs, retransmission, sequence numbers and checksums → data arrives complete, in order, without duplicates |
| **Byte-stream** | The application gives a stream of bytes; TCP cuts it into segments (no message boundaries) |
| **Full duplex** | Data flows both ways at the same time; ACKs ride on data (**piggybacking**) |
| **Point-to-point** | Exactly two endpoints (no broadcast or multicast) |
| Flow control | Sliding window using rwnd |
| Congestion control | cwnd: slow start, AIMD |

### TCP header (20 bytes minimum, up to 60 with options)
| Field | Bits | Key fact |
|---|---|---|
| Source port, Destination port | 16 + 16 | |
| **Sequence number** | 32 | Number of the **first data byte** in this segment |
| **Acknowledgement number** | 32 | **Next byte expected** (cumulative ACK) |
| HLEN (data offset) | 4 | In 4-byte words: 5–15 → **20–60 bytes** |
| Reserved | — | |
| **Flags** | 6 classic (+ CWR, ECE) | URG, ACK, PSH, RST, SYN, FIN |
| **Window size** | 16 | The receiver's advertised window (rwnd), maximum 65,535 (more with the window-scale option) |
| Checksum | 16 | **Mandatory**; covers header + data + pseudo-header |
| Urgent pointer | 16 | Valid only when URG = 1 |
| Options | 0–40 bytes | MSS, window scale, SACK, timestamps |

**Flags**
| Flag | Meaning |
|---|---|
| **SYN** | Synchronise sequence numbers (open a connection) |
| **ACK** | The acknowledgement field is valid |
| **FIN** | The sender has finished sending (close) |
| **RST** | Reset (abort) the connection at once |
| **PSH** | Push: hand the data to the application now, without waiting to fill the buffer |
| **URG** | Urgent data is present (see the urgent pointer) |

### Sequence-number example
The ISN (initial sequence number) is 2000. The **SYN uses up one number**, so the first data byte is 2001. 5000 bytes are sent as 5 segments of 1000 bytes:

| Segment | Bytes | Seq no. | ACK sent back |
|---|---|---|---|
| 1 | 2001–3000 | 2001 | 3001 |
| 2 | 3001–4000 | 3001 | 4001 |
| 3 | 4001–5000 | 4001 | 5001 |
| 4 | 5001–6000 | 5001 | 6001 |
| 5 | 6001–7000 | 6001 | 7001 |

**SYN and FIN each use up one sequence number. A pure ACK uses none.**

### Three-way handshake (connection set-up)
1. Client → Server: **SYN**, seq = x
2. Server → Client: **SYN + ACK**, seq = y, ack = x + 1
3. Client → Server: **ACK**, ack = y + 1 (this segment may already carry data)

The server does a *passive open* (LISTEN) and the client does an *active open*. A **SYN flood** attack exploits step 2 by leaving many half-open connections.

### Connection termination
- **Four-way**: FIN → ACK → FIN → ACK. Either side may close first. In between there is a **half-close**: one direction has stopped, the other can still send.
- It is often 3 segments when FIN + ACK are combined.
- The side that closes first waits in **TIME_WAIT for 2 × MSL** (maximum segment lifetime), so that delayed segments die out.
- **RST** aborts the connection immediately, without the polite close.

**Main TCP states (connection life cycle)**
| State | Meaning |
|---|---|
| CLOSED | No connection |
| LISTEN | The server is waiting for a SYN (passive open) |
| SYN-SENT | The client has sent its SYN (active open) |
| SYN-RECEIVED | The server has received a SYN and sent SYN+ACK |
| **ESTABLISHED** | The handshake is complete and data can flow both ways |
| FIN-WAIT-1 / FIN-WAIT-2 | The side closing first has sent FIN / received the ACK for it |
| CLOSE-WAIT | The other side has received FIN and the application has not yet closed |
| LAST-ACK | That side has sent its own FIN and is waiting for the final ACK |
| TIME-WAIT | Waiting 2 × MSL before going to CLOSED |

### Flow control ⭐ Asked in DSSSB
> ⭐ **Asked (2023)**: "What feature of the transport layer **prevents data loss**?" → **Flow control**. Encryption gives secrecy; addressing and packet switching do not stop loss.

- **Sliding window**: the receiver advertises **rwnd** = free buffer space. The sender may have at most that many unacknowledged bytes in flight.
- **Sender window = min(rwnd, cwnd).**
- Example: rwnd = 8000 and cwnd = 5000 → window = 5000. If 3000 bytes are already unacknowledged → the sender may send **2000** more bytes.
- rwnd = 0 → the sender stops. The **persist timer** sends small probes so that the connection does not deadlock.
- Silly window syndrome is avoided with **Nagle's algorithm** at the sender and Clark's solution at the receiver.

### Error control
- **Checksum** on every segment → a corrupted segment is discarded.
- **Cumulative ACKs**, plus SACK (selective ACK) as an option.
- **Retransmission** happens when the **RTO timer expires** or when **3 duplicate ACKs** arrive (fast retransmit).
- Out-of-order segments are **buffered**, and duplicates are discarded.
- **Timers**: retransmission (RTO), persistence, keep-alive, TIME-WAIT.

**How the retransmission timeout (RTO) is set**
- TCP measures the sample RTT and keeps a **smoothed RTT** (a weighted average) together with the RTT deviation. RTO = smoothed RTT + 4 × deviation.
- **Karn's algorithm**: do not use the RTT of a *retransmitted* segment, because it is not known which copy the ACK answers. After each timeout, **double the RTO** (exponential back-off).
- The **keep-alive timer** checks an idle connection whose peer may have crashed. The **persistence timer** handles a zero window.

**Reliable-transfer ideas behind TCP (from the data link chapter)**
| Scheme | Sender window | Receiver window | On loss |
|---|---|---|---|
| Stop-and-wait | 1 | 1 | Resend the one frame |
| Go-Back-N | up to 2^m − 1 | 1 | Resend the lost frame **and all after it** |
| Selective Repeat | up to 2^(m−1) | up to 2^(m−1) | Resend **only the lost frame** |

TCP is a mix of these. It uses cumulative ACKs like Go-Back-N, but buffers out-of-order data and (with SACK) resends only what is missing, like Selective Repeat.

### Congestion control ⭐ Asked in DSSSB
> ⭐ **Asked (2023)**: "In the slow start phase the congestion window **approximately doubles every round-trip time**." (Each ACK adds 1 MSS, so a whole window of ACKs doubles it per RTT. It does NOT double per ACK, and it is not +1 MSS per RTT; that is congestion avoidance.)

| Phase | Rule | Growth |
|---|---|---|
| **Slow start** | cwnd starts at **1 MSS**; +1 MSS for every ACK → **doubles every RTT** | **Exponential**: 1, 2, 4, 8 … until cwnd reaches **ssthresh** |
| **Congestion avoidance** | +1 MSS per RTT | **Linear (additive increase)** |
| **Timeout** (serious congestion) | ssthresh = cwnd/2; **cwnd = 1 MSS**; slow start again | Multiplicative decrease |
| **3 duplicate ACKs** (mild congestion) | **Fast retransmit** the lost segment; Reno: ssthresh = cwnd/2, cwnd = ssthresh (**fast recovery**), then linear | Multiplicative decrease |

This pattern is called **AIMD** (Additive Increase, Multiplicative Decrease) and gives TCP its "saw-tooth" graph.

| | TCP Tahoe | TCP Reno |
|---|---|---|
| Timeout | cwnd = 1, slow start | cwnd = 1, slow start |
| 3 duplicate ACKs | Fast retransmit, then **cwnd = 1** (slow start) | Fast retransmit + **fast recovery**: cwnd = cwnd/2 and continue linearly |

**Worked example** (cwnd in MSS, initial ssthresh = 16)
- RTT 1–5: cwnd = **1, 2, 4, 8, 16** (slow start; ssthresh reached)
- RTT 6–9: **17, 18, 19, 20** (congestion avoidance)
- A **timeout** happens at cwnd = 20 → ssthresh = 20/2 = **10**, cwnd = **1**
- Next RTTs: **1, 2, 4, 8, 10** (capped at ssthresh), then **11, 12 …**
- If at cwnd = 12, Reno instead sees **3 duplicate ACKs** → ssthresh = 6, cwnd = **6**, then 7, 8 … (Tahoe would drop to 1.)

---

## 4. TCP vs UDP

| Point | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (3-way handshake) | **Connectionless** |
| Reliability | Reliable (ACK, retransmission) | Unreliable (best effort) |
| Ordering | In-order delivery | No ordering |
| Data unit | Byte stream → segments | Message → user datagram |
| Header | **20–60 bytes** | **8 bytes** |
| Flow / congestion control | Yes / Yes | No / No |
| Speed / overhead | Slower, heavier | **Faster, lighter** |
| Broadcast / multicast | No | Yes |
| Checksum | Mandatory | Optional (IPv4) |
| Used by | HTTP/HTTPS, FTP, SMTP, POP3, IMAP, SSH, Telnet, BGP | DNS, DHCP, SNMP, TFTP, NTP, RIP, VoIP, streaming |
| IP protocol number | 6 | 17 |

### SCTP (Stream Control Transmission Protocol), briefly
- A reliable, **message-oriented** transport that combines the good points of TCP and UDP. It is IP protocol **132**.
- **Multistreaming**: several streams in one association, so loss in one stream does not block the others (no head-of-line blocking).
- **Multihoming**: one endpoint can have several IP addresses, which gives fail-over.
- Uses a **4-way handshake with a cookie**, which resists SYN-flood-style attacks.
- Used for telephone signalling (SS7 over IP) and WebRTC data channels.

---

## 5. Application-layer paradigms

| Client–server | Peer-to-peer (P2P) |
|---|---|
| A dedicated, always-on **server** with a fixed address serves many **clients** | Every peer is both client and server, with equal rights |
| Central control, easy to manage and secure | No central server; scales well because each peer adds capacity |
| The server is a bottleneck and a single point of failure | Harder to secure and manage |
| Web, email, FTP, DNS | BitTorrent, Skype (early), blockchain networks |

---

## 6. DNS (Domain Name System)

- Turns **domain names into IP addresses** (forward lookup) and IPs back into names (**reverse lookup**, using PTR records under in-addr.arpa).
- It is a **distributed, hierarchical** database. **UDP 53** is used for normal queries. **TCP 53** is used for **zone transfers** and large replies.

**Hierarchy** (read the name right to left): **root (.)** → **TLD** (generic .com, .org, .edu, .gov; country codes .in, .uk) → **second-level domain** (example.com) → sub-domains (www.example.com).

| Server | Role |
|---|---|
| **Root servers** | Know the TLD servers. There are 13 named root identities (a–m), each made of many anycast copies |
| **TLD servers** | Know the authoritative servers for each domain under .com, .in, etc. |
| **Authoritative server** | Holds the real records of a zone (primary / secondary) |
| **Local / recursive resolver** | The ISP's or organisation's server that the host asks; it **caches** answers for their TTL |

**Recursive vs iterative resolution**
- **Recursive**: the server asked takes full responsibility, does all the work and returns the **final answer**. Host → local resolver is usually recursive.
- **Iterative**: the server returns the **best referral it has** ("ask this TLD server"), and the asker contacts each server in turn. Resolver → root → TLD → authoritative is usually iterative.

**Walk-through: a browser looks up www.example.in**
1. The browser checks its own cache, then the OS cache and the hosts file.
2. If there is no answer, the host sends a **recursive** query (UDP 53) to its **local resolver** (the ISP's DNS server).
3. The resolver asks a **root server** → the root replies with a referral to the **.in TLD** servers (iterative).
4. The resolver asks the .in TLD server → it replies with a referral to example.in's **authoritative** server.
5. The resolver asks the authoritative server → it returns the **A (or AAAA) record**.
6. The resolver **caches** the answer for its TTL and returns it to the host. The browser can now open a TCP connection to that IP.

**Record types**
| Record | Holds |
|---|---|
| **A** | Name → **IPv4** address |
| **AAAA** | Name → **IPv6** address |
| **CNAME** | Alias → canonical (true) name |
| **MX** | **Mail exchanger** for the domain (with a priority) |
| **NS** | The authoritative **name server** for the zone |
| **PTR** | IP → name (reverse lookup) |
| SOA | Start of authority: zone details, serial number, timers |
| TXT | Free text (SPF, verification) |

---

## 7. HTTP and the web

- **HTTP** = HyperText Transfer Protocol. It runs over **TCP port 80**. It is a client–server request/response protocol (browser ↔ web server).
- **Stateless**: the server keeps no memory of earlier requests. **Cookies** add state: the server sends `Set-Cookie`, and the browser returns the cookie with every request. Used for logins, carts and tracking.
- **HTTPS** = HTTP over **TLS (formerly SSL)**, **port 443**. It gives encryption, integrity and server authentication (certificates).

**Message format**
- **Request** = request line (`GET /index.html HTTP/1.1`) + headers (Host, User-Agent, Accept, Cookie) + a blank line + an optional body.
- **Response** = status line (`HTTP/1.1 200 OK`) + headers (Content-Type, Content-Length, Set-Cookie, Last-Modified) + a blank line + the body (HTML, an image, …).
- HTTP/1.x messages are plain **ASCII text**. HTTP/2 and HTTP/3 send binary frames.

**Methods**
| Method | Use |
|---|---|
| **GET** | Fetch a resource (data in the URL; safe and idempotent) |
| **POST** | Send data to the server (forms, uploads; data in the body) |
| **PUT** | Create or replace a resource at a URL |
| **DELETE** | Remove a resource |
| **HEAD** | Like GET but returns **headers only** (no body) |
| PATCH / OPTIONS / TRACE / CONNECT | Partial update / ask which methods are allowed / loop-back test / open a tunnel through a proxy |

**Status codes**
| Class | Meaning | Common codes |
|---|---|---|
| **1xx** | Informational | 100 Continue, 101 Switching Protocols |
| **2xx** | Success | **200 OK**, 201 Created, 204 No Content |
| **3xx** | Redirection | **301 Moved Permanently**, 302 Found, **304 Not Modified** |
| **4xx** | Client error | 400 Bad Request, **401 Unauthorized**, **403 Forbidden**, **404 Not Found**, 405 Method Not Allowed |
| **5xx** | Server error | **500 Internal Server Error**, 502 Bad Gateway, **503 Service Unavailable**, 504 Gateway Timeout |

**Persistent vs non-persistent connections**
| Non-persistent (HTTP/1.0 default) | Persistent (HTTP/1.1 default, keep-alive) |
|---|---|
| A new TCP connection for **each object** | One TCP connection is reused for many objects |
| About **2 RTT per object** (handshake + request) plus transfer time | Saves the handshakes; allows **pipelining** |
| Heavy load on the server | Less overhead |

**HTTP versions**
| Version | Key change |
|---|---|
| HTTP/1.0 | Non-persistent by default |
| **HTTP/1.1** | Persistent connections, pipelining, **Host header** (virtual hosting), chunked transfer |
| **HTTP/2** | **Binary framing**, **multiplexing** many streams over one TCP connection, **header compression (HPACK)**, server push |
| **HTTP/3** | Runs over **QUIC on UDP** (not TCP); avoids TCP head-of-line blocking; TLS 1.3 built in |

**Other web terms:** URL = protocol://host:port/path?query; a **proxy server / web cache** stores copies to cut delay (it uses conditional GET with If-Modified-Since → 304).

---

## 8. File transfer and remote access

### FTP (File Transfer Protocol)
- Uses **two TCP connections**: **control on port 21** and **data on port 20** (in active mode).
- The control connection stays open for the whole session. The data connection opens and closes **for each file**.
- Commands travel on a separate connection from the data, so FTP is said to send its control information **out-of-band**.
- **Active mode**: the server connects *from* port 20 *to* a port the client gives. **Passive mode (PASV)**: the server opens a random port and the **client connects to it**. This works through client firewalls and NAT.
- Transfer types: ASCII / binary. Anonymous FTP exists. Commands include USER, PASS, LIST, RETR (download), STOR (upload) and QUIT.
- FTP sends the password in **plaintext**. Secure options are **FTPS** (FTP over TLS) and **SFTP** (the SSH file transfer protocol, port 22).

### TFTP (Trivial FTP)
- **UDP port 69**. No login, no directory listing. It sends 512-byte blocks using stop-and-wait ACKs.
- Used for booting diskless machines and loading firmware or configuration files onto routers.

### Telnet and SSH
- **Telnet (TCP 23)**: a remote terminal using the Network Virtual Terminal (NVT). **Everything, including passwords, is sent in plaintext.**
- **SSH (TCP 22)**: an **encrypted** remote login that replaces Telnet and rlogin. It also carries **SCP/SFTP** file transfer and port forwarding.
- **RDP (TCP 3389)**: Microsoft Remote Desktop, a full graphical remote session.

---

## 9. Email protocols ⭐ Asked in DSSSB

> ⭐ **Asked (2023)**: "A process wishing to **remotely retrieve mail** … connects to port ___ to contact its **IMAP** daemon" → **143**. (443 = HTTPS, 80 = HTTP, 20 = FTP data.) Also learn **POP3 = 110**, the other mail-retrieval port. It is equally likely to be asked.

**Parts of the system:** User Agent (MUA, e.g. Outlook) → Mail Transfer Agent (MTA, server) → … → the receiver's mailbox → retrieved by an access agent (POP3/IMAP).

| Protocol | Port (TCP) | Direction | Key facts |
|---|---|---|---|
| **SMTP** | **25** (587 for client submission, 465 SMTPS) | **Push**: client → server and server → server | Sends and relays mail; 7-bit ASCII text commands (HELO, MAIL FROM, RCPT TO, DATA, QUIT) |
| **POP3** | **110** (995 over TLS) | **Pull**: server → client | **Download-and-delete** by default; mail is read offline on one device; simple; no folders on the server |
| **IMAP4** | **143** (993 over TLS) | **Pull** | Mail **stays on the server**; **server-side folders**; sync across many devices; download headers only or a part of a message; search on the server |

- **MIME** (Multipurpose Internet Mail Extensions) lets SMTP's 7-bit ASCII carry **non-ASCII text, images, audio, video and attachments**. Headers: MIME-Version, Content-Type (e.g. image/jpeg), Content-Transfer-Encoding (**base64**, quoted-printable). MIME is an *extension*, not a separate transfer protocol.
**Journey of one email (Asha → Ravi)**
1. Asha writes the mail in her user agent, which hands it to her mail server using **SMTP** (port 587 or 25).
2. Her server finds Ravi's mail server from the **DNS MX record** of his domain and relays the mail to it using **SMTP (port 25)**.
3. The mail waits in Ravi's mailbox on his server.
4. Ravi's user agent **pulls** it using **POP3 (110)**, which downloads it and usually deletes it from the server, or **IMAP (143)**, which reads it while it stays on the server in folders.

SMTP is used twice (push) and POP3/IMAP once (pull). SMTP keeps a TCP connection open and sends text commands, and the server replies with 3-digit codes (e.g. 250 OK, 550 mailbox unavailable).

- **Webmail** (Gmail in a browser) uses **HTTP/HTTPS** between the browser and the server, and SMTP between mail servers.
- Memory hook: **SMTP = "Send Mail To People"** (push). POP3 and IMAP are used to *read* mail (pull).

---

## 10. Network management and other services

| Protocol | Port | Transport | Purpose |
|---|---|---|---|
| **SNMP** | **161** (agent: get/set requests) / **162** (manager: **traps**) | UDP | Manages routers, switches and servers. Its parts are the **manager**, the **agent**, the **MIB** (Management Information Base) and SMI |
| **DHCP** | **67** server / **68** client | UDP | Automatic IP configuration (DORA) |
| **NTP** | **123** | UDP | Clock synchronisation |
| **DNS** | 53 | UDP (TCP) | Name resolution |
| **LDAP** | 389 | TCP | Directory services |
| **BGP** | 179 | TCP | Inter-AS routing |
| **RIP** | 520 | UDP | Distance-vector routing |

---

## 11. Master ports table (fast revision)

| Protocol | Port | TCP/UDP | Purpose |
|---|---|---|---|
| FTP data | **20** | TCP | File data (active mode) |
| FTP control | **21** | TCP | FTP commands (out-of-band control) |
| SSH / SFTP / SCP | **22** | TCP | Secure remote login and file transfer |
| Telnet | **23** | TCP | Insecure remote login |
| SMTP | **25** | TCP | Send / relay email (push) |
| DNS | **53** | UDP (TCP for zone transfer) | Name ↔ IP |
| DHCP / BOOTP | **67 / 68** | UDP | 67 server, 68 client |
| TFTP | **69** | UDP | Trivial file transfer |
| HTTP | **80** | TCP | Web |
| Kerberos | 88 | TCP/UDP | Authentication |
| POP3 | **110** | TCP | Retrieve mail (download-and-delete) |
| NNTP | 119 | TCP | Usenet news |
| NTP | **123** | UDP | Time sync |
| IMAP4 | **143** | TCP | Retrieve mail (kept on the server) |
| SNMP | **161** | UDP | Management queries (agent) |
| SNMP trap | **162** | UDP | Alerts to the manager |
| BGP | **179** | TCP | Inter-domain routing |
| LDAP | 389 | TCP | Directory |
| HTTPS | **443** | TCP (UDP for HTTP/3) | Secure web (HTTP over TLS) |
| SMTPS | 465 | TCP | SMTP over TLS |
| RIP | 520 | UDP | Routing |
| SMTP submission | 587 | TCP | Client → mail server |
| IMAPS | 993 | TCP | IMAP over TLS |
| POP3S | 995 | TCP | POP3 over TLS |
| MySQL | 3306 | TCP | Database (registered port) |
| RDP | **3389** | TCP | Remote desktop |
| HTTP alternate | 8080 | TCP | Proxy / test web servers |

**Memory chain for the well-known ones:** 20-21 FTP · 22 SSH · 23 Telnet · 25 SMTP · 53 DNS · 67-68 DHCP · 69 TFTP · 80 HTTP · 110 POP3 · 123 NTP · 143 IMAP · 161-162 SNMP · 443 HTTPS.

---

## Exam traps
1. **TCP is connection-oriented**; "TCP is connectionless" is always the FALSE statement. **UDP** is the connectionless one.
2. "Unit Datagram Protocol" in an option means **UDP**; the real name is **User** Datagram Protocol.
3. **Flow control prevents data loss at the receiver**. Congestion control protects the *network*. Do not swap them.
4. **Slow start is exponential**: it doubles every **RTT**, not every ACK (each ACK adds only 1 MSS). "+1 MSS per RTT" is congestion avoidance.
5. **After a timeout, cwnd = 1 MSS** in both Tahoe and Reno. Only Reno's fast recovery (on 3 duplicate ACKs) halves cwnd instead.
6. **IMAP = 143, POP3 = 110**. Do not confuse them with 443 (HTTPS) or 113.
7. **FTP control = 21, data = 20**. "Out-of-band" refers to FTP's separate control connection.
8. **DNS uses UDP 53 for queries** but TCP 53 for zone transfers. "DNS uses only TCP" is false.
9. **TFTP is UDP 69**, while FTP is TCP. **SNMP is UDP** 161/162. **BGP is TCP** 179.
10. **SMTP pushes mail; POP3 and IMAP pull it.** SMTP cannot be used to read a mailbox.
11. **The UDP header is 8 bytes; the TCP header is 20–60 bytes.** TCP's HLEN is counted in 4-byte words.
12. **HTTP is stateless** even though it runs on TCP, which is connection-oriented. Cookies add the state.

## One-liners for revision
1. Transport layer = process-to-process delivery.
2. Port number = 16 bits (0–65535).
3. Well-known 0–1023, registered 1024–49151, dynamic 49152–65535.
4. Socket = IP address + port number.
5. Transport protocols: TCP, UDP, SCTP.
6. Transport PDU = segment (TPDU); UDP's PDU = user datagram.
7. UDP = connectionless, unreliable, message-oriented.
8. UDP header = 8 bytes: source port, destination port, length, checksum.
9. UDP is used by DNS, DHCP, SNMP, TFTP, NTP, RIP, VoIP and streaming.
10. TCP = connection-oriented, reliable, byte-stream, full duplex.
11. TCP header = 20 to 60 bytes.
12. Sequence number = number of the first byte; ACK number = next byte expected.
13. SYN and FIN each use up one sequence number.
14. Three-way handshake: SYN → SYN+ACK → ACK.
15. Termination: FIN → ACK → FIN → ACK (half-close possible).
16. RST aborts a connection; PSH delivers data at once; URG marks urgent data.
17. TIME_WAIT lasts 2 × MSL.
18. Flow control = sliding window using rwnd; it prevents receiver overflow and data loss.
19. Effective window = min(rwnd, cwnd).
20. Error control = checksum + ACK + retransmission + timers.
21. Slow start: cwnd from 1 MSS, doubling each RTT, up to ssthresh.
22. Congestion avoidance: +1 MSS per RTT (additive increase).
23. On timeout: ssthresh = cwnd/2 and cwnd = 1.
24. 3 duplicate ACKs → fast retransmit (and in Reno, fast recovery).
25. AIMD = additive increase, multiplicative decrease.
26. SCTP = multistreaming + multihoming, IP protocol 132.
27. DNS = name → IP, UDP/TCP port 53.
28. DNS hierarchy: root → TLD → authoritative.
29. A = IPv4, AAAA = IPv6, MX = mail, NS = name server, PTR = reverse, CNAME = alias.
30. Recursive resolution returns the final answer; iterative returns a referral.
31. HTTP = port 80, stateless; HTTPS = HTTP over TLS on port 443.
32. GET fetches, POST submits, HEAD gets headers only.
33. 200 OK, 301 Moved, 304 Not Modified, 404 Not Found, 500 Server Error.
34. HTTP/1.1 = persistent connections; HTTP/2 = multiplexing; HTTP/3 = QUIC over UDP.
35. FTP: control 21, data 20; passive mode = the client opens the data connection.
36. TFTP = UDP 69, no authentication.
37. SMTP 25 = push; POP3 110 = download-and-delete; IMAP 143 = mail stays on the server.
38. MIME lets email carry attachments and non-ASCII data (base64).
39. Telnet 23 = plaintext; SSH 22 = encrypted.
40. SNMP 161 for queries, 162 for traps (UDP).
41. DHCP: server 67, client 68 (UDP).
42. NTP 123, RDP 3389, BGP 179.

## Quick self-check
1. Which feature of the transport layer prevents data loss? → **Flow control**.
2. Which protocol sends datagrams without establishing a connection? → **UDP**.
3. Size of the UDP header? → **8 bytes**.
4. Name the transport-layer protocols. → **TCP, UDP and SCTP**.
5. In slow start, how does cwnd grow? → It **doubles every RTT** (exponential) until ssthresh.
6. After a timeout at cwnd = 20 MSS, what are the new ssthresh and cwnd? → **ssthresh = 10, cwnd = 1 MSS**.
7. The ISN is 2000 and the first segment carries 1000 bytes. What is its sequence number, and what ACK comes back? → **Seq 2001, ACK 3001**.
8. Which port does an IMAP daemon listen on? → **143** (POP3 is 110).
9. Which DNS record maps a name to an IPv6 address? → **AAAA**.
10. Which HTTP status code means "Not Modified"? → **304**.
11. On which ports does FTP carry control and data? → **21 control, 20 data**.
12. Which SNMP port receives traps? → **162** (UDP).
