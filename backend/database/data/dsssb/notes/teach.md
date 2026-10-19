# Teaching Methodology (CS + B.Ed. basics): DSSSB TGT Revision Notes

## 1. One-page summary

- About 12 questions in Section B come from teaching methodology. They are mostly direct facts (who proposed what, which stage, which step) plus a few classroom situations.
- Highest-yield areas: Bloom's taxonomy levels and verbs, Herbartian steps, evaluation types, learning theorists, micro-teaching, NEP 2020 numbers.
- Situational questions: pick the option that is student-centred, constructive, and gives feedback. Avoid options that punish, humiliate, or rely on rote memory.
- For any "which domain" question: knowing/thinking = cognitive, feeling/attitude = affective, hand skills = psychomotor.

## 2. Objectives of teaching Computer Science

| Type | Meaning | CS example |
|---|---|---|
| Aim | Broad, long-term goal of the subject | Develop computational thinking and digital citizenship |
| Objective (general) | Goal for a unit or course | Students understand database concepts |
| Specific (behavioural) objective | Observable, measurable outcome of one lesson | "The student will write a SELECT query with a WHERE clause" |
| Learning outcome (NCERT/CBSE term) | What the learner can do at the end of a stage | Writes simple Python programs using loops |

- Mager's three parts of a good objective: performance (observable verb), condition (given what), criterion (how well).
- Use action verbs (write, list, compare, debug). Avoid vague verbs (know, understand, appreciate) in specific objectives.
- Main aims of school CS: problem solving and computational thinking (decomposition, pattern recognition, abstraction, algorithms), digital literacy, ethical and safe use of technology, creativity through programming.

## 3. Bloom's taxonomy

Bloom (1956) gave three domains: cognitive (Bloom), affective (Krathwohl, 1964) and psychomotor (Simpson / Dave / Harrow).

| Original cognitive (1956, nouns) | Revised (Anderson and Krathwohl, 2001, verbs) | Typical verbs | CS example |
|---|---|---|---|
| Knowledge | Remember | define, list, recall, name | List the logic gates |
| Comprehension | Understand | explain, classify, summarise | Explain how a stack works |
| Application | Apply | use, execute, implement, solve | Use a loop to print a table |
| Analysis | Analyse | compare, differentiate, debug, organise | Find the logical error in a program |
| Synthesis | Evaluate (now 5th) | judge, justify, critique | Judge which sort is better for large data |
| Evaluation | Create (now 6th) | design, construct, develop, compose | Design a mini library-management program |

- In the revision, Synthesis became Create and moved to the top; Evaluate moved to the fifth level.
- Knowledge dimension (revised): factual, conceptual, procedural, metacognitive.
- Affective domain (Krathwohl): Receiving, Responding, Valuing, Organisation, Characterisation by a value.
- Psychomotor (Dave): Imitation, Manipulation, Precision, Articulation, Naturalisation. Typing speed and handling hardware are psychomotor objectives.

## 4. Lesson planning

Lesson plan = plan for one period; unit plan = plan for a whole unit (Morrison's unit plan: Exploration, Presentation, Assimilation, Organisation, Recitation). Mastery learning was proposed by Bloom.

Herbartian five steps (Herbart's followers, Ziller and Rein):

| Step | What the teacher does | Example: "Loops in Python" |
|---|---|---|
| 1. Preparation | Links with previous knowledge, motivates, states aim | Ask how to print 1 to 100 without 100 print statements |
| 2. Presentation | Develops new content with examples, board work, demonstration | Show the `for` loop and `range()` with live code |
| 3. Association / Comparison | Compares new ideas with old or with each other | Compare `for` and `while` loops |
| 4. Generalisation | Students form the rule or principle | "A loop repeats a block until a condition fails" |
| 5. Application | Students use the rule in new problems | Write a loop for a multiplication table |
| Recapitulation (added) | Short questions / summary at the end, followed by homework | Oral quiz on loop syntax |

- Order to remember: P-P-A-G-A (Preparation, Presentation, Association, Generalisation, Application).
- Written first in a lesson plan: general information (class, subject, topic, date, duration), then objectives, then teaching aids, previous knowledge, introduction.
- Other approaches: Bloom's evaluation approach (objectives, learning experiences, evaluation) and the 5E constructivist model (Engage, Explore, Explain, Elaborate, Evaluate).

## 5. Teaching methods

| Method | Key point | Best for in CS |
|---|---|---|
| Lecture | Teacher-centred, quick coverage, passive learners | Theory such as history of computers |
| Demonstration | Teacher shows a procedure, students observe then try | Installing software, using MS Excel functions |
| Laboratory / practical | Learning by doing on computers | Programming, SQL queries |
| Project (W. H. Kilpatrick, based on Dewey) | Purposeful activity in a real setting; teacher is guide | School website, library database |
| Problem-solving (Dewey) | Sense the problem, define it, collect data, hypothesise, test, conclude | Debugging, algorithm design |
| Heuristic (H. E. Armstrong) | Student as discoverer | Finding the pattern in number conversions |
| Socratic / questioning (Socrates) | Guided questions lead to understanding | Why does a recursive function need a base case? |
| Inductive | Examples to rule (specific to general) | Show several loops, students form the rule |
| Deductive | Rule to examples (general to specific) | State De Morgan's law, then apply it |
| Discovery (Bruner) | Learners find concepts themselves | Explore Scratch blocks |
| Pair programming | Driver and navigator switch roles | Shared computers in a crowded lab |

- Project method steps: Providing a situation, Choosing, Planning, Executing, Evaluating, Recording.
- Inductive is better for understanding; deductive is quicker. Best practice: induction followed by deduction (inducto-deductive).

## 6. Micro-teaching

- Developed at Stanford University in 1963 by Dwight W. Allen and colleagues; in India by D. D. Tiwari (1967) and later NCERT.
- Scaled-down teaching: one skill, 5–10 pupils, 5–7 minutes (Indian model: 6 minutes teach, 6 feedback, 12 replan, 6 reteach, 6 refeedback = 36 minutes).
- Cycle: Plan, Teach, Feedback, Re-plan, Re-teach, Re-feedback.
- Skills: introducing a lesson, questioning (fluency, probing), explaining, illustrating with examples, stimulus variation, reinforcement, blackboard writing, closure, using teaching aids.
- Probing question components: prompting, seeking further information, redirection, refocusing, increasing critical awareness.
- Link practice integrates several skills before full classroom teaching.

## 7. Learning theorists

| Theorist | Theory / key idea | Classroom use in CS |
|---|---|---|
| Ivan Pavlov | Classical conditioning (dog, bell, salivation) | Positive classroom routines create positive feelings |
| E. L. Thorndike | Trial and error; laws of readiness, exercise, effect | Practice plus satisfying feedback (a working program) |
| B. F. Skinner | Operant conditioning; reinforcement; programmed instruction, teaching machine | Small steps with instant feedback in e-learning drills |
| Wolfgang Kohler | Insight learning (Gestalt), chimpanzee Sultan | Allow time for the "aha" in problem solving |
| Jean Piaget | Cognitive development stages: sensorimotor (0–2), pre-operational (2–7), concrete operational (7–11), formal operational (11+); schema, assimilation, accommodation, equilibration | Concrete examples before abstract ideas such as pointers |
| Lev Vygotsky | Social constructivism; Zone of Proximal Development; scaffolding; More Knowledgeable Other | Group work, pair programming, gradual removal of support |
| Jerome Bruner | Discovery learning; enactive, iconic, symbolic modes; spiral curriculum | Teach loops in Class 6 (Scratch) and again in depth later |
| Robert Gagne | Eight types of learning (signal learning lowest, problem solving highest); nine events of instruction | Start with gaining attention, end with assessing and transfer |
| David Ausubel | Meaningful reception learning; advance organiser | Relate linked lists to arrays before teaching them |
| Albert Bandura | Social / observational learning (attention, retention, reproduction, motivation); Bobo doll | Teacher models good debugging and coding habits |
| Howard Gardner | Multiple intelligences (originally 7, later 8) | Vary tasks: visual, logical, verbal, interpersonal |
| John Dewey | Learning by doing; pragmatism; education is life | Projects and lab work |
| Lawrence Kohlberg | Stages of moral development | Cyber-ethics discussions |

- Assimilation: fitting new information into an existing schema. Accommodation: changing the schema.
- Gagne's nine events: gain attention, inform objectives, recall prior learning, present content, provide guidance, elicit performance, give feedback, assess performance, enhance retention and transfer.

## 8. Teaching aids and ICT in education

- Edgar Dale's Cone of Experience: most concrete at the base (direct purposeful experience) to most abstract at the top (verbal symbols).
- Aids: audio (radio), visual (charts, models), audio-visual (video), projected (LCD projector, OHP), non-projected (blackboard, charts).
- Flipped classroom: content video at home, problem solving in class.
- TPACK (Mishra and Koehler): Technological, Pedagogical and Content Knowledge.
- Useful tools: Moodle and Google Classroom (LMS), Google Forms (quizzes), Scratch (block programming, MIT Media Lab), Python Tutor (code visualiser), interactive whiteboard, GeoGebra, Kahoot.
- National platforms: SWAYAM (MOOCs with credit transfer), SWAYAM PRABHA (DTH education channels), DIKSHA (QR-coded energised textbooks, teacher training), e-Pathshala (NCERT e-books), NROER (open educational resources), PM eVIDYA (umbrella for digital education).
- OER: freely usable, adaptable and shareable material under open licences such as Creative Commons.

## 9. Evaluation

| Type | When | Purpose |
|---|---|---|
| Placement | Before instruction | Decide level or batch |
| Formative | During instruction | Feedback to improve learning (assessment for learning) |
| Diagnostic | When difficulty persists | Find specific causes of errors; followed by remedial teaching |
| Summative | End of unit or term | Grade, certify, promote (assessment of learning) |
| Assessment as learning | Throughout | Self-assessment and reflection by the learner |

- Norm-referenced: compare with others (percentile, rank). Criterion-referenced: compare with a fixed standard (mastery).
- Characteristics of a good test: validity (measures what it should), reliability (consistent), objectivity, usability, comprehensiveness, discrimination. A reliable test may still not be valid; a valid test must be reliable.
- Validity types: content, construct, criterion (concurrent, predictive), face.
- Item analysis: difficulty index p = correct / attempted (ideal 0.3 to 0.7); discrimination index D = (RU − RL) / n (0.4 and above is excellent; negative means a faulty item).
- Blueprint: three-dimensional chart of objectives, content and question types.
- Rubric: analytic (separate score per criterion) or holistic (one overall score). Portfolio: collection of work over time. Anecdotal record: brief note of a significant incident.
- CCE (CBSE, 2009): continuous (throughout the year) and comprehensive (scholastic and co-scholastic). Formative and summative assessments with grades.

## 10. Classroom and computer-lab management

- Preventive strategies (rules, routines, seating plan, ready software) beat reactive punishment.
- Kounin: withitness (awareness of everything happening), overlapping, smooth transitions, group alerting.
- Lab safety: proper shutdown, then mains off; no food or water; cables away from walkways; CO2 or dry powder extinguisher for electrical fires; UPS for safe shutdown and surge protection.
- Security and control: limited student accounts with admin rights only for the in-charge; antivirus updates; content filtering; acceptable-use policy signed by students.
- Records: stock register, issue register, computer-usage log book, maintenance and complaint register.
- Ergonomics: top of the monitor at or slightly below eye level, about an arm's length away, no glare.
- Crowded labs: pair programming with role rotation, lab management software (screen view, lock, broadcast).
- Misbehaviour: calm, private redirection first; escalate only if repeated.

## 11. NEP 2020 basics

| Item | Fact |
|---|---|
| Approved | 29 July 2020 by the Union Cabinet; replaces the 1986 policy (revised 1992) |
| Drafting committee | Dr K. Kasturirangan |
| School structure | 5+3+3+4: Foundational (3 years pre-school + Classes 1–2, ages 3–8), Preparatory (Classes 3–5), Middle (Classes 6–8), Secondary (Classes 9–12) |
| Coding | From Class 6 |
| Vocational | Classes 6–8 fun course with 10-day bagless period and internships |
| Language | Mother tongue / home language as medium at least till Class 5, preferably till Class 8 |
| FLN | Universal foundational literacy and numeracy in primary school (NIPUN Bharat mission) |
| Assessment body | PARAKH (Performance Assessment, Review and Analysis of Knowledge for Holistic Development) |
| Report card | 360-degree Holistic Progress Card with self, peer and teacher assessment |
| Board exams | Easier, test core capacities; up to two attempts in a year |
| Teacher qualification | 4-year integrated B.Ed. as minimum by 2030 |
| Funding | Public spending on education 6% of GDP |
| Higher education GER | 50% by 2035 |
| Curriculum framework | NCF for school education by NCERT; NCFTE by NCTE |

## 12. Fifteen quick-revision one-liners

1. Revised Bloom top level: Create. Original top level: Evaluation.
2. Herbartian steps: Preparation, Presentation, Association, Generalisation, Application.
3. Micro-teaching: Stanford, 1963, Dwight Allen; 5–10 pupils, 5–7 minutes, one skill.
4. ZPD and scaffolding: Vygotsky.
5. Enactive, iconic, symbolic and spiral curriculum: Bruner.
6. Advance organiser: Ausubel.
7. Programmed instruction: Skinner. Insight: Kohler. Trial and error: Thorndike.
8. Highest in Gagne's hierarchy: problem solving.
9. Project method: Kilpatrick. Heuristic: Armstrong. Learning by doing: Dewey.
10. Formative = during; summative = end; diagnostic = find the cause; placement = before.
11. Difficulty index p = correct / attempted; discrimination D = (RU − RL) / n.
12. Reliable means consistent; valid means it measures the right thing.
13. NEP 2020: 5+3+3+4, coding from Class 6, PARAKH, 6% of GDP.
14. Electrical fire in the lab: CO2 extinguisher, never water.
15. SWAYAM = MOOCs; SWAYAM PRABHA = DTH channels; DIKSHA = QR-coded textbooks.

## 13. Five common traps

1. Mixing up the old and revised Bloom orders: Evaluate is 5th and Create is 6th in the revised version, but Synthesis is 5th and Evaluation 6th in the original.
2. Calling a lesson "inductive" when the teacher states the rule first. Rule first = deductive.
3. Treating diagnostic and formative evaluation as the same. Formative checks progress; diagnostic digs into the cause of persistent errors.
4. Assuming a reliable test is valid. Consistent scores on the wrong content are reliable but not valid.
5. NEP stage confusion: the Foundational Stage includes Classes 1 and 2 (not 1 to 3), and the Middle Stage is Classes 6 to 8.
