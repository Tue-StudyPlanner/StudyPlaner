import type { Course, MasterCat } from '../types'
import { ClockIcon, PinIcon, UserIcon } from './icons'

interface CourseCardProps {
  course: Course
}

// Static class strings per category so Tailwind can detect them at build time.
const CAT_BADGE_CLASSES: Record<MasterCat, string> = {
  TECH: 'text-cat-tech border-cat-tech bg-cat-tech/20',
  THEO: 'text-cat-theo border-cat-theo bg-cat-theo/20',
  PRAK: 'text-cat-prak border-cat-prak bg-cat-prak/20',
  INFO: 'text-cat-info border-cat-info bg-cat-info/20',
  FOKUS: 'text-cat-fokus border-cat-fokus bg-cat-fokus/20',
  BASIS: 'text-cat-basis border-cat-basis bg-cat-basis/20',
}

function CatBadge({ cat }: { cat: MasterCat }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.04em] ${CAT_BADGE_CLASSES[cat]}`}
    >
      {cat}
    </span>
  )
}

function TypePill({ label }: { label: string }) {
  return (
    <span className="inline-block whitespace-nowrap rounded-full border border-pill-border bg-pill-bg px-2.5 py-0.75 text-[11px] font-medium text-pill-text">
      {label}
    </span>
  )
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[12.5px] text-fg-mid">
      <span className="text-fg-muted">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{text}</span>
    </div>
  )
}

// The course data lists academic titles; the card shows the plain name.
function plainLecturerName(lecturer: string): string {
  return lecturer.replace(/Prof\. Dr\. |Prof\. |Dr\. /g, '')
}

export function CourseCard({ course }: CourseCardProps) {
  const slot = course.schedule[0]

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface px-4.5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-2">
        <TypePill label={course.types.join(' + ')} />
        <div className="flex flex-1 flex-wrap gap-0.75">
          {course.masterCats.map((cat) => (
            <CatBadge key={cat} cat={cat} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-0.5 text-[15.5px] font-semibold leading-tight text-fg">{course.title}</div>
        <div className="text-[12px] text-fg-muted">{course.number}</div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border-light pt-1">
        <InfoRow icon={<UserIcon />} text={plainLecturerName(course.lecturer)} />
        <InfoRow icon={<ClockIcon />} text={`${slot.day}, ${slot.time}`} />
        <InfoRow icon={<PinIcon />} text={slot.room} />
      </div>

      <div className="flex items-center border-t border-border-light pt-1.5">
        <span className="text-[13px] font-bold text-fg">
          {course.ects} <span className="text-[11px] font-normal text-fg-muted">ECTS</span>
        </span>
      </div>
    </div>
  )
}
