import type { Note } from '../types'
import { useLongPress } from '../hooks/useLongPress'

interface NoteCardProps {
  note: Note
  isSelected: boolean
  searchQuery: string
  isTrash: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onLongPress?: () => void
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) {
    return d.toLocaleDateString('zh-TW', { weekday: 'short' })
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getDaysUntilPurge(deletedAt: Date | null): string {
  if (!deletedAt) return ''
  const purgeDate = new Date(deletedAt)
  purgeDate.setDate(purgeDate.getDate() + 30)
  const days = Math.max(0, Math.ceil((purgeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  return `${days} 天`
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{
          background: 'var(--color-selected)',
          color: 'var(--color-selected-text)',
          borderRadius: '2px',
          padding: '0 1px',
        }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export default function NoteCard({
  note, isSelected, searchQuery, isTrash, onClick, onContextMenu, onLongPress,
}: NoteCardProps) {
  const longPressHandlers = useLongPress(onLongPress ?? (() => {}))
  const title = note.title || '新備忘錄'
  const preview = note.contentText
    .split('\n')
    .filter((l) => l.trim())
    .slice(1)
    .join(' ')
    .slice(0, 65)

  const dateStr = isTrash
    ? getDaysUntilPurge(note.deletedAt)
    : formatDate(note.updatedAt)

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...longPressHandlers}
      className="relative px-3.5 cursor-pointer transition-colors"
      style={{
        background: isSelected ? 'var(--color-selected-bg)' : 'transparent',
        borderBottom: `1px solid var(--color-list-border)`,
        minHeight: '44px',
        paddingTop: '10px',
        paddingBottom: '10px',
      }}
    >
      {/* Left accent bar when selected */}
      {isSelected && (
        <div
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: 'var(--color-selected)' }}
        />
      )}

      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {note.isPinned && (
            <svg
              className="flex-shrink-0 opacity-50"
              width="10" height="10" viewBox="0 0 10 10" fill="none"
            >
              <path d="M5 1l.97 2.97H9L6.52 5.69l.97 2.97L5 7l-2.49 1.66.97-2.97L1 3.97h3.03L5 1z"
                fill="currentColor" />
            </svg>
          )}
          <span
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--color-list-text)' }}
          >
            {highlightText(title, searchQuery)}
          </span>
        </div>
        <span
          className="text-xs flex-shrink-0 tabular-nums"
          style={{
            color: isTrash ? 'var(--color-danger)' : 'var(--color-list-text-secondary)',
            opacity: isTrash ? 0.8 : 0.9,
            fontSize: '11px',
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* Preview */}
      {preview ? (
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: 'var(--color-list-text-secondary)', lineHeight: 1.4 }}
        >
          {highlightText(preview, searchQuery)}
        </p>
      ) : (
        <p
          className="text-xs mt-0.5"
          style={{ color: 'var(--color-list-text-secondary)', opacity: 0.45 }}
        >
          無其他內容
        </p>
      )}
    </div>
  )
}
