import fs from 'node:fs'
import path from 'node:path'

import GithubSlugger from 'github-slugger'
import matter from 'gray-matter'

const DOCS_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), 'content/docs')

export interface DocMeta {
  title: string
  description?: string
  order: number
  slug: string[]
  href: string
}

export interface Doc {
  meta: DocMeta
  content: string
}

export interface SidebarSection {
  title: string
  items: DocMeta[]
}

export function getDoc(slug: string[]): Doc | null {
  const resolvedSlug = slug.length === 0 ? ['index'] : slug
  const filePath = resolveDocPath(resolvedSlug)
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    meta: {
      title: data.title || '',
      description: data.description,
      order: data.order ?? 999,
      slug: resolvedSlug,
      href: `/docs${resolvedSlug[0] === 'index' ? '' : `/${resolvedSlug.join('/')}`}`,
    },
    content,
  }
}

export function getSidebar(): SidebarSection[] {
  const topLevel: DocMeta[] = []
  const sections = new Map<string, { title: string; items: DocMeta[] }>()

  readDocsRecursive(DOCS_DIR, [], topLevel, sections)

  const result: SidebarSection[] = []

  const indexDoc = topLevel.find((d) => d.slug[0] === 'index')
  if (indexDoc) {
    result.push({ title: 'Overview', items: [{ ...indexDoc, href: '/docs' }] })
  }

  const sorted = topLevel.filter((d) => d.slug[0] !== 'index').sort((a, b) => a.order - b.order)
  if (sorted.length > 0) {
    result.push({ title: '', items: sorted })
  }

  const sectionEntries = [...sections.entries()].sort(([, a], [, b]) => {
    const aOrder = a.items.find((i) => i.slug.at(-1) === 'index')?.order ?? 999
    const bOrder = b.items.find((i) => i.slug.at(-1) === 'index')?.order ?? 999
    return aOrder - bOrder
  })

  for (const [, section] of sectionEntries) {
    const items = section.items.filter((i) => i.slug.at(-1) !== 'index').sort((a, b) => a.order - b.order)
    if (items.length > 0) {
      result.push({ title: section.title, items })
    }
  }

  return result
}

export function extractHeadings(content: string): Array<{ id: string; text: string; level: number }> {
  const headings: Array<{ id: string; text: string; level: number }> = []
  const slugger = new GithubSlugger()
  const regex = /^(#{2,3})\s+(.+)$/gm
  let match: RegExpExecArray | null = regex.exec(content)

  while (match !== null) {
    const level = match[1].length
    const text = match[2].trim()
    headings.push({ id: slugger.slug(text), text, level })
    match = regex.exec(content)
  }

  return headings
}

export function getAllDocSlugs(): string[][] {
  const slugs: string[][] = [[]]
  collectSlugs(DOCS_DIR, [], slugs)
  return slugs
}

function collectSlugs(dir: string, parentSlug: string[], slugs: string[][]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      collectSlugs(path.join(dir, entry.name), [...parentSlug, entry.name], slugs)
    } else if (entry.name.endsWith('.mdx')) {
      const name = entry.name.replace(/\.mdx$/, '')
      if (name === 'index' && parentSlug.length > 0) {
        slugs.push(parentSlug)
      } else if (name !== 'index') {
        slugs.push([...parentSlug, name])
      }
    }
  }
}

function resolveDocPath(slug: string[]): string | null {
  const joined = slug.join('/')
  const candidates = [path.join(DOCS_DIR, `${joined}.mdx`), path.join(DOCS_DIR, joined, 'index.mdx')]
  return (
    candidates.find((p) => {
      const resolved = path.resolve(p)
      return resolved.startsWith(DOCS_DIR + path.sep) && fs.existsSync(resolved)
    }) ?? null
  )
}

function readDocsRecursive(
  dir: string,
  parentSlug: string[],
  topLevel: DocMeta[],
  sections: Map<string, { title: string; items: DocMeta[] }>,
) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sectionDir = path.join(dir, entry.name)
      const sectionSlug = [...parentSlug, entry.name]
      const indexPath = path.join(sectionDir, 'index.mdx')

      let sectionTitle = entry.name
      if (fs.existsSync(indexPath)) {
        const { data } = matter(fs.readFileSync(indexPath, 'utf-8'))
        sectionTitle = data.title || entry.name
      }

      const sectionKey = sectionSlug.join('/')
      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, { title: sectionTitle, items: [] })
      }

      readDocsRecursive(sectionDir, sectionSlug, topLevel, sections)
    } else if (entry.name.endsWith('.mdx')) {
      const slug = [...parentSlug, entry.name.replace(/\.mdx$/, '')]
      const raw = fs.readFileSync(path.join(dir, entry.name), 'utf-8')
      const { data } = matter(raw)

      const meta: DocMeta = {
        title: data.title || entry.name.replace(/\.mdx$/, ''),
        description: data.description,
        order: data.order ?? 999,
        slug,
        href: `/docs/${slug.join('/')}`,
      }

      if (parentSlug.length === 0) {
        topLevel.push(meta)
      } else {
        const sectionKey = parentSlug.join('/')
        sections.get(sectionKey)?.items.push(meta)
      }
    }
  }
}
