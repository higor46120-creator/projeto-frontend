import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Criação do Contexto
const ChamadosContext = createContext();

// 2. Criação do Provider (Provedor de Dados)
export function ChamadosProvider({ children }) {
  // Inicialização "Lazy" (preguiçosa): Só vai ao localStorage na primeira renderização
  const [chamados, setChamados] = useState(() => {
    const chamadosGuardados = localStorage.getItem('@meus-chamados');
    return chamadosGuardados ? JSON.parse(chamadosGuardados) : [];
  });

  // Efeito Colateral: Sempre que o array 'chamados' mudar, guardamos no localStorage
  useEffect(() => {
    localStorage.setItem('@meus-chamados', JSON.stringify(chamados));
  }, [chamados]);

  // Função para adicionar um novo chamado
  const adicionarChamado = (novoChamado) => {
    const chamadoCompleto = {
      id: crypto.randomUUID(), // Gera um ID único e seguro nativo do navegador
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
      ...novoChamado
    };
    
    // Atualiza o estado usando o valor anterior para evitar bugs de concorrência
    setChamados((estadoAnterior) => [...estadoAnterior, chamadoCompleto]);
  };

  // Função para remover um chamado
  const removerChamado = (id) => {
    setChamados((estadoAnterior) => estadoAnterior.filter(chamado => chamado.id !== id));
  };

  return (
    <ChamadosContext.Provider value={{ chamados, adicionarChamado, removerChamado }}>
      {children}
    </ChamadosContext.Provider>
  );
}

// 3. Hook Personalizado para facilitar o uso nos componentes
export const useChamados = () => useContext(ChamadosContext);