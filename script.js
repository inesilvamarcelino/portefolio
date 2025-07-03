document.addEventListener('DOMContentLoaded', function() {
  // ---------------- link da página atual----------------
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'index.html') {
    document.getElementById('work-link').classList.add('active');
  } else if (currentPage === 'about.html') {
    document.getElementById('about-link').classList.add('active');
  } else if (currentPage === 'contacts.html') {
    document.getElementById('contacts-link').classList.add('active');
  }

  // ---------------- Animação da linha ----------------
  const svg = document.getElementById('svg');
  const linha = document.getElementById('linha');
  const originalD = linha.getAttribute('d');
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
    const decay = 0.005;
    const maxWaveDistance = 50;

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

  // 3. Comportamento sticky da navbar
  const navbar = document.querySelector('.navbar');
  const linhaElement = document.querySelector('.linha');
  let lastScrollPosition = 0;
  let navbarHidden = false;

  function handleScroll() {
    const currentScrollPosition = window.scrollY;
    const linhaRect = linhaElement.getBoundingClientRect();
    const linhaBottom = linhaRect.bottom + window.scrollY;

    if (currentScrollPosition >= linhaBottom) {
      navbar.classList.add('sticky');
      navbar.classList.remove('hidden');
    } else {
      navbar.classList.remove('sticky');
      navbar.classList.remove('hidden');
    }

    if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
      if (!navbarHidden && currentScrollPosition > linhaBottom) {
        navbar.classList.add('hidden');
        navbarHidden = true;
      }
    } else {
      if (navbarHidden) {
        navbar.classList.remove('hidden');
        navbarHidden = false;
      }
    }

    lastScrollPosition = currentScrollPosition;
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();
});


// ---------------------------filtros-----------------------------

document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    // Atualizar botão ativo
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filtro = button.getAttribute('data-filter');
    const projetos = document.querySelectorAll('.projeto');

    projetos.forEach(projeto => {
      if (filtro === 'all') {
        projeto.classList.remove('hidden');
      } else {
        projeto.classList.toggle('hidden', !projeto.classList.contains(filtro));
      }
    });
  });
});
