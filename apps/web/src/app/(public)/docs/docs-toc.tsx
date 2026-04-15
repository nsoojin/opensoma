'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

interface Heading {
  id: string
  text: string
  level: number
}

interface DocsTableOfContentsProps {
  headings: Heading[]
}

export function DocsTableOfContents({ headings }: DocsTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  return (
    <aside className="hidden w-44 shrink-0 lg:block">
      <div className="sticky top-22">
        <h4 className="mb-3 text-xs font-bold tracking-wider text-foreground-muted uppercase">On this page</h4>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  'block text-xs leading-relaxed transition-colors',
                  heading.level === 3 && 'pl-3',
                  activeId === heading.id ? 'font-medium text-primary' : 'text-foreground-muted hover:text-foreground',
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
