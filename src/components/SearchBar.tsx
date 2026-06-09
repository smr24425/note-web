import { useRef, useEffect } from 'react'
import { useSearchStore } from '../stores/useSearchStore'

export default function SearchBar() {
  const { query, setQuery, clearQuery } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg w-full"
      style={{
        background: 'rgba(0,0,0,0.06)',
        border: query ? '1px solid var(--color-link)' : '1px solid transparent',
        transition: 'border-color 0.15s',
      }}
    >
      <svg
        width="11" height="11" viewBox="0 0 11 11" fill="none"
        style={{ flexShrink: 0, opacity: 0.4, color: 'var(--color-list-text)' }}
      >
        <circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M7.5 7.5L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && clearQuery()}
        placeholder="搜尋"
        className="flex-1 bg-transparent outline-none text-xs min-w-0"
        style={{ color: 'var(--color-list-text)' }}
      />
      {query && (
        <button
          onClick={clearQuery}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full text-xs transition-opacity hover:opacity-70"
          style={{
            background: 'var(--color-list-text-secondary)',
            color: 'var(--color-list-bg)',
            opacity: 0.6,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
