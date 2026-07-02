'use client'
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from 'next/image';
import '../styles/Reelssection.css'

// ─── REELS DATA ───────────────────────────────────────────────────────────────
const REELS_DATA = [
  {
    id: 1,
    title: "Vibe Check 01",
    description: "Welcome to Turnt!",
    category: "Hangout",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&h=700&q=80",
    instagramUrl: "https://www.instagram.com/reel/DZU4PI4qwRg/",
  },
  {
    id: 2,
    title: "Vibe Check 02",
    description: "Stay turnt!",
    category: "Culture",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&h=700&q=80",
    instagramUrl: "https://www.instagram.com/reel/DZZ-gJ9qJKx/",
  },
  {
    id: 3,
    title: "Vibe Check 03",
    description: "I'm Turnt up!",
    category: "Nightlife",
    thumbnail: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=400&h=700&q=80",
    instagramUrl: "https://www.instagram.com/reel/DZm_ZqzKccg/",
  },
];

// ─── Icons ─────────────────────────────────────────────────────────────────────
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" width="17" height="17">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="10" height="10">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" width="20" height="20">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" width="20" height="20">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Reel Card ─────────────────────────────────────────────────────────────────
const ReelCard = ({ reel, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.55, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.article
      className="reel-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      aria-label={`Reel: ${reel.title}`}
    >
      <div className="reel-media-wrapper">
        <Image
          className="reel-thumbnail"
          src={reel.thumbnail}
          alt={reel.title}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          draggable={false}
        />
        <div className="reel-vignette" aria-hidden="true" />
        <div className="reel-overlay">
          <div className="reel-overlay-top">
            <span className="reel-category-tag">{reel.category}</span>
            <a
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reel-insta-link"
              aria-label="View on Instagram"
              onClick={(e) => e.stopPropagation()}
            >
              <InstagramIcon />
            </a>
          </div>
          <div className="reel-overlay-bottom">
            <h3 className="reel-title">{reel.title}</h3>
            <p className="reel-desc">{reel.description}</p>
            <a
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reel-watch-cta"
            >
              <PlayIcon />
              <span>Watch Reel</span>
            </a>
          </div>
        </div>
        <div className="reel-glow-border" aria-hidden="true" />
      </div>
    </motion.article>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ inView }) => (
  <motion.div
    className="reels-header"
    initial={{ opacity: 0, y: 32 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <motion.div className="reels-badge"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}>
      <span className="reels-badge-dot" />
      <InstagramIcon />
      <span>Instagram Reels</span>
    </motion.div>

    <motion.h2 className="reels-heading"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}>
      Captured in<br />
      <span className="reels-heading-gradient inline-block">Motion&nbsp;</span>
    </motion.h2>

    <motion.p className="reels-subheading"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.32 }}>
      Short-form stories, long-lasting impressions.<br />
      Click Watch Reel to view on Instagram.
    </motion.p>
  </motion.div>
);

// ─── Main Section ──────────────────────────────────────────────────────────────
const VISIBLE_COUNT = 3;

const ReelsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const total = REELS_DATA.length;

  const getVisible = (startIdx) =>
    Array.from({ length: VISIBLE_COUNT }, (_, i) => ({
      reel: REELS_DATA[(startIdx + i) % total],
      key: (startIdx + i) % total,
    }));

  const navigate = (dir) => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + dir * VISIBLE_COUNT + total) % total);
  };

  const containerVariants = {
    enter: (dir) => ({ x: dir > 0 ? "6%" : "-6%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (dir) => ({ x: dir > 0 ? "-6%" : "6%", opacity: 0, transition: { duration: 0.35 } }),
  };

  return (
    <section className="reels-section" ref={sectionRef} aria-label="Instagram Reels Showcase">
      <div className="reels-bg-orb reels-bg-orb--left" aria-hidden="true" />
      <div className="reels-bg-orb reels-bg-orb--right" aria-hidden="true" />
      <div className="reels-bg-grid" aria-hidden="true" />

      <div className="reels-inner">
        <SectionHeader inView={inView} />

        <div className="reels-carousel-wrapper">
          <button className="reels-arrow reels-arrow--left"
            onClick={() => navigate(-1)} aria-label="Previous reels" disabled={isAnimating}>
            <ArrowLeftIcon />
          </button>

          <div className="reels-track-overflow">
            <AnimatePresence initial={false} custom={direction} mode="wait"
              onExitComplete={() => setIsAnimating(false)}>
              <motion.div
                className="reels-track"
                key={currentIndex}
                custom={direction}
                variants={containerVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {getVisible(currentIndex).map(({ reel, key }, idx) => (
                  <ReelCard key={key} reel={reel} index={idx} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="reels-arrow reels-arrow--right"
            onClick={() => navigate(1)} aria-label="Next reels" disabled={isAnimating}>
            <ArrowRightIcon />
          </button>
        </div>

        <div className="reels-dots" role="tablist" aria-label="Reel pages">
          {Array.from({ length: Math.ceil(total / VISIBLE_COUNT) }).map((_, i) => {
            const isActive = Math.floor(currentIndex / VISIBLE_COUNT) === i;
            return (
              <button key={i} role="tab" aria-selected={isActive}
                aria-label={`Go to page ${i + 1}`}
                className={`reels-dot ${isActive ? "reels-dot--active" : ""}`}
                onClick={() => {
                  if (!isAnimating) {
                    setDirection(i > Math.floor(currentIndex / VISIBLE_COUNT) ? 1 : -1);
                    setIsAnimating(true);
                    setCurrentIndex(i * VISIBLE_COUNT);
                  }
                }} />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;
