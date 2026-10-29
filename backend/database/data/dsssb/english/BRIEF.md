# English Language & Comprehension (Section A) for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT candidate who wants SHORT notes that cover everything in Section A English, to revise fast. Plain, exact English; rule tables with a correct and a wrong example; one-line bullets.
Exam: 20 English questions per paper (Section A, common to all DSSSB posts). 1 mark, −0.25 per wrong answer. Level: Class 10–12 grammar and SSC-style vocabulary.

## Owner's syllabus rows
| key | chapter | syllabus line | Q/paper (2023–24 average) |
|---|---|---|---|
| eng_grammar | Grammar | tenses, articles, prepositions, subject–verb agreement, active/passive, direct/indirect, question tags, conjunctions | 2–3 |
| eng_errors | Error spotting & improvement | spot the error, sentence improvement / "No substitution required", fill in the blanks | 2 |
| eng_vocab | Vocabulary | synonyms, antonyms, one-word substitution, idioms & proverbs, spelling, homophones, collocations, phrasal verbs | 9 |
| eng_comprehension | Reading | reading comprehension (1 passage × 5 Q), cloze test, para jumbles / sentence rearrangement | 7 |

## What the 4 official DSSSB TGT CS papers (2023–24) actually asked — 80 English questions
File: `english/english_pyq_analysis.json` (the build script reads it from `dsssb/english_pyq_analysis.json`; copy it there). Subtopics map to chapters by the keyword rules in `pack.json`. READ IT.
- **Vocabulary (36)**: spelling 8 (pick the correct/incorrect word, or the sentence with no spelling error — horizontal/referred, indispensable, allot, university, permeate, crucial, necessary, consensus), idioms 7 + proverb 1 + idiom/collocation 1 (blow off steam, miss the boat, short fuse, break even, face the music, call it a day, roll up one's sleeves, read between the lines, can't have your cake and eat it too), one-word substitution 6 (egoist, gerontology, arsenal, anthropology, chronology, dormitory), antonyms 5 + synonym 1 (propensity, predictable, liberation, quarantine, friendly; obstinate), homophones 2 (heel/heal, meet/meat), homonym 1 (waves), collocations 2 (fast train, fully aware), phrasal verbs 2 (gear up for, took to the streets).
- **Comprehension (28)**: one passage with 5 questions in every paper (20) — title, tone, main idea, purpose, factual, NOT-mentioned, inference, type of passage (expository), word meaning and antonym from the passage; para jumbles 7 (4 sentences, numbered 1–4 or A–D/P–S); sentence-part rearrangement 1.
- **Grammar (9)**: prepositions 5 (engage in, walk along the beach, pour from the flask, brim with, for thousands of years), question tags 2, conjunction 1 (though, not whether), adverb 1 (chewed slowly).
- **Errors / improvement (7)**: inversion after No sooner/Barely (2), sentence improvement by the right word (limping back, extended period, scorching heat), error spotting (detection dog; being honest).
- No direct active/passive or narration question appeared in these 4 papers, and no cloze test, but both are on the owner's syllabus and in other DSSSB papers, so they stay in the notes and the question bank.

## Chapters (use these exact keys and titles)
| key | chapter title |
|---|---|
| eng_grammar | Grammar: Tenses, Articles, Prepositions, Agreement, Voice & Narration |
| eng_errors | Error Spotting, Sentence Improvement & Fill in the Blanks |
| eng_vocab | Vocabulary: Synonyms, Antonyms, One-word Substitution, Idioms, Spelling |
| eng_comprehension | Reading Comprehension, Cloze Test & Para Jumbles |

## Question bank
- `questions_a.json` = eng_grammar + eng_errors; `questions_b.json` = eng_vocab + eng_comprehension. 200 total: the 155 questions of `gen/english.json` re-keyed to the four chapters + 45 new (para jumbles, homophones, question tags, phrasal verbs, collocations, inversion, 2 new passages × 5, 1 new cloze × 5).
- A passage question carries the whole passage in `question_en` with the prefix "Passage: …" so each question stands alone in a shuffled test.
- Fields as in `ga/questions_static_a.json`: chapter_key, subtopic, difficulty, question_en, options [{en}], answer_index (0-based), explanation_en, pyq_concept (true when the concept or question type was asked in 2023–24).

## Rules
Standard British/Indian usage as in Wren & Martin, NCERT and SSC-style books. One defensible answer per question. Every notes file: "**In 30 seconds**" (6–8 bullets) → rule tables with ✔ correct / ✘ wrong examples → "## Exam traps" (8) → "## One-liners for revision" (40) → "## Quick self-check" (10 Q&A); ⭐ where the concept was asked in 2023–24. The vocabulary chapter carries the 100 most-asked one-word substitutions, 100 idioms and 100 commonly misspelt words.
