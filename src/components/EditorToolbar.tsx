import { useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { fileToBase64, MAX_IMAGE_SIZE } from '../lib/imageUtils'

interface BtnProps {
  active: boolean
  onClick: (e: React.MouseEvent) => void
  title: string
  children: React.ReactNode
}

function Btn({ active, onClick, title, children }: BtnProps) {
  return (
    <button
      onMouseDown={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md text-sm transition-all select-none"
      style={{
        background: active ? 'var(--color-toolbar-icon-active-bg)' : 'transparent',
        color: active ? 'var(--color-toolbar-icon-active)' : 'var(--color-toolbar-icon)',
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div className="w-px h-4 mx-0.5" style={{ background: 'var(--color-divider)' }} />
  )
}

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageFile(file: File) {
    if (file.size > MAX_IMAGE_SIZE) {
      alert('圖片大小超過 2MB，無法插入。')
      return
    }
    const src = await fileToBase64(file)
    editor?.commands.setImage({ src })
  }
  /**
   * useEditorState subscribes to Tiptap's transaction stream, so this
   * component re-renders immediately when selection or marks change —
   * without it, isActive() wouldn't reflect changes until the next
   * unrelated React render (e.g. a keystroke).
   */
  const marks = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive('bold') ?? false,
      italic: ctx.editor?.isActive('italic') ?? false,
      underline: ctx.editor?.isActive('underline') ?? false,
      strike: ctx.editor?.isActive('strike') ?? false,
      bulletList: ctx.editor?.isActive('bulletList') ?? false,
      orderedList: ctx.editor?.isActive('orderedList') ?? false,
      taskList: ctx.editor?.isActive('taskList') ?? false,
      link: ctx.editor?.isActive('link') ?? false,
    }),
  })

  if (!editor || !marks) return null

  /**
   * Run a command while keeping the editor focused.
   * Using onMouseDown + preventDefault prevents the editor from losing focus,
   * so the selection/cursor is preserved before the command runs.
   */
  function run(cmd: () => boolean) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      cmd()
    }
  }

  return (
    <div
      className="flex items-center gap-0.5 px-3 py-2"
      style={{
        borderRadius: '26px',
        background: 'var(--color-toolbar-glass-bg)',
        /* SVG displacement map creates the liquid distortion of the background */
        backdropFilter: 'blur(12px) url(#liquid_glass_filter)',
        WebkitBackdropFilter: 'blur(12px) url(#liquid_glass_filter)',
        boxShadow: 'var(--color-toolbar-glass-shadow)',
      }}
    >
      {/* Text style */}
      <Btn active={marks.bold} onClick={run(() => editor.commands.toggleBold())} title="粗體 (⌘B)">
        <strong style={{ fontSize: '13px', fontWeight: 700 }}>B</strong>
      </Btn>
      <Btn active={marks.italic} onClick={run(() => editor.commands.toggleItalic())} title="斜體 (⌘I)">
        <em style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>I</em>
      </Btn>
      <Btn active={marks.underline} onClick={run(() => editor.commands.toggleUnderline())} title="底線 (⌘U)">
        <span style={{ fontSize: '13px', textDecoration: 'underline' }}>U</span>
      </Btn>
      <Btn active={marks.strike} onClick={run(() => editor.commands.toggleStrike())} title="刪除線">
        <span style={{ fontSize: '13px', textDecoration: 'line-through', opacity: 0.8 }}>S</span>
      </Btn>

      <Divider />

      {/* Lists */}
      <Btn
        active={marks.bulletList}
        onClick={run(() => editor.commands.toggleBulletList())}
        title="無序列表"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="2.5" cy="4" r="1.5" fill="currentColor"/>
          <circle cx="2.5" cy="7.5" r="1.5" fill="currentColor"/>
          <circle cx="2.5" cy="11" r="1.5" fill="currentColor"/>
          <path d="M6 4h7M6 7.5h7M6 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </Btn>
      <Btn
        active={marks.orderedList}
        onClick={run(() => editor.commands.toggleOrderedList())}
        title="有序列表"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M1.5 3.5h1.5v3m0 0H1.5m1.5 0v.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1.5 10.5h2l-2 2h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 4.5h7M6 8h7M6 11.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </Btn>
      <Btn
        active={marks.taskList}
        onClick={run(() => editor.commands.toggleTaskList())}
        title="核取清單"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M2.5 4l1 1 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="1" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M9 4.5h5M9 9h5M9 11.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </Btn>

      <Divider />

      {/* Link */}
      <Btn
        active={marks.link}
        onClick={(e) => {
          e.preventDefault()
          if (editor.isActive('link')) {
            editor.commands.unsetLink()
          } else {
            const url = prompt('輸入連結 URL：')
            if (url) editor.commands.setLink({ href: url })
          }
        }}
        title="連結"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M6.5 8.5a3.5 3.5 0 005 0l1.5-1.5a3.5 3.5 0 00-5-5L7 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M8.5 6.5a3.5 3.5 0 00-5 0L2 8a3.5 3.5 0 005 5L8 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </Btn>

      <Divider />

      {/* Insert image */}
      <Btn
        active={false}
        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}
        title="插入圖片"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="2.5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="4.5" cy="5.5" r="1.2" fill="currentColor"/>
          <path d="M1 10l3.5-3.5 2.5 2.5 2-2 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Btn>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
