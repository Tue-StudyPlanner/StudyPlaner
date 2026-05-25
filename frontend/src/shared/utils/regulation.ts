import type { MasterCat, StudyAreaOption } from '../../features/courses'

export interface RegulationRuleGroup {
  code: string
  name: string
  groupType: string
  requiredEcts?: number | null
  sortOrder?: number | null
}

export interface RegulationVersionDetail {
  code: string
  ruleGroups: RegulationRuleGroup[]
}

export interface RegulationAreaOption {
  code: string
  label: string
  masterCat: MasterCat | null
  isFlexible: boolean
}

export function studyAreaCodeToMasterCat(studyAreaCode: string | null | undefined): MasterCat | null {
  const normalizedCode = studyAreaCode?.trim().toUpperCase() ?? ''
  if (!normalizedCode) {
    return null
  }
  if (normalizedCode.endsWith('TECH')) {
    return 'TECH'
  }
  if (normalizedCode.endsWith('THEO')) {
    return 'THEO'
  }
  if (normalizedCode.endsWith('PRAK')) {
    return 'PRAK'
  }
  if (normalizedCode === 'INFO' || normalizedCode === 'INFO-INFO' || normalizedCode === 'ML-CS' || normalizedCode.endsWith('-INFO')) {
    return 'INFO'
  }
  if (
    normalizedCode === 'INFO-FOKUS'
    || normalizedCode === 'ML-DIVERSE'
    || normalizedCode === 'ML-EXP'
    || normalizedCode === 'PROSEM'
    || normalizedCode === 'UEBK'
    || normalizedCode === 'MATH'
    || normalizedCode === 'INF'
    || normalizedCode === 'INFO-BASIS'
    || normalizedCode === 'ML-FOUND'
    || normalizedCode.endsWith('BASIS')
  ) {
    return 'BASIS'
  }
  return null
}

export function isFlexibleRegulationArea(
  ruleGroup: Pick<RegulationRuleGroup, 'code' | 'name' | 'groupType'>,
): boolean {
  const normalizedCode = ruleGroup.code.trim().toUpperCase()
  const normalizedName = ruleGroup.name.trim().toLowerCase()
  const normalizedGroupType = ruleGroup.groupType.trim().toLowerCase()

  if (normalizedCode === 'THESIS') {
    return false
  }
  if (normalizedCode === 'UEBK') {
    return true
  }
  if (normalizedGroupType === 'elective_area' || normalizedGroupType === 'structured_elective') {
    return true
  }
  if (
    [
      'PRAK',
      'TECH',
      'THEO',
      'INFO',
      'ELECTIVE',
      'INFO-PRAK',
      'INFO-TECH',
      'INFO-THEO',
      'INFO-INFO',
      'INFO-FOKUS',
      'INFO-BASIS',
      'ML-FOUND',
      'ML-DIVERSE',
      'ML-CS',
      'ML-EXP',
    ].includes(normalizedCode)
  ) {
    return true
  }

  return ['wahl', 'elective', 'fokus', 'basis', 'diverse', 'expanded'].some((keyword) =>
    normalizedName.includes(keyword),
  )
}

function dedupeAreaOptions(options: RegulationAreaOption[]): RegulationAreaOption[] {
  const seenCodes = new Set<string>()
  return options.filter((option) => {
    if (seenCodes.has(option.code)) {
      return false
    }
    seenCodes.add(option.code)
    return true
  })
}

export function buildRelevantCourseAreaOptions(
  studyAreaOptions: StudyAreaOption[] | undefined,
  studyProgramCode: string | null | undefined,
): RegulationAreaOption[] {
  if (!studyAreaOptions || studyAreaOptions.length === 0) {
    return []
  }

  const filteredOptions = studyAreaOptions.filter(
    (option) => !studyProgramCode || option.programCode === studyProgramCode,
  )
  const relevantOptions = filteredOptions.length > 0 ? filteredOptions : studyAreaOptions

  return dedupeAreaOptions(
    relevantOptions
      .filter((option): option is StudyAreaOption & { studyAreaCode: string } => Boolean(option.studyAreaCode))
      .map((option) => ({
        code: option.studyAreaCode,
        label: option.studyAreaName || option.studyAreaCode,
        masterCat: studyAreaCodeToMasterCat(option.studyAreaCode),
        isFlexible: true,
      })),
  )
}

export function buildFlexibleRegulationAreaOptions(
  ruleGroups: RegulationRuleGroup[],
): RegulationAreaOption[] {
  return dedupeAreaOptions(
    ruleGroups
      .filter((ruleGroup) => isFlexibleRegulationArea(ruleGroup))
      .map((ruleGroup) => ({
        code: ruleGroup.code,
        label: ruleGroup.name,
        masterCat: studyAreaCodeToMasterCat(ruleGroup.code),
        isFlexible: true,
      })),
  )
}

export function findRegulationAreaLabel(
  ruleGroups: RegulationRuleGroup[],
  studyAreaCode: string | null | undefined,
): string | null {
  if (!studyAreaCode) {
    return null
  }
  return ruleGroups.find((ruleGroup) => ruleGroup.code === studyAreaCode)?.name ?? null
}
