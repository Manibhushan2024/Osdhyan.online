# IT Tools & Emerging Technologies: DSSSB TGT CS Revision Notes

## 1. One-page summary

- Expect 6–10 questions: about half on MS Office (shortcuts, Excel functions and errors), the rest on cyber law, cyber crime, cloud, AI and Digital India.
- Excel output questions are the most "calculable" items: apply the function definition literally (COUNT counts numbers only, INT rounds down, ROUND with negative digits).
- For the IT Act, learn the section → offence pairs in the table and the three key dates (9 June 2000 assent, 17 October 2000 in force, 2008 amendment).

## 2. MS Word: shortcuts and features

| Shortcut | Action | Shortcut | Action |
|---|---|---|---|
| Ctrl + B / I / U | Bold / Italic / Underline | Ctrl + E / L / R / J | Centre / Left / Right / Justify |
| Ctrl + Z / Y | Undo / Redo (repeat) | Ctrl + F / H / G | Find / Replace / Go To |
| Ctrl + K | Insert hyperlink | Ctrl + Enter | Page break |
| Shift + Enter | Line break | Shift + F3 | Change case |
| F7 | Spelling & Grammar | Shift + F7 | Thesaurus |
| F12 | Save As | Ctrl + S / O / N / P | Save / Open / New / Print |
| Ctrl + = | Subscript (H₂O) | Ctrl + Shift + = | Superscript (x²) |
| Ctrl + ] / [ | Font size +1 / −1 pt | Ctrl + 1 / 2 / 5 | Single / double / 1.5 line spacing |
| Ctrl + M | Increase indent | Ctrl + Shift + E | Track Changes on/off |
| Ctrl + D | Font dialog | Ctrl + Shift + C / V | Copy / paste formatting |

- Extensions: .docx (document), .docm (macro-enabled), .dotx (template), .doc (Word 97–2003).
- Mail Merge = main document + data source → personalised letters, labels or envelopes.
- Format Painter copies formatting (double-click to reuse). Track Changes records reviewers' edits; Comments add notes.
- Widow/orphan control stops a single line of a paragraph being stranded at the top or bottom of a page.
- Also know: section breaks, drop cap, watermark, table of contents (from heading styles), macros.

## 3. MS Excel: functions, errors and shortcuts

| Function | Returns | Example → result |
|---|---|---|
| SUM, AVERAGE, MAX, MIN | Total, mean, largest, smallest | =AVERAGE(4,6,8) → 6 |
| COUNT | Cells with numbers only | 10, "Delhi", blank, 25, 0 → 3 |
| COUNTA | Non-empty cells | same range → 4 |
| COUNTBLANK | Empty cells | same range → 1 |
| COUNTIF / SUMIF | Count / sum meeting a condition | =SUMIF(A1:A5,">50") on 40,60,75,50,90 → 225 |
| IF | Value based on a test | =IF(B2>=33,"Pass","Fail") |
| VLOOKUP(value, table, col, FALSE) | Looks down the first column; FALSE = exact match | Not found → #N/A |
| HLOOKUP | Looks across the first row | — |
| ROUND(x, n) | Rounds; negative n rounds left of decimal | =ROUND(1234.567,-2) → 1200 |
| INT | Rounds down to an integer | =INT(-7.4) → −8 (TRUNC gives −7) |
| MOD(a, b) | Remainder | =MOD(29,6) → 5 |
| LEFT / RIGHT / MID | Sub-strings | =MID("COMPUTER",4,3) → PUT |
| LEN / TRIM / UPPER / PROPER | Length / remove extra spaces / caps / Title Case | =LEN("DSSSB") → 5 |
| CONCATENATE or & | Joins text | ="TGT"&"CS" → TGTCS |
| TODAY() / NOW() | Date / date and time | Volatile, update on recalculation |
| ABS, SQRT, POWER, RANK, AND, OR, IFERROR | As named | =POWER(2,5) → 32 |

| Error | Cause |
|---|---|
| #DIV/0! | Division by zero or blank |
| #N/A | Lookup value not found |
| #NAME? | Misspelt function or undefined name (=SUMM) |
| #REF! | Reference to a deleted cell |
| #VALUE! | Wrong data type (text in arithmetic) |
| #NUM! | Invalid number (e.g. =SQRT(-4)) |
| ##### | Column too narrow |

- References: A1 relative, $A$1 absolute, $A1 / A$1 mixed. F4 cycles through them. Copying =$A1+B$1 from C2 to D4 gives =$A3+C$1.
- Shortcuts: Alt + = AutoSum; Ctrl + ; date; Ctrl + Shift + ; time; F2 edit cell; Ctrl + 1 Format Cells; Ctrl + D / R fill down / right; Alt + Enter new line in a cell; F11 chart on a new sheet, Alt + F1 embedded chart; Shift + F11 new sheet; Ctrl + Home → A1; Ctrl + Shift + L filter.
- Limits (2007+): 1,048,576 rows × 16,384 columns (last column XFD). Default extension .xlsx; macro-enabled .xlsm.
- Tools: Freeze Panes, Conditional Formatting, Data Validation, Pivot Table (summarise), Goal Seek (What-If: find input for a desired result), Filter and Sort, charts.

## 4. MS PowerPoint

- F5 = show from the beginning; Shift + F5 = from the current slide; Esc ends the show; B / W = black / white screen; Ctrl + M = new slide.
- Views: Normal, Outline, Slide Sorter (rearrange thumbnails), Notes Page, Reading view, Slide Show.
- Transition = effect between slides; animation = effect on an object within a slide.
- Slide Master controls the design of all slides. Rehearse Timings records time per slide. Custom Show selects a subset of slides.
- Extensions: .pptx (presentation), .ppsx (opens directly as a show), .potx (template), .pptm (macros).

## 5. Cyber security and cyber crime

- Malware: virus (needs a host file), worm (self-replicates over networks), Trojan (disguised as useful software), ransomware (encrypts and demands payment, e.g. WannaCry 2017), spyware/keylogger (records keystrokes), adware, rootkit, botnet.
- Social engineering: phishing (e-mail/web), smishing (SMS), vishing (voice call), pharming (DNS poisoning redirects a correct URL), spoofing.
- Attacks: DoS/DDoS, man-in-the-middle, SQL injection, salami attack, cyber stalking, cyber squatting, identity theft.
- Defences: strong passwords, two-factor authentication (password + OTP), updates/patches, antivirus, firewall, backups, HTTPS.
- Reporting in India: helpline **1930** and portal **cybercrime.gov.in** (MHA). CERT-In handles incident response (Section 70B).

## 6. IT Act 2000: key sections

| Section | Subject | Punishment (headline) |
|---|---|---|
| 3 / 4 / 5 | Authentication by digital signature / legal recognition of e-records / of e-signatures | — |
| 43 | Penalty and compensation for unauthorised access, damage, virus | Compensation |
| 43A | Body corporate failing to protect sensitive personal data | Compensation |
| 65 | Tampering with computer source documents | Up to 3 yrs or ₹2 lakh or both |
| 66 | Computer-related offences (dishonest acts of Sec 43) | Up to 3 yrs or ₹5 lakh or both |
| 66A | Offensive messages | Struck down: Shreya Singhal (2015) |
| 66B | Receiving stolen computer resource | Up to 3 yrs or ₹1 lakh or both |
| 66C | Identity theft (password, e-signature misuse) | Up to 3 yrs and ₹1 lakh |
| 66D | Cheating by personation using a computer | Up to 3 yrs and ₹1 lakh |
| 66E | Violation of privacy (private images) | Up to 3 yrs or ₹2 lakh or both |
| 66F | Cyber terrorism | Up to life imprisonment |
| 67 / 67A / 67B | Obscene / sexually explicit / child sexual abuse material | 3–7 yrs and fines |
| 69 / 69A | Interception and decryption / blocking public access | — |
| 70 / 70A / 70B | Protected systems / NCIIPC / CERT-In | — |
| 72 | Breach of confidentiality and privacy | Up to 2 yrs or ₹1 lakh or both |
| 79 | Safe harbour for intermediaries | — |

- Assent 9 June 2000; in force 17 October 2000; based on the UNCITRAL Model Law on E-Commerce (1996). Originally 94 sections in 13 chapters.
- IT (Amendment) Act 2008 (in force 27 October 2009) added 66A–66F, 67A–67B, 43A, 70B. The Digital Personal Data Protection Act, 2023 now governs personal data.

## 7. Emerging technologies

| Topic | Must-know facts |
|---|---|
| Cloud | IaaS (AWS EC2: VMs, storage), PaaS (Google App Engine, Heroku), SaaS (Gmail, Google Docs, Microsoft 365). Public / private / hybrid / community. NIST traits: on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service. GoI cloud = MeghRaj. |
| AI / ML | Turing Test (1950); "AI" coined by John McCarthy (Dartmouth, 1956). Supervised (labelled: classification, regression), unsupervised (clustering), reinforcement (rewards). Overfitting = great on training, poor on test. NLP, computer vision, generative AI. IndiaAI Mission (March 2024, ≈ ₹10,372 crore). |
| IoT | Term by Kevin Ashton (1999). Sensors sense, actuators act. Protocols: MQTT, CoAP; RFID, Zigbee. Examples: smart meters, smart homes, wearables. |
| Big data | Volume, Velocity, Variety (+ Veracity, Value). Hadoop = HDFS + MapReduce; NoSQL databases. Unstructured data: video, images, free text. |
| Blockchain | Distributed, immutable ledger; each block holds the hash of the previous block. Bitcoin by Satoshi Nakamoto (2008–09). Consensus: Proof of Work / Proof of Stake. Smart contracts (Ethereum). |

## 8. Digital India and e-governance

- Digital India launched 1 July 2015; three vision areas and nine pillars. NeGP (2006) → e-Kranti (NeGP 2.0).
- Aadhaar: 12-digit number by UIDAI (Aadhaar Act 2016). UPI (2016) and BHIM by NPCI. DigiLocker: authentic digital documents (MeitY). UMANG (2017): one app for many services.
- BharatNet: optical-fibre broadband to Gram Panchayats. GeM (2016): public procurement portal. CSCs: village service points. MyGov: citizen participation. DIKSHA, SWAYAM, e-Pathshala: education.
- E-governance models: G2C (citizen certificates), G2B (GST filing, e-procurement), G2G (inter-department data), G2E (employee services).

## 9. Frequently asked in DSSSB

- Word/Excel shortcut identification (Ctrl + E, Ctrl + H, F7, Shift + F5, Alt + =, Ctrl + ;).
- Excel output questions: COUNT vs COUNTA, MID, ROUND, INT, MOD, SUMIF, copied formulas with $.
- Excel error values and their causes.
- IT Act: year and date, section numbers of 66, 66A, 66C, 66F, 67, 43.
- IaaS/PaaS/SaaS identification from an example; types of ML; full forms (UPI, UIDAI, NPCI, UMANG, IoT).

## 10. Fifteen one-liners

1. Ctrl + E centres text; Ctrl + J justifies.
2. Shift + F7 opens the Thesaurus in Word.
3. Every Excel formula starts with =.
4. $A$1 is absolute, A1 relative, $A1 mixed.
5. COUNT counts only numbers; COUNTA counts all non-empty cells.
6. #NAME? means a misspelt function; #DIV/0! means division by zero.
7. VLOOKUP's FALSE argument means exact match.
8. Shift + F5 starts a slide show from the current slide.
9. The IT Act came into force on 17 October 2000.
10. Section 66C = identity theft; 66D = cheating by personation; 66F = cyber terrorism.
11. Section 66A was struck down in Shreya Singhal v. Union of India (2015).
12. Gmail is SaaS; AWS EC2 is IaaS; Google App Engine is PaaS.
13. Labelled training data means supervised learning.
14. Aadhaar has 12 digits and is issued by UIDAI; UPI is run by NPCI.
15. A worm spreads by itself; a virus needs a host file.

## 11. Five traps

1. **INT vs TRUNC for negatives.** INT(−7.4) = −8, not −7.
2. **COUNT ignores text but counts 0.** Zero is a number; a blank is not.
3. **Assent vs commencement.** The IT Act got assent on 9 June 2000 but came into force on 17 October 2000.
4. **66A is no longer law.** Any option punishing "offensive messages" under 66A today is wrong.
5. **Phishing vs pharming.** Phishing lures you to click a fake link; pharming redirects you even when you type the correct address.
