import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const defaultLocale = 'it'
const locales = ['it', 'ro', 'en']
function getLocale(request: NextRequest) {
    // First check URL path for locale
    const pathname = request.nextUrl.pathname
    const pathnameLocale = locales.find(
      locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )
    
    if (pathnameLocale) {
      return pathnameLocale
    }
  
    // Then check accept-language header
    const acceptedLanguage = request.headers.get('accept-language') ?? ''
    const headers = { 'accept-language': acceptedLanguage }
    const languages = new Negotiator({ headers }).languages()
  
    // Use intl-localematcher to get the best locale
    return match(languages, locales, defaultLocale)
  }

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl
    const locale = getLocale(request)
    
    const response = NextResponse.next()

    // Store locale in cookies for the client-side
    response.cookies.set('locale', locale)

    // Handle root path
    if (pathname === '/') {
        return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }

    // Check for missing locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    if (pathnameIsMissingLocale) {
        const newPath = pathname.startsWith('/') 
            ? `/${locale}${pathname}`
            : `/${locale}/${pathname}`
        return NextResponse.redirect(new URL(newPath + search, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Match root and all non-asset paths
        '/',
        '/((?!api|_next|.*\\.[^/]*$).*)'
    ]
}