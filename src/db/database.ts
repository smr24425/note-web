import Dexie, { type Table } from 'dexie'
import type { Note, Folder } from '../types'

class NoteDatabase extends Dexie {
  notes!: Table<Note>
  folders!: Table<Folder>

  constructor() {
    super('NoteWebDB')
    this.version(1).stores({
      notes: 'id, folderId, isPinned, isDeleted, deletedAt, createdAt, updatedAt',
      folders: 'id, name, createdAt, updatedAt',
    })
  }
}

export const db = new NoteDatabase()
