// Breakout Extreme - Gelişmiş Sürüm
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');

let score = 0, lives = 3, level = 1, paused = false;
let rightPressed = false, leftPressed = false;

const paddle = { width: 120, height: 15, x: canvas.width/2 - 60, y: canvas.height - 30, dx: 7 };
const ball = { x: canvas.width/2, y: canvas.height - 45, radius: 10, speed: 5, dx: 4, dy: -4 };

const brick = { rowCount: 5, columnCount: 9, width: 75, height: 20, padding: 10, offsetTop: 50, offsetLeft: 35 };
let bricks = [], powerUps = [];

function initBricks() {
  bricks = [];
  for (let r = 0; r < brick.rowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.columnCount; c++) {
      const health = Math.random() > 0.7 ? 2 : 1;
      bricks[r][c] = { x: 0, y: 0, status: health };
    }
  }
}

function updateHud() {
  hud.innerHTML = `Skor: ${score} | Can: ${lives} | Seviye: ${level}`;
}

function moveLeft() { paddle.x -= paddle.dx * 2; }
function moveRight() { paddle.x += paddle.dx * 2; }
function pauseGame() { paused = !paused; }

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = '#0f0'; ctx.fill(); ctx.closePath();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.closePath();
}

function drawBricks() {
  for (let r = 0; r < brick.rowCount; r++) {
    for (let c = 0; c < brick.columnCount; c++) {
      const b = bricks[r][c];
      if (b.status > 0) {
        const x = c * (brick.width + brick.padding) + brick.offsetLeft;
        const y = r * (brick.height + brick.padding) + brick.offsetTop;
        b.x = x; b.y = y;
        ctx.beginPath();
        ctx.rect(x, y, brick.width, brick.height);
        ctx.fillStyle = b.status === 2 ? '#f90' : '#f00';
        ctx.fill(); ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let r = 0; r < brick.rowCount; r++) {
    for (let c = 0; c < brick.columnCount; c++) {
      const b = bricks[r][c];
      if (b.status > 0 &&
        ball.x > b.x && ball.x < b.x + brick.width &&
        ball.y > b.y && ball.y < b.y + brick.height) {
        ball.dy = -ball.dy;
        b.status--;
        score += 10;
        if (Math.random() < 0.2) spawnPowerUp(b.x + brick.width/2, b.y);
      }
    }
  }
}

function spawnPowerUp(x, y) {
  const types = ['life', 'big', 'multi'];
  const type = types[Math.floor(Math.random() * types.length)];
  powerUps.push({ x, y, size: 20, dy: 2, type });
}

function drawPowerUps() {
  powerUps.forEach(p => {
    ctx.beginPath();
    ctx.rect(p.x, p.y, p.size, p.size);
    ctx.fillStyle = p.type === 'life' ? '#0ff' : p.type === 'big' ? '#ff0' : '#0f0';
    ctx.fill(); ctx.closePath();
  });
}

function updatePowerUps() {
  powerUps.forEach((p, i) => {
    p.y += p.dy;
    if (p.y > canvas.height) powerUps.splice(i, 1);
    else if (p.x < paddle.x + paddle.width && p.x + p.size > paddle.x &&
             p.y < paddle.y + paddle.height && p.y + p.size > paddle.y) {
      if (p.type === 'life') lives++;
      if (p.type === 'big') paddle.width += 30;
      if (p.type === 'multi') score += 100;
      powerUps.splice(i, 1);
    }
  });
}

function checkWin() {
  for (let r of bricks) for (let b of r) if (b.status > 0) return false;
  return true;
}

function resetBall() {
  ball.x = canvas.width/2; ball.y = canvas.height - 45;
  ball.dx = 4; ball.dy = -4;
}

function draw() {
  if (paused) return requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks(); drawPaddle(); drawBall(); drawPowerUps();
  updateHud(); collisionDetection(); updatePowerUps();

  if (rightPressed && paddle.x + paddle.width < canvas.width) paddle.x += paddle.dx;
  else if (leftPressed && paddle.x > 0) paddle.x -= paddle.dx;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx = -ball.dx;
  if (ball.y - ball.radius < 0) ball.dy = -ball.dy;
  else if (ball.y + ball.radius > canvas.height) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      const collidePoint = ball.x - (paddle.x + paddle.width/2);
      const norm = collidePoint / (paddle.width/2);
      const angle = norm * Math.PI/3;
      ball.dx = ball.speed * Math.sin(angle);
      ball.dy = -ball.speed * Math.cos(angle);
    } else {
      lives--;
      if (lives <= 0) {
        alert('Oyun Bitti! Skor: ' + score);
        localStorage.setItem('breakout_score', score);
        document.location.reload();
      } else resetBall();
    }
  }

  if (checkWin()) {
    level++; ball.speed += 0.5;
    alert('Seviye Atlandı! Yeni Seviye: ' + level);
    initBricks(); resetBall();
  }

  requestAnimationFrame(draw);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'p' || e.key === 'P') pauseGame();
});
document.addEventListener('keyup', e => {
  if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});

initBricks();
draw();