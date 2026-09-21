import React, { useState, useEffect } from 'react';
import { Quote, Lock, Gift, Phone, MessageSquare, ShoppingBag, User, ChevronDown, ChevronUp } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(String(dateStr).replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(val) {
  const n = Number(val);
  if (isNaN(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CartOrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="flex flex-col p-5 rounded-2xl border border-amber-200/60 shadow-xs hover:shadow-md transition-all duration-300"
      style={{ backgroundColor: '#faf6f0' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-serif font-bold text-slate-900 text-sm leading-tight">{order.name}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap mt-0.5">
          {formatDate(order.created_at)}
        </span>
      </div>

      {/* Phone */}
      {order.phone && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Phone className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
          <span>{order.phone}</span>
        </div>
      )}

      {/* Message */}
      {order.message && (
        <div className="flex items-start gap-2 text-xs text-slate-600 italic mb-3 leading-relaxed">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>&ldquo;{order.message}&rdquo;</span>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-amber-200/50 pt-3 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
            {order.items_summary ? (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-teal-700 hover:underline font-medium"
              >
                Ver itens {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">Sem itens</span>
            )}
          </div>
          <span className="text-sm font-bold text-teal-700">{formatCurrency(order.total_amount)}</span>
        </div>

        {expanded && order.items_summary && (
          <p className="mt-2 text-[11px] text-slate-500 leading-relaxed bg-amber-50 rounded-lg px-3 py-2">
            {order.items_summary}
          </p>
        )}
      </div>
    </div>
  );
}

export function PrivateMessages() {
  const [messages, setMessages] = useState([]);
  const [cartOrders, setCartOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages');

  useEffect(() => {
    Promise.all([
      fetch('/api/messages/private').then((r) => r.json()).catch(() => ({ messages: [] })),
      fetch('/api/cart-orders').then((r) => r.json()).catch(() => ({ orders: [] }))
    ]).then(([msgData, ordersData]) => {
      if (msgData.messages && Array.isArray(msgData.messages)) {
        setMessages(msgData.messages);
      }
      if (ordersData.orders && Array.isArray(ordersData.orders)) {
        setCartOrders(ordersData.orders);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-amber-50/40 text-slate-800 font-sans">
      <section className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-mono tracking-widest text-teal-600 uppercase">
              Area dos noivos
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
            Mensagens &amp; Presentes
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Mensagens privadas e confirmacoes de presentes dos convidados.
          </p>
          <div className="w-16 h-0.5 bg-amber-300 mx-auto mt-3 rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            id="tab-messages"
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === 'messages'
                ? 'border-teal-500 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Quote className="w-4 h-4" />
            Mensagens Privadas
            {messages.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-teal-100 text-teal-700 rounded-full font-bold">
                {messages.length}
              </span>
            )}
          </button>
          <button
            id="tab-gifts"
            onClick={() => setActiveTab('gifts')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === 'gifts'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Gift className="w-4 h-4" />
            Presentes / Carrinho
            {cartOrders.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full font-bold">
                {cartOrders.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-16">
            <div className="animate-spin w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full mx-auto mb-3" />
            Carregando...
          </div>
        ) : activeTab === 'messages' ? (
          /* Mensagens Privadas */
          messages.length === 0 ? (
            <div className="text-center text-slate-400 py-16">
              <Quote className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-serif">Nenhuma mensagem privada recebida ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between p-6 rounded-2xl border border-amber-200/50 shadow-xs hover:shadow-md transition-all duration-300"
                  style={{ backgroundColor: '#faf6f0' }}
                >
                  <div className="mb-4">
                    <Quote className="w-5 h-5 text-amber-500/70 mb-2 rotate-180" />
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed italic">
                      &ldquo;{item.message}&rdquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-amber-200/50 flex items-center justify-between">
                    <span className="font-serif font-bold text-slate-900 text-sm">
                      {item.name}
                    </span>
                    {formatDate(item.created_at) && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDate(item.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Carrinho / Presentes */
          <>
            {/* Stats */}
            {cartOrders.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                  <ShoppingBag className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-[11px] text-teal-600 font-mono uppercase tracking-wide">Pedidos</p>
                    <p className="text-xl font-bold text-teal-800">{cartOrders.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-[11px] text-amber-600 font-mono uppercase tracking-wide">Total arrecadado</p>
                    <p className="text-xl font-bold text-amber-800">
                      {formatCurrency(cartOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {cartOrders.length === 0 ? (
              <div className="text-center text-slate-400 py-16">
                <Gift className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-serif">Nenhuma confirmacao de presente ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cartOrders.map((order) => (
                  <CartOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
