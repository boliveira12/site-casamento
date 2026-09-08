import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Trash2,
  Pencil,
  Save,
  X,
  Search,
  CheckSquare,
  Square,
  Phone,
  MessageCircle,
  Filter,
  Sparkles
} from 'lucide-react';

export function GuestList() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State para edição de convidado
  const [editingGuest, setEditingGuest] = useState(null);

  // Form State para inclusão
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [status, setStatus] = useState('ainda nao respondeu');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, text: '' });

  // Carregar lista de convidados do servidor SQLite
  const fetchGuests = async () => {
    try {
      const res = await fetch('/api/guest-list');
      const data = await res.json();
      if (data.guests) {
        setGuests(data.guests);
      }
    } catch (err) {
      console.error('Erro ao carregar lista de convidados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  // Adicionar convidado
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setFeedback({ type: null, text: '' });

    try {
      const res = await fetch('/api/guest-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          invite_sent: inviteSent,
          status
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Convidado adicionado com sucesso!' });
        setName('');
        setPhone('');
        setInviteSent(false);
        setStatus('ainda nao respondeu');
        fetchGuests();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Erro ao adicionar convidado.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Erro na conexão com o servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Atualizar campo individual (invite_sent ou status)
  const handleUpdateGuest = async (id, fieldsToUpdate) => {
    try {
      // Atualização otimista na interface local
      setGuests((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...fieldsToUpdate } : g))
      );

      const res = await fetch(`/api/guest-list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsToUpdate)
      });

      if (!res.ok) {
        // Se falhar, reverte a busca
        fetchGuests();
      }
    } catch (err) {
      console.error('Erro ao atualizar convidado:', err);
      fetchGuests();
    }
  };

  // Excluir convidado
  const handleDeleteGuest = async (id) => {
    if (!window.confirm('Tem certeza de que deseja remover este convidado da lista?')) return;

    try {
      setGuests((prev) => prev.filter((g) => g.id !== id));
      await fetch(`/api/guest-list/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Erro ao deletar convidado:', err);
      fetchGuests();
    }
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (guest) => {
    setEditingGuest({
      id: guest.id,
      name: guest.name || '',
      phone: guest.phone || '',
      invite_sent: Number(guest.invite_sent) === 1,
      status: guest.status || 'ainda nao respondeu'
    });
  };

  // Salvar Edição do Convidado
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingGuest || !editingGuest.name.trim()) return;

    try {
      await handleUpdateGuest(editingGuest.id, {
        name: editingGuest.name.trim(),
        phone: editingGuest.phone.trim(),
        invite_sent: editingGuest.invite_sent,
        status: editingGuest.status
      });
      setEditingGuest(null);
    } catch (err) {
      console.error('Erro ao salvar edição:', err);
    }
  };

  // Filtros & Busca
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.phone && guest.phone.includes(searchTerm));

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'invite_sent') return matchesSearch && Number(guest.invite_sent) === 1;
    if (filterStatus === 'invite_pending') return matchesSearch && Number(guest.invite_sent) === 0;
    return matchesSearch && guest.status === filterStatus;
  });

  // Estatísticas calculadas
  const totalCount = guests.length;
  const invitesSentCount = guests.filter((g) => Number(g.invite_sent) === 1).length;
  const confirmedCount = guests.filter((g) => g.status === 'confirmou').length;
  const declinedCount = guests.filter((g) => g.status === 'negou').length;
  const pendingCount = guests.filter((g) => g.status === 'ainda nao respondeu').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/80 via-cyan-50/30 to-amber-50/40 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-widest shadow-xs">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Gestão do Casamento</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Lista de Convidados
          </h1>

          <p className="text-slate-600 text-sm md:text-base font-light">
            Controle o envio dos convites e acompanhe a confirmação de presença de cada convidado especial.
          </p>
        </div>

        {/* Cards de Métricas / Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-100/80 shadow-sm text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total</span>
            <span className="text-2xl font-serif font-bold text-slate-800">{totalCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-100/80 shadow-sm text-center">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">Convite Enviado</span>
            <span className="text-2xl font-serif font-bold text-teal-700">{invitesSentCount} / {totalCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Confirmou</span>
            <span className="text-2xl font-serif font-bold text-emerald-700">{confirmedCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-rose-100/80 shadow-sm text-center">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">Negou</span>
            <span className="text-2xl font-serif font-bold text-rose-700">{declinedCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-amber-100/80 shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Pendente</span>
            <span className="text-2xl font-serif font-bold text-amber-700">{pendingCount}</span>
          </div>
        </div>

        {/* Form para Inserir Novo Convidado */}
        <div className="bg-white/90 p-6 md:p-8 rounded-3xl border border-cyan-100/90 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-50">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-serif font-bold text-slate-800">Novo Convidado</h2>
          </div>

          {feedback.text && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Nome do Convidado */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Nome do Convidado <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Maria Aparecida"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm bg-white"
              />
            </div>

            {/* Número de Telefone */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Número de Telefone
              </label>
              <input
                type="text"
                placeholder="(71) 99999-8888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm bg-white"
              />
            </div>

            {/* Check Mark Convite Enviado */}
            <div className="md:col-span-2 flex items-center h-11">
              <label className="flex items-center gap-2.5 cursor-pointer selection:bg-none text-sm text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={inviteSent}
                  onChange={(e) => setInviteSent(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 accent-teal-600"
                />
                <span>Convite Enviado</span>
              </label>
            </div>

            {/* Dropdown Resposta */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Resposta
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm bg-white font-medium"
              >
                <option value="ainda nao respondeu">ainda nao respondeu</option>
                <option value="confirmou">confirmou</option>
                <option value="negou">negou</option>
              </select>
            </div>

            {/* Botão Adicionar */}
            <div className="md:col-span-12 pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Adicionar Convidado</span>
              </button>
            </div>

          </form>
        </div>

        {/* Tabela de Convidados & Barra de Pesquisa/Filtro */}
        <div className="bg-white/90 rounded-3xl border border-cyan-100/90 shadow-xl backdrop-blur-md overflow-hidden">
          
          {/* Barra Superior de Busca e Filtro */}
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            
            {/* Input de Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>

            {/* Botões de Filtro */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterStatus === 'all'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todos ({totalCount})
              </button>
              <button
                onClick={() => setFilterStatus('ainda nao respondeu')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterStatus === 'ainda nao respondeu'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                }`}
              >
                Ainda não respondeu ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('confirmou')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterStatus === 'confirmou'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Confirmou ({confirmedCount})
              </button>
              <button
                onClick={() => setFilterStatus('negou')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterStatus === 'negou'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                }`}
              >
                Negou ({declinedCount})
              </button>
            </div>
          </div>

          {/* Tabela de Convidados */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="bg-cyan-50/60 text-slate-700 font-serif font-bold text-xs uppercase tracking-wider border-b border-cyan-100">
                  <th className="py-3.5 px-4 md:px-6">Nome do Convidado</th>
                  <th className="py-3.5 px-4">Número de Telefone</th>
                  <th className="py-3.5 px-4 text-center">Convite Enviado?</th>
                  <th className="py-3.5 px-4">Resposta dada pelo Convidado</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Carregando lista de convidados...
                    </td>
                  </tr>
                ) : filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-light">
                      Nenhum convidado encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => {
                    const isInviteSent = Number(guest.invite_sent) === 1;

                    return (
                      <tr
                        key={guest.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Nome */}
                        <td className="py-4 px-4 md:px-6 font-semibold text-slate-900">
                          {guest.name}
                        </td>

                        {/* Telefone */}
                        <td className="py-4 px-4 text-slate-600">
                          {guest.phone ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{guest.phone}</span>
                              <a
                                href={`https://api.whatsapp.com/send?phone=55${guest.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Abrir conversa no WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Não informado</span>
                          )}
                        </td>

                        {/* Check Mark Convite Enviado */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() =>
                              handleUpdateGuest(guest.id, { invite_sent: !isInviteSent })
                            }
                            className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 transition-transform active:scale-95"
                            title={isInviteSent ? 'Marcar como NÃO enviado' : 'Marcar como ENVIADO'}
                          >
                            {isInviteSent ? (
                              <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-bold">
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                <span>Sim</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-xs font-medium">
                                <Square className="w-4 h-4 text-slate-400" />
                                <span>Não</span>
                              </div>
                            )}
                          </button>
                        </td>

                        {/* Dropdown Resposta */}
                        <td className="py-4 px-4">
                          <div className="relative">
                            <select
                              value={guest.status}
                              onChange={(e) =>
                                handleUpdateGuest(guest.id, { status: e.target.value })
                              }
                              className={`w-full max-w-[200px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer ${
                                guest.status === 'confirmou'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : guest.status === 'negou'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="ainda nao respondeu">ainda nao respondeu</option>
                              <option value="confirmou">confirmou</option>
                              <option value="negou">negou</option>
                            </select>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(guest)}
                              className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-xl transition-colors"
                              title="Editar convidado"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Remover convidado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé da tabela */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500 text-center">
            Exibindo <strong>{filteredGuests.length}</strong> de <strong>{totalCount}</strong> convidado(s) cadastrado(s).
          </div>
        </div>

      </div>

      {/* MODAL DE EDIÇÃO DE CONVIDADO */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-cyan-100 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-teal-600" />
                <h3 className="text-xl font-serif font-bold text-slate-800">
                  Editar Convidado
                </h3>
              </div>
              <button
                onClick={() => setEditingGuest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Nome do Convidado <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest.name}
                  onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Número de Telefone
                </label>
                <input
                  type="text"
                  placeholder="(71) 99999-8888"
                  value={editingGuest.phone}
                  onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={editingGuest.invite_sent}
                    onChange={(e) => setEditingGuest({ ...editingGuest, invite_sent: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 accent-teal-600"
                  />
                  <span>Convite Enviado</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Resposta do Convidado
                </label>
                <select
                  value={editingGuest.status}
                  onChange={(e) => setEditingGuest({ ...editingGuest, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm bg-white font-medium"
                >
                  <option value="ainda nao respondeu">ainda nao respondeu</option>
                  <option value="confirmou">confirmou</option>
                  <option value="negou">negou</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
