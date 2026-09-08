import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminLogin } from './AdminLogin';

export function ProtectedRoute({ children }) {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return children;
}
