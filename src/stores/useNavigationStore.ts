import { create } from 'zustand'

export type MobileView = 'folders' | 'list' | 'editor'
export type NavDirection = 'push' | 'pop'

interface NavigationState {
  view: MobileView
  history: MobileView[]
  direction: NavDirection
  push: (view: MobileView) => void
  pop: () => void
  reset: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  view: 'folders',
  history: [],
  direction: 'push',

  push: (view) => {
    const { view: current, history } = get()
    set({ view, history: [...history, current], direction: 'push' })
  },

  pop: () => {
    const { history } = get()
    if (history.length === 0) return
    const prev = history[history.length - 1]
    set({ view: prev, history: history.slice(0, -1), direction: 'pop' })
  },

  reset: () => set({ view: 'folders', history: [], direction: 'push' }),
}))
