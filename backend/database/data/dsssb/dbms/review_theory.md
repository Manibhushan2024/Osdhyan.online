# Review log: questions_theory.json (DBMS, DSSSB TGT CS)

Reviewer: independent examiner pass, 2026-10-20.

## Method
- All 100 questions solved blind (stems and options only), then compared with `answer_index`.
- Numericals were recomputed by script (attribute closures, candidate keys, prime attributes, super-key counts, highest normal form, canonical-cover equivalence, dependency preservation, natural and full-outer-join row counts): Q53, Q54, Q66, Q67, Q79–Q84, Q86, Q92–Q94, Q97, Q98. All matched the key.
- Checked each item for a single defensible answer under Korth and Navathe, clear wording, and an explanation that agrees with the key. Checked stems for near-duplicates. Pairs that share a template (Q92/Q93/Q94, Q79/Q80, Q53/Q54) use different data and have different answers, so they are not duplicates.

## Result
- Reviewed: 100
- Keys changed: 0 (all 100 keys correct)
- Stems/options reworded: 2 (Q23, Q96)
- Explanations corrected or expanded: 3 (Q23, Q86, Q96)
- Answer distribution unchanged: A 25, B 25, C 25, D 25

## Changes

| Q | Problem | Fix |
|---|---|---|
| 23 | The stem said only "In an ER diagram". Distractor D, "single rectangle and a double diamond", can be defended under Korth (6th/7th ed.), which draws a weak entity set as an ordinary rectangle with the identifying relationship as a double diamond. That gives a possible second correct answer. | Stem now says "In a Chen-notation ER diagram (as used by Navathe)". Option D changed to "single rectangle and a single diamond", which is clearly wrong. Explanation updated to match. Key unchanged (C). |
| 96 | The stem "if at least one of the following functional dependencies is in F⁺:" reads as if it refers to all four options, not to the pair inside the correct option. | Stem changed to "...is guaranteed to be a lossless-join decomposition if F⁺ contains ______." Explanation now states the test in full and explains why distractor B (R1 → R2 or R2 → R1) is not enough, with a counter-example. Key unchanged (D). |
| 86 | The explanation did not say why option B, {A → B, B → C, AB → D}, is wrong, even though that set is equivalent to F. | Added a sentence: it is equivalent to F but keeps the extraneous B in AB → D, so it is not a canonical cover. Key unchanged (D). |
