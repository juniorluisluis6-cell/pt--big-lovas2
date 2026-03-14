import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User, Shield, Bell, Lock, Crown, LogOut, ChevronRight, Palette, Globe, HelpCircle, X, Check, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

export default function Settings() {
  const { user, logout, isLowDataMode, setIsLowDataMode } = useAuth();
  const navigate = useNavigate();
  const [showLanguages, setShowLanguages] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentLang, setCurrentLang] = useState('Português');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const languages = [
    'Português', 'English', 'Español', 'Français', 'Deutsch', 'Italiano', '中文', '日本語', 'Русский'
  ];

  const handleHelp = () => {
    window.open('https://wa.me/258848342617', '_blank');
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert('As senhas não coincidem');
    
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) throw error;
      
      alert('Senha alterada com sucesso!');
      setShowPasswordModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erro ao alterar senha.');
    } finally {
      setChangingPassword(false);
    }
  };

  const sections = [
    {
      title: 'Conta',
      items: [
        { icon: <User className="w-5 h-5" />, label: 'Editar Perfil', onClick: () => navigate('/profile') },
        { icon: <Lock className="w-5 h-5" />, label: 'Alterar Senha', onClick: () => setShowPasswordModal(true) },
        { icon: <Bell className="w-5 h-5" />, label: 'Notificações', onClick: () => {} },
      ]
    },
    {
      title: 'Preferências',
      items: [
        { 
          icon: <Palette className="w-5 h-5" />, 
          label: 'Aparência', 
          onClick: handleThemeToggle,
          value: isDarkMode ? 'Escuro' : 'Claro'
        },
        { 
          icon: <Zap className="w-5 h-5" />, 
          label: 'Modo 4G (Rápido)', 
          onClick: () => setIsLowDataMode(!isLowDataMode),
          value: isLowDataMode ? 'Ativado' : 'Desativado'
        },
        { icon: <Globe className="w-5 h-5" />, label: 'Idioma', onClick: () => setShowLanguages(true), value: currentLang },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Central de Ajuda', onClick: handleHelp },
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
            {user?.avatar_url ? (
              <img src={user.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-zinc-400" />
            )}
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
                    onClick={item.onClick}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-zinc-400">{item.icon}</div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-xs text-zinc-500">{item.value}</span>}
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

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguages(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass rounded-3xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Selecionar Idioma</h3>
                <button onClick={() => setShowLanguages(false)} className="text-zinc-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setCurrentLang(lang);
                      setShowLanguages(false);
                    }}
                    className="w-full p-4 flex items-center justify-between rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    <span className={currentLang === lang ? 'text-gold font-bold' : 'text-zinc-300'}>
                      {lang}
                    </span>
                    {currentLang === lang && <Check className="w-5 h-5 text-gold" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass rounded-3xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Alterar Senha</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-zinc-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full gold-button py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  {changingPassword ? 'Alterando...' : 'Salvar Nova Senha'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
