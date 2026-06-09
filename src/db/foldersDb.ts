import { v4 as uuidv4 } from 'uuid'
import { db } from './database'
import type { Folder } from '../types'

export async function getAllFolders(): Promise<Folder[]> {
  return db.folders.orderBy('createdAt').toArray()
}

export async function createFolder(name: string): Promise<Folder> {
  const now = new Date()
  const folder: Folder = {
    id: uuidv4(),
    name,
    createdAt: now,
    updatedAt: now,
  }
  await db.folders.add(folder)
  return folder
}

export async function renameFolder(id: string, name: string): Promise<void> {
  await db.folders.update(id, { name, updatedAt: new Date() })
}

export async function deleteFolder(id: string): Promise<void> {
  await db.folders.delete(id)
  /** 資料夾刪除後，其下筆記的 folderId 清空 */
  await db.notes
    .where('folderId')
    .equals(id)
    .modify({ folderId: null })
}
