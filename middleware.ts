import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Always refresh the session first — this keeps JWT alive
  const sessionResponse = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // 2. Resolve locale
  const pathnameLocale = routing.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const locale = pathnameLocale || routing.defaultLocale
  const pathnameWithoutLocale = pathnameLocale
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname

  const isProtectedRoute = ['/dashboard', '/admin'].some(r => pathnameWithoutLocale.startsWith(r))
  const isAdminRoute = pathnameWithoutLocale.startsWith('/admin')
  const isAuthRoute = ['/auth/login', '/auth/sign-up'].some(r => pathnameWithoutLocale.startsWith(r))

  // 3. Only hit Supabase when we need to check auth
  if (isProtectedRoute || isAuthRoute) {
    // Reuse the refreshed cookies from sessionResponse
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Read from the already-refreshed session response cookies
            return sessionResponse.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const buildLocalizedUrl = (path: string) => {
      const base = locale === routing.defaultLocale ? path : `/${locale}${path}`
      return new URL(base, request.url)
    }

    // Not logged in → redirect to login
    if (isProtectedRoute && !user) {
      const loginUrl = buildLocalizedUrl('/auth/login')
      loginUrl.searchParams.set('redirectTo', pathnameWithoutLocale)
      return NextResponse.redirect(loginUrl)
    }

    // Logged in → redirect away from auth pages
    if (isAuthRoute && user) {
      return NextResponse.redirect(buildLocalizedUrl('/dashboard'))
    }

    // Admin route — verify role
    if (isAdminRoute && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(buildLocalizedUrl('/dashboard'))
      }
    }
  }

  // 4. Run i18n middleware on a clone, then copy refreshed cookies onto it
  const intlResponse = intlMiddleware(request)

  // If intlMiddleware returned a redirect/rewrite, preserve it but also
  // carry over the session cookies so they aren't lost
  if (intlResponse) {
    sessionResponse.cookies.getAll().forEach(({ name, value, ...opts }) => {
      intlResponse.cookies.set(name, value, opts as any)
    })
    return intlResponse
  }

  return sessionResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
}
