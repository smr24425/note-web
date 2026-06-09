import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useBreakpoint } from '../hooks/useBreakpoint'
import Sidebar from './Sidebar'
import NoteList from './NoteList'
import NoteEditor from './NoteEditor'
import MobileLayout from './mobile/MobileLayout'

// ─── Tablet Drawer ────────────────────────────────────────────
function TabletLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-editor-bg)' }}>
      {/* Hamburger button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="absolute top-3 left-3 z-20 w-11 h-11 flex items-center justify-center rounded-lg transition-opacity active:opacity-50"
        style={{ color: 'var(--color-sidebar-text)', background: 'var(--color-sidebar-bg)' }}
        aria-label="開啟側邊欄"
      >
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
          <path d="M1 2h18M1 8h18M1 14h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.35)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 z-40 overflow-hidden"
              style={{ width: '240px', background: 'var(--color-sidebar-bg)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Note List */}
      <div
        className="flex-shrink-0 h-full overflow-hidden"
        style={{
          width: '280px',
          background: 'var(--color-list-bg)',
          borderRight: '1px solid var(--color-divider)',
          paddingLeft: '52px', // room for hamburger
        }}
      >
        <NoteList />
      </div>

      {/* Editor */}
      <div className="flex-1 h-full overflow-hidden" style={{ background: 'var(--color-editor-bg)' }}>
        <NoteEditor />
      </div>
    </div>
  )
}

// ─── Desktop Layout ───────────────────────────────────────────
function DesktopLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Column 1: Sidebar — 192px */}
      <div
        className="flex-shrink-0 h-full overflow-hidden"
        style={{
          width: '192px',
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-divider)',
        }}
      >
        <Sidebar />
      </div>

      {/* Column 2: Note List — 272px */}
      <div
        className="flex-shrink-0 h-full overflow-hidden"
        style={{
          width: '272px',
          background: 'var(--color-list-bg)',
          borderRight: '1px solid var(--color-divider)',
        }}
      >
        <NoteList />
      </div>

      {/* Column 3: Editor — flexible */}
      <div
        className="flex-1 h-full overflow-hidden"
        style={{ background: 'var(--color-editor-bg)' }}
      >
        <NoteEditor />
      </div>
    </div>
  )
}

// ─── AppLayout ────────────────────────────────────────────────
export default function AppLayout() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') {
    return (
      <div className="h-mobile-full w-screen overflow-hidden" style={{ background: 'var(--color-editor-bg)' }}>
        <MobileLayout />
      </div>
    )
  }

  if (breakpoint === 'tablet') {
    return <TabletLayout />
  }

  return <DesktopLayout />
}
