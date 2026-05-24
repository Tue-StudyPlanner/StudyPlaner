import { useMemo, useState } from 'react'
import type { Course, MasterCat } from '../../courses'
import type { TranscriptImportCandidate } from '../types'
import {
  applyCatalogCourseMatch,
  clearCatalogCourseMatch,
  toTranscriptCoursePreview,
  updateTranscriptImportCandidate,
} from '../utils/buildTranscriptImportCandidates'
import { CategoryToggle } from './CategoryToggle'

const ALL_CATEGORIES: MasterCat[] = ['TECH', 'THEO', 'PRAK', 'INFO', 'FOKUS', 'BASIS']

function formatOptionalNumber(value: number | null): string {
  return value === null ? '' : String(value)
}

function matchesCatalogCourse(course: Course, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return true
  }

  return [course.number, course.title, course.organisation ?? '']
    .map((value) => value.toLowerCase())
    .some((value) => value.includes(normalizedQuery))
}

function statusClasses(status: TranscriptImportCandidate['status']): string {
  switch (status) {
    case 'matched':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'uncertain':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'unmatched':
      return 'border-slate-200 bg-slate-100 text-slate-700'
    case 'invalid':
      return 'border-rose-200 bg-rose-50 text-rose-700'
  }
}

interface TranscriptImportRowProps {
  candidate: TranscriptImportCandidate
  catalogCourses: Course[]
  onChange: (candidate: TranscriptImportCandidate) => void
}

export function TranscriptImportRow({
  candidate,
  catalogCourses,
  onChange,
}: TranscriptImportRowProps) {
  const [catalogQuery, setCatalogQuery] = useState<string>('')
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState<boolean>(false)

  const filteredCatalogCourses = useMemo(
    () => catalogCourses.filter((course) => matchesCatalogCourse(course, catalogQuery)).slice(0, 6),
    [catalogCourses, catalogQuery],
  )

  return (
    <div className="rounded-[10px] border border-border bg-surface px-5 py-4.5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <input
            type="checkbox"
            checked={candidate.selected}
            onChange={(event) =>
              onChange(updateTranscriptImportCandidate(candidate, { selected: event.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${statusClasses(candidate.status)}`}>
                {candidate.status}
              </span>
              <span className="text-[11px] text-fg-muted">
                Page {candidate.sourcePage}
                {candidate.sourceSection ? ` · ${candidate.sourceSection}` : ''}
              </span>
            </div>
            <p className="text-[12.5px] text-fg-muted">{candidate.statusDetail}</p>
          </div>
        </div>

        {candidate.matchedCourse ? (
          <div className="rounded-lg border border-border-light px-3 py-2 text-right text-[12px] text-fg-mid">
            <div className="font-semibold text-fg">{candidate.matchedCourse.title}</div>
            <div>{candidate.matchedCourse.number || 'Catalog match selected'}</div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
            Title
          </span>
          <input
            type="text"
            value={candidate.title}
            onChange={(event) =>
              onChange(updateTranscriptImportCandidate(candidate, { title: event.target.value }))
            }
            className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Semester
            </span>
            <input
              type="text"
              value={candidate.semester}
              onChange={(event) =>
                onChange(updateTranscriptImportCandidate(candidate, { semester: event.target.value }))
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Grade
            </span>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formatOptionalNumber(candidate.grade)}
              onChange={(event) =>
                onChange(
                  updateTranscriptImportCandidate(candidate, {
                    grade: event.target.value.trim() ? Number(event.target.value) : null,
                  }),
                )
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              ECTS
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formatOptionalNumber(candidate.ects)}
              onChange={(event) =>
                onChange(
                  updateTranscriptImportCandidate(candidate, {
                    ects: event.target.value.trim() ? Number(event.target.value) : null,
                  }),
                )
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary"
            />
          </label>
        </div>

        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
            Category
          </div>
          <div className="flex flex-wrap gap-1">
            {ALL_CATEGORIES.map((cat) => (
              <CategoryToggle
                key={cat}
                cat={cat}
                active={cat === candidate.masterCat}
                onClick={() => onChange(updateTranscriptImportCandidate(candidate, { masterCat: cat }))}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-light px-4 py-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
                Catalog course
              </div>
              <div className="text-[12.5px] text-fg-mid">
                {candidate.matchedCourse
                  ? `${candidate.matchedCourse.number} · ${candidate.matchedCourse.title}`
                  : 'No catalog course selected yet.'}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCatalogPickerOpen((isOpen) => !isOpen)}
                className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-surface-hover"
              >
                {isCatalogPickerOpen ? 'Close picker' : candidate.matchedCourse ? 'Change course' : 'Choose course'}
              </button>
              {candidate.matchedCourse ? (
                <button
                  type="button"
                  onClick={() => onChange(clearCatalogCourseMatch(candidate))}
                  className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-surface-hover"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {isCatalogPickerOpen ? (
            <div className="grid gap-2">
              <input
                type="search"
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="Search catalog by title or number"
                className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary"
              />
              <div className="grid gap-2">
                {filteredCatalogCourses.length === 0 ? (
                  <div className="text-[12.5px] text-fg-muted">No matching catalog courses found.</div>
                ) : (
                  filteredCatalogCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        onChange(applyCatalogCourseMatch(candidate, toTranscriptCoursePreview(course)))
                        setIsCatalogPickerOpen(false)
                      }}
                      className="rounded-md border border-border-light px-3 py-2 text-left transition-colors hover:bg-surface-hover"
                    >
                      <div className="text-[12.5px] font-semibold text-fg">{course.title}</div>
                      <div className="text-[12px] text-fg-muted">
                        {course.number} · {course.ects ?? '–'} ECTS
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        {candidate.titleCandidates.length > 1 ? (
          <div className="rounded-lg border border-border-light px-4 py-3 text-[12.5px] text-fg-muted">
            Detected title variants: {candidate.titleCandidates.join(' / ')}
          </div>
        ) : null}

        <div className="grid gap-1.5">
          {candidate.validationIssues.length > 0 ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
              {candidate.validationIssues.join(' ')}
            </div>
          ) : null}
          {candidate.validationIssues.length === 0 && candidate.parseIssues.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-700">
              {candidate.parseIssues.join(' ')}
            </div>
          ) : null}
          <div className="rounded-lg border border-border-light px-4 py-3 text-[12px] text-fg-muted">
            Raw extracted row: {candidate.rawText}
          </div>
        </div>
      </div>
    </div>
  )
}
