# Review log — questions_web_it.json (cf_web 45, cf_it 45)

Reviewer: independent examiner, 2026-10-27. Every item was solved before the key was read.

## Result
- Items reviewed: 90 (count unchanged, JSON valid).
- Keys changed: 0. Every key matched my own answer.
- Reworded: 2 explanations (precision only; question text, options and keys untouched).
- Answer balance: A 22, B 23, C 23, D 22.
- Duplicates: no duplicate questions, no duplicate options in any item.

## How it was checked
- JavaScript (#16–#22): run with Node. Results: 5A<br>A23; 3 3 3; 7 12; false true; false (0.30000000000000004); [4,16,36]; EL 5. All match keys.
- Excel (#45–#51): Python equivalents of COUNTIF (text not counted) = 3, LEN(TRIM()) = 11 (raw 17), IF/AND = Fail, MOD(-7,3) = n − d·INT(n/d) = 2, AVERAGE ignoring text/blank = 15, LEFT&RIGHT = INFOTEM, POWER+SQRT = 41. All match keys.
- Arithmetic (#69, #70, #73, #74): 5,30,000; 3,20,000; 2.5; MU 20/15/10/5. All match.
- HTML/CSS/JS/XML (#0–#33): checked against MDN/WHATWG/W3C XML 1.0 (target values, mailto, hr thematic break, body ALINK, head content, caption first child, email validation, multipart/form-data, cascade order, + combinator, box model, transitions, filter, Sass $, flex, getElementsByClassName live collection, onblur, jQuery fadeTo, ng-app/ng-repeat, XML naming/validity/#PCDATA/SAX vs DOM, fatal well-formedness error).
- Server side (#34–#41, #43, #44): servlet life cycle, CGI process-per-request, IsPostBack, DataSet disconnected, DevTools, three-tier, HTTP 403/500, Secure cookie, CSP — all standard and correct.
- MIS/KM/e-commerce/business/economics (#42, #55–#76): checked against Laudon, Wang–Strong quality framework, SECI, KM process (gather–organise–refine–disseminate, consistent with the PYQ analysis), Companies Act 2013 s.3 (private 2, public 7, OPC 1; private max 200), HUF Karta, Joel Dean's new-product methods. All correct.

## Law facts (all confirmed via web search)
| # | Fact | Status |
|---|---|---|
| 77 | IT Act s.66E: up to 3 years and/or fine up to ₹2 lakh; 66C identity theft; 67 obscene material; 43 compensation | Confirmed (UNODC/lawx/Wikipedia/secondary) |
| 78 | s.79 intermediary safe harbour with due diligence; 66F cyber terrorism; 4 electronic records; 69A blocking | Confirmed |
| 79 | DPDP Act 2023 s.2(i) Data Fiduciary; 2(k) Data Processor | Confirmed |
| 80 | DPDP Schedule: ₹250 cr security safeguards; ₹200 cr breach intimation and children; ₹150 cr SDF; ₹50 cr residual | Confirmed |
| 81 | Copyright Act 1957 s.22: life + 60 years from the calendar year following death; computer programme = literary work (s.2(o)) | Confirmed (WIPO Lex text) |
| 82 | E-Waste (Management) Rules 2016: EPR; covers CFL and other mercury lamps; replaced by 2022 Rules in force 1 April 2023 | Confirmed |

No law item needed rewriting.

## Changes
| # | Field | Before | After | Reason |
|---|---|---|---|---|
| 13 | explanation_en | "applies a Gaussian blur with a 4px radius" | "applies a Gaussian blur whose radius (the standard deviation of the Gaussian) is 4px" | MDN defines the blur() length as the Gaussian's standard deviation |
| 88 | explanation_en | "An orphan block is a valid block that ends up outside the main chain." | "An orphan (strictly, stale) block is a valid block that ends up outside the main chain." | Bitcoin docs call a valid off-chain block "stale"; "orphan" strictly means a block whose parent is unknown |
