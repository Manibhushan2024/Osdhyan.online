# Arrays, Strings & Pointers (C/C++)

**In 30 seconds**

- An array is a **fixed-size** block of **same-type** elements in **contiguous** memory, indexed from **0**. C does **no bounds checking**; Java does (`ArrayIndexOutOfBoundsException`).
- Missing initialisers become **0**: `int a[5] = {3, 7};` gives `3 7 0 0 0`. C stores 2-D arrays in **row-major** order. Row-major address: `B + W × [N × (i − Lr) + (j − Lc)]`, where N = number of columns.
- In most expressions an array name **decays** to a pointer to its first element, so **`a[i] == *(a + i) == i[a]`**. `sizeof(a)` gives the whole array's bytes; `sizeof` of a pointer gives only the pointer's size.
- A C string is a `char` array ending in **`'\0'`**. `strlen("Hello")` = 5 but `sizeof("Hello")` = 6. ⭐ `printf(6 + "Hello World")` prints **`World`**, because a string literal is a pointer to its first character.
- ⭐ `&` gives an address and `*` follows it: with `y = &x` and `x = 8`, `x * *y * x + *y` = **520**. Pointer arithmetic is **scaled** by the pointed-to type's size: an `int *` plus 1 moves 4 bytes.
- `*p++` reads then moves the pointer; `(*p)++` increments the value; `++*p` increments the value first; `*++p` moves first then reads.
- `malloc` (garbage contents), `calloc` (zeroed), `realloc` (resize), `free` are in `<stdlib.h>`; C++ uses `new`/`delete` and `new[]`/`delete[]`. Forgetting to free is a **memory leak**; using freed memory is a **dangling pointer**.
- A `struct` reserves space for **all** members (plus padding); a `union` reserves only the **largest** member, and all members share it.

---

## 1. One-dimensional arrays

```c
int a[5];                    /* 5 ints, indices 0..4; local => garbage values */
int b[5] = {1, 2, 3, 4, 5};
int c[] = {10, 20, 30};      /* size taken from the list: 3 */
int d[5] = {3, 7};           /* 3 7 0 0 0 : remaining elements become 0 */
int e[100] = {0};            /* all 100 elements 0 */
```

- The size must be a **positive integer constant** (C99 also allows variable-length arrays for local arrays).
- **Global and `static` arrays** are zero-filled automatically; **local** arrays without an initialiser hold garbage.
- More initialisers than the size (`int f[3] = {1, 2, 3, 4};`) is a constraint violation: an error in C++, at least a diagnostic in C.
- An array name is **not** a modifiable lvalue: `a++` and `a = b` are compile errors. Copy element by element (or with `memcpy`).
- C does no bounds check: `a[5]` on `int a[5]` compiles but is **undefined behaviour**.

**Address of an element (1-D)**

`Address(A[i]) = B + W × (i − LB)`, where B = base address, W = size of one element in bytes, LB = lower bound (0 in C).

- `int a[50]`, base 2000, W = 4: address of `a[15]` = 2000 + 4 × 15 = **2060**.
- `A[−5 … 15]`, W = 2, base 1000: address of `A[10]` = 1000 + 2 × (10 − (−5)) = 1000 + 30 = **1030**.
- Number of elements = UB − LB + 1 (here 15 − (−5) + 1 = 21).

---

## 2. Two-dimensional arrays

```c
int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
int n[2][3] = {{1}, {4, 5}};     /* 1 0 0 / 4 5 0 */
int k[2][3] = {1, 2, 3, 4};      /* fills row by row: 1 2 3 / 4 0 0 */
int r[][3]  = {1, 2, 3, 4, 5, 6}; /* first size may be omitted: 2 rows */
```

The **first** dimension may be omitted when initialising; the **column size can never be omitted** (`int r[2][] = ...` is an error). The same applies to a parameter: `void f(int m[][3])`.

**Row-major vs column-major**

- **Row-major** (C, C++, Pascal): the whole of row 0 is stored first, then row 1, and so on.
- **Column-major** (Fortran, MATLAB): the whole of column 0 first.

For `A[Lr … Ur][Lc … Uc]` with M = Ur − Lr + 1 rows and N = Uc − Lc + 1 columns:

| Order | Address of A[i][j] |
|---|---|
| Row-major | B + W × [ N × (i − Lr) + (j − Lc) ] |
| Column-major | B + W × [ (i − Lr) + M × (j − Lc) ] |

Worked example: `A[1 … 10][1 … 15]`, W = 4, B = 100. Find `A[5][7]`. Here M = 10, N = 15.

- Row-major: 100 + 4 × [15 × (5 − 1) + (7 − 1)] = 100 + 4 × (60 + 6) = 100 + 264 = **364**.
- Column-major: 100 + 4 × [(5 − 1) + 10 × (7 − 1)] = 100 + 4 × (4 + 60) = 100 + 256 = **356**.

C version (lower bounds 0): `int m[4][5]`, base 1000, W = 4. `&m[2][3]` = 1000 + 4 × (2 × 5 + 3) = 1000 + 52 = **1052**.

---

## 3. Arrays and pointers

### 3.1 Array decay

In an expression, the array name `a` becomes `&a[0]` (a pointer to the first element). Exceptions: the operand of **`sizeof`**, the operand of **`&`**, and a **string literal that initialises a `char` array**.

- `a` and `&a` hold the **same address** but different types: `a` is `int *` (after decay), `&a` is `int (*)[5]` (pointer to the whole array). So `a + 1` moves 4 bytes but `&a + 1` moves 20 bytes for `int a[5]`.
- `a[i]` is defined as `*(a + i)`. Since addition commutes, `*(a + i)` = `*(i + a)` = **`i[a]`**, which is legal C.

### 3.2 Arrays as function parameters

`void f(int arr[])`, `void f(int arr[10])` and `void f(int *arr)` are **identical**: the function receives a pointer. So:

- Changes made through `arr` change the **caller's array** (no copy is made).
- `sizeof(arr)` inside the function gives the **size of a pointer** (4 bytes on a 32-bit system, 8 on 64-bit), not the array. Always pass the length separately.

### 3.3 Declarations to read carefully

| Declaration | Meaning |
|---|---|
| `int *p, q;` | `p` is a pointer, **`q` is a plain `int`** |
| `int *p[5];` | Array of 5 pointers to int |
| `int (*p)[5];` | Pointer to an array of 5 ints |
| `int *f(int);` | Function returning `int *` |
| `int (*f)(int);` | Pointer to a function taking `int`, returning `int` |
| `int **pp;` | Pointer to pointer to int |

---

## 4. Strings in C

⭐ **Asked in DSSSB (7 Feb 2024, S2)**: a string is a sequence of characters that may consist of **letters, numbers (digits) and symbols** (all three).

```c
char s1[] = "Hello";                     /* 6 bytes: H e l l o \0 */
char s2[] = {'H', 'e', 'l', 'l', 'o', '\0'};   /* same as s1 */
char s3[10] = "Hi";                      /* H i \0 then 7 more '\0' */
char *s4 = "Hello";                      /* pointer to a read-only literal */
```

- **`'\0'`** (null character, value 0) marks the end. Every string function stops at it.
- `char s[] = "Hi"; s[0] = 'h';` is fine (the array is a modifiable copy). `char *p = "Hi"; p[0] = 'h';` is **undefined behaviour** (literals may be in read-only memory).
- `char s[5] = "Hello";` is legal in C (no room for `'\0'`, so it is not a proper string) but an **error in C++**.
- `'A'` is a character constant; `"A"` is a string of 2 bytes (`'A'`, `'\0'`). In C, `sizeof('A')` is **4** (a character constant has type `int`); in C++ it is **1**.
- A string literal is an array that decays to a pointer to its first character. So `"Hello" + 1` points to `"ello"` and `"Hello"[1]` is `'e'`.

### 4.1 Input and output

⭐ **Asked in DSSSB (25 Jun 2023, S2)**: `scanf()` is declared in **`<stdio.h>`** (string functions are in `<string.h>`, character tests such as `isdigit` in `<ctype.h>`).

| Function | Behaviour |
|---|---|
| `scanf("%s", name)` | Reads one word: stops at the first space, tab or newline. **No `&`** for a char array. Input `Ram Kumar` stores only `Ram`. |
| `scanf("%[^\n]", name)` | Scanset: reads up to the newline, spaces included |
| `gets(name)` | Reads a whole line, no size limit, so it can overflow. **Deprecated, then removed in C11.** |
| `fgets(name, n, stdin)` | Reads at most **n − 1** characters, **keeps the `'\n'`** if it fits, always adds `'\0'`. The safe choice. |
| `puts(s)` | Prints the string **and a newline** |
| `printf("%s", s)` | Prints the string, no automatic newline |
| `getchar()` / `putchar(c)` | One character in / out |

### 4.2 `<string.h>` functions

| Function | Returns / does |
|---|---|
| `strlen(s)` | Number of characters **before** `'\0'` (type `size_t`) |
| `strcpy(dest, src)` | Copies `src` (with `'\0'`) into `dest`; returns `dest`. **Destination first.** |
| `strncpy(dest, src, n)` | Copies at most n characters. If `src` has n or more characters, **no `'\0'` is added**; if shorter, pads with `'\0'`. |
| `strcat(dest, src)` | Appends `src` to the end of `dest`; `dest` must have room |
| `strncat(dest, src, n)` | Appends at most n characters, then `'\0'` |
| `strcmp(s1, s2)` | **0** if equal, **negative** if s1 < s2, **positive** if s1 > s2 (first differing character, by character code). Only the sign is guaranteed. |
| `strchr(s, c)` | Pointer to the **first** occurrence of `c`, or `NULL` |
| `strrchr(s, c)` | Pointer to the **last** occurrence of `c` |
| `strstr(s, sub)` | Pointer to the first occurrence of substring `sub`, or `NULL` |
| `strrev(s)`, `strupr`, `strlwr` | **Non-standard** (Turbo C, Microsoft). Not part of ISO C. |

`strcmp("Apple", "apple")` is negative because `'A'` (65) < `'a'` (97). Comparing strings with `==` compares **addresses**, not contents.

### 4.3 Length vs size

| Expression | Value | Why |
|---|---|---|
| `strlen("Hello")` | 5 | Characters before `'\0'` |
| `sizeof("Hello")` | 6 | Whole array including `'\0'` |
| `char s[10] = "Hi";` `strlen(s)` / `sizeof(s)` | 2 / 10 | Declared size vs content |
| `char *p = "Hello";` `sizeof(p)` | 4 (32-bit) or 8 (64-bit) | Size of the pointer only |
| `sizeof('A')` in C / C++ | 4 / 1 | `int` in C, `char` in C++ |

---

## 5. C++ `std::string` basics

```cpp
#include <iostream>
#include <string>
using namespace std;
int main() {
    string s = "Hello";
    s += " World";                       // concatenation with + or +=
    cout << s.length() << " "            // 11 (size() is the same)
         << s.substr(6, 3) << " "        // Wor  (start 6, length 3)
         << s.find("o") << " "           // 4    (first index; string::npos if absent)
         << s[1] << "\n";                // e
    cout << (s == "Hello World") << "\n"; // 1  (== compares contents)
    return 0;
}
// Output:
// 11 Wor 4 e
// 1
```

- `std::string` (header `<string>`) manages its own memory and grows as needed; `==`, `<`, `+` work on contents.
- `s.at(i)` is bounds-checked (throws `std::out_of_range`); `s[i]` is not.
- `s.c_str()` gives a C-style `const char *`. `getline(cin, s)` reads a whole line; `cin >> s` reads one word.

---

## 6. ⭐ Pointers

A pointer is a variable that **stores an address**.

```c
int x = 8;
int *y;        /* y can hold the address of an int */
y = &x;        /* & = "address of" */
*y = 10;       /* * = "value at" (dereference): x is now 10 */
```

- **`NULL`** (in `<stdio.h>`, `<stddef.h>`, `<stdlib.h>`) is a pointer that points nowhere. Dereferencing it is undefined behaviour (usually a crash). Always check `malloc`'s result against `NULL`.
- All data pointers on one platform have the **same size** whatever they point to: 4 bytes on 32-bit, 8 bytes on 64-bit.
- **Pointer to pointer**: `int **q = &p;` then `**q` is the `int`.

### 6.1 Pointer arithmetic

Adding n to a pointer moves it by **n × sizeof(pointed type)** bytes. If `p` holds 1000:

| Type of p | `p + 1` | `p + 3` |
|---|---|---|
| `char *` (1 byte) | 1001 | 1003 |
| `short *` (2 bytes) | 1002 | 1006 |
| `int *` (4 bytes) | 1004 | 1012 |
| `double *` (8 bytes) | 1008 | 1024 |

| Operation | Allowed? |
|---|---|
| pointer + integer, pointer − integer, `p++`, `p--` | Yes |
| pointer − pointer (same array) | Yes: gives the number of **elements** between them |
| `<`, `>`, `==`, `!=` between pointers into the same array | Yes |
| pointer + pointer, pointer × or ÷ anything | **No** (compile error) |

### 6.2 `void` pointers, wild and dangling pointers

- **`void *`** is a generic pointer that can hold any data address. It **cannot be dereferenced** without a cast: `*(int *)vp`. Standard C forbids arithmetic on it (GCC treats it as 1 byte as an extension). `malloc` returns `void *`; C converts it automatically, C++ needs a cast.
- **Wild pointer**: declared but not initialised, so it holds a garbage address.
- **Dangling pointer**: points to memory that is no longer valid, for example after `free(p)` or when a function returns the address of its local variable:

```c
int *bad(void) { int x = 10; return &x; }  /* x dies when bad() returns: dangling */
```

Fix: set `p = NULL` after `free`; return a `static` variable's address or `malloc`-ed memory.

### 6.3 `const` with pointers (read right to left)

| Declaration | Change `*p`? | Change `p`? | Name |
|---|---|---|---|
| `const int *p` (= `int const *p`) | No | Yes | Pointer to const |
| `int *const p` | Yes | No | Const pointer (must be initialised) |
| `const int *const p` | No | No | Const pointer to const |

```c
int a = 1, b = 2;
const int *p = &a;   /* pointer to const */
int *const q = &a;   /* const pointer */
p = &b;              /* OK */
/* *p = 5;  ERROR: assignment of read-only location */
*q = 5;              /* OK: a becomes 5 */
/* q = &b;  ERROR: assignment of read-only variable q */
```

### 6.4 Function pointers and structure pointers

- `int (*fp)(int, int) = add;` then `fp(2, 3)` or `(*fp)(2, 3)` both call `add`. A function name decays to its address, like an array name. Used for callbacks (e.g. the comparison function given to `qsort`).
- For `struct S *ptr`, **`ptr->m` is the same as `(*ptr).m`**. The brackets are needed because `.` binds tighter than `*`: `*ptr.m` means `*(ptr.m)`.

---

## 7. Dynamic memory

| Function (`<stdlib.h>`) | Effect |
|---|---|
| `malloc(bytes)` | Allocates a block; contents **garbage**; returns `void *` or `NULL` |
| `calloc(n, size)` | Allocates n × size bytes, **all set to 0**; two arguments |
| `realloc(p, newbytes)` | Resizes; keeps old contents (up to the smaller size); may move the block; `realloc(NULL, n)` acts like `malloc` |
| `free(p)` | Releases the block; `free(NULL)` does nothing; freeing twice is undefined behaviour |

C++: `int *p = new int(5);` / `delete p;` and `int *a = new int[n];` / `delete[] a;`. `new` calls constructors, needs no cast or `sizeof`, and throws `std::bad_alloc` on failure instead of returning `NULL`. Never mix `malloc` with `delete` or `new` with `free`.

**Memory leak**: memory is allocated but never freed, and the last pointer to it is lost (for example, `p = malloc(...)` twice without `free`). The memory stays reserved until the program ends. Dynamic memory comes from the **heap**; local variables live on the **stack**.

---

## 8. Structures, unions, enum and typedef

```c
struct Student {
    int roll;
    char name[20];
    float marks;
};
struct Student s1 = {12, "Asha", 91.5f};
struct Student *sp = &s1;
printf("%d %s\n", s1.roll, sp->name);   /* 12 Asha */
```

- Members are accessed with `.` (variable) or `->` (pointer). Structures can be **assigned** (`s2 = s1;` copies all members) but **not compared** with `==`.
- A structure cannot contain itself, but can contain a **pointer to its own type** (self-referential structure, used for linked lists): `struct Node { int data; struct Node *next; };`.
- **Padding**: each member is placed at an offset that is a multiple of its alignment (char 1, short 2, int 4 on a typical 32-bit-int GCC with 4-byte alignment), and the total size is rounded up to a multiple of the largest alignment. So member **order changes the size**. `#pragma pack(1)` (compiler-specific) removes padding.
- **Union**: all members start at the same address, so the size is the **largest member**, rounded up for alignment. Writing one member overwrites the others; only the last written member holds a meaningful value. Reading a different-type member (e.g. writing `int i = 65` and reading `char c`) depends on byte order: it gives `'A'` on little-endian x86.

| | struct | union |
|---|---|---|
| Memory | Sum of members + padding | Largest member (+ padding) |
| Members active at once | All | One |
| Use | Group related data | Save memory when only one field is needed at a time |

**enum**: named integer constants. Values start at 0 and go up by 1 unless set.

```c
enum Color { RED, GREEN = 5, BLUE };
printf("%d %d %d\n", RED, GREEN, BLUE);   /* 0 5 6 */
```

**typedef** gives a new name to an existing type (it does not create a new type): `typedef unsigned int uint;`, `typedef struct { int x, y; } Point;`. Trap: `typedef char *STR; STR a, b;` makes **both** pointers, but `#define STR char *` then `STR a, b;` expands to `char *a, b;`, so `b` is a plain `char`.

---

## 9. Worked "What is the output?" programs (C/C++)

Assume GCC, 32-bit `int`, 4-byte alignment, ASCII. `sizeof` results are printed with `%zu` (C99). Each trace below was checked twice by hand.

**Output 1 — partial initialisation and element count**

```c
#include <stdio.h>
int main(void) {
    int a[5] = {3, 7};
    int n = sizeof(a) / sizeof(a[0]);
    for (int i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\n%d\n", n);
    return 0;
}
```

Trace: `a` = {3, 7, 0, 0, 0}. `sizeof(a)` = 5 × 4 = 20, `sizeof(a[0])` = 4, so n = 5. Output:

```text
3 7 0 0 0 
5
```

**Output 2 — 2-D initialisation**

```c
#include <stdio.h>
int main(void) {
    int m[2][3] = {{1}, {4, 5}};
    int k[2][3] = {1, 2, 3, 4};
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++)
            printf("%d%d ", m[i][j], k[i][j]);
        printf("\n");
    }
    return 0;
}
```

Trace: `m` rows are {1, 0, 0} and {4, 5, 0} (braces fill each row separately). `k` fills row by row: {1, 2, 3} and {4, 0, 0}. Each pair prints `m` then `k` digits. Row 0: (1,1) (0,2) (0,3). Row 1: (4,4) (5,0) (0,0). Output:

```text
11 02 03 
44 50 00 
```

**Output 3 — ⭐ the DSSSB pointer expression**

⭐ **Asked in DSSSB (25 Jun 2023, S1)**.

```c
#include <stdio.h>
int main(void) {
    int x = 8, *y, z;
    y = &x;
    printf("%d\n", x * *y * x + *y);
    *y = *y + 2;
    printf("%d %d\n", x, *y);
    return 0;
}
```

Trace: `y` points to `x`, so `*y` = 8. Unary `*` binds tighter than binary `*`, so the expression is `((x * (*y)) * x) + (*y)` = 8 × 8 × 8 + 8 = 512 + 8 = **520**. Then `*y = 8 + 2` changes `x` itself to 10. (`z` is unused; that is not an error.) Output:

```text
520
10 10
```

**Output 4 — swapping pointers is not swapping values**

```c
#include <stdio.h>
int main(void) {
    int a = 1, b = 2;
    int *p = &a, *q = &b, *t;
    t = p; p = q; q = t;
    printf("%d %d %d %d\n", a, b, *p, *q);
    return 0;
}
```

Trace: only the addresses inside `p` and `q` are exchanged; `a` and `b` are untouched. Now `p` points to `b` (2) and `q` points to `a` (1). Output: **`1 2 2 1`**. (To swap the values, write `t = *p; *p = *q; *q = t;` with `int t`.)

**Output 5 — `*p++`, `(*p)++`, `++*p`, `*++p`**

```c
#include <stdio.h>
int main(void) {
    int a[] = {10, 20, 30, 40};
    int *p = a;
    int x;
    x = *p++;
    printf("%d %d\n", x, *p);
    x = (*p)++;
    printf("%d %d\n", x, a[1]);
    x = ++*p;
    printf("%d %d\n", x, a[1]);
    x = *++p;
    printf("%d %d\n", x, *p);
    printf("%d %d %d %d\n", a[0], a[1], a[2], a[3]);
    return 0;
}
```

Trace (postfix `++` binds tighter than `*`; prefix `++` and `*` group right to left):

| Statement | Means | x | p points to | Array |
|---|---|---|---|---|
| `x = *p++;` | `*(p++)`: read a[0], then move p | 10 | a[1] | 10 20 30 40 |
| `x = (*p)++;` | read a[1], then a[1]++ | 20 | a[1] | 10 21 30 40 |
| `x = ++*p;` | `++(*p)`: a[1] becomes 22, read it | 22 | a[1] | 10 22 30 40 |
| `x = *++p;` | `*(++p)`: move to a[2], read it | 30 | a[2] | 10 22 30 40 |

Output:

```text
10 20
20 21
22 22
30 30
10 22 30 40
```

**Output 6 — `a[i]`, `*(a + i)`, `i[a]` and pointer difference**

```c
#include <stdio.h>
int main(void) {
    int a[] = {5, 10, 15, 20};
    int *p = a + 1;
    printf("%d %d %d %d\n", a[2], *(a + 2), 2[a], p[1]);
    printf("%d %d\n", *p + 1, *(p + 1));
    printf("%d\n", (int)(&a[3] - p));
    return 0;
}
```

Trace: `a[2]`, `*(a + 2)` and `2[a]` are all a[2] = 15. `p` = &a[1], so `p[1]` = `*(p + 1)` = a[2] = 15. `*p + 1` = a[1] + 1 = 11 (dereference first, then add), while `*(p + 1)` = 15. `&a[3] − p` = 3 − 1 = 2 elements (not 8 bytes). Output:

```text
15 15 15 15
11 15
2
```

**Output 7 — 2-D array through pointers**

```c
#include <stdio.h>
int main(void) {
    int a[3][4] = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}};
    printf("%d %d %d\n", **a, *(*(a + 1) + 2), *(a[2] + 3));
    printf("%d %d\n", *(*a + 1), **(a + 2));
    printf("%zu %zu %zu\n", sizeof(a), sizeof(a[0]), sizeof(a[0][0]));
    return 0;
}
```

Trace: `a` decays to a pointer to row 0 (a row is 4 ints). `**a` = a[0][0] = 1. `a + 1` points to row 1; `*(a + 1)` is row 1 (decays to &a[1][0]); `+ 2` gives &a[1][2]; dereference gives **7**. `a[2] + 3` = &a[2][3], value **12**. `*a + 1` = &a[0][1], value **2**. `**(a + 2)` = a[2][0] = **9**. Sizes: whole array 12 × 4 = 48, one row 4 × 4 = 16, one element 4. (If `a` started at address 2000, `a + 1` would be 2016 but `*a + 1` would be 2004.) Output:

```text
1 7 12
2 9
48 16 4
```

**Output 8 — `strlen` vs `sizeof`**

```c
#include <stdio.h>
#include <string.h>
int main(void) {
    char s1[] = "Hello";
    char s2[10] = "Hi";
    char *s3 = "Hello";
    printf("%zu %zu\n", sizeof(s1), strlen(s1));
    printf("%zu %zu\n", sizeof(s2), strlen(s2));
    printf("%zu %zu\n", sizeof(s3), strlen(s3));
    printf("%zu\n", sizeof("Hi"));
    return 0;
}
```

Trace: `s1` is 6 bytes (5 letters + `'\0'`), length 5. `s2` was declared with 10 bytes, length 2. `s3` is a pointer: `sizeof` gives the pointer size, 4 on a 32-bit target (8 on a 64-bit one); `strlen` still counts 5. `"Hi"` is a 3-byte array. Output (32-bit target):

```text
6 5
10 2
4 5
3
```

**Output 9 — ⭐ string-literal pointer arithmetic**

⭐ **Asked in DSSSB (25 Jun 2023, S2)**: `printf(6+"Hello World");`

```c
#include <stdio.h>
int main(void) {
    printf(6 + "Hello World");
    printf("\n%s\n", "DSSSB" + 2);
    printf("%c %c %c\n", *("Exam" + 1), "Exam"[3], 3["Delhi"]);
    return 0;
}
```

Trace: `"Hello World"` decays to a pointer to `H` (index 0). Indices: H0 e1 l2 l3 o4 (space)5 W6. `6 + pointer` points to `W`, the **7th character**, so `printf` prints from there: **`World`**. `"DSSSB" + 2` skips `D`, `S`: prints `SSB`. `*("Exam" + 1)` = `'x'`; `"Exam"[3]` = `'m'`; `3["Delhi"]` = `"Delhi"[3]` = `'h'`. Output:

```text
World
SSB
x m h
```

In the actual paper the literal was printed broken across two lines (`"Hello World` then `");` on the next line). A string literal cannot contain a raw newline, so that version is a **compilation error**, which was the official answer. Read the code exactly as printed: with `\n` inside the quotes, the answer is `World`.

**Output 10 — walking a string with a pointer**

```c
#include <stdio.h>
int main(void) {
    char s[] = "HELLO!";
    char *p = s;
    while (*p) {
        printf("%c", *p);
        p += 2;
    }
    char *q = s;
    while (*q)
        q++;
    printf(" %d\n", (int)(q - s));
    return 0;
}
```

Trace: indices H0 E1 L2 L3 O4 !5 `'\0'`6. `p` visits 0 (`H`), 2 (`L`), 4 (`O`), then 6, where `*p` is `'\0'` and the loop stops. The second loop moves `q` to the `'\0'` at index 6, so `q − s` = 6, the string length. Output: **`HLO 6`**.

**Output 11 — `*p++` and `++*p` on characters**

```c
#include <stdio.h>
int main(void) {
    char str[] = "abc";
    char *p = str;
    printf("%c", *p++);
    printf("%c", *p);
    printf("%c", ++*p);
    printf(" %s\n", str);
    return 0;
}
```

Trace: `*p++` prints `a`, then `p` moves to `str[1]`. `*p` prints `b`. `++*p` increments `str[1]` from `'b'` to `'c'` and prints `c`. The array is now `"acc"`. Output: **`abc acc`**.

**Output 12 — `<string.h>` functions**

```c
#include <stdio.h>
#include <string.h>
int main(void) {
    char a[20] = "Hello";
    char b[] = "World";
    strcat(a, " ");
    strcat(a, b);
    printf("%s %zu\n", a, strlen(a));
    strcpy(b, "Hi");
    printf("%s %zu %zu\n", b, strlen(b), sizeof(b));
    printf("%d %d %d\n", strcmp("abc", "abd") < 0, strcmp("b", "a") > 0,
           strcmp("same", "same"));
    printf("%s %s\n", strchr("program", 'g'), strstr("database", "base"));
    return 0;
}
```

Trace: `a` becomes `"Hello "` and then `"Hello World"` (11 characters). `strcpy` puts `"Hi"` into `b`; `b` is still a 6-byte array, so `sizeof(b)` stays 6. `'c'` < `'d'` gives a negative result, so `< 0` is 1; `'b'` > `'a'` gives positive, so `> 0` is 1; equal strings give 0. `strchr` returns a pointer to the first `g` in `program`, printing `gram`; `strstr` returns a pointer to `base` inside `database`. Output:

```text
Hello World 11
Hi 2 6
1 1 0
gram base
```

**Output 13 — pointer to pointer**

```c
#include <stdio.h>
int main(void) {
    int x = 5;
    int *p = &x;
    int **q = &p;
    **q = 20;
    printf("%d %d %d\n", x, *p, **q);
    *p = *p + **q;
    printf("%d\n", x);
    return 0;
}
```

Trace: `*q` is `p`, so `**q` is `x`; it becomes 20, and all three expressions name the same `int`. Then `*p = 20 + 20` makes `x` 40. Output:

```text
20 20 20
40
```

**Output 14 — function pointers**

```c
#include <stdio.h>
int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }
int main(void) {
    int (*fp)(int, int) = add;
    printf("%d ", fp(2, 3));
    fp = mul;
    printf("%d ", (*fp)(4, 5));
    int (*ops[2])(int, int) = {add, mul};
    printf("%d\n", ops[0](6, 7) + ops[1](2, 2));
    return 0;
}
```

Trace: `fp(2, 3)` calls `add`, giving 5. After `fp = mul`, `(*fp)(4, 5)` = 20. `ops` is an array of two function pointers: `add(6, 7)` = 13 plus `mul(2, 2)` = 4 gives 17. Output: **`5 20 17`**.

**Output 15 — structure pointer and `->`**

```c
#include <stdio.h>
struct Point { int x, y; };
int main(void) {
    struct Point s = {3, 4};
    struct Point *ptr = &s;
    ptr->x += 10;
    (*ptr).y *= 2;
    struct Point t = s;      /* structure assignment copies members */
    t.x = 0;
    printf("%d %d %d\n", s.x, ptr->y, t.x);
    return 0;
}
```

Trace: `ptr->x += 10` makes `s.x` 13. `(*ptr).y *= 2` makes `s.y` 8. `t` is a separate copy, so setting `t.x = 0` does not change `s`. Output: **`13 8 0`**.

**Output 16 — arrays are passed as pointers**

```c
#include <stdio.h>
void doubleAll(int arr[], int n) {
    for (int i = 0; i < n; i++)
        arr[i] *= 2;
}
int main(void) {
    int a[] = {1, 2, 3};
    doubleAll(a, 3);
    printf("%d %d %d\n", a[0], a[1], a[2]);
    return 0;
}
```

Trace: `arr` receives `&a[0]`, so each `arr[i] *= 2` changes the caller's array. Output: **`2 4 6`**. (Inside `doubleAll`, `sizeof(arr)` would be the pointer size, 4 on 32-bit, not 12.)

**Output 17 — structure and union sizes**

```c
#include <stdio.h>
struct A { char c; int i; char d; };
struct B { int i; char c; char d; };
struct C { char c; short s; int i; };
union  U { int i; char name[6]; };
int main(void) {
    printf("%zu %zu %zu %zu\n", sizeof(struct A), sizeof(struct B),
           sizeof(struct C), sizeof(union U));
    return 0;
}
```

Trace (char 1, short 2, int 4; alignment equals size):

- `struct A`: `c` at offset 0; 3 padding bytes so `i` starts at 4; `i` occupies 4–7; `d` at 8; total 9 rounded up to a multiple of 4 = **12**.
- `struct B`: `i` 0–3, `c` at 4, `d` at 5; total 6 rounded up to **8**.
- `struct C`: `c` at 0, 1 padding byte, `s` at 2–3, `i` at 4–7: **8**.
- `union U`: largest member is 6 bytes; rounded up to a multiple of 4 (the alignment of `int`) = **8**.

Output: **`12 8 8 8`**. Without padding the members of A and B take 6 bytes each; reordering members changed the size from 12 to 8.

**Output 18 — union members share memory**

```c
#include <stdio.h>
union Pair { int x; int y; };
int main(void) {
    union Pair u;
    u.x = 5;
    u.y = 9;
    printf("%d %d %zu\n", u.x, u.y, sizeof(u));
    return 0;
}
```

Trace: `x` and `y` occupy the same 4 bytes. Writing 9 into `y` overwrites the 5 stored through `x`. Size = largest member = 4. Output: **`9 9 4`**. (The same members in a `struct` would print `5 9 8`.)

**Output 19 — `calloc` and `realloc`**

```c
#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *p = calloc(3, sizeof(int));
    if (p == NULL) return 1;
    printf("%d %d %d\n", p[0], p[1], p[2]);
    p[1] = 7;
    int *tmp = realloc(p, 5 * sizeof(int));
    if (tmp == NULL) { free(p); return 1; }
    p = tmp;
    printf("%d\n", p[1]);
    free(p);
    p = NULL;
    return 0;
}
```

Trace: `calloc` zero-fills the 3 ints. After `p[1] = 7`, `realloc` grows the block to 5 ints and keeps the old contents (new elements `p[3]`, `p[4]` are indeterminate, so they are not printed). The result goes into `tmp` so the original block is not lost if `realloc` fails. Output:

```text
0 0 0
7
```

**Output 20 — `a` vs `&a` and pointer scaling**

```c
#include <stdio.h>
int main(void) {
    int a[5] = {0};
    char c[5];
    printf("%d %d\n", (int)((char *)(a + 1) - (char *)a),
                      (int)((char *)(&a + 1) - (char *)a));
    printf("%d %d\n", (int)((char *)(c + 1) - (char *)c), (int)(&a[4] - &a[1]));
    return 0;
}
```

Trace: both differences are measured in bytes by casting to `char *`. `a + 1` moves one `int` = 4 bytes. `&a` has type "pointer to array of 5 ints", so `&a + 1` moves 20 bytes. `c + 1` moves 1 byte. `&a[4] − &a[1]` is measured in elements: 3. Output:

```text
4 20
1 3
```

**Output 21 — C++ references, `new` and `delete`**

```cpp
#include <iostream>
using namespace std;
int main() {
    int x = 10;
    int &r = x;          // r is another name for x
    r += 5;
    int *p = new int(5);
    int *arr = new int[3]{1, 2, 3};
    cout << x << " " << *p + arr[2] << endl;
    delete p;
    delete[] arr;        // [] form for arrays
    return 0;
}
```

Trace: `r += 5` changes `x` to 15. `*p` = 5 and `arr[2]` = 3, sum 8. Output: **`15 8`**.

---

## 10. Java arrays and Strings (for contrast)

Java arrays are **objects** on the heap, always bounds-checked. All outputs below were produced by running the code (Java 21).

```java
int[] a = new int[3];            // also legal: int a[] = new int[3];
double[] d = new double[2];
boolean[] b = new boolean[2];
char[] c = new char[2];
String[] s = new String[2];
System.out.println(a[0] + " " + d[0] + " " + b[0] + " " + (int) c[0] + " " + s[0]);
// 0 0.0 false 0 null      (default values are filled in automatically)

int[][] m = new int[2][3];
System.out.println(a.length + " " + m.length + " " + m[0].length);   // 3 2 3
int[][] jag = {{1}, {2, 3}, {4, 5, 6}};                              // jagged array
System.out.println(jag[2].length + " " + jag[1][1]);                // 3 3

System.out.println(a[3]);
// throws ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3

int[] p = {3, 1, 2};
int[] q = p;          // copies the reference, not the array
q[0] = 100;
System.out.println(p[0]);   // 100
```

- `arr.length` is a **field** (no brackets); `str.length()` is a **method**; `list.size()` is for collections.
- A 2-D Java array is an **array of arrays**, so rows may have different lengths (jagged).
- ⭐ **Asked in DSSSB (25 Jun 2023, S1)**: `int[] p = {121, 201, 017};` printed in a loop gives **`121 201 15`**, because a literal starting with `0` is **octal** (017 = 1 × 8 + 7 = 15).

**Java Strings**

```java
String s1 = "Java";
String s2 = "Java";               // same pooled object as s1
String s3 = new String("Java");   // new object on the heap
System.out.println(s1 == s2);          // true   (same reference)
System.out.println(s1 == s3);          // false  (different objects)
System.out.println(s1.equals(s3));     // true   (same contents)
System.out.println(s1 == s3.intern()); // true   (intern returns the pooled copy)

String t = "Hello";
t.concat(" World");               // result discarded: Strings are immutable
System.out.println(t);                          // Hello
t = t.concat(" World");
System.out.println(t + " " + t.length());       // Hello World 11
System.out.println("abc".compareTo("abd"));     // -1
```

- `String` objects are **immutable**: methods such as `concat`, `toUpperCase`, `replace` return a **new** String. Use `StringBuilder` (not synchronised) or `StringBuffer` (synchronised) for repeated changes.
- String **literals** are stored in the **string constant pool** and shared. `new String(...)` always creates a new object.
- `==` compares **references**; `.equals()` compares **contents**. This mirrors C, where `==` on two `char *` compares addresses and `strcmp` compares contents.

---

## Exam traps

1. ⭐ `printf(6 + "Hello World")` prints `World` (starts at the 7th character), not `6Hello World`. If the literal is broken across a line without `\n`, it is a compilation error.
2. ⭐ In `x * *y * x + *y` the `*` next to `y` is dereference, not multiplication by a pointer; with `x = 8` the answer is 520.
3. `strlen` excludes `'\0'`; `sizeof` of a char array includes it and counts the declared size: `char s[10] = "Hi"` gives 2 and 10.
4. `sizeof` on an array parameter or a `char *` gives the **pointer size**, not the array size.
5. `int *p, q;` declares only one pointer.
6. `*p++` increments the **pointer**; `(*p)++` and `++*p` increment the **value**.
7. Swapping two pointer variables does not swap the integers they point to.
8. Pointer subtraction gives a count of **elements**, not bytes; adding two pointers is illegal.
9. `strcmp` returns 0 for equal strings (so `if (strcmp(a, b))` is true when they **differ**); only the sign of a non-zero result is guaranteed.
10. `scanf("%s", ...)` stops at a space; `gets` was removed in C11; `fgets` keeps the newline.
11. Structure size is not always the sum of member sizes (padding); union size is the largest member, rounded up for alignment.
12. Java: `==` on Strings compares references; `"Java" == "Java"` is true (pool) but `new String("Java") == "Java"` is false.

## One-liners for revision

1. Array elements are stored contiguously and indexed from 0.
2. C does not check array bounds; Java throws `ArrayIndexOutOfBoundsException`.
3. Unlisted elements in a partial initialiser become 0.
4. Global and static arrays are zero-filled; local arrays hold garbage.
5. Row-major: B + W × [N × (i − Lr) + (j − Lc)], N = columns.
6. Column-major: B + W × [(i − Lr) + M × (j − Lc)], M = rows.
7. C, C++ and Pascal use row-major order; Fortran and MATLAB use column-major.
8. In a 2-D array declaration only the first dimension may be omitted.
9. An array name decays to a pointer to its first element, except with `sizeof` and `&`.
10. `a[i]` = `*(a + i)` = `*(i + a)` = `i[a]`.
11. An array name cannot be incremented or assigned.
12. Arrays are passed to functions as pointers, so changes affect the caller.
13. A C string ends with the null character `'\0'`.
14. `sizeof("Hello")` = 6; `strlen("Hello")` = 5.
15. `sizeof('A')` is 4 in C and 1 in C++.
16. `printf`, `scanf`, `gets`, `puts`, `fgets` are in `<stdio.h>`; string functions in `<string.h>`.
17. `strcpy(dest, src)` and `strcat(dest, src)`: destination comes first.
18. `strncpy` may leave the destination without `'\0'`.
19. `strrev`, `strupr`, `strlwr` are non-standard.
20. `strchr` finds the first occurrence of a character; `strstr` finds a substring.
21. `&` gives an address; `*` gives the value at an address.
22. Pointer arithmetic is scaled by the size of the pointed-to type.
23. A `void *` must be cast before dereferencing.
24. A wild pointer is uninitialised; a dangling pointer points to freed or dead memory.
25. `const int *p`: value fixed; `int *const p`: pointer fixed.
26. `int (*fp)(int)` is a function pointer; `int *fp(int)` is a function returning a pointer.
27. `ptr->m` is the same as `(*ptr).m`.
28. `malloc` leaves memory uninitialised; `calloc` zeroes it and takes two arguments.
29. `new`/`delete` pair together; `new[]`/`delete[]` pair together.
30. A memory leak is allocated memory that is never freed.
31. Struct size = members + padding; union size = largest member (aligned).
32. `enum` constants start at 0 and increase by 1 unless assigned.
33. `typedef` creates an alias, handled by the compiler; `#define` is text substitution by the preprocessor.
34. Java `arr.length` is a field; `String.length()` is a method.
35. Java Strings are immutable; literals are shared through the string pool.

## Quick self-check

1. `int A[0 … 9][0 … 19]` is stored row-major from address 500 with 2-byte elements. What is the address of `A[3][4]`?
   **Answer:** 500 + 2 × (3 × 20 + 4) = 500 + 128 = 628.
2. What does `printf("%s", "Computer" + 3);` print in C?
   **Answer:** `puter`.
3. `char s[] = "DSSSB";` What are `sizeof(s)` and `strlen(s)`?
   **Answer:** 6 and 5.
4. `int a[] = {2, 4, 6}; int *p = a;` What is the value of `*p + 1` and of `*(p + 1)`?
   **Answer:** 3 and 4.
5. After `int a[] = {1, 5}; int *p = a; int x = ++*p;`, what are `x` and `a[0]`?
   **Answer:** Both 2.
6. If `int *p` holds 2000 and `int` is 4 bytes, what does `p + 5` hold?
   **Answer:** 2020.
7. Which declaration lets you change the pointer but not the value it points to: `const int *p` or `int *const p`?
   **Answer:** `const int *p`.
8. `struct S { char a; int b; char c; };` With 4-byte alignment, what is `sizeof(struct S)`? And for `union { int b; char a[5]; }`?
   **Answer:** 12 and 8.
9. Which function allocates memory and sets it to zero?
   **Answer:** `calloc`.
10. In Java, what does `System.out.println(new String("A") == "A");` print?
    **Answer:** `false` (different objects; use `.equals()` to compare contents).
