(() => {
  const W = 12;
  const H = 24;
  const GRAVITY = 2400;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function spawn(x, y) {
    const el = document.createElement('div');
    el.className = 'cursor-bounce';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    const bounces = 1 + Math.floor(Math.random() * 3);
    const grounds = [];
    let lastGround = y;
    for (let i = 0; i < bounces; i++) {
      lastGround = lastGround + rand(40, 180);
      grounds.push(lastGround);
    }

    const centerX = window.innerWidth / 2;
    const bias = Math.sign(centerX - (x + W / 2)) || (Math.random() < 0.5 ? -1 : 1);
    const speed = rand(200, 450);
    let vx = bias * speed * rand(0.4, 1);
    let vy = rand(-450, -150);
    let px = 0;
    let py = 0;
    let groundIdx = 0;
    let last = performance.now();

    function tick(t) {
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      vy += GRAVITY * dt;
      px += vx * dt;
      py += vy * dt;

      const ground = grounds[groundIdx] - y;
      if (py >= ground && vy > 0) {
        if (groundIdx === grounds.length - 1) {
          el.style.transition = 'opacity 0.3s';
          el.style.opacity = '0';
          setTimeout(() => el.remove(), 300);
          return;
        }
        py = ground;
        vy = -vy * 0.7;
        vx *= 0.85;
        groundIdx++;
      }

      el.style.transform = `translate(${px}px, ${py}px)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, summary, input, textarea, label, [contenteditable]')) return;
    spawn(e.clientX - W / 2, e.clientY - H / 2);
  });
})();
