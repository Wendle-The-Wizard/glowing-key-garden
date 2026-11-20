// Glowing Key Garden: step 3, every key blooms a glowing patch.
const canvas = document.getElementById('garden');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const last = document.getElementById('last');

// all the blooms currently in the garden
const blooms = [];

// the keyboard rows, so each key gets a spot that matches where it sits
const rows = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function resize() {
  // use devicePixelRatio so it looks crisp on phones
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

// a simple number from text, so unknown keys still get a steady spot and colour
function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

// work out where a key blooms (x, y as 0..1)
function spotFor(name) {
  const k = name.toLowerCase();
  for (let r = 0; r < rows.length; r++) {
    const c = rows[r].indexOf(k);
    if (k.length === 1 && c >= 0) {
      const x = (c + 0.5 + r * 0.25) / (rows[r].length + 0.5);
      const y = (r + 0.7) / (rows.length + 0.4);
      return { x: Math.min(x, 0.95), y: y };
    }
  }
  const h = hashName(name);
  return { x: 0.1 + (h % 80) / 100, y: 0.1 + ((h >> 8) % 80) / 100 };
}

function addBloom(name, x, y) {
  const h = hashName(name);
  blooms.push({
    x: x * window.innerWidth,
    y: y * window.innerHeight,
    hue: (h * 47) % 360,
    born: performance.now(),
    size: 60 + (h % 60)
  });
  if (blooms.length > 80) blooms.shift(); // keep it light
  requestAnimationFrame(frame);
}

let running = false;
function frame(now) {
  draw();
  // keep animating while any bloom is still opening
  const t = performance.now();
  running = blooms.some(function (b) { return t - b.born < 700; });
  if (running) requestAnimationFrame(frame);
}

function draw() {
  // a deep night colour
  ctx.fillStyle = '#07060f';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  const t = performance.now();
  ctx.globalCompositeOperation = 'lighter'; // light adds up, so overlaps glow
  for (const b of blooms) {
    const age = Math.min((t - b.born) / 600, 1);
    const ease = 1 - Math.pow(1 - age, 3); // opens fast, then slows
    const r = b.size * (0.2 + 0.8 * ease) * 1.6;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    g.addColorStop(0, 'hsla(' + b.hue + ',90%,70%,0.85)');
    g.addColorStop(0.4, 'hsla(' + b.hue + ',90%,55%,0.35)');
    g.addColorStop(1, 'hsla(' + b.hue + ',90%,40%,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}

function onKey(event) {
  if (event.repeat) return; // ignore a held-down key repeating
  if (event.ctrlKey || event.metaKey || event.altKey) return; // leave shortcuts alone
  const name = event.key === ' ' ? 'Space' : event.key;
  if (name.length > 1 && name !== 'Space' && name.indexOf('Arrow') !== 0) {
    // other special keys still bloom, just somewhere by name
  }
  const s = spotFor(name);
  handleKey(name, s.x, s.y);
}

function handleKey(name, x, y) {
  hint.style.opacity = '0';
  last.textContent = 'You pressed: ' + name;
  addBloom(name, x, y);
}

window.addEventListener('keydown', onKey);

// phones have no keyboard, so a tap blooms right where you touch
canvas.addEventListener('pointerdown', function (e) {
  handleKey('tap' + blooms.length, e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  last.textContent = 'You tapped the garden';
});

window.addEventListener('resize', resize);
resize();
