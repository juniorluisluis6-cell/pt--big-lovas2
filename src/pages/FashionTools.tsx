import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Image as ImageIcon, Video, MapPin, Volume2, Loader2, Wand2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { editFashionImage, generateFashionVideo, findFashionEventsNearby, speakFashionTip } from '../services/geminiService';

export default function FashionTools() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mapsResult, setMapsResult] = useState<{ text: string, links: any[] } | null>(null);

  const handleImageEdit = async () => {
    // In a real app, we'd have a file picker. For demo, we use a placeholder.
    setLoading(true);
    const res = await editFashionImage("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "Add a luxury gold watch to the wrist");
    setResult(res);
    setLoading(false);
  };

  const handleVideoGen = async () => {
    setLoading(true);
    const res = await generateFashionVideo("A model walking on a futuristic neon runway in Paris");
    setResult(res);
    setLoading(false);
  };

  const handleMaps = async () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await findFashionEventsNearby(pos.coords.latitude, pos.coords.longitude);
      setMapsResult(res);
      setLoading(false);
    });
  };

  const handleTTS = () => {
    speakFashionTip("A moda não é algo que existe apenas nos vestidos. A moda está no céu, na rua, a moda tem a ver com ideias, a forma como vivemos, o que está acontecendo.");
  };

  if (!user?.is_premium) {
    return (
      <div className="min-h-screen bg-premium-black flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="w-16 h-16 text-gold mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">Ferramentas de IA</h1>
        <p className="text-zinc-400 mb-8">Recursos exclusivos de geração de imagem, vídeo e consultoria por IA.</p>
        <Link to="/premium-upgrade" className="gold-button px-8 py-4 rounded-full font-bold">Upgrade para Premium</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-black p-6 pb-24">
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 mb-8">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>

      <h1 className="text-4xl font-display font-bold mb-2 gold-gradient">Fashion AI Tools</h1>
      <p className="text-zinc-400 mb-10">Potencialize seu estilo com inteligência artificial de ponta.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Edit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleImageEdit}
          className="glass p-8 rounded-3xl border border-white/5 text-left group"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500/40 transition-colors">
            <Wand2 className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Editor de Imagem IA</h3>
          <p className="text-sm text-zinc-500">Adicione acessórios ou mude o cenário das suas fotos com comandos de voz.</p>
        </motion.button>

        {/* Video Gen */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleVideoGen}
          className="glass p-8 rounded-3xl border border-white/5 text-left group"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500/40 transition-colors">
            <Video className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Gerador de Vídeo Veo</h3>
          <p className="text-sm text-zinc-500">Crie clipes cinematográficos de moda a partir de descrições textuais.</p>
        </motion.button>

        {/* Maps */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleMaps}
          className="glass p-8 rounded-3xl border border-white/5 text-left group"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500/40 transition-colors">
            <MapPin className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Eventos Próximos</h3>
          <p className="text-sm text-zinc-500">Localize desfiles, showrooms e boutiques de luxo ao seu redor.</p>
        </motion.button>

        {/* TTS */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleTTS}
          className="glass p-8 rounded-3xl border border-white/5 text-left group"
        >
          <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-gold/40 transition-colors">
            <Volume2 className="w-6 h-6 text-gold" />
          </div>
          <h3 className="text-xl font-bold mb-2">Dica do Estilista (Voz)</h3>
          <p className="text-sm text-zinc-500">Ouça conselhos de moda narrados por uma voz sofisticada.</p>
        </motion.button>
      </div>

      {/* Results Area */}
      <AnimatePresence>
        {(loading || result || mapsResult) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 glass p-8 rounded-3xl border border-gold/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Resultado da IA</h2>
              <button onClick={() => { setResult(null); setMapsResult(null); }} className="text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                <p className="text-zinc-400">Processando sua solicitação premium...</p>
              </div>
            ) : result ? (
              <div className="rounded-2xl overflow-hidden border border-white/10">
                {result.startsWith('data:image') ? (
                  <img src={result} alt="AI Result" className="w-full h-auto" />
                ) : (
                  <video src={result} controls className="w-full h-auto" />
                )}
              </div>
            ) : mapsResult ? (
              <div className="space-y-4">
                <p className="text-zinc-300">{mapsResult.text}</p>
                <div className="grid grid-cols-1 gap-2">
                  {mapsResult.links.map((link: any, i: number) => (
                    <a
                      key={i}
                      href={link.web?.uri || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 glass rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sm font-medium">{link.web?.title || 'Ver no Mapa'}</span>
                      <Search className="w-4 h-4 text-gold" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
