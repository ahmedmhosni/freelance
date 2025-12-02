/**
 * Dashboard Page
 */

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Clients</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Active Projects</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">$0</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
