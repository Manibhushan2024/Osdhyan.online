# Fact-check review: questions_current.json

Reviewed on 27 Oct 2026 against `research/current_affairs_2026.md`, the only source allowed. Indexes are 0-based positions in the JSON array. `capsule_row` is the line number in the capsule file.

## Summary
- 80 questions checked. Each one's `capsule_row` points to the line that supports it, and every keyed answer matches that line exactly (name, month, number, place).
- Keys changed: 0. Questions replaced: 0. Wording fixes: 1.
- No question uses an item the capsule marks unverified (2026 Bharat Ratna, G20 2026 presidency, UNDP HDR 2026).
- JSON shape is valid: 80 items, 4 distinct options each, `answer_index` 0-3, `chapter_key` is `ga_current` throughout, no duplicate stems, no "All/None of the above", and every explanation cites a source. Answer spread is A 20 / B 20 / C 20 / D 20 (checked with Python after the edit).

## Changes

| Index | Old | New | Capsule row | Reason |
|---|---|---|---|---|
| 28 | Stem: "Which former Kerala Chief Minister received the Padma Vibhushan 2026 posthumously?" | Stem: "Which former Kerala Chief Minister was named for the Padma Vibhushan 2026 (announced January 2026) posthumously?" | 105 | The capsule records only the 25 Jan 2026 announcement, not when the award was conferred. The new wording says only what the capsule supports and marks the item as January. Key unchanged (A, V.S. Achuthanandan). |

## Items checked and kept, with notes
- **Index 23 (29th Chief of the Air Staff, Ashutosh Dixit; row 92)** is marked **[ANNOUNCED - NOT YET HELD]**. The stem says he "has been named ... scheduled to take over on 31 October 2026", so it does not claim the handover has happened. Kept. Recheck after 31 Oct 2026.
- **Index 28 (Padma Vibhushan; row 105)** is a January item ("Jan 2026 (announced)"). The capsule allows Padma 2026 by name. The stem now marks it as January, so it does not pass as a Feb-Oct event.
- **Ambiguity check:** no other option is also correct under the capsule. Distractors that are real 2026 office-holders or winners hold a different post or award from the one asked. Examples: Sanju Samson (Player of the Tournament, not Player of the Match in the final), Monika Pant (Deputy Mayor), K. Kailashnathan (Lt Governor), Amar Preet Singh (outgoing Air Chief), Magenta Line (opened the same day but is not the ring line), Mammootty (Best Actor, not Phalke).

## Questions resting on exam-prep-only rows
These match the capsule, but the capsule says to cross-check such rows. They are not unverifiable, but they have weaker sourcing:
- 0 (PM RAHAT, row 53)
- 16 (Rohit Jain, row 86)
- 34 (Bumrah, row 138)
- 39 (Ranji J&K, row 136)
- 72 (Four Stars of Destiny, row 170)
- 74 (International Booker, row 113)
- 77 (World Teachers' Day, row 287)

## Questions that could not be verified from the capsule
None. All 80 rest on a capsule row that states the keyed fact.
