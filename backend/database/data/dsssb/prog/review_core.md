# Review log: questions_core.json (100 questions)

Reviewer: independent examiner pass, 2026-10-20.

## Method
- I solved every question myself before looking at its key.
- Python and Java (34 runs): I extracted and ran every Python 3 and Java 21 snippet. I also compiled one test program per option for the statement questions Q9 (byte assignments) and Q33 (literal declarations). Every output and every compile result matched the key.
- C and C++ (41 output questions: Q4, 7, 11, 13, 14, 15, 17, 18, 21, 25, 26, 27, 28, 31, 32, 36, 37, 41, 46, 47, 48, 49, 50, 54, 56, 59, 68, 71, 72, 73, 74, 75, 76, 77, 80, 81, 82, 83, 84, 85, 94): I traced each one by hand twice, the second time from scratch, writing every variable after every statement. Assumptions: GCC, 32-bit int, 4-byte alignment, ASCII, little-endian. Every trace matched the key.
- Undefined or unspecified behaviour: none found in any program. Q15 changes b twice, but the || and && sequence points make it well defined. Q14 has no side effects, so the order in which arguments are evaluated does not matter. Q67 is about undefined behaviour on purpose, and "undefined behaviour" is its keyed answer, which the brief allows. Q76's p + 4 is a valid one-past-the-end pointer.
- I also checked the fact and definition questions against the standard references. Every question has exactly one defensible answer, and every output question names its language.
- Duplicates: no repeated stems, and no question has two options with the same text.
- Answer positions are unchanged and balanced at 25 / 25 / 25 / 25.

## Changes

| Q | Problem | Fix |
|---|---|---|
| 3 | The key (compilation error) is right, but the explanation said the compiler "rejects the literal". javac 21 actually reports `';' expected`: it reads `01` as an octal literal and then finds a stray `9`. A student who checks this would see a different message from the one described. | I rewrote the explanation: 019 is not a valid octal literal, so the program does not compile, and I added the real javac message and the reason for it. The key is unchanged. |

No answer_index was changed. No stem, code or option was reworded. No UB rewrites were needed.

## C/C++ questions where my two traces disagreed
None. Both traces agreed with each other and with the key for every C and C++ question.
