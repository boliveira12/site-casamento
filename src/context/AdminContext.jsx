import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });

  const login = () => {
    sessionStorage.setItem('admin_auth', 'true');
    setIsAdmin(true);
  };

  const logout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
