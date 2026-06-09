import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ImageLightboxProps {
  src: string | null
  onClose: () => void
}

export default function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  // ESC key to close
  useEffect(() => {
    if (!src) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [src, onClose])

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.82)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full z-10 transition-opacity hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Image — stop propagation so clicking image doesn't close */}
          <motion.img
            src={src}
            alt=""
            className="object-contain rounded-lg shadow-2xl"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
