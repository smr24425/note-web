import { v4 as uuidv4 } from 'uuid'
import { db } from './database'
import type { Note } from '../types'

export async function getAllNotes(): Promise<Note[]> {
  return db.notes.filter((n) => !n.isDeleted).toArray()
}

export async function getDeletedNotes(): Promise<Note[]> {
  return db.notes.filter((n) => n.isDeleted).toArray()
}

export async function createNote(folderId: string | null = null): Promise<Note> {
  const now = new Date()
  const note: Note = {
    id: uuidv4(),
    folderId,
    title: '',
    contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
    contentText: '',
    isPinned: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  await db.notes.add(note)
  return note
}

export async function updateNote(
  id: string,
  updates: Partial<Pick<Note, 'title' | 'contentJson' | 'contentText' | 'folderId'>>,
): Promise<void> {
  await db.notes.update(id, { ...updates, updatedAt: new Date() })
}

export async function togglePin(id: string, isPinned: boolean): Promise<void> {
  await db.notes.update(id, { isPinned, updatedAt: new Date() })
}

export async function softDeleteNote(id: string): Promise<void> {
  await db.notes.update(id, {
    isDeleted: true,
    deletedAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function restoreNote(id: string): Promise<void> {
  await db.notes.update(id, {
    isDeleted: false,
    deletedAt: null,
    updatedAt: new Date(),
  })
}

export async function hardDeleteNote(id: string): Promise<void> {
  await db.notes.delete(id)
}

export async function moveNote(id: string, folderId: string | null): Promise<void> {
  await db.notes.update(id, { folderId, updatedAt: new Date() })
}

/** 清除已刪除超過 30 天的筆記 */
export async function purgeExpiredNotes(): Promise<void> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const expired = await db.notes
    .filter((n) => n.isDeleted && n.deletedAt !== null && n.deletedAt < cutoff)
    .toArray()
  await db.notes.bulkDelete(expired.map((n) => n.id))
}
