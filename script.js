// Game state
        let gameState = {
            money: 500,
            level: 1,
            lastSaved: Date.now(),
            plots: [
                { id: 0, unlocked: true, cropId: null, soilType: 'basic', plantedTime: 0, growthProgress: 0 }
            ],
            soilTypes: {
                basic: { name: 'Basic Soil', growthMultiplier: 3, unlocked: true },
                fertile: { name: 'Fertile Soil', growthMultiplier: 3.5, unlocked: false },
                rich: { name: 'Rich Soil', growthMultiplier: 6, unlocked: false },
                premium: { name: 'Premium Soil', growthMultiplier: 9, unlocked: false }
            },
            upgrades: {
                plotUnlock: { level: 0, cost: 200, maxLevel: 9 },
                soilFertile: { level: 0, cost: 400, maxLevel: 1 },
                soilRich: { level: 0, cost: 2000, maxLevel: 1 },
                soilPremium: { level: 0, cost: 5000, maxLevel: 1 },
                offlineBonus: { level: 0, cost: 1000, maxLevel: 5 },
                autoHarvest: { level: 0, cost: 10000, maxLevel: 1 },
                autoPlant: { level: 0, cost: 25000, maxLevel: 1 },
                increasedYield: { level: 0, cost: 5000, maxLevel: 5 }
            }
        };
        
        // Define crops - each tier has different growth times and profits
        const crops = {
    // Tier 1 - Basic Starter Crops
    wheat: { id: 'wheat', name: 'Wheat', icon: '🌾', growTime: 15, cost: 10, sellPrice: 25, tier: 1, unlockLevel: 1 },
    lettuce: { id: 'lettuce', name: 'Lettuce', icon: '🥬', growTime: 25, cost: 15, sellPrice: 40, tier: 1, unlockLevel: 1 },
    carrot: { id: 'carrot', name: 'Carrot', icon: '🥕', growTime: 30, cost: 20, sellPrice: 60, tier: 1, unlockLevel: 1 },
    potato: { id: 'potato', name: 'Potato', icon: '🥔', growTime: 45, cost: 30, sellPrice: 100, tier: 1, unlockLevel: 1 },
    
    // Tier 2 - Advanced Crops
    tomato: { id: 'tomato', name: 'Tomato', icon: '🍅', growTime: 120, cost: 50, sellPrice: 150, tier: 2, unlockLevel: 2 },
    corn: { id: 'corn', name: 'Corn', icon: '🌽', growTime: 180, cost: 75, sellPrice: 240, tier: 2, unlockLevel: 2 },
    pepper: { id: 'pepper', name: 'Pepper', icon: '🌶️', growTime: 150, cost: 60, sellPrice: 190, tier: 2, unlockLevel: 2 },
    eggplant: { id: 'eggplant', name: 'Eggplant', icon: '🍆', growTime: 200, cost: 90, sellPrice: 300, tier: 2, unlockLevel: 3 },
    strawberry: { id: 'strawberry', name: 'Strawberry', icon: '🍓', growTime: 240, cost: 100, sellPrice: 350, tier: 2, unlockLevel: 3 },
    
    // Tier 3 - Premium Crops
    pineapple: { id: 'pineapple', name: 'Pineapple', icon: '🍍', growTime: 360, cost: 200, sellPrice: 700, tier: 3, unlockLevel: 4 },
    mango: { id: 'mango', name: 'Mango', icon: '🥭', growTime: 390, cost: 240, sellPrice: 850, tier: 3, unlockLevel: 4 },
    coconut: { id: 'coconut', name: 'Coconut', icon: '🥥', growTime: 420, cost: 280, sellPrice: 950, tier: 3, unlockLevel: 4 },
    watermelon: { id: 'watermelon', name: 'Watermelon', icon: '🍉', growTime: 480, cost: 350, sellPrice: 1200, tier: 3, unlockLevel: 5 },
    
    // Tier 4 - Exotic Crops
    sunflower: { id: 'sunflower', name: 'Sunflower', icon: '🌻', growTime: 600, cost: 500, sellPrice: 1800, tier: 4, unlockLevel: 6 },
    avocado: { id: 'avocado', name: 'Avocado', icon: '🥑', growTime: 720, cost: 650, sellPrice: 2400, tier: 4, unlockLevel: 7 },
    dragon: { id: 'dragon', name: 'Dragon Fruit', icon: '🐉', growTime: 900, cost: 800, sellPrice: 3000, tier: 4, unlockLevel: 8 },
    
    // Tier 5 - Legendary Crops
    golden: { id: 'golden', name: 'Golden Apple', icon: '🍎', growTime: 1200, cost: 1500, sellPrice: 5000, tier: 5, unlockLevel: 9 },
    crystal: { id: 'crystal', name: 'Crystal Flower', icon: '💎', growTime: 1800, cost: 3000, sellPrice: 10000, tier: 5, unlockLevel: 10 }
};
        
        // DOM Elements
        const moneyDisplay = document.getElementById('money');
        const levelDisplay = document.getElementById('level');
        const plotsContainer = document.getElementById('plots');
        const cropsShop = document.getElementById('crops-shop');
        const upgradesList = document.getElementById('upgrades-list');
        const notificationsContainer = document.getElementById('notifications');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        const offlineRewardsModal = document.getElementById('offline-rewards');
        const offlineMoneyDisplay = document.getElementById('offline-money');
        const claimRewardsBtn = document.getElementById('claim-rewards');
        
        // Event Listeners for tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                tab.classList.add('active');
                const tabContentId = tab.getAttribute('data-tab');
                document.getElementById(tabContentId).classList.add('active');
            });
        });
        
        // Initialize game
        function init() {
            loadGame();
            renderPlots();
            renderShop();
            renderUpgrades();
            setupSaveButtons();
            
            // Check for offline rewards
            checkOfflineRewards();
            
            // Start game loop
            setInterval(gameLoop, 1000);
            
            // Auto-save every minute
            setInterval(() => {
                saveGame();
                showNotification('Game autosaved');
            }, 60000);
        }
        
        // Game loop (runs every second)
        function gameLoop() {
            updateCrops();
            updateUI();
        }
        
        // Update all growing crops
        function updateCrops() {
            gameState.plots.forEach(plot => {
                if (plot.unlocked && plot.cropId) {
                    const crop = crops[plot.cropId];
                    const soilMultiplier = gameState.soilTypes[plot.soilType].growthMultiplier;
                    
                    // Increase growth based on soil type
                    plot.growthProgress += (1 / crop.growTime) * 100 * soilMultiplier;
                    
                    // If fully grown, update UI
                    if (plot.growthProgress >= 100) {
                        plot.growthProgress = 100;
                        updatePlotUI(plot.id);
                    } else {
                        // Update progress bar
                        const progressBar = document.querySelector(`#plot-${plot.id} .progress-bar`);
                        if (progressBar) {
                            progressBar.style.width = `${plot.growthProgress}%`;
                        }
                    }
                }
            });
        }
        
        // Update UI elements
        function updateUI() {
            moneyDisplay.textContent = Math.floor(gameState.money);
            levelDisplay.textContent = gameState.level;
        }
        
// Render all plots
function renderPlots() {
    plotsContainer.innerHTML = '';
    
    // First render unlocked plots
    gameState.plots.forEach(plot => {
        if (plot.unlocked) {
            const plotElement = document.createElement('div');
            plotElement.className = 'plot';
            plotElement.id = `plot-${plot.id}`;
            
            // If there's a crop growing, show it
            if (plot.cropId) {
                const crop = crops[plot.cropId];
                const isReady = plot.growthProgress >= 100;
                
                plotElement.innerHTML = `
                    <div class="crop-growing">
                        <div class="crop-icon">${crop.icon}</div>
                    </div>
                    ${isReady ? '<div class="plot-status">Ready to harvest!</div>' : ''}
                    <div class="progress-bar" style="width: ${plot.growthProgress}%"></div>
                `;
                
                if (isReady) {
                    plotElement.style.backgroundColor = '#4caf50';
                }
            } else {
                plotElement.innerHTML = `
                    <div class="plot-status">Empty Plot</div>
                    <div class="plot-status">Soil: ${gameState.soilTypes[plot.soilType].name}</div>
                `;
            }
            
            plotElement.addEventListener('click', () => handlePlotClick(plot.id));
            plotsContainer.appendChild(plotElement);
        }
    });
            
    // Then add one locked plot if we haven't reached max
    if (gameState.plots.length < 10) {
        const lockedPlot = document.createElement('div');
        lockedPlot.className = 'plot locked';
        lockedPlot.innerHTML = `
            <div class="plot-status">Locked Plot</div>
            <div class="plot-status">Cost: $${gameState.upgrades.plotUnlock.cost}</div>
        `;
        lockedPlot.addEventListener('click', () => purchasePlot());
        plotsContainer.appendChild(lockedPlot);
    }
}
        
        // Handle clicking on a plot
        function handlePlotClick(plotId) {
            const plot = gameState.plots.find(p => p.id === plotId);
            
            if (!plot) return;
            
            // If the plot has a fully grown crop, harvest it
            if (plot.cropId && plot.growthProgress >= 100) {
                harvestCrop(plotId);
            } else if (!plot.cropId) {
                // If the plot is empty, show crop selection
                showCropSelection(plotId);
            }
        }
        
        // Harvest a crop
        function harvestCrop(plotId) {
            const plot = gameState.plots.find(p => p.id === plotId);
            if (!plot || !plot.cropId) return;
            
            const crop = crops[plot.cropId];
            gameState.money += crop.sellPrice;
            
            showNotification(`Harvested ${crop.name} for $${crop.sellPrice}!`);
            
            // Clear the plot
            plot.cropId = null;
            plot.growthProgress = 0;
            plot.plantedTime = 0;
            
            // Check if player should level up
            checkLevelUp();
            
            // Update UI
            updateUI();
            updatePlotUI(plotId);
        }
        
        // Show crop selection for a plot
        function showCropSelection(plotId) {
            // For simplicity, just open the shop tab
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            const shopTab = document.querySelector('[data-tab="shop"]');
            shopTab.classList.add('active');
            document.getElementById('shop').classList.add('active');
            
            // Highlight available crops
            document.querySelectorAll('.shop-item').forEach(item => {
                item.style.border = '2px solid transparent';
            });
            
            showNotification('Select a crop from the shop to plant!');
            
            // Setup crop selection
            document.querySelectorAll('.shop-item button').forEach(btn => {
                const originalText = btn.textContent;
                btn.textContent = 'Plant';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const cropId = btn.getAttribute('data-crop-id');
                    plantCrop(plotId, cropId);
                    
                    // Reset buttons
                    document.querySelectorAll('.shop-item button').forEach(b => {
                        b.textContent = 'Buy';
                        b.onclick = null;
                    });
                    
                    renderShop();
                };
            });
        }
        
        // Plant a crop on a plot
        function plantCrop(plotId, cropId) {
            const plot = gameState.plots.find(p => p.id === plotId);
            const crop = crops[cropId];
            
            if (!plot || !crop || plot.cropId) return;
            
            if (gameState.money < crop.cost) {
                showNotification(`Not enough money to buy ${crop.name}!`);
                return;
            }
            
            gameState.money -= crop.cost;
            plot.cropId = cropId;
            plot.plantedTime = Date.now();
            plot.growthProgress = 0;
            
            showNotification(`Planted ${crop.name}!`);
            
            updateUI();
            updatePlotUI(plotId);
        }
        
        // Update a single plot's UI
function updatePlotUI(plotId) {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot) return;
    
    const plotElement = document.getElementById(`plot-${plotId}`);
    if (!plotElement) return;
    
    if (plot.cropId) {
        const crop = crops[plot.cropId];
        const isReady = plot.growthProgress >= 100;
        
        plotElement.innerHTML = `
            <div class="crop-growing">
                <div class="crop-icon">${crop.icon}</div>
            </div>
            ${isReady ? '<div class="plot-status">Ready to harvest!</div>' : ''}
            <div class="progress-bar" style="width: ${plot.growthProgress}%"></div>
        `;
        
        if (isReady) {
            plotElement.style.backgroundColor = '#4caf50';
        } else {
            plotElement.style.backgroundColor = '#a87036';
        }
    } else {
        plotElement.style.backgroundColor = '#a87036';
        plotElement.innerHTML = `
            <div class="plot-status">Empty Plot</div>
            <div class="plot-status">Soil: ${gameState.soilTypes[plot.soilType].name}</div>
        `;
    }
}
        // Render the shop
        function renderShop() {
            cropsShop.innerHTML = '';
            
            // Group crops by tier
            const cropsByTier = {};
            Object.values(crops).forEach(crop => {
                if (!cropsByTier[crop.tier]) {
                    cropsByTier[crop.tier] = [];
                }
                if (crop.unlockLevel <= gameState.level) {
                    cropsByTier[crop.tier].push(crop);
                }
            });
            
            // Create shop items for each tier
            Object.keys(cropsByTier).sort((a, b) => parseInt(a) - parseInt(b)).forEach(tier => {
                const tierCrops = cropsByTier[tier];
                if (tierCrops.length > 0) {
                    const tierHeader = document.createElement('h3');
                    tierHeader.textContent = `Tier ${tier} Crops`;
                    cropsShop.appendChild(tierHeader);
                    
                    tierCrops.forEach(crop => {
                        const shopItem = document.createElement('div');
                        shopItem.className = 'shop-item';
                        shopItem.innerHTML = `
                            <div class="item-image">${crop.icon}</div>
                            <div class="item-info">
                                <div class="item-name">${crop.name}</div>
                                <div class="item-desc">Grows in ${formatTime(crop.growTime)}. Sells for $${crop.sellPrice}</div>
                            </div>
                            <button class="btn" data-crop-id="${crop.id}">Buy ($${crop.cost})</button>
                        `;
                        cropsShop.appendChild(shopItem);
                    });
                }
            });
            
            // Add event listeners for buy buttons
            document.querySelectorAll('.shop-item button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showNotification('Click on an empty plot to plant this crop!');
                });
            });
        }
        
        // Render upgrades
        // Helper function to create upgrade item HTML
        function createUpgradeItem(upgrade) {
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = 'upgrade-item';
            upgradeDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${upgrade.name}</div>
                    <div class="item-desc">${upgrade.desc}</div>
                </div>
                <button class="btn" data-upgrade-id="${upgrade.id}" ${!upgrade.unlocked || gameState.money < upgrade.cost ? 'disabled' : ''}>
                    ${upgrade.unlocked ? `Buy ($${upgrade.cost})` : 'Locked'}
                </button>
            `;
            const buyButton = upgradeDiv.querySelector('.btn');
            buyButton.addEventListener('click', () => buyUpgrade(upgrade.id));
            return upgradeDiv;
        }

        function renderUpgrades() {
            upgradesList.innerHTML = '';

            // Plot unlock upgrade
            if (gameState.upgrades.plotUnlock.level < gameState.upgrades.plotUnlock.maxLevel) {
                const upgradeItem = createUpgradeItem({
                    id: 'plotUnlock',
                    name: 'Unlock New Plot',
                    desc: `Unlocks a new plot for planting. (${gameState.upgrades.plotUnlock.level}/${gameState.upgrades.plotUnlock.maxLevel})`,
                    cost: gameState.upgrades.plotUnlock.cost,
                    unlocked: true
                });
                upgradesList.appendChild(upgradeItem);
            }

            // Soil upgrades
            const soilUpgrades = [
                { id: 'soilFertile', name: 'Fertile Soil', desc: 'Crops grow 15% faster.', cost: gameState.upgrades.soilFertile.cost, unlocked: gameState.level >= 2 && !gameState.soilTypes.fertile.unlocked },
                { id: 'soilRich', name: 'Rich Soil', desc: 'Crops grow 30% faster.', cost: gameState.upgrades.soilRich.cost, unlocked: gameState.level >= 4 && !gameState.soilTypes.rich.unlocked },
                { id: 'soilPremium', name: 'Premium Soil', desc: 'Crops grow 50% faster.', cost: gameState.upgrades.soilPremium.cost, unlocked: gameState.level >= 6 && !gameState.soilTypes.premium.unlocked }
            ];

            soilUpgrades.forEach(upgrade => {
                if (upgrade.unlocked) {
                    const upgradeItem = createUpgradeItem(upgrade);
                    upgradesList.appendChild(upgradeItem);
                }
            });
            
            if (gameState.upgrades.offlineBonus.level < gameState.upgrades.offlineBonus.maxLevel) {
                const currentBonus = 20 + (gameState.upgrades.offlineBonus.level * 10);
                const nextBonus = 20 + ((gameState.upgrades.offlineBonus.level + 1) * 10);
                const upgradeItem = createUpgradeItem({
                    id: 'offlineBonus',
                    name: 'Offline Earnings',
                    desc: `Increase offline earnings from ${currentBonus}% to ${nextBonus}%. (${gameState.upgrades.offlineBonus.level}/${gameState.upgrades.offlineBonus.maxLevel})`,
                    cost: gameState.upgrades.offlineBonus.cost,
                    unlocked: true
                });
                upgradesList.appendChild(upgradeItem);
            }

            // Auto Harvest
            if (gameState.upgrades.autoHarvest.level < gameState.upgrades.autoHarvest.maxLevel) {
                const upgradeItem = createUpgradeItem({
                    id: 'autoHarvest',
                    name: 'Auto Harvester',
                    desc: 'Automatically harvests crops when they are ready.',
                    cost: gameState.upgrades.autoHarvest.cost,
                    unlocked: true
                });
                upgradesList.appendChild(upgradeItem);
            }

            // Auto Plant
            if (gameState.upgrades.autoPlant.level < gameState.upgrades.autoPlant.maxLevel) {
                const upgradeItem = createUpgradeItem({
                    id: 'autoPlant',
                    name: 'Auto Planter',
                    desc: 'Automatically plants the last used crop in an empty plot.',
                    cost: gameState.upgrades.autoPlant.cost,
                    unlocked: true
                });
                upgradesList.appendChild(upgradeItem);
            }

            // Increased Yield
            if (gameState.upgrades.increasedYield.level < gameState.upgrades.increasedYield.maxLevel) {
                const currentYield = 100 + (gameState.upgrades.increasedYield.level * 10);
                const nextYield = 100 + ((gameState.upgrades.increasedYield.level + 1) * 10);
                const upgradeItem = createUpgradeItem({
                    id: 'increasedYield',
                    name: 'Increased Yield',
                    desc: `Increase crop yield from ${currentYield}% to ${nextYield}%. (${gameState.upgrades.increasedYield.level}/${gameState.upgrades.increasedYield.maxLevel})`,
                    cost: gameState.upgrades.increasedYield.cost,
                    unlocked: true
                });
                upgradesList.appendChild(upgradeItem);
            }
        }
        
        // Add an upgrade item to the list
        function addUpgradeItem(upgrade) {
            const canAfford = gameState.money >= upgrade.cost;
            
            const upgradeItem = document.createElement('div');
            upgradeItem.className = 'upgrade-item';
            upgradeItem.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${upgrade.name}</div>
                    <div class="item-desc">${upgrade.description}</div>
                </div>
                <button class="btn" ${!canAfford ? 'disabled' : ''}>${canAfford ? `Buy ($${upgrade.cost})` : `Need $${upgrade.cost}`}</button>
            `;
            
            upgradeItem.querySelector('button').addEventListener('click', () => {
                if (gameState.money >= upgrade.cost) {
                    upgrade.action();
                }
            });
            
            upgradesList.appendChild(upgradeItem);
        }
        
        // Purchase a new plot
        function purchasePlot() {
            const cost = gameState.upgrades.plotUnlock.cost;
            
            if (gameState.money < cost) {
                showNotification(`Not enough money to buy a new plot! Need $${cost}`);
                return;
            }
            
            gameState.money -= cost;
            gameState.upgrades.plotUnlock.level++;
            
            // Increase cost for next plot
            gameState.upgrades.plotUnlock.cost = Math.floor(gameState.upgrades.plotUnlock.cost * 1.8);
            
            // Add new plot
            const newPlotId = gameState.plots.length;
            gameState.plots.push({
                id: newPlotId,
                unlocked: true,
                cropId: null,
                soilType: 'basic',
                plantedTime: 0,
                growthProgress: 0
            });
            
            showNotification(`Purchased a new plot of land!`);
            
            updateUI();
            renderPlots();
            renderUpgrades();
        }
        
        // Purchase soil upgrade
        function purchaseSoilUpgrade(soilType) {
            let upgradeId;
            switch (soilType) {
                case 'fertile': upgradeId = 'soilFertile'; break;
                case 'rich': upgradeId = 'soilRich'; break;
                case 'premium': upgradeId = 'soilPremium'; break;
                default: return;
            }
            
            const cost = gameState.upgrades[upgradeId].cost;
            
            if (gameState.money < cost) {
                showNotification(`Not enough money for soil upgrade! Need $${cost}`);
                return;
            }
            
            gameState.money -= cost;
            gameState.upgrades[upgradeId].level = 1;
            gameState.soilTypes[soilType].unlocked = true;
            
            // Update all empty plots to use the new soil type
            gameState.plots.forEach(plot => {
                if (!plot.cropId) {
                    plot.soilType = soilType;
                }
            });
            
            showNotification(`Upgraded to ${gameState.soilTypes[soilType].name}!`);
            
            updateUI();
            renderPlots();
            renderUpgrades();
        }
        
        // Purchase offline bonus upgrade
        function purchaseOfflineBonus() {
            const cost = gameState.upgrades.offlineBonus.cost;
            
            if (gameState.money < cost) {
                showNotification(`Not enough money for offline bonus! Need $${cost}`);
                return;
            }
            
            gameState.money -= cost;
            gameState.upgrades.offlineBonus.level++;
            
            // Increase cost for next level
            gameState.upgrades.offlineBonus.cost = Math.floor(gameState.upgrades.offlineBonus.cost * 2);
            
            showNotification(`Improved offline production bonus!`);
            
            updateUI();
            renderUpgrades();
        }
        
        // Check if player should level up
            const requiredMoney = 200 * Math.pow(3, gameState.level); // Made it 2x harder
            if (gameState.money >= requiredMoney && gameState.level < 10) {
                gameState.level++;
                showNotification(`Level up! You're now level ${gameState.level}!`, 5000);
                
                // Re-render shop to show new crops
                renderShop();
                renderUpgrades();
            }
        
        // Show notification
        function showNotification(message, duration = 3000) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            
            notificationsContainer.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, duration);
        }
        
        // Format seconds to mm:ss
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        // Check for offline rewards
        function checkOfflineRewards() {
            if (!gameState.lastSaved) return;
            
            const currentTime = Date.now();
            const timeDiff = (currentTime - gameState.lastSaved) / 1000; // in seconds
            
            // If less than 5 minutes have passed, don't show offline rewards
            if (timeDiff < 300) return;
            
            // Calculate offline earnings
            let offlineEarnings = 0;
            
            // Calculate base offline percentage (20% + 10% per offlineBonus level)
            const offlinePercentage = 20 + (gameState.upgrades.offlineBonus.level * 10);
            
            // Check each plot with a crop
            gameState.plots.forEach(plot => {
                if (plot.unlocked && plot.cropId) {
                    const crop = crops[plot.cropId];
                    const soilMultiplier = gameState.soilTypes[plot.soilType].growthMultiplier;
                    
                    // How many times this crop could have completed growing
                    const growthTime = crop.growTime / soilMultiplier;
                    const cycles = Math.floor(timeDiff / growthTime);
                    
                    // Calculate earnings with offline percentage reduction
                    offlineEarnings += (crop.sellPrice * cycles) * (offlinePercentage / 100);
                    
                    // Update plot growth progress
                    const remainingTime = timeDiff % growthTime;
                    plot.growthProgress = Math.min(100, (remainingTime / growthTime) * 100);
                }
            });
            
            // If earnings > 0, show modal
            if (offlineEarnings > 0) {
                offlineMoneyDisplay.textContent = Math.floor(offlineEarnings);
                offlineRewardsModal.style.display = 'flex';
                
                claimRewardsBtn.onclick = () => {
                    gameState.money += Math.floor(offlineEarnings);
                    updateUI();
                    offlineRewardsModal.style.display = 'none';
                    
                    // Check if player should level up
                    checkLevelUp();
                };
            }
            
            // Update last saved time
            gameState.lastSaved = currentTime;
        }
        
        // Save/Load functions
        function saveGame() {
            gameState.lastSaved = Date.now();
            localStorage.setItem('cropCommanderSave', JSON.stringify(gameState));
        }
        
        function loadGame() {
            const savedGame = localStorage.getItem('cropCommanderSave');
            if (savedGame) {
                try {
                    const parsedState = JSON.parse(savedGame);
                    gameState = parsedState;
                } catch (error) {
                    console.error('Error loading saved game:', error);
                }
            }
        }
        
        function resetGame() {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
                localStorage.clear();
                gameState = {
                    money: 500,
                    level: 1,
                    lastSaved: Date.now(),
                    plots: [
                        { id: 0, unlocked: true, cropId: null, soilType: 'basic', plantedTime: 0, growthProgress: 0 }
                    ],
                    soilTypes: {
                        basic: { name: 'Basic Soil', growthMultiplier: 3, unlocked: true },
                        fertile: { name: 'Fertile Soil', growthMultiplier: 3.5, unlocked: false },
                        rich: { name: 'Rich Soil', growthMultiplier: 6, unlocked: false },
                        premium: { name: 'Premium Soil', growthMultiplier: 9, unlocked: false }
                    },
                    upgrades: {
                        plotUnlock: { level: 0, cost: 300, maxLevel: 9 },
                        soilFertile: { level: 0, cost: 600, maxLevel: 1 },
                        soilRich: { level: 0, cost: 2000, maxLevel: 1 },
                        soilPremium: { level: 0, cost: 5000, maxLevel: 1 },
                        offlineBonus: { level: 0, cost: 1000, maxLevel: 5 }
                    }
                };
                renderPlots();
                renderShop();
                renderUpgrades();
                updateUI();
                showNotification('Game progress reset successfully!');
            }
        }
        
        // Setup save/load/reset buttons
        function setupSaveButtons() {
            document.getElementById('save-game').addEventListener('click', () => {
                saveGame();
                showNotification('Game saved successfully!');
            });
            
            document.getElementById('load-game').addEventListener('click', () => {
                loadGame();
                renderPlots();
                renderShop();
                renderUpgrades();
                updateUI();
                showNotification('Game loaded successfully!');
            });
            
            document.getElementById('reset-game').addEventListener('click', resetGame);
            
            // Export/Import functionality
            document.getElementById('export-save').addEventListener('click', () => {
                const exportData = document.getElementById('import-export-data');
                exportData.style.display = 'block';
                exportData.value = btoa(JSON.stringify(gameState));
                exportData.select();
                document.execCommand('copy');
                showNotification('Save data copied to clipboard!');
            });
            
            document.getElementById('import-save').addEventListener('click', () => {
                const importData = document.getElementById('import-export-data');
                importData.style.display = 'block';
                importData.value = '';
                importData.focus();
                
                importData.onblur = () => {
                    try {
                        if (importData.value) {
                            gameState = JSON.parse(atob(importData.value));
                            renderPlots();
                            renderShop();
                            renderUpgrades();
                            updateUI();
                            showNotification('Game imported successfully!');
                        }
                    } catch (error) {
                        showNotification('Invalid save data!');
                        console.error('Import error:', error);
                    }
                };
            });
        }
        
        // Initialize game
        window.addEventListener('load', init);
        
        // Save game when window is closed
        window.addEventListener('beforeunload', saveGame);