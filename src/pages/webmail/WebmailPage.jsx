import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Search,
  Star,
  Paperclip,
  ArrowLeft,
  Inbox,
  Send,
  FileEdit,
  Trash2,
  PenSquare,
  X,
  RotateCcw,
  Mail,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTema } from '../../utils/useTema';
import { AuthContext } from '../../contexts/AuthContext';
import { rotaDoPerfil } from '../../utils/perfis';
import { mensagemService } from '../../shared/services/mensagemService';
import { userService } from '../../shared/services/userService';

// As mensagens vêm do back (/api/mensagens): são trocadas entre as contas cadastradas no HelpTec.
const PASTAS_DO_BACK = ['inbox', 'sent', 'trash'];
const ATUALIZAR_A_CADA_MS = 30000; // busca mensagens novas a cada 30 segundos

// "Hoje, 09:12" / "Ontem, 17:05" / "15/08/2026"
function formatarData(iso) {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  if (data.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
  if (data.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return data.toLocaleDateString('pt-BR');
}

// Mensagem do back -> formato que a tela usa
function paraTela(m, pasta) {
  const corpo = m.corpo ?? '';
  return {
    id: m.id,
    folder: pasta,
    from: m.remetenteEmail,
    fromName: m.remetenteNome || m.remetenteEmail,
    to: m.destinatarioEmail,
    subject: m.assunto,
    preview: corpo.replace(/\s+/g, ' ').slice(0, 80),
    body: corpo,
    date: formatarData(m.dataEnvio),
    read: m.lida,
    starred: m.favorita,
    hasAttachment: false,
  };
}

// Mensagem de erro que o back manda ({ mensagem: "..." }) ou um texto padrão
function mensagemDeErro(err, padrao) {
  return err?.response?.data?.mensagem || padrao;
}

const FOLDERS = [
  { id: 'inbox', label: 'Caixa de entrada', icon: Inbox },
  { id: 'sent', label: 'Enviados', icon: Send },
  { id: 'drafts', label: 'Rascunhos', icon: FileEdit },
  { id: 'trash', label: 'Lixeira', icon: Trash2 },
];

const FOLDER_COLORS = {
  inbox: { activeBg: 'from-purple-100 to-fuchsia-50', icon: 'text-purple-700' },
  sent: { activeBg: 'from-sky-100 to-blue-50', icon: 'text-sky-700' },
  drafts: { activeBg: 'from-amber-100 to-orange-50', icon: 'text-amber-700' },
  trash: { activeBg: 'from-red-100 to-rose-50', icon: 'text-red-700' },
};

const AVATAR_GRADIENTS = [
  'from-purple-500 to-fuchsia-500',
  'from-sky-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
];

function avatarGradientFor(seed) {
  let hash = 0;
  const safeSeed = seed || '?'; 
  for (let i = 0; i < safeSeed.length; i++) {
    hash = (hash * 31 + safeSeed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const EMPTY_MESSAGES = {
  inbox: 'Nenhum e-mail na caixa de entrada.',
  sent: 'Nenhum e-mail enviado ainda.',
  drafts: 'Nenhum rascunho salvo.',
  trash: 'A lixeira está vazia.',
};

export default function WebmailPage() {
  const navigate = useNavigate();
  // Conta logada (vem de /usuarios/me no login): dona da caixa e remetente dos e-mails enviados
  const { perfil, usuario } = useContext(AuthContext);
  // Mesmo tema (claro/escuro) das outras páginas, salvo no navegador
  const [tema, alternarTema] = useTema();
  const userEmail = usuario?.email ?? '';
  const [emails, setEmails] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [contas, setContas] = useState([]); // e-mails cadastrados, para sugerir no "Para"
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeError, setComposeError] = useState('');
  
  // Busca as 3 pastas no back (caixa de entrada, enviados e lixeira)
  const carregarMensagens = useCallback(async () => {
    try {
      const listas = await Promise.all(PASTAS_DO_BACK.map((pasta) => mensagemService.buscar(pasta)));
      setEmails(listas.flatMap((lista, i) => (lista || []).map((m) => paraTela(m, PASTAS_DO_BACK[i]))));
      setErroCarregar('');
    } catch (err) {
      console.error('Erro ao carregar mensagens', err);
      setErroCarregar('Não foi possível carregar as mensagens. Confira se o back-end está rodando.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarMensagens();
    const intervalo = setInterval(carregarMensagens, ATUALIZAR_A_CADA_MS);
    return () => clearInterval(intervalo);
  }, [carregarMensagens]);

  // Contas cadastradas (menos a própria), para sugerir no campo "Para"
  useEffect(() => {
    userService
      .listarTodos()
      .then((lista) => setContas((lista || []).filter((u) => u.email && u.email !== userEmail)))
      .catch(() => setContas([]));
  }, [userEmail]);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;
  
  const filteredEmails = emails
    .filter((email) => email.folder === selectedFolder)
    .filter((email) => {
      const q = search.toLowerCase();
      return (
        email.subject?.toLowerCase().includes(q) ||
        email.fromName?.toLowerCase().includes(q) ||
        email.from?.toLowerCase().includes(q) ||
        (email.to ?? '').toLowerCase().includes(q)
      );
    });
    
  // FUNÇÃO SÊNIOR: Calcula a contagem de qualquer pasta dinamicamente
  const getFolderCount = (folderId) => {
    if (folderId === 'inbox') {
      return emails.filter((e) => e.folder === 'inbox' && !e.read).length;
    }
    return emails.filter((e) => e.folder === folderId).length;
  };
  
  const handleSelectEmail = (id) => {
    setSelectedEmailId(id);
    const email = emails.find((e) => e.id === id);
    if (email && !email.read) {
      setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
      mensagemService.marcarComoLida(id).catch((err) => console.error('Erro ao marcar como lida', err));
    }
  };

  const toggleStar = async (id, e) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((email) => (email.id === id ? { ...email, starred: !email.starred } : email))
    );
    try {
      await mensagemService.alternarFavorita(id);
    } catch (err) {
      console.error('Erro ao favoritar', err);
      carregarMensagens();
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    const email = emails.find((em) => em.id === id);
    if (!email) return;
    try {
      if (email.folder === 'trash') {
        await mensagemService.deletar(id); // apaga de vez (só para você)
      } else {
        await mensagemService.moverParaLixeira(id);
      }
    } catch (err) {
      console.error('Erro ao excluir mensagem', err);
    }
    if (selectedEmailId === id) setSelectedEmailId(null);
    carregarMensagens();
  };

  const handleRestore = async (id, e) => {
    e?.stopPropagation();
    try {
      await mensagemService.restaurar(id);
    } catch (err) {
      console.error('Erro ao restaurar mensagem', err);
    }
    if (selectedEmailId === id) setSelectedEmailId(null);
    carregarMensagens();
  };
  
  const openCompose = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeError('');
    setIsComposing(true);
  };
  
  const handleSend = async (e) => {
    e.preventDefault();
    const to = composeTo.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!to || !emailRegex.test(to)) {
      setComposeError('Informe um e-mail de destino válido.');
      return;
    }
    if (!composeSubject.trim()) {
      setComposeError('Informe um assunto para o e-mail.');
      return;
    }

    setEnviando(true);
    try {
      const enviada = await mensagemService.enviar({
        para: to,
        assunto: composeSubject.trim(),
        corpo: composeBody,
      });
      setIsComposing(false);
      await carregarMensagens();
      setSelectedFolder('sent');
      setSelectedEmailId(enviada?.id ?? null);
    } catch (err) {
      setComposeError(mensagemDeErro(err, 'Não foi possível enviar a mensagem.'));
    } finally {
      setEnviando(false);
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
                <span aria-hidden className="absolute inset-0 rounded-full bg-purple-500 opacity-40 blur-md" />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-fuchsia-50 dark:from-purple-900/60 dark:to-fuchsia-900/40 shadow-inner">
                  <Mail className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                </span>
              </span>
              <h1 className="text-lg font-bold text-gray-900">Webmail</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_360px_1fr] gap-4">
          {/* Pastas */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 h-fit">
            <div className="px-2 py-2 mb-2">
              <div className="text-xs text-gray-500 truncate">
                Caixa de: <span className="font-medium">{userEmail}</span>
              </div>
            </div>

            <button
              onClick={openCompose}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-3 bg-linear-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all"
            >
              <PenSquare className="w-4 h-4" />
              Escrever
            </button>

            {FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const isActive = selectedFolder === folder.id;
              const colors = FOLDER_COLORS[folder.id];
              
              // Executa a contagem para a pasta atual do laço
              const count = getFolderCount(folder.id);

              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setSelectedEmailId(null);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${isActive ? `bg-linear-to-r ${colors.activeBg} text-gray-900 dark:bg-none dark:bg-white/10` : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? colors.icon : 'text-gray-400'}`} />
                    {folder.label}
                  </span>
                  {/* Renderiza a badge numérica apenas se existir algum item */}
                  {count > 0 && (
                    <span className="bg-linear-to-r from-purple-600 to-fuchsia-600 text-white text-xs rounded-full px-2 py-0.5 shadow-sm">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lista de e-mails */}
          <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${selectedEmail ? 'hidden lg:block' : ''}`}>
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar e-mails..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/10 max-h-[65vh] overflow-y-auto">
              {erroCarregar ? (
                <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">{erroCarregar}</div>
              ) : carregando ? (
                <div className="p-8 text-center text-sm text-gray-400">Carregando mensagens...</div>
              ) : filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  {EMPTY_MESSAGES[selectedFolder]}
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const avatarLabel = email.folder === 'sent' ? (email.to ?? '?') : (email.fromName ?? '?');
                  const charLabel = avatarLabel.charAt(0).toUpperCase() || '?';

                  return (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email.id)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-l-4 ${selectedEmailId === email.id ? 'bg-purple-50 border-purple-500 dark:bg-purple-500/15' : !email.read ? 'bg-fuchsia-50/40 border-fuchsia-300 dark:bg-fuchsia-500/10' : 'border-transparent'}`}
                    >
                      <div className={`w-9 h-9 rounded-full bg-linear-to-br ${avatarGradientFor(avatarLabel)} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                        {charLabel}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {email.folder === 'sent' ? `Para: ${email.to}` : (email.fromName ?? 'Desconhecido')}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {email.folder === 'trash' ? (
                              <button onClick={(e) => handleRestore(email.id, e)} title="Restaurar">
                                <RotateCcw className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                              </button>
                            ) : (
                              <button onClick={(e) => toggleStar(email.id, e)} title="Favoritar">
                                <Star className={`w-4 h-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              </button>
                            )}
                            <button onClick={(e) => handleDelete(email.id, e)} title={email.folder === 'trash' ? 'Excluir definitivamente' : 'Excluir'}>
                              <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                          {email.subject}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          {email.preview}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{email.date}</span>
                          {email.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Leitura do e-mail */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:block">
            {!selectedEmail ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                <Inbox className="w-10 h-10 mb-3" />
                <p className="text-sm">Selecione um e-mail para visualizar</p>
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedEmailId(null)} className="lg:hidden flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para a lista
                </button>

                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3 shrink-0">
                    {selectedEmail.folder === 'trash' ? (
                      <button onClick={() => handleRestore(selectedEmail.id)} title="Restaurar" className="text-gray-400 hover:text-purple-600">
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    ) : (
                      <button onClick={(e) => toggleStar(selectedEmail.id, e)} title="Favoritar">
                        <Star className={`w-5 h-5 ${selectedEmail.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(selectedEmail.id)} title={selectedEmail.folder === 'trash' ? 'Excluir definitivamente' : 'Excluir'} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${avatarGradientFor(selectedEmail.folder === 'sent' ? (selectedEmail.to ?? '?') : (selectedEmail.fromName ?? '?'))} text-white flex items-center justify-center font-semibold shadow-sm`}>
                    {(selectedEmail.folder === 'sent' ? (selectedEmail.to ?? '?') : (selectedEmail.fromName ?? '?')).charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {selectedEmail.folder === 'sent' ? (
                      <>
                        <div className="text-sm font-medium text-gray-900">Para: {selectedEmail.to}</div>
                        <div className="text-xs text-gray-500 truncate">de {userEmail}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-gray-900">{selectedEmail.fromName ?? 'Desconhecido'}</div>
                        <div className="text-xs text-gray-500 truncate">{selectedEmail.from} · para {userEmail}</div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 shrink-0">{selectedEmail.date}</div>
                </div>

                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{selectedEmail.body}</div>

                {selectedEmail.hasAttachment && (
                  <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 w-fit">
                    <Paperclip className="w-4 h-4" />
                    anexo.pdf
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de compor e-mail */}
      {isComposing && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Nova mensagem</h3>
              <button onClick={() => setIsComposing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Para</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => {
                    setComposeTo(e.target.value);
                    if (composeError) setComposeError('');
                  }}
                  placeholder="e-mail de uma conta do HelpTec"
                  list="contas-helptec"
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>

              <datalist id="contas-helptec">
                {contas.map((conta) => (
                  <option key={conta.email} value={conta.email}>
                    {conta.nome}
                  </option>
                ))}
              </datalist>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Assunto</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => {
                    setComposeSubject(e.target.value);
                    if (composeError) setComposeError('');
                  }}
                  placeholder="Assunto do e-mail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mensagem</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 resize-none"
                />
              </div>

              {composeError && <p className="text-sm text-red-600">{composeError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsComposing(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={enviando} className="disabled:opacity-60 flex items-center gap-2 px-4 py-2 bg-linear-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all">
                  <Send className="w-4 h-4" />
                  {enviando ? 'Enviando...' : 'Enviar'}
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