const svg = document.getElementById('svg');
const linha = document.getElementById('linha');
const originalD = linha.getAttribute('d');  // Guarda o path original

const totalPoints = 200;
const length = linha.getTotalLength();

let points = [];
for (let i = 0; i <= totalPoints; i++) {
  const pt = linha.getPointAtLength((i / totalPoints) * length);
  points.push({ x: pt.x, y: pt.y, baseY: pt.y });
}

let activeWaves = [];
const waveDuration = 3000;
let animationFrame;

function buildPath(offsets) {
  // Desenha com linhas retas para evitar mini ondulações
  let d = `M${points[0].x},${points[0].baseY + offsets[0]}`;
  for (let i = 1; i < points.length; i++) {
    const x = points[i].x;
    const y = points[i].baseY + offsets[i];
    d += ` L${x},${y}`;
  }
  return d;
}

function waveOffsets(time, wave) {
  const offsets = new Array(points.length).fill(0);

  const wavelength = 30;
  const speed = 0.003;
  const maxAmplitude = 5;
  const decay = 0.005;           // decaimento para reduzir ondulações
  const maxWaveDistance = 50;   // limite de alcance da onda

  const elapsed = time - wave.startTime;
  if (elapsed < 0 || elapsed > waveDuration) return offsets;

  const fadeStart = waveDuration * 0.7;
  let fadeFactor = 1;
  if (elapsed > fadeStart) {
    fadeFactor = 1 - (elapsed - fadeStart) / (waveDuration - fadeStart);
    if (fadeFactor < 0) fadeFactor = 0;
  }

  const amplitude = maxAmplitude * fadeFactor;

  for (let i = 0; i < points.length; i++) {
    const dist = Math.abs(i - wave.origin);
    if (dist > maxWaveDistance) continue;

    const timeFactor = elapsed * speed - dist / wavelength;
    if (timeFactor >= 0) {
      offsets[i] = amplitude * Math.sin(timeFactor * 2 * Math.PI) * Math.exp(-decay * dist * dist);
    }
  }
  return offsets;
}

function animate(time) {
  if (!time) time = performance.now();

  activeWaves = activeWaves.filter(wave => (time - wave.startTime) < waveDuration);

  if (activeWaves.length === 0) {
    // Voltar ao path original exatamente quando não há animação
    linha.setAttribute('d', originalD);
    animationFrame = null;
    return;
  }

  let totalOffsets = new Array(points.length).fill(0);
  for (const wave of activeWaves) {
    const offsets = waveOffsets(time, wave);
    for (let i = 0; i < points.length; i++) {
      totalOffsets[i] += offsets[i];
    }
  }

  linha.setAttribute('d', buildPath(totalOffsets));
  animationFrame = requestAnimationFrame(animate);
}

svg.addEventListener('mousemove', e => {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;

  const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse());

  let closestIndex = 0;
  let minDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - cursorPt.x;
    const dy = points[i].y - cursorPt.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }

  const maxDist = 15;

  if (minDist <= maxDist) {
    activeWaves.push({ origin: closestIndex, startTime: performance.now() });
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    }
  }
});
