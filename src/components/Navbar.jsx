import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Sun, Heart } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();

  const activeClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 flex items-center gap-1.5 ${
      isActive
        ? 'border-teal-600 text-teal-800 font-bold bg-teal-50/60 rounded-t-lg'
        : 'border-transparent text-slate-600 hover:text-teal-700 hover:border-teal-300'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-cyan-100/70 shadow-xs">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Praiano */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-teal-400 via-cyan-400 to-amber-300 shadow-md group-hover:scale-105 transition-transform duration-300">
            <img
              src={logoImg}
              alt="Logo Luiz Gustavo & Luíza"
              className="w-12 h-12 rounded-full object-cover border-2 border-white bg-amber-50/50"
            />
          </div>
          <div>
            <span className="font-serif text-lg md:text-xl tracking-wide font-bold text-slate-900 block leading-tight flex items-center gap-1.5">
              Luiz Gustavo & Luíza <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline-block" />
            </span>
            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-widest block flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Casamento na Praia · 06 DEZ 2026
            </span>
          </div>
        </NavLink>

        {/* Links & Carrinho */}
        <div className="flex items-center gap-2 md:gap-6">
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" className={activeClass}>
              Início
            </NavLink>
            <NavLink to="/rsvp" className={activeClass}>
              RSVP Presença
            </NavLink>
            <NavLink to="/presentes" className={activeClass}>
              Lista de Presentes
            </NavLink>
          </nav>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl shadow-md shadow-cyan-500/20 transition-all transform hover:scale-105 flex items-center gap-2"
            title="Abrir carrinho de presentes"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-bold hidden md:inline">Carrinho</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
