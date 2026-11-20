// src/components/AdminNav.jsx
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { AREAS_ADMIN, ehAdmin } from '../utils/perfis';

// Atalho só para a conta ADMIN: troca de área (Funcionário, Aprovador, Suporte, Gestor...)
// sem precisar sair da conta. Para os outros perfis não aparece nada.
export function AdminNav() {
  const { perfil } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!ehAdmin(perfil)) return null;

  const atual = AREAS_ADMIN.find((a) => pathname.startsWith(a.rota))?.rota ?? '';

  return (
    <label
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
      title="Área do administrador"
    >
      <ShieldCheck className="w-4 h-4" />
      <span className="hidden sm:inline">Admin</span>
      <select
        value={atual}
        onChange={(e) => e.target.value && navigate(e.target.value)}
        className="bg-transparent outline-none cursor-pointer"
      >
        <option value="" disabled>
          Ir para...
        </option>
        {AREAS_ADMIN.map((a) => (
          <option key={a.rota} value={a.rota} className="text-gray-900">
            {a.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

export default AdminNav;