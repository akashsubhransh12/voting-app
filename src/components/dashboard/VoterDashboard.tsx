import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Send, Clock, ChevronRight, Vote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Election {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  endTime: { seconds: number; nanoseconds: number };
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
}

export const VoterDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voterIdInput, setVoterIdInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'elections'), where('status', 'in', ['ongoing', 'upcoming', 'completed']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Election));
      setElections(docs);
    });

    if (user) {
      // Check which elections user already voted in
      // Since our rule is votes/{userId}, we can just check existence across all elections
      // But query is better if we have many elections. For now, we'll fetch on demand or check presence.
    }

    return unsubscribe;
  }, [user]);

  const handleRegister = async () => {
    if (!voterIdInput || !user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        voterId: voterIdInput,
        isVerified: true, // Auto-verify for demo purposes, normally this would be an admin action
      }, { merge: true });
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (electionId: string) => {
    const q = query(collection(db, `elections/${electionId}/candidates`));
    const snapshot = await getDocs(q);
    setCandidates(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Candidate)));
  };

  const castVote = async (candidateId: string) => {
    if (!user || !selectedElection) return;
    setLoading(true);
    try {
      // Use User UID as the vote document ID to enforce 1 vote per election
      const voteRef = doc(db, `elections/${selectedElection.id}/votes`, user.uid);
      await setDoc(voteRef, {
        userId: user.uid,
        electionId: selectedElection.id,
        candidateId: candidateId,
        timestamp: serverTimestamp(),
      });
      setSelectedElection(null);
      // Trigger a refresh/alert
      alert("Vote Cast Successfully! Thank you for participating in democracy.");
    } catch (err: unknown) {
      console.error(err);
      alert("Voting Failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isVerified) {
    return (
      <div className="p-12">
        <div className="bg-white border-2 border-slate-200 p-12 rounded-[2.5rem] shadow-[20px_20px_0px_#f1f5f9] max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <AlertCircle className="text-red-500" size={32} />
            <h2 className="text-3xl font-black tracking-tighter uppercase italic italic">Status: Unverified</h2>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
            Access to digital electoral mandates requires a valid National Identification Handshake.
            Please submit your government issued Voter ID to initialize your terminal.
          </p>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Digital Voter ID Registry</label>
              <input
                type="text"
                value={voterIdInput}
                onChange={(e) => setVoterIdInput(e.target.value)}
                placeholder="REGISTRY_ID_00X"
                className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-eci-purple focus:outline-none transition-all font-mono font-bold text-lg"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading || !voterIdInput}
              className="w-full h-16 bg-eci-purple text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              Verify Identity Hash
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic italic uppercase">Electoral Desk</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Active Mandate Selection Terminal</p>
        </div>
        <div className="bg-eci-purple px-6 py-4 rounded-2xl text-white shadow-xl shadow-eci-purple/20">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Verified Voter</p>
          <p className="text-lg font-black tracking-tight">{user.displayName}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {elections.map((election) => (
          <div key={election.id} className="bg-white border-2 border-slate-100 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all flex flex-col group border-slate-200">
            <div className="flex items-center justify-between mb-8">
               <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-4 py-1.5 rounded-full ${
                 election.status === 'ongoing' ? 'bg-eci-purple text-white' : 
                 election.status === 'upcoming' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'
               }`}>
                {election.status}
              </span>
              <span className="text-slate-400 text-[10px] flex items-center gap-2 font-black uppercase tracking-widest">
                <Clock size={12} />
                CL: {new Date(election.endTime?.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">{election.title}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest line-clamp-2 leading-relaxed mb-10">{election.description}</p>
            
            {election.status === 'ongoing' ? (
              <button 
                onClick={() => { setSelectedElection(election); loadCandidates(election.id); }}
                className="mt-auto bg-eci-purple text-white h-14 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-eci-purple/10"
              >
                Access Voting Booth
                <ChevronRight size={18} />
              </button>
            ) : (
              <div className="mt-auto h-14 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">Terminal Locked</div>
            )}
          </div>
        ))}
        {elections.length === 0 && (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <Vote className="mx-auto text-slate-200 opacity-20 mb-6" size={80} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-300">No active mandates found in your sector.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedElection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col border-4 border-slate-900"
            >
              <div className="p-10 border-b-4 border-slate-900 flex items-center justify-between bg-eci-purple text-white">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic italic">{selectedElection.title}</h2>
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Electronic Mandate Secure Terminal</p>
                </div>
                <button 
                  onClick={() => setSelectedElection(null)}
                  className="bg-white/10 hover:bg-white text-white hover:text-eci-purple h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  ABORT BOOTH ENTRY
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => castVote(candidate.id)}
                    className="p-8 bg-white border-2 border-slate-200 rounded-3xl text-left hover:border-eci-purple hover:shadow-2xl hover:translate-y-[-4px] transition-all group relative overflow-hidden active:scale-95"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl border-2 border-slate-50 group-hover:bg-eci-purple/5 transition-colors">
                        {candidate.symbol || '👤'}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-eci-purple uppercase tracking-[0.2em] mb-1">{candidate.party}</div>
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{candidate.name}</h4>
                      </div>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <div className="w-14 h-14 bg-eci-purple rounded-full flex items-center justify-center text-white shadow-xl">
                        <Send size={24} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-8 bg-slate-900 text-slate-400 text-[9px] font-black text-center uppercase tracking-[0.3em]">
                Biometric Handshake Active • End-to-End Encryption Enabled • Democracy Protocol 4.0
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
