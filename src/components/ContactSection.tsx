import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, MessageCircle, Mail, Instagram, Facebook, Send, CheckCircle2, Navigation, Clock } from 'lucide-react';
import { playTempleBell } from '../lib/utils';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { MagneticButton } from './animations/MagneticButton';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';

export const ContactSection: React.FC = () => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Pooja Timings & Seva');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;

    playTempleBell();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMessage('');
    }, 3000);
  };

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <BlurReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4 font-sans">
              <MapPin className="w-3.5 h-3.5 text-[#E53935]" />
              Pilgrim Helpdesk & Location
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Reach <span className="gold-gradient-text">Maraigudem Mandapam</span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <p className="text-gray-400 text-base sm:text-lg font-sans">
              Need directions, pooja registrations, or volunteer participation? Our youth committee is active 24/7.
            </p>
          </BlurReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left 6 Cols: Location Details & Social Hotlines */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Location Glass Card with 3D Tilt */}
            <TiltCard maxTilt={5} className="glass-panel rounded-3xl p-7 border-white/10 relative overflow-hidden">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E53935]/15 border border-[#E53935]/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[#E53935]" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    Temple Mandapam Location
                  </h3>
                  <p className="text-sm text-gray-300 font-sans leading-relaxed">
                    Main Chowrasta, Sri Vinayaka Temple Grounds, Maraigudem Village, Suryapet/Nalgonda Highway Region, Telangana – 508213.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 text-xs text-gray-300 font-sans">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF8C00]" />
                  <span>Open: 05:00 AM - 11:30 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Parking: Free 2-Wheeler & Car</span>
                </div>
              </div>

              {/* Action: Open in Maps */}
              <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-3">
                <MagneticButton strength={0.25}>
                  <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-xs shadow-md hover:scale-105 transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Get Driving Directions</span>
                    </a>
                  </RippleContainer>
                </MagneticButton>
              </div>
            </TiltCard>

            {/* Quick Contact Hotlines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TiltCard maxTilt={6} className="glass-panel rounded-2xl p-5 border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-sans">Official Helpline & Call</div>
                  <a href="tel:+917330693045" className="font-semibold text-white text-sm hover:text-[#FFD700] transition-colors">
                    +91 73306 93045
                  </a>
                </div>
              </TiltCard>

              <TiltCard maxTilt={6} className="glass-panel rounded-2xl p-5 border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-sans">WhatsApp Desk</div>
                  <a href="https://wa.me/917330693045" target="_blank" rel="noopener noreferrer" className="font-semibold text-white text-sm hover:text-emerald-400 transition-colors">
                    +91 73306 93045
                  </a>
                </div>
              </TiltCard>
            </div>

            {/* Social & Community Links */}
            <div className="glass-panel rounded-2xl p-6 border-white/10">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4 font-sans">
                Official Media Channels
              </div>
              <div className="flex flex-wrap gap-3">
                <RippleContainer as="div" color="rgba(255, 255, 255, 0.2)">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-pink-500/20 text-gray-300 hover:text-pink-400 border border-white/10 text-xs font-semibold transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram @maraigudemyouth</span>
                  </a>
                </RippleContainer>

                <RippleContainer as="div" color="rgba(255, 255, 255, 0.2)">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 border border-white/10 text-xs font-semibold transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook Page</span>
                  </a>
                </RippleContainer>

                <RippleContainer as="div" color="rgba(255, 255, 255, 0.2)">
                  <a
                    href="mailto:contact@maraigudemyouth.org"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#FFD700]/20 text-gray-300 hover:text-[#FFD700] border border-white/10 text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Desk</span>
                  </a>
                </RippleContainer>
              </div>
            </div>

          </div>

          {/* Right 6 Cols: Contact & Seva Registration Form */}
          <div className="lg:col-span-6">
            <TiltCard maxTilt={4} className="glass-panel rounded-3xl p-8 sm:p-10 border-white/10 relative overflow-hidden shadow-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d]">
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                Send Pilgrim Message or Seva Request
              </h3>
              <p className="text-xs text-gray-400 mb-6 font-sans">
                Fill the form below. A committee coordinator will respond or call you back promptly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
                    >
                      <option value="Pooja Timings & Seva">Pooja Timings & Seva</option>
                      <option value="Annadanam Booking">Annadanam Seva</option>
                      <option value="Laddu Auction Info">Laddu Auction Info</option>
                      <option value="Youth Volunteer Join">Join as Youth Volunteer</option>
                      <option value="Sponsorship">Patron / Sponsorship</option>
                      <option value="Other">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Message or Details
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Ask questions about timings, pooja registrations, or transport..."
                    className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors resize-none"
                  />
                </div>

                <MagneticButton strength={0.2}>
                  <RippleContainer as="div" color="rgba(255, 255, 255, 0.4)">
                    <button
                      type="submit"
                      disabled={submitted}
                      className="w-full py-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitted ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-black" />
                          <span>Message Sent! We will call you soon.</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Pilgrim Message</span>
                        </>
                      )}
                    </button>
                  </RippleContainer>
                </MagneticButton>
              </form>
            </TiltCard>
          </div>

        </div>

      </div>
    </section>
  );
};
