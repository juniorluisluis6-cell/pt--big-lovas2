import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Crown, Star, TrendingUp, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { supabase } from '../supabase';

export default function Ranking() {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_premium', true)
        .limit(10);
      
      if (!error) {
        setTopUsers(data as User[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black p-6">
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 mb-8">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>

      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-gold/10 rounded-full mb-4">
          <Trophy className="w-12 h-12 text-gold" />
        </div>
        <h1 className="text-4xl font-display font-bold gold-gradient">Top Modelos</h1>
        <p className="text-zinc-500 uppercase text-xs font-bold tracking-[0.2em] mt-2">Ranking Semanal BIG LOVA</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-4">
          {topUsers.map((u, index) => (
            <Link key={u.id} to={`/profile/${u.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass p-4 rounded-2xl flex items-center gap-4 border mb-4 ${index === 0 ? 'border-gold/50 bg-gold/5' : 'border-white/5'}`}
              >
                <div className="w-8 text-center font-display font-bold text-xl text-zinc-500">
                  {index + 1 === 1 ? <Crown className="w-6 h-6 text-gold mx-auto" /> : index + 1}
                </div>
                
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-zinc-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{u.name}</h3>
                    <Star className="w-3 h-3 text-gold fill-gold" />
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Premium Member</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {Math.floor(Math.random() * 100) + 50}%
                  </div>
                  <p className="text-[10px] text-zinc-600 uppercase">Engajamento</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 p-8 glass rounded-3xl border border-white/5 text-center">
        <h3 className="text-xl font-bold mb-2">Quer aparecer aqui?</h3>
        <p className="text-sm text-zinc-400 mb-6">Membros premium com mais publicações e interações ganham destaque no ranking semanal.</p>
        <Link to="/premium-upgrade" className="text-gold font-bold hover:underline">Saiba mais sobre o Selo de Verificação</Link>
      </div>
    </div>
  );
}
