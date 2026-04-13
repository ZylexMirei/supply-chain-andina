import { createContext, useState, useEffect } from 'react';

// Creamos el contexto
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Leemos si el usuario ya tenía el modo oscuro guardado en su navegador
  const temaGuardado = localStorage.getItem('scm_tema') || 'dark';
  const [tema, setTema] = useState(temaGuardado);

  useEffect(() => {
    // Aplicamos el tema al HTML principal
    document.documentElement.setAttribute('data-theme', tema);
    // Lo guardamos para que no se borre al recargar la página
    localStorage.setItem('scm_tema', tema);
  }, [tema]);

  const toggleTema = () => {
    setTema(tema === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}