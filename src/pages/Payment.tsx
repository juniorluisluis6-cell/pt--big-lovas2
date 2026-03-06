import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Smartphone, Landmark, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PREMIUM_PRICE, CURRENCY } from '../constants';

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'mpesa' | 'card' | 'bank'>('mpesa');
  const [adminMpesa, setAdminMpesa] = useState<string>('84XXXXXXX');

  useEffect(() => {
    fetch('/api/admin/mpesa-info')
      .then(res => res.json())
      .then(data => {
        if (data.mpesa_number) setAdminMpesa(data.mpesa_number);
      });
  }, []);

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      alert(`Pagamento enviado para aprovação! Por favor, envie o valor para o M-Pesa: ${adminMpesa}. Um administrador revisará seu pedido em breve.`);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-premium-black p-6">
      <Link to="/premium-upgrade" className="inline-flex items-center gap-2 text-zinc-400 mb-8">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold mb-2">Pagamento</h1>
          <p className="text-zinc-400">Acesso vitalício por apenas um pagamento</p>
          <div className="mt-6 inline-block glass px-6 py-3 rounded-2xl">
            <span className="text-4xl font-bold gold-gradient">{PREMIUM_PRICE} {CURRENCY}</span>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <button
            onClick={() => setMethod('mpesa')}
            className={`w-full p-6 rounded-3xl border transition-all flex items-center gap-4 ${
              method === 'mpesa' ? 'border-gold bg-gold/10' : 'border-white/5 glass'
            }`}
          >
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold">M</div>
            <div className="text-left">
              <p className="font-bold">M-Pesa</p>
              <p className="text-xs text-zinc-500">Pagamento móvel rápido</p>
              {method === 'mpesa' && (
                <p className="text-xs font-bold text-gold mt-2">Enviar para: {adminMpesa}</p>
              )}
            </div>
            {method === 'mpesa' && <CheckCircle2 className="ml-auto text-gold" />}
          </button>

          <button
            onClick={() => setMethod('bank')}
            className={`w-full p-6 rounded-3xl border transition-all flex items-center gap-4 ${
              method === 'bank' ? 'border-gold bg-gold/10' : 'border-white/5 glass'
            }`}
          >
            <Landmark className="w-12 h-12 text-zinc-400" />
            <div className="text-left">
              <p className="font-bold">Transferência</p>
              <p className="text-xs text-zinc-500">Qualquer banco nacional</p>
            </div>
            {method === 'bank' && <CheckCircle2 className="ml-auto text-gold" />}
          </button>

          <button
            onClick={() => setMethod('card')}
            className={`w-full p-6 rounded-3xl border transition-all flex items-center gap-4 ${
              method === 'card' ? 'border-gold bg-gold/10' : 'border-white/5 glass'
            }`}
          >
            <CreditCard className="w-12 h-12 text-zinc-400" />
            <div className="text-left">
              <p className="font-bold">Cartão</p>
              <p className="text-xs text-zinc-500">Visa / Mastercard</p>
            </div>
            {method === 'card' && <CheckCircle2 className="ml-auto text-gold" />}
          </button>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full gold-button py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Pagamento'}
        </button>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Ao clicar em confirmar, você concorda com nossos termos de serviço premium.
        </p>
      </div>
    </div>
  );
}
