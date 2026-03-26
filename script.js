/* ============================================================
   AKSROME — script.js
   ============================================================ */

(function () {

  // ── CANVAS PARTICLE GRID ──────────────────────────────────
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.size  = Math.random() * 1.8 + 0.4;
      this.speed = Math.random() * 0.35 + 0.1;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.cyan  = Math.random() > 0.4;
    }
    update() {
      this.y -= this.speed;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.cyan
        ? `rgba(0,245,255,${this.opacity})`
        : `rgba(124,58,237,${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 12000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  // Grid lines
  function drawGrid() {
    const step = 80;
    ctx.lineWidth = 0.25;
    for (let x = 0; x < W; x += step) {
      const alpha = 0.04 + 0.02 * Math.sin(Date.now() / 3000 + x / 200);
      ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      const alpha = 0.04 + 0.02 * Math.cos(Date.now() / 3500 + y / 200);
      ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  resize();
  initParticles();
  loop();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticles();
    }, 200);
  });


  // ── NAVBAR SCROLL ──────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });


  // ── MOBILE NAV TOGGLE ──────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }


  // ── REVEAL ON SCROLL ──────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.closest('.features-grid')
          ? Array.from(el.closest('.features-grid').children).indexOf(el) * 80
          : 0;
        setTimeout(() => el.classList.add('visible'), delay);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));


  // ── CAROUSEL ──────────────────────────────────────────────
  const track  = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');

  if (track && prevBtn && nextBtn && dotsEl) {
    let current = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    const total  = slides.length;
    const dots   = dotsEl.querySelectorAll('.dot');

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = `translateX(calc(-${current * 100}% - ${current * 24}px))`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // auto-play
    let autoTimer = setInterval(() => goTo(current + 1), 4000);
    [prevBtn, nextBtn].forEach(btn => {
      btn.addEventListener('click', () => {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4000);
      });
    });

    // touch / drag
    let startX = 0, dragging = false;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (!dragging) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
      dragging = false;
    });
  }


  // ── FAQ ACCORDION ─────────────────────────────────────────
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });


  // ── ACTIVE NAV LINK ───────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.btn-nav)');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + entry.target.id
            ? 'var(--cyan)'
            : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

})();
