const root = document.documentElement;
const yearElement = document.getElementById('year');
const musicButton = document.getElementById('musicButton');
const musicInfo = document.getElementById('musicInfo');
const enterButton = document.getElementById('enterButton');
const introOverlay = document.getElementById('introOverlay');
const hero = document.querySelector('.hero');
const particleField = document.querySelector('.particle-field');

const accentColors = [
  'rgba(125, 184, 255, 0.32)',
  'rgba(97, 205, 255, 0.28)',
  'rgba(220, 236, 255, 0.35)'
];
let accentIndex = 0;

function updateAccent() {
  root.style.setProperty('--dynamic-accent', accentColors[accentIndex]);
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
