'use client'

/* 
USAGE EXAMPLE  In your components
```
const { locale, dictionary, setLocale, isLoading } = useLocale()

if (isLoading) {
  return <div>Loading...</div>
}

return (
  <div>
    <select value={locale} onChange={(e) => setLocale(e.target.value as LocaleType)}>
      <option value="it">Italiano</option>
      <option value="en">English</option>
    </select>
    <p>{dictionary.someKey}</p>
  </div>
)
```
*/

import { getDictionary, LocaleType } from '@/app/[lang]/getDictionary'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface LocaleContextType {
    locale: LocaleType
    dictionary: Record<string, any>
    setLocale: (locale: LocaleType) => void
    isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export const useLocale = () => {
    const context = useContext(LocaleContext)
    if (!context) {
      throw new Error('useLocale must be used within a LocaleProvider')
    }
    return context
}

const DEFAULT_LOCALE: LocaleType = 'it'

const getStoredLocale = (): LocaleType => {
    if (typeof document === 'undefined') return DEFAULT_LOCALE
    
    const stored = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] as LocaleType | undefined
  
    return stored || DEFAULT_LOCALE
  }

interface LocaleProviderProps {
    children: React.ReactNode
    initialLocale?: LocaleType
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children, initialLocale = DEFAULT_LOCALE  }) => {

    const [locale, setLocale] = useState<LocaleType>(initialLocale)
    const [dictionary, setDictionary] = useState<Record<string, any>>({})
    const [isLoading, setIsLoading] = useState(true)

    const router = useRouter()

    useEffect(() => {
        const storedLocale = getStoredLocale()
        setLocale(storedLocale)
    }, [])


    useEffect(() => {
        const loadDictionary = async () => {
          try {
            setIsLoading(true)
            const dict = await getDictionary(locale)
            setDictionary(dict)
          } catch (error) {
            console.error(`Failed to load dictionary for locale ${locale}:`, error)
            // Fallback to empty dictionary but don't break the app
            setDictionary({})
          } finally {
            setIsLoading(false)
          }
        }
    
        loadDictionary()
    }, [locale])

    useEffect(() => {
        // Update locale when initialLocale prop changes
        setLocale(initialLocale)
    }, [initialLocale])

    const handleSetLocale = (newLocale: LocaleType) => {
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000` // 1 year
        setLocale(newLocale)

        // Update the URL path
        const currentPath = window.location.pathname
        const newPath = currentPath.replace(/^\/[^\/]+/, `/${newLocale}`)
        router.push(newPath)
    }

    return (
        <LocaleContext.Provider value={{ 
          locale, 
          dictionary, 
          setLocale: handleSetLocale,
          isLoading 
        }}>
          {children}
        </LocaleContext.Provider>
    )
}
