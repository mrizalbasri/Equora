export function createLandingMotion() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealed = new WeakSet<Element>();
  const animations = new Set<Animation>();
  const targets = '.calm [data-motion], .calm .footer';

  function play(element: Element, frames: Keyframe[], options: KeyframeAnimationOptions, id: string) {
    const animation = element.animate(frames, options);
    animation.id = id;
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (revealed.has(entry.target)) continue;
      revealed.add(entry.target);
      entry.target.setAttribute('data-motion-state', 'visible');
      if (preference.matches) continue;
      const delay = Number(entry.target.getAttribute('data-motion-delay') ?? 0);
      const distance = window.innerWidth < 640 ? 8 : 16;
      const variants: Record<string, Keyframe[]> = {
        fade: [{ opacity: 0 }, { opacity: 1 }],
        focus: [{ opacity: 0, scale: '0.985' }, { opacity: 1, scale: '1' }],
        left: [{ opacity: 0, translate: `${-distance}px 0` }, { opacity: 1, translate: '0 0' }],
        right: [{ opacity: 0, translate: `${distance}px 0` }, { opacity: 1, translate: '0 0' }],
        unfold: [{ opacity: 0, clipPath: 'inset(0 0 6% 0 round 16px)' }, { opacity: 1, clipPath: 'inset(0 0 0 0 round 16px)' }],
      };
      const variant = entry.target.getAttribute('data-motion') || 'fade';
      play(entry.target, variants[variant] ?? variants.fade,
        { duration: variant === 'focus' || variant === 'unfold' ? 860 : 720, delay: Math.min(Math.max(delay * 0.75, 0), 180), fill: 'backwards', easing: 'cubic-bezier(0.22, 0.68, 0.25, 1)' }, 'equora-reveal');
    }
  }, { threshold: 0 });

  function refresh() {
    observer.disconnect();
    cancelAnimations();
    if (preference.matches || !document.querySelector('.landing-hero')) return;
    for (const element of document.querySelectorAll(targets)) {
      if (revealed.has(element)) continue;
      element.setAttribute('data-motion-state', 'waiting');
      observer.observe(element);
    }
  }

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }

  function onPreferenceChange() {
    cancelAnimations();
    refresh();
  }

  function onFocus(event: FocusEvent) {
    if (!(event.target instanceof Node)) return;
    for (const animation of animations) {
      const effect = animation.effect;
      if (effect instanceof KeyframeEffect && effect.target?.contains(event.target)) animation.cancel();
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
  let frame = 0;

  function update() {
    frame = 0;
    if (preference.matches) {
      node.style.setProperty('--landing-progress', '0');
      node.style.setProperty('--preview-drift', '0px');
      return;
    }
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
    const maxDrift = window.innerWidth < 640 ? 6 : 18;
    const drift = Math.min(Math.max(-node.getBoundingClientRect().top * 0.035, 0), maxDrift);
    node.style.setProperty('--landing-progress', String(progress));
    node.style.setProperty('--preview-drift', `${drift}px`);
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
    },
  };
}
