'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

/**
 * shape of the context value exposed by the provider
 */
interface ThemeContextProps {
  isLoading: boolean;        // whether the initial theme detection is still running
  themeSettings: {
    stopwatchTimeFormat: string; // e.g. "mm:ss:ms"
    stopwatchPreventSleep: boolean; // whether to keep the screen awake when using the stopwatch
    theme: 'light' | 'dark' | 'system'; // current theme mode
  };
  setThemeSettings: (settings: ThemeContextProps['themeSettings']) => void; // allow consumers to update settings
  toggleDarkMode: () => void; // flip the mode
  setIsLoading: (loading: boolean) => void; // allow consumers to dismiss the loading spinner
}

/**
 * default values used when a component consumes the context without a provider.
 * the functions are no‑ops so calling them won’t crash.
 */
const defaultThemeContext: ThemeContextProps = {
  themeSettings: {
    stopwatchTimeFormat: "mm:ss:ms",
    stopwatchPreventSleep: true,
    theme: "system"
  },
  setThemeSettings: () => {},
  toggleDarkMode: () => {},
  setIsLoading: () => {},
  isLoading: true,
};

const ThemeContext = createContext<ThemeContextProps>(defaultThemeContext);

/**
 * convenience hook for components to read/write theme info
 */
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * real provider implementation that keeps state and side‑effects.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [themeSettings, setThemeSettings] = useState<ThemeContextProps['themeSettings']>(defaultThemeContext.themeSettings);

  // on first mount restore the saved theme choice
  useEffect(() => {
    const saved = localStorage.getItem('themeChoice') as 'light' | 'dark' | 'system' | null;
    setThemeSettings((prev) => ({ ...prev, theme: saved ?? 'system' }));

    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // whenever theme changes: apply the correct class and listen for system changes
  useEffect(() => {
    const applyDark = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark);
    };

    if (themeSettings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyDark(e.matches);
      mq.addEventListener('change', handler);
      localStorage.setItem('themeChoice', 'system');
      return () => mq.removeEventListener('change', handler);
    } else {
      applyDark(themeSettings.theme === 'dark');
      localStorage.setItem('themeChoice', themeSettings.theme);
    }
  }, [themeSettings.theme]);

  const toggleDarkMode = () => {
    setThemeSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <ThemeContext.Provider
      value={{
        isLoading,
        themeSettings,
        setThemeSettings,
        toggleDarkMode,
        setIsLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * wrapper exported under a more descriptive name; this is what the layout
 * component currently renders.
 */
export default function ClientThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}