import { useState } from 'react';
import {
  AlertCircle,
  Send,
  Laptop,
  Printer,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Projector,
  Volume2,
  Wifi,
  MonitorSpeaker,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle2,
  Gauge,
  ClipboardList,
  Lightbulb,
} from 'lucide-react';

// Paleta alinhada à identidade visual da FIEC: cinza, roxo, azul, amarelo e vermelho.

const equipmentOptions = [
  {
    id: 'desktop',
    name: 'Desktop',
    icon: Monitor,
    color: 'purple',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    icon: Laptop,
    color: 'blue',
  },
  {
    id: 'impressora',
    name: 'Impressora',
    icon: Printer,
    color: 'red',
  },
  {
    id: 'teclado',
    name: 'Teclado',
    icon: Keyboard,
    color: 'yellow',
  },
  {
    id: 'mouse',
    name: 'Mouse',
    icon: Mouse,
    color: 'gray',
  },
  {
    id: 'headset',
    name: 'Headset',
    icon: Headphones,
    color: 'purple',
  },
  {
    id: 'datashow',
    name: 'Datashow',
    icon: Projector,
    color: 'blue',
  },
  {
    id: 'som',
    name: 'Aparelho de Som',
    icon: Volume2,
    color: 'red',
  },
  {
    id: 'rede',
    name: 'Rede',
    icon: Wifi,
    color: 'yellow',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    icon: MonitorSpeaker,
    color: 'gray',
  },
];
const priorityOptions = [
  {
    value: 'Baixa',
    color: 'gray',
    description: 'Sem urgência, pode aguardar',
  },
  {
    value: 'Média',
    color: 'blue',
    description: 'Impacta o dia a dia',
  },
  {
    value: 'Alta',
    color: 'yellow',
    description: 'Atrapalha o trabalho',
  },
  {
    value: 'Crítica',
    color: 'red',
    description: 'Parou tudo, urgente',
  },
];

// Classes Tailwind completas (sem interpolação) para cada cor, garantindo
// que o build inclua todas as variações usadas na grade de equipamentos.

const COLOR_STYLES = {
  gray: {
    iconBg: 'bg-gray-200',
    icon: 'text-gray-600',
    selectedBorder: 'border-gray-500',
    selectedBg: 'bg-gray-100',
    selectedIconBg: 'bg-gray-600',
    selectedIcon: 'text-white',
    badge: 'bg-gray-600',
    ring: 'ring-gray-200',
    text: 'text-gray-700',
  },
  purple: {
    iconBg: 'bg-purple-100',
    icon: 'text-purple-700',
    selectedBorder: 'border-purple-600',
    selectedBg: 'bg-purple-50',
    selectedIconBg: 'bg-purple-700',
    selectedIcon: 'text-white',
    badge: 'bg-purple-700',
    ring: 'ring-purple-200',
    text: 'text-purple-700',
  },
  blue: {
    iconBg: 'bg-blue-100',
    icon: 'text-blue-700',
    selectedBorder: 'border-blue-600',
    selectedBg: 'bg-blue-50',
    selectedIconBg: 'bg-blue-700',
    selectedIcon: 'text-white',
    badge: 'bg-blue-700',
    ring: 'ring-blue-200',
    text: 'text-blue-700',
  },
  yellow: {
    iconBg: 'bg-yellow-100',
    icon: 'text-yellow-700',
    selectedBorder: 'border-yellow-500',
    selectedBg: 'bg-yellow-50',
    selectedIconBg: 'bg-yellow-500',
    selectedIcon: 'text-white',
    badge: 'bg-yellow-500',
    ring: 'ring-yellow-200',
    text: 'text-yellow-700',
  },
  red: {
    iconBg: 'bg-red-100',
    icon: 'text-red-700',
    selectedBorder: 'border-red-600',
    selectedBg: 'bg-red-50',
    selectedIconBg: 'bg-red-700',
    selectedIcon: 'text-white',
    badge: 'bg-red-700',
    ring: 'ring-red-200',
    text: 'text-red-700',
  },
};
export function TicketForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    solicitante_nome: 'Usuário Padrão',
    id_solicitante: 1,
    descricao: '',
    prioridade: 'Média',
    criticidade: 'Média',
    equipamento: '',
    sala: '',
    cod_patrimonio: '',
  });
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação do tipo de equipamento
    if (!selectedEquipment) {
      alert('Por favor, selecione um tipo de equipamento.');
      return;
    }
    onSubmit(formData);
    setFormData({
      solicitante_nome: 'Usuário Padrão',
      id_solicitante: 1,
      descricao: '',
      prioridade: 'Média',
      criticidade: 'Média',
      equipamento: '',
      sala: '',
      cod_patrimonio: '',
    });
    setSelectedEquipment('');
  };
  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      ...formData,
      equipamento: equipment,
    });
  };

  // Progresso de preenchimento, para dar mais retorno visual ao usuário.
  const totalFields = 4;
  const filledFields = [
    formData.sala.trim().length > 0,
    formData.cod_patrimonio.trim().length > 0,
    selectedEquipment.length > 0,
    formData.descricao.trim().length > 0,
  ].filter(Boolean).length;
  const progressPercent = Math.round((filledFields / totalFields) * 100);
  const selectedPriority = priorityOptions.find(
    (p) => p.value === formData.prioridade,
  );
  const priorityStyles = COLOR_STYLES[selectedPriority.color];
  return (
    <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      {/* Formulário principal */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Banner de destaque — paleta FIEC: cinza, roxo, azul, amarelo, vermelho */}
        <div
          className="relative px-6 py-7 overflow-hidden"
          style={{
            background:
              'linear-gradient(120deg, #52525b 0%, #6b21a8 30%, #1d4ed8 58%, #b91c1c 82%, #eab308 100%)',
          }}
        >
          {/* Formas decorativas */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-14 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                  Abrir Novo Chamado
                </h2>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <p className="text-sm text-white/90 mt-1">
                Conta pra gente o que aconteceu — resolvemos rapidinho! 🚀
              </p>
            </div>
          </div>

          {/* Barra de progresso do preenchimento */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1">
              <span>Progresso do formulário</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Localização e Patrimônio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-700" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Localização e Patrimônio
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sala"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sala *
                </label>
                <input
                  type="text"
                  id="sala"
                  required
                  value={formData.sala}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sala: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-600 transition-shadow"
                  placeholder="Ex: Sala 201"
                />
              </div>
              <div>
                <label
                  htmlFor="cod_patrimonio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código Patrimônio / Número da Máquina *
                </label>
                <input
                  type="text"
                  id="cod_patrimonio"
                  required
                  value={formData.cod_patrimonio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cod_patrimonio: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-600 transition-shadow"
                  placeholder="Ex: PAT-001234 / Máquina 05"
                />
              </div>
            </div>
          </div>

          {/* Tipo de Equipamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-blue-700" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Tipo de Equipamento *
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {equipmentOptions.map((equipment) => {
                const Icon = equipment.icon;
                const isSelected = selectedEquipment === equipment.name;
                const styles = COLOR_STYLES[equipment.color];
                return (
                  <button
                    key={equipment.id}
                    type="button"
                    onClick={() => handleEquipmentSelect(equipment.name)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isSelected ? `${styles.selectedBorder} ${styles.selectedBg} ring-4 ${styles.ring} shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    {isSelected && (
                      <span
                        className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${styles.badge} flex items-center justify-center shadow`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${isSelected ? styles.selectedIconBg : styles.iconBg}`}
                    >
                      <Icon
                        className={`w-6 h-6 ${isSelected ? styles.selectedIcon : styles.icon}`}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold text-center ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}
                    >
                      {equipment.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prioridade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-yellow-700" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Prioridade
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorityOptions.map((priority) => {
                const isSelected = formData.prioridade === priority.value;
                const styles = COLOR_STYLES[priority.color];
                return (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        prioridade: priority.value,
                      })
                    }
                    className={`text-left p-3 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isSelected ? `${styles.selectedBorder} ${styles.selectedBg} ring-2 ${styles.ring}` : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <span
                      className={`text-sm font-semibold ${isSelected ? styles.text : 'text-gray-800'}`}
                    >
                      {priority.value}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      {priority.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição do Problema */}
          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descrição do Problema *
            </label>
            <textarea
              id="descricao"
              required
              rows={4}
              value={formData.descricao}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descricao: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-600 transition-shadow resize-none"
              placeholder="Descreva detalhadamente o problema encontrado..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="group flex items-center gap-2 px-7 py-3 text-white rounded-xl font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background:
                  'linear-gradient(120deg, #6b21a8 0%, #1d4ed8 55%, #b91c1c 100%)',
              }}
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Enviar Chamado
            </button>
          </div>
        </form>
      </div>

      {/* Barra lateral com resumo e dicas */}
      <div className="space-y-4 lg:sticky lg:top-6">
        {/* Resumo do chamado */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Resumo do chamado
            </h3>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500">Sala</dt>
              <dd className="font-medium text-gray-800 truncate max-w-[140px]">
                {formData.sala || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500">Patrimônio</dt>
              <dd className="font-medium text-gray-800 truncate max-w-[140px]">
                {formData.cod_patrimonio || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500">Equipamento</dt>
              <dd className="font-medium text-gray-800 truncate max-w-[140px]">
                {selectedEquipment || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500">Prioridade</dt>
              <dd>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles.selectedBg} ${priorityStyles.text}`}
                >
                  {formData.prioridade}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Dicas rápidas */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-yellow-700" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Dicas rápidas
            </h3>
          </div>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-600 shrink-0" />
              O código de patrimônio geralmente está numa etiqueta no
              equipamento.
            </li>
            <li className="flex gap-2">
              <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-600 shrink-0" />
              Quanto mais detalhes na descrição, mais rápido o suporte resolve.
            </li>
            <li className="flex gap-2">
              <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-600 shrink-0" />
              Use "Crítica" só quando o problema parar totalmente o trabalho.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
