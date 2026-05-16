import coursesData from '../data/courses.json'
import type { CompletedCourse, Course } from '../types'

interface CoursesData {
  courses: Course[]
  completedCourses: CompletedCourse[]
}

export function useCourses(): { courses: Course[]; completedCourses: CompletedCourse[] } {
  const { courses, completedCourses } = coursesData as CoursesData
  return { courses, completedCourses }
}
