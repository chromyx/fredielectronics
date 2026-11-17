import { NextResponse, type NextRequest } from 'next/server'

// Passes the requested path on to the pages, so "page not found" can answer in the right language.
export function proxy(req: NextRequest) {
  const headers = new Headers(req.headers)
  headers.set('x-pathname', req.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = { matcher: ['/((?!api|admin|_next|media|brand|favicon).*)'] }
