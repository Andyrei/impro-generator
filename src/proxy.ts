import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const defaultLocale = 'it'
const locales = ['it', 'ro', 'en']

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
        // Match root and all non-asset paths
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
}