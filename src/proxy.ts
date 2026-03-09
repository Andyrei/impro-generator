import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { auth } from '@/app/auth'

// Only requests from this origin are allowed to call /api/v1/* routes.
// Set NEXTAUTH_URL in your environment (e.g. https://impro-generator.vercel.app).
const ALLOWED_ORIGIN = process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL : 'http://localhost:3000'

const defaultLocale = 'it'
// const locales = ['it', 'ro', 'en']
const locales = ['it']

function getLocale(request: NextRequest) {
    // 1. Check URL (Already doing this)
    const pathname = request.nextUrl.pathname
    const pathnameLocale = locales.find(
      locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )
    if (pathnameLocale) return pathnameLocale

    // 2. Check Cookie (Users who have visited before)
    const cookieLocale = request.cookies.get('locale')?.value
    if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale

    // 3. Check Browser Headers
    const acceptedLanguage = request.headers.get('accept-language')
    if (acceptedLanguage) {
        const languages = new Negotiator({ headers: { 'accept-language': acceptedLanguage } }).languages()
        try {
            return match(languages, locales, defaultLocale)
        } catch (e) {
            return defaultLocale
        }
    }
  
    return defaultLocale
}

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl

    // ── CORS guard for API routes ────────────────────────────────────────────
    // Always exit early for /api/v1/* so these requests never reach the locale
    // redirect logic below. CORS blocking only applies in production.
    if (pathname.startsWith('/api/v1/')) {
        if (process.env.NODE_ENV === 'production') {
            const origin = request.headers.get('origin')

            // Requests with no Origin header (same-origin, server-side, or CORS-exempt)
            // pass through.  Cross-origin requests must come from the allowed origin.
            const isAllowed =
                !origin ||
                origin === ALLOWED_ORIGIN

            if (!isAllowed) {
                return new NextResponse(null, { status: 403 })
            }

            // Handle CORS preflight
            if (request.method === 'OPTIONS') {
                const res = new NextResponse(null, { status: 204 })
                if (origin) {
                    res.headers.set('Access-Control-Allow-Origin', origin)
                    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                    res.headers.set('Vary', 'Origin')
                }
                return res
            }
        }

        return NextResponse.next()
    }
    // ────────────────────────────────────────────────────────────────────────

    // Ignore files with extensions (e.g., .png, .jpg) or specific metadata routes
    if (
        pathname.includes('.') || 
        pathname.endsWith('/opengraph-image') || 
        pathname.endsWith('/twitter-image')
    ) {
        return NextResponse.next()
    }

    const locale = getLocale(request)

    // Handle root path
    if (pathname === '/') {
        const response = NextResponse.redirect(new URL(`/${locale}`, request.url));
        response.cookies.set('locale', locale); // set on the redirect too
        return response;
    }

    // Check for missing locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    if (pathnameIsMissingLocale) {
        const newPath = pathname.startsWith('/') 
            ? `/${locale}${pathname}`
            : `/${locale}/${pathname}`
         const response = NextResponse.redirect(new URL(newPath + search, request.url));
        response.cookies.set('locale', locale); // set on the redirect too
        return response;
    }

    const response = NextResponse.next()

    // Store locale in cookies for the client-side
    response.cookies.set('locale', locale);
    return response
}

export const config = {
    matcher: [
        // Block cross-origin calls to the API
        '/api/v1/:path*',
        // Match root and all non-asset page paths
        '/((?!api|admin|_next/static|_next/image|favicon.ico|og-image|twitter-image|sitemap.xml|robots.txt).*)',
    ]
}

// auth wraps proxy so that the session is populated AND our proxy logic runs
export const middleware = auth((req) => proxy(req as unknown as NextRequest))