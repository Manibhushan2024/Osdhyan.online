# Python: Data Types, Collections, File Handling & Pandas

**In 30 seconds**

- ⭐ Python is the most-asked Programming area in DSSSB TGT CS (17 of 46 questions, 2023–2024, including 5 on Pandas). Almost all of them are one-line facts or short output traces.
- ⭐ A comment starts with **`#`**. Triple-quoted strings are string literals (docstrings when placed first in a function, class or module), not true comments.
- ⭐ An identifier may contain letters, digits and **underscore**, cannot start with a digit, cannot be a keyword, is case-sensitive and has **no length limit**.
- ⭐ `ord()` turns a character into its integer code (`ord('A')` → 65); `chr()` does the reverse. ⭐ `max("Python")` returns the character with the highest Unicode value (`'y'`). ⭐ `strip()` removes leading and trailing whitespace.
- ⭐ `append()` adds one element at the **end** of a list. List methods that change the list in place (`append`, `sort`, `reverse` …) return **`None`**.
- ⭐ Dictionary **keys must be unique and immutable (hashable)**; **values can be of any type and can repeat**. ⭐ A tuple prints in parentheses with strings in quotes: `('Example', 1, 'Tuple')`.
- ⭐ `.txt`, `.py`, `.csv` are **text files**. ⭐ `"r+"` = read and write, pointer at the start, no truncation; `"w+"` truncates; `"a+"` writes at the end. ⭐ CSV = Comma-Separated Values. ⭐ `ImportError`/`ModuleNotFoundError` = Python could not find the module (e.g. pandas is not installed).
- ⭐ Pandas: **Series** = one-dimensional labelled array of any type; **DataFrame** = two-dimensional labelled table whose columns can have different types; `set_index()` makes column(s) the index; `concat()` joins row-wise or column-wise; `merge()`/`join()` combine tables like a database join.

All outputs in these notes were produced by running the code on Python 3.14 and pandas 3.0.

---

## 1. Python at a glance

| Point | Fact |
|---|---|
| Creator | Guido van Rossum (Netherlands); first public release 1991. Python 3.0 came out in 2008; Python 2 reached end of life in 2020 |
| Type of language | High-level, **interpreted**, general-purpose, **dynamically typed**, **strongly typed**, multi-paradigm (procedural, object-oriented, functional) |
| Execution | Source (`.py`) is compiled to **bytecode** (`.pyc`), which the Python Virtual Machine interprets. The reference implementation is **CPython** (written in C) |
| Key features | Simple readable syntax, free and open source, portable (platform independent), large standard library ("batteries included"), extensible and embeddable, automatic memory management (reference counting + garbage collector) |
| Case | Case-sensitive: `Marks` and `marks` are different names |
| Block structure | **Indentation** (not braces) marks a block. A block is introduced by a colon `:` |

### Interactive mode vs script mode

| Interactive mode | Script mode |
|---|---|
| Type statements at the `>>>` prompt (the Python shell / REPL) | Write a program in a `.py` file and run it (`python file.py`, or F5 in IDLE) |
| Each statement runs immediately; the value of an expression is echoed without `print()` | Nothing is echoed: you must use `print()` to see values |
| Good for testing small pieces of code | Good for full programs; code is saved and can be re-run |
| Code is not saved | Code is saved in a file |

### Indentation

- All statements in one block must be indented by the **same amount** (PEP 8 recommends 4 spaces).
- Wrong or inconsistent indentation raises `IndentationError` (a subclass of `SyntaxError`). Mixing tabs and spaces inconsistently raises `TabError`.
- `if`, `elif`, `else`, `for`, `while`, `def`, `class`, `try`, `with` lines end with a colon.

---

## 2. Comments ⭐

⭐ **Asked in DSSSB (7 Feb 2024, S2)**, twice in the same paper: "Which symbol is used to add comments in Python?" Answer: **`#`**.

```python
# This whole line is a comment
x = 10   # an inline comment after code
```

- Everything after `#` on that line is ignored by the interpreter.
- Python has **no multi-line comment syntax**. To comment several lines, put `#` at the start of each.
- `//` is **floor division** in Python, not a comment (it is a comment in C, C++, Java). `/* */` is not valid Python.
- A triple-quoted string (`'''…'''` or `"""…"""`) is a **string literal**. If it is the first statement of a module, function or class, it becomes the **docstring** and is stored in the `__doc__` attribute (shown by `help()`). An unassigned triple-quoted string elsewhere is evaluated and discarded, so people use it like a comment, but it is not a comment.

```python
def area(r):
    """Return the area of a circle of radius r."""   # docstring
    return 3.14 * r * r

print(area.__doc__)
```
Output:
```text
Return the area of a circle of radius r.
```

---

## 3. Identifiers and keywords ⭐

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: correct statement about identifiers. Answer: **"An identifier can have underscore (_) symbol."** The false options were "we must use keywords", "there is a restriction on length" and "must start with a digit".

**Rules for identifiers**

1. Allowed characters: letters `A–Z`, `a–z` (Python 3 also allows Unicode letters), digits `0–9`, underscore `_`.
2. Must **not start with a digit**: `1st` is invalid, `_1st` and `first1` are valid.
3. **No special symbols** or spaces: `my-name`, `my name`, `rate%`, `@x`, `$x` are invalid.
4. **Cannot be a keyword**: `for`, `class`, `True` are invalid names.
5. **Case-sensitive**: `Total`, `total`, `TOTAL` are three names.
6. **No length limit**.

Conventions (not rules): `_name` suggests "internal use"; `__name__` (double underscores on both sides) is a special ("dunder") name; class names use `CapWords`; variables and functions use `lower_case`.

**Keywords**: Python 3.14 has **35** keywords (`import keyword; keyword.kwlist`):

```text
False None True and as assert async await break class continue def del elif else
except finally for from global if import in is lambda nonlocal not or pass raise
return try while with yield
```

- Only `True`, `False`, `None` start with a capital letter.
- `print`, `input`, `int`, `list`, `len` are **built-in functions, not keywords**. You can (but should not) use them as variable names: `list = [1, 2]` hides the built-in `list()`.
- `match`, `case`, `type` and `_` are **soft keywords**: keywords only in special contexts, so they can still be used as names.

---

## 4. Variables, dynamic typing, `type()` and `id()`

- A **variable** is a name that refers to an object in memory. Assignment `x = 5` binds the name `x` to an integer object `5`. No declaration is needed.
- **Dynamic typing**: the type belongs to the object, not to the name, so the same name can later refer to an object of another type (`x = 5` then `x = "five"`).
- **Strong typing**: Python does not silently mix incompatible types: `"5" + 3` raises `TypeError`.
- `type(obj)` returns the class of the object; `isinstance(obj, cls)` tests it (`isinstance(True, int)` is `True` because `bool` is a subclass of `int`).
- `id(obj)` returns the object's identity (a unique integer during its lifetime; in CPython, its memory address). Two names have the same `id` only if they refer to the **same** object.
- Multiple assignment: `a = b = c = 0`; `a, b = 1, 2`; swap: `a, b = b, a`.

### Built-in data types

| Category | Types | Example literal |
|---|---|---|
| Numeric | `int` (unlimited precision), `float` (double precision), `complex` | `10`, `3.14`, `2+3j` |
| Boolean | `bool` (`True` = 1, `False` = 0) | `True` |
| Text sequence | `str` | `'hi'`, `"hi"`, `'''hi'''` |
| Sequences | `list`, `tuple`, `range` | `[1, 2]`, `(1, 2)`, `range(5)` |
| Set types | `set`, `frozenset` | `{1, 2}` |
| Mapping | `dict` | `{'a': 1}` |
| None type | `NoneType` | `None` |
| Binary | `bytes`, `bytearray` | `b'abc'` |

Python has no separate `char` type (a character is a string of length 1) and no `long` type in Python 3 (`int` has unlimited size).

### Mutable vs immutable ⭐

| Immutable (cannot change in place) | Mutable (can change in place) |
|---|---|
| `int`, `float`, `complex`, `bool` | `list` |
| `str` | `dict` |
| `tuple` | `set` |
| `frozenset`, `bytes` | `bytearray` |

- Only immutable (more exactly, **hashable**) objects can be **dictionary keys** or **set elements**.
- "Changing" an immutable object really creates a new object: after `s = s + "x"`, `s` refers to a new string with a new `id`.

---

## 5. Type conversion ⭐

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: function that converts a character into an integer. Answer: **`ord()`** (options included `tuple()`, `dict()`, `set()`).

**Implicit conversion** (automatic): in mixed arithmetic Python widens the type: `int` + `float` gives `float`; `True + 1` gives `2`. `/` always gives a `float`.

**Explicit conversion** (type casting):

| Function | What it does | Example → result |
|---|---|---|
| `int(x)` | To integer; truncates a float towards zero; parses a string of digits (spaces around allowed) | `int(3.99)` → `3`, `int(-3.99)` → `-3`, `int(' 42 ')` → `42` |
| `int(s, base)` | Parses a string in the given base | `int('101', 2)` → `5`, `int('17', 8)` → `15`, `int('0x1F', 16)` → `31` |
| `float(x)` | To floating point | `float('3')` → `3.0` |
| `str(x)` | To string | `str(10) + str(5)` → `'105'` |
| `bool(x)` | Falsy values → `False`: `0`, `0.0`, `''`, `[]`, `()`, `{}`, `set()`, `None`. Everything else → `True` | `bool('')` → `False`, `bool('False')` → `True`, `bool([0])` → `True` |
| `list(x)` | Iterable to list | `list("abc")` → `['a', 'b', 'c']` |
| `tuple(x)` | Iterable to tuple | `tuple([1, 2])` → `(1, 2)` |
| `set(x)` | Iterable to set (duplicates removed) | `set([1, 1, 2])` → `{1, 2}` |
| `dict(x)` | Sequence of key-value pairs to dict | `dict([(1, 'a'), (2, 'b')])` → `{1: 'a', 2: 'b'}` |
| ⭐ `ord(c)` | One character → its integer Unicode code point | `ord('A')` → `65`, `ord('a')` → `97`, `ord('0')` → `48`, `ord(' ')` → `32` |
| `chr(n)` | Integer code → character | `chr(66)` → `'B'` |
| `hex(n)` | Integer → hexadecimal **string** | `hex(255)` → `'0xff'` |
| `oct(n)` | Integer → octal string | `oct(8)` → `'0o10'` |
| `bin(n)` | Integer → binary string | `bin(5)` → `'0b101'` |

- `int('3.5')` raises `ValueError` (a string with a decimal point is not an integer literal); use `int(float('3.5'))`.
- `int('abc')` → `ValueError: invalid literal for int() with base 10: 'abc'`.
- `list` of a dict gives its **keys**: `list({'x': 1, 'y': 2})` → `['x', 'y']`.
- `round(2.5)` → `2` and `round(3.5)` → `4`: Python rounds halves to the **nearest even** number.

**Output Q1.** What is the output of the following Python code?

```python
print(ord('A') + ord('a'), chr(ord('a') + 2))
print(int('101', 2), int(3.99), str(10) + str(5), 10 + 5)
print(bool(''), bool('False'), bool(0.0), bool([0]))
print(hex(255), oct(8), bin(5))
```
Output:
```text
162 c
5 3 105 15
False True False True
0xff 0o10 0b101
```

---

## 6. Operators

| Group | Operators | Note |
|---|---|---|
| Arithmetic | `+ - * / // % **` | `/` true division (float result); `//` floor division (rounds **down**, towards minus infinity); `%` remainder takes the sign of the **divisor**; `**` power |
| Relational | `== != < > <= >=` | Result is `True`/`False`. Can be **chained**: `1 < x < 10` |
| Logical | `and or not` | Short-circuit; `and`/`or` return one of the operands, not always a bool |
| Assignment | `= += -= *= /= //= %= **=` | No `++` or `--` in Python (`++x` is just `+(+x)`) |
| Bitwise | `& \| ^ ~ << >>` | `~x` = `-(x+1)` |
| Membership | `in`, `not in` | Works on strings, lists, tuples, sets, dict **keys** |
| Identity | `is`, `is not` | Same object? (compares `id`) |

**`is` vs `==`**: `==` compares **values**; `is` compares **identity**. Two separate lists `[1, 2]` are `==` but not `is`. Use `is` only for `None` (`if x is None`).

**Precedence (highest to lowest)**

| Level | Operators |
|---|---|
| 1 | `()` parentheses |
| 2 | `**` (right-associative) |
| 3 | unary `+x`, `-x`, `~x` |
| 4 | `*`, `/`, `//`, `%` |
| 5 | `+`, `-` |
| 6 | `<<`, `>>` |
| 7 | `&` |
| 8 | `^` |
| 9 | `\|` |
| 10 | comparisons, `in`, `not in`, `is`, `is not` |
| 11 | `not` |
| 12 | `and` |
| 13 | `or` |
| 14 | `if … else` (conditional expression) |
| 15 | `lambda` |

Operators of the same level are evaluated left to right, **except `**`**, which goes right to left: `2 ** 3 ** 2` = `2 ** 9` = `512`. `**` binds tighter than a unary minus on its left: `-2 ** 2` = `-(2 ** 2)` = `-4`.

**Output Q2 (integer division and power).** What is the output of the following Python code?

```python
print(7 // 2, -7 // 2, 7 % -2, -7 % 2, 7 / 2, 6 / 2)
print(2 ** 3 ** 2, -2 ** 2, (-2) ** 2)
print(7.0 // 2, 2 ** -1, divmod(17, 5))
```
Output:
```text
3 -4 -1 1 3.5 3.0
512 -4 4
3.0 0.5 (3, 2)
```
Explanation: `-7 // 2` = floor(−3.5) = −4. `7 % -2` = 7 − (−2)(−4) = −1 (sign of the divisor). `6 / 2` is `3.0` because `/` always returns a float. `7.0 // 2` is `3.0` because one operand is a float.

**Output Q3 (chained comparison, logical operators).** What is the output of the following Python code?

```python
print(1 < 2 < 3, 3 > 2 > 2, 1 < 3 > 2, 3 > 2 == True)
print(5 or 0, 0 and 5, not 0, 1 + 2 > 2 and 0)
x = [1, 2]; y = [1, 2]
print(x == y, x is y, "ell" in "Hello", 1 in {'a': 1})
```
Output:
```text
True False True False
5 0 True 0
True False True False
```
Explanation: a chain `a op b op c` means `a op b and b op c`. So `3 > 2 == True` is `(3 > 2) and (2 == True)` → `True and False` → `False`. `5 or 0` returns the first truthy operand `5`; `0 and 5` returns the first falsy operand `0`. `in` on a dict checks keys, so `1 in {'a': 1}` is `False`.

---

## 7. Input and output

- `input(prompt)` displays the prompt and **always returns a string**. Convert it: `n = int(input("Enter n: "))`.
- `print(*objects, sep=' ', end='\n')`: prints the objects separated by `sep` (default one space) and finishes with `end` (default newline). `print()` alone prints a blank line.

```python
print("A", "B", "C", sep="-", end="!\n")
print("X", end="")
print("Y")
print(1, 2, sep="")
```
Output:
```text
A-B-C!
XY
12
```

**String formatting**

```python
name, marks = "Ravi", 91.456
print(f"{name} scored {marks:.2f}")
print("{} and {}".format("A", "B"), "{1}{0}".format("x", "y"), "%d%%" % 50)
print(f"{7:03d}|{'ab':>5}|{'ab':<5}|{3.14159:.1f}")
```
Output:
```text
Ravi scored 91.46
A and B yx 50%
007|   ab|ab   |3.1
```

---

## 8. Control flow ⭐

### if / elif / else

⭐ **Asked in DSSSB (7 Feb 2024, S2)**:

```python
a = 20
b = 35
if a >= b:
    print("yes")
else:
    print("No")
```
Output:
```text
No
```
`20 >= 35` is `False`, so the `else` block runs and prints `No` exactly as written (capital N). The code is valid, so "Syntax"/"Error" options are wrong.

- Any number of `elif` parts; `else` is optional and comes last. Only the **first** true branch runs.
- Conditional expression (ternary): `value_if_true if condition else value_if_false`, e.g. `"Even" if n % 2 == 0 else "Odd"`.
- Python has no `switch`; Python 3.10+ has `match`/`case` (structural pattern matching).

### for and range()

`for` iterates over any iterable (string, list, tuple, dict, set, file, range).

`range(stop)`, `range(start, stop)`, `range(start, stop, step)`: produces integers from `start` (default 0) up to but **not including** `stop`, in steps of `step` (default 1; can be negative; cannot be 0).

```python
print(list(range(5)), list(range(2, 8, 2)), list(range(10, 0, -3)), list(range(5, 1)))
```
Output:
```text
[0, 1, 2, 3, 4] [2, 4, 6] [10, 7, 4, 1] []
```

### while, break, continue, pass

- `while condition:` repeats while the condition is true.
- `break` leaves the innermost loop; `continue` skips to the next iteration; `pass` does nothing (a placeholder where a statement is required, e.g. an empty function body).

**Output Q4 (continue).** What is the output of the following Python code?

```python
i = 0
while i < 5:
    i += 1
    if i == 3:
        continue
    print(i, end=" ")
```
Output:
```text
1 2 4 5 
```

### Loop `else`

A `for` or `while` loop may have an `else` block. It runs when the loop **finishes normally** (the sequence is exhausted, or the `while` condition becomes false). It does **not** run if the loop ends with `break`.

**Output Q5 (loop else).** What is the output of the following Python code?

```python
for i in range(3):
    if i == 5:
        break
else:
    print("done", i)
for i in range(3):
    if i == 1:
        break
else:
    print("never")
print("after", i)
```
Output:
```text
done 2
after 1
```
The first loop never breaks, so its `else` runs (with `i` left at 2). The second loop breaks at `i == 1`, so `"never"` is not printed.

---

## 9. Strings ⭐

A string is an **immutable** sequence of Unicode characters, written in single, double or triple quotes.

**Indexing**: positive indexes from 0 (left); **negative indexes** from −1 (last character). For `s = "DSSSB Exam"` (length 10):

```text
 D  S  S  S  B     E  x  a  m
 0  1  2  3  4  5  6  7  8  9
-10 -9 -8 -7 -6 -5 -4 -3 -2 -1
```

**Slicing** `s[start:stop:step]`: from `start` up to but **not including** `stop`. Omitted `start`/`stop` mean "from the beginning"/"to the end" (reversed when `step` is negative). Slicing **never raises IndexError**: an out-of-range slice just gives a shorter or empty string. Indexing out of range (`s[20]`) raises `IndexError: string index out of range`.

**Output Q6 (slicing).** What is the output of the following Python code?

```python
s = "DSSSB Exam"
print(s[2:5])
print(s[-4:])
print(s[::-1])
print(s[::2])
print(s[1:8:3])
print(s[-1], s[-10], len(s))
print(s[5:2] == "", s[100:] == "")
```
Output:
```text
SSB
Exam
maxE BSSSD
DSBEa
SBx
m D 10
True True
```
Explanation: `s[1:8:3]` takes indexes 1, 4, 7 → `S`, `B`, `x`. `s[5:2]` is empty because with a positive step `start` must be left of `stop`.

**Immutability**: `s[0] = "K"` raises `TypeError: 'str' object does not support item assignment`. Build a new string instead: `s = "K" + s[1:]`.

**Operators on strings**: `+` concatenation, `*` repetition (`"Py" * 3` → `'PyPyPy'`), `in`/`not in` substring test, comparison operators compare **character by character by Unicode code** (`"Z" < "a"` is `True` because 90 < 97; `"10" < "5"` is `True` because `'1'` < `'5'`). `"5" + 3` is a `TypeError`.

### String methods (all return a **new** string or value; the original is unchanged)

| Method | Returns | Example → result |
|---|---|---|
| `upper()` / `lower()` | All upper / lower case | `"abc".upper()` → `'ABC'` |
| `title()` | First letter of **every word** capital, rest small | `"hello WORLD".title()` → `'Hello World'` |
| `capitalize()` | First character of the **string** capital, **rest lower case** | `"hello WORLD".capitalize()` → `'Hello world'` |
| `swapcase()` | Swaps the case of each letter | `"hello WORLD".swapcase()` → `'HELLO world'` |
| ⭐ `strip()` | Removes **leading and trailing** whitespace (or the given characters) | `"  hi  ".strip()` → `'hi'`; `"xxhixx".strip("x")` → `'hi'` |
| `lstrip()` / `rstrip()` | Removes from the left only / right only | `"  hi  ".lstrip()` → `'hi  '` |
| `split(sep)` | A **list** of pieces; with no argument splits on runs of whitespace | `"a,b,,c".split(",")` → `['a', 'b', '', 'c']`; `"  a  b ".split()` → `['a', 'b']` |
| `join(iterable)` | Joins strings using the string as separator | `"-".join(["2024", "02", "07"])` → `'2024-02-07'` |
| `replace(old, new[, count])` | Replaces occurrences | `"Mississippi".replace("ss", "SS", 1)` → `'MiSSissippi'` |
| `find(sub)` | Lowest index of `sub`, or **−1** if not found | `"banana".find("n")` → `2`; `"banana".find("z")` → `-1` |
| `index(sub)` | Like `find` but raises **`ValueError`** if not found | `"Abc".index("c")` → `2` |
| `count(sub)` | Number of non-overlapping occurrences | `"banana".count("a")` → `3` |
| `startswith(p)` / `endswith(p)` | `True`/`False` (case-sensitive) | `"Python".endswith("ON")` → `False` |
| `isalpha()` | All characters letters (and not empty) | `"abc".isalpha()` → `True`; `"".isalpha()` → `False` |
| `isdigit()` | All characters digits | `"123".isdigit()` → `True` |
| `isalnum()` | All letters or digits | `"abc123".isalnum()` → `True` |
| `isspace()` | All whitespace | `"   ".isspace()` → `True` |
| `isupper()` / `islower()` | Case test | `"ABC".isupper()` → `True` |
| `center(w, fill)` | Centred in width `w` | `"hi".center(6, "*")` → `'**hi**'` |
| `format()` / f-strings | Formatted string | see Section 7 |

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: `strip()` "returns the string by removing trailing and leading white spaces". The distractors described `split()` (list by delimiter), `pow()` (power) and `capitalize()` (first character upper case, rest lower).

### Built-in functions on strings ⭐

| Function | Result for a string |
|---|---|
| `len(s)` | Number of characters (spaces count): `len("Hello World")` → `11` |
| ⭐ `max(s)` | Character with the **highest Unicode (ASCII) value** |
| `min(s)` | Character with the lowest Unicode value |
| `sorted(s)` | A **list** of characters in Unicode order |
| `ord(c)` / `chr(n)` | Code of a character / character of a code |

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: function that returns the character with the highest ASCII value. Answer: **`max()`**. (`hvalue()` and `long()` do not exist.)

Remember the order: space (32) < digits `'0'–'9'` (48–57) < capitals `'A'–'Z'` (65–90) < small letters `'a'–'z'` (97–122).

**Output Q7 (max/min of strings).** What is the output of the following Python code?

```python
print(max("Python"), min("Python"))
print(max("apple"), max("Zebra", "apple"), min(["b", "B", "a"]))
print(max("hello world"), min("hello world") == " ")
print(sorted("Banana"))
```
Output:
```text
y P
p apple B
w True
['B', 'a', 'a', 'a', 'n', 'n']
```
Explanation: in `"Python"`, `'y'` (121) is the largest and capital `'P'` (80) the smallest. `max("Zebra", "apple")` compares two strings: `'a'` (97) > `'Z'` (90), so `'apple'` wins. In `"hello world"` the space is the smallest character.

**Output Q8 (string methods).** What is the output of the following Python code?

```python
t = "  hello WORLD  "
print(t.strip() + "|")
print(t.strip().title(), t.strip().capitalize(), sep=" / ")
print("banana".count("a"), "banana".find("n"), "banana".find("z"), "banana".rfind("a"))
print("10" + "20", int("10") + int("20"), "Hello"[1:4], "Hello"[-3:-1])
```
Output:
```text
hello WORLD|
Hello World / Hello world
3 2 -1 5
1020 30 ell ll
```

---

## 10. Lists ⭐

A list is an **ordered, mutable** sequence in square brackets. It can hold mixed types and duplicates: `[1, "two", 3.0, [4, 5]]`.

- Creation: `[]`, `list()`, `list("abc")`, `[0] * 5`, list comprehension.
- Indexing and slicing work exactly as for strings; slicing returns a **new list**.
- Lists are mutable: `L[0] = 99`, `L[1:3] = [7, 8]`, `del L[0]`, `del L[1:3]`.
- `+` joins two lists; `*` repeats; `in` tests membership; `len`, `max`, `min`, `sum`, `sorted` work on lists.

### List methods ⭐

| Method | Action | Returns |
|---|---|---|
| ⭐ `append(x)` | Adds **one** element `x` at the **end** (a list argument is added as one nested element) | `None` |
| `extend(iterable)` | Adds **each element** of the iterable at the end | `None` |
| `insert(i, x)` | Inserts `x` before index `i` | `None` |
| `remove(x)` | Removes the **first occurrence** of value `x`; `ValueError` if absent | `None` |
| `pop([i])` | Removes and **returns** the element at index `i` (default: last); `IndexError` on an empty list | the element |
| `clear()` | Removes all elements | `None` |
| `index(x)` | Index of the first occurrence of `x`; `ValueError` if absent | int |
| `count(x)` | Number of occurrences of `x` | int |
| `sort(reverse=False, key=None)` | Sorts **in place** | `None` |
| `reverse()` | Reverses **in place** | `None` |
| `copy()` | Shallow copy (same as `L[:]`) | new list |

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: method to add an element to the end of a list. Answer: **`append()`** (distractors: `index()`, `sort()`, `pop()`).

`sorted(L)` (a built-in function) returns a **new** sorted list and leaves `L` unchanged; `L.sort()` changes `L` and returns `None`.

**Output Q9 (methods that return None).** What is the output of the following Python code?

```python
L = [3, 1, 2]
x = L.sort()
print(x, L)
print(sorted([3, 1, 2]))
```
Output:
```text
None [1, 2, 3]
[1, 2, 3]
```

**Output Q10 (append vs extend).** What is the output of the following Python code?

```python
L = [1, 2]
L.append([3, 4])
L.extend([5, 6])
L.extend("ab")
print(L, len(L))
```
Output:
```text
[1, 2, [3, 4], 5, 6, 'a', 'b'] 7
```
`append([3, 4])` adds the whole list as **one** element; `extend("ab")` adds each character.

**Output Q11 (insert, remove, pop).** What is the output of the following Python code?

```python
L = [10, 20, 30, 20]
L.insert(1, 15)
L.remove(20)
p = L.pop()
q = L.pop(0)
print(L, p, q, L.index(30), L.count(20))
```
Output:
```text
[15, 30] 20 10 1 0
```
Trace: insert → `[10, 15, 20, 30, 20]`; remove first 20 → `[10, 15, 30, 20]`; `pop()` removes last 20 → `[10, 15, 30]`; `pop(0)` removes 10 → `[15, 30]`.

### List comprehension

`[expression for item in iterable if condition]` builds a list in one line.

```python
print([x * x for x in range(1, 6) if x % 2 == 1])
print([c.upper() for c in "abc"], [i for i in range(10) if i % 3 == 0])
```
Output:
```text
[1, 9, 25]
['A', 'B', 'C'] [0, 3, 6, 9]
```

### Nested lists

```python
m = [[1, 2, 3], [4, 5, 6]]
print(m[1][0], len(m), len(m[0]), m[-1][-1], [row[1] for row in m])
```
Output:
```text
4 2 3 6 [2, 5]
```

### Aliasing vs copying ⭐

`b = a` does **not** copy a list; it makes `b` a second name (alias) for the **same** list. A change through one name is seen through the other. `a[:]`, `a.copy()` and `list(a)` make a **shallow** copy (a new outer list, but nested objects are shared); `copy.deepcopy(a)` copies nested objects too.

**Output Q12 (list aliasing).** What is the output of the following Python code?

```python
a = [1, 2, 3]
b = a
b.append(4)
c = a[:]
c.append(5)
print(a, b, c)
print(a is b, a is c, a == b)
```
Output:
```text
[1, 2, 3, 4] [1, 2, 3, 4] [1, 2, 3, 4, 5]
True False True
```

**Output Q13 (repetition of a nested list).** What is the output of the following Python code?

```python
g = [[0] * 2] * 2
g[0][0] = 1
print(g)
h = [[0] * 2 for _ in range(2)]
h[0][0] = 1
print(h)
```
Output:
```text
[[1, 0], [1, 0]]
[[1, 0], [0, 0]]
```
`[[0] * 2] * 2` repeats a **reference** to one inner list, so both rows are the same object. The comprehension creates two separate inner lists.

---

## 11. Tuples ⭐

A tuple is an **ordered, immutable** sequence, usually written in parentheses: `(1, "a", 2.5)`. It is faster than a list, can be a dictionary key (if all its elements are hashable) and is used to return several values from a function.

- It is the **comma** that makes a tuple, not the parentheses: `t = 5,` is a tuple.
- **Single-element tuple** needs a trailing comma: `(5,)`. `(5)` is just the integer 5 in brackets.
- Empty tuple: `()` or `tuple()`.
- Indexing and slicing work as for strings and lists; slicing returns a new tuple.
- Immutability: `t[0] = 9` raises `TypeError: 'tuple' object does not support item assignment`. But a **mutable element inside** a tuple can change: `t = (1, [2, 3]); t[1].append(4)` gives `(1, [2, 3, 4])`.
- Methods: only **`count(x)`** and **`index(x)`**.
- **Packing**: `t = 1, 2, 3`. **Unpacking**: `a, b, c = t` (the counts must match, else `ValueError`); with a star: `p, *q = (1, 2, 3, 4)` gives `p = 1`, `q = [2, 3, 4]` (a list).

⭐ **Asked in DSSSB (7 Feb 2024, S2)**:

```python
tuple_var_mix = ("Example", 1, "Tuple")
print (tuple_var_mix)
```
Output:
```text
('Example', 1, 'Tuple')
```
`print()` shows a tuple in **parentheses**, strings inside it in **single quotes**, and keeps the original case (`'Tuple'`). Curly braces would be a set/dict; square brackets a list.

**Output Q14 (tuple indexing, slicing and type).** What is the output of the following Python code?

```python
tuple_var_mix = ("Example", 1, "Tuple")
print(tuple_var_mix[1:], tuple_var_mix[-1][1:3])
print(type((5)), type((5,)), type(()))
tt = (1, 2, 2, 3, 2)
print(tt.count(2), tt.index(3), tt[1:4], tt[::-1], tt + (4,))
```
Output:
```text
(1, 'Tuple') up
<class 'int'> <class 'tuple'> <class 'tuple'>
3 3 (2, 2, 3) (2, 3, 2, 2, 1) (1, 2, 2, 3, 2, 4)
```
`tuple_var_mix[-1]` is the string `'Tuple'`, and `'Tuple'[1:3]` is `'up'`.

**Output Q15 (unpacking and multiple return values).** What is the output of the following Python code?

```python
a, b = 5, 10
a, b = b, a
print(a, b)
p, *q = (1, 2, 3, 4)
print(p, q)
def stats(x, y):
    return x + y, x * y
r = stats(3, 4)
print(r, type(r))
```
Output:
```text
10 5
1 [2, 3, 4]
(7, 12) <class 'tuple'>
```

---

## 12. Sets

A set is an **unordered** collection of **unique**, hashable elements: `{1, 2, 3}`. No indexing or slicing (`s[0]` is a `TypeError`). `{}` is an **empty dict**; an empty set is `set()`. A `frozenset` is an immutable set.

Methods: `add(x)`, `update(iterable)`, `remove(x)` (`KeyError` if absent), `discard(x)` (no error), `pop()` (removes an arbitrary element), `clear()`.

| Operation | Operator | Method | `A = {1,2,3,4}`, `B = {3,4,5}` |
|---|---|---|---|
| Union | `A \| B` | `A.union(B)` | `{1, 2, 3, 4, 5}` |
| Intersection | `A & B` | `A.intersection(B)` | `{3, 4}` |
| Difference | `A - B` | `A.difference(B)` | `{1, 2}` |
| Symmetric difference | `A ^ B` | `A.symmetric_difference(B)` | `{1, 2, 5}` |
| Subset / superset | `A <= B`, `A >= B` | `issubset`, `issuperset` | `{1, 2} <= A` is `True` |

`set([1, 1, 2])` → `{1, 2}` is the quickest way to remove duplicates.

---

## 13. Dictionaries ⭐

A dictionary is a **mutable** mapping of **key: value** pairs in curly braces: `{'roll': 5, 'name': 'Asha'}`. Since Python 3.7 a dict keeps **insertion order**. Values are accessed by key, not by position.

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: "The values in a dictionary can be ______ but the keys should be ______." Answer: **repeated, unique**.

- **Keys**: must be **unique** and **immutable/hashable** (int, float, str, tuple of immutables, bool, frozenset). A list, dict or set as key raises `TypeError: unhashable type: 'list'` (the exact wording varies by version).
- **Values**: **any type**, and they **may repeat**.
- Assigning to an existing key **replaces** its value; a duplicate key in a literal keeps the **last** value.
- `d[key]` raises `KeyError` if the key is missing; `d.get(key)` returns `None` (or a default) instead.
- `in` tests **keys**, not values.

| Method | Action |
|---|---|
| `keys()`, `values()`, `items()` | View objects of keys, values, `(key, value)` tuples |
| `get(k[, default])` | Value for `k`, or `default` (`None` if not given); never raises `KeyError` |
| `update(other)` | Adds the pairs from `other`; existing keys are overwritten |
| `pop(k[, default])` | Removes key `k` and returns its value; `KeyError` if absent and no default |
| `popitem()` | Removes and returns the **last inserted** `(key, value)` pair |
| `setdefault(k, v)` | Returns `d[k]` if `k` exists; otherwise inserts `k: v` and returns `v` |
| `clear()`, `copy()` | Empty the dict / shallow copy |
| `dict.fromkeys(seq, v)` | New dict with keys from `seq`, all values `v` |

`del d[k]` deletes one key; `len(d)` counts pairs.

**Output Q16 (dict update).** What is the output of the following Python code?

```python
d = {'a': 1, 'b': 2}
d.update({'b': 20, 'c': 3})
d['a'] = 10
print(d, len(d))
d2 = {'a': 1, 'a': 2, 'b': 1}
print(d2)
print(d2.get('c'), d2.get('c', 0), d2.setdefault('c', 9))
print(d2)
```
Output:
```text
{'a': 10, 'b': 20, 'c': 3} 3
{'a': 2, 'b': 1}
None 0 9
{'a': 2, 'b': 1, 'c': 9}
```

**Output Q17 (keys that are equal).** What is the output of the following Python code?

```python
d = {1: 'x', True: 'y', 1.0: 'z'}
print(d)
```
Output:
```text
{1: 'z'}
```
`1`, `True` and `1.0` are equal and have the same hash, so they are the **same key**. The first spelling of the key (`1`) is kept; the value is overwritten each time, ending as `'z'`.

**Iteration and comprehension**

```python
st = {'n': 'Asha', 'age': 30}
for k, v in st.items():
    print(k, v)
print(list(st.keys()), list(st.values()))
print({x: x * x for x in range(4)})
```
Output:
```text
n Asha
age 30
['n', 'age'] ['Asha', 30]
{0: 0, 1: 1, 2: 4, 3: 9}
```
A plain `for k in d:` loops over the **keys**.

---

## 14. Functions

```python
def power(base, exp=2):          # exp has a default value
    return base ** exp

print(power(3), power(2, 3), power(exp=3, base=2))
```
Output:
```text
9 8 8
```

- `def name(parameters):` defines a function; the body is indented. **Parameters** are in the definition; **arguments** are the values passed in the call.
- **Positional** arguments match by position; **keyword** arguments match by name (`power(exp=3, base=2)`) and may come in any order, but positional arguments must come **before** keyword arguments in a call.
- **Default** parameters must come **after** non-default ones: `def f(a=1, b)` is a `SyntaxError`.
- `*args` collects extra positional arguments into a **tuple**; `**kwargs` collects extra keyword arguments into a **dict**.
- `return` ends the function. A function with no `return` (or a bare `return`) returns **`None`**. `return a, b` returns a **tuple**.
- `lambda arguments: expression` is an anonymous one-expression function: `sq = lambda n: n * n`.
- Python passes **object references** ("call by object reference"): changing a mutable argument in place (e.g. `L.append`) is visible to the caller; rebinding the parameter is not.

```python
def show(a, b=2, *args, **kwargs):
    print(a, b, args, kwargs)
show(1)
show(1, 3, 5, 7, x=9)
print(list(map(lambda x: x * 2, [1, 2, 3])), list(filter(lambda x: x % 2, range(6))))
```
Output:
```text
1 2 () {}
1 3 (5, 7) {'x': 9}
[2, 4, 6] [1, 3, 5]
```

**Scope (LEGB rule)**: a name is looked up in the **L**ocal, **E**nclosing function, **G**lobal and **B**uilt-in scopes, in that order. Assigning to a name inside a function makes it local unless it is declared `global` (or `nonlocal` for an enclosing function's variable).

**Output Q18 (local vs global).** What is the output of the following Python code?

```python
x = 10
def g():
    x = 20
    print("inside", x)
g()
print("outside", x)
def h():
    global x
    x = 30
h()
print(x)
```
Output:
```text
inside 20
outside 10
30
```

**Output Q19 (mutable default argument).** What is the output of the following Python code?

```python
def f(x, L=[]):
    L.append(x)
    return L
print(f(1))
print(f(2))
print(f(3, []))
print(f(4))
```
Output:
```text
[1]
[1, 2]
[3]
[1, 2, 4]
```
A default value is created **once**, when the `def` statement runs, not on every call. All calls that use the default share the same list. The safe pattern is `def f(x, L=None):` and then `if L is None: L = []`.

**Output Q20 (function without return).** What is the output of the following Python code?

```python
def noreturn():
    print("hi")
v = noreturn()
print(v)
```
Output:
```text
hi
None
```

---

## 15. Modules, packages and import ⭐

- A **module** is a `.py` file of definitions; a **package** is a folder of modules (traditionally with `__init__.py`); a **library** is a collection of packages (e.g. pandas, NumPy).
- Forms of import:

| Statement | Use afterwards |
|---|---|
| `import math` | `math.sqrt(16)` |
| `import math as m` | `m.sqrt(16)` (alias) |
| `from math import sqrt, pi` | `sqrt(16)`, `pi` (no prefix) |
| `from math import *` | all public names (not recommended) |

- Standard modules often asked: `math` (`sqrt`, `ceil`, `floor`, `pow`, `pi`), `random` (`random()`, `randint(a, b)` inclusive of both ends, `choice`), `statistics` (`mean`, `median`, `mode`), `os`, `sys`, `csv`, `pickle`.
- When a module is run directly, its `__name__` is `"__main__"`; when imported, `__name__` is the module name.
- Third-party libraries are installed with **pip**: `pip install pandas`.

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: "If you encounter an ImportError, what does it mean?" Answer: **Only III: Python couldn't find Pandas in the list of available libraries.**

- `ImportError` is raised when an `import` fails. Its subclass **`ModuleNotFoundError`** (Python 3.6+) is raised when the **module itself cannot be found** (not installed, misspelled, or not on `sys.path`).
- `ImportError` (not the subclass) is raised when the module is found but a **name inside it** cannot be imported.

```python
try:
    import pandaz
except ImportError as e:
    print(type(e).__name__, "|", e)
try:
    from math import squareroot
except ImportError as e:
    print(type(e).__name__)
```
Output:
```text
ModuleNotFoundError | No module named 'pandaz'
ImportError
```

---

## 16. File handling ⭐

### Text files vs binary files ⭐

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: `.txt`, `.py`, `.csv` are examples of **text files**.

| Text file | Binary file |
|---|---|
| Stores characters in an encoding (ASCII/UTF-8); human-readable in a text editor | Stores raw bytes, exactly as in memory; not human-readable |
| Each line ends with an end-of-line (EOL) character (`\n`; Windows stores `\r\n`, translated automatically in text mode) | No line structure, no EOL translation |
| Examples: `.txt`, `.py`, `.csv`, `.html`, `.json` | Examples: `.jpg`, `.png`, `.mp3`, `.exe`, `.dat` (pickle), `.pdf` |
| Opened in text mode (`'r'`, `'w'` …); read/write `str` | Opened with `'b'` (`'rb'`, `'wb'` …); read/write `bytes` |

### open() and file modes ⭐

`file_object = open(filename, mode='r', encoding=None, newline=None)`. The mode is a string; `'t'` (text) is the default and `'b'` means binary.

| Mode | Purpose | File must exist? | Existing content | Initial pointer |
|---|---|---|---|---|
| `'r'` | Read only (default) | Yes, else `FileNotFoundError` | Kept | Start |
| `'w'` | Write only | No (created) | **Truncated (erased)** | Start |
| `'a'` | Append only | No (created) | Kept; every write goes to the **end** | End |
| `'x'` | Exclusive create, write | Must **not** exist, else `FileExistsError` | – | Start |
| ⭐ `'r+'` | **Read and write** | Yes | **Kept (not truncated)**; writing overwrites characters in place | **Start** |
| `'w+'` | Write and read | No (created) | **Truncated** | Start |
| `'a+'` | Append and read | No (created) | Kept; writes always at the end | End (use `seek(0)` to read from the start) |
| `'rb'`, `'wb'`, `'ab'`, `'rb+'`/`'r+b'`, `'wb+'`, `'ab+'` | Binary versions of the modes above | Same as the text mode | Same | Same |

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: mode that "opens the file for both reading and writing and the file pointer will be placed at the start". Answer: **`r+`** (`a+` reads and writes but writes at the end; `rb` is read-only binary; `ab` append-only binary).

### Reading and writing methods

| Method | Action |
|---|---|
| `read()` / `read(n)` | Whole file / at most `n` characters (bytes in binary mode) as one string; `''` at end of file |
| `readline()` | One line **including** its `\n`; `''` at end of file |
| `readlines()` | A **list** of all remaining lines, each with its `\n` |
| `write(s)` | Writes string `s`, returns the number of characters written; **adds no newline** |
| `writelines(list)` | Writes each string of an iterable; **adds no newlines** |
| `tell()` | Current position of the file pointer (from the start) |
| `seek(offset, whence=0)` | Moves the pointer; `whence` 0 = start, 1 = current, 2 = end. In text mode only offsets from the start (or `seek(0, 2)`) are allowed; binary mode allows all |
| `close()` | Closes the file and flushes buffered data. `f.closed` is then `True` |
| `flush()` | Writes buffered data to disk without closing |

Iterating `for line in f:` reads the file line by line (memory-efficient).

### The `with` statement

`with open("demo.txt") as f:` opens the file and **closes it automatically** when the block ends, even if an exception occurs. It is the recommended way to handle files.

**Output Q21 (write, append, read, seek).** What is the output of the following Python code?

```python
with open("demo.txt", "w") as f:
    n = f.write("Hello\nWorld\n")
    print("written", n)
with open("demo.txt", "a") as f:
    f.write("Python\n")
with open("demo.txt") as f:
    print(f.readline(), end="")
    print(f.readlines())
with open("demo.txt") as f:
    print(f.read(3), f.tell())
    f.seek(0)
    print(f.read(5))
```
Output:
```text
written 12
Hello
['World\n', 'Python\n']
Hel 3
Hello
```
`"Hello\nWorld\n"` has 12 characters (each `\n` counts as one).

**Output Q22 (r+ vs w+ vs a+).** What is the output of the following Python code?

```python
with open("demo.txt", "w") as f:
    f.write("Hello")
with open("demo.txt", "r+") as f:
    f.write("J")
    f.seek(0)
    print("r+ :", f.read())
with open("demo.txt", "w+") as f:
    print("w+ before write:", repr(f.read()))
    f.write("New")
    f.seek(0)
    print("w+ :", f.read())
with open("demo.txt", "a+") as f:
    print("a+ tell:", f.tell())
    f.write("!")
    f.seek(0)
    print("a+ :", f.read())
```
Output:
```text
r+ : Jello
w+ before write: ''
w+ : New
a+ tell: 3
a+ : New!
```
`r+` kept the content and overwrote only the first character. `w+` erased the file at once. `a+` started at the end (position 3) and appended.

### CSV files ⭐

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: "______ files are spreadsheet files in a text format where cell contents are separated by a character, e.g. a comma or semicolon." Answer: **Comma-Separated Values (CSV)**. ("CVS" is a misspelling distractor.)

- A CSV file is a **plain text** file: each line is one row (record); fields are separated by a **delimiter**, usually a comma (`delimiter=';'` or `'\t'` can be set). The first row is often a header. It opens in Excel or any text editor.
- Python's built-in **`csv`** module:

| Object / function | Use |
|---|---|
| `csv.writer(f)` | Writer object; `.writerow(list)` writes one row, `.writerows(list_of_lists)` writes many |
| `csv.reader(f)` | Iterator: each row is returned as a **list of strings** |
| `csv.DictReader(f)` | Each row as a **dict** keyed by the header row |
| `csv.DictWriter(f, fieldnames=[…])` | Writes dicts; `.writeheader()` writes the header row |

- Open CSV files with `newline=''` so the csv module controls line endings (otherwise blank lines can appear between rows on Windows).
- All fields read back are **strings**: convert with `int()`/`float()`.

```python
import csv
rows = [["Name", "Marks"], ["Asha", 91], ["Ravi", 78]]
with open("m.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerows(rows)
with open("m.csv", newline="") as f:
    for r in csv.reader(f):
        print(r)
with open("m.csv", newline="") as f:
    for r in csv.DictReader(f):
        print(r["Name"], r["Marks"], type(r["Marks"]))
```
Output:
```text
['Name', 'Marks']
['Asha', '91']
['Ravi', '78']
Asha 91 <class 'str'>
Ravi 78 <class 'str'>
```

### Binary files and pickle

- **Pickling** (serialization) converts a Python object into a byte stream; **unpickling** (deserialization) rebuilds it.
- `pickle.dump(obj, file)` writes; `pickle.load(file)` reads one object (raises `EOFError` at the end of the file). The file must be opened in **binary** mode (`'wb'`, `'rb'`, `'ab'`); `dump` to a text-mode file raises `TypeError`.

```python
import pickle
data = {"roll": 5, "subjects": ["CS", "Maths"]}
with open("d.dat", "wb") as f:
    pickle.dump(data, f)
with open("d.dat", "rb") as f:
    back = pickle.load(f)
print(back, back == data, back is data)
```
Output:
```text
{'roll': 5, 'subjects': ['CS', 'Maths']} True False
```

Common file errors: `FileNotFoundError` (reading a missing file), `FileExistsError` (`'x'` on an existing file), `PermissionError`, `io.UnsupportedOperation` (e.g. reading a file opened with `'w'`).

---

## 17. Pandas ⭐

Pandas (name from "panel data"; created by Wes McKinney, 2008) is the main Python library for data analysis. It is built on NumPy and imported by convention as `import pandas as pd`. Five Pandas questions appeared in a single DSSSB paper (7 Feb 2024, S2).

### Series ⭐

⭐ **Asked in DSSSB**: "a one-dimensional labelled array capable of holding any data type". Answer: **Series**.

- A Series = values + an **index** (labels). Default index: 0, 1, 2 … (a `RangeIndex`).
- Created from a list, a dict (keys become the index), a scalar or a NumPy array: `pd.Series(data, index=…)`.
- Supports vectorised arithmetic (`s * 2` acts on every element) and boolean filtering (`s[s > 5]`).

```python
import pandas as pd
s = pd.Series([10, 20, 30], index=['a', 'b', 'c'])
print(s)
print(s['b'], s.iloc[0], s.size, s.ndim)
print(pd.Series({'x': 1, 'y': 2}))
```
Output:
```text
a    10
b    20
c    30
dtype: int64
20 10 3 1
x    1
y    2
dtype: int64
```

### DataFrame ⭐

⭐ **Asked in DSSSB**: "a two-dimensional labelled data structure with columns of potentially different types". Answer: **DataFrame** (written "Data frames" in the options).

- A DataFrame has **rows** (labelled by the index) and **columns** (labelled by column names). Each column is a Series; different columns can hold different types. Think of a spreadsheet or SQL table.
- Created from a dict of lists (keys become column names), a list of dicts, a list of lists with `columns=[…]`, or a CSV file.

```python
import pandas as pd
df = pd.DataFrame({'Name': ['Asha', 'Ravi', 'Mona', 'Kiran'],
                   'Marks': [91, 78, 85, 66],
                   'City': ['Delhi', 'Agra', 'Delhi', 'Pune']})
print(df)
print(df.shape, df.ndim, df.size, list(df.columns))
print(df.head(2))
```
Output:
```text
    Name  Marks   City
0   Asha     91  Delhi
1   Ravi     78   Agra
2   Mona     85  Delhi
3  Kiran     66   Pune
(4, 3) 2 12 ['Name', 'Marks', 'City']
   Name  Marks   City
0  Asha     91  Delhi
1  Ravi     78   Agra
```

| Attribute / method | Gives |
|---|---|
| `df.shape` | `(rows, columns)` tuple |
| `df.columns` / `df.index` | Column labels / row labels |
| `df.dtypes` | Type of each column (`int64`, `float64`; text columns show `object`, or `str` in pandas 3.0) |
| `df.size`, `df.ndim` | Number of cells; 2 for a DataFrame (1 for a Series) |
| `df.head(n)` / `df.tail(n)` | First / last `n` rows (default **5**) |
| `df.info()` | Summary of columns, non-null counts, types |
| `df.describe()` | Statistics of numeric columns: count, mean, std, min, 25%, 50%, 75%, max |
| `df.T` | Transpose |
| `df.values` / `df.to_numpy()` | Data as a NumPy array |

### Selecting data: `[]`, `loc`, `iloc`

| Expression | Returns |
|---|---|
| `df['Marks']` or `df.Marks` | One column as a **Series** |
| `df[['Name', 'Marks']]` | Several columns as a **DataFrame** (note the double brackets) |
| `df[df['Marks'] > 80]` | Rows where the condition is true |
| `df.loc[row_label, col_label]` | **Label**-based; slice end is **included**: `df.loc[0:2]` gives rows 0, 1, 2 |
| `df.iloc[row_pos, col_pos]` | **Integer position**-based; slice end is **excluded**: `df.iloc[0:2]` gives rows 0, 1 |

```python
import pandas as pd
df = pd.DataFrame({'Name': ['Asha', 'Ravi', 'Mona', 'Kiran'],
                   'Marks': [91, 78, 85, 66]})
print(df.loc[1, 'Name'], df.iloc[1, 0])
print(df.loc[0:2, 'Name'].tolist(), df.iloc[0:2, 0].tolist())
print(df[df['Marks'] > 80])
```
Output:
```text
Ravi Ravi
['Asha', 'Ravi', 'Mona'] ['Asha', 'Ravi']
   Name  Marks
0  Asha     91
2  Mona     85
```

Adding a column: `df['Grade'] = [...]`. Deleting: `df.drop('Grade', axis=1)` (returns a new DataFrame) or `del df['Grade']`. Sorting: `df.sort_values('Marks', ascending=False)`.

### set_index() and reset_index() ⭐

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: the DataFrame method that "takes a column name (for a regular index) or a list of column names (for a MultiIndex) to create a new, re-indexed DataFrame". Answer: **`set_index()`**.

- `df.set_index('Name')` returns a **new** DataFrame whose index is the `Name` column (the column is removed from the data columns because `drop=True` by default). `df` itself is unchanged unless you assign the result or pass `inplace=True`.
- A list of names, `df.set_index(['City', 'Name'])`, makes a hierarchical **MultiIndex**.
- `reset_index()` does the reverse: moves the index back into a column and restores 0, 1, 2 …

```python
import pandas as pd
df = pd.DataFrame({'Name': ['Asha', 'Ravi'], 'Marks': [91, 78]})
d2 = df.set_index('Name')
print(d2)
print(d2.loc['Ravi', 'Marks'])
print(d2.reset_index().columns.tolist())
```
Output:
```text
      Marks
Name       
Asha     91
Ravi     78
78
['Name', 'Marks']
```

### Combining tables: concat, merge, join ⭐

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: "Which operation is provided in Pandas when multiple tables can be concatenated both column-wise and row-wise as in a database?" Official answer: **MERGE** (the other options were SUM, GROUP BY, SELECT). Know all three tools:

| Function | What it does | Key parameters |
|---|---|---|
| `pd.concat([df1, df2])` | **Stacks** objects along an axis: `axis=0` (default) adds **rows** (one below the other); `axis=1` adds **columns** (side by side) | `axis`, `ignore_index=True` renumbers the index, `join='outer'`/`'inner'` |
| `pd.merge(left, right, on='key')` | **Database-style join** on common column(s) | `how='inner'` (default), `'left'`, `'right'`, `'outer'`; `on`, `left_on`, `right_on` |
| `left.join(right)` | Joins on the **index** (by default a **left** join) | `how`, `on`, `lsuffix`/`rsuffix` |

`DataFrame.append()` was removed in pandas 2.0; use `pd.concat()` instead.

**Output Q23 (concat row-wise and column-wise).** What is the output of the following Python code?

```python
import pandas as pd
a = pd.DataFrame({'id': [1, 2], 'x': ['p', 'q']})
b = pd.DataFrame({'id': [3, 4], 'x': ['r', 's']})
print(pd.concat([a, b]))
print(pd.concat([a, b], ignore_index=True).index.tolist())
print(pd.concat([a, b]).shape, pd.concat([a, b], axis=1).shape)
```
Output:
```text
   id  x
0   1  p
1   2  q
0   3  r
1   4  s
[0, 1, 2, 3]
(4, 2) (2, 4)
```
Without `ignore_index=True` the original row labels (0, 1, 0, 1) are kept.

**Output Q24 (merge).** What is the output of the following Python code?

```python
import pandas as pd
emp = pd.DataFrame({'eid': [1, 2, 3], 'name': ['A', 'B', 'C']})
sal = pd.DataFrame({'eid': [2, 3, 4], 'pay': [500, 600, 700]})
print(pd.merge(emp, sal, on='eid'))
print(pd.merge(emp, sal, on='eid', how='left'))
```
Output:
```text
   eid name  pay
0    2    B  500
1    3    C  600
   eid name    pay
0    1    A    NaN
1    2    B  500.0
2    3    C  600.0
```
The default inner join keeps only matching keys (2, 3). The left join keeps every row of `emp`; the missing `pay` becomes `NaN`, which turns the column into `float64`.

### Files, missing data, grouping

- `pd.read_csv('file.csv')` reads a CSV into a DataFrame (the first row becomes the column names; `sep=`, `header=`, `index_col=`, `usecols=`, `nrows=` are common parameters). `df.to_csv('file.csv', index=False)` writes one (by default the index is also written). Similar: `read_excel`/`to_excel`, `read_json`, `read_sql`.
- Missing values appear as **`NaN`** (Not a Number). `df.isnull()` / `df.isna()` gives True/False for each cell; `df.isnull().sum()` counts per column; `df.fillna(0)` replaces missing values; `df.dropna()` drops rows that contain any missing value (`axis=1` drops columns).
- Aggregates: `sum()`, `mean()`, `median()`, `min()`, `max()`, `count()` (non-null values), `std()`.
- `groupby` splits rows into groups, applies a function and combines the results:

```python
import pandas as pd
df = pd.DataFrame({'City': ['Delhi', 'Agra', 'Delhi', 'Pune'],
                   'Marks': [91, 78, 85, 66]})
print(df.groupby('City')['Marks'].mean())
```
Output:
```text
City
Agra     78.0
Delhi    88.0
Pune     66.0
Name: Marks, dtype: float64
```

---

## 18. NumPy and Matplotlib (one look)

- **NumPy array vs list**: a NumPy `ndarray` holds elements of **one type** in contiguous memory and supports fast **element-wise** (vectorised) maths, so `np.array([1, 2, 3]) * 2` gives `[2 4 6]`. A Python list can mix types, and `[1, 2, 3] * 2` **repeats** it: `[1, 2, 3, 1, 2, 3]`.
- **Matplotlib** (`import matplotlib.pyplot as plt`) draws charts: `plt.plot()` line, `plt.bar()` bar, `plt.hist()` histogram, `plt.pie()`, `plt.scatter()`, then `plt.show()`.

---

## Exam traps

1. **`#` is the only comment symbol.** `//` is floor division in Python; triple-quoted strings are string literals/docstrings, not true comments.
2. **Identifiers**: underscore allowed, no digit at the start, no keywords, **no length limit**. `print`, `list`, `input` are built-ins, not keywords.
3. **`ord()`** = character → integer; **`chr()`** = integer → character. `int('A')` is a `ValueError`, not 65.
4. **`max()` of a string** compares Unicode codes: small letters beat capitals (`max("Python")` is `'y'`, `min("Python")` is `'P'`).
5. **`strip()`** removes whitespace at **both ends** only, never in the middle; `split()` returns a **list**; `capitalize()` lowercases the rest of the string, `title()` capitalises every word.
6. **In-place list methods return `None`**: `L = L.sort()` or `print(L.append(4))` gives `None`. `append` adds one element (even a list); `extend` adds each element.
7. **`(5)` is an int; `(5,)` is a tuple.** A printed tuple shows parentheses and quoted strings: `('Example', 1, 'Tuple')`.
8. **Dict keys unique and immutable; values any type and repeatable.** A list cannot be a key; a tuple can. `1`, `1.0` and `True` are the same key.
9. **`-7 // 2` is −4** (floor, not truncation); `/` always returns a float (`6 / 2` is `3.0`); `2 ** 3 ** 2` is 512; `-2 ** 2` is −4.
10. **Loop `else`** runs when the loop is **not** ended by `break`.
11. **`r+` keeps content, pointer at start; `w+` truncates; `a`/`a+` always write at the end; `r` and `r+` need an existing file.** `.csv`, `.py`, `.txt` are text files; pickle needs binary mode.
12. **Pandas**: Series = 1-D, DataFrame = 2-D; `set_index()` (not `index()`) re-indexes by a column; `concat` axis=0 stacks rows, axis=1 adds columns; `merge` default is an **inner** join; `loc` slices include the end, `iloc` slices exclude it.

## One-liners for revision

1. Python was created by Guido van Rossum and first released in 1991.
2. Python is interpreted, dynamically typed, strongly typed and case-sensitive.
3. Interactive mode uses the `>>>` prompt; script mode runs a saved `.py` file.
4. Blocks are marked by indentation; bad indentation raises `IndentationError`.
5. A comment starts with `#`; Python has no multi-line comment syntax.
6. A docstring is the first string in a function/class/module, stored in `__doc__`.
7. Identifiers: letters, digits, underscore; cannot start with a digit; no keywords; any length.
8. Python 3.14 has 35 keywords; only `True`, `False`, `None` are capitalised.
9. `type()` gives an object's class; `id()` gives its identity.
10. Immutable: int, float, bool, str, tuple, frozenset. Mutable: list, dict, set.
11. `ord('A')` is 65, `ord('a')` is 97, `ord('0')` is 48; `chr(65)` is `'A'`.
12. `hex()`, `oct()`, `bin()` return strings with prefixes `0x`, `0o`, `0b`.
13. `int(3.99)` is 3; `int('101', 2)` is 5; `bool('False')` is `True`.
14. `/` gives a float; `//` floors; `%` takes the divisor's sign; `**` is right-associative.
15. `==` compares values; `is` compares identity.
16. `input()` always returns a string.
17. `print()` defaults: `sep=' '`, `end='\n'`.
18. `range(start, stop, step)` excludes `stop`.
19. `break` exits a loop, `continue` skips to the next iteration, `pass` does nothing.
20. Loop `else` runs only if the loop was not broken.
21. Strings are immutable; item assignment raises `TypeError`.
22. Slicing `[start:stop:step]` excludes `stop` and never raises `IndexError`; `s[::-1]` reverses.
23. `find()` returns −1 when not found; `index()` raises `ValueError`.
24. `max()` on a string returns the character with the highest Unicode value.
25. `strip()` removes leading and trailing whitespace.
26. `append()` adds one element at the end of a list; `insert(i, x)` adds at index `i`.
27. `pop()` removes and returns the last element; `remove(x)` deletes the first `x`.
28. `sort()` sorts in place and returns `None`; `sorted()` returns a new list.
29. `b = a` makes an alias; `a[:]` or `a.copy()` makes a shallow copy.
30. A single-element tuple needs a trailing comma: `(5,)`.
31. Tuples have only two methods: `count()` and `index()`.
32. `{}` is an empty dict; `set()` is an empty set.
33. Dictionary keys are unique and immutable; values can be any type and can repeat.
34. `d.get(k)` returns `None` for a missing key; `d[k]` raises `KeyError`.
35. A function without `return` returns `None`; `return a, b` returns a tuple.
36. Default arguments are evaluated once, at definition time.
37. `ModuleNotFoundError` (a subclass of `ImportError`) means the module could not be found or is not installed.
38. `.txt`, `.py`, `.csv` are text files; `.jpg`, `.exe`, `.dat` are binary.
39. `r+` = read and write from the start without truncating; `w+` truncates; `a+` appends.
40. CSV = Comma-Separated Values; Series = 1-D labelled array; DataFrame = 2-D labelled table; `set_index()` makes columns the index; `concat`/`merge`/`join` combine tables.

## Quick self-check

1. Which symbol starts a comment in Python?
   **Answer:** `#`.
2. Is `_total2` a valid identifier? Is `2total`?
   **Answer:** `_total2` is valid; `2total` is invalid because it starts with a digit.
3. Which function converts the character `'A'` to 65?
   **Answer:** `ord()`.
4. What does `max("Delhi")` return?
   **Answer:** `'l'` (108 is the highest code among D, e, l, h, i).
5. What is printed by `print([1, 2, 3].append(4))`?
   **Answer:** `None`.
6. What is the type of `(7)` and of `(7,)`?
   **Answer:** `int` and `tuple`.
7. What does `print(("A", 2, "b"))` display?
   **Answer:** `('A', 2, 'b')`.
8. Can a list be a dictionary key?
   **Answer:** No, it is mutable (unhashable); it raises `TypeError`. A tuple of immutables can be a key.
9. What is `-9 // 4` and `-9 % 4`?
   **Answer:** `-3` and `3`.
10. Which file mode opens an existing file for reading and writing with the pointer at the start, without erasing it?
    **Answer:** `'r+'`.
11. Which Pandas structure is a two-dimensional labelled table whose columns can have different types?
    **Answer:** DataFrame.
12. Which Pandas method takes a column name or a list of column names and returns a DataFrame indexed by them?
    **Answer:** `set_index()`.
