# IT Tools & Emerging Technologies

**In 30 seconds**
- About 8 questions per paper. DSSSB asks **MIS, knowledge management, e-commerce, business/accounting/economics basics and cyber law** far more than Office shortcuts. Learn the ⭐ rows first.
- MIS: information quality, the three levels of information (strategic/tactical/operational) and the components (people, hardware, software, data, procedures).
- KM: tacit vs explicit, the KM process (acquire → refine → store → share → apply), Wiig's three viewpoints, build/buy/outsource.
- E-commerce: B2B/B2C/C2C (OLX = C2C), five revenue models, primary processes, father of Indian e-commerce = K. Vaitheeswaran.
- Business basics: sole proprietorship is the commonest form; company = limited liability; public company ≥ 7 members, private ≥ 2, OPC = 1.
- Cyber law: IT Act 2000 (amended 2008), DPDP Act 2023 (child = under 18; penalty up to ₹250 crore), IPR belongs to the creator for a fixed term, E-Waste Rules 2016/2022.
- AI: ANI acts smart without awareness; AGI thinks like a human; ASI is smarter than humans. Many AI models are "black boxes". IoT's top challenge = security.
- Five official keys in this chapter look wrong (marked "Key doubt"): learn the textbook answer.

## 1. MS Office (compact)

### Word
| Shortcut | Action | Shortcut | Action |
|---|---|---|---|
| Ctrl+B / I / U | Bold / Italic / Underline | Ctrl+E / J | Centre / Justify |
| Ctrl+L / R | Align left / right | Ctrl+Z / Y | Undo / Redo |
| Ctrl+F / H | Find / Replace | Ctrl+K | Insert hyperlink |
| Ctrl+P / N / S | Print / New / Save | F7 | Spelling & Grammar |
| Shift+F3 | Change case | Shift+F7 | Thesaurus |
| F12 | Save As | Ctrl+Enter | Page break |

| Feature | What it does |
|---|---|
| Mail merge | Main document + data source → personalised letters, labels, envelopes |
| Track changes | Records insertions/deletions for review (Review tab) |
| Styles | Named formatting sets (Heading 1…); basis for the TOC |
| Header / footer | Repeated text at top / bottom of every page (page numbers) |
| Table of contents | Generated automatically from heading styles |

### Excel
- Cell = one box (B3); range = block (A1:C5); every formula starts with `=`.
- References: A1 relative (changes when copied), **$A$1 absolute** (fixed), $A1 / A$1 mixed. F4 cycles them.
- Excel 2007+: **1,048,576 rows × 16,384 columns** (last column XFD). Excel 2003: 65,536 × 256.

| Function | Returns | Example → result |
|---|---|---|
| SUM / AVERAGE | Total / mean | =AVERAGE(4,6,8) → 6 |
| MAX / MIN | Largest / smallest | =MAX(3,9,2) → 9 |
| COUNT | Cells containing numbers | 10, "Delhi", blank, 25, 0 → 3 |
| COUNTA | Non-empty cells | same range → 4 |
| COUNTIF | Count meeting a condition | 40,60,75,50,90 with ">=50" → 4 |
| SUMIF | Sum meeting a condition | same with ">50" → 225 |
| IF | Value by a test | =IF(B2>=33,"Pass","Fail") |
| VLOOKUP / HLOOKUP | Look down first column / across first row | not found → #N/A |
| ROUND(x,n) | Rounds to n digits | =ROUND(1234.567,-2) → 1200 |
| LEN | Number of characters | =LEN("DSSSB") → 5 |
| CONCATENATE / & | Joins text | ="TGT"&"CS" → TGTCS |
| NOW() / TODAY() | Date-time / date | update on recalculation |
| PMT(rate,nper,pv) | Loan instalment | =PMT(10%/12,12,100000) → −8,791.59 |

| Error | Cause |
|---|---|
| #DIV/0! | Division by zero or blank |
| #N/A | Lookup value not available |
| #REF! | Reference to a deleted cell |
| #VALUE! | Wrong data type (text in arithmetic) |
| #NAME? | Misspelt function or unknown name |

- Shortcuts: Ctrl+; date, Ctrl+Shift+; time, F2 edit cell, F4 toggle $/repeat, Ctrl+arrow jump to edge of data, Alt+= AutoSum, F11 chart sheet.
- Tools: charts (column, line, pie), **pivot table** (summarise large data), filter (show matching rows), sort, conditional formatting, Goal Seek.

### PowerPoint
- Views: Normal, Outline, Slide Sorter, Notes Page, Reading, Slide Show.
- **Slide master** sets the design of all slides. **Transition** = effect between slides; **animation** = effect on an object within a slide.
- F5 = show from first slide; Shift+F5 = from current slide; Esc ends.

| Extension | File | Extension | File |
|---|---|---|---|
| .docx / .dotx | Word document / template | .xlsx / .xlsm | Workbook / macro-enabled |
| .pptx | Presentation | .ppsx | Opens directly as a show |
| .potx | PPT template | .pdf / .csv | Portable document / comma-separated text |

## 2. Information systems ⭐ Asked in DSSSB

- **Information system** ⭐ = interrelated components that collect, process, store and distribute information to support decision-making and control (Laudon).

| Term | Meaning | Example |
|---|---|---|
| Data ⭐ | Raw facts | 72, 85, 64 |
| Information ⭐ | Processed, meaningful data | Class average = 73.7 |
| Knowledge ⭐ | Expertise and skills from experience or education; understanding of how to use information | "Weak students need remedial classes" |

### Information quality ⭐ (Wang–Strong categories)
| Category | Dimensions |
|---|---|
| Intrinsic | Accuracy, objectivity, believability |
| Contextual | Relevance, timeliness, completeness, value-added |
| **Representational** ⭐ | Interpretability, format, coherence (consistency), compatibility |
| Accessibility | Ease of access, security |
- Value ⭐ is the qualitative measure hardest to quantify precisely.

### Levels of information / management ⭐
| Level | Who | Horizon | Nature |
|---|---|---|---|
| **Strategic** ⭐ | Top management | Long-term policy, objectives and checking whether they are met | Summarised, external, unstructured |
| Tactical | Middle management | Medium-term, resource allocation | Semi-structured |
| Operational | Supervisors | Day-to-day | Detailed, internal, structured |

### Types of information systems ⭐
| System | Serves | Purpose |
|---|---|---|
| TPS | Operational staff | Records routine transactions (payroll, billing) |
| **MIS** ⭐ | Middle managers | Planned system of collecting, storing and disseminating data as information for management functions; periodic reports |
| **DSS** ⭐ | Middle/senior managers | Improves decision-making for semi-structured problems ("what-if") |
| EIS / ESS | Top executives | Strategic, summarised dashboards |
| **OAS** ⭐ | Office staff | Word processing, e-filing, e-mail, message switching, data storage, voice/data communication |
| ES | Specialists | Captures an expert's knowledge as rules (inference engine + knowledge base) |
| KMS | Knowledge workers | Creates, stores, shares knowledge |

- **MIS components** ⭐: people, hardware, software, data, procedures (plus network). "Education procedures" is NOT a component.
- MIS = Management + Information + System. **Organisation** ⭐ = the formal social unit devoted to attaining specified goals.
- **Business-system characteristics** ⭐: interdependence (parts interact and depend on each other), complexity, goal-orientation, adaptability, hierarchy, boundary/environment.
- **Operations research** ⭐ = applied mathematics for decision-making (LP, queuing, game theory, simulation); began in WWII Britain.
- **Exploratory data analysis** ⭐ (John Tukey, 1977): visual, open-ended look at data (histogram, box plot, scatter). Advantage = **flexible ways to generate hypotheses**; drawback = no definitive answers.

## 3. Knowledge management ⭐ Asked in DSSSB

- **KM** ⭐ = set of processes developed in an organisation to create, gather, store, transfer and apply knowledge.

| Tacit ⭐ | Explicit |
|---|---|
| In people's heads; from individual/shared experience | Written, codified |
| Hard to transfer (skills, intuition) | Easy to store and share (manuals, databases) |

- Nonaka's SECI: Socialisation (tacit→tacit), Externalisation (tacit→explicit), Combination (explicit→explicit), Internalisation (explicit→tacit).

### KM process ⭐
| Step | Activity |
|---|---|
| Create / acquire (gather) | Capture knowledge from experts, documents |
| **Refine** ⭐ | Add value: discover relationships, abstract, synthesise, share |
| Organise / store | Classify and store in a repository |
| Share / transfer | Distribute to those who need it |
| Apply | Use it in decisions and work |

### KM viewpoints ⭐ (Wiig)
| Viewpoint | Focus |
|---|---|
| Business | Why and to what extent to invest in knowledge |
| **Management** ⭐ | Determining, organising, directing, facilitating and monitoring knowledge practices to meet business goals |
| Hands-on operational | Applying expertise to do the actual work |

- **Purpose of KMS** ⭐: driving strategy, starting new lines of business, solving problems faster, developing skills, integration, sharing knowledge. **Portability is NOT** (it is a software quality).

### KM system development options ⭐
| Option | Note |
|---|---|
| **In-house (build)** ⭐ | Uses own IT staff; DSSSB key: lowest cost |
| Off-the-shelf (buy) | Quick, but licence + customisation cost |
| Outsourcing | External firm builds; vendor margin |
| End-user development | Cheap to start, poorly integrated |

- **Best practices** ⭐ = an organisation's or industry's most successful solutions or problem-solving methods. *Key doubt*: official key said "knowledge management"; textbook (Laudon) answer is **best practices**.
- **Types of knowledge business** ⭐: expert-driven, experience-driven, efficiency-driven. "Expense-driven" is NOT a type.
- **Workers** ⭐ (Laudon): knowledge workers (engineers, scientists, architects: create knowledge), data workers (clerks, secretaries: process data), production/service workers.

## 4. E-commerce ⭐ Asked in DSSSB

- **E-commerce** = buying and selling goods and services over electronic networks, mainly the Internet.

| Year | Milestone ⭐ |
|---|---|
| 1960s–70s | EDI between businesses |
| 1979 | Michael Aldrich demonstrates online shopping (UK) |
| 1995 | Amazon (bookstore) and eBay (auction) go live |
| 1999 | K. Vaitheeswaran co-founds Fabmart — "father of e-commerce in India" ⭐ |
| 2002 | IRCTC online rail ticketing |
| 2007 | Flipkart founded |

### Models ⭐
| Model | Meaning | Example |
|---|---|---|
| B2B | Business ↔ business | IndiaMART, Alibaba |
| B2C | Business → consumer | Amazon, Flipkart |
| **C2C** ⭐ | Consumer ↔ consumer | **OLX**, eBay auctions |
| C2B | Consumer → business | Freelancers, Upwork |
| B2G / G2C | Business → govt / govt → citizen | GeM / DigiLocker, passport |
| M-commerce | Via mobile devices | Paytm, app shopping |

### Revenue models ⭐ (Laudon)
| Model | Earns from |
|---|---|
| Advertising | Ads shown to visitors (Google, YouTube) |
| **Subscription** ⭐ | Fixed sum paid monthly/quarterly/annually (Netflix) |
| Transaction fee | Commission per transaction (eBay) |
| Sales | Selling goods/services (Amazon retail) |
| Affiliate | Commission for referrals |

- **Primary processes** ⭐: information/pre-sales → contract conclusion (ordering) → billing/payment → **delivery/fulfilment** ⭐ (packing, loading, shipping) → service/support.
- **Stakeholders** ⭐: B = business organisations (producers ⭐, sellers, intermediaries), C = consumers, G = government.
- Payments: UPI (NPCI, 2016), debit/credit cards, wallets (Paytm), net banking, cash on delivery.
- **EDI** = computer-to-computer exchange of business documents in a standard format.
- Advantages: 24×7, wide reach, low cost, easy comparison. Disadvantages: fraud, privacy risk, no touch-and-feel, delivery delays.
- Digital marketing = promotion through search, social media, e-mail and online ads.

## 5. Business, accounting & economics basics ⭐ Asked in DSSSB

### Forms of business organisation ⭐
| Form | Owners | Liability | Key fact |
|---|---|---|---|
| **Sole proprietorship** ⭐ | 1 person carries on business by himself/herself | Unlimited | Most common form ⭐ |
| Partnership | 2 to 50 (Companies Rules 2014) | Unlimited | Indian Partnership Act 1932 |
| Private company | Min **2** ⭐, max 200 members | **Limited** ⭐ | Companies Act 2013 |
| Public company | Min **7** ⭐, no maximum | Limited | Shares freely transferable |
| One Person Company | **1** member | Limited | Companies Act 2013 |
| LLP | Min 2 partners | Limited | LLP Act 2008 |
| Cooperative society | Min 10 adults | Limited (usually) | Service motive |

| Term ⭐ | Meaning |
|---|---|
| **Trade** ⭐ | Fundamental business activity: sale and purchase of goods and services |
| **Commerce** ⭐ | Buying and selling, especially on a large scale, plus aids to trade (transport, banking, insurance) |
| Industry | Production/processing of goods |
| **Organisation structure** ⭐ | Establishes relationships between **people, work and resources** |

### Accounting ⭐
- **Financial accounting** ⭐ (AICPA): the art of recording, classifying and summarising, in money terms, transactions of a financial character, and interpreting the results.
- **Double entry** ⭐ (Luca Pacioli, 1494): every transaction has a **debit and a credit** of equal amount.

| Account type | Debit | Credit |
|---|---|---|
| Personal | The receiver | The giver |
| Real | What comes in | What goes out |
| Nominal | Expenses and losses | Incomes and gains |

- **Accounting cycle** ⭐ (textbook): Transactions → Journal → Ledger → Trial balance → Adjustment entries → Adjusted trial balance → **Financial statements → Closing entries**. *Key doubt*: the official key placed closing entries before financial statements.

| Term | Meaning |
|---|---|
| **Fixed assets** ⭐ | Long-term assets (land, building, machinery) |
| Current assets | Convertible to cash within a year (stock, debtors, cash) |
| **Drawings** ⭐ | Cash or goods taken by the owner for personal use |
| **Working capital** ⭐ | Current assets − current liabilities; funds day-to-day expenses |
| Final accounts | Trading A/c (gross profit), **Profit & Loss A/c (net profit)** ⭐, Balance sheet (position) |
| Net profit ⭐ | Gross profit − indirect expenses. Sales 8,00,000 − COGS 5,00,000 = GP 3,00,000; − expenses 1,80,000 = NP 1,20,000 |
| **Marginal revenue** ⭐ | ΔTotal revenue ÷ ΔQuantity. TR 500→540 as Q 10→12 gives MR = 20 |

### Economics ⭐
- **Demand** ⭐ = effective desire: desire + ability to pay + willingness to pay. *Key doubt*: official key said "Consumption".
- Law of demand: price ↑ → quantity demanded ↓ (other things equal).
- **Elasticity of demand** ⭐ measures the **degree** of response of quantity to price. Ed = %ΔQ ÷ %ΔP. Price +10%, quantity −20% → Ed = 2 (elastic).

| Type | Ed | Meaning |
|---|---|---|
| **Perfectly elastic** ⭐ | ∞ | Tiny price change → infinite change in quantity |
| Relatively elastic | > 1 | Luxuries |
| Unitary | = 1 | Proportionate change |
| Relatively inelastic | < 1 | Necessities |
| Perfectly inelastic | 0 | Quantity does not change |

- **Diminishing marginal utility** ⭐: as a consumer's stock of a commodity rises, its marginal utility falls.

### Demand forecasting ⭐
| Method | Detail |
|---|---|
| Consumer survey | Complete enumeration, sample survey, end-use |
| **Opinion survey** ⭐ | **Sales-force composite = collective opinion**, expert opinion, Delphi |
| Test marketing / market experiment | Try in a small market |
| Statistical (existing products) | Trend projection, regression, barometric |
| **New products** ⭐ (Joel Dean) | Evolutionary, substitute, growth curve, opinion polling, sales experience, vicarious approaches |

- Growth curve approach ⭐: new product's demand estimated from an existing product's growth. *Key doubt*: official key said "substitute".

| Inflation ⭐ | Meaning |
|---|---|
| **Demand-pull** ⭐ | Excess demand pulls prices up |
| Cost-push | Rising input costs (wages, oil) push prices up |
| Built-in | Wage–price spiral from expectations |
| Creeping / walking / galloping / hyper | Slow (about <3%) → moderate → very fast → out of control |

| Economic system ⭐ | Feature |
|---|---|
| **Capitalist** ⭐ | Free markets, private ownership, no government intervention |
| Socialist | State ownership and planning |
| Mixed | Both (India) |

- **Micro** ⭐ studies the individual unit (person, household, firm); **macro** studies the whole economy (GDP, inflation).

## 6. Cyber security & law ⭐ Asked in DSSSB

| Threat | What it is |
|---|---|
| Virus | Attaches to a host file; spreads when it runs |
| Worm | Self-replicates across networks, no host needed |
| Trojan | Malware disguised as useful software |
| Ransomware | Encrypts data, demands payment (WannaCry 2017) |
| Spyware | Secretly records activity (keyloggers) |
| Phishing | Fake e-mail/site to steal credentials |
| DDoS | Many machines flood a server |
| MITM | Attacker intercepts communication |
| Social engineering | Tricking people into revealing information |

- Protections: antivirus, firewall, two-factor authentication, regular backups, strong passwords, encryption, updates.

### IT Act 2000 ⭐ (assent 9 June 2000; in force 17 October 2000; amended 2008)
| Section | Subject | Punishment |
|---|---|---|
| 43 | Unauthorised access, damage, virus | Compensation |
| 65 | Tampering with source documents | Up to 3 yrs or ₹2 lakh or both |
| 66 | Computer-related offences | Up to 3 yrs or ₹5 lakh or both |
| 66C | Identity theft | Up to 3 yrs and up to ₹1 lakh |
| 66D | Cheating by personation | Up to 3 yrs and up to ₹1 lakh |
| 66E | Violation of privacy | Up to 3 yrs or ₹2 lakh or both |
| 66F | Cyber terrorism | Up to life imprisonment |
| 67 | Obscene material | First conviction up to 3 yrs and ₹5 lakh |
| 69 | Interception/decryption by government | Non-cooperation: up to 7 yrs |
| 70 | Protected systems | Up to 10 yrs |
| 72 | Breach of confidentiality | Up to 2 yrs or ₹1 lakh or both |

- 2008 amendment (in force 27 Oct 2009) added 43A, 66A–66F, 67A–67B, 70B (CERT-In). 66A struck down (Shreya Singhal, 2015).
- **Remedies** ⭐: compensation, fines and **imprisonment**; adjudicating officer (Sec 46, claims up to ₹5 crore); appeals now to TDSAT (Cyber Appellate Tribunal merged 2017). Apology is not a legal remedy.
- **CERT-In** (Sec 70B, MeitY): national incident response; cyber incidents must be reported within 6 hours (2022 directions).
- **Digital signature** (Sec 3): asymmetric crypto + hash; certificates from Certifying Authorities licensed by the CCA.
- **Cyber cells**: state police cyber cells; helpline 1930; cybercrime.gov.in; I4C (MHA).

### DPDP Act 2023 ⭐ (assent 11 August 2023)
| Term | Meaning |
|---|---|
| Data Principal | Person the data is about |
| Data Fiduciary | Decides purpose and means of processing |
| Data Processor | Processes on behalf of a fiduciary |
| **Child** ⭐ | Individual who has **not completed 18 years**; needs verifiable parental consent |
| Digital personal data | Personal data in digital form |
| Consent | Free, specific, informed, unambiguous; can be withdrawn |
| Data Protection Board of India | Adjudicates breaches |
| Penalty | Up to **₹250 crore** per breach (security safeguards failure) |

### IPR ⭐
- IPR enables the creator to earn **recognition or financial benefit** from a creation or invention (WIPO). *Key doubt*: official key said "Copyright"; the general answer is IPR.
- Rights go to the **creator/inventor** ⭐ unless assigned, and only for a **certain period** ⭐.

| Right | Protects | Term (India) |
|---|---|---|
| Copyright | Literary, artistic works, software code | Author's life + 60 years |
| Patent | Inventions | 20 years from filing |
| Trademark | Brand names, logos | 10 years, renewable |
| Design | Shape/appearance | 10 + 5 years |
| Trade secret | Confidential know-how | As long as kept secret |

### E-waste ⭐
- **E-waste** ⭐ = discarded or irreparable computers and electronic goods. Much of the developed world's e-waste is exported to developing countries such as **India** ⭐ for metal recovery.
- **E-Waste (Management) Rules 2016** ⭐: two categories — IT & telecom equipment, and consumer electrical & electronics; brought **CFLs and other mercury lamps** ⭐ in; **EPR** (Extended Producer Responsibility) and Producer Responsibility Organisations.
- **E-Waste Rules 2022** (in force 1 April 2023): wider list of items, EPR registration and certificates via a CPCB portal.
- Hazards: lead, mercury, cadmium, hexavalent chromium, brominated flame retardants. **Exposure variability** ⭐ depends mainly on the **type of e-waste** (and processing method).

### Social media, AI ethics & privacy ⭐
- Children's social-media sharing must be monitored ⭐; fake news and rumours can endanger law and order; addiction hurts studies.
- IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021 govern platforms.

| AI privacy concept ⭐ | Meaning |
|---|---|
| Data privacy | Trade-off between data collected and product performance |
| K-anonymity | How many records share a given attribute; each person hidden among k |
| L-diversity | Extends k-anonymity across several sensitive attributes |
| Black box ⭐ | Model whose reasoning cannot be explained; source of hidden bias |
| Deepfake | AI-faked media (a misuse, not a bias type) |

## 7. Emerging technologies ⭐

| Technology | Definition | Example | Key fact |
|---|---|---|---|
| Cloud | On-demand computing over the Internet | AWS, Azure, Google Cloud | IaaS (EC2), PaaS (App Engine), SaaS (Gmail); public/private/hybrid; GoI cloud = MeghRaj |
| AI ⭐ | Machines performing tasks needing intelligence | Chatbots, LLMs (ChatGPT) | "AI" coined by John McCarthy, 1956 |
| ML | Learning from data | Spam filter | Supervised (labelled), unsupervised (clustering), reinforcement (rewards) |
| Deep learning | Multi-layer neural networks | Image recognition | Needs large data and GPUs |
| NLP | Understanding human language | Translation, Bhashini | Base of chatbots/LLMs |
| IoT ⭐ | Everyday devices connected via Internet | Smart meters, wearables | Components: sensors, actuators, connectivity, cloud, app. Kevin Ashton, 1999 |
| Big data | Data too large for traditional tools | Social media logs | 5 Vs: volume, velocity, variety, veracity, value; Hadoop (HDFS + MapReduce), Spark (in-memory) |
| Blockchain | Distributed, immutable ledger of hashed blocks | Bitcoin (2009) | Consensus: PoW/PoS; smart contracts (Ethereum) |
| AR / VR | AR overlays digital on real; VR fully immersive | Pokémon Go / VR headset | MR mixes both |
| 5G | Fifth-generation mobile network | Jio, Airtel 5G | India launch 1 Oct 2022; very low latency |
| Edge computing | Processing near the data source | Self-driving cars | Cuts latency and bandwidth |
| Quantum | Qubits using superposition and entanglement | National Quantum Mission (2023) | Threat to today's encryption |
| Robotics / drones | Programmable machines / unmanned aircraft | Delivery drones | Drone Rules 2021 |

| AI category ⭐ | Description |
|---|---|
| ANI (narrow/weak) | Seems to act intelligently, but no awareness of what it does (Siri, chess) |
| AGI (general/strong) | Acts and thinks like a smart human, with consciousness |
| ASI (super) | Smarter than humans, if that is possible |

- AI issues ⭐: bias in training data, black-box opacity, privacy, deepfakes, job loss, accountability.
- **IoT challenges** ⭐: **security**, privacy, interoperability, power/battery, connectivity, scalability.

### Digital India & e-governance (Digital India launched 1 July 2015)
| Initiative | Purpose |
|---|---|
| DigiLocker | Cloud storage of authentic documents (MeitY) |
| UPI | Instant bank-to-bank payments (NPCI, 2016) |
| Aadhaar | 12-digit identity number (UIDAI) |
| UMANG | One app for many government services (2017) |
| BharatNet | Optical-fibre broadband to Gram Panchayats |
| e-Office | Paperless government file handling (NIC) |
| CSC | Common Service Centres: village e-service points |

## Exam traps
1. **Demand vs consumption**: "effective desire" = demand. Official key "Consumption" is a key doubt.
2. **Best practices vs KM**: an organisation's most successful solutions = best practices, not "knowledge management".
3. **Accounting cycle order**: financial statements come **before** closing entries.
4. **IPR vs copyright**: "recognition or financial benefit from creation *or invention*" = IPR in general.
5. **Growth curve vs substitute**: estimating from an existing product's growth = growth curve approach.
6. **Public 7, private 2, OPC 1**: don't swap them; partnership has unlimited liability.
7. **Representational vs intrinsic quality**: interpretability/format/coherence = representational; accuracy = intrinsic.
8. **OLX is C2C**, not B2C; Amazon retail is B2C.
9. **Child under DPDP** = not completed 18 years (not 16).
10. **Portability** is a software quality, not a KMS purpose; "expense-driven" is not a business type.

## One-liners for revision
1. Information system = components that collect, process, store, distribute information.
2. DSS improves decision-making capability.
3. OAS = word processing, e-filing, e-mail, message switching, voice/data communication.
4. Knowledge = expertise and skills from experience or education.
5. Interdependence = business components interact and depend on each other.
6. Strategic information = long-term policy and objectives.
7. MIS components: people, hardware, software, data, procedures.
8. Organisation = formal social unit devoted to specified goals.
9. Operations research is applied mathematics.
10. EDA's advantage: flexible hypothesis generation.
11. Value is the hardest qualitative measure to quantify.
12. Shared individual experience produces tacit knowledge.
13. KM = create, gather, store, transfer, apply knowledge.
14. Knowledge refining adds value by finding relationships and abstracting.
15. Management viewpoint = organising, directing, monitoring knowledge practices.
16. In-house development is the lowest-cost KMS option (DSSSB key).
17. Business types: expert-, experience-, efficiency-driven.
18. Subscription = fixed periodic fee.
19. Packing, loading, shipping = delivery/fulfilment.
20. "B" stakeholders include producers.
21. K. Vaitheeswaran = father of Indian e-commerce.
22. Michael Aldrich invented online shopping (1979).
23. Trade = sale and purchase of goods and services.
24. Commerce = buying and selling on a large scale.
25. Sole proprietor carries on business alone; most common form.
26. Company has limited liability; public company needs 7 members.
27. Organisation structure relates people, work and resources.
28. Double entry: every transaction has debit and credit.
29. Working capital = current assets − current liabilities.
30. Drawings = owner's personal withdrawals.
31. Fixed assets are long-term assets.
32. Net profit is shown by the Profit & Loss account.
33. Marginal revenue = ΔTR ÷ ΔQ.
34. Elasticity shows the degree of price–quantity response.
35. Perfectly elastic: tiny price change → infinite quantity change.
36. Sales-force composite = collective opinion = opinion survey.
37. Demand-pull inflation: demand drives prices up.
38. Capitalism = free markets, no government intervention.
39. Microeconomics studies the individual unit.
40. IoT's key challenge: security; E-Waste Rules 2016 include fluorescent and mercury lamps.

## Quick self-check
1. Which MIS level deals with long-term policy? — **Strategic.**
2. Interpretability, format, coherence belong to which quality category? — **Representational.**
3. OLX belongs to which e-commerce model? — **C2C.**
4. Minimum members of a public company? — **7** (private 2, OPC 1).
5. Which account shows net profit? — **Profit & Loss account.**
6. Correct end of the accounting cycle? — **Financial statements → closing entries.**
7. Excel 2007+ maximum rows × columns? — **1,048,576 × 16,384.**
8. ANI, AGI, ASI — which one acts smart without awareness? — **ANI.**
9. DPDP Act 2023: maximum penalty? — **Up to ₹250 crore.**
10. Term of copyright in India? — **Author's life + 60 years.**
