import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Header from './Header';
import AnimatedProjectRow from '../components/AnimatedProjectRow';
import CustomCursor from '../components/CustomCursor';
import FooterCTA from '../components/FooterCTA';
import { trackPageTime } from '../utils/googleAnalytics';
import { gsap } from 'gsap';

const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false });

// ShaderHeroHeadline uses Three.js + WebGL — must be client-side only
const ShaderHeroHeadline = dynamic(
  () => import('../components/ShaderHeroHeadline'),
  { ssr: false }
);

const HeroSphere = dynamic(
  () => import('../components/HeroSphere'),
  { ssr: false }
);

const HERO_LINES = [
  { text: "Hello,",      accent: false },
  { text: "I'm Joonas.", accent: true  },
];

const PROJECTS = [
  {
    href: '/projects/doublepoint',
    category: 'Service Design',
    title: 'Doublepoint',
    subtitle:
      'Service Design project in IDBM Industry Project with Doublepoint: innovating with touch detection tech for enhanced independence in disabilities.',
  },
  {
    href: '/projects/sustainablyyours',
    category: 'UX Design',
    title: 'Sustainably Yours',
    subtitle:
      "UI/UX Project: Addressing fashion's environmental impact by solving lack of transparency and consumer wastefulness.",
  },
  {
    href: '/projects/sauna',
    category: 'VR / Unity',
    title: 'Sauna Simulator VR',
    subtitle: 'VR Project made in Unity, which is aiming to simulate sauna experience.',
  },
  {
    href: '/projects/bugbear',
    category: 'Game Industry',
    title: 'Bugbear Entertainment',
    subtitle:
      'Several different type of work with Bugbear Entertainment behind video games in Wreckfest, Ridge Racer Unbounded and FlatOut-series.',
  },
];

export default function App() {
  const subtitleRef  = useRef(null);
  const ctaBtnRef    = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stopTracking = trackPageTime();
    // Fallback: force-remove overlay after 4s if onReady never fires
    const fallback = setTimeout(() => setLoaded(true), 4000);
    return () => { stopTracking(); clearTimeout(fallback); };
  }, []);

  // Reveal subtitle + CTA after headline glitch animation finishes (~0.9s duration + settle)
  useEffect(() => {
    const subtitle = subtitleRef.current;
    const btn      = ctaBtnRef.current;
    if (!subtitle || !btn) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    gsap.set([subtitle, btn], { opacity: 0, y: 18 });

    const delay = prefersReducedMotion ? 0.1 : 1.05; // after glitch settles
    const tl = gsap.timeline({ delay });
    tl.to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to(btn,      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.35');

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="home-shell min-h-screen">
      <Head>
        <title>Joonas Alanenpää</title>
      </Head>

      <CustomCursor />

      {/* Header */}
      <div className="w-full bg-opacity-50 absolute top-0 z-20">
        <Header />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        {/* Three.js wireframe — top-right, behind text */}
        <div className="hero-background">
          <ThreeBackground />
        </div>

        {/* Dot-sphere visualization — behind headline text */}
        <div className="hero-sphere-wrap">
          <HeroSphere onReady={() => setLoaded(true)} />
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <ShaderHeroHeadline lines={HERO_LINES} />

          <p ref={subtitleRef} className="text-base md:text-lg text-[#9c9c9c] max-w-md mt-2 font-inter leading-relaxed">
            Product Manager who loves combining design, technology, and
            curiosity to build products that feel great to use.
          </p>

          <a
            ref={ctaBtnRef}
            href="mailto:joonas.alanenpaa@aalto.fi"
            className="cta-btn mt-10"
          >
            Get in Touch
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" aria-hidden="true">
          <span className="scroll-indicator__label">Scroll</span>
          <div className="scroll-indicator__track" />
        </div>
      </section>

      {/* Projects */}
      <section className="projects-section">
        <div className="container mx-auto px-4">
          <div className="mb-8 brutalist-divider pb-4">
            <span className="text-xs font-mono tracking-widest text-[#666666] uppercase">
              [ Selected Work ]
            </span>
          </div>

          <div className="projects-shell border-t border-[rgba(255,255,255,0.18)]">
            {PROJECTS.map((project) => (
              <AnimatedProjectRow key={project.href} project={project} />
            ))}
          </div>
        </div>
      </section>

      <FooterCTA />

      {/* Loading overlay — fades out when HeroSphere fires first frame */}
      <div
        className="loading-overlay"
        style={{ opacity: loaded ? 0 : 1, pointerEvents: loaded ? 'none' : 'all' }}
        aria-hidden="true"
      >
        <div className="loading-ring" />
      </div>
    </div>
  );
}
