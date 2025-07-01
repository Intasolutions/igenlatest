import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // ✅ Correct import with curly braces

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('access');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    if (allowedRoles.includes(userRole)) {
      return children;
    } else {
      return (
        <div style={{ padding: 40 }}>
          <h2>403 Forbidden - Unauthorized</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      );
    }
  } catch (err) {
    console.error('Invalid token:', err);
    return <Navigate to="/" replace />;
  }
}
