import React, { useState, useEffect } from 'react';
import { Quote, Lock } from 'lucide-react';

export function PrivateMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages/private')
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-amber-50/40 text-slate-800 font-sans">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-mono tracking-widest text-teal-600 uppercase">
              Área dos noivos
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
            Mensagens Privadas
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Mensagens marcadas como "Apenas para os noivos" pelos convidados.
          </p>
          <div className="w-16 h-0.5 bg-amber-300 mx-auto mt-3 rounded-full" />
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-16">
            <div className="animate-spin w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full mx-auto mb-3" />
            Carregando mensagens...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 py-16">
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
                    "{item.message}"
                  </p>
                </div>
                <div className="pt-3 border-t border-amber-200/50 flex items-center justify-between">
                  <span className="font-serif font-bold text-slate-900 text-sm">
                    {item.name}
                  </span>
                  {item.created_at && !isNaN(new Date(String(item.created_at).replace(' ', 'T')).getTime()) && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(String(item.created_at).replace(' ', 'T')).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
