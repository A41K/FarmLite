const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game settings
const TILE_SIZE = 32;
const MAP_NUM_ROWS = 18;
const MAP_NUM_COLS = 25;

// Tile types
const TILE_GRASS = 0;
const TILE_SOIL = 1;

// Crop types
const CROP_WHEAT = {
    name: 'Wheat',
    seedPrice: 10,
    growthTime: 10000, // 10 seconds
    harvestValue: 20,
    emoji: '🌾'
};
const CROP_CARROT = {
    name: 'Carrot',
    seedPrice: 20,
    growthTime: 15000, // 15 seconds
    harvestValue: 40,
    emoji: '🥕'
};
const CROP_CABBAGE = {
    name: 'Cabbage',
    seedPrice: 30,
    growthTime: 20000, // 20 seconds
    harvestValue: 60,
    emoji: '🥬'
};

const CROPS = {
    [CROP_WHEAT.name]: CROP_WHEAT,
    [CROP_CARROT.name]: CROP_CARROT,
    [CROP_CABBAGE.name]: CROP_CABBAGE
};

// Game map
const gameMap = [];

// Player inventory
const inventory = {
    money: 100,
    seeds: {
        [CROP_WHEAT.name]: 5,
        [CROP_CARROT.name]: 0,
        [CROP_CABBAGE.name]: 0
    },
    selectedSeed: CROP_WHEAT.name
};

// Initialize map
for (let row = 0; row < MAP_NUM_ROWS; row++) {
    gameMap[row] = [];
    for (let col = 0; col < MAP_NUM_COLS; col++) {
        gameMap[row][col] = {
            type: TILE_GRASS,
            crop: null
        };
    }
}

// Create a planting area
for (let row = 5; row < 15; row++) {
    for (let col = 5; col < 20; col++) {
        gameMap[row][col].type = TILE_SOIL;
    }
}

function drawMap() {
    for (let row = 0; row < MAP_NUM_ROWS; row++) {
        for (let col = 0; col < MAP_NUM_COLS; col++) {
            const tile = gameMap[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            // Draw tile
            switch (tile.type) {
                case TILE_GRASS:
                    ctx.fillStyle = '#8BC34A'; // Green
                    break;
                case TILE_SOIL:
                    ctx.fillStyle = '#A1887F'; // Brown
                    break;
            }
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#4CAF50';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            // Draw crop
            if (tile.crop) {
                const crop = tile.crop;
                const growthPercentage = Math.min(1, (Date.now() - crop.plantedTime) / crop.type.growthTime);

                ctx.font = `${TILE_SIZE * growthPercentage}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(crop.type.emoji, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            }
        }
    }
}

function updateUI() {
    const shopArea = document.getElementById('shop-area');
    const inventoryArea = document.getElementById('inventory-area');

    // Update shop
    shopArea.innerHTML = '<h2>Shop</h2>';
    for (const cropName in CROPS) {
        const crop = CROPS[cropName];
        const buyButton = document.createElement('button');
        buyButton.textContent = `Buy ${crop.emoji} ${crop.name} Seed ($${crop.seedPrice})`;
        buyButton.onclick = () => {
            if (inventory.money >= crop.seedPrice) {
                inventory.money -= crop.seedPrice;
                inventory.seeds[crop.name]++;
                updateUI();
            }
        };
        shopArea.appendChild(buyButton);
    }

    // Update inventory
    inventoryArea.innerHTML = `<h2>Inventory</h2><p>Money: $${inventory.money}</p>`;
    for (const seedName in inventory.seeds) {
        const seedCount = inventory.seeds[seedName];
        const seedButton = document.createElement('button');
        const crop = CROPS[seedName];
        seedButton.textContent = `${crop.emoji} ${seedName}: ${seedCount}`;
        if (inventory.selectedSeed === seedName) {
            seedButton.disabled = true;
        }
        seedButton.onclick = () => {
            inventory.selectedSeed = seedName;
            updateUI();
        };
        inventoryArea.appendChild(seedButton);
    }
}

let selectedTile = null;

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game objects
    drawMap();

    // Draw selected tile indicator
    if (selectedTile) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(selectedTile.col * TILE_SIZE, selectedTile.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const hoverCol = Math.floor(mouseX / TILE_SIZE);
    const hoverRow = Math.floor(mouseY / TILE_SIZE);

    if (hoverRow >= 0 && hoverRow < MAP_NUM_ROWS && hoverCol >= 0 && hoverCol < MAP_NUM_COLS) {
        selectedTile = { row: hoverRow, col: hoverCol };
    } else {
        selectedTile = null;
    }
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedCol = Math.floor(mouseX / TILE_SIZE);
    const clickedRow = Math.floor(mouseY / TILE_SIZE);

    if (clickedRow >= 0 && clickedRow < MAP_NUM_ROWS && clickedCol >= 0 && clickedCol < MAP_NUM_COLS) {
        const tile = gameMap[clickedRow][clickedCol];

        if (tile.type === TILE_SOIL && !tile.crop) {
            // Plant a seed
            const selectedSeedName = inventory.selectedSeed;
            if (inventory.seeds[selectedSeedName] > 0) {
                inventory.seeds[selectedSeedName]--;
                tile.crop = {
                    type: CROPS[selectedSeedName],
                    plantedTime: Date.now()
                };
                updateUI();
            }
        } else if (tile.crop) {
            // Harvest a crop
            const crop = tile.crop;
            if (Date.now() - crop.plantedTime >= crop.type.growthTime) {
                inventory.money += crop.type.harvestValue;
                tile.crop = null;
                updateUI();
            }
        }
    }
});

// Initial UI update
updateUI();

// Start the game loop
gameLoop();