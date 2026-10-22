# Network Security, Internet & Web Basics

**In 30 seconds**
- **Authentication = verifying identity** ("are you who you claim to be?"). Authorisation = what you may do. Non-repudiation = sender cannot deny sending. ⭐ Asked in DSSSB
- **Plaintext** goes into encryption, **ciphertext** comes out. The key is the secret that controls the cipher. ⭐ Asked in DSSSB
- **Transposition** reorders letters but does not disguise them; **substitution** disguises letters but keeps their order. ⭐ Asked in DSSSB
- **Symmetric** (one shared key): DES, 3DES, AES, Blowfish, IDEA, RC4. **Asymmetric** (public + private key): RSA, Diffie–Hellman, ElGamal, ECC, DSA. "RSA is NOT symmetric." ⭐ Asked in DSSSB
- **DES** 56-bit key, 64-bit block, 16 rounds. **3DES key = 168 bits** (3 × 56; effective strength 112). **AES** 128/192/256-bit keys, 128-bit block. ⭐ Asked in DSSSB
- **Session key** = temporary symmetric key used to encrypt one session between end systems. ⭐ Asked in DSSSB
- Digital signature: **sign with the sender's private key, verify with the sender's public key**. Firewall filters traffic between trusted and untrusted networks.
- Internet essentials: **device + NIC/modem + ISP + TCP/IP + browser**; web surfing = visiting site after site; internetworking exists for **messages for communication** and resource sharing. ⭐ Asked in DSSSB

---

## 1. Security goals and services

**CIA triad** (Stallings, Forouzan):

| Goal | Meaning | Threat to it | Tool that gives it |
|---|---|---|---|
| **Confidentiality** | Only authorised people can read data | Eavesdropping, traffic analysis | Encryption |
| **Integrity** | Data is not altered in transit or storage | Modification, tampering | Hash, MAC, digital signature |
| **Availability** | Service is usable when needed | DoS / DDoS | Redundancy, firewalls, rate limiting |

**Further services (ITU-T X.800 and AAA):**

| Service | One-line meaning |
|---|---|
| **Authentication** ⭐ Asked in DSSSB | Verifying the identity of a user, device or message source (password, OTP, biometric, certificate) |
| **Authorisation / access control** | Deciding what an authenticated user is allowed to do (permissions, ACLs) |
| **Non-repudiation** | Sender (or receiver) cannot later deny the message; given by digital signatures |
| **Accounting (auditing)** | Recording who did what and when (logs); third "A" of AAA, e.g. RADIUS, TACACS+ |

Order of AAA: **Authentication → Authorisation → Accounting**.

Authentication factors: something you **know** (password, PIN), something you **have** (OTP token, smart card, phone), something you **are** (fingerprint, iris). Two of them = two-factor authentication (2FA/MFA).

---

## 2. Attacks

**Passive attacks** — attacker only watches; no change to data; hard to detect, so we **prevent** them (encryption).

| Passive attack | Meaning |
|---|---|
| Eavesdropping / release of message contents | Reading the contents of a message (sniffing) |
| Traffic analysis | Even if encrypted, studying who talks to whom, how often, how much |

**Active attacks** — attacker changes or injects data; easier to detect, hard to prevent fully, so we **detect and recover**.

| Active attack | Meaning |
|---|---|
| Masquerade | One entity pretends to be another (uses stolen credentials) |
| Replay | Captures a valid message and re-sends it later (defence: timestamps, nonces) |
| Modification of messages | Alters, delays or reorders a genuine message |
| Denial of Service (DoS) | Floods or crashes a service so legitimate users cannot use it (SYN flood, ping flood) |
| DDoS | DoS launched from many machines at once, usually a botnet |

### Malware types

| Malware | Key feature |
|---|---|
| **Virus** | Attaches to a host file/program; needs user action (running the file) to spread |
| **Worm** | Self-replicating, spreads over the network on its own; no host file needed (e.g. Morris worm 1988) |
| **Trojan horse** | Looks useful/harmless but hides a malicious function; does not self-replicate |
| **Ransomware** | Encrypts the victim's files and demands payment for the key (e.g. WannaCry 2017) |
| **Spyware** | Secretly collects user information and sends it out |
| **Adware** | Shows unwanted advertisements; often bundled with free software |
| **Rootkit** | Hides itself and other malware deep in the OS, gives hidden privileged (root) access |
| **Keylogger** | Records keystrokes to steal passwords and card numbers |
| **Botnet** | Network of infected "zombie" machines (bots) controlled by a bot-master; used for DDoS and spam |

Also: **logic bomb** (triggers on a condition/date), **backdoor** (secret entry bypassing authentication).

### Other common attacks (one line each)

| Attack | One line |
|---|---|
| Phishing | Fake e-mails/sites that trick users into revealing passwords or card details (spear phishing = targeted; vishing = voice; smishing = SMS) |
| Spoofing | Faking a source identity — IP spoofing, e-mail spoofing, ARP spoofing, DNS spoofing |
| Man-in-the-middle (MITM) | Attacker secretly sits between two parties, reading or changing their traffic |
| SQL injection | Malicious SQL typed into an input field is run by the database (defence: parameterised queries) |
| Cross-site scripting (XSS) | Malicious script injected into a web page runs in other users' browsers |
| Pharming | Redirects users to a fake site by poisoning DNS, even when the correct URL is typed |
| Brute force | Trying every possible key or password |

---

## 3. Cryptography basics

**Plaintext** ⭐ Asked in DSSSB (the original readable message — the information that gets transformed during encryption) → **encryption algorithm + key** → **ciphertext** ⭐ (unreadable output) → **decryption algorithm + key** → plaintext.

| Term | Meaning |
|---|---|
| Cipher | The algorithm used for encryption and decryption |
| Key | Secret value that controls the cipher's output |
| Cryptography | Science of designing ciphers |
| Cryptanalysis | Science of breaking ciphers without the key |
| Cryptology | Cryptography + cryptanalysis |
| Kerckhoffs's principle | The algorithm may be public; only the key must be secret |
| Block cipher | Encrypts fixed-size blocks (DES 64-bit, AES 128-bit) |
| Stream cipher | Encrypts one bit/byte at a time (RC4) |

### Classical ciphers

**Substitution ciphers** replace each letter with another letter/symbol — they **disguise** the letters, but the order stays.

| Cipher | How it works | Mini example |
|---|---|---|
| **Caesar** (shift/additive) | Shift every letter by a fixed number (Caesar used 3) | HELLO → KHOOR (shift 3) |
| **Monoalphabetic** | Any fixed one-to-one mapping of the 26 letters; key space 26! | A→Q, B→W, C→E … ; broken by letter-frequency analysis (E most common in English) |
| **Vigenère** (polyalphabetic) | Repeating keyword; each key letter gives a different Caesar shift | ATTACK + key LEMON → LXFOPV |
| **Playfair** | 5×5 key matrix (I and J share a cell); encrypts **pairs of letters (digraphs)** | Used by the British in WWI |
| **One-time pad (Vernam)** | Random key as long as the message, used once only | Only cipher that is perfectly secure in theory |

**Transposition ciphers** ⭐ Asked in DSSSB — **reorder (permute) the letters, but do not disguise them**. The ciphertext has exactly the same letters as the plaintext, so letter frequencies are unchanged.

| Cipher | Mini example |
|---|---|
| Rail fence (depth 2) | MEETME → write in zig-zag: row 1 = M E M, row 2 = E T E → ciphertext **MEMETE** |
| Columnar transposition | Write row by row under a keyword, read column by column in key order |

Memory hook: **Substitution = Swap the letters; Transposition = Shuffle the positions.**

---

## 4. Symmetric-key cryptography ⭐ Asked in DSSSB

One **shared secret key** is used for both encryption and decryption. Fast; good for bulk data. Problem: the key must be distributed securely, and n users need **n(n − 1)/2** keys.

| Algorithm | Key length | Block size | Rounds | Notes |
|---|---|---|---|---|
| **DES** | **56 bits** (64 with 8 parity bits) | **64 bits** | **16** | IBM/NBS 1977; Feistel structure; now insecure (brute-forced in 1998) |
| **3DES (Triple DES)** ⭐ | **168 bits** = 3 × 56 (three-key); 112 bits in the two-key version | 64 bits | 48 (3 × 16) | Encrypt–Decrypt–Encrypt (EDE); effective strength of 3-key 3DES is **112 bits** due to meet-in-the-middle attack |
| **AES** (Rijndael) | **128 / 192 / 256 bits** | **128 bits** | **10 / 12 / 14** | NIST standard 2001 (Daemen & Rijmen); not Feistel (substitution–permutation network) |
| **Blowfish** | 32 to 448 bits (variable) | 64 bits | 16 | Bruce Schneier, 1993; free to use |
| **IDEA** | **128 bits** | 64 bits | 8 (+ half round) | Used in early PGP |
| **RC4** | Variable (40–2048 bits) | — (stream) | — | **Stream cipher** by Ron Rivest; used in WEP and old SSL; now broken |
| RC5 / RC6, Twofish | Variable / 128–256 | — | — | Other symmetric ciphers |

## 5. Asymmetric (public-key) cryptography

Each user has a **key pair**: a **public key** (shared with everyone) and a **private key** (kept secret). What one key locks, only the other key unlocks. Slower than symmetric; solves key distribution. n users need only **2n** keys.

| Algorithm | Used for | Based on |
|---|---|---|
| **RSA** (Rivest, Shamir, Adleman, 1977) | Encryption and digital signatures | Difficulty of factoring the product of two large primes |
| **Diffie–Hellman** (1976) | **Key exchange only** (agreeing a shared secret over an open channel); not encryption | Discrete logarithm; vulnerable to MITM unless authenticated |
| **ElGamal** | Encryption and signatures | Discrete logarithm |
| **ECC** (Elliptic Curve Cryptography) | Encryption, key exchange (ECDH), signatures (ECDSA) | Elliptic curves; small keys (256-bit ECC ≈ 3072-bit RSA) |
| **DSA** (Digital Signature Algorithm) | **Digital signatures only** | Discrete logarithm; NIST DSS |

**Classification at a glance** ⭐ Asked in DSSSB

| Symmetric (secret / private / single key) | Asymmetric (public key) |
|---|---|
| DES, 3DES, AES, Blowfish, Twofish, IDEA, RC4, RC5, RC6 | RSA, Diffie–Hellman, ElGamal, ECC, DSA |
| Same key both ends | Public key + private key |
| Fast, bulk data | Slow, key exchange and signatures |

Which key for what (Forouzan):
- **Confidentiality**: encrypt with the **receiver's public key**; receiver decrypts with own private key.
- **Signature**: sign with the **sender's private key**; anyone verifies with the sender's public key.

### Session key ⭐ Asked in DSSSB

A **session key** is a **temporary symmetric key** used to encrypt the data of **one communication session** between end systems and then thrown away. Typical hybrid scheme (TLS, PGP): public-key cryptography (RSA or Diffie–Hellman) is used to exchange the session key; the session key (e.g. AES) then encrypts the bulk data. Benefit: speed of symmetric + key-distribution advantage of asymmetric; a leaked session key exposes only one session.

A **Key Distribution Centre (KDC)** — e.g. in **Kerberos** — hands out session keys using symmetric cryptography; Kerberos issues **tickets** for authentication.

---

## 6. Hashes, MACs, signatures and certificates

**Cryptographic hash function** — turns any-length input into a **fixed-length digest**; one-way (cannot reverse) and collision-resistant. Gives **integrity**. Uses no key.

| Hash | Digest length | Status |
|---|---|---|
| **MD5** (Rivest) | **128 bits** | Broken (collisions) |
| **SHA-1** | **160 bits** | Deprecated |
| **SHA-256** (SHA-2 family) | 256 bits | Widely used (TLS, Bitcoin) |
| SHA-512 | 512 bits | SHA-2 family |
| SHA-3 (Keccak) | 224–512 bits | Newest standard |

- **MAC (Message Authentication Code)** = checksum computed with a **shared secret key** → gives integrity + authentication of the sender (but not non-repudiation, because both sides know the key).
- **HMAC** = MAC built from a hash function + secret key (e.g. HMAC-SHA256).
- **Digital signature**: hash the message → encrypt the hash with the **sender's private key** → receiver decrypts with the **sender's public key** and compares hashes. Gives **authentication, integrity and non-repudiation** (not confidentiality).
- **Digital certificate**: an electronic document that **binds a public key to an identity**, signed by a **Certificate Authority (CA)**.
- **X.509**: ITU-T standard format for certificates — version, serial number, subject, subject's public key, issuer (CA), validity period, CA's signature.
- **PKI (Public Key Infrastructure)**: the whole system of CAs, Registration Authorities (RA), certificates, repositories and **Certificate Revocation Lists (CRL)/OCSP**. In India, the **Controller of Certifying Authorities (CCA)** licenses CAs under the IT Act 2000.

---

## 7. Security protocols by layer

| Layer | Protocol | Key facts |
|---|---|---|
| Application | **PGP** (Pretty Good Privacy, Phil Zimmermann 1991) | E-mail security; web of trust; uses session key + public key |
| Application | **S/MIME** | Secure MIME e-mail; uses **X.509 certificates** from CAs |
| Application | SSH (port 22) | Secure remote login, replaces Telnet |
| Transport | **SSL / TLS** | SSL by Netscape (1990s); TLS is its successor (TLS 1.2 2008, TLS 1.3 2018). Sits between application and TCP. Handshake authenticates server by certificate and agrees a session key |
| Transport | **HTTPS** | HTTP over TLS, **port 443** (HTTP is port 80); padlock in browser |
| Network | **IPsec** | Secures IP packets; used for VPNs |

**IPsec details**

| Part | Function |
|---|---|
| **AH** (Authentication Header, IP protocol 51) | Authentication + integrity of the packet; **no encryption** |
| **ESP** (Encapsulating Security Payload, IP protocol 50) | **Encryption (confidentiality)** + optional authentication |
| IKE | Negotiates keys and security associations (SA) |
| **Transport mode** | Protects only the **payload**; original IP header kept; host-to-host |
| **Tunnel mode** | Protects the **entire original IP packet** inside a new IP header; gateway-to-gateway (site-to-site VPN) |

**VPN (Virtual Private Network)**: a private, encrypted "tunnel" over the public Internet (IPsec, SSL/TLS VPN). Types: remote-access and site-to-site.

---

## 8. Firewalls, DMZ, IDS/IPS ⭐ Asked in DSSSB (syllabus)

A **firewall** is hardware or software that sits between a **trusted internal network and an untrusted network (Internet)** and allows or blocks traffic according to rules.

| Firewall type | Works at | How it decides |
|---|---|---|
| **Packet filtering** | Network (+ transport) layer | Checks each packet's source/destination IP, port, protocol against an ACL; **stateless**; fast, cheap |
| **Stateful inspection** | Network/transport | Remembers connection state (state table); allows replies only to connections started inside |
| **Application-level gateway (proxy)** | Application layer | Acts as a proxy for specific applications (HTTP, FTP); inspects content; slowest but most secure |
| **Circuit-level gateway** | Session layer (TCP) | Checks the TCP handshake/session is legitimate, then relays without inspecting content (e.g. SOCKS) |
| **NGFW (Next-Generation Firewall)** | Layers 3–7 | Stateful + deep packet inspection + application awareness + built-in IPS |

- **DMZ (demilitarised zone)**: a separate network segment between the Internet and the internal LAN that holds **public servers** (web, mail, DNS). If a DMZ server is hacked, the internal LAN is still protected.
- **Bastion host**: a hardened computer exposed to the Internet (often in the DMZ).

| IDS (Intrusion Detection System) | IPS (Intrusion Prevention System) |
|---|---|
| **Detects and alerts** (passive monitor) | **Detects and blocks** (sits inline) |
| Works on a copy of traffic | Traffic passes through it |
| Types: NIDS (network) / HIDS (host); signature-based / anomaly-based | Same detection methods; can drop packets, reset connections |

---

## 9. Internet & web basics ⭐ Asked in DSSSB

### History timeline

| Year | Event |
|---|---|
| 1969 | **ARPANET** (US Department of Defense, ARPA) — first 4 nodes: UCLA, SRI, UCSB, Utah |
| 1971 | E-mail with "@" (Ray Tomlinson) |
| 1974 | Vint Cerf & Bob Kahn publish TCP design ("fathers of the Internet") |
| **1 Jan 1983** | ARPANET switches to **TCP/IP** — birth of the modern Internet; DNS designed 1983 |
| **1989** | **Tim Berners-Lee** proposes the **World Wide Web** at **CERN** (Geneva) |
| 1990–91 | First web browser/editor (WorldWideWeb), first web server and first website; WWW opened to public in 1991 |
| 1993 | Mosaic — first popular graphical browser |
| 1995 | Public Internet in India by **VSNL** (15 August 1995) |

### Internet vs WWW

| Internet | World Wide Web |
|---|---|
| Global **network of networks** (hardware + TCP/IP) | A **service** running on the Internet: linked hypertext documents |
| Started 1969 (ARPANET) | Started 1989–91 (Berners-Lee) |
| Carries e-mail, FTP, VoIP, WWW, etc. | Uses HTTP, HTML, URLs, browsers |

**Intranet** = private network of an organisation using Internet technology; **extranet** = an intranet partly opened to trusted outsiders (suppliers, partners).

### Essentials to connect to the Internet ⭐ Asked in DSSSB

1. A **device** (computer/phone)
2. **NIC or modem** (network interface hardware)
3. An **ISP** (Internet Service Provider) account and connection
4. **TCP/IP** protocol software
5. A **web browser** (or other client software)

DSSSB answer pattern: "the most essential components a computer uses for communication over Internet" = **NIC and TCP/IP** (not monitor, keyboard, mouse, camera).

**Purpose of internetworking** ⭐ Asked in DSSSB: networks are interconnected so that computers on different networks can **communicate (exchange messages)** and **share resources**. Official answer: "**Messages for communication**".

### ISP tiers

| Tier | Role |
|---|---|
| Tier 1 | Global backbone; reaches every network by settlement-free peering; pays no one for transit |
| Tier 2 | National/regional; peers with some, buys transit from Tier 1 |
| Tier 3 | Local access ISPs that sell connections to homes and offices; buy transit from upper tiers |

Exchange points where ISPs connect: **IXP** (Internet Exchange Point), e.g. NIXI in India.

### Connection types

| Type | Medium / key point |
|---|---|
| Dial-up | Telephone line + modem; max **56 kbps**; line busy while online |
| DSL / ADSL | Telephone copper line, always on; ADSL = download faster than upload |
| ISDN | Digital telephone line; BRI = 2B + D = 128 kbps data |
| Cable | Coaxial cable-TV network + cable modem; shared bandwidth |
| Fibre / FTTH | Optical fibre to the home; highest speeds (100 Mbps–Gbps) |
| Leased line | Dedicated point-to-point line, symmetric, guaranteed bandwidth; costly |
| Mobile 3G/4G/5G | Cellular data; hotspot/tethering |
| Satellite | Anywhere coverage; high latency (GEO); e.g. Starlink LEO lowers latency |
| Wi-Fi / WiMAX | Wireless LAN / wireless MAN access |

### URL structure

`https://www.example.com:443/notes/index.html?id=5#top`

| Part | Name |
|---|---|
| `https` | scheme / protocol |
| `www.example.com` | host (domain name) |
| `:443` | port (optional; default 80 for http, 443 for https) |
| `/notes/index.html` | path (file on the server) |
| `?id=5` | query string |
| `#top` | fragment (part of the page) |

URL = Uniform Resource Locator; URI = identifier (URL is a kind of URI).

### Domain names and TLDs

- Read **right to left**: `www.du.ac.in` → TLD `.in`, second level `.ac`, then `du`, host `www`. Full name = **FQDN**.
- **DNS** (port 53) translates domain names to IP addresses. **ICANN/IANA** manage the root; registrars sell names.

| TLD type | Examples |
|---|---|
| Generic (gTLD) | .com (commercial), .org (organisations), .net (network), .edu (US education), .gov (government), .mil (US military), .int (international bodies), .info, .biz |
| Country code (ccTLD) | .in India, .uk, .us, .jp, .au |
| New gTLDs | .app, .online, .shop |

### Browser vs server vs search engine

| Term | What it is | Examples |
|---|---|---|
| **Web browser** | Client software that requests and displays web pages | Chrome, Firefox, Edge, Safari, Opera |
| **Web server** | Computer/software that stores sites and answers HTTP requests | Apache, Nginx, Microsoft IIS |
| **Search engine** | A website that finds pages using crawlers (spiders), an index and ranking | Google, Bing, DuckDuckGo, Yahoo |

Trap: **Google Chrome is a browser; Google is a search engine.**

- **Web page**: one document on the Web (HTML). **Website**: a collection of related pages under one domain. **Home page**: first/main page of a site. **Web portal**: a gateway site offering many services in one place (e-mail, news, search) — e.g. Yahoo, India.gov.in. Static page = same for everyone; dynamic page = generated on request (PHP, JSP, ASP).
- **Web surfing / browsing** ⭐ Asked in DSSSB: the process of **visiting different websites** on the Internet (hosted by companies, organisations, institutions, individuals), usually by following hyperlinks. Searching = using a search engine for specific information.
- **Hypertext**: text containing links to other text. **Hyperlink**: the clickable link itself. Hypermedia = links in images, audio, video.
- **HTML** (HyperText Markup Language): tag language to create web pages (Berners-Lee). **HTTP** (HyperText Transfer Protocol): **stateless** request–response protocol between browser and server, port 80.
- **Cookie**: a small text file a **web server stores in the browser** to remember state (login, cart, preferences). Session cookie (deleted when browser closes) vs persistent cookie; first-party vs third-party (tracking).
- **Cache**: local copy of recently visited pages/images kept by the browser (or a proxy) to load pages faster.

### E-mail

- Address format: **username@domain** e.g. `ravi@gmail.com`.
- **E-mail client** (Outlook, Thunderbird) — software on the device; **webmail** (Gmail, Yahoo Mail in a browser).
- Protocols: **SMTP** (send, port 25), **POP3** (download, port 110), **IMAP** (keep on server, sync, port 143); **MIME** allows attachments and non-text data.
- **To** = main recipient; **CC** (carbon copy) = copy, visible to all; **BCC** (blind carbon copy) = copy, hidden from other recipients.
- **Attachment**: a file sent along with the mail. **Spam**: unsolicited bulk e-mail.

### Other Internet services

| Service | One line |
|---|---|
| Chat / instant messaging | Real-time text messaging (WhatsApp, IRC historically) |
| **VoIP** | Voice calls carried as IP packets (Skype, WhatsApp call); protocols SIP, RTP |
| Video conferencing | Real-time audio + video among several users (Zoom, Google Meet) |
| FTP | File transfer, ports 20 (data) and 21 (control) |
| Telnet / SSH | Remote login (23 insecure / 22 secure) |
| Blog, wiki, social media | User-generated content |

### E-commerce models

| Model | Example |
|---|---|
| **B2B** (Business to Business) | Manufacturer selling to retailers (IndiaMART, Alibaba) |
| **B2C** (Business to Consumer) | Online shop selling to you (Amazon, Flipkart) |
| **C2C** (Consumer to Consumer) | People selling to people (OLX, eBay) |
| **C2B** (Consumer to Business) | Individuals selling to businesses (freelancers, stock photographers) |
| B2G / G2C | Business/government models (GeM, online tax filing) |

### Internet of Things (IoT)

The **Internet of Things** is the network of everyday physical objects — sensors, smart meters, wearables, home appliances, vehicles, industrial machines — fitted with electronics, software and connectivity so that they collect and exchange data and can be controlled over the Internet without constant human involvement. It uses low-power links such as Zigbee, Bluetooth Low Energy, Wi-Fi, NB-IoT and 5G, lightweight protocols such as MQTT and CoAP, and usually IPv6 for its huge address space. Examples: smart homes, smart cities, health monitors, precision agriculture. Main concerns: security, privacy and power.

---

## Exam traps

1. **Authentication ≠ authorisation.** Authentication verifies identity; authorisation grants permissions. Integrity = data not changed; confidentiality = secrecy.
2. The input to encryption is **plaintext**, not ciphertext. "Information transformed during encryption" = plaintext.
3. **Transposition** keeps the same letters (only reorders); substitution changes the letters. A one-time pad is a substitution-type cipher.
4. **3DES key length = 168 bits** (3 × 56); 56 bits is single DES; 112 bits is two-key 3DES or the effective strength. Do not pick 46 or 32.
5. **RC4 is symmetric** (a stream cipher), even though Rivest also co-invented RSA. RSA, DH, ECC, DSA, ElGamal are asymmetric.
6. **Diffie–Hellman** exchanges keys only — it does not encrypt messages or make signatures. DSA signs only.
7. Signature: **sender's private key** signs. Confidentiality: **receiver's public key** encrypts. Never "sender's public key signs".
8. A digital signature does **not** give confidentiality; a MAC does **not** give non-repudiation.
9. Hashes use **no key**; MD5 = 128 bits, SHA-1 = 160 bits (not the reverse).
10. **AH gives no encryption**; ESP does. Tunnel mode encrypts the whole original packet.
11. A **worm** spreads by itself; a **virus** needs a host file; a **trojan** does not replicate.
12. **Internet ≠ WWW**; Tim Berners-Lee invented the WWW (1989), not the Internet. A browser is not a search engine.

## One-liners for revision

1. CIA = Confidentiality, Integrity, Availability.
2. Authentication = verifying a user's identity. ⭐
3. AAA = Authentication, Authorisation, Accounting.
4. Non-repudiation is provided by digital signatures.
5. Passive attacks: eavesdropping (release of contents) and traffic analysis.
6. Active attacks: masquerade, replay, modification, denial of service.
7. DDoS usually uses a botnet of zombie computers.
8. Ransomware encrypts files and demands payment.
9. Rootkit hides malware and gives secret root access.
10. Phishing = fake e-mail/site to steal credentials.
11. SQL injection attacks databases through input fields; XSS injects scripts into web pages.
12. Plaintext → encryption → ciphertext. ⭐
13. Caesar cipher shifts letters by 3.
14. Vigenère is polyalphabetic; Playfair encrypts digraphs in a 5×5 grid.
15. Transposition reorders letters without disguising them. ⭐
16. One-time pad is theoretically unbreakable.
17. Symmetric = one shared key; asymmetric = public + private key pair.
18. DES: 56-bit key, 64-bit block, 16 rounds.
19. 3DES key length = 168 bits (effective 112). ⭐
20. AES: 128-bit block; 128/192/256-bit keys; 10/12/14 rounds.
21. IDEA uses a 128-bit key; Blowfish 32–448 bits.
22. RC4 is a symmetric stream cipher (used in WEP).
23. RSA security rests on factoring large primes.
24. Diffie–Hellman (1976) is for key exchange.
25. Session key = temporary symmetric key for one session. ⭐
26. Symmetric keys needed for n users = n(n − 1)/2.
27. MD5 = 128-bit, SHA-1 = 160-bit, SHA-256 = 256-bit digest.
28. HMAC = hash + secret key.
29. Digital signature: sign with sender's private key, verify with sender's public key.
30. Certificates follow X.509 and are issued by a CA.
31. HTTPS = HTTP over TLS, port 443.
32. IPsec AH = authentication only; ESP = encryption.
33. PGP and S/MIME secure e-mail.
34. Packet-filtering firewall checks IP addresses and ports; proxy firewall works at the application layer.
35. DMZ holds public servers between the Internet and the LAN.
36. IDS detects and alerts; IPS detects and blocks.
37. ARPANET 1969; TCP/IP on 1 January 1983; WWW 1989 at CERN by Tim Berners-Lee.
38. Essentials for Internet communication: NIC and TCP/IP (plus ISP, browser). ⭐
39. Web surfing = visiting different websites on the Internet. ⭐
40. Purpose of internetworking = messages for communication and resource sharing. ⭐

## Quick self-check

1. Which security service verifies a user's identity? — **Authentication.**
2. What is the key length of Triple DES? — **168 bits** (3 × 56; effective strength 112 bits).
3. Which is NOT symmetric: AES, RC4, RSA, DES? — **RSA.**
4. Which cipher reorders letters but does not disguise them? — **Transposition.**
5. Encrypt HELLO with a Caesar shift of 3. — **KHOOR.**
6. The temporary key used to encrypt communication between end systems is called? — **Session key.**
7. To create a digital signature, which key is used? — **Sender's private key** (verified with sender's public key).
8. Which IPsec protocol provides encryption? — **ESP** (AH gives only authentication and integrity).
9. Which firewall type keeps a table of open connections? — **Stateful inspection firewall.**
10. Visiting different websites one after another on the Internet is called? — **Web surfing (browsing).**
