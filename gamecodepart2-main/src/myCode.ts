const playerLabel = document.createElement("div");
const world = document.createElement("main");
const claimLabel = document.createElement("span");
const levelLabel = document.createElement("span");
const statusLabel = document.createElement("p");

type Box = { x: number; y: number; width: number; height: number };
type Asteroid = { x: number; y: number; claimed: boolean };
type Hazard = { x: number; y: number; width: number; height: number; kind: "spikes" | "gravity" };
type Enemy = { x: number; y: number; defeated: boolean };
type Projectile = { x: number; y: number; vx: number; vy: number; element: HTMLElement };
type Level = { name: string; briefing: string; length: number; asteroids: number[]; walls: number[]; enemies: number[]; spikes: number[]; gravity: number[] };

const TILE_WIDTH = 180;
const levels: Level[] = [
    { name: "Quiet Orbit", briefing: "Learn the drift. Claim every asteroid and reach the beacon.", length: 12, asteroids: [2, 5, 8], walls: [4], enemies: [], spikes: [], gravity: [] },
    { name: "Redline Pass", briefing: "The rocks are tighter here. Watch the sentry fire.", length: 15, asteroids: [2, 5, 8, 12], walls: [4, 7], enemies: [9], spikes: [6], gravity: [] },
    { name: "Gravity Well", briefing: "Gravity wells pull you down. Use a double jump to escape.", length: 17, asteroids: [2, 5, 9, 13, 15], walls: [4, 8, 12], enemies: [7, 14], spikes: [6, 11], gravity: [10] },
    { name: "Shatter Belt", briefing: "Spikes, sentries, and a long drift. Keep your hull steady.", length: 20, asteroids: [2, 5, 8, 11, 15, 18], walls: [4, 7, 10, 14, 17], enemies: [6, 13, 16], spikes: [5, 12, 16], gravity: [9, 18] },
    { name: "Last Light", briefing: "The final claim. Bring seven asteroids home through the storm.", length: 23, asteroids: [2, 5, 8, 11, 14, 17, 20], walls: [4, 7, 10, 13, 16, 19], enemies: [6, 12, 15, 21], spikes: [5, 9, 14, 18], gravity: [8, 11, 17, 20] },
];

const skins = [
    { name: "Solar", color: "#ed7657", required: 0 },
    { name: "Mint", color: "#62d6b2", required: 3 },
    { name: "Gold", color: "#f6c46e", required: 7 },
    { name: "Plasma", color: "#b991ff", required: 12 },
    { name: "Aurora", color: "#6ecbff", required: 18 },
];

let playerX = 120;
let playerY = 300;
let verticalSpeed = 0;
let jumpCount = 0;
let asteroidsClaimed = Number(localStorage.getItem("orbit-claims") ?? "0");
let currentLevel = 0;
let levelAsteroids: Asteroid[] = [];
let levelObstacles: Box[] = [];
let levelHazards: Hazard[] = [];
let levelEnemies: Enemy[] = [];
let projectiles: Projectile[] = [];
let projectileTimer = 0;
let gameStarted = false;
let gameActive = false;
let animationFrame = 0;
let previousPlayerY = playerY;
let selectedSkin = Number(localStorage.getItem("orbit-skin") ?? "0");
let reducedEffects = localStorage.getItem("orbit-reduced-effects") === "true";
const pressedKeys = new Set<string>();
const gravity = 0.7;
const jumpPower = -16;
const playerWidth = 48;
const playerHeight = 58;

export function startApp() {
    document.body.innerHTML = "";
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", () => pressedKeys.clear());
    showMenu();
}

function showMenu() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    pressedKeys.clear();
    const menu = document.createElement("main");
    menu.className = "menu-screen home-screen";
    menu.innerHTML = `<div class="brand-mark">ORBIT RUN <span>/ 02</span></div><h1>Asteroid <em>Claim</em></h1><p class="menu-copy">Pilot the claim ship through five dangerous sectors. Every asteroid you secure upgrades your flight rig.</p><div class="home-stats"><span><strong>${asteroidsClaimed}</strong> total claimed</span><span><strong>${getUnlockedSkinCount()}</strong> skins online</span></div>`;
    menu.append(createMenuButton("Launch mission", showLevelMenu), createMenuButton("Flight settings", showSettings));
    document.body.replaceChildren(menu);
}

function createMenuButton(text: string, action: () => void) {
    const button = document.createElement("button");
    button.className = "menu-button";
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", action);
    return button;
}

function showLevelMenu() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    pressedKeys.clear();
    const menu = document.createElement("main");
    menu.className = "menu-screen level-menu";
    menu.innerHTML = `<p class="eyebrow">MISSION SELECT</p><h1>Choose your <em>sector</em></h1><p class="menu-copy">Claim the asteroids in order. New sectors unlock after the previous beacon is reached.</p>`;
    const levelList = document.createElement("div");
    levelList.className = "level-list";
    levels.forEach((level, index) => {
        const unlocked = index === 0 || Number(localStorage.getItem(`orbit-level-${index}`) ?? "0") === 1;
        const button = document.createElement("button");
        button.className = `level-button ${unlocked ? "" : "locked"}`;
        button.type = "button";
        button.disabled = !unlocked;
        button.innerHTML = `<span><b>0${index + 1}</b> ${level.name}</span><small>${unlocked ? `${level.asteroids.length} asteroids / ${level.briefing}` : "LOCKED / reach the previous beacon"}</small>`;
        if (unlocked) button.addEventListener("click", () => startGame(index));
        levelList.append(button);
    });
    menu.append(levelList, createTextButton("Settings", showSettings), createTextButton("Main menu", showMenu));
    document.body.replaceChildren(menu);
}

function showSettings() {
    const menu = document.createElement("main");
    menu.className = "menu-screen settings-screen";
    menu.innerHTML = `<p class="eyebrow">FLIGHT SYSTEMS</p><h1>Ship <em>settings</em></h1><p class="menu-copy">Tune the cockpit for your setup. Your selection is saved on this device.</p>`;
    const panel = document.createElement("section");
    panel.className = "settings-panel";
    const effectsRow = document.createElement("label");
    effectsRow.className = "setting-row";
    effectsRow.innerHTML = `<span><b>Reduced effects</b><small>Calm the glow, trails, and motion.</small></span>`;
    const effectsInput = document.createElement("input");
    effectsInput.type = "checkbox";
    effectsInput.checked = reducedEffects;
    effectsInput.addEventListener("change", () => { reducedEffects = effectsInput.checked; localStorage.setItem("orbit-reduced-effects", String(reducedEffects)); });
    effectsRow.append(effectsInput);
    const skinTitle = document.createElement("p");
    skinTitle.className = "setting-title";
    skinTitle.textContent = "Ship skin";
    const skinGrid = document.createElement("div");
    skinGrid.className = "skin-grid";
    skins.forEach((skin, index) => {
        const unlocked = asteroidsClaimed >= skin.required;
        const button = document.createElement("button");
        button.className = `skin-option ${selectedSkin === index ? "selected" : ""}`;
        button.disabled = !unlocked;
        button.innerHTML = `<i style="background:${skin.color}"></i><span>${skin.name}</span><small>${unlocked ? "READY" : `${skin.required} claims`}</small>`;
        button.addEventListener("click", () => { selectedSkin = index; localStorage.setItem("orbit-skin", String(index)); showSettings(); });
        skinGrid.append(button);
    });
    panel.append(effectsRow, skinTitle, skinGrid);
    menu.append(panel, createTextButton("Back", showMenu));
    document.body.replaceChildren(menu);
}

function createTextButton(text: string, action: () => void) {
    const button = document.createElement("button");
    button.className = "text-button";
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", action);
    return button;
}

function buildLevel(levelIndex: number) {
    const level = levels[levelIndex];
    levelAsteroids = level.asteroids.map((index) => ({ x: 140 + index * TILE_WIDTH, y: 215 - (index % 2) * 55, claimed: false }));
    levelObstacles = level.walls.map((index, wallIndex) => ({ x: 140 + index * TILE_WIDTH, y: wallIndex % 2 ? 250 : 330, width: wallIndex % 2 ? 105 : 70, height: wallIndex % 2 ? 150 : 70 }));
    levelHazards = [...level.spikes.map((index) => ({ x: 140 + index * TILE_WIDTH, y: 380, width: 76, height: 20, kind: "spikes" as const })), ...level.gravity.map((index) => ({ x: 140 + index * TILE_WIDTH, y: 110, width: 115, height: 250, kind: "gravity" as const }))];
    levelEnemies = level.enemies.map((index) => ({ x: 140 + index * TILE_WIDTH, y: 285, defeated: false }));
}

function startGame(levelIndex = currentLevel) {
    currentLevel = levelIndex;
    buildLevel(currentLevel);
    playerX = 120; playerY = 300; verticalSpeed = 0; jumpCount = 0; projectiles = []; projectileTimer = 0; gameStarted = false; gameActive = true; previousPlayerY = playerY;
    document.body.innerHTML = "";
    createGameShell(); createPlayer(); createWorldObjects(); createControls(); startGameLoop();
}

function showWinScreen() {
    gameActive = false; cancelAnimationFrame(animationFrame);
    localStorage.setItem(`orbit-level-${currentLevel + 1}`, "1");
    const screen = document.createElement("main");
    screen.className = "win-screen";
    screen.innerHTML = `<p class="eyebrow">BEACON REACHED / SECTOR 0${currentLevel + 1}</p><h1>Claim <em>complete</em></h1><p class="menu-copy">Every asteroid secured. Total fleet claims: <strong>${asteroidsClaimed}</strong>.</p>`;
    screen.append(createMenuButton(currentLevel < levels.length - 1 ? "Next sector" : "Replay final sector", () => startGame(Math.min(currentLevel + 1, levels.length - 1))), createTextButton("Mission select", showLevelMenu));
    document.body.replaceChildren(screen);
}

function showGameOver(reason = "Your hull took a hit.") {
    if (!gameActive) return;
    gameActive = false; cancelAnimationFrame(animationFrame); pressedKeys.clear();
    const screen = document.createElement("main");
    screen.className = "win-screen game-over-screen";
    screen.innerHTML = `<p class="eyebrow">SIGNAL LOST</p><h1>Hull <em>breach</em></h1><p class="menu-copy">${reason} The sector is still waiting.</p>`;
    screen.append(createMenuButton("Retry sector", () => startGame(currentLevel)), createTextButton("Mission select", showLevelMenu));
    document.body.replaceChildren(screen);
}

function createGameShell() {
    const header = document.createElement("header");
    header.innerHTML = `<div><p class="eyebrow">ORBIT RUN / 02</p><h1>Asteroid <em>Claim</em></h1></div>`;
    const hud = document.createElement("div");
    hud.className = "hud";
    claimLabel.textContent = `0 / ${levelAsteroids.length}`;
    levelLabel.textContent = `SECTOR 0${currentLevel + 1}`;
    hud.innerHTML = `<span class="hud-label">CLAIMS</span>`;
    hud.append(claimLabel, levelLabel);
    header.append(hud);
    world.id = "game-world"; world.innerHTML = ""; world.setAttribute("aria-label", "Asteroid Claim game area");
    statusLabel.className = "status"; statusLabel.textContent = levels[currentLevel].briefing;
    const game = document.createElement("section"); game.className = "game-frame"; game.append(world, statusLabel);
    document.body.append(header, game);
}

function createPlayer() {
    playerLabel.className = "player"; playerLabel.style.setProperty("--ship-color", skins[selectedSkin].color); playerLabel.innerHTML = `<span class="ship-window"></span><span class="ship-flame"></span>`; world.append(playerLabel); updatePlayerPosition();
}

function createWorldObjects() {
    levelObstacles.forEach((obstacle) => { const element = document.createElement("div"); element.className = "obstacle"; Object.assign(element.style, { left: `${obstacle.x}px`, top: `${obstacle.y}px`, width: `${obstacle.width}px`, height: `${obstacle.height}px` }); world.append(element); });
    levelAsteroids.forEach((asteroid) => { const element = document.createElement("div"); element.className = "asteroid"; element.textContent = "✦"; element.style.left = `${asteroid.x}px`; element.style.top = `${asteroid.y}px`; world.append(element); });
    levelHazards.forEach((hazard) => { const element = document.createElement("div"); element.className = `hazard ${hazard.kind}`; element.style.left = `${hazard.x}px`; element.style.top = `${hazard.y}px`; element.style.width = `${hazard.width}px`; element.style.height = `${hazard.height}px`; element.setAttribute("aria-label", hazard.kind === "spikes" ? "Spike hazard" : "Gravity zone"); world.append(element); });
    levelEnemies.forEach((enemy) => { const element = document.createElement("div"); element.className = "enemy"; element.style.left = `${enemy.x}px`; element.style.top = `${enemy.y}px`; world.append(element); });
    const beacon = document.createElement("div"); beacon.className = "beacon"; beacon.style.left = `${(levels[currentLevel].length - 1) * TILE_WIDTH + 140}px`; world.append(beacon);
}

function createControls() {
    const controls = document.createElement("nav"); controls.className = "controls"; controls.setAttribute("aria-label", "Game controls");
    controls.append(createButton("left", "←", moveLeft), createButton("jump", "↑", jump), createButton("right", "→", moveRight), createButton("exit", "Exit", showLevelMenu));
    document.querySelector(".game-frame")?.append(controls);
}

function createButton(className: string, text: string, action: () => void) { const button = document.createElement("button"); button.className = `control-button ${className}`; button.type = "button"; button.textContent = text; button.setAttribute("aria-label", className === "exit" ? "Exit to mission select" : className === "jump" ? "Jump" : `Move ${className}`); button.addEventListener("click", action); return button; }
function handleKeyDown(event: KeyboardEvent) { if (!gameActive) return; if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)) event.preventDefault(); const key = event.key.toLowerCase(); if (pressedKeys.has(key)) return; pressedKeys.add(key); if (event.key === "ArrowUp" || event.key === " " || key === "w") jump(); }
function handleKeyUp(event: KeyboardEvent) { pressedKeys.delete(event.key.toLowerCase()); }
function updateHeldMovement() { if (pressedKeys.has("arrowleft") || pressedKeys.has("a")) moveLeft(4); if (pressedKeys.has("arrowright") || pressedKeys.has("d")) moveRight(4); }
function moveLeft(distance = 38) { playerX = Math.max(20, playerX - distance); updatePlayerPosition(); }
function moveRight(distance = 38) { playerX = Math.min(levels[currentLevel].length * TILE_WIDTH, playerX + distance); gameStarted = true; updatePlayerPosition(); }
function jump() { if (jumpCount < 2) { verticalSpeed = jumpPower; jumpCount++; gameStarted = true; updatePlayerPosition(); } }

function startGameLoop() {
    if (!gameActive) return;
    animationFrame = requestAnimationFrame(startGameLoop); updateHeldMovement(); previousPlayerY = playerY;
    const inGravity = levelHazards.some((hazard) => hazard.kind === "gravity" && intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, hazard));
    verticalSpeed += inGravity ? gravity * 1.55 : gravity; playerY += verticalSpeed;
    if (playerY >= 300) { playerY = 300; verticalSpeed = 0; jumpCount = 0; }
    projectileTimer++; if (projectileTimer >= (reducedEffects ? 120 : 90)) { projectileTimer = 0; levelEnemies.forEach(fireProjectile); }
    updateProjectiles(); updatePlayerPosition(); checkCollisions();
}

function updatePlayerPosition() { playerLabel.style.transform = `translate(${playerX}px, ${playerY}px)`; world.style.transform = `translateX(${-Math.max(0, playerX - 180)}px)`; levelLabel.textContent = `SECTOR 0${currentLevel + 1}`; }
function fireProjectile(enemy: Enemy) {
    if (enemy.defeated) return;
    const startX = enemy.x + 18, startY = enemy.y + 25, directionX = playerX + 24 - startX, directionY = playerY + 28 - startY, distance = Math.max(1, Math.hypot(directionX, directionY)), element = document.createElement("div");
    element.className = "projectile"; world.append(element); projectiles.push({ x: startX, y: startY, vx: directionX / distance * 5, vy: directionY / distance * 5, element });
}
function updateProjectiles() { projectiles = projectiles.filter((projectile) => { projectile.x += projectile.vx; projectile.y += projectile.vy; projectile.element.style.transform = `translate(${projectile.x}px, ${projectile.y}px)`; const box = { x: projectile.x, y: projectile.y, width: 16, height: 16 }; const obstacle = levelObstacles.find((item) => intersects(box, item)); if (obstacle) { createSplash(projectile.x, projectile.y); projectile.element.remove(); return false; } if (intersects(box, { x: playerX, y: playerY, width: playerWidth, height: playerHeight })) { projectile.element.remove(); showGameOver("A sentry round cracked your hull."); return false; } if (projectile.x < playerX - 700 || projectile.x > playerX + 700 || projectile.y < -100 || projectile.y > 500) { projectile.element.remove(); return false; } return true; }); }
function createSplash(x: number, y: number) { const splash = document.createElement("div"); splash.className = "splash"; splash.style.left = `${x}px`; splash.style.top = `${y}px`; world.append(splash); window.setTimeout(() => splash.remove(), reducedEffects ? 180 : 350); }
function intersects(first: Box, second: Box) { return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y; }

function checkCollisions() {
    levelObstacles.forEach((obstacle) => { const horizontal = playerX + playerWidth > obstacle.x && playerX < obstacle.x + obstacle.width, vertical = playerY + playerHeight > obstacle.y && playerY < obstacle.y + obstacle.height, wasAbove = previousPlayerY + playerHeight <= obstacle.y, wasBelow = previousPlayerY >= obstacle.y + obstacle.height; if (horizontal && vertical && verticalSpeed >= 0 && wasAbove) { playerY = obstacle.y - playerHeight; verticalSpeed = 0; jumpCount = 0; } else if (horizontal && vertical && verticalSpeed < 0 && wasBelow) { playerY = obstacle.y + obstacle.height; verticalSpeed = 0; } else if (horizontal && vertical) { playerX = playerX < obstacle.x ? obstacle.x - playerWidth - 4 : obstacle.x + obstacle.width + 4; updatePlayerPosition(); } });
    levelHazards.forEach((hazard) => { if (hazard.kind === "spikes" && intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, hazard)) showGameOver("The spike belt caught your ship."); });
    levelEnemies.forEach((enemy, index) => {
        if (enemy.defeated) return;
        const enemyBox = { x: enemy.x, y: enemy.y, width: 48, height: 48 };
        const touchingEnemy = intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, enemyBox);
        const landedOnHead = touchingEnemy && verticalSpeed >= 0 && previousPlayerY + playerHeight <= enemy.y + 15;
        if (landedOnHead) {
            enemy.defeated = true;
            playerY = enemy.y - playerHeight;
            verticalSpeed = jumpPower * 0.58;
            jumpCount = 1;
            statusLabel.textContent = "Sentry disabled. Nice landing.";
            document.querySelectorAll(".enemy")[index]?.classList.add("defeated");
        } else if (touchingEnemy) {
            showGameOver("You hit a sentry head-on.");
        }
    });
    levelAsteroids.forEach((asteroid, index) => { if (!asteroid.claimed && Math.abs(playerX + 24 - asteroid.x) < 42 && Math.abs(playerY + 28 - asteroid.y) < 58) { asteroid.claimed = true; asteroidsClaimed++; localStorage.setItem("orbit-claims", String(asteroidsClaimed)); claimLabel.textContent = `${levelAsteroids.filter((item) => item.claimed).length} / ${levelAsteroids.length}`; statusLabel.textContent = "Asteroid claimed. Your fleet grows."; document.querySelectorAll(".asteroid")[index]?.classList.add("claimed"); } });
    if (playerX > levels[currentLevel].length * TILE_WIDTH - 100 && gameStarted) showWinScreen();
}

function getUnlockedSkinCount() { return skins.filter((skin) => asteroidsClaimed >= skin.required).length; }