# Graphs: Representation, Traversal, MST & Shortest Paths

**In 30 seconds**
- Graph G = (V, E). **Handshake lemma: Σ deg(v) = 2|E|**, so the number of odd-degree vertices is always even.
- **Path graph Pₙ (n > 2): 2 vertices of degree 1 and n − 2 vertices of degree 2.** ⭐ Asked in DSSSB. Complete graph Kₙ has **n(n − 1)/2** edges; a tree has **n − 1** edges.
- Adjacency **matrix**: O(V²) space, O(1) edge test. Adjacency **list**: O(V + E) space, best for sparse graphs.
- **BFS uses a queue** (level by level, shortest path in unweighted graphs); **DFS uses a stack / recursion**. Both are **O(V + E)** with lists and **O(V²)** with a matrix.
- **Topological sort** exists only for a DAG (Kahn's in-degree method or reverse DFS finish order), O(V + E).
- **MST:** Prim's and Kruskal's are **greedy**; a spanning tree has V − 1 edges; Kₙ has **nⁿ⁻²** spanning trees.
- **Shortest paths:** Dijkstra (greedy, no negative edges), Bellman–Ford (negative edges allowed, detects negative cycles, O(VE)), Floyd–Warshall (all pairs, **dynamic programming**, O(V³)). ⭐ Asked in DSSSB: all-pairs shortest path is **not** divide and conquer.
- **Euler circuit:** connected and every degree even. **Euler path:** exactly 0 or 2 odd vertices. Hamiltonian = every vertex exactly once (no easy test).

---

## 1. Terminology

| Term | Meaning |
|---|---|
| Vertex (node) / edge (arc) | The points / the connections between them |
| Undirected graph | Edge {u, v} has no direction |
| Directed graph (digraph) | Edge (u, v) goes from u to v |
| Weighted graph | Every edge carries a number (cost, distance) |
| Adjacent | u and v are joined by an edge |
| Degree (undirected) | Number of edges at the vertex (a self-loop counts 2) |
| In-degree / out-degree | Edges coming in / going out (directed) |
| Isolated / pendant vertex | Degree 0 / degree 1 |
| Path | Sequence of vertices joined by edges; *simple* if no vertex repeats |
| Cycle | Path that starts and ends at the same vertex (simple: no other repeats) |
| Connected (undirected) | A path exists between every pair of vertices |
| Strongly connected (directed) | A **directed** path exists from u to v **and** v to u for every pair |
| Weakly connected (directed) | Connected when directions are ignored |
| Connected component | A maximal connected piece |
| Simple graph | No self-loops, no parallel edges (multigraph allows them) |
| Complete graph Kₙ | Every pair of vertices is joined: **n(n − 1)/2** edges |
| Bipartite graph | V splits into two sets with every edge going across; ⇔ **no odd-length cycle** |
| Tree | Connected and acyclic; **exactly n − 1 edges**; one unique path between any two vertices |
| Forest | Acyclic graph (collection of trees); with k trees it has n − k edges |
| DAG | Directed acyclic graph (has a topological order) |
| Subgraph / spanning subgraph | Part of a graph / a part that keeps all vertices |
| Sparse / dense | E close to V / E close to V² |

**Key counts**
| Quantity | Value |
|---|---|
| Handshake lemma | Σ deg(v) = 2|E| (directed: Σ in-deg = Σ out-deg = |E|) |
| Max edges, simple undirected | n(n − 1)/2 |
| Max edges, simple directed | n(n − 1) |
| Min edges for a connected graph | n − 1 |
| Edges of a k-regular graph | nk/2 |
| Edges of complete bipartite K_{m,n} | m·n |
| Labelled simple undirected graphs on n vertices | 2^(n(n − 1)/2) |

## 2. Special graphs ⭐

| Graph | Vertices | Edges | Degrees | Chromatic number |
|---|---|---|---|---|
| **Path Pₙ** ⭐ Asked in DSSSB | n | n − 1 | **2 vertices of degree 1, n − 2 of degree 2** (n > 2) | 2 |
| Cycle Cₙ (n ≥ 3) | n | n | All degree 2 | 2 if n even, 3 if n odd |
| Complete Kₙ | n | n(n − 1)/2 | All degree n − 1 | n |
| Star K₁,ₙ₋₁ | n | n − 1 | Centre n − 1, the other n − 1 vertices degree 1 | 2 |
| Wheel (cycle of k vertices + one hub) | k + 1 | 2k | Hub k, rim vertices 3 | 3 if k even, 4 if k odd |
| Complete bipartite K_{m,n} | m + n | mn | m vertices of degree n, n of degree m | 2 |

- **Path graph worked check:** P₅ = v1–v2–v3–v4–v5 has degrees 1, 2, 2, 2, 1 → two of degree 1 and 5 − 2 = 3 of degree 2. Degree sum = 8 = 2 × 4 edges. ✔
- **Wheel naming:** some books call the graph with n vertices Wₙ (hub + Cₙ₋₁), others call the graph with n + 1 vertices Wₙ (hub + Cₙ). Read the definition in the question.
- A path graph and a star are both trees; a cycle is not.

## 3. Representations

**Adjacency matrix:** V × V matrix, A[i][j] = 1 (or the weight) if edge i–j exists, else 0 (or ∞). Symmetric for an undirected graph; row sum = degree; the total of all entries = 2E (undirected).
**Adjacency list:** an array of V lists; list[u] holds the neighbours of u. Total list nodes = 2E (undirected) or E (directed).
**Incidence matrix:** V × E matrix, entry 1 if the vertex lies on the edge (directed: +1 / −1 for tail / head). Each column of an undirected graph has exactly two 1s.

| Operation | Adjacency matrix | Adjacency list | Incidence matrix |
|---|---|---|---|
| Space | **O(V²)** | **O(V + E)** | O(V × E) |
| Is (u, v) an edge? | **O(1)** | O(deg u) | O(E) |
| List neighbours of u | O(V) | **O(deg u)** | O(E) |
| Add an edge | O(1) | O(1) | Rebuild a column |
| Best for | Dense graphs, quick edge tests | Sparse graphs, traversals | Theory, edge-centred problems |

## 4. Breadth-first search (BFS)

- Uses a **queue**. Visit the start vertex, then all its neighbours, then their neighbours: **level by level** (the graph version of level-order traversal).
- Mark a vertex visited when it is **enqueued**, so it is never queued twice.
- The number of edges from the source in BFS = the **shortest path length in an unweighted graph**.
- The edges used form a **BFS tree**.

```
BFS(s): mark s; enqueue s
while queue not empty:
    u = dequeue(); visit u
    for each neighbour v of u (in the stated order):
        if v not marked: mark v; enqueue v
```

### Example graph G1 (undirected; neighbours taken in alphabetical order)
Edges: A–B, A–C, B–D, B–E, C–E, D–F, E–F
```
      A
     / \
    B   C
   / \ /
  D   E
   \ /
    F
```
**BFS from A — trace**
| Dequeue | Newly enqueued | Queue after |
|---|---|---|
| A | B, C | B C |
| B | D, E | C D E |
| C | — (E already marked) | D E |
| D | F | E F |
| E | — | F |
| F | — | empty |

**BFS order: A B C D E F.** Distances from A: A 0, B 1, C 1, D 2, E 2, F 3.

## 5. Depth-first search (DFS)

- Uses a **stack** (explicitly or through recursion). Go as deep as possible, then **backtrack**.
- Record **discovery time d[u]** (when first reached) and **finish time f[u]** (when all its neighbours are done).
- The edges used form a **DFS tree** (or forest).

```
DFS(u): mark u; visit u
    for each neighbour v of u (in the stated order):
        if v not marked: DFS(v)
```

**DFS of G1 from A:** A → B (first unvisited neighbour of A) → D → F → E (F's next neighbour) → C (E's unvisited neighbour); everything else is visited.
**DFS order: A B D F E C.**

### Example graph G2 (undirected; neighbours in increasing order)
Edges: 1–2, 1–3, 1–4, 2–5, 3–5, 4–6, 5–7, 6–7
```
        1
      / | \
     2  3  4
      \ |   \
        5    6
         \  /
          7
```
| Start | BFS | DFS |
|---|---|---|
| 1 | 1 2 3 4 5 6 7 | 1 2 5 3 7 6 4 |
| 5 | 5 2 3 7 1 6 4 | 5 2 1 3 4 6 7 |

DFS from 1 explained: 1 → 2 → 5 → 3 (5's first unvisited neighbour; 3 has no new neighbour, back to 5) → 7 → 6 → 4.
**Lesson:** the answer depends on the start vertex and the neighbour order. Always use the order the question states (usually alphabetical / increasing).

### Example graph G3 (directed) — discovery/finish times and edge classes
Adjacency (in order): A → B, C, D; B → C; C → A; D → C; E → D, F; F → F (self-loop). DFS starts at A, then restarts at E.

| Vertex | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| d / f | 1 / 8 | 2 / 5 | 3 / 4 | 6 / 7 | 9 / 12 | 10 / 11 |

DFS order: A B C D E F (two DFS trees: rooted at A and at E). BFS from A reaches only A B C D.

| Edge | Class | Reason |
|---|---|---|
| A→B, B→C, A→D, E→F | Tree | Leads to an unvisited vertex |
| C→A | **Back** | A is an ancestor still in progress → **cycle** A→B→C→A |
| F→F | Back | Self-loop |
| A→C | Forward | C is an already-finished descendant of A |
| D→C | Cross | C is finished and in another branch (d[C] < d[D]) |
| E→D | Cross | D is finished, in the other DFS tree |

**Edge-class rules (directed DFS)**
| Class | Goes to | Time pattern |
|---|---|---|
| Tree | Unvisited vertex | d[u] < d[v] < f[v] < f[u] |
| Back | Ancestor (still open) | d[v] ≤ d[u] < f[u] ≤ f[v] |
| Forward | Finished descendant (not a child via tree edge) | d[u] < d[v] < f[v] < f[u] |
| Cross | Finished vertex, neither ancestor nor descendant | d[v] < f[v] < d[u] < f[u] |

- A directed graph has a cycle **⇔** DFS finds a **back edge**.
- In an **undirected** graph DFS produces only **tree and back edges** (no forward or cross edges).
- **Parenthesis theorem:** the intervals [d, f] of any two vertices are either nested or disjoint.

## 6. BFS vs DFS

| Point | BFS | DFS |
|---|---|---|
| Data structure | Queue | Stack / recursion |
| Order | Level by level | Deep first, then backtrack |
| Time (adjacency list) | O(V + E) | O(V + E) |
| Time (adjacency matrix) | O(V²) | O(V²) |
| Extra space | O(V) | O(V) (recursion depth) |
| Shortest path (unweighted) | **Yes** | No |
| Tree analogue | Level order | Preorder |
| Typical uses | Shortest path, bipartite test, web crawling, nearest neighbours | Cycle detection, topological sort, strongly connected components, maze solving, articulation points |

**Applications**
- **Connected components:** run BFS/DFS from every still-unvisited vertex; the number of runs = number of components. O(V + E).
- **Cycle detection:** undirected — reaching an already-visited vertex that is **not the parent**; directed — a **back edge** (a vertex still on the recursion stack).
- **Bipartite test:** BFS 2-colouring; give each new vertex the opposite colour of its parent; an edge between two same-coloured vertices means not bipartite. G1 is bipartite: {A, D, E} and {B, C, F}. Adding edge B–C creates the odd cycle A–B–C, so it would no longer be bipartite.

## 7. Topological sort

A **linear order of the vertices of a DAG** such that for every edge u → v, u comes before v. It exists **only if the graph has no cycle**; usually it is **not unique**. Use: task scheduling, course prerequisites, build order, compilers.

**DAG used:** 5→2, 5→0, 4→0, 4→1, 2→3, 3→1 (vertices 0–5). In-degrees: 0:2, 1:2, 2:1, 3:1, 4:0, 5:0.

### Kahn's algorithm (BFS, in-degree based) — take the smallest ready vertex first
| Remove | Updated in-degrees | Ready set after |
|---|---|---|
| 4 | 0 → 1, 1 → 1 | {5} |
| 5 | 2 → 0, 0 → 0 | {0, 2} |
| 0 | — | {2} |
| 2 | 3 → 0 | {3} |
| 3 | 1 → 0 | {1} |
| 1 | — | {} |

**Order: 4 5 0 2 3 1.** If the queue empties before all vertices are removed, the graph has a cycle.

### DFS method
Run DFS (vertices tried in order 0…5); when a vertex **finishes**, push it on a list; output the list **reversed**.
Finish order: 0, 1, 3, 2, 4, 5 → **topological order 5 4 2 3 1 0.**

Both answers are correct; this DAG has 13 valid topological orders. Both methods take **O(V + E)**.

## 8. Minimum spanning tree (MST)

- **Spanning tree:** a subgraph that is a tree and includes **all V vertices** → it has exactly **V − 1 edges**. Only a connected graph has one.
- **MST:** a spanning tree with the minimum total edge weight. If all weights are distinct, the MST is unique.
- **Cayley's formula:** Kₙ has **nⁿ⁻²** spanning trees (K₃ = 3, K₄ = 16, K₅ = 125). General graphs: Kirchhoff's matrix-tree theorem.
- Both algorithms are **greedy** (they rely on the cut property: the lightest edge crossing any cut is safe).

**Weighted graph W (undirected)**
| Edge | A–B | A–C | B–C | B–D | C–D | C–E | D–E | D–F | E–F |
|---|---|---|---|---|---|---|---|---|---|
| Weight | 4 | 2 | 1 | 5 | 8 | 10 | 2 | 6 | 3 |

### Kruskal's algorithm (sort edges, add if no cycle)
| Edge (sorted) | Weight | Decision |
|---|---|---|
| B–C | 1 | Accept |
| A–C | 2 | Accept |
| D–E | 2 | Accept |
| E–F | 3 | Accept |
| A–B | 4 | **Reject** (A, B already connected via C) |
| B–D | 5 | Accept → 5 edges = V − 1, stop |
| D–F, C–D, C–E | 6, 8, 10 | Not needed (all would form cycles) |

**MST weight = 1 + 2 + 2 + 3 + 5 = 13.**

**Union–find (disjoint sets)** detects the cycle: `find(x)` gives the set leader; accept edge (u, v) only if find(u) ≠ find(v), then `union` the two sets. With union by rank + path compression each operation is almost O(1) (inverse Ackermann α(n)).

### Prim's algorithm (grow one tree from a start vertex; always add the cheapest edge leaving the tree)
| Step | Tree vertices before | Cheapest edge leaving the tree | Added |
|---|---|---|---|
| 1 | {A} | A–C 2 | C |
| 2 | {A, C} | C–B 1 | B |
| 3 | {A, B, C} | B–D 5 (others: C–D 8, C–E 10) | D |
| 4 | {A, B, C, D} | D–E 2 | E |
| 5 | {A, B, C, D, E} | E–F 3 | F |

**MST weight = 2 + 1 + 5 + 2 + 3 = 13** — the same tree as Kruskal's (checked by brute force over all 5-edge subsets).

| Point | Prim's | Kruskal's |
|---|---|---|
| Idea | Grow a single tree vertex by vertex | Add cheapest edges overall; forest merges into a tree |
| Needs | Priority queue / key array | Sorting + union–find |
| Time | O(V²) with matrix; O(E log V) with binary heap; O(E + V log V) with Fibonacci heap | O(E log E) = O(E log V) |
| Better for | Dense graphs | Sparse graphs |
| Technique | Greedy | Greedy |

## 9. Shortest paths

### Dijkstra's algorithm (single source, non-negative weights, greedy)
Keep dist[] (source 0, others ∞). Repeatedly pick the **unvisited vertex with the smallest dist**, mark it final, and **relax** its edges: if dist[u] + w(u, v) < dist[v], set dist[v] = dist[u] + w(u, v).

**On graph W from A**
| Picked | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| start | 0 | ∞ | ∞ | ∞ | ∞ | ∞ |
| A | 0 | 4 | 2 | ∞ | ∞ | ∞ |
| C (2) | 0 | **3** | 2 | 10 | 12 | ∞ |
| B (3) | 0 | 3 | 2 | **8** | 12 | ∞ |
| D (8) | 0 | 3 | 2 | 8 | **10** | 14 |
| E (10) | 0 | 3 | 2 | 8 | 10 | **13** |
| F (13) | 0 | 3 | 2 | 8 | 10 | 13 |

**Final distances: A 0, B 3, C 2, D 8, E 10, F 13.** Shortest path to F: A → C → B → D → E → F (2 + 1 + 5 + 2 + 3 = 13).
Time: O(V²) with an array; O((V + E) log V) with a binary heap; O(E + V log V) with a Fibonacci heap.

**Dijkstra fails with negative edges.** Directed graph N: S→A 4, S→B 5, B→A −3, A→C 2, B→C 4, C→D 1, A→D 5.
| | A | B | C | D |
|---|---|---|---|---|
| Dijkstra's answer | 4 | 5 | 6 | 7 |
| True shortest distance | **2** (S→B→A) | 5 | **4** | **5** |

Dijkstra finalises A = 4 before it looks at B, so the cheaper route S → B → A (5 − 3 = 2) is never used.

### Bellman–Ford (single source, negative edges allowed)
Relax **every edge, V − 1 times**. Then do one more pass: if any distance still decreases, there is a **negative-weight cycle** reachable from the source (shortest paths are then undefined).

On graph N with edge order S→A, S→B, B→A, A→C, B→C, C→D, A→D:
- Pass 1: A = 4, B = 5, then B→A gives A = 2, A→C gives C = 4, C→D gives D = 5.
- Passes 2–4: no change. Extra check: no change → **no negative cycle**. Final: S 0, A 2, B 5, C 4, D 5.
- Add edge D→B −7: cycle B→A→C→D→B has weight −3 + 2 + 1 − 7 = **−7**; the extra pass still improves → negative cycle reported.

Time **O(V·E)**. It is a **dynamic-programming** algorithm.

### Floyd–Warshall (all pairs) ⭐ Asked in DSSSB (as "not divide and conquer")
- **Dynamic programming**: D_k[i][j] = min(D_{k−1}[i][j], D_{k−1}[i][k] + D_{k−1}[k][j]) — "is going through vertex k shorter?"
- Three nested loops → **O(V³) time, O(V²) space**. Negative edges are allowed; a negative value on the diagonal reveals a negative cycle.

Directed graph: 1→2 3, 1→4 7, 2→1 8, 2→3 2, 3→1 5, 3→4 1, 4→1 2.
```
D0 (direct edges)       D4 (final answer)
    1   2   3   4           1   2   3   4
1   0   3   ∞   7       1   0   3   5   6
2   8   0   2   ∞       2   5   0   2   3
3   5   ∞   0   1       3   3   6   0   1
4   2   ∞   ∞   0       4   2   5   7   0
```
Example entry: 2 → 1 = 5 via 2→3→4→1 (2 + 1 + 2), better than the direct 8. After k = 1 the first changes are 2→4 = 15, 3→2 = 8 and 4→2 = 5 (all through vertex 1).

**Warshall's algorithm** is the same triple loop on a 0/1 matrix and gives the **transitive closure** (reachability).

| Algorithm | Problem | Negative edges? | Technique | Time |
|---|---|---|---|---|
| BFS | Single source, unweighted | — | Traversal | O(V + E) |
| Dijkstra | Single source | **No** | Greedy | O(V²) / O((V + E) log V) |
| Bellman–Ford | Single source | Yes (detects negative cycle) | DP | O(VE) |
| Floyd–Warshall | All pairs | Yes (no negative cycle) | DP | O(V³) |
| DAG shortest path | Single source | Yes | Topological order + relax | O(V + E) |

## 10. Euler and Hamiltonian paths

| | Euler | Hamiltonian |
|---|---|---|
| Visits | Every **edge** exactly once | Every **vertex** exactly once |
| Circuit condition (undirected, connected) | **All vertices have even degree** | No simple test (NP-complete) |
| Path (not circuit) condition | **Exactly 2 odd-degree vertices** (start at one, end at the other) | No simple test |
| Directed graph, circuit | in-degree = out-degree for every vertex (and connected) | — |
| Sufficient conditions | — | **Dirac:** n ≥ 3 and every deg ≥ n/2; **Ore:** deg u + deg v ≥ n for every non-adjacent pair |
| Famous example | Königsberg bridges: 4 odd vertices → no Euler path | Travelling salesman looks for the cheapest Hamiltonian cycle |

**G1 check:** degrees A 2, B 3, C 2, D 2, E 3, F 2 → odd vertices B and E only → an **Euler path** B–A–C–E–B–D–F–E exists, but no Euler circuit. G1 also has a **Hamiltonian cycle** A–B–D–F–E–C–A.
Kₙ (n ≥ 3) always has a Hamiltonian cycle; Kₙ has an Euler circuit only when n is odd (every degree n − 1 is even).

## 11. Graph colouring (brief)

- **Proper vertex colouring:** adjacent vertices get different colours. **Chromatic number χ(G)** = the minimum number of colours.
- χ(Kₙ) = n; χ(tree with ≥ 2 vertices) = 2; χ(Cₙ) = 2 if n even, 3 if odd; **χ ≤ 2 ⇔ bipartite ⇔ no odd cycle**.
- **Four colour theorem:** every planar graph has χ ≤ 4. Greedy colouring uses at most Δ + 1 colours (Δ = maximum degree).
- Deciding whether χ ≤ 3 is NP-complete; colouring is solved exactly by **backtracking** (m-colouring problem).
- Planar graphs: Euler's formula **V − E + F = 2**; a simple planar graph has E ≤ 3V − 6. K₅ and K₃,₃ are not planar.
- Uses: exam timetabling, register allocation, map colouring, frequency assignment.

## 12. Complexity summary

| Task | Algorithm | Time | Technique |
|---|---|---|---|
| Traversal | BFS / DFS (adjacency list) | O(V + E) | — |
| Traversal | BFS / DFS (adjacency matrix) | O(V²) | — |
| Connected components / cycle detection / bipartite test | BFS or DFS | O(V + E) | — |
| Topological sort | Kahn's / DFS | O(V + E) | — |
| MST | Prim (matrix) | O(V²) | Greedy |
| MST | Prim (binary heap) | O(E log V) | Greedy |
| MST | Kruskal | O(E log E) = O(E log V) | Greedy + union–find |
| Single-source shortest path | Dijkstra (array / heap) | O(V²) / O((V + E) log V) | Greedy |
| Single-source shortest path | Bellman–Ford | O(VE) | DP |
| All-pairs shortest path | Floyd–Warshall | O(V³) | DP |
| Transitive closure | Warshall | O(V³) | DP |
| Space | Adjacency matrix / list | O(V²) / O(V + E) | — |

---

## Exam traps
1. **Path graph Pₙ (n > 2): n − 2 vertices have degree 2**; the answer "2" is the count of degree-1 vertices. ⭐ Asked in DSSSB.
2. **All-pairs shortest path (Floyd–Warshall) is dynamic programming, not divide and conquer.** ⭐ Asked in DSSSB.
3. Kₙ has n(n − 1)/2 edges (undirected); a complete **directed** graph has n(n − 1).
4. BFS uses a **queue**, DFS a **stack**; swapping them is a favourite wrong option.
5. BFS/DFS are O(V + E) only with adjacency **lists**; with a matrix they are O(V²).
6. Traversal orders depend on the start vertex and neighbour order — never assume, read the question.
7. **Dijkstra fails with negative edges**; Bellman–Ford handles them; no algorithm gives shortest paths through a negative cycle.
8. A spanning tree has **V − 1 edges**, not V; Kₙ has **nⁿ⁻²** spanning trees (n^(n−2), not n^(n−1)).
9. Prim and Kruskal give the **same MST weight** (and the same tree when weights are distinct).
10. Topological sort is defined **only for a DAG** and is usually not unique.
11. Euler = every **edge** once (degree test); Hamiltonian = every **vertex** once (no easy test).
12. In an undirected graph, the number of odd-degree vertices is always **even** (Handshake lemma).

## One-liners for revision
1. Σ deg(v) = 2|E|.
2. The number of odd-degree vertices is even.
3. Simple undirected graph: at most n(n − 1)/2 edges.
4. Simple directed graph: at most n(n − 1) edges.
5. Tree: connected, acyclic, n − 1 edges.
6. Forest with k trees: n − k edges.
7. Path Pₙ: n − 1 edges; 2 vertices of degree 1 and n − 2 of degree 2.
8. Cycle Cₙ: n edges, every degree 2.
9. Star K₁,ₙ₋₁: one centre of degree n − 1, n − 1 leaves.
10. Kₙ: every vertex has degree n − 1.
11. K_{m,n} has mn edges.
12. Bipartite ⇔ no odd cycle ⇔ 2-colourable.
13. Strongly connected: directed paths both ways between every pair.
14. DAG = directed acyclic graph.
15. Adjacency matrix: O(V²) space, O(1) edge check.
16. Adjacency list: O(V + E) space.
17. Undirected adjacency matrix is symmetric.
18. BFS uses a queue; DFS uses a stack/recursion.
19. BFS finds shortest paths in unweighted graphs.
20. BFS and DFS: O(V + E) with lists, O(V²) with a matrix.
21. DFS back edge ⇔ cycle in a directed graph.
22. Undirected DFS has only tree and back edges.
23. Topological sort: Kahn (in-degree 0 queue) or reverse DFS finish order.
24. Topological sort exists only for DAGs.
25. Spanning tree has V − 1 edges.
26. Kₙ has nⁿ⁻² spanning trees (Cayley).
27. Prim and Kruskal are greedy.
28. Kruskal uses sorting + union–find; O(E log E).
29. Prim with a matrix is O(V²); good for dense graphs.
30. Dijkstra is greedy and needs non-negative weights.
31. Bellman–Ford: V − 1 passes, O(VE), detects negative cycles.
32. Floyd–Warshall: all pairs, DP, O(V³).
33. Warshall gives the transitive closure.
34. Euler circuit: connected + all degrees even.
35. Euler path: exactly 0 or 2 odd-degree vertices.
36. Hamiltonian cycle: every vertex once; NP-complete.
37. χ(Kₙ) = n; χ(even cycle) = 2; χ(odd cycle) = 3.
38. Planar graphs need at most 4 colours.

## Quick self-check
1. A path graph has 9 vertices. How many vertices have degree 2? — **7** (n − 2).
2. A graph has degrees 3, 3, 2, 2, 2. How many edges? — **6** (sum 12 ÷ 2).
3. How many edges does K₈ have? — **28** (8 × 7 / 2).
4. BFS of G1 from A (alphabetical neighbours)? — **A B C D E F**.
5. DFS of G2 from 1 (increasing neighbours)? — **1 2 5 3 7 6 4**.
6. Which data structure does BFS use? — **Queue**.
7. Weight of the MST of graph W? — **13**.
8. Number of spanning trees of K₄? — **16**.
9. Dijkstra on W from A: shortest distance to E? — **10** (A–C–B–D–E).
10. Which algorithm finds shortest paths with negative edges and detects negative cycles, and what is its time? — **Bellman–Ford, O(VE)**.
