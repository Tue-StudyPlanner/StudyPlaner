import type { CompletedCourse, MasterCat } from '../../courses'
import { CategoryToggle } from './CategoryToggle'
import { CloseIcon } from './icons'
import { StudyAreaAssignmentField } from './StudyAreaAssignmentField'
import type { RegulationRuleGroup } from '../../../shared/utils/regulation'
import {
  buildFlexibleRegulationAreaOptions,
  studyAreaCodeToMasterCat,
} from '../../../shared/utils/regulation'

const ALL_CATEGORIES: MasterCat[] = ['TECH', 'THEO', 'PRAK', 'INFO', 'BASIS']

function formatOptionalNumber(value: number | null): string {
  return value === null ? '' : String(value)
}

interface SavedCompletedCourseRowProps {
  course: CompletedCourse
  isLast: boolean
  studyProgramCode?: string | null
  regulationRuleGroups: RegulationRuleGroup[]
  onRemove: () => void
  onCourseChange: (updates: Partial<CompletedCourse>) => void
}

export function SavedCompletedCourseRow({
  course,
  isLast,
  regulationRuleGroups,
  onRemove,
  onCourseChange,
}: SavedCompletedCourseRowProps) {
  const hasActiveRegulation = regulationRuleGroups.length > 0
  const mappedAreaOptions = (course.availableStudyAreaOptions ?? []).map((option) => ({
    code: option.studyAreaCode,
    label: option.studyAreaName || option.studyAreaCode,
    masterCat: studyAreaCodeToMasterCat(option.studyAreaCode),
    isFlexible: true,
  }))
  const flexibleAreaOptions = buildFlexibleRegulationAreaOptions(regulationRuleGroups)
  const areaOptions = mappedAreaOptions.length > 0 ? mappedAreaOptions : flexibleAreaOptions

  return (
    <div className={`flex items-start gap-3 py-3 ${isLast ? '' : 'border-b border-border-light'}`}>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-fg">{course.title}</div>
        <div className="mb-2.5 text-[11px] text-fg-muted">
          {(course.courseNumber || course.externalCourseCode || 'Manual entry') + ` · ${course.ects} ECTS`}
        </div>

        {hasActiveRegulation ? (
          <div className="mb-2.5">
            <StudyAreaAssignmentField
              value={course.studyAreaCode ?? null}
              options={areaOptions}
              locked={Boolean(course.categoryLocked)}
              helpText={
                course.categoryLocked
                  ? 'Locked by the active examination regulation.'
                  : mappedAreaOptions.length > 1
                    ? 'Choose the correct regulation area for this course.'
                    : 'Manual courses can only be assigned to flexible regulation areas or ÜBK.'
              }
              onChange={(nextStudyAreaCode) =>
                onCourseChange({
                  studyAreaCode: nextStudyAreaCode,
                  masterCat: studyAreaCodeToMasterCat(nextStudyAreaCode) ?? course.masterCat,
                })
              }
            />
          </div>
        ) : (
          <div className="mb-2.5 flex flex-wrap gap-1">
            {ALL_CATEGORIES.map((cat) => (
              <CategoryToggle
                key={cat}
                cat={cat}
                active={cat === course.masterCat}
                onClick={() => onCourseChange({ masterCat: cat })}
              />
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Semester
            </span>
            <input
              type="text"
              value={course.semester}
              onChange={(event) => onCourseChange({ semester: event.target.value })}
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
              value={formatOptionalNumber(course.grade)}
              onChange={(event) =>
                onCourseChange({ grade: event.target.value.trim() === '' ? null : Number(event.target.value) })
              }
              placeholder="optional"
              className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary"
            />
            {course.isGradeCounted === false ? (
              <span className="text-[11px] text-fg-muted">ÜBK grades do not count toward the average.</span>
            ) : null}
          </label>
        </div>
      </div>
      <span className="shrink-0 pt-1 text-[16px] font-bold text-fg">{course.grade ?? '–'}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${course.title}`}
        className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
