// Casa Eywa — interactions
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Gallery lightbox (delegación de eventos: soporta tarjetas creadas
  // dinámicamente desde content/galeria.json, y tanto fotos como videos)
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg) {
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (lightboxVideo) { lightboxVideo.pause(); lightboxVideo.removeAttribute('src'); }
    };

    document.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;

      const full = item.getAttribute('data-full');
      const type = item.getAttribute('data-type') || 'image';

      if (type === 'video' && lightboxVideo) {
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = full;
        lightboxVideo.muted = false;
        lightboxVideo.play().catch(() => {});
      } else {
        if (lightboxVideo) { lightboxVideo.style.display = 'none'; lightboxVideo.pause(); }
        lightboxImg.style.display = 'block';
        const alt = item.querySelector('img')?.getAttribute('alt') || '';
        lightboxImg.setAttribute('src', full);
        lightboxImg.setAttribute('alt', alt);
      }

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }
});
