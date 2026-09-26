import { useState } from 'react';
import { z } from 'zod';
import { FormField } from '../../../shared/components/FormField';
import { authService } from '../../../services/authService';

// Definindo os schemas do Zod para cada campo
const emailSchema = z.string().email("Digite um e-mail válido.");
const passwordSchema = z.string().min(6, "A senha deve ter no mínimo 6 caracteres.");

const LoginFormComponent = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manipulador genérico para atualizar os campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submissão real integrada com o authService
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validação local extra com Zod antes de chamar a API
    const isEmailValid = emailSchema.safeParse(form.email).success;
    const isPasswordValid = passwordSchema.safeParse(form.password).success;

    if (!isEmailValid || !isPasswordValid) {
      setError("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);

    try {
      // Chamada real para a API através do authService (POST /api/v1/auth/login)
      const data = await authService.login({
        email: form.email,
        password: form.password,
      });

      // Armazena o token JWT se retornado pela API
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      // Callback opcional de sucesso (ex: redirecionar página)
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error("Erro ao autenticar usuário:", err);
      setError(
        err.response?.data?.message || 
        "Falha ao realizar login. Verifique suas credenciais e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 flex items-center justify-center">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Acesse sua Conta</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Entre com suas credenciais para continuar.
          </p>
        </div>

        {/* Exibição de Erros da API/Validação */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <FormField
          label="E-mail"
          name="email"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={handleChange}
          schema={emailSchema}
          required
        />

        <FormField
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          schema={passwordSchema}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm focus:ring-4 focus:ring-indigo-600/20 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Entrando...</span>
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginFormComponent;