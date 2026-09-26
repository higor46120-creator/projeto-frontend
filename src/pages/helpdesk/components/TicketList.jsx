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
} from 'lucide-react';
import { ChatBox } from '../../support/components/ChatBox';

// Mesma paleta da tela "Abrir Chamado": cinza, roxo, azul, amarelo e vermelho.

const COLOR_STYLES = {
  gray: {
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    bar: 'bg-gray-500',
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
  },
  purple: {
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    bar: 'bg-purple-600',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-700',
  },
  blue: {
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    bar: 'bg-blue-600',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
  },
  yellow: {
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    bar: 'bg-yellow-500',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-700',
  },
  red: {
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    bar: 'bg-red-600',
    iconBg: 'bg-red-100',
    iconText: 'text-red-700',
  },
};
const STATUS_COLOR = {
  Aberto: 'blue',
  'Em Andamento': 'yellow',
  Aguardando: 'gray',
  Resolvido: 'purple',
  Fechado: 'gray',
};
const PRIORITY_COLOR = {
  Baixa: 'gray',
  Média: 'blue',
  Alta: 'yellow',
  Crítica: 'red',
};
export function TicketList({ tickets, onUpdateTicket }) {
  const [chatTicket, setChatTicket] = useState(null);
  const stats = [
    {
      label: 'Total',
      value: tickets.length,
      icon: ClipboardList,
      color: 'gray',
    },
    {
      label: 'Abertos',
      value: tickets.filter((t) => t.status === 'Aberto').length,
      icon: Inbox,
      color: 'blue',
    },
    {
      label: 'Em Andamento',
      value: tickets.filter((t) => t.status === 'Em Andamento').length,
      icon: Loader,
      color: 'yellow',
    },
    {
      label: 'Resolvidos',
      value: tickets.filter(
        (t) => t.status === 'Resolvido' || t.status === 'Fechado',
      ).length,
      icon: CheckCircle2,
      color: 'purple',
    },
  ];
  if (tickets.length === 0) {
    return (
      <div className="max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        <div
          className="relative px-6 py-7 overflow-hidden"
          style={{
            background:
              'linear-gradient(120deg, #52525b 0%, #6b21a8 30%, #1d4ed8 58%, #b91c1c 82%, #eab308 100%)',
          }}
        >
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
                Acompanhe aqui tudo o que você já registrou
              </p>
            </div>
          </div>
        </div>

        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum chamado encontrado
          </h3>
          <p className="text-sm text-gray-500">
            Você ainda não possui chamados registrados. Clique em "Abrir
            Chamado" para criar um novo.
          </p>
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

      <div className="max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Banner de destaque — mesma paleta FIEC do "Abrir Chamado" */}
        <div
          className="relative px-6 py-7 overflow-hidden"
          style={{
            background:
              'linear-gradient(120deg, #52525b 0%, #6b21a8 30%, #1d4ed8 58%, #b91c1c 82%, #eab308 100%)',
          }}
        >
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
                {tickets.length}{' '}
                {tickets.length === 1
                  ? 'chamado registrado'
                  : 'chamados registrados'}
              </p>
            </div>
          </div>

          {/* Mini painel de estatísticas */}
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <StatIcon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-white leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-white/80 truncate">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {tickets.map((ticket) => {
            const statusColor = COLOR_STYLES[STATUS_COLOR[ticket.status]];
            const priorityColor =
              COLOR_STYLES[PRIORITY_COLOR[ticket.prioridade]];
            const priorityBar =
              COLOR_STYLES[PRIORITY_COLOR[ticket.prioridade]].bar;
            return (
              <div
                key={ticket.id_chamado}
                className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Faixa lateral colorida conforme a prioridade */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityBar}`}
                />

                <div className="pl-6 pr-5 py-5">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-400">
                          #{ticket.id_chamado.toString().padStart(4, '0')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.badgeBg} ${statusColor.badgeText}`}
                        >
                          {ticket.status}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColor.badgeBg} ${priorityColor.badgeText}`}
                        >
                          {ticket.prioridade}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {ticket.descricao}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Solicitante: {ticket.solicitante_nome}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span>{ticket.data_abertura}</span>
                    </div>
                    {ticket.sala && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5 text-purple-700" />
                        </div>
                        <span>{ticket.sala}</span>
                      </div>
                    )}
                    {ticket.equipamento && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                          <Package className="w-3.5 h-3.5 text-blue-700" />
                        </div>
                        <span>{ticket.equipamento}</span>
                      </div>
                    )}
                    {ticket.cod_patrimonio && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-yellow-100 flex items-center justify-center">
                          <Tag className="w-3.5 h-3.5 text-yellow-700" />
                        </div>
                        <span>Pat/Máq: {ticket.cod_patrimonio}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Criticidade:
                      </span>
                      <span className="text-xs font-semibold text-gray-700">
                        {ticket.criticidade}
                      </span>
                    </div>
                    <button
                      onClick={() => setChatTicket(ticket)}
                      className="group flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      style={{
                        background:
                          'linear-gradient(120deg, #6b21a8 0%, #1d4ed8 100%)',
                      }}
                    >
                      <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                      Chat
                    </button>
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
