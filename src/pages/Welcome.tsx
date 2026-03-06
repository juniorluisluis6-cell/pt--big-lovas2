import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Diamond, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { APP_NAME } from '../constants';
import Login from '../components/Login';
import Register from '../components/Register';

export default function Welcome() {
  const [view, setView] = useState<'welcome' | 'login' | 'register'>('welcome');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-premium-black">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full" />

      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center z-10 max-w-md w-full"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <Crown className="w-24 h-24 text-gold" />
                <Diamond className="w-8 h-8 text-white absolute -bottom-2 -right-2 animate-pulse" />
              </div>
            </motion.div>

            <h1 className="text-5xl font-display font-bold mb-4 gold-gradient">
              {APP_NAME}
            </h1>
            <p className="text-zinc-400 text-lg mb-12 italic">
              "Conectando moda, estilo e exclusividade"
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setView('login')}
                className="w-full gold-button py-4 rounded-full flex items-center justify-center gap-2 group"
              >
                <LogIn className="w-5 h-5" />
                Entrar
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setView('register')}
                className="w-full glass py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <UserPlus className="w-5 h-5 text-gold" />
                Criar Conta
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-4 text-xs text-zinc-500 uppercase tracking-widest">
              <span className="h-px w-8 bg-zinc-800" />
              Premium Fashion Network
              <span className="h-px w-8 bg-zinc-800" />
            </div>
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md z-10"
          >
            <Login onBack={() => setView('welcome')} onSwitch={() => setView('register')} />
          </motion.div>
        )}

        {view === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md z-10"
          >
            <Register onBack={() => setView('welcome')} onSwitch={() => setView('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
