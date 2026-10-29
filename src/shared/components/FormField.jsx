import React, { useState } from 'react';

export const FormField = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  validation,
  errorText
}) => {
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    // Atualiza o estado no componente pai (Login ou Cadastro)
    onChange(e); 

    // Valida o valor com o Zod em tempo real
    if (validation) {
      const result = validation.safeParse(e.target.value);
      if (!result.success) {
        setLocalError(result.error.issues[0].message);
      } else {
        setLocalError("");
      }
    }
  };

  // Dá prioridade a erros forçados pelo pai (ex: senhas não coincidem ou clique no botão)
  const displayError = errorText || localError;

  // Estilo da borda em gradiente (ou vermelha em caso de erro)
  const borderStyle = displayError
    ? {
        background: '#050505',
        border: '2px solid #ff3b6b',
        boxShadow: '0 0 12px rgba(255, 59, 107, 0.25)'
      }
    : {
        background: 'linear-gradient(#050505, #050505) padding-box, linear-gradient(90deg, #1e3a8a, #be123c) border-box',
        border: '2px solid transparent'
      };

  return (
    <div className="w-full text-left" style={{ marginBottom: '1.35rem' }}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-[#ccc]"
        style={{ marginBottom: '0.45rem' }}
      >
        {label}
      </label>
      
      <div 
        className="relative flex items-center rounded-lg transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(190,18,60,0.35)]"
        style={borderStyle}
      >
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="w-full bg-transparent text-white text-base outline-none placeholder-[#555] rounded-md"
          style={{ padding: '12px 16px' }}
        />
      </div>

      {displayError && (
        <span 
          className="text-[#ff3b6b] text-xs flex items-center gap-1.5 font-medium"
          style={{ marginTop: '6px' }}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {displayError}
        </span>
      )}
    </div>
  );
};