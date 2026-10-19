# Software Engineering: DSSSB TGT CS Revision Notes

## 1. One-page summary

- Expect about 6-8 questions from Software Engineering in Section B. They are mostly direct concept questions: "which model…", "which type of cohesion…", "which testing…", plus one or two small numericals (COCOMO, cyclomatic complexity, function points).
- Highest-yield areas: SDLC model features (waterfall, spiral, prototype, V-model, agile/Scrum), cohesion and coupling order, testing levels and types (black/white box, alpha/beta), maintenance types and the basic COCOMO modes.
- Memorise the two orderings: cohesion from best to worst, and coupling from best to worst. Many questions are just "which is best/worst".
- Learn the "names behind the ideas": Royce (waterfall), Boehm (spiral, COCOMO), Albrecht (function points), McCabe (cyclomatic complexity), Halstead (software science), Booch–Rumbaugh–Jacobson (UML), Linus Torvalds (Git).
- In numericals, write the formula first; most wrong options come from a single slip (forgetting the exponent, multiplying instead of dividing).

## 2. SDLC models

The Software Development Life Cycle has the phases: feasibility study, requirement analysis and specification, design, coding and unit testing, integration and system testing, and maintenance.

| Model | Key idea | Best when | Main weakness |
|---|---|---|---|
| Classical waterfall (Royce, 1970) | Linear, sequential; no phase overlap, no going back | Requirements are clear and stable; small, well-understood projects | No feedback; working software appears only at the end |
| Iterative waterfall | Waterfall plus feedback paths to earlier phases | Same as waterfall but errors must be corrected early | Still rigid; change is costly |
| Prototyping | Build a quick working model to clarify requirements; throwaway or evolutionary | Requirements are vague; user interface is important | Extra cost; customer may treat prototype as final product |
| Incremental | Core product first, features added in increments (each a mini-waterfall) | Early partial delivery wanted; requirements known | Needs good planning and a modular design |
| Spiral (Boehm, 1986/88) | Risk-driven loops; each loop: objectives → risk analysis → development & test → plan next loop | Large, high-risk projects | Complex; needs risk-assessment expertise; costly for small projects |
| RAD (James Martin) | Component reuse, time-boxing (60-90 days), heavy user involvement | Modular systems, tight deadline, skilled team | Unsuitable for high technical risk |
| V-model | Verification and Validation; each development phase has a matching test phase | Safety-critical, stable requirements | Rigid like waterfall |
| Agile (Scrum, XP) | Short iterations, working software, customer collaboration, embrace change | Changing requirements, small co-located teams | Less documentation; hard for fixed-price contracts |

**Spiral model details.** The radius of the spiral represents cumulative cost; the angular dimension shows progress within a cycle. It is called a **meta model** because it contains the waterfall (one loop), prototyping (early loops) and incremental ideas.

**V-model pairing.** Requirement analysis ↔ acceptance testing; system/high-level design ↔ system testing; architectural design ↔ integration testing; module (low-level) design ↔ unit testing.

**Agile Manifesto (2001)** — four values: individuals and interactions over processes and tools; working software over comprehensive documentation; customer collaboration over contract negotiation; responding to change over following a plan. It has 12 principles.

**Scrum.** Roles: Product Owner (owns and orders the product backlog), Scrum Master (coach, removes impediments), Developers. Events: Sprint (time-box of at most one month, usually 1-4 weeks), Sprint Planning, Daily Scrum (15 minutes), Sprint Review, Sprint Retrospective. Artifacts: Product Backlog, Sprint Backlog, Increment. **XP** (Extreme Programming, Kent Beck) adds pair programming, test-driven development and continuous integration.

## 3. Requirement engineering

- Steps: feasibility study → elicitation → analysis → specification (SRS) → validation → management.
- **Feasibility types**: technical (can it be built?), economic (cost–benefit), operational (will users use it?), schedule, legal.
- **Elicitation techniques**: interviews, questionnaires, brainstorming, observation, JAD sessions, use cases, prototyping.
- **Functional** requirements say *what* the system does ("generate the report card"). **Non-functional** requirements say *how well* (performance, security, reliability, usability, portability).
- **SRS** (IEEE 830, now ISO/IEC/IEEE 29148) describes *what*, not *how*. Good SRS qualities: correct, unambiguous, complete, consistent, ranked for importance, verifiable, modifiable, traceable.
- **Structured analysis tools**: DFD (bubble = process, arrow = data flow, open rectangle/parallel lines = data store, rectangle = external entity), data dictionary, decision tables. Level-0 DFD = **context diagram** (whole system as one bubble). A DFD shows no control flow (no loops or decisions).

## 4. Software design: cohesion and coupling

Cohesion is the strength of relationship *inside* a module; coupling is the degree of interdependence *between* modules. Goal: **high cohesion, low coupling**.

| Cohesion (best → worst) | Meaning |
|---|---|
| Functional | All elements do one single task |
| Sequential | Output of one element is input to the next |
| Communicational | Elements work on the same data |
| Procedural | Elements follow a sequence of control |
| Temporal | Elements run at the same time (start-up, shutdown) |
| Logical | Elements do logically similar things (all print routines) |
| Coincidental | Elements are unrelated (worst) |

| Coupling (best → worst) | Meaning |
|---|---|
| Data | Only elementary parameters are passed |
| Stamp | A whole data structure is passed, only part used |
| Control | A flag passed to control another module's logic |
| External | Modules share an external format/device/protocol |
| Common | Modules share global data |
| Content | One module changes or jumps into another's internals (worst) |

Other design ideas: modularity, abstraction, information hiding (Parnas), top-down vs bottom-up design, structure charts. **Fan-in** (how many modules call this module) should be high for reusable modules; **fan-out** (how many modules it calls) should be low to moderate.

## 5. Software testing

| Type | Who / basis | Key point |
|---|---|---|
| Black-box (functional) | Specification only | Equivalence partitioning, boundary value analysis, decision tables, cause-effect graphs |
| White-box (structural, glass-box) | Internal code | Statement, branch, path coverage; basis path testing; data-flow testing |
| Unit | Developer, single module | First level; uses stubs and drivers |
| Integration | Modules combined | Top-down (stubs), bottom-up (drivers), sandwich, big-bang |
| System | Whole system vs SRS | Includes performance, stress, load, security, recovery testing |
| Acceptance | Customer | Decides whether to accept the system |
| Alpha | Users/testers at developer's site | Controlled environment |
| Beta | Real users at their own site | After alpha, before final release |
| Regression | Re-run old tests after a change | Catches side effects of fixes |
| Smoke / sanity | Quick checks of a new build | Decide whether deeper testing is worthwhile |
| Mutation | Inject small faults (mutants) | Measures quality of the test suite |

- **Verification**: "Are we building the product right?" (reviews, inspections). **Validation**: "Are we building the right product?" (testing against user needs).
- **Error → fault → failure**: the human mistake causes a defect in code, which shows up as wrong behaviour at run time.
- **BVA** for a range a..b tests a−1, a, a+1, b−1, b, b+1. **Equivalence partitioning** for a range gives 1 valid + 2 invalid classes.
- 100% branch coverage implies 100% statement coverage, not the reverse. Exhaustive testing is impossible; testing shows the presence of defects, not their absence.

## 6. Software maintenance

- **Corrective** (fix bugs), **adaptive** (new OS, hardware, law or environment), **perfective** (new features, better performance; largest share, about 50%), **preventive** (restructuring to avoid future problems).
- Maintenance usually consumes 60% or more of total life-cycle cost.
- **Reverse engineering**: code → design/specification. **Re-engineering**: reverse engineering + restructuring + forward engineering. Legacy systems are old systems still in use.

## 7. UML diagrams

UML was created by Booch, Rumbaugh and Jacobson ("three amigos") and adopted by the OMG in 1997. UML 2.x has 14 diagrams.

| Structural (static) | Behavioural (dynamic) |
|---|---|
| Class, Object, Component, Package, Deployment, Composite structure, Profile | Use case, Activity, State machine, Sequence, Communication, Timing, Interaction overview |

- Use case diagram: actors and use cases; «include» = always used, «extend» = optional/conditional.
- Sequence diagram: time-ordered messages on lifelines. Activity diagram: like a flowchart, supports parallel flows. Deployment: hardware nodes.
- Class diagram notation: + public, − private, # protected, ~ package. Hollow triangle = generalisation (inheritance); hollow diamond = aggregation; filled diamond = composition; dashed arrow = dependency.

## 8. Project metrics and estimation

- **LOC/KLOC**: simple but language-dependent and available only after coding. Productivity = KLOC ÷ person-months.
- **Function points** (Albrecht, IBM 1979): five components — external inputs, external outputs, external inquiries, internal logical files, external interface files. FP = UFP × VAF, where VAF = 0.65 + 0.01 × ΣFi (14 factors rated 0-5, so VAF ranges 0.65-1.35).
- **Cyclomatic complexity** (McCabe): V(G) = E − N + 2P = number of decision points + 1 = number of regions in the planar graph. It gives the number of independent paths (minimum test cases for basis path testing).
- **Halstead**: n1 distinct operators, n2 distinct operands; vocabulary n = n1 + n2; length N = N1 + N2.
- **Basic COCOMO** (Boehm, 1981): Effort = a(KLOC)^b person-months; Time = c(Effort)^d months; Staff = Effort ÷ Time.

| Mode | a | b | c | d | Typical project |
|---|---|---|---|---|---|
| Organic | 2.4 | 1.05 | 2.5 | 0.38 | Small team, familiar problem |
| Semi-detached | 3.0 | 1.12 | 2.5 | 0.35 | Mixed experience, medium size |
| Embedded | 3.6 | 1.20 | 2.5 | 0.32 | Tight hardware/real-time constraints |

COCOMO has three levels: basic, intermediate (adds 15 cost drivers) and detailed. COCOMO II (1995/2000) updates it for modern practice.

## 9. Version control basics

- Centralised VCS (CVS, SVN): one central repository. Distributed VCS (Git, Mercurial): every clone has the full history and works offline.
- Git was created by Linus Torvalds in 2005. Core commands: `git init` (new repository), `git clone` (copy remote), `git add` (stage), `git commit` (record snapshot locally), `git push` (send to remote), `git pull` (fetch + merge), `git branch` / `git checkout` / `git switch`, `git merge`, `git status`, `git log`.
- A merge conflict happens when two branches change the same lines; it must be resolved manually before committing.

## 10. Frequently asked in DSSSB

- Which SDLC model is risk-driven? (Spiral) Which is best for unclear requirements? (Prototyping) Which is linear/sequential? (Waterfall)
- Best cohesion (functional), worst cohesion (coincidental), best coupling (data), worst coupling (content).
- Alpha vs beta testing; black-box vs white-box; order of testing levels.
- Verification vs validation definitions.
- Types of maintenance with an example each.
- COCOMO developer and modes; cyclomatic complexity numerical.
- Which UML diagram shows time ordering of messages? (Sequence) Which shows actors? (Use case)

## 11. Fifteen one-liners

1. Waterfall model was described by Winston Royce in 1970.
2. Spiral model: Barry Boehm; each loop has a risk-analysis quadrant.
3. Prototyping is used when requirements are not clear.
4. V-model = Verification and Validation model.
5. The Agile Manifesto was signed in 2001 at Snowbird, Utah.
6. Daily Scrum is time-boxed to 15 minutes; a sprint lasts at most one month.
7. SRS states *what* the system must do, not *how*.
8. Context diagram = Level-0 DFD.
9. Good design = high cohesion + low coupling.
10. Stubs are used in top-down integration; drivers in bottom-up.
11. Boundary value analysis and equivalence partitioning are black-box techniques.
12. Perfective maintenance takes the largest share of maintenance effort.
13. V(G) = E − N + 2P.
14. COCOMO modes: organic, semi-detached, embedded.
15. `git pull` = `git fetch` + `git merge`.

## 12. Five traps

1. **Statement vs branch coverage**: branch coverage implies statement coverage, but statement coverage does not imply branch coverage.
2. **Verification vs validation**: "product right" is verification; "right product" is validation. Do not swap them.
3. **Stamp vs data coupling**: passing a whole record when one field is needed is stamp coupling, even though it "only passes data".
4. **Alpha testing is not done by developers alone**: it is done by users or independent testers, but at the developer's site.
5. **COCOMO arithmetic**: effort uses the exponent b (e.g. 1.05 for organic); ignoring it gives a tempting wrong option. Staff = Effort ÷ Time, never Effort × Time.
