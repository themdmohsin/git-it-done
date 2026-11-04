/**
 * Placeholders for information that is not finalised yet (see the approved plan, section E).
 * Fill these in once the details are confirmed; every page reads from here, so nothing else needs to change.
 */
export const CONFIG = {
  /** The MUKTI challenge repository participants fork. */
  muktiRepoUrl: '',
  /** The demonstration issue (the one that is forked and fixed live during the workshop). */
  demoIssueUrl: '',
  /** How participants find out which issue/task is theirs. Fill in once decided (e.g. a shared sheet, a label per participant, a bot comment). */
  assignmentMechanism: '',
  /** Recorded walkthrough, added after the workshop. */
  videoUrl: '',
} as const

export const hasConfig = (v: string) => v.trim().length > 0
