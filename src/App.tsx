import { useEffect } from 'react'
import { useThemeStore } from './stores/useThemeStore'
import { useNotesStore } from './stores/useNotesStore'
import { useFoldersStore } from './stores/useFoldersStore'
import { purgeExpiredNotes } from './db/notesDb'
import AppLayout from './components/AppLayout'
import SettingsPanel from './components/SettingsPanel'

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme)
  const loadNotes = useNotesStore((s) => s.loadNotes)
  const loadDeletedNotes = useNotesStore((s) => s.loadDeletedNotes)
  const loadFolders = useFoldersStore((s) => s.loadFolders)

  useEffect(() => {
    initTheme()
    purgeExpiredNotes()
    loadFolders()
    loadNotes()
    loadDeletedNotes()
  }, [initTheme, loadNotes, loadDeletedNotes, loadFolders])

  return (
    <>
      <AppLayout />
      <SettingsPanel />
    </>
  )
}
