const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

/* ============ LOAD IMAGES SAFELY ============ */

function loadImage(path) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
  });
}

let sheets = {};
let ready = false;

async function loadAll() {
  const base = "Legacy Collection/Assets/Characters/Terrible Knight/Spritesheets/";
  sheets.idle = await loadImage(base + "player-Idle.png");
  sheets.run = await loadImage(base + "player-Run.png");
  sheets.jump = await loadImage(base + "player-Jump.png");
  sheets.attack = await loadImage(base + "player-CrouchSwordSlash.png");
  sheets.hurt = await loadImage(base + "player-Hurt.png");

  ready = true;
}

loadAll();

/* ============ PLAYER ============ */

const player = {
  x: 200,
  y: 300,
  vy: 0,
  onGround: true,
  state: "idle",
  facingLeft: false
};

const GRAVITY = 0.7;
const GROUND = 300;

const frameCounts = {
  idle: 6,
  run: 8,
  jump: 2,
  attack: 6,
  hurt: 4
};

let frame = 0;
let timer = 0;

/* ============ INPUT ============ */

const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

/* ============ UPDATE ============ */

function update() {
  if (!ready) return;

  const prevState = player.state;
  player.state = "idle";

  if (keys["a"]) {
    player.x -= 4;
    player.state = "run";
    player.facingLeft = true;
  }

  if (keys["d"]) {
    player.x += 4;
    player.state = "run";
    player.facingLeft = false;
  }

  if (keys[" "] && player.onGround) {
    player.vy = -12;
    player.onGround = false;
  }

  if (!player.onGround) {
    player.state = "jump";
  }

  if (keys["j"]) {
    player.state = "attack";
  }

  if (player.state !== prevState) {
    frame = 0;
    timer = 0;
  }

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y >= GROUND) {
    player.y = GROUND;
    player.vy = 0;
    player.onGround = true;
  }
}

/* ============ DRAW ============ */

function drawAnimation(sheet, state) {
  const frames = frameCounts[state];
  const frameWidth = sheet.width / frames;
  const frameHeight = sheet.height;

  ctx.save();

  if (player.facingLeft) {
    ctx.scale(-1, 1);
    ctx.translate(-player.x * 2 - frameWidth * 2, 0);
  }

  // Centering the player horizontally for scaling
  const drawX = player.x;
  const drawY = player.y - frameHeight * 2;

  ctx.drawImage(
    sheet,
    frame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    drawX,
    drawY,
    frameWidth * 2,
    frameHeight * 2
  );

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!ready) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Loading sprites...", 300, 200);
    return;
  }

  timer++;
  if (timer > 6) {
    frame++;
    timer = 0;
  }

  const maxFrames = frameCounts[player.state];
  if (frame >= maxFrames) frame = 0;

  drawAnimation(sheets[player.state], player.state);
}

/* ============ LOOP ============ */

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
