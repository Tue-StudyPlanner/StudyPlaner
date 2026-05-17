import type { MasterCat } from '../../courses'
import { useCategoryProgress } from '../hooks/useCategoryProgress'

const CAT_COLOR_CLASS: Record<MasterCat, string> = {
  TECH: 'bg-cat-tech',
  THEO: 'bg-cat-theo',
  PRAK: 'bg-cat-prak',
  INFO: 'bg-cat-info',
  FOKUS: 'bg-cat-fokus',
  BASIS: 'bg-cat-basis',
}

interface ProgressRowProps {
  code: string
  label: string
  earned: number
  required: number
  colorClass: string
}

function ProgressRow({ code, label, earned, required, colorClass }: ProgressRowProps) {
  const pct = Math.min(100, Math.round((earned / required) * 100))
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-xs ${colorClass}`} />
          <span className="text-[13px] font-semibold text-fg">{code}</span>
          <span className="text-[12px] text-fg-muted">{label}</span>
        </div>
        <span className="text-[12px] font-semibold text-fg">
          {earned}/{required}
        </span>
      </div>
      <div className="h-1.25 overflow-hidden rounded-[3px] bg-border-light">
        <div className={`h-full rounded-[3px] ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
      {children}
    </div>
  )
}

export function CategoryProgress() {
  const { core, electives, thesis } = useCategoryProgress()

  return (
    <div className="rounded-[10px] border border-border bg-surface px-6 py-5.5">
      <div className="mb-4.5 text-[14px] font-semibold text-fg">Progress by Category</div>

      <div className="grid gap-3.5">
        {core.map((c) => (
          <ProgressRow
            key={c.cat}
            code={c.cat}
            label={c.label}
            earned={c.earnedEcts}
            required={c.requiredEcts}
            colorClass={CAT_COLOR_CLASS[c.cat]}
          />
        ))}
      </div>

      <div className="mt-4.5 border-t border-border-light pt-3.5">
        <SectionLabel>Elective Area</SectionLabel>
        <div className="grid grid-cols-2 gap-4.5">
          {electives.map((c) => (
            <ProgressRow
              key={c.cat}
              code={c.cat}
              label={c.label}
              earned={c.earnedEcts}
              required={c.requiredEcts}
              colorClass={CAT_COLOR_CLASS[c.cat]}
            />
          ))}
        </div>
      </div>

      <div className="mt-4.5 border-t border-border-light pt-3.5">
        <SectionLabel>Thesis</SectionLabel>
        <ProgressRow
          code="Thesis"
          label={thesis.label}
          earned={thesis.earnedEcts}
          required={thesis.requiredEcts}
          colorClass="bg-thesis"
        />
      </div>
    </div>
  )
}
