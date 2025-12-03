'use client';

import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { 
  Search, Trophy, Calendar, User, Shield, Database, Activity, 
  AlertCircle, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, 
  BookOpen, X, Target, Sparkles, Heart, Bookmark, Copy, Share2
} from 'lucide-react';

// --- Types ---
interface BuilderScore {
  score: {
    last_calculated_at: string | null;
    points: number;
    rank_position: number | null;
    slug: string;
  };
  address?: string;
}

interface ScoreUIProps {
  initialBasename?: string;
  initialScoreData?: BuilderScore | null;
}

// --- Data ---
const SCORING_DATA = [
  {
    category: "Onchain Activity",
    icon: <Activity className="w-5 h-5 text-blue-500" />,
    items: [
      { name: "ETH Balance", points: "8 pts", desc: "Verifies total ETH balance across all supported chains." },
      { name: "Outgoing Transactions", points: "8 pts", desc: "Verifies total number of outgoing transactions." },
      { name: "First Transaction", points: "8 pts", desc: "Verifies timestamp of first transaction." },
      { name: "Contracts (Testnet)", points: "4 pts", desc: "Smart contracts deployed to testnet." },
      { name: "Contracts (Mainnet)", points: "8 pts", desc: "Smart contracts deployed to mainnet." },
      { name: "Active Smart Contracts", points: "12 pts", desc: "Mainnet contracts with 10+ unique transacting wallets." },
    ]
  },
  {
    category: "Base Ecosystem",
    icon: <Database className="w-5 h-5 text-blue-600" />,
    items: [
      { name: "Base Learn", points: "13 pts", desc: "Completion of Base Learn exercises (13 SBTs)." },
      { name: "Builder Rewards", points: "30 pts", desc: "ETH earnings from Base Builder Rewards Program." },
      { name: "/base-builds Earnings", points: "30 pts", desc: "ETH earnings from /base-builds rounds." },
      { name: "Basecamp Attendee", points: "20 pts", desc: "Attendance at Basecamp 001 or 002." },
      { name: "Hackathons Participation", points: "20 pts", desc: "Participation in Base Hackathons." },
      { name: "Hackathons Won", points: "30 pts", desc: "Wins in Base Hackathons." },
    ]
  },
  {
    category: "GitHub",
    icon: <User className="w-5 h-5 text-slate-700" />,
    items: [
      { name: "Total Contributions", points: "30 pts", desc: "Total GitHub contributions over time." },
      { name: "Repositories", points: "8 pts", desc: "Number of repositories contributed to." },
      { name: "Account Age", points: "8 pts", desc: "GitHub account creation date." },
      { name: "Stars", points: "6 pts", desc: "Number of repository stars." },
      { name: "Forks", points: "12 pts", desc: "Number of repository forks." },
      { name: "Followers", points: "6 pts", desc: "Number of GitHub followers." },
      { name: "Crypto Repos", points: "30 pts", desc: "Contributions to curated crypto repositories." },
      { name: "Crypto Commits", points: "30 pts", desc: "Commits to curated crypto repositories." },
    ]
  },
  {
    category: "Farcaster",
    icon: <Activity className="w-5 h-5 text-purple-500" />,
    items: [
       { name: "Developer Rewards", points: "40 pts", desc: "USDC earned (top 25 mini apps)." },
       { name: "Account Age", points: "6 pts", desc: "Account creation date." },
       { name: "Creator Rewards", points: "24 pts", desc: "USDC earned (top accounts)." },
       { name: "Farcon NYC 2025", points: "12 pts", desc: "Attendance ticket NFT." },
    ]
  },
  {
    category: "Talent Protocol",
    icon: <Shield className="w-5 h-5 text-purple-600" />,
    items: [
      { name: "$TALENT Balance", points: "8 pts", desc: "Current $TALENT balance on Base." },
      { name: "Account Age", points: "6 pts", desc: "Talent Protocol account age." },
      { name: "Human Checkmark", points: "20 pts", desc: "Identity verification completion." },
      { name: "$TALENT Vault", points: "8 pts", desc: "Total amount staked." },
      { name: "Builder+ Member", points: "6 pts", desc: "Active Builder+ membership." },
      { name: "Verified Builder", points: "20 pts", desc: "Registry of Onchain Builders status." },
    ]
  },
  {
    category: "Other Integrations",
    icon: <Target className="w-5 h-5 text-emerald-600" />,
    items: [
      { name: "ENS Account Age", points: "6 pts", desc: "First ENS domain registration." },
      { name: "X/Twitter Age", points: "4 pts", desc: "Account creation date." },
      { name: "Lens Account Age", points: "6 pts", desc: "Account creation date." },
      { name: "Optimism Super Score", points: "15 pts", desc: "User's Super Account Score." },
      { name: "Scroll Hackathons", points: "20 pts", desc: "Participation in Scroll Hackathons." },
      { name: "Celo Builder", points: "88 pts", desc: "Rewards (30), Endorsements (8), Participation (20), Score (30)." },
      { name: "BuidlGuidl", points: "44 pts", desc: "Challenges (24), Batches (20)." },
      { name: "ETHGlobal", points: "116 pts", desc: "Hackathons, Packs, Finalist status." },
      { name: "Devfolio", points: "50 pts", desc: "Hackathon participation (20) and wins (30)." },
      { name: "Encode", points: "50 pts", desc: "Programmes participation (20) and wins (30)." },
      { name: "Developer DAO", points: "20 pts", desc: "OG Status (12) or $CODE tokens (8)." },
    ]
  }
];

export default function ScoreUI({ initialBasename = '', initialScoreData = null }: ScoreUIProps) {
  const [basename, setBasename] = useState(initialBasename);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<BuilderScore | null>(initialScoreData);
  const [showConcepts, setShowConcepts] = useState(false);
  const [showImproveGuide, setShowImproveGuide] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Initialize Farcaster SDK
  useEffect(() => {
    const initSdk = async () => {
      try {
        await sdk.actions.ready();
      } catch (err) {
        console.error('Failed to initialize SDK:', err);
      }
    };
    initSdk();
  }, []);

  const handleAddMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
    } catch (e) {
      console.error('Failed to add mini app manually', e);
    }
  };

  const handleCheckScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScoreData(null);

    // Prompt to add MiniApp on search interaction
    try {
      const context = await sdk.context;
      if (context && context.client && !context.client.added) {
         await sdk.actions.addMiniApp();
      }
    } catch (e) {
      console.log('User skipped adding app or error:', e);
    }

    try {
      const response = await fetch(`/api/builder-score?name=${encodeURIComponent(basename)}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
           throw new Error("Could not resolve this Basename. Please ensure spelling is correct, or try using your primary Basename if you have one set.");
        }
        throw new Error(data.error || 'Failed to fetch score');
      }

      setScoreData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!scoreData || !basename) return;

    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${appUrl}/?name=${encodeURIComponent(basename)}&score=${scoreData.score.points}&rank=${scoreData.score.rank_position}`;
    
    const text = `I just checked my Base Builder Score: ${scoreData.score.points} points! 🏗️\n\nCheck yours here:`;

    try {
      await sdk.actions.composeCast({
        text: text,
        embeds: [shareUrl]
      });
    } catch (e) {
      console.error("Error launching compose cast", e);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDonate = () => {
    const address = "0xa6DEe9FdE9E1203ad02228f00bF10235d9Ca3752";
    const textArea = document.createElement("textarea");
    textArea.value = address;
    textArea.style.position = "fixed"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 pb-20">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden flex flex-col border-x border-slate-100 relative">
        
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 pb-10 rounded-b-[2.5rem] shadow-lg relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold tracking-tight">Base Builder Score</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAddMiniApp}
                  className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all active:scale-95 group"
                  title="Bookmark App"
                >
                  <Bookmark className="w-4 h-4 text-blue-100 fill-transparent group-hover:fill-blue-100/50 transition-colors" />
                  <span className="text-xs font-semibold text-blue-50">Bookmark</span>
                </button>
              </div>
            </div>
            <p className="text-blue-100/90 text-sm leading-relaxed max-w-[90%]">
              Enter a Basename to reveal the reputation of a builder on the Base ecosystem.
            </p>
          </div>
        </header>

        <main className="flex-1 px-6 -mt-8 relative z-20 pb-8 space-y-6">
          
          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-1.5">
            <form onSubmit={handleCheckScore} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="username.base.eth"
                value={basename}
                onChange={(e) => setBasename(e.target.value)}
                className="w-full pl-11 pr-14 py-4 bg-transparent rounded-xl focus:outline-none placeholder:text-slate-400 font-medium text-slate-800"
              />
              <div className="absolute right-1.5">
                <button 
                  type="submit"
                  disabled={loading || !basename}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl p-2.5 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ChevronDown className={`w-5 h-5 transition-transform ${loading ? '' : '-rotate-90'}`} />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Results State */}
          {scoreData && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              {/* Score Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-[2rem] p-7 shadow-2xl relative overflow-hidden border border-white/10 group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -ml-10 -mb-10"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-blue-200/80 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Reputation Score
                      </h3>
                      <div className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-200 drop-shadow-sm">
                        {scoreData.score.points}
                      </div>
                    </div>
                    {scoreData.score.rank_position && (
                       <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 flex items-center gap-1.5 shadow-lg">
                         <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                         Top {scoreData.score.rank_position.toLocaleString()}
                       </div>
                    )}
                  </div>

                  <div className="space-y-3.5 pt-5 border-t border-white/5">
                    <div className="flex items-center justify-between text-sm group/item">
                      <div className="flex items-center gap-2 text-slate-400 group-hover/item:text-slate-300 transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>Last Updated</span>
                      </div>
                      <span className="font-medium text-slate-200 tabular-nums">
                        {formatDate(scoreData.score.last_calculated_at)}
                      </span>
                    </div>
                    
                    {scoreData.address && (
                      <div className="flex items-center justify-between text-sm group/item">
                         <div className="flex items-center gap-2 text-slate-400 group-hover/item:text-slate-300 transition-colors">
                          <Shield className="w-4 h-4" />
                          <span>Wallet Address</span>
                        </div>
                        <span className="font-mono text-[11px] bg-black/40 px-2.5 py-1 rounded-lg text-slate-300 border border-white/5 truncate max-w-[120px]">
                          {scoreData.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Share and Improve Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleShare}
                  className="py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  Share Score
                </button>
                <button 
                  onClick={() => setShowImproveGuide(true)}
                  className="py-4 px-4 bg-white border border-blue-100 hover:border-blue-300 rounded-2xl text-blue-700 font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:bg-blue-50/50 active:scale-[0.98]"
                >
                  <BookOpen className="w-4 h-4" />
                  Improve Score
                </button>
              </div>

              {/* Zero Score / Call to Action */}
              {scoreData.score.points === 0 && (
                 <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      No Score Found
                    </h4>
                    <p className="text-amber-800/90 text-sm mb-4 leading-relaxed">
                      This profile hasn't earned a Builder Score yet. To get started, you need to be active onchain and connect your accounts.
                    </p>
                    <a 
                      href="https://talentprotocol.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Start Building Reputation <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                    </a>
                 </div>
              )}
            </div>
          )}

          {/* Core Concepts Toggle */}
          <div className="pt-2">
            <button 
              onClick={() => setShowConcepts(!showConcepts)}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-left">
                   <span className="block font-bold text-slate-800">What is Builder Score?</span>
                   <span className="text-xs text-slate-500 font-medium">Learn about the protocol</span>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-blue-500 transition-all duration-300 ${showConcepts ? 'rotate-180 bg-blue-50 text-blue-500' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>
            
            {showConcepts && (
              <div className="mt-3 space-y-4 animate-in slide-in-from-top-2 duration-300 ease-out origin-top">
                
                {/* Intro */}
                <div className="prose prose-sm max-w-none text-slate-600 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="mb-6 leading-relaxed">
                    Talent Protocol tracks builder activity across blockchains, GitHub, Twitter and other platforms to calculate a 
                    <strong className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded ml-1">Builder Score</strong>. This helps ecosystems reward real contributors.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <InfoItem 
                      icon={<User className="w-4 h-4 text-emerald-500" />}
                      title="Profile"
                      desc="Unified identity linking wallets & accounts."
                    />
                    <InfoItem 
                      icon={<Shield className="w-4 h-4 text-purple-500" />}
                      title="User"
                      desc="A verified individual with one or more accounts."
                    />
                    <InfoItem 
                      icon={<Database className="w-4 h-4 text-amber-500" />}
                      title="Data Point"
                      desc="Verified facts (Transactions, GitHub stars, etc)."
                    />
                     <InfoItem 
                      icon={<Activity className="w-4 h-4 text-pink-500" />}
                      title="Score"
                      desc="Numerical reputation calculated from Data Points."
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                       <Target className="w-4 h-4 text-blue-500" />
                       Why it matters
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="leading-snug">Helps builders get <strong className="font-semibold text-slate-700">rewarded</strong> for contributions.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="leading-snug">Makes reputation <strong className="font-semibold text-slate-700">visible</strong> across ecosystems.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="leading-snug">Distinguishes <strong className="font-semibold text-slate-700">real builders</strong> from bots.</span>
                      </li>
                    </ul>
                </div>

              </div>
            )}
          </div>

        </main>

        {/* Improvement Guide Modal */}
        {showImproveGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20">
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                <div>
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight">Score Guide</h2>
                   <p className="text-sm text-slate-500 font-medium">Actions to increase your builder reputation</p>
                </div>
                <button 
                  onClick={() => setShowImproveGuide(false)} 
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent bg-slate-50/50">
                {SCORING_DATA.map((cat) => (
                  <div key={cat.category} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-50">
                       <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          {cat.icon}
                       </div>
                       <h3 className="font-bold text-slate-800 text-lg">
                          {cat.category}
                       </h3>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cat.items.map((item) => (
                        <div key={item.name} className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm transition-all group duration-200">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <span className="font-bold text-sm text-slate-700 leading-tight group-hover:text-blue-700 transition-colors">{item.name}</span>
                            <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2 py-1 rounded-md whitespace-nowrap border border-blue-100">
                              {item.points}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-600">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-5 bg-white border-t border-slate-100 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20">
                 <a 
                   href="https://talentprotocol.com"
                   target="_blank"
                   rel="noopener noreferrer" 
                   className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
                 >
                   Connect accounts at Talent Protocol <ExternalLink className="w-4 h-4" />
                 </a>
              </div>

            </div>
          </div>
        )}

      </div>
      
      {/* Sticky Donate Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={handleDonate}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          <div className="bg-rose-100 p-1.5 rounded-full group-hover:bg-rose-200 transition-colors">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <span className="text-sm">Donate</span>
          {isCopied ? (
            <span className="ml-1 text-xs text-green-600 font-medium animate-in fade-in">Copied!</span>
          ) : (
            <Copy className="w-3 h-3 text-slate-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      </div>

    </div>
  );
}

// Helper Component for Info Items
function InfoItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200">
      <div className="mt-0.5 shrink-0 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
        {icon}
      </div>
      <div>
        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1">{title}</h5>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}