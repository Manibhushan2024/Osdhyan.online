# Relational Model, Keys & Relational Algebra

**In 30 seconds**

- ⭐ The relational model (E. F. Codd, 1970) represents the database as a **collection of tables (relations)** – that is what makes a database relational.
- Table = **relation**, row = **tuple**, column = **attribute**, set of allowed values = **domain**. Number of attributes = **degree (arity)**; number of tuples = **cardinality**.
- **Super key** ⊇ **candidate key** (minimal super key) ⊇ one chosen **primary key**; the other candidate keys are **alternate keys**. With n attributes and a single-attribute candidate key there are 2^(n−1) super keys.
- **Entity integrity**: no primary-key value may be NULL. ⭐ **Referential integrity** is specified **between two relations** to keep their tuples consistent: a foreign key must match an existing primary key or be NULL.
- **Relational algebra** is a procedural query language. Fundamental operations: σ, π, ∪, −, ×, ρ. Derived: ∩, ⋈, ÷, assignment ←.
- ⭐ **R − S** contains the tuples in R but not in S. ∪, ∩ and − need **union-compatible** relations.
- Relational algebra, safe tuple relational calculus and safe domain relational calculus have **equal expressive power**.

---

## 1. Basic terminology

| Informal (table) term | Formal term | Definition |
|---|---|---|
| Table | **Relation** | A set of tuples; r(R) ⊆ dom(A1) × dom(A2) × … × dom(An) (Navathe) |
| Row | **Tuple** | An ordered list of n values t = ⟨v1, v2, …, vn⟩, each vi from dom(Ai) or NULL |
| Column header | **Attribute** | Name of a role played by a domain in the relation schema |
| Set of allowed values | **Domain** | "A set of atomic values" (Navathe); Korth: the set of permitted values for an attribute |
| Number of columns | **Degree (arity)** | Number of attributes n of the relation schema |
| Number of rows | **Cardinality** | Number of tuples in the current relation instance |
| Table definition | **Relation schema** | R(A1, A2, …, An): relation name + list of attributes (Navathe) |
| Table contents | **Relation instance / state** | The set of tuples at a given moment |

A **relational database schema** is a set of relation schemas plus a set of integrity constraints; a **relational database state** is a set of relation states satisfying them.

Example relation STUDENT (degree 4, cardinality 3):

| Roll_No | Name | Class | City |
|---|---|---|---|
| 1 | Asha | 10 | Delhi |
| 2 | Ravi | 9 | Noida |
| 3 | Meena | 10 | Delhi |

Schema: STUDENT(Roll_No, Name, Class, City). dom(Class) = {6, 7, …, 12}.

### Properties of relations

1. **Tuples are unordered** – a relation is a set, so row order has no meaning.
2. **No duplicate tuples** – a set cannot contain the same element twice (SQL tables, which are multisets, can).
3. **Attribute values are atomic** – each value is indivisible; no composite or multivalued values (the **flat relational model**; this is 1NF). ⭐ 1NF "disallows relations within relations" – asked in DSSSB (7 Feb 2024, S2).
4. **Each attribute has a distinct name** within a relation.
5. **Order of attributes** is not significant if a tuple is viewed as a set of (attribute, value) pairs; it matters in the ordered-list definition.
6. **All values in a column come from the same domain.**
7. A value may be **NULL** when unknown or not applicable.

### What makes a database relational

⭐ **Asked in DSSSB (25 Jun 2023, S2)**: *what makes a database a relational database?* Options: Tables, Field, Records, Tuple. Answer: **Tables** – data is stored as relations (tables) linked by keys. Fields, records and tuples are only parts of a table.

Codd (1970, "A Relational Model of Data for Large Shared Data Banks") based the model on set theory and first-order predicate logic. Codd's 1985 rules define a fully relational DBMS.

### Codd's 12 rules (numbered 0–12, thirteen in all)

| Rule | Name | One line |
|---|---|---|
| 0 | Foundation rule | The system must manage databases entirely through its relational capabilities |
| 1 | Information rule | All information is represented explicitly as values in tables |
| 2 | Guaranteed access rule | Every value is accessible by table name + primary-key value + column name |
| 3 | Systematic treatment of NULL values | NULLs represent missing or inapplicable information, independent of data type |
| 4 | Dynamic online catalog | The database description (catalog) is itself stored as tables and queried with the same language |
| 5 | Comprehensive data sublanguage | At least one language supports data definition, manipulation, views, integrity, authorisation and transactions |
| 6 | View updating rule | All theoretically updatable views are updatable by the system |
| 7 | High-level insert, update, delete | Set-at-a-time insert, update and delete, not just retrieval |
| 8 | Physical data independence | Programs are unaffected by changes in storage or access methods |
| 9 | Logical data independence | Programs are unaffected by information-preserving changes to tables |
| 10 | Integrity independence | Integrity constraints are defined in the sublanguage and stored in the catalog, not in programs |
| 11 | Distribution independence | Users need not know whether the data is distributed |
| 12 | Non-subversion rule | A low-level (record-at-a-time) interface cannot bypass integrity rules |

### NULL

NULL means **value unknown**, **value exists but not available**, or **attribute not applicable** (Navathe). NULL is not zero and not an empty string. Any comparison with NULL gives **UNKNOWN** (three-valued logic), so `NULL = NULL` is not true; SQL tests NULL with `IS NULL` / `IS NOT NULL`.

---

## 2. Keys

| Key | Definition |
|---|---|
| **Super key** | "A set of one or more attributes that, taken collectively, allow us to identify uniquely a tuple in the relation" (Korth). Any superset of a super key is a super key |
| **Candidate key** | A **minimal** super key – no proper subset is a super key |
| **Primary key** | "A candidate key that is chosen by the database designer as the principal means of identifying tuples within a relation" (Korth). Cannot be NULL; only one per relation |
| **Alternate (secondary) key** | A candidate key not chosen as the primary key |
| **Composite key** | A key made of two or more attributes |
| **Foreign key** | An attribute set in relation r1 that refers to the primary key of r2; r1 is the **referencing** relation, r2 the **referenced** relation. Can be NULL and can repeat |
| **Unique key** | Attribute(s) declared UNIQUE: no duplicate non-NULL values, but NULL is allowed (MySQL, Oracle, PostgreSQL allow many NULLs; SQL Server allows only one NULL). A table may have several |
| **Surrogate key** | An artificial, system-generated key with no business meaning (MySQL AUTO_INCREMENT, SQL Server IDENTITY, Oracle SEQUENCE / IDENTITY) |
| **Natural key** | A key formed from real-world attributes (Email, Vehicle registration no.) |

**Prime attribute**: an attribute that is part of some candidate key. **Non-prime attribute**: part of no candidate key.

### Worked example

STUDENT(Adm_No, Email, Class, Section, Roll_No, Name)

| Adm_No | Email | Class | Section | Roll_No | Name |
|---|---|---|---|---|---|
| A101 | asha@sch.in | 10 | A | 1 | Asha |
| A102 | ravi@sch.in | 10 | A | 2 | Ravi |
| A103 | meena@sch.in | 10 | B | 1 | Meena |

Business rules: Adm_No unique; Email unique; within a class and section roll numbers are unique.

- Candidate keys: {Adm_No}, {Email}, {Class, Section, Roll_No}.
- Primary key: Adm_No (chosen). Alternate keys: Email and {Class, Section, Roll_No}.
- Composite key: {Class, Section, Roll_No}.
- Super keys include {Adm_No}, {Adm_No, Name}, {Email, Class}, {Class, Section, Roll_No, Name} and so on.
- {Class, Roll_No} is **not** a key (Asha and Meena share 10, 1). {Name} is not a key (names can repeat).
- Prime attributes: Adm_No, Email, Class, Section, Roll_No. Non-prime: Name.

### Counting super keys

For a relation with n attributes:

| Candidate keys | Number of super keys |
|---|---|
| One key of k attributes | 2^(n−k) |
| Two keys K1, K2 | (super keys containing K1) + (containing K2) − (containing K1 ∪ K2) |
| All n attributes form the only key | 1 |

Worked counts for R(A, B, C, D), n = 4:

| Candidate keys | Calculation | Super keys |
|---|---|---|
| {A} | 2^3 | **8** |
| {A}, {B} | 2^3 + 2^3 − 2^2 | **12** |
| {A}, {BC} | 2^3 + 2^2 − 2^1 | **10** |
| {AB}, {CD} | 2^2 + 2^2 − 2^0 | **7** |

Maximum number of super keys for n attributes is 2^n − 1 (every non-empty subset, when every single attribute is a key). Maximum number of candidate keys for n attributes is C(n, ⌊n/2⌋).

---

## 3. Integrity constraints

Navathe groups constraints into **inherent model-based** (e.g. no duplicate tuples), **schema-based / explicit** (declared in DDL) and **application-based / semantic** (business rules, enforced by triggers, assertions or programs).

| Constraint | Rule | SQL |
|---|---|---|
| **Domain constraint** | Every value of A must be an atomic value from dom(A) | Data type, CHECK |
| **Key constraint** | No two tuples have the same value for a candidate key | PRIMARY KEY, UNIQUE |
| **NOT NULL** | Attribute may not be NULL | NOT NULL |
| **Entity integrity** | "No primary key value can be NULL" (Navathe), because the PK identifies tuples | PRIMARY KEY implies NOT NULL |
| **Referential integrity** | "Specified between two relations and is used to maintain the consistency among tuples in the two relations" (Navathe): for each tuple t1 of the referencing relation, t1[FK] = t2[PK] for some t2 of the referenced relation, **or** t1[FK] is NULL | FOREIGN KEY … REFERENCES |
| **CHECK** | Each row must satisfy a condition, e.g. CHECK (Marks BETWEEN 0 AND 100) | CHECK (MySQL enforces it only from 8.0.16; older versions parsed and ignored it) |
| **DEFAULT** | Supplies a value when an INSERT gives none (not strictly an integrity constraint) | DEFAULT 'Delhi' |

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: the integrity constraint *specified between two relations to maintain consistency among tuples in the two relations*. Options: entity, semantic, functional, referential. Answer: **Referential integrity**. Entity integrity concerns **one** relation.

### Which operations can violate which constraint

| Operation | Can violate |
|---|---|
| **INSERT** | Domain, key, entity integrity, NOT NULL, referential (child row with a non-existent FK value) |
| **DELETE** | **Only referential integrity** (deleting a parent row that child rows still reference) |
| **UPDATE** | All of the above (updating a PK or FK is like delete + insert) |

### Referential actions (ON DELETE / ON UPDATE)

Example: `FOREIGN KEY (Class_ID) REFERENCES CLASS(Class_ID) ON DELETE SET NULL ON UPDATE CASCADE`

| Action | Effect when a referenced (parent) row is deleted or its key updated |
|---|---|
| **CASCADE** | Delete (or update) the matching child rows as well |
| **SET NULL** | Set the child FK to NULL (FK column must allow NULL) |
| **SET DEFAULT** | Set the child FK to its default value |
| **RESTRICT** | Reject the operation immediately if child rows exist |
| **NO ACTION** | Reject the operation if child rows exist, checked at the end of the statement; this is the **default** in standard SQL |

| DBMS | Support |
|---|---|
| MySQL (InnoDB) | CASCADE, SET NULL, RESTRICT, NO ACTION (RESTRICT and NO ACTION behave the same); SET DEFAULT is parsed but rejected by InnoDB |
| SQL Server | NO ACTION (default), CASCADE, SET NULL, SET DEFAULT; no RESTRICT keyword |
| Oracle | ON DELETE CASCADE and ON DELETE SET NULL; default is to reject; no ON UPDATE clause |

---

## 4. Relational algebra

Relational algebra is "a **procedural** query language" (Korth): it consists of operations that take one or two relations as input and produce a new relation as output, so operations can be nested (**closure** property).

Sample relations used below:

**STUDENT**

| Roll | Name | Class |
|---|---|---|
| 1 | Asha | 10 |
| 2 | Ravi | 9 |
| 3 | Meena | 10 |

**CLASS**

| Class | Teacher |
|---|---|
| 10 | Mr Rao |
| 11 | Ms Das |

**R** (Quiz club) and **S** (Science club), both with one attribute Name:

| R.Name |
|---|
| Asha |
| Ravi |
| Meena |

| S.Name |
|---|
| Ravi |
| Karan |

### 4.1 Unary operations

| Operation | Symbol and form | Meaning |
|---|---|---|
| **Select** | σ_condition(R) | Rows satisfying the condition (horizontal subset). Condition uses =, ≠, less than, greater than, ≤, ≥ with ∧, ∨, ¬ |
| **Project** | π_attribute-list(R) | Chosen columns (vertical subset); **duplicates are removed** |
| **Rename** | ρ_S(R) or ρ_S(B1, …, Bn)(R) | Renames the relation and/or its attributes; needed for self-joins |

σ_Class=10(STUDENT):

| Roll | Name | Class |
|---|---|---|
| 1 | Asha | 10 |
| 3 | Meena | 10 |

π_Class(STUDENT):

| Class |
|---|
| 10 |
| 9 |

(Only 2 rows: the duplicate 10 is removed. SQL's `SELECT Class FROM STUDENT` would return 3 rows unless you write DISTINCT.)

Facts: degree of σ result = degree of R, cardinality ≤ |R|; σ is **commutative** and a cascade of σ can be merged into one σ with ∧. Degree of π result = number of listed attributes; if the list includes a key, cardinality = |R|. In a cascade of π only the outermost list matters.

### 4.2 Set operations

**Union compatibility** (type compatibility): R and S must have the **same degree** and the **domains of corresponding attributes must be compatible**. Required for ∪, ∩ and −. The result takes the attribute names of the first relation.

| Operation | Result for the clubs | Definition |
|---|---|---|
| R ∪ S | Asha, Ravi, Meena, Karan | Tuples in R or S or both (duplicates removed) |
| R ∩ S | Ravi | Tuples in both R and S |
| R − S | Asha, Meena | Tuples in R but **not** in S |
| S − R | Karan | Tuples in S but not in R |

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: which operation *includes all tuples that are in R but not in S*? Answer: **R − S** (set difference).

Facts: ∪ and ∩ are **commutative and associative**; − is **neither** (R − S ≠ S − R). R ∩ S = R − (R − S). max(|R|, |S|) ≤ |R ∪ S| ≤ |R| + |S|; |R ∩ S| ≤ min(|R|, |S|).

### 4.3 Cartesian product

R × S combines **every** tuple of R with **every** tuple of S. Union compatibility is **not** needed. If R has degree n and cardinality r, S has degree m and cardinality s, then R × S has **degree n + m** and **cardinality r × s**.

STUDENT × CLASS has degree 3 + 2 = 5 and 3 × 2 = 6 tuples (first three shown):

| Roll | Name | STUDENT.Class | CLASS.Class | Teacher |
|---|---|---|---|---|
| 1 | Asha | 10 | 10 | Mr Rao |
| 1 | Asha | 10 | 11 | Ms Das |
| 2 | Ravi | 9 | 10 | Mr Rao |

### 4.4 Joins

| Join | Notation | Meaning |
|---|---|---|
| **Theta join** | R ⋈_θ S | σ_θ(R × S); θ may use any comparison operator |
| **Equi-join** | R ⋈_R.A=S.B S | Theta join using only **=**; both join columns appear in the result |
| **Natural join** | R ⋈ S | Equi-join on **all attributes with the same name**, keeping only **one copy** of each common attribute. If there are no common attributes it equals R × S |
| **Left outer join** | R ⟕ S | Natural join + unmatched R tuples padded with NULL |
| **Right outer join** | R ⟖ S | Natural join + unmatched S tuples padded with NULL |
| **Full outer join** | R ⟗ S | Natural join + unmatched tuples of both sides padded with NULL |
| **Semi-join** | R ⋉ S | Tuples of R that have a match in S (only R's attributes) |

STUDENT ⋈ CLASS (common attribute Class):

| Roll | Name | Class | Teacher |
|---|---|---|---|
| 1 | Asha | 10 | Mr Rao |
| 3 | Meena | 10 | Mr Rao |

STUDENT ⟕ CLASS (Ravi's class 9 has no match):

| Roll | Name | Class | Teacher |
|---|---|---|---|
| 1 | Asha | 10 | Mr Rao |
| 2 | Ravi | 9 | NULL |
| 3 | Meena | 10 | Mr Rao |

STUDENT ⟗ CLASS adds one more row: (NULL, NULL, 11, Ms Das).

Joins of the inner type (theta, equi, natural) are **inner joins**; their cardinality lies between 0 and |R| × |S|. If the join attribute is a FK of R referencing the PK of S and the FK has no NULLs, |R ⋈ S| = |R|.

### 4.5 Division

R(A, B) ÷ S(B) returns the A-values that are paired in R with **every** B-value of S. Keywords in a question: "**all**", "**every**". Expressed with basic operations:

R ÷ S = π_A(R) − π_A((π_A(R) × S) − R)

**ENROLLED**

| Name | Subject |
|---|---|
| Asha | CS |
| Asha | Maths |
| Ravi | CS |
| Meena | CS |
| Meena | Maths |
| Meena | Physics |

**SUBJ**

| Subject |
|---|
| CS |
| Maths |

ENROLLED ÷ SUBJ:

| Name |
|---|
| Asha |
| Meena |

Ravi is missing Maths, so he is excluded. Degree of result = degree(R) − degree(S).

### 4.6 Assignment and extended operations

- **Assignment** (←) stores an intermediate result in a temporary relation variable: Temp1 ← σ_Class=10(STUDENT); Result ← π_Name(Temp1).
- **Generalised projection** allows arithmetic in the projection list: π_Name, Marks×1.1(R).
- **Aggregation** (Korth writes a calligraphic G, Navathe writes ℑ): Class 𝒢 count(Roll)(STUDENT) gives the number of students in each class.

### 4.7 Basic vs derived operations

| Fundamental (basic) | Derived (expressible through basic ones) |
|---|---|
| Select σ | Intersection: R ∩ S = R − (R − S) |
| Project π | Theta join: σ_θ(R × S) |
| Union ∪ | Natural join: π_list(σ_common attrs equal(R × S)) |
| Set difference − | Division: π_A(R) − π_A((π_A(R) × S) − R) |
| Cartesian product × | Assignment ← |
| Rename ρ | Outer joins (via join, difference, union and NULL constants) |

Korth lists six fundamental operations (σ, π, ∪, −, ×, ρ). Navathe says {σ, π, ∪, ρ, −, ×} is a **complete set**: any other relational algebra operation can be expressed as a sequence of these. σ, π and ρ are **unary**; the rest are **binary**.

---

## 5. Relational calculus

Relational calculus is **non-procedural (declarative)**: it specifies **what** to retrieve, not how. It is based on predicate calculus.

### Tuple relational calculus (TRC)

A query has the form { t | P(t) }: the set of all tuples t for which predicate P is true. Variables range over **tuples**.

- Names of students in class 10: { t.Name | t ∈ STUDENT ∧ t.Class = 10 }
- Quantifiers: ∃ (there exists) and ∀ (for all). A variable bound by a quantifier is **bound**; otherwise it is **free**.
- Students who have a class teacher: { t | t ∈ STUDENT ∧ ∃ c (c ∈ CLASS ∧ c.Class = t.Class) }

### Domain relational calculus (DRC)

A query has the form { ⟨x1, x2, …, xn⟩ | P(x1, x2, …, xn) }. Variables range over **domain values** (attribute values).

- Names of students in class 10: { ⟨n⟩ | ∃ r, c (⟨r, n, c⟩ ∈ STUDENT ∧ c = 10) }
- **QBE (Query-By-Example)** is based on DRC; SQL is loosely based on TRC.

### Safety and expressive power

An expression such as { t | ¬(t ∈ STUDENT) } is **unsafe** because it can produce infinitely many tuples. A **safe** expression only produces values from the database (its domain). Relational algebra, **safe** TRC and **safe** DRC are **equivalent in expressive power**. A language that can express every relational algebra query is called **relationally complete** (Codd); SQL is relationally complete.

---

## 6. Relational algebra ↔ SQL

| Relational algebra | SQL equivalent |
|---|---|
| σ_Class=10(STUDENT) | SELECT * FROM STUDENT WHERE Class = 10 |
| π_Name, Class(STUDENT) | SELECT DISTINCT Name, Class FROM STUDENT |
| ρ_S(STUDENT) | FROM STUDENT AS S (table alias); column alias with AS |
| R ∪ S | SELECT … UNION SELECT … (UNION ALL keeps duplicates) |
| R ∩ S | INTERSECT (MySQL only from 8.0.31; otherwise IN / EXISTS) |
| R − S | EXCEPT (standard, SQL Server, PostgreSQL; MySQL from 8.0.31); MINUS in Oracle |
| R × S | SELECT * FROM R CROSS JOIN S, or FROM R, S |
| R ⋈_θ S | SELECT * FROM R JOIN S ON θ |
| R ⋈ S | SELECT * FROM R NATURAL JOIN S (not supported in SQL Server; use JOIN … ON) |
| R ⟕ S, R ⟖ S, R ⟗ S | LEFT, RIGHT, FULL OUTER JOIN (MySQL has no FULL OUTER JOIN; use LEFT UNION RIGHT) |
| R ÷ S | No direct operator; use NOT EXISTS (… EXCEPT …) or GROUP BY … HAVING COUNT(*) = (SELECT COUNT(*) FROM S) |
| Aggregation 𝒢 | GROUP BY with COUNT, SUM, AVG, MAX, MIN |

Key difference: relational algebra works on **sets** (no duplicates); SQL works on **multisets (bags)** and keeps duplicates unless DISTINCT is used.

---

## Exam traps

1. "What makes a database relational?" → **tables (relations)**, not fields, records or tuples.
2. **Degree** = number of columns (attributes); **cardinality** = number of rows (tuples). In the ER chapter "cardinality" means mapping ratio – different meaning.
3. **Referential integrity** is between **two** relations; **entity integrity** (PK not NULL) is within **one**.
4. A **foreign key may be NULL and may repeat**; a primary key may do neither.
5. A **UNIQUE** column accepts NULL; a PRIMARY KEY does not. There can be many UNIQUE constraints but only one PRIMARY KEY.
6. **DELETE can violate only referential integrity**; INSERT can violate all four main constraints.
7. **π removes duplicates** in relational algebra; SQL SELECT does not unless DISTINCT is written.
8. **R − S ≠ S − R**; set difference is not commutative. ∪ and ∩ are.
9. **Cartesian product** needs no union compatibility; degree adds, cardinality multiplies.
10. Natural join with **no common attribute** = Cartesian product. Intersection, join and division are **derived**, not basic.

## One-liners for revision

1. Relational model: E. F. Codd, 1970.
2. Relation = table; tuple = row; attribute = column; domain = set of atomic values.
3. Degree (arity) = number of attributes.
4. Cardinality = number of tuples.
5. Relation schema = intension; relation instance = extension.
6. Tuples in a relation are unordered and distinct.
7. Values are atomic – flat relational model (1NF).
8. Codd has 13 rules numbered 0 to 12; Rule 0 is the foundation rule.
9. Rule 1 information rule; Rule 2 guaranteed access; Rule 3 NULLs.
10. Rule 12 non-subversion: low-level access cannot bypass integrity.
11. Super key: uniquely identifies tuples.
12. Candidate key: minimal super key.
13. Primary key: chosen candidate key; NOT NULL and unique.
14. Alternate key: candidate key not chosen as primary.
15. Foreign key refers to the primary key of another (or the same) relation.
16. Surrogate key is system-generated; natural key has business meaning.
17. One candidate key of k attributes in n attributes: 2^(n−k) super keys.
18. Entity integrity: no PK value is NULL.
19. Referential integrity: FK value matches an existing PK or is NULL.
20. ON DELETE CASCADE deletes child rows with the parent.
21. Relational algebra is procedural; relational calculus is non-procedural.
22. Basic operations: σ, π, ∪, −, ×, ρ.
23. σ selects rows; π selects columns; ρ renames.
24. Union compatibility: same degree and compatible domains.
25. R × S: degree n + m, cardinality r × s.
26. Theta join = σ_θ(R × S); equi-join uses only =.
27. Natural join joins on all same-named attributes and keeps one copy.
28. Division answers "for all / every" queries.
29. R ∩ S = R − (R − S).
30. RA, safe TRC and safe DRC have equal expressive power.

## Quick self-check

1. A relation has 5 attributes and 40 tuples. What are its degree and cardinality?
   **Answer:** Degree 5, cardinality 40.
2. R(A, B, C, D) has candidate keys {A} and {B}. How many super keys does it have?
   **Answer:** 12 (8 + 8 − 4).
3. Which integrity constraint states that a primary key cannot be NULL?
   **Answer:** Entity integrity constraint.
4. Which operation gives the tuples present in R but not in S?
   **Answer:** Set difference, R − S.
5. R has 3 attributes and 4 tuples; S has 2 attributes and 5 tuples. Give the degree and cardinality of R × S.
   **Answer:** Degree 5, cardinality 20.
6. Which relational algebra operation is used for queries containing "all" or "every"?
   **Answer:** Division (÷).
7. Which of these is not a fundamental operation: σ, ∪, ∩, ×?
   **Answer:** ∩ (intersection), since R ∩ S = R − (R − S).
8. Which referential action automatically deletes child rows when the parent row is deleted?
   **Answer:** ON DELETE CASCADE.
