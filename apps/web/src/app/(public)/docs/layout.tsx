import { getSidebar } from '@/lib/docs'

import { DocsSidebar } from './docs-sidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections = getSidebar()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-10 px-8 py-8">
      <DocsSidebar sections={sections} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
