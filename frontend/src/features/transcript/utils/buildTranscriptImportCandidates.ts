import type { Course, MasterCat } from '../../courses'
import type {
  ParsedTranscriptEntry,
  TranscriptCoursePreview,
  TranscriptImportCandidate,
  TranscriptImportStatus,
} from '../types'

interface CourseMatchResult {
  preview: TranscriptCoursePreview
  score: number
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'de',
  'der',
  'des',
  'die',
  'for',
  'from',
  'in',
  'mit',
  'of',
  'the',
  'und',
  'with',
])

function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

export function toTranscriptCoursePreview(course: Course): TranscriptCoursePreview {
  return {
    id: course.id,
    number: course.number,
    title: course.title,
    ects: course.ects,
    masterCats: course.masterCats,
  }
}

function scoreCourseMatch(candidateTitle: string, course: Course, expectedEcts: number | null): number {
  const normalizedCandidateTitle = normalizeText(candidateTitle)
  const normalizedCourseTitle = normalizeText(course.title)
  if (!normalizedCandidateTitle || !normalizedCourseTitle) {
    return 0
  }

  if (normalizedCandidateTitle === normalizedCourseTitle) {
    return expectedEcts !== null && course.ects === expectedEcts ? 1 : 0.98
  }

  if (
    normalizedCandidateTitle.length >= 12 &&
    normalizedCourseTitle.includes(normalizedCandidateTitle)
  ) {
    return expectedEcts !== null && course.ects === expectedEcts ? 0.95 : 0.9
  }

  if (
    normalizedCourseTitle.length >= 12 &&
    normalizedCandidateTitle.includes(normalizedCourseTitle)
  ) {
    return expectedEcts !== null && course.ects === expectedEcts ? 0.93 : 0.88
  }

  const candidateTokens = tokenize(candidateTitle)
  const courseTokens = tokenize(course.title)
  if (candidateTokens.length === 0 || courseTokens.length === 0) {
    return 0
  }

  const courseTokenSet = new Set(courseTokens)
  const overlappingTokenCount = candidateTokens.filter((token) => courseTokenSet.has(token)).length
  if (overlappingTokenCount === 0) {
    return 0
  }

  const tokenScore = overlappingTokenCount / Math.max(candidateTokens.length, courseTokens.length)
  const ectsBonus = expectedEcts !== null && course.ects === expectedEcts ? 0.08 : 0
  return Math.min(0.92, tokenScore + ectsBonus)
}

function getValidationIssues(candidate: TranscriptImportCandidate): string[] {
  const issues = [...candidate.parseIssues]

  if (!candidate.title.trim()) {
    issues.push('Title is missing.')
  }
  if (!candidate.semester.trim()) {
    issues.push('Semester is missing.')
  }
  if (candidate.ects === null || candidate.ects <= 0) {
    issues.push('ECTS must be greater than 0.')
  }
  if (candidate.grade !== null && (candidate.grade < 1 || candidate.grade > 5)) {
    issues.push('Grade must stay between 1.0 and 5.0.')
  }

  return [...new Set(issues)]
}

function getStatus(candidate: TranscriptImportCandidate, validationIssues: string[]): TranscriptImportStatus {
  if (validationIssues.length > 0) {
    return 'invalid'
  }
  if (candidate.courseId && candidate.matchedCourse) {
    return 'matched'
  }
  if (candidate.matchOptions.length > 0) {
    return 'uncertain'
  }
  return 'unmatched'
}

function getStatusDetail(candidate: TranscriptImportCandidate, status: TranscriptImportStatus, validationIssues: string[]): string {
  if (status === 'invalid') {
    return validationIssues[0] ?? 'This row needs manual review.'
  }
  if (status === 'matched' && candidate.matchedCourse) {
    return `Matched to ${candidate.matchedCourse.number || candidate.matchedCourse.title}.`
  }
  if (status === 'uncertain') {
    return 'Please review the suggested catalog match before importing.'
  }
  return 'No catalog match was found. You can still keep the extracted title or assign a catalog course manually.'
}

function finalizeCandidate(candidate: TranscriptImportCandidate): TranscriptImportCandidate {
  const validationIssues = getValidationIssues(candidate)
  const status = getStatus(candidate, validationIssues)

  return {
    ...candidate,
    validationIssues,
    status,
    statusDetail: getStatusDetail(candidate, status, validationIssues),
  }
}

function buildMatchResults(entry: ParsedTranscriptEntry, courses: Course[]): CourseMatchResult[] {
  const scoredMatches: CourseMatchResult[] = []

  for (const course of courses) {
    const score = Math.max(
      ...entry.titleCandidates.map((candidateTitle) =>
        scoreCourseMatch(candidateTitle, course, entry.extractedEcts),
      ),
    )

    if (score < 0.55) {
      continue
    }

    scoredMatches.push({
      preview: toTranscriptCoursePreview(course),
      score,
    })
  }

  return scoredMatches.sort((firstMatch, secondMatch) => secondMatch.score - firstMatch.score)
}

function pickDefaultMasterCat(entry: ParsedTranscriptEntry, matchedCourse: TranscriptCoursePreview | null): MasterCat {
  return matchedCourse?.masterCats[0] ?? entry.defaultMasterCat
}

export function buildTranscriptImportCandidates(
  entries: ParsedTranscriptEntry[],
  courses: Course[],
): TranscriptImportCandidate[] {
  return entries.map((entry) => {
    const matchResults = buildMatchResults(entry, courses)
    const topMatch = matchResults[0] ?? null
    const secondMatch = matchResults[1] ?? null
    const shouldAutoMatch = Boolean(
      topMatch && (
        topMatch.score >= 0.98 ||
        (!secondMatch && topMatch.score >= 0.82) ||
        (topMatch.score >= 0.9 && topMatch.score - (secondMatch?.score ?? 0) >= 0.12)
      ),
    )
    const matchedCourse = shouldAutoMatch ? topMatch?.preview ?? null : null

    return finalizeCandidate({
      id: entry.id,
      sourcePage: entry.sourcePage,
      sourceSection: entry.sourceSection,
      rawText: entry.rawText,
      extractedTitle: entry.extractedTitle,
      titleCandidates: entry.titleCandidates,
      selected: true,
      title: matchedCourse?.title ?? entry.extractedTitle,
      semester: entry.extractedSemester ?? '',
      grade: entry.extractedGrade,
      ects: matchedCourse?.ects ?? entry.extractedEcts,
      masterCat: pickDefaultMasterCat(entry, matchedCourse),
      status: matchedCourse ? 'matched' : matchResults.length > 0 ? 'uncertain' : 'unmatched',
      statusDetail: '',
      parseIssues: entry.parseIssues,
      validationIssues: [],
      matchOptions: matchResults.slice(0, 5).map((matchResult) => matchResult.preview),
      matchedCourse,
      courseId: matchedCourse?.id ?? null,
      courseNumber: matchedCourse?.number ?? null,
      isUserEdited: false,
    })
  })
}

export function applyCatalogCourseMatch(
  candidate: TranscriptImportCandidate,
  course: TranscriptCoursePreview,
): TranscriptImportCandidate {
  return finalizeCandidate({
    ...candidate,
    title: course.title,
    ects: course.ects,
    masterCat: course.masterCats[0] ?? candidate.masterCat,
    matchedCourse: course,
    courseId: course.id,
    courseNumber: course.number,
    selected: true,
    isUserEdited: true,
    matchOptions: [course, ...candidate.matchOptions.filter((option) => option.id !== course.id)].slice(0, 5),
  })
}

export function clearCatalogCourseMatch(candidate: TranscriptImportCandidate): TranscriptImportCandidate {
  return finalizeCandidate({
    ...candidate,
    matchedCourse: null,
    courseId: null,
    courseNumber: null,
    isUserEdited: true,
  })
}

export function updateTranscriptImportCandidate(
  candidate: TranscriptImportCandidate,
  updates: Partial<TranscriptImportCandidate>,
): TranscriptImportCandidate {
  return finalizeCandidate({
    ...candidate,
    ...updates,
    isUserEdited: true,
  })
}

export function matchesCourseQuery(course: TranscriptCoursePreview, query: string): boolean {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) {
    return true
  }

  return [course.number, course.title]
    .map((value) => normalizeText(value))
    .some((value) => value.includes(normalizedQuery))
}
