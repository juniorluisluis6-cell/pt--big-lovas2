import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Crown, Plus, Search, User, LogOut, Settings, Trophy, Sparkles, Camera, Image as ImageIcon, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import { Link } from 'react-router-dom';

import AIAssistant from '../components/AIAssistant';

export default function Home() {
  const { user, logout, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState<'photo' | 'video'>('photo');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user?.is_premium) return alert('Apenas membros premium podem publicar.');
    
    // Simulate post creation with a random fashion image or video placeholder
    const randomImg = postType === 'photo' 
      ? `https://picsum.photos/seed/${Math.random()}/800/800`
      : `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4`; // Placeholder video
    
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: postType,
          url: randomImg,
          caption: caption || 'Estilo é uma forma de dizer quem você é sem ter que falar.'
        })
      });
      if (res.ok) {
        setCaption('');
        setIsPosting(false);
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black pb-24">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-display font-bold gold-gradient tracking-tighter">BIG LOVA</h1>
          <div className="hidden md:flex items-center gap-4 ml-6">
            <Link to="/ranking" className="text-xs font-bold text-zinc-400 hover:text-gold flex items-center gap-1 uppercase tracking-widest">
              <Trophy className="w-3 h-3" /> Ranking
            </Link>
            <Link to="/tools" className="text-xs font-bold text-zinc-400 hover:text-gold flex items-center gap-1 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> AI Tools
            </Link>
            <Link to="/live" className="text-xs font-bold text-zinc-400 hover:text-gold flex items-center gap-1 uppercase tracking-widest">
              <Video className="w-3 h-3" /> Live
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/settings" className="text-zinc-400 hover:text-white">
            <Settings className="w-6 h-6" />
          </Link>
          <Link to="/profile">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
              <User className="w-6 h-6 text-zinc-400" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-xl mx-auto pt-4 px-4 space-y-6">
        {/* Mobile Quick Links */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Link to="/ranking" className="flex-shrink-0 glass px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5">
            <Trophy className="w-3 h-3 text-gold" /> Ranking
          </Link>
          <Link to="/tools" className="flex-shrink-0 glass px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5">
            <Sparkles className="w-3 h-3 text-neon-purple" /> AI Tools
          </Link>
          <Link to="/live" className="flex-shrink-0 glass px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5">
            <Video className="w-3 h-3 text-red-500" /> Live
          </Link>
          <Link to="/chat" className="flex-shrink-0 glass px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5">
            <MessageCircle className="w-3 h-3 text-blue-500" /> Chat
          </Link>
        </div>

        {/* Premium Banner */}
        {!user?.is_premium && (
          <Link to="/premium-upgrade">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="gold-button p-6 rounded-3xl flex items-center justify-between shadow-2xl shadow-gold/20"
            >
              <div>
                <h3 className="text-xl font-bold">TORNAR-SE MEMBRO PREMIUM</h3>
                <p className="text-sm opacity-80">Acesso total, publicações e chat exclusivo</p>
              </div>
              <Crown className="w-10 h-10" />
            </motion.div>
          </Link>
        )}

        {/* Create Post (Premium Only) */}
        {user?.is_premium && (
          <div className="glass p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
                <User className="w-8 h-8 text-zinc-400" />
              </div>
              <textarea
                placeholder="O que você está vestindo hoje?"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 min-h-[80px] resize-none"
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex gap-2">
                <button 
                  onClick={() => setPostType('photo')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    postType === 'photo' ? 'bg-gold text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  <Camera className="w-4 h-4" /> Foto
                </button>
                <button 
                  onClick={() => setPostType('video')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    postType === 'video' ? 'bg-red-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  <Video className="w-4 h-4" /> Vídeo
                </button>
              </div>
              
              <button
                onClick={handleCreatePost}
                disabled={!caption.trim()}
                className="gold-button px-8 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              >
                Publicar
              </button>
            </div>
          </div>
        )}

        {/* Trending Section */}
        <div className="glass p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              Tendências da Semana
            </h3>
            <Link to="/ranking" className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline">Ver Todos</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {['Minimalismo', 'Dourado Luxo', 'Cyberpunk Fashion', 'Sustentabilidade'].map((trend, i) => (
              <div key={i} className="flex-shrink-0 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-medium hover:bg-gold/10 hover:border-gold/30 transition-all cursor-pointer">
                #{trend}
              </div>
            ))}
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl overflow-hidden border border-white/5"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                    <User className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{post.user_name}</span>
                      <Crown className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-xs text-zinc-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
                  {post.type === 'video' ? (
                    <video 
                      src={post.url} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.url}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <Heart className="w-7 h-7 hover:text-red-500 transition-colors cursor-pointer" />
                    <MessageCircle className="w-7 h-7 hover:text-gold transition-colors cursor-pointer" />
                    <Share2 className="w-7 h-7 hover:text-blue-500 transition-colors cursor-pointer" />
                  </div>
                  <p className="text-sm">
                    <span className="font-bold mr-2">{post.user_name}</span>
                    {post.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-6 py-4 flex items-center justify-between z-50">
        <Link to="/"><Plus className="w-8 h-8 text-zinc-400" /></Link>
        <Link to="/chat"><MessageCircle className="w-8 h-8 text-zinc-400" /></Link>
        <Link to="/premium-upgrade">
          <div className="w-14 h-14 bg-gold rounded-full -mt-10 flex items-center justify-center shadow-xl shadow-gold/30 border-4 border-premium-black">
            <Crown className="w-8 h-8 text-black" />
          </div>
        </Link>
        <Link to="/tools"><Sparkles className="w-8 h-8 text-zinc-400" /></Link>
        <Link to="/settings"><Settings className="w-8 h-8 text-zinc-400" /></Link>
      </div>
    </div>
  );
}
