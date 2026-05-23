import { PersonalFeatureNotice } from '../../../shared/components/PersonalFeatureNotice'
import { StatItem } from '../../../shared/components/StatItem'
import { useAuth } from '../../auth'
import { useStudyStats } from '../../transcript'
import { CategoryProgress } from './CategoryProgress'
import { CompletedCourses } from './CompletedCourses'

function AuthenticatedDashboard() {
  const { totalEcts, requiredEcts, progress, averageGrade } = useStudyStats()

  const stats = [
    { label: 'Total ECTS', value: String(totalEcts), sub: `/ ${requiredEcts} ECTS` },
    { label: 'Progress', value: `${progress} %`, sub: 'of degree' },
    {
      label: 'Ø Grade',
      value: averageGrade !== null ? averageGrade.toFixed(2) : '–',
      sub: 'German scale',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="mb-0.75 font-serif text-[26px] font-semibold tracking-[-0.02em] text-fg">
          Study Overview
        </h1>
        <p className="text-[13.5px] text-fg-muted">Summer Semester 2026 · Computer Science M.Sc.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 rounded-[10px] border border-border bg-surface px-6 py-4.5">
        {stats.map((stat, i) => (
          <div key={stat.label} className={i > 0 ? 'border-l border-border-light pl-6' : ''}>
            <StatItem {...stat} />
          </div>
        ))}
      </div>

      <div className="mt-4.5 grid grid-cols-2 gap-4.5">
        <CategoryProgress />
        <div className="flex items-center justify-center rounded-[10px] border border-dashed border-border bg-surface p-6 text-[13.5px] text-fg-muted">
          More insights coming soon
        </div>
      </div>

      <div className="mt-4.5">
        <CompletedCourses />
      </div>
    </div>
  )
}

export function Dashboard() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="mb-0.75 font-serif text-[26px] font-semibold tracking-[-0.02em] text-fg">
            Study Overview
          </h1>
          <p className="text-[13.5px] text-fg-muted">
            Your personal progress becomes available after you sign in.
          </p>
        </div>
        <PersonalFeatureNotice
          title="Progress is personal"
          description="The dashboard, category progress, and completed-course history belong to your account. Sign in to save and view your own study progress while the public catalog stays available without login."
        />
      </div>
    )
  }

  return <AuthenticatedDashboard />
}
