# .NET Framework, C# & VB.NET Basics

**In 30 seconds**

- ⭐ .NET was developed by **Microsoft**; **.NET Framework 1.0 was released in 2002** (Windows only). Its open-source, cross-platform successor is .NET Core (2016), renamed simply **.NET** from version 5 (2020).
- ⭐ The **CLR (Common Language Runtime)** is the **execution engine** of .NET and the interface between a .NET application and the operating system: it loads code, JIT-compiles it, manages memory with the **garbage collector**, and handles security, threads and exceptions.
- ⭐ Compilers (C#, VB.NET, F#) produce **MSIL/CIL**, a **CPU- and platform-independent** instruction set that the **JIT compiler** converts into native machine code at run time.
- CTS defines all data types; CLS is the subset of rules every .NET language follows so they can work together; FCL/BCL is the class library.
- ⭐ A C# **constructor** has the **same name as the class** and **no return type** (not even `void`); it can be overloaded; a **static constructor** runs once and takes no parameters or access modifier.
- ⭐ **Hashtable** stores key/value pairs and gives access to an element by its **unique key**.
- ⭐ VB.NET **RadioButton** = choose **one** option from many (mutually exclusive); **CheckBox** = choose **any number** of options.
- About 7 of the 46 DSSSB Programming questions (2023–2024) were on .NET, even though it is not in the official syllabus line.

---

## 1. What .NET is

| Point | Fact |
|---|---|
| Developer | ⭐ **Microsoft** |
| First release | ⭐ **.NET Framework 1.0, February 2002**, with Visual Studio .NET (announced in 2000; betas 2000–2001) |
| Key versions | 2.0 (2005, generics), 3.0 (2006, WPF/WCF/WF), 3.5 (2007, LINQ), 4.0 (2010), 4.5 (2012), 4.8/4.8.1 (last versions of .NET Framework) |
| .NET Core | 2016; open source, **cross-platform** (Windows, Linux, macOS) |
| .NET 5 and later | 2020 onwards: .NET Core and .NET Framework lines unified under the name ".NET" (.NET 6, 8 and 10 are long-term-support releases) |
| Languages | C# (Anders Hejlsberg), VB.NET, F#, C++/CLI, and others |
| Main idea | Write in any .NET language → compile to common intermediate code → run on the CLR, using one shared class library |

⭐ **Asked in DSSSB (25 Jun 2023, S1)**: ".NET is developed by ______ and was launched in ______." Answer: **Microsoft; 2002**. (2010 is .NET 4.0; Oracle and Google are distractors.)

---

## 2. Architecture of the .NET Framework

From bottom to top: **Operating system → CLR → Framework Class Library (BCL + ADO.NET, XML, Windows Forms, ASP.NET, WPF …) → CLS-compliant languages (C#, VB.NET …) → your application**.

### CLR: Common Language Runtime ⭐

⭐ **Asked in DSSSB (24 Jun 2023, S3)**: "the execution engine for .NET applications and the interface between .NET applications and the operating system". Answer: **CLR** (distractors: FCL, CTS, CLS).

The CLR is the run-time environment (the .NET "virtual machine"). Its services:

| Service | What it does |
|---|---|
| Class loader | Loads assemblies and the types (classes) in them into memory |
| **JIT compiler** | Converts MSIL into native machine code for the current CPU |
| **Garbage collector (GC)** | Automatic memory management: allocates objects on the managed heap and frees objects that are no longer referenced. Uses **generations 0, 1, 2** (young objects are collected most often) |
| Code verification / security | Checks that the IL is type-safe; enforces security permissions |
| Type checker | Ensures operations match the types defined by CTS |
| **Exception manager** | Provides structured exception handling across languages |
| Thread support | Manages multithreaded execution |
| Debug engine, COM marshaller | Debugging support; interoperation with COM components |

Code that runs under the control of the CLR is called **managed code**.

### CTS, CLS, FCL/BCL

| Component | Meaning |
|---|---|
| **CTS** (Common Type System) | Defines how types are declared, used and managed in the runtime, so that all languages share the same types. Divides types into **value types** and **reference types**. Example: C# `int` and VB.NET `Integer` are both `System.Int32` |
| **CLS** (Common Language Specification) | A **subset of CTS**: the minimum set of rules a language must follow so that code written in it can be used from any other .NET language (cross-language interoperability). Example: unsigned types like `uint` are not CLS-compliant; names differing only in case are not CLS-compliant |
| **FCL** (Framework Class Library) | The large, reusable library of classes, interfaces and value types available to every .NET language (Windows Forms, ASP.NET, ADO.NET, XML, WPF …) |
| **BCL** (Base Class Library) | The core part of the FCL: `System`, `System.IO`, `System.Collections`, `System.Text`, `System.Threading` … |

### MSIL / CIL and the JIT compiler ⭐

⭐ **Asked in DSSSB (24 Jun 2023, S3)**: "______ is a code that consists of a CPU and platform-independent set of instructions, which can be easily converted to the native code." Answer: **MSIL** (distractors: DLL, FCL, **JIT**; JIT is the converter, not the code).

- **MSIL** (Microsoft Intermediate Language), standardised as **CIL** (Common Intermediate Language), often just **IL**.
- Compilation in .NET happens in **two steps**:
  1. **Language compiler** (`csc` for C#, `vbc` for VB.NET): source code → **MSIL + metadata**, stored in an **assembly** (`.exe` or `.dll`).
  2. **JIT compiler** (inside the CLR), at run time: MSIL → **native machine code**, method by method, the first time each method is called. The native code is cached for the rest of that run.
- Because every .NET language compiles to the same IL, the same CLR runs them all. IL can be viewed with the **ILDasm** tool.

**Types of JIT compiler** (classic textbook classification)

| Type | How it works |
|---|---|
| **Pre-JIT** | Compiles the **whole** assembly to native code at once, at deployment/installation time (the **NGen.exe** Native Image Generator) |
| **Econo-JIT** | Compiles only the methods called at run time and may discard the native code when memory is low; small memory footprint |
| **Normal JIT** (default) | Compiles each method when it is **first called** and **caches** the native code for later calls |

(Modern .NET adds tiered compilation, ReadyToRun images and Native AOT, but the three types above are what exams ask.)

### Managed vs unmanaged code

| Managed code | Unmanaged code |
|---|---|
| Compiled to IL and executed by the **CLR** | Compiled straight to machine code; runs directly on the OS, outside the CLR |
| Gets garbage collection, type safety, security checks, exception handling | Programmer manages memory (e.g. `malloc`/`free` in C) |
| C#, VB.NET code | C/C++ native code, COM components, Win32 APIs |

Managed code calls unmanaged code through **P/Invoke** (platform invoke) or **COM Interop**. C# can also contain `unsafe` blocks that use pointers.

### Assemblies

An **assembly** is the unit of **deployment, versioning, reuse and security** in .NET: a compiled `.exe` or `.dll` file (a PE file) containing:

| Part | Content |
|---|---|
| **Manifest** | Assembly metadata: name, version (major.minor.build.revision), culture, public key token, list of files, references to other assemblies |
| **Type metadata** | Description of every type and member defined in the assembly (makes assemblies self-describing; used by reflection) |
| **MSIL code** | The compiled intermediate code |
| Resources | Images, strings and other resources |

| Kind | Meaning |
|---|---|
| **Private assembly** | Used by one application; kept in that application's folder |
| **Shared (public) assembly** | Used by several applications; must have a **strong name** (name + version + culture + public key) and is installed in the **GAC** |
| **Satellite assembly** | Holds only culture-specific resources (localisation) |

The **GAC (Global Assembly Cache)** is the machine-wide store for shared assemblies in .NET Framework (managed with `gacutil`). Modern .NET (Core/5+) does not use a GAC.

### Namespaces

A **namespace** is a logical grouping of related types that avoids name clashes, e.g. `System`, `System.IO`, `System.Collections.Generic`. In C# `using System;` (in VB.NET `Imports System`) lets you write `Console` instead of `System.Console`. One assembly can contain several namespaces, and one namespace can span several assemblies.

---

## 3. C# basics

C# (pronounced "C sharp") is Microsoft's object-oriented, type-safe language for .NET, designed by Anders Hejlsberg (first released with .NET in 2002). It is **case-sensitive**, statements end with `;`, and execution starts at `static void Main()`.

### Value types vs reference types

| Value types | Reference types |
|---|---|
| Variable holds the **data itself** | Variable holds a **reference** (address) to an object on the **managed heap** |
| Usually on the stack (or inline in an object) | Object on the heap, collected by the GC |
| Assignment **copies the value** | Assignment copies the **reference** (both variables refer to one object) |
| `int`, `long`, `double`, `float`, `decimal`, `char`, `bool`, `byte`, **`struct`**, **`enum`** | **`class`**, `interface`, `delegate`, `string`, arrays, `object` |
| Derive from `System.ValueType`; cannot be `null` unless nullable (`int?`) | Default value is `null` |

All types finally derive from **`System.Object`**.

**Boxing** = converting a value type to `object` (implicit; the value is copied into a new heap object). **Unboxing** = converting it back (explicit cast; an `InvalidCastException` occurs if the type is wrong).

```csharp
int n = 10;
object o = n;      // boxing: o holds a copy of 10
n = 20;
int m = (int)o;    // unboxing
Console.WriteLine(n + " " + o + " " + m);   // 20 10 10
```

### class vs struct

| `class` | `struct` |
|---|---|
| Reference type | Value type |
| Supports inheritance | Cannot inherit from another class/struct (can implement interfaces); implicitly sealed |
| Can have a finalizer (destructor) | No finalizer |
| Default value `null` | Default value: all fields zero |

### Properties

A property gives controlled access to a private field through `get` and `set` accessors; an **auto-implemented property** lets the compiler create the field:

```csharp
public string Name { get; set; }          // read-write
public int Roll { get; private set; }     // read-only from outside the class
```

### Constructors ⭐

⭐ **Asked in DSSSB (25 Jun 2023, S1)**: "Which is FALSE with reference to constructors in C#.NET?" Answer: **"It can have a return type."** The true statements were: all classes have a constructor by default, its name must match the class name, and it is called when the object is created.

Rules to remember:

1. A constructor has the **same name as the class**.
2. It has **no return type, not even `void`** (writing a return type makes it an ordinary method).
3. It is called **automatically** when an object is created with `new`; it initialises the object.
4. Constructors can be **overloaded** (several constructors with different parameter lists).
5. **Default constructor**: if a class declares **no** constructor, the compiler supplies a public parameterless one. If you write **any** constructor, this default is **not** supplied.
6. **Static constructor**: `static ClassName() { … }` has **no access modifier and no parameters**, there is **only one** per class, it **cannot be called directly**, and it runs **once**, automatically, before the first object is created or any static member is used. It initialises static data.
7. **Constructor chaining**: `: this(…)` calls another constructor of the **same** class; `: base(…)` calls a constructor of the **base** class. The base-class constructor always runs **before** the derived-class constructor body.
8. **Private constructor**: prevents creating objects from outside the class (used for the Singleton pattern and classes with only static members).
9. Constructors are **not inherited** and cannot be `virtual`, `abstract` or `override`.
10. A **destructor/finalizer** `~ClassName()` has no parameters or modifiers and is called by the garbage collector (it compiles to `Finalize()`).

**Output question.** What is the output of the following C# program?

```csharp
using System;

class Student
{
    public string Name { get; set; }
    public int Roll { get; private set; }
    static int count;

    static Student()              // static constructor
    {
        count = 0;
        Console.WriteLine("Static constructor");
    }
    public Student() : this("Unknown", 0)   // chains to the 2-parameter constructor
    {
        Console.WriteLine("Default constructor");
    }
    public Student(string name, int roll)
    {
        Name = name;
        Roll = roll;
        count++;
        Console.WriteLine("Parameterised constructor: " + name);
    }
    public static int Count { get { return count; } }
}

class Program
{
    static void Main()
    {
        Student a = new Student();
        Student b = new Student("Asha", 5);
        Console.WriteLine(Student.Count + " " + a.Name + " " + b.Roll);
    }
}
```
Output:
```text
Static constructor
Parameterised constructor: Unknown
Default constructor
Parameterised constructor: Asha
2 Unknown 5
```
The static constructor runs once, first. `: this("Unknown", 0)` runs the chained constructor **before** the body of the parameterless one.

### Inheritance and polymorphism

- Syntax: `class Dog : Animal { … }` (the colon means "inherits from" and also "implements").
- C# allows **single class inheritance** only; a class can implement **many interfaces**.
- `virtual` (base) + `override` (derived) give **run-time polymorphism**: the method of the **actual object** runs.
- `new` on a derived member **hides** the base member: the method chosen depends on the **reference type** (no polymorphism).
- `sealed class` cannot be inherited (e.g. `System.String`); `sealed override` stops further overriding.
- `abstract class` cannot be instantiated and may have `abstract` methods (no body) that derived classes **must** override.
- `interface`: a contract of members with no implementation (C# 8+ allows default implementations); members are public by default; an interface cannot have instance fields or constructors.
- `base.Method()` calls the base-class version.

**Output question.** What is the output of the following C# program?

```csharp
using System;

class Animal
{
    public Animal() { Console.WriteLine("Animal()"); }
    public virtual void Speak() { Console.WriteLine("Animal speaks"); }
    public void Eat() { Console.WriteLine("Animal eats"); }
}
class Dog : Animal
{
    public Dog() : base() { Console.WriteLine("Dog()"); }
    public override void Speak() { Console.WriteLine("Dog barks"); }
    public new void Eat() { Console.WriteLine("Dog eats"); }
}
class Program
{
    static void Main()
    {
        Animal x = new Dog();
        x.Speak();
        x.Eat();
    }
}
```
Output:
```text
Animal()
Dog()
Dog barks
Animal eats
```
`Speak` is overridden, so the `Dog` version runs through an `Animal` reference. `Eat` is only hidden with `new`, so the `Animal` reference calls `Animal.Eat`.

### Access modifiers

| Modifier | Accessible from |
|---|---|
| `public` | Anywhere |
| `private` | Only inside the containing class/struct (**default for class members**) |
| `protected` | The containing class and classes **derived** from it |
| `internal` | Any code in the **same assembly** (**default for top-level classes**) |
| `protected internal` | Same assembly **OR** derived classes in any assembly |
| `private protected` (C# 7.2) | Derived classes **AND** only within the same assembly |

### Exception handling

```csharp
try
{
    int d = 0;
    Console.WriteLine(10 / d);
}
catch (DivideByZeroException e)
{
    Console.WriteLine("Caught: " + e.GetType().Name);
}
finally
{
    Console.WriteLine("Finally");
}
```
Output:
```text
Caught: DivideByZeroException
Finally
```

- All exceptions derive from `System.Exception`. Put **more specific** `catch` blocks before general ones (the compiler rejects a specific catch after `catch (Exception)`).
- `finally` always runs (cleanup); `throw` raises an exception; the `using` statement disposes an `IDisposable` object automatically.
- Common exceptions: `DivideByZeroException`, `NullReferenceException`, `IndexOutOfRangeException`, `InvalidCastException`, `FormatException` (e.g. `int.Parse("abc")`), `OverflowException`, `FileNotFoundException`, `KeyNotFoundException`.

---

## 4. Collections ⭐

⭐ **Asked in DSSSB (25 Jun 2023, S2)**: "the .NET collection class that enables an element to be accessed using a unique key". Answer: **Hashtable** (distractors: linked list, doubly linked list, ArrayList).

**Non-generic** collections (namespace `System.Collections`; store items as `object`):

| Class | Structure | Access |
|---|---|---|
| `ArrayList` | Dynamic (resizable) array | By **index**; `Add`, `Insert`, `Remove`, `RemoveAt`, `Count` |
| ⭐ **`Hashtable`** | Key/value pairs organised by the **hash code of the key** | By **unique key**: `ht[key]`; keys must be unique and non-null; order not guaranteed; `Add` with an existing key throws `ArgumentException` |
| `SortedList` | Key/value pairs **kept sorted by key** | By key **and** by index |
| `Stack` | **LIFO** | `Push`, `Pop`, `Peek` |
| `Queue` | **FIFO** | `Enqueue`, `Dequeue`, `Peek` |
| `BitArray` | Array of bits (booleans) | By index |

**Generic** collections (namespace `System.Collections.Generic`; type-safe, no boxing, preferred today):

| Generic class | Non-generic counterpart |
|---|---|
| `List<T>` | `ArrayList` |
| `Dictionary<TKey, TValue>` | `Hashtable` (missing key throws `KeyNotFoundException`; Hashtable returns `null`) |
| `SortedList<TKey, TValue>`, `SortedDictionary<TKey, TValue>` | `SortedList` |
| `Stack<T>`, `Queue<T>` | `Stack`, `Queue` |
| `HashSet<T>` | (unique values, no keys) |
| `LinkedList<T>` | (doubly linked list) |

**Output question.** What is the output of the following C# code?

```csharp
Hashtable ht = new Hashtable();
ht.Add("DL", "Delhi");
ht.Add("MH", "Mumbai");
ht["DL"] = "New Delhi";
Console.WriteLine(ht["DL"] + " " + ht.Count + " " + (ht["XX"] == null));

Stack<int> s = new Stack<int>();
s.Push(1); s.Push(2); s.Push(3);
Queue<int> q = new Queue<int>();
q.Enqueue(1); q.Enqueue(2); q.Enqueue(3);
Console.WriteLine(s.Pop() + " " + q.Dequeue() + " " + s.Peek() + " " + q.Count);
```
Output:
```text
New Delhi 2 True
3 1 2 2
```
Assigning `ht["DL"]` replaces the value (the key stays unique). A missing key in a Hashtable gives `null`.

---

## 5. VB.NET basics

VB.NET (Visual Basic .NET, 2002) is the object-oriented .NET successor of Visual Basic 6. It is **not case-sensitive**, has no semicolons, uses `'` (apostrophe) or `REM` for comments, `&` to join strings, `\` for integer division, `Mod` for remainder and `^` for power.

### Windows Forms controls ⭐

⭐ **Asked in DSSSB (25 Jun 2023, S1)**: control used "to select one option from a number of choices". Answer: **RadioButton** (distractors: Label, Button, ListBox).

| Control | Purpose | Key property | Key event |
|---|---|---|---|
| **Label** | Displays text the user cannot edit | `Text` | `Click` |
| **TextBox** | Single- or multi-line text entry | `Text`, `MultiLine`, `PasswordChar`, `ReadOnly`, `MaxLength` | `TextChanged` |
| **Button** | Performs an action when clicked | `Text` | `Click` |
| ⭐ **RadioButton** | Choose **exactly one** option from a group; options in one container (Form, GroupBox, Panel) are **mutually exclusive** | `Checked` | `CheckedChanged` |
| **CheckBox** | Choose **any number** (zero or more) of independent options | `Checked`, `CheckState` | `CheckedChanged` |
| **ListBox** | Shows a list of items; one or several can be selected | `Items`, `SelectedItem`, `SelectedIndex`, `SelectionMode` | `SelectedIndexChanged` |
| **ComboBox** | Drop-down list combined with a text box | `Items`, `DropDownStyle`, `Text` | `SelectedIndexChanged` |
| **PictureBox** | Displays an image | `Image`, `SizeMode` | `Click` |
| **Timer** | Raises an event at regular intervals (non-visual; appears in the component tray) | `Interval` (milliseconds), `Enabled` | **`Tick`** |
| **MenuStrip** | Menu bar at the top of a form | `Items` (ToolStripMenuItem) | `Click` of a menu item |
| **DataGridView** | Shows data in rows and columns (a grid) | `DataSource`, `Rows`, `Columns` | `CellClick` |
| **GroupBox / Panel** | Container that groups controls (e.g. separate RadioButton groups) | `Text` (GroupBox) | – |

A **ListBox** can be set to allow multiple selection (`SelectionMode = MultiSimple/MultiExtended`), so it is not "one option only"; for one-of-many the exam answer is the **RadioButton**.

### Events and event handlers

An **event** is an action the program can respond to (a click, a key press, a timer tick, a form loading). An **event handler** is the procedure that runs when the event occurs. In VB.NET the `Handles` clause connects them; `AddHandler`/`RemoveHandler` connect them at run time. `sender` is the control that raised the event and `e` carries event data.

```vbnet
Private Sub btnShow_Click(sender As Object, e As EventArgs) Handles btnShow.Click
    Dim msg As String = "Hello " & txtName.Text
    If rdoMale.Checked Then msg &= " (Male)"
    If chkHindi.Checked Then msg &= ", knows Hindi"
    lblMsg.Text = msg
End Sub
```

The default event of a Button is `Click`, of a TextBox `TextChanged`, of a Form `Load`, of a Timer `Tick`.

### Variables and data types

`Dim name As Type = value` declares a variable; `Const` declares a constant. `Option Explicit On` forces declaration; `Option Strict On` disallows implicit narrowing conversions.

| VB.NET type | Size / meaning | .NET type |
|---|---|---|
| `Boolean` | `True`/`False` | `System.Boolean` |
| `Byte` | 8-bit unsigned | `System.Byte` |
| `Short` | 16-bit integer | `System.Int16` |
| `Integer` | 32-bit integer | `System.Int32` |
| `Long` | 64-bit integer | `System.Int64` |
| `Single` / `Double` | 32-bit / 64-bit floating point | `System.Single` / `System.Double` |
| `Decimal` | 128-bit exact decimal (money) | `System.Decimal` |
| `Char` / `String` | One Unicode character / text | `System.Char` / `System.String` |
| `Date` | Date and time | `System.DateTime` |
| `Object` | Any type (the default if no type is given) | `System.Object` |

### Decisions and loops

**Output question.** What is the output of the following VB.NET program?

```vbnet
Module Module1
    Sub Main()
        Dim marks As Integer = 72
        Dim grade As String
        If marks >= 90 Then
            grade = "A"
        ElseIf marks >= 60 Then
            grade = "B"
        Else
            grade = "C"
        End If
        Console.WriteLine("Grade: " & grade)

        Dim day As Integer = 6
        Select Case day
            Case 1 To 5
                Console.WriteLine("Weekday")
            Case 6, 7
                Console.WriteLine("Weekend")
            Case Else
                Console.WriteLine("Invalid")
        End Select

        Dim total As Integer = 0
        For i As Integer = 1 To 10 Step 3
            total += i
        Next
        Console.WriteLine(total)

        Dim n As Integer = 1
        Do While n < 20
            n *= 3
        Loop
        Console.WriteLine(n)

        Console.WriteLine(7 \ 2 & " " & 7 / 2 & " " & 7 Mod 3 & " " & 2 ^ 3)
    End Sub
End Module
```
Output:
```text
Grade: B
Weekend
22
27
3 3.5 1 8
```
Trace: the `For` loop adds 1 + 4 + 7 + 10 = 22 (the `To` limit is **inclusive**). The `Do While` loop gives 1 → 3 → 9 → 27. `7 \ 2` is integer division (3); `7 / 2` is always a `Double` (3.5).

Loop forms: `For … To … Step … Next`, `For Each item In collection … Next`, `While … End While`, `Do While … Loop`, `Do Until … Loop`, `Do … Loop While/Until` (body runs at least once). Leave early with `Exit For` / `Exit Do`; skip with `Continue For`.

---

## 6. ASP.NET and ADO.NET

- **ASP.NET**: Microsoft's server-side framework for building dynamic **web** pages, web applications and web services on .NET (Web Forms `.aspx` pages with code-behind, MVC, Web API, Razor Pages).
- ASP.NET Core is its cross-platform, open-source rewrite.
- **ADO.NET**: the .NET **data-access** library for connecting to databases. Its objects are `Connection`, `Command`, `DataReader` (fast, forward-only, read-only, connected) and `DataAdapter` (fills a `DataSet`).
- A `DataSet` is a **disconnected**, in-memory collection of `DataTable`s. Data providers include `SqlClient` (SQL Server), `OleDb`, `Odbc`.

---

## Exam traps

1. The **execution engine** is the **CLR**, not the FCL (a library), CTS (type rules) or CLS (language rules).
2. **MSIL/CIL is the code**; **JIT is the compiler** that turns it into native code. "CPU-independent instructions" → MSIL.
3. .NET Framework 1.0 = **Microsoft, 2002**. 2010 is .NET 4.0; 2016 is .NET Core 1.0.
4. **CLS is a subset of CTS**; CTS covers all types, CLS only the interoperable part.
5. A C# constructor has **no return type, not even `void`**; a method with a return type and the class's name is just a method.
6. A **static constructor** takes **no parameters and no access modifier**, runs once, and cannot be called directly.
7. Writing **any** constructor removes the compiler-supplied default constructor.
8. `override` gives run-time polymorphism; `new` only **hides** the base method (the reference type decides).
9. **Hashtable** = access by **unique key**; **ArrayList** = access by index; **Stack** = LIFO; **Queue** = FIFO.
10. **RadioButton** = one of many (mutually exclusive); **CheckBox** = many; a **ListBox** may allow multiple selection.
11. A Timer's event is **`Tick`**, controlled by **`Interval`** in **milliseconds**.
12. VB.NET `\` is integer division and `/` gives a Double; `For i = 1 To 10` **includes** 10.

## One-liners for revision

1. .NET is a Microsoft software framework; .NET Framework 1.0 came out in 2002.
2. .NET Core (2016) is open source and cross-platform; from version 5 (2020) it is called .NET.
3. CLR = Common Language Runtime = the .NET execution engine.
4. The CLR provides JIT compilation, garbage collection, security, type safety, threading and exception handling.
5. Code executed under the CLR is managed code.
6. Unmanaged code runs directly on the OS (native C/C++, COM).
7. CTS = Common Type System: defines all .NET data types.
8. CLS = Common Language Specification: subset of CTS for cross-language interoperability.
9. FCL = Framework Class Library; BCL = its core part (System, System.IO, System.Collections).
10. MSIL = Microsoft Intermediate Language, also called CIL or IL.
11. MSIL is CPU- and platform-independent.
12. The JIT compiler converts MSIL into native code at run time.
13. Pre-JIT compiles the whole assembly at once (NGen); Normal JIT compiles and caches methods on first call; Econo-JIT compiles called methods and may discard them.
14. An assembly (.exe/.dll) is the unit of deployment and versioning.
15. The manifest holds the assembly's name, version, culture and references.
16. A private assembly is used by one application; a shared assembly needs a strong name and lives in the GAC.
17. GAC = Global Assembly Cache.
18. A namespace logically groups related types; `using` imports it in C#, `Imports` in VB.NET.
19. The garbage collector uses generations 0, 1 and 2.
20. Value types: int, double, char, bool, struct, enum. Reference types: class, interface, string, array, delegate.
21. Boxing: value type → object; unboxing: object → value type (explicit cast).
22. A struct is a value type and cannot inherit from another class or struct.
23. A constructor has the class's name and no return type.
24. Constructors can be overloaded but are not inherited.
25. `: this(...)` chains to a constructor of the same class; `: base(...)` to the base class.
26. A private constructor prevents creating objects from outside the class.
27. C# uses `:` for inheritance; a class has one base class and any number of interfaces.
28. A sealed class cannot be inherited; an abstract class cannot be instantiated.
29. `private` is the default access for class members; `internal` for top-level classes.
30. `protected internal` = same assembly OR derived; `private protected` = derived AND same assembly.
31. All exceptions derive from System.Exception; `finally` always runs.
32. Hashtable stores key/value pairs and is accessed by a unique key.
33. SortedList keeps key/value pairs sorted by key.
34. `List<T>` and `Dictionary<TKey,TValue>` are the generic versions of ArrayList and Hashtable.
35. RadioButton selects one option; CheckBox selects several.
36. ComboBox = TextBox + drop-down list; ListBox can allow multiple selection.
37. VB.NET declares variables with `Dim`; it is not case-sensitive and uses `'` for comments.
38. ADO.NET is for database access; ASP.NET is for web applications.

## Quick self-check

1. Which .NET component is the execution engine between the application and the OS?
   **Answer:** CLR (Common Language Runtime).
2. Who developed .NET, and when was .NET Framework 1.0 released?
   **Answer:** Microsoft, 2002.
3. What is the CPU-independent intermediate code produced by .NET compilers called?
   **Answer:** MSIL (also CIL or IL).
4. Which component converts MSIL into native machine code?
   **Answer:** The JIT (Just-In-Time) compiler inside the CLR.
5. Which is a subset of the other: CTS or CLS?
   **Answer:** CLS is a subset of CTS.
6. Where are shared (strong-named) assemblies stored in .NET Framework?
   **Answer:** In the GAC (Global Assembly Cache).
7. Can a C# constructor return `void`?
   **Answer:** No. A constructor has no return type at all.
8. How many times does a static constructor run, and can it take parameters?
   **Answer:** Once (before the first use of the class); it takes no parameters and no access modifier.
9. What is converting an `int` into an `object` called?
   **Answer:** Boxing.
10. Which .NET collection gives access to an element by a unique key?
    **Answer:** Hashtable (generic version: `Dictionary<TKey, TValue>`).
11. Which VB.NET control lets the user pick only one option from several?
    **Answer:** RadioButton.
12. Which Timer property sets how often the `Tick` event fires?
    **Answer:** `Interval` (in milliseconds).
