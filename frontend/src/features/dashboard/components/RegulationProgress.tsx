import type { MasterCat } from '../../courses'
import type { RegulationAreaProgress } from '../types'

const CAT_COLOR_CLASS: Partial<Record<MasterCat, string>> & { default: string } = {
  TECH: 'bg-cat-tech',
  THEO: 'bg-cat-theo',
  PRAK: 'bg-cat-prak',
  INFO: 'bg-cat-info',
  BASIS: 'bg-cat-basis',
  default: 'bg-border',
}

function colorClass(masterCat: MasterCat | null): string {
  return (masterCat ? CAT_COLOR_CLASS[masterCat] : undefined) ?? CAT_COLOR_CLASS.default
}

interface RegulationProgressProps {
  areas: RegulationAreaProgress[]
}

export function RegulationProgress({ areas }: RegulationProgressProps) {
  if (areas.length === 0) {
    return null
  }

  return (
    <div className="rounded-[10px] border border-border bg-surface px-6 py-5.5">
      <div className="mb-4.5 text-[14px] font-semibold text-fg">Regulation Progress</div>
      <div className="grid gap-3.5">
        {areas.map((area) => {
          const pct = area.requiredEcts > 0
            ? Math.min(100, Math.round((area.earnedEcts / area.requiredEcts) * 100))
            : 0
          return (
            <div key={area.code}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-xs ${colorClass(area.masterCat)}`} />
                  <span className="text-[13px] font-semibold text-fg">{area.code}</span>
                  <span className="text-[12px] text-fg-muted">{area.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-fg">
                  {area.earnedEcts}/{area.requiredEcts}
                </span>
              </div>
              <div className="h-1.25 overflow-hidden rounded-[3px] bg-border-light">
                <div
                  className={`h-full rounded-[3px] ${colorClass(area.masterCat)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
