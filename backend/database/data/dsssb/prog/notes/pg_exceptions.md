# Exception Handling

**In 30 seconds**
- An **exception** is an abnormal event during execution that disrupts the normal flow; exception handling lets the program detect it and recover instead of crashing.
- C++: `try` / `catch` / `throw`; `catch(...)` catches everything; `throw;` rethrows; there is **no `finally`**.
- ⭐ Asked in DSSSB: a Java `try` can have **many `catch` blocks but only one `finally`**, and `try`–`finally` with no catch is legal.
- Java `finally` always runs (even after `return`), except when the JVM stops, e.g. `System.exit()`.
- Java hierarchy: `Throwable` → `Error` and `Exception`; `Exception` → `RuntimeException`. Checked = Exception but not RuntimeException; unchecked = RuntimeException + Error.
- Python: `try` / `except` / `else` / `finally`, `raise`, `assert`. `else` runs only when no exception occurred.
- ⭐ Asked in DSSSB: `ImportError` (or its subclass `ModuleNotFoundError`) means Python **could not find** the module (e.g. pandas is not installed).

---

## 1. Errors vs exceptions; compile-time vs run-time

| Kind | When found | Examples | Handled by |
|---|---|---|---|
| **Compile-time (syntax) error** | By the compiler/parser before running | Missing `;`, undeclared variable in C/Java, wrong indentation in Python | Fix the code |
| **Run-time error** | While the program runs | Division by zero, invalid index, missing file, null reference | Exception handling |
| **Logical error** | Never reported; output is just wrong | `area = l + b` instead of `l * b` | Testing and debugging |

In Java the word **Error** has a special meaning: an `Error` (e.g. `OutOfMemoryError`, `StackOverflowError`) is a serious problem from the JVM environment that a program is **not expected to catch**. An **Exception** is a condition a program can reasonably catch and recover from.

Basic vocabulary: **throwing** (raising) an exception = signalling it; **catching** (handling) = running code that deals with it; an exception not caught anywhere **terminates** the program.

---

## 2. Exception handling in C++

```cpp
#include <iostream>
#include <stdexcept>
using namespace std;

double divide(int a, int b) {
    if (b == 0) throw runtime_error("division by zero");   // throw an object
    return (double)a / b;
}
int main() {
    try {
        cout << divide(10, 0);
    }
    catch (const runtime_error &e) {        // catch by reference
        cout << "Error: " << e.what();
    }
    catch (...) {                           // catch-all: must be the LAST handler
        cout << "Unknown error";
    }
}
// Output: Error: division by zero
```

Rules:
- `throw` can throw a value of **any type**: `throw 5;`, `throw 'x';`, `throw "text";` (type `const char*`), or an object.
- Handlers are tried **in order**; the first one whose type matches wins. Matching allows derived-to-base and pointer conversions only, **no arithmetic conversions**: a thrown `char` is **not** caught by `catch(int)`, and a thrown `5.0` is not caught by `catch(int)`.
- So write **derived classes before base classes** and `catch(...)` last (a base handler first would hide the derived one; the compiler only warns).
- `throw;` with no operand **rethrows** the current exception (only inside a handler).
- **Stack unwinding**: when an exception leaves a function, the destructors of all fully constructed local objects in each exited scope run, in reverse order, before control reaches the handler. This is why C++ uses destructors (RAII) instead of `finally`.
- An uncaught exception calls `std::terminate()`, which aborts the program.
- Standard exceptions (`<exception>`, `<stdexcept>`): `std::exception` (base, virtual `what()`), `logic_error` (`out_of_range`, `invalid_argument`, `length_error`), `runtime_error` (`overflow_error`, `range_error`), `bad_alloc` (thrown by `new`), `bad_cast`.
- **Integer division by zero in C++ is undefined behaviour, not an exception**: `try { x = 5 / 0; } catch (...)` does not reliably catch anything. You must test and `throw` yourself.
- `noexcept` (C++11) marks a function that does not throw. Old dynamic specifications `void f() throw(int)` were deprecated in C++11 and removed in C++17.

---

## 3. ⭐ Asked in DSSSB: Java try / catch / finally / throw / throws

```java
try {
    // code that may throw
} catch (ArithmeticException e) {         // most specific first
    // handler
} catch (Exception e) {                   // more general later
    // handler
} finally {
    // always runs: clean-up (close files, connections)
}
```

| Keyword | Role |
|---|---|
| `try` | Encloses code that may throw. Must be followed by **at least one `catch` or a `finally`** (or be a try-with-resources). |
| `catch` | Handles one exception type (or several with multi-catch). A `try` may have **many** catch blocks. |
| `finally` | **At most one** per `try`; runs whether or not an exception occurred, and even after `return`, `break` or `continue`. |
| `throw` | A **statement** that throws **one** exception object: `throw new IllegalArgumentException("bad");` |
| `throws` | A clause in the **method header** that declares which checked exceptions the method may pass to its caller: `void read() throws IOException` |

⭐ Asked in DSSSB (2023), "Select the true statement about try-catch blocks": **"A try block can have many catches but only 1 finally block."** False options: "a try must have at least one catch to have a finally" (try–finally is legal) and "many finally blocks".

Rules to remember:
- **`finally` is skipped only** if the JVM stops: `System.exit()`, a JVM crash, or the thread being killed (Program 6).
- If `finally` has its own `return`, it **overrides** the try's return value (and swallows any exception). If `finally` only changes a variable, the value already chosen by `return` is kept (Program 1).
- **Catch order: subclass before superclass.** Writing `catch (Exception e)` before `catch (ArithmeticException e)` is a **compile error**: "exception ArithmeticException has already been caught" (Program 5). (C++ only warns; Python silently allows it.)
- **Multi-catch** (Java 7): `catch (IOException | SQLException e)`. The alternatives must not be subclass-related (`FileNotFoundException | IOException` is a compile error), and `e` is implicitly `final`.
- **try-with-resources** (Java 7): `try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) { ... }`. The resource must implement `AutoCloseable`; it is closed automatically, in the **reverse order** of opening, **before** any catch or finally block runs (Program 7).
- Statements after a `throw` in the same block are unreachable (compile error).
- An overriding method may not declare **broader or new checked** exceptions than the overridden method (it may declare fewer, narrower, or any unchecked ones).
- An uncaught exception prints, for example, `Exception in thread "main" java.lang.ArithmeticException: / by zero` followed by the stack trace, and ends the thread.
- Useful methods: `getMessage()` (the message), `toString()` (class name + message), `printStackTrace()`.

---

## 4. Java exception hierarchy

```
java.lang.Object
 └─ Throwable
     ├─ Error                      (unchecked; do not catch)
     │   ├─ OutOfMemoryError, StackOverflowError (VirtualMachineError)
     │   ├─ AssertionError
     │   └─ NoClassDefFoundError (LinkageError)
     └─ Exception                  (checked, except RuntimeException branch)
         ├─ IOException
         │   ├─ FileNotFoundException
         │   └─ EOFException
         ├─ SQLException, InterruptedException
         ├─ ClassNotFoundException (ReflectiveOperationException)
         └─ RuntimeException       (unchecked)
             ├─ ArithmeticException
             ├─ NullPointerException
             ├─ ClassCastException
             ├─ IllegalArgumentException
             │   └─ NumberFormatException
             └─ IndexOutOfBoundsException
                 ├─ ArrayIndexOutOfBoundsException
                 └─ StringIndexOutOfBoundsException
```

### Checked vs unchecked
| | Checked | Unchecked |
|---|---|---|
| Which classes | `Exception` and subclasses **except** `RuntimeException` | `RuntimeException`, its subclasses, and `Error` |
| Checked by | The **compiler**: you must catch it or declare it with `throws` ("handle or declare" rule) | Not checked at compile time |
| Usual cause | Outside conditions (missing file, network, database) | Programming bugs |
| Examples | `IOException`, `FileNotFoundException`, `ClassNotFoundException`, `SQLException`, `InterruptedException` | `ArithmeticException`, `NullPointerException`, `ArrayIndexOutOfBoundsException`, `NumberFormatException`, `ClassCastException` |

Common causes:
| Exception | Thrown when | Example |
|---|---|---|
| `ArithmeticException` | Integer division or remainder by zero | `5 / 0` gives "/ by zero" |
| `NullPointerException` | Using a `null` reference | `String s = null; s.length();` |
| `ArrayIndexOutOfBoundsException` | Index < 0 or ≥ length | `int[] a = new int[2]; a[3] = 1;` |
| `NumberFormatException` | Text is not a valid number | `Integer.parseInt("12a")` |
| `ClassCastException` | Invalid downcast | `(Integer) (Object) "text"` |
| `ClassNotFoundException` (checked) | A class named at run time cannot be found | `Class.forName("Foo")` |
| `IOException` / `FileNotFoundException` (checked) | Input/output failure / file cannot be opened | `new FileReader("missing.txt")` |

Note: floating-point division by zero does **not** throw in Java: `5.0 / 0` is `Infinity` and `0.0 / 0` is `NaN` (verified).

### Custom exceptions
Extend `Exception` for a **checked** custom exception or `RuntimeException` for an **unchecked** one, and pass the message to `super(msg)` (Program 8).

---

## 5. Exception handling in Python

```python
try:
    n = int(input("Number: "))
    print(100 / n)
except ZeroDivisionError:
    print("Cannot divide by zero")
except (ValueError, TypeError) as e:     # a tuple catches several types
    print("Bad input:", e)
else:
    print("No exception occurred")       # runs only if the try finished without an exception
finally:
    print("Always runs")
```

- Order of clauses: `try` → one or more `except` → optional `else` → optional `finally`. A `try` needs at least one `except` or a `finally`; `else` is allowed only if there is an `except`.
- A bare `except:` catches everything and must be last.
- Python does **not** reject a general handler placed before a specific one; the specific one simply never runs (Program 10).
- `raise ValueError("msg")` raises an exception; a bare `raise` inside `except` re-raises the current one.
- `assert condition, "message"` raises `AssertionError` with that message if the condition is false (asserts are skipped when Python runs with `-O`).
- Custom exception: `class AgeError(Exception): pass`.
- Hierarchy: `BaseException` → `Exception`, `SystemExit`, `KeyboardInterrupt`, `GeneratorExit`. `except Exception` does not catch `KeyboardInterrupt` (Ctrl+C).

### Built-in exceptions (all verified with Python 3)
| Exception | Raised when | Example |
|---|---|---|
| `ZeroDivisionError` | Division or modulo by zero (int **or float**) | `10 / 0`, `10.0 / 0` |
| `ValueError` | Right type, wrong value | `int("abc")` |
| `TypeError` | Operation on the wrong type | `"2" + 2` |
| `IndexError` | Sequence index out of range | `[1, 2, 3][5]` |
| `KeyError` | Dictionary key not found | `{"a": 1}["b"]` |
| `NameError` | Name not defined | `print(undefined_name)` |
| `AttributeError` | Object has no such attribute/method | `None.upper()` |
| `ImportError` ⭐ | An `import` fails: the module or the name inside it cannot be found | `from math import squareroot` |
| `ModuleNotFoundError` ⭐ | Subclass of `ImportError` (Python 3.6+): the module itself is not found | `import pandass` |
| `FileNotFoundError` | Opening a missing file for reading (subclass of `OSError`) | `open("no_such_file.txt")` |
| `SyntaxError` | Code breaks the grammar; found **before** the program runs | `x = = 1` |
| `IndentationError` | Wrong indentation; a **subclass of `SyntaxError`** (`TabError` is its subclass) | a body line not indented after `if True:` |
| `AssertionError` | `assert` condition false | `assert 5 > 10` |
| `OverflowError` | Arithmetic result too large (floats) | `2.0 ** 10000` |

⭐ Asked in DSSSB (2024): "If you encounter an import Error, what does it mean?" → only "**Python couldn't find Pandas in the list of available libraries**" is correct (the package is missing or misspelled, or installed for a different Python).

Group parents: `LookupError` → `IndexError`, `KeyError`; `ArithmeticError` → `ZeroDivisionError`, `OverflowError`; `OSError` → `FileNotFoundError`, `PermissionError`.

---

## 6. Worked "What is the output?" programs

All Java programs were compiled and run with Java 21 and all Python programs with Python 3; C++ programs are traced by hand.

**Program 1 (Java). finally with return**
```java
public class Main {
    static int f() {
        try { return 1; }
        finally { System.out.println("finally runs"); }
    }
    static int g() {
        try { return 1; }
        finally { return 2; }          // overrides the try's return (bad practice)
    }
    static int h() {
        int x = 10;
        try { return x; }              // value 10 is saved here
        finally { x = 20; }            // changes x, not the saved return value
    }
    public static void main(String[] args) {
        System.out.println(f());
        System.out.println(g());
        System.out.println(h());
    }
}
```
Output:
```
finally runs
1
2
10
```
Trace: `f()` saves 1, runs finally (prints), then returns 1 to `println`. In `g()` the finally's `return 2` replaces 1. In `h()` the return value 10 is fixed before finally changes `x`.

**Program 2 (Java). Order of execution**
```java
public class Main {
    public static void main(String[] args) {
        try {
            System.out.print("A ");
            int y = 5 / 0;
            System.out.print("B ");
        } catch (ArithmeticException e) {
            System.out.print("C ");
        } finally {
            System.out.print("D ");
        }
        System.out.println("E");
    }
}
```
Output: `A C D E`
Trace: the exception at `5 / 0` skips the rest of the try (no B), the matching catch runs, then finally, then normal flow continues.

**Program 3 (Java). Nested try**
```java
public class Main {
    public static void main(String[] args) {
        try {
            try {
                int[] a = new int[2];
                a[3] = 1;
                System.out.println("after store");
            } catch (ArithmeticException e) {
                System.out.println("inner catch");
            } finally {
                System.out.println("inner finally");
            }
            System.out.println("after inner try");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("outer catch: " + e.getMessage());
        } finally {
            System.out.println("outer finally");
        }
    }
}
```
Output:
```
inner finally
outer catch: Index 3 out of bounds for length 2
outer finally
```
Trace: the inner catch does not match, so the inner finally runs and the exception propagates to the outer try; "after inner try" is skipped.

**Program 4 (Java). Exception passing through a method with only finally**
```java
public class Main {
    static void level2() { throw new IllegalStateException("from level2"); }
    static void level1() {
        try { level2(); }
        finally { System.out.println("level1 finally"); }
    }
    public static void main(String[] args) {
        try {
            level1();
            System.out.println("not printed");
        } catch (IllegalStateException e) {
            System.out.println("main caught: " + e.getMessage());
        }
    }
}
```
Output:
```
level1 finally
main caught: from level2
```

**Program 5 (Java). Wrong catch order**
```java
public class Main {
    public static void main(String[] args) {
        try {
            int x = 10 / 0;
        } catch (Exception e) {
            System.out.println("Exception");
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic");
        }
    }
}
```
Output: **compile-time error**: `exception ArithmeticException has already been caught`. Put the subclass catch first.

**Program 6 (Java). finally and System.exit**
```java
public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("in try");
            System.exit(0);
        } finally {
            System.out.println("in finally");
        }
    }
}
```
Output: `in try` (the JVM stops, so finally never runs).

**Program 7 (Java). try-with-resources**
```java
class Res implements AutoCloseable {
    String n;
    Res(String n) { this.n = n; System.out.println("open " + n); }
    @Override public void close() { System.out.println("close " + n); }
}
public class Main {
    public static void main(String[] args) {
        try (Res a = new Res("A"); Res b = new Res("B")) {
            System.out.println("body");
            throw new RuntimeException("boom");
        } catch (RuntimeException e) {
            System.out.println("catch " + e.getMessage());
        } finally {
            System.out.println("finally");
        }
    }
}
```
Output (one per line): `open A`, `open B`, `body`, `close B`, `close A`, `catch boom`, `finally`
Trace: resources close in reverse order, and they close **before** the catch block runs.

**Program 8 (Java). Custom checked exception with throw and throws**
```java
class InsufficientBalanceException extends Exception {
    InsufficientBalanceException(String msg) { super(msg); }
}
class Account {
    int balance = 500;
    void withdraw(int amt) throws InsufficientBalanceException {
        if (amt > balance)
            throw new InsufficientBalanceException("Need " + (amt - balance) + " more");
        balance -= amt;
        System.out.println("Withdrawn " + amt);
    }
}
public class Main {
    public static void main(String[] args) {
        Account acc = new Account();
        try {
            acc.withdraw(200);
            acc.withdraw(400);
            acc.withdraw(50);
        } catch (InsufficientBalanceException e) {
            System.out.println("Error: " + e.getMessage());
        }
        System.out.println("Balance " + acc.balance);
    }
}
```
Output:
```
Withdrawn 200
Error: Need 100 more
Balance 300
```
Trace: 500 − 200 = 300; 400 > 300 throws (400 − 300 = 100); `withdraw(50)` is skipped because control jumps to the catch.

**Program 9 (Python). else and finally**
```python
def test(x):
    try:
        r = 10 / x
    except ZeroDivisionError:
        print("divide by zero")
    else:
        print("result", r)
    finally:
        print("done")

test(2)
test(0)
```
Output:
```
result 5.0
done
divide by zero
done
```
Trace: `/` always gives a float in Python 3, so 5.0. With 0, `except` runs and `else` is skipped; `finally` runs both times.

**Program 10 (Python). General handler first**
```python
try:
    print(1 / 0)
except Exception:
    print("general handler")
except ZeroDivisionError:
    print("specific handler")
```
Output: `general handler` (no error in Python, unlike Java's Program 5; the second clause is dead code).

**Program 11 (Python). Nested try**
```python
def outer():
    try:
        try:
            print("A")
            [].pop()
            print("B")
        except KeyError:
            print("C")
        finally:
            print("D")
        print("E")
    except IndexError as e:
        print("F", e)
    else:
        print("G")
    print("H")

outer()
```
Output (one per line): `A`, `D`, `F pop from empty list`, `H`
Trace: `[].pop()` raises `IndexError`, which the inner `except KeyError` does not match; the inner `finally` prints D, the outer handler prints F, the outer `else` is skipped because an exception occurred, and H follows.

**Program 12 (Python). raise, re-raise and finally**
```python
def check(n):
    try:
        if n == 0:
            raise ValueError("zero not allowed")
        print("ok", n)
    except ValueError as e:
        print("caught:", e)
        raise                      # re-raise the same exception
    finally:
        print("cleanup", n)

for n in (4, 0):
    try:
        check(n)
    except ValueError:
        print("outer caught")
```
Output:
```
ok 4
cleanup 4
caught: zero not allowed
cleanup 0
outer caught
```

**Program 13 (Python). finally with continue and return**
```python
count = 0
for i in range(3):
    try:
        if i == 1:
            continue
        count += 10
    finally:
        count += 1
print(count)

def g():
    try:
        return 1
    finally:
        return 2

print(g())
```
Output:
```
23
2
```
Trace: i = 0 → 10 + 1 = 11; i = 1 → `continue`, but finally still adds 1 → 12; i = 2 → 22 + 1 = 23. `return` in `finally` overrides the try's return, as in Java (Python 3.14 prints a `SyntaxWarning` for this on stderr).

**Program 14 (C++). Stack unwinding and exact type matching**
```cpp
class R {
public:
    R()  { cout << "R+ "; }
    ~R() { cout << "R- "; }
};
void f() { R r; throw 'x'; cout << "never "; }
int main() {
    try { f(); }
    catch (int e)  { cout << "int "; }
    catch (char c) { cout << "char " << c; }
    catch (...)    { cout << "other"; }
}
```
Output: `R+ R- char x`
Trace: `r` is constructed (R+). `throw 'x'` leaves `f`, so `r` is destroyed during stack unwinding (R-). The thrown type is `char`; `catch(int)` does not match because no promotion is done for handlers, so `catch(char)` runs.

**Program 15 (C++). Rethrow**
```cpp
void g() {
    try { throw 5; }
    catch (int e) { cout << "inner " << e << " "; throw; }
}
int main() {
    try { g(); }
    catch (int e) { cout << "outer " << e; }
}
```
Output: `inner 5 outer 5`
Trace: the inner handler prints and `throw;` sends the same `int` exception up to `main`'s handler.

---

## Exam traps
1. A `try` can have **many catch blocks but only one finally**; `try`–`finally` without catch is legal; a lone `try` is a compile error.
2. `finally` runs even after `return`, `break` or `continue`; only `System.exit()` (or a JVM crash) stops it.
3. A `return` inside `finally` overrides the try's return; modifying a variable in `finally` does not change a value already returned.
4. Java: superclass catch before subclass catch = **compile error**. Python allows it silently; C++ only warns.
5. `throw` throws an object (statement); `throws` declares exceptions (method header). Do not mix them up.
6. `NumberFormatException` is unchecked (it extends `IllegalArgumentException`), while `ClassNotFoundException` and `FileNotFoundException` are **checked**.
7. `ClassNotFoundException` (checked exception, loading by name) is different from `NoClassDefFoundError` (an `Error`).
8. Java `5.0 / 0` is `Infinity` (no exception), but Python `10.0 / 0` raises `ZeroDivisionError`; C++ integer division by zero is undefined behaviour, not an exception.
9. In C++ `catch(int)` does **not** catch a thrown `char` or `double`; `catch(...)` must be last.
10. Python `else` runs only when the try raised **no** exception; it runs before `finally`.
11. `IndentationError` is a subclass of `SyntaxError`, and `ModuleNotFoundError` is a subclass of `ImportError`.
12. C++ has no `finally`; clean-up is done by destructors during stack unwinding.

## One-liners for revision
1. Exception = abnormal run-time event that disrupts normal flow.
2. Syntax errors are found at compile time; exceptions occur at run time; logical errors give wrong output silently.
3. C++ keywords: `try`, `catch`, `throw`.
4. `catch(...)` is the C++ catch-all handler.
5. `throw;` rethrows the current exception (C++); bare `raise` does the same in Python.
6. Stack unwinding destroys local objects on the way to the handler.
7. `std::exception::what()` returns the message.
8. `new` throws `std::bad_alloc` when memory runs out.
9. Java keywords: `try`, `catch`, `finally`, `throw`, `throws`.
10. Root of all Java exceptions: `Throwable`.
11. `Throwable` has two direct subclasses: `Error` and `Exception`.
12. Checked exceptions must be caught or declared with `throws`.
13. `RuntimeException` and its subclasses are unchecked.
14. `ArithmeticException`: integer divide by zero ("/ by zero").
15. `NullPointerException`: method or field used on `null`.
16. `ArrayIndexOutOfBoundsException`: index outside 0 to length − 1.
17. `NumberFormatException`: `Integer.parseInt("12a")`.
18. `FileNotFoundException` is a subclass of `IOException`.
19. Multi-catch and try-with-resources arrived in Java 7.
20. try-with-resources needs `AutoCloseable`; closes in reverse order.
21. Custom checked exception: `extends Exception`; unchecked: `extends RuntimeException`.
22. `getMessage()` gives the message; `printStackTrace()` prints the call trace.
23. Python order: try, except, else, finally.
24. Python `else` = "no exception happened".
25. `raise` throws in Python; `assert` raises `AssertionError`.
26. `ValueError` = right type, wrong value (`int("abc")`).
27. `TypeError` = wrong type (`"2" + 2`).
28. `KeyError` for dictionaries, `IndexError` for sequences.
29. `NameError` = undefined name; `AttributeError` = missing attribute.
30. `ImportError` = module or name cannot be imported; `ModuleNotFoundError` = module not found.
31. `FileNotFoundError` = opening a missing file in `"r"` mode.
32. `except Exception` does not catch `KeyboardInterrupt` or `SystemExit`.

## Quick self-check
1. **Q:** Can a Java try block have two finally blocks? **A:** No; many catch blocks but only one finally.
2. **Q:** Is `try { ... } finally { ... }` without catch valid in Java? **A:** Yes.
3. **Q:** What does `static int f(){ try { return 1; } finally { return 2; } }` return? **A:** 2.
4. **Q:** When does a Java finally block not run? **A:** When the JVM exits, e.g. `System.exit(0)` in the try, or a crash.
5. **Q:** Is `IOException` checked or unchecked? `NullPointerException`? **A:** IOException is checked; NullPointerException is unchecked.
6. **Q:** Output of Java `System.out.println(5.0 / 0);`? **A:** `Infinity`.
7. **Q:** In C++, `throw 'a';` with only `catch(int)` and `catch(...)`. Which runs? **A:** `catch(...)`; no conversion from char to int for handlers.
8. **Q:** In Python, when does the `else` block of a try run? **A:** Only when the try block raised no exception.
9. **Q:** Which exception does `import pandas` raise if pandas is not installed? **A:** `ModuleNotFoundError`, a subclass of `ImportError`: Python could not find the library.
10. **Q:** Which Python exception does `{"a": 1}["b"]` raise, and what is its parent? **A:** `KeyError`, a subclass of `LookupError`.
