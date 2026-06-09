import { useState, useRef } from 'react'
import { useFoldersStore } from '../stores/useFoldersStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import type { VirtualFolder } from '../types'
import ContextMenu from './ContextMenu'
import ConfirmDialog from './ConfirmDialog'
import { useLongPress } from '../hooks/useLongPress'
import { useBreakpoint } from '../hooks/useBreakpoint'

const VIRTUAL_FOLDERS: { id: VirtualFolder; label: string; icon: string }[] = [
  { id: 'all', label: '所有備忘錄', icon: '💬' },
  { id: 'trash', label: '最近刪除', icon: '🗑' },
]

interface FolderButtonProps {
  folderId: string
  name: string
  isActive: boolean
  onSelect: () => void
  onEdit: () => void
  onLongPress: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

function FolderButton({ folderId: _folderId, name, isActive, onSelect, onEdit, onLongPress, onContextMenu }: FolderButtonProps) {
  const longPressHandlers = useLongPress(onLongPress)
  return (
    <button
      onClick={onSelect}
      onDoubleClick={onEdit}
      onContextMenu={onContextMenu}
      {...longPressHandlers}
      className="w-full flex items-center gap-2.5 px-2.5 rounded-lg text-left text-sm font-medium transition-all"
      style={{
        background: isActive ? 'var(--color-selected)' : 'transparent',
        color: isActive ? 'var(--color-selected-text)' : 'var(--color-sidebar-text)',
        minHeight: '44px',
        paddingTop: '6px',
        paddingBottom: '6px',
      }}
    >
      <span className="text-base leading-none" style={{ opacity: isActive ? 0.7 : 0.45 }}>📁</span>
      <span className="truncate">{name}</span>
    </button>
  )
}

export default function Sidebar() {
  const { folders, selectedFolderId, selectFolder, createFolder, renameFolder, deleteFolder } =
    useFoldersStore()
  const openSettings = useSettingsStore((s) => s.open)
  const isMobile = useBreakpoint() === 'mobile'
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function startCreating() {
    setIsCreating(true)
    setNewFolderName('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function confirmCreate() {
    const name = newFolderName.trim()
    if (name) await createFolder(name)
    setIsCreating(false)
    setNewFolderName('')
  }

  function startEditing(id: string, name: string) {
    setEditingId(id)
    setEditingName(name)
    setContextMenu(null)
  }

  async function confirmEdit() {
    if (editingId && editingName.trim()) await renameFolder(editingId, editingName.trim())
    setEditingId(null)
  }

  function onContextMenu(e: React.MouseEvent, folderId: string) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, folderId })
  }

  function onFolderLongPress(folderId: string) {
    setContextMenu({ x: window.innerWidth / 2, y: window.innerHeight / 2, folderId })
  }

  function handleDeleteFolder(id: string) {
    setContextMenu(null)
    setConfirmDelete(id)
  }

  async function confirmDeleteFolder() {
    if (confirmDelete) await deleteFolder(confirmDelete)
    setConfirmDelete(null)
  }

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: 'var(--color-sidebar-bg)' }}
    >
      {/* App title — hidden on mobile (MobileHeader already shows it) */}
      {!isMobile && (
        <div className="px-4 pt-5 pb-3">
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--color-sidebar-text)', opacity: 0.5 }}
          >
            備忘錄
          </span>
        </div>
      )}

      {/* Virtual Folders */}
      <div className="px-2 space-y-0.5">
        {VIRTUAL_FOLDERS.map((vf) => {
          const isActive = selectedFolderId === vf.id
          return (
            <button
              key={vf.id}
              onClick={() => selectFolder(vf.id)}
              className="w-full flex items-center gap-2.5 px-2.5 rounded-lg text-left text-sm font-medium transition-all"
              style={{
                background: isActive ? 'var(--color-selected)' : 'transparent',
                color: isActive ? 'var(--color-selected-text)' : 'var(--color-sidebar-text)',
                minHeight: '44px',
                paddingTop: '6px',
                paddingBottom: '6px',
              }}
            >
              <span className="text-base leading-none opacity-60">{vf.icon}</span>
              <span>{vf.label}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      {folders.length > 0 && (
        <div
          className="mx-4 my-3 h-px"
          style={{ background: 'var(--color-divider)' }}
        />
      )}

      {/* Custom Folders */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {folders.map((folder) => {
          const isActive = selectedFolderId === folder.id
          return (
            <div key={folder.id}>
              {editingId === folder.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={confirmEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEdit()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--color-sidebar-hover)',
                    color: 'var(--color-sidebar-text)',
                    border: '1.5px solid var(--color-link)',
                  }}
                />
              ) : (
                <FolderButton
                  folderId={folder.id}
                  name={folder.name}
                  isActive={isActive}
                  onSelect={() => selectFolder(folder.id)}
                  onEdit={() => startEditing(folder.id, folder.name)}
                  onLongPress={() => onFolderLongPress(folder.id)}
                  onContextMenu={(e) => onContextMenu(e, folder.id)}
                />
              )}
            </div>
          )
        })}

        {isCreating && (
          <input
            ref={inputRef}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={confirmCreate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmCreate()
              if (e.key === 'Escape') { setIsCreating(false); setNewFolderName('') }
            }}
            placeholder="資料夾名稱"
            className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-sidebar-hover)',
              color: 'var(--color-sidebar-text)',
              border: '1.5px solid var(--color-link)',
            }}
          />
        )}
      </div>

      {/* Bottom bar: Add folder + Settings */}
      <div
        className="px-3 border-t flex items-center justify-between"
        style={{
          borderColor: 'var(--color-divider)',
          paddingTop: '0.75rem',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={startCreating}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-60"
          style={{ color: 'var(--color-link)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          新增資料夾
        </button>
        <button
          onClick={openSettings}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-60"
          title="設定"
          style={{
            color: 'var(--color-sidebar-text)',
            background: 'var(--color-sidebar-hover)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="刪除資料夾"
          message="此資料夾及其所有備忘錄將移至「最近刪除」。"
          confirmLabel="刪除"
          danger
          onConfirm={confirmDeleteFolder}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: '重新命名',
              onClick: () => {
                const folder = folders.find((f) => f.id === contextMenu.folderId)
                if (folder) startEditing(folder.id, folder.name)
              },
            },
            { label: '刪除資料夾', danger: true, onClick: () => handleDeleteFolder(contextMenu.folderId) },
          ]}
        />
      )}
    </div>
  )
}
