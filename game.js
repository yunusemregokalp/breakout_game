const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddle = {
  width: 120,
  height: 15,
  x: canvas.width / 2 - 60,
  y: canvas.height - 30,
  dx: 7
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 45,
  radius: 10,
  speed: 5,
  dx: 4,
  dy: -4
};

const brick = {
  rowCount: 5,
  columnCount: 9,
  width: 75,
  height: 20,
  padding: 10,
  offsetTop: 50,
  offsetLeft: 35
};

let bricks = [];
for(let r = 0; r < brick.rowCount; r++) {
  bricks[r] = [];
  for(let c = 0; c < brick.columnCount; c++) {
    bricks[r][c] = { x: 0, y: 0, status: 1 };
  }
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', e => {
  if(e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
  if(e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
});
document.addEventListener('keyup', e => {
  if(e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
  if(e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = '#0f0';
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for(let r = 0; r < brick.rowCount; r++) {
    for(let c = 0; c < brick.columnCount; c++) {
      if(bricks[r][c].status === 1) {
        const brickX = c * (brick.width + brick.padding) + brick.offsetLeft;
        const brickY = r * (brick.height + brick.padding) + brick.offsetTop;
        bricks[r][c].x = brickX;
        bricks[r][c].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brick.width, brick.height);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for(let r = 0; r < brick.rowCount; r++) {
    for(let c = 0; c < brick.columnCount; c++) {
      const b = bricks[r][c];
      if(b.status === 1) {
        if(ball.x > b.x && ball.x < b.x + brick.width &&
           ball.y > b.y && ball.y < b.y + brick.height) {
          ball.dy = -ball.dy;
          b.status = 0;
        }
      }
    }
  }
}

function update() {
  if(rightPressed && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.dx;
  } else if(leftPressed && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }
  if(ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  } else if(ball.y + ball.radius > canvas.height) {
    if(ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      const collidePoint = ball.x - (paddle.x + paddle.width/2);
      const normPoint = collidePoint / (paddle.width/2);
      const angle = normPoint * Math.PI/3;
      ball.dx = ball.speed * Math.sin(angle);
      ball.dy = -ball.speed * Math.cos(angle);
    } else {
      document.location.reload(); // Restart
    }
  }

  collisionDetection();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  update();
  requestAnimationFrame(draw);
}

draw();