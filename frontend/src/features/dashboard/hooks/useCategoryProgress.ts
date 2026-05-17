import { useCourses } from '../../courses'
import type { MasterCat } from '../../courses'
import type { CategoryProgress, ThesisProgress } from '../types'

const CORE_CATEGORIES: MasterCat[] = ['TECH', 'THEO', 'PRAK', 'INFO']
const ELECTIVE_CATEGORIES: MasterCat[] = ['FOKUS', 'BASIS']
const REQUIRED_ECTS_PER_CATEGORY = 18
const REQUIRED_ECTS_THESIS = 30

export function useCategoryProgress(): {
  core: CategoryProgress[]
  electives: CategoryProgress[]
  thesis: ThesisProgress
} {
  const { completedCourses, masterCategoryMeta } = useCourses()

  const earnedByCat = new Map<MasterCat, number>()
  for (const completed of completedCourses) {
    for (const cat of completed.masterCats) {
      earnedByCat.set(cat, (earnedByCat.get(cat) ?? 0) + completed.ects)
    }
  }

  const toProgress = (cat: MasterCat): CategoryProgress => {
    const earned = earnedByCat.get(cat) ?? 0
    return {
      cat,
      label: masterCategoryMeta[cat].fullLabel,
      earnedEcts: earned,
      requiredEcts: REQUIRED_ECTS_PER_CATEGORY,
    }
  }

  return {
    core: CORE_CATEGORIES.map(toProgress),
    electives: ELECTIVE_CATEGORIES.map(toProgress),
    thesis: { label: 'Master Thesis', earnedEcts: 0, requiredEcts: REQUIRED_ECTS_THESIS },
  }
}
