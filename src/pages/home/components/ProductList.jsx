import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { productService } from '../../../services/productService';
import { PRODUCT_TYPES } from '../../../types';
import { formatCurrencyBRL } from '../../../utils/numberUtils';
import DataTable from '../../../components/DataTable/DataTable';

const EMPTY_FILTERS = { name: '', productType: '', minPrice: '', maxPrice: '' };

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // minPrice/maxPrice ficam como string aqui para permitir digitar "10,50"
  // livremente; a conversão para double (ponto) acontece só na hora de
  // montar o DTO enviado ao backend (createProductFilterDTO -> parseDoubleBR).
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.searchProducts({
        filter: {
          name: activeFilters.name || undefined,
          productType: activeFilters.productType || undefined,
          minPrice: activeFilters.minPrice,
          maxPrice: activeFilters.maxPrice,
        },
        page: currentPage,
        size: pageSize,
        sortBy,
        sortOrder,
      });

      setProducts(response.products || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Falha ao carregar a lista de produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortOrder, activeFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setActiveFilters(filters);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setCurrentPage(0);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir o produto.');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'imageUrl',
        header: 'Imagem',
        render: (product) =>
          product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-10 h-10 object-cover rounded-lg border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 border border-slate-200">
              Sem foto
            </div>
          ),
      },
      {
        key: 'name',
        header: 'Nome',
        sortable: true,
        render: (product) => (
          <>
            <div className="font-semibold text-slate-900">{product.name}</div>
            {product.description && (
              <div className="text-xs text-slate-500 line-clamp-1">{product.description}</div>
            )}
          </>
        ),
      },
      {
        key: 'productType',
        header: 'Categoria',
        render: (product) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {product.productType || 'N/A'}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'Preço',
        sortable: true,
        cellClassName: 'font-semibold text-slate-900',
        render: (product) => formatCurrencyBRL(product.price),
      },
      {
        key: 'batch',
        header: 'Lote',
        cellClassName: 'text-slate-600 font-mono text-xs',
        render: (product) => `#${product.batch || 'N/A'}`,
      },
      {
        key: 'exp',
        header: 'Validade',
        sortable: true,
        cellClassName: 'text-slate-600 text-xs',
        render: (product) => (product.exp ? new Date(product.exp).toLocaleDateString('pt-BR') : '-'),
      },
      {
        key: 'actions',
        header: 'Ações',
        align: 'right',
        render: (product) => (
          <button
            onClick={() => handleDeleteProduct(product.id, product.name)}
            className="text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded transition"
          >
            Excluir
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Produtos</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie e visualize a lista de produtos cadastrados</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Total: {totalElements} itens
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Buscar por nome..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label htmlFor="productType" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Categoria
                </label>
                <select
                  id="productType"
                  name="productType"
                  value={filters.productType}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                >
                  <option value="">Todas as categorias</option>
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="minPrice" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Preço Mínimo (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label htmlFor="maxPrice" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Preço Máximo (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                Filtrar
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>

        <DataTable
          columns={columns}
          data={products}
          rowKey="id"
          loading={loading}
          error={error}
          onRetry={fetchProducts}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
          }}
          emptyMessage="Nenhum produto encontrado."
        />
      </div>
    </div>
  );
}
