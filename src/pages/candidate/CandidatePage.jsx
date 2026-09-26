import { useState } from 'react';
import {
  Search,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Pencil,
  X,
  Lock,
  UserPlus,
} from 'lucide-react';
import { TopBar } from '../../components/TopBar';
import { PageBackdrop } from '../../components/PageBackdrop';
// Dados de exemplo — cadastro visível para todos os perfis
// (Funcionário, Aprovador, Suporte e Gestor) que acessarem o Perfil.
// Edição: apenas o Gestor pode editar qualquer ficha; os demais perfis
// só podem editar a própria ficha (quando o e-mail logado corresponde).
const INITIAL_CANDIDATES = [
  {
    id: 1,
    fullName: 'Ana Carolina Ferreira Lima',
    age: 24,
    photoInitials: 'AC',
    email: 'ana.lima@exemplo.com',
    phone: '(19) 99876-5432',
    city: 'Campinas, SP',
    workArea: 'Tecnologia da Informação',
    registrationDate: '10/08/2026',
  },
  {
    id: 2,
    fullName: 'Bruno Henrique Souza Martins',
    age: 29,
    photoInitials: 'BH',
    email: 'bruno.martins@exemplo.com',
    phone: '(19) 98765-1234',
    city: 'Indaiatuba, SP',
    workArea: 'Administração',
    registrationDate: '05/08/2026',
  },
  {
    id: 3,
    fullName: 'Camila Rodrigues Alves',
    age: 21,
    photoInitials: 'CR',
    email: 'camila.alves@exemplo.com',
    phone: '(19) 99123-4567',
    city: 'Salto, SP',
    workArea: 'Engenharia de Software',
    registrationDate: '28/07/2026',
  },
  {
    id: 4,
    fullName: 'Diego Fernandes Costa',
    age: 33,
    photoInitials: 'DF',
    email: 'diego.costa@exemplo.com',
    phone: '(19) 99555-8899',
    city: 'Itu, SP',
    workArea: 'Manutenção e Infraestrutura',
    registrationDate: '20/07/2026',
  },
];
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

// Gera uma cor de avatar consistente a partir do nome, deixando a lista
// de candidatos mais colorida (mesma paleta usada nos cards da Home).
const AVATAR_GRADIENTS = [
  'from-purple-500 to-fuchsia-500',
  'from-sky-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
];
function avatarGradientFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}
export function CandidatePage({
  onBack,
  userEmail,
  onLogout,
  userType,
  onUserTypeChange,
  onNavigate,
}) {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(
    INITIAL_CANDIDATES[0]?.id ?? null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isNewCandidate, setIsNewCandidate] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const filtered = candidates.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  // Apenas o Gestor pode cadastrar novos perfis.
  const canCreate = userType === 'gestor';

  // Regra de permissão: o Gestor pode editar qualquer ficha;
  // os demais perfis só podem editar a própria ficha (mesmo e-mail logado).
  const canEdit = (candidate) =>
    userType === 'gestor' ||
    candidate.email.toLowerCase() === userEmail.toLowerCase();
  const openEdit = (candidate) => {
    setIsNewCandidate(false);
    setEditForm({
      ...candidate,
    });
    setIsEditing(true);
  };
  const openCreate = () => {
    setIsNewCandidate(true);
    setEditForm({
      id: Date.now(),
      fullName: '',
      age: 18,
      photoInitials: '',
      email: '',
      phone: '',
      city: '',
      workArea: '',
      registrationDate: new Date().toLocaleDateString('pt-BR'),
    });
    setIsEditing(true);
  };
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm) return;
    const saved = {
      ...editForm,
      photoInitials: getInitials(editForm.fullName) || editForm.photoInitials,
    };
    if (isNewCandidate) {
      setCandidates((prev) => [saved, ...prev]);
      setSelectedId(saved.id);
    } else {
      setCandidates((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    }
    setIsEditing(false);
    setEditForm(null);
    setIsNewCandidate(false);
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 via-white to-purple-50/40">
      <PageBackdrop />
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f2e9f6] to-[#f8ecf1] shadow-sm border-b border-[#e3d5e6]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-black/10" />
            <div className="hidden md:flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-purple-500 opacity-40 blur-md"
                />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-50 shadow-inner">
                  <User className="w-4 h-4 text-purple-700" />
                </span>
              </span>
              <h1 className="text-lg font-bold text-gray-900">Perfil</h1>
            </div>
          </div>

          <TopBar
            userEmail={userEmail}
            onLogout={onLogout}
            userType={userType}
            onUserTypeChange={onUserTypeChange}
            onNavigate={onNavigate}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Lista de candidatos */}
          <div
            className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${selected ? 'hidden lg:block' : ''}`}
          >
            <div className="p-3 border-b border-gray-200 space-y-2">
              {canCreate && (
                <button
                  onClick={openCreate}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Novo perfil
                </button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar candidato..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  Nenhum candidato encontrado.
                </div>
              ) : (
                filtered.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedId(candidate.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-l-4 ${selectedId === candidate.id ? 'bg-purple-50 border-purple-500' : 'border-transparent'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradientFor(candidate.fullName)} text-white flex items-center justify-center font-semibold shrink-0 shadow-sm`}
                    >
                      {candidate.photoInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {candidate.fullName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {candidate.workArea}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Ficha detalhada */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                <User className="w-10 h-10 mb-3" />
                <p className="text-sm">
                  Selecione um candidato para visualizar
                </p>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="lg:hidden flex items-center gap-2 text-sm text-gray-600 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para a lista
                </button>

                {/* Cabeçalho da ficha */}
                <div className="flex items-start justify-between gap-4 pb-6 mb-6 border-b border-gray-100">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-lg"
                      />
                      <div
                        className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradientFor(selected.fullName)} text-white flex items-center justify-center font-bold text-xl shadow-sm`}
                      >
                        {selected.photoInitials}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selected.fullName}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {selected.age} anos · {selected.city}
                      </p>
                    </div>
                  </div>

                  {canEdit(selected) ? (
                    <button
                      onClick={() => openEdit(selected)}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all shrink-0"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  ) : (
                    <div
                      title="Apenas o Gestor ou o próprio usuário podem editar este perfil"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-400 text-sm font-medium rounded-lg shrink-0"
                    >
                      <Lock className="w-4 h-4" />
                      <span className="hidden sm:inline">Somente leitura</span>
                    </div>
                  )}
                </div>

                {/* Dados pessoais */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Dados pessoais
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow
                      icon={Calendar}
                      label="Idade"
                      value={`${selected.age} anos`}
                      color="purple"
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Cidade"
                      value={selected.city}
                      color="sky"
                    />
                    <InfoRow
                      icon={Mail}
                      label="E-mail"
                      value={selected.email}
                      color="rose"
                    />
                    <InfoRow
                      icon={Phone}
                      label="Telefone"
                      value={selected.phone}
                      color="emerald"
                    />
                  </div>
                </div>

                {/* Atuações */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Atuações
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow
                      icon={Briefcase}
                      label="Área de atuação"
                      value={selected.workArea}
                      color="amber"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edição do perfil */}
      {isEditing && editForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">
                {isNewCandidate ? 'Novo perfil' : 'Editar perfil'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsNewCandidate(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="p-5 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo" full>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    required
                  />
                </Field>

                <Field label="Idade">
                  <input
                    type="number"
                    min={0}
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        age: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    required
                  />
                </Field>

                <Field label="Cidade">
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                  />
                </Field>

                <Field label="E-mail">
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    required
                  />
                </Field>

                <Field label="Telefone">
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                  />
                </Field>

                <Field label="Área de atuação" full>
                  <input
                    type="text"
                    value={editForm.workArea}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        workArea: e.target.value,
                      })
                    }
                    placeholder="Ex: Tecnologia da Informação"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsNewCandidate(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all"
                >
                  {isNewCandidate ? 'Cadastrar perfil' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
const INFO_ROW_COLORS = {
  purple: 'bg-gradient-to-br from-purple-100 to-fuchsia-50 text-purple-700',
  sky: 'bg-gradient-to-br from-sky-100 to-blue-50 text-sky-700',
  rose: 'bg-gradient-to-br from-rose-100 to-pink-50 text-rose-700',
  emerald: 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700',
  amber: 'bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700',
};
function InfoRow({ icon: Icon, label, value, color = 'purple' }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-inner ${INFO_ROW_COLORS[color]}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm font-medium text-gray-800 break-words">
          {value}
        </div>
      </div>
    </div>
  );
}
function Field({ label, full, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
