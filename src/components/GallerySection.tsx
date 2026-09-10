import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Eye } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/mockData';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';

interface GallerySectionProps {
  onImageSelect: (imageUrl: string, caption: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onImageSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Festival',
    'Preparation',
    'Committee',
    'Volunteers',
    'Decoration',
    'Lighting',
    'Pooja',
    'Crowd',
  ];

  const filteredItems = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <BlurReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
              <Camera className="w-3.5 h-3.5 text-[#FF8C00]" />
              Visual Memories & Celebrations
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Sacred <span className="gold-gradient-text">Photo Gallery</span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <p className="text-gray-400 text-base sm:text-lg font-sans">
              Glimpses of divine darshans, massive devotee gatherings, tireless volunteer craftsmanship, and grand celebrations.
            </p>
          </BlurReveal>
        </div>

        {/* Category Filters with Ripples */}
        <BlurReveal delay={0.4}>
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-12 no-scrollbar">
            {categories.map((category) => (
              <RippleContainer key={category} as="div" color="rgba(255, 215, 0, 0.3)">
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-[0_0_20px_rgba(255,215,0,0.35)] font-bold scale-[1.02]'
                      : 'bg-[#141414] text-gray-300 hover:text-white border border-white/5 hover:border-white/20'
                  }`}
                >
                  {category}
                </button>
              </RippleContainer>
            ))}
          </div>
        </BlurReveal>

        {/* Masonry-Style Responsive Grid with AnimatePresence & 3D Tilt */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard
                  maxTilt={6}
                  onClick={() => onImageSelect(item.imageUrl, `${item.title} — ${item.description}`)}
                  className="glass-panel overflow-hidden cursor-pointer group relative border-white/10 hover:border-[#FFD700]/50 shadow-xl"
                >
                  {/* Image Container with Hover Zoom */}
                  <div className="relative h-72 sm:h-80 overflow-hidden bg-[#161616]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out filter brightness-95 group-hover:brightness-105 will-change-transform"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-55 transition-opacity duration-500" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-[#FFD700] border border-[#FFD700]/30 shadow-md font-sans">
                        {item.category}
                      </span>
                    </div>

                    {/* Hover Eye Icon */}
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-20 border border-white/10">
                      <Eye className="w-4 h-4 text-[#FFD700]" />
                    </div>

                    {/* Text Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-5 z-20">
                      <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-300 font-sans line-clamp-2 leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
};
