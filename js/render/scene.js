// Canvas 2D battlefield renderer.
//
// Deliberately avoids WebGL: the prototype must open on any browser,
// including machines with hardware acceleration disabled. The battlefield is
// painted in a pseudo-perspective ("2.5D") style close to the Disciples II
// reference screenshots: a deep horizon, two ranks per side, large readable
// silhouettes, rim light, ground fog and projectile / spell effects.
//
// The renderer is presentation-only. It never mutates battle state.

const TAU = Math.PI * 2;

const THEMES = {
  ruins: {
    skyTop: '#0b0c12',
    skyMid: '#38281f',
    skyLow: '#a9663a',
    sun: '#ffb65e',
    sunX: 0.22,
    sunY: 0.3,
    groundTop: '#3b2a1d',
    groundMid: '#57402a',
    groundLow: '#17120e',
    groundLight: '#b98b55',
    fog: '#b88d5f',
    accent: '#e0a34a',
    ember: '#ff9a3c',
    mist: 'rgba(190,150,105,0.12)',
    props: 'ruins',
    ridge: '#0d0a09',
    wind: 1,
  },
  marsh: {
    skyTop: '#101712',
    skyMid: '#2e3b2c',
    skyLow: '#8d9a63',
    sun: '#d9e6a4',
    sunX: 0.74,
    sunY: 0.33,
    groundTop: '#33402e',
    groundMid: '#4c5a38',
    groundLow: '#151d16',
    groundLight: '#87906a',
    fog: '#a9b88c',
    accent: '#9bc24b',
    ember: '#b8e05a',
    mist: 'rgba(150,175,130,0.13)',
    props: 'marsh',
    ridge: '#101610',
    wind: 0.6,
  },
  cathedral: {
    skyTop: '#0d0d16',
    skyMid: '#2b2734',
    skyLow: '#75656a',
    sun: '#b9d9e3',
    sunX: 0.62,
    sunY: 0.3,
    groundTop: '#2f2e33',
    groundMid: '#46434a',
    groundLow: '#151519',
    groundLight: '#8a8580',
    fog: '#a7acb5',
    accent: '#8fe7d4',
    ember: '#8fe7d4',
    mist: 'rgba(160,175,190,0.1)',
    props: 'cathedral',
    ridge: '#0c0c13',
    wind: 0.35,
  },
};

const ART = {
  knight: {
    skin: '#a87c59', cloth: '#6f2525', metal: '#70777a', metalDark: '#2c3032',
    accent: '#d8b35c', weapon: 'sword', shield: true, cape: true, helmet: true,
  },
  shield: {
    skin: '#9c7453', cloth: '#2c4754', metal: '#666f74', metalDark: '#282e31',
    accent: '#c8a45a', weapon: 'hammer', shield: true, cape: false, helmet: true, bulky: true,
  },
  archer: {
    skin: '#9c7652', cloth: '#3d5534', metal: '#56634b', metalDark: '#20261c',
    accent: '#9bc24b', weapon: 'bow', shield: false, cape: true, hood: true,
  },
  mage: {
    skin: '#a67d5c', cloth: '#34263a', metal: '#63523c', metalDark: '#1d1723',
    accent: '#ff8a3c', weapon: 'staff', shield: false, cape: false, hood: true, glow: '#ff7a24',
  },
  priest: {
    skin: '#b08a6b', cloth: '#d8cdb2', metal: '#a88244', metalDark: '#403a2b',
    accent: '#ffe7a8', weapon: 'censer', shield: false, cape: false, hood: true, glow: '#ffe7a8',
  },
  brigand: {
    skin: '#956b4a', cloth: '#51351f', metal: '#5c5042', metalDark: '#241d16',
    accent: '#a85b3c', weapon: 'axe', shield: false, cape: false, hood: true,
  },
  crossbow: {
    skin: '#8f6b4e', cloth: '#272f33', metal: '#80878d', metalDark: '#202528',
    accent: '#9aa4ae', weapon: 'crossbow', shield: false, cape: false, hood: true,
  },
  ghoul: {
    skin: '#6d8066', cloth: '#374237', metal: '#4f594b', metalDark: '#181e18',
    accent: '#b7e05a', weapon: 'claws', shield: false, cape: false, hood: false, undead: true,
  },
  lurker: {
    skin: '#465c43', cloth: '#283427', metal: '#3b5034', metalDark: '#121a11',
    accent: '#c8e46a', weapon: 'claws', shield: false, cape: false, hood: false, beast: true,
    glow: '#b7e05a',
  },
  cultist: {
    skin: '#7c6a5b', cloth: '#421e23', metal: '#5e3f31', metalDark: '#1a0d0f',
    accent: '#d24c3d', weapon: 'staff', shield: false, cape: true, hood: true, glow: '#ff4a35',
  },
  skeleton: {
    skin: '#b8b09a', cloth: '#423f37', metal: '#615e53', metalDark: '#24221e',
    accent: '#8fe7d4', weapon: 'sword', shield: true, cape: false, helmet: true, undead: true,
  },
  adept: {
    skin: '#b3ab90', cloth: '#2a2734', metal: '#504958', metalDark: '#121116',
    accent: '#8fe7d4', weapon: 'staff', shield: false, cape: true, hood: true, undead: true,
    glow: '#8fe7d4',
  },
  king: {
    skin: '#b3ab90', cloth: '#1b1d24', metal: '#454a54', metalDark: '#0c0d11',
    accent: '#8fe7d4', weapon: 'greatsword', shield: false, cape: true, helmet: true,
    undead: true, tall: true, glow: '#8fe7d4',
  },
};

const UNIT_HEIGHT = 154;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

function lcg(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const c = a.map((value, index) => Math.round(lerp(value, b[index], t)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function tone(color, amount) {
  return amount >= 0 ? mix(color, '#ffffff', amount) : mix(color, '#000000', -amount);
}

function colorFrom(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `#${value.toString(16).padStart(6, '0')}`;
  return '#ffd8a0';
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rotation, 0, TAU);
}

/* ------------------------------------------------------------------ */
/* Background painting                                                 */
/* ------------------------------------------------------------------ */

function paintSky(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  const gradient = ctx.createLinearGradient(0, 0, 0, horizon + H * 0.08);
  gradient.addColorStop(0, theme.skyTop);
  gradient.addColorStop(0.58, theme.skyMid);
  gradient.addColorStop(0.9, theme.skyLow);
  gradient.addColorStop(1, theme.skyLow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, horizon + H * 0.08);

  // A break in the clouds where the low sun burns through.
  const sunX = W * theme.sunX;
  const sunY = H * theme.sunY;
  const glow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, W * 0.42);
  glow.addColorStop(0, rgba(theme.sun, 0.65));
  glow.addColorStop(0.22, rgba(theme.sun, 0.22));
  glow.addColorStop(1, rgba(theme.sun, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, horizon + H * 0.1);

  // A few cold stars survive above the smoke.
  for (let i = 0; i < 26; i += 1) {
    const sx = rand() * W;
    const sy = rand() * H * 0.2;
    ctx.fillStyle = `rgba(220, 226, 235, ${0.08 + rand() * 0.28})`;
    ellipse(ctx, sx, sy, 0.5 + rand() * 0.8, 0.5 + rand() * 0.8);
    ctx.fill();
  }

  // Layered storm clouds: broad, soft, horizontal.
  for (let layer = 0; layer < 5; layer += 1) {
    const yBase = H * (0.02 + layer * 0.072);
    const alpha = 0.17 - layer * 0.018;
    for (let i = 0; i < 18; i += 1) {
      const x = rand() * W;
      const y = yBase + rand() * H * 0.065;
      const rx = W * (0.035 + rand() * 0.18);
      const ry = H * (0.006 + rand() * 0.032);
      const cloud = ctx.createLinearGradient(x, y - ry, x, y + ry);
      cloud.addColorStop(0, `rgba(5, 5, 8, ${alpha + 0.06})`);
      cloud.addColorStop(0.55, `rgba(25, 18, 17, ${alpha})`);
      cloud.addColorStop(1, 'rgba(30, 22, 20, 0)');
      ctx.fillStyle = cloud;
      ellipse(ctx, x, y, rx, ry);
      ctx.fill();
      // A thin lit rim under the densest banks.
      if (layer > 1 && rand() > 0.62) {
        ctx.strokeStyle = rgba(theme.sun, 0.05 + rand() * 0.06);
        ctx.lineWidth = Math.max(0.6, H * 0.0012);
        ctx.beginPath();
        ctx.ellipse(x, y + ry * 0.72, rx * 0.86, ry * 0.55, 0, 0, Math.PI);
        ctx.stroke();
      }
    }
  }

  // Low, torn cloud bank catching the last light near the horizon.
  for (let i = 0; i < 9; i += 1) {
    const cx = W * (0.02 + i * 0.12 + rand() * 0.05);
    const cy = H * (0.16 + rand() * 0.12);
    const rx = W * (0.07 + rand() * 0.1);
    const ry = H * (0.008 + rand() * 0.016);
    const bank = ctx.createLinearGradient(cx, cy - ry * 3, cx, cy + ry * 2);
    bank.addColorStop(0, 'rgba(118, 89, 64, 0.12)');
    bank.addColorStop(0.45, 'rgba(62, 46, 38, 0.22)');
    bank.addColorStop(1, 'rgba(20, 15, 14, 0)');
    ctx.fillStyle = bank;
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy + ry);
    ctx.quadraticCurveTo(cx - rx * 0.3, cy - ry * 2.4, cx + rx * 0.15, cy - ry);
    ctx.quadraticCurveTo(cx + rx * 0.55, cy - ry * 2.6, cx + rx, cy + ry * 0.2);
    ctx.quadraticCurveTo(cx + rx * 0.4, cy + ry * 1.6, cx - rx, cy + ry);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(190, 140, 92, 0.08)';
    ctx.lineWidth = Math.max(0.6, H * 0.0012);
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.75, cy - ry * 0.2);
    ctx.quadraticCurveTo(cx, cy - ry * 1.8, cx + rx * 0.8, cy - ry * 0.1);
    ctx.stroke();
  }

  // Thin hot band right above the horizon.
  const band = ctx.createLinearGradient(0, horizon - H * 0.12, 0, horizon + 2);
  band.addColorStop(0, rgba(theme.sun, 0));
  band.addColorStop(0.7, rgba(theme.sun, 0.16));
  band.addColorStop(1, rgba(theme.sun, 0.42));
  ctx.fillStyle = band;
  ctx.fillRect(0, horizon - H * 0.12, W, H * 0.12);
}

function silhouetteSpikes(ctx, W, H, theme, rand, baseY, scale = 1) {
  ctx.fillStyle = theme.ridge;
  const step = W * 0.032;
  for (let x = -step; x < W + step; x += step) {
    const height = H * (0.012 + rand() * 0.055) * scale;
    const width = step * (0.45 + rand() * 0.7);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + width * 0.18, baseY - height * 0.3);
    ctx.lineTo(x + width * 0.45, baseY - height);
    ctx.lineTo(x + width * 0.62, baseY - height * 0.5);
    ctx.lineTo(x + width, baseY - height * (0.08 + rand() * 0.35));
    ctx.lineTo(x + width, baseY);
    ctx.closePath();
    ctx.fill();
  }
  // A softer second ridge behind the hard silhouette.
  ctx.fillStyle = rgba(theme.ridge, 0.45);
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= W; x += W * 0.05) {
    ctx.lineTo(x, baseY - H * (0.005 + rand() * 0.035));
  }
  ctx.lineTo(W, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawTower(ctx, x, baseY, w, h, color, rand) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, baseY);
  ctx.lineTo(x - w * 0.34, baseY - h * 0.9);
  ctx.lineTo(x - w * 0.42, baseY - h);
  ctx.lineTo(x - w * 0.2, baseY - h * 0.97);
  ctx.lineTo(x - w * 0.12, baseY - h * 0.86);
  ctx.lineTo(x + w * 0.24, baseY - h * 0.93);
  ctx.lineTo(x + w * 0.34, baseY - h * 0.78);
  ctx.lineTo(x + w * 0.5, baseY);
  ctx.closePath();
  ctx.fill();
  // Broken window slits.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 4; i += 1) {
    const wx = x - w * 0.18 + rand() * w * 0.3;
    const wy = baseY - h * (0.25 + rand() * 0.5);
    ctx.fillRect(wx, wy, Math.max(1, w * 0.05), Math.max(2, h * 0.06));
  }
}

function drawDeadTree(ctx, x, baseY, height, color, rand, flip = 1) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.2, height * 0.028);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + height * 0.05 * flip, baseY - height * 0.5, x + height * 0.14 * flip, baseY - height);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    const t = 0.36 + i * 0.11;
    const bx = x + height * 0.14 * flip * t * t;
    const by = baseY - height * t;
    const len = height * (0.13 + rand() * 0.18);
    const angle = (i % 2 ? 1 : -1) * (0.45 + rand() * 0.7);
    ctx.lineWidth = Math.max(1, height * 0.015 * (1 - t * 0.5));
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(angle) * len * flip,
      by - Math.sin(angle) * len * 0.6,
      bx + Math.cos(angle) * len * 1.6 * flip,
      by - Math.sin(angle) * len * 1.1,
    );
    ctx.stroke();
    if (i % 2 === 0) {
      const ex = bx + Math.cos(angle) * len * 1.6 * flip;
      const ey = by - Math.sin(angle) * len * 1.1;
      ctx.lineWidth = Math.max(0.8, height * 0.008);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex + len * 0.35 * flip, ey - len * 0.35);
      ctx.stroke();
    }
  }
}

function paintHorizon(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  silhouetteSpikes(ctx, W, H, theme, rand, horizon + 4, 0.7);

  if (theme.props === 'ruins') {
    drawTower(ctx, W * 0.82, horizon + 6, W * 0.055, H * 0.2, theme.ridge, rand);
    drawTower(ctx, W * 0.14, horizon + 4, W * 0.035, H * 0.12, theme.ridge, rand);
    // Broken wall line.
    ctx.fillStyle = theme.ridge;
    ctx.fillRect(W * 0.3, horizon - H * 0.018, W * 0.12, H * 0.022);
    ctx.fillRect(W * 0.33, horizon - H * 0.04, W * 0.025, H * 0.042);
    drawDeadTree(ctx, W * 0.08, horizon + 2, H * 0.16, theme.ridge, rand, 1);
    drawDeadTree(ctx, W * 0.93, horizon + 2, H * 0.2, theme.ridge, rand, -1);
  } else if (theme.props === 'marsh') {
    drawDeadTree(ctx, W * 0.16, horizon + 4, H * 0.24, theme.ridge, rand, 1);
    drawDeadTree(ctx, W * 0.88, horizon + 4, H * 0.27, theme.ridge, rand, -1);
    drawDeadTree(ctx, W * 0.36, horizon + 2, H * 0.15, theme.ridge, rand, 1);
    // Drowned statue / shrine.
    ctx.fillStyle = theme.ridge;
    ctx.fillRect(W * 0.7, horizon - H * 0.06, W * 0.012, H * 0.06);
    ellipse(ctx, W * 0.706, horizon - H * 0.066, W * 0.009, H * 0.012);
    ctx.fill();
  } else {
    // Gothic cathedral: ribs and broken spires.
    for (let i = 0; i < 5; i += 1) {
      const x = W * (0.08 + i * 0.21);
      const h = H * (0.16 + rand() * 0.15);
      drawTower(ctx, x, horizon + 5, W * 0.035, h, theme.ridge, rand);
      ctx.strokeStyle = theme.ridge;
      ctx.lineWidth = Math.max(1, W * 0.0016);
      ctx.beginPath();
      ctx.moveTo(x, horizon - h);
      ctx.lineTo(x - W * 0.03, horizon - h * 0.55);
      ctx.moveTo(x, horizon - h);
      ctx.lineTo(x + W * 0.03, horizon - h * 0.55);
      ctx.stroke();
    }
    drawDeadTree(ctx, W * 0.04, horizon + 3, H * 0.18, theme.ridge, rand, 1);
    drawDeadTree(ctx, W * 0.96, horizon + 3, H * 0.2, theme.ridge, rand, -1);
  }

  // Ground haze where the horizon meets the field.
  const haze = ctx.createLinearGradient(0, horizon - H * 0.03, 0, horizon + H * 0.14);
  haze.addColorStop(0, rgba(theme.fog, 0));
  haze.addColorStop(0.45, rgba(theme.fog, 0.22));
  haze.addColorStop(1, rgba(theme.fog, 0));
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizon - H * 0.03, W, H * 0.17);
}

function paintGround(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  const bottom = H * 1.02;
  const gradient = ctx.createLinearGradient(0, horizon, 0, bottom);
  gradient.addColorStop(0, theme.groundTop);
  gradient.addColorStop(0.38, theme.groundMid);
  gradient.addColorStop(1, theme.groundLow);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(W, horizon);
  ctx.lineTo(W, bottom);
  ctx.lineTo(0, bottom);
  ctx.closePath();
  ctx.fill();

  // Perspective scatter: fine texture near the horizon, coarse stones near camera.
  for (let i = 0; i < 2400; i += 1) {
    const t = rand();
    const y = horizon + Math.pow(t, 1.45) * (bottom - horizon);
    const spread = 0.18 + Math.pow(t, 1.2);
    const x = W * 0.5 + (rand() - 0.5) * W * spread;
    const r = (0.5 + rand() * 2.2) * (0.35 + t * 2.6);
    ctx.fillStyle = rand() > 0.58
      ? `rgba(0,0,0,${0.03 + rand() * 0.09})`
      : rgba(theme.groundLight, 0.03 + rand() * 0.08);
    ellipse(ctx, x, y, r, r * (0.3 + rand() * 0.5));
    ctx.fill();
  }

  // Cracks radiating from the centre line, like the cracked earth in 1.jpg.
  ctx.strokeStyle = 'rgba(9, 7, 6, 0.55)';
  for (let i = 0; i < 42; i += 1) {
    const t = 0.1 + rand() * 0.9;
    const y = horizon + Math.pow(t, 1.35) * (bottom - horizon);
    let x = W * (0.2 + rand() * 0.6);
    ctx.lineWidth = (0.6 + rand() * 2.1) * (0.4 + t * 1.8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    let py = y;
    let px = x;
    for (let s = 0; s < 6; s += 1) {
      px += (rand() - 0.5) * W * 0.045 * (0.4 + t);
      py += (rand() - 0.25) * H * 0.014 * (0.4 + t);
      ctx.lineTo(px, py);
      if (s === 2 && rand() > 0.45) {
        ctx.moveTo(px, py);
        ctx.lineTo(px + (rand() - 0.5) * W * 0.03, py + rand() * H * 0.02);
        ctx.moveTo(px, py);
      }
    }
    ctx.stroke();
    // A pale lip along one side of the deepest cracks.
    if (t > 0.45) {
      ctx.strokeStyle = rgba(theme.groundLight, 0.07 + rand() * 0.05);
      ctx.lineWidth = Math.max(0.5, ctx.lineWidth * 0.5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(9, 7, 6, 0.55)';
    }
  }

  // Broad patches of ash and scorched earth break up the flat plane.
  for (let i = 0; i < 22; i += 1) {
    const t = 0.2 + rand() * 0.78;
    const y = horizon + Math.pow(t, 1.25) * (bottom - horizon);
    const x = W * 0.5 + (rand() - 0.5) * W * (0.3 + t * 0.9);
    const rx = W * (0.03 + rand() * 0.11) * (0.4 + t);
    const ry = rx * (0.12 + rand() * 0.16);
    const patch = ctx.createRadialGradient(x, y, 1, x, y, rx);
    const dark = rand() > 0.45;
    patch.addColorStop(0, dark ? 'rgba(8, 7, 6, 0.28)' : rgba(theme.groundLight, 0.14));
    patch.addColorStop(1, 'rgba(10, 8, 6, 0)');
    ctx.fillStyle = patch;
    ellipse(ctx, x, y, rx, ry);
    ctx.fill();
  }

  // Scattered bones and broken masonry in the near field.
  for (let i = 0; i < 26; i += 1) {
    const t = 0.45 + rand() * 0.5;
    const y = horizon + Math.pow(t, 1.15) * (bottom - horizon);
    const x = W * 0.5 + (rand() - 0.5) * W * (0.5 + t * 1.1);
    const len = (4 + rand() * 13) * (0.4 + t);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rand() - 0.5) * 0.8);
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(190, 177, 146, 0.28)' : 'rgba(62, 52, 40, 0.55)';
    ctx.lineWidth = Math.max(1, len * 0.18);
    ctx.beginPath();
    ctx.moveTo(-len * 0.5, 0);
    ctx.lineTo(len * 0.5, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(190, 177, 146, 0.24)';
    ellipse(ctx, -len * 0.5, 0, len * 0.12, len * 0.1);
    ellipse(ctx, len * 0.5, 0, len * 0.12, len * 0.1);
    ctx.fill();
    ctx.restore();
  }

  // Larger rocks and debris.
  for (let i = 0; i < 90; i += 1) {
    const t = 0.18 + rand() * 0.8;
    const y = horizon + Math.pow(t, 1.25) * (bottom - horizon);
    const spread = 0.22 + t;
    const x = W * 0.5 + (rand() - 0.5) * W * spread;
    const size = (2 + rand() * 11) * (0.3 + t * 1.6);
    ctx.fillStyle = `rgba(20, 16, 13, ${0.22 + rand() * 0.25})`;
    ellipse(ctx, x, y, size, size * 0.34, (rand() - 0.5) * 0.4);
    ctx.fill();
    ctx.fillStyle = rgba(theme.groundLight, 0.16 + rand() * 0.14);
    ellipse(ctx, x - size * 0.15, y - size * 0.13, size * 0.6, size * 0.16);
    ctx.fill();
  }

  if (theme.props === 'marsh') {
    for (const [x, y, rx, ry] of [
      [0.22, 0.88, 0.18, 0.035],
      [0.78, 0.8, 0.2, 0.03],
      [0.52, 0.97, 0.24, 0.04],
    ]) {
      const pool = ctx.createRadialGradient(W * x, H * y, 1, W * x, H * y, W * rx);
      pool.addColorStop(0, 'rgba(35, 54, 47, 0.62)');
      pool.addColorStop(1, 'rgba(20, 30, 25, 0)');
      ctx.fillStyle = pool;
      ellipse(ctx, W * x, H * y, W * rx, H * ry);
      ctx.fill();
    }
  }
}

function paintProps(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  const ridge = theme.ridge;
  if (theme.props === 'ruins') {
    // Foreground ruined wall on the far left, out of the formation's way.
    ctx.fillStyle = 'rgba(46, 38, 29, 0.95)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.92);
    ctx.lineTo(0, H * 0.5);
    ctx.lineTo(W * 0.05, H * 0.47);
    ctx.lineTo(W * 0.085, H * 0.56);
    ctx.lineTo(W * 0.07, H * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(90, 74, 54, 0.28)';
    ctx.fillRect(W * 0.012, H * 0.51, W * 0.008, H * 0.3);

    // A brazier / fire pillar near the left edge, echoing the reference fires.
    const fireX = W * 0.08;
    const fireY = H * 0.62;
    const glow = ctx.createRadialGradient(fireX, fireY, 2, fireX, fireY, W * 0.09);
    glow.addColorStop(0, rgba(theme.ember, 0.28));
    glow.addColorStop(1, rgba(theme.ember, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(fireX - W * 0.09, fireY - W * 0.09, W * 0.18, W * 0.18);
    for (let i = 0; i < 7; i += 1) {
      ctx.fillStyle = rgba(i % 2 ? '#ffd27a' : theme.ember, 0.2 + rand() * 0.25);
      ellipse(ctx, fireX + (rand() - 0.5) * W * 0.022, fireY - rand() * H * 0.1, W * 0.006, H * 0.03);
      ctx.fill();
    }

    // Fallen column on the right.
    ctx.save();
    ctx.translate(W * 0.9, H * 0.74);
    ctx.rotate(-0.18);
    ctx.fillStyle = 'rgba(55, 45, 34, 0.95)';
    roundRect(ctx, -W * 0.02, -H * 0.015, W * 0.14, H * 0.03, H * 0.01);
    ctx.fill();
    ctx.fillStyle = 'rgba(120, 98, 68, 0.25)';
    ctx.fillRect(-W * 0.02, -H * 0.015, W * 0.14, H * 0.006);
    ctx.restore();

    // Cursed soul-fire: the green flame from the reference field.
    for (const [fx, fy, scale] of [
      [W * 0.115, H * 0.665, 1],
      [W * 0.905, H * 0.7, 0.62],
    ]) {
      const glow = ctx.createRadialGradient(fx, fy, 2, fx, fy, W * 0.1 * scale);
      glow.addColorStop(0, 'rgba(150, 255, 120, 0.22)');
      glow.addColorStop(0.35, 'rgba(70, 200, 80, 0.09)');
      glow.addColorStop(1, 'rgba(40, 120, 60, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(fx - W * 0.1 * scale, fy - W * 0.1 * scale, W * 0.2 * scale, W * 0.2 * scale);
      for (let i = 0; i < 6; i += 1) {
        const h = H * (0.055 + rand() * 0.12) * scale;
        const sway = (rand() - 0.5) * W * 0.028 * scale;
        const base = W * (0.003 + rand() * 0.004) * scale;
        ctx.fillStyle = rgba(i % 3 === 0 ? '#d8ffa0' : i % 2 ? '#7be05c' : '#2f9d46', 0.12 + rand() * 0.16);
        ctx.beginPath();
        ctx.moveTo(fx - base + (rand() - 0.5) * base, fy);
        ctx.quadraticCurveTo(fx + sway * 0.4, fy - h * 0.55, fx + sway, fy - h);
        ctx.quadraticCurveTo(fx + sway * 0.15 + base, fy - h * 0.5, fx + base + (rand() - 0.5) * base, fy);
        ctx.closePath();
        ctx.fill();
      }
      // Charred brazier bowl.
      ctx.fillStyle = 'rgba(20, 17, 14, 0.95)';
      ellipse(ctx, fx, fy + 3, W * 0.016 * scale, H * 0.008 * scale);
      ctx.fill();
    }
  } else if (theme.props === 'marsh') {
    ctx.strokeStyle = 'rgba(72, 88, 50, 0.8)';
    ctx.lineWidth = Math.max(1, W * 0.0015);
    for (let cluster = 0; cluster < 5; cluster += 1) {
      const bx = W * (0.06 + rand() * 0.88);
      const by = H * (0.72 + rand() * 0.24);
      for (let i = 0; i < 9; i += 1) {
        const h = H * (0.035 + rand() * 0.09);
        ctx.beginPath();
        ctx.moveTo(bx + (rand() - 0.5) * W * 0.03, by);
        ctx.quadraticCurveTo(bx + (rand() - 0.5) * W * 0.04, by - h * 0.6, bx + (rand() - 0.5) * W * 0.05, by - h);
        ctx.stroke();
      }
    }
    // Drowned statue on the right.
    ctx.fillStyle = 'rgba(58, 68, 54, 0.9)';
    ctx.fillRect(W * 0.9, H * 0.5, W * 0.018, H * 0.18);
    ellipse(ctx, W * 0.909, H * 0.49, W * 0.012, H * 0.018);
    ctx.fill();
  } else {
    // Bone ribs framing the cathedral arena.
    ctx.strokeStyle = 'rgba(164, 156, 133, 0.24)';
    ctx.lineWidth = Math.max(2, W * 0.0035);
    for (const side of [-1, 1]) {
      const x = W * (side < 0 ? 0.05 : 0.95);
      ctx.beginPath();
      ctx.moveTo(x, H * 0.98);
      ctx.quadraticCurveTo(x + side * W * 0.03, H * 0.55, x + side * W * 0.09, H * 0.34);
      ctx.stroke();
      for (let i = 0; i < 5; i += 1) {
        const t = 0.32 + i * 0.12;
        const bx = x + side * W * 0.03 * t;
        const by = H * (0.98 - t * 0.62);
        ctx.lineWidth = Math.max(1, W * 0.0016);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + side * W * 0.045, by - H * 0.025, bx + side * W * 0.07, by - H * 0.055);
        ctx.stroke();
      }
    }
    // Candelabra glow.
    for (const x of [W * 0.18, W * 0.82]) {
      const y = H * 0.6;
      const glow = ctx.createRadialGradient(x, y, 1, x, y, W * 0.055);
      glow.addColorStop(0, rgba(theme.ember, 0.22));
      glow.addColorStop(1, rgba(theme.ember, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(x - W * 0.055, y - W * 0.055, W * 0.11, W * 0.11);
    }
  }

  // Bottom foreground rubble, kept dark so UI medallions sit on it cleanly.
  const bottomShade = ctx.createLinearGradient(0, H * 0.86, 0, H);
  bottomShade.addColorStop(0, 'rgba(6, 5, 4, 0)');
  bottomShade.addColorStop(1, 'rgba(6, 5, 4, 0.62)');
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, H * 0.86, W, H * 0.14);

  // Horizon ridge silhouette sits in front of the ground haze but behind units.
  ctx.fillStyle = 'rgba(10, 8, 8, 0.35)';
  ctx.fillRect(0, horizon - 2, W, 3);
}

function paintBackground(W, H, theme, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(W));
  canvas.height = Math.max(1, Math.round(H));
  const ctx = canvas.getContext('2d');
  const rand = lcg(seed);
  paintSky(ctx, W, H, theme, rand);
  paintHorizon(ctx, W, H, theme, rand);
  paintGround(ctx, W, H, theme, rand);
  paintProps(ctx, W, H, theme, rand);
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Unit sprites                                                        */
/* ------------------------------------------------------------------ */

function drawShadow(ctx, scale, width = 34) {
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, width * scale);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.25)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ellipse(ctx, 0, 2, width * scale, width * scale * 0.3);
  ctx.fill();
}

function drawHumanoid(ctx, unit, art, pose) {
  const dir = pose.dir;
  const h = UNIT_HEIGHT;
  const breathe = pose.breathe;
  const swing = pose.swing;
  const cast = pose.cast;
  const guard = pose.guard;
  const bulky = art.bulky ? 1.15 : 1;
  const tall = art.tall ? 1.22 : 1;
  const skin = art.skin;
  const cloth = art.cloth;
  const metal = art.metal;
  const dark = art.metalDark;
  const accent = art.accent;
  const undead = art.undead;

  ctx.save();
  ctx.translate(0, breathe);
  ctx.scale(dir, 1);

  // Cape / cloak mass behind the body.
  if (art.cape) {
    const cape = ctx.createLinearGradient(-8, -h * 0.72, 10, 0);
    cape.addColorStop(0, tone(cloth, 0.05));
    cape.addColorStop(0.55, cloth);
    cape.addColorStop(1, '#0b0807');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-10 * bulky, -h * 0.66);
    ctx.quadraticCurveTo(-26 * bulky, -h * 0.38, -20 * bulky, -h * 0.02);
    ctx.lineTo(6 * bulky, -h * 0.05);
    ctx.quadraticCurveTo(14 * bulky, -h * 0.4, 9 * bulky, -h * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.16);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Legs.
  const legTop = -h * 0.36;
  const legW = 7 * bulky;
  const stride = pose.walk ? Math.sin(pose.walkPhase) * 6 : 0;
  for (const side of [-1, 1]) {
    const x = side * 6 * bulky + (side < 0 ? stride : -stride) * 0.4;
    const legGrad = ctx.createLinearGradient(x, legTop, x, 0);
    legGrad.addColorStop(0, undead ? tone(skin, -0.2) : dark);
    legGrad.addColorStop(1, '#050505');
    ctx.fillStyle = legGrad;
    roundRect(ctx, x - legW / 2, legTop, legW, -legTop, 3);
    ctx.fill();
    // Boot.
    ctx.fillStyle = '#080706';
    roundRect(ctx, x - legW / 2 - 1, -5, legW + 3, 6, 3);
    ctx.fill();
    if (undead) {
      ctx.strokeStyle = rgba(skin, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 1, legTop + 5);
      ctx.lineTo(x + 1, -6);
      ctx.stroke();
    }
  }

  // Torso.
  const hipY = -h * 0.36;
  const shoulderY = -h * 0.68;
  const torsoW = 18 * bulky;
  const bodyGrad = ctx.createLinearGradient(-torsoW, shoulderY, torsoW, hipY);
  bodyGrad.addColorStop(0, undead ? tone(skin, -0.15) : tone(cloth, 0.18));
  bodyGrad.addColorStop(0.5, undead ? skin : metal);
  bodyGrad.addColorStop(1, dark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-torsoW * 0.7, hipY);
  ctx.quadraticCurveTo(-torsoW * 1.05, shoulderY + 10, -torsoW * 0.7, shoulderY);
  ctx.quadraticCurveTo(0, shoulderY - 5, torsoW * 0.7, shoulderY);
  ctx.quadraticCurveTo(torsoW * 1.05, shoulderY + 12, torsoW * 0.8, hipY);
  ctx.quadraticCurveTo(0, hipY + 8, -torsoW * 0.7, hipY);
  ctx.closePath();
  ctx.fill();

  // Belt.
  ctx.fillStyle = '#2a1d12';
  ctx.fillRect(-torsoW * 0.78, hipY - 7, torsoW * 1.58, 5);
  ctx.fillStyle = rgba(accent, 0.7);
  ctx.fillRect(-3, hipY - 8, 6, 7);

  // Chest highlight and rim.
  ctx.strokeStyle = rgba(accent, 0.4);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-torsoW * 0.5, shoulderY + 4);
  ctx.quadraticCurveTo(-torsoW * 0.2, shoulderY + 16, -torsoW * 0.45, hipY - 4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 236, 200, 0.22)';
  ctx.beginPath();
  ctx.moveTo(torsoW * 0.62, shoulderY + 3);
  ctx.quadraticCurveTo(torsoW * 0.82, shoulderY + 18, torsoW * 0.62, hipY - 3);
  ctx.stroke();

  // Shoulders / pauldrons.
  ctx.fillStyle = metal;
  for (const side of [-1, 1]) {
    ellipse(ctx, side * torsoW * 0.78, shoulderY + 5, 9 * bulky, 7 * bulky);
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Head and hood / helmet.
  const headY = -h * 0.79 + breathe * 0.5;
  const headR = art.tall ? 10 : 8.8;
  if (art.hood) {
    const hood = ctx.createLinearGradient(0, headY - 20, 0, headY + 12);
    hood.addColorStop(0, tone(cloth, 0.06));
    hood.addColorStop(1, dark);
    ctx.fillStyle = hood;
    ctx.beginPath();
    ctx.moveTo(-13, headY + 8);
    ctx.quadraticCurveTo(-15, headY - 16, 0, headY - 18);
    ctx.quadraticCurveTo(14, headY - 15, 13, headY + 8);
    ctx.quadraticCurveTo(6, headY + 16, 0, headY + 14);
    ctx.quadraticCurveTo(-7, headY + 16, -13, headY + 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = undead ? tone(skin, -0.08) : skin;
  ellipse(ctx, 1, headY + 2, headR, headR + 2);
  ctx.fill();
  // Face shadow deepens the eye sockets and keeps the head from reading as a
  // pale mask against the dark ground.
  ctx.fillStyle = 'rgba(8, 6, 5, 0.44)';
  ellipse(ctx, 4, headY + 5, headR * 0.8, headR * 0.92);
  ctx.fill();
  if (art.hood) {
    ctx.fillStyle = 'rgba(6, 5, 4, 0.46)';
    ctx.beginPath();
    ctx.moveTo(-10, headY - 4);
    ctx.quadraticCurveTo(0, headY - 14, 10, headY - 4);
    ctx.lineTo(8, headY + 1);
    ctx.quadraticCurveTo(0, headY - 5, -8, headY + 1);
    ctx.closePath();
    ctx.fill();
  }
  if (undead) {
    ctx.fillStyle = '#0b0b0b';
    ellipse(ctx, 4, headY, 7, 6);
    ctx.fill();
    ctx.fillStyle = art.glow || accent;
    ellipse(ctx, 2, headY - 1, 1.6, 1.6);
    ellipse(ctx, 7, headY - 1, 1.6, 1.6);
    ctx.fill();
  } else {
    // Eyes (a hint, not a cartoon face).
    ctx.fillStyle = '#17110d';
    ellipse(ctx, 3, headY - 1, 1.2, 1.6);
    ellipse(ctx, 7, headY - 1, 1.2, 1.6);
    ctx.fill();
    // Nose/jaw shadow.
    ctx.strokeStyle = 'rgba(30, 18, 12, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, headY + 4);
    ctx.lineTo(4, headY + 7);
    ctx.stroke();
  }

  if (art.helmet) {
    const helm = ctx.createLinearGradient(0, headY - 16, 0, headY + 10);
    helm.addColorStop(0, tone(metal, 0.3));
    helm.addColorStop(0.6, metal);
    helm.addColorStop(1, dark);
    ctx.fillStyle = helm;
    ctx.beginPath();
    ctx.moveTo(-12, headY + 4);
    ctx.quadraticCurveTo(-11, headY - 16, 2, headY - 16);
    ctx.quadraticCurveTo(14, headY - 12, 13, headY + 4);
    ctx.lineTo(9, headY + 7);
    ctx.lineTo(9, headY - 1);
    ctx.lineTo(4, headY + 1);
    ctx.lineTo(2, headY + 7);
    ctx.lineTo(-3, headY + 7);
    ctx.lineTo(-4, headY - 1);
    ctx.lineTo(-12, headY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    // Visor glow.
    ctx.fillStyle = rgba(art.glow || accent, 0.7);
    ctx.fillRect(5, headY - 1, 6, 1.6);
  }

  if (art.tall) {
    // Crown for the Hollow King.
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-12, headY - 16);
    ctx.lineTo(-9, headY - 28);
    ctx.lineTo(-4, headY - 20);
    ctx.lineTo(1, headY - 30);
    ctx.lineTo(5, headY - 20);
    ctx.lineTo(11, headY - 27);
    ctx.lineTo(12, headY - 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(accent, 0.35);
    ellipse(ctx, 1, headY - 22, 14, 4);
    ctx.fill();
  }

  // Arms. Back arm first, then weapon arm.
  const armY = shoulderY + 11;
  const armLen = h * 0.22;
  ctx.strokeStyle = undead ? tone(skin, -0.2) : tone(cloth, -0.1);
  ctx.lineCap = 'round';
  ctx.lineWidth = 7 * bulky;
  ctx.beginPath();
  ctx.moveTo(-torsoW * 0.6, armY);
  ctx.quadraticCurveTo(-torsoW * 1.25, armY + armLen * 0.45, -torsoW * 0.9, armY + armLen);
  ctx.stroke();

  if (art.shield) {
    // Shield on the forward arm.
    const shieldX = torsoW * 1.05;
    const shieldY = armY + 6 + (guard ? 4 : 0);
    ctx.save();
    ctx.translate(shieldX, shieldY);
    ctx.rotate(guard ? -0.18 : 0.05);
    const shieldGrad = ctx.createLinearGradient(-14, -24, 14, 24);
    shieldGrad.addColorStop(0, tone(metal, 0.22));
    shieldGrad.addColorStop(0.55, metal);
    shieldGrad.addColorStop(1, dark);
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.moveTo(-13, -22);
    ctx.quadraticCurveTo(0, -28, 13, -22);
    ctx.lineTo(11, 10);
    ctx.quadraticCurveTo(0, 24, -11, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.65);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = rgba(accent, 0.5);
    ellipse(ctx, 0, -4, 3, 3);
    ctx.fill();
    ctx.restore();
  }

  const armAngle = guard ? 0.5 : cast ? -1.1 : swing > 0 ? -1.4 + swing * 2.5 : 0.18;
  ctx.strokeStyle = undead ? tone(skin, -0.15) : tone(cloth, -0.18);
  ctx.lineWidth = 6.4 * bulky;
  ctx.beginPath();
  ctx.moveTo(torsoW * 0.58, armY);
  ctx.quadraticCurveTo(
    torsoW * 1.25,
    armY + Math.cos(armAngle) * armLen * 0.55,
    torsoW * 0.95 + Math.sin(armAngle) * armLen * 0.7,
    armY + Math.cos(armAngle) * armLen,
  );
  ctx.stroke();

  const handX = torsoW * 0.95 + Math.sin(armAngle) * armLen * 0.7;
  const handY = armY + Math.cos(armAngle) * armLen;
  ctx.fillStyle = undead ? tone(skin, -0.15) : skin;
  ellipse(ctx, handX, handY, 3.4, 3.1);
  ctx.fill();

  // Weapon.
  ctx.save();
  ctx.translate(handX, handY);
  if (art.weapon === 'sword' || art.weapon === 'greatsword') {
    const len = art.weapon === 'greatsword' ? 84 : 58;
    ctx.rotate(armAngle * 0.7 + (swing > 0 ? -1.2 + swing * 2.4 : -0.35));
    const blade = ctx.createLinearGradient(0, 0, 0, -len);
    blade.addColorStop(0, '#8d9297');
    blade.addColorStop(0.5, '#e6edf0');
    blade.addColorStop(1, '#aeb7bd');
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(-2.2, 0);
    ctx.lineTo(-1.4, -len);
    ctx.lineTo(0, -len - 6);
    ctx.lineTo(1.4, -len);
    ctx.lineTo(2.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(-4, -3, 8, 3);
    ctx.fillStyle = accent;
    ctx.fillRect(-1, -5, 2, 5);
  } else if (art.weapon === 'axe') {
    ctx.rotate(armAngle * 0.6 - 0.5);
    ctx.strokeStyle = '#4a3320';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -46);
    ctx.stroke();
    const axe = ctx.createLinearGradient(-16, -46, 16, -34);
    axe.addColorStop(0, tone(metal, -0.1));
    axe.addColorStop(0.6, tone(metal, 0.35));
    axe.addColorStop(1, dark);
    ctx.fillStyle = axe;
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.quadraticCurveTo(18, -48, 19, -34);
    ctx.quadraticCurveTo(10, -36, 0, -34);
    ctx.closePath();
    ctx.fill();
  } else if (art.weapon === 'hammer') {
    ctx.rotate(armAngle * 0.6 - 0.4);
    ctx.strokeStyle = '#47341e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -42);
    ctx.stroke();
    ctx.fillStyle = tone(metal, 0.12);
    roundRect(ctx, -13, -50, 26, 12, 3);
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (art.weapon === 'bow') {
    ctx.rotate(cast ? -0.4 : 0.1);
    ctx.strokeStyle = '#6a4a26';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(5, -6, 34, -1.15, 1.15);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235, 225, 195, 0.65)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(18, -36);
    ctx.lineTo(18, 24);
    ctx.stroke();
    // Arrow.
    ctx.strokeStyle = '#d8c8a0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(36, -6);
    ctx.stroke();
    ctx.fillStyle = '#c0b080';
    ctx.beginPath();
    ctx.moveTo(38, -6);
    ctx.lineTo(32, -9);
    ctx.lineTo(32, -3);
    ctx.closePath();
    ctx.fill();
  } else if (art.weapon === 'crossbow') {
    ctx.rotate(0);
    ctx.strokeStyle = '#5b4328';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.lineTo(26, -8);
    ctx.stroke();
    ctx.strokeStyle = art.metal;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(18, -22);
    ctx.quadraticCurveTo(28, -8, 18, 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(230,230,220,0.55)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(18, -22);
    ctx.lineTo(18, 6);
    ctx.stroke();
  } else if (art.weapon === 'staff') {
    ctx.rotate(-0.12);
    ctx.strokeStyle = '#4a3320';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(0, -56);
    ctx.stroke();
    const orbY = -60;
    const orb = ctx.createRadialGradient(0, orbY, 0, 0, orbY, 13);
    orb.addColorStop(0, '#fff6d8');
    orb.addColorStop(0.3, art.glow || accent);
    orb.addColorStop(1, rgba(art.glow || accent, 0));
    ctx.fillStyle = orb;
    ellipse(ctx, 0, orbY, 14, 14);
    ctx.fill();
  } else if (art.weapon === 'censer') {
    ctx.rotate(0.08 + (cast ? -0.4 : 0));
    ctx.strokeStyle = '#a88a52';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(12, 24, 4, 38);
    ctx.stroke();
    const glow = ctx.createRadialGradient(4, 40, 0, 4, 40, 16);
    glow.addColorStop(0, 'rgba(255, 244, 200, 0.9)');
    glow.addColorStop(0.35, rgba(art.glow || accent, 0.55));
    glow.addColorStop(1, rgba(art.glow || accent, 0));
    ctx.fillStyle = glow;
    ellipse(ctx, 4, 40, 16, 16);
    ctx.fill();
    ctx.fillStyle = art.metal;
    ellipse(ctx, 4, 40, 4, 4);
    ctx.fill();
  } else if (art.weapon === 'claws') {
    ctx.rotate(0);
    ctx.strokeStyle = tone(skin, 0.25);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(2, -4 + i * 3);
      ctx.quadraticCurveTo(14, -8 + i * 3, 20, -2 + i * 3);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Weapon glow for casters.
  if (cast && (art.weapon === 'staff' || art.weapon === 'censer')) {
    const glow = ctx.createRadialGradient(handX + 4, handY - 40, 0, handX + 4, handY - 40, 38);
    glow.addColorStop(0, rgba(art.glow || accent, 0.38));
    glow.addColorStop(1, rgba(art.glow || accent, 0));
    ctx.fillStyle = glow;
    ellipse(ctx, handX + 4, handY - 40, 38, 38);
    ctx.fill();
  }

  // Rim light: a thin bright edge on the light side.
  ctx.strokeStyle = 'rgba(255, 226, 170, 0.28)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(torsoW * 0.65, shoulderY + 2);
  ctx.quadraticCurveTo(torsoW * 0.9, shoulderY + 20, torsoW * 0.6, hipY);
  ctx.stroke();

  ctx.restore();
}

function drawBeast(ctx, unit, art, pose) {
  const dir = pose.dir;
  const breathe = pose.breathe;
  const swing = pose.swing;
  ctx.save();
  ctx.translate(0, breathe);
  ctx.scale(dir, 1);
  const h = UNIT_HEIGHT;

  // Massive hunched body: four legs, long arms, tendrils.
  ctx.fillStyle = '#101510';
  for (const [lx, ly, lw] of [[-26, -8, 9], [-12, -4, 8], [18, -6, 9], [30, -10, 8]]) {
    roundRect(ctx, lx, ly, lw, 42, 4);
    ctx.fill();
  }
  const body = ctx.createLinearGradient(-36, -h * 0.66, 24, -h * 0.3);
  body.addColorStop(0, tone(art.skin, 0.18));
  body.addColorStop(0.48, art.skin);
  body.addColorStop(1, '#131a12');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-40, -h * 0.34);
  ctx.quadraticCurveTo(-52, -h * 0.62, -18, -h * 0.7);
  ctx.quadraticCurveTo(10, -h * 0.78, 32, -h * 0.58);
  ctx.quadraticCurveTo(46, -h * 0.4, 30, -h * 0.24);
  ctx.quadraticCurveTo(0, -h * 0.14, -40, -h * 0.34);
  ctx.closePath();
  ctx.fill();

  // Spines.
  ctx.fillStyle = tone(art.skin, -0.35);
  for (let i = 0; i < 6; i += 1) {
    const x = -30 + i * 12;
    const y = -h * (0.68 + Math.sin(i) * 0.03);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y - 16 - (i % 3) * 6);
    ctx.lineTo(x + 8, y);
    ctx.closePath();
    ctx.fill();
  }

  // Head / maw at the front.
  const headX = 34;
  const headY = -h * 0.55;
  ctx.fillStyle = tone(art.skin, 0.1);
  ellipse(ctx, headX, headY, 22, 17);
  ctx.fill();
  ctx.fillStyle = '#0d120c';
  ellipse(ctx, headX + 12, headY + 3, 13, 9);
  ctx.fill();
  ctx.fillStyle = '#e9f0c0';
  for (let i = 0; i < 4; i += 1) {
    const tx = headX + 4 + i * 5;
    ctx.beginPath();
    ctx.moveTo(tx, headY);
    ctx.lineTo(tx + 1.5, headY - 5);
    ctx.lineTo(tx + 3, headY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = art.glow || '#b7e05a';
  ellipse(ctx, headX + 4, headY - 7, 2.5, 2);
  ellipse(ctx, headX + 16, headY - 5, 2.5, 2);
  ctx.fill();
  // Tendrils / arms.
  ctx.strokeStyle = tone(art.skin, -0.25);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(16, -h * 0.42);
  ctx.quadraticCurveTo(38, -h * 0.28 + swing * 22, 46, -h * 0.16);
  ctx.stroke();
  ctx.strokeStyle = tone(art.skin, -0.12);
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-30 + i * 6, -h * 0.36);
    ctx.quadraticCurveTo(-46 - i * 6, -h * 0.2, -52 - i * 4, -h * 0.1 + i * 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawUnitSprite(ctx, unit, art, pose) {
  if (art.beast) drawBeast(ctx, unit, art, pose);
  else drawHumanoid(ctx, unit, art, pose);
}

/* ------------------------------------------------------------------ */
/* Effects                                                             */
/* ------------------------------------------------------------------ */

class CanvasEffects {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.maxItems = 220;
  }

  clear() {
    this.items = [];
  }

  add(item) {
    if (this.items.length >= this.maxItems) this.items.shift();
    this.items.push({ age: 0, life: 0.5, ...item });
  }

  update(dt) {
    for (const item of this.items) item.age += dt;
    this.items = this.items.filter((item) => item.age < item.life);
    for (const item of this.items) item.update?.(item.age, dt);
  }

  draw(ctx, time) {
    for (const item of this.items) {
      const t = clamp(item.age / item.life, 0, 1);
      item.draw?.(ctx, t, time, item);
    }
  }

  burst(x, y, color, count = 12, power = 1) {
    const c = colorFrom(color);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * TAU;
      const speed = (40 + Math.random() * 130) * power;
      const life = 0.35 + Math.random() * 0.45;
      this.add({
        type: 'spark',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: 260,
        size: 1.4 + Math.random() * 3,
        color: c,
        life,
        draw: (ctx2, p, now, item) => {
          const px = item.x + item.vx * item.age;
          const py = item.y + item.vy * item.age + item.gravity * item.age * item.age * 0.5;
          ctx2.globalAlpha = 1 - p;
          ctx2.fillStyle = item.color;
          ellipse(ctx2, px, py, item.size * (1 - p * 0.5), item.size * (1 - p * 0.5));
          ctx2.fill();
          ctx2.globalAlpha = 1;
        },
      });
    }
  }

  impact(position, type, crit = false) {
    if (!position) return;
    const color = colorFrom(this.scene.typeColor(type));
    const { x, y } = position;
    this.add({
      type: 'ring',
      x, y, color, life: crit ? 0.5 : 0.38,
      draw: (ctx, p) => {
        ctx.strokeStyle = rgba(color, 0.8 * (1 - p));
        ctx.lineWidth = (crit ? 4 : 2.4) * (1 - p) + 0.5;
        ellipse(ctx, x, y, 12 + p * (crit ? 78 : 52), (12 + p * (crit ? 78 : 52)) * 0.34);
        ctx.stroke();
      },
    });
    this.add({
      type: 'flash',
      x, y, color, life: crit ? 0.24 : 0.16,
      draw: (ctx, p) => {
        const r = (crit ? 58 : 38) * (0.6 + p * 0.7);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba('#fff8e8', 0.7 * (1 - p)));
        g.addColorStop(0.35, rgba(color, 0.32 * (1 - p)));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ellipse(ctx, x, y, r, r * 0.8);
        ctx.fill();
      },
    });
    this.burst(x, y, color, crit ? 20 : 10, crit ? 1.4 : 1);
    this.shards(x, y, color, crit ? 9 : 5, crit ? 1.5 : 1);
  }

  shards(x, y, color, count = 6, power = 1) {
    const c = colorFrom(color);
    for (let i = 0; i < count; i += 1) {
      const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
      const speed = (60 + Math.random() * 150) * power;
      this.add({
        type: 'shard',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 12,
        size: 2 + Math.random() * 5,
        color: c,
        life: 0.5 + Math.random() * 0.4,
        draw: (ctx2, p, now, item) => {
          const px = item.x + item.vx * item.age;
          const py = item.y + item.vy * item.age + 420 * item.age * item.age;
          ctx2.save();
          ctx2.translate(px, py);
          ctx2.rotate(item.rot + item.spin * item.age);
          ctx2.globalAlpha = 1 - p;
          ctx2.fillStyle = item.color;
          ctx2.beginPath();
          ctx2.moveTo(-item.size, -item.size * 0.4);
          ctx2.lineTo(item.size, 0);
          ctx2.lineTo(-item.size * 0.4, item.size * 0.45);
          ctx2.closePath();
          ctx2.fill();
          ctx2.restore();
          ctx2.globalAlpha = 1;
        },
      });
    }
  }

  projectile(from, to, color, kind = 'orb') {
    if (!from || !to) return;
    const c = colorFrom(color);
    const life = kind === 'arrow' ? 0.3 : 0.4;
    this.add({
      type: 'projectile',
      life,
      draw: (ctx, p) => {
        const x = from.x + (to.x - from.x) * Math.min(1, p * 1.15);
        const y = from.y + (to.y - from.y) * Math.min(1, p * 1.15);
        const dy = to.y - from.y;
        const dx = to.x - from.x;
        const angle = Math.atan2(dy, dx);
        if (kind === 'arrow') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.strokeStyle = '#d9c7a0';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(12, 0);
          ctx.stroke();
          ctx.fillStyle = '#e8dcc0';
          ctx.beginPath();
          ctx.moveTo(15, 0);
          ctx.lineTo(7, -4);
          ctx.lineTo(7, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          const g = ctx.createRadialGradient(x, y, 0, x, y, kind === 'orb' ? 22 : 16);
          g.addColorStop(0, 'rgba(255,255,255,0.95)');
          g.addColorStop(0.25, rgba(c, 0.9));
          g.addColorStop(1, rgba(c, 0));
          ctx.fillStyle = g;
          ellipse(ctx, x, y, 22, 22);
          ctx.fill();
          // Trail.
          ctx.strokeStyle = rgba(c, 0.5);
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      },
    });
    // A soft launch puff.
    this.burst(from.x, from.y, c, 5, 0.6);
  }

  beam(from, to, color, width = 0.3) {
    if (!from || !to) return;
    const c = colorFrom(color);
    this.add({
      type: 'beam',
      life: 0.45,
      draw: (ctx, p) => {
        const alpha = Math.sin(Math.PI * Math.min(1, p * 1.2)) * 0.9;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const layers = [
          { w: width * 160 * (1 - p * 0.3), a: alpha * 0.2 },
          { w: width * 80 * (1 - p * 0.3), a: alpha * 0.45 },
          { w: width * 26 * (1 - p * 0.3), a: alpha * 0.9 },
        ];
        for (const layer of layers) {
          const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          grad.addColorStop(0, rgba(c, layer.a * 0.15));
          grad.addColorStop(0.75, rgba(c, layer.a));
          grad.addColorStop(1, rgba('#fff8e8', layer.a));
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(1, layer.w);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
        ctx.restore();
      },
    });
    this.burst(to.x, to.y, c, 12, 1.1);
  }

  spell(position, type) {
    if (!position) return;
    const color = colorFrom(type === 'holy' ? '#ffe7a8' : this.scene.typeColor(type));
    const { x, y } = position;
    this.add({
      type: 'rune',
      life: 0.8,
      draw: (ctx, p) => {
        const alpha = Math.sin(Math.PI * p) * 0.8;
        ctx.save();
        ctx.translate(x, y + 12);
        ctx.scale(1, 0.36);
        ctx.rotate(p * 2.4);
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 44 + p * 26, 0, TAU);
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 30 + p * 18, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < 6; i += 1) {
          const a = (i / 6) * TAU + p;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 34, Math.sin(a) * 34);
          ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
          ctx.stroke();
        }
        ctx.restore();
      },
    });
    this.burst(x, y, color, 16, 0.9);
    this.add({
      type: 'pillar',
      life: 0.6,
      draw: (ctx, p) => {
        const h = 150 * Math.sin(Math.PI * p);
        const g = ctx.createLinearGradient(x, y, x, y - h);
        g.addColorStop(0, rgba(color, 0.35 * (1 - p)));
        g.addColorStop(0.6, rgba(color, 0.12 * (1 - p)));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - 24, y - h, 48, h);
      },
    });
  }

  heal(position) {
    if (!position) return;
    const { x, y } = position;
    const color = '#b9e88a';
    this.add({
      type: 'healglow',
      life: 0.7,
      draw: (ctx, p) => {
        const r = 28 + p * 24;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255, 255, 220, ${0.5 * (1 - p)})`);
        g.addColorStop(0.35, rgba(color, 0.3 * (1 - p)));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ellipse(ctx, x, y, r, r * 1.2);
        ctx.fill();
      },
    });
    for (let i = 0; i < 16; i += 1) {
      const dx = (Math.random() - 0.5) * 50;
      const speed = 40 + Math.random() * 70;
      const life = 0.5 + Math.random() * 0.4;
      this.add({
        type: 'mote',
        fresh: true,
        life,
        draw: (ctx2, p, now, item) => {
          const px = x + dx + Math.sin(now * 3 + i) * 6;
          const py = y + 14 - speed * item.age;
          ctx2.globalAlpha = 1 - p;
          ctx2.fillStyle = i % 3 === 0 ? '#fff8ca' : color;
          ellipse(ctx2, px, py, 1.8 + (i % 2), 1.8 + (i % 2));
          ctx2.fill();
          ctx2.globalAlpha = 1;
        },
      });
    }
  }

  spirit(position) {
    if (!position) return;
    const { x, y } = position;
    const color = '#a8e7d4';
    this.add({
      type: 'spirit',
      life: 1.2,
      draw: (ctx, p) => {
        const py = y - p * 110;
        const px = x + Math.sin(p * 9) * 12;
        const alpha = (1 - p) * 0.8;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 20 + p * 10);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.3, rgba(color, alpha * 0.7));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ellipse(ctx, px, py, 20 + p * 10, 30 + p * 14);
        ctx.fill();
        ctx.strokeStyle = rgba(color, alpha * 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py + 18);
        ctx.quadraticCurveTo(px + Math.sin(p * 5) * 14, py + 40, px, py + 56);
        ctx.stroke();
      },
    });
  }

  ring(position, color, radius = 40) {
    if (!position) return;
    const c = colorFrom(color);
    this.add({
      type: 'ring',
      life: 0.45,
      draw: (ctx, p) => {
        ctx.strokeStyle = rgba(c, 0.7 * (1 - p));
        ctx.lineWidth = 3 * (1 - p) + 0.5;
        ellipse(ctx, position.x, position.y, radius + p * radius, (radius + p * radius) * 0.36);
        ctx.stroke();
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/* Unit view                                                           */
/* ------------------------------------------------------------------ */

class UnitView {
  constructor(scene, unit) {
    this.scene = scene;
    this.unit = unit;
    this.art = ART[unit.model] || ART.knight;
    this.phase = Math.random() * TAU;
    this.sx = 0;
    this.sy = 0;
    this.scale = 1;
    this.home = scene.slotScreen(unit);
    this.sx = this.home.x;
    this.sy = this.home.y;
    this.scale = this.home.scale;
    this.walkFrom = null;
    this.walkTo = null;
    this.walkT = 1;
    this.anim = null;
    this.hitTimer = 0;
    this.active = false;
    this.hover = false;
    this.targetValid = false;
    this.dead = false;
    this.deathT = 0;
    this.attackLunge = 0;
    this.targetX = this.home.x;
    this.targetY = this.home.y;
  }

  setSlot() {
    this.home = this.scene.slotScreen(this.unit);
    this.walkFrom = { x: this.sx, y: this.sy, scale: this.scale };
    this.walkTo = this.home;
    this.walkT = 0;
  }

  setActive(value) { this.active = value; }
  setHover(value) { this.hover = value; }
  setValidTarget(value) { this.targetValid = value; }

  playAction(action, targetView, abilityId = null) {
    this.anim = {
      type: action === 'ability' ? 'cast' : action,
      abilityId,
      duration: action === 'ability' ? 0.72 : action === 'attack' ? 0.55 : 0.45,
      t: 0,
      target: targetView ? { x: targetView.sx, y: targetView.sy } : null,
    };
  }

  playHit(crit = false) {
    this.hitTimer = crit ? 0.4 : 0.26;
    this.anim = null;
  }

  playDeath() {
    this.dead = true;
    this.deathT = 0;
    this.anim = null;
    const pos = this.scene.worldPosition(this.unit.uid);
    if (pos) this.scene.effects.spirit(pos);
  }

  update(dt, time) {
    if (this.dead) {
      this.deathT += dt;
      return;
    }
    if (this.walkT < 1 && this.walkFrom && this.walkTo) {
      this.walkT = Math.min(1, this.walkT + dt * 1.9);
      const e = this.walkT * this.walkT * (3 - 2 * this.walkT);
      this.sx = lerp(this.walkFrom.x, this.walkTo.x, e);
      this.sy = lerp(this.walkFrom.y, this.walkTo.y, e);
      this.scale = lerp(this.walkFrom.scale, this.walkTo.scale, e);
    } else {
      this.home = this.scene.slotScreen(this.unit);
      this.sx = lerp(this.sx, this.home.x, Math.min(1, dt * 10));
      this.sy = lerp(this.sy, this.home.y, Math.min(1, dt * 10));
      this.scale = lerp(this.scale, this.home.scale, Math.min(1, dt * 10));
    }

    this.attackLunge *= Math.pow(0.003, dt);
    if (this.anim) {
      this.anim.t += dt;
      if (this.anim.t >= this.anim.duration) this.anim = null;
    }
    if (this.hitTimer > 0) this.hitTimer = Math.max(0, this.hitTimer - dt);
  }

  bodyTop() {
    return this.sy - UNIT_HEIGHT * this.scale * 1.02;
  }

  hitTest(x, y) {
    const s = this.scale * this.scene.sizeK;
    const halfW = 34 * s;
    return x > this.sx - halfW && x < this.sx + halfW
      && y > this.sy - UNIT_HEIGHT * s * 1.05 && y < this.sy + 10 * s;
  }

  draw(ctx, time) {
    const scale = this.scale * this.scene.sizeK;
    const dir = this.unit.side === 'ally' ? 1 : -1;
    const bob = Math.sin(time * 1.7 + this.phase) * 1.4;
    let lunge = 0;
    let swing = 0;
    let cast = 0;
    let guard = 0;
    let walk = this.walkT < 1;
    let walkPhase = time * 11;

    if (this.anim) {
      const p = clamp(this.anim.t / this.anim.duration, 0, 1);
      const thrust = Math.sin(Math.PI * Math.min(1, p * 1.25));
      if (this.anim.type === 'attack') {
        lunge = thrust * 20;
        swing = thrust;
      } else if (this.anim.type === 'cast') {
        cast = Math.sin(Math.PI * p);
        lunge = -4 * cast;
      } else if (this.anim.type === 'defend') {
        guard = Math.sin(Math.PI * p);
      }
    }

    ctx.save();
    ctx.translate(this.sx + dir * lunge, this.sy);
    const deathP = this.dead ? clamp(this.deathT / 0.9, 0, 1) : 0;
    if (this.dead) {
      ctx.globalAlpha = Math.max(0, 1 - deathP);
      ctx.rotate(-dir * deathP * 0.9);
      ctx.translate(0, deathP * 10);
    }
    ctx.scale(scale, scale);

    // Shadow stays on the ground even while the body falls.
    if (!this.dead) drawShadow(ctx, 1, this.art.beast ? 46 : 34);

    // Active / target rings on the ground.
    if (this.active || this.hover || this.targetValid) {
      const color = this.targetValid ? '#d8574a' : this.active ? '#e0b34a' : '#f2e6c4';
      const alpha = this.targetValid ? 0.62 : this.active ? 0.55 + Math.sin(time * 3) * 0.16 : 0.5;
      ctx.save();
      ctx.scale(1, 0.34);
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = 2.4 / Math.max(0.2, this.scale);
      ctx.beginPath();
      ctx.arc(0, 2, (this.art.beast ? 54 : 38) / Math.max(0.2, this.scale), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Contact glow for active unit.
    if (this.active && !this.dead) {
      const g = ctx.createRadialGradient(0, -10, 2, 0, -10, 80);
      g.addColorStop(0, 'rgba(224, 179, 74, 0.16)');
      g.addColorStop(1, 'rgba(224, 179, 74, 0)');
      ctx.fillStyle = g;
      ellipse(ctx, 0, -10, 80, 34);
      ctx.fill();
    }

    if (this.hitTimer > 0) {
      const k = this.hitTimer / 0.4;
      ctx.shadowColor = '#ff7a5a';
      ctx.shadowBlur = 22 * k;
    } else {
      // A soft dark halo separates the silhouette from the painted ground.
      ctx.shadowColor = 'rgba(0,0,0,0.78)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
    }

    drawUnitSprite(ctx, this.unit, this.art, {
      dir,
      breathe: bob,
      swing,
      cast,
      guard,
      walk,
      walkPhase,
    });

    ctx.shadowBlur = 0;
    ctx.restore();

    // HP bar above the unit, only when damaged or inspected.
    if (!this.dead && (this.active || this.hover || this.unit.hp < this.unit.maxHp)) {
      const w = 44 * scale;
      const x = this.sx - w / 2;
      const y = this.bodyTop() - 12 * scale;
      ctx.fillStyle = 'rgba(6, 5, 4, 0.72)';
      roundRect(ctx, x - 1, y - 1, w + 2, 6 + 2, 2);
      ctx.fill();
      ctx.fillStyle = '#2a1c15';
      ctx.fillRect(x, y, w, 6);
      const pct = clamp(this.unit.hp / this.unit.maxHp, 0, 1);
      const grad = ctx.createLinearGradient(x, y, x + w, y);
      grad.addColorStop(0, pct < 0.3 ? '#8f2d24' : '#6f8b3f');
      grad.addColorStop(1, pct < 0.3 ? '#d8574a' : '#a8c45e');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w * pct, 6);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export class BattleScene {
  constructor(container) {
    this.container = container;
    this.unitViews = new Map();
    this.time = 0;
    this.shakeAmount = 0;
    this.themeName = 'ruins';
    this.theme = THEMES.ruins;
    this.embers = [];
    this.mist = [];
    this.reduceMotion = false;
    try {
      this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
    } catch {
      this.reduceMotion = false;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'battle-canvas';
    canvas.setAttribute('aria-label', 'Battlefield');
    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!this.ctx) {
      container.innerHTML = '<div class="render-error">This browser cannot create a 2D canvas. Try a current browser.</div>';
      throw new Error('2D canvas unavailable');
    }
    this.renderer = { domElement: canvas };
    this.effects = new CanvasEffects(this);
    this.resize();
    this.onResize = () => this.resize();
    this.resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(this.onResize, 120);
    });
    this.build('ruins');
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  typeColor(type) {
    return {
      physical: '#ffd8a0',
      fire: '#ff7a24',
      cold: '#8fe7d4',
      holy: '#ffe7a8',
      poison: '#9bc24b',
      heal: '#a8d98a',
      death: '#8fe7d4',
    }[type] || '#ffd8a0';
  }

  resize() {
    const W = Math.max(320, this.container.clientWidth || window.innerWidth);
    const H = Math.max(240, this.container.clientHeight || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = W;
    this.H = H;
    this.dpr = dpr;
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.canvas.style.width = `${W}px`;
    this.canvas.style.height = `${H}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.horizon = H * 0.36;
    this.groundBottom = H * 1.02;
    // Scale from both axes: a tall phone must not get desktop-sized units.
    this.sizeK = clamp(Math.min(W / 900, H / 590), 0.58, 1.42);
    this.background = paintBackground(W, H, this.theme, 1997);
    this.rebuildAtmosphere();
    for (const view of this.unitViews.values()) {
      view.home = this.slotScreen(view.unit);
    }
  }

  rebuildAtmosphere() {
    const rand = lcg(311 + this.themeName.length);
    this.embers = Array.from({ length: this.theme.props === 'marsh' ? 36 : 58 }, () => ({
      x: rand() * this.W,
      y: rand() * this.H * 0.9,
      vx: (rand() - 0.5) * (5 + this.theme.wind * 10),
      vy: -(6 + rand() * 18),
      size: 0.6 + rand() * 2.2,
      phase: rand() * TAU,
      alpha: 0.18 + rand() * 0.55,
    }));
    this.mist = Array.from({ length: 10 }, () => ({
      x: rand() * this.W,
      y: this.H * (0.46 + rand() * 0.35),
      rx: this.W * (0.09 + rand() * 0.16),
      ry: this.H * (0.012 + rand() * 0.03),
      vx: 3 + rand() * 9,
      alpha: 0.05 + rand() * 0.09,
    }));
  }

  build(themeName) {
    this.themeName = THEMES[themeName] ? themeName : 'ruins';
    this.theme = THEMES[this.themeName];
    this.background = paintBackground(this.W, this.H, this.theme, 1997 + this.themeName.length * 97);
    this.rebuildAtmosphere();
  }

  slotScreen(unit) {
    const side = unit.side;
    const rank = unit.rank;
    const col = unit.col;
    const zBase = rank === 'F' ? 4.95 : 2.95;
    const z = zBase + col * 0.55;
    // Columns spread across the field instead of stacking on one another, so
    // every silhouette stays readable at a glance.
    const base = rank === 'F' ? 1.85 : 4.15;
    const colOffset = (col - 1) * 0.8;
    const x = side === 'ally' ? -(base + colOffset) : (base + colOffset);
    const t = clamp(z / 10, 0, 1);
    const y = this.horizon + (this.groundBottom - this.horizon) * (0.08 + 0.92 * Math.pow(t, 1.32));
    const scale = 0.58 + 0.92 * t;
    const spread = Math.max(this.W / 12.5, 46);
    const margin = Math.min(64, this.W * 0.12);
    // On wide layouts the initiative tower eats the right edge; bias the field
    // slightly left so the outer enemy column is not hidden behind it.
    const centerX = this.W >= 900 ? this.W * 0.475 : this.W * 0.5;
    const sx = clamp(centerX + x * spread * scale, margin, this.W - margin);
    return { x: sx, y, scale };
  }

  spawnUnits(units) {
    this.unitViews.clear();
    for (const unit of units) {
      this.unitViews.set(unit.uid, new UnitView(this, unit));
    }
  }

  getView(uid) {
    return this.unitViews.get(uid) || null;
  }

  setActive(uid) {
    for (const [key, view] of this.unitViews) view.setActive(key === uid);
  }

  setTargets(validUids = []) {
    const valid = new Set(validUids);
    for (const [uid, view] of this.unitViews) view.setValidTarget(valid.has(uid));
  }

  clearTargets() {
    for (const view of this.unitViews.values()) view.setValidTarget(false);
  }

  setHover(uid) {
    for (const [key, view] of this.unitViews) view.setHover(key === uid);
  }

  syncSlots() {
    for (const view of this.unitViews.values()) view.setSlot();
  }

  worldPosition(uid) {
    const view = this.unitViews.get(uid);
    if (!view) return null;
    const s = view.scale * this.sizeK;
    return {
      x: view.sx,
      y: view.sy - UNIT_HEIGHT * s * 0.58,
      z: 0,
      clone() { return { ...this }; },
    };
  }

  project(position) {
    return { x: position.x, y: position.y, visible: true };
  }

  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const views = [...this.unitViews.values()]
      .filter((view) => !view.dead && view.unit.alive)
      .sort((a, b) => b.scale - a.scale);
    for (const view of views) {
      if (view.hitTest(x, y)) return view.unit.uid;
    }
    return null;
  }

  shake(amount = 0.15) {
    if (this.reduceMotion) return;
    this.shakeAmount = Math.max(this.shakeAmount, amount);
  }

  loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.time += dt;
    this.effects.update(dt);
    for (const view of this.unitViews.values()) view.update(dt, this.time);
    this.updateAmbient(dt);
    this.render();
    requestAnimationFrame(this.loop);
  }

  updateAmbient(dt) {
    for (const ember of this.embers) {
      ember.x += (ember.vx + Math.sin(this.time * 0.7 + ember.phase) * 5) * dt;
      ember.y += ember.vy * dt;
      if (ember.y < -10) {
        ember.y = this.H * 0.92;
        ember.x = Math.random() * this.W;
      }
      if (ember.x < -10) ember.x = this.W + 10;
      if (ember.x > this.W + 10) ember.x = -10;
    }
    for (const wisp of this.mist) {
      wisp.x += wisp.vx * dt * this.theme.wind;
      if (wisp.x - wisp.rx > this.W) wisp.x = -wisp.rx;
    }
    if (this.shakeAmount > 0.001) this.shakeAmount *= Math.pow(0.0015, dt);
    else this.shakeAmount = 0;
  }

  render() {
    const { ctx, W, H } = this;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    let ox = 0;
    let oy = 0;
    if (this.shakeAmount > 0.001) {
      ox = (Math.random() - 0.5) * this.shakeAmount * 34;
      oy = (Math.random() - 0.5) * this.shakeAmount * 22;
    }
    ctx.save();
    ctx.translate(ox, oy);

    ctx.drawImage(this.background, 0, 0, W, H);
    this.drawRays(ctx);
    this.drawMist(ctx);

    const views = [...this.unitViews.values()].sort((a, b) => a.scale - b.scale);
    for (const view of views) view.draw(ctx, this.time);

    this.effects.draw(ctx, this.time);
    this.drawEmbers(ctx);
    ctx.restore();

    // A subtle top-to-bottom vignette; CSS adds the ornate edge.
    const vig = ctx.createLinearGradient(0, 0, 0, H);
    vig.addColorStop(0, 'rgba(4,3,3,0.22)');
    vig.addColorStop(0.35, 'rgba(4,3,3,0)');
    vig.addColorStop(1, 'rgba(4,3,3,0.18)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  drawRays(ctx) {
    if (this.reduceMotion) return;
    const theme = this.theme;
    const sunX = this.W * theme.sunX;
    const sunY = this.H * theme.sunY;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i += 1) {
      const sway = Math.sin(this.time * 0.12 + i * 1.7) * this.W * 0.012;
      const spread = this.W * (0.035 + i * 0.018);
      const endX = sunX + sway + (i - 1.5) * this.W * 0.05;
      const endY = this.H * (0.95 + i * 0.01);
      const g = ctx.createLinearGradient(sunX, sunY, endX, endY);
      g.addColorStop(0, rgba(theme.sun, 0.07));
      g.addColorStop(0.55, rgba(theme.sun, 0.025));
      g.addColorStop(1, rgba(theme.sun, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(sunX + (i - 2) * 12, sunY);
      ctx.lineTo(endX - spread, endY);
      ctx.lineTo(endX + spread, endY);
      ctx.lineTo(sunX + (i - 1) * 16, sunY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawMist(ctx) {
    ctx.save();
    for (const wisp of this.mist) {
      const g = ctx.createRadialGradient(wisp.x, wisp.y, 1, wisp.x, wisp.y, wisp.rx);
      g.addColorStop(0, `rgba(210, 195, 165, ${wisp.alpha})`);
      g.addColorStop(1, 'rgba(210, 195, 165, 0)');
      ctx.fillStyle = g;
      ellipse(ctx, wisp.x, wisp.y, wisp.rx, wisp.ry);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEmbers(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ember of this.embers) {
      const flicker = 0.55 + Math.sin(this.time * 3 + ember.phase) * 0.45;
      ctx.fillStyle = rgba(this.theme.ember, ember.alpha * flicker);
      ellipse(ctx, ember.x, ember.y, ember.size, ember.size);
      ctx.fill();
    }
    ctx.restore();
  }
}
