import { useEffect, useState } from 'react';
const STORAGE_KEY = 'helptec-theme';
function getInitialTheme() {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;

  // Sem preferência salva: respeita o tema do sistema operacional.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Hook compartilhado de tema claro/escuro.
 * Aplica/remove a classe "dark" no <html>, que já é usada pelo
 * theme.css e pelo dark-overrides.css do projeto, e persiste a
 * escolha do usuário no localStorage.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);
  const toggleTheme = () => setIsDark((prev) => !prev);
  return {
    isDark,
    toggleTheme,
  };
}
