import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export default function FooterCTA() {
  const sectionRef = useRef(null);
  const labelRef   = useRef(null);
  const headingRef = useRef(null);
  const btnRef     = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const label   = labelRef.current;
    const heading = headingRef.current;
    const btn     = btnRef.current;
    if (!section || !label || !heading || !btn) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let split;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([label, heading, btn], { opacity: 1, y: 0 });
        return;
      }

      split = new SplitText(heading, { type: 'words' });

      gsap.set(label,       { y: 18, opacity: 0 });
      gsap.set(split.words, { yPercent: 110, opacity: 0 });
      gsap.set(btn,         { y: 22, opacity: 0 });
    }, section);

    const play = () => {
      if (prefersReducedMotion) return;

      gsap.timeline()
        .to(label, {
          y: 0, opacity: 1,
          duration: 0.5, ease: 'power3.out',
        })
        .to(split.words, {
          yPercent: 0, opacity: 1,
          duration: 0.75, stagger: 0.10, ease: 'power4.out',
        }, 0.12)
        .to(btn, {
          y: 0, opacity: 1,
          duration: 0.5, ease: 'power3.out',
        }, 0.40);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      ctx.revert();
      split?.revert();
    };
  }, []);

  return (
    <footer className="mt-40" ref={sectionRef}>
      <div className="border-t border-[#333333]">
        <div className="container mx-auto px-4 py-20 flex flex-col items-start gap-8">
          <span ref={labelRef} className="text-xs font-mono tracking-widest text-[#666666] uppercase">
            [ Get in touch ]
          </span>
          <h2
            ref={headingRef}
            className="text-6xl md:text-8xl lg:text-9xl font-oswald font-bold uppercase leading-[0.88] tracking-tight text-[#EAEAEA] m-0"
          >
            Let&apos;s <span className="text-[#d5ff3f]">work</span>
            <br />together.
          </h2>
          <a ref={btnRef} href="mailto:joonas.alanenpaa@aalto.fi" className="cta-btn mt-2">
            Say Hello
          </a>
        </div>
      </div>
      <div className="border-t border-[#1e1e1e] py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <span className="font-mono text-xs text-[#444444] tracking-widest uppercase">
            Joonas Alanenpää
          </span>
          <span className="font-mono text-xs text-[#2e2e2e] tracking-widest">
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
