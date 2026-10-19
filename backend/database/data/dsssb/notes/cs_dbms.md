# DBMS & SQL: DSSSB TGT Computer Science Revision Notes

## 1. One-page summary

- Expect about 6-8 DBMS/SQL questions in Section B. Most are direct facts (keys, normal forms, ACID, command categories) and a few are "find the output" queries on a small table.
- For output questions, write the table on rough paper and apply the clauses in execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.
- Three-schema architecture: external (user views), conceptual (logical), internal (physical storage). Physical data independence (change storage, keep schema) is easier to achieve than logical data independence (change schema, keep views).
- Degree = number of attributes (columns). Cardinality = number of tuples (rows).
- NULL means "unknown", not zero. Most traps in SQL output questions come from NULL.

## 2. ER model and notation (Chen)

| Symbol | Meaning |
|---|---|
| Rectangle | Strong entity set |
| Double rectangle | Weak entity set (no key of its own) |
| Ellipse | Attribute |
| Underlined attribute | Key attribute |
| Dashed underline | Partial key (discriminator) of a weak entity |
| Double ellipse | Multivalued attribute (e.g. phone numbers) |
| Dashed ellipse | Derived attribute (e.g. age from date of birth) |
| Diamond | Relationship set |
| Double diamond | Identifying relationship (owner ↔ weak entity) |
| Double line | Total participation |

- Mapping cardinalities: 1:1, 1:N, N:1, M:N. An M:N relationship always becomes a separate table whose key combines both entity keys.
- A composite attribute (name → first, last) has sub-parts; a simple attribute does not.
- Generalisation is bottom-up (combine entities into a superclass); specialisation is top-down; aggregation treats a relationship as an entity.

## 3. Keys

| Key | Definition |
|---|---|
| Super key | Any set of attributes that uniquely identifies a tuple |
| Candidate key | A minimal super key (no proper subset is a super key) |
| Primary key | The candidate key chosen by the designer; cannot be NULL; only one per table |
| Alternate key | Candidate keys not chosen as primary |
| Foreign key | Attribute(s) referring to the primary/candidate key of another (or the same) table |
| Composite key | A key made of two or more attributes |

- Every candidate key is a super key, but not every super key is a candidate key.
- A relation with n attributes whose only candidate key is a single attribute has 2^(n−1) super keys.
- Entity integrity: the primary key cannot be NULL. Referential integrity: a foreign key value must match an existing referenced value or be NULL.

## 4. Relational model and relational algebra

- Relation = table, tuple = row, attribute = column, domain = set of allowed values. Tuples in a relation have no order, and duplicate tuples are not allowed.
- Six fundamental operators: select σ (rows), project π (columns), union ∪, set difference −, Cartesian product ×, rename ρ.
- Derived operators: intersection ∩, join ⋈ (natural, theta, equi), division ÷ (used for "for all" queries).
- Union, intersection and difference need union-compatible relations: same degree and matching domains.
- R × S: degree = deg(R) + deg(S), cardinality = |R| × |S|.
- π removes duplicate tuples in relational algebra; SQL SELECT does not, unless DISTINCT is used.

## 5. Normalisation

- Functional dependency X → Y: each X value determines exactly one Y value.
- Normalisation removes insertion, deletion and update anomalies caused by redundancy.

| Normal form | Condition |
|---|---|
| 1NF | All values atomic; no repeating groups |
| 2NF | 1NF + no partial dependency (non-prime attribute depending on part of a composite key) |
| 3NF | 2NF + no transitive dependency (non-prime → non-prime) |
| BCNF | For every non-trivial X → Y, X is a super key |

Worked example. Unnormalised: (Roll, Name, Courses = "C1, C2", Teacher, TPhone).

**1NF**: split the multivalued Courses into one row each. The key becomes (Roll, CourseID).

| Roll | Name | CourseID | CourseName | Teacher | TPhone |
|---|---|---|---|---|---|
| 1 | Asha | C1 | DBMS | Mehta | 9111 |
| 1 | Asha | C2 | Python | Rao | 9222 |
| 2 | Ravi | C1 | DBMS | Mehta | 9111 |

**2NF**: Name depends only on Roll, and CourseName/Teacher depend only on CourseID (partial dependencies). Split into STUDENT(Roll, Name), ENROL(Roll, CourseID) and COURSE(CourseID, CourseName, Teacher, TPhone).

**3NF**: in COURSE, CourseID → Teacher → TPhone is transitive. Split into COURSE(CourseID, CourseName, Teacher) and TEACHER(Teacher, TPhone).

- BCNF is stricter than 3NF. Classic case: (Student, Subject, Teacher) with Teacher → Subject and key (Student, Subject) is in 3NF but not in BCNF, because Teacher is not a super key.
- Every BCNF relation is in 3NF; every 3NF relation is in 2NF. A two-attribute relation is always in BCNF.
- Decomposition must be lossless. A 3NF decomposition can always preserve dependencies; a BCNF decomposition may not.

## 6. SQL command categories

| Category | Commands | Note |
|---|---|---|
| DDL (Definition) | CREATE, ALTER, DROP, TRUNCATE, RENAME | Changes structure; auto-commits in MySQL |
| DML (Manipulation) | INSERT, UPDATE, DELETE, SELECT (SELECT is sometimes called DQL) | Changes or reads data; can be rolled back |
| DCL (Control) | GRANT, REVOKE | Privileges |
| TCL (Transaction) | COMMIT, ROLLBACK, SAVEPOINT | Ends or partially undoes a transaction |

```sql
CREATE TABLE emp (
  eid    INT PRIMARY KEY,
  name   VARCHAR(30) NOT NULL,
  salary DECIMAL(8,2) CHECK (salary > 0),
  city   VARCHAR(20) DEFAULT 'Delhi',
  did    INT,
  FOREIGN KEY (did) REFERENCES dept(did)
);
ALTER TABLE emp ADD email VARCHAR(40) UNIQUE;
UPDATE emp SET salary = salary * 1.1 WHERE did = 10;
```

- DELETE (DML) removes chosen rows, can use WHERE and can be rolled back. TRUNCATE (DDL) removes all rows and keeps the structure. DROP removes the table itself.
- CHAR is fixed length; VARCHAR is variable length.

## 7. Constraints

| Constraint | Effect |
|---|---|
| NOT NULL | Column must have a value |
| UNIQUE | No duplicate values; NULLs allowed (MySQL allows several) |
| PRIMARY KEY | UNIQUE + NOT NULL; one per table (may be composite) |
| FOREIGN KEY | Referential integrity; options such as ON DELETE CASCADE / SET NULL |
| CHECK | Value must satisfy a condition (enforced in MySQL from 8.0.16) |
| DEFAULT | Value used when none is supplied |

## 8. Joins (with example)

EMP(eid, name, did) = (1, Asha, 10), (2, Ravi, 20), (3, Mona, NULL). DEPT(did, dname) = (10, Sales), (30, HR).

| Join | Rows returned | Count |
|---|---|---|
| INNER (equi) on did | Asha–Sales | 1 |
| LEFT OUTER | Asha–Sales, Ravi–NULL, Mona–NULL | 3 |
| RIGHT OUTER | Asha–Sales, NULL–HR | 2 |
| FULL OUTER | Asha–Sales, Ravi–NULL, Mona–NULL, NULL–HR | 4 |
| CROSS | Every EMP row with every DEPT row | 3 × 2 = 6 |
| NATURAL | Joins on the common column did automatically | 1 |

```sql
SELECT e.name, d.dname
FROM emp e LEFT JOIN dept d ON e.did = d.did;
```

- MySQL has no FULL OUTER JOIN keyword; it is written as a LEFT JOIN UNION a RIGHT JOIN.
- A self join joins a table to itself using aliases (e.g. employee and manager).

## 9. Subqueries

- A subquery is a SELECT inside another statement. Operators: IN, NOT IN, EXISTS, ANY, ALL, and comparison with a single-value (scalar) subquery.
- Non-correlated: runs once, independent of the outer query. Correlated: refers to the outer row and is evaluated once per outer row.

```sql
-- employees earning more than the average
SELECT name FROM emp WHERE salary > (SELECT AVG(salary) FROM emp);

-- correlated: highest earner in each department
SELECT name FROM emp e
WHERE salary = (SELECT MAX(salary) FROM emp WHERE did = e.did);
```

- `> ALL (...)` means greater than the maximum; `> ANY (...)` means greater than the minimum.

## 10. Aggregate functions, GROUP BY and HAVING

- COUNT, SUM, AVG, MAX, MIN. All ignore NULLs except COUNT(*).
- WHERE filters rows before grouping and cannot contain an aggregate. HAVING filters groups after grouping.
- Every non-aggregated column in SELECT should appear in GROUP BY.

```sql
SELECT did, COUNT(*) AS staff, AVG(salary)
FROM emp
WHERE city = 'Delhi'
GROUP BY did
HAVING COUNT(*) > 2
ORDER BY did DESC;
```

## 11. Views

- A view is a virtual table defined by a stored query; it stores no data of its own (materialised views do, but MySQL does not support them natively).
- Uses: security (hide columns or rows), simpler queries, logical data independence.
- A view is updatable only if it maps to one base table without aggregates, DISTINCT, GROUP BY or HAVING. WITH CHECK OPTION blocks changes that would make a row disappear from the view.

```sql
CREATE VIEW delhi_emp AS SELECT eid, name FROM emp WHERE city = 'Delhi';
DROP VIEW delhi_emp;
```

## 12. Transactions and ACID

| Property | Meaning | Ensured by |
|---|---|---|
| Atomicity | All or nothing | Recovery system (undo log) |
| Consistency | Valid state to valid state | Constraints + correct programs |
| Isolation | Concurrent transactions do not interfere | Concurrency control |
| Durability | Committed changes survive failure | Recovery system (redo log) |

- Transaction states: active → partially committed → committed; or active → failed → aborted.
- ROLLBACK TO SAVEPOINT s undoes only the work done after s.

## 13. Concurrency control and locking

- Problems: lost update, dirty read (reading uncommitted data), non-repeatable read, phantom read.

| Isolation level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| READ UNCOMMITTED | Possible | Possible | Possible |
| READ COMMITTED | Prevented | Possible | Possible |
| REPEATABLE READ (InnoDB default) | Prevented | Prevented | Possible (per SQL standard) |
| SERIALIZABLE | Prevented | Prevented | Prevented |

- Shared (S) lock for reading, exclusive (X) lock for writing. Only S with S is compatible.
- Two-phase locking (2PL): a growing phase (acquire only) then a shrinking phase (release only). It guarantees conflict serializability but does not prevent deadlock.
- Strict 2PL holds X locks until commit or abort, which avoids cascading rollbacks.
- A schedule is conflict serializable if its precedence graph has no cycle.
- Timestamp ordering is a lock-free protocol based on transaction start times.

## 14. Indexing basics

- An index speeds up searching (SELECT) but slows INSERT, UPDATE and DELETE and takes extra space.
- Dense index: an entry for every search-key value. Sparse index: entries for only some values (needs the data file sorted on the key).
- Clustered (primary) index: the data file is ordered on the index key, so only one per table. Secondary (non-clustered) index: many allowed.
- B+ tree: all data pointers at leaf level and leaves linked, so it is good for range queries. A hash index suits equality search only.
- In MySQL InnoDB, the primary key is the clustered index.

```sql
CREATE INDEX idx_name ON emp(name);
```

## 15. Common MySQL functions

| Function | Example | Result |
|---|---|---|
| CONCAT | CONCAT('DS', 'SSB') | DSSSB |
| LENGTH | LENGTH('India') | 5 |
| UPPER / LOWER (UCASE / LCASE) | UPPER('cs') | CS |
| SUBSTR / MID (str, pos, len) | SUBSTR('COMPUTER', 4, 3) | PUT |
| LEFT / RIGHT | LEFT('COMPUTER', 3) | COM |
| INSTR | INSTR('COMPUTER', 'PUT') | 4 |
| TRIM / LTRIM / RTRIM | TRIM('  hi  ') | hi |
| ROUND | ROUND(15.193, 1) / ROUND(15.193, -1) | 15.2 / 20 |
| TRUNCATE | TRUNCATE(15.79, 1) | 15.7 |
| MOD / POW / SQRT | MOD(17, 5) / POW(2, 3) / SQRT(25) | 2 / 8 / 5 |
| CEIL / FLOOR | CEIL(4.2) / FLOOR(4.8) | 5 / 4 |
| NOW / CURDATE | NOW() / CURDATE() | Current date and time / date only |
| YEAR / MONTH / DAY | MONTH('2026-10-20') | 10 |
| DAYNAME / MONTHNAME | MONTHNAME('2026-10-20') | October |

- SQL string positions start at 1, not 0.
- LIKE: % = any number of characters (including none), _ = exactly one. BETWEEN is inclusive of both ends.

## 16. Frequently asked in DSSSB

- Key definitions: candidate vs primary vs alternate vs super key; foreign key and referential integrity.
- Which normal form removes partial or transitive dependency; the BCNF definition.
- Classifying commands into DDL/DML/DCL/TCL (especially TRUNCATE and GRANT).
- ACID expansions and which component ensures each property.
- Output of queries using GROUP BY/HAVING, COUNT with NULL, and string and maths functions.
- Join row counts, and the degree and cardinality of a Cartesian product.
- ER symbols: weak entity, multivalued and derived attributes.

## 17. Fifteen one-liners

1. A candidate key is a minimal super key.
2. A table has exactly one primary key, which may be composite.
3. Alternate keys = candidate keys − primary key.
4. A weak entity is shown by a double rectangle and depends on its owner through an identifying relationship.
5. A derived attribute is drawn as a dashed ellipse.
6. 2NF removes partial dependency; 3NF removes transitive dependency.
7. In BCNF every determinant is a super key.
8. TRUNCATE is DDL; DELETE is DML.
9. GRANT and REVOKE are DCL commands.
10. HAVING filters groups; WHERE filters rows.
11. COUNT(*) counts rows containing NULLs; COUNT(column) skips NULLs in that column.
12. A view is a virtual table based on a stored query.
13. Durability means committed data survives a system crash.
14. Two-phase locking ensures conflict serializability but not freedom from deadlock.
15. A B+ tree keeps all record pointers at the leaf level, with leaves linked for range queries.

## 18. Five traps

1. **= NULL.** `WHERE comm = NULL` returns no rows. Use `IS NULL` / `IS NOT NULL`.
2. **AVG and NULL.** AVG(col) divides by the number of non-NULL values, not by the total row count.
3. **Aggregate in WHERE.** `WHERE COUNT(*) > 2` is an error; the condition belongs in HAVING.
4. **Cartesian product.** Degrees add but cardinalities multiply: relations of 3 and 4 columns with 5 and 6 rows give degree 7 and 30 rows.
5. **UNIQUE vs PRIMARY KEY.** UNIQUE accepts NULLs and a table may have many UNIQUE columns; a PRIMARY KEY accepts no NULL and only one exists per table.
