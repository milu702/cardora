import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert, Cpu, Key, Radio, ArrowLeft, Leaf, CheckCircle2 } from 'lucide-react';
import Footer from '../components/layout/Footer';

const SecurityProtocol = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF7] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* HEADER BAR */}
      <header className="bg-[#0A2315] text-white py-4 px-6 sm:px-10 border-b border-[#1F5E3B]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="bg-[#1F5E3B] group-hover:bg-[#2E7D4E] rounded-xl p-2 shadow-md transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black font-poppins tracking-wider text-white">
              CARDORA
            </span>
          </Link>

          <Link
            to="/dashboard?tab=admin"
            className="px-4 py-2 rounded-xl bg-[#1F5E3B] hover:bg-[#16442b] text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT HERO */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 sm:py-14 space-y-8">
        
        {/* PAGE TITLE BANNER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#EAF3E8] dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              <ShieldAlert size={22} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#1F5E3B] dark:text-emerald-400">
              Cardora Enterprise Cyber & IoT Security Architecture
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-poppins text-slate-900 dark:text-white tracking-tight">
            Security Protocol & Governance
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Zero-Trust RBAC • End-to-End Encryption • IoT Gateway Telemetry Security
          </p>
        </div>

        {/* SECURITY MATRIX CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-[#1F5E3B] font-extrabold">
              <Key size={18} />
              <h3 className="text-base font-black text-slate-900 dark:text-white">JWT Session Tokens</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Stateless JSON Web Tokens with HTTP-only security headers, enforcing 30-day strict rotation and automatic IP rate-limiting.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-[#1F5E3B] font-extrabold">
              <Cpu size={18} />
              <h3 className="text-base font-black text-slate-900 dark:text-white">AES-256 Audit Log Encryption</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              All platform administrative actions, user role modifications, and financial wage transactions are encrypted before database commit.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-[#1F5E3B] font-extrabold">
              <Radio size={18} />
              <h3 className="text-base font-black text-slate-900 dark:text-white">IoT Sensor Heartbeat Checks</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Field sensor telemetry nodes across 18 cardamom belts utilize cryptographic signatures to eliminate spoofed moisture or temperature feeds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-[#1F5E3B] font-extrabold">
              <Shield size={18} />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Gemini AI OCR Pattayam Verification</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Marketplace plot deeds undergo AI document validation verifying government revenue stamps, survey sketches, and thandaper registry numbers.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default SecurityProtocol;
