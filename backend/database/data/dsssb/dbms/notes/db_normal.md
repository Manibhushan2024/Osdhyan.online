# Functional Dependencies & Normalisation

**In 30 seconds**
- A **functional dependency** X → Y means: any two tuples that agree on X must agree on Y. Normalisation is driven entirely by FDs.
- **Armstrong's axioms** are exactly three: reflexivity, augmentation, transitivity. Union, decomposition, pseudo-transitivity and composition are *derived* rules, not axioms. ⭐ Asked in DSSSB
- **Attribute closure X⁺** = every attribute X determines. If X⁺ contains all attributes, X is a super key. ⭐ Asked in DSSSB
- **1NF**: every attribute value is atomic; no multivalued or composite attributes, no relations within relations. ⭐ Asked in DSSSB
- **2NF**: 1NF + no non-prime attribute partially depends on a candidate key. **3NF**: for every non-trivial X → A, X is a super key or A is prime. **BCNF**: every determinant is a super key.
- BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF. 3NF decomposition is always lossless and dependency preserving; BCNF is always lossless but may lose dependencies.
- A binary decomposition is lossless iff the common attributes form a super key of at least one of the two parts.

---

## 1. Why normalise: one bad table

Consider a single table that stores students, courses and marks together.

**STUDENT_COURSE**(RollNo, SName, CourseID, CName, Instructor, IPhone, Marks)

| RollNo | SName | CourseID | CName | Instructor | IPhone | Marks |
|---|---|---|---|---|---|---|
| 1 | Asha | C1 | DBMS | Verma | 9811 | 78 |
| 1 | Asha | C2 | OS | Rao | 9822 | 66 |
| 2 | Ravi | C1 | DBMS | Verma | 9811 | 81 |
| 3 | Neha | C1 | DBMS | Verma | 9811 | 59 |

FDs: RollNo → SName; CourseID → CName, Instructor; Instructor → IPhone; {RollNo, CourseID} → Marks. Candidate key: {RollNo, CourseID}.

**Redundancy**: "DBMS, Verma, 9811" is stored once per enrolled student. "Asha" is stored once per course she takes.

**Anomalies** (the three classic ones):

| Anomaly | What goes wrong here |
|---|---|
| **Update (modification) anomaly** | Verma changes phone number: every DBMS row must be updated. Miss one and the database contradicts itself. |
| **Insertion anomaly** | A new course C3 with no students cannot be inserted, because the key {RollNo, CourseID} would have RollNo = NULL (entity integrity forbids NULL in a primary key). |
| **Deletion anomaly** | If Neha, Ravi and Asha all drop DBMS, deleting those rows also deletes the only record that DBMS is taught by Verma. |

**Normalisation** is the process of decomposing a relation into smaller relations, guided by FDs and keys, to minimise redundancy and remove these anomalies, while keeping the decomposition **lossless** (and preferably **dependency preserving**). We will normalise this table step by step in Section 6.

---

## 2. Functional dependencies

### 2.1 Definition
For attribute sets X and Y of relation R, **X → Y** ("X functionally determines Y", "Y is functionally dependent on X") holds if, for every legal instance r of R, any two tuples t1, t2 with t1[X] = t2[X] also have t1[Y] = t2[Y]. X is the **determinant**, Y the **dependent**.

- An FD is a property of the **schema** (the meaning of data), not of one particular instance. An instance can *disprove* an FD (two tuples same X, different Y) but can never *prove* one.
- If X is a super key of R, then X → (every attribute of R).

### 2.2 Types of FD

| Type | Condition | Example |
|---|---|---|
| **Trivial** | Y ⊆ X | AB → A, A → A |
| **Non-trivial** | Y ⊄ X (at least one attribute of Y is not in X) | AB → BC |
| **Completely non-trivial** | X ∩ Y = ∅ | AB → C |

A trivial FD holds in every relation, always (this is exactly the reflexivity axiom).

### 2.3 Full, partial and transitive dependency
- **Full functional dependency**: X → Y is full if removing any attribute from X breaks it, i.e. no proper subset of X determines Y. {RollNo, CourseID} → Marks is full.
- **Partial dependency**: X → Y where some proper subset of X also determines Y. {RollNo, CourseID} → SName is partial, because RollNo → SName alone. Partial dependency of a non-prime attribute on a candidate key violates **2NF**.
- **Transitive dependency**: X → Z is transitive if X → Y and Y → Z hold, where Y is not a super key (and Y → X does not hold) and Z is not in X or Y. CourseID → Instructor → IPhone makes CourseID → IPhone transitive. Transitive dependency of a non-prime attribute on a key violates **3NF**.

### 2.4 Multivalued dependency (brief)
**X →→ Y** holds if, for each X value, the set of Y values is independent of the values of the remaining attributes Z = R − X − Y. Example: EMP(Ename, Project, Dependent): an employee's projects and dependents are independent sets, so Ename →→ Project and Ename →→ Dependent. Every FD is also an MVD (if X → Y then X →→ Y), but not conversely. An MVD X →→ Y is trivial if Y ⊆ X or X ∪ Y = R. MVDs drive **4NF**.

### 2.5 Join dependency (brief)
A **join dependency** JD(R1, R2, …, Rn) holds on R if every legal instance of R equals the natural join of its projections on R1 … Rn. An MVD is the special case n = 2. JDs drive **5NF** (also called PJNF, project-join normal form).

---

## 3. Armstrong's axioms and derived rules ⭐ Asked in DSSSB

The paper asked which option is *not* an Armstrong axiom; the answer was **pseudo-transitivity**, because it is derived. Learn the split exactly.

### 3.1 The three axioms (Armstrong, 1974)

| Axiom | Rule |
|---|---|
| **Reflexivity** | If Y ⊆ X, then X → Y (gives trivial FDs) |
| **Augmentation** | If X → Y, then XZ → YZ for any Z |
| **Transitivity** | If X → Y and Y → Z, then X → Z |

### 3.2 Derived (secondary / additional) rules, with proof sketches

| Derived rule | Statement | One-line proof from the axioms |
|---|---|---|
| **Union (additive)** | X → Y and X → Z ⇒ X → YZ | Augment X → Z by X: X → XZ; augment X → Y by Z: XZ → YZ; transitivity gives X → YZ. |
| **Decomposition (projective)** | X → YZ ⇒ X → Y and X → Z | YZ → Y by reflexivity; transitivity with X → YZ gives X → Y (same for Z). |
| **Pseudo-transitivity** | X → Y and WY → Z ⇒ WX → Z | Augment X → Y by W: WX → WY; transitivity with WY → Z gives WX → Z. |
| **Composition** | X → Y and Z → W ⇒ XZ → YW | Augment X → Y by Z: XZ → YZ; augment Z → W by Y: YZ → YW; transitivity gives XZ → YW. |

Navathe numbers them IR1 reflexive, IR2 augmentation, IR3 transitive (the axioms), IR4 decomposition, IR5 union, IR6 pseudo-transitive (derived). Korth calls union, decomposition and pseudo-transitivity "additional rules".

**Caution**: decomposition works on the **right** side only. From XY → Z you can **not** conclude X → Z or Y → Z.

### 3.3 Soundness and completeness
- **Sound**: the axioms never generate an FD that does not actually hold (every derived FD is in F⁺).
- **Complete**: repeated application of the axioms generates *every* FD in F⁺.
So the three axioms are both sound and complete; the derived rules add convenience, not power.

---

## 4. Closures

### 4.1 Closure of an FD set, F⁺
**F⁺** is the set of all FDs logically implied by F (everything derivable by Armstrong's axioms). F⁺ is huge (it contains every trivial FD, for a start), so in practice we never list it. Instead we compute attribute closures.

### 4.2 Attribute closure X⁺ ⭐ Asked in DSSSB
**X⁺** (closure of X under F) is the set of all attributes functionally determined by X.

**Algorithm**
1. result := X.
2. Repeat: for each FD L → R in F, if L ⊆ result, then result := result ∪ R.
3. Stop when a full pass over F adds nothing. Output result = X⁺.

**Uses of X⁺**
- **Test an FD**: X → Y is in F⁺ iff Y ⊆ X⁺.
- **Test a super key**: X is a super key iff X⁺ = all attributes of R.
- **Test a candidate key**: X is a super key and no proper subset of X is a super key (check X minus each single attribute).

### 4.3 Worked Example 1 (same style as the DSSSB paper)
R(ABCDEF), F = {A → BE, C → D, B → AD, CD → EF}. Find (AC)⁺.

| Step | FD used | Condition | Result |
|---|---|---|---|
| start | — | — | AC |
| 1 | A → BE | A ⊆ AC | ABCE |
| 2 | B → AD (also C → D) | B ⊆ ABCE | ABCDE |
| 3 | CD → EF | CD ⊆ ABCDE | ABCDEF |
| 4 | no FD adds anything | — | **ABCDEF** |

(AC)⁺ = ABCDEF, so AC is a super key. Is it a candidate key? A⁺ = ABDE and C⁺ = CDEF, neither is all of R, so **AC is a candidate key**. The trap option is "ABCDE", which forgets to fire CD → EF at the end. Always make one extra pass.

(The paper's version: R(PQRSTU), F = {P → RT, Q → S, R → PS, QS → TU}, (PQ)⁺ = PQRSTU.)

### 4.4 Worked Example 2: several closures and all keys
R(ABCDE), F = {A → B, BC → E, ED → A}.

- A⁺ = AB (A → B; BC not contained, stop).
- (BC)⁺ = BCE (BC → E; ED needs D, stop).
- (ED)⁺ = EDA, then A → B gives **ABDE**. C is missing.
- (CD)⁺ = CD (no left side is contained).
- (ACD)⁺: A → B gives ABCD; BC → E gives **ABCDE**. Super key.

Neither C nor D appears on any right side, so **C and D must be in every key**. CD⁺ = CD, so we must add one more attribute:
- ACD⁺ = ABCDE ✓, BCD⁺ = BCD → (BC → E) BCDE → (ED → A) ABCDE ✓, CDE⁺ = CDE → (ED → A) ACDE → (A → B) ABCDE ✓.

**Candidate keys: ACD, BCD, CDE.** Every attribute is prime. The relation is in 3NF (every attribute prime), but not BCNF (A → B, A is not a super key).

### 4.5 Worked Example 3: testing whether an FD is implied
R(ABCDE), F = {A → B, B → C, CD → E}. Does AD → E hold? Does B → E hold?

- (AD)⁺: A → B gives ABD; B → C gives ABCD; CD → E gives ABCDE. E ∈ (AD)⁺, so **AD → E holds** (in fact AD is the only candidate key).
- B⁺: B → C gives BC; CD → E needs D, stop. B⁺ = BC. E ∉ B⁺, so **B → E does not hold**.

### 4.6 Method to find ALL candidate keys
1. Classify each attribute: **L** = appears only on left sides, **R** = only on right sides, **LR** = both, **N** = in no FD.
2. Attributes in **L** or **N** (never on any right side) **must be in every candidate key**. Call this core set K.
3. Attributes only in **R** are never in any candidate key.
4. Compute K⁺. If K⁺ = R, K is the **only** candidate key.
5. Otherwise add LR attributes to K one at a time, then two at a time, and so on; keep every combination whose closure is R and which contains no smaller key already found.

**Worked Example 4.** R(ABCDEF), F = {AB → C, C → D, D → B, E → F}.
- Never on the right: A, E → in every key. (AE)⁺ = AEF, not enough.
- Only on the right: F → never in a key. LR attributes: B, C, D.
- ABE⁺: AB → C, C → D, E → F → ABCDEF ✓.
- ACE⁺: C → D, D → B, E → F → ABCDEF ✓.
- ADE⁺: D → B, AB → C, E → F → ABCDEF ✓.

**Candidate keys: ABE, ACE, ADE.** Prime attributes: A, B, C, D, E. Non-prime: F.

### 4.7 Prime and non-prime attributes
- **Prime attribute**: a member of **at least one** candidate key.
- **Non-prime attribute**: a member of no candidate key.
These definitions use *candidate* keys, not just the chosen primary key. In Example 4, F is the only non-prime attribute, and E → F is a partial dependency (E is part of key ABE), so that relation is only in 1NF.

### 4.8 Equivalence of FD sets
F and G are **equivalent** (F⁺ = G⁺) iff F **covers** G and G covers F:
- For every FD X → Y in G, check Y ⊆ X⁺ computed under F.
- For every FD X → Y in F, check Y ⊆ X⁺ computed under G.

**Example.** F = {A → C, AC → D, E → AD, E → H}, G = {A → CD, E → AH}.
- G from F: A⁺(F) = ACD ⊇ CD ✓; E⁺(F) = EADHC ⊇ AH ✓.
- F from G: A⁺(G) = ACD ⊇ C ✓; (AC)⁺(G) ⊇ D ✓; E⁺(G) = EAHCD ⊇ AD ✓ and H ✓.
So **F ≡ G**.

### 4.9 Minimal (canonical) cover
A **minimal cover** Fₘ of F is an equivalent set with:
1. Every right side a **single attribute** (decomposition rule).
2. **No extraneous attribute** on any left side: for XA → B, A is extraneous if B ∈ X⁺ (computed under F).
3. **No redundant FD**: removing any FD changes the closure (X → A is redundant if A ∈ X⁺ computed under F − {X → A}).

Korth's **canonical cover** Fc is the same idea, but FDs with equal left sides are recombined by union (A → B, A → C written A → BC). A minimal cover need not be unique.

**Worked example.** F = {A → BC, B → C, A → B, AB → C, AC → D}.
1. Split right sides: A → B, A → C, B → C, A → B (duplicate, drop), AB → C, AC → D.
2. Extraneous left attributes. Under F, A⁺ = ABCD.
   - AB → C: C ∈ A⁺, so B is extraneous → becomes A → C (already present).
   - AC → D: D ∈ A⁺, so C is extraneous → becomes A → D.
   - Now: {A → B, A → C, B → C, A → D}.
3. Redundant FDs.
   - A → C: without it, A⁺ = A → B → C … = ABCD, which contains C. **Redundant, remove.**
   - A → B: without it, A⁺ = AD (B → C can never fire), no B. Keep.
   - B → C: without it, B⁺ = B. Keep. A → D: without it, A⁺ = ABC. Keep.

**Minimal cover: {A → B, B → C, A → D}; canonical cover: {A → BD, B → C}.** Always remove extraneous attributes **before** removing redundant FDs.

---

## 5. Normal forms: definitions and tests

### 5.1 First Normal Form (1NF) ⭐ Asked in DSSSB
**Definition (Navathe)**: 1NF states that the domain of an attribute must include only **atomic (simple, indivisible) values**, and the value of any attribute in a tuple must be a **single value** from that domain. 1NF **disallows multivalued attributes, composite attributes and their combinations**; it disallows **"relations within relations" or "relations as attribute values within tuples"** (nested relations) and **repeating groups**. The DSSSB 2023 question used exactly this wording; answer: **First**.

Korth: a relation is in 1NF if the domains of all its attributes are atomic.

**Not in 1NF**

| RollNo | Name | Phones | Address (House, City) |
|---|---|---|---|
| 1 | Asha | 9811, 9899 | (12, Delhi) |

Phones is multivalued; Address is composite.

**Fix**: split composite attributes into simple ones (House, City), and move the multivalued attribute into its own relation:
- STUDENT(RollNo, Name, House, City)
- STUDENT_PHONE(RollNo, Phone), key {RollNo, Phone}.

(Flattening into one row per phone also gives 1NF, but creates redundancy; the separate relation is the standard approach.) By definition, every relation of the relational model is already in 1NF.

### 5.2 Second Normal Form (2NF)
**Definition**: R is in 2NF if it is in 1NF and **every non-prime attribute is fully functionally dependent on every candidate key** of R (no partial dependency of a non-prime attribute on any candidate key).

**Test**: for each candidate key with two or more attributes, check whether any proper subset of it determines a non-prime attribute.

**Shortcut**: if every candidate key is a single attribute (or there are no non-prime attributes), R is automatically in 2NF.

### 5.3 Third Normal Form (3NF)
**Definition (general, Navathe/Korth)**: R is in 3NF if, for **every non-trivial FD X → A** in F⁺, **either X is a super key of R, or A is a prime attribute**. (Korth: each attribute in β − α is contained in a candidate key.)

**Equivalent (Codd) form**: R is in 2NF and no non-prime attribute is **transitively dependent** on a candidate key.

**Test**: for each FD in a minimal cover, the left side must be a super key, or the right-side attribute must be prime.

### 5.4 Boyce–Codd Normal Form (BCNF)
**Definition**: R is in BCNF if, for **every non-trivial FD X → A** in F⁺, **X is a super key** of R. In short: **every determinant is a super key**.

**Test**: compute X⁺ for every FD's left side; each must equal R. (It is enough to check the given F for R itself; for a decomposed piece, the projected FDs must be checked.)

**Facts**: every two-attribute relation is in BCNF. If a relation is in 3NF and has only one candidate key, or no overlapping candidate keys, it is also in BCNF.

### 5.5 3NF versus BCNF
The only difference is the escape clause "**or A is prime**". 3NF allows X → A with X not a super key, provided A belongs to some candidate key. BCNF does not.

A 3NF-not-BCNF situation requires **overlapping composite candidate keys**. Classic example (Navathe): TEACH(Student, Course, Instructor), FDs {Student, Course} → Instructor and Instructor → Course. Candidate keys: {Student, Course} and {Student, Instructor}. All attributes are prime, so it is in 3NF. But Instructor → Course has a determinant that is not a super key, so it is **not BCNF**.

### 5.6 Fourth and Fifth Normal Forms (brief)
- **4NF**: R is in 4NF if for every **non-trivial MVD X →→ Y**, X is a super key. Fix EMP(Ename, Project, Dependent) by decomposing into EMP_PROJ(Ename, Project) and EMP_DEP(Ename, Dependent). 4NF implies BCNF.
- **5NF / PJNF**: R is in 5NF if every non-trivial **join dependency** is implied by the candidate keys. Example: SUPPLY(Supplier, Part, Project), where a three-way rule ("if s supplies p, s supplies project j, and j uses p, then s supplies p to j") means the table can only be losslessly decomposed into three binary projections, not two. 5NF implies 4NF.

---

## 6. Worked decomposition: the bad table, step by step

Start: STUDENT_COURSE(RollNo, SName, CourseID, CName, Instructor, IPhone, Marks), key {RollNo, CourseID}. Non-prime: SName, CName, Instructor, IPhone, Marks.

**1NF?** Yes, all values atomic.

**2NF?** No. RollNo → SName and CourseID → CName, Instructor (and so → IPhone) are partial dependencies. Highest form: **1NF**.

**2NF decomposition** (move each partial dependency out with its determinant):
- STUDENT(RollNo, SName)
- COURSE(CourseID, CName, Instructor, IPhone)
- ENROL(RollNo, CourseID, Marks)

**3NF?** COURSE has CourseID → Instructor → IPhone: IPhone is transitively dependent on the key (Instructor is not a super key, IPhone is non-prime). Not 3NF.

**3NF decomposition**:
- COURSE(CourseID, CName, Instructor)
- INSTRUCTOR(Instructor, IPhone)

**Result**: STUDENT, ENROL, COURSE, INSTRUCTOR. Each is in BCNF (every determinant is the key of its own table). All three anomalies disappear: Verma's phone is stored once, a course can exist with no students, and deleting enrolments does not delete course information. Every join uses a key, so the decomposition is lossless, and every original FD lives inside one table, so it is dependency preserving.

**BCNF decomposition of TEACH** (Section 5.5): split on the violating FD Instructor → Course into R1(Instructor, Course) and R2(Student, Instructor). It is lossless (common attribute Instructor is a key of R1), but **{Student, Course} → Instructor is lost**: no single table contains all three attributes. This is the textbook case where BCNF sacrifices dependency preservation.

---

## 7. Identifying the highest normal form

**Method**
1. Find all candidate keys (Section 4.6); list prime and non-prime attributes.
2. Check **BCNF**: is every FD's left side a super key? If yes, stop: BCNF.
3. Check **3NF**: for each violating FD, is the right side prime? If all are, stop: 3NF.
4. Check **2NF**: is any non-prime attribute determined by a proper subset of a candidate key? If not, 2NF; if yes, 1NF.

Work from the top (BCNF) down, and assume 1NF unless told values are non-atomic.

**Practice 1.** R(ABCD), F = {AB → C, B → D}.
Key AB (A, B never on the right; AB⁺ = ABCD). Non-prime: C, D. B → D: B is a proper subset of key AB and D is non-prime, a **partial dependency**. Highest: **1NF**.

**Practice 2.** R(ABCD), F = {AB → C, C → D}.
Key AB. A⁺ = A, B⁺ = B, so no partial dependency: 2NF. C → D: C is not a super key and D is non-prime (transitive AB → C → D). Highest: **2NF**.

**Practice 3.** R(ABC), F = {AB → C, C → B}.
A never on the right. AB⁺ = ABC, AC⁺ = ACB. Keys: AB, AC; all attributes prime. C → B: C not a super key, but B is prime, so 3NF holds; BCNF fails. Highest: **3NF**.

**Practice 4.** R(ABCD), F = {A → BCD, BC → A}.
A⁺ = ABCD; (BC)⁺ = BCAD. Keys: A, BC. Both determinants (A and BC) are super keys. Highest: **BCNF**.

---

## 8. Properties of decomposition

### 8.1 Lossless (non-additive) join
A decomposition of R into R1, …, Rn is **lossless** if R1 ⋈ R2 ⋈ … ⋈ Rn = r for every legal instance r. A **lossy** decomposition produces **spurious tuples**: the join returns *more* rows than the original (information is lost because we can no longer tell which rows were real).

**Binary test**: R into R1 and R2 is lossless **iff** (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2 is in F⁺; that is, **the common attributes form a super key of at least one of the two relations**. Also required: R1 ∪ R2 = R, and R1 ∩ R2 ≠ ∅.

**Example.** R(ABC), F = {A → B}, instance {(1, x, p), (2, x, q)}.
- Decompose into (AB) and (AC): common attribute A; A → B, so A is a key of (AB). **Lossless.**
- Decompose into (AB) and (BC): common attribute B; B⁺ = B, a key of neither. **Lossy.** AB = {(1,x), (2,x)}, BC = {(x,p), (x,q)}; the join gives 4 tuples, including spurious (1, x, q) and (2, x, p).

For more than two relations, use the **tableau (chase) test** or apply the binary test step by step on successive splits.

### 8.2 Dependency preservation
A decomposition is **dependency preserving** if (F1 ∪ F2 ∪ … ∪ Fn)⁺ = F⁺, where Fi is the projection of F⁺ on Ri (the FDs of F⁺ that use only Ri's attributes). Then every FD can be checked inside one table, without joins.

**Example.** R(ABCD), F = {A → B, B → C, C → D}.
- {AB, BC, CD}: each FD lies in one table. **Preserved.**
- {AB, AC, CD}: projections give A → B, A → C, C → D. B → C is not derivable (B⁺ under these is just B). **Not preserved**, though it is still lossless.

### 8.3 What each normal form guarantees

| Target | Lossless join | Dependency preservation |
|---|---|---|
| 3NF (synthesis algorithm) | Always achievable | Always achievable |
| BCNF (decomposition algorithm) | Always achievable | **Not always** |

Lossless join is mandatory; dependency preservation is desirable. When BCNF would lose a dependency, designers often settle for 3NF.

**3NF synthesis (outline)**: find a minimal cover; make one relation for each left side X with all attributes it determines; if no relation contains a candidate key, add one relation holding a candidate key; remove relations contained in others.

**BCNF decomposition (outline)**: while some Ri has a violating X → Y, replace Ri by (X⁺ ∩ Ri) and (Ri − (X⁺ − X)). Each split is lossless because X is a key of the first part.

### 8.4 Denormalisation
**Denormalisation** deliberately merges normalised tables (or stores derived or duplicated data) to cut costly joins and speed up frequent reads, for example in reporting systems and data warehouses (star schemas). The price is the return of redundancy and update anomalies, which must then be controlled by the application or triggers. It is a performance decision taken *after* normalising, not an excuse to skip it.

---

## 9. Summary table

| Normal form | Condition | Removes | Guarantee |
|---|---|---|---|
| **1NF** | All attribute values atomic and single-valued | Multivalued and composite attributes, repeating groups, nested relations | A flat relation |
| **2NF** | 1NF + no non-prime attribute partially dependent on a candidate key | Partial dependencies | Lossless + dependency-preserving decomposition possible |
| **3NF** | Every non-trivial X → A: X super key or A prime | Transitive dependencies of non-prime attributes | Lossless + dependency preserving always achievable |
| **BCNF** | Every non-trivial X → A: X super key | All FD-based redundancy (remaining anomalies from overlapping keys) | Lossless always; dependency preservation not guaranteed |
| **4NF** | Every non-trivial MVD X →→ Y: X super key | Multivalued dependencies | Lossless |
| **5NF (PJNF)** | Every join dependency implied by candidate keys | Join dependencies | Lossless |

Chain: 5NF ⊂ 4NF ⊂ BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF (each higher form implies all lower ones).

---

## Exam traps

1. **Pseudo-transitivity, union, decomposition and composition are not Armstrong's axioms.** The axioms are only reflexivity, augmentation and transitivity. ⭐ Asked in DSSSB
2. **Stopping the closure too early.** After every addition, re-scan all FDs; a compound left side such as CD → EF often fires only at the end (the "PQRST" wrong option in the paper).
3. **Decomposing the left side.** AB → C does *not* imply A → C. Only the right side splits.
4. **Prime means "in any candidate key"**, not "in the primary key". Missing a second candidate key turns a 3NF answer into a wrong "2NF".
5. **Partial dependency needs a composite key.** A relation whose candidate keys are all single attributes is automatically in 2NF.
6. **3NF allows a non-key determinant if the dependent is prime; BCNF never does.** That one clause is the whole difference.
7. **Lossless and dependency preserving are independent.** A decomposition can be lossless but not preserving, or preserving but lossy.
8. **BCNF can always be made lossless**, but may lose dependencies; 3NF can always be both lossless and dependency preserving.
9. **A lossy join gives more tuples, not fewer.** "Loss" refers to lost information (spurious tuples), not missing rows.
10. **A sample table cannot prove an FD.** It can only disprove one; FDs come from the meaning of the data.

---

## One-liners for revision

1. X → Y: tuples equal on X are equal on Y.
2. Trivial FD: Y ⊆ X. Non-trivial: Y ⊄ X. Completely non-trivial: X ∩ Y = ∅.
3. Armstrong's axioms: reflexivity, augmentation, transitivity. ⭐
4. Augmentation: X → Y ⇒ XZ → YZ.
5. Derived rules: union, decomposition, pseudo-transitivity, composition.
6. Pseudo-transitivity: X → Y and WY → Z ⇒ WX → Z. ⭐
7. Armstrong's axioms are sound (no wrong FD) and complete (all of F⁺).
8. F⁺ = all FDs implied by F; X⁺ = all attributes determined by X. ⭐
9. X → Y holds iff Y ⊆ X⁺.
10. X is a super key iff X⁺ = R.
11. Candidate key = minimal super key.
12. Attributes never on any right side belong to every candidate key.
13. Attributes only on right sides belong to no candidate key.
14. Prime attribute: part of some candidate key.
15. F ≡ G iff each covers the other.
16. Minimal cover: single-attribute right sides, no extraneous left attributes, no redundant FDs.
17. Anomalies: insertion, deletion, update (modification).
18. 1NF: atomic values; no multivalued/composite attributes, no relations within relations. ⭐
19. 2NF: no partial dependency of a non-prime attribute on a candidate key.
20. 3NF: every non-trivial X → A has X super key or A prime.
21. 3NF removes transitive dependencies.
22. BCNF: every determinant is a super key.
23. 3NF-but-not-BCNF needs overlapping composite candidate keys.
24. 4NF removes non-trivial MVDs; 5NF removes join dependencies.
25. Every FD is an MVD; not every MVD is an FD.
26. Binary lossless test: R1 ∩ R2 is a super key of R1 or R2.
27. Lossy join creates spurious tuples.
28. 3NF: always lossless and dependency preserving; BCNF: lossless but not always dependency preserving.
29. Every two-attribute relation is in BCNF.
30. Denormalisation trades redundancy for faster reads.

---

## Quick self-check

1. R(PQRS), F = {P → Q, Q → R, R → S}. Find P⁺.
   **Answer**: PQRS (P → Q, Q → R, R → S). P is a candidate key.
2. Which is not an Armstrong axiom: reflexivity, augmentation, union, transitivity?
   **Answer**: Union (it is derived).
3. R(ABCDE), F = {A → B, BC → E, ED → A}. List the candidate keys.
   **Answer**: ACD, BCD, CDE.
4. Does AB → C imply A → C?
   **Answer**: No. Only the right side may be decomposed.
5. A normal form disallows multivalued attributes, composite attributes and relations within relations. Which?
   **Answer**: First normal form (1NF).
6. R(ABCD), F = {AB → C, B → D}. Highest normal form?
   **Answer**: 1NF (B → D is a partial dependency of non-prime D on key AB).
7. R(ABC), F = {AB → C, C → B}. Is it in BCNF?
   **Answer**: No. It is in 3NF (B is prime) but C → B has a non-super-key determinant.
8. R(ABC), F = {A → B}, decomposed into (AB) and (BC). Lossless?
   **Answer**: No. The common attribute B is a key of neither part, so spurious tuples appear.
9. Find a canonical cover of {A → BC, B → C, A → B, AB → C}.
   **Answer**: {A → B, B → C}.
10. Which normal form can always be reached with both lossless join and dependency preservation?
    **Answer**: 3NF (BCNF cannot always preserve dependencies).
