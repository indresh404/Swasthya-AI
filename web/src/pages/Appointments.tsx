// src/pages/Appointments.tsx
import React from 'react';
import Layout from '../components/common/Layout';

const Appointments: React.FC = () => {
  return (
    <Layout>
      <div className="appointments-container">
        <h1>Appointments</h1>
        <p>Manage your appointments here</p>
      </div>
    </Layout>
  );
};

export default Appointments;