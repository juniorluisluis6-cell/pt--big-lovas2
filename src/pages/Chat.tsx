import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Image as ImageIcon, Mic, Phone, Video, MoreVertical, Check, CheckCheck, User as UserIcon, Plus, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Message, User } from '../types';
import { supabase } from '../supabase';

export default function Chat() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);
      
      if (!error) {
        setUsers(data as User[]);
      }
    };

    fetchUsers();

    // Realtime users updates
    const channel = supabase
      .channel('profiles-chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (selectedUser && user) {
      const chatId = [user.id, selectedUser.id].sort().join('_');
      
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chatId', chatId)
          .order('created_at', { ascending: true });
        
        if (!error) {
          setMessages(data as Message[]);
        }
      };

      fetchMessages();

      // Realtime messages
      const channel = supabase
        .channel(`chat-${chatId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chatId=eq.${chatId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    const chatId = [user.id, selectedUser.id].sort().join('_');
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            chatId,
            sender_id: user.id,
            receiver_id: selectedUser.id,
            content: newMessage,
            type: 'text',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black flex flex-col">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <header className="glass border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedUser(null)} className="text-zinc-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold leading-none">{selectedUser.name}</h3>
                <span className="text-[10px] text-green-500 uppercase font-bold tracking-widest">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-400">
              <Video className="w-6 h-6 cursor-pointer hover:text-gold" />
              <Phone className="w-6 h-6 cursor-pointer hover:text-gold" />
              <MoreVertical className="w-6 h-6 cursor-pointer hover:text-gold" />
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl relative ${
                    msg.sender_id === user?.id
                      ? 'bg-gold text-black rounded-tr-none'
                      : 'glass text-white rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender_id === user?.id ? 'text-black/60' : 'text-zinc-50'}`}>
                    <span className="text-[10px]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.sender_id === user?.id && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 glass border-t border-white/5 flex items-center gap-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <Plus className="w-6 h-6 cursor-pointer hover:text-white" />
              <ImageIcon className="w-6 h-6 cursor-pointer hover:text-white" />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mensagem"
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-gold/50"
              />
              <Mic className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 cursor-pointer" />
            </div>
            <button
              type="submit"
              className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-black shadow-lg shadow-gold/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      ) : (
        <>
          <header className="glass border-b border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-display font-bold gold-gradient">Mensagens</h1>
              <div className="flex gap-4 text-zinc-400">
                <Video className="w-6 h-6" />
                <Plus className="w-6 h-6" />
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                placeholder="Procurar conversas"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-10 text-center">
                <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                <p>Nenhuma conversa ativa ainda. Comece a seguir outros membros premium!</p>
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer border-b border-white/5 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 relative overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-zinc-400" />
                    )}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-premium-black rounded-full z-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold">{u.name}</h3>
                      <span className="text-xs text-zinc-500">12:45</span>
                    </div>
                    <p className="text-sm text-zinc-500 truncate">Clique para iniciar uma conversa exclusiva...</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
