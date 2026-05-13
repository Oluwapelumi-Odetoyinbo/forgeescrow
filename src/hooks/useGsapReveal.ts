import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type RevealDir = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

const fromVars: Record<RevealDir, gsap.TweenVars> = {
  up: { y: 50 },
  down: { y: -50 },
  left: { x: -60 },
  right: { x: 60 },
  scale: { scale: 0.85 },
  fade: {},
};

export function useGsapReveal() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        const dir = (el.getAttribute('data-reveal') || 'up') as RevealDir;
        const from = { opacity: 0, ...(fromVars[dir] || fromVars.up) };

        gsap.set(el, from);
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((container) => {
        const children = Array.from(container.children) as HTMLElement[];
        if (!children.length) return;

        gsap.set(children, { opacity: 0, y: 30 });
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);
}
