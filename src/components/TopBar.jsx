import { useState } from 'react';
import {
  ChevronDown,
  User,
  Home,
  Mail,
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
  Bell,
  BellOff,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useFirebaseMessaging } from '../hooks/useFirebaseMessaging';

const MENUS = {
  funcionario: [
    { id: 'portal', label: 'PORTAL DO SERVIDOR', icon: Home },
    { id: 'helpdesk', label: 'HELP DESK', icon: Headphones },
    { id: 'webmail', label: 'WEBMAIL', icon: Mail },
    { id: 'candidato', label: 'PERFIL', icon: User },
    { id: 'processos', label: 'PROCESSOS SELETIVOS', icon: Briefcase },
    { id: 'licitacoes', label: 'LICITAÇÕES', icon: Gavel },
    { id: 'atendimento', label: 'ATENDIMENTO', icon: Headphones },
    { id: 'ouvidoria', label: 'OUVIDORIA', icon: FileText },
    { id: 'transparencia', label: 'TRANSPARÊNCIA', icon: Eye },
  ],
  aprovador: [
    { id: 'portal', label: 'PORTAL DO SERVIDOR', icon: Home },
    { id: 'approver', label: 'ÁREA DO APROVADOR', icon: CheckSquare },
    { id: 'webmail', label: 'WEBMAIL', icon: Mail },
    { id: 'candidato', label: 'PERFIL', icon: User },
  ],
  suporte: [
    { id: 'portal', label: 'PORTAL DO SERVIDOR', icon: Home },
    { id: 'support', label: 'ÁREA DO SUPORTE', icon: Wrench },
    { id: 'webmail', label: 'WEBMAIL', icon: Mail },
    { id: 'candidato', label: 'PERFIL', icon: User },
  ],
  gestor: [
    { id: 'portal', label: 'PORTAL DO SERVIDOR', icon: Home },
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

// ✅ MODIFICADO: Recebe userRole em vez de userType, e remove onUserTypeChange
export function TopBar({
  userEmail,
  onLogout,
  userRole, 
  onNavigate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  
  const { permission, requestPermission, error } = useFirebaseMessaging({
    onForegroundMessage: (payload) => {
      const title = payload?.notification?.title || 'Nova notificação';
      const body = payload?.notification?.body || '';
      alert(body ? `${title}\n${body}` : title);
    },
  });
  
  // Garantia de segurança: se o backend enviar um cargo desconhecido, usa 'funcionario'
  const safeRole = MENUS[userRole] ? userRole : 'funcionario';
  const menuItems = MENUS[safeRole];

  const handleMenuClick = (itemId) => {
    onNavigate(itemId);
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
        <Mail className="w-4 h-4 text-gray-400" />
        <span className="max-w-[180px] truncate">{userEmail}</span>
      </div>

      <button
        onClick={toggleTheme}
        title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button
        onClick={permission !== 'granted' ? requestPermission : undefined}
        title={
          permission === 'granted'
            ? 'Notificações ativadas'
            : permission === 'denied'
              ? 'Notificações bloqueadas no navegador'
              : 'Ativar notificações'
        }
        disabled={permission === 'denied'}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          permission === 'granted'
            ? 'bg-purple-100 text-purple-700'
            : permission === 'denied'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {permission === 'denied' ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
      </button>
      {error && (
        <span className="hidden lg:inline text-xs text-red-500 max-w-[160px] truncate" title={error}>
          {error}
        </span>
      )}

      {/* ✅ ADICIONADO: Em vez do <select>, mostramos a etiqueta com o Cargo real da API */}
      <div className="px-3 py-1.5 ml-2 bg-indigo-50 text-indigo-700 text-sm font-bold tracking-wide rounded-md capitalize border border-indigo-100 shadow-sm">
        {USER_TYPE_LABELS[safeRole] || safeRole}
      </div>

      <button
        onClick={onLogout}
        title="Sair"
        className="flex items-center gap-2 px-3 py-2 ml-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>

      {/* Menu Dropdown mantido intacto */}
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