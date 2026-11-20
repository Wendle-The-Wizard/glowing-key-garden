// Step 1: make a dark canvas that always fits the window.
const canvas = document.getElementById('garden');
const ctx = canvas.getContext('2d');

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

window.addEventListener('resize', resize);
resize();
