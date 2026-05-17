const root = document.documentElement;
const yearElement = document.getElementById('year');
const musicButton = document.getElementById('musicButton');
const musicInfo = document.getElementById('musicInfo');
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

if (musicButton && musicInfo) {
  musicButton.addEventListener('click', () => {
    const isHidden = musicInfo.classList.toggle('hidden');
    musicButton.textContent = isHidden ? 'Tampilkan rekomendasi album' : 'Sembunyikan rekomendasi album';
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
