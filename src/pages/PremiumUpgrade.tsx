import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Crown, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

export default function PremiumUpgrade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bi_number: '',
    birth_date: '',
    age: '',
    gender: 'Masculino',
    address: '',
    phone: '',
    height: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          is_premium: true,
          premium_since: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Parabéns! Você agora é um Membro Premium BIG LOVA.');
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('Erro ao processar upgrade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black p-6">
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 mb-8">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Membro Premium</h1>
          <p className="text-zinc-400">Preencha seus dados para pertencer oficialmente à elite BIG LOVA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 glass p-8 rounded-3xl">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Número de BI</label>
              <input
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:border-gold outline-none"
                value={formData.bi_number}
                onChange={e => setFormData({ ...formData, bi_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Data Nasc.</label>
                <input
                  required
                  type="date"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:border-gold outline-none"
                  value={formData.birth_date}
                  onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Idade</label>
                <input
                  required
                  type="number"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:border-gold outline-none"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sexo</label>
              <select
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:border-gold outline-none appearance-none"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Endereço</label>
              <input
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:border-gold outline-none"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Telefone</label>
                <input
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:border-gold outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Altura (cm)</label>
                <input
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:border-gold outline-none"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-button py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirmar Dados
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
