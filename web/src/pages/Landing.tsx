// src/pages/Landing.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="landing-container">
      <h1>Welcome to Swasthya-AI</h1>
      <p>Your AI-powered healthcare platform</p>
      <Link to="/login">
        <button>Get Started</button>
      </Link>
    </div>
  );
};

export default Landing;