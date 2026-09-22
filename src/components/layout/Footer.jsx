import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ChevronRight, Send, CheckCircle2 } from 'lucide-react';
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa';

import { validateEmailDomain } from '../../utils/validation';

const Footer = ({ className = '' }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      setNewsletterError('Please enter your email address.');
      return;
    }
    const domainCheck = validateEmailDomain(newsletterEmail.trim());
    if (!domainCheck.valid) {
      setNewsletterError(domainCheck.message);
      return;
    }
    setNewsletterError('');
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 5000);
  };

  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    Company: ['About', 'Careers', 'Blog', 'Press'],
    Resources: ['Documentation', 'Help Center', 'API Reference', 'Community'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  };

  const socialIcons = [
    { icon: FaTwitter, label: 'Twitter', href: 'https://twitter.com' },
    { icon: FaFacebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: FaLinkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: FaYoutube, label: 'YouTube', href: 'https://youtube.com' },
  ];

  return (
    <footer className={`bg-[#0A2315] text-white relative overflow-hidden transition-all duration-300 border-t border-[#1F5E3B]/40 ${className}`}>
      
      {/* Sleek Gradient Accent Border Line */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-[#C9A227] to-emerald-600 opacity-80" />

      <div className="w-full px-6 sm:px-10 py-12 lg:py-16 relative z-10 max-w-7xl mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 items-start">
          
          {/* Brand & Newsletter Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-[#1F5E3B] group-hover:bg-[#2E7D4E] rounded-xl p-2.5 shadow-md transition-colors">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black font-poppins text-white tracking-wider">
                CARDORA
              </span>
            </Link>

            <p className="text-[#DDEFD9]/80 leading-relaxed text-xs md:text-sm font-medium pr-2">
              Smart Agriculture AI & Cardamom Plantation Management Platform.
              Empowering planters with real-time intelligence, marketplace auctions, and expert agronomist advice.
            </p>

            {/* Newsletter Card with Glassmorphism */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-glass space-y-3">
              <h5 className="text-xs font-black text-[#C9A227] uppercase tracking-wider">
                🌿 Subscribe to Cardamom Farming Insights
              </h5>
              
              {newsletterSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Subscribed! Thank you for joining Cardora.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="email" 
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        if (newsletterError) setNewsletterError('');
                      }}
                      placeholder="Enter your email address..." 
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/10 border text-white placeholder-[#DDEFD9]/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition-all ${newsletterError ? 'border-rose-500 bg-rose-900/20' : 'border-white/15'}`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-gradient-to-r from-[#1F5E3B] to-[#2E7D4E] hover:from-[#2E7D4E] hover:to-[#1F5E3B] text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <span>Subscribe</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {newsletterError && (
                    <p className="text-[11px] text-rose-300 font-bold ml-1">⚠️ {newsletterError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex gap-2.5 pt-1">
              {socialIcons.map(({ icon: Icon, label, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#1F5E3B] border border-white/15 flex items-center justify-center transition-colors group cursor-pointer"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="w-4 h-4 text-[#DDEFD9] group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-black text-[#C9A227] uppercase tracking-wider font-poppins">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-[#DDEFD9]/70 hover:text-white transition-colors flex items-center gap-1 group text-xs font-semibold"
                    >
                      <ChevronRight className="w-3 h-3 text-[#C9A227] opacity-0 group-hover:opacity-100 transition-all -ml-1 group-hover:ml-0" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom Copyright Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-[#DDEFD9]/70 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              🟢 System Status: Operational
            </span>
            <span>© 2026 Cardora Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-[#1F5E3B]" />
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <span className="w-1 h-1 rounded-full bg-[#1F5E3B]" />
            <a href="#security" className="hover:text-white transition-colors">Security Protocol</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;