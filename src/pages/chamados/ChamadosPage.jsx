import React, { useState, useEffect } from 'react';
import { ChamadoService } from '../../services/servises';

export default function ChamadosPage() {
  // Estados para os dados e carregamento
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para paginação (baseado no PageRequestDTO)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);

  // Estados para os filtros (baseado no ChamadoFilterDTO)
  const [filtros, setFiltros] = useState({
    termo: '',
    status: '',
    prioridade: ''
  });

  // Função para buscar os dados na API
  const carregarChamados = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageRequest = { page, size };
      
      // O service vai unir filtros + pageRequest nos query params da requisição
      const response = await ChamadoService.buscar(filtros, pageRequest);
      
      // Mapeando a resposta de acordo com a estrutura PageResponseDTOChamadoDTO
      const { itens, totalItens, totalPaginas } = response.data;
      
      setChamados(itens || []);
      setTotalItens(totalItens || 0);
      setTotalPaginas(totalPaginas || 0);
    } catch (err) {
      console.error("Erro ao buscar chamados", err);
      setError("Não foi possível carregar os chamados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Dispara a busca sempre que a página, tamanho da página ou os filtros mudarem
  useEffect(() => {
    carregarChamados();
  }, [page, size, filtros]);

  // Manipuladores de eventos
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPage(0); // Volta para a primeira página ao filtrar
  };

  const handleNextPage = () => {
    if (page < totalPaginas - 1) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Lista de Chamados</h2>
      
      {/* Barra de Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          name="termo"
          placeholder="Buscar descrição..."
          value={filtros.termo}
          onChange={handleFiltroChange}
          style={{ padding: '8px', width: '250px' }}
        />
        <select name="status" value={filtros.status} onChange={handleFiltroChange} style={{ padding: '8px' }}>
          <option value="">Todos os Status</option>
          <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
          <option value="APROVADO">Aprovado</option>
          <option value="EM_ATENDIMENTO">Em Atendimento</option>
          <option value="RESOLVIDO">Resolvido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* Mensagens de estado */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Carregando chamados...</p>}

      {/* Tabela de Dados */}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Descrição</th>
              <th style={thStyle}>Área</th>
              <th style={thStyle}>Prioridade</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Data Abertura</th>
            </tr>
          </thead>
          <tbody>
            {chamados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nenhum chamado encontrado.</td>
              </tr>
            ) : (
              chamados.map((chamado) => (
                <tr key={chamado.idChamado} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}>{chamado.idChamado}</td>
                  <td style={tdStyle}>{chamado.descricao}</td>
                  <td style={tdStyle}>{chamado.area}</td>
                  <td style={tdStyle}>{chamado.prioridade}</td>
                  <td style={tdStyle}>{chamado.status}</td>
                  <td style={tdStyle}>
                    {chamado.dataAbertura ? new Date(chamado.dataAbertura).toLocaleDateString('pt-BR') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Paginação */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Total de itens: {totalItens}</span>
        <div>
          <button 
            onClick={handlePrevPage} 
            disabled={page === 0 || loading}
            style={btnStyle}
          >
            Anterior
          </button>
          <span style={{ margin: '0 15px' }}>Página {page + 1} de {totalPaginas || 1}</span>
          <button 
            onClick={handleNextPage} 
            disabled={page >= totalPaginas - 1 || loading}
            style={btnStyle}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos embutidos simplificados para o exemplo
const thStyle = { padding: '12px', borderBottom: '2px solid #ccc' };
const tdStyle = { padding: '12px' };
const btnStyle = { padding: '8px 16px', cursor: 'pointer' };