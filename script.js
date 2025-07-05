const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const controlsModal = document.getElementById('controlsModal');
const wasdButton = document.getElementById('wasdButton');
const arrowButton = document.getElementById('arrowButton');
const menuButton = document.getElementById('menuButton');
const menuModal = document.getElementById('menuModal');
const closeMenuButton = document.getElementById('closeMenuButton');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const levelDisplay = document.getElementById('levelDisplay');

canvas.width = 1200;
canvas.height = 600;

const player = {
    x: 100,
    y: 200,
    width: 30,
    height: 30,
    color: 'red',
    velocityX: 0,
    velocityY: 0,
    isJumping: false
};

const gravity = 0.5;
const jumpStrength = -10;
const moveSpeed = 5;

const levels = {
    1: {
        platforms: [
            { x: 0, y: 350, width: 200, height: 20, visited: false },
            { x: 250, y: 300, width: 150, height: 20, visited: false },
            { x: 450, y: 250, width: 100, height: 20, visited: false },
            { x: 600, y: 200, width: 150, height: 20, visited: false },
            { x: 800, y: 350, width: 200, height: 20, visited: false },
            { x: 1050, y: 300, width: 150, height: 20, visited: false },
            { x: 1250, y: 250, width: 100, height: 20, visited: false },
            { x: 1400, y: 200, width: 150, height: 20, visited: false },
        ],
        lake: { x: 1600, y: 350, width: 200, height: 50, color: 'blue' },
        enemies: []
    },
    2: {
        platforms: [
            { x: 0, y: 500, width: 200, height: 20, visited: false },
            { x: 250, y: 450, width: 150, height: 20, visited: false },
            { x: 500, y: 400, width: 200, height: 20, visited: false },
            { x: 800, y: 350, width: 150, height: 20, visited: false },
            { x: 1000, y: 300, width: 250, height: 20, visited: false },
            { x: 1300, y: 250, width: 100, height: 20, visited: false },
            { x: 1500, y: 200, width: 300, height: 20, visited: false },
        ],
        lake: { x: 1900, y: 500, width: 200, height: 50, color: 'blue' },
        enemies: []
    },
    3: {
        platforms: [
            { x: 0, y: 550, width: 250, height: 20, visited: false },
            { x: 300, y: 500, width: 180, height: 20, visited: false },
            { x: 550, y: 450, width: 120, height: 20, visited: false },
            { x: 750, y: 400, width: 200, height: 20, visited: false },
            { x: 1000, y: 350, width: 150, height: 20, visited: false },
            { x: 1200, y: 300, width: 280, height: 20, visited: false },
            { x: 1550, y: 250, width: 100, height: 20, visited: false },
            { x: 1700, y: 200, width: 350, height: 20, visited: false },
            { x: 2100, y: 150, width: 100, height: 20, visited: false },
        ],
        lake: { x: 2300, y: 550, width: 200, height: 50, color: 'blue' },
        enemies: []
    },
    4: {
        platforms: [
            { x: 0, y: 580, width: 300, height: 20, visited: false },
            { x: 380, y: 520, width: 100, height: 20, visited: false },
            { x: 550, y: 460, width: 200, height: 20, visited: false },
            { x: 800, y: 400, width: 150, height: 20, visited: false },
            { x: 1000, y: 340, width: 100, height: 20, visited: false },
            { x: 1150, y: 280, width: 250, height: 20, visited: false },
            { x: 1450, y: 220, width: 100, height: 20, visited: false },
            { x: 1600, y: 160, width: 300, height: 20, visited: false },
            { x: 1950, y: 100, width: 150, height: 20, visited: false },
            { x: 2200, y: 40, width: 100, height: 20, visited: false },
        ],
        lake: { x: 2400, y: 580, width: 200, height: 50, color: 'blue' },
        enemies: []
    },
    5: {
        platforms: [
            { x: 0, y: 590, width: 350, height: 20, visited: false },
            { x: 400, y: 530, width: 120, height: 20, visited: false },
            { x: 580, y: 470, width: 250, height: 20, visited: false },
            { x: 880, y: 410, width: 180, height: 20, visited: false },
            { x: 1100, y: 350, width: 100, height: 20, visited: false },
            { x: 1250, y: 290, width: 300, height: 20, visited: false },
            { x: 1600, y: 230, width: 120, height: 20, visited: false },
            { x: 1780, y: 170, width: 200, height: 20, visited: false },
            { x: 2050, y: 110, width: 150, height: 20, visited: false },
            { x: 2250, y: 50, width: 100, height: 20, visited: false },
            { x: 2400, y: 0, width: 50, height: 20, visited: false }, // Very high platform
        ],
        lake: { x: 2600, y: 590, width: 200, height: 50, color: 'blue' },
        enemies: []
    }
};

let currentLevel = 1;
let platforms = levels[currentLevel].platforms;
let lake = levels[currentLevel].lake;
let enemies = [];

const keys = {
    right: false,
    left: false,
    up: false
};

let cameraX = 0;
let useWASD = false;
let gameRunning = false;
let score = 0;
let isDay = Math.random() < 0.5; // true for day, false for night
let stars = [];
let starInterval;

function generateStars() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height - 100); // Avoid drawing stars too low
        stars.push({ x, y });
    }
}

function generateEnemies() {
    enemies = [];
    if (currentLevel >= 2) {
        const platformsWithEnemies = platforms.filter((p, index) => p.width > 50 && index !== 0); // Only put enemies on wider platforms, exclude first platform
        platformsWithEnemies.forEach((platform) => {
            if (Math.random() < 0.5) { // 50% chance to spawn an enemy on a suitable platform
                enemies.push({
                    x: platform.x + platform.width / 4, // Start enemy near platform start
                    y: platform.y - 20, // Above the platform
                    width: 20,
                    height: 20,
                    color: 'purple',
                    speed: 2,
                    direction: 1, // 1 for right, -1 for left
                    platformRef: platform, // Store a direct reference to the platform
                    alive: true
                });
            }
        });
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
}

function drawPlatforms() {
    ctx.fillStyle = 'green';
    for (const platform of platforms) {
        ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
    }
}

function drawLake() {
    ctx.fillStyle = lake.color;
    ctx.fillRect(lake.x - cameraX, lake.y, lake.width, lake.height);
}

function drawEnemies() {
    ctx.fillStyle = 'purple';
    for (const enemy of enemies) {
        if (enemy.alive) {
            ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.width, enemy.height);
        }
    }
}

function drawScore() {
    ctx.fillStyle = isDay ? 'black' : 'white'; // Score color changes with day/night
    ctx.font = '20px Arial';
    ctx.fillText(`Pontszám: ${score}`, 10, 30);
}

function drawLevel() {
    levelDisplay.textContent = `Szint: ${currentLevel}`;
}

function drawSky() {
    ctx.fillStyle = isDay ? '#87CEEB' : '#191970'; // Light blue for day, dark blue for night
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(canvas.width - 100, 50, 50, 50);
}

function drawMoon() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvas.width - 75, 75, 25, 0, Math.PI * 2, false);
    ctx.fill();
}

function drawStars() {
    ctx.fillStyle = '#ADD8E6'; // Light blue for stars
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2, false);
        ctx.fill();
    }
}

function update() {
    console.log("update() called. gameRunning:", gameRunning);
    if (gameRunning) {
        // Player movement
        if (keys.right) {
            player.velocityX = moveSpeed;
        } else if (keys.left) {
            player.velocityX = -moveSpeed;
        } else {
            player.velocityX = 0;
        }

        player.x += player.velocityX;
        player.velocityY += gravity;
        player.y += player.velocityY;

        // Collision with platforms
        for (const platform of platforms) {
            if (
                player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y < platform.y + platform.height &&
                player.y + player.height > platform.y
            ) {
                // Collision from top
                if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    if (!platform.visited) {
                        const platformCenter = platform.x + platform.width / 2;
                        const playerCenter = player.x + player.width / 2;
                        const distance = Math.abs(platformCenter - playerCenter);

                        if (distance <= platform.width / 4) {
                            score += 50;
                        } else {
                            score += 25;
                        }
                        platform.visited = true;
                    }
                    player.isJumping = false;
                }
                // Collision from bottom
                if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                }
            }
        }

        // Enemy movement and collision
        for (const enemy of enemies) {
            if (enemy.alive) {
                const platform = enemy.platformRef;
                enemy.x += enemy.speed * enemy.direction;

                // Reverse direction if enemy reaches platform edge
                if (enemy.x <= platform.x || enemy.x + enemy.width >= platform.x + platform.width) {
                    enemy.direction *= -1;
                    // Adjust position to be exactly at the edge to prevent getting stuck
                    if (enemy.x <= platform.x) {
                        enemy.x = platform.x;
                    } else if (enemy.x + enemy.width >= platform.x + platform.width) {
                        enemy.x = platform.x + platform.width - enemy.width;
                    }
                }

                // Player-enemy collision
                if (
                    player.x < enemy.x + enemy.width &&
                    player.x + player.width > enemy.x &&
                    player.y < enemy.y + enemy.height &&
                    player.y + player.height > enemy.y
                ) {
                    // Player jumps on enemy
                    if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y) {
                        enemy.alive = false;
                        player.velocityY = jumpStrength; // Bounce off enemy
                    } else {
                        // Player hit by enemy - reset game
                        alert("Ellenség elkapott! Játék vége.");
                        currentLevel = 1; // Reset to level 1 on game over
                        resetGame();
                    }
                }
            }
        }

        // Camera follow
        const cameraDeadzone = canvas.width / 4;
        if (player.x - cameraX > canvas.width - cameraDeadzone) {
            cameraX = player.x - (canvas.width - cameraDeadzone);
        } else if (player.x - cameraX < cameraDeadzone) {
            cameraX = player.x - cameraDeadzone;
        }
        if (cameraX < 0) {
            cameraX = 0;
        }

        // Check for win
        if (
            player.x < lake.x + lake.width &&
            player.x + player.width > lake.x &&
            player.y + player.height > lake.y
        ) {
            alert(`Nyertél! Pontszámod: ${score}`);
            currentLevel++;
            if (!levels[currentLevel]) {
                alert("Gratulálok, végigjátszottad a játékot!");
                currentLevel = 1; // Reset to level 1 after finishing all levels
            }
            resetGame();
        }

        // Check for fall
        if (player.y > canvas.height) {
            alert("Leestél! Játék vége.");
            currentLevel = 1; // Reset to level 1 on game over
            resetGame();
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw elements
        drawSky();
        if (isDay) {
            drawSun();
        } else {
            drawMoon();
            drawStars();
        }
        drawPlatforms();
        drawLake();
        drawEnemies();
        drawPlayer();
        drawScore();
        drawLevel();
    }
    requestAnimationFrame(update);
}

function resetGame() {
    player.x = 100;
    player.y = 200;
    player.isJumping = false;
    player.velocityX = 0;
    player.velocityY = 0;
    cameraX = 0;
    keys.right = false;
    keys.left = false;
    keys.up = false;
    score = 0;

    platforms = levels[currentLevel].platforms.map(p => ({ ...p, visited: false }));
    lake = levels[currentLevel].lake;
    generateEnemies();

    isDay = Math.random() < 0.5; // Randomize day/night on reset
    clearInterval(starInterval);
    if (!isDay) {
        generateStars();
        starInterval = setInterval(generateStars, 20000); // Regenerate stars every 20 seconds
    }
}

// Keyboard input
function handleKeyDown(e) {
    if (useWASD) {
        if (e.code === 'KeyD') keys.right = true;
        if (e.code === 'KeyA') keys.left = true;
        if ((e.code === 'KeyW' || e.code === 'Space') && !player.isJumping) {
            player.velocityY = jumpStrength;
            player.isJumping = true;
        }
    } else {
        if (e.code === 'ArrowRight') keys.right = true;
        if (e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'Space' && !player.isJumping) {
            player.velocityY = jumpStrength;
            player.isJumping = true;
        }
    }
}

function handleKeyUp(e) {
    if (useWASD) {
        if (e.code === 'KeyD') keys.right = false;
        if (e.code === 'KeyA') keys.left = false;
    } else {
        if (e.code === 'ArrowRight') keys.right = false;
        if (e.code === 'ArrowLeft') keys.left = false;
    }
}

function startGame(isWASD) {
    console.log("startGame() called.");
    useWASD = isWASD;
    controlsModal.style.display = 'none';
    gameRunning = true;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    resetGame(); // Call resetGame to initialize day/night and stars
    update(); // Start the game loop
}

function toggleMenu() {
    gameRunning = !gameRunning;
    if (gameRunning) {
        menuModal.style.display = 'none';
        update();
    } else {
        menuModal.style.display = 'block';
    }
}

menuButton.addEventListener('click', toggleMenu);
closeMenuButton.addEventListener('click', toggleMenu);

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

wasdButton.addEventListener('click', () => startGame(true));
arrowButton.addEventListener('click', () => startGame(false));