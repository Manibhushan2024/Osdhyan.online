# Programming Basics: Data Types, Operators & Control Flow

**In 30 seconds**

- A **variable** is a symbolic name for a memory location; its value can change. A **constant/literal** is a fixed value. ⭐ Asked in DSSSB
- C/C++ are **compiled** to machine code (compiler + linker). Java is compiled to **bytecode** and run by the **JVM**. Python is **interpreted** (source → bytecode → Python Virtual Machine).
- All four languages are **case-sensitive**. `Integer`, `String`, `main` and `System` are *not* Java keywords, so `int Integer = 24; char String = 'I';` compiles and prints `24I`. ⭐ Asked in DSSSB
- A leading `0` means **octal** in C, C++ and Java: `010` is 8 and `017` is 15. In Python 3 `017` is a SyntaxError; you must write `0o17`. ⭐ Asked in DSSSB
- Java has exactly **8 primitive types**: byte, short, int, long, float, double, char, boolean. String and arrays are reference types. ⭐ Asked in DSSSB
- **Precedence**: `()` is highest. Then unary, then `* / %`, `+ -`, shifts, relational, equality, `&`, `^`, `|`, `&&`, `||`, `?:`, assignment, and comma last. `!=` is a *relational (equality)* operator, `&& || !` are *logical*. ⭐ Asked in DSSSB
- C has four **storage classes**: auto, register, static, extern. "intern" and "mutable" are not C storage classes. `scanf`/`printf` live in `<stdio.h>`, variable arguments in `<stdarg.h>`. ⭐ Asked in DSSSB
- **Integer division**: C and Java truncate toward zero (`-7/2 = -3`, `-7%2 = -1`). Python floors (`-7//2 = -4`, `-7%2 = 1`). A `do-while` loop always runs at least once. `switch` falls through until it meets a `break`.

---

## 1. Program structure: compiling vs interpreting

**C / C++.** A C program is made of preprocessor directives (`#include`, `#define`), global declarations, the `main()` function (where execution starts) and other functions.

```c
#include <stdio.h>          /* preprocessor directive */
int count = 0;              /* global variable */
int main(void) {            /* execution starts here */
    printf("Hello\n");
    return 0;               /* 0 = success, returned to the OS */
}
```

Building a C program has four stages:

| Stage | Tool | Input → Output |
|---|---|---|
| Preprocessing | preprocessor | `.c` → expanded source (`.i`): `#include` files are pasted in, macros are replaced, comments are removed |
| Compilation | compiler | `.i` → assembly (`.s`) |
| Assembly | assembler | `.s` → object code (`.o` / `.obj`) |
| Linking | linker | object files + library code (e.g. the code of `printf`) → executable (`a.out` / `.exe`) |

The **loader** (part of the OS) then puts the executable into memory and runs it. C++ follows the same pipeline.

**Java.** `javac Hello.java` compiles the source into **bytecode** (`Hello.class`, one `.class` file per class). The **JVM** runs the bytecode: the ClassLoader loads the class, the bytecode verifier checks it, and the execution engine (interpreter + **JIT** compiler) runs it. Bytecode is platform-independent ("write once, run anywhere"); the JVM itself is platform-specific. JDK = JRE + development tools (javac, javadoc…); JRE = JVM + class libraries.

**Python.** CPython compiles the source to bytecode (cached as `.pyc` files in `__pycache__` for imported modules) and the **Python Virtual Machine** interprets it. For exams, Python is "an interpreted language". The whole file is parsed first, so a *syntax* error anywhere means no line runs. A *runtime* error (such as `NameError`) stops execution only when that line is reached.

| Compiler | Interpreter |
|---|---|
| Translates the whole program at once | Translates and runs one statement at a time |
| Produces an object/executable file | Produces no separate executable |
| Lists errors after compiling | Stops at the first error it reaches |
| Program runs faster | Program runs slower |
| C, C++ (Java's javac compiles to bytecode) | Python, (classic) BASIC |

## 2. Tokens, keywords, identifiers and comments

A **token** is the smallest unit of a program that has meaning. C has six kinds: **keywords, identifiers, constants (literals), strings, operators and special symbols** (`{ } ( ) [ ] ; ,`).

**Keywords** are reserved words that cannot be used as names.

| Language | Keyword count (for revision) |
|---|---|
| C | **32** in C89/C90 (C99 added 5 more, C11 added 7 more) |
| C++ | about 63 in C++98, more added since |
| Java | about **50** reserved keywords, including `goto` and `const`, which are reserved but unused. Since Java 9, `_` is also a keyword. `true`, `false` and `null` are *literals*, not keywords, but they still cannot be identifiers. `var`, `record` and `yield` are contextual keywords. |
| Python 3 | **35**, including `True`, `False` and `None` (capitalised). `match`, `case`, `type` and `_` are "soft" keywords. |

**Identifiers** (names of variables, functions and classes):

| Rule | C / C++ | Java | Python |
|---|---|---|---|
| Allowed characters | letters, digits, `_` | letters, digits, `_`, `$` | letters (Unicode allowed), digits, `_` |
| First character | letter or `_` | letter, `_` or `$` | letter or `_` |
| Can start with a digit? | No | No | No |
| Case-sensitive? | Yes | Yes | Yes |
| Keyword as name? | No | No | No |
| Length | at least 31 significant characters (C89), 63 (C99) | unlimited | unlimited |

⭐ Asked in DSSSB (Python): an identifier **can contain an underscore**. It cannot start with a digit, cannot be a keyword, and has no length limit. `_x`, `Var` and `var` are three *different* names.

⭐ Asked in DSSSB (Java): `Integer`, `String`, `System`, `Math` and `main` are **names of classes or methods, not keywords**. So `int Integer = 24;`, `char String = 'I';` and `int main = 5;` are all legal. After `int Integer = 24;`, the simple name `Integer` means the variable inside that scope, so `Integer.MAX_VALUE` fails with "int cannot be dereferenced". `int int = 5;` is an error because `int` *is* a keyword.

**Comments**

| Language | Single line | Multi-line | Notes |
|---|---|---|---|
| C | `//` (from C99) | `/* ... */` | `/* */` comments cannot be nested |
| C++ | `//` | `/* ... */` | |
| Java | `//` | `/* ... */` | `/** ... */` is a documentation comment read by **javadoc** |
| Python | `#` | none; use several `#` lines | A triple-quoted string `"""..."""` is a string literal (used as a *docstring*), not a true comment |

⭐ Asked in DSSSB (twice): the Python comment symbol is **`#`**. In Python `//` is floor division, not a comment.

## 3. Variables, constants and literals

A **variable** is a symbolic name for a memory location whose value can change during execution. ⭐ Asked in DSSSB

- C and Java: a variable must be **declared with a type** before use (`int age = 20;`). This is *static typing*.
- Python: a variable is created by assignment (`age = 20`). The *object* has a type, and the name can later refer to an object of another type. This is *dynamic typing*.
- An uninitialised **local** variable holds a garbage (indeterminate) value in C. In Java, reading it is a **compile error** ("variable x might not have been initialized"). In Python, using a name before assigning it raises **NameError**.

**Constants**

| Language | Syntax | Notes |
|---|---|---|
| C | `const int MAX = 100;` | A typed, read-only variable |
| C | `#define MAX 100` | Preprocessor text replacement: no type, no memory, **no semicolon** |
| C | `enum colour {RED, GREEN, BLUE};` | Named integer constants 0, 1, 2 |
| C++ | `const`, `constexpr` | |
| Java | `final int MAX = 100;` / `static final double PI = 3.14;` | A `final` variable can be assigned only once. `const` is reserved but unused. |
| Python | `PI = 3.14` | No true constants. UPPER_CASE is only a convention. |

**Literals** (fixed values written in the code):

| Kind | C / C++ | Java | Python |
|---|---|---|---|
| Decimal | `25` | `25` | `25` |
| Octal | `025` (= 21), `010` (= 8) | `010` (= 8) | `0o10` (= 8). `010` is a SyntaxError. |
| Hexadecimal | `0x1F` (= 31) | `0x1F` | `0x1F` |
| Binary | `0b101` (C++14, C23) | `0b101` (Java 7+) | `0b101` |
| Suffixes | `25L`, `25U`, `25UL`, `25LL` | `25L` (long) | none (int has no limit) |
| Digit separator | `1'000'000` (C++14) | `1_000_000` (Java 7+) | `1_000_000` (3.6+) |
| Floating | `3.14` is a **double**, `3.14f` a float, `3.14L` a long double, `1.5e3` | `3.14` is a double, `3.14f` a float | `3.14`, `1e3` (= 1000.0), complex `3+4j` |
| Character | `'A'` (type **int** in C, char in C++) | `'A'`, `'A'` | none (a 1-character `str`) |
| String | `"Hi"` (stored with `'\0'`, so `sizeof("Hi")` is 3) | `"Hi"` (a String object) | `'Hi'`, `"Hi"`, `'''Hi'''` |
| Boolean | `true`/`false` from `<stdbool.h>` (C99), built in for C++ | `true`/`false` (not 0/1) | `True`/`False` |

Writing `08` or `09` is an error in C and Java, because 8 and 9 are not octal digits. In Java, `float f = 3.0;` is an error ("possible lossy conversion from double to float"); write `3.0f`. `long big = 3000000000;` is also an error ("integer number too large"); write `3000000000L`.

A **float** is a number with a decimal point (a fractional or real number). ⭐ Asked in DSSSB. A **string** is a sequence of characters: letters, digits and symbols. ⭐ Asked in DSSSB

**Escape sequences**

| Escape | Meaning | ASCII | Escape | Meaning | ASCII |
|---|---|---|---|---|---|
| `\n` | newline | 10 | `\0` | null character | 0 |
| `\t` | horizontal tab | 9 | `\a` | alert/bell | 7 |
| `\\` | backslash | 92 | `\b` | backspace | 8 |
| `\'` | single quote | 39 | `\r` | carriage return | 13 |
| `\"` | double quote | 34 | `\f` | form feed | 12 |
| `\ooo` | octal value | – | `\xhh` | hex value (C/C++, Python) | – |

Java has no `\a`, `\v` or `\x`. It uses `\uXXXX` for Unicode and has added `\s` (space). Python supports all of the C escapes plus `\uXXXX`.

## 4. Data types

### C / C++ (typical GCC sizes on a 64-bit machine)

| Type | Bytes | Range / precision |
|---|---|---|
| `char` | 1 | −128 to 127 (signed) or 0 to 255 (unsigned). Plain `char` may be either; this is implementation-defined. |
| `unsigned char` | 1 | 0 to 255 |
| `short` | 2 | −32,768 to 32,767 |
| `unsigned short` | 2 | 0 to 65,535 |
| `int` | 4 | −2,147,483,648 to 2,147,483,647 (**2 bytes**, −32,768 to 32,767, on old 16-bit Turbo C) |
| `unsigned int` | 4 | 0 to 4,294,967,295 |
| `long` | 4 or 8 | 4 on Windows and 32-bit systems, 8 on 64-bit Linux |
| `long long` | 8 | about ±9.22 × 10¹⁸ |
| `float` | 4 | about ±3.4 × 10³⁸, 6–7 significant digits |
| `double` | 8 | about ±1.7 × 10³⁰⁸, 15–16 significant digits |
| `long double` | 8, 12 or 16 | depends on the compiler |
| `void` | – | "no value" (functions that return nothing, generic pointers) |

- The C standard guarantees only minimums: `sizeof(char)` is 1, and `char ≤ short ≤ int ≤ long ≤ long long`.
- For an n-bit type, the signed range is −2ⁿ⁻¹ to 2ⁿ⁻¹−1 and the unsigned range is 0 to 2ⁿ−1.
- `sizeof` is a compile-time **operator**, not a function. It gives a `size_t` value, printed with `%zu`. In C, `sizeof('A')` is 4 because a character constant has type int. In C++ it is 1.
- C++ adds `bool` (usually 1 byte) and `wchar_t`. Modifiers are `signed`, `unsigned`, `short` and `long`.

### Java: 8 primitives with fixed sizes on every platform ⭐ Asked in DSSSB

| Type | Size | Range | Default (fields/array elements) |
|---|---|---|---|
| `byte` | 1 byte | −128 to 127 | 0 |
| `short` | 2 | −32,768 to 32,767 | 0 |
| `int` | 4 | −2³¹ to 2³¹−1 | 0 |
| `long` | 8 | −2⁶³ to 2⁶³−1 | 0L |
| `float` | 4 | IEEE 754 single precision | 0.0f |
| `double` | 8 | IEEE 754 double precision | 0.0d |
| `char` | **2** | `'\u0000'` to `'￿'` (0 to 65,535, Unicode/UTF-16) | `'\u0000'` |
| `boolean` | not specified exactly (JVM-dependent) | `true` / `false` only | `false` |

Default values apply to **fields and array elements only**, never to local variables. Reference types (String, arrays, classes) default to `null`. Java has no `unsigned` keyword; `char` is the only unsigned type. A `boolean` can never be converted to or from an int.

### Python built-in scalar types

| Type | Example | Notes |
|---|---|---|
| `int` | `2**100` | **Arbitrary precision**, so it never overflows |
| `float` | `3.14`, `1e3` | 64-bit IEEE double; `0.1 + 0.2` gives `0.30000000000000004` |
| `complex` | `3+4j` | `.real`, `.imag`; `abs(3+4j)` is `5.0` |
| `bool` | `True`, `False` | A subclass of int, so `True + True` is 2 |
| `str` | `'A'`, `"Hi"` | Immutable; there is no separate char type |
| `NoneType` | `None` | "no value" |

`type(x)` shows the type, and `isinstance(True, int)` is `True`. Python is dynamically but **strongly** typed: `'5' + 3` raises `TypeError`.

## 5. Type conversion

**C: implicit conversion (coercion).**

1. *Integer promotion*: `char` and `short` become `int` in expressions. For example, `char a = 100, b = 100; int r = a + b;` gives 200.
2. *Usual arithmetic conversions*: the "smaller" operand is converted to the larger type in the order int → unsigned int → long → unsigned long → long long → float → double → long double.
3. *Assignment conversion*: `int i = 3.99;` stores 3 (the fraction is dropped).

**Explicit cast**: `(double) 5 / 2` gives 2.5, but `(double)(5 / 2)` gives 2.0, because the integer division happens first.

**Characters are small integers** (ASCII): `'A'` = 65, `'a'` = 97, `'0'` = 48, space = 32, `'\0'` = 0. `'a' - 'A'` is 32, `'9' - '0'` is 9, and `printf("%c", 65)` prints `A`.

**Java: widening and narrowing.**

- Widening is automatic: `byte → short → int → long → float → double`, and `char → int`.
- Narrowing needs a cast: `(int) 3.99` is 3, `(int) -3.99` is −3, and `(byte) 200` is −56.
- `int` to `float` may lose digits: `float f = 123456789;` prints `1.2345679E8`.
- `byte`, `short` and `char` are promoted to `int` in arithmetic. So `b = b + 5;` (with b a byte) is a compile error, but `b += 5;` compiles, because compound assignment includes a hidden cast.
- A constant that fits needs no cast: `byte b = 10;`, `char d = 'A' + 2;` (gives `C`), and `final int k = 10; byte b = k;` all compile.

**Python.** In mixed arithmetic, Python converts implicitly from int to float to complex. Explicit conversion functions:

- `int()` truncates toward zero: `int(3.99)` is 3 and `int(-3.99)` is −3. `int('101', 2)` is 5, `int('1F', 16)` is 31, and `int('3.5')` raises **ValueError**.
- `float('3')` is 3.0. `str(5) + '3'` is `'53'`.
- `bool('')`, `bool(0)`, `bool(0.0)` and `bool([])` are False. `bool('False')` is **True**, because the string is not empty.
- **`ord('A')` is 65 (character → integer)** ⭐ Asked in DSSSB. `chr(97)` is `'a'`.
- `bin(5)` is `'0b101'`, `oct(8)` is `'0o10'` and `hex(31)` is `'0x1f'`.
- `round(2.5)` is 2 and `round(3.5)` is 4: Python rounds halves to the nearest even number ("banker's rounding").

**Integer division and remainder with negative numbers**

| Expression | C (C99) / Java | Python |
|---|---|---|
| `7 / 2` | 3 | 3.5 (`/` is always true division) |
| `-7 / 2` | **−3** (truncates toward zero) | −3.5 |
| `-7 // 2` | – | **−4** (floor) |
| `-7 % 2` | **−1** (sign of the dividend) | **1** (sign of the divisor) |
| `7 % -2` | 1 | −1 |
| `5.5 % 2` | error in C (`%` works only on integers; use `fmod`), 1.5 in Java | 1.5 |

Both rules satisfy `a == (a / b) * b + a % b`, where Python uses `//` in place of `/`. In C89, negative division was implementation-defined; C99 fixed it to truncation.

## 6. Operators

| Group | C / C++ | Java | Python |
|---|---|---|---|
| Arithmetic | `+ - * / %` | same | `+ - * / // % **` |
| Relational | `< > <= >= == !=` (result 1 or 0) | same (result boolean) | same (bool), and comparisons can be chained |
| Logical | `&& \|\| !` | `&& \|\| !` (plus non-short-circuit `& \|` on booleans) | `and or not` |
| Bitwise | `& \| ^ ~ << >>` | same plus `>>>` (unsigned right shift) | `& \| ^ ~ << >>` |
| Assignment | `= += -= *= /= %= &= \|= ^= <<= >>=` | same plus `>>>=` | same plus `//= **=`; `:=` (walrus) |
| Increment | `++ --` (pre and post) | same | **none** |
| Conditional | `c ? a : b` | same | `a if c else b` |
| Special | `,` `sizeof` `&` `*` `.` `->` | `instanceof`, `.` | `is`, `is not`, `in`, `not in` |

⭐ Asked in DSSSB: **`!=` is a relational operator**. `&&`, `||` and `!` are logical operators.

**Short-circuit evaluation.** `A && B` does not evaluate B when A is false. `A || B` does not evaluate B when A is true. A side effect in B (like `++j`) may therefore never happen. In Python, `and` and `or` return one of their **operands**: `0 or 5` is 5, `3 and 4` is 4, and `0 and 1/0` is 0 with no error.

**Bitwise operators**, using 5 = `0101` and 3 = `0011`:

- `5 & 3` = 1, `5 | 3` = 7, `5 ^ 3` = 6
- `~5` = −6, because `~n` equals −(n+1) in two's complement
- `5 << 2` = 20 (multiplies by 4) and `20 >> 2` = 5 (divides by 4)
- `n & 1` is 1 when n is odd
- Java: `-16 >> 2` is −4 because `>>` keeps the sign, while `-16 >>> 28` is 15 because `>>>` fills with zeros. Java also masks the shift count, so `1 << 33` gives 2. In C, shifting by the width of the type or more is undefined behaviour.

**Increment and decrement.** Pre-increment (`++a`) changes the variable first and then uses the new value. Post-increment (`a++`) uses the old value and then changes the variable. Both work only on variables: `5++` and `(a+b)++` are errors.

- In **C**, changing the same variable twice in one expression without a sequence point is **undefined behaviour**. Examples: `i = i++;`, `a++ + ++a`, `printf("%d %d", i++, i++)`. Such code has no single correct answer.
- **Java** defines strict left-to-right evaluation, so the same code has a definite result (see Example 12).
- **Python** has no `++`: `++x` is just `+(+x)`, and `x++` is a SyntaxError.

**The comma operator (C/C++)** evaluates its operands left to right and gives the value of the last one. `a = (b = 2, b + 3);` makes `a` 5. Without parentheses, `x = 1, 2;` sets x to 1, because `=` binds tighter than `,`. Java has no comma operator; commas are only allowed in the header of a `for` loop.

**Python-specific operators**

- `//` floor division and `**` power. `**` groups right to left: `2**3**2` is 2⁹ = 512.
- `-2**2` is **−4**, because `**` binds tighter than the unary minus on its left. `(-2)**2` is 4 and `2**-1` is 0.5.
- `is` tests identity (the same object), while `==` tests equal value. With `a = [1, 2]` and `b = [1, 2]`, `a == b` is True but `a is b` is False.
- `in` tests membership: `'ell' in 'Hello'` is True and `'h' in 'Hello'` is False.
- Chained comparisons: `1 < 2 < 3` means `1 < 2 and 2 < 3`.

### Precedence and associativity (C, with Java and Python notes) ⭐ Asked in DSSSB

| Level (high → low) | C operators | Associativity | Java / Python notes |
|---|---|---|---|
| 1 | `()` `[]` `->` `.` postfix `++ --` | L → R | Java: same, without `->` |
| 2 | prefix `++ --`, unary `+ -`, `! ~`, `(type)`, `*` (dereference), `&` (address), `sizeof` | **R → L** | Java has no `*`, `&` or `sizeof`. Python: `**` sits *above* unary `-` |
| 3 | `* / %` | L → R | Python also has `//` here |
| 4 | `+ -` | L → R | |
| 5 | `<< >>` | L → R | Java adds `>>>` |
| 6 | `< <= > >=` | L → R | Java adds `instanceof` |
| 7 | `== !=` | L → R | |
| 8 | `&` | L → R | **Python: `& ^ \|` come *above* the comparisons** |
| 9 | `^` | L → R | |
| 10 | `\|` | L → R | |
| 11 | `&&` | L → R | Python: `not` > `and` > `or` |
| 12 | `\|\|` | L → R | |
| 13 | `?:` | **R → L** | Python: `x if c else y` |
| 14 | `= += -= *= /= %= &= ^= \|= <<= >>=` | **R → L** | `a = b = c = 7` assigns right to left |
| 15 | `,` | L → R | Java: none (only in `for` headers) |

Python, from high to low: `()` / indexing / calls → `**` → unary `+x -x ~x` → `* / // %` → `+ -` → `<< >>` → `&` → `^` → `|` → comparisons (`in`, `not in`, `is`, `is not`, `<`, `<=`, `>`, `>=`, `!=`, `==`, all at one level) → `not` → `and` → `or` → `if-else` → `lambda` → `:=`.

Memory aid for C: **"PUMA'S REBL TAC"**. Postfix/Primary, Unary, Multiplicative, Additive, Shift, Relational, Equality, Bitwise (& ^ |), Logical (&& ||), Ternary, Assignment, Comma.

## 7. Input/output and header files

### C: printf / scanf (`<stdio.h>`) ⭐ Asked in DSSSB

| Specifier | Meaning | Specifier | Meaning |
|---|---|---|---|
| `%d` / `%i` | signed int (in **scanf**, `%i` also accepts `010` as octal and `0x10` as hex) | `%u` | unsigned int |
| `%ld` / `%lld` | long / long long | `%f` | float or double in printf; float in scanf |
| `%lf` | double in **scanf** | `%e` / `%E` | scientific notation (`1.234500e+03`) |
| `%g` | shorter of %f and %e | `%c` | character |
| `%s` | string | `%x` / `%X` | hex (`ff` / `FF`) |
| `%o` | octal | `%p` | pointer address |
| `%zu` | size_t (sizeof) | `%%` | a literal `%` |

**Width and precision**

- `%5d` right-aligns in 5 columns, `%-5d` left-aligns, and `%05d` pads with zeros.
- `%.2f` gives 2 decimal places and `%8.3f` gives width 8 with 3 decimals.
- `%.3s` prints only the first 3 characters.

`scanf` needs the **address** of a variable (`scanf("%d", &x);`). A `char` array name is already an address, so there is no `&` in `scanf("%s", name);`. `printf` returns the number of characters it printed, and `scanf` returns the number of items it read successfully. Passing a value of the wrong type for a specifier (like `printf("%d", 3.5)`) is undefined behaviour.

**Header files**

| Header | Contains |
|---|---|
| `<stdio.h>` | `printf`, `scanf`, `getchar`, `putchar`, `gets` (removed in C11), `fgets`, `puts`, `fopen`, `fclose`, `fprintf` |
| `<stdlib.h>` | `malloc`, `calloc`, `realloc`, `free`, `exit`, `atoi`, `atof`, `rand`, `srand`, **`abs`** (integer abs is here, not in math.h) |
| `<string.h>` | `strlen`, `strcpy`, `strcat`, `strcmp`, `strrev` (non-standard), `memset`, `memcpy` |
| `<math.h>` | `sqrt`, `pow`, `sin`, `cos`, `floor`, `ceil`, `fabs`, `fmod`, `log` |
| `<ctype.h>` | `isdigit`, `isalpha`, `isalnum`, `isspace`, `isupper`, `toupper`, `tolower` |
| `<stdarg.h>` | `va_list`, `va_start`, `va_arg`, `va_end`, for variable-argument functions ⭐ Asked in DSSSB |
| `<conio.h>` | `clrscr`, `getch`, `getche`. Non-standard (DOS/Turbo C only) |
| `<limits.h>` / `<float.h>` | `INT_MAX`, `CHAR_BIT` / `FLT_MAX` |
| `<stdbool.h>` | `bool`, `true`, `false` (C99) |
| `<time.h>`, `<assert.h>` | `time`, `clock` / `assert` |

### C++

```cpp
#include <iostream>
using namespace std;
int main() {
    int age;
    cin >> age;                          // >> is the extraction operator
    cout << "Age: " << age << endl;      // << is the insertion operator; endl = newline + flush
    return 0;
}
```

`cin >>` skips leading whitespace and stops at a space. Use `getline(cin, s)` to read a whole line. `cin.ignore(n, delim)` discards up to n characters, stopping after `delim`. `<iomanip>` provides `setw` and `setprecision`.

### Java

- `System.out.print(x)` prints without a newline.
- `System.out.println(x)` prints and then moves to a new line.
- `System.out.printf("%5.2f%n", x)` formats like C; `%n` is the newline.
- `System` is a class in `java.lang`, and `out` is a static `PrintStream` field.
- For input: `Scanner sc = new Scanner(System.in); int n = sc.nextInt(); String line = sc.nextLine();`
- `+` with a String concatenates, working left to right: `"Sum: " + 2 + 3` is `Sum: 23`, but `2 + 3 + " Sum"` is `5 Sum`.

### Python

- `print(*objects, sep=' ', end='\n')` puts a space between items and a newline at the end by default.
- `input("prompt")` **always returns a str**, so convert it: `n = int(input())`. For two numbers on one line: `a, b = map(int, input().split())`.
- Formatting: `f"{x:.2f}"` or `"%5d" % n`.
- In Python 2, `print` was a statement; in Python 3 it is a function.

## 8. Storage classes in C ⭐ Asked in DSSSB

A storage class decides a variable's **storage location, default initial value, scope** (where the name is visible) and **lifetime** (how long it exists).

| Storage class | Storage | Default value | Scope | Lifetime |
|---|---|---|---|---|
| `auto` | memory (stack) | **garbage** | local to the block | until the block ends |
| `register` | CPU register (only a *request*) | garbage | local to the block | until the block ends |
| `static` | memory (data segment) | **0** | local to the block (static local) or the file (static global) | **the whole program**; keeps its value between function calls |
| `extern` | memory (data segment) | **0** | global, shared across files | the whole program |

- `auto` is the default for local variables, so writing it is optional.
- The compiler may ignore `register`. You **cannot take the address (`&`)** of a register variable, and register variables are limited to small types such as int and char.
- A static local variable is initialised **only once**. A `static` global or function is visible only inside its own file (internal linkage).
- `extern int x;` only *declares* x and allocates no memory. The *definition* `int x = 10;` must appear in some file.
- "intern" ⭐ and "mutable" are **not** C storage classes. `mutable` is a C++ specifier that lets a member change inside a const object. `typedef` is grouped with the storage-class specifiers in the C grammar only for syntax reasons. C11 adds `_Thread_local`.
- In C++11, `auto` now means "deduce the type". `register` was deprecated in C++11 and removed in C++17.
- Java has no storage classes. Its `static` means "belongs to the class".

## 9. Control flow

### Decisions

- `if`, `if-else`, nested `if`, and the **else-if ladder** (`if … else if … else`). The first true condition wins and the rest are skipped.
- C has no boolean type check: any non-zero value is true. `if (x = 0)` *assigns* 0 and is false. Java rejects `if (x = 5)` with int x ("int cannot be converted to boolean"). Python rejects `if x = 5:` as a SyntaxError.
- **Dangling else**: an `else` pairs with the **nearest unmatched `if`**, whatever the indentation (C, C++, Java). In Python, indentation decides.

### switch

| Rule | C / C++ | Java |
|---|---|---|
| Expression type | integer types only: `int`, `char`, `short`, `long`, `enum` (no float, no string) | `byte`, `short`, `char`, `int`, their wrappers, `enum`, **`String` (Java 7+)**. Not `long`, `float`, `double` or `boolean` |
| Case labels | constant expressions, no duplicates | constants, no duplicates |
| Fall-through | yes, until a `break` | yes, with `case X:`. The arrow form `case X ->` (Java 14+) does not fall through |
| `default` | optional, can appear anywhere | same |

If no case matches and `default` is placed first, execution starts at `default` and falls through into the cases below it. Python had no switch; `match`/`case` (3.10+) never falls through.

### Loops

| Loop | Type | Runs at least once? |
|---|---|---|
| `for (init; cond; update)` | entry-controlled | No |
| `while (cond)` | entry-controlled | No |
| `do { … } while (cond);` | **exit-controlled** (note the semicolon) | **Yes** |
| Python `for x in iterable:` | iterates over the items | No |
| Python `while cond:` | entry-controlled | No |

- All three parts of a C `for` are optional, so `for(;;)` is an infinite loop.
- Infinite loops: `while(1)` (C), `while(true)` (Java; `while(1)` is a compile error there), `while True:` (Python).
- `range(start, stop, step)`: **stop is excluded**. `range(5)` gives 0–4, `range(2, 10, 3)` gives 2, 5, 8, `range(10, 0, -3)` gives 10, 7, 4, 1, and `range(5, 1)` is empty.
- Python loops can have an **`else`** block, which runs when the loop finishes normally, **not when it ends through `break`**.
- `break` leaves the innermost loop or switch. `continue` skips to the next iteration. In a C `for` loop, `continue` still runs the update part.
- `goto label;` exists in C and C++. Java reserves `goto` but does not implement it; Java uses **labelled** `break outer;` and `continue outer;` instead. Python has no goto.
- `pass` is Python's empty statement; in C, `;` alone is an empty statement.
- **Counting iterations**: `for(i=a; i<b; i++)` runs b−a times, and `for(i=a; i<=b; i++)` runs b−a+1 times. A loop with step s from a to below b runs ⌈(b−a)/s⌉ times. A nested loop where j goes from i to n−1 runs n(n+1)/2 times in total.

## 10. Worked "What is the output?" examples

Every Java and Python output below was produced by actually running the code. The C outputs are traced by hand for GCC with a 32-bit int.

**Example 1 (Java). Class names as identifiers** ⭐ Asked in DSSSB

```java
int Integer = 24;
char String = 'I';
System.out.print(Integer);
System.out.print(String);
```

Trace: `Integer` and `String` are ordinary identifiers here. `print` adds no newline, so 24 is followed directly by I. **Output: `24I`** (there is no compile error).

**Example 2 (Java). Octal literals** ⭐ Asked in DSSSB

```java
int x = 010;
System.out.println(x);
int[] p = {121, 201, 017};
for (int j = 0; j < p.length; j++) System.out.print(p[j] + " ");
```

Trace: `010` is octal, 1×8 + 0 = 8. `017` is 1×8 + 7 = 15. **Output:** `8`, then `121 201 15 `.

**Example 3 (C). Precedence and associativity** ⭐ Asked in DSSSB

```c
int r = 2 + 3 * 4 % 5;
int s = 10 - 4 - 3;
int a, b, c;
a = b = c = 7;
printf("%d %d %d\n", r, s, a + b + c);
```

Trace:
- `*` and `%` share a level and group left to right: 3*4 = 12, 12%5 = 2, then 2+2 = **4**.
- `-` groups left to right: (10−4)−3 = **3**, not 10−(4−3).
- `=` groups right to left: c = 7, b = 7, a = 7, so the sum is **21**.

**Output: `4 3 21`**

**Example 4 (C vs Python). `&` against `==`**

```c
int x = 4;
printf("%d\n", x & 1 == 0);
```

Trace (C): `==` binds tighter than `&`, so this is `x & (1 == 0)` = 4 & 0 = **0**, although 4 is even. The correct test is `(x & 1) == 0`. In **Python**, `4 & 1 == 0` is `(4 & 1) == 0` = `0 == 0` = **True**, because Python's bitwise operators rank above comparisons. In Java the line does not compile ("bad operand types for binary operator '&'").

**Example 5 (C vs Python). Chained relational operators**

```c
int a = 3, b = 2, c = 1;
printf("%d\n", a > b > c);
```

Trace (C): `(3 > 2)` is 1, and `1 > 1` is **0**. **Output: `0`**. Python's `3 > 2 > 1` means `3 > 2 and 2 > 1`, which is **True**. Java gives a compile error, because it cannot compare a boolean with an int.

**Example 6 (Java). chars in arithmetic and concatenation**

```java
char c = 'A';
System.out.println(c + 1);
System.out.println((char) (c + 1));
System.out.println('A' + 'B');
System.out.println("" + 'A' + 'B');
System.out.println(1 + 2 + "3" + 4 + 5);
```

Trace:
- `c + 1` promotes the char to int: 65 + 1 = **66**.
- Casting back gives **B**.
- `'A' + 'B'` = 65 + 66 = **131**. There is no String in that expression, so it is an int addition.
- `"" + 'A'` is the String "A", then + 'B' gives **AB**.
- Left to right: 1 + 2 = 3, then 3 + "3" = "33", then "334", then **"3345"**.

**Output:** `66`, `B`, `131`, `AB`, `3345`.

**Example 7 (C). chars are integers**

```c
char ch = 'a';
printf("%d %c %c %d\n", ch, ch - 32, ch + 1, '9' - '0');
```

Trace: 'a' is 97. 97 − 32 = 65, which `%c` prints as 'A'. 98 prints as 'b'. 57 − 48 = 9. **Output: `97 A b 9`**

**Example 8 (Java). Integer overflow wraps around**

```java
int max = Integer.MAX_VALUE;
System.out.println(max + 1);
System.out.println(100000 * 100000);
System.out.println(100000L * 100000);
byte b = (byte) 200;
System.out.println(b);
byte b2 = 127; b2++;
System.out.println(b2);
```

Trace:
- 2147483647 + 1 wraps to **−2147483648**.
- 10¹⁰ does not fit in an int: 10¹⁰ − 2×2³² = **1410065408**.
- With `L` the arithmetic is done in long: **10000000000**.
- 200 − 256 = **−56**.
- 127 + 1 wraps to **−128**.

(In C, *signed* overflow is undefined behaviour. Only unsigned arithmetic wraps by definition; see Example 9.)

**Example 9 (C). unsigned surprises**

```c
unsigned int u = -1;
int i = -1;
unsigned int one = 1;
unsigned char uc = 255;
uc++;
printf("%u\n", u);
if (i < one) printf("less\n"); else printf("not less\n");
printf("%d\n", uc);
```

Trace:
- −1 converted to unsigned is 2³² − 1 = **4294967295**.
- In `i < one`, int meets unsigned, so i becomes 4294967295, and 4294967295 < 1 is false: **not less**.
- 255 + 1 = 256, which wraps to **0** in 8 bits.

**Output:** `4294967295`, `not less`, `0`.

**Example 10 (C vs Python). Negative division**

```c
printf("%d %d %d %d\n", -7 / 2, -7 % 2, 7 % -2, 7 / -2);
```

```python
print(-7/2, -7//2, -7%2, 7%-2, 7//-2)
```

Trace: C truncates toward zero and gives `%` the sign of the dividend, so C prints **`-3 -1 1 -3`** (Java gives the same). Python floors: −3.5 floors to −4, and −7 = (−4)(2) + **1**. Python prints **`-3.5 -4 1 -1 -4`**.

**Example 11 (C and Java). Short-circuit side effects**

```c
int i = 0, j = 0, k;
k = i++ || j++;
printf("%d %d %d\n", i, j, k);
int p = 0, q = 0, r;
r = ++p || ++q;
printf("%d %d %d\n", p, q, r);
```

Trace:
- `i++` gives 0 (false) and i becomes 1. `||` must test the right side, so `j++` gives 0 and j becomes 1. The result k is 0. Line 1: **`1 1 0`**.
- `++p` gives 1 (true), so `++q` is **never evaluated**, and r is 1. Line 2: **`1 0 1`**.

Java:

```java
int i = 5;
if (i > 10 && ++i > 5) System.out.println("in");
System.out.println(i);     // 5  (++i skipped)
if (i > 10 & ++i > 5) System.out.println("in");
System.out.println(i);     // 6  (& on booleans evaluates both sides)
```

**Example 12. Pre and post increment**

```c
int a = 5, b;
b = a++;  printf("%d %d\n", a, b);
b = ++a;  printf("%d %d\n", a, b);
```

Trace (C): `b = a++` copies the old value 5, then a becomes 6, giving **`6 5`**. `b = ++a` makes a 7 first, then copies it, giving **`7 7`**.

```java
int a = 5;
int bb = a++ + ++a;      // left to right
System.out.println(a + " " + bb);
int z = 5;
z = z++;
System.out.println(z);
int r = 3;
int t = ++r * r--;
System.out.println(r + " " + t);
```

Trace (Java):
- `a++` gives 5 and a becomes 6. Then `++a` makes a 7 and gives 7. So bb = 5 + 7 = 12. **Output `7 12`**.
- `z = z++`: the old value 5 is saved, z becomes 6, then z is assigned the saved 5. **Output `5`**.
- `++r` makes r 4 and gives 4. `r--` gives 4 and r becomes 3. So t = 16. **Output `3 16`**.

In C, all three of these Java lines are undefined behaviour. In Python, `x = 5; print(++x)` prints `5`.

**Example 13 (C and Java). switch fall-through**

```c
int x = 2;
switch (x) {
    case 1: printf("A");
    case 2: printf("B");
    case 3: printf("C");
    default: printf("D");
}
```

Trace: execution enters at `case 2` and, with no `break`, falls through everything below it. **Output: `BCD`**

```java
switch (5) {
    default: System.out.print("D");
    case 1:  System.out.print("A"); break;
    case 2:  System.out.print("B");
}
```

Trace: no case matches, so execution jumps to `default` (even though it comes first), prints D, falls into `case 1`, prints A and stops at `break`. **Output: `DA`**

**Example 14 (C). static vs auto** ⭐ (storage classes are asked)

```c
#include <stdio.h>
void count(void) {
    static int s = 0;   /* initialised once, keeps its value */
    int a = 0;          /* auto: re-created on every call */
    s++; a++;
    printf("%d %d\n", s, a);
}
int main(void) { count(); count(); count(); return 0; }
```

Trace: s goes 1 → 2 → 3, while a is reset to 0 and becomes 1 on every call. **Output:** `1 1`, `2 1`, `3 1`.

**Example 15 (C). Macros are text replacement**

```c
#define SQUARE(x) x*x
printf("%d %d\n", SQUARE(3+1), 64 / SQUARE(4));
```

Trace:
- `SQUARE(3+1)` becomes `3+1*3+1` = 3 + 3 + 1 = **7**, not 16.
- `64/SQUARE(4)` becomes `64/4*4` = 16 × 4 = **64**, not 4.

**Output: `7 64`**. The fix is `#define SQUARE(x) ((x)*(x))`.

**Example 16 (C). sizeof, the printf return value, and the comma operator**

```c
int i = 5, a, b;
printf("%zu %zu %zu\n", sizeof('A'), sizeof(3.14), sizeof(3.14f));
size_t n = sizeof(i++);
printf("%d\n", i);
printf("%d\n", printf("Hello"));
a = (b = 2, b + 3);
printf("%d\n", a);
```

Trace:
- In C, 'A' is an int (4 bytes), 3.14 is a double (8) and 3.14f is a float (4): **`4 8 4`**.
- The operand of `sizeof` is not evaluated, so i stays **5**.
- The inner printf prints `Hello` and returns 5, which the outer printf prints: **`Hello5`**.
- The comma operator gives its last value, 2 + 3 = **5**.

**Example 17 (C). Assignment inside if, and float comparison**

```c
int x = 5;
float f = 0.1;
if (x = 0) printf("Zero\n"); else printf("Non-zero %d\n", x);
if (f == 0.1) printf("Equal\n"); else printf("Not Equal\n");
```

Trace:
- `x = 0` assigns 0, and 0 is false, so the else branch runs: **`Non-zero 0`**.
- 0.1 has no exact binary form. The float keeps fewer bits than the double constant 0.1, so after f is promoted to double the two values differ: **`Not Equal`**. With 0.5, which is exact, the output would be Equal.

**Example 18 (C, Java, Python). Loop traps**

```c
int i;
for (i = 0; i < 5; i++);        /* stray semicolon: empty loop body */
printf("%d\n", i);
int k = 3;
while (k--) printf("%d ", k);
printf("| %d\n", k);
int w = 10;
do { printf("%d\n", w); w++; } while (w < 5);
```

Trace:
- The loop runs with an empty body until i is 5, then prints **5**.
- `while (k--)`: tests 3, k = 2, prints 2. Tests 2, k = 1, prints 1. Tests 1, k = 0, prints 0. Tests 0, which is false, but k still decrements to −1. Output **`2 1 0 | -1`**.
- The do-while prints **10** once, even though 10 < 5 is false.

```python
for i in range(5):
    pass
print(i)
```

Python prints **4** (the last value range gave), while the C loop above left i at 5.

**Example 19 (Java and Python). Nested loops**

```java
int count = 0;
for (int i = 0; i < 3; i++)
    for (int j = i; j < 3; j++) count++;
System.out.println(count);
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= i; j++) System.out.print(j);
    System.out.println();
}
```

Trace: the inner loop runs 3 + 2 + 1 = **6** times. The pattern prints **`1`**, **`12`**, **`123`** on separate lines.

```python
for i in range(1, 4):
    for j in range(i):
        print('*', end='')
    print()
```

Output: `*`, `**`, `***` on separate lines.

**Example 20 (Java). Labelled break and continue**

```java
outer:
for (int g = 1; g <= 3; g++) {
    for (int h = 1; h <= 3; h++) {
        if (h == 2) continue outer;
        if (g == 3) break outer;
        System.out.print(g + "" + h + " ");
    }
}
```

Trace:
- g=1: h=1 prints `11`. At h=2, `continue outer` moves to the next g.
- g=2: h=1 prints `21`. At h=2, it moves to the next g again.
- g=3: h=1 is not 2, but g == 3, so `break outer` ends both loops.

**Output: `11 21 `**

**Example 21 (Python). for-else and while-else**

```python
for n in [2, 4, 6]:
    if n % 2:
        print("odd found"); break
else:
    print("all even")
for n in [2, 3, 6]:
    if n % 2:
        print("odd found", n); break
else:
    print("all even")
```

Trace: the first loop never breaks, so its else runs and prints **all even**. The second loop breaks at 3, printing **odd found 3**, and its else is skipped.

**Example 22 (Python). Operators, print and if-else** ⭐ (if-else output is asked)

```python
print(2**3**2, -2**2, 1 < 3 > 2, (3 > 2) > 1)
print(0 or 5, 3 and 4, not 0)
print('A', 'B', 'C', sep='-', end='!')
print('D')
a = 20
b = 35
if a >= b:
    print("yes")
else:
    print("No")
```

Trace:
- `2**3**2` = 2⁹ = 512. `-2**2` = −(4) = −4. `1 < 3 > 2` means `1<3 and 3>2`, which is True. `(3>2) > 1` is `True > 1`, i.e. `1 > 1`, which is False.
- `or` returns the first truthy operand (5), `and` returns the last operand (4), and `not 0` is True.
- `sep` joins the items with `-` and `end` replaces the newline with `!`, so the next print continues on the same line.
- 20 >= 35 is False, so the else branch prints `No` (with a capital N, exactly as in the string).

**Output:**

```text
512 -4 True False
5 4 True
A-B-C!D
No
```

**Example 23 (Java). The type of a ternary expression**

```java
int iv = 0;
System.out.println(true ? 1 : 2.0);
System.out.println(true ? 'A' : 0);
System.out.println(true ? 'A' : iv);
```

Trace:
- The operands int and double are promoted to double, so 1 prints as **1.0**.
- When one operand is a char and the other is an int *constant* that fits in a char, the result type is char: **A**.
- With an int *variable*, the result type is int: **65**.

**Example 24 (C). printf formatting**

```c
printf("[%5d][%-5d][%05d][%.2f][%8.3f][%.3s]\n", 42, 42, 42, 3.14159, 3.14159, "Hello");
printf("%d %o %x %X %e %%\n", 010, 8, 255, 255, 1234.5);
```

**Output:**

```text
[   42][42   ][00042][3.14][   3.142][Hel]
8 10 ff FF 1.234500e+03 %
```

(The first line was confirmed with Java's `printf` and Python's `%` formatting, which follow the same rules.)

---

## Exam traps

1. **`int Integer`, `char String`, `int main`** are legal in Java, because these are class or method names, not keywords. `int int` is not legal.
2. **A leading 0 means octal** in C, C++ and Java (`010` = 8, `017` = 15). `08` is an error. In Python 3, `010` is a SyntaxError.
3. **`!=` is relational, `&&` is logical.** Highest precedence is `()`. Bitwise `&` ranks *below* `==` in C (`x & 1 == 0` is `x & (1==0)`) but *above* comparisons in Python.
4. **`a > b > c` in C** compares 0/1 with c. In Python it is a genuine chained comparison.
5. **Integer division**: `5/2` is 2 in C and Java but 2.5 in Python 3. `-7/2` is −3 in C, while `-7//2` is −4 in Python. `%` takes the sign of the dividend in C and Java, and the sign of the divisor in Python.
6. **`(double)(5/2)` is 2.0**, not 2.5. Casting after an integer division is too late.
7. **The size of `int` is not fixed in C** (2 bytes on Turbo C, 4 on GCC), and `long` is 4 or 8. Java's sizes are fixed, and Java's `char` is 2 bytes. `sizeof('A')` is 4 in C but 1 in C++.
8. **Storage classes are auto, register, static and extern only.** Default values: auto and register hold garbage, static and extern hold 0. You cannot take `&` of a register variable.
9. **`switch` falls through** without `break`. In C it accepts only integer and char types (no float, no string). Java accepts String from Java 7 but never long, float, double or boolean.
10. **A do-while runs at least once.** A `;` right after `for(...)` or `while(...)` makes the body empty.
11. **Python has no `++` operator.** `++x` is just x and `x++` is a SyntaxError. In C, `i = i++` and `a++ + ++a` are undefined behaviour. In Java they are well-defined (`z = z++` leaves z unchanged).
12. **`if (x = 0)` in C** assigns 0 and is false. Java and Python reject an assignment used as a condition. `float f = 0.1; f == 0.1` is false.

## One-liners for revision

1. Variable: a symbolic name for a memory location. ⭐
2. Float: a number with a decimal point (a fractional or real number). ⭐
3. String: a sequence of characters (letters, digits and symbols). ⭐
4. The C build pipeline is preprocessor → compiler → assembler → linker → loader.
5. javac produces bytecode (`.class`), and the JVM runs it using an interpreter plus JIT.
6. Python is interpreted: the source becomes bytecode, which the PVM runs.
7. C has 32 keywords (C89), Java about 50, Python 3 has 35.
8. In Java, `true`, `false` and `null` are literals, not keywords, but still cannot be identifiers.
9. Java identifiers may contain `$` and `_`; Python and C identifiers may contain `_`. None may start with a digit.
10. The Python comment character is `#`; `//` is floor division in Python. ⭐
11. C/Java comments: `//` and `/* */`. Javadoc comments are `/** */`.
12. `#define` performs text replacement with no type, and the line ends without a semicolon.
13. Java constants use `final`; `const` and `goto` are reserved but unused.
14. Java's 8 primitives are byte, short, int, long, float, double, char and boolean. ⭐
15. Java char = 2 bytes (Unicode); C char = 1 byte (ASCII).
16. Default values in Java fields: int 0, boolean false, char `'\u0000'`, references null.
17. Java local variables have no default value; reading one before assignment is a compile error.
18. Python's int has arbitrary precision; Python's float is a 64-bit double.
19. `True + True` is 2, because bool is a subclass of int.
20. `ord('A')` is 65 and `chr(97)` is `'a'`. ⭐
21. `int(-3.99)` is −3, because int() truncates toward zero.
22. `round(2.5)` is 2 in Python (halves round to even).
23. In Java, `3.14` is a double, so `float f = 3.14;` is an error. Use `3.14f`.
24. In Java, `byte b = 10; b = b + 1;` is an error, but `b += 1;` is fine.
25. `(byte)200` is −56, and `Integer.MAX_VALUE + 1` is `Integer.MIN_VALUE`.
26. `~n` equals −(n+1), so `~5` is −6.
27. `x << n` multiplies by 2ⁿ and `x >> n` divides by 2ⁿ (for non-negative x).
28. `>>>` (Java only) is the unsigned right shift, which fills with zeros.
29. Unary operators, `?:` and assignment group right to left; most other operators group left to right.
30. In Python, `2**3**2` is 512 and `-2**2` is −4.
31. `is` checks identity, `==` checks equal value.
32. `printf` returns the number of characters printed, and `scanf` returns the number of items read.
33. `scanf` reads a double with `%lf`, but `printf` prints one with `%f`.
34. `scanf` and `printf` are in `<stdio.h>`, variable arguments in `<stdarg.h>`, `abs` in `<stdlib.h>` and `sqrt` in `<math.h>`. ⭐
35. `<conio.h>` (`clrscr`, `getch`) is non-standard (Turbo C).
36. A static local variable is initialised once and keeps its value between calls.
37. `extern` declares a variable without allocating memory for it.
38. An `else` pairs with the nearest unmatched `if`.
39. A Python loop's `else` runs only when the loop is not ended by `break`.
40. `range(10, 0, -3)` gives 10, 7, 4, 1. The stop value is never included.

## Quick self-check

**1.** What is the output of the following Java code?
```java
int x = 012;
System.out.println(x + 1);
```
**Answer:** `11`. 012 is octal, 1×8 + 2 = 10, and 10 + 1 = 11.

**2.** Which of these is NOT a storage class in C: auto, static, intern, extern?
**Answer:** `intern`. The four storage classes are auto, register, static and extern.

**3.** What is the output of the following C code?
```c
printf("%d", 10 + 20 * 3 / 4 % 5);
```
**Answer:** `10`. 20*3 = 60, 60/4 = 15, 15%5 = 0, and 10 + 0 = 10.

**4.** What is the output of `print(-9 // 4, -9 % 4)` in Python?
**Answer:** `-3 3`. −9/4 = −2.25, which floors to −3, and −9 − (−3×4) = 3.

**5.** What is the output of the following Java code?
```java
int Integer = 5;
char String = 'K';
System.out.println(Integer + String);
```
**Answer:** `80`. The variables are legal names, and `println(Integer + String)` adds 5 + 75 ('K' is 75) as integers. (Printing them with two separate `print` calls would give `5K`.)

**6.** In the following C code, what are the values of a and b at the end?
```c
int a = 1, b = 1;
if (a-- || b++) ;
```
**Answer:** a = 0, b = 1. `a--` gives 1 (true), so `b++` is skipped by short-circuiting.

**7.** What does `sizeof(char)` always give in C?
**Answer:** 1, by definition.

**8.** What is the output of the following C code?
```c
int i = 0;
do { printf("%d", i); } while (i++ < 0);
```
**Answer:** `0`. The body runs once, then `0 < 0` is false (and i becomes 1).

**9.** Which header file declares `va_start` and `va_arg`?
**Answer:** `<stdarg.h>`.

**10.** What is the output of the following Python code?
```python
x = 7
print(x > 5 and x < 10, 5 < x < 6)
```
**Answer:** `True False`.

**11.** What is the output of the following C code?
```c
int k = 3;
switch (k) {
    case 3: printf("3");
    case 4: printf("4"); break;
    default: printf("D");
}
```
**Answer:** `34`. Execution falls through from case 3 into case 4, then stops at `break`.

**12.** In Java, is `long n = 5; switch (n) { case 5: ... }` valid?
**Answer:** No. It is a compile error ("selector type long is not allowed"). A switch accepts byte, short, char, int, their wrappers, enum and String.
