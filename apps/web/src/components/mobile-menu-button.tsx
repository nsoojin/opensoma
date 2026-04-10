'use client'

import { List } from '@phosphor-icons/react'

import { useShell } from '@/components/shell-context'
import { cn } from '@/lib/cn'

export function MobileMenuButton() {
  const { isMobileDrawerOpen, toggleMobileDrawer } = useShell()

  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-muted hover:text-foreground focus:outline-none',
      )}
      onClick={toggleMobileDrawer}
      aria-label={isMobileDrawerOpen ? '네비게이션 닫기' : '네비게이션 열기'}
      aria-controls="mobile-navigation-drawer"
      aria-expanded={isMobileDrawerOpen}
      aria-haspopup="dialog"
    >
      <List size={20} />
    </button>
  )
}
