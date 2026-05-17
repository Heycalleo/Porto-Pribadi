const root = document.documentElement;
const yearElement = document.getElementById('year');
const musicButton = document.getElementById('musicButton');
const musicInfo = document.getElementById('musicInfo');
const enterButton = document.getElementById('enterButton');
const introOverlay = document.getElementById('introOverlay');
const hero = document.querySelector('.hero');
const particleField = document.querySelector('.particle-field');
const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorPicker = document.getElementById('colorPicker');
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.querySelector('.scroll-progress');
const cursorGlow = document.getElementById('cursorGlow');
const particleTrailContainer = document.getElementById('particleTrail');
const floatingShapesContainer = document.getElementById('floatingShapes');
const floatingBubblesContainer = document.getElementById('floatingBubbles');
const confettiContainer = document.getElementById('confetti');
const commandPalette = document.getElementById('commandPalette');
const commandPaletteInput = document.getElementById('commandPaletteInput');
const commandPaletteList = document.getElementById('commandPaletteList');

const accentColors = [
  'rgba(125, 184, 255, 0.32)',
  'rgba(97, 205, 255, 0.28)',
  'rgba(220, 236, 255, 0.35)'
];
let accentIndex = 0;

function updateAccent() {
  root.style.setProperty('--dynamic-accent', accentColors[accentIndex]);
}

function applyReducedMotion(isEnabled) {
  document.body.classList.toggle('reduced-motion', Boolean(isEnabled));
  try {
    localStorage.setItem('reduced_motion', isEnabled ? '1' : '0');
  } catch (_) {
    // ignore
  }
}

function updatePointerPosition(x, y) {
  root.style.setProperty('--pointer-x', `${x}%`);
  root.style.setProperty('--pointer-y', `${y}%`);
}

function createParticles(count = 30) {
  if (!particleField) return;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('span');
    const size = Math.random() * 6 + 3;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * -8;
    const duration = Math.random() * 12 + 8;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.top = `${top}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;

    particleField.appendChild(particle);
  }
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

try {
  applyReducedMotion(localStorage.getItem('reduced_motion') === '1');
} catch (_) {
  // ignore
}

if (introOverlay) {
  document.body.classList.add('hide-scroll');
}

if (enterButton && introOverlay) {
  enterButton.addEventListener('click', () => {
    introOverlay.classList.add('intro-hidden');
    document.body.classList.remove('hide-scroll');
    window.setTimeout(() => {
      introOverlay.style.display = 'none';
    }, 500);
  });
}

if (musicButton && musicInfo) {
  musicButton.addEventListener('click', () => {
    const isHidden = musicInfo.classList.toggle('hidden');
    musicButton.textContent = isHidden ? 'Tampilkan rekomendasi album' : 'Sembunyikan rekomendasi album';
  });
}

const FEEDBACK_WEBHOOK_URL = 'https://discord.com/api/webhooks/1505371926661562621/EA2Zw6Ez7PBHDWNz740aqVkpNGoienzpxXy6dPTrZSit7rNP4wTh_9u3qk_IfSQdCMLE';
const feedbackForm = document.getElementById('feedbackForm');
const feedbackStatus = document.getElementById('feedbackStatus');

async function getPublicIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

async function sendFeedback(payload) {
  if (!FEEDBACK_WEBHOOK_URL) {
    throw new Error('Webhook URL belum diset.');
  }

  const response = await fetch(FEEDBACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Gagal mengirim feedback.');
  }
}

if (feedbackForm && feedbackStatus) {
  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('feedbackName').value.trim() || 'Anonim';
    const message = document.getElementById('feedbackMessage').value.trim();

    if (!message) {
      feedbackStatus.textContent = 'Tolong tulis pesan feedback sebelum kirim.';
      feedbackStatus.classList.remove('success');
      feedbackStatus.classList.add('error');
      return;
    }

    feedbackStatus.textContent = 'Mengirim feedback...';
    feedbackStatus.classList.remove('success', 'error');

    try {
      const ip = await getPublicIp();
      const payload = {
        name,
        message,
        ip,
        content: `Feedback dari: ${name}\nIP publik: ${ip}\nPesan:\n${message}`,
      };

      await sendFeedback(payload);
      feedbackStatus.textContent = 'Feedback berhasil dikirim. Terima kasih!';
      feedbackStatus.classList.add('success');
      feedbackForm.reset();
    } catch (error) {
      feedbackStatus.textContent = `Error: ${error.message}`;
      feedbackStatus.classList.add('error');
    }
  });
}

if (hero) {
  createParticles(35);

  const handlePointer = (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    updatePointerPosition(x, y);
  };

  const handlePointerDown = () => {
    accentIndex = (accentIndex + 1) % accentColors.length;
    updateAccent();
    hero.classList.add('hero-active');
    window.setTimeout(() => hero.classList.remove('hero-active'), 200);
  };

  document.addEventListener('pointermove', handlePointer);
  document.addEventListener('pointerdown', handlePointerDown);
}

updateAccent();

if (colorPickerBtn && colorPicker) {
  colorPickerBtn.addEventListener('click', () => {
    colorPicker.classList.toggle('hidden');
  });

  document.querySelectorAll('.color-option').forEach((option) => {
    const color = option.getAttribute('data-color');
    option.style.backgroundColor = color;
    
    option.addEventListener('click', () => {
      root.style.setProperty('--accent', color);
      localStorage.setItem('accent-color', color);
      colorPicker.classList.add('hidden');
    });
  });

  const savedColor = localStorage.getItem('accent-color');
  if (savedColor) {
    root.style.setProperty('--accent', savedColor);
  }
}

if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.remove('hidden');
    } else {
      backToTop.classList.add('hidden');
    }

    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Cursor Glow Effect
if (cursorGlow) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

// Particle Trail Effect
if (particleTrailContainer) {
  document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.8) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 6 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = e.clientX + 'px';
      particle.style.top = e.clientY + 'px';
      particle.style.background = getComputedStyle(root).getPropertyValue('--accent');
      particle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
      particle.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
      particleTrailContainer.appendChild(particle);
      setTimeout(() => particle.remove(), 1500);
    }
  });
}

// Floating Shapes
if (floatingShapesContainer) {
  const shapeTypes = ['circle', 'square', 'triangle'];
  for (let i = 0; i < 5; i++) {
    const shape = document.createElement('div');
    shape.className = 'shape ' + shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    shape.style.width = (Math.random() * 80 + 40) + 'px';
    shape.style.height = (Math.random() * 80 + 40) + 'px';
    shape.style.left = Math.random() * 100 + '%';
    shape.style.top = Math.random() * 100 + '%';
    shape.style.animationDuration = (Math.random() * 10 + 15) + 's';
    shape.style.animationDelay = Math.random() * 5 + 's';
    floatingShapesContainer.appendChild(shape);
  }
}

// Floating Bubbles
if (floatingBubblesContainer) {
  for (let i = 0; i < 8; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * 100 + 50;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.bottom = '-100px';
    bubble.style.setProperty('--duration', (Math.random() * 20 + 15) + 's');
    bubble.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
    floatingBubblesContainer.appendChild(bubble);
  }
}

// Confetti on Click
if (confettiContainer) {
  document.addEventListener('click', (e) => {
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.textContent = ['🎉', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 5)];
      confetti.style.left = e.clientX + 'px';
      confetti.style.top = e.clientY + 'px';
      confetti.style.fontSize = (Math.random() * 20 + 16) + 'px';
      confetti.style.setProperty('--x-drift', (Math.random() - 0.5) * 200 + 'px');
      confettiContainer.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  });
}

// 3D Tilt Card Effect
document.querySelectorAll('.card').forEach((card) => {
  if (!card.classList.contains('tilt-card')) {
    card.classList.add('tilt-card');
  }
  
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  });
});

// Scroll Reveal Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal', 'revealed');
    }
  });
}, observerOptions);

document.querySelectorAll('.card, article').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  const shortcuts = {
    't': 'tentang',
    'h': 'hobi',
    'm': 'musik',
    'f': 'favorit',
    'b': 'feedback',
    'k': 'kontak'
  };
  
  if (shortcuts[e.key.toLowerCase()]) {
    const section = document.getElementById(shortcuts[e.key.toLowerCase()]);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Command Palette (Ctrl+K or /)
if (commandPalette && commandPaletteInput && commandPaletteList) {
  const paletteState = {
    commands: [],
    filtered: [],
    activeIndex: 0,
    isOpen: false,
    lastFocus: null
  };

  const baseCommands = [
    {
      title: 'Toggle Reduced Motion',
      subtitle: 'Kurangi animasi kalau pusing / hemat baterai',
      keywords: ['motion', 'reduce', 'animasi', 'hemat', 'battery', 'pusing'],
      run: () => applyReducedMotion(!document.body.classList.contains('reduced-motion')),
      kbd: 'Alt+R'
    },
    {
      title: 'Cycle Accent Glow',
      subtitle: 'Ganti warna glow/accent pelan-pelan',
      keywords: ['accent', 'warna', 'glow', 'tema', 'color'],
      run: () => {
        accentIndex = (accentIndex + 1) % accentColors.length;
        updateAccent();
      },
      kbd: 'Alt+A'
    },
    {
      title: 'Jump to Feedback',
      subtitle: 'Langsung ke form feedback',
      keywords: ['feedback', 'pesan', 'kritik', 'saran', 'form'],
      run: () => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' }),
      kbd: 'Alt+F'
    }
  ];

  function buildSectionCommands() {
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const uniqueIds = new Set();
    const sectionCommands = [];

    anchors.forEach((anchor) => {
      const raw = anchor.getAttribute('href');
      const id = raw ? raw.slice(1) : '';
      if (!id || uniqueIds.has(id)) return;
      const target = document.getElementById(id);
      if (!target) return;
      uniqueIds.add(id);
      const title = anchor.textContent?.trim() || id;
      sectionCommands.push({
        title: `Go to: ${title}`,
        subtitle: `Scroll ke bagian #${id}`,
        keywords: [title, id, 'go', 'scroll', 'bagian', 'section'],
        run: () => target.scrollIntoView({ behavior: 'smooth' })
      });
    });

    return sectionCommands;
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function getCommandScore(command, query) {
    if (!query) return 1;
    const haystack = normalizeText([command.title, command.subtitle, ...(command.keywords || [])].join(' '));
    const parts = normalizeText(query).split(/\s+/).filter(Boolean);
    let score = 0;
    for (const part of parts) {
      if (haystack.includes(part)) score += 2;
      else return 0;
    }
    return score;
  }

  function renderList() {
    commandPaletteList.innerHTML = '';
    paletteState.filtered.forEach((command, index) => {
      const item = document.createElement('li');
      item.className = 'command-palette__item' + (index === paletteState.activeIndex ? ' is-active' : '');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', index === paletteState.activeIndex ? 'true' : 'false');

      const left = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'command-palette__item-title';
      title.textContent = command.title;
      const subtitle = document.createElement('div');
      subtitle.className = 'command-palette__item-subtitle';
      subtitle.textContent = command.subtitle || '';
      left.appendChild(title);
      if (command.subtitle) left.appendChild(subtitle);

      const right = document.createElement('div');
      right.className = 'command-palette__item-kbd';
      if (command.kbd) right.textContent = command.kbd;

      item.appendChild(left);
      item.appendChild(right);

      item.addEventListener('click', () => {
        paletteState.activeIndex = index;
        runActiveCommand();
      });

      commandPaletteList.appendChild(item);
    });
  }

  function filterCommands(query) {
    const scored = paletteState.commands
      .map((command) => ({ command, score: getCommandScore(command, query) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score);
    paletteState.filtered = scored.map((row) => row.command);
    paletteState.activeIndex = 0;
    renderList();
  }

  function openPalette() {
    if (paletteState.isOpen) return;
    paletteState.isOpen = true;
    paletteState.lastFocus = document.activeElement;
    commandPalette.classList.remove('hidden');
    commandPaletteInput.value = '';
    paletteState.commands = [...baseCommands, ...buildSectionCommands()];
    filterCommands('');
    window.setTimeout(() => commandPaletteInput.focus(), 0);
  }

  function closePalette() {
    if (!paletteState.isOpen) return;
    paletteState.isOpen = false;
    commandPalette.classList.add('hidden');
    if (paletteState.lastFocus && typeof paletteState.lastFocus.focus === 'function') {
      paletteState.lastFocus.focus();
    }
  }

  function runActiveCommand() {
    const cmd = paletteState.filtered[paletteState.activeIndex];
    if (!cmd) return;
    closePalette();
    try {
      cmd.run();
    } catch (_) {
      // ignore
    }
  }

  commandPalette.addEventListener('click', (event) => {
    const target = event.target;
    if (target && target.getAttribute && target.getAttribute('data-close') === 'true') {
      closePalette();
    }
  });

  commandPaletteInput.addEventListener('input', () => {
    filterCommands(commandPaletteInput.value);
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey && event.key.toLowerCase() === 'k') || (!event.ctrlKey && event.key === '/')) {
      const tag = (document.activeElement && document.activeElement.tagName) ? document.activeElement.tagName.toLowerCase() : '';
      const isTyping = ['input', 'textarea', 'select'].includes(tag);
      if (!isTyping) {
        event.preventDefault();
        openPalette();
      }
    }

    if (!paletteState.isOpen) {
      if (event.altKey && event.key.toLowerCase() === 'r') applyReducedMotion(!document.body.classList.contains('reduced-motion'));
      if (event.altKey && event.key.toLowerCase() === 'a') {
        accentIndex = (accentIndex + 1) % accentColors.length;
        updateAccent();
      }
      if (event.altKey && event.key.toLowerCase() === 'f') document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      paletteState.activeIndex = Math.min(paletteState.activeIndex + 1, paletteState.filtered.length - 1);
      renderList();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      paletteState.activeIndex = Math.max(paletteState.activeIndex - 1, 0);
      renderList();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      runActiveCommand();
    }
  });
}
