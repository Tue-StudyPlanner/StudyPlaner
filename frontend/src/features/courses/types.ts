export type MasterCat = 'TECH' | 'THEO' | 'PRAK' | 'INFO' | 'FOKUS' | 'BASIS'

export interface ScheduleSlot {
  day: string
  time: string
  room: string
  type: string
}

export interface CourseExam {
  type: string
  date: string
  duration: string
}

export interface CompletedCourse {
  id: string
  ects: number
  grade: number
  semester: string
}

export interface Course {
  id: string
  number: string
  title: string
  lecturer: string
  room: string
  types: string[]
  ects: number
  sws: number
  masterCats: MasterCat[]
  weekdays: string[]
  schedule: ScheduleSlot[]
  frequency: string
  language: string
  prerequisites: string[]
  description: string
  exams: CourseExam[]
}
