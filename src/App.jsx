import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { api } from './services/api';

// Páginas
import { LoginPage } from './pages/login/LoginPage';
import { OAuth2RedirectHandler } from './pages/login/OAuth2RedirectHandler';
import { TicketForm } from './pages/helpdesk/components/TicketForm';
import { TicketList } from './pages/helpdesk/components/TicketList';
import { ApproverDashboard } from './pages/approver/ApproverDashboard';
import { SupportDashboard } from './pages/support/SupportDashboard';
import { ManagementPortal } from './pages/management/ManagementPortal';
import { WebmailPage } from './pages/webmail/WebmailPage';
import { CandidatePage } from './pages/candidate/CandidatePage';
import ChamadosPage from './pages/chamados/ChamadosPage';

// Componentes
import { TopBar } from './components/TopBar';
import { SplashScreen } from './components/SplashScreen'; 
import { FileText, List } from 'lucide-react';

// ✅ O HelpDesk agora é a rota raiz '/'
const PAGE_PATHS = {
  helpdesk: '/', 
  approver: '/aprovador',
  support: '/suporte',
  management: '/gestao',
  webmail: '/webmail',
  candidato: '/candidato',
};

const PATH_PAGES = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page]),
);

function extractTickets(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.itens)) return data.itens;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function HelpTecApp() {
  const { user, logout } = useAuth();
  const userEmail = user?.email;
  const userRole = user?.role?.toLowerCase() || 'funcionario';

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  const currentPage = PATH_PAGES[pathname];
  const setCurrentPage = (page) => navigate(PAGE_PATHS[page] ?? '/');
  
  const [activeTab, setActiveTab] = useState('new');
  const [isInitializing, setIsInitializing] = useState(pathname === '/');
  
  // ==========================================
  // POLÍCIA DE TRÂNSITO (Redirecionamento Automático)
  // ==========================================
  useEffect(() => {
    if (!isInitializing && pathname === '/') {
      switch (userRole) {
        case 'gestor':
          navigate('/gestao', { replace: true });
          break;
        case 'suporte':
          navigate('/suporte', { replace: true });
          break;
        case 'aprovador':
          navigate('/aprovador', { replace: true });
          break;
        case 'funcionario':
        default:
          // Permanece na raiz ('/'), que agora é o HelpDesk
          break;
      }
    }
  }, [isInitializing, pathname, userRole, navigate]);

  // ==========================================
  // ESTADOS PERSISTENTES (LocalStorage)
  // ==========================================
  const [tickets, setTickets] = useState(() => {
    const salvos = localStorage.getItem('@helptec-tickets-oficiais');
    return salvos ? JSON.parse(salvos) : [];
  });

  useEffect(() => {
    localStorage.setItem('@helptec-tickets-oficiais', JSON.stringify(tickets));
  }, [tickets]);

  const [chamadosPendentes, setChamadosPendentes] = useState(() => {
    const salvos = localStorage.getItem('@helptec-pendentes');
    return salvos ? JSON.parse(salvos) : [];
  });

  useEffect(() => {
    localStorage.setItem('@helptec-pendentes', JSON.stringify(chamadosPendentes));
  }, [chamadosPendentes]);

  // Busca inicial da API
  useEffect(() => {
    const isMockModeAtivo = localStorage.getItem('@helptec-modo-dev') === 'true';
    if (isMockModeAtivo) return; 

    api
      .get('/api/chamados')
      .then((res) => setTickets(extractTickets(res.data)))
      .catch((err) => console.error('Falha ao carregar chamados:', err));
  }, []);

  // Bloqueio Visual da Splash Screen
  if (isInitializing) {
    return <SplashScreen onFinish={() => setIsInitializing(false)} />;
  }

  // Lógica de Funções e Navegação
  const handleLogout = () => {
    localStorage.removeItem('@helptec-modo-dev');
    logout();
    setCurrentPage('helpdesk');
  };

  const handleNavigate = (itemId) => {
    if (itemId === 'portal' || itemId === 'helpdesk') setCurrentPage('helpdesk');
    else if (itemId === 'approver') setCurrentPage('approver');
    else if (itemId === 'support') setCurrentPage('support');
    else if (itemId === 'management') setCurrentPage('management');
    else if (itemId === 'webmail') setCurrentPage('webmail');
    else if (itemId === 'candidato') setCurrentPage('candidato');
  };

  const handleAddTicket = (ticket) => {
    const geradorId = window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const novoPendente = { ...ticket, id_local: geradorId, id_chamado: geradorId, status: 'Pendente', data_abertura: new Date().toISOString(), isPendente: true };
    setChamadosPendentes((prev) => [novoPendente, ...prev]);
    setActiveTab('list');
  };

  const handleConfirmarPendente = (chamadoLocal) => {
    const isMockModeAtivo = localStorage.getItem('@helptec-modo-dev') === 'true';
    const { id_local, isPendente, id_chamado, status, data_abertura, ...dadosParaAPI } = chamadoLocal;

    if (isMockModeAtivo) {
      const chamadoSimulado = { ...dadosParaAPI, id_chamado: id_local, status: 'Aberto', data_abertura: new Date().toISOString() };
      setTickets((prev) => [chamadoSimulado, ...prev]);
      handleDeletarPendente(id_local);
      alert('🚧 MODO DEV: Chamado confirmado localmente!');
      return; 
    }

    api
      .post('/api/chamados', dadosParaAPI)
      .then((res) => {
        setTickets((prev) => [res.data, ...prev]); 
        handleDeletarPendente(id_local);
        alert('Chamado confirmado e enviado para a área de Aprovação!');
      })
      .catch((err) => console.error(err));
  };

  const handleDeletarPendente = (id_local) => {
    setChamadosPendentes((prev) => prev.filter(t => t.id_local !== id_local));
  };

  const handleUpdateTicket = (id, updates) => {
    const isMockModeAtivo = localStorage.getItem('@helptec-modo-dev') === 'true';
    if (isMockModeAtivo) {
      setTickets((prev) => prev.map((ticket) => (ticket.id_chamado === id ? { ...ticket, ...updates } : ticket)));
      return;
    }
    api.patch(`/api/chamados/${id}`, updates).then((res) => {
      setTickets((prev) => prev.map((ticket) => (ticket.id_chamado === id ? res.data : ticket)));
    });
  };

  // ==========================================
  // ROTEAMENTO DE COMPONENTES DE DASHBOARD
  // ==========================================
  if (!currentPage) return <Navigate to="/" replace />;
  
  // ✅ Removido o if da 'home'. Os botões onBack agora voltam para 'helpdesk'
  if (currentPage === 'approver') return <ApproverDashboard tickets={tickets} onUpdateTicket={handleUpdateTicket} onBack={() => setCurrentPage('helpdesk')} userEmail={userEmail} onLogout={handleLogout} userType={userRole} onNavigate={handleNavigate} />;
  if (currentPage === 'support') return <SupportDashboard tickets={tickets} onUpdateTicket={handleUpdateTicket} onBack={() => setCurrentPage('helpdesk')} userEmail={userEmail} onLogout={handleLogout} userType={userRole} onNavigate={handleNavigate} />;
  if (currentPage === 'management') return <ManagementPortal tickets={tickets} onUpdateTicket={handleUpdateTicket} onBack={() => setCurrentPage('helpdesk')} userEmail={userEmail} onLogout={handleLogout} userType={userRole} onNavigate={handleNavigate} />;
  if (currentPage === 'webmail') return <WebmailPage onBack={() => setCurrentPage('helpdesk')} userEmail={userEmail} onLogout={handleLogout} userType={userRole} onNavigate={handleNavigate} />;
  if (currentPage === 'candidato') return <CandidatePage onBack={() => setCurrentPage('helpdesk')} userEmail={userEmail} onLogout={handleLogout} userType={userRole} onNavigate={handleNavigate} />;

  // ==========================================
  // RENDERIZAÇÃO PADRÃO (A Rota Raiz: HelpDesk)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Help Desk</h1>
                <p className="text-sm text-gray-500 mt-1">Portal do Solicitante</p>
              </div>
            </div>
            <TopBar userEmail={userEmail} onLogout={handleLogout} userRole={userRole} onNavigate={handleNavigate} />
          </div>
        </div>
      </header>
      
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${activeTab === 'new' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Abrir Chamado</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <List className="w-5 h-5" />
              <span className="font-medium">Meus Chamados</span>
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {tickets.length + chamadosPendentes.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'new' ? (
          <TicketForm onSubmit={handleAddTicket} />
        ) : (
          <TicketList 
            tickets={[...chamadosPendentes, ...tickets]} 
            onUpdateTicket={handleUpdateTicket} 
            onConfirmTicket={handleConfirmarPendente}
            onDeletePending={handleDeletarPendente}
          />
        )}
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isMockMode = localStorage.getItem('@helptec-modo-dev') === 'true';

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chamados" element={<ChamadosPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        
        <Route
          path="/*"
          element={
            isMockMode ? (
              <HelpTecApp />
            ) : (
              <PrivateRoute>
                <HelpTecApp />
              </PrivateRoute>
            )
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}