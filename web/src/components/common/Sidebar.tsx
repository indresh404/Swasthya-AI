// src/components/common/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" end>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/appointments">
              Appointments
            </NavLink>
          </li>
          <li>
            <NavLink to="/medicine">
              Medicine
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile">
              Profile
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;