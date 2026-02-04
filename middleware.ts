import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Extract locale from pathname
  const pathnameLocale = routing.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const locale = pathnameLocale || routing.defaultLocale

  // Get pathname without locale prefix
  const pathnameWithoutLocale = pathnameLocale
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname

  // Protected routes (without locale prefix)
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Admin routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Auth routes (login, sign-up)
  const authRoutes = ['/auth/login', '/auth/sign-up']
  const isAuthRoute = authRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  )

  // For protected/auth/admin routes, check authentication
  if (isProtectedRoute || isAuthRoute || isAdminRoute) {
    await updateSession(request)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Build URL with locale
    const buildLocalizedUrl = (path: string) => {
      if (locale === routing.defaultLocale) {
        return new URL(path, request.url)
      }
      return new URL(`/${locale}${path}`, request.url)
    }

    // If user is not logged in and trying to access protected route
    if (isProtectedRoute && !user) {
      const loginUrl = buildLocalizedUrl('/auth/login')
      loginUrl.searchParams.set('redirectTo', pathnameWithoutLocale)
      return NextResponse.redirect(loginUrl)
    }

    // If user is logged in and trying to access auth routes
    if (isAuthRoute && user) {
      return NextResponse.redirect(buildLocalizedUrl('/dashboard'))
    }

    // Check for admin routes
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

  // Apply i18n middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
}
