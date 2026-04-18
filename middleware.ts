import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── 1. Resolve locale ──────────────────────────────────────────────────────
  const pathnameLocale = routing.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const locale = pathnameLocale || routing.defaultLocale
  const pathnameWithoutLocale = pathnameLocale
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname

  const isDashboardRoute = pathnameWithoutLocale.startsWith('/dashboard')
  const isAuthRoute = ['/auth/login', '/auth/sign-up'].some(r =>
    pathnameWithoutLocale.startsWith(r)
  )
  // Legacy /admin redirect → /dashboard
  const isLegacyAdmin = pathnameWithoutLocale.startsWith('/admin')

  // ── 2. Build response + Supabase client that refreshes JWT ─────────────────
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: always call getUser() — refreshes the JWT when needed
  const { data: { user } } = await supabase.auth.getUser()

  const buildUrl = (path: string) => {
    const base = locale === routing.defaultLocale ? path : `/${locale}${path}`
    return new URL(base, request.url)
  }

  // ── 3. Redirect legacy /admin/* → /dashboard/* ────────────────────────────
  if (isLegacyAdmin) {
    const newPath = pathnameWithoutLocale.replace('/admin', '/dashboard')
    return NextResponse.redirect(buildUrl(newPath))
  }

  // ── 4. Auth guards ─────────────────────────────────────────────────────────

  // Not logged in → bounce to login
  if (isDashboardRoute && !user) {
    const loginUrl = buildUrl('/auth/login')
    loginUrl.searchParams.set('redirectTo', pathnameWithoutLocale)
    return NextResponse.redirect(loginUrl)
  }

  // Logged in → never show auth pages, send to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(buildUrl('/dashboard'))
  }

  // ── 5. Apply i18n middleware, carry over auth cookies ─────────────────────
  const intlResponse = intlMiddleware(request)
  if (intlResponse) {
    response.cookies.getAll().forEach(({ name, value, ...opts }) => {
      intlResponse.cookies.set(name, value, opts as any)
    })
    return intlResponse
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
}
