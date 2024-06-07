const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

const brickRowCount = 12;
const brickColumnCount = 8;
const brickWidth = (canvas.width - (brickColumnCount + 1) * 10) / brickColumnCount;
const brickHeight = (canvas.height / 2 - (brickRowCount + 1) * 10) / brickRowCount;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 10;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

const backgroundImage = new Image();
backgroundImage.src = 'images/background.jpg';

const victoryImage = new Image();
victoryImage.src = 'images/victory.jpg';

let gameStarted = false;
let gameWon = false;
let stage = 1;
const totalStages = 5;

const introBGM = document.getElementById('introBGM');
const gameBGM = document.getElementById('gameBGM');
const victoryBGM = document.getElementById('victoryBGM');
const hitSE = document.getElementById('hitSE');
const endingBGM = document.getElementById('endingBGM');

document.getElementById('introScreen').addEventListener('click', startGame, false);
document.getElementById('victoryScreen').addEventListener('click', nextStage, false);
document.getElementById('endingScreen').addEventListener('click', restartGame, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function showScreen(screenId) {
    document.getElementById('introScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';

    document.getElementById(screenId).style.display = 'block';
}

function startGame() {
    introBGM.pause();
    gameBGM.play();
    showScreen('gameScreen');
    gameStarted = true;
    draw();
}

function nextStage() {
    if (stage >= totalStages) {
        showEndingScreen();
    } else {
        victoryBGM.pause();
        gameBGM.play();
        showScreen('gameScreen');
        stage++;
        resetGame();
    }
}

function showEndingScreen() {
    victoryBGM.pause();
    endingBGM.play();
    showScreen('endingScreen');
}

function restartGame() {
    endingBGM.pause();
    introBGM.play();
    showScreen('introScreen');
    stage = 1;
    resetGame();
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawVictory() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(victoryImage, 0, 0, canvas.width, canvas.height);
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    hitSE.play();
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            document.location.reload();
        }
    }

    if (allBricksCleared()) {
        gameWon = true;
        gameBGM.pause();
        victoryBGM.play();
        showScreen('victoryScreen');
        return;
    }

    if (gameStarted && !gameWon) {
        requestAnimationFrame(draw);
    }
}

function allBricksCleared() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

function resetGame() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2 + stage;  // ステージが進むごとにボールの速度を上げる
    dy = -2 - stage;  // ステージが進むごとにボールの速度を上げる
    gameWon = false;
    draw();
}

// 初期画面の表示とイントロBGMの再生
showScreen('introScreen');
introBGM.play();
