import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';

interface RegisterProps {
  onBack: () => void;
  onSwitch: () => void;
}

export default function Register({ onBack, onSwitch }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biNumber, setBiNumber] = useState('');
  const [age, setAge] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      if (!error) {
        setAdminExists(data && data.length > 0);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // Create user profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name,
            email,
            role: isAdmin ? 'admin' : 'user',
            is_premium: true,
            bi_number: biNumber || null,
            age: age ? parseInt(age) : null,
            mpesa_number: mpesaNumber || null,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      setSuccess(true);
      setTimeout(onSwitch, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`glass p-8 rounded-3xl w-full text-center ${isAdmin ? 'border-blue-500/30' : ''}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isAdmin ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">Conta Criada!</h2>
        <p className="text-zinc-400">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <div className={`glass p-8 rounded-3xl w-full transition-all duration-500 ${isAdmin ? 'border-blue-500/50 bg-blue-950/20' : 'border-white/5'}`}>
      <button onClick={onBack} className="mb-8 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <h2 className={`text-3xl font-display font-bold mb-2 ${isAdmin ? 'text-blue-400' : 'text-white'}`}>
        {isAdmin ? 'Cadastro de Administrador' : 'Criar Conta'}
      </h2>
      <p className="text-zinc-400 mb-8">
        {isAdmin ? 'Configure a conta mestre do aplicativo' : 'Junte-se à elite da moda'}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {!adminExists && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 transition-colors ${isAdmin ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gold/5 border border-gold/20'}`}>
          <input
            type="checkbox"
            id="admin-check"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className={`w-5 h-5 ${isAdmin ? 'accent-blue-500' : 'accent-gold'}`}
          />
          <label htmlFor="admin-check" className={`text-sm font-bold flex items-center gap-2 cursor-pointer ${isAdmin ? 'text-blue-400' : 'text-gold'}`}>
            <ShieldCheck className="w-4 h-4" />
            Registrar como Administrador Mestre
          </label>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Nome Completo</label>
          <div className="relative">
            <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isAdmin ? 'text-blue-500' : 'text-zinc-500'}`} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full bg-black/50 border rounded-xl py-4 pl-12 pr-4 outline-none transition-colors ${isAdmin ? 'border-blue-500/30 focus:border-blue-500' : 'border-white/10 focus:border-gold'}`}
              placeholder="Seu nome"
            />
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Número de BI</label>
                <input
                  type="text"
                  required
                  value={biNumber}
                  onChange={(e) => setBiNumber(e.target.value)}
                  className="w-full bg-black/50 border border-blue-500/30 rounded-xl py-4 px-4 focus:border-blue-500 outline-none transition-colors"
                  placeholder="BI"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Idade</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-black/50 border border-blue-500/30 rounded-xl py-4 px-4 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Idade"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Número Vodacom (M-Pesa)</label>
              <input
                type="text"
                required
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                className="w-full bg-black/50 border border-blue-500/30 rounded-xl py-4 px-4 focus:border-blue-500 outline-none transition-colors"
                placeholder="Ex: 84XXXXXXX"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Email</label>
          <div className="relative">
            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isAdmin ? 'text-blue-500' : 'text-zinc-500'}`} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-black/50 border rounded-xl py-4 pl-12 pr-4 outline-none transition-colors ${isAdmin ? 'border-blue-500/30 focus:border-blue-500' : 'border-white/10 focus:border-gold'}`}
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Senha</label>
          <div className="relative">
            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isAdmin ? 'text-blue-500' : 'text-zinc-500'}`} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-black/50 border rounded-xl py-4 pl-12 pr-4 outline-none transition-colors ${isAdmin ? 'border-blue-500/30 focus:border-blue-500' : 'border-white/10 focus:border-gold'}`}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 font-bold transition-all ${isAdmin ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' : 'gold-button'}`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isAdmin ? 'Finalizar Cadastro Mestre' : 'Cadastrar')}
        </button>
      </form>

      <p className="mt-8 text-center text-zinc-400">
        Já tem uma conta?{' '}
        <button onClick={onSwitch} className="text-gold hover:underline font-medium">
          Entrar
        </button>
      </p>
    </div>
  );
}
