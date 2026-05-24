PRAGMA foreign_keys = ON;

-- Seed official PO 2021 study-program metadata from einzupflegene_po/.
INSERT INTO study_programs (
    id,
    code,
    name,
    degree,
    subject,
    po_version,
    total_ects,
    language,
    source_status,
    notes
) VALUES (1, 'BSC_INFO_2021', 'B.Sc. Informatik (PO 2021)', 'B.Sc.', 'Informatik', '2021', 180.0, 'de', 'official', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74483.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    po_version = excluded.po_version,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO study_programs (
    id,
    code,
    name,
    degree,
    subject,
    po_version,
    total_ects,
    language,
    source_status,
    notes
) VALUES (2, 'MSC_INFO_2021', 'M.Sc. Informatik / Computer Science (PO 2021)', 'M.Sc.', 'Informatik / Computer Science', '2021', 120.0, 'de', 'official', 'PO publication date: 22.07.2022. Regular duration: 4 semesters. Source: https://uni-tuebingen.de/de/74487. Zulassungsbeschränkt ab WS 2021/22; Bachelornote 2,5 oder besser erforderlich')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    po_version = excluded.po_version,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO study_programs (
    id,
    code,
    name,
    degree,
    subject,
    po_version,
    total_ects,
    language,
    source_status,
    notes
) VALUES (3, 'MSC_ML_2021', 'M.Sc. Maschinelles Lernen / Machine Learning (PO 2021)', 'M.Sc.', 'Maschinelles Lernen / Machine Learning', '2021', 120.0, 'en', 'official', 'PO publication date: 2021. Regular duration: 4 semesters. Source: https://uni-tuebingen.de/studium/studienangebot/verzeichnis-der-studiengaenge/detail/course/machine-learning-master/. Zulassungsbeschränkt; Bachelornote mind. 2.3 (dt. Skala) oder besser erforderlich; Bachelor in Informatik, Mathematik, Physik oder verwandtem Fach')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    po_version = excluded.po_version,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO study_programs (
    id,
    code,
    name,
    degree,
    subject,
    po_version,
    total_ects,
    language,
    source_status,
    notes
) VALUES (4, 'BSC_BIOINFO_2021', 'B.Sc. Bioinformatik (PO 2021)', 'B.Sc.', 'Bioinformatik', '2021', 180.0, 'de', 'official', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74482.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    po_version = excluded.po_version,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO study_programs (
    id,
    code,
    name,
    degree,
    subject,
    po_version,
    total_ects,
    language,
    source_status,
    notes
) VALUES (5, 'BSC_MEDIENINFO_2021', 'B.Sc. Medieninformatik (PO 2021)', 'B.Sc.', 'Medieninformatik', '2021', 180.0, 'de', 'official', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74484.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    po_version = excluded.po_version,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO study_programs (
    id,
    code,
    name,
    degree,
    subject,
    po_version,
    total_ects,
    language,
    source_status,
    notes
) VALUES (6, 'BSC_MEDIZININFO_2021', 'B.Sc. Medizininformatik (PO 2021)', 'B.Sc.', 'Medizininformatik', '2021', 180.0, 'de', 'official', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74485.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    po_version = excluded.po_version,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO examination_regulations (
    code,
    name,
    degree,
    subject,
    notes
) VALUES ('BSC_INFO', 'B.Sc. Informatik', 'B.Sc.', 'Informatik', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74483.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    notes = excluded.notes;

INSERT INTO examination_regulations (
    code,
    name,
    degree,
    subject,
    notes
) VALUES ('MSC_INFO', 'M.Sc. Informatik / Computer Science', 'M.Sc.', 'Informatik / Computer Science', 'PO publication date: 22.07.2022. Regular duration: 4 semesters. Source: https://uni-tuebingen.de/de/74487. Zulassungsbeschränkt ab WS 2021/22; Bachelornote 2,5 oder besser erforderlich')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    notes = excluded.notes;

INSERT INTO examination_regulations (
    code,
    name,
    degree,
    subject,
    notes
) VALUES ('MSC_ML', 'M.Sc. Maschinelles Lernen / Machine Learning', 'M.Sc.', 'Maschinelles Lernen / Machine Learning', 'PO publication date: 2021. Regular duration: 4 semesters. Source: https://uni-tuebingen.de/studium/studienangebot/verzeichnis-der-studiengaenge/detail/course/machine-learning-master/. Zulassungsbeschränkt; Bachelornote mind. 2.3 (dt. Skala) oder besser erforderlich; Bachelor in Informatik, Mathematik, Physik oder verwandtem Fach')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    notes = excluded.notes;

INSERT INTO examination_regulations (
    code,
    name,
    degree,
    subject,
    notes
) VALUES ('BSC_BIOINFO', 'B.Sc. Bioinformatik', 'B.Sc.', 'Bioinformatik', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74482.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    notes = excluded.notes;

INSERT INTO examination_regulations (
    code,
    name,
    degree,
    subject,
    notes
) VALUES ('BSC_MEDIENINFO', 'B.Sc. Medieninformatik', 'B.Sc.', 'Medieninformatik', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74484.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    notes = excluded.notes;

INSERT INTO examination_regulations (
    code,
    name,
    degree,
    subject,
    notes
) VALUES ('BSC_MEDIZININFO', 'B.Sc. Medizininformatik', 'B.Sc.', 'Medizininformatik', 'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74485.')
ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    degree = excluded.degree,
    subject = excluded.subject,
    notes = excluded.notes;

INSERT INTO regulation_versions (
    regulation_id,
    code,
    version_label,
    total_ects,
    language,
    source_status,
    notes
)
SELECT
    id,
    'BSC_INFO_2021',
    '2021',
    180.0,
    'de',
    'official',
    'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74483.'
FROM examination_regulations
WHERE code = 'BSC_INFO'
ON CONFLICT(code) DO UPDATE SET
    version_label = excluded.version_label,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO regulation_versions (
    regulation_id,
    code,
    version_label,
    total_ects,
    language,
    source_status,
    notes
)
SELECT
    id,
    'MSC_INFO_2021',
    '2021',
    120.0,
    'de',
    'official',
    'PO publication date: 22.07.2022. Regular duration: 4 semesters. Source: https://uni-tuebingen.de/de/74487. Zulassungsbeschränkt ab WS 2021/22; Bachelornote 2,5 oder besser erforderlich'
FROM examination_regulations
WHERE code = 'MSC_INFO'
ON CONFLICT(code) DO UPDATE SET
    version_label = excluded.version_label,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO regulation_versions (
    regulation_id,
    code,
    version_label,
    total_ects,
    language,
    source_status,
    notes
)
SELECT
    id,
    'MSC_ML_2021',
    '2021',
    120.0,
    'en',
    'official',
    'PO publication date: 2021. Regular duration: 4 semesters. Source: https://uni-tuebingen.de/studium/studienangebot/verzeichnis-der-studiengaenge/detail/course/machine-learning-master/. Zulassungsbeschränkt; Bachelornote mind. 2.3 (dt. Skala) oder besser erforderlich; Bachelor in Informatik, Mathematik, Physik oder verwandtem Fach'
FROM examination_regulations
WHERE code = 'MSC_ML'
ON CONFLICT(code) DO UPDATE SET
    version_label = excluded.version_label,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO regulation_versions (
    regulation_id,
    code,
    version_label,
    total_ects,
    language,
    source_status,
    notes
)
SELECT
    id,
    'BSC_BIOINFO_2021',
    '2021',
    180.0,
    'de',
    'official',
    'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74482.'
FROM examination_regulations
WHERE code = 'BSC_BIOINFO'
ON CONFLICT(code) DO UPDATE SET
    version_label = excluded.version_label,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO regulation_versions (
    regulation_id,
    code,
    version_label,
    total_ects,
    language,
    source_status,
    notes
)
SELECT
    id,
    'BSC_MEDIENINFO_2021',
    '2021',
    180.0,
    'de',
    'official',
    'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74484.'
FROM examination_regulations
WHERE code = 'BSC_MEDIENINFO'
ON CONFLICT(code) DO UPDATE SET
    version_label = excluded.version_label,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO regulation_versions (
    regulation_id,
    code,
    version_label,
    total_ects,
    language,
    source_status,
    notes
)
SELECT
    id,
    'BSC_MEDIZININFO_2021',
    '2021',
    180.0,
    'de',
    'official',
    'PO publication date: 22.07.2022. Regular duration: 6 semesters. Source: https://uni-tuebingen.de/de/74485.'
FROM examination_regulations
WHERE code = 'BSC_MEDIZININFO'
ON CONFLICT(code) DO UPDATE SET
    version_label = excluded.version_label,
    total_ects = excluded.total_ects,
    language = excluded.language,
    source_status = excluded.source_status,
    notes = excluded.notes;

INSERT INTO study_program_regulation_versions (
    study_program_id,
    regulation_version_id,
    is_default,
    enrollment_match
)
SELECT
    sp.id,
    rv.id,
    1,
    'program_code'
FROM study_programs AS sp
JOIN regulation_versions AS rv
    ON rv.code = 'BSC_INFO_2021'
WHERE sp.code = 'BSC_INFO_2021'
ON CONFLICT(study_program_id, regulation_version_id) DO UPDATE SET
    is_default = excluded.is_default,
    enrollment_match = excluded.enrollment_match;

INSERT INTO study_program_regulation_versions (
    study_program_id,
    regulation_version_id,
    is_default,
    enrollment_match
)
SELECT
    sp.id,
    rv.id,
    1,
    'program_code'
FROM study_programs AS sp
JOIN regulation_versions AS rv
    ON rv.code = 'MSC_INFO_2021'
WHERE sp.code = 'MSC_INFO_2021'
ON CONFLICT(study_program_id, regulation_version_id) DO UPDATE SET
    is_default = excluded.is_default,
    enrollment_match = excluded.enrollment_match;

INSERT INTO study_program_regulation_versions (
    study_program_id,
    regulation_version_id,
    is_default,
    enrollment_match
)
SELECT
    sp.id,
    rv.id,
    1,
    'program_code'
FROM study_programs AS sp
JOIN regulation_versions AS rv
    ON rv.code = 'MSC_ML_2021'
WHERE sp.code = 'MSC_ML_2021'
ON CONFLICT(study_program_id, regulation_version_id) DO UPDATE SET
    is_default = excluded.is_default,
    enrollment_match = excluded.enrollment_match;

INSERT INTO study_program_regulation_versions (
    study_program_id,
    regulation_version_id,
    is_default,
    enrollment_match
)
SELECT
    sp.id,
    rv.id,
    1,
    'program_code'
FROM study_programs AS sp
JOIN regulation_versions AS rv
    ON rv.code = 'BSC_BIOINFO_2021'
WHERE sp.code = 'BSC_BIOINFO_2021'
ON CONFLICT(study_program_id, regulation_version_id) DO UPDATE SET
    is_default = excluded.is_default,
    enrollment_match = excluded.enrollment_match;

INSERT INTO study_program_regulation_versions (
    study_program_id,
    regulation_version_id,
    is_default,
    enrollment_match
)
SELECT
    sp.id,
    rv.id,
    1,
    'program_code'
FROM study_programs AS sp
JOIN regulation_versions AS rv
    ON rv.code = 'BSC_MEDIENINFO_2021'
WHERE sp.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(study_program_id, regulation_version_id) DO UPDATE SET
    is_default = excluded.is_default,
    enrollment_match = excluded.enrollment_match;

INSERT INTO study_program_regulation_versions (
    study_program_id,
    regulation_version_id,
    is_default,
    enrollment_match
)
SELECT
    sp.id,
    rv.id,
    1,
    'program_code'
FROM study_programs AS sp
JOIN regulation_versions AS rv
    ON rv.code = 'BSC_MEDIZININFO_2021'
WHERE sp.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(study_program_id, regulation_version_id) DO UPDATE SET
    is_default = excluded.is_default,
    enrollment_match = excluded.enrollment_match;

-- Rebuild regulation rule groups and course mappings for the programs that already have curriculum matches.
INSERT OR IGNORE INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    sa.id,
    sa.code,
    sa.name,
    COALESCE(sa.area_type, 'study_area'),
    sa.required_ects,
    sa.min_ects,
    sa.max_ects,
    sa.sort_order,
    sa.source_note
FROM study_areas AS sa
JOIN study_programs AS sp ON sp.id = sa.program_id
JOIN regulation_versions AS rv ON rv.code = sp.code
WHERE sp.code IN ('BSC_INFO_2021', 'MSC_INFO_2021', 'MSC_ML_2021');

INSERT OR IGNORE INTO regulation_course_mappings (
    regulation_version_id,
    course_id,
    module_id,
    rule_group_id,
    status,
    ects_counted,
    match_type,
    source_note
)
SELECT DISTINCT
    rv.id,
    m.course_id,
    m.module_id,
    rrg.id,
    COALESCE(opt.status, 'allowed'),
    COALESCE(opt.ects_counted, cm.ects),
    m.match_type,
    COALESCE(opt.rule_text, m.notes)
FROM course_curriculum_matches AS m
JOIN curriculum_modules AS cm ON cm.id = m.module_id
JOIN module_study_area_options AS opt ON opt.module_id = cm.id
JOIN study_areas AS sa ON sa.id = opt.study_area_id
JOIN study_programs AS sp ON sp.id = sa.program_id
JOIN regulation_versions AS rv ON rv.code = sp.code
JOIN regulation_rule_groups AS rrg
    ON rrg.regulation_version_id = rv.id
   AND rrg.study_area_id = sa.id
WHERE sp.code IN ('BSC_INFO_2021', 'MSC_INFO_2021', 'MSC_ML_2021');

-- BSC_INFO_2021 study_areas were seeded with NULL required_ects.
-- Set correct values derived from the official Prüfungsordnung 2021.
UPDATE regulation_rule_groups
SET required_ects = CASE code
    WHEN 'MATH'  THEN 33
    WHEN 'INF'   THEN 78
    WHEN 'PRAK'  THEN 6
    WHEN 'TECH'  THEN 6
    WHEN 'THEO'  THEN 6
    WHEN 'INFO'  THEN 15
    WHEN 'UEBK'  THEN 18
    ELSE required_ects
END
WHERE regulation_version_id = (
    SELECT id FROM regulation_versions WHERE code = 'BSC_INFO_2021'
);

-- Seed rule groups for the additional PO 2021 programs that are only backed by JSON for now.
INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'MATH',
    'Mathematik (Pflicht)',
    'study_area',
    30.0,
    NULL,
    NULL,
    10,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_BIOINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'INF',
    'Informatik (Pflicht)',
    'study_area',
    36.0,
    NULL,
    NULL,
    20,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_BIOINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'BIOINFO',
    'Bioinformatik (Pflicht)',
    'study_area',
    15.0,
    NULL,
    NULL,
    30,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_BIOINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'LIFE',
    'Lebenswissenschaften (Pflicht)',
    'study_area',
    27.0,
    NULL,
    NULL,
    40,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_BIOINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'ELECTIVE',
    'Wahlpflicht',
    'study_area',
    30.0,
    NULL,
    NULL,
    50,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_BIOINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'UEBK',
    'Überfachliche berufsfeldorientierte Kompetenzen (übK)',
    'study_area',
    6.0,
    NULL,
    NULL,
    60,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_BIOINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'THESIS',
    'Abschluss',
    'study_area',
    12.0,
    NULL,
    NULL,
    70,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_BIOINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'MATH',
    'Mathematik (Pflicht)',
    'study_area',
    24.0,
    NULL,
    NULL,
    10,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'INF',
    'Informatik (Pflicht)',
    'study_area',
    42.0,
    NULL,
    NULL,
    20,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'MEDIAINFO',
    'Medieninformatik (Pflicht)',
    'study_area',
    30.0,
    NULL,
    NULL,
    30,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'MEDIA_STUDIES',
    'Medienwissenschaft (Pflicht)',
    'study_area',
    18.0,
    NULL,
    NULL,
    40,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'ELECTIVE',
    'Wahlpflicht',
    'study_area',
    18.0,
    NULL,
    NULL,
    50,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'UEBK',
    'Überfachliche berufsfeldorientierte Kompetenzen (übK)',
    'study_area',
    9.0,
    NULL,
    NULL,
    60,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'THESIS',
    'Abschluss',
    'study_area',
    12.0,
    NULL,
    NULL,
    70,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIENINFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'MATH',
    'Mathematik (Pflicht)',
    'study_area',
    24.0,
    NULL,
    NULL,
    10,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'INF',
    'Informatik (Pflicht)',
    'study_area',
    36.0,
    NULL,
    NULL,
    20,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'MEDINFO',
    'Medizininformatik (Pflicht)',
    'study_area',
    24.0,
    NULL,
    NULL,
    30,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'MED_BIO_PHYS',
    'Medizin, Biologie und Physik (Pflicht)',
    'study_area',
    39.0,
    NULL,
    NULL,
    40,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'ELECTIVE',
    'Wahlpflicht',
    'study_area',
    21.0,
    NULL,
    NULL,
    50,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'UEBK',
    'Überfachliche berufsfeldorientierte Kompetenzen (übK)',
    'study_area',
    6.0,
    NULL,
    NULL,
    60,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

INSERT INTO regulation_rule_groups (
    regulation_version_id,
    study_area_id,
    code,
    name,
    group_type,
    required_ects,
    min_ects,
    max_ects,
    sort_order,
    notes
)
SELECT
    rv.id,
    NULL,
    'THESIS',
    'Abschluss',
    'study_area',
    12.0,
    NULL,
    NULL,
    70,
    NULL
FROM regulation_versions AS rv
WHERE rv.code = 'BSC_MEDIZININFO_2021'
ON CONFLICT(regulation_version_id, code) DO UPDATE SET
    name = excluded.name,
    group_type = excluded.group_type,
    required_ects = excluded.required_ects,
    sort_order = excluded.sort_order,
    notes = excluded.notes;

-- Merge the former FOKUS bucket into BASIS so only the visible category remains.
UPDATE user_completed_courses
SET master_cat = 'BASIS'
WHERE master_cat = 'FOKUS';

-- Existing accounts must choose their study program / PO again in Account settings.
UPDATE user_profiles
SET
    study_program_id = NULL,
    regulation_version_id = NULL,
    updated_at_unix = unixepoch()
WHERE study_program_id IS NOT NULL
   OR regulation_version_id IS NOT NULL;
