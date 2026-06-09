export interface Folder {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  folderId: string | null
  title: string
  contentJson: object
  contentText: string
  isPinned: boolean
  isDeleted: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type SortOrder = 'updatedAt' | 'createdAt' | 'title'

export type Theme = 'light' | 'dark' | 'system'

export type VirtualFolder = 'all' | 'trash'
