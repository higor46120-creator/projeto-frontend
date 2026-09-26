import { useState } from 'react';
import { z } from 'zod';
import { FormField } from '../../../shared/components/FormField';
import { authService } from '../../../services/authService';

// --- SCHEMAS DE VALIDAÇÃO ZOD ---
const nomeSchema = z.string().min(3, "O nome deve ter no mínimo 3 caracteres.");
const emailSchema = z.string().email("Digite um e-mail válido.");
const passwordSchema = z.string().min(6, "A senha deve ter no mínimo 6 caracteres.");
const telefoneSchema = z.string().min(10, "Informe um telefone válido (mínimo 10 dígitos).");
const cepSchema = z.string().min(8, "O CEP deve ter pelo menos 8 dígitos.");
const numeroSchema = z.string().min(1, "Informe o número da residência.");

const RegisterFormComponent = ({ onSuccess }) => {
  const [basicInfo, setBasicInfo] = useState({ 
    nome: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });

  const [additionalInfo, setAdditionalInfo] = useState({ 
    telefone: "", 
    cep: "", 
    numero: "", 
    foto: null, 
    fotoPreview: "" 
  });

  const [isBasicInfo, setIsBasicInfo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manipuladores de mudança
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalChange = (e) => {
    const { name, value } = e.target;
    setAdditionalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdditionalInfo(prev => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file)
      }));
    }
  };

  // Erro customizado para confirmação de senha
  const passwordError = 
    basicInfo.confirmPassword && basicInfo.password !== basicInfo.confirmPassword 
      ? "As senhas não coincidem." 
      : "";

  // Transição de etapa com validação
  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);

    const isNomeValid = nomeSchema.safeParse(basicInfo.nome).success;
    const isEmailValid = emailSchema.safeParse(basicInfo.email).success;
    const isPasswordValid = passwordSchema.safeParse(basicInfo.password).success;
    const isPasswordMatch = basicInfo.password === basicInfo.confirmPassword;

    if (!isNomeValid || !isEmailValid || !isPasswordValid || !isPasswordMatch) {
      setError("Por favor, corrija os erros no formulário antes de continuar.");
      return;
    }

    setIsBasicInfo(false);
  };

  // Envio final via authService
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const isTelefoneValid = telefoneSchema.safeParse(additionalInfo.telefone).success;
    const isCepValid = cepSchema.safeParse(additionalInfo.cep).success;
    const isNumeroValid = numeroSchema.safeParse(additionalInfo.numero).success;

    if (!isTelefoneValid || !isCepValid || !isNumeroValid) {
      setError("Por favor, preencha corretamente as informações adicionais.");
      return;
    }

    setLoading(true);

    try {
      // Todos os dados "de texto" vão juntos em um único objeto, serializado
      // como um Blob JSON dentro do FormData — padrão comum para endpoints
      // Spring com @RequestPart.
      //
      // OBS: telefone, cep e numero já são coletados e validados na tela
      // (etapa 2), mas o backend ainda não tem esses campos no endpoint de
      // registro — por isso não são enviados aqui por enquanto.
      const dadosUsuario = {
        nome: basicInfo.nome,
        email: basicInfo.email,
        password: basicInfo.password,
        fcmToken: "",
      };

      const formData = new FormData();
      formData.append(
        'dadosUsuario',
        new Blob([JSON.stringify(dadosUsuario)], { type: 'application/json' })
      );

      // A foto só é anexada se o usuário selecionou um arquivo (é opcional).
      if (additionalInfo.foto) {
        formData.append('foto', additionalInfo.foto);
      }

      // Chamada real para a API via authService (POST /api/v1/auth/register)
      const data = await authService.register(formData);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error("Erro ao realizar cadastro:", err);
      setError(
        err.response?.data?.message || 
        "Falha ao realizar cadastro. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Criar Conta</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Etapa {isBasicInfo ? '1 de 2: Dados Pessoais' : '2 de 2: Endereço e Foto'}
          </p>
        </div>

        {/* Exibição de Mensagens de Erro */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {isBasicInfo ? (
          /* --- ETAPA 1: INFORMAÇÕES BÁSICAS --- */
          <form onSubmit={handleNextStep}>
            <FormField
              label="Nome Completo"
              name="nome"
              placeholder="Ex: Ana Silva"
              value={basicInfo.nome}
              onChange={handleBasicChange}
              schema={nomeSchema}
              required
            />

            <FormField
              label="E-mail"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={basicInfo.email}
              onChange={handleBasicChange}
              schema={emailSchema}
              required
            />

            <FormField
              label="Senha"
              name="password"
              type="password"
              placeholder="••••••••"
              value={basicInfo.password}
              onChange={handleBasicChange}
              schema={passwordSchema}
              required
            />

            <FormField
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={basicInfo.confirmPassword}
              onChange={handleBasicChange}
              errorText={passwordError}
              required
            />

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm focus:ring-4 focus:ring-indigo-600/20 active:bg-indigo-800"
            >
              Próximo
            </button>
          </form>
        ) : (
          /* --- ETAPA 2: INFORMAÇÕES ADICIONAIS --- */
          <form onSubmit={handleSubmit}>
            <FormField
              label="Telefone"
              name="telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={additionalInfo.telefone}
              onChange={handleAdditionalChange}
              schema={telefoneSchema}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <FormField
                  label="CEP"
                  name="cep"
                  placeholder="00000-000"
                  value={additionalInfo.cep}
                  onChange={handleAdditionalChange}
                  schema={cepSchema}
                  required
                />
              </div>

              <FormField
                label="Número"
                name="numero"
                placeholder="123"
                value={additionalInfo.numero}
                onChange={handleAdditionalChange}
                schema={numeroSchema}
                required
              />
            </div>

            {/* Input para Upload de Foto */}
            <div className="mb-4">
              <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                Foto de Perfil
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-indigo-400 cursor-pointer"
              />

              {/* Preview da foto */}
              {additionalInfo.fotoPreview && (
                <div className="mt-3 flex flex-col items-center">
                  <p className="text-xs text-slate-500 mb-1">Pré-visualização:</p>
                  <img
                    src={additionalInfo.fotoPreview}
                    alt="Preview da foto selecionada"
                    className="w-24 h-24 object-cover rounded-full border-2 border-indigo-600 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Ações / Botões */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsBasicInfo(true);
                }}
                disabled={loading}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Voltar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm focus:ring-4 focus:ring-indigo-600/20 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  'Cadastrar'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterFormComponent;