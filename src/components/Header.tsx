import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button, SectionLabel, CreditCardGraphic } from './DesignComponents';

interface HeaderProps {
  onConnectWallet: () => void;
  walletAddress: string | null;
  balance: string;
}

export const Header = ({ onConnectWallet, walletAddress, balance }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    const ethBalance = parseFloat(bal) / 1e18;
    return ethBalance.toFixed(4);
  };

  return (
    <>
      <nav className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled ? "bg-[#030303]/80 backdrop-blur-md border-white/10 py-3" : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 text-white group">
            {/* <div className="w-8 h-8 rounded-lg bg-[#c5f015] flex items-center justify-center text-black group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div> */}
            <span className="text-lg font-medium tracking-tight">ForgeEscrow</span>
          </a>

          {/* Links */}
          {!walletAddress && (
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
              {['Home', 'How it Works', 'Features', 'FAQ', 'Contact'].map((item, i) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
                    i === 0 ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item}
                </a>
              ))}
            </div>
          )}

          {/* Auth */}
          <div className="flex items-center gap-2">
            {walletAddress ? (
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full py-1 pl-4 pr-1">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 leading-none mb-1">Balance</p>
                  <p className="text-xs font-medium text-white leading-none">{formatBalance(balance)} zkLTC</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#c5f015] animate-pulse" />
                  <span className="text-xs font-mono text-zinc-300">{formatAddress(walletAddress)}</span>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={onConnectWallet} className="hidden sm:inline-flex text-xs">Sign in</Button>
                <Button variant="secondary" onClick={onConnectWallet} className="text-xs px-4">Connect Wallet</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {!walletAddress && (
        <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">

            {/* Left Content */}
            <div className="flex flex-col items-start max-w-2xl">
              <SectionLabel>LiteForge Hackathon - RWA Track</SectionLabel>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1] mb-6">
                On-chain Trade Finance for the <span className="text-[#c5f015]">Freelance</span> Economy
              </h1>
              <p className="text-lg text-zinc-400 mb-8 max-w-lg leading-relaxed">
                Milestone-based escrow platform. Clients lock zkLTC before work begins. Freelancers get paid after delivery. Trustless, secure, and global.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Button onClick={onConnectWallet} className="px-8 py-3 text-base">Get Started Now</Button>
                <Button variant="outline" className="px-8 py-3 text-base gap-2">
                  View Demo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Stats/Testimonial snippet */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {[
                    "1534528741775-53994a69daeb",
                    "1506794778202-cad84cf45f1d",
                    "1494790108377-be9c29b29330"
                  ].map((id, i) => (
                    <img key={i} src={`https://images.unsplash.com/photo-${id}?w=100&h=100&fit=crop&q=80&sat=-100`} alt="User" className="w-8 h-8 rounded-full border-2 border-[#030303]" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[#c5f015] mb-1">
                    {[1, 2, 3, 4, 5].map(star => <iconify-icon key={star} icon="solar:star-bold" width="12"></iconify-icon>)}
                  </div>
                  <div className="text-xs text-zinc-400">Powered by LitVM • Settled in zkLTC</div>
                </div>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative h-[500px] flex items-center justify-center lg:justify-end perspective-1000">
              <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[500px] h-[500px] rounded-full border border-white/5 animate-[spin_30s_linear_infinite_reverse]" />

              <div className="relative animate-float group z-20">
                <CreditCardGraphic className="-rotate-12 group-hover:-rotate-6" />
              </div>
              <div className="absolute top-1/2 left-1/4 animate-float-delayed z-10 scale-90 opacity-60 blur-[1px]">
                <CreditCardGraphic variant="light" className="rotate-12" />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
