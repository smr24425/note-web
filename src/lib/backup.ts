import { db } from '../db/database'
import type { Note, Folder } from '../types'

export const SUPPORTED_EXPORT_VERSION = 1

export interface BackupFile {
  exportVersion: typeof SUPPORTED_EXPORT_VERSION
  exportedAt: string
  appVersion: string
  folders: Folder[]
  notes: Note[]
}

export interface MergeSummary {
  addedNotes: number
  updatedNotes: number
  addedFolders: number
  updatedFolders: number
}

// ─── Export ──────────────────────────────────────────────────

export async function exportBackup(): Promise<void> {
  const [folders, notes, deletedNotes] = await Promise.all([
    db.folders.toArray(),
    db.notes.filter((n) => !n.isDeleted).toArray(),
    db.notes.filter((n) => n.isDeleted).toArray(),
  ])

  const backup: BackupFile = {
    exportVersion: SUPPORTED_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    folders,
    notes: [...notes, ...deletedNotes],
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const filename = `notes-backup-${date}.json`

  // iOS Safari doesn't support <a download>, fall back to window.open or share
  if (typeof navigator !== 'undefined' && navigator.share && /iPhone|iPad/i.test(navigator.userAgent)) {
    try {
      const file = new File([blob], filename, { type: 'application/json' })
      await navigator.share({ files: [file], title: filename })
      return
    } catch {
      // fallback to window.open if share fails
    }
  }

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Parse + Validate ────────────────────────────────────────

export class BackupParseError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_FORMAT' | 'VERSION_INCOMPATIBLE',
  ) {
    super(message)
    this.name = 'BackupParseError'
  }
}

export function parseBackupFile(json: string): BackupFile {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new BackupParseError('無法解析 JSON', 'INVALID_FORMAT')
  }

  if (typeof data !== 'object' || data === null) {
    throw new BackupParseError('檔案格式不正確', 'INVALID_FORMAT')
  }

  const obj = data as Record<string, unknown>

  if (!('exportVersion' in obj) || !Array.isArray(obj.notes) || !Array.isArray(obj.folders)) {
    throw new BackupParseError('檔案格式不正確', 'INVALID_FORMAT')
  }

  if (typeof obj.exportVersion !== 'number' || obj.exportVersion > SUPPORTED_EXPORT_VERSION) {
    throw new BackupParseError('備份版本不相容，請更新 App 後再試', 'VERSION_INCOMPATIBLE')
  }

  return obj as unknown as BackupFile
}

// ─── Merge ───────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (val instanceof Date) return val
  return new Date(val as string)
}

export async function mergeBackup(backup: BackupFile): Promise<MergeSummary> {
  const summary: MergeSummary = { addedNotes: 0, updatedNotes: 0, addedFolders: 0, updatedFolders: 0 }

  // Merge folders
  for (const remoteFolder of backup.folders) {
    const remote = {
      ...remoteFolder,
      createdAt: toDate(remoteFolder.createdAt),
      updatedAt: toDate(remoteFolder.updatedAt),
    }
    const local = await db.folders.get(remote.id)
    if (!local) {
      await db.folders.put(remote)
      summary.addedFolders++
    } else if (remote.updatedAt > toDate(local.updatedAt)) {
      await db.folders.put(remote)
      summary.updatedFolders++
    }
  }

  // Merge notes
  for (const remoteNote of backup.notes) {
    const remote = {
      ...remoteNote,
      createdAt: toDate(remoteNote.createdAt),
      updatedAt: toDate(remoteNote.updatedAt),
      deletedAt: remoteNote.deletedAt ? toDate(remoteNote.deletedAt) : null,
    }
    const local = await db.notes.get(remote.id)
    if (!local) {
      await db.notes.put(remote)
      summary.addedNotes++
    } else if (remote.updatedAt > toDate(local.updatedAt)) {
      await db.notes.put(remote)
      summary.updatedNotes++
    }
  }

  return summary
}

// ─── Preview (before merge) ──────────────────────────────────

export async function previewMerge(backup: BackupFile): Promise<MergeSummary> {
  const summary: MergeSummary = { addedNotes: 0, updatedNotes: 0, addedFolders: 0, updatedFolders: 0 }

  for (const remoteFolder of backup.folders) {
    const remote = { ...remoteFolder, updatedAt: toDate(remoteFolder.updatedAt) }
    const local = await db.folders.get(remote.id)
    if (!local) summary.addedFolders++
    else if (remote.updatedAt > toDate(local.updatedAt)) summary.updatedFolders++
  }

  for (const remoteNote of backup.notes) {
    const remote = { ...remoteNote, updatedAt: toDate(remoteNote.updatedAt) }
    const local = await db.notes.get(remote.id)
    if (!local) summary.addedNotes++
    else if (remote.updatedAt > toDate(local.updatedAt)) summary.updatedNotes++
  }

  return summary
}
