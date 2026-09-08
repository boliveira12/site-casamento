import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Rsvp } from './pages/Rsvp';
import { Gifts } from './pages/Gifts';
import { GuestList } from './pages/GuestList';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lista-convidados" element={<GuestList />} />
              <Route path="/rsvp" element={<Rsvp />} />
              <Route path="/presentes" element={<Gifts />} />
            </Routes>
          </main>
          <CartDrawer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
