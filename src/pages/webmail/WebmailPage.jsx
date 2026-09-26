import { useState } from 'react';
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
} from 'lucide-react';
import { TopBar } from '../../components/TopBar';
import { PageBackdrop } from '../../components/PageBackdrop';
// Caixa de entrada compartilhada — visível para todos os perfis
// (Funcionário, Aprovador, Suporte e Gestor) que acessarem o Webmail.
const MOCK_EMAILS = [
  {
    id: 1,
    folder: 'inbox',
    from: 'rh@fiec.admin.br',
    fromName: 'Recursos Humanos',
    subject: 'Atualização do plano de saúde 2026',
    preview:
      'Prezados, informamos que a partir do próximo mês o plano de saúde...',
    body: 'Prezados,\n\nInformamos que a partir do próximo mês o plano de saúde institucional passará por atualizações. Novas carências e coberturas estarão disponíveis no portal do servidor.\n\nQualquer dúvida, procure o setor de RH.\n\nAtenciosamente,\nRecursos Humanos',
    date: 'Hoje, 09:12',
    read: false,
    starred: true,
    hasAttachment: true,
  },
  {
    id: 2,
    folder: 'inbox',
    from: 'suporte@fiec.admin.br',
    fromName: 'Suporte HelpTec',
    subject: 'Chamado #1042 atualizado',
    preview:
      'Seu chamado sobre "Computador não liga" foi atualizado para em andamento...',
    body: 'Olá,\n\nSeu chamado #1042 referente a "Computador não liga" foi atualizado para o status Em Andamento. Nossa equipe técnica entrará em contato em breve.\n\nAcompanhe pelo Portal do Solicitante.',
    date: 'Hoje, 08:40',
    read: false,
    starred: false,
    hasAttachment: false,
  },
  {
    id: 3,
    folder: 'inbox',
    from: 'diretoria@fiec.admin.br',
    fromName: 'Diretoria',
    subject: 'Reunião geral - Sexta-feira 10h',
    preview:
      'Convocamos todos os colaboradores para a reunião geral trimestral...',
    body: 'Prezados colaboradores,\n\nConvocamos todos para a reunião geral trimestral, que acontecerá na sexta-feira às 10h no auditório principal.\n\nPauta: resultados do trimestre e próximos passos institucionais.',
    date: 'Ontem, 17:05',
    read: true,
    starred: false,
    hasAttachment: false,
  },
  {
    id: 4,
    folder: 'inbox',
    from: 'licitacoes@fiec.admin.br',
    fromName: 'Setor de Licitações',
    subject: 'Edital nº 018/2026 publicado',
    preview:
      'Informamos a publicação do edital nº 018/2026 referente à aquisição de...',
    body: 'Prezados,\n\nInformamos a publicação do edital nº 018/2026, referente à aquisição de equipamentos de informática. O documento completo está disponível na área de Licitações do portal.',
    date: 'Ontem, 14:22',
    read: true,
    starred: false,
    hasAttachment: true,
  },
  {
    id: 5,
    folder: 'inbox',
    from: 'no-reply@fiec.admin.br',
    fromName: 'Sistema HelpTec',
    subject: 'Sua senha expira em 5 dias',
    preview:
      'Sua senha de acesso ao portal expira em 5 dias. Para evitar o bloqueio...',
    body: 'Olá,\n\nSua senha de acesso ao portal expira em 5 dias. Para evitar o bloqueio da sua conta, acesse o menu de configurações e realize a alteração.\n\nEste é um e-mail automático, não responda.',
    date: '15/08/2026',
    read: true,
    starred: false,
    hasAttachment: false,
  },
];
const FOLDERS = [
  {
    id: 'inbox',
    label: 'Caixa de entrada',
    icon: Inbox,
  },
  {
    id: 'sent',
    label: 'Enviados',
    icon: Send,
  },
  {
    id: 'drafts',
    label: 'Rascunhos',
    icon: FileEdit,
  },
  {
    id: 'trash',
    label: 'Lixeira',
    icon: Trash2,
  },
];

// Cores por pasta, seguindo a mesma paleta usada nos cards da Home
// (roxo, azul, âmbar, vermelho) para deixar a navegação mais viva.
const FOLDER_COLORS = {
  inbox: {
    activeBg: 'from-purple-100 to-fuchsia-50',
    icon: 'text-purple-700',
  },
  sent: {
    activeBg: 'from-sky-100 to-blue-50',
    icon: 'text-sky-700',
  },
  drafts: {
    activeBg: 'from-amber-100 to-orange-50',
    icon: 'text-amber-700',
  },
  trash: {
    activeBg: 'from-red-100 to-rose-50',
    icon: 'text-red-700',
  },
};

// Gera uma cor de avatar consistente a partir do nome do remetente,
// para que a lista de e-mails fique mais colorida (estilo Gmail).
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
const EMPTY_MESSAGES = {
  inbox: 'Nenhum e-mail na caixa de entrada.',
  sent: 'Nenhum e-mail enviado ainda.',
  drafts: 'Nenhum rascunho salvo.',
  trash: 'A lixeira está vazia.',
};
export function WebmailPage({
  onBack,
  userEmail,
  onLogout,
  userType,
  onUserTypeChange,
  onNavigate,
}) {
  const [emails, setEmails] = useState(MOCK_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [search, setSearch] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeError, setComposeError] = useState('');
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;
  const filteredEmails = emails
    .filter((email) => email.folder === selectedFolder)
    .filter((email) => {
      const q = search.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.fromName.toLowerCase().includes(q) ||
        email.from.toLowerCase().includes(q) ||
        (email.to ?? '').toLowerCase().includes(q)
      );
    });
  const unreadCount = emails.filter(
    (e) => e.folder === 'inbox' && !e.read,
  ).length;
  const handleSelectEmail = (id) => {
    setSelectedEmailId(id);
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              read: true,
            }
          : e,
      ),
    );
  };
  const toggleStar = (id, e) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id
          ? {
              ...email,
              starred: !email.starred,
            }
          : email,
      ),
    );
  };

  // Move o e-mail para a lixeira; se já estiver na lixeira, exclui definitivamente.
  const handleDelete = (id, e) => {
    e?.stopPropagation();
    const email = emails.find((em) => em.id === id);
    if (!email) return;
    if (email.folder === 'trash') {
      setEmails((prev) => prev.filter((em) => em.id !== id));
    } else {
      setEmails((prev) =>
        prev.map((em) =>
          em.id === id
            ? {
                ...em,
                folder: 'trash',
              }
            : em,
        ),
      );
    }
    if (selectedEmailId === id) setSelectedEmailId(null);
  };

  // Restaura um e-mail da lixeira de volta para a caixa de entrada.
  const handleRestore = (id, e) => {
    e?.stopPropagation();
    setEmails((prev) =>
      prev.map((em) =>
        em.id === id
          ? {
              ...em,
              folder: 'inbox',
            }
          : em,
      ),
    );
    if (selectedEmailId === id) setSelectedEmailId(null);
  };
  const openCompose = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeError('');
    setIsComposing(true);
  };
  const handleSend = (e) => {
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
    const newEmail = {
      id: Date.now(),
      folder: 'sent',
      from: userEmail,
      fromName: userEmail,
      to,
      subject: composeSubject.trim(),
      preview: composeBody.trim().slice(0, 80),
      body: composeBody.trim(),
      date: 'Agora',
      read: true,
      starred: false,
      hasAttachment: false,
    };
    setEmails((prev) => [newEmail, ...prev]);
    setIsComposing(false);
    setSelectedFolder('sent');
    setSelectedEmailId(newEmail.id);
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
                  <Mail className="w-4 h-4 text-purple-700" />
                </span>
              </span>
              <h1 className="text-lg font-bold text-gray-900">Webmail</h1>
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-3 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all"
            >
              <PenSquare className="w-4 h-4" />
              Escrever
            </button>

            {FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const isActive = selectedFolder === folder.id;
              const colors = FOLDER_COLORS[folder.id];
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setSelectedEmailId(null);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${isActive ? `bg-gradient-to-r ${colors.activeBg} text-gray-900` : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 ${isActive ? colors.icon : 'text-gray-400'}`}
                    />
                    {folder.label}
                  </span>
                  {folder.id === 'inbox' && unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs rounded-full px-2 py-0.5 shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lista de e-mails */}
          <div
            className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${selectedEmail ? 'hidden lg:block' : ''}`}
          >
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

            <div className="divide-y divide-gray-100 max-h-[65vh] overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  {EMPTY_MESSAGES[selectedFolder]}
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const avatarLabel =
                    email.folder === 'sent'
                      ? (email.to ?? '?')
                      : email.fromName;
                  return (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email.id)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors border-l-4 ${selectedEmailId === email.id ? 'bg-purple-50 border-purple-500' : !email.read ? 'bg-fuchsia-50/40 border-fuchsia-300' : 'border-transparent'}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradientFor(avatarLabel)} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        {avatarLabel.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                          >
                            {email.folder === 'sent'
                              ? `Para: ${email.to}`
                              : email.fromName}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {email.folder === 'trash' ? (
                              <button
                                onClick={(e) => handleRestore(email.id, e)}
                                title="Restaurar"
                              >
                                <RotateCcw className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => toggleStar(email.id, e)}
                                title="Favoritar"
                              >
                                <Star
                                  className={`w-4 h-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(email.id, e)}
                              title={
                                email.folder === 'trash'
                                  ? 'Excluir definitivamente'
                                  : 'Excluir'
                              }
                            >
                              <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div
                          className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
                        >
                          {email.subject}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          {email.preview}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {email.date}
                          </span>
                          {email.hasAttachment && (
                            <Paperclip className="w-3 h-3 text-gray-400" />
                          )}
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
                <button
                  onClick={() => setSelectedEmailId(null)}
                  className="lg:hidden flex items-center gap-2 text-sm text-gray-600 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para a lista
                </button>

                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center gap-3 shrink-0">
                    {selectedEmail.folder === 'trash' ? (
                      <button
                        onClick={() => handleRestore(selectedEmail.id)}
                        title="Restaurar"
                        className="text-gray-400 hover:text-purple-600"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => toggleStar(selectedEmail.id, e)}
                        title="Favoritar"
                      >
                        <Star
                          className={`w-5 h-5 ${selectedEmail.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedEmail.id)}
                      title={
                        selectedEmail.folder === 'trash'
                          ? 'Excluir definitivamente'
                          : 'Excluir'
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradientFor(selectedEmail.folder === 'sent' ? (selectedEmail.to ?? '') : selectedEmail.fromName)} text-white flex items-center justify-center font-semibold shadow-sm`}
                  >
                    {(selectedEmail.folder === 'sent'
                      ? (selectedEmail.to ?? '')
                      : selectedEmail.fromName
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {selectedEmail.folder === 'sent' ? (
                      <>
                        <div className="text-sm font-medium text-gray-900">
                          Para: {selectedEmail.to}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          de {userEmail}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedEmail.fromName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {selectedEmail.from} · para {userEmail}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 shrink-0">
                    {selectedEmail.date}
                  </div>
                </div>

                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedEmail.body}
                </div>

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
              <h3 className="text-sm font-semibold text-gray-900">
                Nova mensagem
              </h3>
              <button
                onClick={() => setIsComposing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Para
                </label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => {
                    setComposeTo(e.target.value);
                    if (composeError) setComposeError('');
                  }}
                  placeholder="destinatario@exemplo.com"
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Assunto
                </label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Mensagem
                </label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 resize-none"
                />
              </div>

              {composeError && (
                <p className="text-sm text-red-600">{composeError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
