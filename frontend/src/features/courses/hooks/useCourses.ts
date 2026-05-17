import coursesData from '@data/courses.json'
import type { CompletedCourse, Course, MasterCategoryMeta } from '../types'

interface CoursesData {
  courses: Course[]
  completedCourses: CompletedCourse[]
  masterCategoryMeta: MasterCategoryMeta
}

export function useCourses(): CoursesData {
  return coursesData as CoursesData
}
