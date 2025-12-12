// script.js
document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------
  // Smooth scrolling for anchor links
  // ---------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ---------------------------
  // Form Validation
  // ---------------------------
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (event) => {
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const message = document.getElementById('message')?.value || '';

      if (!name.trim() || !email.trim() || !message.trim()) {
        alert("Please fill in all fields.");
        event.preventDefault();
        return;
      }
      if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        event.preventDefault();
        return;
      }
    });
  }

  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.toLowerCase());
  }

  // ---------------------------
  // Drawing Canvas + Spray Paint + Clear Button
  // ---------------------------
  const canvas = document.getElementById('drawboard');
  const clearBtn = document.getElementById('clear-board');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let drawing = false;
  let lastPoint = null;
  let brushColor = 'rgb(255,255,255)'; // Default white
  let sprayRadius = 25;
  let sprayDensity = 30;

  // Resize canvas while preserving content
  function resizeCanvasPreserve() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (canvas.width === w && canvas.height === h) return;

    const tmp = document.createElement('canvas');
    tmp.width = canvas.width || 1;
    tmp.height = canvas.height || 1;
    tmp.getContext('2d')?.drawImage(canvas, 0, 0);

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, w, h);
  }

  resizeCanvasPreserve();
  window.addEventListener('resize', () => {
    setTimeout(resizeCanvasPreserve, 100);
  });

  // Color picker buttons
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      brushColor = btn.getAttribute('data-color');
    });
  });

  // Get pointer position relative to canvas
  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  function pointerDown(evt) {
    if (evt.pointerType === 'mouse' && evt.button !== 0) return;
    drawing = true;
    canvas.setPointerCapture(evt.pointerId);
    lastPoint = getPos(evt);
    evt.preventDefault();
  }

  function pointerMove(evt) {
    if (!drawing || !lastPoint) return;
    const p = getPos(evt);

    // Spray paint effect
    ctx.fillStyle = brushColor;
    for (let i = 0; i < sprayDensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * sprayRadius;
      const x = p.x + Math.cos(angle) * distance;
      const y = p.y + Math.sin(angle) * distance;
      const size = Math.random() * 2 + 0.5;
      ctx.fillRect(x, y, size, size);
    }

    lastPoint = p;
    evt.preventDefault();
  }

  function pointerUp(evt) {
    if (drawing) {
      drawing = false;
      canvas.releasePointerCapture(evt.pointerId);
      lastPoint = null;
      ctx.beginPath();
    }
    evt.preventDefault();
  }

  // Pointer cancel
  function pointerCancel(evt) {
    drawing = false;
    lastPoint = null;
    ctx.beginPath();
    try { canvas.releasePointerCapture(evt.pointerId); } catch {}
  }

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerCancel);
  canvas.addEventListener('lostpointercapture', pointerCancel);

  // Clear button
  clearBtn?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Keyboard shortcut: 'c' to clear
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c' && !(document.activeElement && document.activeElement.tagName === 'INPUT')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
});
