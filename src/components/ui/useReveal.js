import { useEffect, useRef } from 'react';

// Adds `is-in` to the element (and any `.reveal` / `.wipe` children) once it
// scrolls into view. Pair with the `.reveal` / `.wipe` classes in base.css.
export default function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const targets = [el, ...el.querySelectorAll('.reveal, .wipe')];
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((t) => t.classList.add('is-in'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
