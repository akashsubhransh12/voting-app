import React from 'react';
import { LogOut, User, BarChart3, ShieldAlert, Home, Vote } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="h-20 bg-white border-b-2 border-eci-purple flex items-center justify-between px-8 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-eci-purple rounded-full flex items-center justify-center text-white font-bold text-xl ring-4 ring-slate-50">ECI</div>
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 leading-none mb-1">Official Portal</h2>
          <p className="text-lg font-black tracking-tighter leading-none text-slate-900">ELECTION COMMISSION OF INDIA</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {user && (
          <>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-2 border-r border-slate-200 pr-4">
                <User size={14} className="text-eci-purple" />
                <span className="text-slate-900">{user.displayName || user.email}</span>
                {user.isVerified && (
                  <span className="ml-1 text-[9px] bg-eci-purple text-white px-2 py-0.5 rounded-sm font-black italic">
                    VERIFIED
                  </span>
                )}
              </span>
              <button
                onClick={() => auth.signOut()}
                className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Terminate
              </button>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Active Sec Link</span>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export const Sidebar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const commonItems = [
    { id: 'home', label: 'Mandate Home', icon: Home },
  ];

  const roleItems = user?.role === 'admin' ? [
    { id: 'dashboard', label: 'Admin Terminal', icon: ShieldAlert },
    { id: 'analytics', label: 'Live Records', icon: BarChart3 },
  ] : [
    { id: 'dashboard', label: 'Voting Booth', icon: Vote },
    { id: 'results', label: 'Electoral Returns', icon: BarChart3 },
    { id: 'profile', label: 'Voter Identity', icon: User },
  ];

  const menuItems = [...commonItems, ...roleItems];

  return (
    <div className="w-72 border-r border-slate-200 bg-white h-[calc(100vh-80px)] p-6 space-y-2">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Navigation Menu</div>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
            activeTab === item.id
              ? 'bg-eci-purple text-white shadow-xl shadow-eci-purple/20 translate-x-1'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3 font-bold uppercase text-[11px] tracking-widest">
            <item.icon size={16} className={activeTab === item.id ? 'text-indigo-200' : 'text-slate-400 group-hover:text-eci-purple'} />
            {item.label}
          </div>
          {activeTab === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
        </button>
      ))}
      <div className="pt-12">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
           <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">System Status</p>
           <p className="text-[10px] font-bold text-slate-600">All local nodes active. Sync latency 12ms.</p>
        </div>
      </div>
    </div>
  );
};
