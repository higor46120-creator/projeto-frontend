import { useState } from 'react';
import {
  ChevronDown,
  User,
  Home,
  Mail, // Mantido apenas para o ícone do array MENUS
  FileText,
  Briefcase,
  Gavel,
  Headphones,
  Eye,
  CheckSquare,
  Wrench,
  BarChart3,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const MENUS = {
  funcionario: [
    { id: 'helpdesk', label: 'HELP DESK', icon: Headphones },
    { id: 'webmail', label: 'WEBMAIL', icon: Mail },
    { id: 'candidato', label: 'PERFIL', icon: User },
    { id: 'processos', label: 'PROCESSOS SELETIVOS', icon: Briefcase },
    { id: 'licitacoes', label: 'LICITAÇÕES', icon: Gavel },
    { id: 'ouvidoria', label: 'OUVIDORIA', icon: FileText },
    { id: 'transparencia', label: 'TRANSPARÊNCIA', icon: Eye },
  ],
  aprovador: [
    { id: 'helpdesk', label: 'HELP DESK', icon: Headphones },
    { id: 'approver', label: 'ÁREA DO APROVADOR', icon: CheckSquare },
    { id: 'webmail', label: 'WEBMAIL', icon: Mail },
    { id: 'candidato', label: 'PERFIL', icon: User },
  ],
  suporte: [
    { id: 'helpdesk', label: 'HELP DESK', icon: Headphones },
    { id: 'support', label: 'ÁREA DO SUPORTE', icon: Wrench },
    { id: 'webmail', label: 'WEBMAIL', icon: Mail },
    { id: 'candidato', label: 'PERFIL', icon: User },
  ],
  gestor: [
    { id: 'helpdesk', label: 'HELP DESK', icon: Headphones },
    { id: 'management', label: 'PORTAL DE GERENCIAMENTO', icon: BarChart3 },
    { id: 'webmail', label: 'WEBMAIL', icon: Mail },
    { id: 'candidato', label: 'PERFIL', icon: User },
  ],
};

const USER_TYPE_LABELS = {
  funcionario: 'Funcionário',
  aprovador: 'Aprovador',
  suporte: 'Suporte',
  gestor: 'Gestor',
};

export function TopBar({
  userEmail,
  onLogout,
  userRole, 
  onNavigate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const safeRole = MENUS[userRole] ? userRole : 'funcionario';
  const menuItems = MENUS[safeRole];

  const handleMenuClick = (itemId) => {
    onNavigate(itemId);
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      
      {/* Alternar modo claro/escuro */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Etiqueta Visual do Cargo */}
      <div className="px-3 py-1.5 ml-2 bg-indigo-50 text-indigo-700 text-sm font-bold tracking-wide rounded-md capitalize border border-indigo-100 shadow-sm">
        {USER_TYPE_LABELS[safeRole] || safeRole}
      </div>

      {/* Botão de Sair */}
      <button
        onClick={onLogout}
        title="Sair"
        className="flex items-center gap-2 px-3 py-2 ml-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>

      {/* Menu Dropdown de Navegação */}
      <div className="relative ml-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <User className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">MENU</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}