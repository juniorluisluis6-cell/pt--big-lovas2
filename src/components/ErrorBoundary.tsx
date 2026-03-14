import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      
      try {
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error && parsedError.error.includes("Missing or insufficient permissions")) {
          errorMessage = "Erro de permissão no banco de dados. Por favor, contate o administrador.";
        } else if (parsedError.error && parsedError.error.includes("unavailable")) {
          errorMessage = "Não foi possível conectar ao banco de dados. Verifique sua conexão.";
        }
      } catch (e) {
        // Not a JSON error
        if (this.state.error?.message.includes("auth/network-request-failed")) {
          errorMessage = "Falha na rede ao tentar autenticar. Verifique sua conexão ou se o domínio está autorizado.";
        }
      }

      return (
        <div className="min-h-screen bg-premium-black flex items-center justify-center p-6 text-center">
          <div className="glass p-8 rounded-3xl border border-red-500/20 max-w-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Ops! Algo deu errado</h2>
            <p className="text-zinc-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="gold-button px-6 py-3 rounded-xl font-bold"
            >
              Recarregar Aplicativo
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 text-[10px] text-zinc-600 text-left overflow-auto max-h-40 p-2 bg-black/50 rounded">
                {this.state.error?.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
