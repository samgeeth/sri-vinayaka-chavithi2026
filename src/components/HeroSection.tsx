import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Heart, Sparkles, Calendar, MapPin, BellRing } from 'lucide-react';
import { HeroVideoBackground } from './HeroVideoBackground';
import { HeroCanvas } from './HeroCanvas';
import { DiyaFlame } from './DiyaFlame';
import { GoldenLightMovement } from './animations/GoldenLightMovement';
import { FloatingDiyas } from './animations/FloatingDiyas';
import { MagneticButton } from './animations/MagneticButton';
import { RippleContainer } from './animations/RippleContainer';
import { TiltCard } from './animations/TiltCard';
import { BlurReveal, SplitTextReveal } from './animations/BlurReveal';
import { playTempleBell } from '../lib/utils';

interface HeroSectionProps {
  onOpenDonationModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDonationModal }) => {
  const containerRef = useRef<HTMLElement>(null);

  // Parallax scroll hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.1]);
  const templeY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#050505]"
    >
      {/* Cinematic Divine Ganesha Video Background with Parallax and Vignette */}
      <HeroVideoBackground scrollYProgress={scrollYProgress} />

      {/* Subtle Three.js 3D Sacred Geometry & Particle Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-30">
        <HeroCanvas />
      </div>

      {/* Cinematic Golden Light Movement (Volumetric auroras & sweeping beams) */}
      <GoldenLightMovement intensity="high" />

      {/* Ambient Floating 2.5D Diyas */}
      <FloatingDiyas />

      {/* Parallax Temple Silhouette at Bottom */}
      <motion.div
        style={{ y: templeY }}
        className="absolute bottom-0 inset-x-0 h-40 sm:h-56 pointer-events-none z-10 opacity-35 flex items-end justify-center will-change-transform"
      >
        <svg
          viewBox="0 0 1200 240"
          className="w-full h-full text-[#111111] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0 240 L0 200 L120 200 L140 180 L180 180 L200 150 L230 150 L240 110 L260 110 L270 70 L285 70 L290 40 L300 20 L310 40 L315 70 L330 70 L340 110 L360 110 L370 150 L400 150 L420 180 L460 180 L480 200 L530 200 L540 170 L570 170 L585 130 L600 80 L615 130 L630 170 L660 170 L670 200 L720 200 L740 180 L780 180 L800 150 L830 150 L840 110 L860 110 L870 70 L885 70 L890 40 L900 20 L910 40 L915 70 L930 70 L940 110 L960 110 L970 150 L1000 150 L1020 180 L1060 180 L1080 200 L1200 200 L1200 240 Z" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-transparent" />
      </motion.div>

      {/* Main Content Container with Parallax drift */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center will-change-[transform,opacity]"
      >
        {/* Top Auspicious Pill Badge with Blur Reveal */}
        <BlurReveal delay={0.1} yOffset={20}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111]/85 backdrop-blur-md border border-[#FFD700]/30 shadow-[0_0_25px_rgba(255,215,0,0.18)] mb-6 hover:border-[#FFD700] transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
            <span className="text-xs font-semibold text-gray-200 tracking-wider uppercase flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              Official Portal • 21-Ft Eco-Clay Grand Vigraham
            </span>
          </div>
        </BlurReveal>

        {/* Sacred 🕉️ Symbol with Aura Pulse */}
        <BlurReveal delay={0.2} yOffset={15}>
          <div
            onClick={() => playTempleBell()}
            className="relative mb-3 group cursor-pointer"
            title="Click for Sacred Temple Bell Chime"
          >
            <div className="text-6xl sm:text-7xl md:text-8xl filter drop-shadow-[0_0_35px_rgba(255,215,0,0.85)] select-none animate-pulse-slow transition-transform group-hover:scale-110">
              🕉️
            </div>
            <div className="absolute -inset-4 bg-[#FFD700]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FFD700]/30 transition-colors" />
          </div>
        </BlurReveal>

        {/* Cinematic Hero Text Reveal (Blur + Staggered Words) */}
        <h1 className="font-display font-extrabold tracking-tight text-white mb-2">
          <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none gold-gradient-text drop-shadow-2xl">
            <SplitTextReveal text="Sri Vinayaka" delay={0.3} stagger={0.08} />
          </span>
          <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight text-white tracking-wide mt-1">
            <SplitTextReveal text="Chavithi 2026" delay={0.5} stagger={0.08} />
          </span>
        </h1>

        {/* Maraigudem Youth Emblem with glowing line */}
        <BlurReveal delay={0.7} yOffset={15}>
          <div className="mt-1 mb-5 inline-block">
            <span
              style={{ backgroundColor: '#32412a' }}
              className="inline-block px-6 py-2 rounded-2xl border-2 border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.25)] text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.25em] uppercase font-display"
            >
              <span className="bg-gradient-to-r from-[#FFD700] via-[#FF8C00] via-[#FF1493] via-[#9932CC] to-[#00F5D4] bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-black">
                Maraigudem Youth
              </span>
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#FFD700] via-[#FF1493] via-[#00F5D4] to-transparent mt-2 origin-center"
            />
          </div>
        </BlurReveal>

        {/* Subtitle with Blur Reveal */}
        <BlurReveal delay={0.8} yOffset={15}>
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-300 font-sans font-light leading-relaxed mb-8 px-4">
            &ldquo;Together we celebrate devotion, unity, culture, and tradition.&rdquo;
          </p>
        </BlurReveal>

        {/* Action Buttons Framed by Golden Magnetic Controls */}
        <div className="w-full flex items-center justify-center gap-6 sm:gap-10 mb-10">
          <DiyaFlame size="md" className="hidden sm:inline-flex" />

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            {/* View Updates Button with Magnetic Pull & Ripple */}
            <MagneticButton strength={0.3}>
              <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
                <a
                  href="#live-updates"
                  id="hero-view-updates-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-semibold text-white bg-[#111111]/90 hover:bg-[#1a1a1a] border border-[#FFD700]/30 hover:border-[#FFD700] shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 group cursor-pointer"
                >
                  <BellRing className="w-4 h-4 text-[#FFD700] group-hover:rotate-12 transition-transform" />
                  <span>View Updates</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1.5 transition-transform" />
                </a>
              </RippleContainer>
            </MagneticButton>

            {/* Donate Now Button with Magnetic Pull & Ripple */}
            <MagneticButton strength={0.35}>
              <RippleContainer as="div" color="rgba(255, 255, 255, 0.5)">
                <button
                  onClick={() => {
                    playTempleBell();
                    onOpenDonationModal();
                  }}
                  id="hero-donate-now-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] hover:from-[#FFE043] hover:to-[#FFA000] shadow-[0_0_40px_rgba(255,215,0,0.55)] transition-all duration-300 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-black text-black" />
                  <span>Donate Now</span>
                </button>
              </RippleContainer>
            </MagneticButton>
          </div>

          <DiyaFlame size="md" className="hidden sm:inline-flex" />
        </div>

        {/* Highlights Bar with 3D Tilt Cards & Blur Reveal */}
        <BlurReveal delay={1.0} yOffset={25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mt-2 px-2">
            <TiltCard maxTilt={10} className="glass-panel p-3.5 border-white/5 group">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 font-sans">
                <Calendar className="w-3.5 h-3.5 text-[#FF8C00] group-hover:scale-110 transition-transform" />
                <span>Festival Dates</span>
              </div>
              <div className="text-sm font-semibold text-white">Sep 14 – 24, 2026</div>
            </TiltCard>

            <TiltCard maxTilt={10} className="glass-panel p-3.5 border-white/5 group">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 font-sans">
                <MapPin className="w-3.5 h-3.5 text-[#E53935] group-hover:scale-110 transition-transform" />
                <span>Location</span>
              </div>
              <div className="text-sm font-semibold text-white">Chowrasta, Maraigudem</div>
            </TiltCard>

            <TiltCard maxTilt={10} className="glass-panel p-3.5 border-white/5 group">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700] group-hover:scale-110 transition-transform" />
                <span>Idol Height</span>
              </div>
              <div className="text-sm font-semibold text-white">21-Foot Eco Clay</div>
            </TiltCard>

            <TiltCard maxTilt={10} className="glass-panel p-3.5 border-white/5 group">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 font-sans">
                <Heart className="w-3.5 h-3.5 text-[#FF8C00] group-hover:scale-110 transition-transform" />
                <span>Annadanam</span>
              </div>
              <div className="text-sm font-semibold text-white">5,000+ Daily Feasts</div>
            </TiltCard>
          </div>
        </BlurReveal>

      </motion.div>
    </section>
  );
};
