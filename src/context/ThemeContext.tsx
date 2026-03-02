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
  isDarkMode: boolean;       // current mode flag
  toggleDarkMode: () => void; // flip the mode
  setIsLoading: (loading: boolean) => void; // allow consumers to dismiss the loading spinner
}

/**
 * default values used when a component consumes the context without a provider.
 * the functions are no‑ops so calling them won’t crash.
 */
const defaultThemeContext: ThemeContextProps = {
  isLoading: true,
  isDarkMode: false,
  toggleDarkMode: () => {},
  setIsLoading: () => {},
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // on first mount determine the starting theme
  useEffect(() => {
    // prefer stored preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    } else {
      // fall back to system preference
      const prefersDark =
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }

    // fake an initial loading delay so pages can show a spinner if they want
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // whenever the mode changes, update the `document` class and persist it
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        isLoading,
        isDarkMode,
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