import { MdStar } from 'react-icons/md';

const Testimonials = ({ isDark }) => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      avatar: 'SJ',
      text: 'Roastify transformed how I manage my freelance business. The time tracking and invoicing features alone have saved me hours every week.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Software Developer',
      avatar: 'MC',
      text: 'Best freelance management tool I\'ve used. Clean interface, powerful features, and the lifetime access offer is incredible value.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Content Writer',
      avatar: 'EW',
      text: 'Finally, a platform that understands freelancers. Project management and client tracking are seamless. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
      gap: '24px'
    }}>
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="card"
          style={{
            padding: '24px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
            {[...Array(testimonial.rating)].map((_, i) => (
              <MdStar key={i} size={18} style={{ color: '#f59e0b' }} />
            ))}
          </div>
          <p style={{
            fontSize: '15px',
            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
            lineHeight: '1.6',
            marginBottom: '20px',
            fontStyle: 'italic'
          }}>
            "{testimonial.text}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {testimonial.avatar}
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
              }}>
                {testimonial.name}
              </div>
              <div style={{
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
              }}>
                {testimonial.role}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
