// Lucy AI Goddess Matrix Engine v3 - Poster-Accurate Green/Red/Gold System
(function() {
  'use strict';

  const canvas = document.getElementById('matrix');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  // Matrix configuration - Mixed HEX + binary + AI goddess sigils
  const fontSize = 14;
  const columns = Math.floor(width / fontSize);
  const drops = Array(columns).fill(1);
  const chars = '0123456789ABCDEF01◊◆○●◇✶✴✧✦¤☉☼ルシーLUCY';
  
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
  let glowPhase = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function getCharColor(x, y, glowIntensity) {
    const rand = Math.random();
    
    if (glowIntensity > 0.3) {
      return `rgba(251, 191, 36, ${0.5 + glowIntensity * 0.5})`;
    } else if (rand < 0.6) {
      const alpha = 0.3 + Math.random() * 0.5;
      return `rgba(0, 255, 100, ${alpha})`;
    } else if (rand < 0.85) {
      const alpha = 0.2 + Math.random() * 0.4;
      return `rgba(255, 50, 50, ${alpha})`;
    } else {
      const alpha = 0.4 + Math.random() * 0.4;
      return `rgba(251, 191, 36, ${alpha})`;
    }
  }

  function getShadowColor(baseColor) {
    if (baseColor.includes('251, 191, 36')) {
      return 'rgba(251, 191, 36, 0.8)';
    } else if (baseColor.includes('255, 50, 50')) {
      return 'rgba(255, 50, 50, 0.6)';
    } else {
      return 'rgba(0, 255, 100, 0.5)';
    }
  }

  function drawMatrix() {
    glowPhase += 0.02;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, width, height);

    const speedMultiplier = 1 + (mouseSpeed * 0.02);

    ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      
      const dropX = i * fontSize;
      const dropY = drops[i] * fontSize;
      
      const distFromMouse = Math.hypot(dropX - mouseX, dropY - mouseY);
      const glowIntensity = Math.max(0, 1 - distFromMouse / 200);

      const charColor = getCharColor(dropX, dropY, glowIntensity);
      ctx.fillStyle = charColor;
      
      if (glowIntensity > 0.2 || Math.random() > 0.9) {
        ctx.shadowColor = getShadowColor(charColor);
        ctx.shadowBlur = 8 + glowIntensity * 15;
      } else {
        ctx.shadowBlur = 2;
        ctx.shadowColor = getShadowColor(charColor);
      }

      ctx.fillText(char, dropX, dropY);
      ctx.shadowBlur = 0;

      const resetChance = scrollBurst > 0 ? 0.98 : 0.975;
      if (drops[i] * fontSize > height && Math.random() > resetChance) {
        drops[i] = 0;
      }

      const burstMult = 1 + scrollBurst * 0.5;
      drops[i] += speedMultiplier * burstMult * (0.5 + Math.random() * 0.5);
    }

    drawExplosions();
    drawLucyWord();

    if (Math.random() > 0.995) {
      spawnGoldenGlyph();
    }

    if (scrollBurst > 0) scrollBurst -= 0.1;

    requestAnimationFrame(drawMatrix);
  }

  function spawnGoldenGlyph() {
    const glyphs = ['◊', '◆', '✶', '✴', '✧', '☉', '☼', 'L', 'U', 'C', 'Y'];
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    const x = Math.random() * width;
    const y = Math.random() * height;
    
    explosionParticles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: -1 - Math.random() * 2,
      char: glyph,
      alpha: 1,
      size: 20 + Math.random() * 15,
      isGolden: true
    });
  }

  function drawExplosions() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
      const p = explosionParticles[i];
      
      if (p.isGolden) {
        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
      } else {
        const colorRand = Math.random();
        if (colorRand < 0.5) {
          ctx.fillStyle = `rgba(0, 255, 100, ${p.alpha})`;
          ctx.shadowColor = 'rgba(0, 255, 100, 0.8)';
        } else if (colorRand < 0.8) {
          ctx.fillStyle = `rgba(255, 50, 50, ${p.alpha})`;
          ctx.shadowColor = 'rgba(255, 50, 50, 0.8)';
        } else {
          ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
          ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        }
      }
      
      ctx.shadowBlur = 15;
      ctx.font = `${p.size}px "IBM Plex Mono", monospace`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.shadowBlur = 0;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.alpha -= 0.015;
      p.size *= 0.99;

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
        size: 14 + Math.random() * 12,
        isGolden: Math.random() > 0.7
      });
    }
  }

  function drawLucyWord() {
    if (!isLucyAnimating) return;

    for (let i = lucyWordParticles.length - 1; i >= 0; i--) {
      const p = lucyWordParticles[i];
      
      ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
      ctx.shadowColor = 'rgba(251, 191, 36, 1)';
      ctx.shadowBlur = 25;
      ctx.font = `bold ${p.size}px "Cormorant Garamond", serif`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.shadowBlur = 0;

      p.x += (p.targetX - p.x) * 0.06;
      p.y += (p.targetY - p.y) * 0.06;
      
      if (p.phase === 'gather') {
        p.size = Math.min(p.size + 0.8, 80);
        if (Math.abs(p.x - p.targetX) < 5 && Math.abs(p.y - p.targetY) < 5) {
          p.phase = 'hold';
          p.holdTime = 90;
        }
      } else if (p.phase === 'hold') {
        p.size = 80 + Math.sin(Date.now() * 0.01) * 5;
        p.holdTime--;
        if (p.holdTime <= 0) {
          p.phase = 'fade';
        }
      } else if (p.phase === 'fade') {
        p.alpha -= 0.015;
        p.size *= 1.02;
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
    const spacing = 70;
    const startX = centerX - ((word.length - 1) * spacing) / 2;

    for (let i = 0; i < word.length; i++) {
      const edge = Math.floor(Math.random() * 4);
      let startPosX, startPosY;
      
      switch(edge) {
        case 0:
          startPosX = Math.random() * width;
          startPosY = -50;
          break;
        case 1:
          startPosX = width + 50;
          startPosY = Math.random() * height;
          break;
        case 2:
          startPosX = Math.random() * width;
          startPosY = height + 50;
          break;
        default:
          startPosX = -50;
          startPosY = Math.random() * height;
      }

      lucyWordParticles.push({
        char: word[i],
        x: startPosX,
        y: startPosY,
        targetX: startX + i * spacing,
        targetY: centerY,
        size: 30,
        alpha: 1,
        phase: 'gather',
        holdTime: 0
      });
    }

    createExplosion(centerX, centerY, 50);
  }

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
    if (e.target.closest('button, input, a, form, textarea, [role="button"], [data-radix-popper-content-wrapper]')) return;
    createExplosion(e.clientX, e.clientY, 25);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.target.closest('input, textarea')) {
      createExplosion(width / 2, height / 2, 60);
    }
  });

  window.addEventListener('lucy-response', () => {
    triggerLucyWord();
    createExplosion(width / 2, height / 2, 45);
  });

  requestAnimationFrame(drawMatrix);

  window.triggerLucyAnimation = triggerLucyWord;
  window.triggerLucyExplosion = (x, y) => createExplosion(x || width/2, y || height/2, 35);
})();
