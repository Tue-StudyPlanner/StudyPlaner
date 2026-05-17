import type { MasterCat } from '../courses'

export interface StudyStats {
  totalEcts: number
  requiredEcts: number
  progress: number
  averageGrade: number | null
}

export interface CategoryProgress {
  cat: MasterCat
  label: string
  earnedEcts: number
  requiredEcts: number
}

export interface ThesisProgress {
  label: string
  earnedEcts: number
  requiredEcts: number
}
