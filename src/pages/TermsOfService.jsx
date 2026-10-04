import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, Scale, ArrowLeft, Leaf, AlertCircle } from 'lucide-react';
import Footer from '../components/layout/Footer';

const TermsOfService = () => {
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
              <Scale size={22} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#1F5E3B] dark:text-emerald-400">
              Cardora Legal Terms & Platform Conditions
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-poppins text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Effective Date: October 4, 2026 • Cardora Smart Agriculture Ecosystem
          </p>
        </div>

        {/* TERMS SECTIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-8 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileCheck size={18} className="text-[#1F5E3B]" />
              1. Acceptance of Platform Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              By accessing or creating an account on the Cardora platform, you agree to comply with and be bound by these Terms of Service. Cardora provides plantation telemetry, IoT sensor monitoring, workforce management, and estate plot marketplace services to registered agricultural users.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck size={18} className="text-[#1F5E3B]" />
              2. User & Supervisor Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <li><strong>Account Security:</strong> Administrators, Planters, and Supervisors are responsible for maintaining confidentiality of JWT tokens and login credentials.</li>
              <li><strong>Marketplace Listings & Pattayam Accuracy:</strong> Landowners listing cardamom estate plots must provide accurate revenue Pattayam title deed documents.</li>
              <li><strong>Workforce Attendance & Wage Recording:</strong> Supervisors must record accurate check-in locations and wage disbursements without misrepresentation.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <AlertCircle size={18} className="text-[#1F5E3B]" />
              3. AI Agronomic Disclaimer
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Gemini AI crop diagnostics and disease risk forecasts are advisory tools designed to assist cardamom growers. Planters should consult certified agronomists for high-volume fungicide application decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              ⚖️ Governing Law
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              These terms shall be governed by and construed in accordance with the laws of Kerala, India. Disputes arising hereunder shall be subject to exclusive jurisdiction of courts in Idukki / High Court of Kerala.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
