import coursesData from '../data/courses.json'
import type { Course } from '../types'

interface CoursesData {
  courses: Course[]
}

/**
 * Provides the static course catalog bundled from courses.json.
 * The cast narrows the JSON's widened string types (e.g. masterCats)
 * back to the typed Course shape; the data file is the source of truth.
 */
export function useCourses(): { courses: Course[] } {
  const { courses } = coursesData as CoursesData
  return { courses }
}
