# Review log: questions_oop_python.json

Reviewed 2026-10-20 by an independent examiner. All 100 questions were reviewed.

## How the keys were checked
- I extracted and ran all 47 Java and Python snippets (javac/java 21, Python 3 with pandas). Every output matches the keyed option exactly.
- I traced the five C++ snippets by hand, twice each, and all five keys are correct:
  - Q4: B D ~D ~B
  - Q11: Shape CircleArea
  - Q29: 5
  - Q31: DCC
  - Q33: 5 6
- None of the questions contains C# code. I checked the .NET and C# fact questions (Q36-Q50) against the Microsoft docs.
- I checked the fact and definition questions for a single defensible answer. There are no duplicate stems and no duplicate options. Answer positions are balanced at 25/25/25/25.

## Keys changed
None.

## Changes
| Q | Problem | Fix |
|---|---|---|
| 18 | The stem named no language. In Java, protected also gives access to the whole package, so "not to unrelated outside code" was not strictly true there. The option "virtual" shows the question means C++. | The stem now starts with "In C++, ...". |
| 32 | The stem did not name the language, but the brief says every question must. | Reworded to "In a C++ program, the statement cin >> age; is followed by getline(cin, name);, and name gets an empty string. Why?" |
| 38 | The explanation called "no unsigned public types" a feature that languages "must support". That is a CLS rule, not a feature. | The explanation now reads: "It lists the rules that every CLS-compliant language and library must follow (for example, public members should not use unsigned types such as uint)." |
