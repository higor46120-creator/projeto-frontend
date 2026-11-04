import { useState } from 'react';

export const useTema = () => {
  const [tema, setTema] = useState('dark');
  const toggleTema = () => setTema((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { tema, isDark: tema === 'dark', toggleTema };
};

export default useTema;