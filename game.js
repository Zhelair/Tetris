// ===== CONFIG =====
const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const SPEED = 500;

// load image
const blockImage = new Image();
blockImage.src = "IMAGE_URL_HERE"; // <<< REPLACE THIS !!!

// canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = COLS * BLOCK;
canvas.height = ROWS * BLOCK;

const scoreEl = document.getElementById("score");

// ===== GAME STATE =====
let board = [];
let currentPiece = null;
let gameOver = false;
let score = 0;
let lastTick = 0;

// ===== SHAPES (classic tetrominoes) =====
const SHAPES = [
  // I
  { color:"#fff", cells:[[0,0],[-1,0],[1,0],[2,0]] },

  // O
  { color:"#fff", cells:[[0,0],[0,1],[1,0],[1,1]] },

  // T
  { color:"#fff", cells:[[0,0],[-1,0],[1,0],[0,1]] },

  // L
  { color:"#fff", cells:[[0,0],[0,1],[0,2],[1,2]] },

  // J
  { color:"#fff", cells:[[0,0],[0,1],[0,2],[-1,2]] },

  // S
  { color:"#fff", cells=[[0,0],[1,0],[0,1],[-1,1]] },

  // Z
  { color:"#fff", cells=[[0,0],[-1,0],[0,1],[1,1]] }
];

// ===== HELPERS =====

function emptyBoard() {
  let arr = [];
  for (let r = 0; r < ROWS; r++) {
    arr.push(new Array(COLS).fill(null));
  }
  return arr;
}

function rotate([x, y]) {
  return [y, -x];
}

function rotateShape(cells) {
  return cells.map(rotate);
}

function spawnPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    x: Math.floor(COLS / 2),
    y: 0,
    cells: shape.cells.map(c => [...c]),
    color: shape.color
  };
}

function valid(piece, offX = 0, offY = 0, newCells = null) {
  const cells = newCells || piece.cells;

  for (const [cx, cy] of cells) {
    const x = piece.x + cx + offX;
    const y = piece.y + cy + offY;

    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    if (board[y][x]) return false;
  }
  return true;
}

function merge(piece) {
  for (const [cx, cy] of piece.cells) {
    const x = piece.x + cx;
    const y = piece.y + cy;
    board[y][x] = true; // store "occupied"
  }
}

function clearLines() {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(c => c)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(null));
      score += 100;
      scoreEl.textContent = score;
      r++;
    }
  }
}

// ===== DRAWING =====

function drawCell(x, y) {
  ctx.drawImage(blockImage, x * BLOCK, y * BLOCK, BLOCK, BLOCK);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // board
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(c, r);
    }
  }

  // current piece
  if (currentPiece) {
    for (const [cx, cy] of currentPiece.cells) {
      drawCell(currentPiece.x + cx, currentPiece.y + cy);
    }
  }
}

// ===== GAME LOOP =====

function update(time) {
  if (gameOver) {
    draw();
    return;
  }

  if (!lastTick) lastTick = time;

  if (time - lastTick > SPEED) {
    if (valid(currentPiece, 0, 1)) {
      currentPiece.y += 1;
    } else {
      merge(currentPiece);
      clearLines();
      currentPiece = spawnPiece();

      if (!valid(currentPiece)) {
        gameOver = true;
      }
    }
    lastTick = time;
  }

  draw();
  requestAnimationFrame(update);
}

// ===== INPUT =====

document.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.code === "ArrowLeft") {
    if (valid(currentPiece, -1, 0)) currentPiece.x -= 1;
  }
  if (e.code === "ArrowRight") {
    if (valid(currentPiece, 1, 0)) currentPiece.x += 1;
  }
  if (e.code === "ArrowDown") {
    if (valid(currentPiece, 0, 1)) currentPiece.y += 1;
  }
  if (e.code === "ArrowUp") {
    const rotated = rotateShape(currentPiece.cells);
    if (valid(currentPiece, 0, 0, rotated)) {
      currentPiece.cells = rotated;
    }
  }
  if (e.code === "Space") {
    while (valid(currentPiece, 0, 1)) {
      currentPiece.y += 1;
    }
  }

  draw();
});

// ===== RESTART =====

document.getElementById("restart").onclick = () => {
  board = emptyBoard();
  currentPiece = spawnPiece();
  score = 0;
  scoreEl.textContent = 0;
  gameOver = false;
  requestAnimationFrame(update);
};

// ===== START =====

board = emptyBoard();
currentPiece = spawnPiece();
requestAnimationFrame(update);
