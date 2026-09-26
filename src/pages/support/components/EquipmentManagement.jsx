import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Monitor,
  Laptop,
  Printer,
  Keyboard,
  Mouse,
  Headphones,
  Projector,
  Volume2,
  Wifi,
  MonitorSpeaker,
} from 'lucide-react';
const equipmentIcons = {
  Desktop: Monitor,
  Notebook: Laptop,
  Impressora: Printer,
  Teclado: Keyboard,
  Mouse: Mouse,
  Headset: Headphones,
  Datashow: Projector,
  'Aparelho de Som': Volume2,
  Rede: Wifi,
  Monitor: MonitorSpeaker,
};
export function EquipmentManagement({ onClose }) {
  const [equipments, setEquipments] = useState([
    {
      id: 1,
      tipo: 'Desktop',
      cod_patrimonio: 'PAT-001234',
      sala: 'Sala 201',
      setor: 'Administrativo',
      status: 'Operacional',
      descricao: 'Desktop Dell Inspiron',
      numero_maquina: 'PC-01',
    },
    {
      id: 2,
      tipo: 'Impressora',
      cod_patrimonio: 'PAT-005678',
      sala: 'Sala 105',
      setor: 'TI',
      status: 'Operacional',
      descricao: 'Impressora HP LaserJet',
      numero_maquina: 'IMP-03',
    },
    {
      id: 3,
      tipo: 'Notebook',
      cod_patrimonio: 'PAT-009876',
      sala: 'Sala 302',
      setor: 'Financeiro',
      status: 'Manutenção',
      descricao: 'Notebook Lenovo ThinkPad',
      numero_maquina: 'NB-15',
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    tipo: 'Desktop',
    cod_patrimonio: '',
    sala: '',
    setor: '',
    status: 'Operacional',
    descricao: '',
    numero_maquina: '',
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEquipment) {
      setEquipments(
        equipments.map((eq) =>
          eq.id === editingEquipment.id
            ? {
                ...formData,
                id: editingEquipment.id,
              }
            : eq,
        ),
      );
    } else {
      const newEquipment = {
        ...formData,
        id: equipments.length + 1,
      };
      setEquipments([...equipments, newEquipment]);
    }
    resetForm();
  };
  const handleEdit = (equipment) => {
    setEditingEquipment(equipment);
    setFormData({
      tipo: equipment.tipo,
      cod_patrimonio: equipment.cod_patrimonio,
      sala: equipment.sala,
      setor: equipment.setor,
      status: equipment.status,
      descricao: equipment.descricao,
      numero_maquina: equipment.numero_maquina || '',
    });
    setShowForm(true);
  };
  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      setEquipments(equipments.filter((eq) => eq.id !== id));
    }
  };
  const resetForm = () => {
    setFormData({
      tipo: 'Desktop',
      cod_patrimonio: '',
      sala: '',
      setor: '',
      status: 'Operacional',
      descricao: '',
      numero_maquina: '',
    });
    setEditingEquipment(null);
    setShowForm(false);
  };
  const filteredEquipments = equipments.filter((eq) => {
    const matchSearch =
      eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.cod_patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.sala.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.setor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || eq.status === filterStatus;
    return matchSearch && matchStatus;
  });
  const getStatusColor = (status) => {
    const colors = {
      Operacional: 'bg-green-100 text-green-800',
      Manutenção: 'bg-yellow-100 text-yellow-800',
      Inativo: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Equipamentos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cadastro e controle de equipamentos das salas/setores
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Fechar
          </button>
        </div>

        <div className="p-6">
          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Cancelar' : 'Adicionar Equipamento'}
            </button>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por tipo, patrimônio, sala ou setor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Operacional">Operacional</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Equipamento *
                    </label>
                    <select
                      required
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Desktop">Desktop</option>
                      <option value="Notebook">Notebook</option>
                      <option value="Impressora">Impressora</option>
                      <option value="Teclado">Teclado</option>
                      <option value="Mouse">Mouse</option>
                      <option value="Headset">Headset</option>
                      <option value="Datashow">Datashow</option>
                      <option value="Aparelho de Som">Aparelho de Som</option>
                      <option value="Rede">Rede</option>
                      <option value="Monitor">Monitor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Patrimônio *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cod_patrimonio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cod_patrimonio: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: PAT-001234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Máquina
                    </label>
                    <input
                      type="text"
                      value={formData.numero_maquina}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numero_maquina: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: PC-01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sala *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sala}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sala: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Sala 201"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Setor *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.setor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          setor: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Administrativo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Operacional">Operacional</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descricao: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Desktop Dell Inspiron i5 8GB RAM"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    {editingEquipment ? 'Salvar Alterações' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Equipment List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patrimônio/Máquina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sala
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Setor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEquipments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Nenhum equipamento encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredEquipments.map((equipment) => {
                      const Icon = equipmentIcons[equipment.tipo] || Monitor;
                      return (
                        <tr
                          key={equipment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Icon className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {equipment.tipo}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {equipment.cod_patrimonio}
                            </div>
                            {equipment.numero_maquina && (
                              <div className="text-xs text-gray-500">
                                {equipment.numero_maquina}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {equipment.sala}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {equipment.setor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}
                            >
                              {equipment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {equipment.descricao}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(equipment)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(equipment.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Total de equipamentos: {filteredEquipments.length}
          </div>
        </div>
      </div>
    </div>
  );
}
