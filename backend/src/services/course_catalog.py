from __future__ import annotations

from typing import Any

from db.d1 import fetch_all, fetch_one


async def list_courses(env: Any, limit: int = 50) -> list[dict[str, Any]]:
    """Return a lightweight public course list from D1."""
    safe_limit = max(1, min(limit, 200))
    sql = """
        SELECT
            id,
            run_id AS runId,
            unit_id AS unitId,
            period_id AS periodId,
            COALESCE(number, unit_id) AS courseKey,
            number,
            title,
            catalog_title AS catalogTitle,
            organisation,
            course_type AS courseType,
            offering_frequency AS offeringFrequency,
            registration_period AS registrationPeriod,
            short_comment AS shortComment,
            semester_hours AS semesterHours,
            detail_url AS detailUrl,
            detail_page_url AS detailPageUrl
        FROM courses
        ORDER BY title ASC
        LIMIT ?
    """
    return await fetch_all(env, sql, [safe_limit])


async def get_course_detail(env: Any, course_id: int) -> dict[str, Any] | None:
    """Return one course plus its related records from D1."""
    course_sql = """
        SELECT
            id,
            run_id AS runId,
            node_id AS nodeId,
            unit_id AS unitId,
            period_id AS periodId,
            title,
            number,
            catalog_title AS catalogTitle,
            organisation,
            course_type AS courseType,
            offering_frequency AS offeringFrequency,
            registration_period AS registrationPeriod,
            short_comment AS shortComment,
            semester_hours AS semesterHours,
            detail_url AS detailUrl,
            detail_page_url AS detailPageUrl,
            raw_fields_json AS rawFieldsJson
        FROM courses
        WHERE id = ?
        LIMIT 1
    """
    course = await fetch_one(env, course_sql, [course_id])
    if course is None:
        return None

    lecturers_sql = """
        SELECT
            l.id,
            l.display_name AS displayName,
            l.title,
            l.name,
            l.email,
            l.department,
            cl.source,
            cl.source_text AS sourceText
        FROM course_lecturers AS cl
        JOIN lecturers AS l ON l.id = cl.lecturer_id
        WHERE cl.course_id = ?
        ORDER BY l.display_name ASC
    """
    parallel_groups_sql = """
        SELECT
            id,
            position,
            title,
            group_type AS groupType,
            language,
            responsible_text AS responsibleText,
            max_participants AS maxParticipants,
            min_participants AS minParticipants,
            semester_hours AS semesterHours,
            raw_fields_json AS rawFieldsJson
        FROM parallel_groups
        WHERE course_id = ?
        ORDER BY position ASC
    """
    appointments_sql = """
        SELECT
            a.id,
            a.parallel_group_id AS parallelGroupId,
            a.position,
            a.rhythm,
            a.weekday,
            a.weekday_index AS weekdayIndex,
            a.time_text AS timeText,
            a.start_time AS startTime,
            a.end_time AS endTime,
            a.time_note AS timeNote,
            a.date_text AS dateText,
            a.starts_on AS startsOn,
            a.ends_on AS endsOn,
            a.room_text AS roomText,
            a.instructors_text AS instructorsText,
            a.expected_participants AS expectedParticipants,
            a.note,
            a.cancellation_text AS cancellationText
        FROM appointments AS a
        JOIN parallel_groups AS pg ON pg.id = a.parallel_group_id
        WHERE pg.course_id = ?
        ORDER BY a.weekday_index ASC, a.start_time ASC, a.position ASC
    """
    assessment_dates_sql = """
        SELECT
            id,
            date_value AS dateValue,
            kind,
            source,
            source_title AS sourceTitle,
            context,
            raw_text AS rawText
        FROM assessment_dates
        WHERE course_id = ?
        ORDER BY date_value ASC, kind ASC
    """
    content_sections_sql = """
        SELECT
            position,
            title,
            text
        FROM content_sections
        WHERE course_id = ?
        ORDER BY position ASC
    """
    course_fields_sql = """
        SELECT
            key,
            value
        FROM course_fields
        WHERE course_id = ?
        ORDER BY key ASC
    """

    lecturers = await fetch_all(env, lecturers_sql, [course_id])
    parallel_groups = await fetch_all(env, parallel_groups_sql, [course_id])
    appointments = await fetch_all(env, appointments_sql, [course_id])
    assessment_dates = await fetch_all(env, assessment_dates_sql, [course_id])
    content_sections = await fetch_all(env, content_sections_sql, [course_id])
    course_fields = await fetch_all(env, course_fields_sql, [course_id])

    return {
        "course": course,
        "lecturers": lecturers,
        "parallelGroups": parallel_groups,
        "appointments": appointments,
        "assessmentDates": assessment_dates,
        "contentSections": content_sections,
        "courseFields": {
            row["key"]: row["value"]
            for row in course_fields
            if "key" in row and "value" in row
        },
    }
