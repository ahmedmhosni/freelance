import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardCharts = ({ taskData, invoiceData }) => {
  // Subtle, minimal colors matching the website theme
  const COLORS = [
    'rgba(55, 53, 47, 0.8)',   // Dark gray
    'rgba(55, 53, 47, 0.6)',   // Medium gray
    'rgba(55, 53, 47, 0.4)',   // Light gray
    'rgba(55, 53, 47, 0.25)'   // Very light gray
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', 
      gap: '20px', 
      marginTop: '30px' 
    }}>
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#37352f' }}>
          Tasks by Status
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={taskData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="rgba(55, 53, 47, 0.8)"
              dataKey="value"
              style={{ fontSize: '13px' }}
            >
              {taskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: '#ffffff',
                border: '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                fontSize: '13px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#37352f' }}>
          Invoice Status
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={invoiceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 53, 47, 0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 13, fill: 'rgba(55, 53, 47, 0.65)' }}
              stroke="rgba(55, 53, 47, 0.2)"
            />
            <YAxis 
              tick={{ fontSize: 13, fill: 'rgba(55, 53, 47, 0.65)' }}
              stroke="rgba(55, 53, 47, 0.2)"
            />
            <Tooltip 
              contentStyle={{ 
                background: '#ffffff',
                border: '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                fontSize: '13px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '13px' }}
            />
            <Bar 
              dataKey="count" 
              fill="rgba(55, 53, 47, 0.8)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
