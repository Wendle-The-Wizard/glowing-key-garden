// Glowing Key Garden: step 5, blooms now fade slowly away.
const canvas = document.getElementById('garden');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const last = document.getElementById('last');

// all the blooms currently in the garden
const blooms = [];

// how long a bloom lives, in milliseconds (opens fast, then drifts away)
const LIFE = 8000;

const rows = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const scale = [0, 2, 4, 7, 9]; // pentatonic, so everything sounds gentle

let audio = null;

function getAudio() {
  if (!audio) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audio = new AC();
  }
  if (audio.state === 'suspended') audio.resume();
  return audio;
}

function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

function freqFor(name) {
  const h = hashName(name);
  const step = scale[h % scale.length];
  const octave = Math.floor(h / 5) % 3;
  return 261.63 * Math.pow(2, (step + octave * 12) / 12);
}

function playNote(name) {
  const a = getAudio();
  if (!a) return;
  const f = freqFor(name);
  const t = a.currentTime;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
  gain.connect(a.destination);
  [[f, 1], [f * 2, 0.25]].forEach(function (p) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sine';
    o.frequency.value = p[0];
    g.gain.value = p[1];
    o.connect(g);
    g.connect(gain);
    o.start(t);
    o.stop(t + 1.7);
  });
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

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
  if (blooms.length > 80) blooms.shift();
}

// the loop runs all the time; it's cheap when the garden is empty
function frame() {
  const t = performance.now();
  // forget blooms that have fully faded
  for (let i = blooms.length - 1; i >= 0; i--) {
    if (t - blooms[i].born > LIFE) blooms.splice(i, 1);
  }
  draw(t);
  requestAnimationFrame(frame);
}

function draw(t) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#07060f';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = 'lighter';
  for (const b of blooms) {
    const ms = t - b.born;
    const open = Math.min(ms / 600, 1);
    const ease = 1 - Math.pow(1 - open, 3);
    // fade: stays bright a moment, then slowly dims to nothing
    const left = Math.max(0, 1 - ms / LIFE);
    const alpha = left * left;
    const r = b.size * (0.2 + 0.8 * ease) * 1.6 * (0.7 + 0.3 * left);
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    g.addColorStop(0, 'hsla(' + b.hue + ',90%,70%,' + (0.85 * alpha) + ')');
    g.addColorStop(0.4, 'hsla(' + b.hue + ',90%,55%,' + (0.35 * alpha) + ')');
    g.addColorStop(1, 'hsla(' + b.hue + ',90%,40%,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // when the garden is empty again, it goes back to sleep
  if (blooms.length === 0 && started) hint.style.opacity = '1';
}

let started = false;

function handleKey(name, x, y) {
  started = true;
  hint.style.opacity = '0';
  last.textContent = 'You pressed: ' + name;
  addBloom(name, x, y);
  playNote(name);
}

function onKey(event) {
  if (event.repeat) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta') return;
  const name = event.key === ' ' ? 'Space' : event.key;
  const s = spotFor(name);
  handleKey(name, s.x, s.y);
}

window.addEventListener('keydown', onKey);

// phones have no keyboard, so a tap blooms right where you touch
window.addEventListener('pointerdown', function (e) {
  handleKey('tap' + (blooms.length % 7), e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  last.textContent = 'You tapped the garden';
});

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(frame);
