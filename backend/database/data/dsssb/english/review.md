# Review log — English Language & Comprehension question bank

Reviewer pass on 29 October 2026. Each question was answered blind, then compared with the key, the explanation and the distractors. References: Wren & Martin, NCERT and standard SSC/DSSSB usage.

## Files
| File | Chapters | Items |
|---|---|---|
| questions_a.json | eng_grammar 60, eng_errors 36 | 96 |
| questions_b.json | eng_vocab 64, eng_comprehension 40 | 104 |
| **Total** | 155 from `gen/english.json`, re-keyed + 45 new | **200** |

New items (45): question tags 2, conjunction 1, adjective/adverb 1; inversion 2, error spotting 6, sentence improvement 3, confusable words 1; homophones 2, homonym 1, phrasal verbs 2, collocations 2, proverb 1, spelling sentence 1; para jumbles 4, sentence-part rearrangement 1, **2 new RC passages × 5** (millets; a village teacher), **1 new cloze × 5** (discipline).
Re-keying: Tenses, Articles, Prepositions, Subject–verb agreement, Voice, Narration → eng_grammar; Error spotting, Sentence improvement → eng_errors; Synonyms, Antonyms, One-word substitution, Idioms, Spelling → eng_vocab; Reading comprehension, Cloze → eng_comprehension. Passage items now start "Passage: …" and carry the whole passage. Fields match `ga/questions_static_a.json` (`expected`, `question_hi`, `explanation_hi` and option `hi` dropped; `pyq_concept` added — true for the 138 items whose question type or concept was asked in 2023–24).

## Validation
- JSON valid; every item has exactly 4 distinct, non-empty options and one key.
- Answer balance: A 50, B 50, C 50, D 50.
- Difficulty: easy 62, medium 97, hard 41.
- Duplicates (stem + options, case/space-insensitive, as in `build-subject-pack.py`): none.
- Passage items: 35 (4 RC passages × 5, 3 cloze passages × 5).

## Random re-check of 60 answers
Sample: `random.seed(2026)`, 60 of the 200 items (combined index, a = 0–95, b = 96–199):
0, 2, 6, 19, 20, 22, 23, 25, 26, 28, 29, 30, 36, 53, 57, 61, 64, 73, 74, 79, 80, 81, 87, 89, 91, 93, 94, 96, 101, 102, 107, 108, 112, 115, 117, 118, 125, 127, 128, 129, 131, 137, 140, 141, 142, 146, 147, 148, 150, 153, 157, 159, 163, 165, 173, 174, 178, 186, 190, 196.

- **Keys found wrong: 0.** All 60 keys verified correct.
- **Reworded: 1** (index 173, see below) — the key was right but the stem allowed argument.

## Changes made
| Item (file, 0-based) | Source | Change | Reason |
|---|---|---|---|
| questions_b #77 (combined 173) — sleep passage | gen #131 | Stem "what can sleeping late on weekends NOT do?" → "which statement about sleeping late on weekends is true?"; options rewritten as statements; key unchanged (D: cannot fully repay the sleep debt) | The passage says nothing about the other three options either way, so "NOT do" made all four defensible. |
| questions_a #41 — "Who wrote this letter?" (passive) | gen #140 | Distractor "Whom was this letter written by?" → "By whom has this letter been written?" | "Who/Whom was this letter written by?" is itself an acceptable passive, so the item had two right answers. Key unchanged (By whom was this letter written?). |
| questions_a #53 — "He asked me if I had finished my work" (direct speech) | gen #152 | Distractor "He said to me, "Did you finish your work?"" → "He said to me, "Have you finished my work?"" | Reported past perfect can come from a direct simple past, so "Did you finish" was also defensible. Key unchanged ("Have you finished your work?"). |

## Items checked and confirmed (notable points)
- gen "If I ___ you" — key *were*; *was* is informal and not the exam answer.
- gen "The teacher told the class that the earth ___ round the sun" — *moves* (universal truth).
- gen "Rahul is one of the boys who has won" — error is *has* (→ *have*).
- gen "He is taller than any other boy in his class" — No error.
- New "The jury were divided in their opinions" — No error (collective noun, members acting separately; Wren & Martin example).
- New "Let's go for a walk, ___?" — *shall we*; "Nobody called me…, ___?" — *did they*.
- New "The roses smell ___" — *sweet* (linking verb + adjective).
- New cloze blank (3) uses "well ___ the examination" so that only *before* fits (avoids the *on time / in time* double answer).
- New millets passage: UN International Year of Millets 2023 on India's proposal — correct.
- Para jumbles: each has one opener without a pronoun or connector and at least one locked pair, so only one order is coherent.

## Not changed but worth knowing
- `english_pyq_analysis.json` (80 PYQs from `pyq_explanations/todo_lang.json` joined with `done_lang.json`) is in this folder. `build-subject-pack.py` reads `pyq_file` from `dsssb/`, so copy it to `dsssb/english_pyq_analysis.json` before building. With the `pyq_rules` in `pack.json` it splits vocab 36, comprehension 28, grammar 9, errors 7.
