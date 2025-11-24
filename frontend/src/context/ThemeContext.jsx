import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme from localStorage first (instant)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    setLoading(false);

    // Then sync with server if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      syncThemeWithServer();
    }
  }, []);

  const syncThemeWithServer = async () => {
    try {
      const response = await api.get('/api/user/preferences');
      if (response.data.theme && response.data.theme !== theme) {
        setTheme(response.data.theme);
        document.documentElement.setAttribute('data-theme', response.data.theme);
        localStorage.setItem('theme', response.data.theme);
      }
    } catch (error) {
      // Silently fail - user might not be logged in or endpoint doesn't exist yet
      console.debug('Could not sync theme with server');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Save to server if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/api/user/preferences', { theme: newTheme });
      } catch (error) {
        console.debug('Could not save theme to server');
      }
    }
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
