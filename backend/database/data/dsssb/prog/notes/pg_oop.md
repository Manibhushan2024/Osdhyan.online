# Object-Oriented Programming (C++ & Java)

**In 30 seconds**
- A **class** is a blueprint (data + functions); an **object** is an instance of a class that occupies memory at run time.
- The four pillars: **encapsulation** (bind data and code, hide data), **abstraction** (show what, hide how), **inheritance** (reuse a parent's members), **polymorphism** (one interface, many forms).
- ⭐ Asked in DSSSB: polymorphism = "many forms". Compile-time = function/operator **overloading**; run-time = **overriding** through virtual functions (C++) or dynamic method dispatch (Java).
- ⭐ Asked in DSSSB: **protected** members are accessible in a derived class. Java strictness order: **private > default (package) > protected > public**.
- ⭐ Asked in DSSSB: a **final** method cannot be overridden, an abstract class cannot be instantiated, and Java 8+ interfaces may have **default** methods.
- Constructors run base → derived; C++ destructors run in the reverse order, derived → base.
- ⭐ Asked in DSSSB: ClassLoader chain **Bootstrap → Platform (Extension) → Application (System)**. Bootstrap has no parent; the System loader has no child loaders by default.
- ⭐ Asked in DSSSB: `cin.ignore(n, delim)` extracts and discards up to n characters, stopping after `delim`. Packages **do** provide controlled access.

---

## 1. Procedural vs object-oriented programming

| Point | Procedural (C, Pascal, FORTRAN) | Object-oriented (C++, Java, Python, C#) |
|---|---|---|
| Unit of the program | Functions (procedures) | Classes and objects |
| Approach | **Top-down**: split the task into functions | **Bottom-up**: build objects, then combine them |
| Data | Often global, moves freely between functions | Kept inside objects, reached through methods |
| Data security | Low (any function can change global data) | High (data hiding through access specifiers) |
| Reuse | Copy or call functions | Inheritance and composition |
| Overloading | Not supported in C | Function and operator overloading (C++) |
| Focus | Algorithm (how to do it) | Data (what the things are) |

C++ is a **multi-paradigm** language: it supports both procedural and object-oriented code. Java is designed around classes: every method must sit inside a class. Neither is a "pure" OO language, because both have primitive types (`int`, `char`) that are not objects. Smalltalk is the usual example of a pure OO language.

---

## 2. Class, object and members

- **Class**: a user-defined type that groups **data members** (attributes, fields, instance variables) and **member functions** (methods). A class definition alone takes no memory for data.
- **Object**: an instance of a class. Each object gets its own copy of the non-static data members; all objects share one copy of the member functions.
- **State** = the values of the data members; **behaviour** = the methods; **identity** = the object's unique existence (its address or reference).

```cpp
class Student {            // C++: members are private by default in a class
    int roll;              // data member
public:
    void setRoll(int r) { roll = r; }   // member function (defined inside: implicitly inline)
    int getRoll() { return roll; }
};                          // the semicolon after a C++ class is required

int main() {
    Student s;              // object on the stack
    s.setRoll(7);
    Student *p = new Student;   // object on the heap
    p->setRoll(9);
    delete p;
}
```

```java
class Student {            // Java: no access word = default (package-private)
    private int roll;
    void setRoll(int r) { roll = r; }
    int getRoll() { return roll; }
}
// Student s = new Student();   // every Java object is created with new, on the heap
```

- In C++ a `class` has **private** members by default; a `struct` has **public** members by default. That is the only difference (plus the default inheritance mode).
- A C++ member function can be defined outside the class with the **scope resolution operator**: `int Student::getRoll() { return roll; }`.
- In Java, `s` is a **reference** variable; `Student s;` alone creates no object (the reference is `null` if it is a field).

---

## 3. The four pillars at a glance

| Pillar | Exact idea | C++ tool | Java tool |
|---|---|---|---|
| Encapsulation | Wrapping data and the functions that work on it into one unit, and restricting direct access to the data | class + `private` | class + `private`, getters/setters, packages |
| Abstraction | Showing only essential features and hiding implementation details | abstract class (pure virtual function) | `abstract` class, `interface` |
| Inheritance | A new (derived/child) class acquires the members of an existing (base/parent) class; an "is-a" relationship | `class D : public B` | `class D extends B`, `implements I` |
| Polymorphism | One name/interface, many forms (behaviours) | overloading, virtual functions | overloading, overriding |

Abstraction vs encapsulation: abstraction is a **design** idea (decide what to expose); encapsulation is the **implementation** (put data and code in a capsule and lock the data). Data hiding is the result of encapsulation.

---

## 4. Encapsulation and data hiding

Make the fields `private` and give controlled access through public **getter** (accessor) and **setter** (mutator) methods. The setter can validate the data.

```java
public class Account {
    private double balance;                 // hidden

    public double getBalance() { return balance; }   // getter
    public void deposit(double amt) {                // setter with a check
        if (amt > 0) balance += amt;
    }
}
```

Benefits: data cannot be put into an invalid state from outside, the internal representation can change without breaking callers, and the class is easier to test. A class whose fields are all private and that has no setters (and is `final`) is **immutable**, like Java's `String`.

---

## 5. Abstraction: abstract classes, pure virtual functions, interfaces

### C++: pure virtual function and abstract class
```cpp
class Shape {
public:
    virtual double area() = 0;   // pure virtual function ("= 0" is the pure specifier)
    virtual ~Shape() {}
};
class Circle : public Shape {
    double r;
public:
    Circle(double x) : r(x) {}
    double area() override { return 3.14 * r * r; }
};
// Shape s;          // ERROR: cannot create an object of an abstract class
// Shape *p = new Circle(2);   // OK: pointer/reference to an abstract class is allowed
```
- A class with **at least one pure virtual function** is an **abstract class**.
- A derived class that does not override every pure virtual function is also abstract.
- C++ has no `interface` keyword; a class with only pure virtual functions acts as an interface.

### Java: abstract class
```java
abstract class Shape {
    abstract double area();          // no body
    Shape() { System.out.println("Shape()"); }   // abstract classes CAN have constructors
    void describe() { System.out.println("I am a shape"); }  // and concrete methods
}
```
- Declared with `abstract`; **cannot be instantiated** (`new Shape()` is a compile error).
- May have zero or more abstract methods, constructors, fields, static methods.
- If a class has even one abstract method, the class must be declared `abstract`.
- `abstract` cannot be combined with `final`, `static` or `private` on a method.

### Java: interface
```java
interface Drawable {
    int SIZE = 10;                    // implicitly public static final
    void draw();                      // implicitly public abstract
    default void info() { System.out.println("Drawable"); }   // Java 8
    static void help() { System.out.println("help"); }         // Java 8
}
class Square implements Drawable {
    public void draw() { System.out.println("square"); }      // must be public
}
```

### ⭐ Asked in DSSSB: abstract class vs interface (Java)
| Point | Abstract class | Interface |
|---|---|---|
| Keyword | `abstract class` | `interface` |
| Methods | Abstract and concrete | Abstract; since Java 8 also `default` and `static` methods; since Java 9 `private` methods |
| Variables | Any kind (instance, static, final or not) | Only `public static final` constants |
| Constructors | Yes | No |
| Access of members | Any (private, protected, ...) | Methods are `public` (except Java 9 private helpers) |
| Inheritance | A class `extends` only **one** class | A class `implements` **many** interfaces; an interface `extends` many interfaces |
| Instantiation | Not allowed | Not allowed |
| Use | "is-a" with shared code and state | A capability/contract ("can-do") |

When a class implements two interfaces that both give the same default method, it **must override** that method, and may call a chosen one with `X.super.method()` (Program J10).

---

## 6. Inheritance

The existing class is the **base / parent / super** class; the new one is the **derived / child / sub** class. Inheritance models an **is-a** relationship (a Dog is an Animal). Containing another object as a field is **composition**, a **has-a** relationship.

| Type | Shape | C++ | Java (classes) |
|---|---|---|---|
| Single | A → B | Yes | Yes |
| Multilevel | A → B → C | Yes | Yes |
| Hierarchical | A → B, A → C | Yes | Yes |
| Multiple | A, B → C | Yes | **No** (only through interfaces) |
| Hybrid | A mix, often a diamond | Yes | Only through interfaces |

### Diamond problem and virtual base classes (C++)
B and C both inherit A; D inherits B and C. Without care, D holds **two copies** of A's members, and `d.a` is **ambiguous**. Declaring A as a **virtual base class** keeps a single shared copy:

```cpp
class A { public: int a; };
class B : virtual public A {};
class C : virtual public A {};
class D : public B, public C {};   // only one A subobject; d.a is not ambiguous
```
In virtual inheritance the **most-derived** class (D) constructs the virtual base A, and A is built first (Program C10).

### Java and multiple inheritance
Java does **not** allow a class to extend two classes (`class C extends A, B` is a compile error), which avoids the diamond problem for state. A class may implement any number of interfaces, so multiple inheritance of **type** is allowed. Every Java class directly or indirectly extends `java.lang.Object`.

What is not inherited: constructors (both languages), private members are inherited in memory but not accessible, C++ friend relationships, and in C++ the assignment operator is hidden by the derived class's own.

---

## 7. ⭐ Asked in DSSSB: Polymorphism

**Polymorphism** (Greek: "many forms") means one interface, many implementations: the same name or operator behaves differently depending on the types involved. The DSSSB 2023 paper asked "What feature of OOP allows an instance of a class to take on many forms?" with official answer **operator overloading** (a compile-time form of polymorphism).

| | Compile-time (static, early binding) | Run-time (dynamic, late binding) |
|---|---|---|
| Mechanism | Function overloading, operator overloading (C++), templates/generics | Function overriding with `virtual` (C++); all non-static, non-final, non-private methods in Java |
| Decided by | The compiler, using the **declared (static) type** and argument list | The **actual object** at run time |
| Needs inheritance? | No | Yes |

### Overloading
Same name, **different parameter lists** (number, type or order of parameters) in the **same scope**. The return type alone **cannot** distinguish overloads.
```cpp
int add(int a, int b)          { return a + b; }
double add(double a, double b) { return a + b; }
int add(int a, int b, int c)   { return a + b + c; }
// double add(int a, int b);   // ERROR: differs only in return type
```

### Overriding
A derived class gives a new body for an inherited method with the **same name, same parameters and a compatible return type**. In C++ the base function must be `virtual` for run-time dispatch; in Java every instance method is virtual by default.

**Upcasting**: storing a derived object's address in a base pointer/reference (`Base *p = &d;` or `Animal a = new Dog();`). It is implicit and safe. The call through it is resolved by the object's real type only for virtual (C++) or overridable (Java) methods. **Dynamic method dispatch** is Java's name for this. **Downcasting** (base to derived) needs an explicit cast and can fail (`ClassCastException` in Java).

| Point | Overloading | Overriding |
|---|---|---|
| Where | Same class (or scope) | Base and derived class |
| Signature | Must differ | Must be the same |
| Binding | Compile time | Run time |
| Return type | Can differ (but not alone) | Same or covariant (a subtype) |
| `static` methods | Can be overloaded | Cannot be overridden (only **hidden**) |
| `final` / `private` methods | Can be overloaded | Cannot be overridden |

---

## 8. Virtual functions, vtable, virtual destructors (C++)

- A **virtual function** is a member function declared with `virtual` in the base class; a call through a base pointer/reference runs the derived version.
- **How**: each class with virtual functions has a **vtable** (a table of function addresses); each object carries a hidden **vptr** pointing to its class's vtable. A virtual call looks up the address at run time.
- Once virtual, a function stays virtual in all derived classes (writing `virtual` again is optional). C++11 adds `override` (checks you really override) and `final` (stops further overriding).
- **Constructors cannot be virtual**. **Destructors can and should be virtual** in any base class used polymorphically, so `delete basePtr;` runs the derived destructor first (Program C7). Deleting a derived object through a base pointer whose destructor is not virtual is undefined behaviour.
- Calling through an **object** (not a pointer or reference) always uses static binding, and assigning a derived object to a base object **slices** off the derived part (Program C3).

---

## 9. Constructors and destructors

### Constructors (C++ and Java)
A **constructor** is a special member function that initialises an object. Rules common to both languages: same name as the class; **no return type, not even `void`**; called automatically when an object is created; can be **overloaded**; not inherited. If you write **no** constructor, the compiler supplies a default (no-argument) one; if you write **any** constructor, no default constructor is supplied.

| Kind | Example (C++) | Note |
|---|---|---|
| Default | `Point() { x = y = 0; }` | No parameters (or all parameters defaulted) |
| Parameterised | `Point(int a, int b) { x = a; y = b; }` | Values supplied at creation: `Point p(2, 3);` |
| Copy | `Point(const Point &p) { x = p.x; y = p.y; }` | Parameter **must be a reference**; by value would call itself forever |
| Overloading | All three above in one class | Chosen by the argument list |

The C++ copy constructor runs when an object is initialised from another object (`T b = a;` or `T c(a);`), when an object is passed **by value**, and when one is returned by value (often elided by the compiler). Plain assignment `b = a;` between existing objects calls the **assignment operator**, not the copy constructor (Program C5). The compiler's default copy is a **shallow** (member-wise) copy; a class owning heap memory needs a user-written **deep** copy.

**Initialiser list** (C++): `Point(int a, int b) : x(a), y(b) {}`. It is **required** for `const` members, reference members, members without a default constructor, and to pass arguments to a base-class constructor. Members are initialised in their **declaration order** in the class, not in the order written in the list.

Java has no special copy constructor (you may write one), no initialiser list, and no destructor. Java fields get default values (0, `false`, `'\u0000'`, `null`); C++ local primitives have indeterminate values.

### Order of constructor and destructor calls ⭐
1. Virtual base classes (C++), then
2. direct base classes in the **order they are listed** in the class head (not in the initialiser list),
3. member objects in their **declaration order**,
4. the constructor body of the class itself.

Destructors run in exactly the **reverse** order. Local objects in one scope are destroyed in the reverse order of their creation.

In Java, the first statement of every constructor is (explicitly or implicitly) `super(...)` or `this(...)`, so construction goes up to `Object` first. The full Java order for `new B()` where `B extends A` (Program J1):
static blocks of A, static blocks of B (once, at class loading) → instance initialisers and field initialisers of A → constructor body of A → instance initialisers of B → constructor body of B.

### Destructors (C++)
`~ClassName()`: no arguments, no return type, **cannot be overloaded** (one per class), called automatically when the object goes out of scope or is `delete`d. Used to release resources (memory, files).

### Garbage collection and finalize (Java)
- Java frees memory automatically. An object becomes **eligible for garbage collection** when no live reference reaches it (e.g. `obj = null;`, the reference goes out of scope, or it is reassigned).
- `System.gc()` or `Runtime.getRuntime().gc()` only **requests** collection; it is not guaranteed.
- `protected void finalize()` (from `Object`) was called by the GC at most once before reclaiming an object. It is **deprecated since Java 9** (marked for removal in Java 18); use `try-with-resources` instead.

---

## 10. `this` and `super`

| | `this` | `super` |
|---|---|---|
| Refers to | The current object | The parent-class part of the current object |
| Field use | `this.x = x;` (field vs parameter of the same name) | `super.x` (a hidden parent field) |
| Method use | `this.show()` | `super.show()` (call the overridden parent version) |
| Constructor call | `this(...)` calls another constructor of the same class | `super(...)` calls the parent constructor |
| Rule | `this(...)` must be the first statement | `super(...)` must be the first statement |

A constructor cannot contain both `this(...)` and `super(...)`. Neither `this` nor `super` can be used in a `static` method. If the parent has **no no-argument constructor**, the child must call `super(args)` explicitly, or it will not compile.

In C++, `this` is a **pointer** (`this->x = x;`, `return *this;`), not available in static member functions. C++ has no `super` keyword; you write `Base::show();`.

---

## 11. Static members and static blocks

- A **static data member** belongs to the class: **one copy shared by all objects**, created before any object.
- In C++ a static data member is declared inside the class and **defined once outside** it: `int Count::n = 0;`.
- A **static member function** can be called without an object (`Count::get()` in C++, `Math.max(2, 3)` in Java). It has no `this`, so it can access only static members directly.
- Java **static block** `static { ... }` runs **once, when the class is loaded**, before `main` for the main class. An **instance initialiser block** `{ ... }` runs on every object creation, before the constructor body.
- Java static methods can be overloaded but **not overridden**: a static method with the same signature in a subclass **hides** the parent's one, and the call is chosen by the reference type (Program J7).
- `main` is `static` so the JVM can call it without creating an object.

---

## 12. ⭐ Asked in DSSSB: Access specifiers

### C++
| Specifier | Same class | Derived class | Outside (via object) |
|---|---|---|---|
| `private` (default in `class`) | Yes | **No** | No |
| `protected` | Yes | **Yes** | No |
| `public` (default in `struct`) | Yes | Yes | Yes |

⭐ Asked in DSSSB (2023): "Which access modifier can be used to access members in deriving class?" → **protected**.

**Inheritance modes** (how base members appear in the derived class):
| Base member | `public` inheritance | `protected` inheritance | `private` inheritance |
|---|---|---|---|
| public | public | protected | private |
| protected | protected | protected | private |
| private | not accessible | not accessible | not accessible |

Default mode: `class D : B` means **private** inheritance; `struct D : B` means **public** inheritance. Only public inheritance models "is-a" (allows upcasting from outside).

### Java
| Modifier | Same class | Same package (any class) | Subclass in another package | Any other class |
|---|---|---|---|---|
| `private` | Yes | No | No | No |
| default (no keyword, package-private) | Yes | Yes | No | No |
| `protected` | Yes | Yes | Yes (through inheritance) | No |
| `public` | Yes | Yes | Yes | Yes |

⭐ Asked in DSSSB (2023): "the descending order of strict access protection" is **private > default (package) > protected > public**. `protected` is *less* strict than default because it adds subclass access from other packages. (The official key of that paper marked "Private, protected, package, public", which contradicts the Java Language Specification; learn the correct order and read the options carefully.)

Other Java rules: a top-level class can be only `public` or default (not `private`/`protected`); a file can have at most one `public` top-level class, and the file name must match it; an overriding method **cannot reduce visibility** (a `public` method cannot be overridden as `protected`).

---

## 13. Friend functions and friend classes (C++)

A **friend function** is a non-member function declared inside a class with the keyword `friend`; it can access the class's private and protected members (Program C11).
- It is not a member: it is called like a normal function (`twice(b)`, not `b.twice()`), has no `this`, and its declaration can be in any section (private/public makes no difference).
- `friend class Y;` makes every member function of Y a friend.
- Friendship is **not inherited, not mutual (one-way), not transitive**.
- Java has no friend; package-private access plays a similar role.

---

## 14. Operator overloading (C++)

Giving an operator a meaning for a user-defined type with a function named `operator@`. It is **compile-time polymorphism**. Java does not support user-defined operator overloading (only the built-in `+` for `String` concatenation).

```cpp
class Complex {
    int re, im;
public:
    Complex(int r = 0, int i = 0) : re(r), im(i) {}
    Complex operator+(const Complex &c) const { return Complex(re + c.re, im + c.im); }
    friend ostream& operator<<(ostream &out, const Complex &c);   // must be a non-member
};
ostream& operator<<(ostream &out, const Complex &c) { return out << c.re << "+" << c.im << "i"; }
```

Rules:
- **Cannot be overloaded**: `::` (scope resolution), `.` (member access), `.*` (pointer-to-member), `?:` (conditional), `sizeof`, and also `typeid` and the named casts.
- **Must be member functions** (cannot be friends): `=`, `()`, `[]`, `->`.
- You cannot invent new operators (`**`), change precedence, associativity or the number of operands, or overload operators for built-in types only (at least one operand must be a user-defined type).
- A member binary operator takes **one** parameter (the left operand is `*this`); a friend binary operator takes **two**. A member unary operator takes none; postfix `++` uses a dummy `int`: `T operator++(int)`.
- `<<` and `>>` for streams are written as friends because the left operand is a stream, not your object.

---

## 15. ⭐ Asked in DSSSB: `final` in Java

| Applied to | Meaning |
|---|---|
| Variable | A constant: can be assigned **only once**. A **blank final** field must be assigned in every constructor; a `static final` blank must be assigned in a static block. |
| Reference variable | The reference cannot point elsewhere, but the **object's contents can still change** (`final int[] a = {1}; a[0] = 5;` is legal). |
| Method | **Cannot be overridden** (it can still be inherited and overloaded). |
| Class | **Cannot be extended** (e.g. `String`, `Integer`, `Math`, all wrapper classes). |
| Parameter | Cannot be reassigned inside the method. |

⭐ Asked in DSSSB (2023), "Which is FALSE?": "Final methods can be overridden" is **false** (javac: "overridden method is final"). The true ones were: `static public void main(String…abcd){}` is valid (modifier order is free and varargs `String...` replaces `String[]`), abstract classes cannot be instantiated, and interfaces allow default methods. `abstract final` together is illegal. C++11 also has `final` for virtual functions and classes; C++ uses `const` for constants.

---

## 16. `Object` class methods, strings and wrapper classes (Java)

### `java.lang.Object`
| Method | Default behaviour |
|---|---|
| `boolean equals(Object o)` | Same as `==` (same object) unless overridden |
| `int hashCode()` | An identity-based integer unless overridden |
| `String toString()` | `ClassName@hexHashCode` unless overridden; called by `println` and `+` |
| `Class<?> getClass()` | The run-time class (final, cannot be overridden) |
| `clone()`, `finalize()` | protected; finalize deprecated |
| `wait()`, `notify()`, `notifyAll()` | Thread coordination (final) |

**Contract**: if `a.equals(b)` is true, `a.hashCode() == b.hashCode()` must be true. Override both together, or hash-based collections (`HashSet`, `HashMap`) misbehave (Program J11).

### String equality
`==` compares **references**; `equals()` compares **contents**. String literals with the same text share one object in the **string pool**; `new String("x")` always creates a new object; `intern()` returns the pooled copy; compile-time constant expressions (`"Ja" + "va"`) are pooled, but concatenation involving a variable is built at run time (Program J6). `String` is immutable; `StringBuilder` (not synchronised) and `StringBuffer` (synchronised) are mutable.

### Wrapper classes and autoboxing
| Primitive | byte | short | int | long | float | double | char | boolean |
|---|---|---|---|---|---|---|---|---|
| Wrapper | Byte | Short | **Integer** | Long | Float | Double | **Character** | Boolean |

All are in `java.lang` and are `final` and immutable. **Autoboxing** (Java 5) converts a primitive to its wrapper automatically (`Integer x = 5;`); **unboxing** converts back (`int y = x;`). `Integer.parseInt("12")` turns text into an `int`; `Integer.valueOf()` returns an `Integer`. `Integer` values from **−128 to 127** are cached, so `==` on two boxed 127s is `true` but on two boxed 128s is `false` (Program J12). Unboxing a `null` wrapper throws `NullPointerException`.

Note (also asked): `int Integer = 24; char String = 'I';` compiles, because `Integer` and `String` are class names, not keywords; printing them gives `24I`.

---

## 17. ⭐ Asked in DSSSB: Java platform facts

| Term | What it is | Contains |
|---|---|---|
| **JVM** (Java Virtual Machine) | Abstract machine that loads, verifies and executes **bytecode** | ClassLoader, bytecode verifier, interpreter, **JIT** compiler, garbage collector |
| **JRE** (Java Runtime Environment) | What you need to **run** Java programs | JVM + core class libraries |
| **JDK** (Java Development Kit) | What you need to **develop** Java programs | JRE + tools: `javac` (compiler), `java` (launcher), `javadoc`, `jdb` (debugger), `jar` |

So JDK ⊃ JRE ⊃ JVM. (From Java 11, Oracle ships only the JDK; the idea of the JRE is unchanged.)

- `javac Hello.java` produces **`Hello.class`** containing **bytecode**, the platform-independent instruction set of the JVM.
- **Platform independence** ("Write Once, Run Anywhere"): the same `.class` file runs on any OS that has a JVM. The **bytecode** is platform-independent; the **JVM itself is platform-dependent** (a different JVM for Windows, Linux, macOS).
- **JIT (Just-In-Time) compiler**: part of the JVM that compiles frequently executed ("hot") bytecode into native machine code at run time, so it runs fast. (The same idea exists in .NET, where the JIT turns MSIL into native code.)

### ClassLoader hierarchy ⭐
| Loader | Loads | Parent |
|---|---|---|
| **Bootstrap** (also called **Primordial**) | Core Java classes (`java.lang.*`, `java.util.*`; `rt.jar` up to Java 8, the `java.base` module from Java 9). Written in native code. | **None** (it is the root; `String.class.getClassLoader()` returns `null`) |
| **Extension** (Java 8, `jre/lib/ext`) → renamed **Platform** ClassLoader in Java 9+ | Extension / platform modules | Bootstrap |
| **Application** (also called **System**) | Your classes from the **classpath** | Extension/Platform |

**Delegation model**: when asked to load a class, a loader first **delegates to its parent**; only if the parent cannot find the class does the loader try itself. This guarantees that core classes like `java.lang.String` always come from the Bootstrap loader and cannot be replaced by a user class. A class is identified by its name **plus** its loader.

⭐ Asked in DSSSB (2023): "_____ does NOT have any child ClassLoaders." → **System ClassLoader** (it is the bottom of the built-in chain; only user-written custom loaders would be its children). The Bootstrap/Primordial loader is the one with **no parent**. Checked on Java 21: the system loader is `AppClassLoader`, its parent is `PlatformClassLoader`, whose parent prints as `null` (Bootstrap).

---

## 18. ⭐ Asked in DSSSB: Packages

A **package** is a namespace that groups related classes and interfaces (like a folder).

```java
package com.school.exam;          // must be the FIRST statement (only comments before it)
import java.util.Scanner;         // single-type import
import java.util.*;               // type-import-on-demand: all public types of java.util
import static java.lang.Math.sqrt;  // static import (Java 5): use sqrt(...) directly

public class Result { /* ... */ }
```

Facts:
- Uses: **prevent naming conflicts** (two `Date` classes: `java.util.Date` and `java.sql.Date`), **controlled access** (default and protected access depend on packages), **encapsulation**/grouping, easier search and reuse.
- ⭐ Asked in DSSSB (2023), "Which is FALSE about packages?" → "**Packages cannot provide controlled access**" is FALSE. Packages prevent naming conflicts and are considered a form of data encapsulation (both true).
- Order in a file: `package` (at most **one**) → `import` statements (any number) → type declarations.
- **`java.lang` is imported automatically** (that is why `String`, `System`, `Math`, `Integer` need no import).
- `import java.util.*;` does **not** import sub-packages: `java.util.function.Function` still needs `import java.util.function.*;`. Packages are not nested for import purposes.
- `import` only lets you use short names; it does not copy code (unlike C's `#include`). You can always use the fully qualified name: `java.util.List<String> x;`.
- Naming convention: all **lowercase**, reverse internet domain (`com.oracle.xyz`, `in.gov.dsssb`). Names starting with `java.` are reserved.
- A class with no `package` statement is in the **unnamed (default) package**, and classes in it cannot be imported by classes in named packages.
- The directory structure must match: `com/school/exam/Result.class`.
- Built-in packages: `java.lang`, `java.util` (collections, Scanner), `java.io` (streams, files), `java.net`, `java.sql` (JDBC), `java.awt`, `javax.swing`.

---

## 19. ⭐ Asked in DSSSB: C++ streams, `new` and `delete`

`#include <iostream>` gives the standard stream objects in namespace `std`:

| Object | Class | Purpose |
|---|---|---|
| `cin` | `istream` | Standard input; `>>` is the **extraction** operator |
| `cout` | `ostream` | Standard output; `<<` is the **insertion** operator |
| `cerr` | `ostream` | Standard error, **unbuffered** |
| `clog` | `ostream` | Standard error, buffered |

- `cin >> x` skips leading whitespace and stops at the next whitespace, so it reads one word, and it **leaves the `'\n'` in the buffer**.
- `getline(cin, s)` (`<string>`) reads a whole line **including spaces** up to `'\n'`, and discards the `'\n'`. For char arrays: `cin.getline(arr, size)`.
- `cin.get(ch)` reads **one character including whitespace**; `cin.get()` returns it.
- ⭐ **`cin.ignore(n, delim)`** extracts and **discards up to n characters**, stopping early once it has extracted (and discarded) `delim`. `ignore()` with no arguments discards one character. DSSSB 2023: `ignore(x, y)` "skips the first x characters and stops if character y is encountered".

```cpp
int age; string name;
cin >> age;                 // input "21\nRavi Kumar\n": reads 21, leaves '\n'
cin.ignore(100, '\n');      // throws away that leftover '\n'
getline(cin, name);         // name = "Ravi Kumar"
// Without ignore(), getline would read the leftover '\n' and name would be "".
```

Manipulators (`<iomanip>` for the ones with arguments):
- `endl` inserts `'\n'` **and flushes** the buffer (`"\n"` does not flush).
- `setw(n)` sets the field width for the **next item only**: `cout << setw(5) << 42 << "|" << 7;` prints `   42|7` (three spaces, right-aligned).
- `setprecision(n)`, `fixed`, `setfill(c)`, `left`/`right`, `hex`/`dec`/`oct` are "sticky" (stay until changed).

**`new` and `delete`** (operators, not library functions like `malloc`/`free`):
```cpp
int *p = new int(5);       // one int initialised to 5
int *a = new int[10];      // array of 10 ints
Point *q = new Point(1, 2);// calls the constructor (malloc would not)
delete p;                  // single object
delete[] a;                // array: must use delete[]
delete q;                  // calls the destructor, then frees
```
`new` returns a typed pointer (no cast needed), calls constructors, and throws `std::bad_alloc` on failure (`malloc` returns `NULL`). Memory that is never deleted is a **memory leak**; using a pointer after `delete` is a **dangling pointer**.

---

## 20. Worked "What is the output?" programs

Every Java program below was compiled and run with Java 21. The C++ programs are traced by hand on a standard compiler (`#include <iostream>` and `using namespace std;` assumed).

### C++ programs

**Program C1. Constructor and destructor order (multilevel)**
```cpp
class A { public: A() { cout << "A "; }  ~A() { cout << "~A "; } };
class B : public A { public: B() { cout << "B "; }  ~B() { cout << "~B "; } };
class C : public B { public: C() { cout << "C "; }  ~C() { cout << "~C "; } };
int main() { C obj; return 0; }
```
Output: `A B C ~C ~B ~A`
Trace: creating `C` first builds its B part, which first builds its A part, so bodies run A, B, C. At the end of `main`, destruction is the exact reverse.

**Program C2. Upcasting with virtual and non-virtual functions** ⭐
```cpp
class Base {
public:
    void show()          { cout << "Base show" << endl; }
    virtual void print() { cout << "Base print" << endl; }
};
class Derived : public Base {
public:
    void show()  { cout << "Derived show" << endl; }
    void print() { cout << "Derived print" << endl; }
};
int main() {
    Derived d;
    Base *p = &d;      // upcasting
    p->show();
    p->print();
}
```
Output:
```
Base show
Derived print
```
Trace: `show` is not virtual, so it is bound at compile time by the pointer type `Base*`. `print` is virtual, so it is bound at run time by the object type `Derived`.

**Program C3. Object slicing vs reference**
```cpp
// same Base and Derived as C2
int main() {
    Derived d;
    Base b = d;        // copies only the Base part (slicing)
    Base &r = d;
    b.print();
    r.print();
}
```
Output:
```
Base print
Derived print
```
Trace: `b` is a genuine `Base` object, so even a virtual call runs `Base::print`. `r` refers to the `Derived` object, so the virtual call dispatches to `Derived::print`.

**Program C4. Multiple inheritance and member objects**
```cpp
class M { public: M() { cout << "M "; } };
class A { public: A() { cout << "A "; } };
class B { public: B() { cout << "B "; } };
class C : public B, public A {
    M m;
public:
    C() { cout << "C "; }
};
int main() { C c; }
```
Output: `B A M C`
Trace: bases are built in the order listed in the class head (B, then A), then member objects (m), then the body of C.

**Program C5. When does the copy constructor run?**
```cpp
class T {
public:
    int v;
    T(int x) : v(x)          { cout << "P "; }
    T(const T &t) : v(t.v)   { cout << "C "; }
};
void f(T t) { cout << t.v << " "; }
int main() {
    T a(5);    // P
    T b = a;   // C  (initialisation, not assignment)
    T c(a);    // C
    f(a);      // C  (pass by value), then prints 5
    b = a;     // assignment operator: prints nothing
}
```
Output: `P C C C 5`

**Program C6. Static data member**
```cpp
class Count {
    static int n;
public:
    Count() { n++; }
    static int get() { return n; }
};
int Count::n = 0;
int main() {
    Count a, b;
    { Count c; }
    Count d[2];
    cout << Count::get();
}
```
Output: `5`
Trace: a, b (2), c (3; destroyed at `}`, but there is no destructor decrement), d[0], d[1] (5). One shared `n`.

**Program C7. Virtual destructor**
```cpp
class B { public: virtual ~B() { cout << "~B "; } };
class D : public B { public: ~D() { cout << "~D "; } };
int main() { B *p = new D; delete p; }
```
Output: `~D ~B`
Trace: the destructor is virtual, so `delete p` starts at `~D`, which then automatically calls `~B`. Without `virtual` the behaviour would be undefined (in practice usually only `~B` runs and the D part leaks).

**Program C8. Operator overloading**
```cpp
// Complex class from section 14
int main() {
    Complex a(2, 3), b(4, 5);
    Complex c = a + b;      // a.operator+(b)
    cout << c << endl;      // operator<<(cout, c)
}
```
Output: `6+8i`

**Program C9. Overload resolution**
```cpp
void f(int x)    { cout << "int "; }
void f(double x) { cout << "double "; }
int main() { f(5); f(5.5); f('A'); f(5.5f); }
```
Output: `int double int double`
Trace: `'A'` (char) is **promoted** to int; `5.5f` (float) is **promoted** to double. A promotion beats a conversion. (`f(5L)` would be a compile error: long→int and long→double are both conversions, so the call is ambiguous.)

**Program C10. Diamond with virtual base**
```cpp
class A { public: A() { cout << "A "; } };
class B : virtual public A { public: B() { cout << "B "; } };
class C : virtual public A { public: C() { cout << "C "; } };
class D : public B, public C { public: D() { cout << "D "; } };
int main() { D d; }
```
Output: `A B C D`
Trace: the single virtual base A is built first, by D. Without `virtual` in B and C, the output would be `A B A C D` (two A subobjects).

**Program C11. Friend function and base-constructor call**
```cpp
class Base {
protected:
    int x;
public:
    Base(int a) : x(a) { cout << "Base " << x << endl; }
};
class Der : public Base {
    int y;
public:
    Der(int a, int b) : Base(a), y(b) { cout << "Der " << x + y << endl; }
    friend int twice(const Der &d);
};
int twice(const Der &d) { return 2 * d.y; }   // friend may read private y
int main() {
    Der d(3, 4);
    cout << twice(d) << endl;
}
```
Output:
```
Base 3
Der 7
8
```
Trace: the initialiser list sends 3 to `Base`, which prints first; then `y = 4` and the body prints 3 + 4 = 7; `twice` returns 2 × 4 = 8. `x` is protected, so `Der` can use it.

**Program C12. `this` and method chaining**
```cpp
class Acc {
    int t = 0;
public:
    Acc& add(int n) { this->t += n; return *this; }
    int get() { return t; }
};
int main() { Acc a; cout << a.add(2).add(3).add(5).get(); }
```
Output: `10`
Trace: each `add` returns a reference to the same object, so the calls chain: 0 + 2 + 3 + 5.

### Java programs

**Program J1. Static blocks, instance blocks and constructors**
```java
class A {
    static { System.out.print("SA "); }
    { System.out.print("IA "); }
    A() { System.out.print("CA "); }
}
class B extends A {
    static { System.out.print("SB "); }
    { System.out.print("IB "); }
    B() { System.out.print("CB "); }
}
public class Main {
    public static void main(String[] args) {
        new B();
        System.out.println();
        new B();
    }
}
```
Output:
```
SA SB IA CA IB CB 
IA CA IB CB 
```
Trace: static blocks run once when the classes are loaded, parent first. For each object: parent instance block, parent constructor, child instance block, child constructor.

**Program J2. Overriding vs overloading resolution** ⭐
```java
class Animal {
    void sound() { System.out.println("Animal sound"); }
    void eat(Object o) { System.out.println("Animal eats Object"); }
}
class Dog extends Animal {
    @Override
    void sound() { System.out.println("Bark"); }
    void eat(String s) { System.out.println("Dog eats String"); }   // overload, NOT override
}
public class Main {
    public static void main(String[] args) {
        Animal a = new Dog();
        a.sound();
        a.eat("bone");
        Dog d = new Dog();
        d.eat("bone");
    }
}
```
Output:
```
Bark
Animal eats Object
Dog eats String
```
Trace: `sound()` is overridden, so the object type (Dog) decides. For `a.eat("bone")` the **compiler** picks an overload using the reference type `Animal`, which has only `eat(Object)`; Dog does not override that method, so `Animal`'s body runs. Through `Dog d`, the more specific `eat(String)` wins.

**Program J3. Field hiding vs method overriding** ⭐
```java
class Parent {
    int x = 10;
    void show() { System.out.println("Parent show " + x); }
}
class Child extends Parent {
    int x = 20;                       // hides Parent.x
    @Override
    void show() { System.out.println("Child show " + x); }
}
public class Main {
    public static void main(String[] args) {
        Parent p = new Child();
        System.out.println(p.x);
        p.show();
        System.out.println(((Child) p).x);
    }
}
```
Output:
```
10
Child show 20
20
```
Trace: **fields are not polymorphic**: `p.x` uses the reference type `Parent`. **Methods are**: `p.show()` runs Child's version, which sees Child's `x`. After the cast the reference type is `Child`, so 20.

**Program J4. Static vs instance variable**
```java
class Counter {
    static int s = 0;
    int i = 0;
    Counter() { s++; i++; }
}
public class Main {
    public static void main(String[] args) {
        Counter c1 = new Counter();
        Counter c2 = new Counter();
        Counter c3 = new Counter();
        System.out.println(c1.i + " " + c3.i + " " + Counter.s + " " + c1.s);
    }
}
```
Output: `1 1 3 3`
Trace: each object has its own `i` (always 1); all share one `s` (3). `c1.s` is the same shared variable.

**Program J5. `super` for constructor, method and field**
```java
class A {
    int v = 1;
    A() { System.out.println("A()"); }
    void m() { System.out.println("A.m " + v); }
}
class B extends A {
    int v = 2;
    B() { super(); System.out.println("B()"); }
    @Override
    void m() {
        super.m();
        System.out.println("B.m " + v + " " + super.v);
    }
}
public class Main {
    public static void main(String[] args) { new B().m(); }
}
```
Output:
```
A()
B()
A.m 1
B.m 2 1
```

**Program J6. String equality** ⭐
```java
public class Main {
    public static void main(String[] args) {
        String s1 = "Java";
        String s2 = "Java";
        String s3 = new String("Java");
        String s4 = s3.intern();
        String s5 = "Ja" + "va";
        String part = "Ja";
        String s6 = part + "va";
        System.out.println(s1 == s2);
        System.out.println(s1 == s3);
        System.out.println(s1.equals(s3));
        System.out.println(s1 == s4);
        System.out.println(s1 == s5);
        System.out.println(s1 == s6);
        System.out.println(s1.equals(s6));
    }
}
```
Output:
```
true
false
true
true
true
false
true
```
Trace: s1, s2, s4 and s5 (a compile-time constant) all refer to the pooled "Java". s3 and s6 are separate objects built at run time; `equals` compares characters.

**Program J7. Static method hiding**
```java
class P {
    static void hello() { System.out.println("P.hello"); }
    void hi() { System.out.println("P.hi"); }
}
class C extends P {
    static void hello() { System.out.println("C.hello"); }   // hides, does not override
    @Override
    void hi() { System.out.println("C.hi"); }
}
public class Main {
    public static void main(String[] args) {
        P r = new C();
        r.hello();
        r.hi();
    }
}
```
Output:
```
P.hello
C.hi
```
Trace: static methods are bound by the reference type (P); instance methods by the object type (C).

**Program J8. Overridden method called from a constructor**
```java
class Base {
    Base() { show(); }
    void show() { System.out.println("Base"); }
}
class Derived extends Base {
    int n = 5;
    Derived() { show(); }
    @Override
    void show() { System.out.println("Derived " + n); }
}
public class Main {
    public static void main(String[] args) { new Derived(); }
}
```
Output:
```
Derived 0
Derived 5
```
Trace: `Base()` runs first and calls `show()`, which dispatches to Derived's version even though Derived's field initialiser `n = 5` has not run yet, so `n` still holds its default 0. Then `n = 5` is set and `Derived()` calls `show()` again. (In C++ a virtual call inside a base constructor runs the **base** version instead.)

**Program J9. Overload resolution with primitives and boxing**
```java
public class Main {
    static void f(int x)     { System.out.println("int"); }
    static void f(long x)    { System.out.println("long"); }
    static void f(double x)  { System.out.println("double"); }
    static void f(Integer x) { System.out.println("Integer"); }
    static void f(Object x)  { System.out.println("Object"); }
    public static void main(String[] args) {
        byte b = 5;
        f(5); f(5L); f(5.0f); f(b); f('A'); f("hi");
        Integer boxed = 7;
        f(boxed);
    }
}
```
Output (one per line): `int`, `long`, `double`, `int`, `int`, `Object`, `Integer`
Trace: exact match first, then **widening** (byte→int, char→int, float→double), and only then boxing. `"hi"` matches only `Object`.

**Program J10. Two interfaces with the same default method**
```java
interface X {
    default void greet() { System.out.println("X"); }
    static void info() { System.out.println("X.info"); }
}
interface Y {
    default void greet() { System.out.println("Y"); }
}
class Z implements X, Y {
    @Override
    public void greet() {          // must override: X and Y both supply greet()
        X.super.greet();
        Y.super.greet();
        System.out.println("Z");
    }
}
public class Main {
    public static void main(String[] args) {
        new Z().greet();
        X.info();                  // static interface methods are called via the interface name
    }
}
```
Output: `X`, `Y`, `Z`, `X.info` (one per line)

**Program J11. equals and hashCode**
```java
import java.util.HashSet;
import java.util.Objects;
class Pt  { int x, y; Pt(int x, int y)  { this.x = x; this.y = y; } }
class Pt2 {
    int x, y;
    Pt2(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        if (!(o instanceof Pt2)) return false;
        Pt2 p = (Pt2) o;
        return x == p.x && y == p.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
    @Override public String toString() { return "(" + x + "," + y + ")"; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new Pt(1, 2).equals(new Pt(1, 2)));
        System.out.println(new Pt2(1, 2).equals(new Pt2(1, 2)));
        HashSet<Pt2> set = new HashSet<>();
        set.add(new Pt2(1, 2));
        set.add(new Pt2(1, 2));
        System.out.println(set.size() + " " + set);
    }
}
```
Output:
```
false
true
1 [(1,2)]
```
Trace: `Pt` inherits `Object.equals` (reference comparison). `Pt2` compares fields, and with a matching `hashCode` the set treats the two points as one; printing the set uses the overridden `toString`.

**Program J12. Integer cache and unboxing**
```java
public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        System.out.println(a == b);
        System.out.println(c == d);
        System.out.println(c.equals(d));
        int e = c;                      // auto-unboxing
        System.out.println(e == d);     // d is unboxed, numeric comparison
    }
}
```
Output: `true`, `false`, `true`, `true` (one per line)

---

## Exam traps
1. **Protected is less strict than default** in Java. Strictest first: private, default, protected, public.
2. A **final method** cannot be overridden but **can be overloaded and inherited**; a `final` reference can still have its object's contents changed.
3. **Return type alone** never distinguishes overloaded functions (compile error in C++ and Java).
4. **Static methods are not overridden** in Java; they are hidden, and the reference type decides (J7). Fields are hidden too, never overridden (J3).
5. In C++, without `virtual`, a call through a base pointer runs the **base** version (C2); through a base **object** even a virtual call is static (C3, slicing).
6. **Constructors cannot be virtual**; destructors should be virtual in a polymorphic base class.
7. Base classes are constructed in the order **listed in the class head**, not the order in the initialiser list; members in declaration order.
8. `T b = a;` calls the **copy constructor**; `b = a;` calls the **assignment operator**.
9. Operators that **cannot** be overloaded: `::` `.` `.*` `?:` `sizeof`. The ones that must be members: `=` `()` `[]` `->`.
10. Java classes support **no multiple inheritance**, but interfaces do; a class can `extend` one class and `implement` many interfaces at once.
11. `import java.util.*;` does **not** import `java.util.function` or any other sub-package; `java.lang` needs no import.
12. **Bootstrap has no parent; System/Application has no children** by default. The bytecode is platform-independent; the **JVM is not**.

## One-liners for revision
1. Object = instance of a class; class = blueprint.
2. Encapsulation = binding data and methods into one unit and hiding the data.
3. Abstraction = showing essentials, hiding implementation.
4. Inheritance = is-a; composition = has-a.
5. Polymorphism = one interface, many forms.
6. Compile-time polymorphism = function and operator overloading (early binding).
7. Run-time polymorphism = overriding via virtual functions / dynamic method dispatch (late binding).
8. Upcasting (derived to base) is implicit; downcasting needs a cast.
9. A class with a pure virtual function (`= 0`) is abstract in C++.
10. Abstract classes cannot be instantiated but can have constructors.
11. Interface fields are `public static final`; methods are `public abstract` unless `default`/`static`/`private`.
12. Java 8 added default and static interface methods; Java 9 added private interface methods.
13. C++ supports multiple inheritance; Java supports it only through interfaces.
14. Diamond problem in C++ is solved by `virtual` base classes.
15. Constructor: same name as class, no return type, can be overloaded, not inherited.
16. Copy constructor parameter must be a reference: `T(const T&)`.
17. Destructor: `~T()`, no parameters, one per class, reverse order of construction.
18. Initialiser list is required for const and reference members.
19. `this` = current object (a pointer in C++, a reference in Java).
20. `super(...)` / `this(...)` must be the first statement of a constructor.
21. A static member has one copy shared by all objects; a static function has no `this`.
22. Java static block runs once at class loading, before `main`.
23. C++ `class` members default private; `struct` members default public.
24. Protected = accessible in derived classes (asked in DSSSB).
25. A friend function is not a member but can access private members; friendship is not inherited, mutual or transitive.
26. Every Java class extends `Object`; override `equals` and `hashCode` together.
27. `==` compares references; `equals()` compares string contents.
28. Wrapper of `int` is `Integer`, of `char` is `Character`; autoboxing came in Java 5.
29. JDK = JRE + development tools; JRE = JVM + libraries.
30. `javac` produces bytecode (`.class`); the JIT compiles hot bytecode to native code.
31. ClassLoader delegation: a loader asks its parent first.
32. `package` must be the first statement; only one per file.
33. Packages prevent naming conflicts and provide controlled access.
34. `cin.ignore(n, delim)` discards up to n characters or through `delim`; `endl` = newline + flush.
35. `new` calls the constructor and throws `bad_alloc`; arrays need `delete[]`.

## Quick self-check
1. **Q:** In Java, put private, protected, public and default in descending order of strictness. **A:** private > default (package) > protected > public.
2. **Q:** `Base *p = new Derived; p->f();` where `f` is not virtual in Base. Which `f` runs? **A:** `Base::f` (static binding by pointer type).
3. **Q:** Which C++ operators cannot be overloaded? **A:** `::`, `.`, `.*`, `?:`, `sizeof` (also `typeid` and the named casts).
4. **Q:** Order of output for `class C : public B` where `B : public A`, all printing in constructor and destructor, for `C obj;`? **A:** A B C ~C ~B ~A.
5. **Q:** Can a Java interface have a method with a body? **A:** Yes, a `default` or `static` method (Java 8+) or a `private` method (Java 9+).
6. **Q:** Which ClassLoader has no parent, and which has no children by default? **A:** Bootstrap (Primordial) has no parent; System (Application) has no children.
7. **Q:** `Parent p = new Child();` both declare `int x` (10 and 20). What does `p.x` give? **A:** 10, because fields are resolved by the reference type.
8. **Q:** Is `static public void main(String... a)` a valid main method? **A:** Yes; modifier order is free and varargs is allowed.
9. **Q:** What does `cin.ignore(10, '\n')` do? **A:** Extracts and discards up to 10 characters, stopping after it discards a newline.
10. **Q:** Does `import java.awt.*;` let you use `java.awt.event.ActionEvent` by its short name? **A:** No; sub-packages are not imported, you need `import java.awt.event.*;`.
