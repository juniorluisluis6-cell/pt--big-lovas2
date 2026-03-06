import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, ShieldCheck, Trash2, Ban, DollarSign, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Payment } from '../types';

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'reports'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/payments', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();
      setUsers(usersData);
      setPayments(paymentsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (paymentId: number, userId: number) => {
    try {
      const res = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payment_id: paymentId, user_id: userId })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const banUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja banir este usuário?')) return;
    try {
      const res = await fetch('/api/admin/ban-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
          <div className="glass p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-500" />
              <span className="text-xs font-bold text-zinc-500 uppercase">Receita Total</span>
            </div>
            <p className="text-4xl font-bold">{payments.filter(p => p.status === 'approved').length * 500} MTS</p>
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
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'payments' ? 'gold-button' : 'glass text-zinc-400'}`}
          >
            Pagamentos
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
          {activeTab === 'users' && (
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
                      {u.is_premium ? (
                        <span className="bg-gold/20 text-gold text-[10px] px-2 py-1 rounded-full font-bold uppercase">Premium</span>
                      ) : (
                        <span className="bg-zinc-800 text-zinc-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Free</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button onClick={() => banUser(u.id)} className="text-red-500 hover:text-red-400">
                          <Ban className="w-5 h-5" />
                        </button>
                        <button className="text-zinc-500 hover:text-white">
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'payments' && (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs font-bold uppercase text-zinc-500">
                <tr>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Método</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{p.user_name}</td>
                    <td className="p-4">500 MTS</td>
                    <td className="p-4 text-zinc-400">{p.method}</td>
                    <td className="p-4">
                      {p.status === 'approved' ? (
                        <span className="text-green-500 flex items-center gap-1 text-xs font-bold">
                          <CheckCircle className="w-4 h-4" /> Aprovado
                        </span>
                      ) : (
                        <span className="text-yellow-500 flex items-center gap-1 text-xs font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => approvePayment(p.id, p.user_id)}
                          className="bg-gold text-black px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                        >
                          Aprovar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
