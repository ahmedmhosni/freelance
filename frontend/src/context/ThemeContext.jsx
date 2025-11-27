import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import logger from '../utils/logger';

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
      // Apply dark-mode class to body for CSS
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
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
        // Apply dark-mode class to body for CSS
        if (response.data.theme === 'dark') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    } catch (error) {
      // Silently fail - user might not be logged in or endpoint doesn't exist yet
      logger.debug('Could not sync theme with server');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply dark-mode class to body for CSS
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Save to server if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/api/user/preferences', { theme: newTheme });
      } catch (error) {
        logger.debug('Could not save theme to server');
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
