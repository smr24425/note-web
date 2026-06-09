import { create } from 'zustand'
import type { Folder, VirtualFolder } from '../types'
import * as foldersDb from '../db/foldersDb'
import { useNavigationStore } from './useNavigationStore'

interface FoldersState {
  folders: Folder[]
  selectedFolderId: string | VirtualFolder
  loadFolders: () => Promise<void>
  createFolder: (name: string) => Promise<Folder>
  renameFolder: (id: string, name: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  selectFolder: (id: string | VirtualFolder) => void
}

export const useFoldersStore = create<FoldersState>((set, get) => ({
  folders: [],
  selectedFolderId: 'all',

  loadFolders: async () => {
    const folders = await foldersDb.getAllFolders()
    set({ folders })
  },

  createFolder: async (name) => {
    const folder = await foldersDb.createFolder(name)
    await get().loadFolders()
    return folder
  },

  renameFolder: async (id, name) => {
    await foldersDb.renameFolder(id, name)
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, name, updatedAt: new Date() } : f,
      ),
    }))
  },

  deleteFolder: async (id) => {
    await foldersDb.deleteFolder(id)
    const { selectedFolderId } = get()
    await get().loadFolders()
    if (selectedFolderId === id) {
      set({ selectedFolderId: 'all' })
    }
  },

  selectFolder: (id) => {
    set({ selectedFolderId: id })
    // On mobile, push to list view when a folder is selected
    const { push } = useNavigationStore.getState()
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 599px)').matches
    if (isMobile) push('list')
  },
}))
