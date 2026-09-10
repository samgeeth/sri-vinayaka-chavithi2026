import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, Music, Sparkles, Utensils, Flag, MapPin } from 'lucide-react';
import { FESTIVAL_DATE, SCHEDULE_EVENTS } from '../data/mockData';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';

export const EventHighlights: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [activeTab, setActiveTab] = useState<'schedule' | 'special'>('schedule');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = FESTIVAL_DATE.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const specialEvents = [
    {
      title: 'Grand Cultural Night & Classical Recital',
      icon: <Sparkles className="w-5 h-5 text-[#FFD700]" />,
      date: 'Day 3 • Sep 16, 2026',
      time: '07:30 PM Onwards',
      highlight: 'Kuchipudi & Kolatam by 120 Local Youth',
      desc: 'Mesmerizing traditional dances honoring Ganesha, followed by devotional theatrical drama (Harikatha) and youth felicitation.',
      badge: 'Cultural Programs',
      color: 'border-[#FFD700]/30',
    },
    {
      title: 'Devotional Music Night & Dhol Tasha Extravaganza',
      icon: <Music className="w-5 h-5 text-[#FF8C00]" />,
      date: 'Day 7 • Sep 20, 2026',
      time: '08:00 PM - Midnight',
      highlight: 'Live Devotional Orchestra & 60-member Dhol Troupe',
      desc: 'High-voltage spiritual evening featuring famous Telugu devotional singers, flute maestros, and thunderous authentic Nashik Dhol rhythms.',
      badge: 'Music Night',
      color: 'border-[#FF8C00]/30',
    },
    {
      title: 'Grand Maha Annadanam & Laddu Prasadam',
      icon: <Utensils className="w-5 h-5 text-[#E53935]" />,
      date: 'Daily Sep 14 – 24, 2026',
      time: '12:30 PM & 07:30 PM',
      highlight: '5,000+ Devotees Served Pure Ghee Prasadam Daily',
      desc: 'Sacred community dining for all pilgrims with warm pulihora, dal, curd rice, sweet boondi, and special 31-kg prasadam laddoos.',
      badge: 'Prasadam Distribution',
      color: 'border-[#E53935]/30',
    },
    {
      title: 'Ganesh Visarjan Maha Shobha Yatra',
      icon: <Flag className="w-5 h-5 text-[#FFD700]" />,
      date: 'Day 11 • Sep 24, 2026',
      time: '02:00 PM to 11:00 PM',
      highlight: '6 KM Floral Chariot Procession with Laser Lights',
      desc: 'Emotional farewell procession through all village streets, gulal celebration, synchronized laser fireworks, and respectful water immersion at Krishna river ghath.',
      badge: 'Ganesh Visarjan Schedule',
      color: 'border-[#FFD700]/30',
    },
  ];

  return (
    <section id="schedule" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <BlurReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
              <Calendar className="w-3.5 h-3.5 text-[#FF8C00]" />
              Festival Timeline & Program
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Event <span className="gold-gradient-text">Highlights & Schedule</span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <p className="text-gray-400 text-base sm:text-lg font-sans">
              Prepare your pilgrimage. Join us for 11 divine days of sacred rituals, daily Annadanam, and cultural spectacles.
            </p>
          </BlurReveal>
        </div>

        {/* COUNTDOWN TIMER COMPONENT (Linear / Apple styled with 3D Tilt) */}
        <BlurReveal delay={0.4} yOffset={25}>
          <TiltCard
            maxTilt={6}
            className="mb-16 glass-panel p-6 sm:p-10 border-[#FFD700]/25 bg-gradient-to-b from-[#141414] to-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Info */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[#FFD700] text-xs uppercase font-bold tracking-widest mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Live Countdown To Prana Pratishtha</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                  Bhadrapada Shukla Chavithi 2026
                </h3>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-[#FF8C00]" />
                  <span>Main Chowrasta Temple Grounds, Maraigudem</span>
                </div>
              </div>

              {/* Countdown Digits */}
              <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full sm:w-auto">
                {[
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HOURS', value: timeLeft.hours },
                  { label: 'MINUTES', value: timeLeft.minutes },
                  { label: 'SECONDS', value: timeLeft.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-[#050505] border border-white/10 rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[100px] shadow-inner group hover:border-[#FFD700]/40 transition-colors"
                  >
                    <span className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-white group-hover:text-[#FFD700] transition-colors tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-400 tracking-wider mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </BlurReveal>

        {/* Tab switcher: Daily Schedule vs Special Events with Ripple */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#111111] border border-white/10 shadow-lg">
            <RippleContainer as="div" color="rgba(255, 215, 0, 0.25)">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'schedule'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Daily Pooja Schedule
              </button>
            </RippleContainer>

            <RippleContainer as="div" color="rgba(255, 215, 0, 0.25)">
              <button
                onClick={() => setActiveTab('special')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'special'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Special Events & Visarjan
              </button>
            </RippleContainer>
          </div>
        </div>

        {/* Content Tabs with Smooth AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' ? (
            <motion.div
              key="schedule-tab"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {SCHEDULE_EVENTS.map((item, index) => (
                <TiltCard
                  key={index}
                  maxTilt={8}
                  className="glass-panel glass-panel-hover rounded-2xl p-6 border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-display text-lg font-bold text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 font-sans font-light">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-gray-400 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8C00]" />
                    <span>{item.venue}</span>
                  </div>
                </TiltCard>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="special-tab"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            >
              {specialEvents.map((event, idx) => (
                <TiltCard
                  key={idx}
                  maxTilt={8}
                  className={`glass-panel glass-panel-hover rounded-2xl p-7 border ${event.color} relative overflow-hidden group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                      {event.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                      {event.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-[#FFD700] mb-2 font-sans">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>

                  <h4 className="font-display text-xl font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">
                    {event.title}
                  </h4>

                  <div className="inline-block px-2.5 py-1 rounded-md bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-xs font-semibold text-[#FF8C00] mb-3">
                    ✨ {event.highlight}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed font-sans font-light">
                    {event.desc}
                  </p>
                </TiltCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
