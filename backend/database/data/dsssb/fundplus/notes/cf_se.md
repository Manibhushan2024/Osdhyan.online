# Software Engineering

**In 30 seconds**
- About 6 questions per paper; DSSSB asks Pressman-style definitions, not long theory.
- Waterfall = linear, oldest, fixed requirements; low cost, long duration, high risk. RAD has five named phases.
- Design goal: **low coupling, high cohesion**; learn both orders best → worst.
- Testing: black box (specification) vs white box (code); system testing kinds (recovery, stress, security, performance).
- Quality: ISO 9126 six factors; CMM five levels (Initial → Optimizing).
- SCM controls change (baselines, version control, change control); risk strategy is reactive or proactive.

## 1. Software and process basics

| Idea | Key point |
|---|---|
| Software characteristics | Developed (engineered), not manufactured; does not wear out but **deteriorates** due to change; still largely custom-built |
| Failure curve | Hardware = bathtub curve; software = idealised flat curve with spikes after each change |
| Software types (Pressman) | System, application, engineering/scientific, embedded, product-line, web/mobile apps, AI software; plus legacy software |
| Software crisis | 1960s–70s projects late, over budget, unreliable, unmaintainable; term "software engineering" from the 1968 NATO conference |
| Process vs product | Process = how software is built (activities, methods); product = programs + documents + data delivered |
| Framework activities | Communication, planning, modelling, construction, deployment |
| Umbrella activities | Project tracking, risk management, SQA, technical reviews, measurement, SCM, reusability management, work-product preparation (run throughout; not optional) |

## 2. Prescriptive process models ⭐ Asked in DSSSB

Pressman groups them as **sequential/linear** (waterfall, V-model), **incremental** (incremental, RAD), **evolutionary** (prototyping, spiral) and **concurrent**.

| Model | Core idea | Use when | Weakness |
|---|---|---|---|
| Waterfall / linear sequential ⭐ | Oldest paradigm (Royce 1970); phases in strict order, no going back | Requirements clear, stable, well understood; small project | Cannot handle changing requirements; working software only at the end |
| V-model | Each development phase paired with a test phase | Safety-critical, stable requirements | Rigid like waterfall |
| Incremental | Core product first, then increments (each a mini-waterfall) | Early partial delivery needed | Needs modular design and planning |
| RAD ⭐ | Component reuse, time-box 60–90 days, parallel teams | Modular system, tight deadline, skilled team | Not for high technical risk or non-modular systems |
| Prototyping | Quick model to clarify requirements (throwaway or evolutionary) | Requirements vague; UI-heavy | Customer may mistake prototype for product |
| Spiral (Boehm) | Risk-driven loops; radius = cumulative cost; a "meta-model" | Large, high-risk, costly projects | Complex, expensive, needs risk expertise |
| Iterative | Repeat full cycle, refining the whole system each time | Requirements evolve | Scope creep |
| Concurrent | Activities exist at once in states (inactive, under development, awaiting changes, under review, baselined, done) | Client–server, many teams | Hard to manage |

**Waterfall characteristics ⭐:** linear flow · documentation-driven · **low cost, long duration, high risk** (errors found late) · no customer feedback until the end · simple to manage.

**RAD five phases ⭐:** business modelling → data modelling → process modelling → application generation → testing & turnover.

**Spiral quadrants:** (1) determine objectives, alternatives, constraints → (2) identify and resolve risks (risk analysis) → (3) develop and verify → (4) plan next iteration (customer evaluation).

## 3. Agile

- **Manifesto (2001), 4 values:** individuals and interactions over processes and tools · working software over comprehensive documentation · customer collaboration over contract negotiation · responding to change over following a plan. (12 principles.)

| Scrum | Items |
|---|---|
| Roles | Product Owner (owns backlog), Scrum Master (coach, removes impediments), Developers |
| Events | Sprint (≤ 1 month), Sprint Planning, Daily Scrum (15 min), Sprint Review, Sprint Retrospective |
| Artifacts | Product Backlog, Sprint Backlog, Increment |

- **XP (Kent Beck):** pair programming, test-driven development, refactoring, continuous integration, small releases, user stories.
- **Kanban:** visual board, limit work-in-progress, continuous flow (no fixed sprints).

| | Waterfall | Spiral | Prototyping | Agile |
|---|---|---|---|---|
| Requirements | Fixed | Evolving | Unclear | Changing |
| Risk handling | Poor | Best | Medium | Good |
| Customer involvement | Start only | Each loop | High | Continuous |
| Documentation | Heavy | Heavy | Light | Minimal |

## 4. Requirement engineering

| Step | Output |
|---|---|
| Elicitation | Interviews, questionnaires, brainstorming, JAD, observation, use cases |
| Analysis | Resolve conflicts, models (DFD, ER, use case) |
| Specification | **SRS** (IEEE 830): introduction (purpose, scope, definitions), overall description (perspective, functions, users, constraints, assumptions), specific requirements (functional, external interfaces, performance, design constraints, attributes) |
| Validation | Reviews, prototyping, test-case generation; SRS must be correct, unambiguous, complete, consistent, verifiable, modifiable, traceable |

**Functional vs non-functional ⭐ Asked in DSSSB**

| Functional | Non-functional |
|---|---|
| **What** the system does | **How well** it does it (quality/constraints) |
| Core, mandatory work tasks | Treated as desirable qualities |
| "Generate report card", "issue library book", "login with OTP" | "Page loads in 2 s", "99.9% uptime", "AES encryption", "runs on Android & iOS" |
| Tested by functional (black-box) tests | Tested by performance, security, usability tests |

- **Feasibility types:** technical, economic (cost–benefit), operational, schedule, legal.
- **Use case:** actor + goal + main flow + alternate flows; «include» = always used, «extend» = optional.

## 5. Software design

**Levels of design ⭐ Asked in DSSSB:** System (high-level, most abstract) → Architectural (subsystems and interactions) → Detailed (module-level implementation).

| Pressman level | Content |
|---|---|
| Architectural (high-level) | Overall structure, subsystems, style |
| Interface | How components talk to each other, users and external systems |
| Component / detailed | Algorithms and data structures of each module |

- **Modularity:** split into modules; too many modules raises integration cost.
- **Abstraction:** show essentials, hide detail (procedural, data).
- **Information hiding (Parnas):** a module's internals are invisible to others.

**Cohesion (inside a module) and coupling (between modules) ⭐ Asked in DSSSB** — want **high cohesion, low coupling**.

| Cohesion, best → worst | One line |
|---|---|
| Functional | Everything does one task |
| Sequential | Output of one part feeds the next |
| Communicational | Parts work on the same data |
| Procedural | Parts follow a control sequence |
| Temporal | Parts run at the same time (start-up) |
| Logical | Similar kind of tasks, chosen by a flag |
| Coincidental | Unrelated parts (worst) |

| Coupling, best → worst | One line |
|---|---|
| Data | Only elementary parameters passed |
| Stamp | Whole structure passed, part used |
| Control | Flag passed to steer the other module |
| External | Shared external format/device/protocol |
| Common | Shared global data |
| Content | One module modifies/jumps into another (worst) |

- **Design patterns:** reusable solutions (Gang of Four, 23 patterns: creational, structural, behavioural — Singleton, Factory, Adapter, Observer).
- **DFD:** bubble/circle = process, rectangle = external entity, arrow = data flow, open rectangle/parallel lines = data store. Level 0 = **context diagram**, then Level 1, 2; levels must balance. No control flow.
- **ER diagram (Chen):** rectangle = entity, ellipse = attribute, diamond = relationship.

**UML (Booch, Rumbaugh, Jacobson; OMG 1997)**

| Diagram | Shows | Type |
|---|---|---|
| Use case | Actors and system functions | Behavioural |
| Class | Classes, attributes, operations, relationships | Structural |
| Sequence | Messages in time order on lifelines | Behavioural (interaction) |
| Activity | Workflow, parallel flows (like a flowchart) | Behavioural |
| State machine | States and transitions of one object | Behavioural |
| Component | Software components and interfaces | Structural |
| Deployment | Hardware nodes and artifacts on them | Structural |

| Relationship | Notation |
|---|---|
| Association | Plain line |
| Aggregation (has-a, part can exist alone) | Hollow diamond |
| Composition (part dies with whole) | Filled diamond |
| Generalisation (is-a) | Hollow triangle arrow |
| Dependency | Dashed arrow |
| Realisation | Dashed line + hollow triangle |

## 6. Coding and reviews

- **Coding standards:** naming conventions, indentation, header comments, limited globals, error handling, no deep nesting.
- **Walkthrough:** informal, led by the author. **Inspection (Fagan):** formal, moderator-led, checklists, roles (moderator, reader, recorder, author). **Formal technical review (FTR):** 3–5 people, ≤ 2 hours.

## 7. Testing

- **Verification** = "building the product right" (reviews). **Validation** = "building the right product" (testing against user needs).

| Black box ⭐ | White box ⭐ |
|---|---|
| Based on specification; code unseen | Based on internal code (glass box) |
| Equivalence partitioning: one test per class (range → 1 valid + 2 invalid) | Statement coverage: every statement once |
| Boundary value analysis: a−1, a, a+1, b−1, b, b+1 | Branch coverage: every true/false outcome (implies statement) |
| Decision table: combinations of conditions → actions | Path coverage: every independent path (strongest) |
| Also cause–effect graph, state transition | Also basis path, loop, data-flow testing |

**Cyclomatic complexity (McCabe):** V(G) = E − N + 2P = decisions + 1 = regions.

Worked example:
```
1 read n; sum = 0
2 while (n > 0)
3   if (n % 2 == 0)
4     sum = sum + n
    else
5     sum = sum - n
6   n = n - 1
7 print sum
```
Edges: 1-2, 2-3, 2-7, 3-4, 3-5, 4-6, 5-6, 6-2 → E = 8, N = 7. V(G) = 8 − 7 + 2 = **3** = 2 decisions + 1. Basis paths: 1-2-7; 1-2-3-4-6-2-7; 1-2-3-5-6-2-7 → minimum 3 test cases.

**Levels**

| Level | Point |
|---|---|
| Unit | One module by developer; uses **stubs** (called module) and **drivers** (caller) |
| Integration | Top-down (stubs), bottom-up (drivers), big bang (all at once), sandwich (both) |
| System ⭐ | Whole system against SRS |
| Acceptance | Customer decides: **alpha** (users at developer's site), **beta** (real users at their own site) |

| System testing kind ⭐ | Checks |
|---|---|
| Recovery | Forces failure in many ways, verifies proper recovery |
| Security | Protection against improper access |
| Stress | Abnormal quantity/frequency/volume of demand |
| Load | Behaviour under expected peak users |
| Performance | Run-time speed and resource use |
| Compatibility | Different OS, browsers, hardware |
| Usability | Ease of learning and use |

- **Regression:** re-run old tests after a change. **Smoke:** quick build check before deeper testing.
- **Debugging** (removing the cause after testing finds an error): brute force, backtracking, cause elimination.

## 8. Maintenance

| Type | Purpose | Share (Lientz–Swanson) |
|---|---|---|
| Corrective | Fix bugs | ~21% |
| Adaptive | New OS, hardware, law | ~25% |
| Perfective | New features, better performance | ~50% (largest) |
| Preventive | Restructure to avoid future problems | ~4% |

Maintenance is about 60% or more of life-cycle cost.

## 9. SCM and risk management

**Software configuration management ⭐** identifies, controls, audits and reports changes during development and after release.
- **SCI:** any item under control (SRS, design, code, test cases).
- **Baseline:** formally reviewed and agreed work product; changed only through formal change control.
- **Version control:** stores versions, check-out/check-in, branches (Git, SVN).
- **Change control:** change request → evaluation → change control authority (CCB) decides → engineering change order → implement → audit.
- SCM tasks: identification, version control, change control, configuration audit, status reporting.

**Risk management ⭐**

| Reactive | Proactive |
|---|---|
| "Indiana Jones" style: act when trouble comes | Starts before technical work |
| Fire-fighting, crisis management | Identify, assess, rank, plan to avoid/control |

- Steps: **identification** (project, technical, business risks; known/predictable/unpredictable) → **projection/estimation** (probability + impact; risk table) → **assessment** (risk exposure RE = P × C) → **RMMM** (Risk Mitigation, Monitoring and Management plan).
- Handling strategies: avoid, transfer, mitigate, accept. "Risk generation" is not one.

## 10. Metrics and estimation

- **LOC/KLOC:** simple, language-dependent, known only after coding.
- **Function points (Albrecht):** 5 components — EI, EO, EQ, ILF, EIF. FP = UFP × VAF, VAF = 0.65 + 0.01 × ΣFi (14 factors, 0–5). Example: UFP 154, ΣFi 42 → VAF 1.07 → FP ≈ 164.8.
- **Basic COCOMO (Boehm 1981):** Effort = a(KLOC)^b PM; Time = c(Effort)^d months; Staff = Effort ÷ Time.

| Mode | a | b | c | d | 32 KLOC → Effort / Time / Staff |
|---|---|---|---|---|---|
| Organic | 2.4 | 1.05 | 2.5 | 0.38 | 91.3 PM / 13.9 mo / 6.6 |
| Semi-detached | 3.0 | 1.12 | 2.5 | 0.35 | 145.5 PM / 14.3 mo / 10.2 |
| Embedded | 3.6 | 1.20 | 2.5 | 0.32 | 230.4 PM / 14.3 mo / 16.2 |

- COCOMO levels: basic, intermediate (15 cost drivers), detailed; COCOMO II is the update.
- Estimation methods: decomposition (LOC/FP), empirical models (COCOMO), expert judgement (Delphi).

## 11. Quality

**ISO 9126 six factors ⭐ Asked in DSSSB**

| Factor | Sub-attributes |
|---|---|
| Functionality | Suitability, accuracy, interoperability, security, compliance |
| Reliability | Maturity, fault tolerance, recoverability |
| Usability | Understandability, learnability, operability |
| Efficiency | **Time behaviour, resource behaviour** |
| Maintainability | Analysability, changeability, stability, testability |
| Portability | Adaptability, installability, conformance, replaceability |

**McCall (11 factors):** product operation (correctness, reliability, efficiency, integrity, usability) · product revision (maintainability, flexibility, testability) · product transition (portability, reusability, interoperability).

**CMM levels ⭐ (SEI, Carnegie Mellon)**

| Level | CMM | CMMI name | Feature |
|---|---|---|---|
| 1 | Initial | Initial | Ad hoc, heroics |
| 2 | Repeatable | Managed | Basic project management |
| 3 | Defined | Defined | Organisation-wide standard process |
| 4 | Managed | Quantitatively Managed | Measured with metrics |
| 5 | Optimizing | Optimizing | Continuous process improvement |

- **ISO 9001:** quality management system standard for any organisation (ISO 9000-3 = guidance for software).
- **Six Sigma:** ≤ 3.4 defects per million opportunities; DMAIC.
- **Reliability:** MTTF = mean time to failure; MTTR = mean time to repair; **MTBF = MTTF + MTTR**; availability = MTTF ÷ (MTTF + MTTR).

| SQA | SQC |
|---|---|
| Process-oriented, preventive | Product-oriented, detective |
| Audits, standards, process definition | Testing, inspection of the product |

## Exam traps
1. Waterfall is **low** cost; "high cost" is the NOT-true option (high cost belongs to spiral).
2. "Development modelling" is not a RAD phase; RAD has business, data, process modelling, application generation, testing & turnover.
3. Design order: system → architectural → detailed (abstract to concrete), not the reverse.
4. Coupling **lower**, cohesion **higher**; do not swap.
5. Recovery testing forces failure; stress testing pushes load — different kinds.
6. CMM level 4 is "Managed"; in CMMI level 2 is "Managed" and level 4 is "Quantitatively Managed".
7. Umbrella activities are not optional; the "not mandatory" item in DSSSB was **non-functional requirements**.
8. Branch coverage implies statement coverage, not the other way round; V(G) uses E − N + **2**.

## One-liners for revision
1. Linear sequential models are the oldest paradigm.
2. Waterfall suits fixed, clear requirements.
3. Waterfall was described by Royce (1970).
4. Spiral model (Boehm) is risk-driven.
5. Spiral is called a meta-model.
6. Prototyping suits unclear requirements.
7. RAD time-box is about 60–90 days.
8. V-model pairs each phase with a test level.
9. Agile Manifesto: 2001, 4 values, 12 principles.
10. Daily Scrum lasts 15 minutes.
11. Product Owner owns the product backlog.
12. XP introduced pair programming.
13. Kanban limits work in progress.
14. SRS says what, not how (IEEE 830).
15. Functional = what; non-functional = how well.
16. Context diagram = Level-0 DFD.
17. Best cohesion: functional; worst: coincidental.
18. Best coupling: data; worst: content.
19. Information hiding was proposed by Parnas.
20. Sequence diagram shows time-ordered messages.
21. Filled diamond = composition.
22. Verification = product right; validation = right product.
23. BVA and equivalence partitioning are black-box.
24. Stubs: top-down; drivers: bottom-up.
25. Alpha at developer's site; beta at user's site.
26. Perfective maintenance is the largest share.
27. SCM controls change via baselines.
28. RMMM = Risk Mitigation, Monitoring and Management.
29. COCOMO modes: organic, semi-detached, embedded.
30. MTBF = MTTF + MTTR.

## Quick self-check
1. Which model cannot handle changing requirements? — Linear (waterfall).
2. Name the RAD phases. — Business, data, process modelling, application generation, testing & turnover.
3. Which system test forces failure and checks recovery? — Recovery testing.
4. ISO 9126 factor with time and resource behaviour? — Efficiency.
5. CMM level 3? — Defined.
6. What identifies, controls, audits and reports changes? — Software configuration management.
7. Graph with 10 edges, 8 nodes: V(G)? — 10 − 8 + 2 = 4.
8. Organic COCOMO effort formula? — 2.4(KLOC)^1.05 PM.
9. Passing a flag that controls another module's logic is? — Control coupling.
10. Is "risk generation" a risk management method? — No (methods: avoid, transfer, mitigate, accept).
