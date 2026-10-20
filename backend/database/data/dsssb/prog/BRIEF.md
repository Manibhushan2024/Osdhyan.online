# Programming for DSSSB TGT Computer Science — writer brief

Reader: a DSSSB TGT Computer Science candidate revising Programming to score full marks. Plain, exact English.
Exam: objective MCQ, 1 mark, −0.25 for a wrong answer. Programming is about 11–12 questions per paper.

## Syllabus (owner's list)
C / C++ / Java / Python: data types, operators, control flow, functions, recursion, pointers (C), arrays/strings,
OOP (class, object, inheritance, polymorphism, abstraction, encapsulation), exception handling,
Python lists/dicts/file handling. **OUTPUT-type questions.**

## How DSSSB actually asks Programming (all 46 questions from the 4 official papers, 2023–2024)
Full list with options, official answers and solutions: `backend/database/data/dsssb/prog_pyq_analysis.json`. READ IT FIRST.

What the papers show:
1. **C** (~10): operator precedence, relational operators, storage classes (auto/register/static/extern — "mutable" is not one), header files (scanf → stdio.h), variadic functions (stdarg.h), pointer output traces (`int x=8,*y; y=&x; …`), string-literal pointer arithmetic (`printf(6+"Hello World")` prints from the 7th character).
2. **C++** (~3): inline functions (reduce call overhead for small functions), `cin.ignore(n, delim)`, access specifiers (protected → accessible in derived class).
3. **Java** (~8): output traces with tricky identifiers (`int Integer = 24; char String = 'I';` compiles), octal literals (`int x = 010;` is 8), primitive data types, final/abstract/interface truth statements, packages, access-modifier strictness order (private > default > protected > public), ClassLoader hierarchy (Bootstrap has no parent; Application/System loader has no child loaders by default).
4. **Python** (~13): comments (#), identifiers rules, type conversion (ord/chr/int/float/str), string functions (max() returns the character with the highest Unicode value, strip()), list methods (append adds to the end), dictionary keys immutable/unique vs values any type, if/else output, tuple indexing/slicing output, file modes (r, w, a, r+, w+, a+, rb …), text vs binary files (.txt .py .csv are text files), CSV files, ImportError meaning.
5. **Pandas** (~5, not in the owner's list but asked): Series (1-D labelled array), DataFrame (2-D labelled, columns of different types), set_index, concat/merge/join.
6. **.NET** (~7, not in the owner's list but asked): CLR is the execution engine, MSIL/CIL is CPU-independent intermediate code turned into native code by JIT, .NET by Microsoft (2002), C# constructor rules, VB.NET controls (RadioButton = one option from many; CheckBox = many), Hashtable (access by unique key).
7. **General programming terms**: variable = symbolic name for a memory location, float = number with a decimal point, string = sequence of letters/digits/symbols, polymorphism = one interface many forms.

About 10 of the 46 are "What is the output?" questions; the rest are one-line facts/definitions. The syllabus line stresses OUTPUT-type questions, so the new material must train code tracing heavily.

## Chapters (use these exact keys and titles everywhere)
| key | chapter title |
|---|---|
| pg_basics | Programming Basics: Data Types, Operators & Control Flow |
| pg_functions | Functions & Recursion |
| pg_arrays | Arrays, Strings & Pointers (C/C++) |
| pg_oop | Object-Oriented Programming (C++ & Java) |
| pg_exceptions | Exception Handling |
| pg_python | Python: Data Types, Collections, File Handling & Pandas |
| pg_dotnet | .NET Framework, C# & VB.NET Basics |

## Code conventions (notes and questions)
- Put every code snippet in a fenced block with the language: ```c, ```cpp, ```java, ```python, ```csharp.
- Name the language in every output question ("What is the output of the following C program?").
- Assume a standard modern compiler: C99+/GCC, 32-bit `int`, ASCII. Never ask about undefined behaviour (e.g. `i = i++ + ++i`) unless the correct answer is "undefined behaviour" and that is the point being taught.
- Java and Python outputs must be verified by actually running them (`javac`/`java` 21 and `python` 3 are installed). There is no C/C++ compiler on this machine: trace C/C++ by hand, step by step, and write the trace in the explanation.

## Facts must be correct
Use standard references (K&R C, Stroustrup, Java Language Specification / Oracle docs, Python docs, Microsoft .NET docs, Pandas docs). Never invent syntax or library functions.
