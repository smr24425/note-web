import { useEffect, useCallback, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useNotesStore } from '../stores/useNotesStore'
import { useFoldersStore } from '../stores/useFoldersStore'
import EditorToolbar from './EditorToolbar'
import { db } from '../db/database'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { fileToBase64, MAX_IMAGE_SIZE } from '../lib/imageUtils'
import ImageLightbox from './ImageLightbox'

export default function NoteEditor() {
  const { notes, selectedNoteId, updateNote } = useNotesStore()
  const { selectedFolderId } = useFoldersStore()
  const isTrash = selectedFolderId === 'trash'
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  // Lightbox state
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  function handleEditorClick(e: React.MouseEvent) {
    if (e.target instanceof HTMLImageElement) {
      setLightboxSrc(e.target.src)
    }
  }

  // Keyboard-aware toolbar bottom offset
  const [toolbarBottom, setToolbarBottom] = useState(0)

  useEffect(() => {
    if (!isMobile) {
      setToolbarBottom(0)
      return
    }

    let debounceTimer: ReturnType<typeof setTimeout>

    function updateBottom() {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const vv = window.visualViewport
        if (vv) {
          const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
          setToolbarBottom(kb)
        }
      }, 100)
    }

    // visualViewport API (iOS/modern Android)
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', updateBottom)
      vv.addEventListener('scroll', updateBottom)
    } else {
      // Android fallback
      window.addEventListener('resize', updateBottom)
    }

    return () => {
      clearTimeout(debounceTimer)
      if (vv) {
        vv.removeEventListener('resize', updateBottom)
        vv.removeEventListener('scroll', updateBottom)
      } else {
        window.removeEventListener('resize', updateBottom)
      }
    }
  }, [isMobile])

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /**
   * Tracks which note is currently loaded in the editor.
   * Compared against selectedNoteId to detect actual note switches.
   * Intentionally NOT state — we don't want re-renders from this.
   */
  const loadedNoteId = useRef<string | null>(null)
  const isSwitching = useRef(false)

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null

  // ------------------------------------------------------------------
  // saveContent — writes to DB + store without touching editor content
  // ------------------------------------------------------------------
  const saveContent = useCallback(
    async (noteId: string, json: object, text: string) => {
      const firstLine = text.split('\n')[0].trim()
      await updateNote(noteId, { contentJson: json, contentText: text, title: firstLine })
    },
    [updateNote],
  )

  // ------------------------------------------------------------------
  // Editor setup — created once, never recreated
  // ------------------------------------------------------------------
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: true, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: '備忘錄' }),
    ],
    editorProps: {
      attributes: {
        spellcheck: 'false',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (!file) continue
            if (file.size > MAX_IMAGE_SIZE) {
              alert('圖片大小超過 2MB，無法插入。')
              return true
            }
            fileToBase64(file).then((src) => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src }),
                ),
              )
            })
            return true
          }
        }
        return false
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false
        const files = event.dataTransfer?.files
        if (!files?.length) return false
        const file = files[0]
        if (!file.type.startsWith('image/')) return false
        if (file.size > MAX_IMAGE_SIZE) {
          alert('圖片大小超過 2MB，無法插入。')
          return true
        }
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        fileToBase64(file).then((src) => {
          const node = view.state.schema.nodes.image.create({ src })
          const tr = view.state.tr.insert(coords?.pos ?? 0, node)
          view.dispatch(tr)
        })
        return true
      },
    },
    onUpdate({ editor: e }) {
      // Don't save if we're in the middle of loading a new note
      if (isSwitching.current) return
      const noteId = loadedNoteId.current
      if (!noteId) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveContent(noteId, e.getJSON(), e.getText())
      }, 500)
    },
    editable: !isTrash,
  })

  // ------------------------------------------------------------------
  // Load note when selectedNoteId changes (NOT when content changes)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!editor) return

    const prevId = loadedNoteId.current
    const nextId = selectedNoteId ?? null

    // Same note — don't touch the editor (this is the key fix for cursor jumping)
    if (prevId === nextId) {
      editor.setEditable(!isTrash)
      return
    }

    // Flush pending save for previous note immediately
    if (prevId && saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
      const json = editor.getJSON()
      const text = editor.getText()
      saveContent(prevId, json, text)
    }

    loadedNoteId.current = nextId

    // Load the new note's content from DB to guarantee freshness
    if (nextId) {
      isSwitching.current = true
      db.notes.get(nextId).then((note) => {
        if (!note || loadedNoteId.current !== nextId) return
        editor.commands.setContent(
          note.contentJson as Parameters<typeof editor.commands.setContent>[0],
        )
        isSwitching.current = false
      })
    } else {
      isSwitching.current = true
      editor.commands.clearContent()
      isSwitching.current = false
    }

    editor.setEditable(!isTrash)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId, editor, isTrash])
  // ↑ Intentionally omit selectedNote and saveContent from deps.
  //   selectedNote changes on every keystroke (via updateNote), which
  //   would trigger setContent and reset the cursor on every save cycle.
  //   saveContent is stable (useCallback with [updateNote]).

  if (!selectedNote && !isTrash) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3 h-full"
        style={{ color: 'var(--color-editor-placeholder)', background: 'var(--color-editor-bg)' }}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" opacity="0.2">
          <rect x="6" y="8" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M14 17h16M14 22h12M14 27h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="text-sm">選取或建立一則備忘錄</span>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-full relative" style={{ background: 'var(--color-editor-bg)' }}>
        {/* Scrollable content — bottom padding keeps text above floating toolbar */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
          <div className="px-4 py-5" onClick={handleEditorClick}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Floating glass toolbar — fixed, above keyboard, centered.
            When keyboard is visible (toolbarBottom > 0), visualViewport already accounts
            for the safe area zone so we skip it. When keyboard is hidden, add safe-area. */}
        <div
          className="fixed left-0 right-0 z-50 flex justify-center"
          style={{
            bottom: toolbarBottom > 0
              ? `${toolbarBottom + 12}px`
              : `calc(12px + env(safe-area-inset-bottom))`,
          }}
        >
          <EditorToolbar editor={editor} />
        </div>

        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full" style={{ background: 'var(--color-editor-bg)' }}>
      {/* Scrollable content — bottom padding keeps text above floating toolbar */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
        <div className="max-w-2xl mx-auto px-10 py-8" onClick={handleEditorClick}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Floating glass toolbar — absolute, bottom-center */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <EditorToolbar editor={editor} />
        </div>
      </div>

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  )
}
