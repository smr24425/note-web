import { useMemo, useState, useEffect } from 'react'
import { useNotesStore } from '../stores/useNotesStore'
import { useFoldersStore } from '../stores/useFoldersStore'
import { useSearchStore } from '../stores/useSearchStore'
import NoteCard from './NoteCard'
import SearchBar from './SearchBar'
import ContextMenu from './ContextMenu'
import ConfirmDialog from './ConfirmDialog'
import type { Note } from '../types'

export default function NoteList() {
  const { notes, deletedNotes, selectedNoteId, sortOrder, createNote, deleteNote,
    togglePin, moveNote, selectNote, setSortOrder, hardDeleteNote } = useNotesStore()
  const { selectedFolderId, folders } = useFoldersStore()
  const { query } = useSearchStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; note: Note } | null>(null)
  const [contextMenuMode, setContextMenuMode] = useState<'main' | 'move'>('main')
  const [confirmHardDelete, setConfirmHardDelete] = useState<Note | null>(null)

  const isTrash = selectedFolderId === 'trash'

  const filteredNotes = useMemo(() => {
    let source = isTrash ? deletedNotes : notes

    if (!isTrash && selectedFolderId !== 'all') {
      source = source.filter((n) => n.folderId === selectedFolderId)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      source = source.filter(
        (n) => n.title.toLowerCase().includes(q) || n.contentText.toLowerCase().includes(q),
      )
    }

    const sorted = [...source].sort((a, b) => {
      if (sortOrder === 'title') return a.title.localeCompare(b.title)
      if (sortOrder === 'createdAt') return b.createdAt.getTime() - a.createdAt.getTime()
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })

    if (!isTrash) {
      const pinned = sorted.filter((n) => n.isPinned)
      const unpinned = sorted.filter((n) => !n.isPinned)
      return [...pinned, ...unpinned]
    }
    return sorted
  }, [notes, deletedNotes, selectedFolderId, isTrash, query, sortOrder])

  // Auto-select first note when folder changes — silent so mobile stays on list view
  useEffect(() => {
    if (filteredNotes.length > 0 && !filteredNotes.find((n) => n.id === selectedNoteId)) {
      selectNote(filteredNotes[0].id, { silent: true })
    } else if (filteredNotes.length === 0) {
      selectNote(null, { silent: true })
    }
  }, [filteredNotes, selectedNoteId, selectNote])

  async function handleNewNote() {
    const folderId = selectedFolderId === 'all' || selectedFolderId === 'trash' ? null : selectedFolderId
    await createNote(folderId)
  }

  // ⌘/Ctrl+N shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleNewNote()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  function onContextMenu(e: React.MouseEvent, note: Note) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, note })
    setContextMenuMode('main')
  }

  function onLongPress(note: Note) {
    setContextMenu({ x: window.innerWidth / 2, y: window.innerHeight / 2, note })
    setContextMenuMode('main')
  }

  function closeContextMenu() {
    setContextMenu(null)
    setContextMenuMode('main')
  }

  const mainItems = contextMenu
    ? isTrash
      ? [
          { label: '還原備忘錄', onClick: () => useNotesStore.getState().restoreNote(contextMenu.note.id) },
          { label: '立即刪除', danger: true, onClick: () => { setConfirmHardDelete(contextMenu.note); setContextMenu(null) } },
        ]
      : [
          {
            label: contextMenu.note.isPinned ? '取消置頂' : '置頂備忘錄',
            onClick: () => togglePin(contextMenu.note.id),
          },
          {
            label: '移至資料夾 ›',
            keepOpen: true,
            onClick: () => setContextMenuMode('move'),
          },
          { label: '刪除備忘錄', danger: true, onClick: () => deleteNote(contextMenu.note.id) },
        ]
    : []

  const moveItems = [
    {
      label: '‹ 返回',
      keepOpen: true,
      onClick: () => setContextMenuMode('main'),
    },
    ...(folders.length === 0
      ? [{ label: '尚無資料夾', onClick: () => {}, keepOpen: true }]
      : folders.map((f) => ({
          label: f.name,
          onClick: () => { moveNote(contextMenu!.note.id, f.id); closeContextMenu() },
        }))
    ),
  ]

  const contextItems = contextMenuMode === 'move' ? moveItems : mainItems

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-list-bg)' }}>
      {/* Header */}
      <div className="px-3 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-base font-bold tracking-tight"
            style={{ color: 'var(--color-list-text)' }}
          >
            {isTrash
              ? '最近刪除'
              : selectedFolderId === 'all'
                ? '所有備忘錄'
                : (folders.find((f) => f.id === selectedFolderId)?.name ?? '備忘錄')}
          </h2>
          {!isTrash && (
            <button
              onClick={handleNewNote}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
              style={{ color: 'var(--color-link)' }}
              title="新增備忘錄 (⌘N)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <SearchBar />
        {!isTrash && !query && (
          <div className="mt-2 flex items-center gap-1">
            {(['updatedAt', 'createdAt', 'title'] as const).map((order) => {
              const labels = { updatedAt: '修改日期', createdAt: '建立日期', title: '標題' }
              const isActive = sortOrder === order
              return (
                <button
                  key={order}
                  onClick={() => setSortOrder(order)}
                  className="text-xs px-2 py-0.5 rounded-full transition-all"
                  style={{
                    background: isActive ? 'var(--color-selected)' : 'transparent',
                    color: isActive ? 'var(--color-selected-text)' : 'var(--color-list-text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {labels[order]}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="h-px mx-0" style={{ background: 'var(--color-list-border)' }} />

      {/* Note list */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center"
            style={{ color: 'var(--color-list-text-secondary)' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.3">
              <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 12h12M10 16h8M10 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-sm">
              {query ? `找不到「${query}」` : '沒有備忘錄'}
            </span>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              searchQuery={query}
              isTrash={isTrash}
              onClick={() => selectNote(note.id)}
              onContextMenu={(e) => onContextMenu(e, note)}
              onLongPress={() => onLongPress(note)}
            />
          ))
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={closeContextMenu}
        />
      )}
      {confirmHardDelete && (
        <ConfirmDialog
          title="永久刪除備忘錄"
          message={`「${confirmHardDelete.title || '新備忘錄'}」將被永久刪除，無法復原。`}
          confirmLabel="永久刪除"
          danger
          onConfirm={() => { hardDeleteNote(confirmHardDelete.id); setConfirmHardDelete(null) }}
          onCancel={() => setConfirmHardDelete(null)}
        />
      )}
    </div>
  )
}
