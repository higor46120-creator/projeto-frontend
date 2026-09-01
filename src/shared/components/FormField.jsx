import React, { useState } from 'react';

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  schema,        // Esquema Zod (ex: z.string().email())
  errorText,     // Erro externo (ex: validação de senhas iguais)
  helperText,    // Texto de ajuda opcional abaixo do campo
  disabled = false,
  required = false
}) => {
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    // Validação em tempo real via Zod
    if (schema) {
      const result = schema.safeParse(newValue);
      if (!result.success) {
        setLocalError(result.error.errors[0].message);
      } else {
        setLocalError('');
      }
    }
  };

  const activeError = errorText || localError;

  return (
    <div className="w-full mb-4 flex flex-col">
      {/* Label e Indicador de Obrigatório */}
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* Input com estados visuais */}
      <div className="relative w-full">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3.5 py-2.5 sm:py-2 text-sm text-slate-900 bg-white dark:bg-slate-900 dark:text-slate-100
            rounded-lg border shadow-sm transition-all duration-200 outline-none
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${
              activeError
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
            }
          `}
        />

        {/* Ícone Indicador de Erro */}
        {activeError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-red-500">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {activeError && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 animate-fadeIn">
          {activeError}
        </p>
      )}

      {/* Texto de Ajuda (apenas quando não houver erro) */}
      {!activeError && helperText && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};