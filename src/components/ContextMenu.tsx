import { useEffect, useRef } from 'react'

interface MenuItem {
  label: string
  onClick: () => void
  danger?: boolean
  keepOpen?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const adjustedX = Math.min(x, window.innerWidth - 168)
  const adjustedY = Math.min(y, window.innerHeight - items.length * 34 - 12)

  return (
    <div
      ref={ref}
      className="fixed z-50 py-1 min-w-40"
      style={{
        left: adjustedX,
        top: adjustedY,
        background: 'var(--color-dialog-bg)',
        border: '1px solid var(--color-divider)',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-dialog)',
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.onClick(); if (!item.keepOpen) onClose() }}
          className="w-full text-left px-3.5 py-1.5 text-sm transition-all hover:opacity-80"
          style={{
            color: item.danger ? 'var(--color-danger)' : 'var(--color-list-text)',
            fontWeight: item.danger ? 500 : 400,
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
