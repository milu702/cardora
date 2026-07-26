import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative max-w-md w-full bg-white rounded-[20px] border border-[#D7E6D5] shadow-[0_20px_50px_rgba(31,94,59,0.08)] p-8 md:p-12 overflow-hidden">
        
        {/* Nature Background Accent */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#DDEFD9] rounded-full blur-2xl pointer-events-none" />

        {/* Leaf Graphic */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#DDEFD9] text-[#1F5E3B] flex items-center justify-center text-4xl shadow-inner border border-[#5C8D4E]/30">
          🌿
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full bg-[#1F5E3B] text-white text-xs font-bold mb-3">
          404 - PAGE NOT FOUND
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17331F] font-poppins mb-3">
          Lost in the Cardamom Plantation?
        </h1>

        <p className="text-xs md:text-sm text-[#4A5568] leading-relaxed mb-8">
          The page you are looking for has been relocated or pruned. Return to the main Cardora ecosystem to continue managing your farms.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" icon={Home} iconPosition="left" size="md" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
