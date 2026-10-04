import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, ArrowLeft, Leaf, CheckCircle2 } from 'lucide-react';
import Footer from '../components/layout/Footer';

const PrivacyPolicy = () => {
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
              <Shield size={22} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#1F5E3B] dark:text-emerald-400">
              Cardora Legal & Compliance
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-poppins text-slate-900 dark:text-white tracking-tight">
            Privacy Policy & Data Security
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Last Updated: October 4, 2026 • Cardora Agricultural Intelligence & Spice Network
          </p>
        </div>

        {/* POLICY SECTIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-8 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Lock size={18} className="text-[#1F5E3B]" />
              1. Information We Collect
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Cardora collects information necessary to provide smart agricultural telemetry, plantation management, marketplace auctions, and expert agronomic advice across the Western Ghats cardamom belts:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <li><strong>Personal Profile Data:</strong> Name, email address, phone number, role (Farmer, Supervisor, Expert, Admin), and district location.</li>
              <li><strong>Plantation & GIS Telemetry:</strong> Plot acreage, geographic coordinates (latitude/longitude), soil moisture, pH, ambient temperature, and crop health diagnostic records.</li>
              <li><strong>Document Verification Records:</strong> Land revenue Pattayam title deeds submitted for legal marketplace verification.</li>
              <li><strong>Workforce & Attendance Logs:</strong> Worker check-in times, GPS location verification, and supervisor wage disbursement receipts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Eye size={18} className="text-[#1F5E3B]" />
              2. How We Use Your Data
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Your data is utilized strictly to power precision agriculture and platform security:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 space-y-1">
                <span className="font-extrabold text-xs text-[#1F5E3B] dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 size={14} /> AI Agronomic Advisories
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">To calculate tailored NPK fertilizer schedules and Azhukal disease prevention alerts.</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-1">
                <span className="font-extrabold text-xs text-teal-800 dark:text-teal-300 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Verified Auctions
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">To display legal Pattayam verified badge status to buyers on estate plot sales.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText size={18} className="text-[#1F5E3B]" />
              3. Data Protection & Encryption
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Cardora enforces industry-standard AES-256 encryption for database audit logs and SSL/TLS encryption for all REST microservice communications. We never sell or share user data with third-party advertising brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-poppins flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              📞 Contact Compliance Officer
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              For privacy inquiries, data deletion requests, or legal verification checks, contact our team at: <strong className="text-[#1F5E3B]">privacy@cardora.com</strong> or call <strong className="text-[#1F5E3B]">+91 4868 270 100</strong>.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
