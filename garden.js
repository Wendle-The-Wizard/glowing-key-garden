// Step 1: make a dark canvas that always fits the window.
const canvas = document.getElementById('garden');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const last = document.getElementById('last');

function resize() {
  // use devicePixelRatio so it looks crisp on phones
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function draw() {
  // a deep night colour; flowers will come later
  ctx.fillStyle = '#07060f';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

// Step 2: listen for key presses.
// For now I just show which key was pressed. Blooms come in step 3!
function onKey(event) {
  if (event.repeat) return; // ignore a held-down key repeating
  if (event.ctrlKey || event.metaKey || event.altKey) return; // leave shortcuts alone
  const name = event.key === ' ' ? 'Space' : event.key;
  handleKey(name);
}

function handleKey(name) {
  hint.style.opacity = '0';
  last.textContent = 'You pressed: ' + name;
  console.log('key pressed:', name);
}

window.addEventListener('keydown', onKey);

// phones have no keyboard, so a tap counts as a key too
canvas.addEventListener('pointerdown', function () {
  handleKey('tap');
});

window.addEventListener('resize', resize);
resize();
