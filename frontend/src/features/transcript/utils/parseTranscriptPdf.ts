import type { MasterCat } from '../../courses'
import type { ParsedTranscriptEntry } from '../types'

interface TextItemLike {
  str: string
  transform: number[]
  width: number
}

interface TranscriptLine {
  page: number
  y: number
  x: number
  text: string
  items: TextItemLike[]
}

interface ParsedTranscriptRow {
  page: number
  y: number
  section: string | null
  rawText: string
  title: string
  semester: string
  grade: number | null
  ects: number | null
  hasDetailTokens: boolean
}

const SEMESTER_TOKEN_PATTERN = /(?:wt|st)\s+\d{4}(?:\/\d{2})?/i
const SEMESTER_VALUE_PATTERN = /^(?:wt|st)\s+\d{4}(?:\/\d{2})?$/i
const STATUS_VALUE_PATTERN = /^[A-Z]{1,6}$/

const SEMESTER_COLUMN_MIN_X = 295
const EXAMINER_COLUMN_MIN_X = 360
const FORM_COLUMN_MIN_X = 445
const GRADE_COLUMN_MIN_X = 460
const STATUS_COLUMN_MIN_X = 495
const ECTS_COLUMN_MIN_X = 532

const PAGE_BREAK_DUPLICATE_BOTTOM_Y_MAX = 140
const PAGE_BREAK_DUPLICATE_TOP_Y_MIN = 700

function isTextItemLike(value: unknown): value is TextItemLike {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Partial<TextItemLike>
  return (
    typeof item.str === 'string' &&
    Array.isArray(item.transform) &&
    typeof item.transform[4] === 'number' &&
    typeof item.transform[5] === 'number' &&
    typeof item.width === 'number'
  )
}

function createId(prefix: string, index: number): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${index}`
}

function normalizeLineText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/([^\s])((?:wt|st)\s+\d{4}(?:\/\d{2})?)/gi, '$1 $2')
    .replace(/\s+([,.)])/g, '$1')
    .trim()
}

function buildLineText(items: TextItemLike[]): string {
  let text = ''
  let previousRightEdge: number | null = null

  for (const item of items) {
    const rawSegment = item.str.replace(/\s+/g, ' ')
    const segment = rawSegment.trim()
    if (!segment) {
      previousRightEdge = item.transform[4] + item.width
      continue
    }

    const currentX = item.transform[4]
    const needsSpace =
      text.length > 0 &&
      !text.endsWith(' ') &&
      (segment.startsWith('(') ||
        SEMESTER_TOKEN_PATTERN.test(segment) ||
        (previousRightEdge !== null && currentX - previousRightEdge > 1.5))

    if (needsSpace) {
      text += ' '
    }

    text += segment
    previousRightEdge = item.transform[4] + item.width
  }

  return normalizeLineText(text)
}

function extractColumnText(line: TranscriptLine, minX: number, maxX?: number): string {
  const matchingItems = line.items.filter(
    (item) => item.transform[4] >= minX && (maxX === undefined || item.transform[4] < maxX),
  )
  return buildLineText(matchingItems)
}

function appendContinuationText(baseText: string, continuationText: string): string {
  if (baseText.endsWith('-')) {
    return normalizeLineText(`${baseText}${continuationText}`)
  }
  return normalizeLineText(`${baseText} ${continuationText}`)
}

function isHeaderOrFooter(line: TranscriptLine): boolean {
  return (
    /transcript of records/i.test(line.text) ||
    /^page \d+ of \d+$/i.test(line.text) ||
    /student id no:/i.test(line.text) ||
    /student id number:/i.test(line.text) ||
    /^tübingen, /i.test(line.text)
  )
}

function isSectionHeading(text: string): boolean {
  return /area:|professional skills|unassigned elements/i.test(text)
}

function extractSectionHeadingText(line: TranscriptLine): string {
  const sectionText = extractColumnText(line, 0, SEMESTER_COLUMN_MIN_X)
  return sectionText || normalizeLineText(line.text)
}

function toDefaultMasterCat(section: string | null): MasterCat {
  const normalizedSection = section?.toLowerCase() ?? ''
  if (normalizedSection.includes('practical computer science')) {
    return 'PRAK'
  }
  if (normalizedSection.includes('theoretical computer science') || normalizedSection.includes('logics')) {
    return 'THEO'
  }
  if (normalizedSection.includes('technical computer science') || normalizedSection.includes('robotik')) {
    return 'TECH'
  }
  if (normalizedSection.includes('mathematics')) {
    return 'BASIS'
  }
  // Professional skills and compulsory/mandatory areas → BASIS.
  // When the correct area is ambiguous, prefer BASIS.
  if (normalizedSection.includes('professional skills') || normalizedSection.includes('compulsory')) {
    return 'BASIS'
  }
  return 'INFO'
}

function normalizeSemesterLabel(semester: string): string {
  return semester.replace(/^wt/i, 'WS').replace(/^st/i, 'SS')
}

function shouldAppendContinuation(previousLine: TranscriptLine | null, currentLine: TranscriptLine): boolean {
  if (!previousLine) {
    return false
  }
  if (previousLine.page !== currentLine.page) {
    return false
  }
  if (SEMESTER_TOKEN_PATTERN.test(currentLine.text)) {
    return false
  }
  if (currentLine.x >= SEMESTER_COLUMN_MIN_X) {
    return false
  }
  if (isSectionHeading(currentLine.text) || isHeaderOrFooter(currentLine)) {
    return false
  }

  const distance = previousLine.y - currentLine.y
  return distance > 0 && distance <= 16
}

function parseTranscriptRow(line: TranscriptLine, section: string | null): ParsedTranscriptRow | null {
  const title = extractColumnText(line, 0, SEMESTER_COLUMN_MIN_X)
  const semesterText = extractColumnText(line, SEMESTER_COLUMN_MIN_X, EXAMINER_COLUMN_MIN_X)
  const examinerText = extractColumnText(line, EXAMINER_COLUMN_MIN_X, FORM_COLUMN_MIN_X)
  const formText = extractColumnText(line, FORM_COLUMN_MIN_X, GRADE_COLUMN_MIN_X)
  const gradeText = extractColumnText(line, GRADE_COLUMN_MIN_X, STATUS_COLUMN_MIN_X)
  const statusText = extractColumnText(line, STATUS_COLUMN_MIN_X, ECTS_COLUMN_MIN_X)
  const ectsText = extractColumnText(line, ECTS_COLUMN_MIN_X)

  if (!title || !SEMESTER_VALUE_PATTERN.test(semesterText) || !STATUS_VALUE_PATTERN.test(statusText) || !ectsText) {
    return null
  }

  const grade = gradeText ? Number(gradeText) : null
  const ects = Number(ectsText)
  if (!Number.isFinite(ects) || (grade !== null && !Number.isFinite(grade))) {
    return null
  }

  return {
    page: line.page,
    y: line.y,
    section,
    rawText: line.text,
    title,
    semester: normalizeSemesterLabel(semesterText),
    grade,
    ects,
    hasDetailTokens: Boolean(examinerText || formText),
  }
}

function haveMatchingRowOutcome(currentRow: ParsedTranscriptRow, nextRow: ParsedTranscriptRow): boolean {
  return (
    currentRow.section === nextRow.section &&
    currentRow.semester === nextRow.semester &&
    currentRow.grade === nextRow.grade &&
    currentRow.ects === nextRow.ects &&
    currentRow.hasDetailTokens !== nextRow.hasDetailTokens
  )
}

function areLikelyDuplicateRows(currentRow: ParsedTranscriptRow, nextRow: ParsedTranscriptRow): boolean {
  if (!haveMatchingRowOutcome(currentRow, nextRow)) {
    return false
  }

  if (currentRow.page === nextRow.page) {
    return currentRow.y - nextRow.y > 0 && currentRow.y - nextRow.y <= 28
  }

  if (nextRow.page !== currentRow.page + 1) {
    return false
  }

  return (
    currentRow.y <= PAGE_BREAK_DUPLICATE_BOTTOM_Y_MAX &&
    nextRow.y >= PAGE_BREAK_DUPLICATE_TOP_Y_MIN &&
    !currentRow.hasDetailTokens &&
    nextRow.hasDetailTokens
  )
}

function buildLineCollection(items: unknown[], pageNumber: number): TranscriptLine[] {
  const linesByY = new Map<number, TextItemLike[]>()

  for (const item of items) {
    if (!isTextItemLike(item)) {
      continue
    }
    const y = Math.round(item.transform[5])
    const sameLineItems = linesByY.get(y) ?? []
    sameLineItems.push(item)
    linesByY.set(y, sameLineItems)
  }

  return [...linesByY.entries()]
    .sort((firstEntry, secondEntry) => secondEntry[0] - firstEntry[0])
    .map(([y, lineItems]) => {
      const sortedItems = [...lineItems].sort((firstItem, secondItem) => firstItem.transform[4] - secondItem.transform[4])
      return {
        page: pageNumber,
        y,
        x: Math.round(Math.min(...sortedItems.map((item) => item.transform[4]))),
        text: buildLineText(sortedItems),
        items: sortedItems,
      }
    })
    .filter((line) => line.text.length > 0)
}

export async function parseTranscriptPdf(file: File): Promise<ParsedTranscriptEntry[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  if (typeof window !== 'undefined') {
    const workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString()
    if (pdfjs.GlobalWorkerOptions.workerSrc !== workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
    }
  }

  const fileBuffer = await file.arrayBuffer()
  const pdfDocument = await pdfjs.getDocument({
    data: new Uint8Array(fileBuffer),
  }).promise
  const parsedRows: ParsedTranscriptRow[] = []
  let activeSection: string | null = null
  let continuationAnchorLine: TranscriptLine | null = null
  let continuationRowIndex: number | null = null

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageLines = buildLineCollection(textContent.items, pageNumber)

    for (const line of pageLines) {
      if (isHeaderOrFooter(line)) {
        continue
      }

      if (isSectionHeading(line.text) && !SEMESTER_TOKEN_PATTERN.test(line.text)) {
        activeSection = extractSectionHeadingText(line)
        continuationAnchorLine = null
        continuationRowIndex = null
        continue
      }

      const parsedRow = parseTranscriptRow(line, activeSection)
      if (parsedRow) {
        parsedRows.push(parsedRow)
        continuationAnchorLine = line
        continuationRowIndex = parsedRows.length - 1
        continue
      }

      if (
        continuationAnchorLine &&
        continuationRowIndex !== null &&
        shouldAppendContinuation(continuationAnchorLine, line)
      ) {
        const previousParsedRow = parsedRows[continuationRowIndex]
        previousParsedRow.title = appendContinuationText(previousParsedRow.title, line.text)
        previousParsedRow.rawText = appendContinuationText(previousParsedRow.rawText, line.text)
        continuationAnchorLine = line
        continue
      }

      continuationAnchorLine = null
      continuationRowIndex = null
    }
  }

  const entries: ParsedTranscriptEntry[] = []

  for (let index = 0; index < parsedRows.length; index += 1) {
    const currentRow = parsedRows[index]
    const nextRow = parsedRows[index + 1]
    const titleCandidates = [currentRow.title]
    const rawTextCandidates = [currentRow.rawText]

    if (nextRow && areLikelyDuplicateRows(currentRow, nextRow)) {
      titleCandidates.push(nextRow.title)
      rawTextCandidates.push(nextRow.rawText)
      index += 1
    }

    const uniqueTitleCandidates = [...new Set(titleCandidates.map((title) => normalizeLineText(title)).filter(Boolean))]
    const uniqueRawTextCandidates = [...new Set(rawTextCandidates.map((text) => normalizeLineText(text)).filter(Boolean))]
    const extractedTitle = uniqueTitleCandidates[0] ?? currentRow.title
    const parseIssues: string[] = []

    if (currentRow.ects === null) {
      parseIssues.push('ECTS could not be extracted automatically.')
    }

    entries.push({
      id: createId('transcript-entry', index),
      sourcePage: currentRow.page,
      sourceSection: currentRow.section,
      rawText: uniqueRawTextCandidates.join(' / '),
      extractedTitle,
      titleCandidates: uniqueTitleCandidates,
      extractedGrade: currentRow.grade,
      extractedEcts: currentRow.ects,
      extractedSemester: currentRow.semester,
      defaultMasterCat: toDefaultMasterCat(currentRow.section),
      parseIssues,
    })
  }

  return entries
}
