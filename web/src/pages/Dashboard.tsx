// src/pages/Dashboard.tsx
import React from 'react';
import Layout from '../components/common/Layout';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard</p>
      </div>
    </Layout>
  );
};

export default Dashboard;