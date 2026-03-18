/* ============================================================
   CORE GAME LOGIC (preserved from original)
   ============================================================ */

class Tablero {
  constructor(filas, columnas, bombas) {
    this.filas    = filas;
    this.columnas = columnas;
    this.bombas   = bombas;
    this.tablero  = [];
    this.inicializarTablero();
    this.generarBombas();
    this.mostrarCeldasAgua();
  }

  inicializarTablero() {
    for (let i = 0; i < this.filas; i++) {
      this.tablero[i] = [];
      for (let j = 0; j < this.columnas; j++) {
        this.tablero[i][j] = ' ';
      }
    }
  }

  generarBombas() {
    let placed = 0;
    while (placed < this.bombas) {
      const r = Math.floor(Math.random() * this.filas);
      const c = Math.floor(Math.random() * this.columnas);
      if (this.tablero[r][c] !== '*') {
        this.tablero[r][c] = '*';
        placed++;
      }
    }
  }

  mostrarCeldasAgua() {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        if (this.tablero[i][j] === ' ') {
          let minas = 0;
          for (let k = -1; k <= 1; k++) {
            for (let l = -1; l <= 1; l++) {
              const ni = i + k, nj = j + l;
              if (ni >= 0 && ni < this.filas && nj >= 0 && nj < this.columnas) {
                if (this.tablero[ni][nj] === '*') minas++;
              }
            }
          }
          this.tablero[i][j] = minas;
        }
      }
    }
  }
}

class Casilla {
  constructor(fila, columna, tableroObj) {
    this.fila    = fila;
    this.columna = columna;
    this.tablero = tableroObj;
    this.valor   = tableroObj.tablero[fila][columna];
  }

  rellenarValor() {
    if (this.valor === ' ') {
      let minas = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const ni = this.fila + i, nj = this.columna + j;
          if (ni >= 0 && ni < this.tablero.filas && nj >= 0 && nj < this.tablero.columnas) {
            if (this.tablero.tablero[ni][nj] === '*') minas++;
          }
        }
      }
      this.valor = minas;
    }
  }
}

// Recursive flood-fill reveal (core logic preserved)
function mostrarCeldasAdyacentes(tableroObj, fila, columna) {
  if (fila < 0 || fila >= tableroObj.filas || columna < 0 || columna >= tableroObj.columnas) return;
  if (cellStates[fila][columna] !== 'hidden') return;

  const valor = tableroObj.tablero[fila][columna];
  if (valor === '*') return;

  cellStates[fila][columna] = 'revealed';
  revealCellDOM(fila, columna);

  if (valor === 0) {
    for (let k = -1; k <= 1; k++) {
      for (let l = -1; l <= 1; l++) {
        if (k !== 0 || l !== 0) {
          mostrarCeldasAdyacentes(tableroObj, fila + k, columna + l);
        }
      }
    }
  }
}

/* ============================================================
   STATE
   ============================================================ */
let tablero      = null;
let cellStates   = [];          // 'hidden' | 'revealed' | 'flagged' | 'question'
let gameState    = 'idle';      // idle | playing | won | lost
let currentDiff  = 'easy';
let timerInterval = null;
let timerSeconds = 0;
let firstClick   = true;
let pendingWin   = null;        // { time, diff } — saved until registration done

// Long-press support (mobile flag)
let longPressTimer = null;
let longPressActive = false;

const DIFFICULTIES = {
  easy:   { filas: 9,  columnas: 9,  bombas: 10 },
  medium: { filas: 16, columnas: 16, bombas: 40 },
  hard:   { filas: 16, columnas: 30, bombas: 99 },
};

/* ============================================================
   INIT
   ============================================================ */
function getConfig() {
  if (currentDiff === 'custom') {
    let r = parseInt(document.getElementById('custom-rows').value)  || 10;
    let c = parseInt(document.getElementById('custom-cols').value)  || 10;
    let m = parseInt(document.getElementById('custom-mines').value) || 15;
    r = Math.min(Math.max(r, 5), 30);
    c = Math.min(Math.max(c, 5), 30);
    m = Math.min(Math.max(m, 1), r * c - 9);
    return { filas: r, columnas: c, bombas: m };
  }
  return { ...DIFFICULTIES[currentDiff] };
}

function init() {
  const { filas, columnas, bombas } = getConfig();

  clearInterval(timerInterval);
  timerSeconds = 0;
  firstClick   = true;
  gameState    = 'idle';

  tablero    = new Tablero(filas, columnas, bombas);
  cellStates = Array.from({ length: filas }, () => Array(columnas).fill('hidden'));

  renderBoard(filas, columnas);
  computeCellSize(filas, columnas);
  updateMineCounter();
  updateTimerDisplay();
  updateBestTimeDisplay();
  hideOverlay();
}

function computeCellSize(filas, columnas) {
  const board = document.getElementById('tablero');
  const maxW  = Math.min(window.innerWidth  - 24, 900);
  const maxH  = Math.min(window.innerHeight - 240, 700);
  const byW   = Math.floor((maxW - 16 - (columnas - 1) * 2) / columnas);
  const byH   = Math.floor((maxH - 16 - (filas    - 1) * 2) / filas);
  const size  = Math.max(Math.min(byW, byH, 40), 18);
  board.style.setProperty('--cell-size', size + 'px');
  board.style.setProperty('--filas',    filas);
  board.style.setProperty('--columnas', columnas);
}

/* ============================================================
   RENDER BOARD
   ============================================================ */
function renderBoard(filas, columnas) {
  const boardEl = document.getElementById('tablero');
  boardEl.innerHTML = '';

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const cell = document.createElement('div');
      cell.className   = 'celda';
      cell.id          = `celda-${i}-${j}`;
      cell.dataset.row = i;
      cell.dataset.col = j;

      cell.addEventListener('click',        onCellClick);
      cell.addEventListener('contextmenu',  onCellRightClick);

      // Mobile long-press → flag
      cell.addEventListener('touchstart', onTouchStart, { passive: true });
      cell.addEventListener('touchend',   onTouchEnd,   { passive: false });
      cell.addEventListener('touchmove',  onTouchCancel,{ passive: true });

      boardEl.appendChild(cell);
    }
  }
}

/* ---- Write revealed state to DOM ---- */
function revealCellDOM(r, c) {
  const el    = document.getElementById(`celda-${r}-${c}`);
  if (!el) return;
  const valor = tablero.tablero[r][c];

  el.classList.remove('flagged', 'question');
  el.classList.add('revealed');

  if (valor === 0) {
    el.classList.add('celda-cero');
  } else if (valor > 0) {
    el.textContent = valor;
    const names = ['','celda-uno','celda-dos','celda-tres','celda-cuatro',
                       'celda-cinco','celda-seis','celda-siete','celda-ocho'];
    el.classList.add(names[valor]);
  }
}

/* ============================================================
   CLICK HANDLERS
   ============================================================ */
function onCellClick(e) {
  if (gameState === 'won' || gameState === 'lost') return;

  const r = +this.dataset.row;
  const c = +this.dataset.col;
  const s = cellStates[r][c];

  if (s === 'flagged' || s === 'question') return;

  if (s === 'revealed') {
    chordReveal(r, c);
    return;
  }

  // ---- First click: guarantee safety ----
  if (firstClick) {
    firstClick = false;
    if (tablero.tablero[r][c] === '*') {
      let tries = 0;
      while (tablero.tablero[r][c] === '*' && tries < 200) {
        tablero    = new Tablero(tablero.filas, tablero.columnas, tablero.bombas);
        cellStates = Array.from({ length: tablero.filas }, () => Array(tablero.columnas).fill('hidden'));
        tries++;
      }
    }
    gameState = 'playing';
    timerInterval = setInterval(() => { timerSeconds++; updateTimerDisplay(); }, 1000);
  }

  revealCell(r, c);
}

function onCellRightClick(e) {
  e.preventDefault();
  if (gameState === 'won' || gameState === 'lost') return;

  const r = +this.dataset.row;
  const c = +this.dataset.col;
  if (cellStates[r][c] === 'revealed') return;

  cycleFlag(r, c, this);
  updateMineCounter();
}

/* ============================================================
   MOBILE LONG PRESS
   ============================================================ */
function onTouchStart() {
  longPressActive = false;
  const el = this;
  longPressTimer = setTimeout(() => {
    longPressActive = true;
    const r = +el.dataset.row;
    const c = +el.dataset.col;
    if (gameState !== 'won' && gameState !== 'lost' && cellStates[r][c] !== 'revealed') {
      cycleFlag(r, c, el);
      updateMineCounter();
    }
  }, 480);
}

function onTouchEnd(e) {
  clearTimeout(longPressTimer);
  if (longPressActive) {
    longPressActive = false;
    e.preventDefault(); // suppress the click event
  }
}

function onTouchCancel() {
  clearTimeout(longPressTimer);
}

/* ============================================================
   FLAG CYCLE: hidden → flagged → question → hidden
   ============================================================ */
function cycleFlag(r, c, el) {
  const s = cellStates[r][c];
  if (s === 'hidden') {
    cellStates[r][c] = 'flagged';
    el.className     = 'celda flagged';
    SoundManager.play('flag');
  } else if (s === 'flagged') {
    cellStates[r][c] = 'question';
    el.className     = 'celda question';
  } else {
    cellStates[r][c] = 'hidden';
    el.className     = 'celda';
  }
}

/* ============================================================
   REVEAL LOGIC
   ============================================================ */
function revealCell(r, c) {
  if (cellStates[r][c] !== 'hidden') return;
  if (gameState === 'lost') return;

  const valor = tablero.tablero[r][c];

  if (valor === '*') {
    cellStates[r][c] = 'revealed';
    gameOver(r, c);
    return;
  }

  mostrarCeldasAdyacentes(tablero, r, c);
  SoundManager.play('reveal');
  checkWin();
}

/* ---- Chord: click revealed number with enough flags → reveal neighbours ---- */
function chordReveal(r, c) {
  const valor = tablero.tablero[r][c];
  if (typeof valor !== 'number' || valor === 0) return;

  let flags = 0;
  forNeighbors(r, c, (nr, nc) => {
    if (cellStates[nr][nc] === 'flagged') flags++;
  });
  if (flags !== valor) return;

  let hitMine = false;
  forNeighbors(r, c, (nr, nc) => {
    if (cellStates[nr][nc] === 'hidden') {
      if (tablero.tablero[nr][nc] === '*') {
        hitMine = true;
        cellStates[nr][nc] = 'revealed';
      } else {
        mostrarCeldasAdyacentes(tablero, nr, nc);
      }
    }
  });

  if (hitMine) {
    // Find an exploded mine cell to pass to gameOver
    let er = r, ec = c;
    forNeighbors(r, c, (nr, nc) => {
      if (tablero.tablero[nr][nc] === '*' && cellStates[nr][nc] === 'revealed') {
        er = nr; ec = nc;
      }
    });
    gameOver(er, ec);
    return;
  }

  SoundManager.play('reveal');
  checkWin();
}

function forNeighbors(r, c, fn) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < tablero.filas && nc >= 0 && nc < tablero.columnas) {
        fn(nr, nc);
      }
    }
  }
}

/* ============================================================
   GAME OVER
   ============================================================ */
function gameOver(explR, explC) {
  gameState = 'lost';
  clearInterval(timerInterval);
  SoundManager.play('explosion');

  // Board shake
  const wrapper = document.getElementById('board-wrapper');
  wrapper.classList.add('shake');
  wrapper.addEventListener('animationend', () => wrapper.classList.remove('shake'), { once: true });

  // Reveal all mines after short delay
  setTimeout(() => {
    for (let i = 0; i < tablero.filas; i++) {
      for (let j = 0; j < tablero.columnas; j++) {
        const el = document.getElementById(`celda-${i}-${j}`);
        if (!el) continue;
        if (i === explR && j === explC) {
          el.className = 'celda revealed mina-exploded';
        } else if (tablero.tablero[i][j] === '*' && cellStates[i][j] !== 'flagged') {
          el.className = 'celda revealed mina-revealed';
        } else if (cellStates[i][j] === 'flagged' && tablero.tablero[i][j] !== '*') {
          el.classList.add('wrong-flag');
        }
      }
    }

    setTimeout(() => showOverlay('lose', timerSeconds), 700);
  }, 150);
}

/* ============================================================
   WIN CHECK
   ============================================================ */
function checkWin() {
  let revealed = 0;
  for (let i = 0; i < tablero.filas; i++) {
    for (let j = 0; j < tablero.columnas; j++) {
      if (cellStates[i][j] === 'revealed') revealed++;
    }
  }
  if (revealed !== tablero.filas * tablero.columnas - tablero.bombas) return;

  gameState = 'won';
  clearInterval(timerInterval);
  SoundManager.play('win');

  // Auto-flag remaining mines
  for (let i = 0; i < tablero.filas; i++) {
    for (let j = 0; j < tablero.columnas; j++) {
      if (tablero.tablero[i][j] === '*' && cellStates[i][j] === 'hidden') {
        cellStates[i][j] = 'flagged';
        const el = document.getElementById(`celda-${i}-${j}`);
        if (el) el.className = 'celda flagged';
      }
    }
  }
  updateMineCounter();

  setTimeout(() => {
    showOverlay('win', timerSeconds);
    startConfetti();
    if (currentDiff !== 'custom') checkBestTime();
  }, 350);
}

/* ============================================================
   BEST TIME
   ============================================================ */
function checkBestTime() {
  const key  = `best_${currentDiff}`;
  const best = parseInt(localStorage.getItem(key)) || Infinity;
  if (timerSeconds < best) {
    localStorage.setItem(key, timerSeconds);
    document.getElementById('new-record-badge').classList.remove('hidden');
  }
  updateBestTimeDisplay();
}

/* ============================================================
   HUD UPDATES
   ============================================================ */
function updateMineCounter() {
  let flags = 0;
  for (let i = 0; i < cellStates.length; i++) {
    for (let j = 0; j < cellStates[i].length; j++) {
      if (cellStates[i][j] === 'flagged') flags++;
    }
  }
  const rem = (tablero ? tablero.bombas : 0) - flags;
  document.getElementById('mines-left').textContent = String(rem).padStart(3, '0');
}

function updateTimerDisplay() {
  document.getElementById('timer').textContent = String(timerSeconds).padStart(3, '0');
}

function updateBestTimeDisplay() {
  if (currentDiff === 'custom') {
    document.getElementById('best-time').textContent = '---';
    return;
  }
  const v = localStorage.getItem(`best_${currentDiff}`);
  document.getElementById('best-time').textContent = v ? formatTime(+v) : '---';
}

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/* ============================================================
   OVERLAY
   ============================================================ */
function showOverlay(type, time) {
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden', 'win', 'lose');
  overlay.classList.add(type);

  document.getElementById('overlay-icon').textContent    = type === 'win' ? '🎉' : '💥';
  document.getElementById('overlay-title').textContent   = type === 'win' ? 'YOU WIN!' : 'GAME OVER';
  document.getElementById('overlay-message').textContent = type === 'win'
    ? 'The board is clear. Well played!'
    : 'You hit a mine. Better luck next time!';

  const timeEl = document.getElementById('overlay-time');
  if (type === 'win') {
    timeEl.textContent = formatTime(time);
    timeEl.classList.remove('hidden');

    // Show registration modal after a delay (if name not stored)
    if (currentDiff !== 'custom') {
      pendingWin = { time, diff: currentDiff };
      setTimeout(() => {
        if (!localStorage.getItem('player_name')) {
          document.getElementById('reg-modal').classList.remove('hidden');
        } else {
          saveScore(localStorage.getItem('player_name'), time);
          renderLeaderboard();
        }
      }, 1200);
    }
  } else {
    timeEl.classList.add('hidden');
  }
}

function hideOverlay() {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('win', 'lose');
  document.getElementById('new-record-badge').classList.add('hidden');
}

/* ============================================================
   LEADERBOARD
   ============================================================ */
function saveScore(name, time) {
  if (currentDiff === 'custom') return;
  const key    = `scores_${currentDiff}`;
  let scores   = JSON.parse(localStorage.getItem(key) || '[]');
  scores.push({ name, time });
  scores.sort((a, b) => a.time - b.time);
  scores = scores.slice(0, 5);
  localStorage.setItem(key, JSON.stringify(scores));
  renderLeaderboard();
}

function renderLeaderboard() {
  const tab    = document.querySelector('.lb-tab.active');
  const diff   = tab ? tab.dataset.tab : 'easy';
  const scores = JSON.parse(localStorage.getItem(`scores_${diff}`) || '[]');
  const list   = document.getElementById('lb-list');
  list.innerHTML = '';

  if (scores.length === 0) {
    list.innerHTML = '<li class="lb-empty">No scores yet — be the first!</li>';
    return;
  }

  scores.forEach((s, i) => {
    const li  = document.createElement('li');
    const rc  = i < 3 ? ` rank-${i + 1}` : '';
    li.innerHTML = `
      <span class="lb-rank${rc}">${i + 1}</span>
      <span class="lb-name">${escHtml(s.name)}</span>
      <span class="lb-time">${formatTime(s.time)}</span>`;
    list.appendChild(li);
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ============================================================
   CONFETTI
   ============================================================ */
let confettiRaf = null;

function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#00ff88','#00bfff','#ffd700','#ff44ff','#ff8800','#ffffff','#ff3366'];

  const particles = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 10 + 4,
    h: Math.random() * 6  + 2,
    col: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.15,
    vy: Math.random() * 3 + 1.5,
    vx: (Math.random() - 0.5) * 1.8,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const alive = particles.filter(p => p.y < canvas.height + 30);
    if (!alive.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    alive.forEach(p => {
      p.y   += p.vy;
      p.x   += p.vx;
      p.rot += p.rotV;
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height * 0.7);
      ctx.fillStyle   = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    confettiRaf = requestAnimationFrame(draw);
  }

  if (confettiRaf) cancelAnimationFrame(confettiRaf);
  confettiRaf = requestAnimationFrame(draw);
}

function stopConfetti() {
  if (confettiRaf) { cancelAnimationFrame(confettiRaf); confettiRaf = null; }
  const c = document.getElementById('confetti-canvas');
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

/* ============================================================
   REGISTRATION FORM VALIDATION
   ============================================================ */
function validateReg() {
  let ok = true;
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const age   = parseInt(document.getElementById('reg-age').value);

  const setErr = (id, msg) => { document.getElementById(id).textContent = msg; };
  setErr('reg-name-err', '');
  setErr('reg-email-err', '');
  setErr('reg-age-err', '');

  if (!name || name.length < 2) {
    setErr('reg-name-err', 'Name must be at least 2 characters.');
    ok = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setErr('reg-email-err', 'Enter a valid email address.');
    ok = false;
  }
  if (isNaN(age) || age < 18) {
    setErr('reg-age-err', 'You must be 18 or older to register.');
    ok = false;
  }
  return ok ? { name, email, age } : null;
}

/* ============================================================
   BOOTSTRAP — DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Difficulty buttons ---- */
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiff = btn.dataset.diff;
      const panel = document.getElementById('custom-panel');
      if (currentDiff === 'custom') {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
        init();
      }
    });
  });

  document.getElementById('custom-apply').addEventListener('click', init);
  document.getElementById('restart-btn').addEventListener('click', init);

  /* ---- Overlay ---- */
  document.getElementById('overlay-play-again').addEventListener('click', () => {
    stopConfetti();
    hideOverlay();
    init();
  });

  /* ---- Mute ---- */
  document.getElementById('mute-btn').addEventListener('click', () => {
    SoundManager.toggle();
    document.getElementById('sound-on-icon').classList.toggle('hidden',  SoundManager.muted);
    document.getElementById('sound-off-icon').classList.toggle('hidden', !SoundManager.muted);
  });

  /* ---- Prevent context menu on board ---- */
  document.getElementById('tablero').addEventListener('contextmenu', e => e.preventDefault());

  /* ---- Leaderboard tabs ---- */
  document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLeaderboard();
    });
  });

  /* ---- Registration form ---- */
  document.getElementById('reg-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = validateReg();
    if (!data) return;
    localStorage.setItem('player_name', data.name);
    if (pendingWin) {
      saveScore(data.name, pendingWin.time);
      pendingWin = null;
    }
    document.getElementById('reg-modal').classList.add('hidden');
  });

  document.getElementById('skip-reg').addEventListener('click', () => {
    if (pendingWin) {
      saveScore('Anonymous', pendingWin.time);
      pendingWin = null;
    }
    document.getElementById('reg-modal').classList.add('hidden');
  });

  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('reg-modal').classList.add('hidden');
  });

  document.getElementById('modal-backdrop').addEventListener('click', () => {
    document.getElementById('reg-modal').classList.add('hidden');
  });

  /* ---- Resize ---- */
  window.addEventListener('resize', () => {
    if (tablero) computeCellSize(tablero.filas, tablero.columnas);
    const canvas = document.getElementById('confetti-canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  /* ---- Start ---- */
  init();
  renderLeaderboard();
});
