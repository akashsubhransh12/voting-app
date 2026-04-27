/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, Sidebar } from './components/layout/Navbar';
import { AuthPanel } from './components/auth/AuthPanel';
import { LandingPage } from './components/layout/LandingPage';
import { VoterDashboard } from './components/dashboard/VoterDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ShieldCheck, Loader2 } from 'lucide-react';

function DashboardSwitch() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 font-mono text-zinc-400 gap-4">
        <Loader2 className="animate-spin" size={32} />
        <span className="uppercase tracking-[0.3em] text-xs">Decrypting Secure Link...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPanel />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col technical-grid select-none">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {activeTab === 'home' && <LandingPage onStartVoting={() => setActiveTab('dashboard')} />}
            {user.role === 'admin' ? (
              <>
                {activeTab === 'dashboard' && <AdminDashboard />}
                {activeTab === 'analytics' && <AdminDashboard />}
                {activeTab === 'alerts' && (
                   <div className="p-12">
                     <h1 className="text-5xl font-black tracking-tighter italic italic uppercase mb-8">Security Log</h1>
                     <div className="bg-red-900 border-2 border-red-800 p-10 rounded-[3rem] text-white flex items-center gap-8 shadow-2xl shadow-red-200">
                        <ShieldCheck size={48} className="text-red-400" />
                        <div>
                          <p className="font-black text-xs uppercase tracking-[0.4em] mb-2">Protocol: Zero Failure</p>
                          <p className="text-2xl font-black tracking-tight italic italic leading-none">NO ACTIVE THREATS DETECTED</p>
                          <p className="text-[10px] uppercase font-bold text-red-400 mt-4 tracking-widest">All regional clusters report synchronization status: NOMINAL [0 error, 0 warn].</p>
                        </div>
                     </div>
                   </div>
                )}
              </>
            ) : (
              <>
                {activeTab === 'dashboard' && <VoterDashboard />}
                {activeTab === 'results' && (
                   <div className="p-12 max-w-2xl mx-auto text-center py-48 space-y-8">
                     <div className="w-24 h-24 bg-indigo-900 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200">
                       <ShieldCheck size={48} />
                     </div>
                     <h2 className="text-4xl font-black italic italic tracking-tighter uppercase">Status: Embargoed</h2>
                     <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                       Results are legally embargoed until national-level tallying is completed and verified by the Chief Election Commissioner. 
                       Final certification expected {new Date().toLocaleDateString()} 18:00 IST.
                     </p>
                   </div>
                )}
                {activeTab === 'profile' && (
                   <div className="p-12">
                      <h2 className="text-5xl font-black tracking-tighter italic italic uppercase mb-10">Digital ID</h2>
                      <div className="bg-white border-2 border-slate-100 p-12 rounded-[3.5rem] shadow-[20px_20px_0px_#f1f5f9] space-y-12 max-w-3xl">
                         <div className="flex items-center gap-10 pb-12 border-b-2 border-slate-50">
                           <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-6xl text-white shadow-xl shadow-slate-200 italic italic font-black">ECI</div>
                           <div>
                              <h3 className="text-3xl font-black italic italic leading-none uppercase mb-2">{user.displayName}</h3>
                              <p className="text-indigo-600 text-[10px] font-black tracking-[0.3em] uppercase leading-none">{user.uid}</p>
                           </div>
                         </div>
                         <div className="grid grid-cols-2 gap-12">
                            <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Registry voterId</label>
                               <div className="text-lg font-black tracking-tight font-mono">{user.voterId || 'NONE_DETECTED'}</div>
                            </div>
                            <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Security Rank</label>
                               <div className={`text-lg font-black tracking-tight italic italic ${user.isVerified ? 'text-green-600' : 'text-red-500'}`}>
                                 {user.isVerified ? 'VERIFIED_CITIZEN' : 'UNAUTHORIZED_TERMINAL'}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardSwitch />
    </AuthProvider>
  );
}
