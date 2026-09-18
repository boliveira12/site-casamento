import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Check, Gift, ExternalLink } from 'lucide-react';

const mockGifts = [
  {
    id: 1,
    title: 'Passeio de Balão na Capadócia',
    price: 'R$ 500,00',
    description: 'Um passeio inesquecível para celebrar nosso amor em um dos lugares mais românticos do mundo.',
    image: 'https://www.felizturismo.com/images/balloon-hero.webp'
  },
  {
    id: 2,
    title: 'Ingressos Para o Louvre',
    price: 'R$ 200,00',
    description: 'Visitar o museu mais famoso do mundo.',
    image: 'https://res.klook.com/images/w_1200,h_630,c_fill,q_65/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/nla50wcnftdwisfbtrl2/MuseudoLouvrecomvisitaguiada%C3%A0MonaLisa-Klook.jpg'
  },
  {
    id: 3,
    title: 'Café da Manhã em Veneza',
    price: 'R$ 150,00',
    description: 'Um café da manhã delicioso para começar o dia.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYxy6WqrPJGEQmoT11TYI_yzMp2WJdrpPqnpiEXfvMuQ&s=10'
  },
  {
    id: 4,
    title: 'Passeio nos Templos de Kyoto',
    price: 'R$ 400,00',
    description: 'Explorar a beleza e a espiritualidade dos templos de Kyoto.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW79wifdUx2f5E3TlEJzkxIUlqJ_1ZXU3o4Qtmw-lZXA&s=10'
  },
  {
    id: 5,
    title: 'Um Gelato em Florença',
    price: 'R$ 50,00',
    description: 'Um gelato para adoçar a vida.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8aRXrZW1cKtOEGAWKOtoYMAwoYEet0_73xIcEEgTafA&s=10'
  },
  {
    id: 6,
    title: 'Mergulho com os Peixes em Búzios',
    price: 'R$ 350,00',
    description: 'Um dia incrível navegando pelas águas cristalinas.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 7,
    title: 'Aluguel de Bicicletas em Berlim',
    price: 'R$ 100,00',
    description: 'Um passeio de bicicleta pela cidade.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZT2BuOpbrRI01kVoh8aTA3ztu2S5k6j9KnMhPbNrjVA&s=10'
  },
  {
    id: 8,
    title: 'Jantar Romântico nas Bahamas',
    price: 'R$ 250,00',
    description: 'Um jantar romântico ao pôr do sol, com vista para o mar.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBcfB_6H2vvsqSFmd4en7rtH-6r6m_CX27bbSNL_vKYQ&s=10'
  },
  {
    id: 9,
    title: 'Passeio de Safari na Africa do Sul',
    price: 'R$ 300,00',
    description: 'Um dia incrível de safári, com vista para os animais.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7-VWlLBCyxHYfQefP-wIvKhd1qw138RB4iBovns87fQ&s=10'
  }
];


export function Gifts() {
  const { addToCart, cart, totalItems, setIsCartOpen } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [addedIds, setAddedIds] = useState([]);

  const filteredGifts = mockGifts.filter((gift) => {
    const matchesSearch = gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
                        Valor Simbólico
                      </span>
                      <span className="text-2xl font-bold text-slate-900 font-serif">
                        {gift.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdd(gift)}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-xs ${isAdded
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

        {/* Sessão de Outras Listas de Presentes (Lojas Externas) */}
        <div className="mt-16 pt-12 border-t border-cyan-100/90">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
              Prefere presentear de outra forma?
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-light leading-relaxed">
              Além das cotas e opções aqui do site, também criamos listas completas com itens para o nosso novo lar na Camicado e na Amazon. Você pode acessá-las diretamente nos botões abaixo:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card Camicado */}
            <div className="bg-white/95 rounded-3xl p-6 md:p-8 border border-rose-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between h-10">
                  <div className="flex items-center">
                    <svg viewBox="0 0 324.4 71.7" className="h-7 w-auto fill-[#C41230]" role="img" aria-label="Logo Camicado">
                      <path d="M150.6,14.4l0.1,53.8l-9.6,0l0.1-53.8L150.6,14.4z M118.8,14.4l-7.9,30l-7.6-30.1c-2.2,0.1-4.6,0-6.7,0.1 L84,64.6L71.6,14.3l-7.5,0c-0.3,1.8,0,0.8-13.2,46.1c-0.4,1.2-0.5,2.2-1.6,3c-1.9,1.6-5.3,2.2-8.5,2.3c-3.1,0.1-8-0.8-11-1.9 C-6.7,50.7,12.9-9,53.8,10.4c0.4,0.2,1.5,0.9,1.9,1.1l4-6.4l-1.5-0.5c-4.3-1.4-9-2.8-13.6-3.3c-18.1-2.3-33,4.8-41.5,21 c-0.7,1.4-1.2,2.5-1.6,4c-5.2,20.7,6.4,39,27,44.1c5.5,1.2,12.5,0.9,15.5,0.5c5.7-0.7,5-0.8,11.3-2.5c3.2-11,6.3-21.3,9.6-32.3 c2.7,10.6,5.3,21.5,7.8,32.1l15.7,0c1.9-7.7,6.5-26.3,8.1-32.5l8.3,32.5l5.5,0l8.3-32.7l8.2,32.6l12.4,0l-12.6-53.8 C124.1,14.4,121.5,14.3,118.8,14.4 M204.7,14.3l-14.1,49c-10.7,2.8-20-0.9-24.3-7.3c-12-18.1,0.7-43.9,25-37.7 c2.5,0.8,4.9,2.1,6.8,3l2.9-5c-1.9-0.5-3.9-1.2-5.8-1.7c-1.3-0.4-2.5-0.6-3.8-0.8c-45.3-6.8-52.4,52.3-10.3,54.9 c3.4,0.3,14.4-0.4,15.5-1.6c3-10.6,6.1-20.9,9.1-31.5c2.6,10.7,5.1,22,7.9,32.6l11.8,0l-13.1-53.9H204.7z M306.1,4.8 c22.7,13.9,24.5,44.6,1.1,61.5c-6.7,3.8-11.9,4.5-18.5,4.7c-2.4,0-4.4-0.1-6.7-0.7c-7.9-2-15.3-6.6-19.4-13.3c-0.1,0-0.2,0-0.3,0 c-9.1,12.6-21.4,11-35.7,11.2l0-53.7l14.5-0.1c7.5,0,14.5,1,19.5,6.3h0.5C269.2,4.4,288.5-6,306.1,4.8 M238,62.8 c17.8-0.7,20.1-14.8,18.6-28.5c-2.1-11.2-8-16.3-18.6-15.6L238,62.8 M291.9,65.6c28.9-3.6,31.4-49.3,5-58.5 c-2.7-0.9-5.6-1.2-8.4-0.9c-29.6,3.6-31.7,52-3.5,58.9C287.4,65.8,289.5,65.9,291.9,65.6" />
                    </svg>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    Lista na Camicado
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed">
                    Aparelhos de jantar, faqueiros, taças de cristal, roupas de cama e artigos de decoração especiais para o nosso cantinho.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <a
                  href="https://lista.camicado.com.br/luizeluiza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <span>Ver Lista na Camicado</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Card Amazon */}
            <div className="bg-white/95 rounded-3xl p-6 md:p-8 border border-amber-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between h-10">
                  <div className="flex items-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                      alt="Logo Amazon"
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Lista na Amazon
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed">
                    Eletrodomésticos, itens inteligentes para casa, utensílios de cozinha e presentes práticos com entrega rápida.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <a
                  href="https://www.amazon.com.br/hz/wishlist/ls/1Q1OB5S71D9O8?ref_=wl_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <span>Ver Lista na Amazon</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
