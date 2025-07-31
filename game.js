const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game settings
const TILE_SIZE = 32;
const MAP_NUM_ROWS = 18;
const MAP_NUM_COLS = 25;

// Tile types
const TILE_GRASS = 0;
const TILE_SOIL = 1;
const TILE_FERTILE_SOIL = 2;
const TILE_GREENHOUSE = 3;

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
    selectedSeed: CROP_WHEAT.name,
    farmLevel: 1,
    soilLevel: 1,
    hasGreenhouse: false
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

const farmSizes = {
    1: { startRow: 5, endRow: 10, startCol: 5, endCol: 10, upgradeCost: 200 },
    2: { startRow: 5, endRow: 15, startCol: 5, endCol: 15, upgradeCost: 500 },
    3: { startRow: 5, endRow: 15, startCol: 5, endCol: 20, upgradeCost: 0 }
};

const soilTiers = {
    1: { type: TILE_SOIL, growthMultiplier: 1, upgradeCost: 300 },
    2: { type: TILE_FERTILE_SOIL, growthMultiplier: 1.5, upgradeCost: 0 }
};

function updateFarmArea() {
    const farmSize = farmSizes[inventory.farmLevel];
    const soilType = soilTiers[inventory.soilLevel].type;
    for (let row = 0; row < MAP_NUM_ROWS; row++) {
        for (let col = 0; col < MAP_NUM_COLS; col++) {
            if (row >= farmSize.startRow && row < farmSize.endRow && col >= farmSize.startCol && col < farmSize.endCol) {
                if (inventory.hasGreenhouse && row >= farmSize.startRow && row < farmSize.startRow + 5 && col >= farmSize.startCol && col < farmSize.startCol + 5) {
                    gameMap[row][col].type = TILE_GREENHOUSE;
                } else {
                    gameMap[row][col].type = soilType;
                }
            } else {
                gameMap[row][col].type = TILE_GRASS;
            }
        }
    }
}

updateFarmArea();

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
                case TILE_FERTILE_SOIL:
                    ctx.fillStyle = '#6D4C41'; // Darker Brown
                    break;
                case TILE_GREENHOUSE:
                    ctx.fillStyle = '#C8E6C9'; // Light Green
                    break;
            }
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#4CAF50';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            // Draw crop
            if (tile.crop) {
                const crop = tile.crop;
                const growthTime = crop.type.growthTime / soilTiers[inventory.soilLevel].growthMultiplier;
                const growthPercentage = Math.min(1, (Date.now() - crop.plantedTime) / growthTime);

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

    const farmSize = farmSizes[inventory.farmLevel];
    if (farmSize.upgradeCost > 0) {
        const upgradeFarmButton = document.createElement('button');
        upgradeFarmButton.textContent = `Upgrade Farm ($${farmSize.upgradeCost})`;
        upgradeFarmButton.onclick = () => {
            if (inventory.money >= farmSize.upgradeCost) {
                inventory.money -= farmSize.upgradeCost;
                inventory.farmLevel++;
                updateFarmArea();
                updateUI();
            }
        };
        shopArea.appendChild(upgradeFarmButton);
    }

    const soilTier = soilTiers[inventory.soilLevel];
    if (soilTier.upgradeCost > 0) {
        const upgradeSoilButton = document.createElement('button');
        upgradeSoilButton.textContent = `Upgrade Soil ($${soilTier.upgradeCost})`;
        upgradeSoilButton.onclick = () => {
            if (inventory.money >= soilTier.upgradeCost) {
                inventory.money -= soilTier.upgradeCost;
                inventory.soilLevel++;
                updateFarmArea();
                updateUI();
            }
        };
        shopArea.appendChild(upgradeSoilButton);
    }

    if (!inventory.hasGreenhouse) {
        const buyGreenhouseButton = document.createElement('button');
        buyGreenhouseButton.textContent = `Buy Greenhouse ($1000)`;
        buyGreenhouseButton.onclick = () => {
            if (inventory.money >= 1000) {
                inventory.money -= 1000;
                inventory.hasGreenhouse = true;
                updateFarmArea();
                updateUI();
            }
        };
        shopArea.appendChild(buyGreenhouseButton);
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
            const growthTime = tile.type === TILE_GREENHOUSE ? crop.type.growthTime / 2 : crop.type.growthTime / soilTiers[inventory.soilLevel].growthMultiplier;
            if (Date.now() - crop.plantedTime >= growthTime) {
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