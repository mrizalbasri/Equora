export function createLandingMotion() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealed = new WeakSet<Element>();
  const animations = new Set<Animation>();
  const pending = new Map<Element, Animation>();
  const targets = '.calm [data-motion], .calm .footer-content';

  function prepare(element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) {
    const animation = element.animate(frames, options);
    animation.id = 'equora-reveal';
    animation.pause();
    animation.currentTime = 0;
    pending.set(element, animation);
    animations.add(animation);
    animation.finished.then(() => {
      animations.delete(animation);
      animation.cancel();
    }, () => animations.delete(animation));
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (revealed.has(entry.target)) continue;
      revealed.add(entry.target);
      entry.target.setAttribute('data-motion-state', 'visible');
      pending.get(entry.target)?.play();
      pending.delete(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

  function refresh() {
    observer.disconnect();
    cancelAnimations();
    if (preference.matches || !document.querySelector('.calm')) return;
    for (const element of document.querySelectorAll(targets)) {
      if (revealed.has(element)) continue;
      const delay = Number(element.getAttribute('data-motion-delay') ?? 0);
      const isMobile = window.innerWidth < 640;
      const hDist = isMobile ? 18 : 36;
      const vDist = isMobile ? 14 : 28;
      const variants: Record<string, Keyframe[]> = {
        fade: [{ opacity: 0 }, { opacity: 1 }],
        focus: [{ opacity: 0, scale: '0.98', filter: 'brightness(1.08)' }, { opacity: 1, scale: '1', filter: 'brightness(1)' }],
        unfold: [
          { opacity: 0, transform: 'perspective(1000px) rotateX(12deg) translateY(14px)' },
          { opacity: 1, transform: 'perspective(1000px) rotateX(0deg) translateY(0)' },
        ],
        up: [{ opacity: 0, translate: `0 ${vDist}px` }, { opacity: 1, translate: '0 0' }],
        down: [{ opacity: 0, translate: `0 ${-vDist}px` }, { opacity: 1, translate: '0 0' }],
        left: [{ opacity: 0, translate: `${-hDist}px 0` }, { opacity: 1, translate: '0 0' }],
        right: [{ opacity: 0, translate: `${hDist}px 0` }, { opacity: 1, translate: '0 0' }],
        scale: [{ opacity: 0, scale: '0.98' }, { opacity: 1, scale: '1' }],
        pop: [{ opacity: 0, scale: '0.96' }, { opacity: 1, scale: '1' }],
        blur: [{ opacity: 0, filter: 'blur(10px)', scale: '0.98' }, { opacity: 1, filter: 'blur(0px)', scale: '1' }],
        dissolve: [{ opacity: 0 }, { opacity: 1 }],
      };
      const durations: Record<string, number> = {
        fade: 550,
        blur: 650,
        focus: 650,
        down: 650,
        up: 600,
        left: 650,
        right: 650,
        scale: 600,
        pop: 550,
        unfold: 750,
      };
      const easings: Record<string, string> = {
        pop: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
        unfold: 'cubic-bezier(0.16, 1, 0.3, 1)',
        blur: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      };
      const variant = element.getAttribute('data-motion') || 'fade';
      const duration = durations[variant] ?? 650;
      const easing = easings[variant] ?? 'cubic-bezier(0.16, 1, 0.3, 1)';
      prepare(element, variants[variant] ?? variants.fade,
        { duration, delay: Math.min(Math.max(delay, 0), 280), fill: 'both', easing });
      element.setAttribute('data-motion-state', 'waiting');
      observer.observe(element);
    }
  }

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
    animations.clear();
    pending.clear();
  }

  function onPreferenceChange() {
    cancelAnimations();
    refresh();
  }

  function onFocus(event: FocusEvent) {
    if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return;
    for (const animation of animations) {
      const effect = animation.effect;
      if (effect instanceof KeyframeEffect && effect.target instanceof Element && effect.target.contains(event.target)) {
        observer.unobserve(effect.target);
        revealed.add(effect.target);
        pending.delete(effect.target);
        effect.target.setAttribute('data-motion-state', 'visible');
        animation.cancel();
      }
    }
  }

  preference.addEventListener('change', onPreferenceChange);
  document.addEventListener('focusin', onFocus);
  refresh();

  return {
    refresh,
    destroy() {
      observer.disconnect();
      cancelAnimations();
      preference.removeEventListener('change', onPreferenceChange);
      document.removeEventListener('focusin', onFocus);
    },
  };
}

export function landingScroll(node: HTMLElement) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shell = node.closest<HTMLElement>('.public-frame');
  let frame = 0;
  let previousTime = 0;
  let heroDrift = 0;
  let footerDrift = 0;

  function update(time: number) {
    frame = 0;
    if (preference.matches) {
      heroDrift = 0;
      footerDrift = 0;
      previousTime = 0;
      node.style.setProperty('--landing-progress', '0');
      node.style.setProperty('--preview-drift', '0px');
      shell?.style.setProperty('--footer-drift', '0px');
      return;
    }
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
    const maxDrift = window.innerWidth < 640 ? 10 : 32;
    const drift = Math.min(Math.max(-node.getBoundingClientRect().top * 0.06, 0), maxDrift);
    const footer = shell?.querySelector<HTMLElement>('.footer');
    const remaining = footer ? Math.max(footer.getBoundingClientRect().top, 0) : 0;
    const footerTarget = Math.min(remaining * 0.045, window.innerWidth < 640 ? 10 : 24);
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
    const blend = 1 - Math.exp(-elapsed / 110);
    heroDrift += (drift - heroDrift) * blend;
    footerDrift += (footerTarget - footerDrift) * blend;
    node.style.setProperty('--landing-progress', String(progress));
    node.style.setProperty('--preview-drift', `${heroDrift.toFixed(3)}px`);
    shell?.style.setProperty('--footer-drift', `${footerDrift.toFixed(3)}px`);
    if (Math.abs(drift - heroDrift) > 0.02 || Math.abs(footerTarget - footerDrift) > 0.02) {
      previousTime = time;
      frame = requestAnimationFrame(update);
    } else {
      previousTime = 0;
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  schedule();

  return {
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
      shell?.style.removeProperty('--footer-drift');
    },
  };
}
