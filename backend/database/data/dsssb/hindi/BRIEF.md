# Hindi Language & Comprehension (Section A) for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT candidate who wants SHORT notes that cover everything in Section A Hindi (हिंदी भाषा एवं बोध), to revise fast. Notes are written IN HINDI (plain, exact, standard खड़ी बोली); English appears only in chapter titles and in `explanation_en` glosses.
Exam: 20 Hindi questions per paper (Section A, common to all DSSSB posts). 1 mark, −0.25 per wrong answer. Every paper has one गद्यांश with 5 questions.

## Owner's syllabus rows (GENERATION_SPEC `hindi` row)
संधि, समास, उपसर्ग–प्रत्यय, पर्यायवाची, विलोम, अनेक शब्दों के लिए एक शब्द, मुहावरे–लोकोक्तियाँ, वाक्य शुद्धि, वर्तनी, लिंग–वचन–कारक, तत्सम–तद्भव, अलंकार, गद्यांश. Questions and options in Hindi; `question_en`/`en` hold the same Hindi text; `explanation_hi` is the main solution and `explanation_en` a one-line English gloss.

## What the 4 official DSSSB TGT CS papers (2023–24) actually asked — 80 Hindi questions
File: `hindi/hindi_pyq_analysis.json` here (the builder reads `dsssb/hindi_pyq_analysis.json`, produced by `scripts/content/make-section-a-pyq.py`; subtopics are English, e.g. "Sandhi-vichchhed", "Idioms (muhavare)"). READ IT. 20 questions per paper, 4 papers.
- **गद्यांश (20 = 5 per paper)**: title (शीर्षक), central idea, factual, "which is NOT true / not mentioned" (5 of 20!), word meaning, synonym and antonym of a passage word, correct usage of a passage word (परिणति), style (आलोचनात्मक). Passages were on Hindi criticism (नंददुलारे वाजपेयी, हजारी प्रसाद द्विवेदी), रामकुमार वर्मा's one-act plays, the 1929 depression and the Karachi resolution, and climate change and the Alpine ibex. One official key (1929 passage, qid 630680256592) is doubtful — the official answer is option 2 but option 4 is what the passage supports.
- **अलंकार (5)**: यमक ×2 ("तीन बेर खाती थीं", "उरबसी"), उपमा ("पीपर पात सरिस मन डोला"), उत्प्रेक्षा ("मनों सूरज के रथ चूमन चाहैं"), उभयालंकार ("सो सुंदर मादक मदिरा सी").
- **शब्द-भंडार (25)**: मुहावरे 5 (replace the wrong word: ओस का मोती, जीभ पर सरस्वती; meaning: टुकुर-टुकुर देखना, तौल-तौल कर बोलना; correct form: मुँह में पानी भर आना), लोकोक्ति 3 (ठोकर लगी पहाड़ की तोड़े घर की सिल, अपनी नाक कटे तो कटे…, अपना हाथ जगन्नाथ), एक शब्द 5 (अनुगामी, अग्रज, वामावर्त, आत्मोत्सर्ग, चाक्षुष), पर्यायवाची 4 (खड्ग/खंग, नश्वर, लम्बोदर, श्री), विलोम 4 (असमंजित, सुधा, बंधन, "सृजन–रचना is NOT an antonym pair"), रिक्त स्थान 3, अनेकार्थी 1 (गुण).
- **व्याकरण (15)**: संधि-विच्छेद 5 (भास्कर = भाः + कर, मात्रुपदेश = मातृ + उपदेश, उल्लंघन = उत् + लंघन, प्रमाण = प्र + मान, इत्यादि = इति + आदि), समास 4 (विषधर बहुव्रीहि, यथाशीघ्र अव्ययीभाव, गिरहकट = गिरह को काटनेवाला, सेठ-साहूकार समाहार द्वंद्व), कारक 2 (कानों सुनी — करण; मिठाई के डब्बे — संबंध), विशेषण 2, संज्ञा 1, क्रिया 1.
- **वर्तनी, वाक्य, शब्द-भेद (15)**: वाक्य-विन्यास / पदक्रम / वाक्यांश-क्रम 7, वाक्य शुद्धि 1, वर्तनी (नीरोग, not निरोग) 1, तत्सम–तद्भव 3 (लशुन, वर्द्धकि → बढ़ई, पूँजी), विदेशज 3 (मौका, नौकर, औरत).

## Chapters (use these exact keys and titles)
| key | chapter title | covers |
|---|---|---|
| hin_vyakaran | व्याकरण: संधि, समास, उपसर्ग–प्रत्यय, लिंग–वचन–कारक (Grammar) | संधि (all types, 10 examples each), समास, उपसर्ग–प्रत्यय, लिंग, वचन, कारक, संज्ञा–सर्वनाम–विशेषण–क्रिया |
| hin_shuddhi | वर्तनी, वाक्य शुद्धि एवं शब्द-भेद: तत्सम–तद्भव (Spelling & Correction) | वर्तनी, वाक्य शुद्धि, पदक्रम / वाक्य-विन्यास, वाक्यांश पुनर्व्यवस्था, तत्सम–तद्भव, देशज–विदेशज |
| hin_shabd | शब्द-भंडार: पर्यायवाची, विलोम, अनेक शब्दों के लिए एक शब्द, मुहावरे–लोकोक्तियाँ (Vocabulary) | 100 each of पर्यायवाची, विलोम, एक शब्द, मुहावरे; लोकोक्तियाँ; अनेकार्थी; रिक्त स्थान |
| hin_sahitya | अलंकार, रस, छंद एवं गद्यांश (Figures of speech & Comprehension) | अलंकार with lines, रस–स्थायी भाव, छंद–मात्राएँ, गद्यांश method |

## Rules
Use standard references (कामताप्रसाद गुरु "हिंदी व्याकरण", वासुदेवनंदन प्रसाद "आधुनिक हिंदी व्याकरण और रचना", NCERT व्याकरण). Where grammarians differ (e.g. पीतांबर = कर्मधारय or बहुव्रीहि depending on विग्रह), say so and give the exam rule. Every notes file, in Hindi: "**30 सेकंड में**" (6–8 bullets) → tables → "## परीक्षा में फँसाने वाले प्रश्न" (8) → "## एक पंक्ति में पुनरावृत्ति" (40) → "## त्वरित आत्म-जाँच" (10 Q&A); ⭐ where the concept was asked in 2023–24. 3,000–4,500 words per chapter; `notes/quick_revision.md` 5,000–6,500 words.

## Questions
`questions_a.json` (hin_vyakaran 54, hin_shuddhi 46) and `questions_b.json` (hin_shabd 53, hin_sahitya 47) = 200: the 155 questions of `gen/hindi.json` re-keyed to the 4 chapters (13 distractor/stem fixes listed in `review.md`) + 45 new (6 गद्यांश sets in all: 3 old, 3 new with 5 questions each; passage text inside each question after the prefix "गद्यांश:"). Fields as `ga/questions_static_a.json` plus `question_hi`, `options[{en, hi}]`, `explanation_hi`; `pyq_concept: true` marks a concept asked in 2023–24.
