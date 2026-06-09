import { useMediaQuery } from './useMediaQuery'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function useBreakpoint(): Breakpoint {
  const isMobile = useMediaQuery('(max-width: 599px)')
  const isTablet = useMediaQuery('(min-width: 600px) and (max-width: 899px)')

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}
