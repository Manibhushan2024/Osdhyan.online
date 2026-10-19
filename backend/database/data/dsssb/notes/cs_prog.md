# Programming (C / C++ / Java / Python): DSSSB TGT CS Revision Notes

## 1. One-page summary

- Programming is the largest block of Section B: expect about 15-20 questions. Most of them are "What is the output?" questions with a short snippet in C, C++, Java or Python, plus a few one-line concept questions (OOP terms, keywords, library functions, file modes).
- For an output question, trace on paper: write each variable's value line by line. Never guess from the look of the code.
- The usual traps are integer division, post/pre increment, switch fall-through, the `=` versus `==` mistake, string immutability, Python list aliasing, and the order in which constructors and destructors run.
- OOP questions test the four pillars (encapsulation, abstraction, inheritance, polymorphism), constructors, overloading versus overriding, `virtual`, abstract classes and interfaces.
- Python questions are NCERT Class 11-12 style: lists, tuples, dictionaries, sets, slicing, `try/except` and file handling (modes, `read/readline/readlines`, `seek/tell`, `pickle`).
- Wrong answers cost 0.25 marks. If two options differ by a single character (`3.0` and `3.5`, `BA` and `AB`), retrace the code before you choose.

## 2. Data types and operators

| Type | C (typical 32/64-bit) | Java (fixed) |
|---|---|---|
| char | 1 byte | 2 bytes (Unicode) |
| int | 4 bytes | 4 bytes |
| long | 4 or 8 bytes | 8 bytes |
| float / double | 4 / 8 bytes | 4 / 8 bytes |
| boolean | none (C99 `_Bool`) | `true`/`false` only |

- Integer division drops the fraction: `7/2` is 3 in C, C++ and Java. `float c = 7/2;` stores 3.0. Python `7/2` gives 3.5, `7//2` gives 3, and `-7//2` gives -4 (floor).
- Post-increment `x++` uses the old value and then increments; pre-increment `++x` increments first. In Java, `int x=5; int y = x++ + ++x;` gives y = 5 + 7 = 12.
- In Java, `+` works left to right: `10 + 20 + "30"` gives `"3030"`, but `"30" + 10 + 20` gives `"301020"`.
- Python `**` is right-associative: `2**3**2` = 2^9 = 512.
- Bitwise operators: `6 & 4 = 4`, `6 | 4 = 6`, `6 ^ 4 = 2`, `x << n` = x × 2^n.

## 3. Control flow

- `continue` skips the rest of the current iteration and `break` leaves the innermost loop only.
- A `switch` without `break` falls through into every case below the matching one.
- `do-while` runs its body at least once. `for(;;)` is an infinite loop.
- C trap: `if (x = 5)` is an assignment whose value is 5, which counts as true.
- Python `for/while ... else`: the `else` block runs only when the loop ends without hitting `break`.
- `range(1, 10, 3)` gives 1, 4, 7, and the stop value is never included.

## 4. Functions and recursion

- C passes arguments by value; use pointers to change the caller's variables (the classic `swap(&x, &y)`). Java passes primitives by value and passes a copy of the reference for objects and arrays, so changes to an array's contents are visible to the caller.
- A `static` local variable in C keeps its value between calls.
- Recursion uses the call stack. With no base case you get infinite recursion and a stack overflow.
- Python: `global x` lets a function assign to a module-level name. Parameter order is `def f(a, b=2, *args, **kwargs)`. Default arguments are evaluated once, when the function is defined.
- C++ default arguments must be given from right to left: `int add(int a, int b=10, int c=20)`.

```c
int f(int n){ return n==0 ? 0 : n + f(n-1); }   /* f(4) = 10 */
```

## 5. Pointers and arrays (C)

| Expression | Meaning |
|---|---|
| `a[i]` | `*(a + i)` |
| `p + 1` | address + sizeof(*p) (int*: +4 bytes) |
| `p - q` | number of elements between them |
| `*p++` | value at p, then move p forward |
| `**q` | value reached through a pointer to a pointer |

- `sizeof(a)/sizeof(a[0])` gives the number of elements, but only where the array itself is in scope, not on a pointer.
- `char s[] = "hello";` has sizeof 6 (the `'\0'` counts) and strlen 5.
- Uninitialised elements of a partly initialised array are 0: `int a[5] = {1,2,3};` gives a[3] = a[4] = 0.
- `malloc` leaves memory uninitialised, `calloc` fills it with zeros, `realloc` resizes, `free` releases. Dereferencing NULL is undefined behaviour (usually a segmentation fault). A pointer to memory that has been freed is a dangling pointer.

## 6. Strings

| Task | C | C++ | Java | Python |
|---|---|---|---|---|
| length | `strlen(s)` | `s.length()` | `s.length()` | `len(s)` |
| copy | `strcpy(d,s)` | `d = s` | `d = s` (reference) | `d = s` |
| join | `strcat(d,s)` | `d + s` | `d.concat(s)` / `+` | `d + s` |
| compare | `strcmp` (<0, 0, >0) | `==` | `equals()` | `==` |
| reverse | loop | `reverse()` | `StringBuilder.reverse()` | `s[::-1]` |

- Java `String` and Python `str` are immutable. `s.concat("x");` without assigning the result leaves `s` unchanged, and `s[0] = "H"` in Python raises TypeError.
- In Java, `==` compares references; string literals and compile-time constants share the string pool, but `new String("Hello")` creates a separate object.

## 7. OOP: classes, objects and constructors

- A constructor has the class name and no return type. It runs automatically and is not inherited. It can be overloaded, and `this(...)` in Java chains to another constructor (it must be the first statement).
- Destructors (C++) run in reverse order of construction, as soon as an object goes out of scope.
- C++ class members are `private` by default; `struct` members are `public`.
- Copy constructor: `A b = a;`, `A b(a);` and pass-by-value use it, but `b = a;` between two existing objects uses the assignment operator.
- `static` data is shared by all objects. In Python, `self.total += 1` creates an instance attribute, so to change the shared value you must write `Counter.total += 1`.

## 8. Inheritance, overloading and overriding

| | Overloading | Overriding |
|---|---|---|
| Where | same class | base and derived class |
| Signature | different parameter list | same signature |
| Bound | compile time | run time |
| Polymorphism | static | dynamic |

- Order: base constructor first, then derived; destructors in reverse (`B D ~D ~B`).
- Java supports single class inheritance with `extends`, and multiple inheritance of type only through `implements` with interfaces. `final` stops a method from being overridden or a class from being extended.
- In C++ protected inheritance, the base's public and protected members become protected.
- Java overload resolution prefers an exact match, then widening (byte → int → long → float → double).
- Python has no signature-based overloading: a second `def` with the same name replaces the first.

## 9. Polymorphism and virtual functions

```cpp
class Shape { public: void name(){cout<<"Shape";} virtual void draw(){cout<<"S";} };
class Circle: public Shape { public: void name(){cout<<"Circle";} void draw(){cout<<"C";} };
Shape *s = new Circle; s->name(); s->draw();   // Shape C
```

- Non-virtual calls are bound by the pointer type and virtual calls by the object type. This works through the vtable and vptr.
- A pure virtual function, `virtual void f() = 0;`, makes the class abstract.
- A base class that will be used polymorphically needs a virtual destructor, or `delete basePtr` skips the derived destructor.
- Java methods are virtual by default. Static methods are hidden, not overridden, and fields are never overridden, so `obj.s()` and `obj.field` follow the reference type.
- These C++ operators cannot be overloaded: `::`, `.`, `.*`, `?:`, `sizeof`.

## 10. Abstraction, encapsulation and interfaces

- Encapsulation means bundling data with its methods and hiding the data (`private` plus getters and setters). Abstraction means showing only the essential features (abstract classes and interfaces).
- Java interface fields are implicitly `public static final`, and its methods are `public abstract`. `default` and `static` methods with a body are allowed from Java 8.
- An abstract class can have constructors, fields and concrete methods but cannot be instantiated, although a reference of its type is allowed.
- A C++ `friend` function is not a member but can access private members. Friendship is not inherited.
- Python has `_x` (protected only by convention) and `__x` (name-mangled to `_ClassName__x`). With `abc.ABC` and `@abstractmethod`, instantiating an incomplete subclass raises TypeError.

## 11. Exception handling

| Language | Keywords |
|---|---|
| C++ | `try`, `throw`, `catch(type)`, `catch(...)` |
| Java | `try`, `catch`, `finally`, `throw`, `throws` |
| Python | `try`, `except`, `else`, `finally`, `raise` |

- `finally` (Java/Python) always runs, even after a `return`. Java saves the returned value before `finally` runs, so changing the variable in `finally` does not change what is returned.
- Java checked exceptions (IOException, SQLException) must be caught or declared with `throws`. Unchecked ones (ArithmeticException, NullPointerException, ArrayIndexOutOfBoundsException) are subclasses of RuntimeException.
- Catch blocks go from most specific to most general. A subclass catch placed after `catch(Exception e)` is a compile-time error.
- In Python, the `else` block runs only if the `try` raised nothing. Common exceptions: ZeroDivisionError, ValueError (`int("12a")`), KeyError, IndexError, TypeError, FileNotFoundError.

## 12. Python lists, tuples, dictionaries and sets

| | list | tuple | dict | set |
|---|---|---|---|---|
| Syntax | `[1,2]` | `(1,2)` / `(1,)` | `{'a':1}` | `{1,2}` / `set()` |
| Mutable | yes | no | yes | yes |
| Ordered | yes | yes | insertion order (3.7+) | no |
| Duplicates | yes | yes | keys no | no |

- Slicing `s[start:stop:step]` excludes stop. A negative step walks backwards: `L[::-1]` reverses. Slicing never raises IndexError.
- `b = a` creates an alias, while `a[:]` or `a.copy()` makes a shallow copy. `[[0]*2]*3` repeats one inner list three times.
- `append(x)` adds one element and `extend(it)` adds each element. `sort()` returns None, while `sorted()` returns a new list.
- `{}` is an empty dict, not a set. `d.get(k, default)` never raises. Keys must be hashable, so a list cannot be a key.
- Set operators: `&` intersection, `|` union, `-` difference, `^` symmetric difference.

## 13. Python file handling

| Mode | Purpose | File missing | Existing data |
|---|---|---|---|
| `r` | read | error | kept |
| `w` | write | created | erased |
| `a` | append | created | kept, writes go to the end |
| `r+` | read and write | error | kept, overwritten from the start |
| `w+` | write and read | created | erased |
| `a+` | append and read | created | kept |
| `x` | exclusive create | created | error if the file exists |

- `read()` returns the whole file as a string, `readline()` returns one line including `'\n'`, and `readlines()` returns a list of lines. `writelines()` adds no newlines of its own.
- `seek(n)` moves the file pointer and `tell()` reports its position. Using `with open(...) as f:` closes the file automatically.
- Binary files use `pickle.dump(obj, f)` and `pickle.load(f)` with `'wb'` and `'rb'`. CSV files use `csv.writer(f).writerow(...)` and `csv.reader(f)`.

## 14. Frequently asked in DSSSB

- Output of `printf` or `cout` with `++`/`--`, integer division and `%`.
- Switch fall-through, and `break` versus `continue` in nested loops.
- Recursive functions: factorial, Fibonacci, sum of digits, GCD, and counting the calls.
- Pointer arithmetic, `*(a+i)`, `sizeof` of arrays and strings, and `calloc` versus `malloc`.
- String library functions (`strcpy`, `strcat`, `strcmp`, `strlen`) and Java `==` versus `equals()`.
- OOP definitions: encapsulation, abstraction, the types of inheritance, constructors and destructors.
- Overloading versus overriding, `virtual` and pure virtual functions, abstract classes and interfaces.
- Java checked versus unchecked exceptions, `throw` versus `throws`, `finally`.
- Python mutable versus immutable types, slicing, list methods, dictionary methods and file modes.

## 15. Fifteen one-liners

1. A C string ends with the null character `'\0'`.
2. `sizeof(char)` is always 1 in C.
3. In Java, `char` takes 2 bytes and `long` takes 8 bytes.
4. The `%` operator is not defined for float operands in C. Use `fmod()`.
5. Arrays in C are indexed from 0, and the array name is the address of its first element.
6. `calloc` initialises memory to zero, while `malloc` does not.
7. A constructor has no return type, not even `void`.
8. Destructors run in the reverse order of construction.
9. Function overloading gives compile-time polymorphism. Virtual functions give run-time polymorphism.
10. An abstract class cannot be instantiated.
11. A Java class can extend one class but implement many interfaces.
12. Interface fields are `public static final`.
13. `IOException` is a checked exception, while `ArithmeticException` is unchecked.
14. Python tuples, strings and frozensets are immutable. Lists, dictionaries and sets are mutable.
15. File mode `'w'` erases an existing file, while `'a'` keeps the old contents and appends.

## 16. Five traps

1. **`float c = 7/2;`** stores 3.0, not 3.5. The division is done in integers before the result is converted. Write `7.0/2`.
2. **Java `s.toUpperCase();` without assignment** does not change `s`, because strings are immutable. The same is true of `concat`, `replace` and `trim`.
3. **Python `b = a` for lists** creates an alias, so a change made through either name shows in both. `[[0]*n]*m` has the same problem with its rows.
4. **The return value from `finally`:** in Java, `try { x = 20; return x; } finally { x = 30; }` returns 20. However, a `return` written inside `finally` replaces any earlier return value.
5. **A non-virtual function called through a base pointer** runs the base version, even when the object belongs to the derived class. Only `virtual` (C++), or the default behaviour of Java instance methods, gives dynamic dispatch. Static methods and fields follow the reference type.
