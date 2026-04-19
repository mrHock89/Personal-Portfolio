/* ════════════════════════════════════════
   Theme — dark is always default
   ════════════════════════════════════════ */
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeToggle');

// Force dark as default — ignore any previously saved light preference
const savedTheme = localStorage.getItem('theme');
const theme = (savedTheme === 'light') ? 'light' : 'dark';
html.setAttribute('data-theme', theme);
if (!savedTheme) localStorage.setItem('theme', 'dark');

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  if (typeof feather !== 'undefined') feather.replace({ 'stroke-width': 1.75 });
});

/* ════════════════════════════════════════
   Page Transition
   ════════════════════════════════════════ */
const overlay = document.getElementById('pageTransition');

// Intercept external link clicks for a smooth curtain
document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('YOUR_')) return;
    e.preventDefault();
    overlay.classList.add('enter');
    setTimeout(() => {
      window.open(href, '_blank');
      setTimeout(() => {
        overlay.classList.remove('enter');
        overlay.classList.add('exit');
        setTimeout(() => overlay.classList.remove('exit'), 500);
      }, 300);
    }, 400);
  });
});

// Slide out on page show
window.addEventListener('pageshow', () => {
  overlay.classList.add('exit');
  setTimeout(() => overlay.classList.remove('exit'), 600);
});

/* ════════════════════════════════════════
   Custom Cursor
   ════════════════════════════════════════ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mouseX = -200, mouseY = -200;
let ringX  = -200, ringY  = -200;
let rafId  = null;

if (window.matchMedia('(pointer: fine)').matches) {
  let cursorVisible = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    if (!cursorVisible) {
      cursorVisible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '0.5';
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animateRing);
  }
  // Only start ring animation after first mouse move to prevent ghost
  document.addEventListener('mousemove', startRing, { once: true });
  function startRing() { animateRing(); }

  const hoverTargets = 'a, button, .skill-card, .social-row, .game-card, .interest-card, .chip, .float-card, .gh-cell';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    }
  });

  document.addEventListener('mousedown', () => {
    dot.classList.add('clicking');
    ring.classList.add('clicking');
  });

  document.addEventListener('mouseup', () => {
    dot.classList.remove('clicking');
    ring.classList.remove('clicking');
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorVisible) {
      dot.style.opacity  = '1';
      ring.style.opacity = '0.5';
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else if (cursorVisible) {
      animateRing();
    }
  });
}

/* ════════════════════════════════════════
   Splash Screen
   ════════════════════════════════════════ */
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(triggerHeroReveal, 500);
  }, 2600);
});

function triggerHeroReveal() {
  document.querySelectorAll('.hero .reveal').forEach((el) => {
    el.classList.add('visible');
  });
}

/* ════════════════════════════════════════
   Scroll Reveal
   ════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
);

document.querySelectorAll('.reveal:not(.hero .reveal)').forEach((el) => {
  revealObserver.observe(el);
});

/* ════════════════════════════════════════
   Nav — scroll state + active link
   ════════════════════════════════════════ */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 48);
}, { passive: true });

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { threshold: 0.35 }
);

sections.forEach((s) => sectionObserver.observe(s));

/* ════════════════════════════════════════
   GitHub Contribution Graph + Snake
   ════════════════════════════════════════ */
const GH_USER = 'ChroniX-AOSP'; // ← replace with your GitHub username

/* ── Fetch GitHub stats ── */
async function fetchGhStats() {
  try {
    const res = await fetch(`https://api.github.com/users/${GH_USER}`);
    if (!res.ok) return;
    const user = await res.json();
    document.getElementById('ghStatRepos').textContent = user.public_repos || '—';
  } catch (_) {}
}

/* ── Fetch contributions ── */
async function buildGhGraph() {
  const container = document.getElementById('ghGraph');
  let weeks = null;
  let totalContribs = 0;
  let totalCommits = 0;

  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
    if (res.ok) {
      const json = await res.json();
      weeks = parseContributions(json.contributions);
      totalContribs = json.contributions.reduce((s, d) => s + (d.count || 0), 0);
      totalCommits  = totalContribs; // best proxy without auth
    }
  } catch (_) {}

  if (!weeks) {
    weeks = mockContributions();
    totalContribs = weeks.flat().reduce((s, v) => s + v, 0);
    totalCommits  = totalContribs;
  }

  // Update stat cards
  const activeDays = weeks.flat().filter(v => v > 0).length;
  document.getElementById('ghStatCommits').textContent   = totalCommits > 0 ? totalCommits.toLocaleString() : '—';
  document.getElementById('ghStatContribs').textContent  = totalContribs > 0 ? totalContribs.toLocaleString() : '—';
  document.getElementById('ghStatDays').textContent      = activeDays > 0 ? activeDays : '—';

  renderGraph(container, weeks);

  // Start snake after graph renders
  requestAnimationFrame(() => startSnake(weeks));
}

function parseContributions(days) {
  const weeks = [];
  let week = [];
  days.forEach((d) => {
    week.push(d.level ?? levelFromCount(d.count));
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) weeks.push(week);
  return weeks;
}

function levelFromCount(n) {
  if (n === 0) return 0;
  if (n <= 2)  return 1;
  if (n <= 5)  return 2;
  if (n <= 9)  return 3;
  return 4;
}

function mockContributions() {
  const weeks = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const r = rand();
      week.push(r < 0.45 ? 0 : r < 0.65 ? 1 : r < 0.80 ? 2 : r < 0.92 ? 3 : 4);
    }
    weeks.push(week);
  }
  return weeks;
}

function renderGraph(container, weeks) {
  const wrap = document.createElement('div');
  wrap.className = 'gh-weeks';
  weeks.forEach((week) => {
    const col = document.createElement('div');
    col.className = 'gh-week';
    week.forEach((level) => {
      const cell = document.createElement('span');
      cell.className = 'gh-cell';
      cell.setAttribute('data-level', level);
      col.appendChild(cell);
    });
    wrap.appendChild(col);
  });
  container.innerHTML = '';
  container.appendChild(wrap);
}

/* ════════════════════════════════════════
   Snake Animation
   ════════════════════════════════════════ */
function startSnake(weeks) {
  const graphEl = document.getElementById('ghGraph');
  const canvas  = document.getElementById('snakeCanvas');
  if (!canvas || !graphEl) return;

  const CELL  = 12; // px — matches .gh-cell width
  const GAP   = 3;  // px — matches gap
  const STEP  = CELL + GAP;
  const COLS  = weeks.length;
  const ROWS  = 7;

  const W = COLS * STEP - GAP;
  const H = ROWS * STEP - GAP;

  canvas.width  = W;
  canvas.height = H;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');

  // Build path: snake traverses columns top→bottom, alternating direction
  const path = [];
  for (let c = 0; c < COLS; c++) {
    if (c % 2 === 0) {
      for (let r = 0; r < ROWS; r++) path.push({ c, r });
    } else {
      for (let r = ROWS - 1; r >= 0; r--) path.push({ c, r });
    }
  }

  const SNAKE_LEN = 6;
  let   headIdx   = 0;
  let   raf;

  // Accent color from CSS variable
  const style    = getComputedStyle(document.documentElement);
  const accent   = style.getPropertyValue('--accent').trim()   || '#818CF8';
  const accentHi = style.getPropertyValue('--accent-hi').trim() || '#A5B4FC';

  function cellCenter(c, r) {
    return { x: c * STEP + CELL / 2, y: r * STEP + CELL / 2 };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw snake body
    for (let i = 0; i < SNAKE_LEN; i++) {
      const idx = headIdx - i;
      if (idx < 0) continue;
      const { c, r } = path[idx % path.length];
      const { x, y } = cellCenter(c, r);
      const alpha = 1 - (i / SNAKE_LEN) * 0.7;
      const radius = i === 0 ? 5 : 4;

      ctx.beginPath();
      ctx.roundRect(
        c * STEP, r * STEP,
        CELL, CELL,
        radius
      );
      ctx.fillStyle = i === 0
        ? accentHi
        : `rgba(129,140,248,${alpha.toFixed(2)})`;
      ctx.fill();

      // Head eyes
      if (i === 0) {
        const next = path[(headIdx + 1) % path.length];
        const dx = next.c - c;
        const dy = next.r - r;
        const ex = dx === 0 ? 2 : (dx > 0 ? 3 : 1);
        const ey = dy === 0 ? 2 : (dy > 0 ? 3 : 1);
        ctx.beginPath();
        ctx.arc(c * STEP + ex + 1, r * STEP + ey + 1, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c * STEP + CELL - ex - 1, r * STEP + ey + 1, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }
  }

  let last = 0;
  const SPEED = 80; // ms per step

  function tick(ts) {
    if (ts - last >= SPEED) {
      headIdx = (headIdx + 1) % path.length;
      last = ts;
      draw();
    }
    raf = requestAnimationFrame(tick);
  }

  // Only run when section is visible
  const snakeObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    });
  }, { threshold: 0.1 });

  snakeObserver.observe(document.getElementById('github'));
}

buildGhGraph();
fetchGhStats();

/* ════════════════════════════════════════
   Image fade-in on load
   ════════════════════════════════════════ */
document.querySelectorAll('img').forEach((img) => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
});

/* ════════════════════════════════════════
   Card 3D tilt on mouse move
   ════════════════════════════════════════ */
document.querySelectorAll('.skill-card, .interest-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-5px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ════════════════════════════════════════
   Stat counter animation
   ════════════════════════════════════════ */
function animateCounter(el) {
  const text = el.textContent.trim();
  const num  = parseFloat(text);
  // Skip non-numeric values like "A16"
  if (isNaN(num)) return;
  const suffix = text.replace(String(num), '');
  const duration = 900;
  const start = performance.now();
  const update = (now) => {
    const p    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val  = num < 10 ? Math.round(ease * num) : Math.floor(ease * num);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.currentTarget.querySelectorAll('.stat-value').forEach(animateCounter);
      statsObserver.unobserve(e.currentTarget);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) statsObserver.observe(statsEl);
