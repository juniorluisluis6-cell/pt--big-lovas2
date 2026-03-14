import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, ShieldCheck, Trash2, Ban, DollarSign, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { supabase } from '../supabase';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (!error) {
        setUsers(data as User[]);
        setLoading(false);
      }
    };

    fetchUsers();

    // Realtime updates
    const channel = supabase
      .channel('admin-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const banUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja banir este usuário?')) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (e) {
      console.error(e);
      alert('Erro ao banir usuário.');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir permanentemente este usuário?')) return;
    try {
      // Note: In Supabase, deleting from auth.users requires admin privileges via service role or RPC.
      // For now, we delete from profiles.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (e) {
      console.error(e);
      alert('Erro ao excluir usuário.');
    }
  };

  return (
    <div className="min-h-screen bg-premium-black">
      <header className="glass border-b border-white/5 p-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-display font-bold gold-gradient">Painel Administrador</h1>
        </div>
        <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full border border-gold/20">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span className="text-xs font-bold text-gold uppercase tracking-widest">Admin Master</span>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-xs font-bold text-zinc-500 uppercase">Total Usuários</span>
            </div>
            <p className="text-4xl font-bold">{users.length}</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-gold" />
              <span className="text-xs font-bold text-zinc-500 uppercase">Premium Ativos</span>
            </div>
            <p className="text-4xl font-bold">{users.filter(u => u.is_premium).length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'gold-button' : 'glass text-zinc-400'}`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'reports' ? 'gold-button' : 'glass text-zinc-400'}`}
          >
            Relatórios
          </button>
        </div>

        {/* Content */}
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs font-bold uppercase text-zinc-500">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-zinc-400">{u.email}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {u.is_premium ? (
                            <span className="bg-gold/20 text-gold text-[10px] px-2 py-1 rounded-full font-bold uppercase w-fit">Premium</span>
                          ) : (
                            <span className="bg-zinc-800 text-zinc-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase w-fit">Free</span>
                          )}
                          {u.is_banned && (
                            <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase w-fit">Banido</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => banUser(u.id)} 
                            className={`${u.is_banned ? 'text-zinc-600' : 'text-red-500 hover:text-red-400'}`}
                            disabled={u.is_banned}
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteUser(u.id)} className="text-zinc-500 hover:text-red-500">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-20 text-center text-zinc-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum relatório disponível no momento.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
