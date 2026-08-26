import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('mehmon_admin_theme') || localStorage.getItem('mehmon_theme');
    return saved === 'light' ? 'light' : 'dark'; // Default is dark
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-theme', theme);
    if (body) body.setAttribute('data-theme', theme);

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
      }
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      if (body) {
        body.classList.remove('light');
        body.classList.add('dark');
      }
    }
    localStorage.setItem('mehmon_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLight: theme === 'light', isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
