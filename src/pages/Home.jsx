import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Waves,
  Sun,
  MapPin,
  Calendar,
  Shirt,
  Heart,
  Gift,
  Sparkles
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import heroCoupleImg from '../assets/foto_home_nova.jfif';

export function Home() {
  const [apiStatus, setApiStatus] = useState({ loading: true, online: false });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setApiStatus({ loading: false, online: true, database: data.database });
        } else {
          setApiStatus({ loading: false, online: false });
        }
      })
      .catch(() => {
        setApiStatus({ loading: false, online: false });
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-amber-50/40 text-slate-800 font-sans">

      {/* HERO SECTION COM FOTO DO CASAL NA PRAIA */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center text-center overflow-hidden bg-slate-900 text-white">

        {/* Imagem de Fundo Oficial do Casal */}
        <div
          className="absolute inset-0 bg-cover bg-[center_top_20%] bg-no-repeat transform scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url(${heroCoupleImg})`
          }}
        />

        {/* Overlay Escuro Suave para realçar o texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/65" />

        {/* Conteúdo Central do Hero (Logo Oficial + Nomes + Data) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 flex flex-col items-center space-y-6 animate-fade-in">

          {/* Nome do Casal em caixa alta elegante */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif tracking-[0.2em] font-light text-white uppercase drop-shadow-md">
            LUIZ GUSTAVO E LUÍZA
          </h1>

          {/* Data formatada */}
          <p className="text-sm md:text-lg font-mono tracking-[0.35em] text-amber-200/90 font-medium uppercase drop-shadow-sm">
            06 &nbsp;|&nbsp; 12 &nbsp;|&nbsp; 2026
          </p>

          <p className="text-xs md:text-sm tracking-widest text-slate-200 uppercase font-medium flex items-center gap-2 pt-1">
            <Waves className="w-4 h-4 text-cyan-300 inline" /> Vilas do Atlântico — Lauro de Freitas, BA
          </p>

          {/* Botões de Ação */}
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/rsvp"
              className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-full shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-sm"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Confirmar Presença</span>
            </Link>

            <Link
              to="/presentes"
              className="px-8 py-3.5 bg-white/90 hover:bg-white text-slate-900 font-semibold rounded-full border border-white/60 shadow-xl backdrop-blur-md transition-all transform hover:scale-105 flex items-center gap-2 text-sm"
            >
              <Gift className="w-4 h-4 text-teal-600" />
              <span>Ver Lista de Presentes</span>
            </Link>
          </div>

        </div>

        {/* Efeito da borda rasgada / onda orgânica na parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg
            className="relative block w-full h-10 md:h-16 text-sky-50/70 fill-current"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,0 C150,90 350,-40 500,65 C650,170 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>

      </section>

      {/* SEÇÃO DESTACADA: FOTO DO CASAL E MENSAGEM */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/90 rounded-3xl p-6 md:p-10 border border-cyan-100/90 shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* Foto do Casal em Moldura Especial */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative p-2 bg-gradient-to-tr from-amber-100 via-teal-100 to-cyan-100 rounded-3xl shadow-xl transform hover:rotate-1 transition-transform duration-500">
              <img
                src={heroCoupleImg}
                alt="Luiz Gustavo e Luíza"
                className="w-full h-72 md:h-80 object-cover rounded-2xl shadow-md"
              />
            </div>
          </div>

          {/* Mensagem do Casal */}
          <div className="md:col-span-7 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Nossa História</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
              O Nosso Sim À Beira-Mar
            </h2>

            <p className="text-slate-600 font-serif italic text-base md:text-lg leading-relaxed">
              "O amor é como o mar: grandioso, sereno e cheio de luz. Esperamos você para celebrar esse momento inesquecível ao nosso lado."
            </p>

            <p className="text-teal-700 font-semibold text-sm tracking-wide">
              — Luiz Gustavo & Luíza
            </p>
          </div>

        </div>
      </section>

      {/* DETALHES DO EVENTO */}
      <section className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Card 1: Data & Horário */}
        <div className="bg-white/80 p-8 rounded-3xl shadow-xs border border-cyan-100/70 text-center backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 group-hover:scale-110 transition-transform">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-serif font-bold mb-2 text-slate-900">Data & Horário</h3>
          <p className="text-slate-700 font-semibold">Domingo, 06 de Dezembro de 2026</p>
          <p className="text-teal-700 text-xs font-semibold mt-1">Cerimônia às 14:00</p>
        </div>

        {/* Card 2: Local Praiano */}
        <div className="bg-white/80 p-8 rounded-3xl shadow-xs border border-cyan-100/70 text-center backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
          <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-100 group-hover:scale-110 transition-transform">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-serif font-bold mb-2 text-slate-900">Local</h3>
          <p className="text-slate-700 font-semibold">Informado No Convite</p>
          <p className="text-cyan-700 text-xs font-semibold mt-1">Vilas do Atlântico - Lauro de Freitas / BA</p>
        </div>

        {/* Card 3: Traje Praiano */}
        <div className="bg-white/80 p-8 rounded-3xl shadow-xs border border-cyan-100/70 text-center backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 group-hover:scale-110 transition-transform">
            <Shirt className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-serif font-bold mb-2 text-slate-900">Traje</h3>
          <p className="text-slate-700 font-semibold">Pé na Areia / Esporte Fino</p>
          <p className="text-amber-700 text-xs font-semibold mt-1">Vestidos leves, linho e tons pastel</p>
        </div>

      </section>
    </div>
  );
}
