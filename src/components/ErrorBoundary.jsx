import { Component } from 'react';

// Evita a "tela em branco": se uma página quebrar ao renderizar, mostra o
// erro na tela (e no console) em vez de derrubar o app inteiro.
// `resetKey` (ex.: o endereço atual) limpa o erro ao navegar para outra página.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Erro ao renderizar a página:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-xl bg-white rounded-xl shadow border border-red-200 p-6">
          <h1 className="text-xl font-bold text-gray-900">
            Algo deu errado nesta página
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            O erro abaixo ajuda a descobrir a causa (mais detalhes no console
            do navegador, tecla F12).
          </p>
          <pre className="mt-4 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 overflow-auto whitespace-pre-wrap">
            {String(error?.message || error)}
          </pre>
          <div className="mt-4 flex gap-3">
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              Ir para o início
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
