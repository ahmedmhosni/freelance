import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const MaintenanceContext = createContext();

export const useMaintenanceMode = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceMode must be used within MaintenanceProvider');
  }
  return context;
};

export const MaintenanceProvider = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const checkMaintenanceStatus = async () => {
    try {
      const response = await api.get('/api/maintenance/status');
      setIsMaintenanceMode(response.data.is_active);
      
      // If maintenance is active, user is logged in, not admin, and not on allowed pages
      const allowedPaths = ['/login', '/coming-soon'];
      if (
        response.data.is_active && 
        user && 
        user.role !== 'admin' && 
        !allowedPaths.includes(location.pathname)
      ) {
        navigate('/coming-soon');
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
      setIsMaintenanceMode(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, loading }}>
      {children}
    </MaintenanceContext.Provider>
  );
};
