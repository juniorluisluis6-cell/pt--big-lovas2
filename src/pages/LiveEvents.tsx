import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Users, MessageSquare, Heart, Share2, Crown, Mic, MicOff, Video, VideoOff, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LiveEvents() {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(1240);
  const [comments, setComments] = useState<{ id: number, user: string, text: string, isPremium: boolean }[]>([
    { id: 1, user: 'Fashionista_99', text: 'Esse look está incrível! 😍', isPremium: true },
    { id: 2, user: 'StyleMaster', text: 'A iluminação está perfeita.', isPremium: true },
    { id: 3, user: 'TrendSetter', text: 'Quando sai a nova coleção?', isPremium: false },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      user: user?.name || 'Anônimo',
      text: newComment,
      isPremium: !!user?.is_premium
    }]);
    setNewComment('');
  };

  if (!user?.is_premium) {
    return (
      <div className="min-h-screen bg-premium-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <Video className="w-12 h-12 text-gold" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4 gold-gradient">Eventos ao Vivo</h1>
        <p className="text-zinc-400 mb-8 max-w-md">
          Assista a desfiles exclusivos, lançamentos de coleções e conferências de moda em tempo real. Acesso restrito a membros premium.
        </p>
        <Link to="/premium-upgrade" className="gold-button px-10 py-4 rounded-full font-bold text-lg">
          Obter Acesso Premium
        </Link>
        <Link to="/" className="mt-6 text-zinc-500 hover:text-white transition-colors">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden">
      {/* Main Stream Area */}
      <div className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
          <img 
            src="https://picsum.photos/seed/fashion-show/1920/1080?blur=2" 
            alt="Atmosphere" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Video Player Placeholder */}
        <div className="relative z-20 w-full h-full flex flex-col">
          {/* Header Overlay */}
          <div className="p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <Link to="/" className="glass p-2 rounded-full text-white hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">Ao Vivo</span>
                  <h1 className="text-xl font-bold text-white">Paris Fashion Week: Summer 2026</h1>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs mt-1">
                  <Users className="w-3 h-3" />
                  <span>{viewerCount.toLocaleString()} assistindo agora</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="Viewer" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-black bg-gold text-black text-[10px] font-bold flex items-center justify-center">+99</div>
              </div>
            </div>
          </div>

          {/* Main Viewport */}
          <div className="flex-1 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              {!isLive ? (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="text-center"
                >
                  <button 
                    onClick={() => setIsLive(true)}
                    className="w-24 h-24 bg-gold rounded-full flex items-center justify-center shadow-2xl shadow-gold/40 hover:scale-110 transition-transform group"
                  >
                    <Play className="w-10 h-10 text-black fill-black group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="text-gold font-bold mt-6 uppercase tracking-[0.3em] text-sm">Entrar na Transmissão</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full relative"
                >
                  <img 
                    src="https://picsum.photos/seed/runway/1280/720" 
                    alt="Live Stream" 
                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Interactive AI Overlay */}
                  <div className="absolute top-4 right-4 glass p-4 rounded-2xl border border-gold/30 max-w-[200px] animate-bounce-slow">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span className="text-[10px] font-bold text-gold uppercase">AI Stylist Live</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 leading-relaxed">
                      "Este tecido de seda italiana com corte assimétrico será a tendência principal de 2026."
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls Overlay */}
          <div className="p-8 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'glass text-white hover:bg-white/20'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'glass text-white hover:bg-white/20'}`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
            <button className="bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
              <X className="w-5 h-5" /> Sair
            </button>
            <button className="glass p-4 rounded-full text-white hover:bg-white/20 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-[400px] glass border-l border-white/5 flex flex-col h-[400px] lg:h-screen">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold" />
            <h2 className="font-bold uppercase tracking-widest text-sm">Chat ao Vivo</h2>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Conectado</span>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {comments.map((comment) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={comment.id} 
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 flex-shrink-0">
                <img src={`https://picsum.photos/seed/${comment.user}/100/100`} alt="User" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${comment.isPremium ? 'text-gold' : 'text-zinc-400'}`}>
                    {comment.user}
                  </span>
                  {comment.isPremium && <Crown className="w-3 h-3 text-gold" />}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{comment.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendComment} className="p-6 border-t border-white/5 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Diga algo..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-gold">
                <Heart className="w-4 h-4" />
              </button>
            </div>
            <button 
              type="submit"
              className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 rotate-0" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 mt-4 text-center uppercase tracking-widest">
            Respeite os outros membros premium
          </p>
        </form>
      </div>
    </div>
  );
}
