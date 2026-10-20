# ER Model

**In 30 seconds**

- The **Entity–Relationship (ER) model** (Peter Chen, 1976) is a high-level **conceptual** data model used in database design; its diagram is converted into relations later.
- ⭐ A **relationship** is "an association among several entities" (Korth). A **relationship set** is a set of relationships of the same type.
- ⭐ An **entity type** "defines a collection of entities that have the same attributes" (Navathe); the **entity set** is the collection of such entities in the database at a given moment.
- ⭐ **Descriptive attributes** are attributes of a relationship set; they record information **about the relationship**.
- **Mapping cardinalities**: 1:1, 1:N, N:1, M:N. **Participation**: total (double line) or partial (single line).
- A **weak entity set** has no key of its own; it is identified by an **owner** entity set through an **identifying relationship** plus its **partial key (discriminator)**.
- **EER**: specialisation (top-down), generalisation (bottom-up), attribute inheritance, aggregation; constraints disjoint/overlapping and total/partial.
- ⭐ In ER-to-relational mapping, a **1:1 or 1:N relationship type corresponds to a foreign key**; an **M:N relationship type needs its own relation with two foreign keys**.

---

## 1. Entities and entity sets

| Term | Textbook definition | Example |
|---|---|---|
| **Entity** | "A 'thing' or 'object' in the real world that is distinguishable from all other objects" (Korth) | The student Asha, roll no 12 |
| **Entity set** (Korth) | "A set of entities of the same type that share the same properties, or attributes" | All students of the school |
| **Entity type** (Navathe) | "Defines a collection (or set) of entities that have the same attributes" | STUDENT |
| **Entity set** (Navathe) | "The collection of all entities of a particular entity type in the database at any point in time" – the **extension** | The 1,200 students enrolled today |
| **Attribute** | "Descriptive properties possessed by each member of an entity set" (Korth) | Name, DOB, Address |
| **Domain / value set** | The set of permitted values for an attribute | Age: integers 3–20 |

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: the term for *a collection of entities that have the same attributes* – options included Entity type, Entity set, Value set. Official answer: **Entity type** (Navathe's wording). Navathe separates the two: entity type = the schema/intension; entity set = the extension at one moment. Korth uses "entity set" for both ideas, so read the wording: "defines a collection … same attributes" points to **entity type**.

---

## 2. Attribute types

| Type | Meaning | Example | Chen symbol |
|---|---|---|---|
| **Simple (atomic)** | Not divisible further | Roll_No, Gender | Ellipse |
| **Composite** | Can be divided into smaller sub-parts with independent meaning | Address(House_No, Street, City, PIN); Name(First, Middle, Last) | Ellipse connected to its component ellipses |
| **Single-valued** | One value per entity | DOB | Ellipse |
| **Multivalued** | A set of values per entity, with lower and upper bounds | {Phone_No}, {Email}, {Degree} | **Double ellipse** |
| **Stored** | Value is actually stored | DOB | Ellipse |
| **Derived** | Value computed from other attributes or entities | Age (from DOB), No_of_Students (count) | **Dashed ellipse** |
| **Key** | Value is distinct for each entity; identifies it uniquely | Roll_No, Emp_ID | Attribute name **underlined** |
| **NULL-valued** | Value is not applicable (Flat_No for a house) or unknown (missing or not known whether it exists) | Apartment_No | – |
| **Complex** | Composite and multivalued attributes nested arbitrarily; Navathe writes composite components in ( ) and multivalued in { } | {Address_Phone({Phone(Area_Code, Number)}, Address(Street, City, PIN))} | – |

Notes:
- A composite attribute can be part of a key (composite key).
- An entity type may have more than one key attribute (Navathe: e.g. Registration_No and Vehicle_ID for CAR).
- An entity type with **no** key attribute is a **weak** entity type.

---

## 3. Relationships and relationship sets

| Term | Definition |
|---|---|
| **Relationship** | ⭐ "An association among several entities" (Korth). Example: Asha ENROLLS_IN Computer Science |
| **Relationship set** | "A set of relationships of the same type" (Korth). Formally, a subset of E1 × E2 × … × En, where E1 … En are entity sets |
| **Relationship type** (Navathe) | Defines a set of associations among entities of n entity types |
| **Relationship instance** | One association in a relationship set |
| **Participation** | "The association between entity sets is referred to as participation; that is, the entity sets E1, E2, …, En participate in relationship set R" (Korth) |
| **Role** | The function an entity plays in a relationship. Role names are essential in **recursive** relationships |
| **Recursive relationship** | The same entity set participates more than once in different roles: EMPLOYEE SUPERVISES EMPLOYEE (supervisor, supervisee) |

⭐ **Asked in DSSSB (25 Jun 2023, S1)**: which term is *an association among several entities*? Options: Instance, Key, Relationship, Participation. Answer: **Relationship**. Participation is the *taking part* of entity sets in a relationship set, not the association itself.

### Descriptive attributes

"A relationship may also have attributes called **descriptive attributes**" (Korth). Example: relationship ADVISOR between INSTRUCTOR and STUDENT with attribute **date** recording when the instructor became the student's advisor; TAKES between STUDENT and SECTION with **grade**.

⭐ **Asked in DSSSB (24 Jun 2023, S3)**: descriptive attributes are used to *record information about* … Answer: **relationships** (not about attributes or participating entities).

Rule of thumb: put an attribute on a relationship when its value depends on the **combination** of entities. Marks depends on (student, subject), so Marks belongs on STUDIES, not on STUDENT or SUBJECT. In a 1:1 or 1:N relationship a descriptive attribute can be moved to the entity on the "N" (or either "1") side; in M:N it cannot.

### Degree of a relationship set

**Degree** = number of entity sets that participate.

| Degree | Name | Example |
|---|---|---|
| 1 | **Unary (recursive)** | STUDENT IS_MONITOR_OF STUDENT |
| 2 | **Binary** (most common) | TEACHER TEACHES SUBJECT |
| 3 | **Ternary** | TEACHER TEACHES SUBJECT TO CLASS |
| n | **n-ary** | – |

A ternary relationship generally **cannot** be replaced by three binary relationships without losing information: (Teacher, Subject), (Subject, Class) and (Teacher, Class) pairs do not tell you which teacher teaches which subject to which class.

---

## 4. Constraints on relationships

### Mapping cardinalities (cardinality ratio)

Korth: mapping cardinalities "express the number of entities to which another entity can be associated via a relationship set". For a binary relationship set R between A and B:

| Cardinality | Meaning | Example |
|---|---|---|
| **One-to-one (1:1)** | An entity in A is associated with at most one entity in B, and an entity in B with at most one in A | PRINCIPAL HEADS SCHOOL |
| **One-to-many (1:N)** | An entity in A is associated with any number (zero or more) of entities in B; an entity in B with at most one in A | CLASS HAS STUDENT |
| **Many-to-one (N:1)** | An entity in A with at most one in B; an entity in B with any number in A | STUDENT BELONGS_TO CLASS |
| **Many-to-many (M:N)** | An entity in A with any number in B, and vice versa | STUDENT STUDIES SUBJECT |

### Participation constraints

- **Total participation**: "The participation of an entity set E in a relationship set R is said to be total if every entity in E participates in at least one relationship in R" (Korth). Navathe calls this **existence dependency**. Drawn with a **double line**.
- **Partial participation**: only some entities of E participate. Drawn with a **single line**.
- Example: every STUDENT must belong to a CLASS (total), but not every TEACHER is a class teacher (partial).

Navathe: cardinality ratio + participation together are the **structural constraints** of a relationship. In **(min, max) notation**, min = 0 means partial, min ≥ 1 means total; for example STUDENT (1,1) — BELONGS_TO — (0,N) CLASS.

---

## 5. Weak entity sets

| Term | Meaning |
|---|---|
| **Weak entity set** | An entity set that does not have sufficient attributes to form a primary key (Korth); Navathe: "entity types that do not have key attributes of their own" |
| **Strong entity set** | Has a primary key of its own |
| **Identifying (owner) entity set** | The strong entity set on which the weak entity set depends for identification |
| **Identifying relationship** | Relationship that links the weak entity set to its owner; drawn as a **double diamond** |
| **Discriminator / partial key** | Set of attributes that distinguishes weak entities **belonging to the same owner**; drawn with a **dashed underline** (Korth) or dashed underline/double-lined text (Navathe) |
| **Primary key of a weak entity set** | Primary key of the owner **+** discriminator |

Rules to remember:
- A weak entity set always has **total participation** in its identifying relationship (it cannot exist without its owner).
- The identifying relationship is usually **many-to-one** from the weak entity set to the owner (1:N from owner to weak).
- Example: GUARDIAN(Guardian_Name, Relation, Phone) owned by STUDENT. Two students may each have a guardian named "Sunita Sharma", so Guardian_Name alone is not a key; (Roll_No, Guardian_Name) is.
- Classic Navathe example: DEPENDENT of EMPLOYEE with partial key Dependent_name.

---

## 6. ER notation (Chen symbols, described)

| Symbol | Meaning |
|---|---|
| Rectangle | (Strong) entity set / entity type |
| **Double rectangle** | Weak entity set |
| Diamond | Relationship set |
| **Double diamond** | Identifying relationship set (for a weak entity) |
| Ellipse (oval) | Attribute |
| **Double ellipse** | Multivalued attribute |
| **Dashed ellipse** | Derived attribute |
| Ellipse joined to smaller ellipses | Composite attribute and its components |
| Attribute name **underlined** (solid) | Key / primary key attribute |
| Attribute name with **dashed underline** | Discriminator (partial key) of a weak entity set |
| Single line | Links attributes to entity sets and entity sets to relationship sets; partial participation |
| **Double line** | Total participation |
| Arrow toward an entity set (Korth) or labels 1, N, M on lines (Navathe) | "One" side of a mapping cardinality |
| Triangle labelled **ISA** (Korth) or circle with **d** / **o** (Navathe) | Specialisation / generalisation |
| Rectangle drawn around a relationship and its entities | Aggregation |

---

## 7. Extended ER (EER) features

### Specialisation and generalisation

| | Specialisation | Generalisation |
|---|---|---|
| Direction | **Top-down** | **Bottom-up** |
| Definition (Korth) | "The process of designating subgroupings within an entity set" | Combining a number of entity sets that share the same features into a higher-level entity set |
| Example | TEACHER → PERMANENT_TEACHER, GUEST_TEACHER | CAR, TRUCK → VEHICLE |
| Result | Higher-level (superclass) and lower-level (subclass) entity sets joined by an **ISA** relationship | Same diagram; they are inverses of each other |

**Attribute inheritance**: a lower-level entity set **inherits all attributes and relationship participations** of the higher-level entity set. A subclass may also have its own **specific (local) attributes** and relationships.

- **Specialisation hierarchy**: each subclass has a single superclass (single inheritance).
- **Specialisation lattice**: a subclass may have more than one superclass (**multiple inheritance**); such a subclass is a **shared subclass**.

### Constraints on specialisation/generalisation

| Constraint | Options |
|---|---|
| **Membership** (Korth) | **Condition-defined** (predicate- or attribute-defined in Navathe): membership decided by a condition, e.g. Teacher_Type = 'Guest'. **User-defined**: the user assigns entities to subclasses |
| **Disjointness** | **Disjoint** (d): an entity belongs to at most one lower-level entity set. **Overlapping** (o): an entity may belong to more than one (a PERSON can be both STUDENT and EMPLOYEE) |
| **Completeness** | **Total**: every higher-level entity must belong to at least one lower-level entity set (double line). **Partial**: some higher-level entities may belong to none (single line) |

The two constraints are independent, giving four combinations: disjoint–total, disjoint–partial, overlapping–total, overlapping–partial. Generalisation is usually **total** because the higher-level entity set is built only from lower-level ones.

Navathe also defines a **union type (category)**: a subclass whose superclasses are different entity types, e.g. OWNER is a subset of the union of PERSON, BANK and COMPANY.

### Aggregation

"Aggregation is an abstraction through which relationships are treated as higher-level entities" (Korth). Needed because the basic ER model cannot express **relationships among relationships**.

Example: PROJ_GUIDE is a ternary relationship among INSTRUCTOR, STUDENT and PROJECT. Each (instructor, student, project) combination may have an EVALUATION. Instead of a quaternary relationship, treat PROJ_GUIDE (with its three entity sets) as one aggregated entity and relate it to EVALUATION through EVAL_FOR.

---

## 8. ER-to-relational mapping rules

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: which ER term *corresponds to the foreign key (or relationship relation)* in the relational model? Answer: **1:1 or 1:N relationship type**. This is a row of Navathe's correspondence table:

| ER model | Relational model |
|---|---|
| Entity type | Entity relation |
| **1:1 or 1:N relationship type** | **Foreign key (or relationship relation)** |
| M:N relationship type | Relationship relation and **two** foreign keys |
| n-ary relationship type | Relationship relation and **n** foreign keys |
| Simple attribute | Attribute |
| Composite attribute | Set of simple component attributes |
| Multivalued attribute | Relation and foreign key |
| Value set | Domain |
| Key attribute | Primary (or secondary) key |

### The mapping algorithm (Navathe steps)

| Step | ER construct | Rule |
|---|---|---|
| 1 | **Strong entity type** E | Create relation R with all simple attributes (composite → components only; derived usually omitted). Choose one key as primary key |
| 2 | **Weak entity type** W with owner E | Create relation with W's attributes **+ primary key of owner as foreign key**. PK = owner's PK + partial key. Usually ON DELETE CASCADE |
| 3 | **Binary 1:1** between S and T | **Foreign-key approach**: put T's PK as FK in S, choosing S as the side with **total participation**. Alternatives: **merged-relation** approach (one relation, when both sides are total) or a **cross-reference** (relationship) relation |
| 4 | **Binary 1:N** | Put the PK of the "1" side as a **foreign key in the "N"-side** relation, with descriptive attributes of the relationship. (A relationship relation is an alternative) |
| 5 | **Binary M:N** | Create a **new relationship relation** with the PKs of both sides as foreign keys; its PK is the **combination** of the two FKs. Add descriptive attributes |
| 6 | **Multivalued attribute** A of E | Create a new relation with A + PK of E as FK; PK = (E's PK, A) |
| 7 | **n-ary relationship** (n ≥ 3) | Create a relationship relation with the PKs of all n entity relations as FKs; PK is usually the combination of all FKs (if an entity side has cardinality 1, its FK need not be in the PK) |
| 8 | **Specialisation / generalisation** | 8A: one relation for superclass + one per subclass (subclass PK = superclass PK; works for any constraint). 8B: relations for subclasses only, each with all superclass attributes (only for **total**, best for **disjoint**). 8C: single relation with one **type attribute** (disjoint). 8D: single relation with several Boolean type flags (overlapping) |
| 9 | **Union type (category)** | Create a relation for the category with a **surrogate key** added as FK to each superclass relation |

### Counting minimum tables (a favourite MCQ)

| ER diagram | Minimum relations |
|---|---|
| Two strong entities, 1:N relationship | **2** (FK in the N side) |
| Two strong entities, M:N relationship | **3** |
| Two strong entities, 1:1, total participation on one side | **2** |
| Two strong entities, 1:1, total participation on **both** sides | **1** (merge) |
| Strong entity with one multivalued attribute | **2** |
| Strong entity + weak entity with identifying relationship | **2** (identifying relationship needs no table) |

---

## 9. Worked example – a school database

**Requirements.** Each STUDENT (Roll_No, Name, DOB, Address(House_No, City, PIN), several phone numbers; Age derived) belongs to exactly one CLASS (Class_ID, Section, Room). A CLASS has many students. A TEACHER (Emp_ID, Name) teaches many SUBJECTs (Sub_Code, Title) and a subject is taught by many teachers; the number of periods per week is recorded. Students study many subjects; marks are recorded. Each class has one class teacher; a teacher is class teacher of at most one class; every class must have one. A GUARDIAN (Guardian_Name, Relation, Phone) is identified only together with the student. TEACHER is specialised (disjoint, total) into PERMANENT (Pay_Level) and GUEST (Rate_per_Period).

**ER summary.**

| Element | Kind | Notes |
|---|---|---|
| STUDENT, CLASS, TEACHER, SUBJECT | Strong entity sets (rectangles) | Keys Roll_No, Class_ID, Emp_ID, Sub_Code underlined |
| GUARDIAN | Weak entity set (double rectangle) | Discriminator Guardian_Name; owner STUDENT |
| HAS_GUARDIAN | Identifying relationship (double diamond) | Total participation of GUARDIAN |
| BELONGS_TO | STUDENT N:1 CLASS | Total on STUDENT (double line) |
| CLASS_TEACHER | TEACHER 1:1 CLASS | Total on CLASS, partial on TEACHER |
| TEACHES | TEACHER M:N SUBJECT | Descriptive attribute Periods_per_Week |
| STUDIES | STUDENT M:N SUBJECT | Descriptive attribute Marks |
| Phone | Multivalued (double ellipse) | |
| Age | Derived (dashed ellipse) | Not stored |
| Address | Composite | Components stored |
| PERMANENT, GUEST | Subclasses of TEACHER | ISA, disjoint, total |

**Resulting relations** (PK in bold, FK marked).

| Relation | Attributes | Rule used |
|---|---|---|
| CLASS | **Class_ID**, Section, Room, Class_Teacher_ID (FK → TEACHER, NOT NULL, UNIQUE) | Step 1 + Step 3 (FK on the total side) |
| STUDENT | **Roll_No**, Name, DOB, House_No, City, PIN, Class_ID (FK → CLASS, NOT NULL) | Step 1 (composite flattened, Age dropped) + Step 4 |
| STUDENT_PHONE | **Roll_No** (FK), **Phone** | Step 6 |
| GUARDIAN | **Roll_No** (FK, ON DELETE CASCADE), **Guardian_Name**, Relation, Phone | Step 2 |
| TEACHER | **Emp_ID**, Name | Step 1 |
| PERMANENT | **Emp_ID** (FK → TEACHER), Pay_Level | Step 8A |
| GUEST | **Emp_ID** (FK → TEACHER), Rate_per_Period | Step 8A |
| SUBJECT | **Sub_Code**, Title | Step 1 |
| TEACHES | **Emp_ID** (FK), **Sub_Code** (FK), Periods_per_Week | Step 5 |
| STUDIES | **Roll_No** (FK), **Sub_Code** (FK), Marks | Step 5 |

Sample rows of STUDIES (the M:N relationship relation):

| Roll_No | Sub_Code | Marks |
|---|---|---|
| 101 | CS | 92 |
| 101 | MATH | 85 |
| 102 | CS | 78 |

Total: 10 relations. Note that BELONGS_TO, CLASS_TEACHER and HAS_GUARDIAN produced **no tables** – they became foreign keys, exactly as the DSSSB question expects for 1:1 and 1:N.

---

## Exam traps

1. "Collection of entities with the same attributes" in Navathe wording = **entity type**, not entity set or value set.
2. **Descriptive attributes** describe the **relationship**, not the participating entities.
3. **Relationship** = the association; **participation** = entity sets taking part in it. They are different options.
4. **Double ellipse** = multivalued; **dashed ellipse** = derived; **double rectangle** = weak entity; **double diamond** = identifying relationship; **double line** = total participation.
5. Derived attribute (Age) is usually **not stored** in the relation; multivalued attribute needs a **separate** relation.
6. A weak entity's PK = owner's PK **+** partial key, never the partial key alone; its participation in the identifying relationship is always **total**.
7. **1:1 or 1:N → foreign key**; **M:N → separate relation with two FKs**. Swapping these is the most common error.
8. In a 1:N mapping the FK goes into the **N side**, not the 1 side.
9. Specialisation is **top-down**, generalisation is **bottom-up**; aggregation is about **relationships among relationships**.
10. Disjoint/overlapping and total/partial are **independent** constraints; one does not imply the other.

## One-liners for revision

1. ER model was proposed by Peter Chen in 1976.
2. Entity: a distinguishable real-world thing or object.
3. Entity set (Korth): set of entities of the same type sharing the same attributes.
4. Entity type (Navathe): defines a collection of entities with the same attributes.
5. Navathe's entity set = extension of an entity type at one point in time.
6. Value set = domain of an attribute.
7. Relationship: an association among several entities.
8. Relationship set: subset of E1 × E2 × … × En.
9. Descriptive attributes belong to relationship sets.
10. Degree = number of participating entity sets.
11. Unary relationships are also called recursive; they need role names.
12. Composite attributes are flattened into components when mapping.
13. Multivalued attribute → double ellipse → separate relation.
14. Derived attribute → dashed ellipse → computed, not stored.
15. Key attribute → underlined.
16. Total participation → double line; partial → single line.
17. Total participation is also called existence dependency.
18. Weak entity → double rectangle; identifying relationship → double diamond.
19. Discriminator (partial key) → dashed underline.
20. Weak entity PK = owner PK + discriminator.
21. Mapping cardinalities: 1:1, 1:N, N:1, M:N.
22. Structural constraints = cardinality ratio + participation.
23. Specialisation: top-down; generalisation: bottom-up; linked by ISA.
24. Subclasses inherit attributes and relationships of the superclass.
25. Shared subclass → multiple inheritance → specialisation lattice.
26. Aggregation treats a relationship as a higher-level entity.
27. 1:N mapping: PK of 1 side becomes FK in N side.
28. M:N mapping: new relation, PK = both FKs together.
29. Union type (category) mapping uses a surrogate key.

## Quick self-check

1. Which Chen symbol represents a derived attribute?
   **Answer:** A dashed ellipse.
2. What do descriptive attributes record information about?
   **Answer:** Relationships (the relationship set they are attached to).
3. What is the primary key of a weak entity set?
   **Answer:** Primary key of its identifying (owner) entity set + its discriminator (partial key).
4. An M:N relationship between two strong entity sets maps to how many relations at minimum?
   **Answer:** Three (two entity relations + one relationship relation).
5. Which ER construct corresponds to a foreign key in the relational model?
   **Answer:** A 1:1 or 1:N relationship type.
6. Designating subgroups within an entity set is called?
   **Answer:** Specialisation (top-down).
7. What is the degree of a relationship among TEACHER, SUBJECT and CLASS?
   **Answer:** 3 (ternary).
8. Which abstraction lets a relationship participate in another relationship?
   **Answer:** Aggregation.
