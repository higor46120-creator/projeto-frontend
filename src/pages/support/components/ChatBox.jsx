import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, User, Headphones } from 'lucide-react';
export function ChatBox({ ticketId, ticketTitle, userType, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'Olá, estou com problema no computador.',
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderName: 'Funcionário',
    },
    {
      id: 2,
      sender: 'support',
      text: 'Olá! Já estou analisando seu chamado. Pode me informar se o computador liga?',
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderName: 'Suporte',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const message = {
      id: messages.length + 1,
      sender: userType,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderName: userType === 'user' ? 'Funcionário' : 'Suporte',
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Chat do Chamado</h3>
              <p className="text-sm text-blue-100">
                #{ticketId.toString().padStart(4, '0')} - {ticketTitle}
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === userType ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}
              >
                {message.sender === 'user' ? (
                  <User
                    className={`w-4 h-4 ${message.sender === 'user' ? 'text-blue-600' : 'text-purple-600'}`}
                  />
                ) : (
                  <Headphones className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div
                className={`flex flex-col max-w-[70%] ${message.sender === userType ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {message.senderName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {message.timestamp}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-2xl ${message.sender === userType ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'}`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
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
