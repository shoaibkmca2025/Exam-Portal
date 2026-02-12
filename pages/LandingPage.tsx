import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center py-10 md:py-16 lg:py-24 overflow-hidden bg-subtle-grid">
      {/* Immersive Background Layers */}
      <div className="fixed inset-0 bg-blueprint opacity-20 dark:opacity-30 pointer-events-none"></div>
      <div className="fixed inset-0 bg-noise pointer-events-none"></div>
      <div className="fixed inset-0 bg-aurora pointer-events-none"></div>
      
      <div className="relative z-10 content-container">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16 lg:gap-32">
          
          {/* Hero Section */}
          <div className="flex-1 space-y-8 md:space-y-12 animate-in text-center lg:text-left">
            {/* Version Ticker */}
            <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group mx-auto lg:ml-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                Protocol: <span className="text-indigo-600 dark:text-indigo-400 group-hover:tracking-[0.5em] transition-all">EXAM_PRO_v2.5</span>
              </span>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-gradient relative z-10 font-syne uppercase">
                  Rigor <br />
                  <span className="opacity-40 italic font-medium lowercase font-outfit text-2xl sm:text-3xl lg:text-6xl tracking-normal block -mt-2 lg:-mt-8 ml-2">meets</span>
                  Integrity.
                </h1>
                <div className="hidden lg:block absolute -top-10 -left-10 text-[12rem] font-black text-indigo-500/5 select-none pointer-events-none font-syne">
                  01
                </div>
              </div>
              
              <div className="hud-border mx-auto lg:ml-0 max-w-lg lg:max-w-none">
                <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                  The mission-critical assessment platform. Engineered for institutional transparency, powered by high-fidelity proctoring protocols.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2 md:pt-6">
              <Link 
                to="/login" 
                className="w-full sm:w-auto group relative px-10 md:px-12 py-5 md:py-6 bg-slate-900 dark:bg-indigo-600 text-white notched font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
              >
                Access Terminal
                <i className="fas fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
              </Link>
              
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <span className="hidden sm:block w-8 md:w-12 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Documentation</span>
              </div>
            </div>
          </div>

          {/* Technical Interface Card - Grid optimized for mobile */}
          <div className="flex-1 w-full max-w-2xl animate-in mt-8 lg:mt-0" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Decorative Geometric Elements - Hidden on mobile for clarity */}
              <div className="hidden md:block absolute -top-6 -right-6 w-24 h-24 border-t-2 border-r-2 border-indigo-500/20 rounded-tr-3xl"></div>
              <div className="hidden md:block absolute -bottom-6 -left-6 w-24 h-24 border-b-2 border-l-2 border-indigo-500/20 rounded-bl-3xl"></div>

              <div className="pro-card p-1 md:p-1.5 overflow-hidden border-2 shadow-2xl">
                <div className="bg-slate-950 rounded-[1.2rem] md:rounded-[2.2rem] overflow-hidden relative group">
                  <div className="scanline"></div>
                  
                  {/* Internal HUD Elements */}
                  <div className="p-6 md:p-10 lg:p-12 space-y-8 md:space-y-12">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-1 w-8 md:w-12 bg-indigo-500"></div>
                        <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">System Status: Nominal</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500/20"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2 md:space-y-3">
                        <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Precision_Quotient</span>
                        <div className="text-3xl md:text-4xl font-black text-white font-syne leading-none">99.9%</div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[99.9%]"></div>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Response_Latency</span>
                        <div className="text-3xl md:text-4xl font-black text-white font-syne leading-none">14ms</div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 w-[14%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 md:pt-8 border-t border-white/5">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-colors shrink-0">
                          <i className="fas fa-microchip text-indigo-500 text-xl md:text-2xl group-hover:scale-110 transition-transform"></i>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-white text-base md:text-lg font-bold uppercase tracking-tight font-syne">AI Synthesis Core</h3>
                          <p className="text-white/40 text-[10px] md:text-xs font-medium">Auto-generation active.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terminal Decoration */}
                  <div className="bg-white/5 px-6 md:px-8 py-3 md:py-4 flex justify-between items-center">
                    <div className="flex gap-4">
                      <span className="text-[7px] md:text-[8px] font-mono text-white/20"># SECURE_NODE_04</span>
                      <span className="text-[7px] md:text-[8px] font-mono text-white/20"># AUTH_VERIFIED</span>
                    </div>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-indigo-500/20 rounded-sm animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Proof Bar - Hidden on very small screens or scrollable */}
        <div className="mt-20 md:mt-32 pt-12 md:pt-16 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
          <p className="text-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-slate-600 mb-8 md:mb-12 px-4">
            Trusted by World-Class Institutions
          </p>
          <div className="flex flex-wrap justify-center lg:justify-between items-center gap-8 md:gap-12 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000 px-4">
            {['GLOBAL_SCIENCE', 'TECH_FORGE', 'RE_ACADEMIA', 'ELITE_PROCTORS'].map((brand) => (
              <span key={brand} className="font-black text-base md:text-xl lg:text-2xl tracking-[0.2em] md:tracking-[0.4em] font-syne transition-transform hover:scale-110 cursor-default whitespace-nowrap">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Static Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
    </div>
  );
};

export default LandingPage;