// Lucy AI Matrix Engine - Interactive Binary Rain System
(function() {
  'use strict';

  const canvas = document.getElementById('matrix');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  // Matrix configuration
  const fontSize = 14;
  const columns = Math.floor(width / fontSize);
  const drops = Array(columns).fill(1);
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  
  // Animation state
  let mouseX = 0;
  let mouseY = 0;
  let mouseSpeed = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let scrollBurst = 0;
  let explosionParticles = [];
  let lucyWordParticles = [];
  let isLucyAnimating = false;

  // Colors
  const primaryColor = 'rgba(168, 85, 247, 0.8)'; // Purple
  const secondaryColor = 'rgba(236, 72, 153, 0.6)'; // Pink
  const goldenColor = 'rgba(251, 191, 36, 1)'; // Gold for LUCY

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function drawMatrix() {
    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Adjust speed based on mouse movement
    const speedMultiplier = 1 + (mouseSpeed * 0.02);
    const brightnessMult = Math.min(1, 0.5 + mouseSpeed * 0.05);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = chars[Math.floor(Math.random() * chars.length)];
      
      // Distance from mouse for glow effect
      const dropX = i * fontSize;
      const dropY = drops[i] * fontSize;
      const distFromMouse = Math.hypot(dropX - mouseX, dropY - mouseY);
      const glowIntensity = Math.max(0, 1 - distFromMouse / 200);

      // Color based on position and mouse proximity
      if (glowIntensity > 0.3) {
        ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + glowIntensity * 0.5})`;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 10 * glowIntensity;
      } else if (Math.random() > 0.5) {
        ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + brightnessMult * 0.5})`;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = `rgba(236, 72, 153, ${0.2 + brightnessMult * 0.4})`;
        ctx.shadowColor = 'rgba(236, 72, 153, 0.4)';
        ctx.shadowBlur = 3;
      }

      ctx.fillText(char, dropX, dropY);
      ctx.shadowBlur = 0;

      // Reset drop with scroll burst consideration
      const resetChance = scrollBurst > 0 ? 0.98 : 0.975;
      if (drops[i] * fontSize > height && Math.random() > resetChance) {
        drops[i] = 0;
      }

      // Speed varies with mouse speed
      drops[i] += speedMultiplier * (0.5 + Math.random() * 0.5);
    }

    // Draw explosion particles
    drawExplosions();
    
    // Draw LUCY word animation
    drawLucyWord();

    // Decay scroll burst
    if (scrollBurst > 0) scrollBurst -= 0.1;
  }

  function drawExplosions() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
      const p = explosionParticles[i];
      
      ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
      ctx.shadowBlur = 15;
      ctx.font = `${p.size}px monospace`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.shadowBlur = 0;

      // Update particle
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.alpha -= 0.02;
      p.size *= 0.98;

      if (p.alpha <= 0) {
        explosionParticles.splice(i, 1);
      }
    }
  }

  function createExplosion(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      explosionParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        char: chars[Math.floor(Math.random() * chars.length)],
        alpha: 1,
        size: 14 + Math.random() * 10
      });
    }
  }

  function drawLucyWord() {
    if (!isLucyAnimating) return;

    for (let i = lucyWordParticles.length - 1; i >= 0; i--) {
      const p = lucyWordParticles[i];
      
      // Golden glow effect
      ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
      ctx.shadowColor = 'rgba(251, 191, 36, 1)';
      ctx.shadowBlur = 20;
      ctx.font = `bold ${p.size}px "Cormorant Garamond", serif`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.shadowBlur = 0;

      // Animate towards target
      p.x += (p.targetX - p.x) * 0.05;
      p.y += (p.targetY - p.y) * 0.05;
      
      if (p.phase === 'gather') {
        p.size = Math.min(p.size + 0.5, 72);
        if (Math.abs(p.x - p.targetX) < 5 && Math.abs(p.y - p.targetY) < 5) {
          p.phase = 'hold';
          p.holdTime = 60;
        }
      } else if (p.phase === 'hold') {
        p.holdTime--;
        if (p.holdTime <= 0) {
          p.phase = 'fade';
        }
      } else if (p.phase === 'fade') {
        p.alpha -= 0.02;
        if (p.alpha <= 0) {
          lucyWordParticles.splice(i, 1);
        }
      }
    }

    if (lucyWordParticles.length === 0) {
      isLucyAnimating = false;
    }
  }

  function triggerLucyWord() {
    if (isLucyAnimating) return;
    isLucyAnimating = true;
    lucyWordParticles = [];

    const word = 'LUCY';
    const centerX = width / 2;
    const centerY = height / 2;
    const spacing = 60;
    const startX = centerX - ((word.length - 1) * spacing) / 2;

    for (let i = 0; i < word.length; i++) {
      lucyWordParticles.push({
        char: word[i],
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: startX + i * spacing,
        targetY: centerY,
        size: 20,
        alpha: 1,
        phase: 'gather',
        holdTime: 0
      });
    }
  }

  // Event listeners
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseSpeed = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  });

  window.addEventListener('scroll', () => {
    scrollBurst = Math.min(scrollBurst + 2, 5);
  });

  window.addEventListener('click', (e) => {
    // Don't create explosion if clicking on UI elements
    if (e.target.closest('button, input, a, form, [role="button"]')) return;
    createExplosion(e.clientX, e.clientY, 20);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.target.closest('input, textarea')) {
      createExplosion(width / 2, height / 2, 50);
    }
  });

  // Global hook for Lucy responses
  window.addEventListener('lucy-response', () => {
    triggerLucyWord();
    createExplosion(width / 2, height / 2, 40);
  });

  // Animation loop
  function animate() {
    drawMatrix();
    requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  // Expose trigger function globally
  window.triggerLucyAnimation = triggerLucyWord;
})();
