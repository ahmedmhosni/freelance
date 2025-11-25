import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardCharts = ({ taskData, invoiceData }) => {
  const COLORS = [
    'var(--chart-color-1)',
    'var(--chart-color-2)',
    'var(--chart-color-3)',
    'var(--chart-color-4)'
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '30px' }}>
      <div className="card">
        <h2>Tasks by Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={taskData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {taskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Invoice Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={invoiceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
