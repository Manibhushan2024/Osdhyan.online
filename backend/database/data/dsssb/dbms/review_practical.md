# Review log: questions_practical.json (100 questions)

Each question was solved on its own before the key was checked. All "what is the output" queries (Q6, 7, 9, 16-18, 21-24, 26, 27, 30-33, 36-42, 44, 47-49, 66, 67, 69) were run in Python sqlite3. MySQL / SQL Server functions (ROUND, TRUNCATE, MOD, CEILING/FLOOR, DATEDIFF, DATEADD, CONCAT, ||, +) were checked against documented behaviour, with the arithmetic redone in Python. Precedence graphs (Q76, Q77), view serializability (Q78), the lost-update value (Q82) and the index and blocking-factor numericals (Q96, Q97) were checked with a script.

Result: all 100 answer keys are correct. No key changed. Answer positions stay at 25/25/25/25. No duplicate questions.

## Changes

| Q | Problem | Fix |
|---|---|---|
| 7 | The answer depends on CHECK being enforced. MySQL before 8.0.16 parses CHECK but ignores it, so all four INSERTs would be accepted there. | Stem now starts "In standard SQL (where CHECK constraints are enforced, as in MySQL 8.0.16+, SQL Server and Oracle)". |
| 13 | DROP SCHEMA ... CASCADE is standard SQL (Navathe). In MySQL, DROP SCHEMA means DROP DATABASE and has no CASCADE clause, so the statement is a syntax error. | Stem now says "In standard SQL". |
| 14 | MySQL accepts RESTRICT on DROP TABLE but ignores it, so the answer only holds in standard SQL. | Stem now says "In standard SQL". |
| 65 | REVOKE ... CASCADE is standard-SQL syntax (MySQL does not support it), so the stem needed to name the standard. | Stem now says "In standard SQL". |
| 78 | The explanation said "the last option is impossible", but the last option (D, view serializable but not conflict serializable) is the correct answer. The impossible option is C. | The explanation now names the impossible option in words: "conflict serializable but not view serializable" can never be true. |
