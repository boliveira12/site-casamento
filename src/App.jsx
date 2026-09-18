import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Rsvp } from './pages/Rsvp';
import { Gifts } from './pages/Gifts';
import { GuestList } from './pages/GuestList';
import { PrivateMessages } from './pages/PrivateMessages';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { AdminProvider } from './context/AdminContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/lista-convidados"
                  element={
                    <ProtectedRoute>
                      <GuestList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lista-convidado"
                  element={
                    <ProtectedRoute>
                      <GuestList />
                    </ProtectedRoute>
                  }
                />
                <Route path="/rsvp" element={<Rsvp />} />
                <Route path="/presentes" element={<Gifts />} />
                <Route
                  path="/mensagens"
                  element={
                    <ProtectedRoute>
                      <PrivateMessages />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <CartDrawer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AdminProvider>
  );
}
