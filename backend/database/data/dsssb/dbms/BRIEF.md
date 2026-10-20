# DBMS for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT Computer Science candidate revising DBMS to score full marks. Plain, exact English.
Exam: objective MCQ, 1 mark, −0.25 for a wrong answer. DBMS is about 6 questions per paper (of ~88 CS questions).

## Syllabus (owner's list)
ER model · keys · relational model · normalisation 1NF–BCNF · SQL DDL/DML/joins/subqueries/aggregate · transactions ACID · indexing basics.

## How DSSSB actually asks DBMS (all 23 questions from the 4 official papers, 2023–2024)
Full list with options, official answers and solutions: `dbms_pyq_analysis.json` (same folder as this brief's parent: `backend/database/data/dsssb/dbms_pyq_analysis.json`). READ IT FIRST.

Patterns:
1. **Textbook-definition one-liners in Korth / Navathe wording** (about 60%): "association among several entities" = relationship; "collection of entities with the same attributes" = entity set/type; "descriptive attributes are used to…"; "DDL defines the structure of relations…"; "what makes a database relational"; "an ordered file of fixed-length records with two fields, primary key and block pointer" = primary index; "integrity constraint between two relations" = referential integrity; "1NF disallows relations within relations / multivalued / composite attributes"; ER term corresponding to a foreign key = relationship (type).
2. **SQL syntax and built-in functions** (about 30%): SELECT *, LIKE, concatenation operator (||, also + in SQL Server, CONCAT() in MySQL), aggregate vs non-aggregate functions, DEFAULT constraint, DROP SCHEMA … RESTRICT / CASCADE (schema evolution), DATEDIFF(datepart, startdate, enddate) semantics, CEILING/CEIL, FLOOR, ROUND, CURRENT_TIMESTAMP / GETDATE() / SYSDATETIME() / SYSDATETIMEOFFSET() (SQL Server date functions are asked — cover MySQL, SQL Server and Oracle names side by side).
3. **Short numericals/analysis** (about 10%): attribute closure (PQ)+ from a given FD set; which schedule is conflict serializable (precedence graph); Armstrong's axioms (reflexivity, augmentation, transitivity) vs derived rules (union, decomposition, pseudo-transitivity).
4. **Beyond the owner's list but asked**: ODBC/JDBC (application ↔ database server communication), relational algebra operations (set difference, union, intersection, select σ, project π, rename ρ, Cartesian product, join, division), schema evolution commands.

Implication: cover every textbook definition precisely, every common SQL clause/function/operator with exact names, and the 3–4 numerical types with worked steps.

## Chapters (use these exact chapter titles and keys everywhere)
| key | chapter title |
|---|---|
| db_intro | Introduction & Database Architecture |
| db_er | ER Model |
| db_relational | Relational Model, Keys & Relational Algebra |
| db_normal | Functional Dependencies & Normalisation |
| db_sql | SQL |
| db_txn | Transactions & Concurrency Control |
| db_index | Indexing & File Organisation |

## Facts must be correct
Use standard textbook definitions (Korth "Database System Concepts", Navathe "Fundamentals of Database Systems") and standard SQL / MySQL / SQL Server documentation. If MySQL and SQL Server differ, say so in a table. Never invent syntax.
