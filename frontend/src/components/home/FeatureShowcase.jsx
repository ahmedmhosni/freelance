import { MdCheckCircle } from 'react-icons/md';

const FeatureShowcase = ({ title, description, benefits, visual, reverse, isDark, badge }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth <= 968 ? '1fr' : '1fr 1fr',
      gap: '80px',
      alignItems: 'center',
      marginBottom: '120px',
      flexDirection: reverse ? 'row-reverse' : 'row'
    }}>
      {/* Text Content */}
      <div style={{ order: reverse ? 2 : 1 }}>
        {badge && (
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
            borderRadius: '20px',
            marginBottom: '16px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.1)'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
              letterSpacing: '0.5px'
            }}>
              {badge}
            </span>
          </div>
        )}
        <h3 style={{
          fontSize: window.innerWidth <= 768 ? '28px' : '36px',
          fontWeight: '600',
          color: isDark ? 'rgba(255, 255, 255, 0.95)' : '#37352f',
          marginBottom: '20px',
          lineHeight: '1.2',
          letterSpacing: '-0.02em'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '18px',
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
          lineHeight: '1.7',
          marginBottom: '32px'
        }}>
          {description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {benefits.map((benefit, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MdCheckCircle size={24} style={{ 
                color: '#10b981', 
                flexShrink: 0,
                marginTop: '2px'
              }} />
              <span style={{
                fontSize: '16px',
                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
                lineHeight: '1.6'
              }}>
                {benefit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Mockup */}
      <div style={{ 
        order: reverse ? 1 : 2,
        position: 'relative'
      }}>
        {visual}
      </div>
    </div>
  );
};

export default FeatureShowcase;
