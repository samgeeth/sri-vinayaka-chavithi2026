import React from 'react';
import { Heart, Sparkles, ArrowUp, Phone, MapPin, MessageCircle, Mail, Users } from 'lucide-react';
import { DiyaFlame } from './DiyaFlame';

interface FooterProps {
  onNavigate?: (page: 'home' | 'committee', targetSection?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#050505] text-white pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-t border-[#FFD700]/15 overflow-hidden">
      {/* Background Top Ambient Rim */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-gradient-to-b from-[#FFD700]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          
          {/* Col 1 & 2: Festival Identity & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD700] via-[#FF8C00] to-[#E53935] p-[1px] shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <div className="w-full h-full bg-[#050505] rounded-[15px] flex items-center justify-center text-2xl">
                  🕉️
                </div>
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xl text-white tracking-wide">
                  Sri Vinayaka Chavithi <span className="text-[#FFD700]">2026</span>
                </h3>
                <span className="text-xs font-semibold text-[#FF8C00] tracking-widest uppercase block">
                  Maraigudem Youth Association
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm font-sans leading-relaxed max-w-sm">
              Fostering community brotherhood, spiritual bhakti, and divine joy through the grand 9-day annual Vinayaka Utsavam at Maraigudem village.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-white/10 text-xs text-gray-300 font-sans">
                <DiyaFlame size="sm" />
                <span>Established 2018 • 8th Annual Utsavam</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Festival Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFD700] font-sans">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-gray-400 font-sans">
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'home')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'committee')}
                  className="hover:text-[#FFD700] transition-colors cursor-pointer text-left"
                >
                  Committee Details
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'about')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About Festival
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'schedule')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Daily Schedule & Visarjan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'live-updates')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Live Bulletins
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'work-updates')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Work Updates Timeline
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Committee Page */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFD700] font-sans">
              Devotee & Seva
            </h4>
            <ul className="space-y-2 text-sm text-gray-400 font-sans">
              <li>
                <button
                  onClick={() => onNavigate?.('committee')}
                  className="text-[#FFD700] hover:text-white transition-colors cursor-pointer text-left font-semibold flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-[#FF8C00]" />
                  <span>Committee & Youth Volunteers (Page 2)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'donations')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Public Donation Ledger
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'gallery')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sacred Photo Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'sponsors')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Festival Sponsors & Patrons
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('home', 'contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pilgrim Helpdesk
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Location & Contact */}
          <div className="space-y-3 text-sm text-gray-400 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFD700]">
              Mandapam Ground
            </h4>
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" />
              <span>Main Chowrasta, Maraigudem Village, Telangana 508213</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-4 h-4 text-[#FFD700] shrink-0" />
              <a href="tel:+917330693045" className="hover:text-white transition-colors">
                +91 73306 93045 (Helpline & President)
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>maraigudemyouth@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Credits and Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-sans">
          <div className="flex items-center gap-2">
            <span>Sri Vinayaka Chavithi Utsavam 2026</span>
            <span>•</span>
            <span className="text-gray-400">Crafted with Devotion by Maraigudem Youth Association</span>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
