import React, { useEffect, useState } from 'react';
import { collection, query, addDoc, doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Users, Vote, Activity, Search, AlertTriangle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Candidate {
  id: string;
  name: string;
  party: string;
  voteCount: number;
}

interface Election {
  id: string;
  title: string;
  status: string;
  startTime: { seconds: number; nanoseconds: number } | null;
  endTime: { seconds: number; nanoseconds: number } | null;
}

interface ResultData {
  name: string;
  votes: number;
  party: string;
}

export const AdminDashboard: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [activeElection, setActiveElection] = useState<string | null>(null);
  const [results, setResults] = useState<ResultData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newElection, setNewElection] = useState({ title: '', status: 'upcoming' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'elections'));
    const unsub = onSnapshot(q, (snapshot) => {
      setElections(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Election)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (activeElection) {
      // Real-time vote count listener for candidates
      const candQuery = query(collection(db, `elections/${activeElection}/candidates`));
      const unsubCand = onSnapshot(candQuery, async (candSnap) => {
        const candidates = candSnap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate));
        
        // In a real high-perf app, we'd use cloud functions to increment counts.
        // For this clone, we manually count the docs in the subcollection.
        const voteQuery = query(collection(db, `elections/${activeElection}/votes`));
        const unsubVotes = onSnapshot(voteQuery, (voteSnap) => {
          const voteCounts: Record<string, number> = {};
          voteSnap.docs.forEach(v => {
            const data = v.data() as { candidateId: string };
            const cid = data.candidateId;
            voteCounts[cid] = (voteCounts[cid] || 0) + 1;
          });

          const chartData: ResultData[] = candidates.map(c => ({
            name: c.name,
            votes: voteCounts[c.id] || 0,
            party: c.party
          }));
          setResults(chartData);
        });
        
        return unsubVotes;
      });
      return unsubCand;
    }
  }, [activeElection]);

  const handleCreateElection = async () => {
    setLoading(true);
    try {
      const eRef = await addDoc(collection(db, 'elections'), {
        ...newElection,
        startTime: serverTimestamp(),
        endTime: new Date(Date.now() + 86400000 * 7), // 7 days from now
        createdAt: serverTimestamp()
      });
      
      // Add mock candidates automatically for the demo
      const cands = [
        { name: 'Dr. Ramesh Kumar', party: 'Liberal Federation', symbol: '⚖️' },
        { name: 'Smt. Anjali Singh', party: 'Modern Progress Party', symbol: '☀️' },
        { name: 'Shri Vikram Das', party: 'Social Justice Front', symbol: '🚜' }
      ];

      for (const c of cands) {
        await addDoc(collection(db, `elections/${eRef.id}/candidates`), c);
      }

      setIsFormOpen(false);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'elections', id), { status });
  };

  return (
    <div className="p-10 space-y-10 max-w-7xl select-none">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic italic leading-none text-slate-900 uppercase">
            Mission Control
          </h1>
          <p className="text-eci-purple text-[10px] font-black tracking-[0.4em] uppercase mt-4">Operational Strategic Oversight Interface</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-eci-purple text-white h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-black shadow-2xl shadow-eci-purple/20 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Protocol New Mandate
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Clusters', val: elections.filter(e => e.status === 'ongoing').length, icon: Activity, color: 'text-eci-purple' },
          { label: 'Registered Verified', val: '912M+', icon: Users, color: 'text-eci-purple' },
          { label: 'Live Vote Flow', val: results.reduce((acc, r) => acc + r.votes, 0), icon: Vote, color: 'text-green-600' },
          { label: 'Security Anomaly', val: '0', icon: AlertTriangle, color: 'text-slate-300' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-2 border-slate-100 p-8 rounded-[2rem] shadow-sm flex flex-col items-start hover:border-eci-purple transition-colors">
            <stat.icon className={`${stat.color} mb-6`} size={32} />
            <div className="text-4xl font-black tracking-tighter text-slate-900 italic italic leading-none">{stat.val}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Election Manager */}
        <div className="lg:col-span-4 bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden self-start">
          <div className="p-8 border-b-2 border-slate-50 bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Search size={14} className="text-eci-purple" />
              National Registry
            </h2>
          </div>
          <div className="divide-y-2 divide-slate-50 max-h-[500px] overflow-y-auto">
            {elections.map((election) => (
              <button
                key={election.id}
                onClick={() => setActiveElection(election.id)}
                className={`w-full p-8 text-left hover:bg-slate-50 transition-all group relative ${activeElection === election.id ? 'bg-indigo-50 border-l-8 border-eci-purple' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    election.status === 'ongoing' ? 'bg-eci-purple text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {election.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-tight uppercase mb-2 line-clamp-1">{election.title}</h3>
                <div className="flex gap-4 mt-6">
                   {election.status === 'upcoming' && (
                    <button onClick={(e) => { e.stopPropagation(); updateStatus(election.id, 'ongoing'); }} className="text-[10px] font-black uppercase text-eci-purple tracking-widest hover:underline">Activate</button>
                  )}
                  {election.status === 'ongoing' && (
                    <button onClick={(e) => { e.stopPropagation(); updateStatus(election.id, 'completed'); }} className="text-[10px] font-black uppercase text-red-600 tracking-widest hover:underline">Terminate</button>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Visualization */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-eci-purple text-white rounded-[3rem] p-12 min-h-[500px] shadow-2xl shadow-eci-purple/20 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 text-[180px] font-black text-white/5 select-none pointer-events-none italic italic">DATA</div>
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                <h2 className="text-3xl font-black italic italic tracking-tighter leading-none uppercase">Live Tabulation</h2>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Verified Vote Aggregation Feed</p>
              </div>
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-colors">
                <Download size={24} />
              </button>
            </div>

            {activeElection ? (
              <div className="h-72 mt-12 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} width={100} axisLine={false} tickLine={false} className="font-black uppercase tracking-widest" />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#4e45b8', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                    />
                    <Bar dataKey="votes" radius={[0, 8, 8, 0]} barSize={24}>
                      {results.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : index === 1 ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-indigo-300 border-2 border-dashed border-indigo-200/20 rounded-3xl mt-12">
                <Vote size={64} className="mb-6 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest opacity-40">Awaiting Cluster Selection</p>
              </div>
            )}
            
            <div className="mt-12 flex justify-between items-center relative z-10">
              <div className="flex gap-4">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>)}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Sync Frequency: 120ms</p>
            </div>
          </div>
          
          {/* Security Log */}
          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8">System Integrity Log</h3>
            <div className="space-y-4">
               {[
                 { time: '14:23:01', msg: 'HEARTBEAT_ACK: ALL CLUSTERS NOMINAL', status: 'sys' },
                 { time: '14:21:44', msg: 'BLOCK_GENERATED_VOTE_HASH_SHA256', status: 'block' },
                 { time: '14:15:10', msg: 'SECURITY_ALERT: ANOMALOUS_INGRESS_DETECTED', status: 'warn' },
               ].map((log, i) => (
                 <div key={i} className="flex gap-6 p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 font-mono text-[11px] font-bold">
                    <span className="text-slate-400">{log.time}</span>
                    <span className={log.status === 'warn' ? 'text-red-600' : 'text-slate-700'}>{log.msg}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Election Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-12 shadow-2xl border-4 border-slate-900">
             <div className="mb-10">
               <h2 className="text-4xl font-black tracking-tighter uppercase italic italic">Initialize Mandate</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">New Electoral Registry Protocol</p>
             </div>
                 <div className="space-y-8">
               <div>
                  <label className="text-[10px] font-black text-eci-purple uppercase tracking-widest px-1">Mandate Designation</label>
                  <input 
                    className="w-full h-16 bg-slate-50 border-2 border-slate-100 px-6 rounded-2xl mt-2 focus:ring-4 focus:ring-eci-purple/10 focus:border-eci-purple outline-none font-black text-lg transition-all"
                    placeholder="E.G. GENERAL_ASSEMBLY_2026"
                    value={newElection.title}
                    onChange={e => setNewElection(prev => ({ ...prev, title: e.target.value }))}
                  />
               </div>
               
               <div className="space-y-4">
                 <button 
                   onClick={handleCreateElection}
                   disabled={loading || !newElection.title}
                   className="w-full h-16 bg-eci-purple text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-eci-purple/20 active:scale-95 disabled:opacity-50"
                 >
                   {loading ? 'Initializing Protocol...' : 'Commit to Global Registry'}
                 </button>
                 <button 
                   onClick={() => setIsFormOpen(false)}
                   className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest py-2 hover:text-slate-900 transition-colors"
                 >
                   ABORT INITIALIZATION
                 </button>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
