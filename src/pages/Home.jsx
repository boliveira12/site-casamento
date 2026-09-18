import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Waves,
  MapPin,
  Calendar,
  Shirt,
  Heart,
  Gift,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import heroCoupleImg from '../assets/foto_home_nova.jfif';
import foto1 from '../assets/foto1.jpeg';
import foto2 from '../assets/foto2.jpeg';
import foto3 from '../assets/foto3.jpeg';
import foto4 from '../assets/foto4.jpeg';
import foto5 from '../assets/foto5.jpeg';
import foto6 from '../assets/foto6.jpeg';
import foto7 from '../assets/foto7.jpeg';
import foto8 from '../assets/foto8.jpeg';
import foto9 from '../assets/foto9.jpeg';
import foto10 from '../assets/foto10.jpeg';
import foto11 from '../assets/foto11.jpeg';

const photos = [
  { src: foto1, alt: 'Luiz Gustavo e Luíza 1' },
  { src: foto2, alt: 'Luiz Gustavo e Luíza 2' },
  { src: foto3, alt: 'Luiz Gustavo e Luíza 3' },
  { src: foto4, alt: 'Luiz Gustavo e Luíza 4' },
  { src: foto5, alt: 'Luiz Gustavo e Luíza 5' },
  { src: foto6, alt: 'Luiz Gustavo e Luíza 6' },
  { src: foto7, alt: 'Luiz Gustavo e Luíza 7' },
  { src: foto8, alt: 'Luiz Gustavo e Luíza 8' },
  { src: foto9, alt: 'Luiz Gustavo e Luíza 9' },
  { src: foto10, alt: 'Luiz Gustavo e Luíza 10' },
  { src: foto11, alt: 'Luiz Gustavo e Luíza 11' },
];

export function Home() {
  const [apiStatus, setApiStatus] = useState({ loading: true, online: false });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
  };

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

      {/* SEÇÃO CARROSSEL DE FOTOS (ESTILO COVERFLOW 3D NATIVO) */}
      {/* SEÇÃO CARROSSEL DE FOTOS (EFEITO PROFUNDIDADE HORIZONTAL AMPLA) */}
      <section className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-6 md:py-8">
        <div
          className="relative bg-transparent w-full overflow-hidden group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Palco do Carrossel com Profundidade Ampla */}
          <div className="relative w-full h-[440px] sm:h-[520px] md:h-[600px] flex items-center justify-center overflow-hidden">
            {photos.map((photo, idx) => {
              // Cálculo de deslocamento circular
              let diff = idx - currentSlide;
              if (diff > photos.length / 2) diff -= photos.length;
              if (diff < -photos.length / 2) diff += photos.length;

              const absDiff = Math.abs(diff);
              const dir = diff < 0 ? -1 : 1;

              // Configuração simétrica de camadas por distância relativa
              let transformStyle = '';
              let layerClasses = '';

              if (absDiff === 0) {
                // Foto Central Ativa (100% destaque)
                transformStyle = 'translate(-50%, -50%) scale(1.04)';
                layerClasses = 'opacity-100 z-40 pointer-events-auto cursor-default ring-2 ring-white/95 shadow-2xl shadow-slate-900/20';
              } else if (absDiff === 1) {
                // Camada 1: Fotos Próximas (faded leve)
                transformStyle = `translate(calc(-50% + ${dir * 64}%), -50%) scale(0.85)`;
                layerClasses = 'opacity-50 sm:opacity-60 z-30 pointer-events-auto cursor-pointer hover:opacity-75 shadow-lg';
              } else if (absDiff === 2) {
                // Camada 2: Fotos Seguintes (mais transparentes, visíveis a partir de telas pequenas)
                transformStyle = `translate(calc(-50% + ${dir * 122}%), -50%) scale(0.70)`;
                layerClasses = 'opacity-0 sm:opacity-25 md:opacity-30 z-20 pointer-events-none sm:pointer-events-auto sm:cursor-pointer sm:hover:opacity-50 shadow-md';
              } else if (absDiff === 3) {
                // Camada 3: Fotos Mais Distantes (quase imperceptíveis nas bordas da tela)
                transformStyle = `translate(calc(-50% + ${dir * 175}%), -50%) scale(0.58)`;
                layerClasses = 'opacity-0 md:opacity-10 lg:opacity-14 z-10 pointer-events-none md:pointer-events-auto md:cursor-pointer md:hover:opacity-30 shadow-xs';
              } else {
                // Fotos além da camada 3: escondidas fora do palco
                transformStyle = `translate(calc(-50% + ${dir * 220}%), -50%) scale(0.50)`;
                layerClasses = 'opacity-0 z-0 pointer-events-none';
              }

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (diff !== 0) setCurrentSlide(idx);
                  }}
                  style={{
                    transform: transformStyle
                  }}
                  className={`absolute top-1/2 left-1/2 w-[70%] sm:w-[50%] md:w-[36%] lg:w-[28%] max-w-[380px] aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 ease-out select-none ${layerClasses}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    draggable={false}
                    className="w-full h-full object-cover object-center select-none"
                  />
                  {absDiff === 0 && (
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl md:rounded-3xl pointer-events-none" />
                  )}
                </div>
              );
            })}

            {/* Botão Anterior Discreto e Flutuante */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Foto anterior"
              className="absolute left-1 sm:left-3 md:left-6 top-1/2 -translate-y-1/2 z-50 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/70 hover:bg-white/95 text-slate-700 hover:text-slate-950 flex items-center justify-center border border-white/50 backdrop-blur-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer opacity-70 hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Botão Próximo Discreto e Flutuante */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Próxima foto"
              className="absolute right-1 sm:right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/70 hover:bg-white/95 text-slate-700 hover:text-slate-950 flex items-center justify-center border border-white/50 backdrop-blur-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer opacity-70 hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Barra Inferior: Indicadores e Contador */}
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <div className="flex justify-center items-center gap-1.5">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Ir para foto ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentSlide
                    ? 'w-6 h-1.5 bg-teal-600/90'
                    : 'w-1.5 h-1.5 bg-slate-300/80 hover:bg-slate-400'
                    }`}
                />
              ))}
            </div>

            <span className="text-[11px] font-mono tracking-widest text-slate-400/80 uppercase">
              {currentSlide + 1} / {photos.length}
            </span>
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
