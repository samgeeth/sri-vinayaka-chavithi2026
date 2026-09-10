import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { EventHighlights } from './components/EventHighlights';
import { LiveUpdatesSection } from './components/LiveUpdatesSection';
import { TimelineSection } from './components/TimelineSection';
import { CommitteeSection } from './components/CommitteeSection';
import { CommitteePage } from './pages/CommitteePage';
import { GallerySection } from './components/GallerySection';
import { SponsorsSection } from './components/SponsorsSection';
import { DonationDashboard } from './components/DonationDashboard';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { DonationModal } from './components/DonationModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LightboxModal } from './components/LightboxModal';
import { PetalsOverlay } from './components/PetalsOverlay';
import { MouseFollowGlow } from './components/animations/MouseFollowGlow';
import { INITIAL_DONATIONS, INITIAL_LIVE_UPDATES } from './data/mockData';
import { DonationRecord, LiveUpdatePost } from './types';

export default function App() {
  // Page Navigation State ('home' = Festival Home, 'committee' = Second Page)
  const [currentPage, setCurrentPage] = useState<'home' | 'committee'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#committee' || hash === '#volunteers') {
        return 'committee';
      }
    }
    return 'home';
  });

  // Listen to browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#committee' || hash === '#volunteers') {
        setCurrentPage('committee');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#home' || hash === '') {
        setCurrentPage('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: 'home' | 'committee', targetSection?: string) => {
    setCurrentPage(page);
    if (page === 'committee') {
      window.location.hash = '#committee';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (targetSection && targetSection !== 'home') {
        window.location.hash = `#${targetSection}`;
        setTimeout(() => {
          const el = document.getElementById(targetSection);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
      } else {
        window.location.hash = '#home';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Persistence for donations
  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mvy_donations_2026');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_DONATIONS;
  });

  // Persistence for live posts
  const [livePosts, setLivePosts] = useState<LiveUpdatePost[]>(() => {
    try {
      const saved = localStorage.getItem('mvy_live_posts_2026');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_LIVE_UPDATES;
  });

  // Modals state
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationRecord | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string>('');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mvy_donations_2026', JSON.stringify(donations));
    } catch {
      // ignore
    }
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem('mvy_live_posts_2026', JSON.stringify(livePosts));
    } catch {
      // ignore
    }
  }, [livePosts]);

  // Handle new donation
  const handleDonationSuccess = (newRecord: DonationRecord) => {
    setDonations((prev) => [newRecord, ...prev]);
    setSelectedReceipt(newRecord);
  };

  // Handle new live post
  const handleAddLivePost = (newPost: LiveUpdatePost) => {
    setLivePosts((prev) => [newPost, ...prev]);
  };

  // Handle reactions
  const handleReact = (postId: string, reactionType: string) => {
    setLivePosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentCount = post.reactions[reactionType] || 0;
          return {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionType]: currentCount + 1,
            },
          };
        }
        return post;
      })
    );
  };

  // Handle lightbox image selection
  const handleImageSelect = (imageUrl: string, caption?: string) => {
    setLightboxImage(imageUrl);
    setLightboxCaption(caption || '');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FFD700] selection:text-black relative overflow-x-hidden">
      {/* Interactive 60fps Mouse Follow Ambient Light Glow */}
      <MouseFollowGlow color="rgba(255, 215, 0, 0.07)" size={420} />

      {/* Falling Sacred Flower Petals Canvas Simulation (60fps GPU accelerated) */}
      <PetalsOverlay />

      {/* Floating Header Navbar */}
      <Navbar
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
        liveUpdateCount={livePosts.length}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Conditional Multi-Page View Routing */}
      {currentPage === 'committee' ? (
        /* Dedicated Page 2: Committee & Youth Volunteers */
        <main id="committee-page-content">
          <CommitteePage onBackToHome={(section) => handleNavigate('home', section)} />
        </main>
      ) : (
        /* Page 1: Main Festival Portal */
        <main id="main-content">
          {/* 1. Cinematic Hero Section (Home Page) */}
          <HeroSection onOpenDonationModal={() => setIsDonationModalOpen(true)} />

          {/* 2. Committee Details & Youth Volunteers Directorate (Directly after Home Page) */}
          <CommitteeSection onOpenFullPage={() => handleNavigate('committee')} />

          {/* 3. About Festival (History, Purpose, Celebration, Importance) */}
          <AboutSection />

          {/* 4. Event Highlights & Live Countdown */}
          <EventHighlights />

          {/* 5. Live Daily Updates with Admin Broadcast */}
          <LiveUpdatesSection
            posts={livePosts}
            onAddPost={handleAddLivePost}
            onReact={handleReact}
            onImageSelect={handleImageSelect}
          />

          {/* 6. Work Updates 7-Day Timeline */}
          <TimelineSection onImageSelect={handleImageSelect} />

          {/* 7. Photo Gallery with Masonry Grid & Filters */}
          <GallerySection onImageSelect={handleImageSelect} />

          {/* 8. Sponsors & Community Patrons */}
          <SponsorsSection
            onOpenDonationModal={() => setIsDonationModalOpen(true)}
          />

          {/* 9. Live Donation Dashboard & Real-Time Ledger Table */}
          <DonationDashboard
            donations={donations}
            onOpenDonationModal={() => setIsDonationModalOpen(true)}
            onViewReceipt={(record) => setSelectedReceipt(record)}
          />

          {/* 10. Pilgrim Helpdesk, Location & Contact */}
          <ContactSection />
        </main>
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onDonationSuccess={handleDonationSuccess}
      />

      <ReceiptModal
        donation={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <LightboxModal
        imageUrl={lightboxImage}
        caption={lightboxCaption}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
