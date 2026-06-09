import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useThemeStore } from '../stores/useThemeStore'
import { useNotesStore } from '../stores/useNotesStore'
import { useFoldersStore } from '../stores/useFoldersStore'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { exportBackup, parseBackupFile, previewMerge, mergeBackup, BackupParseError } from '../lib/backup'
import { useToast } from './Toast'
import ConfirmDialog from './ConfirmDialog'
import { useState } from 'react'
import type { BackupFile, MergeSummary } from '../lib/backup'
import type { Theme } from '../types'

const APP_VERSION = '1.0.0'

const THEME_LABELS: Record<Theme, string> = {
  system: '自動',
  light: '淺色',
  dark: '深色',
}

// ─── Grouped Section ──────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <p
      className="px-4 pb-1.5 pt-5 text-xs font-semibold uppercase tracking-wider"
      style={{ color: 'var(--color-list-text-secondary)' }}
    >
      {label}
    </p>
  )
}

interface RowProps {
  icon?: string
  label: string
  value?: string
  chevron?: boolean
  danger?: boolean
  onClick?: () => void
  last?: boolean
}

function Row({ icon, label, value, chevron = true, danger, onClick, last }: RowProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-opacity active:opacity-60"
      style={{
        background: 'var(--color-dialog-bg)',
        borderBottom: last ? 'none' : `1px solid var(--color-divider)`,
        cursor: onClick ? 'pointer' : 'default',
        color: danger ? 'var(--color-danger)' : 'var(--color-list-text)',
        minHeight: '44px',
      }}
    >
      {icon && <span className="text-base w-5 text-center">{icon}</span>}
      <span className="flex-1 text-sm">{label}</span>
      {value && (
        <span className="text-sm" style={{ color: 'var(--color-list-text-secondary)' }}>
          {value}
        </span>
      )}
      {chevron && onClick && (
        <svg width="8" height="13" viewBox="0 0 8 13" fill="none" style={{ opacity: 0.35 }}>
          <path d="M1 1l6 5.5L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-4 overflow-hidden"
      style={{
        borderRadius: '12px',
        border: '1px solid var(--color-divider)',
        background: 'var(--color-dialog-bg)',
      }}
    >
      {children}
    </div>
  )
}

// ─── Theme Picker ─────────────────────────────────────────────

function ThemePicker({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useThemeStore()
  const themes: Theme[] = ['system', 'light', 'dark']

  return (
    <div
      className="fixed inset-0 z-[160] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mb-8 mx-4 overflow-hidden"
        style={{
          borderRadius: '14px',
          background: 'var(--color-dialog-bg)',
          border: '1px solid var(--color-divider)',
          boxShadow: 'var(--shadow-dialog)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {themes.map((t, i) => (
          <button
            key={t}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm transition-opacity active:opacity-60"
            style={{
              color: t === theme ? 'var(--color-link)' : 'var(--color-list-text)',
              borderBottom: i < themes.length - 1 ? `1px solid var(--color-divider)` : 'none',
              fontWeight: t === theme ? 600 : 400,
              minHeight: '44px',
            }}
            onClick={() => { setTheme(t); onClose() }}
          >
            {THEME_LABELS[t]}
            {t === theme && (
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <path d="M1 5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── SettingsPanel ────────────────────────────────────────────

export default function SettingsPanel() {
  const { isOpen, close } = useSettingsStore()
  const { theme } = useThemeStore()
  const { loadNotes, loadDeletedNotes } = useNotesStore()
  const { loadFolders } = useFoldersStore()
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { show: showToast, toastEl } = useToast()
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null)
  const [mergeSummary, setMergeSummary] = useState<MergeSummary | null>(null)

  async function handleExport() {
    try {
      await exportBackup()
      showToast('備份已下載')
    } catch {
      showToast('匯出失敗，請再試', 'error')
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    try {
      const text = await file.text()
      const backup = parseBackupFile(text)
      const summary = await previewMerge(backup)
      setPendingBackup(backup)
      setMergeSummary(summary)
    } catch (err) {
      if (err instanceof BackupParseError) {
        showToast(err.message, 'error')
      } else {
        showToast('檔案格式不正確', 'error')
      }
    }
  }

  async function handleConfirmImport() {
    if (!pendingBackup) return
    try {
      await mergeBackup(pendingBackup)
      await Promise.all([loadFolders(), loadNotes(), loadDeletedNotes()])
      showToast('匯入完成')
    } catch {
      showToast('匯入失敗，請再試', 'error')
    } finally {
      setPendingBackup(null)
      setMergeSummary(null)
    }
  }

  const panelVariants = isMobile
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
      }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[150]"
            style={{ background: 'var(--color-dialog-overlay)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            className="fixed z-[155] overflow-hidden"
            style={
              isMobile
                ? {
                    left: 0, right: 0, bottom: 0,
                    borderRadius: '20px 20px 0 0',
                    background: 'var(--color-list-bg)',
                    maxHeight: '92dvh',
                  }
                : {
                    top: '50%', left: '50%',
                    width: '380px',
                    maxHeight: '80vh',
                    borderRadius: '16px',
                    background: 'var(--color-list-bg)',
                    boxShadow: 'var(--shadow-dialog)',
                    transform: 'translate(-50%, -50%)',
                  }
            }
            initial={panelVariants.initial}
            animate={panelVariants.animate}
            exit={panelVariants.exit}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-divider)' }}
            >
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-list-text)' }}>
                設定
              </h2>
              <button
                onClick={close}
                className="w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-60"
                style={{
                  background: 'var(--color-sidebar-hover)',
                  color: 'var(--color-list-text-secondary)',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto" style={{ maxHeight: isMobile ? '80dvh' : 'calc(80vh - 60px)' }}>
              {/* 資料備份 */}
              <SectionHeader label="📦 資料備份" />
              <Section>
                <Row
                  label="匯出備份"
                  onClick={handleExport}
                />
                <Row
                  label="匯入備份"
                  onClick={() => fileInputRef.current?.click()}
                  last
                />
              </Section>

              {/* 外觀 */}
              <SectionHeader label="🎨 外觀" />
              <Section>
                <Row
                  label="主題"
                  value={THEME_LABELS[theme]}
                  onClick={() => setShowThemePicker(true)}
                  last
                />
              </Section>

              {/* 關於 */}
              <SectionHeader label="ℹ 關於" />
              <Section>
                <Row
                  label="版本"
                  value={APP_VERSION}
                  chevron={false}
                  last
                />
              </Section>

              <div className="h-8" />
            </div>
          </motion.div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Theme picker overlay */}
          {showThemePicker && <ThemePicker onClose={() => setShowThemePicker(false)} />}

          {/* Import confirm dialog */}
          {pendingBackup && mergeSummary && (
            <ConfirmDialog
              title="確認匯入備份"
              message={`將新增 ${mergeSummary.addedNotes} 筆、更新 ${mergeSummary.updatedNotes} 筆筆記，新增 ${mergeSummary.addedFolders} 個、更新 ${mergeSummary.updatedFolders} 個資料夾。本地較新的資料不會被覆蓋。`}
              confirmLabel="確認匯入"
              onConfirm={handleConfirmImport}
              onCancel={() => { setPendingBackup(null); setMergeSummary(null) }}
            />
          )}
        </>
      )}

      {/* Toast (outside AnimatePresence so it persists after panel closes) */}
      {toastEl}
    </AnimatePresence>
  )
}
