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

const Footer = () => {
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
    product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    company: ['About', 'Careers', 'Blog', 'Press'],
    resources: ['Documentation', 'Help Center', 'API Reference', 'Community'],
    legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  };

  const socialIcons = [
    { icon: FaTwitter, label: 'Twitter' },
    { icon: FaFacebook, label: 'Facebook' },
    { icon: FaInstagram, label: 'Instagram' },
    { icon: FaLinkedin, label: 'LinkedIn' },
    { icon: FaYoutube, label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#17331F] text-white relative overflow-hidden pt-12">
      
      {/* Wave Divider SVG */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12 text-[#F8FAF7] fill-current">
          <path d="M0,0 C150,90 350,-40 500,45 C650,120 900,10 1200,60 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 pt-16 pb-12 relative z-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="bg-[#5C8D4E] rounded-xl p-2.5 shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black font-poppins text-white tracking-wider">
                CARDORA
              </span>
            </Link>

            <p className="text-[#DDEFD9]/80 max-w-md leading-relaxed mb-6 text-xs md:text-sm font-medium">
              Smart Digital Ecosystem for Cardamom Plantation Management and Decision Support.
              Empowering Kerala farmers with AI-driven agricultural insights.
            </p>

            {/* Newsletter Card with Glassmorphism & Validation */}
            <div className="mb-6 max-w-md bg-white/5 border border-white/10 rounded-[20px] p-4 backdrop-blur-md shadow-glass">
              <h5 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider mb-2">
                Subscribe to Cardamom Farming Insights
              </h5>
              
              {newsletterSuccess ? (
                <div className="p-3 rounded-full bg-[#5C8D4E]/30 border border-[#5C8D4E] text-[#DDEFD9] text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Subscribed! Thank you for joining Cardora.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <div className="flex items-center gap-2">
                    <input 
                      type="email" 
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        if (newsletterError) setNewsletterError('');
                      }}
                      placeholder="Enter your email address" 
                      className={`w-full px-4 py-2.5 rounded-full bg-white/10 border text-white placeholder-[#DDEFD9]/60 text-xs focus:outline-none transition-colors ${newsletterError ? 'border-red-400 bg-red-900/20' : 'border-white/20 focus:border-[#C9A227]'}`}
                    />
                    <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] hover:from-[#5C8D4E] hover:to-[#1F5E3B] text-white text-xs font-bold rounded-full transition-all flex-shrink-0 shadow-md flex items-center gap-1.5">
                      <span>Subscribe</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {newsletterError && (
                    <p className="text-[11px] text-red-300 font-bold mt-2 ml-2">⚠️ {newsletterError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {socialIcons.map(({ icon: Icon, label }, i) => (
                <motion.a
                  key={i}
                  href={`#${label.toLowerCase()}`}
                  whileHover={{ y: -4, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5C8D4E] border border-white/15 flex items-center justify-center transition-colors group"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-[#DDEFD9] group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-extrabold text-[#C9A227] uppercase tracking-wider mb-4 font-poppins">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-[#DDEFD9]/70 hover:text-white transition-colors flex items-center gap-1 group text-xs md:text-sm font-medium"
                    >
                      <ChevronRight className="w-3 h-3 text-[#C9A227] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="border-t border-white/10 my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#DDEFD9]/70">
          <p>© 2026 Cardora Platform. All rights reserved. Made for Cardamom Farmers.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-[#5C8D4E]" />
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <span className="w-1 h-1 rounded-full bg-[#5C8D4E]" />
            <a href="#cookies" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;