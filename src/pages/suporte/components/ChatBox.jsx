import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Send, X, MessageCircle, User, Headphones, Loader2 } from 'lucide-react';
import { AuthContext } from '../../../contexts/AuthContext';
import { chatService } from '../../../shared/services/chatService';
import { obterIdUsuarioLogado } from '../../../utils/usuarioLogado';

// De quanto em quanto tempo busca mensagens novas enquanto o chat está aberto
const INTERVALO_ATUALIZACAO_MS = 5000;

// Chat do chamado, ligado ao back (/api/chamados/{id}/mensagens).
// userType: "user" (funcionário que abriu) ou "support" (suporte). Só muda o texto da tela;
// quem define o lado de cada mensagem é o back.
export function ChatBox({ ticketId, ticketTitle, userType, onClose }) {
  const { usuario } = useContext(AuthContext);
  const meuId = usuario?.idUsuario ?? obterIdUsuarioLogado();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const messagesEndRef = useRef(null);

  const carregar = useCallback(
    async (silencioso = false) => {
      if (ticketId == null) return;
      try {
        const lista = await chatService.listar(ticketId);
        setMessages(Array.isArray(lista) ? lista : []);
        if (!silencioso) setErro('');
      } catch (err) {
        console.error('Erro ao carregar o chat', err);
        if (!silencioso) {
          setErro(
            err?.response?.status === 403
              ? 'Você não tem acesso ao chat deste chamado.'
              : 'Não foi possível carregar as mensagens.',
          );
        }
      } finally {
        if (!silencioso) setCarregando(false);
      }
    },
    [ticketId],
  );

  // Carrega ao abrir e depois atualiza de tempos em tempos
  useEffect(() => {
    setCarregando(true);
    carregar();
    const intervalo = setInterval(() => carregar(true), INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const texto = newMessage.trim();
    if (!texto || enviando) return;
    setEnviando(true);
    setErro('');
    try {
      const enviada = await chatService.enviar(ticketId, texto);
      setMessages((prev) => (prev.some((m) => m.id === enviada.id) ? prev : [...prev, enviada]));
      setNewMessage('');
    } catch (err) {
      console.error('Erro ao enviar mensagem', err);
      setErro('Não foi possível enviar a mensagem. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  };

  // Minha mensagem fica à direita (comparando pelo id de quem enviou)
  const ehMinha = (message) =>
    meuId ? String(message.idRemetente) === String(meuId) : message.sender === userType;

  const numeroChamado = ticketId != null ? String(ticketId).padStart(4, '0') : '----';
  const nomeDoOutroLado = userType === 'user' ? 'o suporte' : 'o funcionário';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold">Chat do Chamado</h3>
              <p className="text-sm text-blue-100 truncate">
                #{numeroChamado}
                {ticketTitle ? ` - ${ticketTitle}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {carregando ? (
            <div className="h-full flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando mensagens...
            </div>
          ) : messages.length === 0 && !erro ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-sm text-gray-400">
              <MessageCircle className="w-8 h-8 mb-2" />
              Nenhuma mensagem ainda. Escreva para {nomeDoOutroLado}.
            </div>
          ) : (
            messages.map((message) => {
              const minha = ehMinha(message);
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${minha ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.sender === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}
                  >
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Headphones className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div
                    className={`flex flex-col max-w-[70%] ${minha ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {minha ? 'Você' : message.senderName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {message.timestamp}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${minha ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'}`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          {erro && <p className="text-xs text-red-600 mb-2">{erro}</p>}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              maxLength={2000}
              disabled={carregando}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={enviando || carregando || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Pressione Enter ou clique em Enviar para enviar a mensagem
          </p>
        </div>
      </div>
    </div>
  );
}
