# Review log: questions_fund_se.json (cf_fund + cf_se, 88 items)

Reviewer: independent examiner, 2026-10-27.

## Method
- I solved every item before looking at its key, then compared my answers with the keys. All 88 agreed.
- A Python script rechecked every numerical item:
  - number conversions (13.375, 101101.1, 3A7 hex to octal, 5B hex to Gray)
  - 8-bit 2's-complement addition and arithmetic shift right
  - BCD addition, Excess-3 decoding, ASCII 'M', UTF-8 length of U+20AC, 10's complement
  - Boolean identities (consensus, distributive), checked by truth table
  - K-maps #15, #16 and #17: an exhaustive minimal-SOP search confirmed each answer is the unique minimum
  - canonical minterm count, XOR built from 4 NAND gates, half subtractor
  - ripple-counter maximum frequency, cascaded counter modulus, unused states
  - cache tag/set/offset split, binary memory units, chip count, PC-relative effective address
  - frame-buffer size, Cohen–Sutherland outcode, two-dice prime probability, mean and range
  - BVA 4n+1, cyclomatic complexity, risk exposure, Basic COCOMO TDEV, MTBF and availability
- Theory items were checked against Mano, Stallings/Hamacher, Pressman/Sommerville, IEEE 830, ISO 9126, ISO/IEC 14764/SWEBOK, CMM and UML 2.
- Other checks: no duplicate stems, no duplicate options, and every item has exactly one defensible answer after the fixes below.
- Answer balance is unchanged at 22 / 22 / 22 / 22. The file still holds 88 items and is valid JSON.

## Keys changed
None. All 88 keys are correct.

## Wording changes
| # (0-based) | Subtopic | Problem | Fix |
|---|---|---|---|
| 30 | SRAM vs DRAM | The explanation said "...than DRAM, which stores a bit as charge on a capacitor and is used for cache". That reads as if DRAM is used for cache, which is wrong. | Rewrote the explanation: SRAM is used for cache; DRAM uses a refreshed capacitor and is used for main memory. Also explained the floating-gate and magnetic distractors. |
| 37 | DMA transfer modes | Two distractors, "Burst transfer mode" and "Block transfer mode", are the same mode. Students could rule out both at once. | Replaced option 1 with "Transparent (hidden) mode", a distinct DMA mode, and added it to the explanation. The key is unchanged (2, cycle stealing). |
| 74 | Software maintenance types | The stem said "improve future maintainability... restructuring code and updating documentation". IEEE 1219 and SWEBOK classify exactly that as **perfective** maintenance (a distractor), while Pressman calls it preventive. So two options were defensible. | Reworded the stem to the ISO/IEC 14764 / SWEBOK definition of preventive maintenance: correcting latent faults before they cause failures, with no reported fault and no feature request. It is now unambiguous under all standard texts. Updated the explanation to match. The key is unchanged (0). |

## Items checked with no change needed (notes)
- #70: V(G) = 2 (compound if) + 1 (for) + 3 (switch with 4 branches) + 1 = 7. The distractors catch the usual miscounts: 6 (treating && as one condition) and 8 (counting the default as an extra decision).
- #19: 4 NAND gates for XOR is the established minimum. The "5 NOR" remark in the explanation is correct.
- #20: XNOR is not functionally complete (it cannot produce constant 0 or NOT without a constant), so statement II is false.
- #85: MTBF = MTTF + MTTR = 500 h, and availability = 480/500 = 96%.
