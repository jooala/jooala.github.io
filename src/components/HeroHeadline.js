import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export default function HeroHeadline({ lines }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lineElements = root.querySelectorAll('.hero-headline__line');
    const textElements = root.querySelectorAll('.hero-headline__text');
    const coverElements = root.querySelectorAll('.hero-headline__cover');
    const ghostElements = root.querySelectorAll('.hero-headline__ghost');
    const splitInstances = [];

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.fromTo(
          lineElements,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.12,
            ease: 'power3.out',
          }
        );
        return;
      }

      textElements.forEach((element) => {
        splitInstances.push(new SplitText(element, { type: 'chars' }));
      });

      const allChars = splitInstances.flatMap((instance) => instance.chars);

      gsap.set(lineElements, { opacity: 1 });
      gsap.set(coverElements, { yPercent: 0 });
      gsap.set(ghostElements, { opacity: 0 });
      gsap.set(allChars, {
        yPercent: 112,
        opacity: 0,
        rotateX: -80,
        transformOrigin: '50% 100%',
      });

      const timeline = gsap.timeline({ delay: 0.2 });

      splitInstances.forEach((instance, index) => {
        const lineStart = index * 0.16;

        timeline
          .to(
            coverElements[index],
            {
              yPercent: -108,
              duration: 0.78,
              ease: 'power4.inOut',
            },
            lineStart
          )
          .fromTo(
            ghostElements[index],
            { opacity: 0, x: 0 },
            {
              opacity: 0.55,
              x: index === 2 ? -12 : 10,
              duration: 0.08,
              repeat: 3,
              yoyo: true,
              ease: 'none',
            },
            lineStart + 0.02
          )
          .to(
            instance.chars,
            {
              yPercent: 0,
              opacity: 1,
              rotateX: 0,
              duration: 0.68,
              stagger: 0.014,
              ease: 'power4.out',
            },
            lineStart + 0.08
          );
      });
    }, root);

    return () => {
      ctx.revert();
      splitInstances.forEach((instance) => instance.revert());
    };
  }, [lines]);

  return (
    <div ref={rootRef} className="hero-headline" aria-label={lines.map((line) => line.text).join(' ')}>
      {lines.map((line) => (
        <span
          key={line.text}
          className={`hero-headline__line ${line.accent ? 'hero-headline__line--accent' : ''}`}
        >
          <span className="hero-headline__cover" aria-hidden="true" />
          <span className="hero-headline__ghost" aria-hidden="true">
            {line.text}
          </span>
          <span className="hero-headline__text">{line.text}</span>
        </span>
      ))}
    </div>
  );
}
