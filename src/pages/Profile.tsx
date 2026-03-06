import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Camera, Edit3, Grid, List, MapPin, Calendar, Ruler, User as UserIcon, LogOut, Sparkles, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.filter((p: Post) => p.user_id === user?.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-premium-black pb-20">
      {/* Header */}
      <div className="relative h-64 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-premium-black" />
        <Link to="/" className="absolute top-6 left-6 z-10 glass p-2 rounded-full text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <button className="absolute top-6 right-6 z-10 glass p-2 rounded-full text-white">
          <Edit3 className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-20 relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-zinc-800 border-4 border-premium-black flex items-center justify-center overflow-hidden shadow-2xl">
              <UserIcon className="w-16 h-16 text-zinc-600" />
            </div>
            {user.is_premium && (
              <div className="absolute -bottom-2 -right-2 bg-gold p-2 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            )}
          </div>
          <div className="flex gap-4 mb-2">
            <div className="text-center">
              <p className="text-xl font-bold">{posts.length}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">1.2k</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Seguidores</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-1">{user.name}</h1>
          <p className="text-zinc-400 text-sm mb-4">Fashion Enthusiast & Premium Member</p>
          
          <div className="flex flex-wrap gap-4">
            {user.address && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="w-3 h-3" /> {user.address}
              </div>
            )}
            {user.age && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" /> {user.age} anos
              </div>
            )}
            {user.height && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Ruler className="w-3 h-3" /> {user.height}cm
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 mb-6">
          <button className="flex-1 py-4 border-b-2 border-gold text-gold flex justify-center">
            <Grid className="w-6 h-6" />
          </button>
          <button className="flex-1 py-4 text-zinc-500 flex justify-center">
            <List className="w-6 h-6" />
          </button>
          <button className="flex-1 py-4 text-zinc-500 flex justify-center">
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-900 animate-pulse rounded-lg" />
            ))
          ) : posts.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-zinc-500">
              <p>Nenhuma publicação ainda.</p>
              {!user.is_premium && (
                <Link to="/premium-upgrade" className="text-gold mt-2 inline-block hover:underline">
                  Torne-se premium para publicar
                </Link>
              )}
            </div>
          ) : (
            posts.map(post => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.05 }}
                className="aspect-square bg-zinc-900 rounded-lg overflow-hidden"
              >
                <img
                  src={post.url}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))
          )}
        </div>

        <Link
          to="/settings"
          className="w-full mt-12 glass py-4 rounded-2xl text-zinc-400 font-bold flex items-center justify-center gap-2 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          Configurações da Conta
        </Link>
      </div>
    </div>
  );
}
