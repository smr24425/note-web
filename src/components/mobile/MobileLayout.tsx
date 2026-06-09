import { useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigationStore, type MobileView } from '../../stores/useNavigationStore'
import Sidebar from '../Sidebar'
import NoteList from '../NoteList'
import NoteEditor from '../NoteEditor'
import MobileHeader from './MobileHeader'

const TRANSITION = {
  duration: 0.32,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
}

const EDGE_THRESHOLD = 30       // px from left edge to start swipe-back
const SWIPE_VELOCITY_THRESHOLD = 200  // px/s
const SWIPE_DISTANCE_RATIO = 0.4      // fraction of screen width

/**
 * direction-aware variants passed via `custom`.
 * Using functions ensures the EXIT variant is evaluated at the moment
 * the component unmounts — so direction always reflects the current action.
 */
const pageVariants = {
  initial: (direction: 'push' | 'pop') => ({
    x: direction === 'push' ? '100%' : '-30%',
  }),
  animate: { x: 0 },
  exit: (direction: 'push' | 'pop') => ({
    x: direction === 'push' ? '-30%' : '100%',
  }),
}


function ViewContent({ view }: { view: MobileView }) {
  if (view === 'folders') {
    return (
      <div className="h-full overflow-y-auto" style={{ background: 'var(--color-sidebar-bg)' }}>
        <Sidebar />
      </div>
    )
  }
  if (view === 'list') {
    return (
      <div className="h-full overflow-hidden" style={{ background: 'var(--color-list-bg)' }}>
        <NoteList />
      </div>
    )
  }
  return (
    <div className="h-full overflow-hidden" style={{ background: 'var(--color-editor-bg)' }}>
      <NoteEditor />
    </div>
  )
}

export default function MobileLayout() {
  const { view, history, pop, direction } = useNavigationStore()

  // Swipe-back gesture state
  const touchStartX = useRef<number | null>(null)
  const touchStartTime = useRef<number>(0)
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch.clientX <= EDGE_THRESHOLD && history.length > 0) {
      touchStartX.current = touch.clientX
      touchStartTime.current = Date.now()
      setIsSwiping(true)
    }
  }, [history.length])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping || touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    if (delta > 0) setSwipeX(delta)
  }, [isSwiping])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return
    const touch = e.changedTouches[0]
    const delta = touch.clientX - (touchStartX.current ?? touch.clientX)
    const elapsed = Date.now() - touchStartTime.current
    const velocity = elapsed > 0 ? (delta / elapsed) * 1000 : 0
    const shouldPop = velocity > SWIPE_VELOCITY_THRESHOLD || delta > screenWidth * SWIPE_DISTANCE_RATIO

    if (shouldPop) pop()
    setSwipeX(0)
    setIsSwiping(false)
    touchStartX.current = null
  }, [isSwiping, pop, screenWidth])

  const prevView = history[history.length - 1]

  return (
    <div
      className="relative h-full overflow-hidden"
      style={{ background: 'var(--color-sidebar-bg)' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background layer — previous page peeking during swipe */}
      {isSwiping && prevView && (
        <div
          className="absolute inset-0"
          style={{
            transform: `translateX(calc(-30% + ${swipeX * 0.3}px))`,
            zIndex: 0,
          }}
        >
          <ViewContent view={prevView} />
        </div>
      )}

      {/*
       * AnimatePresence (no mode="wait") — simultaneous enter + exit.
       * custom={direction} is forwarded to each motion child so variants
       * can compute the correct start/end x based on direction at the time
       * the element enters OR exits.
       */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={view}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate={isSwiping ? false : 'animate'}
          exit="exit"
          transition={TRANSITION}
          className="absolute inset-0 flex flex-col"
          style={isSwiping ? { x: swipeX, zIndex: 1 } : { zIndex: 1 }}
        >
          <MobileHeader />
          <div className="flex-1 overflow-hidden">
            <ViewContent view={view} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
