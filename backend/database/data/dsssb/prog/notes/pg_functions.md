# Functions & Recursion

**In 30 seconds**

- A **prototype** (declaration) tells the compiler a function's name, return type and parameter types; the **definition** holds the body; the **call** runs it. Parameters in the definition are **formal**; values in the call are **actual** arguments.
- C has only **call by value**; "call by reference" in C is simulated by passing **addresses (pointers)**. C++ adds true references (`int &a`). **Java is always pass by value** (for objects, the *reference* is copied). Python passes **object references**: a mutable argument (list) can be changed inside, an immutable one (int, str, tuple) cannot.
- ⭐ **Inline functions** (C++) cut call overhead for **small** functions; `inline` is a **request**, which the compiler may ignore.
- ⭐ **Variadic functions** in C use **`<stdarg.h>`**: `va_list`, `va_start`, `va_arg`, `va_end`. `printf` and `scanf` are variadic. Java uses `int... nums`; Python uses `*args` and `**kwargs`.
- **Overloading** (same name, different parameter list) exists in C++ and Java, **not in C**, and **not in Python** (a later `def` replaces the earlier one). **Default arguments** exist in C++ and Python, not in C or Java.
- A `static` local variable in C is initialised **once** and keeps its value between calls. Python looks names up in **LEGB** order (Local, Enclosing, Global, Built-in).
- Recursion needs a **base case** and a **recursive case**; each call gets its own **stack frame**; no base case means **stack overflow**. Naive `fib(n)` makes **2·fib(n+1) − 1** calls (fib(5) → 15 calls).
- Statements **before** the recursive call run on the way **down**; statements **after** it run on the way **up** (reverse order).

---

## 1. Declaration, definition and call

```c
#include <stdio.h>

int add(int, int);           /* prototype (declaration): names are optional */

int main(void) {
    int s = add(3, 4);       /* call: 3 and 4 are ACTUAL arguments */
    printf("%d\n", s);       /* prints 7 */
    return 0;
}

int add(int a, int b) {      /* definition: a and b are FORMAL parameters */
    return a + b;
}
```

| Term | Meaning |
|---|---|
| **Prototype / declaration** | `return-type name(parameter types);` ends with a semicolon, no body. Lets the compiler check the number and types of arguments. |
| **Definition** | Header + body `{ ... }`. Memory for the code is allotted here. Exactly one definition per function. |
| **Call** | `name(arguments)`. Control jumps to the function and comes back to the next statement. |
| **Formal parameters** | Variables in the function header. They behave like local variables of the function. |
| **Actual parameters (arguments)** | Expressions written in the call. Their values are given to the formal parameters. |
| **Return type** | Type of the value sent back by `return`. A function returns **at most one value** directly. |
| **`void`** | As return type: returns nothing (`return;` is allowed, `return 5;` is an error). As parameter list `f(void)`: takes no arguments. |

Points worth knowing:

- A prototype is needed when a function is called **before** its definition. Old C (C89) assumed an undeclared function returned `int`; C99 removed this "implicit int" rule. The PYQ form `main()` with no return type is this old style.
- In C (before C23) `int f();` means "parameters not specified", while `int f(void);` means "no parameters". In C++ both mean "no parameters".
- C does not allow a function to be defined inside another function (nested functions are only a GCC extension). In Java every method must be inside a class.
- In C, `main` may call itself recursively; in C++ calling `main` is not allowed.
- To "return" several values: C uses pointer parameters or a `struct`; Python returns a **tuple** (`return a, b`).

---

## 2. Parameter passing

### 2.1 C: call by value, and "call by address"

```c
#include <stdio.h>
void swapv(int a, int b)   { int t = a;  a = b;   b = t; }   /* copies */
void swapp(int *a, int *b) { int t = *a; *a = *b; *b = t; }  /* addresses */

int main(void) {
    int x = 10, y = 20;
    swapv(x, y);
    printf("%d %d\n", x, y);   /* 10 20 : only the copies were swapped */
    swapp(&x, &y);
    printf("%d %d\n", x, y);   /* 20 10 : the originals were swapped */
    return 0;
}
```

Strictly, C has **only call by value**: in `swapp` the *addresses* are copied, and the function changes the variables through those addresses. Textbooks call this **call by reference** or **call by address**. Arrays always behave this way, because an array argument is passed as a pointer to its first element.

### 2.2 C++: true references

```cpp
#include <iostream>
using namespace std;
void swapr(int &a, int &b) { int t = a; a = b; b = t; }  // a, b are aliases
int main() {
    int x = 1, y = 2;
    swapr(x, y);            // no & at the call
    cout << x << " " << y;  // 2 1
}
```

A reference is another name for an existing variable; it must be initialised and cannot be re-seated. `const int &` passes large objects cheaply without allowing changes.

### 2.3 Java: always pass by value

Java copies every argument. For a primitive, the value is copied. For an object, the **reference value** is copied, so the method can change the object's fields but cannot make the caller's variable point to a new object. Verified output:

```java
public class PassDemo {
    static class Box { int value; Box(int v) { value = v; } }
    static void swap(int a, int b) { int t = a; a = b; b = t; }
    static void modify(Box b)   { b.value = 99; }               // changes the shared object
    static void reassign(Box b) { b = new Box(-1); b.value = 50; } // changes only the copy
    static void addOne(int[] arr) { arr[0]++; }
    static void change(String s) { s = s + " there"; }

    public static void main(String[] args) {
        int x = 1, y = 2;
        swap(x, y);
        System.out.println(x + " " + y);   // 1 2
        Box bx = new Box(10);
        modify(bx);
        System.out.println(bx.value);      // 99
        reassign(bx);
        System.out.println(bx.value);      // 99 (not 50)
        int[] a = {5, 6};
        addOne(a);
        System.out.println(a[0]);          // 6
        String s = "Hi";
        change(s);
        System.out.println(s);             // Hi (String is immutable)
    }
}
```

### 2.4 Python: pass by object reference

```python
def change(n, lst):
    n = n + 10        # rebinds local name n; caller's int unchanged
    lst.append(4)     # mutates the shared list object

x = 5
nums = [1, 2, 3]
change(x, nums)
print(x, nums)        # 5 [1, 2, 3, 4]

def rebind(lst):
    lst = [9, 9]      # new object, local name only
    print("inside:", lst)

data = [1, 2]
rebind(data)          # inside: [9, 9]
print("outside:", data)   # outside: [1, 2]
```

Rule: **mutating** a mutable argument (`append`, `lst[0] = ...`, `d[k] = ...`) is seen by the caller; **assigning** a new object to the parameter name is not.

| Language | Mechanism | Can the function change the caller's variable? |
|---|---|---|
| C | Call by value (pointers simulate reference) | Only through a pointer |
| C++ | Value, pointer, or reference (`&`) | Yes, with a reference or pointer |
| Java | Always by value (object references copied) | Object's fields yes; the variable itself no |
| Python | Object reference ("call by sharing") | Mutable objects can be mutated; rebinding not seen |

---

## 3. Default arguments

**C++**: defaults must be given from the **rightmost** parameter leftwards, normally in the declaration only.

```cpp
#include <iostream>
using namespace std;
int volume(int l, int b = 2, int h = 3) { return l * b * h; }
int main() {
    cout << volume(4) << " " << volume(4, 5) << " " << volume(4, 5, 6);
}
// Output: 24 60 120    (4*2*3, 4*5*3, 4*5*6)
```

`int f(int a = 1, int b);` is a **compile error** (a default followed by a non-default). Arguments fill parameters from the left; you cannot skip a middle one.

**Python**: same left-to-right rule (`def f(a=1, b)` is a `SyntaxError`), plus keyword arguments:

```python
def greet(name, msg="Hello"):
    print(msg, name)

greet("Asha")                       # Hello Asha
greet("Ravi", "Hi")                 # Hi Ravi
greet(msg="Namaste", name="Meena")  # Namaste Meena
```

Trap: a default value is evaluated **once**, when the `def` runs. A mutable default is shared across calls:

```python
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add_item(1))   # [1]
print(add_item(2))   # [1, 2]   (same list reused)
```

C and Java have **no default arguments** (Java uses overloading instead).

---

## 4. Function overloading

Same name, **different parameter list** (number, type or order of parameters). The compiler picks the version at **compile time** (static / compile-time polymorphism). The **return type alone cannot** distinguish overloads.

```java
static int add(int a, int b)          { return a + b; }
static double add(double a, double b) { return a + b; }
static int add(int a, int b, int c)   { return a + b + c; }
// add(2, 3) -> 5     add(2.0, 3) -> 5.0     add(1, 2, 3) -> 6   (verified)
```

- **C**: not allowed (two functions with one name is an error). C++ supports it through **name mangling**.
- **Java** resolution order: exact match, then widening (`int` to `long`), then boxing (`int` to `Integer`), then varargs. With `p(long)`, `p(Integer)` and `p(int...)` all present, `p(5)` calls `p(long)` (verified).
- **Python**: no overloading. A second `def area(l, b)` replaces the first `def area(r)`; then `area(2)` raises `TypeError: area() missing 1 required positional argument: 'b'` (verified). Use default arguments or `*args` instead.

---

## 5. ⭐ Inline functions (C++) and macros

⭐ **Asked in DSSSB (25 Jun 2023, S1)**: "C++ provides inline functions to facilitate a reduced function call overhead mainly for ______." Answer: **small functions**.

```cpp
inline int square(int x) { return x * x; }
// square(5) is expanded at the call site, like writing 5 * 5
```

- **Purpose**: avoid the cost of a call (pushing arguments, jumping, saving registers, returning) by **copying the body to the call site**.
- **Request, not command**: the compiler may ignore `inline`. Textbooks (Balagurusamy) list cases where the request is commonly refused: functions containing **loops, `switch` or `goto`**; functions with **static** variables; **recursive** functions; very **large** functions. If the function's **address** is taken (function pointer), a normal copy must also exist.
- **Cost**: larger executable (code bloat); every file using it must be recompiled when it changes.
- A member function **defined inside the class body** is implicitly inline.
- C99 also has the `inline` keyword.

**Macros vs inline functions**

| | Macro (`#define`) | Inline function |
|---|---|---|
| Handled by | Preprocessor (text substitution) | Compiler |
| Type checking | None | Full |
| Arguments evaluated | Each time they appear in the text | Exactly once |
| Debugging, scope | Hard; no scope | Normal function rules |

```c
#include <stdio.h>
#define SQUARE(x) x * x
#define SQ(x) ((x) * (x))
int main(void) {
    printf("%d %d\n", SQUARE(2 + 3), SQ(2 + 3));   /* 11 25 */
    printf("%d %d\n", 100 / SQUARE(5), 100 / SQ(5)); /* 100 4 */
    return 0;
}
```

Trace: `SQUARE(2 + 3)` becomes `2 + 3 * 2 + 3` = 2 + 6 + 3 = **11**. `100 / SQUARE(5)` becomes `100 / 5 * 5` = 20 * 5 = **100**. With full brackets, `SQ(2 + 3)` = 25 and `100 / SQ(5)` = 100 / 25 = 4. Also, `SQ(i++)` would increment `i` twice in one expression (undefined behaviour), which an inline function avoids.

---

## 6. ⭐ Variadic functions (variable number of arguments)

⭐ **Asked in DSSSB (25 Jun 2023, S2)**: "In C, variable list arguments are denoted by the standard header:" The correct header is **`<stdarg.h>`** (the official key showed `<stdio.h>`, which is doubtful; `<stdio.h>` only *declares* variadic functions such as `printf`).

```c
#include <stdio.h>
#include <stdarg.h>

int sum(int count, ...) {           /* ... = "any number of further arguments" */
    va_list ap;                     /* holds the position in the argument list */
    int total = 0;
    va_start(ap, count);            /* start after the last named parameter */
    for (int i = 0; i < count; i++)
        total += va_arg(ap, int);   /* fetch next argument as an int */
    va_end(ap);                     /* clean up */
    return total;
}

int main(void) {
    printf("%d %d\n", sum(3, 10, 20, 30), sum(0));   /* 60 0 */
    return 0;
}
```

| Item | Role |
|---|---|
| `va_list` | Type of the object that walks through the extra arguments |
| `va_start(ap, last)` | Initialises `ap`; `last` is the last **named** parameter |
| `va_arg(ap, type)` | Returns the next argument, converted as `type` |
| `va_end(ap)` | Ends processing; must be called before returning |
| `va_copy(dst, src)` | (C99) copies a `va_list` |

- The function itself cannot know how many arguments came; it needs a count or a format string. `printf` is declared as `int printf(const char *format, ...);` and counts `%` specifiers. `scanf` is also variadic.
- At least one named parameter must come before `...` (C99/C11).
- Extra arguments undergo default promotions: `char`/`short` become `int`, `float` becomes `double`. So write `va_arg(ap, double)`, never `va_arg(ap, float)`.

**Java varargs** (verified):

```java
static int sum(int... nums) {          // nums is an int[]
    int total = 0;
    for (int n : nums) total += n;
    return total;
}
// sum() -> 0   sum(4) -> 4   sum(1, 2, 3) -> 6   sum(new int[]{10, 20}) -> 30
```

Rules: only **one** varargs parameter, and it must be **last** (`void show(String label, int... nums)` is fine). ⭐ **Asked in DSSSB (25 Jun 2023, S2)**: `static public void main(String... abcd){}` is a **valid** main header: modifier order is free, the parameter name is free, and `String...` is accepted for `String[]`.

**Python** (verified):

```python
def show(*args, **kwargs):
    print(type(args).__name__, args)
    print(type(kwargs).__name__, kwargs)

show(1, 2, 3, a=4, b=5)
# tuple (1, 2, 3)
# dict {'a': 4, 'b': 5}
```

`*args` collects extra positional arguments into a **tuple**; `**kwargs` collects extra keyword arguments into a **dict**.

---

## 7. Scope, lifetime and storage classes

**Scope** = where a name can be used. **Lifetime** = how long the variable exists in memory.

⭐ **Asked in DSSSB (25 Jun 2023, S1)**: which is NOT a storage class in C? **Intern** (the four are `auto`, `register`, `static`, `extern`).

| Storage class | Stored in | Default initial value | Scope | Lifetime |
|---|---|---|---|---|
| `auto` (default for locals) | Stack | Garbage | Block | Until block ends |
| `register` | CPU register if possible | Garbage | Block | Until block ends; `&` not allowed |
| `static` (local) | Data segment | 0 | Block | Whole program run |
| `static` (global) | Data segment | 0 | That file only | Whole program run |
| `extern` | Data segment | 0 | Global, across files | Whole program run |

```c
#include <stdio.h>
void counter(void) {
    static int s = 0;   /* initialised once only */
    int a = 0;          /* created afresh on every call */
    s++; a++;
    printf("%d %d\n", s, a);
}
int main(void) { counter(); counter(); counter(); return 0; }
/* Output:
1 1
2 1
3 1 */
```

A local variable with the same name as a global **hides** (shadows) the global inside that block.

**Python LEGB** (verified):

```python
x = "global"
def outer():
    x = "enclosing"
    def inner():
        print(x)      # not local -> found in Enclosing
    inner()
outer()               # enclosing
print(x)              # global

count = 0
def inc():
    global count      # refer to the module-level name
    count += 1
inc(); inc()
print(count)          # 2

def counter():
    c = 0
    def step():
        nonlocal c    # refer to the enclosing function's c
        c += 1
        return c
    step(); step()
    return step()
print(counter())      # 3
```

Trap: assigning to a name anywhere in a function makes it **local** for the whole function. `total_marks += 5` inside a function, without `global`, raises **`UnboundLocalError`**.

---

## 8. Recursion

A function that calls itself is **recursive**.

- **Base case**: the condition that stops the recursion (returns without calling again).
- **Recursive case**: the call on a **smaller** problem that moves towards the base case.
- **Call stack**: every call pushes a new **stack frame (activation record)** holding its parameters, locals and return address. Frames are popped in **LIFO** order.
- **Stack overflow**: no base case, or a base case never reached, keeps pushing frames until the stack is full. C crashes (segmentation fault); Java throws **`StackOverflowError`** (an `Error`, not an `Exception`, verified); Python raises **`RecursionError`** (default limit **1000**, verified).
- **Direct** recursion: `f` calls `f`. **Indirect (mutual)** recursion: `f` calls `g`, `g` calls `f`.
- **Linear** recursion makes one call per activation; **tree** recursion makes two or more (Fibonacci).
- **Tail recursion**: the recursive call is the **last** action, with nothing left to do after it returns. Compilers such as GCC (with optimisation) can turn it into a loop (tail-call optimisation). Java and Python do not do this.

```c
int fact(int n)            { return (n <= 1) ? 1 : n * fact(n - 1); }  /* NOT tail: * after call */
int factT(int n, int acc)  { return (n <= 1) ? acc : factT(n - 1, n * acc); } /* tail */
```

### Tracing technique

1. Write each call on a new line, indented, with its argument values ("winding" phase).
2. Stop at the base case and write its value.
3. Return upward, substituting each value into the line above ("unwinding" phase).
4. For `printf` statements: those **before** the call print on the way down; those **after** print on the way up.
5. For counting calls, draw the call tree and count nodes.

All eight traces below were checked by running equivalent Python code.

**Trace 1 — factorial**

```c
int fact(int n) { if (n <= 1) return 1; return n * fact(n - 1); }
/* printf("%d", fact(4)); */
```

```text
fact(4) = 4 * fact(3)
          fact(3) = 3 * fact(2)
                    fact(2) = 2 * fact(1)
                              fact(1) = 1        (base case)
                    fact(2) = 2 * 1 = 2
          fact(3) = 3 * 2 = 6
fact(4) = 4 * 6 = 24
```

Output: **24**. Calls made: 4.

**Trace 2 — Fibonacci call count**

```c
int fib(int n) { if (n <= 1) return n; return fib(n - 1) + fib(n - 2); }
```

Let C(n) be the number of calls: C(0) = C(1) = 1, and C(n) = C(n−1) + C(n−2) + 1.

| n | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| fib(n) | 0 | 1 | 1 | 2 | 3 | 5 | 8 | 13 |
| calls C(n) | 1 | 1 | 3 | 5 | 9 | 15 | 25 | 41 |

`fib(5)` returns **5** after **15** calls. Shortcut: C(n) = 2·fib(n+1) − 1 (for n = 5: 2·8 − 1 = 15). `fib(3)` alone is computed 2 times inside `fib(5)`; this repetition makes the time **exponential**.

**Trace 3 — sum of digits**

```c
int sod(int n) { if (n == 0) return 0; return n % 10 + sod(n / 10); }
/* sod(1234) */
```

```text
sod(1234) = 4 + sod(123)
sod(123)  = 3 + sod(12)
sod(12)   = 2 + sod(1)
sod(1)    = 1 + sod(0)
sod(0)    = 0
=> 1, then 3, then 6, then 10
```

Output: **10**.

**Trace 4 — power**

```c
int power(int b, int e) { if (e == 0) return 1; return b * power(b, e - 1); }
/* power(2, 5) */
```

power(2,5) = 2·power(2,4) = 2·2·power(2,3) = … = 2·2·2·2·2·power(2,0) = 32·1. Output: **32**. Calls: e = 5, 4, 3, 2, 1, 0, so **6** calls (e + 1).

**Trace 5 — reverse a number (print before the call)**

```c
void rev(int n) { if (n == 0) return; printf("%d", n % 10); rev(n / 10); }
/* rev(1234); */
```

| Call | prints | next call |
|---|---|---|
| rev(1234) | 4 | rev(123) |
| rev(123) | 3 | rev(12) |
| rev(12) | 2 | rev(1) |
| rev(1) | 1 | rev(0) → returns |

Output: **4321**.

**Trace 6 — printing before and after the call**

```c
void f(int n) {
    if (n > 0) {
        printf("%d ", n);   /* runs while going down */
        f(n - 1);
        printf("%d ", n);   /* runs while coming back up */
    }
}
/* f(3); */
```

Going down prints 3, 2, 1. f(0) does nothing. Coming up, f(1) prints 1, then f(2) prints 2, then f(3) prints 3. Output: **`3 2 1 1 2 3`**.

**Trace 7 — two recursive calls**

```c
void g(int n) {
    if (n <= 0) return;
    g(n - 1);
    printf("%d ", n);
    g(n - 1);
}
/* g(3); */
```

Build from the bottom: g(0) prints nothing. g(1) = g(0), "1", g(0) → `1`. g(2) = g(1), "2", g(1) → `1 2 1`. g(3) = g(2), "3", g(2) → **`1 2 1 3 1 2 1`**. Calls: T(0) = 1, T(n) = 2·T(n−1) + 1, so T(1) = 3, T(2) = 7, T(3) = **15** (= 2^(n+1) − 1).

**Trace 8 — mutual (indirect) recursion**

```c
#include <stdio.h>
void B(int n);                       /* prototype needed: A calls B first */
void A(int n) { if (n > 0) { printf("%d ", n); B(n - 1); } }
void B(int n) { if (n > 1) { printf("%d ", n); A(n / 2); } }
int main(void) { A(20); return 0; }
```

```text
A(20): print 20, call B(19)
B(19): print 19, call A(9)      (19/2 = 9, integer division)
A(9):  print 9,  call B(8)
B(8):  print 8,  call A(4)
A(4):  print 4,  call B(3)
B(3):  print 3,  call A(1)
A(1):  print 1,  call B(0)
B(0):  0 > 1 is false, stop
```

Output: **`20 19 9 8 4 3 1`**.

### Recursion vs iteration

| Recursion | Iteration |
|---|---|
| Function calls itself | Loop (`for`, `while`) repeats |
| Stops at the base case | Stops when the loop condition is false |
| Uses the call stack: O(n) extra memory for depth n | Usually O(1) extra memory |
| Call overhead; can overflow the stack | Faster, no overflow |
| Short, natural code for trees, Tower of Hanoi, divide-and-conquer | Simple counting and repetition |

Every recursive algorithm can be written iteratively (using an explicit stack if needed), and vice versa.

---

## 9. Python lambda, map and filter

```python
sq = lambda n: n * n                                     # anonymous one-expression function
print(sq(5))                                             # 25
print(list(map(lambda n: n * 2, [1, 2, 3])))             # [2, 4, 6]
print(list(filter(lambda n: n % 2 == 0, [1, 2, 3, 4, 5, 6])))  # [2, 4, 6]
from functools import reduce
print(reduce(lambda a, b: a + b, [1, 2, 3, 4]))         # 10
```

- A `lambda` holds a **single expression** (no statements); its value is returned automatically.
- In Python 3, `map()` and `filter()` return **iterators** (a `map` object), so wrap them in `list()` to see values.
- `reduce` lives in `functools`, not in the built-ins.
- A function with no `return` returns **`None`** (`print(nothing())` prints `None`).

---

## 10. main() and command-line arguments

**C**

```c
int main(void) { ... }
int main(int argc, char *argv[]) { ... }   /* also char **argv */
```

- `argc` = argument **count, including the program name**; `argv[0]` = program name; `argv[argc]` is `NULL`.
- For `./a.out red 42`: `argc = 3`, `argv[1] = "red"`, `argv[2] = "42"`. All arguments are **strings**; convert with `atoi()` (in `<stdlib.h>`).
- `return 0;` from `main` signals success to the operating system.

**Java**

```java
public class CmdArgs {
    public static void main(String[] args) {
        System.out.println(args.length);
        System.out.println(args[0]);
        int n = Integer.parseInt(args[1]);
        System.out.println(n * 2);
    }
}
// java CmdArgs red 42   prints 2, red, 84   (verified)
```

- `args[0]` is the **first argument**, not the class name. With no arguments `args.length` is 0, and `args[0]` throws `ArrayIndexOutOfBoundsException`.
- Valid headers: `public static void main(String[] args)`, `String args[]`, `String... args`, `static public void main(...)`; the parameter name can be anything.
- Without `static`, the code compiles but the launcher refuses to run it: "Main method is not static in class ..." (verified).

**Python**: `sys.argv` is a list; `sys.argv[0]` is the **script name**. `python args.py hello 5` gives `3 ['args.py', 'hello', '5']` (verified).

---

## Exam traps

1. ⭐ Variadic functions need **`<stdarg.h>`**, not `<stdio.h>`; `<stdio.h>` only declares `printf`/`scanf`.
2. ⭐ `inline` is a **request**; the compiler may ignore it (loops, recursion, static variables, large bodies). It suits **small** functions.
3. C has **no** function overloading and **no** default arguments; Java has overloading but **no** default arguments; Python has defaults but **no** overloading.
4. Return type alone does **not** overload a function: `int f(int)` and `double f(int)` together are an error.
5. Java is **always pass by value**; a method can change an object's fields but cannot make the caller's variable refer to a new object. Strings look unchanged because they are immutable.
6. Python mutable default argument (`bucket=[]`) is created **once** and shared across calls.
7. `#define SQUARE(x) x*x` gives `SQUARE(2+3)` = **11**, not 25; `100/SQUARE(5)` = **100**.
8. A `static` local is initialised **only once**; its default value is **0**. `auto` and `register` locals start with **garbage**. You cannot take `&` of a `register` variable.
9. Naive `fib(5)` makes **15** calls, not 5 or 6; `fib(6)` makes 25.
10. In C `argc` counts the program name; in Java `args.length` does **not**; Python `sys.argv[0]` is the script name.
11. Missing base case gives `StackOverflowError` in Java (an Error) and `RecursionError` in Python (limit 1000).
12. In `f(n){ print; f(n-1); print; }` the first print gives descending order and the second gives ascending order: `3 2 1 1 2 3`.

## One-liners for revision

1. Prototype = declaration with return type, name and parameter types, ending in `;`.
2. Parameter names are optional in a prototype.
3. Formal parameters appear in the definition; actual arguments appear in the call.
4. A `void` function returns no value; `f(void)` takes no arguments.
5. C passes everything by value; pointers simulate call by reference.
6. An array argument in C is passed as a pointer to its first element.
7. A C++ reference is an alias and must be initialised.
8. Java: primitives and object references are both copied (pass by value).
9. Python: arguments are object references; mutables can be changed in place.
10. C++ default arguments are assigned from right to left.
11. Python: a non-default parameter cannot follow a default one (SyntaxError).
12. Overloading = same name, different number, type or order of parameters.
13. Overloading is compile-time (static) polymorphism.
14. C++ supports overloading through name mangling.
15. Java overload choice: exact, then widening, then boxing, then varargs.
16. Python: the latest `def` with a name replaces the earlier one.
17. Inline functions reduce call overhead for small functions.
18. Member functions defined inside a class are implicitly inline.
19. Macros are expanded by the preprocessor with no type checking.
20. Variadic tools: `va_list`, `va_start`, `va_arg`, `va_end` in `<stdarg.h>`.
21. `printf` is declared `int printf(const char *format, ...);`.
22. `float` variadic arguments are promoted to `double`.
23. Java varargs `int... x` is an array and must be the last parameter.
24. `*args` is a tuple; `**kwargs` is a dict.
25. C storage classes: auto, register, static, extern.
26. Static and extern variables default to 0; auto defaults to garbage.
27. Python name lookup order: Local, Enclosing, Global, Built-in (LEGB).
28. `global` refers to a module name; `nonlocal` to an enclosing function's name.
29. Every recursive call gets its own stack frame (activation record).
30. Tail recursion: the recursive call is the last action.
31. Mutual recursion = indirect recursion (A calls B, B calls A).
32. fib(n) naive calls = 2·fib(n+1) − 1.
33. Python `map`/`filter` return iterators; `reduce` is in `functools`.
34. A Python function without `return` returns `None`.
35. In C, `argv[0]` is the program name and `argv[argc]` is NULL.

## Quick self-check

1. Which header declares `va_start` and `va_arg`?
   **Answer:** `<stdarg.h>`.
2. Why are inline functions used, and are they guaranteed to be expanded?
   **Answer:** To reduce call overhead for small functions; no, `inline` is only a request.
3. What is printed by `printf("%d", SQUARE(3+1));` with `#define SQUARE(x) x*x`?
   **Answer:** 7 (3 + 1*3 + 1).
4. In Java, after `void m(StringBuilder sb){ sb.append("!"); }` is called on `sb = "Hi"`, what does the caller see?
   **Answer:** `Hi!` — the object is shared through the copied reference.
5. What does `def f(a, L=[]): L.append(a); return L` return on the calls `f(1)` then `f(2)`?
   **Answer:** `[1]`, then `[1, 2]`.
6. How many times is `fib` called to compute naive `fib(4)`?
   **Answer:** 9.
7. Output of `f(2)` where `f(n){ if(n>0){ printf("%d ",n); f(n-1); printf("%d ",n); } }`?
   **Answer:** `2 1 1 2`.
8. For `java Prog a b c`, what is `args.length` and `args[0]`?
   **Answer:** 3 and `"a"`.
9. A `static int c;` inside a function is incremented and printed on each of three calls. What is printed?
   **Answer:** 1, 2, 3 (initialised to 0 once, value retained).
10. Can two C++ functions differ only in their return type?
    **Answer:** No; overloading needs a different parameter list.
