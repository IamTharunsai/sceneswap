import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const CREATOR_ROUTES = ['/dashboard', '/campaigns', '/videos', '/earnings', '/analytics']
const BRAND_ROUTES = ['/brand']
const ADMIN_ROUTES = ['/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Dev preview bypass — allows headless/demo access without Firebase auth
  const previewRole = req.nextUrl.searchParams.get('preview')
  if (previewRole === 'creator' || previewRole === 'brand' || previewRole === 'admin') {
    const res = NextResponse.next()
    res.cookies.set('session-role', previewRole, { path: '/' })
    return res
  }

  // Check for session cookie (set server-side after Firebase verification)
  const sessionRole = req.cookies.get('session-role')?.value

  // Signup pages under /brand are public — must bypass the brand route guard
  const isPublicBrandPage = pathname === '/brand/signup'

  const isCreatorRoute = CREATOR_ROUTES.some(r => pathname.startsWith(r))
  const isBrandRoute = !isPublicBrandPage && BRAND_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))

  if (isAdminRoute && sessionRole !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isBrandRoute && sessionRole !== 'brand' && sessionRole !== 'admin') {
    return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), req.url))
  }

  if (isCreatorRoute && sessionRole !== 'creator' && sessionRole !== 'admin') {
    return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
