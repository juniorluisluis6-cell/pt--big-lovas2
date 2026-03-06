import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onBack: () => void;
  onSwitch: () => void;
}

export default function Login({ onBack, onSwitch }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Erro ao entrar');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl w-full">
      <button onClick={onBack} className="mb-8 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <h2 className="text-3xl font-display font-bold mb-2">Bem-vindo de volta</h2>
      <p className="text-zinc-400 mb-8">Entre para acessar sua conta premium</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full gold-button py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
        </button>
      </form>

      <p className="mt-8 text-center text-zinc-400">
        Não tem uma conta?{' '}
        <button onClick={onSwitch} className="text-gold hover:underline font-medium">
          Criar agora
        </button>
      </p>
    </div>
  );
}
