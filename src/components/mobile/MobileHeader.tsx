import { useNavigationStore } from '../../stores/useNavigationStore'
import { useFoldersStore } from '../../stores/useFoldersStore'
import { useNotesStore } from '../../stores/useNotesStore'

interface MobileHeaderProps {
  onHamburger?: () => void
  showHamburger?: boolean
}

export default function MobileHeader({ onHamburger, showHamburger }: MobileHeaderProps) {
  const { view, pop, history } = useNavigationStore()
  const { selectedFolderId, folders } = useFoldersStore()
  const { notes, selectedNoteId } = useNotesStore()

  const canGoBack = history.length > 0

  function getTitle(): string {
    if (view === 'folders') return '備忘錄'
    if (view === 'list') {
      if (selectedFolderId === 'all') return '所有備忘錄'
      if (selectedFolderId === 'trash') return '最近刪除'
      const folder = folders.find((f) => f.id === selectedFolderId)
      return folder?.name ?? '備忘錄'
    }
    if (view === 'editor') {
      const note = notes.find((n) => n.id === selectedNoteId)
      return note?.title || '新備忘錄'
    }
    return '備忘錄'
  }

  return (
    <div
      className="flex-shrink-0"
      style={{
        background: 'var(--color-sidebar-bg)',
        borderBottom: '1px solid var(--color-divider)',
        paddingTop: 'var(--safe-area-inset-top)',
      }}
    >
    <div className="flex items-center gap-2 px-4 h-12">
      {/* Back button */}
      {canGoBack ? (
        <button
          onClick={pop}
          className="flex items-center gap-1 text-sm font-medium min-w-[44px] min-h-[44px] -ml-2 px-2 rounded-lg transition-opacity active:opacity-50"
          style={{ color: 'var(--color-link)' }}
          aria-label="返回"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8 2L2 8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>返回</span>
        </button>
      ) : showHamburger ? (
        <button
          onClick={onHamburger}
          className="flex items-center justify-center w-11 h-11 -ml-2 rounded-lg transition-opacity active:opacity-50"
          style={{ color: 'var(--color-sidebar-text)' }}
          aria-label="選單"
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path d="M1 2h18M1 8h18M1 14h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      ) : (
        <div className="w-11" />
      )}

      {/* Title */}
      <h1
        className="flex-1 text-center font-semibold text-base truncate"
        style={{ color: 'var(--color-sidebar-text)' }}
      >
        {getTitle()}
      </h1>

      {/* Right spacer for balance */}
      <div className="min-w-[44px]" />
    </div>
    </div>
  )
}
