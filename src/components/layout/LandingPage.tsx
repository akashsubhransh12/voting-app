import React from 'react';
import { 
  FileText, 
  UserPlus, 
  Search, 
  Download, 
  HelpCircle, 
  Smartphone, 
  ExternalLink,
  ClipboardList,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Vote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
  primary?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, color, onClick, primary }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${
      primary ? 'bg-eci-purple border-eci-purple text-white shadow-xl shadow-eci-purple/20' : 
      color === 'blue' ? 'bg-eci-blue/5 border-eci-blue/10 hover:border-eci-blue/40' :
      color === 'red' ? 'bg-eci-red border-eci-red/20 hover:border-eci-red/50' :
      color === 'green' ? 'bg-eci-green border-eci-green/20 hover:border-eci-green/50' :
      'bg-white border-slate-100 hover:border-indigo-200'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${primary ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-50'}`}>
      <span className={primary ? 'text-white' : 'text-eci-purple'}>{icon}</span>
    </div>
    <h3 className={`font-black text-sm uppercase tracking-widest mb-2 ${primary ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
    <p className={`text-[11px] font-bold uppercase tracking-tight leading-relaxed mb-6 ${primary ? 'text-indigo-100' : 'text-slate-500'}`}>
      {description}
    </p>
    <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-70">
      {primary ? 'Direct Entry' : 'Open Link'}
      <ExternalLink size={10} />
    </div>
  </motion.div>
);

interface SearchResult {
  name: string;
  epic: string;
  part: string;
  station: string;
}

export const LandingPage: React.FC<{ onStartVoting: () => void }> = ({ onStartVoting }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<SearchResult[] | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/electoral-roll/search?q=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleEPICDownload = async () => {
    try {
      const res = await fetch('/api/voter/e-epic');
      const data = await res.json();
      alert(`Preparing download for EPIC: ${data.epicNumber}\nName: ${data.voterName}`);
      window.open(data.downloadUrl, '_blank');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-24 pb-32">
      {/* Dynamic Hero Section */}
      <section className="bg-eci-purple rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl shadow-eci-purple/30">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
        
        <div className="max-w-3xl relative z-10 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            System Status: Verified & Encrypted
          </motion.div>
          
          <h1 className="text-7xl font-black italic uppercase leading-[0.85] tracking-tighter">
            Digital Identity <br/>
            <span className="text-eci-blue">Absolute</span> <br/>
            Sovereignty.
          </h1>
          
          <p className="text-xl font-bold opacity-80 leading-relaxed uppercase tracking-widest max-w-lg">
            Empowering the world's largest democracy through hyper-secure, blockchain-verified electronic voting protocols.
          </p>
          
          <div className="flex flex-wrap gap-6 pt-6">
            <button 
              onClick={onStartVoting}
              className="bg-white text-eci-purple px-10 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-eci-blue hover:text-white transition-all shadow-white/20 shadow-2xl active:scale-95 flex items-center gap-4"
            >
              Enter Voting Booth
              <Vote size={20} />
            </button>
            <button 
              onClick={() => document.getElementById('search-voter')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 border-2 border-white/20 px-10 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all flex items-center gap-4"
            >
              Search E-Roll
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-white opacity-5 rounded-full border-[60px] border-white/10 rotate-12 pointer-events-none"></div>
      </section>

      {/* Production Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Core Forms - Left Column */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center gap-6 px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-eci-purple">ELECTORAL_FORMS</h2>
            <div className="h-0.5 flex-1 bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ServiceCard 
              icon={<Vote />}
              title="Voter Registration"
              description="Initiate the verification protocol for inclusion in the national electoral database."
              color="pink"
            />
            <ServiceCard 
              icon={<UserPlus />}
              title="Registration (NRI)"
              description="Secure portal for citizens residing outside territorial boundaries to claim mandate."
              color="blue"
            />
            <ServiceCard 
              icon={<FileText />}
              title="Deletion Protocol"
              description="Authorized removal of identity records from specific electoral partitions."
              color="red"
            />
            <ServiceCard 
              icon={<ClipboardList />}
              title="Correction Desk"
              description="Submit validated metadata updates for existing EPIC identity profiles."
              color="green"
            />
          </div>

          {/* Identity Verification Engine */}
          <div id="search-voter" className="bg-eci-yellow border-2 border-eci-yellow/50 rounded-[4rem] p-12 space-y-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Search size={120} />
             </div>
             <div className="space-y-4">
               <h3 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Verification Engine v4.0.2</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cross-reference national electoral databases in real-time.</p>
             </div>
             
             <div className="flex flex-col md:flex-row gap-4 relative z-10">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="INPUT NATIONAL EPIC ID OR BIO-TAG..."
                  className="flex-1 h-20 bg-white rounded-3xl px-8 border-2 border-eci-yellow/20 shadow-inner focus:border-eci-purple outline-none font-black text-lg tracking-tight transition-all"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="h-20 px-12 bg-eci-purple text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
                >
                  {isSearching ? 'SCANNING...' : 'INITIALIZE SEARCH'}
                  <Search size={20} />
                </button>
             </div>
             
             <AnimatePresence>
              {searchResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2rem] border-2 border-eci-yellow/50 p-6 overflow-hidden shadow-2xl"
                >
                  {searchResults.length > 0 ? (
                    <div className="divide-y-2 divide-slate-50">
                      {searchResults.map((voter, idx) => (
                        <div key={idx} className="flex items-center justify-between p-8 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-8">
                             <div className="w-16 h-16 bg-eci-purple/5 rounded-2xl flex items-center justify-center text-eci-purple">
                               <UserCheck size={28} />
                             </div>
                             <div>
                                <p className="text-xl font-black text-slate-900 tracking-tight">{voter.name}</p>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {voter.epic} | P_UNIT: {voter.part}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest h-8 flex items-center px-4 bg-slate-50 rounded-full">{voter.station}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                       <HelpCircle size={48} className="mx-auto text-slate-200 mb-6" />
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No verified identities matched current encryption keys.</p>
                    </div>
                  )}
                </motion.div>
              )}
             </AnimatePresence>
          </div>
        </div>

        {/* Global Services - Right Column */}
        <div className="lg:col-span-4 space-y-12">
           <div className="flex items-center gap-6 px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-eci-purple">GLOBAL_SERVICES</h2>
          </div>
          
          <div className="space-y-6">
             <button 
              onClick={handleEPICDownload}
              className="w-full group flex items-center justify-between p-8 bg-eci-green border-2 border-eci-green/20 rounded-[2.5rem] hover:shadow-2xl hover:border-eci-green transition-all text-left relative overflow-hidden"
             >
                <div className="absolute -right-8 -bottom-8 opacity-5">
                   <Download size={140} />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-eci-purple group-hover:bg-eci-purple group-hover:text-white transition-colors">
                    <Download size={24}/>
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-slate-800 mb-1">E-EPIC Download</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Verified Identity Certificate</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-slate-300 relative z-10" />
             </button>

             {[
               { icon: <UserCheck size={20}/>, label: 'Track Application', sub: 'LIVE PROTOCOL MONITORING', color: 'blue' },
               { icon: <HelpCircle size={20}/>, label: 'Support Register', sub: 'GRIEVANCE RESOLUTION CELL', color: 'yellow' },
               { icon: <Download size={20}/>, label: 'Electoral Roll', sub: 'PDF CLUSTER REVISIONS', color: 'pink' },
             ].map((item, i) => (
               <button key={i} className="w-full group flex items-center justify-between p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-eci-purple/30 hover:shadow-xl transition-all text-left">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-eci-purple/5 group-hover:text-eci-purple transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-0.5">{item.label}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{item.sub}</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-100 group-hover:text-eci-purple transition-colors" />
               </button>
             ))}
          </div>

          {/* App Ecosystem Module */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-eci-purple/20 to-transparent"></div>
            <div className="relative z-10 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Smartphone className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-widest">ECINet Unified</h3>
               </div>
               <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-relaxed">
                 Access democratic protocols on the move. Download the secure ECI ecosystem.
               </p>
               <div className="grid grid-cols-2 gap-4">
                 <button className="h-14 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest transition-all">App Store</button>
                 <button className="h-14 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest transition-all">Play Store</button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Section */}
      <section className="bg-white border-2 border-slate-100 rounded-[4rem] p-16 md:p-24 space-y-20 shadow-sm relative overflow-hidden">
         <div className="max-w-3xl space-y-6 relative z-10">
            <h2 className="text-xs font-black tracking-[0.5em] text-eci-purple uppercase">Audit_Intelligence</h2>
            <p className="text-5xl font-black tracking-tighter uppercase italic italic leading-[0.9] text-slate-900">
               Every Mandate <br/>
               Is A Digital <br/>
               <span className="text-eci-purple">Symphony.</span>
            </p>
            <p className="text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
               Our infrastructure is audited by international security consortia to guarantee that every vote is tamper-proof from the point of entry to final tabulation.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {[
              { title: "End-to-End Encryption", desc: "Encryption keys are generated uniquely for each voter biological handshake." },
              { title: "Distributed Ledger", desc: "Results are stored across immutable distributed nodes for absolute transparency." },
              { title: "Biometric Auth", desc: "Multi-factor authentication protocols prevent identity spoofing and proxy voting." }
            ].map((feature, i) => (
              <div key={i} className="space-y-6 group">
                 <div className="w-16 h-2 bg-slate-100 group-hover:bg-eci-purple transition-all duration-500 rounded-full"></div>
                 <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">{feature.title}</h4>
                 <p className="text-[11px] font-bold uppercase text-slate-400 tracking-widest leading-relaxed">{feature.desc}</p>
              </div>
            ))}
         </div>

         <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-[0.03] select-none pointer-events-none">
            <Vote size={500} className="translate-x-1/2 translate-y-1/4" />
         </div>
      </section>

      {/* Reviews Section */}
      <section className="space-y-16">
         <div className="flex items-center gap-6 border-b-2 border-slate-100 pb-8">
            <h2 className="text-3xl font-black italic uppercase italic tracking-tighter text-slate-900">Voter Feedback</h2>
            <div className="flex gap-2">
               {[1,2,3,4,5].map(x => <div key={x} className="w-2 h-2 rounded-full bg-eci-purple"></div>)}
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: "Arjun Mehta", role: "Digital Pioneer", text: "The cross-platform consistency is incredible. I searched my slip on the web and voted on the terminal seamlessly." },
              { name: "Suman Rao", role: "Civil Observer", text: "Transparency is the bedrock of democracy. The new ECI architecture sets a global gold standard." },
              { name: "Kevin D'Souza", role: "UX Designer", text: "Finally, a government portal that feels modern, fast, and secure. The UI reflects the trust we place in ECI." }
            ].map((review, i) => (
              <div key={i} className="p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:shadow-2xl hover:translate-y-[-4px] transition-all">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-10 leading-relaxed italic italic">"{review.text}"</p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-eci-purple/5 flex items-center justify-center font-black text-eci-purple shadow-inner">{review.name[0]}</div>
                    <div>
                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">{review.name}</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{review.role}</p>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* Comprehensive Footer Terminal */}
      <footer className="bg-slate-50 border-2 border-slate-100 rounded-[4.5rem] p-16 md:p-24 space-y-24">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="col-span-1 md:col-span-2 space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-eci-purple rounded-[1.25rem] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-eci-purple/20">ECI</div>
                  <div>
                    <p className="text-2xl font-black italic italic uppercase tracking-tighter text-slate-900 leading-none">Matdaan Portal</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">National Trust Terminal</p>
                  </div>
               </div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-sm">
                  The Election Commission of India is established under Article 324 of the Constitution. Every digital interaction is protected by sovereign encryption.
               </p>
            </div>
            
            <div className="space-y-10">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-eci-purple">Resource Hub</p>
               <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <li className="hover:text-eci-purple cursor-pointer transition-colors flex items-center justify-between">Media Center <ExternalLink size={10}/></li>
                  <li className="hover:text-eci-purple cursor-pointer transition-colors flex items-center justify-between">Publication Hub <ExternalLink size={10}/></li>
                  <li className="hover:text-eci-purple cursor-pointer transition-colors flex items-center justify-between">Electoral Data <ExternalLink size={10}/></li>
               </ul>
            </div>

            <div className="space-y-10">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-eci-purple">Command HQ</p>
               <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <li className="flex items-center gap-4"><Phone size={14} className="text-eci-purple"/> Terminal 1950</li>
                  <li className="flex items-center gap-4"><Mail size={14} className="text-eci-purple"/> control@eci.gov.in</li>
                  <li className="flex items-start gap-4"><MapPin size={14} className="text-eci-purple mt-1"/> NIRVACHAN SADAN</li>
               </ul>
            </div>
         </div>

         <div className="pt-20 border-t-2 border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className="hover:text-eci-purple cursor-pointer transition-colors">Privacy Charter</span>
               <span className="hover:text-slate-900 cursor-pointer transition-colors">Digital Bill of Rights</span>
               <span className="hover:text-slate-900 cursor-pointer transition-colors">Accessibility</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">© 2026 ELECTION COMMISSION OF INDIA. ISO 27001 CERTIFIED.</p>
         </div>
      </footer>
    </div>
  );
};
