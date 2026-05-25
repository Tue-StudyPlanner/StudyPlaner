import type { RegulationAreaOption } from '../../../shared/utils/regulation'

interface StudyAreaAssignmentFieldProps {
  value: string | null
  options: RegulationAreaOption[]
  locked: boolean
  disabled?: boolean
  helpText?: string
  onChange: (studyAreaCode: string) => void
}

export function StudyAreaAssignmentField({
  value,
  options,
  locked,
  disabled,
  helpText,
  onChange,
}: StudyAreaAssignmentFieldProps) {
  const selectedOption = options.find((option) => option.code === value) ?? options[0] ?? null

  return (
    <div className="grid gap-1.5">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
          Regulation area
        </div>
        {helpText ? <p className="mt-1 text-[12px] text-fg-muted">{helpText}</p> : null}
      </div>

      {options.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-3 text-[12.5px] text-fg-muted">
          No compatible regulation areas are available for the current selection.
        </div>
      ) : locked && selectedOption ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <div className="text-[13px] font-semibold text-fg">{selectedOption.label}</div>
          <div className="text-[12px] text-fg-muted">Locked by the active examination regulation</div>
        </div>
      ) : (
        <select
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-fg outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Select a regulation area</option>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
