// client/src/hooks/useTheme.js
import { useState, useEffect } from 'react';
import { applyTheme } from '../themes/themes';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ht_theme') || 'darkside';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('ht_theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(t => (t === 'darkside' ? 'lightside' : 'darkside'));

  return { theme, toggleTheme };
}
