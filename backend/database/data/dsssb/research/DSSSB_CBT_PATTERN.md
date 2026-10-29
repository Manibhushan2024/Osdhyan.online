# DSSSB CBT Pattern & Interface: TGT Computer Science (research, 29 Oct 2026)

Every fact below has a source and a confidence level:

- **OFFICIAL**: a DSSSB document (dsssb.delhi.gov.in) or DSSSB's own TCS iON mock (digialm.com, client code 1258) that was read directly.
- **SECONDARY**: coaching or news sites. Treat these as indicative only.
- **CANDIDATE**: candidate or coaching reports about what the hall exam looked like.

Primary documents used:

| # | Document | Date | URL |
|---|---|---|---|
| O1 | DSSSB Vacancy Notice, **Advertisement No. 03/2026**, No. F.1(445)/P&P/DSSSB/2026/Advt./4829 | 29-05-2026 | https://dsssb.delhi.gov.in/dsssb/vacancy-notice-advertisement-no-032026-various-posts-post-code-2126-4526-closing-date-0 (PDF copy read: https://vault.drishtiteachingexams.com/english_file_uploads/1780318801_DSSSB-2026-Recruitment-Notification-Released--Special-Educator-TGT--PRT-Posts.pdf) |
| O2 | DSSSB "Notification of online examination … scheduled from 27 October 2026 to 05 December 2026", No. F.55(438)/Exam/DSSSB/2025/PF/C.N.359909/2902-2909 | 07-10-2026 | https://dsssb.delhi.gov.in/sites/default/files/DSSSB/circulars-orders/exam_schedule_1.pdf |
| O3 | DSSSB "General Instructions for candidates w.r.t. online examinations … in the year 2026", No. F.55(438)/EXAM/DSSSB/2025/486-487 | 12-02-2026 | https://quicksarkari.com/wp-content/uploads/2026/02/DSSSB-Exam-Instructions-2026.pdf (scan of the DSSSB notice) |
| O4 | DSSSB "New Examination Scheme" Annexure-A | undated (standing scheme) | https://dsssb.delhi.gov.in/sites/default/files/DSSSB/generic_multiple_files/annexuetailed_new_examination_scheme.pdf |
| O5 | **DSSSB official online mock test** (TCS iON / digialm, linked from the DSSSB home page as "Online Exam Mock Test"). Its config file `confDetails.xml` names it "DSSSB 27th June 2018". | read 29-10-2026 | https://www.digialm.com//OnlineAssessment/index.html?1258@@M37. The config files sit under https://www.digialm.com/per/g01/pub/1258/ASM/OnlineAssessment/M37/ (`confDetails.xml`, `quiz.xml`, `sysInstructions.xml`, `custInstructions.xml`) and the TCS label bundle is https://www.digialm.com/OnlineAssessment/LangXML/English.xml (and Hindi.xml) |
| O6 | DSSSB home page: e-admit card link (hosted on cdn.digialm.com, client 1258) and mock-test link | read 29-10-2026 | https://dsssb.delhi.gov.in/ |

Point (vii) of Advt 03/2026's exam-scheme notes (O1) reads: *"Link for mock test (which also include instructions to candidates about the online examination) is given on the website of the Board."* That link is O5.

---

## 1. Exam pattern for TGT (One Tier Technical/Teaching, I-T-T)

### 1.1 Scheme (OFFICIAL, O1 p.30, Row 3, "One Tier (Technical / Teaching)", post codes 41/26–44/26; also O4)

| Item | Value | Source |
|---|---|---|
| Mode | Online Computer Based Test (CBT) | O1, O2 |
| Duration | **2 Hours (120 min)**, one overall duration | O1 p.30 |
| Questions / Marks | **200 MCQs / 200 marks**, 1 mark each | O1 p.30 |
| Descriptive | NA | O1 |
| Section A | 1. General Awareness, 2. General Intelligence & Reasoning Ability, 3. Arithmetical & Numerical Ability, 4. Test of Hindi Language & Comprehension, 5. Test of English Language & Comprehension. **20 marks each (100 Qs / 100 marks)** | O1 p.30 |
| Section B | "MCQs of one mark each from the subject concerned including questions on teaching methodology/ B.Ed." **(100 Qs / 100 marks)** | O1 p.30 |
| Negative marking | "deduction of **0.25 marks** will be made for each wrong MCQ answer of 01 marks" | O1 p.31 note (iv); O3 item 6 |
| Language | "questions … will be bilingual (Hindi & English) except for the language papers which will be in the language concerned only" | O1 note (v); O3 item 12 |
| English vs Hindi discrepancy | "the English version will prevail" | O5 (custInstructions) |
| Normalisation | Scores normalised if required (Notice No. 10(271)/Sec.Cell/DSSSB/18/989 dt 11.07.2018) | O1 para 5(ii) |
| Tie-break (I-T-T) | (a) more marks in subject section; (b) older candidate; (c) first name alphabetical | O1 para 5(vii) |

Section A order: the notification lists GA, Reasoning, Arithmetic, **Hindi, English** (Hindi 4th). The official mock's question paper (`quiz.xml`) uses the order Mental Ability, General Awareness, Arithmetic Ability, **General Hindi, General English**. The mock's instruction table, however, lists Reasoning, GA, Numerical, **English, Hindi**.

### 1.2 Qualifying marks (OFFICIAL, O1 para 5(v), p.31)

| Category | Minimum | Note |
|---|---|---|
| General / EWS | **40%** | |
| OBC (Delhi) | **35%** | |
| SC / ST / PH (PwBD) | **30%** | |
| Ex-Servicemen | 5% relaxation in own category, minimum 30% | |

How the minimum is applied (O1 p.30 note): *"In One Tier Technical / Teaching Examination Scheme, the mandatory minimum qualifying marks will be applicable only in domain subject specific i.e. Section-B and there will not be any minimum qualifying marks in Section-A. However, mandatory minimum qualifying marks criteria will be applicable on the cumulative marks secured in both the sections. Further, combined marks of both Section-A and Section-B will be reckoned for preparing the final merit list."*

In practice a Gen/EWS candidate needs ≥40/100 in Section B **and** ≥80/200 overall. DSSSB first applied this rule to Advt 04/2024 and 05/2024 through corrigenda of 08-07-2025 (SECONDARY: https://quicksarkari.com/dsssb-examination-scheme-change-2025/, 2025-07). Advt 03/2026 now states it directly.

---

## 2. The exam interface

### 2.1 Conducting agency

| Fact | Status | Source |
|---|---|---|
| The CBT runs on **TCS iON** (digialm.com). DSSSB's client code on digialm is **1258**. | OFFICIAL (both links on the DSSSB home page point there) | O6: e-admit card at `cdn.digialm.com/EForms/configuredHtml/1258/...`; mock test at `digialm.com/OnlineAssessment/index.html?1258@@M37` |
| Exams are held at TCS iON centres (Delhi NCR) | SECONDARY | WebSearch summary of theoptimist.news / indianopinion.org, Oct 2026 |

### 2.2 Navigation and locking rule: what the official mock does

The following comes from DSSSB's own mock (O5), read on 29-10-2026. It has the strongest evidence of anything in this file.

| Setting / text | Value | Where |
|---|---|---|
| Paper structure | Every subject is a separate **group of exactly 20 questions** (`maxQuestionsToBeAttempted="20"`). Section A is 5 groups. The subject part is split into blocks of 20 ("Subject Related 1…n"). The mock is a 300-Q / 180-min template with 15 groups. For a 200-Q TGT paper this gives **10 groups × 20**. | `quiz.xml` |
| Revisit | `revisitAllowedForEdit="false"` and `revisitAllowedForView="false"` on **every** group | `quiz.xml` |
| Sectional time | `maxDuration="0"`, `minDuration="0"` on groups 1–14, so **no per-group timer**: one overall clock. The **last group has `minDuration="180"`** (= full exam time), so the final Submit cannot be used before time runs out. | `quiz.xml` |
| Instruction text (system) | "Sections in this question paper are displayed on the top bar of the screen. The section you are currently viewing is highlighted. After clicking on the Submit button for a particular section, You can view the corresponding section summary and will be able to view next section on Clicking "Yes" on summary. **You cannot shuffle between sections anytime during the examination. All the sections will be opened in sequential order and will not be allowed to attempt any section by choice.**" | `sysInstructions.xml` (page 1 of instructions) |
| Instruction text (DSSSB custom) | "**Candidates will not be allowed to Re-Visit the same group again after submission of that Particular Group**" | `custInstructions.xml` (page 2) |
| Exam end | "The countdown timer in the top right corner of screen will display the remaining time … When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination." | `sysInstructions.xml` |
| Shuffling | `questionShuffling="true"` and `optionShuffling="true"`, so questions and options are shuffled per candidate | `quiz.xml` |
| Mark-for-review evaluation | `ConsiderMarkForReview = NO`. Instruction 5: *"The question(s) "Marked for Review" will be not be considered for evaluation. Hence, no marks will be allocated for the same."* | `confDetails.xml`, `sysInstructions.xml` |
| Calculator / view-QP | `ShowCalculator NO`, `ShowViewQPButton NO` | `quiz.xml`, `confDetails.xml` |

The same rule is also reported elsewhere:

- SECONDARY (2026): theoptimist.news, 23-10-2026 (https://theoptimist.news/dsssb-exam-timings-admit-card/). It says candidates are "forced to attempt the paper in a fixed sequence" and cannot return to a section once it is submitted. It also claims that in previous years candidates "could freely hop back and forth between different sections." Indian Opinion (https://indianopinion.org/dsssb-2026-exams-start-oct-27-with-section-locks/, ~24-10-2026) has "section locks" in its headline, but the article body gives no detail. examdetail.in (https://www.examdetail.in/exams/dsssb-teacher-2026, verified 01-10-2026) says: "Once a section is submitted, you CANNOT navigate back to it."
- CANDIDATE/coaching: dsssb.exampreppro.in (https://dsssb.exampreppro.in/tests/?filter=pyq) says "the 200 questions are strictly divided into 10 sections of 20 questions each … Once you click "Submit Section", it is permanently locked". YouTube "DSSSB Part 1 Paper Attempt Strategy – Section Lock Rule ke Sath 80 Marks in 50 Mins!" (https://www.youtube.com/watch?v=7vniUko32js, 2026, upload date not readable) covers the same rule. markforreview.com describes DSSSB ASO 2026 mocks as 20-question sections submitted one by one (https://markforreview.com/exam-replays/dsssb-aso-2026/english).
- Disagreeing source: testkart.in says "DSSSB does not fix sectional time limits, so you can move between sections freely" (https://testkart.in/exams/dsssb-tgt/exam-pattern, undated).

What is still uncertain, by year:

| Exam year | Locked sequential groups in the hall? | Evidence |
|---|---|---|
| 2026 (27 Oct – 5 Dec cycle, incl. TGT CS) | **Yes, very likely.** No official DSSSB notice text was found, but the official mock enforces it, and several Oct-2026 reports describe it as in force. | O5; theoptimist.news 23-10-2026; examdetail.in 01-10-2026 |
| 2025 (Aug–Nov 2025 TGT/PGT cycles) | **Unconfirmed.** No 2025 candidate account was found either way. The Optimist implies the lock is new in 2026. | — |
| 2024 (e.g. TGT CS 07-02-2024) | **Unconfirmed.** No account found. | — |
| Design origin | The official mock that enforces the lock is named "DSSSB 27th June 2018". DSSSB's TCS template has had locked 20-question groups since at least 2018, so the lock is not a new invention. Whether DSSSB switched it on in every live exam is not documented. | O5 `confDetails.xml` |

No official PDF, DSSSB notice, admit-card text or 2026 general instruction (O3) mentions sectional locking. O3 covers reporting, ID, pen, the 0.25 negative marking, bilingual questions, the rule that candidates cannot leave before exam time ends, prohibited items and dress code only. In the official materials, the locking rule appears only in the mock's instructions.

### 2.3 Screen layout (TCS iON standard, from the DSSSB mock's code and instruction text)

| Element | Detail | Source |
|---|---|---|
| Login screen | Grey header band: "System Name : C001" (large yellow), the line "Kindly contact the invigilator if there are any discrepancies in the Name and Photograph displayed on the screen or if the photograph is not yours", "Candidate Name : John Smith" (yellow), "Subject : Mock Exam", and the candidate photo at top right. A centred "Login" box with user-ID and password fields (virtual keyboard icon) and a blue **Sign In** button. Footer: "Version 17.05.21". | O5 screenshots |
| Instructions page 1 | Title "Instructions". A "View in : [English/Hindi]" dropdown at top right. "Please read the instructions carefully". The "General Instructions" (timer, palette legend, navigating, answering, navigating through sections). Candidate photo and name in the right column. A **Next >** button. | O5 |
| Instructions page 2 | "Other Important Instructions": a section table, duration, bilingual note, "One question will be displayed on the screen at a time", 4 options with one correct, English prevails, ".25 marks" negative, the no-revisit-group rule. At the bottom: "Choose your default language : [-- Select --]" with the note "Please note all questions will appear in your default language. This language can be changed for a particular question later on." Then the **declaration checkbox**, a **< Previous** button and an **I am ready to begin** button (disabled until a language is chosen and the box is ticked). | O5 |
| Exam screen | **Section/group tabs on the top bar** (current one highlighted; locked ones not clickable). **Time Left : hh:mm:ss** at top right. Candidate **profile photo + name at top right** (clicking the photo changes the language for the whole paper). A **"View in :" language dropdown** per question. Question area on the left showing "Question No. N" and four radio-button options listed vertically (`OptionOrientation=Vertical`). **Question Palette on the right**, collapsible with ">" / "<". Up/down arrows jump to the bottom/top of the question area. | O5 `sysInstructions.xml`, `confDetails.xml`, quiz.html element ids |
| Bottom action bar | Left: **Mark for Review & Next**, **Clear Response**. Right: **Save & Next**. **Submit** appears under the palette and submits the current group. | O5 label bundle `English.xml` (SaveAndNext, MarkForReviewNext, ClearResponse, Submit); TCS layout |

The actual question screen could not be opened here: the mock launches the exam in a pop-up window, which the research browser blocked. The exam-screen layout above comes from the mock's instruction text, its code and configuration, and the TCS label bundle, not from a screenshot.

### 2.4 Button names and texts (exact strings, OFFICIAL O5 label bundles)

| Purpose | English | Hindi |
|---|---|---|
| Save answer, go to next | **Save & Next** | सेव करें और अगले पर जाएं |
| Mark, go to next | **Mark for Review & Next** | समीक्षा के लिए चिन्हित किया गया और अगला |
| Clear | **Clear Response** | उत्तर मिटाइये |
| Submit current group | **Submit** | सबमिट |
| Back (instructions) | **Previous** | पीछे जाइये |
| Start | **I am ready to begin** | मैं शुरु करने के लिए तैयार हूँ |
| Timer label | **Time Left :** | शेष समय : |
| Language dropdown | **View in :** | इसमे देखिये : |
| Group-submit confirm | "Are you sure to submit this Group? Click 'Yes' to proceed; Click 'No' to go back." | — |
| Lock warning | "Dear Candidate, Once the Group is submitted, you cannot revisit and edit your responses." | — |
| Attempted-group click | "You have already attempted <group> group. Viewing or editing this group is not allowed upon submission." | — |
| End of group reached | "Dear Candidate, You have visited/attempted all the questions in the Group and reached the end. Please submit the group to proceed further." | — |
| Final-group submit | "Dear Candidate, Thank you. Please note that, your Exam is about to be submitted. Click on 'OK' to proceed further." | — |
| Submit not yet allowed | "Submit' button will be enabled after" + time | — |
| Time over | "Dear Candidate, The time duration allotted to you for the assessment has exhausted. Be assured that all the responses provided by you are saved in the system." | — |
| Done | "All the responses provided by you are saved in the system and the assessment has been submitted successfully." | — |
| Yes / No | Yes / No | हाँ / नहीं |

TCS never labels the button "Submit Section". That wording comes from coaching mocks (e.g. exampreppro). The real label is **Submit**, and the confirmation text uses the word "Group".

### 2.5 Palette legend (OFFICIAL O5)

The legend wording is exact. Colours were sampled from the TCS sprite `images/questions-sprite.png` (CSS classes `not_visited`, `not_answered`, `answered`, `review`, `review_marked`).

| # | Status | Shape / colour (sampled) | Legend text (instructions) | Summary label |
|---|---|---|---|---|
| 1 | Not Visited | light-grey square (~#E4E4E4), dark-grey number (#474747) | "You have not visited the question yet." | Not Visited |
| 2 | Not Answered | orange-red tab shape (~#DB4007), white number | "You have not answered the question." | Not Answered |
| 3 | Answered | green tab shape (~#7EC222), white number | "You have answered the question." | Answered |
| 4 | Marked for Review (not answered) | purple circle (~#755397), white number | "You have NOT answered the question, but have marked the question for review." | Marked for Review |
| 5 | Answered & Marked for Review | purple circle with small green tick, white number | "The question(s) "Marked for Review" will be not be considered for evaluation. Hence, no marks will be allocated for the same." | "Answered & Marked for Review (will not be considered for evaluation)" |

**Important DSSSB rule (`ConsiderMarkForReview=NO`):** an answer left as "Answered & Marked for Review" is **NOT evaluated**. The candidate must un-mark it, or Save & Next it, for it to count.

Instruction semantics: clicking a palette number "does NOT save your answer to the current question". "To save your answer, you MUST click on the Save & Next button". Mark for Review & Next saves the answer and marks it.

### 2.6 Declaration checkbox (exact, OFFICIAL O5)

> I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall.I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations

The Hindi version is also in `custInstructions.xml`, starting "मैंने निर्देश पढ़ लिया है और समझ लिया है।…".

### 2.7 Summary page before submitting a group or the exam

The TCS template (O5 `top.js`) shows a table with the columns **Section Name | No. of Questions | Answered | Not Answered | Marked for Review | Not Visited**. The confirmation sentence and **Yes / No** buttons sit under the table. "Yes" locks the group and opens the next one. On the last group, the final message is followed by **OK**.

---

## 3. DSSSB TGT Computer Science 2026 recruitment

### 3.1 Advt 03/2026, Post Code 41/26 (OFFICIAL O1)

| Item | Value |
|---|---|
| Advertisement | No. 03/2026, File F.1(445)/P&P/DSSSB/2026/Advt./4829, dated **29-05-2026** |
| Post | Trained Graduate Teacher (Computer Science), Directorate of Education, Group B, Pay Level 7 (₹44,900–1,42,400) |
| Post code | **41/26** (user-department requisition F.No.DE/TGT(CS)/E-IV/REQ/2025/268 dt 18-09-2025) |
| Vacancies | **675**: UR 416, OBC 00, SC 104, ST 39, EWS 116. PwBD (included) 22 (6/6/5/5 across categories a–e). |
| Online application | **16-06-2026 (12:00 noon) to 15-07-2026 (11:59 PM)** |
| Eligibility | BCA; or graduation with CS in all years; or BE/B.Tech (CS/IT); or any graduation + DOEACC 'A' level. Age ≤ 30 (relaxations as per rules). |
| Exam scheme | One Tier Technical/Teaching (Section 1 of this file). Section B = CS + teaching methodology/B.Ed. |

Note: secondary sites give conflicting vacancy counts (examdetail.in: 364; careerpower: 838; PW/freejobalert: 675). **675 is the official figure.**

### 3.2 Exam dates for Post Code 41/26 (OFFICIAL O2, notice dated 07-10-2026)

| Date | Shifts |
|---|---|
| 27-11-2026 (Fri) | I, II, III |
| 28-11-2026 (Sat) | I |
| 30-11-2026 (Mon) | I, II, III |
| 01-12-2026 (Tue) | I, II, III |
| 02-12-2026 (Wed) | I, II, III |
| 03-12-2026 (Thu) | II, III |
| 04-12-2026 (Fri) | I, II, III |

Shift timings: I 09:00–11:00, II 13:00–15:00, III 17:00–19:00 (O2).

Reporting and gate times, per SECONDARY theoptimist.news (23-10-2026): reporting 07:30 / 11:30 / 15:30, gate closes 08:30 / 12:30 / 16:30. Admit cards go live on digialm roughly 4–7 days before each shift (SECONDARY).

The gap from advertisement (29-05-2026) to exam (27-11-2026) is about 6 months, and about 4.5 months from the application close date.

### 3.3 Earlier TGT CS cycles (for reference)

| Advt / Post code | Vacancies | Notification | Exam | Source |
|---|---|---|---|---|
| 04/2020 / 91/20 | 364 | 04-01-2020 | 01 & 07-08-2021 | SECONDARY teachmatters.in (http://www.teachmatters.in/2017/07/dsssb-tgt-computer-science.html?m=1) |
| 08/22 / 39/22 | 106 | 14-10-2022 | 24–25-06-2023 (result Apr 2024; cut-off UR 128.04, OBC 114.01, EWS 108.88, SC 110.17, ST 103.09) | SECONDARY teachmatters.in; adda247 (https://www.adda247.com/teaching-jobs-exam/dsssb-tgt-computer-science-result-2024/, 13-04-2024) |
| 02/23 / 70/23 (NDMC) | — | 2023 | 07-02-2024 (Tier-1) | SECONDARY teachmatters.in; Scribd paper "Held On 07 Feb 2024 Shift 2" |
| 05/2024 / 56/24 (DoE) | 55 | 05-03-2024 | **not confirmed** (sources conflict: Sept 2025 vs Nov 2025) | SECONDARY pw.live / onlineresult.in |

Historically the gap between notification and exam has been about 8–19 months (2020→2021: 19 mo; 2022→2023: 8 mo). The 2026 cycle is faster at about 6 months.

Syllabus changes: Advt 03/2026 publishes no topic-wise Section B syllabus. It says only "subject concerned including questions on teaching methodology/B.Ed." No change from earlier cycles was found. The one rule change is the qualifying-marks rule in 1.2 (Section B minimum plus cumulative minimum).

---

## 4. Section A syllabus

**OFFICIAL:** neither DSSSB document (O1, O4) gives a topic list. They name only the five tests, at 20 marks each. The topic lists below come from coaching sites and are consistent with one another. They follow the standard SSC-style DSSSB syllabus. Sources: adda247 (https://www.adda247.com/teaching-jobs-exam/dsssb-tgt-syllabus/, 01-06-2026), careerpower (https://www.careerpower.in/blog/dsssb-tgt-computer-science-syllabus, 02-06-2026), meritpulse (https://www.meritpulse.in/dsssb-exam-syllabus/, 02-06-2026).

| Test (20 Q each) | Topics (SECONDARY) |
|---|---|
| General Awareness | Current events (national/international), history, Indian polity & constitution, geography, economy (budget, plans), everyday science & scientific research, sports, art & culture, books & authors, awards, countries & capitals, national/international organisations, abbreviations, inventions & discoveries, Delhi-related awareness |
| General Intelligence & Reasoning | Analogies, similarities & differences, classification (verbal & figure), number/alphabet series, non-verbal series, coding-decoding, blood relations, direction sense, syllogism/logical deduction, statement–conclusion/argument, cause & effect, seating arrangement, space visualisation/spatial orientation, visual memory, observation & discrimination, arithmetical reasoning, judgement & decision-making |
| Arithmetical & Numerical Ability | Number system, simplification, decimals & fractions, LCM & HCF, ratio & proportion, percentage, average, profit & loss, discount, simple & compound interest, time & work, time & distance, mensuration, tables & graphs / data interpretation |
| Test of Hindi Language & Comprehension | संज्ञा, सर्वनाम, विशेषण, क्रिया (भेद), वचन, लिंग, उपसर्ग-प्रत्यय, संधि, समास, वाक्य रचना/वाक्य शुद्धि, पर्यायवाची, विलोम, अनेकार्थी/श्रुतिसमभिन्नार्थक शब्द, मुहावरे-लोकोक्तियाँ, अलंकार, तत्सम-तद्भव-देशज-विदेशी शब्द, विराम चिह्न, अपठित गद्यांश |
| Test of English Language & Comprehension | Reading comprehension/unseen passage, vocabulary, synonyms & antonyms, idioms & phrases, fill in the blanks, error spotting/correction, sentence improvement & rearrangement, articles, prepositions, tenses, modals, adjectives/adverbs, subject-verb agreement, active-passive voice, direct-indirect narration, punctuation |

Per O1 and O3, the Hindi and English tests appear only in their own language. All other questions are bilingual.

---

## 5. Decisions for our simulator

Tags: [O] means backed by an official DSSSB or DSSSB-mock source. [J] means a judgement call.

1. **Paper**: 200 MCQs, 1 mark each, **−0.25** per wrong answer, 0 for unattempted. **Answered & Marked for Review = NOT evaluated** (DSSSB `ConsiderMarkForReview=NO`). [O]
2. **Timing**: one **overall 120:00 countdown** with "Time Left :" at top right. **No per-block timer.** Auto-submit at 00:00 with the TCS "time duration … exhausted" message. **Final Submit is disabled until time ends** (mock: last group `minDuration` = full duration). Earlier blocks can be submitted at any time. [O for mechanics; the 120 min comes from O1]
3. **Blocks**: **10 groups of 20**, opened strictly in sequence. Only the current group is clickable on the top bar, the earlier groups are locked, and the later ones are greyed out. [O mock; 2026 hall use per secondary reports]
4. **Block order** (use the notification order, which matches the mock's quiz.xml for groups 4/5): 1 General Awareness, 2 General Intelligence & Reasoning, 3 Arithmetical & Numerical Ability, 4 Hindi Language, 5 English Language, 6–10 Computer Science 1–5 (the last block holds the teaching-methodology/pedagogy questions). [J: the official mock puts Reasoning before GA. Make block order a config value and default to the notification order.]
5. **Locking rule**: clicking **Submit** shows a group summary (Section Name | No. of Questions | Answered | Not Answered | Marked for Review | Not Visited), then "Are you sure to submit this Group? Click 'Yes' to proceed; Click 'No' to go back." **Yes** locks the group permanently (no viewing, no editing) and opens the next one. **No** returns to the group. Reaching the last question of a group shows "You have visited/attempted all the questions in the Group and reached the end. Please submit the group to proceed further." [O]
6. **Buttons (exact)**: Mark for Review & Next · Clear Response (bottom left) · Save & Next (bottom right, blue) · Submit (below the palette). Instructions screens: Next >, < Previous, I am ready to begin. **Do not use "Submit Section"**, which is coaching-site wording. [O]
7. **Save semantics**: selecting an option is not saved until **Save & Next** or **Mark for Review & Next**. Jumping via the palette discards the unsaved selection. Clear Response deselects. Opening a question changes its state from Not Visited to Not Answered. [O]
8. **Palette colours**: Not Visited light grey #E4E4E4 square with dark text. Not Answered #DB4007 orange-red. Answered #7EC222 green. Marked for Review #755397 purple circle. Answered & Marked = purple circle + green tick. Use the exact legend sentences from 2.5, plus the counts legend per group. [O]
9. **Layout**: top bar with group tabs. Top right shows Time Left, the candidate photo and the candidate name. The question area on the left shows "Question No. N" with a "View in : English/Hindi" dropdown, one question at a time, and 4 vertical radio options. The palette is on the right and collapsible (">" / "<"). Questions and options are shuffled per attempt. No calculator. No "Question Paper" button. [O]
10. **Language**: choose the default language on instructions page 2 ("Choose your default language"). A per-question "View in" toggle is available. The Hindi block is Hindi-only and the English block is English-only. If versions differ, English prevails. [O]
11. **Pre-exam flow**: Login screen (System Name, candidate name/photo, discrepancy note, Sign In) → Instructions page 1 (General Instructions text: section 2.2 plus palette legend) → page 2 (Other Important Instructions, a table of the 10 groups × 20 Q × 20 marks, "You will be given 120 minutes…", the no-revisit-group rule, default-language select, **declaration checkbox with the exact text in 2.6**). "I am ready to begin" stays disabled until a language is chosen and the box is ticked. [O, with the table adapted to 200 Q / 120 min]
12. **Result screen** (our addition, not in the real exam): score = correct − 0.25 × wrong, excluding Answered & Marked. Show Section A and Section B separately. Show pass status as: Section B ≥ 40/35/30% **and** total ≥ 80/70/60 out of 200 for Gen-EWS/OBC/SC-ST-PwBD (ESM: −5%, minimum 30%). [O for the rule, J for showing it]

Still open:

- No official DSSSB notice states the 2026 lock, and no 2024/2025 candidate report confirmed whether the lock was active in those halls.
- The real exam screen was not captured, because the mock opens in a blocked pop-up.
- The CS block split inside Section B (how many pedagogy questions, and where they sit) is not documented.
- The exam date for Post Code 56/24 is unconfirmed.
