const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    scale: 1,
    flipped: false,
    speed: 6 // Increased speed
};

const items = [];
const itemCount = 10;
const playerImage = new Image();
playerImage.src = 'player.png'; // Path to your player sprite

const collectibleImage = new Image();
collectibleImage.src = 'collectible.png'; // Path to your collectible sprite

const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Path to your background image

let score = 0;
let incrementMessage = null;
let alpha = 0;
let messageTimeout = null;
let gameWon = false; // Track if the game is won

const keys = {}; // Object to track key states

function createItems() {
    for (let i = 0; i < itemCount; i++) {
        items.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 10 + Math.random() * 20,
        });
    }
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    if (player.flipped) {
        ctx.scale(-1, 1);
    }
    ctx.drawImage(playerImage, -player.width * player.scale / 2, -player.height * player.scale / 2, player.width * player.scale, player.height * player.scale);
    ctx.restore();
}

function drawItems() {
    items.forEach(item => {
        ctx.drawImage(collectibleImage, item.x - 15, item.y - 15, 30, 30);
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px "Bubble-w10MZ"'; // Ensure your custom font is used here
    ctx.fillText('Score: ' + score, 10, 30);
    
    if (incrementMessage) {
        ctx.fillStyle = 'green';
        ctx.font = '20px "Bubble-w10MZ"'; // Use the same custom font for the increment message
        ctx.globalAlpha = alpha;
        ctx.fillText(incrementMessage.text, 10, 50);
        ctx.globalAlpha = 1;
    }
}

function drawWinMessage() {
    // Center "YOU WIN!!!"
    ctx.fillStyle = 'red';
    ctx.font = '48px "Bubble-w10MZ"'; // Use the custom font for the win message
    const winMessage = 'YOU WIN!!!';
    const winTextWidth = ctx.measureText(winMessage).width;
    ctx.fillText(winMessage, (canvas.width - winTextWidth) / 2, canvas.height / 2);

    // Draw "Play Again" button
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonX = (canvas.width - buttonWidth) / 2;
    const buttonY = canvas.height / 2 + 50;

    ctx.fillStyle = 'blue';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px "Bubble-w10MZ"'; // Use the custom font for the button text
    const buttonText = 'Play Again';
    const buttonTextWidth = ctx.measureText(buttonText).width;
    ctx.fillText(buttonText, buttonX + (buttonWidth - buttonTextWidth) / 2, buttonY + 30); // Center the button text
}

function checkCollision() {
    items.forEach((item, index) => {
        const playerCollisionBox = {
            x: player.x - (player.width * player.scale) / 4,
            y: player.y - (player.height * player.scale) / 4,
            width: player.width * player.scale / 2,
            height: player.height * player.scale / 2
        };

        const dx = item.x - (playerCollisionBox.x + playerCollisionBox.width / 2);
        const dy = item.y - (playerCollisionBox.y + playerCollisionBox.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (playerCollisionBox.width / 2) + 15) {
            player.scale += item.radius / 20;
            const increment = Math.floor(item.radius);
            score += increment;
            incrementMessage = { text: `+${increment}` };
            alpha = 1;

            clearTimeout(messageTimeout);
            messageTimeout = setTimeout(() => {
                const fadeOut = setInterval(() => {
                    alpha -= 0.05;
                    if (alpha <= 0) {
                        clearInterval(fadeOut);
                        incrementMessage = null;
                    }
                }, 50);
            }, 1000);

            items.splice(index, 1);
        }
    });

    // Check if all items are collected
    if (items.length === 0 && !gameWon) {
        gameWon = true; // Set the game as won
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawItems();
    drawScore();
    
    if (gameWon) {
        drawWinMessage(); // Draw win message
    } else {
        checkCollision();

        // Handle movement
        if (keys['ArrowUp']) player.y -= player.speed;
        if (keys['ArrowDown']) player.y += player.speed;
        if (keys['ArrowLeft']) {
            player.x -= player.speed;
            player.flipped = true;
        }
        if (keys['ArrowRight']) {
            player.x += player.speed;
            player.flipped = false;
        }
    }

    requestAnimationFrame(update);
}

// Event listeners for keydown and keyup
document.addEventListener('keydown', (event) => {
    keys[event.key] = true; // Set the key as pressed
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false; // Set the key as released
});

// Click event for the Play Again button
canvas.addEventListener('click', (event) => {
    if (gameWon) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check if the click is within the Play Again button area
        if (mouseX >= canvas.width / 2 - 75 && mouseX <= canvas.width / 2 + 75 &&
            mouseY >= canvas.height / 2 + 50 && mouseY <= canvas.height / 2 + 100) {
            resetGame(); // Reset the game when the button is clicked
        }
    }
});

// Reset game function
function resetGame() {
    player.scale = 1;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    score = 0;
    items.length = 0; // Clear the items array
    gameWon = false; // Reset the game state
    createItems(); // Create new items
}

// Ensure all images are loaded before starting the game
let imagesLoaded = 0;
const totalImages = 3;

function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        createItems();
        update();
    }
}

playerImage.onload = checkImagesLoaded;
collectibleImage.onload = checkImagesLoaded;
backgroundImage.onload = checkImagesLoaded;
