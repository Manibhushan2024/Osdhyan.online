# SQL

**In 30 seconds**
- SQL commands fall into five groups: **DDL** (CREATE, ALTER, DROP, TRUNCATE, RENAME, COMMENT), **DML** (SELECT, INSERT, UPDATE, DELETE, MERGE), **DCL** (GRANT, REVOKE), **TCL** (COMMIT, ROLLBACK, SAVEPOINT, SET TRANSACTION). Some books also give SELECT its own group, **DQL**.
- `SELECT *` returns **all columns**. `%` is the LIKE wildcard for any run of characters and `_` stands for exactly one character. ⭐ Asked in DSSSB
- `||` is the standard concatenation operator (Oracle, PostgreSQL). SQL Server uses `+` and MySQL uses `CONCAT()`. In MySQL, `||` means **OR** by default. ⭐ Asked in DSSSB
- **DEFAULT** supplies a value for a column when an INSERT does not give one. `DROP SCHEMA name RESTRICT` drops the schema only if it is empty, while `CASCADE` drops it together with everything inside it. ⭐ Asked in DSSSB
- The five aggregates are COUNT, SUM, AVG, MIN and MAX. All of them ignore NULLs except `COUNT(*)`. "Cross product" is a join, not an aggregate. ⭐ Asked in DSSSB
- A query is executed in this order: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. WHERE filters rows and HAVING filters groups.
- `CEILING(x)` gives the smallest integer ≥ x and `FLOOR(x)` gives the largest integer ≤ x. In SQL Server, `DATEDIFF(datepart, start, end)` = end − start, the datepart cannot be a variable, and `GETDATE()` returns a datetime with no time-zone offset. ⭐ Asked in DSSSB
- Any comparison with NULL gives UNKNOWN, so you must write `IS NULL`, never `= NULL`. If the list or subquery contains a NULL, `NOT IN` returns no rows at all.

---

## 1. What SQL is: history and standards

SQL (Structured Query Language) is a **declarative (non-procedural)** language. You say *what* data you want, and the DBMS decides *how* to get it.

- IBM created it in the early 1970s as **SEQUEL** (Structured English QUEry Language), as part of the **System R** project at the San Jose Research Laboratory (Chamberlin and Boyce). The name was later changed to SQL.
- **ANSI** published the first standard in **1986 (SQL-86)** and **ISO** adopted it in 1987. Later versions: SQL-89, **SQL-92 (SQL2)**, **SQL:1999 (SQL3**: triggers, recursive queries, object features), SQL:2003 (MERGE, sequences, window functions, XML), SQL:2006, SQL:2008 (TRUNCATE, FETCH FIRST), SQL:2011 (temporal data), SQL:2016 (JSON) and SQL:2023.
- Keywords are **not case-sensitive** (`select` = `SELECT`). String literals go in **single quotes** (`'Delhi'`). A statement ends with `;`.
- SQL tables are **multisets**, so duplicate rows are allowed unless you remove them with DISTINCT. Relations in relational algebra are **sets**.

Korth divides SQL into these parts: DDL, DML, integrity, view definition, transaction control, embedded and dynamic SQL, and authorization.

## 2. Command categories

| Category | Purpose | Commands |
|---|---|---|
| **DDL**: Data Definition Language | Defines, changes and deletes the *structure* (schema) | `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`, `COMMENT` |
| **DML**: Data Manipulation Language | Works on the *data* inside tables | `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE` |
| **DCL**: Data Control Language | Rights and permissions | `GRANT`, `REVOKE` |
| **TCL**: Transaction Control Language | Manages transactions | `COMMIT`, `ROLLBACK`, `SAVEPOINT`, `SET TRANSACTION` |
| **DQL**: Data Query Language (some books only) | Retrieval | `SELECT` |

- ⭐ Asked in DSSSB: "used to define the structure of a relation as well as delete relations and relate schemas" → **DDL**.
- **DQL note:** Korth and Navathe treat SELECT as part of DML (the "query" part of DML). Many Indian textbooks list it separately as DQL. If an option says "SELECT is DML", accept it. If DQL is offered as a separate category, SELECT is DQL.
- **MERGE** (SQL:2003) does an insert-or-update ("upsert") from a source table. Oracle and SQL Server have it. MySQL does **not**, so it uses `INSERT … ON DUPLICATE KEY UPDATE` or `REPLACE` instead.
- **RENAME**: in MySQL, `RENAME TABLE a TO b;`. In Oracle, `RENAME a TO b;`. SQL Server has no RENAME command and uses `sp_rename`.
- **COMMENT**: in Oracle and PostgreSQL, `COMMENT ON TABLE emp IS '...'`. In MySQL, you add a `COMMENT '...'` clause inside CREATE or ALTER.
- In MySQL and Oracle, a DDL statement causes an **implicit COMMIT**.

```sql
-- DCL
GRANT SELECT, INSERT ON EMPLOYEE TO ravi WITH GRANT OPTION;
REVOKE INSERT ON EMPLOYEE FROM ravi;          -- standard SQL also allows CASCADE | RESTRICT here

-- TCL (MySQL)
START TRANSACTION;                             -- or BEGIN
UPDATE EMPLOYEE SET salary = salary + 1000 WHERE dept_id = 10;
SAVEPOINT s1;
DELETE FROM EMPLOYEE WHERE emp_id = 105;
ROLLBACK TO SAVEPOINT s1;                      -- undoes only the DELETE
COMMIT;                                        -- makes the UPDATE permanent
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

In Oracle you write `ROLLBACK TO s1`. In SQL Server you write `SAVE TRANSACTION s1` and `ROLLBACK TRANSACTION s1`. MySQL runs in **autocommit** mode by default.

### DELETE vs TRUNCATE vs DROP

| | `DELETE FROM t [WHERE …]` | `TRUNCATE TABLE t` | `DROP TABLE t` |
|---|---|---|---|
| Category | DML | DDL | DDL |
| Removes | Selected rows, or all rows | All rows | Rows **and** the structure, indexes, constraints and triggers |
| WHERE allowed | Yes | No | No |
| How | Row by row, each row logged | Deallocates data pages, minimal logging | Removes the table from the catalog |
| Speed | Slowest | Fast | Fast |
| Row triggers fire | Yes (DELETE triggers) | No | No |
| Rollback | Yes, until COMMIT | No in MySQL and Oracle (implicit commit). Yes inside a transaction in SQL Server | No in MySQL and Oracle |
| AUTO_INCREMENT / IDENTITY | Not reset | **Reset** to the start value | Gone with the table |
| Table still exists | Yes (structure kept) | Yes (empty) | No |

## 3. Data types (MySQL names first)

| Type | Meaning | Notes / other DBMS |
|---|---|---|
| `CHAR(n)` | **Fixed-length** string, padded with spaces up to n | MySQL n ≤ 255. Wastes space but is fast. Good for fixed codes such as `CHAR(6)` for a PIN code |
| `VARCHAR(n)` | **Variable-length** string, stores only the actual length plus 1–2 length bytes | MySQL up to 65,535 bytes per row. Oracle calls it `VARCHAR2` |
| `TINYINT`, `SMALLINT`, `MEDIUMINT`, `INT`/`INTEGER`, `BIGINT` | Integers of 1, 2, 3, 4 and 8 bytes | INT range −2,147,483,648 to 2,147,483,647. `UNSIGNED` is allowed |
| `DECIMAL(p,s)` / `NUMERIC(p,s)` | **Exact** fixed-point. p = total digits (precision), s = digits after the point (scale) | `DECIMAL(5,2)` holds −999.99 to 999.99. MySQL p ≤ 65. Oracle uses `NUMBER(p,s)` |
| `FLOAT`, `DOUBLE`/`REAL` | **Approximate** floating point (4 and 8 bytes) | Never use for money |
| `DATE` | `'YYYY-MM-DD'` | MySQL range 1000-01-01 to 9999-12-31. Oracle DATE **also stores the time** |
| `TIME` | `'hh:mm:ss'` | MySQL range −838:59:59 to 838:59:59 |
| `DATETIME` | `'YYYY-MM-DD hh:mm:ss'` | No time-zone conversion. SQL Server: `DATETIME`, `DATETIME2` |
| `TIMESTAMP` | Date and time stored as UTC | MySQL range 1970-01-01 00:00:01 to 2038-01-19 03:14:07 UTC. Converted to the session time zone |
| `YEAR` | 4-digit year | MySQL only |
| `BOOLEAN`/`BOOL` | In MySQL a synonym for `TINYINT(1)`: TRUE = 1, FALSE = 0 | SQL Server uses `BIT` |
| `BLOB` (TINY/–/MEDIUM/LONG) | Binary Large OBject: images, files | BLOB holds 64 KB and LONGBLOB 4 GB. SQL Server: `VARBINARY(MAX)` |
| `TEXT` (TINY/–/MEDIUM/LONG) | Long character data | Standard/Oracle: `CLOB`. SQL Server: `VARCHAR(MAX)` |
| `ENUM('a','b')`, `SET(...)` | One value from a list / a set of values | MySQL only |

**CHAR vs VARCHAR:** if you store `'ab'` in `CHAR(5)`, it occupies 5 characters (it is padded, and MySQL strips the trailing spaces again when you read it back). In `VARCHAR(5)`, the same value takes 2 characters plus a length byte.

## 4. CREATE TABLE and constraints

```sql
CREATE TABLE DEPT (
  dept_id   INT          PRIMARY KEY,                  -- column-level constraint
  dname     VARCHAR(20)  NOT NULL UNIQUE,
  location  VARCHAR(20)  DEFAULT 'Delhi'
);

CREATE TABLE EMPLOYEE (
  emp_id     INT AUTO_INCREMENT,
  name       VARCHAR(30)    NOT NULL,
  email      VARCHAR(50)    UNIQUE,
  dept_id    INT,
  salary     DECIMAL(10,2)  CHECK (salary > 0),
  city       VARCHAR(20)    DEFAULT 'Delhi',
  manager_id INT,
  CONSTRAINT pk_emp      PRIMARY KEY (emp_id),         -- table-level, named
  CONSTRAINT fk_emp_dept FOREIGN KEY (dept_id) REFERENCES DEPT(dept_id)
                         ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_emp_mgr  FOREIGN KEY (manager_id) REFERENCES EMPLOYEE(emp_id)
);
```

| Constraint | Exactly what it does |
|---|---|
| `NOT NULL` | The column cannot hold NULL |
| `UNIQUE` | No two rows can have the same value. NULLs are allowed: MySQL and standard SQL allow many NULLs, **SQL Server allows only one NULL** |
| `PRIMARY KEY` | = UNIQUE + NOT NULL. **Only one per table**, but it can be composite: `PRIMARY KEY (a, b)`. Enforces **entity integrity** |
| `FOREIGN KEY … REFERENCES` | Each value must match an existing primary-key (or unique) value in the parent table, or be NULL. Enforces **referential integrity**, the constraint "specified between two relations" ⭐ Asked in DSSSB |
| `CHECK (condition)` | Every row must satisfy the condition. MySQL **ignored** CHECK before 8.0.16 and enforces it from 8.0.16 |
| `DEFAULT value` | **Supplies a value for the column when an INSERT does not specify one** ⭐ Asked in DSSSB |

**What DEFAULT does, exactly:**

```sql
INSERT INTO EMPLOYEE (name, dept_id, salary) VALUES ('Gita', 10, 35000);        -- city = 'Delhi'
INSERT INTO EMPLOYEE (name, dept_id, salary, city) VALUES ('Hari', 10, 35000, DEFAULT); -- city = 'Delhi'
INSERT INTO EMPLOYEE (name, dept_id, salary, city) VALUES ('Indu', 10, 35000, NULL);    -- city = NULL!
UPDATE EMPLOYEE SET city = DEFAULT WHERE name = 'Indu';                          -- back to 'Delhi'
```

- DEFAULT is used only when the column is **omitted** or when you write the keyword `DEFAULT`. An explicit NULL is stored as NULL.
- DEFAULT does **not** stop NULLs (that is NOT NULL's job), does not check values (CHECK) and does not force uniqueness (UNIQUE). These three are the wrong options in the exam question.
- A column with no DEFAULT clause has an implicit default of NULL, if it is nullable.
- MySQL 8.0.13+ allows expression defaults in parentheses, for example `DEFAULT (CURRENT_DATE)`. `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` has always been allowed.

**Referential actions** (`ON DELETE` / `ON UPDATE` on the child's foreign key) decide what happens when a parent row is deleted or updated:

| Action | Effect on child rows |
|---|---|
| `CASCADE` | Child rows are deleted too (or updated to the new key) |
| `SET NULL` | The child's foreign-key column becomes NULL |
| `SET DEFAULT` | The child's foreign-key column takes its DEFAULT value. MySQL InnoDB rejects this |
| `RESTRICT` / `NO ACTION` | The parent delete/update is **refused** while child rows exist. This is the default |

Oracle supports only `ON DELETE CASCADE` and `ON DELETE SET NULL`, and has no ON UPDATE clause.

### ALTER TABLE

```sql
ALTER TABLE EMPLOYEE ADD phone CHAR(10);                          -- add column (existing rows get NULL or the DEFAULT)
ALTER TABLE EMPLOYEE ADD COLUMN pan CHAR(10) AFTER name;          -- MySQL: position with FIRST / AFTER
ALTER TABLE EMPLOYEE MODIFY phone VARCHAR(15) NOT NULL;           -- MySQL/Oracle: change type
ALTER TABLE EMPLOYEE ALTER COLUMN phone VARCHAR(15);              -- SQL Server form of the same
ALTER TABLE EMPLOYEE CHANGE phone mobile VARCHAR(15);             -- MySQL: rename + retype
ALTER TABLE EMPLOYEE RENAME COLUMN mobile TO mobile_no;           -- MySQL 8 / Oracle
ALTER TABLE EMPLOYEE DROP COLUMN pan;
ALTER TABLE EMPLOYEE ADD CONSTRAINT chk_sal CHECK (salary >= 10000);
ALTER TABLE EMPLOYEE DROP CONSTRAINT chk_sal;
ALTER TABLE EMPLOYEE ALTER city SET DEFAULT 'Noida';              -- change a default
ALTER TABLE EMPLOYEE ALTER city DROP DEFAULT;
ALTER TABLE EMPLOYEE RENAME TO STAFF;                             -- MySQL/Oracle
```

In SQL Server, if you add a *nullable* column with a DEFAULT, the existing rows stay NULL unless you add `WITH VALUES`. In MySQL, the existing rows get the default.

### Schema evolution commands (Navathe wording) ⭐ Asked in DSSSB

A **schema** groups the tables, views, domains, constraints and other elements that belong to one application.

```sql
CREATE SCHEMA COMPANY AUTHORIZATION 'Jsmith';

DROP SCHEMA COMPANY CASCADE;    -- drops the schema AND all its tables, domains, other elements
DROP SCHEMA COMPANY RESTRICT;   -- drops the schema ONLY IF it has no elements in it

DROP TABLE DEPENDENT CASCADE;   -- also drops constraints/views that reference the table
DROP TABLE DEPENDENT RESTRICT;  -- dropped only if not referenced by any constraint (e.g. a FK
                                -- in another table) or view or any other element

ALTER TABLE COMPANY.EMPLOYEE ADD COLUMN Job VARCHAR(12);
ALTER TABLE COMPANY.EMPLOYEE DROP COLUMN Address CASCADE;   -- RESTRICT: only if no view/constraint uses it
ALTER TABLE COMPANY.DEPARTMENT ALTER COLUMN Mgr_ssn DROP DEFAULT;
ALTER TABLE COMPANY.DEPARTMENT ALTER COLUMN Mgr_ssn SET DEFAULT '333445555';
ALTER TABLE COMPANY.EMPLOYEE DROP CONSTRAINT EMPSUPERFK CASCADE;
```

- The command for schema evolution with RESTRICT/CASCADE is **DROP**. ALTER has no "drop the schema only if empty" behaviour, and DELETE and UPDATE are DML.
- Navathe: when you ADD a column, existing tuples get NULL in it, so a `NOT NULL` column can be added only if it has a DEFAULT.
- In real products: **MySQL** treats `SCHEMA` as a synonym for `DATABASE`, and `DROP SCHEMA db` drops everything (it has no CASCADE or RESTRICT for schemas). **PostgreSQL** supports both keywords and defaults to RESTRICT. **SQL Server**'s `DROP SCHEMA s` fails if the schema contains objects, so it behaves like RESTRICT.

## 5. Sample tables used in this chapter

**DEPT**

| dept_id | dname | location |
|---|---|---|
| 10 | Sales | Delhi |
| 20 | HR | Mumbai |
| 30 | IT | Delhi |
| 40 | Admin | Pune |

**EMPLOYEE** (has NULLs, a duplicate salary 40000, and a zero commission)

| emp_id | name | dept_id | salary | commission | manager_id | join_date |
|---|---|---|---|---|---|---|
| 101 | Amit | 10 | 50000 | NULL | NULL | 2018-04-12 |
| 102 | Bina | 20 | 40000 | 5000 | 101 | 2019-07-01 |
| 103 | Chetan | 10 | 30000 | NULL | 101 | 2020-01-15 |
| 104 | Divya | 30 | 40000 | 2000 | 102 | 2021-03-10 |
| 105 | Esha | NULL | 25000 | NULL | 102 | 2022-11-20 |
| 106 | Farhan | 20 | 60000 | 0 | 101 | 2017-09-05 |

## 6. SELECT in full

```sql
SELECT [DISTINCT | ALL] col_list | *     -- 5  (then 6: DISTINCT)
FROM   table(s) [JOIN … ON …]            -- 1
WHERE  row_condition                     -- 2
GROUP BY col_list                        -- 3
HAVING group_condition                   -- 4
ORDER BY col [ASC|DESC], …               -- 7
LIMIT n [OFFSET m];                      -- 8
```

| Order of **writing** | Order of **execution** |
|---|---|
| SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT | **FROM** (and JOINs) → **WHERE** → **GROUP BY** → **HAVING** → **SELECT** → **DISTINCT** → **ORDER BY** → **LIMIT/OFFSET** |

What this order means in practice:
- WHERE runs before SELECT, so a **column alias cannot be used in WHERE** in standard SQL. It *can* be used in ORDER BY. MySQL also lets you use it in GROUP BY and HAVING, as an extension.
- WHERE runs before grouping, so **aggregates are not allowed in WHERE**. Put aggregate conditions in HAVING.
- In relational-algebra terms, SQL `SELECT` = projection **π**, `WHERE` = selection **σ**, and `FROM` with several tables = Cartesian product **×**.

**`*` and DISTINCT** ⭐ Asked in DSSSB: `SELECT * FROM EMPLOYEE;` returns all attributes of the selected tuples. `SELECT DISTINCT dept_id FROM EMPLOYEE;` removes duplicate rows (all NULLs count as one value). The default is `ALL`, which keeps duplicates. `DISTINCT` applies to the **whole row** of selected columns, not to the first column only.

**Aliases:** `SELECT name AS emp_name, salary*12 AS annual FROM EMPLOYEE AS e;`. The `AS` keyword is optional, and Oracle does not allow `AS` before a *table* alias. Put an alias with spaces in double quotes (SQL Server also accepts `[ ]`, MySQL also accepts backticks).

### WHERE operators

| Operator | Example | Note |
|---|---|---|
| `=`, `<>` or `!=`, `<`, `>`, `<=`, `>=` | `salary <> 40000` | `<>` is standard. `!=` is accepted by MySQL, SQL Server and Oracle. MySQL also has `<=>` (NULL-safe equal) |
| `BETWEEN a AND b` | `salary BETWEEN 30000 AND 50000` | **Inclusive** of both ends. Write the smaller value first: `BETWEEN 50000 AND 30000` returns nothing |
| `IN (list)` | `dept_id IN (10, 30)` | Same as `dept_id = 10 OR dept_id = 30` |
| `LIKE pattern` | `name LIKE 'A%'` | `%` = zero or more characters, `_` = exactly one character ⭐ Asked in DSSSB |
| `IS NULL` / `IS NOT NULL` | `commission IS NULL` | The **only** correct way to test for NULL |
| `NOT`, `AND`, `OR` | | Precedence: **NOT > AND > OR**. Use brackets to be safe |

**LIKE patterns** (the exam asks which operator does "character pattern" matching: LIKE)

| Pattern | Matches |
|---|---|
| `'A%'` | starts with A |
| `'%a'` | ends with a |
| `'%an%'` | contains "an" anywhere |
| `'_i%'` | second character is i |
| `'____'` | exactly 4 characters |
| `'A_%'` | starts with A and has at least 2 characters |
| `'50\%%'` (MySQL, where `\` is the default escape) or `'50!%%' ESCAPE '!'` | starts with the literal text "50%" |

`ESCAPE` makes the next character literal. Korth's example: `LIKE 'ab\%cd%' ESCAPE '\'` matches strings beginning with "ab%cd". Case sensitivity: standard SQL, Oracle and PostgreSQL are case-sensitive. MySQL and SQL Server are case-insensitive under their default collations. PostgreSQL has `ILIKE` for case-insensitive matching, and SQL Server also accepts `[A-C]` and `[^A]` inside patterns.

### NULL behaviour and three-valued logic

NULL means "unknown / not applicable". It is **not** zero and not an empty string (except in Oracle, which treats `''` as NULL).
- Arithmetic with NULL gives NULL: `50000 + NULL = NULL`.
- Comparison with NULL gives **UNKNOWN**: `NULL = NULL` is UNKNOWN, not TRUE. WHERE and HAVING keep only rows that are **TRUE**.
- Aggregates skip NULLs (except `COUNT(*)`). GROUP BY, DISTINCT and UNION treat all NULLs as one value.

| AND | T | U | F |
|---|---|---|---|
| **T** | T | U | F |
| **U** | U | U | F |
| **F** | F | F | F |

For OR: T OR U = T, F OR U = U, U OR U = U. NOT U = U.

### ORDER BY and row limiting

`ORDER BY dept_id DESC, salary ASC` sorts by dept_id first, and breaks ties by salary. ASC is the default. You may also give a column position (`ORDER BY 2`) or an alias. NULLs sort **first** in ascending order in MySQL, SQL Server and SQLite, and **last** in Oracle and PostgreSQL (`NULLS FIRST`/`NULLS LAST` changes this in Oracle and PostgreSQL).

| DBMS | First 3 rows | Skip 3, take 2 |
|---|---|---|
| MySQL / PostgreSQL / SQLite | `… LIMIT 3` | `LIMIT 2 OFFSET 3` or MySQL `LIMIT 3, 2` (offset first!) |
| SQL Server | `SELECT TOP 3 …` (also `TOP 10 PERCENT`) | `ORDER BY … OFFSET 3 ROWS FETCH NEXT 2 ROWS ONLY` |
| Oracle 12c+ / standard SQL:2008 | `FETCH FIRST 3 ROWS ONLY` | `OFFSET 3 ROWS FETCH NEXT 2 ROWS ONLY` (older Oracle: `ROWNUM`) |

## 7. Operators

| Type | Operators | Points to remember |
|---|---|---|
| Arithmetic | `+ - * / %` | Integer `7/2` = **3** in SQL Server (int ÷ int), but **3.5000** in MySQL and 3.5 in Oracle. MySQL has `DIV` for integer division (`7 DIV 2 = 3`) and `MOD` / `%`. Oracle has **no `%`** and uses `MOD()` |
| Comparison | `= <> != < > <= >=`, BETWEEN, IN, LIKE, IS NULL | Results are TRUE, FALSE or UNKNOWN |
| Logical | `NOT`, `AND`, `OR` | Precedence NOT > AND > OR |
| Concatenation ⭐ Asked in DSSSB | `||` (standard SQL, Oracle, PostgreSQL, SQLite, DB2) · `+` (SQL Server) · `CONCAT()` (MySQL; Oracle's version takes only 2 arguments; SQL Server 2012+) | In **MySQL `||` means logical OR** unless `sql_mode` contains `PIPES_AS_CONCAT` (or ANSI) |

```sql
SELECT 'Data' || 'base';            -- Oracle/PostgreSQL: Database
SELECT 'Data' + 'base';             -- SQL Server:        Database
SELECT CONCAT('Data', 'base');      -- MySQL:             Database
SELECT 'Data' || 'base';            -- MySQL default:     0  (OR of two non-numeric strings → 0)
SELECT CONCAT('A', NULL, 'B');      -- MySQL: NULL   (SQL Server CONCAT: 'AB' – it treats NULL as '')
SELECT CONCAT_WS('-', 'A', NULL, 'B'); -- MySQL: 'A-B' (skips NULLs)
SELECT 'A' || NULL FROM dual;       -- Oracle: 'A'  (Oracle treats NULL as '' here); PostgreSQL: NULL
```

## 8. Aggregate functions, GROUP BY, HAVING ⭐ Asked in DSSSB

An **aggregate function** takes a *group (collection) of rows* and returns **one value**.

| Function | Counts / computes | NULLs | Empty input gives |
|---|---|---|---|
| `COUNT(*)` | Number of **rows** | Counted | 0 |
| `COUNT(col)` | Number of **non-NULL** values | Ignored | 0 |
| `COUNT(DISTINCT col)` | Number of distinct non-NULL values | Ignored | 0 |
| `SUM(col)` | Total (numeric only) | Ignored | NULL |
| `AVG(col)` | SUM / COUNT(col) (numeric only) | Ignored | NULL |
| `MIN(col)`, `MAX(col)` | Smallest / largest. Also works on **strings and dates** | Ignored | NULL |

- The exam's "MAXIMUM" option means MAX. Other aggregates you may see: `STDDEV`, `VARIANCE`, `GROUP_CONCAT` (MySQL), `STRING_AGG` (SQL Server), `LISTAGG` (Oracle).
- **These are NOT aggregate functions:** CROSS PRODUCT (a join, and the exam answer), ROUND, CEILING, FLOOR, ABS, UPPER, LOWER, LENGTH, CONCAT, SUBSTRING, NOW, GETDATE, COALESCE, IFNULL, CAST. These are **scalar (single-row)** functions: they return one value **for each row**.
- `AVG(commission)` = 7000/3 = 2333.33 (only 3 non-NULL values), but `AVG(COALESCE(commission,0))` = 7000/6 = 1166.67.

**GROUP BY rules**
1. Every column in SELECT that is not inside an aggregate **must appear in GROUP BY**. MySQL enforces this with `ONLY_FULL_GROUP_BY`, which is on by default since 5.7.5.
2. GROUP BY may list columns that are not in SELECT.
3. All NULLs form **one group**.
4. You **cannot nest aggregates** in standard SQL (Oracle allows `MAX(AVG(sal))` with GROUP BY).

**WHERE vs HAVING**

| WHERE | HAVING |
|---|---|
| Filters **rows** before grouping | Filters **groups** after grouping |
| Cannot contain aggregates | Usually contains aggregates |
| Works with SELECT, UPDATE and DELETE | Works with SELECT only (normally with GROUP BY) |

```sql
SELECT dept_id, AVG(salary)
FROM   EMPLOYEE
WHERE  salary > 30000            -- removes Chetan (30000) and Esha (25000) first
GROUP  BY dept_id
HAVING AVG(salary) >= 45000;
-- Result: (10, 50000)  (20, 50000)       [dept 30: avg 40000 fails HAVING]
```

## 9. Joins

Two small tables:

**STUDENT**

| sid | sname | cid |
|---|---|---|
| 1 | Asha | C1 |
| 2 | Ravi | C2 |
| 3 | Neha | NULL |
| 4 | Karan | C4 |

**COURSE**

| cid | cname |
|---|---|
| C1 | DBMS |
| C2 | OS |
| C3 | CN |

**INNER JOIN / EQUI JOIN** gives only the matching rows. An equi join is a join whose condition uses `=`.
```sql
SELECT s.sname, c.cname FROM STUDENT s INNER JOIN COURSE c ON s.cid = c.cid;
-- old style: FROM STUDENT s, COURSE c WHERE s.cid = c.cid
```
| sname | cname |
|---|---|
| Asha | DBMS |
| Ravi | OS |

**NATURAL JOIN** is an equi join on **all columns with the same name**, and the common column appears **once**. If the tables share no column name, it becomes a CROSS JOIN.
```sql
SELECT * FROM STUDENT NATURAL JOIN COURSE;
```
| sid | sname | cid | cname |
|---|---|---|---|
| 1 | Asha | C1 | DBMS |
| 2 | Ravi | C2 | OS |

**USING vs ON:** `JOIN COURSE USING (cid)` joins on the named common column and shows it once, so it gives the same 4 columns as above. `ON s.cid = c.cid` can be any condition, and `SELECT *` then shows **both** `cid` columns. USING needs the column to have the same name in both tables.

**LEFT OUTER JOIN** gives all rows of the left table, with NULLs where nothing matches.
```sql
SELECT s.sname, c.cname FROM STUDENT s LEFT JOIN COURSE c ON s.cid = c.cid;
```
| sname | cname |
|---|---|
| Asha | DBMS |
| Ravi | OS |
| Neha | NULL |
| Karan | NULL |

**RIGHT OUTER JOIN** gives all rows of the right table.

| sname | cname |
|---|---|
| Asha | DBMS |
| Ravi | OS |
| NULL | CN |

**FULL OUTER JOIN** gives all rows of both tables: 2 matched + 2 left-only + 1 right-only = **5 rows**: (Asha, DBMS), (Ravi, OS), (Neha, NULL), (Karan, NULL), (NULL, CN). **MySQL does not support FULL OUTER JOIN**. You emulate it with `LEFT JOIN … UNION … RIGHT JOIN`.

**CROSS JOIN** (Cartesian product) pairs every row with every row: **m × n rows** and **a + b columns**. STUDENT × COURSE = 4 × 3 = **12 rows**, and EMPLOYEE × DEPT = 6 × 4 = 24 rows. `FROM A, B` with no WHERE is also a cross join.

**SELF JOIN** joins a table with itself. It **needs aliases**.
```sql
SELECT e.name AS employee, m.name AS manager
FROM   EMPLOYEE e LEFT JOIN EMPLOYEE m ON e.manager_id = m.emp_id;
```
| employee | manager |
|---|---|
| Amit | NULL |
| Bina | Amit |
| Chetan | Amit |
| Divya | Bina |
| Esha | Bina |
| Farhan | Amit |

With an INNER JOIN, Amit (who has no manager) would disappear and you would get 5 rows.

**THETA / NON-EQUI JOIN** uses a condition with any comparison θ ∈ {=, <>, <, >, ≤, ≥}. When θ is `=` it is an equi join, and other operators give a non-equi join. Take a table GRADE(grade, low, high) = (A, 45001, 99999), (B, 30001, 45000), (C, 0, 30000):
```sql
SELECT e.name, e.salary, g.grade
FROM   EMPLOYEE e JOIN GRADE g ON e.salary BETWEEN g.low AND g.high;
-- Amit 50000 A | Bina 40000 B | Chetan 30000 C | Divya 40000 B | Esha 25000 C | Farhan 60000 A
```

## 10. Set operations

| Operator | Result | Duplicates |
|---|---|---|
| `UNION` | Rows in either query | **Removed** |
| `UNION ALL` | Rows in either query | **Kept** (faster, because there is no sort or de-duplication) |
| `INTERSECT` | Rows in both | Removed |
| `EXCEPT` (standard, SQL Server, PostgreSQL) / `MINUS` (Oracle) | Rows in the first query but not in the second (= R − S) | Removed |

**Union compatibility:** both queries must return the **same number of columns**, with **compatible data types** in the same positions. The column names come from the **first** query, and a single ORDER BY may appear only at the **end**. MySQL supports INTERSECT and EXCEPT only from **8.0.31**.

```sql
SELECT dept_id FROM EMPLOYEE  UNION      SELECT dept_id FROM DEPT;  -- NULL,10,20,30,40      (5 rows)
SELECT dept_id FROM EMPLOYEE  UNION ALL  SELECT dept_id FROM DEPT;  -- 6 + 4 = 10 rows
SELECT dept_id FROM DEPT      INTERSECT  SELECT dept_id FROM EMPLOYEE;  -- 10,20,30
SELECT dept_id FROM DEPT      EXCEPT     SELECT dept_id FROM EMPLOYEE;  -- 40
```

## 11. Subqueries (nested queries)

A subquery is a SELECT inside another statement. It can sit in WHERE, HAVING, FROM or SELECT.

**Single-row subquery** returns one value and is used with `= < > <= >= <>`. It raises an error if the subquery returns more than one row.
```sql
SELECT name FROM EMPLOYEE WHERE salary = (SELECT MAX(salary) FROM EMPLOYEE);   -- Farhan
```

**Multi-row subquery** is used with `IN`, `ANY`/`SOME` (synonyms) and `ALL`:

| Form | Meaning |
|---|---|
| `x IN (subq)` | x equals some value. **`= ANY` ≡ `IN`** |
| `x NOT IN (subq)` | x differs from every value. **`<> ALL` ≡ `NOT IN`**. If the subquery contains a NULL → no rows |
| `x > ANY (subq)` | x greater than at least one value, i.e. **> MIN** |
| `x > ALL (subq)` | x greater than every value, i.e. **> MAX** |
| `x < ANY (subq)` / `x < ALL (subq)` | < MAX / < MIN |
| `> ALL (empty set)` | TRUE. `> ANY (empty set)` is FALSE |

```sql
-- dept 20 salaries are 40000, 60000
SELECT name FROM EMPLOYEE WHERE salary > ANY (SELECT salary FROM EMPLOYEE WHERE dept_id = 20);
-- > 40000  → Amit, Farhan
SELECT name FROM EMPLOYEE WHERE salary > ALL (SELECT salary FROM EMPLOYEE WHERE dept_id = 20);
-- > 60000  → no rows
```

**Correlated subquery:** the inner query uses a column of the outer query, so it is **re-evaluated for every outer row**. A non-correlated subquery is evaluated **once**, before the outer query, and its result is substituted in. This is how nested queries are evaluated: innermost first.
```sql
-- employees earning more than the average of their own department
SELECT name FROM EMPLOYEE e
WHERE  salary > (SELECT AVG(salary) FROM EMPLOYEE WHERE dept_id = e.dept_id);
-- dept 10 avg 40000 → Amit; dept 20 avg 50000 → Farhan; dept 30 avg 40000 → none (not >);
-- Esha: dept_id = NULL matches nothing → AVG is NULL → UNKNOWN.   Result: Amit, Farhan
```

**EXISTS / NOT EXISTS** is TRUE if the subquery returns **at least one row** (or no row, for NOT EXISTS). The columns it selects do not matter (`SELECT *` or `SELECT 1`). It is almost always correlated.
```sql
SELECT dname FROM DEPT d
WHERE NOT EXISTS (SELECT * FROM EMPLOYEE e WHERE e.dept_id = d.dept_id);   -- Admin
```

**Subquery in FROM (derived table / inline view)** must have an alias in MySQL and SQL Server.
```sql
SELECT t.dept_id, t.total
FROM  (SELECT dept_id, SUM(salary) AS total FROM EMPLOYEE GROUP BY dept_id) AS t
WHERE  t.total > 50000;                        -- (10, 80000) (20, 100000)
```

A **scalar subquery in SELECT**: `SELECT dname, (SELECT MAX(salary) FROM EMPLOYEE e WHERE e.dept_id = d.dept_id) FROM DEPT d;` gives Sales 50000, HR 60000, IT 40000, Admin NULL.

### "Second highest salary" patterns (salaries: 60000, 50000, 40000, 40000, 30000, 25000)

```sql
-- 1. Nested MAX (works everywhere)                          → 50000
SELECT MAX(salary) FROM EMPLOYEE WHERE salary < (SELECT MAX(salary) FROM EMPLOYEE);

-- 2. LIMIT/OFFSET (MySQL); N-th highest = OFFSET N-1        → 50000
SELECT DISTINCT salary FROM EMPLOYEE ORDER BY salary DESC LIMIT 1 OFFSET 1;   -- = LIMIT 1,1

-- 3. Correlated count: N-th highest has exactly N-1 distinct salaries above it
SELECT DISTINCT salary FROM EMPLOYEE e1
WHERE 1 = (SELECT COUNT(DISTINCT salary) FROM EMPLOYEE e2 WHERE e2.salary > e1.salary);  -- 50000

-- 4. SQL Server TOP
SELECT TOP 1 salary FROM (SELECT DISTINCT TOP 2 salary FROM EMPLOYEE ORDER BY salary DESC) t
ORDER BY salary ASC;                                                          -- 50000

-- 5. Window function (MySQL 8, SQL Server, Oracle)
SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM EMPLOYEE) t
WHERE r = 2;                                                                  -- 50000
```
Why DISTINCT matters: the 4th highest *distinct* salary is 30000, but `ORDER BY salary DESC LIMIT 1 OFFSET 3` without DISTINCT returns **40000**, because 40000 appears twice. In the same way, RANK() skips numbers after a tie (1, 2, 3, 3, 5) while DENSE_RANK() does not (1, 2, 3, 3, 4).

## 12. Views, indexes, sequences and other database objects

**View** is a virtual table defined by a query. Only the definition is stored, not the data, and the query runs whenever the view is used.
```sql
CREATE VIEW delhi_emp AS
  SELECT emp_id, name, dept_id, salary FROM EMPLOYEE WHERE dept_id IN (10, 30)
  WITH CHECK OPTION;
CREATE OR REPLACE VIEW …;     -- MySQL/Oracle (SQL Server 2016+: CREATE OR ALTER VIEW)
DROP VIEW delhi_emp;
```
- **Updatable view** (you can INSERT, UPDATE or DELETE through it) generally requires: a single base table, no aggregate functions, no DISTINCT, no GROUP BY or HAVING, no UNION, and no derived columns for the columns being changed. For INSERT, every NOT NULL column without a default must be in the view.
- **WITH CHECK OPTION** rejects any INSERT or UPDATE through the view that would create a row the view itself cannot see. Example: `UPDATE delhi_emp SET dept_id = 20 …` is refused. MySQL has `CASCADED` (the default) and `LOCAL`.
- Views are used for security (hiding columns and rows), for simplifying complex queries and for logical data independence. A **materialized view** (Oracle, PostgreSQL; indexed views in SQL Server) stores the result physically.

**Index:** `CREATE INDEX idx_name ON EMPLOYEE(name);`, `CREATE UNIQUE INDEX ux_email ON EMPLOYEE(email);`, and `DROP INDEX idx_name ON EMPLOYEE;` (MySQL syntax). An index is an auxiliary access structure that speeds up searching (WHERE, JOIN, ORDER BY) at the cost of extra storage and slower INSERT, UPDATE and DELETE. Most DBMSs automatically create an index for a PRIMARY KEY and for each UNIQUE constraint. The SQL standard itself does not define CREATE INDEX. Index types are covered in the chapter *Indexing & File Organisation*.

**Sequences / auto-numbering**
- MySQL: `emp_id INT AUTO_INCREMENT PRIMARY KEY`. Only one per table, and it must be a key. `LAST_INSERT_ID()` returns the last value generated.
- SQL Server: `emp_id INT IDENTITY(1,1)` (seed, increment). Sequences are available from 2012 (`NEXT VALUE FOR s`).
- Oracle: `CREATE SEQUENCE emp_seq START WITH 1 INCREMENT BY 1;` and then `emp_seq.NEXTVAL`, `emp_seq.CURRVAL`. Identity columns are available from 12c. PostgreSQL uses `SERIAL` or identity columns.

**Stored procedure:** a named, precompiled set of SQL (and procedural) statements stored in the database and run with `CALL p()` (MySQL) or `EXEC p` (SQL Server). It can take IN, OUT and INOUT parameters. A **stored function** returns a value and can be used inside a SELECT.

**Trigger:** a statement the DBMS executes **automatically** as a side effect of a change to the database. It follows the **ECA model**: Event (INSERT/UPDATE/DELETE), Condition, Action. Triggers can be **BEFORE** or **AFTER**, and **row-level** (`FOR EACH ROW`) or statement-level. You cannot call a trigger directly.

**Cursor:** a pointer for processing a multi-row query result **one row at a time**: `DECLARE c CURSOR FOR SELECT …; OPEN c; FETCH c INTO …; CLOSE c;`. Oracle distinguishes **implicit** cursors (created automatically for single SQL statements) from **explicit** cursors (declared by the programmer).

**Embedded SQL:** SQL statements written inside a **host language** program (C, COBOL, Java…), marked with `EXEC SQL … ;` (COBOL ends them with `END-EXEC`). A **preprocessor** replaces them with library calls before compilation. Host variables are prefixed with `:` (for example `:sal`). The SQL is fixed at compile time (static SQL).

**Dynamic SQL:** the program **builds the SQL statement as a string at run time** and submits it (`PREPARE`, `EXECUTE`, `EXECUTE IMMEDIATE`; MySQL `PREPARE stmt FROM @q`).

**ODBC / JDBC** ⭐ Asked in DSSSB: an application program communicates with a database server through **ODBC** (Open Database Connectivity, a Microsoft-originated C API usable from many languages) or **JDBC** (Java Database Connectivity, the `java.sql` API). Both are dynamic-SQL APIs.

## 13. Built-in (scalar) functions: MySQL | SQL Server | Oracle

### String functions

| Purpose | MySQL | SQL Server | Oracle | Example → result |
|---|---|---|---|---|
| Length | `LENGTH(s)` (bytes), `CHAR_LENGTH(s)` (characters) | `LEN(s)` (**ignores trailing spaces**), `DATALENGTH` (bytes) | `LENGTH(s)` | `LENGTH('  SQL  ')` = 7; SQL Server `LEN('SQL  ')` = 3 |
| Upper / lower | `UPPER`/`UCASE`, `LOWER`/`LCASE` | `UPPER`, `LOWER` | `UPPER`, `LOWER`, `INITCAP` | `UPPER('dbms')` = 'DBMS'; Oracle `INITCAP('ram lal')` = 'Ram Lal' |
| Substring | `SUBSTRING(s,pos,len)` = `SUBSTR` = `MID` | `SUBSTRING(s,start,len)` (all 3 args required) | `SUBSTR(s,pos,len)` | `SUBSTRING('DATABASE',3,4)` = 'TABA'. Positions start at **1** |
| Left / right part | `LEFT(s,n)`, `RIGHT(s,n)` | `LEFT`, `RIGHT` | none (use `SUBSTR(s,1,n)`, `SUBSTR(s,-n)`) | `LEFT('DATABASE',4)` = 'DATA', `RIGHT('DATABASE',4)` = 'BASE' |
| Trim spaces | `TRIM`, `LTRIM`, `RTRIM` | `LTRIM`, `RTRIM`, `TRIM` (2017+) | `TRIM`, `LTRIM`, `RTRIM` | `TRIM('  SQL  ')` = 'SQL'; `TRIM(BOTH 'x' FROM 'xxSQLxx')` = 'SQL' |
| Replace | `REPLACE(s,from,to)` | `REPLACE` | `REPLACE` | `REPLACE('BANANA','AN','x')` = 'BxxA' |
| Position of substring | `INSTR(s,sub)`, `LOCATE(sub,s[,start])`, `POSITION(sub IN s)` | `CHARINDEX(sub,s[,start])` | `INSTR(s,sub[,pos[,n]])` | `INSTR('DATABASE','A')` = 2; returns **0** if not found |
| Join strings | `CONCAT(a,b,…)`, `CONCAT_WS(sep,…)` | `+`, `CONCAT` (2012+) | `||`, `CONCAT(a,b)` (2 args) | `CONCAT('SQL','-','DB')` = 'SQL-DB' |
| Pad | `LPAD(s,n,c)`, `RPAD` | none (use `RIGHT(REPLICATE('0',3)+s,3)`) | `LPAD`, `RPAD` | `LPAD('7',3,'0')` = '007'; `RPAD('AB',5,'*')` = 'AB***'; `LPAD('HELLO',3,'*')` = 'HEL' (it truncates) |
| Reverse | `REVERSE(s)` | `REVERSE(s)` | (no documented function) | `REVERSE('SQL')` = 'LQS' |
| Repeat | `REPEAT(s,n)` | `REPLICATE(s,n)` | `RPAD` trick | `REPEAT('ab',3)` = 'ababab' |

Watch the argument order: `INSTR(string, substring)` but `LOCATE(substring, string)` and `CHARINDEX(substring, string)`. With a negative position, MySQL `SUBSTRING('DATABASE',-4)` and Oracle `SUBSTR('DATABASE',-4)` both give 'BASE'.

### Numeric functions

| Purpose | MySQL | SQL Server | Oracle | Example → result |
|---|---|---|---|---|
| Absolute value | `ABS` | `ABS` | `ABS` | `ABS(-7)` = 7 |
| Ceiling: **smallest integer ≥ x** ⭐ Asked in DSSSB | `CEIL`, `CEILING` | `CEILING` only | `CEIL` only | `CEILING(4.2)` = 5, `CEILING(-4.2)` = **−4**, `CEILING(5)` = 5 |
| Floor: **largest integer ≤ x** | `FLOOR` | `FLOOR` | `FLOOR` | `FLOOR(4.8)` = 4, `FLOOR(-4.2)` = **−5** |
| Round | `ROUND(x[,d])` | `ROUND(x,d)` (d required) | `ROUND(x[,d])` | `ROUND(4.567,2)` = 4.57, `ROUND(4.5)` = 5, `ROUND(1234.5,-2)` = 1200 |
| Truncate (cut off digits, no rounding) | `TRUNCATE(x,d)` (d required) | `ROUND(x,d,1)` | `TRUNC(x[,d])` | `TRUNCATE(4.789,1)` = 4.7, `TRUNCATE(-4.789,0)` = −4 |
| Remainder | `MOD(a,b)`, `a % b`, `a MOD b` | `a % b` only | `MOD(a,b)` only | `MOD(17,5)` = 2; `MOD(-7,3)` = −1 (the sign follows the dividend) |
| Power | `POWER`, `POW` | `POWER` | `POWER` | `POWER(2,10)` = 1024 |
| Square root | `SQRT` | `SQRT` | `SQRT` | `SQRT(144)` = 12 |
| Sign | `SIGN` | `SIGN` | `SIGN` | `SIGN(-7)` = −1, `SIGN(0)` = 0, `SIGN(3)` = 1 |
| Random | `RAND()` (0 ≤ r < 1) | `RAND()` | `DBMS_RANDOM.VALUE` | — |

For a positive number, CEILING rounds up. For a negative number, CEILING moves **towards zero** and FLOOR moves **away from zero**.

### Date and time functions ⭐ Asked in DSSSB

| Purpose | MySQL | SQL Server | Oracle |
|---|---|---|---|
| Current date + time | `NOW()` = `CURRENT_TIMESTAMP` = `CURRENT_TIMESTAMP()` = `LOCALTIMESTAMP` (fixed at statement start); `SYSDATE()` (time at the moment the function executes) | `GETDATE()` → **datetime, no time-zone offset**; `CURRENT_TIMESTAMP` (ANSI equivalent of GETDATE); `SYSDATETIME()` → **datetime2(7)**, higher precision, no offset; `SYSDATETIMEOFFSET()` → **datetimeoffset(7), includes the time-zone offset** | `SYSDATE` (DATE, server OS time, no parentheses); `SYSTIMESTAMP` (with time zone); `CURRENT_TIMESTAMP` (session time zone) |
| Current UTC | `UTC_TIMESTAMP()` | `GETUTCDATE()` (datetime), `SYSUTCDATETIME()` (datetime2) | `SYS_EXTRACT_UTC(SYSTIMESTAMP)` |
| Current date only | `CURDATE()` = `CURRENT_DATE` | `CAST(GETDATE() AS DATE)` | `CURRENT_DATE`, `TRUNC(SYSDATE)` |
| Current time only | `CURTIME()` = `CURRENT_TIME` | `CAST(GETDATE() AS TIME)` | `TO_CHAR(SYSDATE,'HH24:MI:SS')` |
| Difference | `DATEDIFF(d1, d2)` = **d1 − d2 in days** (time part ignored); `TIMESTAMPDIFF(unit, start, end)` = end − start | `DATEDIFF(datepart, startdate, enddate)` = number of datepart **boundaries crossed** from start to end (= end − start); `DATEDIFF_BIG` | `d1 - d2` (days, as a number); `MONTHS_BETWEEN(d1, d2)` |
| Add interval | `DATE_ADD(d, INTERVAL n unit)`, `ADDDATE`, `DATE_SUB` | `DATEADD(datepart, n, d)` | `d + n` (days), `ADD_MONTHS(d, n)` |
| Year / month / day part | `YEAR(d)`, `MONTH(d)`, `DAY(d)`/`DAYOFMONTH(d)` | `YEAR`, `MONTH`, `DAY`, `DATEPART(part, d)` | `EXTRACT(YEAR FROM d)` |
| Extract a part | `EXTRACT(unit FROM d)` | `DATEPART(unit, d)` | `EXTRACT(unit FROM d)` |
| Names | `DAYNAME(d)`, `MONTHNAME(d)` | `DATENAME(weekday, d)`, `DATENAME(month, d)` | `TO_CHAR(d,'DAY')`, `TO_CHAR(d,'MONTH')` |
| Format | `DATE_FORMAT(d,'%d/%m/%Y')` | `FORMAT(d,'dd/MM/yyyy')`, `CONVERT(VARCHAR, d, 103)` | `TO_CHAR(d,'DD/MM/YYYY')` |

```sql
-- MySQL
SELECT DATEDIFF('2024-03-01', '2024-02-01');            -- 29   (2024 is a leap year)
SELECT DATEDIFF('2024-02-01', '2024-03-01');            -- -29  (first minus second)
SELECT TIMESTAMPDIFF(MONTH, '2024-01-31', '2024-02-01');-- 0    (no complete month)
SELECT DATE_ADD('2024-01-31', INTERVAL 1 MONTH);        -- 2024-02-29
SELECT DAYNAME('2024-01-26'), MONTHNAME('2024-01-26');  -- Friday, January
SELECT EXTRACT(YEAR FROM '2024-01-26');                 -- 2024
SELECT DATE_FORMAT('2024-01-26', '%d/%m/%Y');           -- 26/01/2024

-- SQL Server
SELECT DATEDIFF(day,   '2024-02-01', '2024-03-01');     -- 29   (end - start)
SELECT DATEDIFF(year,  '2023-12-31', '2024-01-01');     -- 1    (one year boundary crossed, though 1 day apart)
SELECT DATEDIFF(month, '2024-01-31', '2024-02-01');     -- 1
SELECT DATEDIFF(year,  '2024-01-01', '2024-12-31');     -- 0
SELECT DATEADD(month, 1, '2024-01-31');                 -- 2024-02-29
SELECT GETDATE(), SYSDATETIME(), SYSDATETIMEOFFSET();   -- datetime | datetime2(7) | datetime2 + offset e.g. +05:30
```

**DATEDIFF exam point** ⭐ Asked in DSSSB: SQL Server's `DATEDIFF(datepart, startdate, enddate)` reports the difference between startdate and enddate, so the statement "it reports the difference between startdate and enddate" is TRUE. The datepart (`year`, `month`, `day`, `hour`…) must be written directly as a keyword. **It cannot be supplied in a variable or as a quoted string**, so "datepart can be specified in a variable" is FALSE. Answer: "Only I". If start is later than end, the result is negative. MySQL's DATEDIFF takes no datepart and returns days only.

### Conversion, NULL functions and CASE

| Purpose | MySQL | SQL Server | Oracle |
|---|---|---|---|
| Type conversion | `CAST(x AS type)`, `CONVERT(x, type)`, `CONVERT(x USING charset)`. Types: CHAR, DATE, DATETIME, DECIMAL, SIGNED, UNSIGNED (**not** `INT`) | `CAST(x AS type)`, `CONVERT(type, x [, style])`, `TRY_CAST` | `CAST`, `TO_CHAR`, `TO_DATE`, `TO_NUMBER` (Oracle `CONVERT` converts character sets) |
| Replace NULL with a value | `IFNULL(x, alt)` | `ISNULL(x, alt)` | `NVL(x, alt)`; `NVL2(x, if_not_null, if_null)` |
| First non-NULL of a list (standard) | `COALESCE(a,b,c,…)` | `COALESCE` | `COALESCE` |
| NULL if equal | `NULLIF(a,b)` | `NULLIF` | `NULLIF` |
| Test for NULL | `ISNULL(x)` → 1 or 0 (**one argument!**) | — | — |
| If-then-else | `IF(cond,a,b)`, `CASE` | `IIF(cond,a,b)` (2012+), `CASE` | `DECODE(x, v1, r1, …, default)`, `CASE` |

```sql
SELECT COALESCE(NULL, NULL, 'x', 'y');   -- 'x'
SELECT NULLIF(5, 5), NULLIF(5, 6);       -- NULL, 5
SELECT IFNULL(commission, 0) FROM EMPLOYEE;   -- MySQL: NULL commissions shown as 0
SELECT CAST('123' AS SIGNED) + 1;        -- MySQL: 124
SELECT CONVERT(VARCHAR(10), GETDATE(), 103);  -- SQL Server: dd/mm/yyyy

-- CASE expression (standard): searched form
SELECT name,
       CASE WHEN salary >= 50000 THEN 'High'
            WHEN salary >= 30000 THEN 'Mid'
            ELSE 'Low' END AS band
FROM EMPLOYEE;
-- Amit High | Bina Mid | Chetan Mid | Divya Mid | Esha Low | Farhan High
-- Simple form: CASE dept_id WHEN 10 THEN 'Sales' WHEN 20 THEN 'HR' ELSE 'Other' END
-- With no ELSE and no match, CASE returns NULL. The first true WHEN wins.
```

## 14. Worked examples: "What is the output?" (on EMPLOYEE and DEPT from section 5)

**W1.**
```sql
SELECT COUNT(*), COUNT(commission), COUNT(DISTINCT dept_id), COUNT(DISTINCT salary) FROM EMPLOYEE;
```
**Output:** `6 | 3 | 3 | 5`. COUNT(*) counts all 6 rows. Three commissions are non-NULL (5000, 2000 and 0, and 0 does count). The distinct dept_ids are 10, 20 and 30, with NULL ignored. Of the 6 salaries, 40000 is repeated, which leaves 5 distinct values.

**W2.**
```sql
SELECT SUM(commission), AVG(commission), AVG(salary) FROM EMPLOYEE;
```
**Output:** `7000 | 2333.33 | 40833.33`. 7000/3 = 2333.33, because AVG divides by the 3 non-NULL values. 245000/6 = 40833.33.

**W3.**
```sql
SELECT name FROM EMPLOYEE WHERE commission = NULL;
```
**Output:** *no rows*. `= NULL` is always UNKNOWN. `WHERE commission IS NULL` gives **Amit, Chetan, Esha**.

**W4.**
```sql
SELECT name FROM EMPLOYEE WHERE salary BETWEEN 30000 AND 50000;
```
**Output:** **Amit, Bina, Chetan, Divya**. Both ends are included, so 30000 and 50000 qualify.

**W5.**
```sql
SELECT name FROM EMPLOYEE WHERE name LIKE '_i%';
```
**Output:** **Bina, Divya** (second letter i). `LIKE '%an'` gives **Chetan, Farhan**. `LIKE '%a'` gives **Bina, Divya, Esha**.

**W6.**
```sql
SELECT dept_id, COUNT(*), SUM(salary) FROM EMPLOYEE GROUP BY dept_id;
```
**Output:**

| dept_id | COUNT(*) | SUM(salary) |
|---|---|---|
| NULL | 1 | 25000 |
| 10 | 2 | 80000 |
| 20 | 2 | 100000 |
| 30 | 1 | 40000 |

NULL forms a group of its own. Row order is not guaranteed without ORDER BY.

**W7.**
```sql
SELECT dept_id, COUNT(*) FROM EMPLOYEE GROUP BY dept_id HAVING COUNT(*) > 1;
```
**Output:** `(10, 2)` and `(20, 2)`.

**W8.**
```sql
SELECT name, salary + commission FROM EMPLOYEE;
```
**Output:** Amit NULL, Bina 45000, Chetan NULL, Divya 42000, Esha NULL, Farhan 60000. NULL in arithmetic gives NULL. Use `salary + COALESCE(commission, 0)` to get 50000, 45000, 30000, 42000, 25000, 60000.

**W9.**
```sql
SELECT name FROM EMPLOYEE WHERE dept_id <> 10;
```
**Output:** **Bina, Divya, Farhan**. Esha (dept NULL) is *not* returned, because `NULL <> 10` is UNKNOWN.

**W10.**
```sql
SELECT name FROM EMPLOYEE WHERE dept_id NOT IN (10, NULL);
```
**Output:** *no rows*. `NOT IN (10, NULL)` means `dept_id <> 10 AND dept_id <> NULL`. The second part is always UNKNOWN, so no row is ever TRUE.

**W11.**
```sql
SELECT dname FROM DEPT WHERE dept_id NOT IN (SELECT dept_id FROM EMPLOYEE);
```
**Output:** *no rows*. The subquery contains Esha's NULL. The `NOT EXISTS` version (section 11) correctly gives **Admin**.

**W12.**
```sql
SELECT name FROM EMPLOYEE WHERE dept_id = 10 OR dept_id = 20 AND salary > 50000;
```
**Output:** **Amit, Chetan, Farhan**. AND binds first, so the condition reads `dept 10 OR (dept 20 AND salary > 50000)`. With brackets, `(dept_id = 10 OR dept_id = 20) AND salary > 50000` gives only **Farhan**.

**W13.**
```sql
SELECT name, dept_id FROM EMPLOYEE ORDER BY dept_id DESC, salary ASC;
```
**Output (MySQL):** Divya 30, Bina 20, Farhan 20, Chetan 10, Amit 10, Esha NULL. Ties are broken by salary in ascending order. MySQL treats NULL as the lowest value, so it comes last in DESC. Oracle would put NULL first in DESC.

**W14.**
```sql
SELECT MAX(salary) FROM EMPLOYEE WHERE salary < (SELECT MAX(salary) FROM EMPLOYEE);
```
**Output:** **50000**, the second highest salary.

**W15.**
```sql
SELECT DISTINCT salary FROM EMPLOYEE ORDER BY salary DESC LIMIT 1 OFFSET 2;
```
**Output:** **40000** (the 3rd highest distinct salary). `SELECT salary … ORDER BY salary DESC LIMIT 1 OFFSET 3` (without DISTINCT) also gives 40000, but with DISTINCT it gives 30000.

**W16.**
```sql
SELECT e.name, d.dname FROM EMPLOYEE e JOIN DEPT d ON e.dept_id = d.dept_id WHERE d.location = 'Delhi';
```
**Output:** Amit Sales, Chetan Sales, Divya IT.

**W17.**
```sql
SELECT d.dname, COUNT(e.emp_id) FROM DEPT d LEFT JOIN EMPLOYEE e ON d.dept_id = e.dept_id GROUP BY d.dname;
```
**Output:** Admin 0, HR 2, IT 1, Sales 2. With `COUNT(*)` instead, Admin shows **1**, because the outer-join row exists even though its EMPLOYEE columns are NULL.

**W18.**
```sql
SELECT e.name, m.name FROM EMPLOYEE e JOIN EMPLOYEE m ON e.manager_id = m.emp_id WHERE e.salary > m.salary;
```
**Output:** **Farhan, Amit**. This lists employees who earn more than their manager, using a self join.

**W19.**
```sql
SELECT COUNT(*), SUM(salary), MAX(salary) FROM EMPLOYEE WHERE dept_id = 99;
```
**Output:** `0 | NULL | NULL`. On empty input, COUNT gives 0 and the other aggregates give NULL. You still get exactly one row.

**W20.**
```sql
SELECT name FROM EMPLOYEE WHERE dept_id IN (SELECT dept_id FROM DEPT WHERE location = 'Delhi') AND commission IS NOT NULL;
```
**Output:** **Divya**. The Delhi depts are 10 and 30. Amit and Chetan have NULL commission. Divya has 2000.

**W21.**
```sql
SELECT COUNT(*) FROM EMPLOYEE, DEPT;
```
**Output:** **24** (6 × 4, a Cartesian product).

**W22.**
```sql
SELECT CEILING(-4.2), FLOOR(-4.2), ROUND(4.567, 1), TRUNCATE(4.567, 1), MOD(17, 5);
```
**Output (MySQL):** `-4 | -5 | 4.6 | 4.5 | 2`.

**W23.**
```sql
SELECT SUBSTRING('DATABASE', 3, 4), INSTR('DATABASE', 'A'), LENGTH(TRIM('  SQL  ')), REPLACE('BANANA', 'AN', 'x');
```
**Output:** `TABA | 2 | 3 | BxxA`.

*Verification note:* W1–W21 and W23 were run in SQLite with this exact data. SQLite matches MySQL here, including NULL ordering. SQLite differs from MySQL in a few ways: it has no `ALL`/`ANY`, no `TRUNCATE()` and no `DATEDIFF`; `7/2` = 3 (like SQL Server); `LIKE` is case-insensitive for ASCII. W22 and the ANY/ALL results were worked out by hand using the documented MySQL rules.

## Exam traps

1. **`SELECT *` means all columns**, while `%` is the LIKE wildcard. In MySQL, `#` starts a comment and `:` marks a host variable in embedded SQL. Neither one means "all columns".
2. **Concatenation:** standard SQL uses `||`, SQL Server uses `+` and MySQL uses `CONCAT()`. In MySQL, `||` is OR unless PIPES_AS_CONCAT is set. `++` and `##` are not concatenation operators.
3. **DEFAULT ≠ NOT NULL.** DEFAULT only fills a value when none is given. An explicit NULL is still stored.
4. **DROP SCHEMA … RESTRICT** drops the schema only if it is empty, and CASCADE drops all its contents. The command is DROP, not ALTER or DELETE.
5. **CROSS PRODUCT is not an aggregate**, and neither are ROUND, UPPER, NOW or COALESCE. The aggregates are COUNT, SUM, AVG, MIN and MAX.
6. **COUNT(*) counts NULL rows, COUNT(col) does not.** AVG ignores NULLs, so AVG(col) is not SUM(col)/COUNT(*).
7. **`= NULL` never matches.** Use IS NULL. `NOT IN` with a NULL in the list or subquery returns **no rows**, while NOT EXISTS behaves correctly.
8. **BETWEEN is inclusive**, and `BETWEEN high AND low` returns nothing.
9. **CEILING(−4.2) = −4 and FLOOR(−4.2) = −5.** CEILING is "smallest integer ≥ x". SQL Server has only CEILING, and Oracle has only CEIL.
10. **DATEDIFF argument order:** SQL Server `DATEDIFF(datepart, start, end)` = end − start, and the datepart cannot be a variable. MySQL `DATEDIFF(d1, d2)` = d1 − d2, in days only. `DATEDIFF(year,'2023-12-31','2024-01-01')` = 1.
11. **GETDATE()** returns datetime without the time-zone offset, **SYSDATETIMEOFFSET()** includes the offset, **SYSDATETIME()** has higher precision (datetime2), and **GETUTCDATE()** returns UTC. GETTIME, CASTDATE and CASTTIME do not exist.
12. **TRUNCATE is DDL** and DELETE is DML. TRUNCATE has no WHERE and resets AUTO_INCREMENT. DROP removes the structure too. Also remember: SQL `SELECT` corresponds to projection π, not selection σ.

## One-liners for revision

1. SQL was born as SEQUEL in IBM's System R project. The first standard was ANSI SQL-86.
2. DDL works on structure: CREATE, ALTER, DROP, TRUNCATE, RENAME, COMMENT.
3. DML works on data: SELECT, INSERT, UPDATE, DELETE, MERGE.
4. DCL: GRANT and REVOKE. TCL: COMMIT, ROLLBACK, SAVEPOINT, SET TRANSACTION.
5. `SELECT *` = all attributes of the selected tuples.
6. DISTINCT removes duplicate rows. ALL (the default) keeps them.
7. Order of execution: FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT.
8. A column alias cannot be used in WHERE, but it can be used in ORDER BY.
9. LIKE matches patterns: `%` = any number of characters, `_` = exactly one.
10. ESCAPE makes `%` or `_` literal inside a LIKE pattern.
11. BETWEEN includes both end values.
12. IN (list) is shorthand for a chain of ORs. `= ANY` is the same as IN.
13. `<> ALL` is the same as NOT IN. `> ALL` means greater than the maximum, `> ANY` means greater than the minimum.
14. Logical precedence: NOT, then AND, then OR.
15. Comparing with NULL gives UNKNOWN. Test with IS NULL / IS NOT NULL.
16. Aggregates: COUNT, SUM, AVG, MIN, MAX. Each returns one value per group.
17. All aggregates except COUNT(*) ignore NULLs.
18. On an empty set, COUNT returns 0 and SUM, AVG, MIN and MAX return NULL.
19. WHERE filters rows and HAVING filters groups. Aggregates are not allowed in WHERE.
20. A non-aggregated SELECT column must appear in GROUP BY.
21. DEFAULT supplies a value when INSERT omits the column.
22. PRIMARY KEY = UNIQUE + NOT NULL, one per table.
23. A FOREIGN KEY enforces referential integrity between two relations.
24. ON DELETE CASCADE deletes the child rows. ON DELETE SET NULL sets the child FK to NULL.
25. MySQL enforces CHECK only from version 8.0.16.
26. DROP SCHEMA … CASCADE drops everything in the schema. RESTRICT drops it only if it is empty.
27. A natural join joins on all same-named columns and shows each one once.
28. A cross join gives m × n rows.
29. A self join needs table aliases. A theta join uses any comparison operator.
30. MySQL has no FULL OUTER JOIN, so it is emulated with LEFT JOIN UNION RIGHT JOIN.
31. UNION removes duplicates and UNION ALL keeps them. Both need union-compatible queries.
32. Oracle's MINUS is EXCEPT in standard SQL, SQL Server and PostgreSQL.
33. A correlated subquery runs once for each outer row. EXISTS tests whether any row is returned.
34. A view is a virtual table. WITH CHECK OPTION blocks changes that would move rows out of the view.
35. AUTO_INCREMENT (MySQL), IDENTITY (SQL Server) and SEQUENCE … NEXTVAL (Oracle) generate numbers.
36. A trigger runs automatically on INSERT, UPDATE or DELETE (event-condition-action).
37. A cursor processes a query result one row at a time: DECLARE, OPEN, FETCH, CLOSE.
38. Embedded SQL uses EXEC SQL in a host language. Dynamic SQL builds queries at run time.
39. Applications talk to a database server through ODBC or JDBC.
40. CEILING(4.2) = 5, FLOOR(4.8) = 4, ROUND(4.567,2) = 4.57, MOD(17,5) = 2.

## Quick self-check

1. Which symbol in SELECT retrieves all attribute values of the selected tuples?
   **Answer:** `*`.
2. Which operator is used in a WHERE clause to match a character pattern?
   **Answer:** LIKE.
3. What is the standard SQL concatenation operator, and what do SQL Server and MySQL use?
   **Answer:** `||`. SQL Server uses `+` and MySQL uses `CONCAT()`.
4. What does the DEFAULT constraint do?
   **Answer:** It provides a default value for a column when none is specified in an INSERT.
5. Which of these is NOT an aggregate: CROSS PRODUCT, MAX, COUNT, SUM?
   **Answer:** CROSS PRODUCT.
6. `DROP SCHEMA COMPANY RESTRICT;`: when does it succeed?
   **Answer:** Only if the schema has no elements in it.
7. With the EMPLOYEE table above, what does `SELECT COUNT(commission) FROM EMPLOYEE;` return?
   **Answer:** 3. The NULLs are skipped, and the 0 is counted.
8. Is the statement "DATEDIFF's datepart can be passed in a variable" true in SQL Server?
   **Answer:** No. The datepart must be written as a literal keyword.
9. What is `CEILING(-2.7)`, and what is `FLOOR(-2.7)`?
   **Answer:** −2 and −3.
10. Which SQL Server function returns the current system timestamp as datetime without the time-zone offset, and which one includes the offset?
    **Answer:** GETDATE() has no offset. SYSDATETIMEOFFSET() includes it.
11. How many rows does `SELECT * FROM A CROSS JOIN B` return, if A has 5 rows and B has 4?
    **Answer:** 20.
12. Why does `SELECT dname FROM DEPT WHERE dept_id NOT IN (SELECT dept_id FROM EMPLOYEE);` return nothing here, and how do you fix it?
    **Answer:** The subquery returns a NULL (Esha), which makes every `NOT IN` test UNKNOWN. Use `NOT EXISTS`, or add `WHERE dept_id IS NOT NULL` inside the subquery. The fixed query gives Admin.
