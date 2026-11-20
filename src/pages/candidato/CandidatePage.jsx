import { useState, useEffect, useContext, useCallback } from 'react';
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
  Sun,
  Moon,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTema } from '../../utils/useTema';
import { AuthContext } from '../../contexts/AuthContext';
import { ehGestor, rotaDoPerfil } from '../../utils/perfis';
import { candidatoService } from '../../shared/services/candidatoService';


function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

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

export default function CandidatePage() {
  const navigate = useNavigate();
  // Todas as contas veem os candidatos; só o gestor cria e edita
  const { perfil } = useContext(AuthContext);
  // Mesmo tema (claro/escuro) das outras páginas, salvo no navegador
  const [tema, alternarTema] = useTema();
  const podeEditar = ehGestor(perfil);
  
  // Os candidatos vêm do back (GET /api/candidatos)
  const [candidates, setCandidates] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const carregarCandidatos = useCallback(async () => {
    setCarregando(true);
    setErroLista('');
    try {
      const lista = await candidatoService.listar();
      setCandidates(lista);
      // Mantém a seleção se o candidato ainda existir; senão seleciona o primeiro
      setSelectedId((atual) =>
        lista.some((c) => c.id === atual) ? atual : (lista[0]?.id ?? null),
      );
    } catch (err) {
      console.error('Erro ao carregar candidatos', err);
      setErroLista('Não foi possível carregar os candidatos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarCandidatos();
  }, [carregarCandidatos]);

  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isNewCandidate, setIsNewCandidate] = useState(false);
  const [editForm, setEditForm] = useState(null);
  
  const filtered = candidates.filter((c) =>
    (c.fullName ?? '').toLowerCase().includes(search.toLowerCase()),
  );
  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  const canCreate = podeEditar;
  const canEdit = () => podeEditar;

  const openEdit = (candidate) => {
    setIsNewCandidate(false);
    setErroForm('');
    setEditForm({
      ...candidate,
      age: candidate.age ?? 18,
      email: candidate.email ?? '',
      phone: candidate.phone ?? '',
      city: candidate.city ?? '',
      workArea: candidate.workArea ?? '',
    });
    setIsEditing(true);
  };

  const openCreate = () => {
    setIsNewCandidate(true);
    setErroForm('');
    setEditForm({
      id: null, // o back gera o id
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

  const fecharModal = () => {
    if (salvando) return;
    setIsEditing(false);
    setIsNewCandidate(false);
    setEditForm(null);
    setErroForm('');
  };

  // Mensagem que o back mandou (ResponseStatusException) ou um texto padrão
  const mensagemDeErro = (err, padrao) => {
    const status = err?.response?.status;
    if (status === 403) return 'Apenas o Gestor pode alterar candidatos.';
    const dados = err?.response?.data;
    return (typeof dados === 'object' && (dados?.message || dados?.mensagem)) || padrao;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm || salvando) return;
    setSalvando(true);
    setErroForm('');
    try {
      if (isNewCandidate) {
        const criado = await candidatoService.criar(editForm);
        setCandidates((prev) => [criado, ...prev]);
        setSelectedId(criado.id);
      } else {
        const atualizado = await candidatoService.atualizar(editForm.id, editForm);
        setCandidates((prev) => prev.map((c) => (c.id === atualizado.id ? atualizado : c)));
      }
      setIsEditing(false);
      setEditForm(null);
      setIsNewCandidate(false);
    } catch (err) {
      console.error('Erro ao salvar candidato', err);
      setErroForm(mensagemDeErro(err, 'Não foi possível salvar o candidato.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    if (!editForm?.id || salvando) return;
    if (!window.confirm(`Excluir o perfil de ${editForm.fullName}? Essa ação não pode ser desfeita.`)) return;
    setSalvando(true);
    setErroForm('');
    try {
      await candidatoService.deletar(editForm.id);
      const restantes = candidates.filter((c) => c.id !== editForm.id);
      setCandidates(restantes);
      setSelectedId(restantes[0]?.id ?? null);
      setIsEditing(false);
      setEditForm(null);
    } catch (err) {
      console.error('Erro ao excluir candidato', err);
      setErroForm(mensagemDeErro(err, 'Não foi possível excluir o candidato.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={tema === 'dark' ? 'dark' : ''}>
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-gray-50 via-white to-purple-50 dark:bg-none dark:bg-[#0c0a12] text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-linear-to-r from-[#f2e9f6] to-[#f8ecf1] dark:bg-none dark:bg-[#14141b] shadow-sm border-b border-[#e3d5e6] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(rotaDoPerfil(perfil))}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-700 dark:text-gray-300 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-black/10 dark:bg-white/10" />
            <div className="hidden md:flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-purple-500 opacity-40 blur-md"
                />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-fuchsia-50 dark:from-purple-900/60 dark:to-fuchsia-900/40 shadow-inner">
                  <User className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                </span>
              </span>
              <h1 className="text-lg font-bold text-gray-900">Perfil</h1>
            </div>
          </div>

          <button
            onClick={alternarTema}
            title="Alternar tema"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          >
            {tema === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-linear-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all"
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

            <div className="divide-y divide-gray-100 dark:divide-white/10 max-h-[70vh] overflow-y-auto">
              {carregando ? (
                <div className="p-8 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando candidatos...
                </div>
              ) : erroLista ? (
                <div className="p-8 text-center text-sm text-red-500 space-y-3">
                  <p>{erroLista}</p>
                  <button
                    onClick={carregarCandidatos}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Tentar de novo
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  Nenhum candidato encontrado.
                </div>
              ) : (
                filtered.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedId(candidate.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-l-4 ${selectedId === candidate.id ? 'bg-purple-50 border-purple-500 dark:bg-purple-500/15' : 'border-transparent'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-linear-to-br ${avatarGradientFor(candidate.fullName)} text-white flex items-center justify-center font-semibold shrink-0 shadow-sm`}
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
                        className={`relative w-16 h-16 rounded-full bg-linear-to-br ${avatarGradientFor(selected.fullName)} text-white flex items-center justify-center font-bold text-xl shadow-sm`}
                      >
                        {selected.photoInitials}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selected.fullName}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {[selected.age != null ? `${selected.age} anos` : null, selected.city]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>

                  {canEdit(selected) ? (
                    <button
                      onClick={() => openEdit(selected)}
                      className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all shrink-0"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  ) : (
                    <div
                      title="Apenas o Gestor pode editar este perfil"
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
                      value={selected.age != null ? `${selected.age} anos` : '—'}
                      color="purple"
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Cidade"
                      value={selected.city || '—'}
                      color="sky"
                    />
                    <InfoRow
                      icon={Mail}
                      label="E-mail"
                      value={selected.email || '—'}
                      color="rose"
                    />
                    <InfoRow
                      icon={Phone}
                      label="Telefone"
                      value={selected.phone || '—'}
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
                      icon={Calendar}
                      label="Data de cadastro"
                      value={selected.registrationDate || '—'}
                      color="sky"
                    />
                    <InfoRow
                      icon={Briefcase}
                      label="Área de atuação"
                      value={selected.workArea || '—'}
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
                onClick={fecharModal}
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
                    min={14}
                    max={120}
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        age: e.target.value === '' ? '' : Number(e.target.value),
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

              {erroForm && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
                  {erroForm}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                {!isNewCandidate && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={salvando}
                    className="mr-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                )}
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="disabled:opacity-60 px-4 py-2 bg-linear-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all"
                >
                  {salvando ? 'Salvando...' : isNewCandidate ? 'Cadastrar perfil' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

const INFO_ROW_COLORS = {
  purple: 'bg-linear-to-br from-purple-100 to-fuchsia-50 text-purple-700 dark:from-purple-900/50 dark:to-fuchsia-900/30 dark:text-purple-300',
  sky: 'bg-linear-to-br from-sky-100 to-blue-50 text-sky-700 dark:from-sky-900/50 dark:to-blue-900/30 dark:text-sky-300',
  rose: 'bg-linear-to-br from-rose-100 to-pink-50 text-rose-700 dark:from-rose-900/50 dark:to-pink-900/30 dark:text-rose-300',
  emerald: 'bg-linear-to-br from-emerald-100 to-teal-50 text-emerald-700 dark:from-emerald-900/50 dark:to-teal-900/30 dark:text-emerald-300',
  amber: 'bg-linear-to-br from-amber-100 to-orange-50 text-amber-700 dark:from-amber-900/50 dark:to-orange-900/30 dark:text-amber-300',
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