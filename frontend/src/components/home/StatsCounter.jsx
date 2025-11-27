import { useState, useEffect } from 'react';

const StatsCounter = ({ isDark }) => {
  const [stats, setStats] = useState({ users: 0, projects: 0, hours: 0 });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { users: 5247, projects: 12893, hours: 287456 };
    let current = { users: 0, projects: 0, hours: 0 };
    
    const timer = setInterval(() => {
      current.users = Math.min(current.users + targets.users / steps, targets.users);
      current.projects = Math.min(current.projects + targets.projects / steps, targets.projects);
      current.hours = Math.min(current.hours + targets.hours / steps, targets.hours);
      
      setStats({
        users: Math.floor(current.users),
        projects: Math.floor(current.projects),
        hours: Math.floor(current.hours)
      });
      
      if (current.users >= targets.users) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  const statItems = [
    { value: stats.users.toLocaleString(), label: 'Happy Freelancers', suffix: '+' },
    { value: stats.projects.toLocaleString(), label: 'Projects Completed', suffix: '+' },
    { value: stats.hours.toLocaleString(), label: 'Hours Tracked', suffix: '+' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
      gap: '32px',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {statItems.map((stat, index) => (
        <div key={index} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: window.innerWidth <= 768 ? '36px' : '48px',
            fontWeight: '700',
            color: isDark ? 'rgba(255, 255, 255, 0.95)' : '#37352f',
            marginBottom: '8px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {stat.value}{stat.suffix}
          </div>
          <div style={{
            fontSize: '14px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
            fontWeight: '500'
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;
