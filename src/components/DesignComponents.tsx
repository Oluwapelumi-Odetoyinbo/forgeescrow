import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Reusable Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  asChild?: boolean;
  href?: string;
}

export const Button = ({ children, variant = 'primary', className, asChild, href, ...props }: ButtonProps) => {
  const baseStyle = "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300";
  const variants = {
    primary: "bg-[#c5f015] text-black hover:bg-[#aee600] hover:scale-105",
    secondary: "bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/5",
    outline: "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5"
  };

  const classes = cn(baseStyle, variants[variant], className);

  if (asChild && href) {
    return <a href={href} className={classes}>{children}</a>;
  }
  
  return <button className={classes} {...props}>{children}</button>;
};

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-6">
    <span className="text-xs uppercase tracking-[0.2em] text-zinc-300 font-medium">{children}</span>
  </div>
);

export const Glow = ({ color, className, size = "w-[400px] h-[400px]" }: { color: string, className?: string, size?: string }) => (
  <div 
    className={cn("absolute rounded-full mix-blend-screen filter blur-[120px] pointer-events-none animate-pulse-slow", size, className)} 
    style={{ backgroundColor: color, opacity: 0.15 }}
  />
);

// --- CSS Graphic Components ---

export const CreditCardGraphic = ({ variant = 'dark', className }: { variant?: 'dark' | 'light', className?: string }) => {
  const isDark = variant === 'dark';
  return (
    <div className={cn(
      "relative w-[320px] h-[200px] rounded-2xl p-6 border shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-transform duration-500",
      isDark ? "border-white/10 bg-zinc-900/80 shadow-black/50" : "border-white/30 bg-white/10 shadow-white/5",
      className
    )}>
      <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/[0.03] pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-start">
        <iconify-icon icon="solar:chip-linear" width="36" style={{color: isDark ? '#c5f015' : 'white'}}></iconify-icon>
        <span className="text-white font-bold tracking-tighter text-xl">FORGE</span>
      </div>
      
      <div className="relative z-10">
        <div className="text-xl font-medium tracking-[0.25em] text-white/90 mb-4 font-mono">
          **** **** **** 2025
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Network</div>
            <div className="text-sm text-white font-medium">LitVM Mainnet</div>
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1 text-right">Asset</div>
            <div className="text-sm text-white font-medium text-right">zkLTC</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TokenListItem = ({ icon, name, symbol, amount, value, color }: { icon: string, name: string, symbol: string, amount: string, value: string, color: string }) => (
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
