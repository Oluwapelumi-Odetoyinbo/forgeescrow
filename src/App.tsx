import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { CreateEscrow } from './components/CreateEscrow';
import { EscrowList } from './components/EscrowList';
import { EscrowDetails } from './components/EscrowDetails';
import { useWallet } from './hooks/useWallet';
import { useGsapReveal } from './hooks/useGsapReveal';
import { Escrow } from './types';
import { Plus, Shield, Zap, Lock, CheckCircle2 } from 'lucide-react';
import { Button, SectionLabel, TokenListItem } from './components/DesignComponents';
import { clsx } from 'clsx';

type View = 'list' | 'create' | 'details';

const LandingSections = () => {
  useGsapReveal();
  const steps = [
    {
      icon: "solar:pen-new-square-linear",
      title: "Create Escrow",
      desc: "Define your project scope, milestones, and payment terms in seconds.",
      num: "01"
    },
    {
      icon: "solar:shield-check-linear",
      title: "Lock zkLTC",
      desc: "Clients lock funds in a trustless smart contract on LitVM before work starts.",
      num: "02"
    },
    {
      icon: "solar:card-send-linear",
      title: "Release & Settle",
      desc: "Funds are released instantly to the freelancer upon milestone approval.",
      num: "03"
    }
  ];

  const perks = [
    { icon: <Shield className="w-6 h-6" />, title: "Secure Escrow", desc: "Military-grade smart contract protection for all your trade transactions." },
    { icon: <Zap className="w-6 h-6" />, title: "Instant Settlement", desc: "No more waiting for banks. Get paid instantly in zkLTC upon delivery." },
    { icon: <Lock className="w-6 h-6" />, title: "Trustless Flow", desc: "No intermediaries or geographic gatekeepers. Just pure code-driven trust." }
  ];

  return (
    <div className="bg-background">
      {/* How It Works */}
      <section className="py-24 relative bg-gradient-to-b from-[#0a0a0a] to-[#0d0d0d]" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16" data-reveal="up">
            <SectionLabel>Workflow</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mt-4">
              Pure <span className="text-[#c5f015]">Transparency</span> in every step
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6" data-stagger>
            {steps.map((step, i) => (
              <div key={i} className="group relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] transition-colors overflow-hidden">
                <div className="absolute -right-4 -bottom-8 text-9xl font-black text-white/[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  {step.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-[#c5f015]">
                  <iconify-icon icon={step.icon} width="24"></iconify-icon>
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 relative overflow-hidden bg-[#0d0d0d]" id="features">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div data-reveal="left">
            <SectionLabel>Security</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mt-4 mb-6 leading-tight">
              Milestone-based <span className="text-[#c5f015]">Protection.</span>
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              Leverage LitVM's programmable privacy to secure your trade finance. Only release funds when specific conditions are met.
            </p>
            <ul className="space-y-4 mb-8">
              {['Zk-proof settlement', 'Multi-signature milestones', 'Trustless arbitration'].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                   <div className="w-5 h-5 rounded-full bg-[#c5f015]/20 text-[#c5f015] flex items-center justify-center">
                     <CheckCircle2 className="w-3 h-3" />
                   </div>
                   {item}
                 </li>
              ))}
            </ul>
            <Button variant="outline">Learn More</Button>
          </div>
          
          <div className="relative lg:h-[600px] flex items-center justify-center" data-reveal="right">
            <div className="absolute inset-0 bg-zinc-900/40 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex flex-col gap-4 shadow-2xl">
               <div className="flex items-center justify-between mb-4">
                 <div className="text-sm font-medium">Recent Activity</div>
                 <iconify-icon icon="solar:menu-dots-bold" className="text-zinc-500"></iconify-icon>
               </div>
               <TokenListItem icon="simple-icons:litecoin" name="zkLTC Payment" symbol="Settled" amount="+1,250" value="$1,250" color="#345D9D" />
               <TokenListItem icon="solar:lock-bold" name="Escrow Created" symbol="Active" amount="5,000" value="$5,000" color="#c5f015" />
               <TokenListItem icon="solar:check-circle-bold" name="Milestone Approved" symbol="Completed" amount="2,000" value="$2,000" color="#10b981" />
               
               <div className="mt-auto pt-6 border-t border-white/10">
                 <div className="flex justify-between text-sm mb-2">
                   <span className="text-zinc-400">Total Value Locked</span>
                   <span className="text-[#c5f015] font-medium">$1.2M+</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                   <div className="bg-[#c5f015] h-2 w-[75%]"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-24 bg-gradient-to-b from-[#0d0d0d] to-[#0a0a0a]" id="perks">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16" data-reveal="up">
            <SectionLabel>Benefits</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mt-4">
              Built for <span className="text-[#c5f015]">Global</span> Scale
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6" data-stagger>
            {perks.map((perk, i) => (
              <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 hover:-translate-y-2 hover:bg-zinc-900/70 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-6 text-[#c5f015]">
                  {perk.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{perk.title}</h3>
                <p className="text-sm text-zinc-400">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900/50 p-12 md:p-20 text-center" data-reveal="scale">
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 max-w-2xl leading-tight">
              The Future of Freelance Payments is Here
            </h2>
            <p className="text-zinc-400 mb-10 max-w-lg text-sm md:text-base">
              Join the LiteForge Hackathon's premier RWA platform and experience seamless on-chain trade finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button className="px-8 py-4 text-base w-full sm:w-auto">Get Started Free</Button>
              <Button variant="secondary" className="px-8 py-4 text-base w-full sm:w-auto">Read Whitepaper</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Footer = () => (
  <footer className="border-t border-white/10 pt-20 pb-10 px-6 bg-[#030303]" id="contact">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
      <div className="col-span-2 lg:col-span-2">
        <a href="#" className="flex items-center gap-2 text-white mb-6">
          <span className="text-lg font-medium tracking-tight">ForgeEscrow</span>
        </a>
        <p className="text-sm text-zinc-500 max-w-xs mb-6">
          Bridging the gap between decentralized trade finance and the freelance economy. Secure, fast, and trustless.
        </p>
        <div className="flex gap-4">
          {['twitter', 'discord', 'github', 'linkedin'].map(social => (
            <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
              <iconify-icon icon={`simple-icons:${social}`} width="16"></iconify-icon>
            </a>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-4 text-white">Platform</h4>
        <ul className="space-y-3 text-sm text-zinc-500">
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Escrows</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Milestones</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">LitVM API</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Fees</a></li>
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium mb-4 text-white">Company</h4>
        <ul className="space-y-3 text-sm text-zinc-500">
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">About Us</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Hackathon</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Blog</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Contact</a></li>
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium mb-4 text-white">Legal</h4>
        <ul className="space-y-3 text-sm text-zinc-500">
          <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
      <div>© {new Date().getFullYear()} ForgeEscrow. Built for LiteForge Hackathon 2025.</div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c5f015]"></span>
        All systems operational
      </div>
    </div>
  </footer>
);

function App() {
  const { wallet, connectWallet } = useWallet();
  const [view, setView] = useState<View>('list');
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectEscrow = (escrow: Escrow) => {
    setSelectedEscrow(escrow);
    setView('details');
  };

  const handleCreateSuccess = () => {
    setView('list');
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-50 font-sans selection:bg-[#c5f015] selection:text-black">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#c5f015',
              secondary: '#000000',
            },
          },
        }}
      />

      <Header
        onConnectWallet={connectWallet}
        walletAddress={wallet.address}
        balance={wallet.balance}
      />

      <main className={clsx(!wallet.isConnected ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32")}>
        {!wallet.isConnected ? (
          <LandingSections />
        ) : (
          <>
            {view === 'list' && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-zinc-400">Manage your escrows and milestones</p>
                  </div>
                  <Button
                    onClick={() => setView('create')}
                    className="gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Escrow</span>
                  </Button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                  <EscrowList
                    key={refreshKey}
                    walletAddress={wallet.address!}
                    onSelectEscrow={handleSelectEscrow}
                  />
                </div>
              </>
            )}

            {view === 'create' && (
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={() => setView('list')}
                  className="mb-6 text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                >
                  ← Back to Dashboard
                </button>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                  <CreateEscrow onSuccess={handleCreateSuccess} />
                </div>
              </div>
            )}

            {view === 'details' && selectedEscrow && (
              <div className="max-w-5xl mx-auto">
                <button
                  onClick={() => setView('list')}
                  className="mb-6 text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                >
                  ← Back to Dashboard
                </button>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                  <EscrowDetails
                    key={refreshKey}
                    escrow={selectedEscrow}
                    walletAddress={wallet.address!}
                    onBack={() => setView('list')}
                    onUpdate={handleUpdate}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
