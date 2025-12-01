import { MdWarning } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';

const MaintenanceBanner = () => {
  const { isDark } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: isDark
          ? 'linear-gradient(135deg, rgba(255, 163, 68, 0.95), rgba(235, 87, 87, 0.95))'
          : 'linear-gradient(135deg, rgba(255, 163, 68, 1), rgba(235, 87, 87, 1))',
        color: '#ffffff',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      }}
    >
      <MdWarning size={20} />
      <span>
        Maintenance Mode Active - Only admins can access the application
      </span>
    </div>
  );
};

export default MaintenanceBanner;
