import { MdCheckCircle } from 'react-icons/md';

const FullWidthFeature = ({ title, description, benefits, visual, reverse, isDark }) => {
  return (
    <div style={{
      position: 'relative',
      padding: '120px 0',
      overflow: 'hidden'
    }}>
      {/* Content Container */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 40px',
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 968 ? '1fr' : '500px 1fr',
        gap: '60px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Text Content */}
        <div style={{ 
          order: reverse ? 2 : 1
        }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '32px' : '42px',
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#37352f',
            marginBottom: '16px',
            lineHeight: '1.2',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '17px',
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            {description}
          </p>
          
          {/* Benefits */}
          {benefits && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {benefits.map((benefit, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MdCheckCircle size={20} style={{ 
                    color: '#10b981', 
                    flexShrink: 0,
                    marginTop: '2px'
                  }} />
                  <span style={{
                    fontSize: '15px',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                    lineHeight: '1.5'
                  }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholder for grid */}
        <div style={{ 
          order: reverse ? 1 : 2,
          minHeight: '400px'
        }} />
      </div>

      {/* Demo - Positioned absolutely to extend from edge */}
      <div style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [reverse ? 'left' : 'right']: 0,
        width: '60vw',
        maxWidth: '900px',
        zIndex: 1
      }}>
        {/* Edge Fade Mask */}
        <div style={{
          position: 'absolute',
          [reverse ? 'right' : 'left']: 0,
          top: 0,
          bottom: 0,
          width: '200px',
          background: isDark 
            ? `linear-gradient(${reverse ? '270deg' : '90deg'}, #0a0a0a 0%, transparent 100%)`
            : `linear-gradient(${reverse ? '270deg' : '90deg'}, #ffffff 0%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: 'none'
        }} />
        
        {/* Demo */}
        {visual}
      </div>
    </div>
  );
};

export default FullWidthFeature;
