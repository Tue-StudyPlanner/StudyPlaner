import type { CompletedCourse, MasterCat } from '../../courses'
import { CategoryToggle } from './CategoryToggle'
import { CloseIcon } from './icons'

const ALL_CATEGORIES: MasterCat[] = ['TECH', 'THEO', 'PRAK', 'INFO', 'FOKUS', 'BASIS']

interface SavedCompletedCourseRowProps {
  course: CompletedCourse
  isLast: boolean
  onRemove: () => void
  onCategoryChange: (cat: MasterCat) => void
  onSemesterChange: (semester: string) => void
  onGradeChange: (grade: string) => void
}

export function SavedCompletedCourseRow({
  course,
  isLast,
  onRemove,
  onCategoryChange,
  onSemesterChange,
  onGradeChange,
}: SavedCompletedCourseRowProps) {
  return (
    <div className={`flex items-start gap-3 py-3 ${isLast ? '' : 'border-b border-border-light'}`}>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-fg">{course.title}</div>
        <div className="mb-2.5 text-[11px] text-fg-muted">
          {(course.courseNumber || course.externalCourseCode || 'Manual entry') + ` · ${course.ects} ECTS`}
        </div>
        <div className="mb-2.5 flex flex-wrap gap-1">
          {ALL_CATEGORIES.map((cat) => (
            <CategoryToggle
              key={cat}
              cat={cat}
              active={cat === course.masterCat}
              onClick={() => onCategoryChange(cat)}
            />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Semester
            </span>
            <input
              type="text"
              value={course.semester}
              onChange={(event) => onSemesterChange(event.target.value)}
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
              value={course.grade ?? ''}
              onChange={(event) => onGradeChange(event.target.value)}
              placeholder="optional"
              className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary"
            />
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
