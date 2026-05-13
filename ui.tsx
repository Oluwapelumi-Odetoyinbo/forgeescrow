import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

// --- Reusable Components ---

const Button = ({ children, variant = 'primary', className, asChild, href, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300";
  const variants = {
    primary: "bg-[#c5f015] text-black hover:bg-[#aee600] hover:shadow-[0_0_20px_rgba(197,240,21,0.3)] hover:scale-105",
    secondary: "bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/5",
    outline: "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5"
  };

  const classes = clsx(baseStyle, variants[variant], className);

  if (asChild && href) {
    return <a href={href} className={classes} {...props}>{children}</a>;
  }
  
  return <button className={classes} {...props}>{children}</button>;
};

const SectionLabel = ({ children }) => (
  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-6">
    <span className="text-xs uppercase tracking-[0.2em] text-zinc-300 font-medium">{children}</span>
  </div>
);

const Glow = ({ color, className, size = "w-[400px] h-[400px]" }) => (
  <div 
    className={clsx("absolute rounded-full mix-blend-screen filter blur-[120px] pointer-events-none animate-pulse-slow", size, className)} 
    style={{ backgroundColor: color, opacity: 0.15 }}
  />
);

// --- CSS Graphic Components to replace images ---

const CreditCardGraphic = ({ variant = 'dark', className }) => {
  const isDark = variant === 'dark';
  return (
    <div className={clsx(
      "relative w-[320px] h-[200px] rounded-2xl p-6 border shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-transform duration-500",
      isDark ? "border-white/10 bg-zinc-900/80 shadow-black/50" : "border-white/30 bg-white/10 shadow-white/5",
      className
    )}>
      {/* Subtle tonal overlay (solid, no gradient) */}
      <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/[0.03] pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-start">
        <iconify-icon icon="solar:chip-linear" width="36" style={{color: isDark ? '#c5f015' : 'white'}}></iconify-icon>
        <iconify-icon icon="simple-icons:visa" width="48" style={{color: 'white'}}></iconify-icon>
      </div>
      
      <div className="relative z-10">
        <div className="text-xl font-medium tracking-[0.25em] text-white/90 mb-4 font-mono">
          **** **** **** 4289
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Card Holder</div>
            <div className="text-sm text-white font-medium">ALEX DRIFTWOOD</div>
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1 text-right">Valid Thru</div>
            <div className="text-sm text-white font-medium text-right">12/28</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TokenListItem = ({ icon, name, symbol, amount, value, color }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10" style={{ color }}>
        <iconify-icon icon={icon} width="20"></iconify-icon>
      </div>
      <div>
        <div className="text-sm font-medium text-white">{name}</div>
        <div className="text-xs text-zinc-500">{symbol}</div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-sm font-medium text-white">{amount}</div>
      <div className="text-xs text-zinc-500">{value}</div>
    </div>
  </div>
);

// --- Sections ---

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={clsx(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      scrolled ? "bg-[#030303]/80 backdrop-blur-md border-white/10 py-3" : "bg-transparent border-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 text-white group">
          <div className="w-8 h-8 rounded-lg bg-[#c5f015] flex items-center justify-center text-black group-hover:scale-105 transition-transform">
            <iconify-icon icon="solar:wallet-bold" width="20"></iconify-icon>
          </div>
          <span className="text-lg font-medium tracking-tight">FinPath</span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
          {['Home', 'About Us', 'Product', 'Pricing', 'Contact'].map((item, i) => (
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

        {/* Auth */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex text-xs">Sign in</Button>
          <Button variant="secondary" className="text-xs px-4">Sign Up</Button>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Orbs (solid colors via Glow) */}
      <Glow color="#c5f015" className="top-20 left-10" />
      <Glow color="#ff00ff" className="bottom-20 right-10" />
      <Glow color="#00ffff" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 w-[600px] h-[600px]" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Content */}
        <div className="flex flex-col items-start max-w-2xl">
          <SectionLabel>Introducing Finpath</SectionLabel>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1] mb-6">
            Revolutionize Payments with FinPath <span className="text-highlight">Secure</span>, and Faster
          </h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-lg leading-relaxed">
            Experience the next generation of financial infrastructure. Blend traditional finance with crypto seamlessly globally.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Button className="px-8 py-3 text-base">Get Started Now</Button>
            <Button variant="outline" className="px-8 py-3 text-base gap-2">
              View Demo
              <iconify-icon icon="solar:arrow-right-linear" width="20"></iconify-icon>
            </Button>
          </div>

          {/* Testimonial snippet */}
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
                 {[1,2,3,4,5].map(star => <iconify-icon key={star} icon="solar:star-bold" width="12"></iconify-icon>)}
               </div>
               <div className="text-xs text-zinc-400">Trusted by 10,000+ businesses</div>
             </div>
          </div>
        </div>

        {/* Right Graphic */}
        <div className="relative h-[500px] flex items-center justify-center lg:justify-end perspective-1000">
          {/* Orbital lines */}
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
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: "solar:user-plus-linear",
      title: "Seamless Signup",
      desc: "Create your account in under 2 minutes with our automated KYC.",
      num: "01"
    },
    {
      icon: "solar:wallet-money-linear",
      title: "Load your assets",
      desc: "Deposit fiat or crypto directly into your secure FinPath vault.",
      num: "02"
    },
    {
      icon: "solar:card-send-linear",
      title: "Spend Globally",
      desc: "Use your card anywhere in the world with real-time conversion.",
      num: "03"
    }
  ];

  return (
    <section className="py-24 relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <SectionLabel>How it Works</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mt-4">
            Start <span className="text-highlight">spending Crypto</span> in minutes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
  );
};

const FeatureLeft = () => (
  <section className="py-24 relative overflow-hidden" id="product">
    <Glow color="#ff4500" className="top-0 right-0 opacity-10" />
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <SectionLabel>Power</SectionLabel>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mt-4 mb-6 leading-tight">
          Credit powered <span className="text-highlight">spending.</span>
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          Leverage your crypto assets as collateral to unlock instant credit lines. Spend without selling your valuable positions.
        </p>
        <ul className="space-y-4 mb-8">
          {['0% APR options available', 'No credit check required', 'Instant approval mechanism'].map((item, i) => (
             <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
               <div className="w-5 h-5 rounded-full bg-[#c5f015]/20 text-[#c5f015] flex items-center justify-center">
                 <iconify-icon icon="solar:check-read-linear" width="12"></iconify-icon>
               </div>
               {item}
             </li>
          ))}
        </ul>
        <Button variant="outline">Explore Credit</Button>
      </div>
      
      <div className="relative lg:h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 bg-zinc-900/40 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex flex-col gap-4 shadow-2xl">
           <div className="flex items-center justify-between mb-4">
             <div className="text-sm font-medium">Collateral Assets</div>
             <iconify-icon icon="solar:menu-dots-bold" className="text-zinc-500"></iconify-icon>
           </div>
           <TokenListItem icon="simple-icons:bitcoin" name="Bitcoin" symbol="BTC" amount="1.24" value="$84,320" color="#F7931A" />
           <TokenListItem icon="simple-icons:ethereum" name="Ethereum" symbol="ETH" amount="14.5" value="$32,145" color="#627EEA" />
           <TokenListItem icon="simple-icons:tether" name="Tether" symbol="USDT" amount="5,000" value="$5,000" color="#26A17B" />
           
           <div className="mt-auto pt-6 border-t border-white/10">
             <div className="flex justify-between text-sm mb-2">
               <span className="text-zinc-400">Available Credit</span>
               <span className="text-[#c5f015] font-medium">$45,000</span>
             </div>
             <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
               <div className="bg-[#c5f015] h-2 w-[60%]"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

const FeatureRight = () => (
  <section className="py-24 relative overflow-hidden">
    <Glow color="#8a2be2" className="bottom-0 left-0 opacity-10" />
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
      
      <div className="order-2 lg:order-1 relative lg:h-[600px] flex items-center justify-center">
         <div className="relative animate-float z-20">
           <CreditCardGraphic variant="dark" className="-rotate-6 scale-110" />
         </div>
         <div className="absolute animate-float-delayed z-10 opacity-40 blur-sm top-1/4 right-1/4">
           <CreditCardGraphic variant="light" className="rotate-12 scale-90" />
         </div>
      </div>

      <div className="order-1 lg:order-2">
        <SectionLabel>Flexibility</SectionLabel>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mt-4 mb-6 leading-tight">
          Dual-Mode Mastery. Use <span className="text-highlight">Credit or Debit</span>
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          Switch seamlessly between spending your stablecoins directly or tapping into your collateralized credit line with a single tap in the app.
        </p>
        <div className="flex gap-4">
           <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1">
             <iconify-icon icon="solar:card-transfer-linear" width="24" className="text-[#c5f015] mb-2"></iconify-icon>
             <div className="text-sm font-medium text-white mb-1">Instant Switch</div>
             <div className="text-xs text-zinc-500">Toggle modes instantly before any purchase.</div>
           </div>
           <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1">
             <iconify-icon icon="solar:shield-check-linear" width="24" className="text-[#c5f015] mb-2"></iconify-icon>
             <div className="text-sm font-medium text-white mb-1">Smart Route</div>
             <div className="text-xs text-zinc-500">Auto-route based on balance or rules.</div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

const Perks = () => {
  const perks = [
    { icon: "solar:cash-out-linear", title: "Up to 5% Cashback", desc: "Earn rewards in crypto on every purchase, instantly settled to your wallet." },
    { icon: "solar:global-linear", title: "Zero FX Fees", desc: "Spend in over 150 currencies with real-time interbank exchange rates." },
    { icon: "solar:safe-square-linear", title: "Bank-Grade Security", desc: "Multi-party computation (MPC) protects your assets at all times." }
  ];

  return (
    <section className="py-24" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <SectionLabel>Benefits</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mt-4">
            Jaw Dropping <span className="text-highlight">Perks</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {perks.map((perk, i) => (
            <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 hover:-translate-y-2 hover:bg-zinc-900/70 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-6 text-white">
                <iconify-icon icon={perk.icon} width="24"></iconify-icon>
              </div>
              <h3 className="text-lg font-medium mb-2">{perk.title}</h3>
              <p className="text-sm text-zinc-400">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    { q: "How fast can I get a virtual card?", a: "Instantly. Once your account is verified (usually under 2 minutes), a virtual card is generated and ready to use with Apple Pay or Google Pay." },
    { q: "What assets can I use as collateral?", a: "We currently support BTC, ETH, SOL, USDC, USDT, and several other major assets. We continuously add support for high-liquidity tokens." },
    { q: "Are there any hidden fees?", a: "No. We believe in absolute transparency. There are zero maintenance fees and zero foreign transaction fees. Standard network fees apply for crypto deposits/withdrawals." },
    { q: "Is FinPath available in my country?", a: "FinPath is available in the EEA, UK, and select states in the US. We are expanding globally. Check our support page for the full list of supported regions." },
    { q: "How does the crypto cashback work?", a: "Every time you make a purchase, up to 5% of the transaction value is credited back to your account in the cryptocurrency of your choice." }
  ];

  return (
    <section className="py-24 max-w-3xl mx-auto px-6" id="faq">
      <div className="text-center mb-12">
        <SectionLabel>Support</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mt-4">
          Frequently Asked <span className="text-highlight">Questions</span>
        </h2>
      </div>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-white/10 overflow-hidden">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
            >
              <span className={clsx("text-lg font-medium transition-colors", openIndex === i ? "text-white" : "text-zinc-300 group-hover:text-white")}>
                {faq.q}
              </span>
              <div className={clsx("transition-transform duration-300 flex-shrink-0 ml-4", openIndex === i ? "rotate-45 text-[#c5f015]" : "text-zinc-500")}>
                <iconify-icon icon="solar:add-circle-linear" width="24"></iconify-icon>
              </div>
            </button>
            <div 
              className={clsx("grid transition-all duration-300 ease-in-out", openIndex === i ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0 pb-0")}
            >
              <div className="overflow-hidden text-zinc-400 text-sm leading-relaxed pr-8">
                {faq.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const CTABanner = () => (
  <section className="py-24 px-6">
    <div className="max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900/50 p-12 md:p-20 text-center">
      {/* Background decoration - solid lime glow blob instead of gradient */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[100px] pointer-events-none rounded-full"
        style={{ backgroundColor: '#c5f015', opacity: 0.18 }}
      />
      <div
        className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[300px] blur-[120px] pointer-events-none rounded-full"
        style={{ backgroundColor: '#8a2be2', opacity: 0.15 }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 max-w-2xl leading-tight">
          Crypto Card Program for Industry Leaders
        </h2>
        <p className="text-zinc-400 mb-10 max-w-lg text-sm md:text-base">
          Join thousands of modern businesses and high-net-worth individuals building the future of finance with FinPath.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button className="px-8 py-4 text-base w-full sm:w-auto">Create Free Account</Button>
          <Button variant="secondary" className="px-8 py-4 text-base w-full sm:w-auto">Talk to Sales</Button>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-white/10 pt-20 pb-10 px-6 bg-[#030303]" id="contact">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
      <div className="col-span-2 lg:col-span-2">
        <a href="#" className="flex items-center gap-2 text-white mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#c5f015] flex items-center justify-center text-black">
            <iconify-icon icon="solar:wallet-bold" width="20"></iconify-icon>
          </div>
          <span className="text-lg font-medium tracking-tight">FinPath</span>
        </a>
        <p className="text-sm text-zinc-500 max-w-xs mb-6">
          Bridging the gap between decentralized assets and everyday spending. Secure, fast, and globally accepted.
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
        <h4 className="font-medium mb-4 text-white">Product</h4>
        <ul className="space-y-3 text-sm text-zinc-500">
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Virtual Cards</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Credit Lines</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">B2B API</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Pricing</a></li>
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium mb-4 text-white">Company</h4>
        <ul className="space-y-3 text-sm text-zinc-500">
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">About Us</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Careers</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Blog</a></li>
          <li><a href="#" className="hover:text-[#c5f015] transition-colors">Contact</a></li>
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium mb-4 text-white">Legal</h4>
        <ul className="space-y-3 text-sm text-zinc-500">
          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
      <div>© {new Date().getFullYear()} FinPath Technologies. All rights reserved.</div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c5f015]"></span>
        All systems operational
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen relative text-zinc-50 font-sans selection:bg-[#c5f015] selection:text-black">
      <NavBar />
      <main>
        <Hero />
        <HowItWorks />
        <FeatureLeft />
        <FeatureRight />
        <Perks />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}