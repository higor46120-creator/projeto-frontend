import { useState } from 'react';
import {
  Clock,
  MapPin,
  Package,
  Tag,
  MessageCircle,
  ClipboardList,
  Sparkles,
  Inbox,
  Loader,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ChatBox } from '../../support/components/ChatBox';

// Funções Utilitárias de Formatação (Helpers)
const formatarData = (dataIso) => {
  if (!dataIso) return 'Data não disponível';
  try {
    const data = new Date(dataIso);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dataIso;
  }
};

const formatarId = (id) => {
  if (!id) return '----';
  const idStr = String(id);
  if (idStr.length > 10) return idStr.substring(0, 6).toUpperCase();
  return idStr.padStart(4, '0');
};

const COLOR_STYLES = {
  gray: {
    badgeBg: 'bg-gray-100 dark:bg-gray-700/50',
    badgeText: 'text-gray-700 dark:text-gray-300',
    bar: 'bg-gray-500',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconText: 'text-gray-600 dark:text-gray-400',
  },
  purple: {
    badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
    badgeText: 'text-purple-700 dark:text-purple-300',
    bar: 'bg-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconText: 'text-purple-700 dark:text-purple-400',
  },
  blue: {
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    bar: 'bg-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-700 dark:text-blue-400',
  },
  yellow: {
    badgeBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    badgeText: 'text-yellow-800 dark:text-yellow-300',
    bar: 'bg-yellow-500',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconText: 'text-yellow-700 dark:text-yellow-500',
  },
  red: {
    badgeBg: 'bg-red-100 dark:bg-red-900/50',
    badgeText: 'text-red-700 dark:text-red-300',
    bar: 'bg-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconText: 'text-red-700 dark:text-red-400',
  },
};

const STATUS_COLOR = {
  'Aberto': 'blue',
  'Em Andamento': 'yellow',
  'Aguardando': 'gray',
  'Resolvido': 'purple',
  'Fechado': 'gray',
  'Pendente': 'yellow', 
};

const PRIORITY_COLOR = {
  'Baixa': 'gray',
  'Média': 'blue',
  'Alta': 'yellow',
  'Crítica': 'red',
};

export function TicketList({ tickets, onUpdateTicket, onConfirmTicket, onDeletePending }) {
  const [chatTicket, setChatTicket] = useState(null);
  
  const stats = [
    { label: 'Total', value: tickets.length, icon: ClipboardList, color: 'gray' },
    { label: 'Abertos', value: tickets.filter((t) => t.status === 'Aberto').length, icon: Inbox, color: 'blue' },
    { label: 'Em Andamento', value: tickets.filter((t) => t.status === 'Em Andamento').length, icon: Loader, color: 'yellow' },
    { label: 'Resolvidos', value: tickets.filter((t) => t.status === 'Resolvido' || t.status === 'Fechado').length, icon: CheckCircle2, color: 'purple' },
  ];

  if (tickets.length === 0) {
    return (
      <div className="max-w-6xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16161e] shadow-lg dark:shadow-2xl overflow-hidden transition-colors duration-200">
        <div className="relative px-6 py-7 overflow-hidden" style={{ background: 'linear-gradient(120deg, #52525b 0%, #6b21a8 30%, #1d4ed8 58%, #b91c1c 82%, #eab308 100%)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-14 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Meus Chamados</h2>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <p className="text-sm text-white/90 mt-1">Acompanhe aqui tudo o que você já registrou</p>
            </div>
          </div>
        </div>

        <div className="p-12 text-center bg-white dark:bg-[#1a1b26] transition-colors duration-200">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">Nenhum chamado encontrado</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Você ainda não possui chamados registrados. Clique em "Abrir Chamado" para criar um novo.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {chatTicket && (
        <ChatBox
          ticketId={chatTicket.id_chamado}
          ticketTitle={chatTicket.descricao}
          userType="user"
          onClose={() => setChatTicket(null)}
        />
      )}

      <div className="max-w-6xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16161e] shadow-lg dark:shadow-2xl overflow-hidden transition-colors duration-200">
        
        <div className="relative px-6 py-7 overflow-hidden" style={{ background: 'linear-gradient(120deg, #52525b 0%, #581c87 30%, #1e3a8a 58%, #991b1b 82%, #ca8a04 100%)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-14 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Meus Chamados</h2>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <p className="text-sm text-white/90 mt-1">
                {tickets.length} {tickets.length === 1 ? 'chamado registrado' : 'chamados registrados'}
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="bg-white/15 dark:bg-white/10 backdrop-blur-md border border-transparent dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <StatIcon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-white leading-none">{stat.value}</div>
                    <div className="text-[11px] text-white/80 truncate">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-4 bg-gray-50 dark:bg-[#1a1b26] transition-colors duration-200">
          {tickets.map((ticket) => {
            const statusColor = COLOR_STYLES[STATUS_COLOR[ticket.status]] || COLOR_STYLES.gray;
            const nivelMapped = PRIORITY_COLOR[ticket.prioridade] || 'gray';
            const nivelStyle = COLOR_STYLES[nivelMapped];
            const leftBarColor = nivelStyle.bar; 
            const textColor = nivelStyle.badgeText; 

            return (
              <div
                key={ticket.id_chamado || ticket.id_local}
                className="relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#24283b] overflow-hidden hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${leftBarColor}`} />

                <div className="pl-6 pr-5 py-5">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* AQUI: O ID formatado */}
                        <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                          {ticket.isPendente ? '#----' : `#${formatarId(ticket.id_chamado)}`}
                        </span>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold dark:font-medium dark:border dark:border-white/5 ${statusColor.badgeBg} ${statusColor.badgeText}`}>
                          {ticket.status || 'Pendente'}
                        </span>
                        
                        {ticket.isPendente && (
                          <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 dark:border dark:border-yellow-500/20 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Rascunho
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-lg">
                        {ticket.descricao}
                      </h3>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Solicitante: <span className="text-gray-600 dark:text-gray-300">{ticket.solicitante_nome || 'Usuário Padrão'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {/* AQUI: A Data formatada */}
                      <span>{formatarData(ticket.data_abertura)}</span>
                    </div>
                    {ticket.sala && (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${COLOR_STYLES.purple.iconBg}`}>
                          <MapPin className={`w-3.5 h-3.5 ${COLOR_STYLES.purple.iconText}`} />
                        </div>
                        <span>{ticket.sala}</span>
                      </div>
                    )}
                    {ticket.equipamento && (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${COLOR_STYLES.blue.iconBg}`}>
                          <Package className={`w-3.5 h-3.5 ${COLOR_STYLES.blue.iconText}`} />
                        </div>
                        <span>{ticket.equipamento}</span>
                      </div>
                    )}
                    {ticket.cod_patrimonio && (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${COLOR_STYLES.yellow.iconBg}`}>
                          <Tag className={`w-3.5 h-3.5 ${COLOR_STYLES.yellow.iconText}`} />
                        </div>
                        <span>Pat/Máq: {ticket.cod_patrimonio}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Criticidade:</span>
                      <span className={`text-xs font-bold ${textColor}`}>
                        {ticket.prioridade || 'Não definida'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {ticket.isPendente ? (
                        <>
                          <button
                            onClick={() => onDeletePending(ticket.id_local)}
                            className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-transparent dark:border-red-900/50 text-sm font-semibold rounded-lg transition-colors"
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => onConfirmTicket(ticket)}
                            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                          >
                            Confirmar Envio
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setChatTicket(ticket)}
                          className="group flex items-center gap-2 px-5 py-2 text-white text-sm font-semibold rounded-lg shadow-md dark:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-200"
                          style={{ background: 'linear-gradient(120deg, #6b21a8 0%, #3b82f6 100%)' }}
                        >
                          <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}