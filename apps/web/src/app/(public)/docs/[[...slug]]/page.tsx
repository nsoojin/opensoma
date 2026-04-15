import rehypeShiki from '@shikijs/rehype'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import { extractHeadings, getAllDocSlugs, getDoc } from '@/lib/docs'

import { DocsTableOfContents } from '../docs-toc'
import { mdxComponents } from '../mdx-components'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const doc = getDoc(slug)
  if (!doc) return {}

  return {
    title: doc.meta.title,
    description: doc.meta.description,
  }
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug: slug.length === 0 ? undefined : slug }))
}

export const dynamicParams = false

export default async function DocPage({ params }: PageProps) {
  const { slug = [] } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()

  const headings = extractHeadings(doc.content)

  return (
    <div className="flex gap-8">
      <article className="docs-prose min-w-0 flex-1">
        <h1>{doc.meta.title}</h1>
        {doc.meta.description && <p className="lead">{doc.meta.description}</p>}
        <MDXRemote
          source={doc.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, [rehypeShiki, { theme: 'github-dark', defaultLanguage: 'bash' }]],
            },
          }}
        />
      </article>
      {headings.length > 0 && <DocsTableOfContents headings={headings} />}
    </div>
  )
}
