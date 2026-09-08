import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Plus,
  Check,
  Sparkles,
  Waves,
  Heart,
  Search,
  Gift
} from 'lucide-react';

const mockGifts = [
  {
    id: 1,
    title: 'Jogo de Jantar 42 Peças Porcelana Fine',
    price: 'R$ 450,00',
    category: 'Cozinha',
    description: 'Aparelho de jantar refinado para receber a família em momentos especiais.',
    image: 'https://images.unsplash.com/photo-1615865417236-d67f58e17e66?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Cafeteira Espresso Automática Touch',
    price: 'R$ 680,00',
    category: 'Eletro',
    description: 'Para começarmos os dias ensolarados com um bom café fresco.',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebe02f2a6e8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Jogo de Cama Lino Premium 400 Fios',
    price: 'R$ 390,00',
    category: 'Cama & Banho',
    description: 'Lençóis em puro linho leve, frescos e ideais para o clima praiano.',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'Faqueiro Inox 72 Peças em Maleta',
    price: 'R$ 290,00',
    category: 'Cozinha',
    description: 'Talheres de inox de altíssima durabilidade e acabamento espelhado.',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    title: 'Cota - Jantar Romântico Pé na Areia',
    price: 'R$ 250,00',
    category: 'Lua de Mel',
    description: 'Jantar à luz de velas e tochas à beira-mar durante nossa lua de mel.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    title: 'Cota - Passeio de Catamarã nas Ilhas',
    price: 'R$ 350,00',
    category: 'Lua de Mel',
    description: 'Um dia incrível navegando pelas águas cristalinas com brinde de champanhe.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 7,
    title: 'Kit Cadeiras de Praia & Guarda-Sol Bamboo',
    price: 'R$ 320,00',
    category: 'Praia & Lazer',
    description: 'Kit de praia super elegante para curtir os fins de semana em Vilas.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 8,
    title: 'Adeva Climatizada & Taças de Cristal',
    price: 'R$ 520,00',
    category: 'Eletro',
    description: 'Para degustarmos bons vinhos na varanda com a brisa do mar.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 9,
    title: 'Cota - Dia de Spa Casal à Beira-Mar',
    price: 'R$ 420,00',
    category: 'Lua de Mel',
    description: 'Massagem relaxante ao som das ondas do mar para renovar as energias.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  }
];

const categories = ['Todos', 'Cozinha', 'Eletro', 'Cama & Banho', 'Praia & Lazer', 'Lua de Mel'];

export function Gifts() {
  const { addToCart, cart, totalItems, setIsCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedIds, setAddedIds] = useState([]);

  const filteredGifts = mockGifts.filter((gift) => {
    const matchesCategory = selectedCategory === 'Todos' || gift.category === selectedCategory;
    const matchesSearch = gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gift.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (gift) => {
    addToCart(gift);
    setAddedIds((prev) => [...prev, gift.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== gift.id));
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-amber-50/40 py-12 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Banner de Boas-Vindas */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold uppercase tracking-widest shadow-2xs">
            <Waves className="w-4 h-4 text-teal-600" />
            <span>Lista de Presentes Praiana</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Nossa Lista de Presentes
          </h1>

          <p className="text-slate-600 text-base md:text-lg font-light leading-relaxed">
            Sua presença em Vilas do Atlântico é nosso maior presente! Se desejar nos abençoar com um presente, selecionamos itens e cotas de lua de mel com muito amor.
          </p>

          {/* Quick Cart Notification bar if items exist */}
          {totalItems > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-medium shadow-md transition transform hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4 text-teal-400" />
                <span>Você tem <strong>{totalItems}</strong> {totalItems === 1 ? 'item' : 'itens'} no carrinho</span>
                <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Ver Carrinho
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 p-4 rounded-2xl border border-cyan-100/70 shadow-xs backdrop-blur-md">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar presente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Grid de Presentes com Fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGifts.map((gift) => {
            const isAdded = addedIds.includes(gift.id);
            const inCartItem = cart.find((c) => c.id === gift.id);

            return (
              <div
                key={gift.id}
                className="bg-white/90 rounded-3xl overflow-hidden border border-cyan-100/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Gift Photo with Overlay Badge */}
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={gift.image}
                    alt={gift.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-teal-800 uppercase tracking-widest shadow-xs">
                    {gift.category}
                  </div>

                  {inCartItem && (
                    <div className="absolute top-3 right-3 bg-teal-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {inCartItem.quantity} no carrinho
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {gift.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                      {gift.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Valor da Cota / Item
                      </span>
                      <span className="text-2xl font-bold text-slate-900 font-serif">
                        {gift.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdd(gift)}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-xs ${
                        isAdded
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-md'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" /> Adicionado!
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Presentear
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGifts.length === 0 && (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-cyan-100">
            <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">Nenhum presente encontrado</h3>
            <p className="text-xs text-slate-500 mt-1">Tente pesquisar com outro termo ou alterar a categoria.</p>
          </div>
        )}

      </div>
    </div>
  );
}
