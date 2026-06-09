import { create } from 'zustand'
import type { Note, SortOrder } from '../types'
import * as notesDb from '../db/notesDb'
import { useNavigationStore } from './useNavigationStore'

interface NotesState {
  notes: Note[]
  deletedNotes: Note[]
  selectedNoteId: string | null
  sortOrder: SortOrder
  loadNotes: () => Promise<void>
  loadDeletedNotes: () => Promise<void>
  createNote: (folderId?: string | null) => Promise<Note>
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'contentJson' | 'contentText' | 'folderId'>>) => Promise<void>
  togglePin: (id: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  restoreNote: (id: string) => Promise<void>
  hardDeleteNote: (id: string) => Promise<void>
  moveNote: (id: string, folderId: string | null) => Promise<void>
  /**
   * silent: true = only update selectedNoteId, do NOT push to 'editor' on mobile.
   * Used for auto-selection (e.g. NoteList useEffect) so mobile users stay on the list view.
   */
  selectNote: (id: string | null, options?: { silent?: boolean }) => void
  setSortOrder: (order: SortOrder) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  deletedNotes: [],
  selectedNoteId: null,
  sortOrder: 'updatedAt',

  loadNotes: async () => {
    const notes = await notesDb.getAllNotes()
    set({ notes })
  },

  loadDeletedNotes: async () => {
    const deletedNotes = await notesDb.getDeletedNotes()
    set({ deletedNotes })
  },

  createNote: async (folderId = null) => {
    const note = await notesDb.createNote(folderId)
    await get().loadNotes()
    set({ selectedNoteId: note.id })
    return note
  },

  updateNote: async (id, updates) => {
    await notesDb.updateNote(id, updates)
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n,
      ),
    }))
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return
    const isPinned = !note.isPinned
    await notesDb.togglePin(id, isPinned)
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, isPinned } : n)),
    }))
  },

  deleteNote: async (id) => {
    await notesDb.softDeleteNote(id)
    const { notes, selectedNoteId } = get()
    const remaining = notes.filter((n) => n.id !== id)
    let nextSelected = selectedNoteId
    if (selectedNoteId === id) {
      const idx = notes.findIndex((n) => n.id === id)
      nextSelected = remaining[idx]?.id ?? remaining[idx - 1]?.id ?? null
    }
    set({ notes: remaining, selectedNoteId: nextSelected })
    await get().loadDeletedNotes()
  },

  restoreNote: async (id) => {
    await notesDb.restoreNote(id)
    await get().loadNotes()
    await get().loadDeletedNotes()
  },

  hardDeleteNote: async (id) => {
    await notesDb.hardDeleteNote(id)
    set((state) => ({
      deletedNotes: state.deletedNotes.filter((n) => n.id !== id),
    }))
  },

  moveNote: async (id, folderId) => {
    await notesDb.moveNote(id, folderId)
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, folderId } : n)),
    }))
  },

  selectNote: (id, options = {}) => {
    set({ selectedNoteId: id })
    // On mobile, push to editor view — but NOT when called silently (auto-selection)
    if (id !== null && !options.silent) {
      const { push } = useNavigationStore.getState()
      const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 599px)').matches
      if (isMobile) push('editor')
    }
  },
  setSortOrder: (order) => set({ sortOrder: order }),
}))
