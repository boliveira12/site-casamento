import React, { useState, useEffect } from 'react';
import { Waves, CheckCircle2, AlertCircle, Send, ShieldCheck, Lock, KeyRound, Search, X, Users } from 'lucide-react';

export function Rsvp() {
  const [formData, setFormData] = useState({
    guestListId: '',
    name: '',
    phone: '',
    attending: true,
    message: ''
  });

  const [guestListOptions, setGuestListOptions] = useState([]);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phoneDigitsInput, setPhoneDigitsInput] = useState('');
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const loadGuests = () => {
    fetch('/api/guests')
      .then((res) => res.json())
      .then((data) => {
        if (data.guests) {
          setGuests(data.guests);
        }
      })
      .catch(() => { });
  };

  const loadGuestList = () => {
    fetch('/api/guest-list')
      .then((res) => res.json())
      .then((data) => {
        if (data.guests) {
          setGuestListOptions(data.guests);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    loadGuests();
    loadGuestList();
  }, []);

  const normalizeStatus = (str) =>
    str ? str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

  const isPending = (statusStr) => {
    if (!statusStr) return true;
    const s = normalizeStatus(statusStr);
    return s === 'pendente' || s === 'ainda nao respondeu' || s === 'sem resposta';
  };

  const isGuestAlreadyAnswered = (g) => {
    if (!g) return false;
    if (!isPending(g.status)) {
      return true;
    }
    if (g.group_name && g.group_name.trim()) {
      const groupNameNorm = g.group_name.trim().toLowerCase();
      const hasAnsweredMember = guestListOptions.some((m) => {
        if (!m.group_name) return false;
        if (m.group_name.trim().toLowerCase() !== groupNameNorm) return false;
        return !isPending(m.status);
      });
      if (hasAnsweredMember) return true;
    }
    return false;
  };

  const isSelectedGuestAnswered = isGuestAlreadyAnswered(selectedGuest);

  const selectGuest = (g) => {
    setSelectedGuest(g);
    setNameInput(g.name);
    setPhoneDigitsInput('');
    setShowSuggestions(false);
    setStatus({ loading: false, success: null, error: null });

    setFormData((prev) => ({
      ...prev,
      guestListId: g.id,
      name: g.name,
      phone: g.phone || prev.phone,
      attending: g.status === 'negou' ? false : true,
    }));
  };

  // Membros da família/grupo vinculados ao convidado selecionado
  const familyMembers = selectedGuest && selectedGuest.group_name
    ? guestListOptions.filter(
      (g) =>
        g.group_name &&
        g.group_name.trim().toLowerCase() === selectedGuest.group_name.trim().toLowerCase()
    )
    : [];

  // Filtragem dos convidados para sugestão
  const matchingGuests = nameInput.trim()
    ? guestListOptions.filter((g) =>
      g.name.toLowerCase().includes(nameInput.trim().toLowerCase())
    )
    : [];

  // Lógica de verificação dos 4 últimos dígitos do telefone
  const getExpectedLast4 = (phoneStr) => {
    if (!phoneStr) return null;
    const clean = phoneStr.replace(/\D/g, '');
    if (clean.length < 4) return null;
    return clean.slice(-4);
  };

  const expectedLast4 = selectedGuest ? getExpectedLast4(selectedGuest.phone) : null;

  const hasRegisteredPhone = Boolean(expectedLast4);
  const isPhoneConfirmed = selectedGuest
    ? hasRegisteredPhone
      ? phoneDigitsInput.trim() === expectedLast4
      : formData.phone && formData.phone.replace(/\D/g, '').length >= 8
    : false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGuest || !formData.name) {
      setStatus({ loading: false, success: null, error: 'Por favor, busque e selecione seu nome na lista.' });
      return;
    }

    if (isSelectedGuestAnswered) {
      return;
    }

    if (!isPhoneConfirmed) {
      setStatus({
        loading: false,
        success: null,
        error: 'Confirme os 4 últimos dígitos do seu telefone para registrar sua presença.'
      });
      return;
    }

    setStatus({ loading: true, success: null, error: null });

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        const successMsg = data.groupMembers && data.groupMembers.length > 1
          ? `Presença de toda a família (${data.groupName}) registrada com sucesso! Integrantes: ${data.groupMembers.join(', ')}.`
          : (data.message || 'Sua presença foi registrada com sucesso! Mal podemos esperar para nos ver na praia.');

        setStatus({
          loading: false,
          success: successMsg,
          error: null
        });
        setFormData({
          guestListId: '',
          name: '',
          phone: '',
          attending: true,
          message: ''
        });
        setSelectedGuest(null);
        setNameInput('');
        setPhoneDigitsInput('');
        loadGuests();
        loadGuestList();
      } else {
        setStatus({ loading: false, success: null, error: data.error || 'Erro ao salvar.' });
      }
    } catch (err) {
      setStatus({ loading: false, success: null, error: 'Servidor indisponível.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-amber-50/40 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold uppercase tracking-widest shadow-2xs">
            <Waves className="w-4 h-4 text-teal-600" />
            <span>Pé na Areia · Vilas do Atlântico</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
            Confirmar Presença (RSVP)
          </h1>

          <p className="text-slate-600 text-sm md:text-base font-light">
            Por favor, confirme sua presença até <strong>28 de Setembro de 2026</strong> para prepararmos cada detalhe à beira-mar com muito carinho.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 p-8 md:p-10 rounded-3xl border border-cyan-100/80 shadow-lg backdrop-blur-md">
          {status.success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Confirmação Recebida!</strong>
                <span>{status.success}</span>
              </div>
            </div>
          )}

          {status.error && status.error !== 'Esse convite já foi respondido por você ou alguém da sua família.' && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-900 border border-rose-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Atenção</strong>
                <span>{status.error}</span>
              </div>
            </div>
          )}

          {/* Backdrop para fechar a caixa de sugestões quando clicar fora */}
          {showSuggestions && nameInput.trim().length > 0 && !selectedGuest && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSuggestions(false)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-20">

            {/* Campo de Busca Escrita do Nome do Convidado */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Digite seu Nome <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Digite seu nome para buscar..."
                  value={nameInput}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNameInput(val);
                    setShowSuggestions(true);
                    setPhoneDigitsInput('');

                    if (selectedGuest && val.trim().toLowerCase() !== selectedGuest.name.toLowerCase()) {
                      setSelectedGuest(null);
                      setFormData((prev) => ({ ...prev, guestListId: '', name: val }));
                    }

                    // Verifica se há correspondência exata por texto
                    const exactMatch = guestListOptions.find(
                      (g) => g.name.toLowerCase() === val.trim().toLowerCase()
                    );
                    if (exactMatch) {
                      selectGuest(exactMatch);
                    }
                  }}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition text-sm text-slate-800 font-medium ${selectedGuest
                    ? 'border-emerald-400 focus:ring-emerald-500 bg-emerald-50/30'
                    : 'border-slate-200 focus:ring-teal-500'
                    }`}
                />

                {nameInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput('');
                      setSelectedGuest(null);
                      setPhoneDigitsInput('');
                      setFormData((prev) => ({ ...prev, guestListId: '', name: '' }));
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="Limpar nome"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown de Sugestões de Busca */}
              {showSuggestions && nameInput.trim().length > 0 && !selectedGuest && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-cyan-100 shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {matchingGuests.length > 0 ? (
                    matchingGuests.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => selectGuest(g)}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50/80 transition-colors flex items-center group text-sm cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 group-hover:text-teal-900">
                          {g.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-xs text-slate-500">
                      Nenhum convidado encontrado com esse nome na lista.
                    </div>
                  )}
                </div>
              )}

              {/* Indicator de Seleção */}
              {selectedGuest ? (
                isSelectedGuestAnswered ? (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">
                    Esse convite já foi respondido por você ou alguém da sua família.
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Convidado localizado: <strong>{selectedGuest.name}</strong>
                  </p>
                )
              ) : (
                <p className="text-[11px] text-slate-400 font-normal mt-1.5">
                  Comece a digitar para encontrar seu nome na lista.
                </p>
              )}
            </div>

            {/* Card de Informação da Família / Grupo */}
            {selectedGuest && selectedGuest.group_name && familyMembers.length > 1 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-teal-50/60 border border-indigo-200/80 text-indigo-950 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Grupo Familiar: <span className="text-indigo-700 font-extrabold">{selectedGuest.group_name}</span>
                  </h4>
                </div>
                <p className="text-xs text-indigo-900/90 leading-relaxed">
                  Você está vinculado(a) a um grupo familiar. Ao confirmar a sua presença, todos os <strong>{familyMembers.length} integrantes</strong> da família serão confirmados conjuntamente:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {familyMembers.map((member) => (
                    <span
                      key={member.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${member.id === selectedGuest.id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-white/90 text-indigo-950 border-indigo-200'
                        }`}
                    >
                      <span>{member.name}</span>
                      {member.id === selectedGuest.id && (
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                          Você
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ABA DE CONFIRMAÇÃO DOS 4 ÚLTIMOS DÍGITOS DO TELEFONE */}
            {selectedGuest && !isSelectedGuestAnswered && (
              <div className={`p-5 rounded-2xl border transition-all ${isPhoneConfirmed
                ? 'bg-emerald-50/70 border-emerald-200'
                : phoneDigitsInput.length === 4 && !isPhoneConfirmed
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-teal-50/50 border-teal-200/80'
                }`}>
                <div className="flex items-center gap-2 mb-3">
                  {isPhoneConfirmed ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <KeyRound className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  )}
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirmação de Segurança dos Dados
                  </h3>
                </div>

                  {hasRegisteredPhone ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600">
                        Para confirmar a sua identidade como <strong>{selectedGuest.name}</strong>, digite os <strong>4 últimos dígitos</strong> do número de telefone cadastrado:
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="Ex: 5432"
                          value={phoneDigitsInput}
                          onChange={(e) => setPhoneDigitsInput(e.target.value.replace(/\D/g, ''))}
                          className={`w-36 px-4 py-2.5 rounded-xl border text-center font-mono text-base font-bold tracking-widest focus:outline-none focus:ring-2 bg-white ${isPhoneConfirmed
                            ? 'border-emerald-400 focus:ring-emerald-500 text-emerald-800'
                            : phoneDigitsInput.length === 4 && !isPhoneConfirmed
                              ? 'border-rose-400 focus:ring-rose-500 text-rose-800'
                              : 'border-teal-300 focus:ring-teal-500 text-slate-800'
                            }`}
                        />

                        <div className="text-xs font-semibold">
                          {isPhoneConfirmed ? (
                            <span className="text-emerald-700 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Dígitos validados com sucesso!
                            </span>
                          ) : phoneDigitsInput.length === 4 ? (
                            <span className="text-rose-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                              Dígitos incorretos. Verifique e tente novamente.
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Digite os 4 dígitos e confirme sua identidade.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600">
                        Não há número de telefone registrado para <strong>{selectedGuest.name}</strong> na lista. Por favor, informe seu telefone completo abaixo para confirmar a presença:
                      </p>
                      <input
                        type="text"
                        placeholder="(71) 99999-8888"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-teal-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Telefone registrado
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Preenchido automaticamente..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-600 outline-none cursor-not-allowed font-mono"
                  value={
                    formData.phone
                      ? formData.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-****')
                      : 'Não informado'
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Você irá ao evento?
                </label>
                <select
                  disabled={!isPhoneConfirmed || isSelectedGuestAnswered}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition text-sm text-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  value={formData.attending ? 'yes' : 'no'}
                  onChange={(e) => setFormData({ ...formData, attending: e.target.value === 'yes' })}
                >
                  <option value="yes">Sim! Com certeza estarei na praia 🎉</option>
                  <option value="no">Infelizmente não poderei ir 😢</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Recado para Luiz & Luiza
              </label>
              <textarea
                rows={3}
                disabled={!isPhoneConfirmed || isSelectedGuestAnswered}
                placeholder="Deixe uma mensagem carinhosa para os noivos..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition text-sm text-slate-800 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={status.loading || !isPhoneConfirmed || isSelectedGuestAnswered}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-2xl shadow-lg shadow-teal-500/25 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isPhoneConfirmed && !isSelectedGuestAnswered ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>{status.loading ? 'Confirmando...' : 'Enviar Confirmação de Presença'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirme os 4 últimos dígitos do seu telefone para continuar</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
