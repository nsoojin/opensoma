import { NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'

const ALLOWED_HOSTS = ['www.swmaestro.ai', 'swmaestro.ai']

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return new NextResponse('Host not allowed', { status: 403 })
  }

  try {
    const client = await requireAuth()
    const sessionData = client.getSessionData()

    const response = await fetch(url, {
      headers: {
        Cookie: `SESSION=${sessionData.sessionCookie}`,
      },
    })

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const arrayBuffer = await response.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new NextResponse('Failed to proxy image', { status: 500 })
  }
}
