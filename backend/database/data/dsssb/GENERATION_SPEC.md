# DSSSB TGT Computer Science 2026 — question generation spec (for writer agents)

Exam: 200 Q / 200 marks / 120 min / −0.25 per wrong. Section A = General Awareness 20, General Intelligence & Reasoning 20,
Arithmetical & Numerical Ability 20, Hindi 20, English 20. Section B = Computer Science ~88 + Teaching Methodology ~12.
Level: graduate-level teacher recruitment; Section B is concept/NCERT-CBSE Class 11–12 CS + B.Ed. style; moderate difficulty.

## Chapter keys (one JSON file per chapter key, written to `gen/<chapter_key>.json`)

| chapter_key | section | chapter title | sub-topics that MUST be covered (spread evenly) | pool size |
|---|---|---|---|---|
| ga_current | General Awareness | Current Affairs | national + Delhi news of the last 8–10 months (as of Oct 2026), sports, awards, books & authors, govt schemes, appointments, summits, science & tech news, defence | 85 |
| ga_static | General Awareness | Static GK | modern Indian history (1757–1947), Indian polity (constitution basics, articles, amendments, Parliament, judiciary), Indian geography (rivers, soils, climate, states), economy basics (budget terms, RBI, GDP, five-year plans), general science class 10, Delhi GK (history, monuments, govt, DSSSB/DoE facts), important days, first-in-India | 110 |
| rea_verbal | General Intelligence & Reasoning | Verbal Reasoning | analogy, classification/odd one out, number series, letter series, coding–decoding, syllogism, blood relation, direction & distance, ranking/ordering, statement–conclusion, statement–argument, statement–course of action, Venn diagram (word groups), mathematical operations, clock & calendar, alphabet test | 120 |
| rea_nonverbal | General Intelligence & Reasoning | Non-verbal (text-safe) | counting (triangles/squares described in words), dice (numbers on faces), cube cutting & painting, matrix/word-coding grids, series completion described with letters/numbers, paper folding described in words — NEVER a question that needs a drawing | 70 |
| num_arith | Arithmetical & Numerical Ability | Arithmetic | number system, LCM/HCF, simplification & BODMAS, percentage, ratio & proportion, average, profit–loss–discount, simple & compound interest, time & work, pipes & cisterns, time–speed–distance, trains, boats, mixtures & alligation, ages | 120 |
| num_adv | Arithmetical & Numerical Ability | Advanced | algebra (linear/quadratic basics, identities), geometry (lines, triangles, circles), mensuration (2D & 3D), trigonometry basics, data interpretation with the table/data written out in text (no graphs), statistics (mean/median/mode) | 70 |
| hindi | Hindi | हिंदी भाषा | संधि, समास, उपसर्ग–प्रत्यय, पर्यायवाची, विलोम, अनेक शब्दों के लिए एक शब्द, मुहावरे–लोकोक्तियाँ, वाक्य शुद्धि, वर्तनी, लिंग–वचन–कारक, तत्सम–तद्भव, अलंकार, गद्यांश (3 short passages with 4–5 questions each) — questions and options in Hindi | 155 |
| english | English | English Language | tenses, articles, prepositions, subject–verb agreement, error spotting, sentence improvement, synonyms, antonyms, one-word substitution, idioms & phrases, spelling, cloze test (2 short passages), reading comprehension (2 short passages with 5 questions each), active/passive, direct/indirect | 155 |
| cs_prog | Computer Science | Programming (C / C++ / Java / Python) | data types & operators, control flow, functions & recursion, pointers & arrays (C), strings, OOP (class/object, inheritance, polymorphism, abstraction, encapsulation, constructors, overloading/overriding, virtual, interfaces), exception handling, Python lists/dicts/tuples/sets/slicing/file handling; **≥40% output-type questions with the code shown** | 155 |
| cs_dbms | Computer Science | DBMS & SQL | ER model, keys (super/candidate/primary/foreign), relational model, normalisation 1NF–BCNF, SQL DDL/DML/DCL, joins, subqueries, aggregate & group by/having, constraints, views, transactions ACID, concurrency, indexing basics, MySQL functions (incl. questions like "which function returns…") | 110 |
| cs_net | Computer Science | Computer Networks & Internet | OSI & TCP/IP layers and the device/protocol at each, topologies, transmission media, hub/switch/router/repeater/bridge/gateway, IP addressing & subnetting, IPv4/IPv6, TCP vs UDP, DNS/HTTP/HTTPS/FTP/SMTP/POP/IMAP, ports, network security (firewall, encryption, VPN), wireless (Wi-Fi, Bluetooth), Internet basics (URL, ISP, cookies) | 110 |
| cs_os | Computer Science | Operating Systems | types of OS, process vs thread, process states, scheduling algorithms (FCFS, SJF, RR, priority — with numerical questions), synchronisation (semaphores, critical section), deadlock (conditions, Banker's), memory management, paging & segmentation, virtual memory & page replacement (FIFO/LRU/optimal), file systems, Linux commands & shell basics, system calls | 100 |
| cs_dsa | Computer Science | Data Structures & Algorithms | arrays, stacks (applications, infix/postfix), queues, linked lists, trees & BST (traversals, properties), heaps, graphs (BFS/DFS, representations), searching, sorting (all common algorithms with complexity & stability), hashing, recursion, Big-O analysis, asymptotic notations | 100 |
| cs_fund | Computer Science | Computer Fundamentals & Digital Logic | generations, hardware & peripherals, memory hierarchy, cache, number systems & conversions, binary arithmetic (1's/2's complement), Boolean algebra, logic gates, K-map, combinational (adders, MUX, decoders) & sequential circuits (flip-flops, counters, registers), codes (ASCII, BCD, Gray, Unicode), storage units | 100 |
| cs_se | Computer Science | Software Engineering | SDLC models (waterfall, spiral, prototype, agile/scrum, V-model), requirement engineering, design (cohesion/coupling), testing (black/white box, unit/integration/system/acceptance, alpha/beta), maintenance, UML diagrams, project metrics (COCOMO, LOC), version control basics | 70 |
| cs_web | Computer Science | Web Technologies | HTML tags/attributes/forms/tables/lists, CSS selectors & properties, JavaScript basics (variables, DOM, events, functions), client–server, HTTP methods, e-commerce models (B2B/B2C…), web security (XSS, SQL injection, HTTPS), XML/JSON basics | 85 |
| cs_it | Computer Science | IT Tools & Emerging Tech | MS Word/Excel/PowerPoint (functions, shortcuts, features), cyber security & IT Act 2000 (sections, cyber crimes), cloud computing (IaaS/PaaS/SaaS), AI/ML basics, IoT, big data, blockchain, Digital India initiatives (DigiLocker, UPI, Aadhaar), e-governance | 85 |
| teach | Teaching Methodology | Teaching Methodology (CS + B.Ed. basics) | objectives of teaching CS, Bloom's taxonomy, lesson planning (Herbartian steps), teaching methods (lecture, demonstration, project, lab, inductive/deductive), micro-teaching, teaching aids/ICT in education, evaluation (formative/summative, CCE, rubrics), learning theories (Piaget, Vygotsky, Bruner, Gagne), classroom & lab management, NEP 2020 basics | 110 |

## JSON format (array of objects; UTF-8; valid JSON — no comments, no trailing commas)

```json
{
  "chapter_key": "cs_os",
  "subtopic": "Scheduling algorithms",
  "difficulty": "easy" | "medium" | "hard",
  "question_en": "Consider processes P1, P2, P3 with burst times 6, 8, 7 ms arriving at time 0. Using SJF (non-preemptive), the average waiting time is:",
  "question_hi": null,
  "options": [{"en": "6.33 ms", "hi": null}, {"en": "7 ms", "hi": null}, {"en": "8.33 ms", "hi": null}, {"en": "9 ms", "hi": null}],
  "answer_index": 0,
  "explanation_en": "Order by burst: P1(6) → P3(7) → P2(8). Waiting times 0, 6, 13 → average 19/3 = 6.33 ms. Option 2 would be FCFS; options 3–4 use wrong orders.",
  "explanation_hi": null,
  "expected": true
}
```

- `hindi` chapter: `question_hi`/`hi` option text are the main text and `question_en`/`en` MUST also be filled (put the same Hindi text in `en` if no English exists); explanations in Hindi (`explanation_hi`) with `explanation_en` a one-line English gloss.
- All other chapters: English required; a Hindi version of the question text is welcome (`question_hi`) but optional.
- `expected: true` on the ~10 most probable questions per chapter (repeat-type facts, recent trends).
- Difficulty mix per chapter ≈ 30% easy / 50% medium / 20% hard. Exactly 4 options, one correct, options of similar length, no "all of the above"/"none of the above" in more than 5% of questions.
- Explanations: 1–4 sentences, state WHY the answer is right and, where useful, why the closest distractor is wrong. Numerical questions show the working.
- Do not copy questions from the official papers in `pyq_raw.json` (you may read it for style); do not repeat a question within the file; vary wording and numbers.
- Facts must be correct as of 2026. For Current Affairs, prefer well-established facts (major awards, appointments, schemes, sports results) and avoid speculative items.
