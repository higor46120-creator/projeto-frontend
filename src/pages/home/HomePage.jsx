import { Headphones, FileText, Building, Eye } from 'lucide-react';
import { TopBar } from '../../components/TopBar';
import bannerImageDark from '../../imports/eusoufiec-banner-full.jpg';
import bannerImageLight from '../../imports/eusoufiec-banner-light.jpg';
import fiecLogo from '../../assets/fiec-logo.jpeg';
export function HomePage({
  onNavigateToHelpDesk,
  userEmail,
  onLogout,
  userType,
  onUserTypeChange,
  onNavigate,
}) {
  const handleNavigate = (itemId) => {
    if (itemId === 'helpdesk') {
      onNavigateToHelpDesk();
    } else {
      onNavigate(itemId);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#e6dce8] shadow-sm border-b border-[#d9cbdc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src={fiecLogo}
                alt="HelpTec"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold text-gray-800 hidden sm:inline">
                HelpTec
              </span>
            </div>

            <TopBar
              userEmail={userEmail}
              onLogout={onLogout}
              userType={userType}
              onUserTypeChange={onUserTypeChange}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </header>

      {/* Hero Section — ocupa a tela inteira abaixo do cabeçalho
          (min-h-[calc(100vh-4rem)]). A imagem preenche 100% da seção
          (w-full h-full + object-cover), cobrindo toda a tela SEM
          distorcer — object-cover preserva a proporção original da
          imagem e apenas recorta o excesso, nunca estica/achata. */}
      <div className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Imagem do modo claro (some no escuro) */}
        <img
          src={bannerImageLight}
          alt="#EuSouFIEC"
          className="block dark:hidden absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Imagem do modo escuro (some no claro) */}
        <img
          src={bannerImageDark}
          alt="#EuSouFIEC"
          className="hidden dark:block absolute inset-0 w-full h-full object-cover object-center"
        />

        <div className="relative z-10 w-full min-h-[calc(100vh-4rem)]">
          {/* Links rápidos — flutuando em cards de vidro fosco sobre a foto.
              Posição subida (bottom maior) para ficar logo abaixo do texto
              "#EuSouFIEC", no lugar onde os botões falsos foram removidos
              da imagem. */}
          <div className="absolute inset-x-0 bottom-[30%] sm:bottom-[32%] md:bottom-[34%] z-20 px-4 sm:px-8 md:px-16">
            <h3 className="sr-only">Links rápidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-6xl mx-auto">
              <button
                onClick={onNavigateToHelpDesk}
                className="bg-black/35 backdrop-blur-md p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/15 shadow-[0_0_25px_-8px_rgba(168,85,247,0.55)] hover:bg-black/45 hover:border-white/25 transition-all group text-center"
              >
                <div className="w-9 h-9 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500/30 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 ring-1 ring-purple-300/30">
                  <Headphones className="w-4 h-4 sm:w-6 sm:h-6 text-purple-200" />
                </div>
                <p className="text-[11px] sm:text-sm font-medium text-white drop-shadow-sm">
                  Chamados
                </p>
              </button>

              <button
                onClick={() => handleNavigate('programas-participativos')}
                className="bg-black/35 backdrop-blur-md p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/15 shadow-[0_0_25px_-8px_rgba(239,68,68,0.55)] hover:bg-black/45 hover:border-white/25 transition-all group text-center"
              >
                <div className="w-9 h-9 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500/30 to-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 ring-1 ring-red-300/30">
                  <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-red-200" />
                </div>
                <p className="text-[11px] sm:text-sm font-medium text-white drop-shadow-sm">
                  Programas Participativos
                </p>
              </button>

              <button
                onClick={() => handleNavigate('senai-acoes-inclusivas')}
                className="bg-black/35 backdrop-blur-md p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/15 shadow-[0_0_25px_-8px_rgba(217,119,6,0.55)] hover:bg-black/45 hover:border-white/25 transition-all group text-center"
              >
                <div className="w-9 h-9 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500/30 to-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 ring-1 ring-amber-300/30">
                  <Building className="w-4 h-4 sm:w-6 sm:h-6 text-amber-200" />
                </div>
                <p className="text-[11px] sm:text-sm font-medium text-white drop-shadow-sm">
                  Programa Senai de Ações Inclusivas
                </p>
              </button>

              <button
                onClick={() => handleNavigate('transparencia')}
                className="bg-black/35 backdrop-blur-md p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/15 shadow-[0_0_25px_-8px_rgba(37,99,235,0.55)] hover:bg-black/45 hover:border-white/25 transition-all group text-center"
              >
                <div className="w-9 h-9 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/30 to-sky-400/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 ring-1 ring-blue-300/30">
                  <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-blue-200" />
                </div>
                <p className="text-[11px] sm:text-sm font-medium text-white drop-shadow-sm">
                  Transparência
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
