// Procedural canvas portraits for the initiative tower and corner panels.
// Stylized, original, and deliberately simple enough to read at 46 px.

const cache = new Map();

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const SCHEMES = {
  warden: { bg1: '#3c3020', bg2: '#0d1214', accent: '#c9a227', skin: '#c99a76', cloth: '#7c2f2f' },
  shield: { bg1: '#23343c', bg2: '#0c1012', accent: '#9d7d39', skin: '#a97c5d', cloth: '#2f4b58' },
  ranger: { bg1: '#26351f', bg2: '#0a0f0a', accent: '#9bc24b', skin: '#b08a66', cloth: '#3d5539' },
  pyromancer: { bg1: '#3b2418', bg2: '#100a0a', accent: '#ff7a24', skin: '#c79a7c', cloth: '#3a2a3f' },
  priest: { bg1: '#3a3324', bg2: '#0f0f0c', accent: '#ffe7a8', skin: '#caa182', cloth: '#d8cdb2' },
  brigand: { bg1: '#382719', bg2: '#0e0b08', accent: '#a85b3c', skin: '#b98d68', cloth: '#5a3b26' },
  crossbow: { bg1: '#2a2e30', bg2: '#0a0c0d', accent: '#9aa4ae', skin: '#a9805f', cloth: '#2c3438' },
  ghoul: { bg1: '#2c3a2c', bg2: '#090d09', accent: '#b7e05a', skin: '#7f8f78', cloth: '#3e493e' },
  lurker: { bg1: '#243424', bg2: '#080d08', accent: '#c8e46a', skin: '#536b4e', cloth: '#2d3a2c' },
  cultist: { bg1: '#3a1519', bg2: '#0e0607', accent: '#d24c3d', skin: '#8f7a6a', cloth: '#4b2328' },
  marsharcher: { bg1: '#263321', bg2: '#080c07', accent: '#9bc24b', skin: '#9d8a66', cloth: '#394a32' },
  skeleton: { bg1: '#2d3230', bg2: '#0b0d0d', accent: '#8fe7d4', skin: '#d8d0b6', cloth: '#4a473e' },
  adept: { bg1: '#25253a', bg2: '#08080e', accent: '#8fe7d4', skin: '#cfc6a8', cloth: '#2f2b3a' },
  king: { bg1: '#232735', bg2: '#060608', accent: '#8fe7d4', skin: '#cfc6a8', cloth: '#1e2028' },
};

function drawBackground(ctx, scheme) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, scheme.bg1);
  gradient.addColorStop(1, scheme.bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 160);

  const glow = ctx.createRadialGradient(64, 44, 4, 64, 44, 70);
  glow.addColorStop(0, `${scheme.accent}40`);
  glow.addColorStop(0.55, `${scheme.accent}10`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 160);

  // Dust motes.
  let seed = 17;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < 22; i += 1) {
    ctx.fillStyle = `rgba(240,225,190,${0.02 + rand() * 0.09})`;
    ctx.beginPath();
    ctx.arc(rand() * 128, rand() * 160, 0.5 + rand() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShoulders(ctx, scheme, wide = 1) {
  const g = ctx.createLinearGradient(0, 100, 0, 160);
  g.addColorStop(0, scheme.cloth);
  g.addColorStop(1, '#070708');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(4, 160);
  ctx.quadraticCurveTo(10, 112, 42 * wide, 102);
  ctx.quadraticCurveTo(64, 96, 86 * wide, 102);
  ctx.quadraticCurveTo(118, 112, 124, 160);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `${scheme.accent}55`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawNeck(ctx, scheme) {
  ctx.fillStyle = scheme.skin;
  ctx.beginPath();
  ctx.moveTo(54, 88);
  ctx.lineTo(74, 88);
  ctx.lineTo(77, 110);
  ctx.lineTo(51, 110);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(54, 98, 20, 10);
}

function drawFace(ctx, scheme, opts = {}) {
  const skin = scheme.skin;
  const grad = ctx.createLinearGradient(40, 40, 92, 105);
  grad.addColorStop(0, '#d9b496');
  grad.addColorStop(0.45, skin);
  grad.addColorStop(1, 'rgba(18,12,10,0.92)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(64, 68, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sculpted side shadow: the light comes from the upper left.
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(64, 68, 22, 28, 0, 0, Math.PI * 2);
  ctx.clip();
  const side = ctx.createLinearGradient(42, 44, 88, 100);
  side.addColorStop(0, 'rgba(255,240,210,0.10)');
  side.addColorStop(0.5, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = side;
  ctx.fillRect(40, 38, 50, 62);
  ctx.restore();

  // Brow shadow and eye sockets.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(64, 55, 19, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheekbones.
  ctx.fillStyle = 'rgba(255,230,200,0.07)';
  ctx.beginPath();
  ctx.ellipse(50, 73, 5, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(78, 73, 5, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Nose.
  ctx.fillStyle = 'rgba(60,34,26,0.45)';
  ctx.beginPath();
  ctx.moveTo(64, 61);
  ctx.lineTo(60, 77);
  ctx.lineTo(67, 78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,230,200,0.12)';
  ctx.fillRect(63, 62, 1.4, 12);

  // Mouth: thin, slightly downturned.
  ctx.strokeStyle = 'rgba(50,22,20,0.75)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(57, 86);
  ctx.quadraticCurveTo(64, 88, 71, 86);
  ctx.stroke();

  const eyeColor = opts.eye || scheme.accent;
  const eyeY = opts.eyeY ?? 66;
  for (const x of [55, 73]) {
    // Deep socket.
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.beginPath();
    ctx.ellipse(x, eyeY, 6.2, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!opts.hollow) {
      // Sclera kept dim so the portrait reads as oil paint, not cartoon.
      ctx.fillStyle = 'rgba(186,172,148,0.5)';
      ctx.beginPath();
      ctx.ellipse(x, eyeY + 0.4, 4.6, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x, eyeY + 0.6, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(8,8,7,0.95)';
      ctx.beginPath();
      ctx.arc(x, eyeY + 0.6, 1.05, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (opts.brow !== false) {
    ctx.strokeStyle = 'rgba(30,20,14,0.9)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(47, 59);
    ctx.lineTo(61, 62.5);
    ctx.moveTo(81, 59);
    ctx.lineTo(67, 62.5);
    ctx.stroke();
  }
}

function drawHood(ctx, color, rim = '#9bc24b') {
  const g = ctx.createLinearGradient(30, 20, 96, 110);
  g.addColorStop(0, rim);
  g.addColorStop(0.18, color);
  g.addColorStop(1, '#080a08');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(64, 16);
  ctx.quadraticCurveTo(103, 36, 100, 92);
  ctx.quadraticCurveTo(92, 118, 64, 120);
  ctx.quadraticCurveTo(36, 118, 28, 92);
  ctx.quadraticCurveTo(25, 36, 64, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.ellipse(64, 72, 24, 31, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLongHair(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(42, 40);
  ctx.quadraticCurveTo(34, 80, 38, 120);
  ctx.quadraticCurveTo(48, 108, 50, 76);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(86, 40);
  ctx.quadraticCurveTo(94, 80, 90, 120);
  ctx.quadraticCurveTo(80, 108, 78, 76);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(64, 38, 28, 18, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

function drawHelmet(ctx) {
  const g = ctx.createLinearGradient(34, 20, 92, 80);
  g.addColorStop(0, '#c3ccd3');
  g.addColorStop(0.5, '#6d777f');
  g.addColorStop(1, '#2c3237');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(64, 22);
  ctx.quadraticCurveTo(102, 34, 95, 76);
  ctx.lineTo(84, 72);
  ctx.quadraticCurveTo(84, 40, 64, 36);
  ctx.quadraticCurveTo(44, 40, 44, 72);
  ctx.lineTo(33, 76);
  ctx.quadraticCurveTo(26, 34, 64, 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9aa4ab';
  ctx.fillRect(60, 30, 8, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(44, 30, 4, 20);
}

function drawCrown(ctx, color = '#b08a3e') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(44, 32);
  ctx.lineTo(50, 12);
  ctx.lineTo(58, 26);
  ctx.lineTo(64, 8);
  ctx.lineTo(70, 26);
  ctx.lineTo(78, 12);
  ctx.lineTo(84, 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,235,180,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSkull(ctx) {
  const g = ctx.createLinearGradient(38, 34, 92, 102);
  g.addColorStop(0, '#e7e0c8');
  g.addColorStop(0.65, '#c9c0a2');
  g.addColorStop(1, '#7a725a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(64, 62, 27, 31, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(48, 82);
  ctx.lineTo(80, 82);
  ctx.lineTo(72, 108);
  ctx.lineTo(56, 108);
  ctx.closePath();
  ctx.fill();

  // Sockets.
  ctx.fillStyle = '#0a0c0b';
  ctx.beginPath();
  ctx.ellipse(53, 61, 8, 9, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(75, 61, 8, 9, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(143,231,212,0.9)';
  ctx.beginPath();
  ctx.arc(53, 62, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(75, 62, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Nose cavity and teeth.
  ctx.fillStyle = '#141512';
  ctx.beginPath();
  ctx.moveTo(64, 68);
  ctx.lineTo(59, 78);
  ctx.lineTo(69, 78);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,38,30,0.8)';
  ctx.lineWidth = 1;
  for (let x = 52; x <= 78; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x, 86);
    ctx.lineTo(x, 96);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(48, 86);
  ctx.quadraticCurveTo(64, 82, 80, 86);
  ctx.stroke();

  // Crack.
  ctx.strokeStyle = 'rgba(40,38,30,0.6)';
  ctx.beginPath();
  ctx.moveTo(84, 42);
  ctx.lineTo(78, 50);
  ctx.lineTo(82, 57);
  ctx.stroke();
}

function drawBeast(ctx, scheme, kind) {
  const g = ctx.createLinearGradient(30, 38, 100, 112);
  g.addColorStop(0, scheme.skin);
  g.addColorStop(1, '#1c241c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(64, 82, kind === 'lurker' ? 38 : 30, kind === 'lurker' ? 30 : 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wide jaw.
  ctx.beginPath();
  ctx.ellipse(64, 100, 26, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(20,24,18,0.8)';
  ctx.fill();
  ctx.fillStyle = '#ded6b8';
  for (let i = 0; i < 6; i += 1) {
    const x = 44 + i * 8;
    ctx.beginPath();
    ctx.moveTo(x, 98);
    ctx.lineTo(x + 3, 108);
    ctx.lineTo(x + 6, 98);
    ctx.closePath();
    ctx.fill();
  }

  // Eyes.
  const eyeY = kind === 'lurker' ? 66 : 70;
  for (const x of kind === 'lurker' ? [48, 80] : [54, 74]) {
    ctx.fillStyle = '#10140c';
    ctx.beginPath();
    ctx.ellipse(x, eyeY, kind === 'lurker' ? 11 : 8, kind === 'lurker' ? 9 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = scheme.accent;
    ctx.beginPath();
    ctx.ellipse(x, eyeY, kind === 'lurker' ? 5 : 3.5, kind === 'lurker' ? 6 : 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0d08';
    ctx.fillRect(x - (kind === 'lurker' ? 1.5 : 1), eyeY - 5, kind === 'lurker' ? 3 : 2, kind === 'lurker' ? 10 : 8);
  }

  // Gills / tendrils.
  if (kind === 'lurker') {
    ctx.strokeStyle = 'rgba(30,50,30,0.8)';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(34 + i * 3, 74 + i * 6);
      ctx.quadraticCurveTo(18, 90 + i * 8, 26, 118 + i * 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(94 - i * 3, 74 + i * 6);
      ctx.quadraticCurveTo(110, 90 + i * 8, 102, 118 + i * 5);
      ctx.stroke();
    }
  }
}

export function createPortraitURL(key, size = 128) {
  const cacheKey = `${key}:${size}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const scheme = SCHEMES[key] || SCHEMES.warden;
  const canvas = document.createElement('canvas');
  // Render at 2x so the large corner medallions stay crisp on high-DPI screens.
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  drawBackground(ctx, scheme);

  if (key === 'ghoul') {
    drawShoulders(ctx, scheme, 1.05);
    drawBeast(ctx, scheme, 'ghoul');
    // Sunken cheeks and wisps.
    ctx.strokeStyle = 'rgba(20,30,20,0.55)';
    ctx.beginPath();
    ctx.moveTo(38, 80);
    ctx.quadraticCurveTo(50, 94, 42, 108);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(90, 80);
    ctx.quadraticCurveTo(78, 94, 86, 108);
    ctx.stroke();
  } else if (key === 'lurker') {
    drawShoulders(ctx, scheme, 1.2);
    drawBeast(ctx, scheme, 'lurker');
  } else if (key === 'skeleton' || key === 'adept' || key === 'king') {
    drawShoulders(ctx, scheme, key === 'king' ? 1.2 : 1);
    if (key !== 'skeleton') {
      drawHood(ctx, key === 'king' ? '#1b1e28' : scheme.cloth, scheme.accent);
    }
    drawSkull(ctx);
    if (key === 'king') {
      drawCrown(ctx);
      // Ghost-fire eyes.
      ctx.fillStyle = 'rgba(143,231,212,0.9)';
      ctx.beginPath();
      ctx.arc(53, 60, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(75, 60, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (key === 'adept') {
      ctx.strokeStyle = 'rgba(143,231,212,0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(34, 32);
      ctx.quadraticCurveTo(22, 12, 40, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(94, 32);
      ctx.quadraticCurveTo(106, 12, 88, 8);
      ctx.stroke();
    }
  } else if (key === 'cultist' || key === 'ranger' || key === 'marsharcher' || key === 'pyromancer' || key === 'priest') {
    drawShoulders(ctx, scheme);
    drawHood(ctx, key === 'priest' ? '#d8cdb2' : scheme.cloth, scheme.accent);
    drawFace(ctx, scheme, {
      eye: scheme.accent,
      eyeY: 70,
      brow: key === 'cultist' ? false : true,
      hollow: key === 'cultist',
    });
    if (key === 'pyromancer') {
      const g = ctx.createLinearGradient(0, 120, 0, 40);
      g.addColorStop(0, 'rgba(255,122,36,0.85)');
      g.addColorStop(1, 'rgba(255,122,36,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(20, 150);
      ctx.quadraticCurveTo(30, 90, 24, 50);
      ctx.quadraticCurveTo(44, 104, 40, 150);
      ctx.fill();
    }
    if (key === 'priest') {
      const halo = ctx.createRadialGradient(64, 22, 2, 64, 22, 30);
      halo.addColorStop(0, 'rgba(255,231,168,0.55)');
      halo.addColorStop(1, 'rgba(255,231,168,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(24, 0, 80, 60);
      ctx.strokeStyle = '#b08a3e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(64, 32, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (key === 'cultist') {
      drawHorns(ctx);
    }
    if (key === 'ranger' || key === 'marsharcher') {
      ctx.fillStyle = 'rgba(10,14,10,0.6)';
      ctx.beginPath();
      ctx.ellipse(64, 80, 22, 19, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#8a7040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 110, 30, -1.2, 1.2);
      ctx.stroke();
    }
  } else if (key === 'crossbow' || key === 'brigand' || key === 'shield') {
    drawShoulders(ctx, scheme, key === 'shield' ? 1.2 : 1);
    drawNeck(ctx, scheme);
    drawFace(ctx, scheme, { eye: scheme.accent, eyeY: 67 });
    if (key === 'crossbow') {
      drawHelmet(ctx);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(64, 48, 20, 34);
      ctx.strokeStyle = '#9aa4ab';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(86, 122);
      ctx.lineTo(104, 84);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(94, 100);
      ctx.lineTo(114, 96);
      ctx.stroke();
    } else if (key === 'brigand') {
      ctx.fillStyle = '#3a2a1c';
      ctx.beginPath();
      ctx.ellipse(64, 40, 29, 15, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8f2b2b';
      ctx.fillRect(38, 42, 52, 6);
      ctx.strokeStyle = 'rgba(120,60,40,0.8)';
      ctx.beginPath();
      ctx.moveTo(76, 50);
      ctx.lineTo(84, 64);
      ctx.stroke();
    } else {
      drawHelmet(ctx);
      ctx.fillStyle = 'rgba(20,28,24,0.75)';
      ctx.beginPath();
      ctx.moveTo(46, 88);
      ctx.quadraticCurveTo(64, 108, 84, 90);
      ctx.quadraticCurveTo(64, 100, 46, 88);
      ctx.fill();
      ctx.fillStyle = '#9d7d39';
      ctx.fillRect(54, 111, 20, 4);
    }
  } else {
    drawShoulders(ctx, scheme, 1.05);
    drawNeck(ctx, scheme);
    drawFace(ctx, scheme, { eye: scheme.accent, eyeY: 67 });
    drawLongHair(ctx, '#b98d58');
    drawHelmet(ctx);
    ctx.fillStyle = '#9d7d39';
    ctx.beginPath();
    ctx.moveTo(60, 36);
    ctx.lineTo(64, 20);
    ctx.lineTo(68, 36);
    ctx.closePath();
    ctx.fill();
  }

  // Universal painterly pass: warm key light, cool shadow, grain, vignette.
  const paint = ctx.createLinearGradient(0, 0, 128, 160);
  paint.addColorStop(0, 'rgba(255, 214, 150, 0.16)');
  paint.addColorStop(0.45, 'rgba(255, 214, 150, 0)');
  paint.addColorStop(1, 'rgba(24, 34, 40, 0.28)');
  ctx.fillStyle = paint;
  ctx.fillRect(0, 0, 128, 160);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const pool = ctx.createRadialGradient(44, 38, 4, 44, 38, 92);
  pool.addColorStop(0, 'rgba(255, 232, 190, 0.22)');
  pool.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, 128, 160);
  ctx.restore();

  // Sparse deterministic grain so the portraits read as painted canvas.
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000';
  for (let i = 0; i < 220; i += 1) {
    const gx = (i * 37) % 128;
    const gy = (i * 61) % 160;
    ctx.fillRect(gx, gy, 1, 1);
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(64, 70, 30, 64, 80, 94);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.72, 'rgba(0,0,0,0.22)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 128, 160);

  ctx.strokeStyle = `${scheme.accent}55`;
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 124, 156);

  const url = canvas.toDataURL('image/png');
  cache.set(cacheKey, url);
  return url;
}

function drawHorns(ctx) {
  ctx.strokeStyle = '#2a1a1a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(42, 32);
  ctx.quadraticCurveTo(24, 12, 30, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(86, 32);
  ctx.quadraticCurveTo(104, 12, 98, 4);
  ctx.stroke();
  ctx.lineCap = 'butt';
}
