const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const pauseScreen = document.getElementById('pauseScreen');
const themeToggle = document.getElementById('themeToggle');
const jumpSound = document.getElementById('jumpSound');
const pauseButton = document.getElementById('pauseButton');

// Game variables
const dinoWidth = 40;
const dinoHeight = 60;
const groundHeight = 20;
const groundOffset = 18; // Pixels to raise the dino above the ground

let dino = {
    x: 50,
    y: canvas.height - dinoHeight - groundHeight - groundOffset,
    width: dinoWidth,
    height: dinoHeight,
    dy: 0, // velocity y
    jumpStrength: 16,
    gravity: 0.8,
    isJumping: false
};

let obstacles = [];
let gameSpeed = 5;
let score = 0;
let highScore = 0;
let gameOver = false;
let isPaused = false;
let frameCount = 0;
let isDarkMode = false;

let gameColors = {
    text: '#535353',
    background: '#f7f7f7'
};

function drawDino() {
    // This function now draws a T-Rex-like figure
    ctx.fillStyle = gameColors.text;
    const x = dino.x;
    const y = dino.y;
    const w = dino.width;
    const h = dino.height;

    // Tail
    ctx.fillRect(x, y + h * 0.3, w * 0.5, h * 0.2);

    // Body & Neck
    ctx.fillRect(x + w * 0.2, y, w * 0.6, h);

    // Head
    ctx.fillRect(x + w * 0.5, y, w * 0.5, h * 0.4);

    // Arms
    ctx.fillRect(x + w * 0.7, y + h * 0.4, w * 0.2, h * 0.1);

    // Legs
    if (dino.isJumping) {
        ctx.fillRect(x + w * 0.3, y + h, w * 0.4, h * 0.3); // Static legs when jumping
    } else {
        // Simple running animation for legs
        const legOffset = (Math.floor(frameCount / 6) % 2 === 0) ? 0.2 : 0.5;
        ctx.fillRect(x + w * legOffset, y + h, w * 0.3, h * 0.3);
    }
}

function drawGround() {
    ctx.strokeStyle = gameColors.text;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - groundHeight);
    ctx.lineTo(canvas.width, canvas.height - groundHeight);
    ctx.stroke();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = gameColors.text;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateDino() {
    if (dino.isJumping) {
        dino.y -= dino.dy;
        dino.dy -= dino.gravity;
        if (dino.y >= canvas.height - dino.height - groundHeight - groundOffset) {
            dino.y = canvas.height - dino.height - groundHeight - groundOffset;
            dino.isJumping = false;
            dino.dy = 0;
        }
    }
}

function updateObstacles() {
    frameCount++;

    // Spawn new obstacles
    if (frameCount % Math.floor(150 / (gameSpeed / 5)) === 0) {
        const isTall = Math.random() > 0.5;
        const obstacleHeight = isTall ? 50 : 35;
        const obstacleWidth = 20;

        obstacles.push({
            x: canvas.width,
            y: canvas.height - obstacleHeight - groundHeight,
            width: obstacleWidth,
            height: obstacleHeight
        });
    }

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    for (const obstacle of obstacles) {
      // Check if a collision occurred and if the game isn't already over
      if (
        !gameOver &&
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
      ) {
        gameOver = true;
        return; // Exit after the first collision is found
      }
    }
}

function handleGameOver() {
    gameOverElement.classList.remove('hidden');
    const finalScore = Math.floor(score / 5);
    if (finalScore > highScore) {
        highScore = finalScore;
        highScoreElement.textContent = `High Score: ${highScore}`;
        localStorage.setItem('dinoHighScore', highScore);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redrawStaticElements() {
    clearCanvas();
    drawGround();
    drawDino();
    drawObstacles();
}

function updateScore() {
    score++;
    scoreElement.textContent = `Score: ${Math.floor(score / 5)}`;
    // Increase speed over time
    if (score > 0 && score % 500 === 0) {
        gameSpeed += 0.5;
    }
}

function gameLoop() {
    // If paused, stop the game logic but keep the animation frame loop running
    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    clearCanvas();
    canvas.style.backgroundColor = gameColors.background;
    drawGround();
    updateDino();
    drawDino();
    updateObstacles();
    drawObstacles();
    checkCollision();
    if (gameOver) {
        handleGameOver();
        return; // Stop the loop after handling game over
    }
    updateScore();

    requestAnimationFrame(gameLoop);
}

function jump() {
    if (!dino.isJumping && !gameOver && !isPaused) {
        dino.isJumping = true;
        dino.dy = dino.jumpStrength;
        jumpSound.currentTime = 0; // Allow sound to play again quickly
        jumpSound.play();
    }
}

function restartGame() {
    dino = {
        x: 50,
        y: canvas.height - dinoHeight - groundHeight - groundOffset,
        width: dinoWidth,
        height: dinoHeight,
        dy: 0,
        jumpStrength: 16,
        gravity: 0.8,
        isJumping: false
    };

    obstacles = [];
    gameSpeed = 5;
    score = 0;
    gameOver = false;
    isPaused = false;
    frameCount = 0;

    scoreElement.textContent = 'Score: 0';
    gameOverElement.classList.add('hidden');
    gameLoop();
}

function loadHighScore() {
    const savedHighScore = localStorage.getItem('dinoHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore, 10);
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}

function togglePause() {
    if (gameOver) return; // Don't allow pausing if the game is over

    isPaused = !isPaused;
    if (isPaused) {
        pauseScreen.classList.remove('hidden');
        pauseButton.textContent = '▶️'; // Change to play icon
    } else {
        pauseScreen.classList.add('hidden');
        pauseButton.textContent = '⏸️'; // Change back to pause icon
        // Immediately call gameLoop to resume without a 1-frame delay
        gameLoop();
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);

    if (isDarkMode) {
        themeToggle.textContent = '☀️';
        gameColors.text = '#f1f1f1';
        gameColors.background = '#222';
    } else {
        themeToggle.textContent = '🌙';
        gameColors.text = '#535353';
        gameColors.background = '#f7f7f7';
    }

    localStorage.setItem('dinoTheme', isDarkMode ? 'dark' : 'light');

    // Redraw canvas with new colors if game is not actively running
    if (!gameOver) {
        redrawStaticElements();
    }
}

themeToggle.addEventListener('click', toggleTheme);

pauseButton.addEventListener('click', togglePause);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            restartGame();
        } else {
            jump();
        }
    }
});

// Add touch controls for mobile
document.addEventListener('touchstart', (e) => {
    // Prevent default touch behavior like scrolling or zooming
    e.preventDefault();
    if (gameOver) {
        restartGame();
    } else {
        jump();
    }
}, { passive: false }); // passive: false is required to allow preventDefault

// Load saved theme on startup
if (localStorage.getItem('dinoTheme') === 'dark') {
    toggleTheme();
}

// Start the game
loadHighScore();
gameLoop();