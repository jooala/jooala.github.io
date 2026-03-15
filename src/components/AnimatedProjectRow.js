import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export default function AnimatedProjectRow({ project }) {
  const rowRef = useRef(null);
  const tagRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    const tag = tagRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;

    if (!row || !tag || !title) {
      return undefined;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let split;
    let played = false;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(row, { opacity: 1, y: 0 });
        return;
      }

      split = new SplitText(title, { type: 'chars' });

      gsap.set(row, { opacity: 1 });
      gsap.set(tag, { y: 20, opacity: 0 });
      gsap.set(split.chars, { yPercent: 110, opacity: 0 });

      if (subtitle) {
        gsap.set(subtitle, { y: 18, opacity: 0 });
      }
    }, row);

    const playAnimation = () => {
      if (played) {
        return;
      }

      played = true;

      if (prefersReducedMotion) {
        gsap.fromTo(
          row,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
        return;
      }

      const timeline = gsap.timeline();
      timeline
        .to(tag, {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
        })
        .to(
          split.chars,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.014,
            ease: 'power4.out',
          },
          0.06
        );

      if (subtitle) {
        timeline.to(
          subtitle,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
          },
          0.18
        );
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.28, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(row);

    return () => {
      observer.disconnect();
      ctx.revert();
      if (split) {
        split.revert();
      }
    };
  }, []);

  return (
    <Link
      ref={rowRef}
      href={project.href}
      className="group project-row block w-full border-b border-current/20 relative overflow-hidden transition-colors duration-300"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 md:py-14 px-4 md:px-12">
        <div className="flex flex-col gap-3">
          <span
            ref={tagRef}
            className="project-row-tag font-mono text-xs md:text-sm tracking-widest uppercase transition-colors duration-300"
          >
            [ {project.category} ]
          </span>
          <h3
            ref={titleRef}
            className="project-row-title text-4xl md:text-7xl font-oswald uppercase tracking-tighter group-hover:translate-x-4 transition-all duration-500"
          >
            {project.title}
          </h3>
        </div>

        <div className="mt-6 md:mt-0 md:max-w-md text-left md:text-right hidden md:block">
          <p
            ref={subtitleRef}
            className="project-row-subtitle font-inter text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 leading-relaxed"
          >
            {project.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
