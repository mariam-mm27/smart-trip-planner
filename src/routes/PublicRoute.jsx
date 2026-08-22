import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          color: '#00d2ff',
          backgroundColor: '#0b1329',
        }}
      >
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.95rem' }}>
          Checking authentication...
        </p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/explore" replace />;
  }

  return children ? children : <Outlet />;
}
