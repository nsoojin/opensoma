'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Pagination as PaginationType } from '@/lib/sdk'
import { Button } from '@/ui/button'
import { cn } from '@/lib/cn'

interface PaginationProps {
  pagination: PaginationType
}

export function Pagination({ pagination }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (pagination.totalPages <= 1) {
    return null
  }

  const pages = getPages(pagination.currentPage, pagination.totalPages)

  const createPageURL = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-foreground-muted">
        총 {pagination.total}건 · {pagination.currentPage} / {pagination.totalPages} 페이지
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <PageLink
          href={createPageURL(Math.max(1, pagination.currentPage - 1))}
          disabled={pagination.currentPage === 1}
        >
          이전
        </PageLink>
        {pages.map((page) => (
          <PageLink
            key={page}
            href={createPageURL(page)}
            isCurrent={page === pagination.currentPage}
            disabled={page === pagination.currentPage}
          >
            {page}
          </PageLink>
        ))}
        <PageLink
          href={createPageURL(Math.min(pagination.totalPages, pagination.currentPage + 1))}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          다음
        </PageLink>
      </div>
    </div>
  )
}

interface PageLinkProps {
  children: React.ReactNode
  href: string
  isCurrent?: boolean
  disabled?: boolean
}

function PageLink({ children, href, isCurrent = false, disabled = false }: PageLinkProps) {
  if (disabled) {
    return (
      <Button
        disabled
        size="sm"
        variant={isCurrent ? 'primary' : 'ghost'}
        className="font-semibold"
      >
        {children}
      </Button>
    )
  }

  return (
    <Link href={href} scroll={false}>
      <Button
        size="sm"
        variant={isCurrent ? 'primary' : 'ghost'}
        className={cn('font-semibold', !isCurrent && 'hover:bg-muted')}
      >
        {children}
      </Button>
    </Link>
  )
}

function getPages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + 4)
  const adjustedStart = Math.max(1, end - 4)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
}
