import { useEffect, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import { ApiError } from '../../../shared/utils/api'
import { useAuth } from '../../auth'
import type { CompletedCourse, MasterCat } from '../../courses'
import { fetchCompletedCourses, saveCompletedCourses } from '../api'
import { TranscriptContext } from '../TranscriptContext'
import type { TranscriptSaveResult } from '../types'

interface TranscriptProviderProps {
  children: ReactNode
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to synchronize completed courses.'
}

function normalizeCompletedCourseKey(course: Pick<CompletedCourse, 'courseId' | 'title' | 'semester' | 'ects' | 'grade'>): string {
  if (course.courseId) {
    return `course:${course.courseId}`
  }

  return [
    'manual',
    course.title.trim().toLowerCase(),
    course.semester.trim().toLowerCase(),
    String(course.ects),
    course.grade === null ? 'no-grade' : String(course.grade),
  ].join(':')
}

function emptySaveResult(): TranscriptSaveResult {
  return {
    saved: false,
    addedCount: 0,
    skippedDuplicateCount: 0,
  }
}

export function TranscriptProvider({ children }: TranscriptProviderProps): JSX.Element {
  const { token } = useAuth()
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([])
  const [isLoadingCompletedCourses, setIsLoadingCompletedCourses] = useState<boolean>(false)
  const [isSavingCompletedCourses, setIsSavingCompletedCourses] = useState<boolean>(false)
  const [completedCoursesError, setCompletedCoursesError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadCompletedCourses(): Promise<void> {
      if (!token) {
        if (isActive) {
          setCompletedCourses([])
          setCompletedCoursesError(null)
          setIsLoadingCompletedCourses(false)
        }
        return
      }

      setIsLoadingCompletedCourses(true)
      setCompletedCoursesError(null)
      try {
        const nextCompletedCourses = await fetchCompletedCourses(token)
        if (!isActive) {
          return
        }
        setCompletedCourses(nextCompletedCourses)
      } catch (error) {
        if (isActive) {
          setCompletedCourses([])
          setCompletedCoursesError(normalizeErrorMessage(error))
        }
      } finally {
        if (isActive) {
          setIsLoadingCompletedCourses(false)
        }
      }
    }

    void loadCompletedCourses()

    return () => {
      isActive = false
    }
  }, [token])

  async function persistCompletedCourses(nextCompletedCourses: CompletedCourse[]): Promise<boolean> {
    if (!token) {
      setCompletedCoursesError('Sign in to save completed courses and progress.')
      return false
    }

    const previousCompletedCourses = completedCourses
    setCompletedCourses(nextCompletedCourses)
    setCompletedCoursesError(null)
    setIsSavingCompletedCourses(true)

    try {
      const savedCompletedCourses = await saveCompletedCourses(token, nextCompletedCourses)
      setCompletedCourses(savedCompletedCourses)
      return true
    } catch (error) {
      setCompletedCourses(previousCompletedCourses)
      setCompletedCoursesError(normalizeErrorMessage(error))
      return false
    } finally {
      setIsSavingCompletedCourses(false)
    }
  }

  async function addCompletedCourses(courses: CompletedCourse[]): Promise<TranscriptSaveResult> {
    if (courses.length === 0) {
      return emptySaveResult()
    }

    const existingKeys = new Set(completedCourses.map(normalizeCompletedCourseKey))
    const seenNewKeys = new Set<string>()
    const nextCoursesToAppend: CompletedCourse[] = []

    for (const course of courses) {
      const key = normalizeCompletedCourseKey(course)
      if (existingKeys.has(key) || seenNewKeys.has(key)) {
        continue
      }
      seenNewKeys.add(key)
      nextCoursesToAppend.push(course)
    }

    const skippedDuplicateCount = courses.length - nextCoursesToAppend.length
    if (nextCoursesToAppend.length === 0) {
      setCompletedCoursesError('The selected course data is already stored in your completed-course list.')
      return {
        saved: false,
        addedCount: 0,
        skippedDuplicateCount,
      }
    }

    const saved = await persistCompletedCourses([...completedCourses, ...nextCoursesToAppend])
    return {
      saved,
      addedCount: saved ? nextCoursesToAppend.length : 0,
      skippedDuplicateCount,
    }
  }

  async function addCompletedCourse(course: CompletedCourse): Promise<TranscriptSaveResult> {
    return await addCompletedCourses([course])
  }

  async function removeCourse(courseId: string): Promise<boolean> {
    return await persistCompletedCourses(completedCourses.filter((course) => course.id !== courseId))
  }

  async function setCategory(courseId: string, masterCat: MasterCat): Promise<boolean> {
    return await persistCompletedCourses(
      completedCourses.map((course) =>
        course.id === courseId ? { ...course, masterCat } : course,
      ),
    )
  }

  async function updateCourse(courseId: string, updates: Partial<CompletedCourse>): Promise<boolean> {
    return await persistCompletedCourses(
      completedCourses.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course,
      ),
    )
  }

  function clearCompletedCoursesError(): void {
    setCompletedCoursesError(null)
  }

  return (
    <TranscriptContext.Provider
      value={{
        completedCourses,
        isLoadingCompletedCourses,
        isSavingCompletedCourses,
        completedCoursesError,
        addCompletedCourse,
        addCompletedCourses,
        removeCourse,
        setCategory,
        updateCourse,
        clearCompletedCoursesError,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  )
}
