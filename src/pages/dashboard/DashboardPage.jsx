import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  PlusCircle,
  CheckCircle,
  Headphones,
  User,
  Mail,
} from 'lucide-react';

// Um botão para cada página do sistema
const PAGINAS = [
  {
    rota: '/meus-chamados',
    titulo: 'Meus Chamados',
    descricao: 'Abrir um chamado e acompanhar os seus',
    icone: PlusCircle,
    cor: 'from-sky-500 to-blue-600',
  },
  {
    rota: '/chamados',
    titulo: 'Todos os Chamados',
    descricao: 'Lista geral com busca, filtro e paginação',
    icone: ClipboardList,
    cor: 'from-purple-500 to-fuchsia-600',
  },
  {
    rota: '/aprovador',
    titulo: 'Área do Aprovador',
    descricao: 'Aprovar ou reprovar chamados pendentes',
    icone: CheckCircle,
    cor: 'from-emerald-500 to-teal-600',
  },
  {
    rota: '/suporte',
    titulo: 'Área do Suporte',
    descricao: 'Fila de atendimento e gestão de equipamentos',
    icone: Headphones,
    cor: 'from-amber-500 to-orange-600',
  },
  {
    rota: '/candidato',
    titulo: 'Candidatos',
    descricao: 'Perfis e dados dos candidatos',
    icone: User,
    cor: 'from-rose-500 to-pink-600',
  },
  {
    rota: '/webmail',
    titulo: 'Webmail',
    descricao: 'Caixa de entrada, enviados e rascunhos',
    icone: Mail,
    cor: 'from-indigo-500 to-violet-600',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white">HelpTec</h1>
        <p className="text-sm text-gray-400 mt-1 mb-8">Escolha uma área para acessar</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAGINAS.map(({ rota, titulo, descricao, icone: Icone, cor }) => (
            <button
              key={rota}
              onClick={() => navigate(rota)}
              className="group text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 p-5 transition-all duration-200"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${cor} shadow-lg mb-4`}
              >
                <Icone className="w-6 h-6 text-white" />
              </span>
              <h2 className="text-lg font-semibold text-white">{titulo}</h2>
              <p className="text-sm text-gray-400 mt-1">{descricao}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}