import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useCart } from '../context/CartContext';
import { generatePixPayload } from '../utils/pixPayload';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Heart,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Gift
} from 'lucide-react';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalItems,
    clearCart
  } = useCart();

  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'pix' | 'success'
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', message: '' });
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [pixPayloadStr, setPixPayloadStr] = useState('');

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayloadStr);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setStep('cart');
    }, 300);
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    if (!guestInfo.name.trim()) return;
    setIsSubmitting(true);
    try {
      // Gera o payload EMV/BR Code com o valor do carrinho
      const payload = generatePixPayload(totalPrice);
      setPixPayloadStr(payload);

      // Gera a imagem QR Code como data URL
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      });
      setQrDataUrl(dataUrl);
      setStep('pix');
    } catch (err) {
      console.error('Erro ao gerar QR Code PIX:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPixPayment = () => {
    setStep('success');
  };

  const handleFinishAll = () => {
    clearCart();
    setStep('cart');
    setGuestInfo({ name: '', email: '', message: '' });
    setIsCartOpen(false);
  };

  const formatBRL = (val) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gradient-to-b from-sky-50/90 via-white to-amber-50/30 backdrop-blur-md shadow-2xl border-l border-cyan-100 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-white/80 border-b border-cyan-100/60 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 border border-teal-200/60 flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
                  Carrinho de Presentes
                </h2>
                <p className="text-xs text-teal-700 font-medium">
                  {totalItems === 0
                    ? 'Nenhum presente selecionado'
                    : `${totalItems} ${totalItems === 1 ? 'item selecionado' : 'itens selecionados'}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* STEP 1: CART ITEMS LIST */}
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-200/50 shadow-inner">
                      <Gift className="w-10 h-10 opacity-75" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-800">Seu carrinho está vazio</h3>
                      <p className="text-sm text-slate-500 max-w-xs mt-1">
                        Escolha presentes carinhosos na nossa lista praiana para surpreender Luiz & Luiza!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-cyan-100/50">
                      <span className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                        Presentes Escolhidos
                      </span>
                      <button
                        onClick={clearCart}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        Limpar carrinho
                      </button>
                    </div>

                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/90 p-4 rounded-2xl border border-cyan-100 shadow-xs hover:shadow-md transition-all flex gap-4 items-center group"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-xl border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-0.5">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-sm font-bold text-slate-900 mt-1">
                            {item.price}
                          </p>

                          {/* Quantity selector */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-200 px-1 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 text-slate-600 hover:bg-slate-200 rounded-md transition"
                                title="Diminuir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-semibold px-2 text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 text-slate-600 hover:bg-slate-200 rounded-md transition"
                                title="Aumentar"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              title="Remover presente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* STEP 2: CHECKOUT FORM */}
            {step === 'checkout' && (
              <form onSubmit={handleSubmitCheckout} className="space-y-5 animate-fade-in">
                <div className="bg-sky-50/80 p-4 rounded-xl border border-sky-200/60 text-sky-900 text-xs flex items-start gap-2.5">
                  <Heart className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5 fill-rose-500" />
                  <p>
                    Preencha seus dados para associar seu presente à mensagem para os noivos Luiz & Luiza.
                  </p>
                </div>

                <div className="space-y-4 bg-white/90 p-5 rounded-2xl border border-cyan-100 shadow-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Seu Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestInfo.name}
                      onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                      placeholder="Ex: Maria & João Silva"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Seu E-mail ou WhatsApp
                    </label>
                    <input
                      type="text"
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      placeholder="Para enviar o recibo carinhoso"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mensagem Especial aos Noivos
                    </label>
                    <textarea
                      rows={3}
                      value={guestInfo.message}
                      onChange={(e) => setGuestInfo({ ...guestInfo, message: e.target.value })}
                      placeholder="Escreva seus votos de felicidades para o casal..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition resize-none"
                    />
                  </div>
                </div>

                <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Resumo do Presente
                  </div>
                  <div className="flex justify-between font-semibold pt-1">
                    <span>{totalItems} presente(s)</span>
                    <span className="text-sm font-bold text-slate-900">{formatBRL(totalPrice)}</span>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: PIX PAYMENT */}
            {step === 'pix' && (
              <div className="space-y-5 animate-fade-in text-center">
                <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 text-teal-900 space-y-1">
                  <Sparkles className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                  <h3 className="font-serif font-bold text-lg text-teal-900">Pagamento via PIX</h3>
                  <p className="text-xs text-teal-700">
                    Finalize seu presente apontando a câmera do banco ou copiando o código abaixo.
                  </p>
                </div>

                {/* QR Code Real — gerado via qrcode lib */}
                <div className="bg-white p-6 rounded-2xl border border-cyan-100 shadow-md inline-block mx-auto relative group">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code PIX"
                      className="w-56 h-56 mx-auto rounded-xl"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-slate-100 rounded-xl flex items-center justify-center">
                      <span className="text-xs text-slate-400">Gerando QR Code...</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 font-medium mt-3">
                    Valor Total: <strong className="text-slate-900 text-sm">{formatBRL(totalPrice)}</strong>
                  </p>
                </div>

                {/* Pix Copia e Cola */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                    Pix Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixPayloadStr}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        copiedPix
                          ? 'bg-emerald-600 text-white'
                          : 'bg-teal-700 hover:bg-teal-800 text-white'
                      }`}
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedPix ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPixPayment}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-teal-200/50 flex items-center justify-center gap-2 transition transform hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Já Fiz o Pagamento PIX
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION */}
            {step === 'success' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8 animate-scale-up">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-teal-200 border-4 border-white animate-bounce">
                  <Heart className="w-12 h-12 fill-white" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold tracking-wider">
                    PRESENTE CONFIRMADO! 🎉
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    Muito Obrigado, {guestInfo.name || 'Querido Convidado'}!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-xs mx-auto">
                    Luiz & Luiza receberam seu presente e sua mensagem carinhosa com imensa gratidão!
                  </p>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-cyan-100 text-left text-xs space-y-2 w-full max-w-xs shadow-xs">
                  <p className="font-bold text-slate-700 border-b border-slate-100 pb-1">
                    Resumo do Presente enviado:
                  </p>
                  <p className="text-slate-600">
                    <strong>Total:</strong> {formatBRL(totalPrice)} ({totalItems} itens)
                  </p>
                  {guestInfo.message && (
                    <p className="text-slate-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                      "{guestInfo.message}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleFinishAll}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-md transition"
                >
                  Concluir e Voltar ao Site
                </button>
              </div>
            )}

          </div>

          {/* Footer Bar for Step 1 & Step 2 */}
          {cart.length > 0 && (step === 'cart' || step === 'checkout') && (
            <div className="p-6 bg-white/90 border-t border-cyan-100/80 backdrop-blur-md space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>{formatBRL(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-teal-700">{formatBRL(totalPrice)}</span>
                </div>
              </div>

              {step === 'cart' && (
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-teal-200/50 flex items-center justify-center gap-2 transition transform hover:scale-[1.01]"
                >
                  <span>Prosseguir para Presentear</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 'checkout' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitCheckout}
                    disabled={isSubmitting || !guestInfo.name.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-teal-200/50 flex items-center justify-center gap-2 transition"
                  >
                    {isSubmitting ? (
                      <span>Gerando PIX...</span>
                    ) : (
                      <>
                        <span>Gerar PIX e Presentear</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
