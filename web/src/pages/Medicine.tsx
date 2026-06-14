// src/pages/Medicine.tsx
import React from 'react';
import Layout from '../components/common/Layout';

const Medicine: React.FC = () => {
  return (
    <Layout>
      <div className="medicine-container">
        <h1>Medicine Inventory</h1>
        <p>Manage medicine inventory here</p>
      </div>
    </Layout>
  );
};

export default Medicine;