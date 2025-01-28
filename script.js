class Particle {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2
    };
    this.radius = Math.random() * 2;
    this.color = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5 + 0.5
      })`;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Bounce if hitting edges
    if (this.x < 0 || this.x > this.canvas.width) this.velocity.x *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.velocity.y *= -1;
  }
}

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = [];

  for (let i = 0; i < 50; i++) {
    particles.push(new Particle(canvas, ctx));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  // Draw connections between close particles
  particles.forEach((p, i) => {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = p.x - particles[j].x;
      const dy = p.y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(46, 199, 230, ${(100 - distance) / 100 * 0.2})`;
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
  initParticles();
});

/*************************************************************************/
/* TYPING ANIMATION & TERMINAL SEQUENCE */
/*************************************************************************/
let typingSpeed = 70; // ms delay between letters

async function typeText(text) {
  const consoleOutput = document.getElementById('console-output');
  const cursor = document.querySelector('.cursor');
  if (!consoleOutput || !cursor) return;

  for (let i = 0; i < text.length; i++) {
    consoleOutput.textContent += text[i];
    cursor.style.transform = `translateX(${consoleOutput.textContent.length * 8}px)`;

    // A small delay for each character
    await new Promise((resolve) => setTimeout(resolve, typingSpeed));
  }
  // Pause briefly after each typed line
  return new Promise((resolve) => setTimeout(resolve, 500));
}

async function typeConsoleSequence() {
  const consoleOutput = document.getElementById('console-output');
  const cursor = document.querySelector('.cursor');
  const logoContainer = document.querySelector('.logo-container');
  const mainContent = document.querySelector('.main-content');
  if (!consoleOutput || !cursor || !logoContainer || !mainContent) return;

  // Clear any previous text
  consoleOutput.textContent = '';

  // Start the 23s "click" track when typing starts
  startTypingSound();

  // Type lines
  await typeText('Initializing STEM CS Club...');
  await typeText('\nLoading assets...');
  await typeText('\nPreparing display...');
  await typeText("\nWaiting for Members' Recruitment...");

  // Show logo (and optional hover sound)
  logoContainer.style.opacity = '1';
  logoContainer.style.transform = 'translateY(0)';
  playSound('hover');

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Final line
  await typeText('\nSystem ready...');
  await typeText('\nRunning Season 2025...');

  // Stop the 23s track and automatically start ambient
  stopTypingSound();

  // Fade out the terminal
  setTimeout(() => {
    const terminal = document.querySelector('.terminal');
    if (terminal) {
      terminal.style.opacity = '0';
      setTimeout(() => {
        terminal.style.display = 'none';
        // Reveal main content
        mainContent.classList.remove('hidden');

        // Show the quote after a short delay
        setTimeout(() => {
          const quote = document.querySelector('.quote');
          if (quote) quote.classList.remove('hidden');
        }, 1500);
      }, 1000);
    }
  }, 1500);
}

/*************************************************************************/
/* SOUND HANDLING */
/*************************************************************************/
let isSoundEnabled = true;
const sounds = {
  // The 23-second "click" track used for typing
  click: new Audio('./assets/sounds/click.mp3'),
  // Hover is a short sfx if you want
  hover: new Audio('./assets/sounds/hover.mp3'),
  // Ambient is the background music to play AFTER click track ends
  ambient: new Audio('./assets/sounds/ambient.mp3'),
};

// Set volumes & looping
sounds.click.volume = 0.5;
sounds.click.loop = false;

sounds.hover.volume = 0.0; // Increase if you want audible hover
sounds.ambient.volume = 0.05;
sounds.ambient.loop = true;

/**
 * Plays a named sound if sound is enabled.
 * - "click" => 23s track (played once at a time)
 * - "hover" => short sfx
 * - "ambient" => looping background track
 */
function playSound(name) {
  if (!isSoundEnabled) return;
  const snd = sounds[name];
  if (!snd) return;

  if (name === 'hover') {
    // "hover" is presumably short, so we clone it
    const temp = new Audio(snd.src);
    temp.volume = snd.volume;
    temp.play().catch(() => { });
  } else {
    // "click" or "ambient" are longer tracks
    snd.currentTime = 0;
    snd.play().catch(() => { });
  }
}

/**
 * Start the 23s "click" track for typing.
 */
function startTypingSound() {
  if (isSoundEnabled && sounds.click) {
    sounds.click.currentTime = 5;

    sounds.click.play().catch((error) => {
      console.log(error);
    });
  }
}

/**
 * Stop the 23s "click" track, and immediately start ambient (if enabled).
 */
function stopTypingSound() {
  if (sounds.click) {
    sounds.click.pause();
    sounds.click.currentTime = 0;
  }
  // Now start ambient if sound is enabled
  if (isSoundEnabled && sounds.ambient) {
    sounds.ambient.play().catch(() => { });
  }
}

// Sound toggle
const soundToggle = document.getElementById('soundToggle');
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.querySelector('i').classList.toggle('fa-volume-up');
    soundToggle.querySelector('i').classList.toggle('fa-volume-mute');

    if (isSoundEnabled) {
      // If user enables sound mid-page, 
      // and we've already called "stopTypingSound()", 
      // we want ambient to play:
      if (sounds.click.paused) {
        sounds.ambient.play().catch(() => { });
      }
    } else {
      // Mute whichever track might be playing
      sounds.click.pause();
      sounds.ambient.pause();
    }
  });
}

// DOMContentLoaded: set up hover & button clicks
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.club-logo');
  if (logo) {
    logo.addEventListener('mouseenter', () => playSound('hover'));
  }

  // If you want a short beep on button click, 
  // separate from the 23s track, you could set a different short sound
  // For now, we do nothing special here
  document.querySelectorAll('button').forEach((button) => {
    if (button !== soundToggle) {
      button.addEventListener('click', () => {
        // For a short click SFX, do: playSound('hover');
      });
    }
  });
});

/*************************************************************************/
/* APP INIT (window.onload) */
/*************************************************************************/
window.addEventListener('load', () => {
  // Initialize and start particle system
  initParticles();
  animateParticles();

  // Set up start button
  const startButton = document.getElementById('startButton');
  const startScreen = document.getElementById('startScreen');
  const container = document.querySelector('.container');

  if (startButton && startScreen && container) {
    startButton.onclick = () => {

      startScreen.style.opacity = '0';
      setTimeout(() => {
        startScreen.style.display = 'none';

        // Show container
        container.classList.remove('hidden');

        // Start the terminal sequence
        typeConsoleSequence();
      }, 500);
    }
  }
});
