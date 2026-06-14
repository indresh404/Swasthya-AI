// src/pages/Profile.tsx
import React from 'react';
import Layout from '../components/common/Layout';

const Profile: React.FC = () => {
  return (
    <Layout>
      <div className="profile-container">
        <h1>Profile</h1>
        <p>Manage your profile settings here</p>
      </div>
    </Layout>
  );
};

export default Profile;