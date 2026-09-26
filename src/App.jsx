import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { api } from './services/api';
import { LoginPage } from './pages/login/LoginPage';
import { OAuth2RedirectHandler } from './pages/login/OAuth2RedirectHandler';
import { HomePage } from './pages/home/HomePage';
import { TopBar } from './components/TopBar';
import { TicketForm } from './pages/helpdesk/components/TicketForm';
import { TicketList } from './pages/helpdesk/components/TicketList';
import { ApproverDashboard } from './pages/approver/ApproverDashboard';
import { SupportDashboard } from './pages/support/SupportDashboard';
import { ManagementPortal } from './pages/management/ManagementPortal';
import { WebmailPage } from './pages/webmail/WebmailPage';
import { CandidatePage } from './pages/candidate/CandidatePage';
import { FileText, List, ArrowLeft } from 'lucide-react';
import ChamadosPage from './pages/chamados/ChamadosPage';

// Conteúdo do HelpTec depois do login. Fica atrás do PrivateRoute - o
// usuário autenticado vem do AuthContext (JWT emitido pelo backend), não
// mais de um e-mail digitado à mão.
function HelpTecApp() {
  const { user, logout } = useAuth();
  const userEmail = user?.email;
  const [userType, setUserType] = useState('funcionario');
  const [currentPage, setCurrentPage] = useState('home');
  const [activeTab, setActiveTab] = useState('new');
  const [tickets, setTickets] = useState([]);

  // Chamados agora vêm do backend (ChamadoController), não de estado local.
  useEffect(() => {
    api
      .get('/api/chamados')
      .then((res) => setTickets(res.data))
      .catch((err) => console.error('Falha ao carregar chamados:', err));
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  // Navegação central usada pelo menu, disponível em qualquer página
  const handleNavigate = (itemId) => {
    if (itemId === 'portal') setCurrentPage('home');
    else if (itemId === 'helpdesk') setCurrentPage('helpdesk');
    else if (itemId === 'approver') setCurrentPage('approver');
    else if (itemId === 'support') setCurrentPage('support');
    else if (itemId === 'management') setCurrentPage('management');
    else if (itemId === 'webmail') setCurrentPage('webmail');
    else if (itemId === 'candidato') setCurrentPage('candidato');
  };

  const handleAddTicket = (ticket) => {
    api
      .post('/api/chamados', ticket)
      .then((res) => {
        setTickets((prev) => [res.data, ...prev]);
        setActiveTab('list');
      })
      .catch((err) => console.error('Falha ao abrir chamado:', err));
  };

  const handleUpdateTicket = (id, updates) => {
    api
      .patch(`/api/chamados/${id}`, updates)
      .then((res) => {
        setTickets((prev) =>
          prev.map((ticket) => (ticket.id_chamado === id ? res.data : ticket)),
        );
      })
      .catch((err) => console.error('Falha ao atualizar chamado:', err));
  };

  if (currentPage === 'home') {
    return (
      <HomePage
        userEmail={userEmail}
        onLogout={handleLogout}
        userType={userType}
        onUserTypeChange={setUserType}
        onNavigate={handleNavigate}
        onNavigateToHelpDesk={() => setCurrentPage('helpdesk')}
      />
    );
  }
  if (currentPage === 'approver') {
    return (
      <ApproverDashboard
        tickets={tickets}
        onUpdateTicket={handleUpdateTicket}
        onBack={() => setCurrentPage('home')}
        userEmail={userEmail}
        onLogout={handleLogout}
        userType={userType}
        onUserTypeChange={setUserType}
        onNavigate={handleNavigate}
      />
    );
  }
  if (currentPage === 'support') {
    return (
      <SupportDashboard
        tickets={tickets}
        onUpdateTicket={handleUpdateTicket}
        onBack={() => setCurrentPage('home')}
        userEmail={userEmail}
        onLogout={handleLogout}
        userType={userType}
        onUserTypeChange={setUserType}
        onNavigate={handleNavigate}
      />
    );
  }
  if (currentPage === 'management') {
    return (
      <ManagementPortal
        tickets={tickets}
        onUpdateTicket={handleUpdateTicket}
        onBack={() => setCurrentPage('home')}
        userEmail={userEmail}
        onLogout={handleLogout}
        userType={userType}
        onUserTypeChange={setUserType}
        onNavigate={handleNavigate}
      />
    );
  }
  if (currentPage === 'webmail') {
    return (
      <WebmailPage
        onBack={() => setCurrentPage('home')}
        userEmail={userEmail}
        onLogout={handleLogout}
        userType={userType}
        onUserTypeChange={setUserType}
        onNavigate={handleNavigate}
      />
    );
  }
  if (currentPage === 'candidato') {
    return (
      <CandidatePage
        onBack={() => setCurrentPage('home')}
        userEmail={userEmail}
        onLogout={handleLogout}
        userType={userType}
        onUserTypeChange={setUserType}
        onNavigate={handleNavigate}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Help Desk
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Portal do Solicitante
                </p>
              </div>
            </div>
            <TopBar
              userEmail={userEmail}
              onLogout={handleLogout}
              userType={userType}
              onUserTypeChange={setUserType}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
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
                {tickets.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'new' ? (
          <TicketForm onSubmit={handleAddTicket} />
        ) : (
          <TicketList tickets={tickets} onUpdateTicket={handleUpdateTicket} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chamados" element={<ChamadosPage />} />

          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <HelpTecApp />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
