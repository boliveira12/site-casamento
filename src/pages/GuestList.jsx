import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Pencil,
  Save,
  X,
  Search,
  CheckSquare,
  Square,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function GuestList() {
  const { logout } = useAdmin();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');

  // Modal State para edição de convidado
  const [editingGuest, setEditingGuest] = useState(null);

  // Form State para inclusão
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [groupName, setGroupName] = useState('');
  const [keepGroup, setKeepGroup] = useState(true);
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

  // Lista de grupos / famílias únicos existentes
  const existingGroups = Array.from(
    new Set(guests.map((g) => g.group_name?.trim()).filter(Boolean))
  ).sort();

  // Adicionar convidado
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setFeedback({ type: null, text: '' });

    const trimmedGroup = groupName.trim() || null;

    try {
      const res = await fetch('/api/guest-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          invite_sent: inviteSent,
          status,
          group_name: trimmedGroup
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          text: trimmedGroup
            ? `Convidado adicionado com sucesso à ${trimmedGroup}!`
            : 'Convidado adicionado com sucesso!'
        });
        setName('');
        setPhone('');
        setInviteSent(false);
        setStatus('ainda nao respondeu');
        if (!keepGroup) {
          setGroupName('');
        }
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

  // Atualizar campo individual (invite_sent, status, group_name)
  const handleUpdateGuest = async (id, fieldsToUpdate) => {
    try {
      const currentGuest = guests.find((g) => g.id === id);
      const targetGroup =
        fieldsToUpdate.group_name !== undefined
          ? fieldsToUpdate.group_name
          : currentGuest?.group_name;

      // Atualização otimista na interface local
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            return { ...g, ...fieldsToUpdate };
          }
          // Se estamos atualizando o status e o convidado pertence a um grupo,
          // replica o novo status para todos os familiares do grupo!
          if (
            fieldsToUpdate.status !== undefined &&
            targetGroup &&
            g.group_name &&
            g.group_name.trim().toLowerCase() === targetGroup.trim().toLowerCase()
          ) {
            return { ...g, status: fieldsToUpdate.status };
          }
          return g;
        })
      );

      if (fieldsToUpdate.status !== undefined && targetGroup) {
        setFeedback({
          type: 'success',
          text: `Status atualizado para todos os integrantes de "${targetGroup}"!`
        });
      }

      const res = await fetch(`/api/guest-list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsToUpdate)
      });

      if (!res.ok) {
        // Se falhar, reverte
        fetchGuests();
      } else {
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
      status: guest.status || 'ainda nao respondeu',
      group_name: guest.group_name || '',
      has_plus_one: Boolean(guest.has_plus_one),
      plus_one_name: guest.plus_one_name || ''
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
        status: editingGuest.status,
        group_name: editingGuest.group_name ? editingGuest.group_name.trim() : null,
        has_plus_one: editingGuest.has_plus_one,
        plus_one_name: editingGuest.has_plus_one && editingGuest.plus_one_name ? editingGuest.plus_one_name.trim() : null
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
      (guest.phone && guest.phone.includes(searchTerm)) ||
      (guest.group_name && guest.group_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'invite_sent'
          ? Number(guest.invite_sent) === 1
          : filterStatus === 'invite_pending'
            ? Number(guest.invite_sent) === 0
            : guest.status === filterStatus;

    const matchesGroup =
      filterGroup === 'all'
        ? true
        : filterGroup === '__with_group'
          ? Boolean(guest.group_name)
          : filterGroup === '__without_group'
            ? !guest.group_name
            : guest.group_name === filterGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  // Estatísticas calculadas
  const totalCount = guests.length;
  const groupsCount = existingGroups.length;
  const guestsWithGroupCount = guests.filter((g) => Boolean(g.group_name)).length;
  const invitesSentCount = guests.filter((g) => Number(g.invite_sent) === 1).length;
  const confirmedCount = guests.filter((g) => g.status === 'Confirmado' || g.status === 'Confirmado').length;
  const declinedCount = guests.filter((g) => g.status === 'Negado' || g.status === 'Negado').length;
  const pendingCount = guests.filter((g) => g.status === 'Pendente' || g.status === 'Sem Resposta').length;

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
            Controle o envio dos convites, organize famílias e acompanhe a confirmação de presença.
          </p>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da área admin
          </button>
        </div>

        {/* Cards de Métricas / Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-100/80 shadow-xs text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Convidados</span>
            <span className="text-2xl font-serif font-bold text-slate-800">{totalCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-100/80 shadow-xs text-center">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Famílias / Grupos</span>
            <span className="text-2xl font-serif font-bold text-indigo-700">{groupsCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-100/80 shadow-xs text-center">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">Convite Enviado</span>
            <span className="text-2xl font-serif font-bold text-teal-700">{invitesSentCount} / {totalCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100/80 shadow-xs text-center">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Confirmou</span>
            <span className="text-2xl font-serif font-bold text-emerald-700">{confirmedCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-rose-100/80 shadow-xs text-center">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">Negou</span>
            <span className="text-2xl font-serif font-bold text-rose-700">{declinedCount}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-amber-100/80 shadow-xs text-center">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Pendente</span>
            <span className="text-2xl font-serif font-bold text-amber-700">{pendingCount}</span>
          </div>
        </div>

        {/* Form para Inserir Novo Convidado */}
        <div className="bg-white/90 p-6 md:p-8 rounded-3xl border border-cyan-100/90 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-50">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-serif font-bold text-slate-800">Novo Convidado</h2>
            </div>
            {groupName.trim() && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Vinculando a: <strong>{groupName.trim()}</strong></span>
              </span>
            )}
          </div>

          {feedback.text && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs font-semibold ${feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Datalist de sugestão para grupos existentes */}
          <datalist id="existing-groups-list">
            {existingGroups.map((grp) => (
              <option key={grp} value={grp} />
            ))}
          </datalist>

          <form onSubmit={handleAddGuest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

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

              {/* Grupo / Família */}
              <div className="md:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Grupo / Família
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-indigo-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepGroup}
                      onChange={(e) => setKeepGroup(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <span>Manter para o próximo</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    list="existing-groups-list"
                    placeholder="Ex: Família Silva, Padrinhos..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm bg-indigo-50/20 font-medium text-slate-800"
                  />
                  {groupName && (
                    <button
                      type="button"
                      onClick={() => setGroupName('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                      title="Limpar grupo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-light">
                  Membros da mesma família confirmam presença conjuntamente.
                </p>
              </div>

              {/* Número de Telefone */}
              <div className="md:col-span-4 space-y-1.5">
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

            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">

              {/* Dropdown Resposta */}
              <div className="md:col-span-4 space-y-1.5">
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

              {/* Check Mark Convite Enviado */}
              <div className="md:col-span-4 flex items-center md:pt-5">
                <label className="flex items-center gap-2.5 cursor-pointer selection:bg-none text-sm text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={inviteSent}
                    onChange={(e) => setInviteSent(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 accent-teal-600"
                  />
                  <span>Convite Já Enviado</span>
                </label>
              </div>

              {/* Botão Adicionar */}
              <div className="md:col-span-4 flex justify-end md:pt-5">
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Adicionar Convidado</span>
                </button>
              </div>

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
                placeholder="Buscar por nome, família ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">

              {/* Filtro por Família/Grupo */}
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-white text-indigo-900 border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
              >
                <option value="all">Todas as Famílias ({totalCount})</option>
                <option value="__with_group">Com Família ({guestsWithGroupCount})</option>
                <option value="__without_group">Sem Família ({totalCount - guestsWithGroupCount})</option>
                {existingGroups.map((grp) => {
                  const count = guests.filter((g) => g.group_name === grp).length;
                  return (
                    <option key={grp} value={grp}>
                      {grp} ({count})
                    </option>
                  );
                })}
              </select>

              {/* Botões de Filtro de Status */}
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${filterStatus === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                Todos ({totalCount})
              </button>
              <button
                onClick={() => setFilterStatus('ainda nao respondeu')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${filterStatus === 'ainda nao respondeu'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                  }`}
              >
                Pendente ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('confirmou')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${filterStatus === 'confirmou'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
              >
                Confirmou ({confirmedCount})
              </button>
              <button
                onClick={() => setFilterStatus('negou')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${filterStatus === 'negou'
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
                  <th className="py-3.5 px-4">Grupo / Família</th>
                  <th className="py-3.5 px-4">Número de Telefone</th>
                  <th className="py-3.5 px-4 text-center">Convite Enviado?</th>
                  <th className="py-3.5 px-4">Resposta (Sincroniza Família)</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Carregando lista de convidados...
                    </td>
                  </tr>
                ) : filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-light">
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
                        <td className="py-4 px-4 md:px-6">
                          <div className="font-semibold text-slate-900">{guest.name}</div>
                          {Boolean(guest.has_plus_one) && guest.plus_one_name && (
                            <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-800">
                                +1
                              </span>
                              <span>Acompanhante: {guest.plus_one_name}</span>
                            </div>
                          )}
                        </td>

                        {/* Grupo / Família */}
                        <td className="py-4 px-4">
                          {guest.group_name ? (
                            <button
                              type="button"
                              onClick={() => setFilterGroup(guest.group_name)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 hover:bg-indigo-100 transition-colors cursor-pointer group"
                              title={`Filtrar apenas convidados de ${guest.group_name}`}
                            >
                              <Users className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                              <span>{guest.group_name}</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Individual</span>
                          )}
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
                              title={
                                guest.group_name
                                  ? `Ao alterar, confirma ou nega toda a família (${guest.group_name})`
                                  : 'Alterar status'
                              }
                              className={`w-full max-w-[200px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer ${guest.status === 'confirmou' || guest.status === 'Confirmado'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : guest.status === 'negou' || guest.status === 'Negado'
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
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              Exibindo <strong>{filteredGuests.length}</strong> de <strong>{totalCount}</strong> convidado(s) cadastrado(s).
            </div>
            {filterGroup !== 'all' && (
              <button
                onClick={() => setFilterGroup('all')}
                className="text-indigo-600 hover:underline font-semibold"
              >
                Limpar filtro de grupo ({filterGroup})
              </button>
            )}
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
                  Grupo / Família
                </label>
                <input
                  type="text"
                  list="existing-groups-list"
                  placeholder="Ex: Família Silva"
                  value={editingGuest.group_name || ''}
                  onChange={(e) => setEditingGuest({ ...editingGuest, group_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm bg-indigo-50/20 font-medium text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-light">
                  Se preenchido, a confirmação deste convidado confirmará todos os membros do grupo.
                </p>
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

              {/* Seção Acompanhante (+1) */}
              <div className="p-3.5 rounded-xl border border-cyan-100 bg-sky-50/40 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={editingGuest.has_plus_one}
                    onChange={(e) =>
                      setEditingGuest({
                        ...editingGuest,
                        has_plus_one: e.target.checked,
                        plus_one_name: e.target.checked ? editingGuest.plus_one_name : ''
                      })
                    }
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 accent-teal-600"
                  />
                  <span>Possui Acompanhante (+1)</span>
                </label>

                {editingGuest.has_plus_one && (
                  <div className="pl-6 space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                      Nome do Acompanhante
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Nome do acompanhante"
                      value={editingGuest.plus_one_name}
                      onChange={(e) =>
                        setEditingGuest({ ...editingGuest, plus_one_name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm bg-white"
                    />
                  </div>
                )}
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
