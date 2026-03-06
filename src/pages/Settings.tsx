import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Shield, Bell, Lock, Crown, LogOut, ChevronRight, Palette, Globe, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Conta',
      items: [
        { icon: <User className="w-5 h-5" />, label: 'Editar Perfil', path: '/profile' },
        { icon: <Shield className="w-5 h-5" />, label: 'Segurança e Senha', path: '#' },
        { icon: <Bell className="w-5 h-5" />, label: 'Notificações', path: '#' },
      ]
    },
    {
      title: 'Premium',
      items: [
        { 
          icon: <Crown className="w-5 h-5 text-gold" />, 
          label: user?.is_premium ? 'Sua Assinatura Premium' : 'Tornar-se Premium', 
          path: user?.is_premium ? '#' : '/premium-upgrade',
          badge: user?.is_premium ? 'Ativo' : 'Upgrade'
        },
      ]
    },
    {
      title: 'Preferências',
      items: [
        { icon: <Palette className="w-5 h-5" />, label: 'Aparência', path: '#' },
        { icon: <Globe className="w-5 h-5" />, label: 'Idioma', path: '#' },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Central de Ajuda', path: '#' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-premium-black pb-24">
      {/* Header */}
      <header className="glass border-b border-white/5 p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-zinc-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-display font-bold gold-gradient">Configurações</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-8">
        {/* Profile Summary */}
        <div className="glass p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
            <User className="w-8 h-8 text-zinc-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
          {user?.is_premium && <Crown className="w-6 h-6 text-gold" />}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">{section.title}</h3>
              <div className="glass rounded-3xl border border-white/5 overflow-hidden">
                {section.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-zinc-400">{item.icon}</div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                          item.badge === 'Ativo' ? 'bg-gold/20 text-gold' : 'bg-neon-purple/20 text-neon-purple'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full p-4 glass rounded-3xl border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>

        <div className="text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">BIG LOVA-FASHION v1.0.0</p>
        </div>
      </main>
    </div>
  );
}
