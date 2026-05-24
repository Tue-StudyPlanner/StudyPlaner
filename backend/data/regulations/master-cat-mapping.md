# masterCat Mapping

All regulation areas collapse to six universal categories stored in `user_completed_courses.master_cat`.

## Category values

| Code    | Meaning                                                                 |
|---------|-------------------------------------------------------------------------|
| TECH    | Technical Computer Science (TI area, robotics)                          |
| THEO    | Theoretical Computer Science (ThI area, logics)                         |
| PRAK    | Practical Computer Science (PI elective area, labs)                     |
| INFO    | Applied Computer Science (elective CS area, general)                    |
| FOKUS   | Focus / specialization area (MSc Fokusbereich, MSc ML Diverse/Expanded) |
| BASIS   | Foundations (Math, mandatory INF, ML Foundations, professional skills)  |

## BASIS vs FOKUS

BASIS and FOKUS serve similar roles (foundational and elective credit pools). In practice,
BASIS covers more courses and is the safer fallback. FOKUS is used for MSc specialization
areas (INFO-FOKUS, ML-DIVERSE, ML-EXP) and some MSc Informatik areas.

**Rule: when the correct category is ambiguous, assign BASIS.**

This applies to:
- Unmatched courses from "Professional Skills" / "Überfachliche Kompetenzen" sections in the ToR
- Unmatched courses from "Compulsory Area" sections in a BSc ToR

## Mapping by study area code (from `course_catalog.py`)

| Study area code(s)                        | masterCat |
|-------------------------------------------|-----------|
| `*TECH`                                   | TECH      |
| `*THEO`                                   | THEO      |
| `*PRAK`                                   | PRAK      |
| `INFO`, `INFO-INFO`, `ML-CS`, `*-INFO`    | INFO      |
| `INFO-FOKUS`, `ML-DIVERSE`, `ML-EXP`, `PROSEM`, `UEBK` | FOKUS |
| `MATH`, `INF`, `INFO-BASIS`, `ML-FOUND`, `*BASIS` | BASIS |

## ToR section heading fallbacks (from `parseTranscriptPdf.ts`)

When a course cannot be matched to the catalog, the section heading in the PDF is used
to guess the masterCat. Matched courses always use the catalog-derived masterCat.

| Section heading (partial match)                          | masterCat |
|----------------------------------------------------------|-----------|
| "Practical Computer Science"                             | PRAK      |
| "Theoretical Computer Science", "Logics"                 | THEO      |
| "Technical Computer Science", "Robotik"                  | TECH      |
| "Mathematics"                                            | BASIS     |
| "Professional Skills", "Compulsory" (BSc mandatory area) | BASIS     |
| anything else                                            | INFO      |
