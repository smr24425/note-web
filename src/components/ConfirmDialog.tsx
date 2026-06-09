interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center"
      style={{ background: 'var(--color-dialog-overlay)' }}
      onClick={onCancel}
    >
      <div
        className="py-5 px-5 w-72"
        style={{
          background: 'var(--color-dialog-bg)',
          border: '1px solid var(--color-divider)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-dialog)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-base font-semibold mb-1.5"
          style={{ color: 'var(--color-list-text)' }}
        >
          {title}
        </h3>
        <p
          className="text-sm mb-5 leading-relaxed"
          style={{ color: 'var(--color-list-text-secondary)' }}
        >
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-70"
            style={{
              background: 'var(--color-toolbar-bg)',
              color: 'var(--color-list-text)',
              border: '1px solid var(--color-divider)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-85"
            style={{
              background: danger ? 'var(--color-danger)' : 'var(--color-link)',
              color: '#fff',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
