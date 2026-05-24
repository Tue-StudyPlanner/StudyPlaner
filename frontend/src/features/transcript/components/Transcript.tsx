import type { ChangeEvent, DragEvent } from 'react'
import { useMemo, useRef, useState } from 'react'
import { PersonalFeatureNotice } from '../../../shared/components/PersonalFeatureNotice'
import { StatItem } from '../../../shared/components/StatItem'
import { useAuth } from '../../auth'
import { useCatalogCourses } from '../../courses'
import type { CompletedCourse, Course } from '../../courses'
import type { TranscriptImportCandidate, TranscriptImportPhase } from '../types'
import { useStudyStats } from '../hooks/useStudyStats'
import { useTranscript } from '../hooks/useTranscript'
import { buildTranscriptImportCandidates } from '../utils/buildTranscriptImportCandidates'
import { parseTranscriptPdf } from '../utils/parseTranscriptPdf'
import { SavedCompletedCourseRow } from './SavedCompletedCourseRow'
import { TranscriptImportRow } from './TranscriptImportRow'
import { TranscriptUploadCard } from './TranscriptUploadCard'

const MAX_TRANSCRIPT_FILE_SIZE_BYTES = 10 * 1024 * 1024
const CATALOG_LIMIT = 200

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function matchesCatalogCourse(course: Course, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return true
  }

  return [course.number, course.title, course.organisation ?? '']
    .map((value) => value.toLowerCase())
    .some((value) => value.includes(normalizedQuery))
}

function toCompletedCourse(course: Course, currentSemesterLabel: string | null | undefined): CompletedCourse {
  return {
    id: `draft-${course.id}`,
    courseId: course.id,
    courseNumber: course.number,
    externalCourseCode: course.number,
    title: course.title,
    ects: course.ects ?? 0,
    masterCat: course.masterCats[0] ?? 'INFO',
    grade: null,
    semester: currentSemesterLabel || 'Semester not set',
    source: 'manual',
  }
}

function toImportedCompletedCourse(candidate: TranscriptImportCandidate): CompletedCourse {
  return {
    id: `import-${candidate.id}`,
    courseId: candidate.courseId,
    courseNumber: candidate.courseNumber ?? undefined,
    externalCourseCode: candidate.courseNumber ?? undefined,
    title: candidate.matchedCourse?.title ?? candidate.title,
    ects: candidate.ects ?? 0,
    masterCat: candidate.masterCat,
    grade: candidate.grade,
    semester: candidate.semester,
    source: 'transcript_import',
  }
}

function UploadReviewSection({
  importCandidates,
  importPhase,
  onDiscard,
  onConfirm,
  onCandidateChange,
  catalogCourses,
}: {
  importCandidates: TranscriptImportCandidate[]
  importPhase: TranscriptImportPhase
  onDiscard: () => void
  onConfirm: () => Promise<void>
  onCandidateChange: (candidate: TranscriptImportCandidate) => void
  catalogCourses: Course[]
}) {
  const selectedImportCount = importCandidates.filter((candidate) => candidate.selected).length
  const invalidSelectedImportCount = importCandidates.filter(
    (candidate) => candidate.selected && candidate.validationIssues.length > 0,
  ).length

  return (
    <section className="rounded-[10px] border border-border bg-surface px-6 py-5.5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-fg">Review extracted transcript rows</div>
          <p className="mt-1 text-[12.5px] text-fg-muted">
            {selectedImportCount} row(s) selected
            {invalidSelectedImportCount > 0 ? ` · ${invalidSelectedImportCount} selected row(s) still need fixes` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md border border-border px-3.5 py-2 text-[13px] font-medium text-fg transition-colors hover:bg-surface-hover"
          >
            Discard review
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={importPhase === 'saving'}
            className="rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importPhase === 'saving' ? 'Importing…' : 'Import selected rows'}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {importCandidates.map((candidate) => (
          <TranscriptImportRow
            key={candidate.id}
            candidate={candidate}
            catalogCourses={catalogCourses}
            onChange={onCandidateChange}
          />
        ))}
      </div>
    </section>
  )
}

function AuthenticatedTranscript() {
  const { user } = useAuth()
  const [manualSearch, setManualSearch] = useState<string>('')
  const [importCandidates, setImportCandidates] = useState<TranscriptImportCandidate[]>([])
  const [importPhase, setImportPhase] = useState<TranscriptImportPhase>('idle')
  const [importError, setImportError] = useState<string | null>(null)
  const [importNotice, setImportNotice] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
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
  } = useTranscript()
  const { totalEcts, requiredEcts, progress, averageGrade } = useStudyStats()
  const {
    courses: catalogCourses,
    isLoading: isLoadingCatalog,
    error: catalogError,
  } = useCatalogCourses('', CATALOG_LIMIT)

  const stats = [
    { label: 'Progress', value: `${progress} %` },
    { label: 'ECTS Earned', value: `${totalEcts} / ${requiredEcts}` },
    { label: 'Average grade', value: averageGrade !== null ? averageGrade.toFixed(2) : '–' },
  ]

  const addableCourses = useMemo(
    () =>
      catalogCourses
        .filter(
          (course) => !completedCourses.some((completedCourse) => completedCourse.courseId === course.id),
        )
        .filter((course) => matchesCatalogCourse(course, manualSearch))
        .slice(0, 6),
    [catalogCourses, completedCourses, manualSearch],
  )

  async function handleManualCourseAdd(course: Course): Promise<void> {
    clearCompletedCoursesError()
    setImportNotice(null)
    const result = await addCompletedCourse(toCompletedCourse(course, user?.profile.currentSemesterLabel))
    if (result.saved) {
      setImportNotice(`Added ${course.title} to your completed courses.`)
    }
  }

  async function handleTranscriptFile(file: File): Promise<void> {
    clearCompletedCoursesError()
    setImportNotice(null)
    setImportError(null)

    if (!isPdfFile(file)) {
      setImportPhase('failed')
      setImportCandidates([])
      setImportError('Only PDF transcripts are supported right now.')
      return
    }

    if (file.size > MAX_TRANSCRIPT_FILE_SIZE_BYTES) {
      setImportPhase('failed')
      setImportCandidates([])
      setImportError(
        `The selected file is too large. Please keep transcript PDFs below ${Math.round(MAX_TRANSCRIPT_FILE_SIZE_BYTES / 1024 / 1024)} MB.`,
      )
      return
    }

    if (isLoadingCatalog) {
      setImportPhase('failed')
      setImportCandidates([])
      setImportError('The course catalog is still loading. Please wait a moment and try the import again.')
      return
    }

    if (catalogError) {
      setImportPhase('failed')
      setImportCandidates([])
      setImportError(
        `The course catalog could not be loaded, so transcript matching is unavailable right now. ${catalogError}`,
      )
      return
    }

    setImportPhase('validating')

    try {
      setImportPhase('parsing')
      const parsedEntries = await parseTranscriptPdf(file)
      if (parsedEntries.length === 0) {
        throw new Error(
          'No transcript rows could be extracted from this PDF. Please verify the format or add courses manually below.',
        )
      }

      const nextCandidates = buildTranscriptImportCandidates(parsedEntries, catalogCourses)
      if (nextCandidates.length === 0) {
        throw new Error('No transcript rows could be prepared for review. Please add courses manually below.')
      }

      setImportCandidates(nextCandidates)
      setImportPhase('parsed')
      setImportNotice(`Extracted ${nextCandidates.length} transcript row(s). Please review them before importing.`)
    } catch (error) {
      setImportPhase('failed')
      setImportCandidates([])
      setImportError(error instanceof Error ? error.message : 'The selected PDF could not be parsed.')
    }
  }

  async function handleImportConfirmation(): Promise<void> {
    clearCompletedCoursesError()
    setImportError(null)
    setImportNotice(null)

    const selectedCandidates = importCandidates.filter((candidate) => candidate.selected)
    if (selectedCandidates.length === 0) {
      setImportError('Select at least one extracted row before importing.')
      return
    }

    const invalidSelectedCandidates = selectedCandidates.filter(
      (candidate) => candidate.validationIssues.length > 0,
    )
    if (invalidSelectedCandidates.length > 0) {
      setImportError('Some selected rows still need attention before they can be imported.')
      return
    }

    setImportPhase('saving')
    const importResult = await addCompletedCourses(selectedCandidates.map(toImportedCompletedCourse))
    if (!importResult.saved) {
      setImportPhase('parsed')
      return
    }

    setImportCandidates([])
    setImportPhase('idle')
    setImportNotice(
      importResult.skippedDuplicateCount > 0
        ? `Imported ${importResult.addedCount} course(s). ${importResult.skippedDuplicateCount} duplicate row(s) were skipped.`
        : `Imported ${importResult.addedCount} course(s) from your transcript.`,
    )
  }

  function openFilePicker(): void {
    fileInputRef.current?.click()
  }

  function updateImportCandidateById(nextCandidate: TranscriptImportCandidate): void {
    setImportCandidates((previousCandidates) =>
      previousCandidates.map((candidate) =>
        candidate.id === nextCandidate.id ? nextCandidate : candidate,
      ),
    )
  }

  function resetImportReview(): void {
    setImportCandidates([])
    setImportPhase('idle')
    setImportError(null)
    setImportNotice(null)
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextFile = event.target.files?.[0]
    if (nextFile) {
      void handleTranscriptFile(nextFile)
    }
    event.target.value = ''
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault()
    setIsDragActive(true)
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault()
    setIsDragActive(false)
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault()
    setIsDragActive(false)
    const nextFile = event.dataTransfer.files?.[0]
    if (nextFile) {
      void handleTranscriptFile(nextFile)
    }
  }

  return (
    <div className="grid grid-cols-5 items-start gap-3.5">
      <div className="col-span-2 grid gap-3.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <TranscriptUploadCard
          isDragActive={isDragActive}
          disabled={isLoadingCatalog}
          phase={importPhase}
          error={importError}
          maxFileSizeLabel={`${Math.round(MAX_TRANSCRIPT_FILE_SIZE_BYTES / 1024 / 1024)} MB`}
          onBrowse={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        <div className="rounded-[10px] border border-border bg-surface px-6 py-5.5">
          <div className="mb-3 text-[14px] font-semibold text-fg">Add completed courses manually</div>
          <p className="mb-3 text-[12.5px] text-fg-muted">
            Until transcript import is finished, you can already add completed catalog courses to your account.
          </p>
          <input
            type="search"
            value={manualSearch}
            onChange={(event) => setManualSearch(event.target.value)}
            placeholder="Search by course title or number"
            className="mb-3 w-full rounded-[10px] border border-border bg-surface px-4 py-3 text-[13.5px] text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-primary"
          />
          <div className="grid gap-2">
            {catalogError ? (
              <div className="text-[12.5px] text-primary">Failed to load the catalog. {catalogError}</div>
            ) : isLoadingCatalog ? (
              <div className="text-[12.5px] text-fg-muted">Loading catalog courses...</div>
            ) : addableCourses.length === 0 ? (
              <div className="text-[12.5px] text-fg-muted">No matching catalog courses available.</div>
            ) : (
              addableCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => void handleManualCourseAdd(course)}
                  disabled={isSavingCompletedCourses}
                  className="rounded-lg border border-border-light px-4 py-3 text-left transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="text-[13px] font-semibold text-fg">{course.title}</div>
                  <div className="text-[12px] text-fg-muted">
                    {course.number} · {course.ects ?? '–'} ECTS
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="col-span-3 flex flex-col gap-3.5">
        {completedCoursesError ? (
          <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
            {completedCoursesError}
          </div>
        ) : null}

        {importNotice ? (
          <div className="rounded-[10px] border border-border bg-surface px-4 py-3 text-[13px] text-fg-mid">
            {importNotice}
          </div>
        ) : null}

        {isSavingCompletedCourses ? (
          <div className="rounded-[10px] border border-border bg-surface px-4 py-3 text-[13px] text-fg-muted">
            Saving your completed-course history...
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-3.5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] border border-border bg-surface px-6 py-4.5"
            >
              <StatItem label={stat.label} value={stat.value} />
            </div>
          ))}
        </div>

        {importCandidates.length > 0 ? (
          <UploadReviewSection
            importCandidates={importCandidates}
            importPhase={importPhase}
            onDiscard={resetImportReview}
            onConfirm={handleImportConfirmation}
            onCandidateChange={updateImportCandidateById}
            catalogCourses={catalogCourses}
          />
        ) : null}

        <div className="rounded-[10px] border border-border bg-surface px-6 py-5.5">
          <div className="mb-4 text-[14px] font-semibold text-fg">Imported Courses</div>

          {isLoadingCompletedCourses ? (
            <div className="py-6 text-center text-[13px] text-fg-muted">
              Loading your completed courses...
            </div>
          ) : completedCourses.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-fg-muted">
              No completed courses stored yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {completedCourses.map((course, index) => (
                <SavedCompletedCourseRow
                  key={course.id}
                  course={course}
                  isLast={index === completedCourses.length - 1}
                  onRemove={() => void removeCourse(course.id)}
                  onCategoryChange={(cat) => void setCategory(course.id, cat)}
                  onSemesterChange={(semester) => void updateCourse(course.id, { semester })}
                  onGradeChange={(grade) =>
                    void updateCourse(course.id, {
                      grade: grade.trim() === '' ? null : Number(grade),
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Transcript() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="mb-0.75 font-serif text-[26px] font-semibold tracking-[-0.02em] text-fg">
          Upload Transcript
        </h1>
        <p className="text-[13.5px] text-fg-muted">
          Upload your Transcript of Records PDF, review the extracted rows, and decide what should be saved to your progress.
        </p>
      </div>

      {isAuthenticated ? (
        <AuthenticatedTranscript />
      ) : (
        <PersonalFeatureNotice
          title="Transcript and progress need your account"
          description="Your transcript, completed courses, and grade data are private. Sign in to upload or manage them while the public catalog remains accessible without login."
        />
      )}
    </div>
  )
}
