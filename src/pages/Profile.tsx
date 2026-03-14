import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, Edit3, Grid, List, MapPin, Calendar, Ruler, User as UserIcon, LogOut, Sparkles, Settings, X, Save, Download, UserPlus, UserMinus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post, User } from '../types';
import { supabase } from '../supabase';

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bi_number: user?.bi_number || '',
    birth_date: user?.birth_date || '',
    age: user?.age || '',
    gender: user?.gender || '',
    address: user?.address || '',
    phone: user?.phone || '',
    height: user?.height || '',
    avatar_url: user?.avatar_url || ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg glass rounded-3xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Editar Perfil</h3>
          <button onClick={onClose} className="text-zinc-400"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-3xl bg-zinc-800 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden relative"
            >
              {formData.avatar_url ? (
                <img src={formData.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-zinc-500" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <p className="text-[10px] text-zinc-500 mt-2 uppercase font-bold tracking-widest">Alterar Foto</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Nome Completo</label>
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">BI / Documento</label>
              <input 
                value={formData.bi_number}
                onChange={e => setFormData({...formData, bi_number: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Data de Nascimento</label>
              <input 
                type="date"
                value={formData.birth_date}
                onChange={e => setFormData({...formData, birth_date: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Idade</label>
              <input 
                type="number"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Gênero</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              >
                <option value="">Selecionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Endereço</label>
              <input 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Telefone</label>
              <input 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Altura (cm)</label>
              <input 
                value={formData.height}
                onChange={e => setFormData({...formData, height: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full gold-button py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Salvar Alterações
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !id || id === currentUser?.id;
  const targetUserId = id || currentUser?.id;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchProfileData = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      if (!profileError) {
        setProfileUser(profileData as User);
      }

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (!postsError) {
        setPosts(postsData as Post[]);
      }
      setLoading(false);
    };

    fetchProfileData();

    // Realtime updates
    const profileChannel = supabase
      .channel(`profile-${targetUserId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${targetUserId}` }, (payload) => {
        setProfileUser(payload.new as User);
      })
      .subscribe();

    const postsChannel = supabase
      .channel(`user-posts-${targetUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${targetUserId}` }, () => {
        fetchProfileData();
      })
      .subscribe();

    // Check if following
    if (currentUser && !isOwnProfile) {
      const checkFollowing = async () => {
        const { data, error } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUserId)
          .single();
        
        setIsFollowing(!!data && !error);
      };
      checkFollowing();
    }

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [targetUserId, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser || !targetUserId || isOwnProfile || followLoading) return;
    setFollowLoading(true);
    try {
      const { error: followError } = await supabase
        .from('follows')
        .insert([
          {
            follower_id: currentUser.id,
            following_id: targetUserId,
            created_at: new Date().toISOString()
          }
        ]);

      if (followError) throw followError;

      await supabase.rpc('increment_following_count', { user_id_param: currentUser.id });
      await supabase.rpc('increment_followers_count', { user_id_param: targetUserId });
      
      setIsFollowing(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !targetUserId || isOwnProfile || followLoading) return;
    setFollowLoading(true);
    try {
      const { error: unfollowError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', targetUserId);

      if (unfollowError) throw unfollowError;

      await supabase.rpc('decrement_following_count', { user_id_param: currentUser.id });
      await supabase.rpc('decrement_followers_count', { user_id_param: targetUserId });
      
      setIsFollowing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (!profileUser) return (
    <div className="min-h-screen bg-premium-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-premium-black pb-20">
      {/* Header */}
      <div className="relative h-64 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-premium-black" />
        <Link to="/" className="absolute top-6 left-6 z-10 glass p-2 rounded-full text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        {isOwnProfile && (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-6 right-6 z-10 glass p-2 rounded-full text-white"
          >
            <Edit3 className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-20 relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-zinc-800 border-4 border-premium-black flex items-center justify-center overflow-hidden shadow-2xl">
              {profileUser.avatar_url ? (
                <img src={profileUser.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-zinc-600" />
              )}
            </div>
            {profileUser.is_premium && (
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
              <p className="text-xl font-bold">{profileUser.followers_count || 0}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{profileUser.following_count || 0}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Seguindo</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-display font-bold">{profileUser.name}</h1>
            {!isOwnProfile && (
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                disabled={followLoading}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  isFollowing 
                    ? 'bg-zinc-800 text-white border border-white/10' 
                    : 'gold-button'
                }`}
              >
                {followLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <><UserMinus className="w-4 h-4" /> Seguindo</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Seguir</>
                )}
              </button>
            )}
          </div>
          <p className="text-zinc-400 text-sm mb-4">
            {profileUser.is_premium ? 'Fashion Enthusiast & Premium Member' : 'Fashion Enthusiast'}
          </p>
          
          <div className="flex flex-wrap gap-4">
            {profileUser.address && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="w-3 h-3" /> {profileUser.address}
              </div>
            )}
            {profileUser.age && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" /> {profileUser.age} anos
              </div>
            )}
            {profileUser.height && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Ruler className="w-3 h-3" /> {profileUser.height}cm
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
              {isOwnProfile && !profileUser.is_premium && (
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
                className="aspect-square bg-zinc-900 rounded-lg overflow-hidden relative group"
              >
                {post.type === 'video' ? (
                  <video 
                    src={post.url} 
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={post.url}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = post.url;
                      link.download = `big-lova-${post.id}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="p-2 bg-gold rounded-full text-black"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {isOwnProfile && (
          <Link
            to="/settings"
            className="w-full mt-12 glass py-4 rounded-2xl text-zinc-400 font-bold flex items-center justify-center gap-2 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            Configurações da Conta
          </Link>
        )}
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal 
            onClose={() => setIsEditModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
