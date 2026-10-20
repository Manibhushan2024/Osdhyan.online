# Introduction & Database Architecture

**In 30 seconds**

- A **DBMS** is "a collection of interrelated data and a set of programs to access those data" (Korth). The data part is the **database**; database + DBMS software = **database system** (Navathe).
- A DBMS fixes the seven file-system problems: redundancy and inconsistency, difficult access, data isolation, integrity, atomicity, concurrent-access anomalies and security.
- **Schema** = overall design (changes rarely, the *intension*); **instance** = data at a given moment (changes all the time, the *extension*).
- **Three-schema (ANSI/SPARC) architecture**: internal, conceptual, external levels. Changing the internal schema without touching the conceptual one is **physical data independence**; changing the conceptual schema without touching external schemas or programs is **logical data independence** (harder).
- Languages: **DDL** defines structure, **DML** manipulates data (procedural or non-procedural), **DCL** controls access (GRANT, REVOKE), **TCL** controls transactions (COMMIT, ROLLBACK, SAVEPOINT).
- ⭐ Application programs talk to a database server through **ODBC or JDBC** (standard APIs).
- The **data dictionary / system catalog** stores **metadata**, i.e. "data about data".

---

## 1. Data, information and database

| Term | Meaning | Example |
|---|---|---|
| Data | Raw, unprocessed facts that can be recorded and have implicit meaning (Navathe) | 78, 85, 91 |
| Information | Processed, organised data that has meaning for a decision | "Class average is 84.7" |
| Database | "A collection of related data" (Navathe) | School records |
| DBMS | "A general-purpose software system that facilitates the processes of defining, constructing, manipulating and sharing databases among various users and applications" (Navathe) | MySQL, Oracle, SQL Server, PostgreSQL |
| Database system | Database + DBMS software (+ applications) | A school ERP |

Navathe's four DBMS functions: **defining** (data types, structures, constraints), **constructing** (storing data on a medium), **manipulating** (query, update, report) and **sharing** (many users at once). Also **protecting** (security, crash recovery) and **maintaining** the database over a long life.

---

## 2. File system problems vs DBMS advantages

Before DBMSs, organisations kept records in operating-system files processed by separate application programs. Korth lists the disadvantages of a **file-processing system**:

| File-system problem | What goes wrong | How a DBMS fixes it |
|---|---|---|
| Data redundancy and inconsistency | Same data (a student's address) stored in several files; copies disagree after an update | Integrated database, controlled redundancy |
| Difficulty in accessing data | A new query ("students living in PIN 110085") needs a new program | Query language (SQL) for ad-hoc queries |
| Data isolation | Data scattered in many files of different formats | One uniform data model |
| Integrity problems | Constraints ("balance never below 0") buried inside program code; hard to add or change | Constraints declared once in the schema |
| Atomicity problems | A crash midway through a fund transfer leaves data half-updated | Transactions are all-or-nothing |
| Concurrent-access anomalies | Two clerks update the same balance simultaneously, one update is lost | Concurrency control |
| Security problems | Hard to let a clerk see only some data | Authorisation, views, GRANT/REVOKE |

Navathe's **characteristics of the database approach**: self-describing nature (the catalog holds the schema), insulation between programs and data (program–data independence), data abstraction, support for multiple views, and sharing of data with multiuser transaction processing.

Further advantages: backup and recovery, multiple user interfaces, enforcement of standards, reduced application development time, up-to-date information for all users.

**Disadvantages / when not to use a DBMS**: high initial cost of software, hardware and training; overhead of security, concurrency and recovery functions; unnecessary for small, simple, single-user applications that will never change.

---

## 3. Components of a DBMS (Korth's system structure)

| Component | Sub-parts and job |
|---|---|
| **Query processor** | **DDL interpreter** (interprets DDL statements and records definitions in the data dictionary); **DML compiler** (translates DML queries into an evaluation plan of low-level instructions and performs **query optimisation**, i.e. picks the lowest-cost plan); **query evaluation engine** (executes the plan) |
| **Storage manager** | Interface between low-level stored data and the programs/queries. Includes the **authorisation and integrity manager**, **transaction manager**, **file manager** (disk space allocation) and **buffer manager** (fetches data from disk into main memory, decides what to cache) |
| **Transaction management** | **Recovery manager** (ensures atomicity and durability after failures) and **concurrency-control manager** (controls interaction among concurrent transactions) |
| **Disk structures** | Data files, **data dictionary**, **indices**, statistical data |

---

## 4. Database users and the DBA

| User (Korth) | Description |
|---|---|
| **Naive users** | Unsophisticated users who interact by invoking previously written application programs or forms (a bank teller, a student checking results). Navathe calls them **naive or parametric end users** using **canned transactions** |
| **Application programmers** | Computer professionals who write application programs (using RAD tools, embedded SQL, ODBC/JDBC) |
| **Sophisticated users** | Interact without writing programs; frame requests in a query language or use analysis tools (analysts, engineers) |
| **Specialised users** | Write specialised database applications that do not fit the traditional framework (CAD, expert systems, multimedia) |

Navathe adds **casual end users** (occasional, different information each time), **stand-alone users** (personal databases), **database designers** and **system analysts**. "Workers behind the scene": DBMS system designers and implementers, tool developers, operators and maintenance personnel.

### Database Administrator (DBA)

The DBA is "a person who has central control over both the data and the programs that access those data" (Korth). Duties:

1. **Schema definition** – creates the original schema by executing DDL statements.
2. **Storage structure and access-method definition** – decides file organisation and indexes.
3. **Schema and physical-organisation modification** – changes the schema to reflect changing needs or to improve performance.
4. **Granting of authorisation for data access** – controls which user may access which data.
5. **Routine maintenance** – periodic **backup**, ensuring free disk space, **monitoring performance** of jobs.

---

## 5. Data models

A **data model** is "a collection of conceptual tools for describing data, data relationships, data semantics and consistency constraints" (Korth).

Navathe's categories: **high-level (conceptual)** models such as ER, close to how users see data; **representational (implementation)** models such as relational, network and hierarchical; **low-level (physical)** models describing storage on disk.

| Model | Structure | Key facts |
|---|---|---|
| **Hierarchical** | Tree of records; parent–child links | Each child has exactly one parent, so only 1:N is natural; M:N needs duplication. IBM **IMS** |
| **Network** | Graph of record types linked by **sets** (owner–member) | A member can have many owners; handles M:N. **CODASYL DBTG** standard, IDMS |
| **Relational** | Collection of tables (relations) | Proposed by **E. F. Codd in 1970**; record-based; most widely used |
| **Entity–Relationship** | Entities, attributes, relationships | Proposed by **Peter Chen in 1976**; used for conceptual design |
| **Object-based** | Objects with attributes and methods; object-relational adds objects to tables | Encapsulation, inheritance, object identity |
| **Semi-structured** | Items of the same type may have different attributes | XML, JSON |

Hierarchical, network and relational are **record-based** models.

---

## 6. Schema vs instance

| Schema | Instance (database state) |
|---|---|
| "The overall design of the database" (Korth) | "The collection of information stored in the database at a particular moment" (Korth) |
| Called **intension** | Called **extension**, state or snapshot |
| Specified during design; changes **infrequently** | Changes with every insert, update, delete |
| Like a variable's type declaration in a program | Like the variable's current value |

Korth's levels give a **physical schema**, a **logical schema** and several **subschemas** (views). Navathe: a database state that satisfies all constraints is a **valid state**; an empty database has an **empty state**; the first load gives the **initial state**. The schema is stored in the catalog and drawn as a **schema diagram**.

---

## 7. Three-schema (ANSI/SPARC) architecture

Proposed by the ANSI/SPARC study group (1975) to separate user applications from the physical database.

| Level | Korth name | Describes |
|---|---|---|
| **External level** | View level | Part of the database a particular user group is interested in; hides the rest. Many external schemas (user views) |
| **Conceptual level** | Logical level | Structure of the **whole** database for a community of users: entities, data types, relationships, constraints, user operations. Hides physical storage details |
| **Internal level** | Physical level | Physical storage structure: record layout, file organisation, indexes, access paths |

The DBMS converts requests between levels using two **mappings**: **external/conceptual** and **conceptual/internal**.

### Data independence

**Data independence** is "the capacity to change the schema at one level of a database system without having to change the schema at the next higher level" (Navathe).

| | Physical data independence | Logical data independence |
|---|---|---|
| Definition | Capacity to change the **internal** schema without having to change the **conceptual** schema | Capacity to change the **conceptual** schema without having to change **external** schemas or application programs |
| Mapping that absorbs the change | Conceptual/internal | External/conceptual |
| Example change | Add an index, move files to SSD, change file organisation | Add an attribute or a table, merge or split a relation |
| Ease | Easier; achieved by most DBMSs | **Harder**, because programs depend heavily on logical structure |

---

## 8. Database languages

⭐ **Asked in DSSSB (25 Jun 2023, S2)**: which language is used to *define the structure of a relation, delete relations and modify schemas*? Answer: **DDL**.

| Language | Purpose | Typical SQL commands |
|---|---|---|
| **DDL** (Data Definition Language) | Specifies the database schema; output goes into the data dictionary | CREATE, ALTER, DROP, TRUNCATE, RENAME |
| **DML** (Data Manipulation Language) | Retrieval, insertion, deletion and modification of data | SELECT, INSERT, UPDATE, DELETE |
| **DCL** (Data Control Language) | Authorisation / privileges | GRANT, REVOKE |
| **TCL** (Transaction Control Language) | Ends or partially undoes transactions | COMMIT, ROLLBACK, SAVEPOINT |
| **SDL** (Storage Definition Language) | Specifies the internal schema (Navathe) | Not part of SQL; done with DBMS-specific storage parameters |
| **VDL** (View Definition Language) | Specifies user views and their mappings (Navathe) | CREATE VIEW in SQL |

### Procedural vs non-procedural DML

| Procedural DML | Declarative (non-procedural) DML |
|---|---|
| User specifies **what** data are needed **and how** to get them (Korth) | User specifies **what** data are needed **without** specifying how (Korth) |
| **Low-level**, **record-at-a-time** (Navathe); must be embedded in a host language with loops | **High-level**, **set-at-a-time** (set-oriented) |
| Example: relational algebra, network-model DML (FIND, GET) | Example: **SQL**, relational calculus, QBE |

A **query language** is the part of a DML that retrieves information; the terms are often used as synonyms. SQL is a **comprehensive** language: it combines DDL, DML, VDL, DCL and TCL.

⭐ Related, **Asked in DSSSB (7 Feb 2024, S2)**: schema evolution – `DROP SCHEMA name RESTRICT` drops the schema only if it has no elements; `CASCADE` drops it with everything inside (detail in the SQL chapter).

---

## 9. Database system architecture

| Architecture | Where things run | Example |
|---|---|---|
| **1-tier** | DBMS, data and application on the same machine; user works directly on it | SQLite in a mobile app, MS Access on one PC |
| **2-tier** (client–server) | Application on the **client**; it invokes database functionality on the **server** through query-language statements sent via ODBC/JDBC | A desktop VB/Java program connected to an Oracle server |
| **3-tier** | Client is only a front end (often a web browser) and makes **no direct database calls**; it talks to an **application server** containing the business logic, which talks to the **database server** | Online result portal: browser → web/app server → MySQL |

Korth: three-tier architectures are more appropriate for large applications and applications that run on the World Wide Web. Benefits: better security (clients never touch the database), scalability, easier maintenance of business rules.

In **client–server** terms, the **server** (back end) does query evaluation, optimisation, concurrency control and recovery; the **client** (front end) does user interface, forms, report writing.

---

## 10. ODBC, JDBC and APIs – how application programs talk to the database

⭐ **Asked in DSSSB (25 Jun 2023, S2)**: communication between an *application program* and a *database server* occurs via? Answer: **ODBC or JDBC** (not "web server" or "HTTP", which connect browsers to web applications).

Korth gives two ways for an application to access a database:

1. **Application Program Interface (API)** – a set of procedures used to send DML and DDL statements to the database and retrieve results. Standards:
   - **ODBC (Open Database Connectivity)** – Microsoft standard (1992) for use with **C** and other languages; architecture: application → **driver manager** → database-specific **driver** → data source (named by a DSN).
   - **JDBC (Java Database Connectivity)** – the corresponding standard for **Java**, package `java.sql`; key classes and interfaces: `DriverManager`, `Connection`, `Statement`, `PreparedStatement`, `ResultSet`. Four driver types: Type 1 JDBC–ODBC bridge, Type 2 native-API, Type 3 network-protocol (middleware), Type 4 thin pure-Java driver.
   - Others: ADO.NET (.NET), OLE DB, Python DB-API.
2. **Embedded SQL** – SQL statements written inside a host language (C, COBOL, Java) and marked, for example with `EXEC SQL`; a **precompiler** replaces them with host-language calls. **Dynamic SQL** builds and submits SQL strings at run time.

Typical JDBC steps: load/register driver, open a connection, create a statement, execute the query, process the ResultSet, close the connection.

---

## 11. Data dictionary and metadata

- **Metadata** = "data about data": table names, attribute names and types, constraints, indexes, users, privileges, storage details.
- Korth: the DDL output is placed in the **data dictionary**, which contains metadata; it is "a special type of table that can only be accessed and updated by the database system itself". The DBMS consults it before reading or modifying actual data.
- Navathe: the **DBMS catalog** holds the complete definition of the database – this is the **self-describing** nature of a database system.
- **Active** data dictionary is updated automatically by the DBMS; **passive** data dictionary is maintained separately and updated manually.
- Examples: `INFORMATION_SCHEMA` (MySQL, SQL Server), the Oracle data dictionary views such as `USER_TABLES`.

---

## 12. Centralised vs distributed databases (brief)

| Centralised | Distributed |
|---|---|
| Database stored at a single site | Database spread over several sites connected by a network, but appears as one database to users |
| Simple to manage, single point of failure | Higher availability and local autonomy; complex concurrency and recovery (two-phase commit) |
| | Data may be **fragmented** (horizontal/vertical) and **replicated**; **transparency** hides this |
| | **Homogeneous** (same DBMS at all sites) or **heterogeneous** (different DBMSs) |

Parallel databases use many processors and disks at one site to speed up processing.

---

## Exam traps

1. **Logical** data independence is harder to achieve than **physical**; options often swap them.
2. Physical independence protects the **conceptual** schema; logical independence protects **external** schemas and application programs.
3. **TRUNCATE is DDL**, not DML, even though it removes rows.
4. **SQL is non-procedural (declarative)**; relational algebra is procedural.
5. Schema = **intension**, instance = **extension**. Do not reverse them.
6. ODBC/JDBC is the answer for "application program ↔ database server"; HTTP/web server is for browser ↔ web application. "API" is the general category, but the specific expected option is ODBC or JDBC.
7. In 3-tier architecture the **client does not call the database directly**; in 2-tier it does.
8. The hierarchical model cannot represent M:N directly; the network model can.
9. The **DDL interpreter** writes into the data dictionary; the **DML compiler** does query optimisation.
10. Codd proposed the relational model (1970); Chen proposed the ER model (1976). Do not mix them up.

## One-liners for revision

1. DBMS = interrelated data + programs to access it.
2. Database system = database + DBMS software.
3. Metadata = data about data, stored in the data dictionary / catalog.
4. Seven file-system problems: redundancy and inconsistency, access difficulty, isolation, integrity, atomicity, concurrency, security.
5. Schema changes rarely; instance changes often.
6. Three levels: external (view), conceptual (logical), internal (physical).
7. Two mappings: external/conceptual and conceptual/internal.
8. Physical data independence: change internal schema without changing conceptual schema.
9. Logical data independence: change conceptual schema without changing external schemas or programs.
10. DDL: CREATE, ALTER, DROP, TRUNCATE, RENAME.
11. DML: SELECT, INSERT, UPDATE, DELETE.
12. DCL: GRANT, REVOKE.
13. TCL: COMMIT, ROLLBACK, SAVEPOINT.
14. SDL specifies the internal schema; VDL specifies views.
15. Procedural DML = what + how; non-procedural = only what.
16. High-level DML is set-at-a-time; low-level DML is record-at-a-time.
17. Query processor = DDL interpreter + DML compiler + query evaluation engine.
18. Storage manager = authorisation and integrity manager + transaction manager + file manager + buffer manager.
19. Buffer manager moves data between disk and main memory.
20. DBA grants authorisation, defines schema, defines storage, does backup and performance monitoring.
21. Naive users run canned transactions through forms.
22. Hierarchical = tree (IMS); network = graph with owner–member sets (CODASYL).
23. Relational model: Codd, 1970; ER model: Chen, 1976.
24. 2-tier: client sends SQL to server via ODBC/JDBC.
25. 3-tier: client → application server → database server.
26. ODBC is for C; JDBC is for Java (java.sql).
27. Embedded SQL uses EXEC SQL and a precompiler.
28. Distributed DB uses fragmentation, replication and transparency.

## Quick self-check

1. Which data independence lets you add an index without rewriting the conceptual schema?
   **Answer:** Physical data independence.
2. Adding a new column to a table without affecting existing application programs is an example of?
   **Answer:** Logical data independence.
3. Which DBMS component translates a query into an evaluation plan and optimises it?
   **Answer:** The DML compiler (part of the query processor).
4. Is TRUNCATE a DDL or a DML command?
   **Answer:** DDL.
5. The collection of information stored in a database at a particular moment is called?
   **Answer:** An instance (database state / extension).
6. Through what does an application program communicate with a database server?
   **Answer:** ODBC or JDBC (standard database APIs).
7. Which data model represents data as a tree with each child having only one parent?
   **Answer:** Hierarchical model.
8. GRANT and REVOKE belong to which category of language?
   **Answer:** DCL (Data Control Language).
