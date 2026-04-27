import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Vote, ShieldCheck, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 select-none technical-grid">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border-2 border-indigo-900 shadow-[24px_24px_0px_#e2e8f0] rounded-[2rem] overflow-hidden"
      >
        <div className="bg-indigo-900 px-10 py-12 text-white flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/30">
            <Vote size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter leading-none italic uppercase">Matdaan Terminal</h1>
          <p className="text-indigo-300 text-[10px] font-black tracking-[0.3em] uppercase mt-4">ECI National Secure Infrastructure</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <ShieldCheck className="text-indigo-600 shrink-0" size={20} />
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">End-to-End Encryption</h3>
                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">AES-256 Military Grade Security</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Fingerprint className="text-indigo-600 shrink-0" size={20} />
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Biometric Verification</h3>
                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Hashed Multi-Factor Protocols</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-200"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Initiate Digital Handshake'
            )}
          </button>

          <div className="pt-4 text-center">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] leading-relaxed max-w-[200px] mx-auto italic">
              Access sanctioned for authorized voters only. Unauthorized entry is a punishable offense.
            </p>
          </div>
        </div>
      </motion.div>
      <footer className="mt-12 opacity-30 flex gap-12 font-black text-[9px] uppercase tracking-widest text-slate-500">
        <span>Verified ID: 2.4B</span>
        <span>Secure Nodes: 124K</span>
      </footer>
    </div>
  );
};
