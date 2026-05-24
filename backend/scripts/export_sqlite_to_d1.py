from __future__ import annotations

import argparse
import re
import sqlite3
from pathlib import Path
from typing import TextIO

from regulation_seed_data import SQLITE_RULE_GROUP_PROGRAM_CODES, ProgramSeed, load_program_seeds

ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_SQLITE_PATH = ROOT_DIR / "data" / "alma.sqlite"
DEFAULT_SCHEMA_OUT = ROOT_DIR / "migrations" / "0001_initial.sql"
SKIP_TABLES = {
    "course_search",
    "course_search_data",
    "course_search_idx",
    "course_search_content",
    "course_search_docsize",
    "course_search_config",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Export the local alma.sqlite database into D1-friendly SQL files.",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SQLITE_PATH,
        help="Path to the source SQLite database.",
    )
    parser.add_argument(
        "--schema-out",
        type=Path,
        default=DEFAULT_SCHEMA_OUT,
        help="Path for the generated schema migration file.",
    )
    parser.add_argument(
        "--data-out",
        type=Path,
        help="Optional path for a data-only SQL seed dump.",
    )
    parser.add_argument(
        "--skip-schema",
        action="store_true",
        help="Do not regenerate the schema migration file.",
    )
    return parser


def sort_tables_by_dependency(
    sqlite_conn: sqlite3.Connection,
    tables: list[str],
) -> list[str]:
    """Order tables so foreign-key dependencies are created first."""
    table_set = set(tables)
    dependencies: dict[str, set[str]] = {}
    for table in tables:
        foreign_keys = sqlite_conn.execute(
            f'PRAGMA foreign_key_list("{table}")'
        ).fetchall()
        dependencies[table] = {
            row[2]
            for row in foreign_keys
            if row[2] in table_set and row[2] != table
        }

    ordered_tables: list[str] = []
    placed_tables: set[str] = set()
    while len(ordered_tables) < len(tables):
        progressed = False
        for table in tables:
            if table in placed_tables:
                continue
            if dependencies[table] <= placed_tables:
                ordered_tables.append(table)
                placed_tables.add(table)
                progressed = True
        if not progressed:
            remaining_tables = sorted(set(tables) - placed_tables)
            raise RuntimeError(f"Cyclic foreign keys detected among: {remaining_tables}")
    return ordered_tables


def add_if_not_exists(create_sql: str) -> str:
    """Make generated CREATE statements idempotent for local D1 rebuilds."""
    replacements = [
        (r"^CREATE TABLE\s+", "CREATE TABLE IF NOT EXISTS "),
        (r"^CREATE INDEX\s+", "CREATE INDEX IF NOT EXISTS "),
        (r"^CREATE UNIQUE INDEX\s+", "CREATE UNIQUE INDEX IF NOT EXISTS "),
        (r"^CREATE VIEW\s+", "CREATE VIEW IF NOT EXISTS "),
    ]

    result = create_sql
    for pattern, replacement in replacements:
        if re.match(pattern, result, flags=re.IGNORECASE):
            return re.sub(pattern, replacement, result, count=1, flags=re.IGNORECASE)
    return result


def load_schema_objects(
    sqlite_conn: sqlite3.Connection,
) -> tuple[list[str], dict[str, str], list[tuple[str, str, str]], list[tuple[str, str]]]:
    """Return ordered tables, create statements, indexes, and views."""
    table_rows = sqlite_conn.execute(
        "SELECT name, sql FROM sqlite_master "
        "WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    create_statements = {
        name: sql
        for name, sql in table_rows
        if sql and name not in SKIP_TABLES
    }
    ordered_tables = sort_tables_by_dependency(sqlite_conn, list(create_statements))

    index_rows = sqlite_conn.execute(
        "SELECT name, tbl_name, sql FROM sqlite_master "
        "WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    indexes = [
        (name, table_name, sql)
        for name, table_name, sql in index_rows
        if sql and table_name not in SKIP_TABLES
    ]

    view_rows = sqlite_conn.execute(
        "SELECT name, sql FROM sqlite_master WHERE type = 'view' ORDER BY name"
    ).fetchall()
    views = [(name, sql) for name, sql in view_rows if sql]

    return ordered_tables, create_statements, indexes, views


def export_schema(source_path: Path, output_path: Path) -> None:
    """Write a D1-compatible schema migration from the source SQLite database."""
    sqlite_conn = sqlite3.connect(source_path)
    try:
        tables, create_statements, indexes, views = load_schema_objects(sqlite_conn)
    finally:
        sqlite_conn.close()

    parts: list[str] = [
        "-- Generated from backend/data/alma.sqlite for Cloudflare D1.",
        "-- Full-text search virtual tables are intentionally excluded for the first D1 migration.",
        "PRAGMA foreign_keys = ON;",
        "",
    ]

    for table in tables:
        parts.append(add_if_not_exists(create_statements[table]).rstrip() + ";")
        parts.append("")

    for _, _, sql in indexes:
        parts.append(add_if_not_exists(sql).rstrip() + ";")
        parts.append("")

    for _, sql in views:
        parts.append(add_if_not_exists(sql).rstrip() + ";")
        parts.append("")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(parts).strip() + "\n", encoding="utf-8")


def quote_value(sqlite_conn: sqlite3.Connection, value: object) -> str:
    """Quote a value using SQLite's own SQL literal formatter."""
    quoted = sqlite_conn.execute("SELECT quote(?)", (value,)).fetchone()
    return str(quoted[0]) if quoted else "NULL"


def _sql_string_list(values: set[str] | tuple[str, ...]) -> str:
    return ", ".join(f"'{value}'" for value in sorted(values))


def _write_study_program_upsert(
    handle: TextIO,
    sqlite_conn: sqlite3.Connection,
    program_seed: ProgramSeed,
) -> None:
    values_sql = ", ".join(
        [
            quote_value(sqlite_conn, program_seed.study_program_id),
            quote_value(sqlite_conn, program_seed.code),
            quote_value(sqlite_conn, program_seed.name),
            quote_value(sqlite_conn, program_seed.degree),
            quote_value(sqlite_conn, program_seed.subject),
            quote_value(sqlite_conn, program_seed.po_version),
            quote_value(sqlite_conn, program_seed.total_ects),
            quote_value(sqlite_conn, program_seed.language),
            quote_value(sqlite_conn, program_seed.source_status),
            quote_value(sqlite_conn, program_seed.notes),
        ]
    )
    handle.write(
        'INSERT INTO "study_programs" '
        '("id", "code", "name", "degree", "subject", "po_version", '
        '"total_ects", "language", "source_status", "notes") '
        f'VALUES ({values_sql}) '\
        'ON CONFLICT("code") DO UPDATE SET '\
        '"name" = excluded."name", '\
        '"degree" = excluded."degree", '\
        '"subject" = excluded."subject", '\
        '"po_version" = excluded."po_version", '\
        '"total_ects" = excluded."total_ects", '\
        '"language" = excluded."language", '\
        '"source_status" = excluded."source_status", '\
        '"notes" = excluded."notes";\n'
    )


def _write_examination_regulation_upsert(
    handle: TextIO,
    sqlite_conn: sqlite3.Connection,
    program_seed: ProgramSeed,
) -> None:
    values_sql = ", ".join(
        [
            quote_value(sqlite_conn, program_seed.regulation_code),
            quote_value(sqlite_conn, program_seed.regulation_name),
            quote_value(sqlite_conn, program_seed.degree),
            quote_value(sqlite_conn, program_seed.subject),
            quote_value(sqlite_conn, program_seed.notes),
        ]
    )
    handle.write(
        'INSERT INTO "examination_regulations" '
        '("code", "name", "degree", "subject", "notes") '
        f'VALUES ({values_sql}) '\
        'ON CONFLICT("code") DO UPDATE SET '\
        '"name" = excluded."name", '\
        '"degree" = excluded."degree", '\
        '"subject" = excluded."subject", '\
        '"notes" = excluded."notes";\n'
    )


def _write_regulation_version_upsert(
    handle: TextIO,
    sqlite_conn: sqlite3.Connection,
    program_seed: ProgramSeed,
) -> None:
    handle.write(
        'INSERT INTO "regulation_versions" '
        '("regulation_id", "code", "version_label", "total_ects", "language", "source_status", "notes") '
        'SELECT id, '
        f'{quote_value(sqlite_conn, program_seed.code)}, '
        f'{quote_value(sqlite_conn, program_seed.version_label)}, '
        f'{quote_value(sqlite_conn, program_seed.total_ects)}, '
        f'{quote_value(sqlite_conn, program_seed.language)}, '
        f'{quote_value(sqlite_conn, program_seed.source_status)}, '
        f'{quote_value(sqlite_conn, program_seed.notes)} '
        'FROM "examination_regulations" '
        f'WHERE "code" = {quote_value(sqlite_conn, program_seed.regulation_code)} '
        'ON CONFLICT("code") DO UPDATE SET '
        '"version_label" = excluded."version_label", '
        '"total_ects" = excluded."total_ects", '
        '"language" = excluded."language", '
        '"source_status" = excluded."source_status", '
        '"notes" = excluded."notes";\n'
    )


def _write_program_regulation_link_upsert(
    handle: TextIO,
    sqlite_conn: sqlite3.Connection,
    program_seed: ProgramSeed,
) -> None:
    handle.write(
        'INSERT INTO "study_program_regulation_versions" '
        '("study_program_id", "regulation_version_id", "is_default", "enrollment_match") '
        'SELECT sp.id, rv.id, 1, '\
        f'{quote_value(sqlite_conn, "program_code")} '
        'FROM "study_programs" AS sp '\
        'JOIN "regulation_versions" AS rv ON rv."code" = '\
        f'{quote_value(sqlite_conn, program_seed.code)} '
        f'WHERE sp."code" = {quote_value(sqlite_conn, program_seed.code)} '
        'ON CONFLICT("study_program_id", "regulation_version_id") DO UPDATE SET '
        '"is_default" = excluded."is_default", '
        '"enrollment_match" = excluded."enrollment_match";\n'
    )


def _write_json_rule_groups(
    handle: TextIO,
    sqlite_conn: sqlite3.Connection,
    program_seed: ProgramSeed,
) -> None:
    if program_seed.uses_sqlite_rule_groups:
        return

    for rule_group in program_seed.rule_groups:
        handle.write(
            'INSERT INTO "regulation_rule_groups" '
            '("regulation_version_id", "study_area_id", "code", "name", "group_type", "required_ects", "min_ects", "max_ects", "sort_order", "notes") '
            'SELECT rv.id, NULL, '
            f'{quote_value(sqlite_conn, rule_group.code)}, '
            f'{quote_value(sqlite_conn, rule_group.name)}, '
            f'{quote_value(sqlite_conn, "study_area")}, '
            f'{quote_value(sqlite_conn, rule_group.required_ects)}, '
            'NULL, NULL, '
            f'{quote_value(sqlite_conn, rule_group.sort_order)}, '
            f'{quote_value(sqlite_conn, rule_group.notes)} '
            'FROM "regulation_versions" AS rv '
            f'WHERE rv."code" = {quote_value(sqlite_conn, program_seed.code)} '
            'ON CONFLICT("regulation_version_id", "code") DO UPDATE SET '
            '"name" = excluded."name", '
            '"group_type" = excluded."group_type", '
            '"required_ects" = excluded."required_ects", '
            '"sort_order" = excluded."sort_order", '
            '"notes" = excluded."notes";\n'
        )


def _write_sqlite_rule_group_seed(handle: TextIO) -> None:
    program_codes = _sql_string_list(SQLITE_RULE_GROUP_PROGRAM_CODES)
    handle.write(
        '-- Rebuild regulation rule groups and course mappings for the programs that already have curriculum matches.\n'
        'INSERT OR IGNORE INTO regulation_rule_groups (\n'
        '    regulation_version_id,\n'
        '    study_area_id,\n'
        '    code,\n'
        '    name,\n'
        '    group_type,\n'
        '    required_ects,\n'
        '    min_ects,\n'
        '    max_ects,\n'
        '    sort_order,\n'
        '    notes\n'
        ')\n'
        'SELECT\n'
        '    rv.id,\n'
        '    sa.id,\n'
        '    sa.code,\n'
        '    sa.name,\n'
        "    COALESCE(sa.area_type, 'study_area'),\n"
        '    sa.required_ects,\n'
        '    sa.min_ects,\n'
        '    sa.max_ects,\n'
        '    sa.sort_order,\n'
        '    sa.source_note\n'
        'FROM study_areas AS sa\n'
        'JOIN study_programs AS sp ON sp.id = sa.program_id\n'
        'JOIN regulation_versions AS rv ON rv.code = sp.code\n'
        f'WHERE sp.code IN ({program_codes});\n\n'
        'INSERT OR IGNORE INTO regulation_course_mappings (\n'
        '    regulation_version_id,\n'
        '    course_id,\n'
        '    module_id,\n'
        '    rule_group_id,\n'
        '    status,\n'
        '    ects_counted,\n'
        '    match_type,\n'
        '    source_note\n'
        ')\n'
        'SELECT DISTINCT\n'
        '    rv.id,\n'
        '    m.course_id,\n'
        '    m.module_id,\n'
        '    rrg.id,\n'
        "    COALESCE(opt.status, 'allowed'),\n"
        '    COALESCE(opt.ects_counted, cm.ects),\n'
        '    m.match_type,\n'
        '    COALESCE(opt.rule_text, m.notes)\n'
        'FROM course_curriculum_matches AS m\n'
        'JOIN curriculum_modules AS cm ON cm.id = m.module_id\n'
        'JOIN module_study_area_options AS opt ON opt.module_id = cm.id\n'
        'JOIN study_areas AS sa ON sa.id = opt.study_area_id\n'
        'JOIN study_programs AS sp ON sp.id = sa.program_id\n'
        'JOIN regulation_versions AS rv ON rv.code = sp.code\n'
        'JOIN regulation_rule_groups AS rrg\n'
        '    ON rrg.regulation_version_id = rv.id\n'
        '   AND rrg.study_area_id = sa.id\n'
        f'WHERE sp.code IN ({program_codes});\n\n'
        '-- BSC_INFO_2021 study_areas were seeded with NULL required_ects.\n'
        '-- Set correct values derived from the official Prüfungsordnung 2021.\n'
        'UPDATE regulation_rule_groups\n'
        'SET required_ects = CASE code\n'
        "    WHEN 'MATH'  THEN 33\n"
        "    WHEN 'INF'   THEN 78\n"
        "    WHEN 'PRAK'  THEN 6\n"
        "    WHEN 'TECH'  THEN 6\n"
        "    WHEN 'THEO'  THEN 6\n"
        "    WHEN 'INFO'  THEN 15\n"
        "    WHEN 'UEBK'  THEN 18\n"
        '    ELSE required_ects\n'
        'END\n'
        "WHERE regulation_version_id = (\n"
        "    SELECT id FROM regulation_versions WHERE code = 'BSC_INFO_2021'\n"
        ');\n\n'
    )


def _write_official_regulation_seed(handle: TextIO, sqlite_conn: sqlite3.Connection) -> None:
    program_seeds = load_program_seeds()

    handle.write('-- Seed official PO 2021 study-program and regulation data from einzupflegene_po/.\n')
    for program_seed in program_seeds:
        _write_study_program_upsert(handle, sqlite_conn, program_seed)
    handle.write('\n')

    for program_seed in program_seeds:
        _write_examination_regulation_upsert(handle, sqlite_conn, program_seed)
    handle.write('\n')

    for program_seed in program_seeds:
        _write_regulation_version_upsert(handle, sqlite_conn, program_seed)
    handle.write('\n')

    for program_seed in program_seeds:
        _write_program_regulation_link_upsert(handle, sqlite_conn, program_seed)
    handle.write('\n')

    _write_sqlite_rule_group_seed(handle)

    for program_seed in program_seeds:
        _write_json_rule_groups(handle, sqlite_conn, program_seed)
    handle.write('\n')


def export_data(source_path: Path, output_path: Path) -> None:
    """Write a data-only SQL dump that can be executed against D1.

    Remote D1 imports reject explicit transaction statements in SQL files, so the
    generated dump intentionally avoids BEGIN/COMMIT wrappers.
    """
    sqlite_conn = sqlite3.connect(source_path)
    try:
        tables, _, _, _ = load_schema_objects(sqlite_conn)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", encoding="utf-8") as handle:
            handle.write("-- Generated from backend/data/alma.sqlite for Cloudflare D1.\n")
            handle.write("PRAGMA foreign_keys = OFF;\n\n")

            for table in reversed(tables):
                handle.write(f'DELETE FROM "{table}";\n')
            handle.write("\n")

            for table in tables:
                column_rows = sqlite_conn.execute(
                    f'PRAGMA table_info("{table}")'
                ).fetchall()
                columns = [row[1] for row in column_rows]
                column_list = ", ".join(f'"{column}"' for column in columns)
                select_sql = f'SELECT {column_list} FROM "{table}"'
                rows = sqlite_conn.execute(select_sql).fetchall()

                for row in rows:
                    values_sql = ", ".join(quote_value(sqlite_conn, value) for value in row)
                    handle.write(
                        f'INSERT INTO "{table}" ({column_list}) VALUES ({values_sql});\n'
                    )
                handle.write("\n")

            _write_official_regulation_seed(handle, sqlite_conn)
            handle.write("PRAGMA foreign_keys = ON;\n")
    finally:
        sqlite_conn.close()


def main() -> None:
    args = build_parser().parse_args()
    if not args.source.exists():
        raise SystemExit(f"SQLite database not found: {args.source}")

    if not args.skip_schema:
        export_schema(args.source, args.schema_out)
        print(f"Wrote schema migration: {args.schema_out}")

    if args.data_out is not None:
        export_data(args.source, args.data_out)
        print(f"Wrote data seed dump: {args.data_out}")


if __name__ == "__main__":
    main()
