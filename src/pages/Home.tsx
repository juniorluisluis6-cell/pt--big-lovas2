import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Crown, Plus, Search, User, LogOut, Settings, Trophy, Sparkles, Camera, Image as ImageIcon, Video, Home as HomeIcon, X, Send, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post, Comment } from '../types';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

import AIAssistant from '../components/AIAssistant';

interface CommentModalProps {
  post: Post;
  onClose: () => void;
  onCommentAdded: () => void;
}

function CreatePostModal({ onClose, onPostCreated }: { onClose: () => void, onPostCreated: () => void }) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState<'photo' | 'video'>('photo');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setPostType(selectedFile.type.startsWith('video') ? 'video' : 'photo');
    }
  };

  const handleCreatePost = async () => {
    if (!file || !user) return alert('Selecione uma foto ou vídeo.');
    
    setUploading(true);
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      // 2. Create post in Supabase
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            user_name: user.name,
            user_avatar: user.avatar_url || null,
            type: postType,
            url: publicUrl,
            caption: caption || 'Estilo é uma forma de dizer quem você é sem ter que falar.',
            likes_count: 0,
            comments_count: 0,
            created_at: new Date().toISOString()
          }
        ]);

      if (postError) throw postError;
      
      onPostCreated();
      onClose();
    } catch (e: any) {
      console.error(e);
      alert('Erro ao publicar: ' + e.message);
    } finally {
      setUploading(false);
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
        className="relative w-full max-w-lg glass rounded-3xl border border-white/10 overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Nova Publicação</h3>
          <button onClick={onClose} className="text-zinc-400"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden relative"
          >
            {previewUrl ? (
              postType === 'video' ? (
                <video src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={previewUrl} className="w-full h-full object-cover" />
              )
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-gold" />
                </div>
                <p className="text-sm font-bold text-zinc-400">Selecionar Foto ou Vídeo</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,video/*" 
              className="hidden" 
            />
          </div>

          <textarea
            placeholder="Escreva uma legenda..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 min-h-[100px] resize-none"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />

          <button
            onClick={handleCreatePost}
            disabled={!file || uploading}
            className="w-full gold-button py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Publicando...
              </>
            ) : 'Publicar Agora'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CommentModal({ post, onClose, onCommentAdded }: CommentModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (!error) {
        setComments(data as Comment[]);
      }
      setLoading(false);
    };

    fetchComments();

    // Realtime comments
    const channel = supabase
      .channel(`comments-${post.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `post_id=eq.${post.id}`
      }, (payload) => {
        setComments(prev => [...prev, payload.new as Comment]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const { error: commentError } = await supabase
        .from('comments')
        .insert([
          {
            user_id: user.id,
            user_name: user.name,
            post_id: post.id,
            content: newComment,
            created_at: new Date().toISOString()
          }
        ]);

      if (commentError) throw commentError;
      
      // Update comment count
      await supabase.rpc('increment_comments_count', { post_id_param: post.id });

      setNewComment('');
      onCommentAdded();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-lg bg-premium-black rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Comentários</h3>
          <button onClick={onClose} className="text-zinc-400"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-zinc-500 py-10">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl p-3">
                  <p className="text-xs font-bold text-gold mb-1">{c.user_name}</p>
                  <p className="text-sm text-zinc-300">{c.content}</p>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendComment} className="p-4 border-t border-white/5 flex gap-2">
          <input 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
          />
          <button type="submit" className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-black">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { user, logout, isLowDataMode } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) {
        setPosts(data as Post[]);
      }
      setLoading(false);
    };

    fetchPosts();

    // Realtime posts
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setLikedPosts(data.map(l => l.post_id));
      }
    };
    fetchLikes();
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const isLiked = likedPosts.includes(postId);

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        await supabase.rpc('decrement_likes_count', { post_id_param: postId });
        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, post_id: postId }]);
        
        await supabase.rpc('increment_likes_count', { post_id_param: postId });
        setLikedPosts(prev => [...prev, postId]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BIG LOVA - Fashion',
          text: post.caption,
          url: window.location.href
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert('Link copiado para a área de transferência!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const filteredPosts = posts.filter(p => filter === 'all' || p.type === filter);

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
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-zinc-400" />
              )}
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

        {/* Create Post Quick Access */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full glass p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-zinc-400" />
            )}
          </div>
          <span className="text-zinc-500 text-sm font-medium">O que você está vestindo hoje?</span>
          <div className="ml-auto flex gap-2">
            <ImageIcon className="w-5 h-5 text-gold" />
            <Video className="w-5 h-5 text-red-500" />
          </div>
        </button>

        {/* Trending Section */}
        <div className="glass p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              Filtros
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'photo', label: 'Fotos' },
              { id: 'video', label: 'Vídeos' }
            ].map((f) => (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id as any)}
                className={`flex-shrink-0 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f.id ? 'bg-gold text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
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
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={isLowDataMode ? false : { opacity: 0, y: 20 }}
                animate={isLowDataMode ? false : { opacity: 1, y: 0 }}
                className="glass rounded-3xl overflow-hidden border border-white/5"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3">
                  <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
                      {post.user_avatar ? (
                        <img src={post.user_avatar} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-zinc-400" />
                      )}
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
                  </Link>
                </div>

                {/* Post Content */}
                <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
                  {post.type === 'video' ? (
                    <video 
                      src={post.url} 
                      controls 
                      preload="none"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.url}
                      alt={post.caption}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <motion.button
                      whileTap={{ scale: 1.5 }}
                      onClick={() => handleLike(post.id)}
                      className={`${likedPosts.includes(post.id) ? 'text-red-500' : 'text-zinc-400'} transition-colors`}
                    >
                      <Heart className={`w-7 h-7 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                    </motion.button>
                    <button 
                      onClick={() => setSelectedPostForComments(post)}
                      className="text-zinc-400 hover:text-gold transition-colors"
                    >
                      <MessageCircle className="w-7 h-7" />
                    </button>
                    <button 
                      onClick={() => handleShare(post)}
                      className="text-zinc-400 hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="w-7 h-7" />
                    </button>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = post.url;
                        link.download = `big-lova-${post.id}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-zinc-400 hover:text-green-500 transition-colors ml-auto"
                    >
                      <Download className="w-7 h-7" />
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-zinc-500 mb-2">
                    <span>{post.likes_count} Curtidas</span>
                    <span>{post.comments_count} Comentários</span>
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

      <AnimatePresence>
        {selectedPostForComments && (
          <CommentModal 
            post={selectedPostForComments} 
            onClose={() => setSelectedPostForComments(null)} 
            onCommentAdded={() => {}}
          />
        )}
        {isCreateModalOpen && (
          <CreatePostModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onPostCreated={() => {}}
          />
        )}
      </AnimatePresence>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-6 py-4 flex items-center justify-between z-50">
        <Link to="/"><HomeIcon className="w-8 h-8 text-zinc-400" /></Link>
        <Link to="/ranking"><Trophy className="w-8 h-8 text-zinc-400" /></Link>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-14 h-14 bg-gold rounded-full -mt-10 flex items-center justify-center shadow-xl shadow-gold/30 border-4 border-premium-black active:scale-90 transition-transform"
        >
          <Plus className="w-8 h-8 text-black" />
        </button>
        <Link to="/chat"><MessageCircle className="w-8 h-8 text-zinc-400" /></Link>
        <Link to="/settings"><Settings className="w-8 h-8 text-zinc-400" /></Link>
      </div>
    </div>
  );
}
