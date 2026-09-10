const playerLabel = document.createElement("div");
const world = document.createElement("main");
const claimLabel = document.createElement("span");
const levelLabel = document.createElement("span");
const statusLabel = document.createElement("p");
const bossLabel = document.createElement("span");
const timerLabel = document.createElement("span");

type Box = { x: number; y: number; width: number; height: number };
type Asteroid = { x: number; y: number; claimed: boolean; special: boolean };
type Hazard = { x: number; y: number; width: number; height: number; kind: "spikes" | "gravity" };
type Enemy = { x: number; y: number; defeated: boolean };
type Projectile = { x: number; y: number; vx: number; vy: number; element: HTMLElement; owner: "player" | "enemy" };
type PowerupKind = "shield" | "boost" | "rapid" | "cannon";
type Powerup = { x: number; y: number; kind: PowerupKind; collected: boolean };
type LevelKey = { x: number; y: number; collected: boolean };
type Boss = { x: number; y: number; health: number; maxHealth: number; defeated: boolean };
type MiniBoss = { x: number; y: number; health: number; maxHealth: number; defeated: boolean };
type TrailStyle = { name: string; color: string; required: number; effect: "ember" | "comet" | "spark" | "ribbon" | "arc"; secret?: boolean; boss?: boolean; golden?: boolean };
type AvatarStyle = { name: string; color: string; shape: "classic" | "dart" | "ring" | "blade"; required: number; image?: string; defaultSkin: number; prestige?: number; golden?: boolean; jackpot?: boolean };
type Level = { name: string; briefing: string; length: number; asteroids: number[]; walls: number[]; enemies: number[]; spikes: number[]; gravity: number[]; portals?: number[]; flip?: number[]; powerups?: { index: number; kind: PowerupKind }[]; key?: number; secretId?: string; miniBosses?: number[]; boss?: boolean; secret?: boolean; prestige?: boolean };

const TILE_WIDTH = 180;
const levels: Level[] = [
    { name: "Quiet Orbit", briefing: "Learn the drift. Claim every asteroid and reach the beacon.", length: 12, asteroids: [2, 5, 8], walls: [4], enemies: [], spikes: [], gravity: [] },
    { name: "Redline Pass", briefing: "The rocks are tighter here. Watch the sentry fire.", length: 15, asteroids: [2, 5, 8, 12], walls: [4, 7], enemies: [9], spikes: [6], gravity: [] },
    { name: "Gravity Well", briefing: "Gravity wells pull you down. Use a double jump to escape.", length: 17, asteroids: [2, 5, 9, 13, 15], walls: [4, 8, 12], enemies: [7, 14], spikes: [6, 11], gravity: [10] },
    { name: "Shatter Belt", briefing: "Spikes, sentries, and a long drift. Keep your hull steady.", length: 20, asteroids: [2, 5, 8, 11, 15, 18], walls: [4, 7, 10, 14, 17], enemies: [6, 13, 16], spikes: [5, 12, 16], gravity: [9, 18] },
    { name: "Last Light", briefing: "The final claim. Bring seven asteroids home through the storm.", length: 23, asteroids: [2, 5, 8, 11, 14, 17, 20], walls: [4, 7, 10, 13, 16, 19], enemies: [6, 12, 15, 21], spikes: [5, 9, 14, 18], gravity: [8, 11, 17, 20] },
    { name: "Ion Cathedral", briefing: "The cathedral hums with static. Break through its sentry choir.", length: 24, asteroids: [2, 5, 8, 12, 15, 19, 22], walls: [4, 7, 11, 14, 18, 21], enemies: [6, 13, 20], spikes: [5, 10, 16, 22], gravity: [9, 17], powerups: [{ index: 3, kind: "shield" }, { index: 16, kind: "cannon" }], miniBosses: [11] },
    { name: "Neon Graveyard", briefing: "Old ships drift here. Their guardians do not want you leaving.", length: 27, asteroids: [2, 5, 9, 12, 16, 20, 24], walls: [4, 8, 11, 15, 19, 23], enemies: [6, 14, 21], spikes: [5, 10, 17, 22], gravity: [7, 18], powerups: [{ index: 7, kind: "boost" }, { index: 18, kind: "shield" }, { index: 23, kind: "cannon" }], miniBosses: [9, 20] },
    { name: "Crystal Run", briefing: "The crystal storm bends every shot. Keep moving and trust your thrusters.", length: 30, asteroids: [3, 6, 10, 13, 17, 21, 25, 28], walls: [5, 9, 12, 16, 20, 24, 27], enemies: [7, 15, 23], spikes: [6, 11, 18, 26], gravity: [8, 14, 22], powerups: [{ index: 5, kind: "rapid" }, { index: 14, kind: "boost" }, { index: 25, kind: "shield" }], key: 18, secretId: "eclipse", miniBosses: [10, 22] },
    { name: "Titan's Wake", briefing: "The titan is waiting. Every asteroid you claim tears through its armor.", length: 33, asteroids: [3, 6, 9, 12, 15, 18, 21, 24, 28, 30], walls: [5, 8, 11, 14, 17, 20, 23, 26, 29], enemies: [7, 16, 25], spikes: [6, 13, 19, 27], gravity: [10, 18, 24], powerups: [{ index: 4, kind: "shield" }, { index: 15, kind: "rapid" }, { index: 25, kind: "boost" }], miniBosses: [12, 24], boss: true },
    { name: "Solar Foundry", briefing: "The foundry burns hot. Ride the safe gaps between its moving sentries.", length: 28, asteroids: [2, 6, 10, 14, 18, 22, 26], walls: [4, 8, 12, 16, 20, 24], enemies: [7, 15, 23], spikes: [5, 11, 17, 25], gravity: [9, 19], powerups: [{ index: 3, kind: "shield" }, { index: 13, kind: "boost" }, { index: 21, kind: "cannon" }], miniBosses: [14], boss: true },
    { name: "Moonlit Ruins", briefing: "The ruins hide a second beacon. Search every dark corner for the signal.", length: 31, asteroids: [3, 7, 11, 15, 19, 23, 27], walls: [5, 9, 13, 17, 21, 25], enemies: [6, 14, 22, 28], spikes: [8, 12, 20, 26], gravity: [10, 18, 24], powerups: [{ index: 6, kind: "cannon" }, { index: 16, kind: "shield" }, { index: 26, kind: "boost" }], key: 24, secretId: "nebula", miniBosses: [11, 24] },
    { name: "Event Horizon", briefing: "One last crossing before the vault. Nothing escapes the horizon unchanged.", length: 36, asteroids: [3, 7, 11, 15, 19, 23, 27, 31, 34], walls: [5, 9, 13, 17, 21, 25, 29, 33], enemies: [6, 14, 22, 30], spikes: [8, 12, 20, 28, 34], gravity: [10, 18, 26, 32], powerups: [{ index: 4, kind: "boost" }, { index: 16, kind: "shield" }, { index: 28, kind: "rapid" }], miniBosses: [12, 26] },
    { name: "Eclipse Vault", briefing: "A hidden route beyond the fourth asteroid. Find the vault and claim its impossible light.", length: 19, asteroids: [2, 4, 7, 10, 13, 16], walls: [3, 6, 9, 12, 15], enemies: [5, 11, 17], spikes: [4, 8, 14], gravity: [7, 16], powerups: [{ index: 6, kind: "shield" }, { index: 14, kind: "boost" }], secret: true, secretId: "eclipse" },
    { name: "Comet Nursery", briefing: "Young comets cut across the route. Claim their bright cores and keep your aim ready.", length: 26, asteroids: [2, 6, 10, 14, 18, 22], walls: [4, 8, 12, 16, 20], enemies: [7, 13, 19, 24], spikes: [5, 11, 17, 23], gravity: [9, 21], powerups: [{ index: 3, kind: "cannon" }, { index: 15, kind: "shield" }], miniBosses: [18] },
    { name: "Prism Citadel", briefing: "The citadel's walls fold light around its guardians. Break the second titan before the beacon.", length: 32, asteroids: [3, 7, 11, 15, 19, 23, 27, 30], walls: [5, 9, 13, 17, 21, 25, 29], enemies: [6, 14, 22, 28], spikes: [8, 12, 20, 26], gravity: [10, 18, 24], powerups: [{ index: 4, kind: "shield" }, { index: 16, kind: "cannon" }, { index: 26, kind: "boost" }], miniBosses: [12, 24], boss: true },
    { name: "Afterglow Station", briefing: "A final station waits beyond the old lanes. Every system is live and every claim counts.", length: 35, asteroids: [3, 7, 11, 15, 19, 23, 27, 31, 33], walls: [5, 9, 13, 17, 21, 25, 29], enemies: [6, 14, 22, 30], spikes: [8, 12, 20, 28, 33], gravity: [10, 18, 26, 32], powerups: [{ index: 4, kind: "cannon" }, { index: 16, kind: "shield" }, { index: 28, kind: "boost" }], miniBosses: [12, 26], boss: true, key: 27, secretId: "archive" },
    { name: "Nebula Hollow", briefing: "A moonlit key opens this silent passage. Drift through the dark and find the hidden beacon.", length: 25, asteroids: [3, 7, 11, 15, 19, 22], walls: [5, 9, 13, 17, 21], enemies: [6, 14, 20], spikes: [8, 12, 18], gravity: [10, 16, 22], powerups: [{ index: 4, kind: "shield" }, { index: 14, kind: "cannon" }], secret: true, secretId: "nebula" },
    { name: "Black Hole Archive", briefing: "The last key points into the archive. Survive the spiral and face the keeper.", length: 30, asteroids: [3, 7, 11, 15, 19, 23, 27], walls: [5, 9, 13, 17, 21, 25], enemies: [6, 14, 22, 28], spikes: [8, 12, 20, 26], gravity: [10, 18, 24], powerups: [{ index: 4, kind: "cannon" }, { index: 16, kind: "shield" }, { index: 25, kind: "boost" }], miniBosses: [12, 24], boss: true, secret: true, secretId: "archive" },
    { name: "Prestige Gate", briefing: "The gatekeeper tests every route. Defeat it before claiming your next prestige.", length: 28, asteroids: [3, 7, 11, 15, 19, 23], walls: [5, 9, 13, 17, 21], enemies: [6, 14, 22], spikes: [8, 12, 20], gravity: [10, 18], powerups: [{ index: 4, kind: "shield" }, { index: 16, kind: "cannon" }], miniBosses: [12], boss: true, secret: true, secretId: "prestige-gate" },
];

const skins: { name: string; color: string; shape: "classic" | "dart" | "ring" | "blade"; required: number; image?: string; boss?: boolean; secret?: boolean; prestige?: number; golden?: boolean }[] = [
    { name: "Solar", color: "#ed7657", shape: "classic", required: 0 },
    { name: "Mint Dart", color: "#62d6b2", shape: "dart", required: 3, image: "/src/assets/ships/dart.svg" },
    { name: "Gold UFO", color: "#f6c46e", shape: "ring", required: 7, image: "/src/assets/ships/ufo.svg" },
    { name: "Plasma Sword", color: "#b991ff", shape: "blade", required: 12, image: "/src/assets/ships/sword.svg" },
    { name: "Aurora", color: "#6ecbff", shape: "classic", required: 18 },
    { name: "Titan Core", color: "#ffdf72", shape: "ring", required: 24, boss: true },
    { name: "Eclipse", color: "#f58bff", shape: "blade", required: 0, secret: true },
    { name: "Ion Glass", color: "#8de7ff", shape: "dart", required: 30 },
    { name: "Rose Prism", color: "#ff8fbd", shape: "ring", required: 38 },
    { name: "Void Flame", color: "#8b7dff", shape: "blade", required: 46, boss: true },
    { name: "Comet Copper", color: "#f29d68", shape: "dart", required: 86 },
    { name: "Prism Ice", color: "#8de7ff", shape: "ring", required: 98 },
    { name: "Starforge", color: "#f4f3cf", shape: "classic", required: 54 },
    { name: "Solar Flare", color: "#ff9b55", shape: "blade", required: 62 },
    { name: "Moon Silver", color: "#d9f5ff", shape: "ring", required: 70 },
    { name: "Horizon Pink", color: "#ff72c8", shape: "dart", required: 78 },
    { name: "Vault Prism", color: "#d6a8ff", shape: "blade", required: 0, secret: true },
    { name: "Golden Body", color: "#ffe36e", shape: "classic", required: 0, golden: true },
];

const trails: TrailStyle[] = [
    { name: "Ember", color: "#ed7657", required: 0, effect: "ember" },
    { name: "Mint Comet", color: "#62d6b2", required: 5, effect: "comet" },
    { name: "Gold Dust", color: "#f6c46e", required: 10, effect: "spark" },
    { name: "Nebula", color: "#b991ff", required: 16, effect: "ribbon" },
    { name: "Titan Sparks", color: "#ffdf72", required: 24, effect: "spark", boss: true },
    { name: "Eclipse Ribbon", color: "#f58bff", required: 0, effect: "ribbon", secret: true },
    { name: "Ion Beam", color: "#8de7ff", required: 30, effect: "comet" },
    { name: "Prism Wake", color: "#ff8fbd", required: 38, effect: "ribbon" },
    { name: "Void Flame", color: "#8b7dff", required: 46, effect: "ember", boss: true },
    { name: "Comet Line", color: "#f29d68", required: 86, effect: "comet" },
    { name: "Prism Arc", color: "#8de7ff", required: 98, effect: "arc" },
    { name: "Jackpot Spark", color: "#ffe36e", required: 0, effect: "spark", secret: true },
    { name: "Golden Trail", color: "#fff0a1", required: 0, effect: "arc", golden: true },
];

const avatars: AvatarStyle[] = [
    { name: "Classic", color: "#ed7657", shape: "classic", required: 0, defaultSkin: 0 },
    { name: "Dart", color: "#62d6b2", shape: "dart", required: 0, image: "/src/assets/ships/dart.svg", defaultSkin: 1 },
    { name: "UFO", color: "#f6c46e", shape: "ring", required: 0, image: "/src/assets/ships/ufo.svg", defaultSkin: 2 },
    { name: "Sword", color: "#b991ff", shape: "blade", required: 0, image: "/src/assets/ships/sword.svg", defaultSkin: 3 },
    { name: "Jackpot Crown", color: "#ffe36e", shape: "classic", required: 0, defaultSkin: 17, jackpot: true, image: "/src/assets/ships/jackpot-crown.svg" },
    { name: "Prestige Comet", color: "#fff6a8", shape: "dart", required: 0, defaultSkin: 1, prestige: 1, image: "/src/assets/ships/prestige-comet.png" },
    { name: "Prestige Halo", color: "#b8fff1", shape: "ring", required: 0, defaultSkin: 2, prestige: 2, image: "/src/assets/ships/prestige-halo.png" },
    { name: "Prestige Nova", color: "#ffb6e6", shape: "blade", required: 0, defaultSkin: 3, prestige: 3, image: "/src/assets/ships/prestige-nova.png" },
    { name: "Golden Pilot", color: "#ffe36e", shape: "classic", required: 0, defaultSkin: 17, golden: true, image: "/src/assets/ships/golden-crown.svg" },
];

let playerX = 120;
let playerY = 300;
let verticalSpeed = 0;
let jumpCount = 0;
let asteroidsClaimed = Number(localStorage.getItem("orbit-claims") ?? "0");
let specialAsteroids = Number(localStorage.getItem("orbit-special-claims") ?? "0");
let prestigeLevel = Number(localStorage.getItem("orbit-prestige") ?? "0");
let prestigeMax = Number(localStorage.getItem("orbit-prestige-max") ?? "3");
let currentLevel = 0;
let levelAsteroids: Asteroid[] = [];
let levelObstacles: Box[] = [];
let levelHazards: Hazard[] = [];
let levelEnemies: Enemy[] = [];
let levelPowerups: Powerup[] = [];
let levelKey: LevelKey | null = null;
let levelMiniBosses: MiniBoss[] = [];
let boss: Boss | null = null;
let projectiles: Projectile[] = [];
let trailElement: HTMLElement | null = null;
let projectileTimer = 0;
let trailTimer = 0;
let shieldCharges = 0;
let boostTimer = 0;
let rapidTimer = 0;
let rapidUntil = 0;
let cannonTimer = 0;
let playerShotTimer = 0;
let shootingHeld = false;
let gameStarted = false;
let gameActive = false;
let animationFrame = 0;
let previousPlayerY = playerY;
let selectedSkin = Number(localStorage.getItem("orbit-skin") ?? "0");
let selectedTrail = Number(localStorage.getItem("orbit-trail") ?? "0");
let selectedAvatar = Number(localStorage.getItem("orbit-avatar") ?? "0");
if (!localStorage.getItem("orbit-skin") && avatars[selectedAvatar]) selectedSkin = avatars[selectedAvatar].defaultSkin;
let reducedEffects = localStorage.getItem("orbit-reduced-effects") === "true";
let levelStartedAt = 0;
let elapsedMilliseconds = 0;
let shipFlipped = false;
let activePlanet: "normal" | "prestige" = "normal";
const pressedKeys = new Set<string>();
const gravity = 0.7;
const jumpPower = -16;
const playerWidth = 48;
const playerHeight = 58;
const powerupPrices: Record<PowerupKind, number> = { shield: 8, boost: 10, rapid: 12, cannon: 15 };
const powerupLabels: Record<PowerupKind, string> = { shield: "Shield", boost: "Boost", rapid: "Rapid Fire", cannon: "Cannon" };

function loadCustomLevels() {
    try {
        const saved = JSON.parse(localStorage.getItem("orbit-custom-levels") ?? "[]") as Level[];
        levels.push(...saved.map((level) => ({ ...level, secret: Boolean(level.secret), boss: Boolean(level.boss), prestige: Boolean(level.prestige) })));
    } catch { }
    const normalCount = levels.filter((level) => !level.secret && !level.prestige).length;
    for (let index = normalCount; index < 20; index++) {
        levels.splice(Math.min(index, levels.length), 0, { name: `Frontier ${index + 1}`, briefing: "A longer route on the blue planet. Reach the beacon and claim the whole lane.", length: 28 + index, asteroids: [3, 7, 11, 15, 19, 23], walls: [5, 9, 13, 17, 21, 25], enemies: [8, 16, 24], spikes: [6, 14, 22], gravity: [10, 20], portals: [12, 26], flip: [20], boss: index === 19 });
    }
    for (let index = 0; index < 20; index++) {
        levels.push({ name: `Prestige ${index + 1}`, briefing: "A longer route around the ringed planet. Planetary flip fields reveal the upper lane.", length: 38 + index, asteroids: [3, 8, 13, 18, 23, 28, 33], walls: [5, 10, 15, 20, 25, 30], enemies: [7, 17, 27, 35], spikes: [6, 14, 24, 32], gravity: [11, 21, 31], portals: [16, 29], flip: [11, 31], boss: index === 19, prestige: true });
    }
}

export function startApp() {
    loadCustomLevels();
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
        menu.innerHTML = `<div class="brand-mark">ORBIT RUN <span>/ 02</span></div><h1>Asteroid <em>Claim</em></h1><p class="menu-copy">Pilot the claim ship through dangerous sectors. Every asteroid you secure upgrades your flight rig.</p><div class="home-stats"><span><strong>${asteroidsClaimed}</strong> normal</span><span><strong>${specialAsteroids}</strong> special</span><span><strong>${prestigeLevel}</strong> prestige</span><span><strong>${getCompletedLevelCount()} / ${levels.length}</strong> routes complete</span><span><strong>${getUnlockedSkinCount()}</strong> skins online</span><span><strong>${getUnlockedTrailCount()}</strong> trails online</span></div><p class="prestige-requirement">NEXT PRESTIGE / ${getPrestigeRequirement(prestigeLevel).normal} NORMAL + ${getPrestigeRequirement(prestigeLevel).special} SPECIAL</p>`;
    const menuActions = document.createElement("nav"); menuActions.className = "menu-actions";
    menuActions.append(createMenuButton("Launch mission", showLevelMenu), createMenuButton("Customization", showCustomization), createMenuButton("Power-up shop", showShop), createMenuButton("Flight settings", showSettings));
    const secondaryActions = document.createElement("div"); secondaryActions.className = "secondary-actions"; secondaryActions.append(createTextButton("Credits", showCredits));
    menu.append(menuActions, secondaryActions);
    menu.append(createPageCounter()); document.body.replaceChildren(menu);
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
        menu.innerHTML = `<p class="eyebrow">MISSION SELECT / ${activePlanet === "prestige" ? "RINGED PLANET" : "BLUE PLANET"}</p><h1>Choose your <em>sector</em></h1><p class="menu-copy">Claim the asteroids in order. New sectors unlock after the previous beacon is reached.</p>`;
        menu.append(createMenuButton(activePlanet === "normal" ? "Fly to prestige planet" : "Return to blue planet", () => { activePlanet = activePlanet === "normal" ? "prestige" : "normal"; document.body.classList.toggle("prestige-theme", activePlanet === "prestige"); showLevelMenu(); }));
    const levelList = document.createElement("div");
    levelList.className = "level-list";
    levels.forEach((level, index) => {
        if (level.secret || Boolean(level.prestige) !== (activePlanet === "prestige")) return;
        const visibleLevels = levels.filter((candidate) => !candidate.secret && Boolean(candidate.prestige) === (activePlanet === "prestige"));
        const routeIndex = visibleLevels.indexOf(level);
        const unlocked = level.secret ? isSecretLevelUnlocked(level) : routeIndex === 0 || Number(localStorage.getItem(`orbit-level-${index}`) ?? "0") === 1;
        const button = document.createElement("button");
        button.className = `level-button ${level.secret ? "secret-level" : ""} ${unlocked ? "" : "locked"}`;
        button.type = "button";
        button.disabled = !unlocked;
        const prestigeUnlocked = prestigeLevel >= 2 || routeIndex === 0;
        button.disabled = !unlocked || (activePlanet === "prestige" && !prestigeUnlocked);
        button.innerHTML = `<span><b>${String(routeIndex + 1).padStart(2, "0")}</b> ${level.name}</span><small>${button.disabled ? "LOCKED / reach prestige 2" : `${level.asteroids.length} asteroids / ${level.briefing}`}</small>`;
        if (!button.disabled) button.addEventListener("click", () => startGame(index));
        levelList.append(button);
    });
    const secretGate = document.createElement("button");
    secretGate.className = "secret-gate";
    secretGate.type = "button";
    secretGate.innerHTML = "<span aria-hidden=\"true\">◯</span><b>Secret space</b><small>Open discovered routes</small>";
    secretGate.addEventListener("click", showSecretLevels);
    const missionActions = document.createElement("nav"); missionActions.className = "secondary-actions";
    missionActions.append(createTextButton("Leaderboard", showLeaderboard), createTextButton("Customization", showCustomization), createTextButton("Shop", showShop), createTextButton("Settings", showSettings), createTextButton("Main menu", showMenu));
    menu.append(createLoadoutPanel(), levelList, secretGate, missionActions, createPageCounter());
    document.body.replaceChildren(menu);
}

function showSecretLevels() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    const menu = document.createElement("main");
    menu.className = "menu-screen level-menu secret-menu";
    menu.innerHTML = `<p class="eyebrow">WHITE HOLE / HIDDEN ROUTES</p><h1>Secret <em>space</em></h1><p class="menu-copy">Special asteroids appear here. Defeat the keeper bosses to unlock unusual ships.</p>`;
    const levelList = document.createElement("div");
    levelList.className = "level-list";
    levels.forEach((level, index) => {
        if (!level.secret) return;
        const unlocked = isSecretLevelUnlocked(level);
        const button = document.createElement("button");
        button.className = `level-button secret-level ${unlocked ? "" : "locked"}`;
        button.type = "button";
        button.disabled = !unlocked;
        button.innerHTML = `<span><b>??</b> ${level.name}</span><small>${unlocked ? `${level.asteroids.length} special asteroids / ${level.briefing}` : "LOCKED / find its matching key"}</small>`;
        if (unlocked) button.addEventListener("click", () => startGame(index));
        levelList.append(button);
    });
    menu.append(levelList, createTextButton("Mission select", showLevelMenu), createTextButton("Main menu", showMenu), createPageCounter());
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
    panel.append(effectsRow);
    const testerRow = document.createElement("div");
    testerRow.className = "tester-entry";
    testerRow.innerHTML = `<span><b>Tester tools</b><small>Adjust claims, power-ups, and level unlocks.</small></span>`;
    testerRow.append(createTextButton("Login", showTesterLogin));
    panel.append(testerRow);
    menu.append(panel, createTextButton("Back", showMenu), createPageCounter());
    document.body.replaceChildren(menu);
}

function showCustomization() {
    const menu = document.createElement("main");
    menu.className = "menu-screen customization-screen";
    menu.innerHTML = `<p class="eyebrow">HANGAR / LOADOUT</p><h1>Build your <em>ship</em></h1><p class="menu-copy">Equip a skin, trail, and avatar. Jackpot rewards only appear after a special asteroid spin.</p>`;
    const layout = document.createElement("div"); layout.className = "customization-layout";
    const panel = document.createElement("section"); panel.className = "settings-panel customization-panel";
    const selectedAvatarStyle = avatars[selectedAvatar] ?? avatars[0];
    const selectedSkinStyle = skins[selectedSkin] ?? skins[0];
    const previewArt = selectedAvatarStyle.image ?? selectedSkinStyle.image;
    const selectedTrailStyle = trails[selectedTrail] ?? trails[0];
    const preview = document.createElement("aside"); preview.className = "ship-preview"; preview.innerHTML = `<p class="setting-title">Current character</p><div class="preview-stage">${previewArt ? createShipArtMarkup(previewArt, selectedAvatarStyle.name, selectedSkinStyle.color) : `<div class="preview-ship ship-${selectedSkinStyle.shape}" style="--ship-color:${selectedSkinStyle.color}"><span></span><i></i></div>`}</div><b>${selectedAvatarStyle.name}</b><small>${selectedSkinStyle.name} skin / ${selectedTrailStyle.name} trail</small><div class="trail-preview" style="--trail-color:${selectedTrailStyle.color}">${Array.from({ length: 5 }, (_, index) => `<i class="trail-preview-particle trail-effect-${selectedTrailStyle.effect}" style="--trail-delay:${index * 90}ms"></i>`).join("")}</div>`;
    const addChoices = (title: string, choices: string[], selected: number, onSelect: (index: number) => void, className: string) => {
        const heading = document.createElement("p"); heading.className = "setting-title"; heading.textContent = title; panel.append(heading);
        const grid = document.createElement("div"); grid.className = className;
        choices.forEach((choice, index) => { const button = document.createElement("button"); button.className = `loadout-choice ${selected === index ? "selected" : ""}`; button.textContent = choice; button.disabled = title === "Skin color" ? !isSkinUnlocked(skins[index]) : title === "Trail" ? !isTrailUnlocked(trails[index]) : false; button.addEventListener("click", () => onSelect(index)); grid.append(button); }); panel.append(grid);
    };
    addChoices("Skin color", skins.map((skin) => skin.name), selectedSkin, (index) => { if (isSkinUnlocked(skins[index])) { selectedSkin = index; localStorage.setItem("orbit-skin", String(index)); showCustomization(); } }, "customization-grid");
    addChoices("Trail", trails.map((trail) => trail.name), selectedTrail, (index) => { if (isTrailUnlocked(trails[index])) { selectedTrail = index; localStorage.setItem("orbit-trail", String(index)); showCustomization(); } }, "customization-grid");
    const avatarTitle = document.createElement("p"); avatarTitle.className = "setting-title"; avatarTitle.textContent = "Avatar gallery"; panel.append(avatarTitle);
    const avatarGrid = document.createElement("div"); avatarGrid.className = "avatar-grid";
    avatars.forEach((avatar, index) => {
        const unlocked = isAvatarUnlocked(avatar);
        const button = document.createElement("button"); button.className = `avatar-option ${selectedAvatar === index ? "selected" : ""}`; button.disabled = !unlocked;
        button.innerHTML = `${avatar.image ? createShipArtMarkup(avatar.image, avatar.name, selectedSkinStyle.color) : `<i style="--avatar-color:${selectedSkinStyle.color}"></i>`}<span>${avatar.name}</span><small>${unlocked ? "READY" : avatar.prestige ? `PRESTIGE ${avatar.prestige}` : avatar.golden ? "20 routes" : avatar.jackpot ? "JACKPOT" : "LOCKED"}</small>`;
        button.addEventListener("click", () => {
            selectedAvatar = index;
            if (isSkinUnlocked(skins[avatar.defaultSkin])) {
                selectedSkin = avatar.defaultSkin;
                localStorage.setItem("orbit-skin", String(selectedSkin));
            }
            localStorage.setItem("orbit-avatar", String(index));
            showCustomization();
        }); avatarGrid.append(button);
    });
    panel.append(avatarGrid);
    layout.append(panel, preview);
    menu.append(layout, createTextButton("Back", showMenu), createPageCounter()); document.body.replaceChildren(menu);
}

function showCredits() {
    const menu = document.createElement("main"); menu.className = "menu-screen credits-screen";
    menu.innerHTML = `<p class="eyebrow">ORBIT RUN / CREDITS</p><h1>Made by <em>the crew</em></h1><p class="menu-copy">A small flight team built every route, ship, and secret.</p><section class="credits-list"><b>Matthew</b><b>Mr. Cline</b><b>River</b></section>`;
    menu.append(createTextButton("Back", showMenu)); document.body.replaceChildren(menu);
}

function showLeaderboard() {
    const menu = document.createElement("main"); menu.className = "menu-screen leaderboard-screen";
    const records = levels.flatMap((level, index) => { const value = Number(localStorage.getItem(`orbit-best-${index}`) ?? "0"); return value ? [{ name: level.name, value }] : []; }).sort((a, b) => a.value - b.value).slice(0, 12);
    menu.innerHTML = `<p class="eyebrow">FLIGHT DATA / FASTEST RUNS</p><h1>Time <em>leaderboard</em></h1><p class="menu-copy">Your best clear for each route is saved locally on this device.</p>`;
    const list = document.createElement("section"); list.className = "leaderboard-list";
    list.innerHTML = records.length ? records.map((record, index) => `<div><b>${String(index + 1).padStart(2, "0")}</b><span>${record.name}</span><strong>${formatTime(record.value)}</strong></div>`).join("") : "<p class=\"menu-copy\">No completed runs yet.</p>";
    menu.append(list, createTextButton("Mission select", showLevelMenu), createTextButton("Back", showMenu)); document.body.replaceChildren(menu);
}

function showLevelMaker() {
    const menu = document.createElement("main"); menu.className = "menu-screen maker-screen";
    menu.innerHTML = `<p class="eyebrow">WORKSHOP / GRID PLAYGROUND</p><h1>Make a <em>route</em></h1><p class="menu-copy">Choose an obstacle, then place it on the scrolling timeline. Platforms support your ship; hazards shape the route.</p>`;
    const palette = document.createElement("nav"); palette.className = "maker-palette";
    const tiles = ["empty", "wall", "spike", "gravity", "portal", "asteroid", "enemy"];
    let selectedTile = "wall";
    tiles.forEach((tile) => { const button = createTextButton(tile === "empty" ? "Erase" : tile === "wall" ? "Platform" : tile, () => { selectedTile = tile; palette.querySelectorAll("button").forEach((item) => item.classList.toggle("selected", item.dataset.tile === tile)); }); button.dataset.tile = tile; button.classList.toggle("selected", tile === selectedTile); palette.append(button); });
    const grid = document.createElement("div"); grid.className = "maker-grid";
    const cells = Array.from({ length: 144 }, (_, index) => { const cell = document.createElement("button"); cell.type = "button"; cell.className = "maker-cell empty"; cell.dataset.kind = "empty"; cell.textContent = ""; cell.setAttribute("aria-label", `Tile ${index + 1}`); cell.addEventListener("click", () => { const next = selectedTile; cell.dataset.kind = next; cell.className = `maker-cell ${next}`; cell.textContent = next === "empty" ? "" : next === "asteroid" ? "✦" : next === "enemy" ? "◆" : next === "portal" ? "↔" : next === "gravity" ? "◉" : next === "spike" ? "▲" : "■"; }); grid.append(cell); return cell; });
    const save = createMenuButton("Save custom route", () => {
        const level: Level = { name: `Workshop ${Date.now().toString().slice(-4)}`, briefing: "A route assembled in the grid workshop.", length: 24, asteroids: [], walls: [], enemies: [], spikes: [], gravity: [], portals: [], flip: [] };
        cells.forEach((cell, index) => { const tile = cell.dataset.kind; const column = index % 24; if (tile === "asteroid") level.asteroids.push(column + 1); if (tile === "wall") level.walls.push(column + 1); if (tile === "enemy") level.enemies.push(column + 1); if (tile === "spike") level.spikes.push(column + 1); if (tile === "gravity") level.gravity.push(column + 1); if (tile === "portal") level.portals?.push(column + 1); });
        const saved = JSON.parse(localStorage.getItem("orbit-custom-levels") ?? "[]") as Level[]; saved.push(level); localStorage.setItem("orbit-custom-levels", JSON.stringify(saved)); levels.push(level); showLevelMenu();
    });
    menu.append(palette, grid, save, createTextButton("Back to tester", showTesterPanel)); document.body.replaceChildren(menu);
}

function createTextButton(text: string, action: () => void) {
    const button = document.createElement("button");
    button.className = "text-button";
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", action);
    return button;
}

function createShipArtMarkup(image: string, label: string, color: string) { return `<span class="ship-art-image" role="img" aria-label="${label}" style="--ship-image:url('${image}');--ship-color:${color}"></span>`; }

function getInventory(): Record<PowerupKind, number> {
    try { return { shield: 0, boost: 0, rapid: 0, cannon: 0, ...JSON.parse(localStorage.getItem("orbit-powerups") ?? "{}") }; }
    catch { return { shield: 0, boost: 0, rapid: 0, cannon: 0 }; }
}

function saveInventory(inventory: Record<PowerupKind, number>) { localStorage.setItem("orbit-powerups", JSON.stringify(inventory)); }

function showShop() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    const menu = document.createElement("main");
    menu.className = "menu-screen shop-screen";
    menu.innerHTML = `<p class="eyebrow">FLIGHT SUPPLY / SHOP</p><h1>Stock your <em>ship</em></h1><p class="menu-copy">Buy single-use power-ups with claimed asteroids. Use them from the power-up bar at the top of a mission.</p>`;
    const inventory = getInventory();
    const currency = document.createElement("p");
    currency.className = "shop-currency";
    currency.textContent = `NORMAL ${asteroidsClaimed}  /  SPECIAL ${specialAsteroids}`;
    const grid = document.createElement("div");
    grid.className = "shop-grid";
    (Object.keys(powerupPrices) as PowerupKind[]).forEach((kind) => {
        const card = document.createElement("article");
        card.className = `shop-card ${kind}`;
        card.innerHTML = `<b>${powerupLabels[kind]}</b><span class="shop-symbol">${kind === "shield" ? "◇" : kind === "boost" ? "»" : kind === "rapid" ? "ϟ" : "✦"}</span><small>IN HOLD: ${inventory[kind]}</small>`;
        const buy = document.createElement("button");
        buy.className = "text-button shop-buy";
        buy.disabled = asteroidsClaimed < powerupPrices[kind];
        buy.textContent = `Buy / ${powerupPrices[kind]} asteroids`;
        buy.addEventListener("click", () => { if (asteroidsClaimed < powerupPrices[kind]) return; asteroidsClaimed -= powerupPrices[kind]; localStorage.setItem("orbit-claims", String(asteroidsClaimed)); inventory[kind]++; saveInventory(inventory); showShop(); });
        card.append(buy);
        grid.append(card);
    });
    const wheel = document.createElement("article");
    wheel.className = "asteroid-wheel";
    wheel.innerHTML = `<div class="wheel-ring"><span>✦</span></div><b>ASTEROID ROLL</b><small>1 special asteroid / up to 100 normal asteroids</small>`;
    const roll = document.createElement("button");
    roll.className = "text-button shop-buy";
    roll.type = "button";
    roll.textContent = "Spin left to right / 1 special";
    roll.disabled = specialAsteroids < 1;
    roll.addEventListener("click", () => {
        if (specialAsteroids < 1) return;
        specialAsteroids--;
        wheel.classList.add("spinning");
        roll.disabled = true;
        const reward = Math.floor(Math.random() * 100) + 1;
        asteroidsClaimed += reward;
        selectedTrail = trails.findIndex((trail) => trail.name === "Jackpot Spark");
        localStorage.setItem("orbit-trail", String(selectedTrail));
        localStorage.setItem("orbit-jackpot-avatar", "1");
        localStorage.setItem("orbit-special-claims", String(specialAsteroids));
        localStorage.setItem("orbit-claims", String(asteroidsClaimed));
        window.setTimeout(showShop, 900);
    });
    wheel.append(roll);
    menu.append(currency, grid, wheel, createTextButton("Mission select", showLevelMenu), createTextButton("Main menu", showMenu), createPageCounter());
    document.body.replaceChildren(menu);
}

function createLoadoutPanel() {
    const panel = document.createElement("section");
    panel.className = "loadout-panel";
    panel.innerHTML = `<p class="setting-title">Mission power-ups</p><small>Click a power-up in the mission HUD to spend one from your hold.</small>`;
    const row = document.createElement("div");
    row.className = "loadout-row";
    const inventory = getInventory();
    (Object.keys(powerupPrices) as PowerupKind[]).forEach((kind) => {
        const item = document.createElement("span");
        item.className = `loadout-item ${kind}`;
        item.innerHTML = `${powerupLabels[kind]} <b>${inventory[kind]}</b>`;
        row.append(item);
    });
    panel.append(row);
    return panel;
}

function getClaimedAsteroids(levelIndex: number): Set<number> {
    try { return new Set<number>(JSON.parse(localStorage.getItem(`orbit-asteroids-${levelIndex}`) ?? "[]")); }
    catch { return new Set<number>(); }
}

function saveClaimedAsteroids(levelIndex: number, claimed: Set<number>) { localStorage.setItem(`orbit-asteroids-${levelIndex}`, JSON.stringify([...claimed])); }

function isSecretLevelUnlocked(level: Level) {
    if (level.secretId === "prestige-gate") return localStorage.getItem("orbit-key-prestige-gate") === "1" || getCompletedLevelCount() >= levels.length - 1;
    return level.secretId === "eclipse" ? localStorage.getItem("orbit-key-eclipse") === "1" || localStorage.getItem("orbit-secret-unlocked") === "1" : level.secretId ? localStorage.getItem(`orbit-key-${level.secretId}`) === "1" : localStorage.getItem("orbit-secret-unlocked") === "1";
}

function createPageCounter() {
    const counter = document.createElement("div");
    counter.className = "page-counter";
    counter.innerHTML = `<span>ASTEROIDS IN FLEET</span><strong>${asteroidsClaimed}</strong>`;
    return counter;
}

function showTesterLogin() {
    const menu = document.createElement("main");
    menu.className = "menu-screen tester-screen";
    menu.innerHTML = `<p class="eyebrow">FLIGHT SYSTEMS / TESTER LOGIN</p><h1>Enter <em>keyword</em></h1><p class="menu-copy">Tester tools are local to this device. Enter the keyword to open the adjustment panel.</p>`;
    const form = document.createElement("form");
    form.className = "tester-login";
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.placeholder = "Keyword";
    input.setAttribute("aria-label", "Tester keyword");
    const message = document.createElement("small");
    const submit = document.createElement("button");
    submit.className = "menu-button";
    submit.type = "submit";
    submit.textContent = "Enter tester tools";
    form.append(input, submit, message);
    form.addEventListener("submit", (event) => { event.preventDefault(); if (input.value === "T3ster!") showTesterPanel(); else { message.textContent = "Keyword not recognized."; message.className = "tester-error"; } });
    menu.append(form, createTextButton("Back to settings", showSettings));
    document.body.replaceChildren(menu);
    input.focus();
}

function showTesterPanel() {
    const menu = document.createElement("main");
    menu.className = "menu-screen tester-screen";
    menu.innerHTML = `<p class="eyebrow">TESTER TOOLS / LOCAL SAVE</p><h1>Adjust the <em>run</em></h1><p class="menu-copy">Apply changes to make them appear across the game immediately.</p>`;
    const form = document.createElement("form");
    form.className = "tester-panel";
    const claimsLabel = document.createElement("label");
    claimsLabel.innerHTML = `<span>Asteroids</span>`;
    const claimsInput = document.createElement("input");
    claimsInput.type = "number"; claimsInput.min = "0"; claimsInput.value = String(asteroidsClaimed);
    claimsLabel.append(claimsInput);
    form.append(claimsLabel);
    const specialLabel = document.createElement("label");
    specialLabel.innerHTML = `<span>Special asteroids</span>`;
    const specialInput = document.createElement("input");
    specialInput.type = "number"; specialInput.min = "0"; specialInput.value = String(specialAsteroids);
    specialLabel.append(specialInput);
    form.append(specialLabel);
    const prestigeLabel = document.createElement("label");
    prestigeLabel.innerHTML = `<span>Prestige level</span>`;
    const prestigeInput = document.createElement("input");
    prestigeInput.type = "number"; prestigeInput.min = "0"; prestigeInput.value = String(prestigeLevel);
    prestigeInput.dataset.prestige = "level";
    prestigeLabel.append(prestigeInput);
    form.append(prestigeLabel);
    const prestigeMaxLabel = document.createElement("label");
    prestigeMaxLabel.innerHTML = `<span>How many prestiges</span>`;
    const prestigeMaxInput = document.createElement("input");
    prestigeMaxInput.type = "number"; prestigeMaxInput.min = "1"; prestigeMaxInput.value = String(prestigeMax);
    prestigeMaxLabel.append(prestigeMaxInput);
    form.append(prestigeMaxLabel);
    const inventory = getInventory();
    (Object.keys(powerupPrices) as PowerupKind[]).forEach((kind) => {
        const label = document.createElement("label");
        label.innerHTML = `<span>${powerupLabels[kind]}</span>`;
        const input = document.createElement("input");
        input.type = "number"; input.min = "0"; input.value = String(inventory[kind]); input.dataset.powerup = kind;
        label.append(input); form.append(label);
    });
    const customizationTitle = document.createElement("p"); customizationTitle.className = "setting-title"; customizationTitle.textContent = "Customization unlocks"; form.append(customizationTitle);
    const unlocks = document.createElement("div"); unlocks.className = "tester-unlocks";
    (["skins", "trails", "avatars"] as const).forEach((kind) => {
        const label = document.createElement("label");
        const input = document.createElement("input"); input.type = "checkbox"; input.checked = localStorage.getItem(`orbit-unlock-${kind}`) === "1"; input.dataset.unlock = kind;
        label.append(input, document.createTextNode(`Unlock all ${kind}`)); unlocks.append(label);
    });
    form.append(unlocks);
    const levelTitle = document.createElement("p");
    levelTitle.className = "setting-title";
    levelTitle.textContent = "Unlock levels";
    form.append(levelTitle);
    const prestigeGateLabel = document.createElement("label");
    prestigeGateLabel.innerHTML = `<span>Access Prestige Gate</span>`;
    const prestigeGateInput = document.createElement("input");
    prestigeGateInput.type = "checkbox";
    prestigeGateInput.checked = localStorage.getItem("orbit-key-prestige-gate") === "1";
    prestigeGateInput.dataset.prestigeGate = "true";
    prestigeGateLabel.append(prestigeGateInput);
    form.append(prestigeGateLabel);
    const levelChoices = document.createElement("div");
    levelChoices.className = "tester-levels";
    levels.forEach((level, index) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox"; input.checked = level.secret ? isSecretLevelUnlocked(level) : index === 0 || Number(localStorage.getItem(`orbit-level-${index}`) ?? "0") === 1; input.dataset.level = String(index);
        label.append(input, document.createTextNode(level.name)); levelChoices.append(label);
    });
    form.append(levelChoices);
    const customTitle = document.createElement("p");
    customTitle.className = "setting-title";
    customTitle.textContent = "Post a new level";
    form.append(customTitle);
    const customFields = document.createElement("div");
    customFields.className = "custom-level-fields";
    customFields.innerHTML = `<input name="custom-name" placeholder="Level name (optional)"><input name="custom-briefing" placeholder="Briefing (optional)"><input name="custom-length" type="number" min="8" max="60" value="18" placeholder="Length"><input name="custom-asteroids" placeholder="Asteroid tiles: 2,5,8"><input name="custom-walls" placeholder="Wall tiles: 4,9"><input name="custom-enemies" placeholder="Enemy tiles: 6,12"><input name="custom-spikes" placeholder="Spike tiles: 5,10"><input name="custom-gravity" placeholder="Gravity tiles: 8,14"><label><input name="custom-secret" type="checkbox"> Secret route</label><label><input name="custom-boss" type="checkbox"> Add boss</label>`;
    form.append(customFields);
    form.append(createTextButton("Open level maker", showLevelMaker));
    const apply = document.createElement("button");
    apply.className = "menu-button"; apply.type = "submit"; apply.textContent = "Apply tester changes";
    form.append(apply);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        asteroidsClaimed = Math.max(0, Number(claimsInput.value) || 0);
        specialAsteroids = Math.max(0, Number(specialInput.value) || 0);
        prestigeLevel = Math.max(0, Number(prestigeInput.value) || 0);
        prestigeMax = Math.max(1, Number(prestigeMaxInput.value) || 1);
        localStorage.setItem("orbit-claims", String(asteroidsClaimed));
        localStorage.setItem("orbit-special-claims", String(specialAsteroids));
        localStorage.setItem("orbit-prestige", String(prestigeLevel));
        localStorage.setItem("orbit-prestige-max", String(prestigeMax));
        const editedInventory = getInventory();
        form.querySelectorAll<HTMLInputElement>("input[data-powerup]").forEach((input) => { editedInventory[input.dataset.powerup as PowerupKind] = Math.max(0, Number(input.value) || 0); });
        saveInventory(editedInventory);
        unlocks.querySelectorAll<HTMLInputElement>("input[data-unlock]").forEach((input) => { const key = `orbit-unlock-${input.dataset.unlock}`; if (input.checked) localStorage.setItem(key, "1"); else localStorage.removeItem(key); });
        form.querySelectorAll<HTMLInputElement>("input[data-level]").forEach((input) => { const level = levels[Number(input.dataset.level)]; if (level.secret && level.secretId) { if (input.checked) localStorage.setItem(`orbit-key-${level.secretId}`, "1"); else localStorage.removeItem(`orbit-key-${level.secretId}`); } else if (input.checked) localStorage.setItem(`orbit-level-${input.dataset.level}`, "1"); else localStorage.removeItem(`orbit-level-${input.dataset.level}`); });
        if (prestigeGateInput.checked) localStorage.setItem("orbit-key-prestige-gate", "1"); else localStorage.removeItem("orbit-key-prestige-gate");
        const value = (name: string) => (form.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? "").trim();
        const numbers = (name: string) => value(name).split(",").map(Number).filter((number) => Number.isInteger(number) && number > 0);
        const customName = value("custom-name");
        if (customName) {
            const isSecret = Boolean(form.querySelector<HTMLInputElement>("[name=custom-secret]")?.checked);
            const secretId = isSecret ? `custom-${Date.now()}` : undefined;
            const customLevel: Level = { name: customName, briefing: value("custom-briefing") || "Custom route.", length: Math.max(8, Number(value("custom-length")) || 18), asteroids: numbers("custom-asteroids"), walls: numbers("custom-walls"), enemies: numbers("custom-enemies"), spikes: numbers("custom-spikes"), gravity: numbers("custom-gravity"), secret: isSecret, secretId, boss: Boolean(form.querySelector<HTMLInputElement>("[name=custom-boss]")?.checked) };
            const saved = JSON.parse(localStorage.getItem("orbit-custom-levels") ?? "[]") as Level[];
            saved.push(customLevel);
            localStorage.setItem("orbit-custom-levels", JSON.stringify(saved));
            if (secretId) localStorage.setItem(`orbit-key-${secretId}`, "1");
            levels.push(customLevel);
        }
        showTesterPanel();
    });
    menu.append(form, createTextButton("Exit tester tools", showMenu));
    document.body.replaceChildren(menu);
}

function buildLevel(levelIndex: number) {
    const level = levels[levelIndex];
    const claimedAsteroids = getClaimedAsteroids(levelIndex);
    levelAsteroids = level.asteroids.map((index, asteroidIndex) => ({ x: 140 + index * TILE_WIDTH, y: 215 - (index % 2) * 55, claimed: claimedAsteroids.has(asteroidIndex), special: Boolean(level.secret) }));
    levelObstacles = level.walls.map((index, wallIndex) => ({ x: 140 + index * TILE_WIDTH, y: wallIndex % 2 ? 250 : 330, width: wallIndex % 2 ? 105 : 70, height: wallIndex % 2 ? 150 : 70 }));
    levelHazards = [...level.spikes.map((index) => ({ x: 140 + index * TILE_WIDTH, y: 380, width: 76, height: 20, kind: "spikes" as const })), ...level.gravity.map((index) => ({ x: 140 + index * TILE_WIDTH, y: 110, width: 115, height: 250, kind: "gravity" as const }))];
    levelEnemies = level.enemies.map((index) => ({ x: 140 + index * TILE_WIDTH, y: 285, defeated: false }));
    levelPowerups = (level.powerups ?? []).map((powerup) => ({ x: 140 + powerup.index * TILE_WIDTH, y: 170, kind: powerup.kind, collected: false }));
    levelKey = level.key === undefined ? null : { x: 140 + level.key * TILE_WIDTH, y: 170, collected: localStorage.getItem(`orbit-key-${level.secretId ?? "eclipse"}`) === "1" };
    levelMiniBosses = (level.miniBosses ?? []).map((index) => ({ x: 140 + index * TILE_WIDTH, y: 245, health: 2, maxHealth: 2, defeated: false }));
    boss = level.boss || level.secret ? { x: 140 + (level.length - 2) * TILE_WIDTH, y: 205, health: level.asteroids.length, maxHealth: level.asteroids.length, defeated: false } : null;
}

function startGame(levelIndex = currentLevel) {
    currentLevel = levelIndex;
    buildLevel(currentLevel);
    playerX = 120; playerY = 300; verticalSpeed = 0; jumpCount = 0; projectiles = []; trailElement = null; projectileTimer = 0; trailTimer = 0; playerShotTimer = 0; shieldCharges = 0; boostTimer = 0; rapidTimer = 0; rapidUntil = 0; cannonTimer = 0; gameStarted = false; gameActive = true; previousPlayerY = playerY; levelStartedAt = performance.now(); elapsedMilliseconds = 0; shipFlipped = false;
    document.body.innerHTML = "";
    createGameShell(); createPlayer(); createWorldObjects(); createControls(); startGameLoop();
}

function showWinScreen() {
    gameActive = false; cancelAnimationFrame(animationFrame);
    localStorage.setItem(`orbit-level-claims-${currentLevel}`, String(levelAsteroids.length));
    localStorage.setItem(`orbit-level-complete-${currentLevel}`, "1");
    const previousBest = Number(localStorage.getItem(`orbit-best-${currentLevel}`) ?? "0");
    if (!previousBest || elapsedMilliseconds < previousBest) localStorage.setItem(`orbit-best-${currentLevel}`, String(elapsedMilliseconds));
    localStorage.setItem(`orbit-level-${currentLevel + 1}`, "1");
    if (levels[currentLevel].boss) localStorage.setItem("orbit-boss-defeated", "1");
    if (levels[currentLevel].secretId === "prestige-gate") localStorage.setItem("orbit-level-complete-prestige-gate", "1");
    const screen = document.createElement("main");
        screen.className = "win-screen win-screen-animation";
    const promoted = tryPrestige();
    const reward = promoted ? `Prestige ${prestigeLevel} reached. A new ship avatar is ready in settings.` : levels[currentLevel].boss ? "Titan Core skin unlocked. The fleet has a new legend." : levels[currentLevel].secret ? "The Eclipse skin has joined your collection." : `Every asteroid secured. Total fleet claims: ${asteroidsClaimed}.`;
    screen.innerHTML = `<p class="eyebrow">BEACON REACHED / ${levels[currentLevel].secret ? "SECRET" : `SECTOR 0${currentLevel + 1}`}</p><h1>Claim <em>complete</em></h1><p class="time-result">${formatTime(elapsedMilliseconds)}</p><p class="menu-copy">${reward}</p>`;
    const nextLevel = levels.findIndex((level, index) => index > currentLevel && (level.secret ? isSecretLevelUnlocked(level) : index === 0 || Number(localStorage.getItem(`orbit-level-${index}`) ?? "0") === 1));
    screen.append(createMenuButton(nextLevel >= 0 ? "Next sector" : "Replay sector", () => nextLevel >= 0 ? startGame(nextLevel) : startGame(currentLevel)), createTextButton("Mission select", showLevelMenu), createPageCounter());
    document.body.replaceChildren(screen);
}

function showGameOver(reason = "Your hull took a hit.") {
    if (!gameActive) return;
    gameActive = false; cancelAnimationFrame(animationFrame); pressedKeys.clear();
    const screen = document.createElement("main");
    screen.className = "win-screen game-over-screen";
    screen.innerHTML = `<p class="eyebrow">SIGNAL LOST</p><h1>Hull <em>breach</em></h1><p class="menu-copy">${reason} The sector is still waiting.</p>`;
    screen.append(createMenuButton("Retry sector", () => startGame(currentLevel)), createTextButton("Mission select", showLevelMenu), createPageCounter());
    document.body.replaceChildren(screen);
}

function createGameShell() {
    const header = document.createElement("header");
    header.innerHTML = `<div><p class="eyebrow">ORBIT RUN / 02</p><h1>Asteroid <em>Claim</em></h1></div>`;
    const hud = document.createElement("div");
    hud.className = "hud";
    claimLabel.textContent = `${levelAsteroids.filter((item) => item.claimed).length} / ${levelAsteroids.length}`;
    levelLabel.textContent = `SECTOR 0${currentLevel + 1}`;
    hud.innerHTML = `<span class="hud-label">CLAIMS</span>`;
    hud.append(claimLabel, levelLabel);
    timerLabel.className = "run-timer"; timerLabel.textContent = "00:00.000"; hud.append(timerLabel);
    if (boss) { bossLabel.className = "boss-hud"; bossLabel.textContent = `TITAN ${boss.health}/${boss.maxHealth}`; hud.append(bossLabel); }
    const currency = document.createElement("span");
    currency.className = "asteroid-currency";
    currency.textContent = `NORMAL ${asteroidsClaimed} / SPECIAL ${specialAsteroids}`;
    hud.append(currency);
    hud.append(createPowerupHud());
    header.append(hud);
    world.id = "game-world"; world.innerHTML = ""; world.setAttribute("aria-label", "Asteroid Claim game area");
    statusLabel.className = "status"; statusLabel.textContent = levels[currentLevel].briefing;
    const game = document.createElement("section"); game.className = "game-frame"; game.append(world, statusLabel);
    document.body.append(header, game);
}

function createPlayer() {
    const skin = skins[selectedSkin] ?? skins[0];
    const avatar = avatars[selectedAvatar] ?? avatars[0];
    const shipArt = avatar.image ?? skin.image;
    playerLabel.className = `player ${shipArt ? "" : `ship-${skin.shape}`} avatar-${selectedAvatar}`; playerLabel.style.setProperty("--ship-color", skin.color); playerLabel.innerHTML = `${shipArt ? createShipArtMarkup(shipArt, avatar.name, skin.color) : "<span class=\"ship-window\"></span>"}<span class="ship-flame"></span>`; world.append(playerLabel); updatePlayerPosition();
}

function createWorldObjects() {
    levelObstacles.forEach((obstacle) => { const element = document.createElement("div"); element.className = "obstacle"; Object.assign(element.style, { left: `${obstacle.x}px`, top: `${obstacle.y}px`, width: `${obstacle.width}px`, height: `${obstacle.height}px` }); world.append(element); });
    levelAsteroids.forEach((asteroid) => { const element = document.createElement("div"); element.className = `asteroid ${asteroid.special ? "special" : ""} ${asteroid.claimed ? "claimed" : ""}`; element.textContent = asteroid.special ? "✹" : "✦"; element.style.left = `${asteroid.x}px`; element.style.top = `${asteroid.y}px`; world.append(element); });
    levelHazards.forEach((hazard) => { const element = document.createElement("div"); element.className = `hazard ${hazard.kind}`; element.style.left = `${hazard.x}px`; element.style.top = `${hazard.y}px`; element.style.width = `${hazard.width}px`; element.style.height = `${hazard.height}px`; element.setAttribute("aria-label", hazard.kind === "spikes" ? "Spike hazard" : "Gravity zone"); world.append(element); });
    levelEnemies.forEach((enemy) => { const element = document.createElement("div"); element.className = "enemy"; element.style.left = `${enemy.x}px`; element.style.top = `${enemy.y}px`; world.append(element); });
    levelMiniBosses.forEach((miniBoss) => { const element = document.createElement("div"); element.className = "mini-boss"; element.style.left = `${miniBoss.x}px`; element.style.top = `${miniBoss.y}px`; world.append(element); });
    levelPowerups.forEach((powerup) => { const element = document.createElement("div"); element.className = `powerup ${powerup.kind}`; element.textContent = powerup.kind === "shield" ? "◇" : powerup.kind === "rapid" ? "ϟ" : powerup.kind === "cannon" ? "✦" : "»"; element.style.left = `${powerup.x}px`; element.style.top = `${powerup.y}px`; element.setAttribute("aria-label", `${powerup.kind} powerup`); world.append(element); });
    if (levelKey) { const element = document.createElement("div"); element.className = `level-key ${levelKey.collected ? "collected" : ""}`; element.textContent = "⚿"; element.style.left = `${levelKey.x}px`; element.style.top = `${levelKey.y}px`; element.setAttribute("aria-label", "Secret level key"); world.append(element); }
    (levels[currentLevel].portals ?? []).forEach((index) => { const element = document.createElement("div"); element.className = "portal"; element.textContent = "↔"; element.style.left = `${140 + index * TILE_WIDTH}px`; element.style.top = "175px"; element.setAttribute("aria-label", "Level portal"); world.append(element); });
    if (boss) { const element = document.createElement("div"); element.className = "boss"; element.style.left = `${boss.x}px`; element.style.top = `${boss.y}px`; world.append(element); }
    const beacon = document.createElement("div"); beacon.className = "beacon"; beacon.style.left = `${(levels[currentLevel].length - 1) * TILE_WIDTH + 140}px`; world.append(beacon);
}

function createControls() {
    const controls = document.createElement("nav"); controls.className = "controls"; controls.setAttribute("aria-label", "Game controls");
    controls.append(createButton("left", "←", moveLeft), createButton("jump", "↑", jump), createButton("down", "↓", moveDown), createButton("right", "→", moveRight), createHoldButton("shoot", "✦", shoot), createButton("exit", "Exit", showLevelMenu));
    document.querySelector(".game-frame")?.append(controls);
}

function createPowerupHud() {
    const bar = document.createElement("div");
    bar.className = "powerup-hud";
    (Object.keys(powerupPrices) as PowerupKind[]).forEach((kind) => {
        const button = document.createElement("button");
        button.className = `hud-power ${kind}`;
        button.type = "button";
        button.addEventListener("click", () => useInventoryPowerup(kind));
        bar.append(button);
    });
    return bar;
}

function createButton(className: string, text: string, action: () => void) { const button = document.createElement("button"); button.className = `control-button ${className}`; button.type = "button"; button.textContent = text; button.setAttribute("aria-label", className === "exit" ? "Exit to mission select" : className === "jump" ? "Jump" : className === "shoot" ? "Fire cannon (E)" : `Move ${className}`); button.addEventListener("click", action); return button; }
function createHoldButton(className: string, text: string, action: () => void) { const button = createButton(className, text, action); button.addEventListener("pointerdown", () => { shootingHeld = true; }); ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => button.addEventListener(eventName, () => { shootingHeld = false; })); return button; }
function handleKeyDown(event: KeyboardEvent) { if (!gameActive) return; if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault(); const key = event.key.toLowerCase(); if (pressedKeys.has(key)) return; pressedKeys.add(key); if (event.key === "ArrowUp" || event.key === " " || key === "w") jump(); if (event.key === "ArrowDown" || key === "s") moveDown(); if (key === "e") { shootingHeld = true; shoot(); } }
function handleKeyUp(event: KeyboardEvent) { pressedKeys.delete(event.key.toLowerCase()); if (event.key.toLowerCase() === "e") shootingHeld = false; }
function updateHeldMovement() { if (pressedKeys.has("arrowleft") || pressedKeys.has("a")) moveLeft(4); if (pressedKeys.has("arrowright") || pressedKeys.has("d")) moveRight(4); }
function moveLeft(distance = 38) { playerX = Math.max(20, playerX - distance); updatePlayerPosition(); }
function moveRight(distance = 38) { playerX = Math.min(levels[currentLevel].length * TILE_WIDTH, playerX + distance * (boostTimer > 0 ? 1.7 : 1)); gameStarted = true; updatePlayerPosition(); }
function moveDown(distance = 36) { playerY = Math.min(360, playerY + distance); verticalSpeed = 0; gameStarted = true; updatePlayerPosition(); }
function jump() { if (jumpCount < 2) { verticalSpeed = jumpPower; jumpCount++; gameStarted = true; updatePlayerPosition(); } }

function startGameLoop() {
    if (!gameActive) return;
    animationFrame = requestAnimationFrame(startGameLoop); updateHeldMovement(); previousPlayerY = playerY;
    const inGravity = levelHazards.some((hazard) => hazard.kind === "gravity" && intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, hazard));
    shipFlipped = inGravity && (levels[currentLevel].flip ?? levels[currentLevel].gravity).some((index) => playerX > 140 + index * TILE_WIDTH - 70 && playerX < 140 + index * TILE_WIDTH + 145);
    playerLabel.classList.toggle("flipped", shipFlipped);
    if (gameStarted) { elapsedMilliseconds = performance.now() - levelStartedAt; timerLabel.textContent = formatTime(elapsedMilliseconds); }
    verticalSpeed += inGravity ? gravity * 1.55 : gravity; playerY += verticalSpeed;
    if (playerY >= 300) { playerY = 300; verticalSpeed = 0; jumpCount = 0; }
    projectileTimer++; trailTimer++; playerShotTimer = Math.max(0, playerShotTimer - 1); boostTimer = Math.max(0, boostTimer - 1); rapidTimer = Math.max(0, rapidUntil - performance.now()); if (cannonTimer !== Number.POSITIVE_INFINITY && rapidUntil > 0) cannonTimer = Math.max(0, rapidTimer);
    if (shootingHeld || pressedKeys.has("e")) shoot();
    if (projectileTimer >= (rapidTimer > 0 ? 52 : reducedEffects ? 120 : 90)) { projectileTimer = 0; levelEnemies.forEach(fireProjectile); levelMiniBosses.forEach(fireMiniBossProjectile); if (boss && !boss.defeated) fireBossProjectile(); }
    if (!reducedEffects && trailTimer >= 1) { trailTimer = 0; createTrail(); }
    updateProjectiles(); updateTrail(); updatePlayerPosition(); updatePowerupHud(); checkCollisions();
}

function updatePlayerPosition() { playerLabel.style.transform = `translate(${playerX}px, ${playerY}px)`; world.style.transform = `translateX(${-Math.max(0, playerX - 180)}px)`; levelLabel.textContent = `SECTOR 0${currentLevel + 1}`; }
function shoot() {
    if (!gameActive || cannonTimer <= 0) { if (gameActive) statusLabel.textContent = "Cannon offline. Find the cannon power-up."; return; }
    if (playerShotTimer > 0) return;
    playerShotTimer = rapidUntil > performance.now() ? 8 : 20;
    const element = document.createElement("div"); element.className = "player-projectile"; world.append(element);
    projectiles.push({ x: playerX + playerWidth, y: playerY + 22, vx: 8, vy: 0, element, owner: "player" });
}
function fireProjectile(enemy: Enemy) {
    if (enemy.defeated) return;
    const startX = enemy.x + 18, startY = enemy.y + 25, directionX = playerX + 24 - startX, directionY = playerY + 28 - startY, distance = Math.max(1, Math.hypot(directionX, directionY)), element = document.createElement("div");
    element.className = "projectile"; world.append(element); projectiles.push({ x: startX, y: startY, vx: directionX / distance * 5, vy: directionY / distance * 5, element, owner: "enemy" });
}
function fireBossProjectile() { if (!boss) return; const directionX = playerX + 24 - boss.x, directionY = playerY + 28 - boss.y, distance = Math.max(1, Math.hypot(directionX, directionY)), element = document.createElement("div"); element.className = "boss-projectile"; world.append(element); projectiles.push({ x: boss.x, y: boss.y + 50, vx: directionX / distance * 4.2, vy: directionY / distance * 4.2, element, owner: "enemy" }); }
function fireMiniBossProjectile(miniBoss: MiniBoss) { if (miniBoss.defeated) return; const directionX = playerX + 24 - miniBoss.x, directionY = playerY + 28 - miniBoss.y, distance = Math.max(1, Math.hypot(directionX, directionY)), element = document.createElement("div"); element.className = "mini-projectile"; world.append(element); projectiles.push({ x: miniBoss.x, y: miniBoss.y + 36, vx: directionX / distance * 4.5, vy: directionY / distance * 4.5, element, owner: "enemy" }); }
function createTrail() {
    const trail = trails[selectedTrail] ?? trails[0];
    if (!trailElement) {
        trailElement = document.createElement("i");
            trailElement.className = `trail-particle trail-effect-${trail.effect}`;
        world.append(trailElement);
    }
    trailElement.style.setProperty("--trail-color", trail.color);
    updateTrail();
}
function updateTrail() {
    if (!trailElement) return;
    trailElement.style.left = `${playerX + (playerWidth - 16) / 2}px`;
    trailElement.style.top = `${playerY + playerHeight - 2}px`;
}
function updateProjectiles() { projectiles = projectiles.filter((projectile) => { projectile.x += projectile.vx; projectile.y += projectile.vy; projectile.element.style.transform = `translate(${projectile.x}px, ${projectile.y}px)`; const box = { x: projectile.x, y: projectile.y, width: 16, height: 16 }; const obstacle = levelObstacles.find((item) => intersects(box, item)); if (obstacle) { createSplash(projectile.x, projectile.y); projectile.element.remove(); return false; } if (projectile.owner === "player") { const enemy = levelEnemies.find((item) => !item.defeated && intersects(box, { x: item.x, y: item.y, width: 48, height: 48 })); if (enemy) { enemy.defeated = true; document.querySelectorAll(".enemy")[levelEnemies.indexOf(enemy)]?.classList.add("defeated"); projectile.element.remove(); statusLabel.textContent = "Cannon hit. Sentry disabled."; return false; } const miniBoss = levelMiniBosses.find((item) => !item.defeated && intersects(box, { x: item.x, y: item.y, width: 70, height: 70 })); if (miniBoss) { miniBoss.health--; projectile.element.remove(); if (miniBoss.health <= 0) { miniBoss.defeated = true; document.querySelectorAll(".mini-boss")[levelMiniBosses.indexOf(miniBoss)]?.classList.add("defeated"); statusLabel.textContent = "Cannon fire shattered the mini-boss."; } else statusLabel.textContent = `Cannon hit. ${miniBoss.health} hit remaining.`; return false; } if (boss && !boss.defeated && intersects(box, { x: boss.x, y: boss.y, width: 128, height: 150 })) { projectile.element.remove(); damageBoss(); return false; } } else if (intersects(box, { x: playerX, y: playerY, width: playerWidth, height: playerHeight })) { projectile.element.remove(); if (shieldCharges > 0) { shieldCharges--; statusLabel.textContent = "Shield absorbed the impact."; return false; } showGameOver("A sentry round cracked your hull."); return false; } if (projectile.x < playerX - 700 || projectile.x > playerX + 700 || projectile.y < -100 || projectile.y > 500) { projectile.element.remove(); return false; } return true; }); }
function createSplash(x: number, y: number) { const splash = document.createElement("div"); splash.className = "splash"; splash.style.left = `${x}px`; splash.style.top = `${y}px`; world.append(splash); window.setTimeout(() => splash.remove(), reducedEffects ? 180 : 350); }
function intersects(first: Box, second: Box) { return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y; }

function checkCollisions() {
    levelObstacles.forEach((obstacle) => { const horizontal = playerX + playerWidth > obstacle.x && playerX < obstacle.x + obstacle.width, vertical = playerY + playerHeight > obstacle.y && playerY < obstacle.y + obstacle.height, wasAbove = previousPlayerY + playerHeight <= obstacle.y, wasBelow = previousPlayerY >= obstacle.y + obstacle.height; if (horizontal && vertical && verticalSpeed >= 0 && wasAbove) { playerY = obstacle.y - playerHeight; verticalSpeed = 0; jumpCount = 0; } else if (horizontal && vertical && verticalSpeed < 0 && wasBelow) { playerY = obstacle.y + obstacle.height; verticalSpeed = 0; } else if (horizontal && vertical) { playerX = playerX < obstacle.x ? obstacle.x - playerWidth - 4 : obstacle.x + obstacle.width + 4; updatePlayerPosition(); } });
    levelHazards.forEach((hazard) => { if (hazard.kind === "spikes" && intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, hazard)) { if (shieldCharges > 0) { shieldCharges--; playerY = 300; statusLabel.textContent = "Shield absorbed the spike hit."; } else showGameOver("The spike belt caught your ship."); } });
    levelPowerups.forEach((powerup, index) => { if (!powerup.collected && intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, { x: powerup.x, y: powerup.y, width: 38, height: 38 })) { powerup.collected = true; activatePowerup(powerup.kind); document.querySelectorAll(".powerup")[index]?.classList.add("collected"); } });
    (levels[currentLevel].portals ?? []).forEach((index, portalIndex) => { const portalX = 140 + index * TILE_WIDTH; if (Math.abs(playerX - portalX) < 45) { const target = (levels[currentLevel].portals ?? [])[portalIndex + 1] ?? index + 5; playerX = Math.min(levels[currentLevel].length * TILE_WIDTH, 140 + target * TILE_WIDTH); statusLabel.textContent = "Portal transit complete. Search this new lane for a secret key."; updatePlayerPosition(); } });
    if (levelKey && !levelKey.collected && intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, { x: levelKey.x, y: levelKey.y, width: 38, height: 38 })) { levelKey.collected = true; const keyId = levels[currentLevel].secretId ?? "eclipse"; localStorage.setItem(`orbit-key-${keyId}`, "1"); if (keyId === "eclipse") localStorage.setItem("orbit-secret-unlocked", "1"); document.querySelector(".level-key")?.classList.add("collected"); statusLabel.textContent = `${keyId} key claimed. Secret level unlocked.`; }
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
    levelMiniBosses.forEach((miniBoss, index) => {
        if (miniBoss.defeated) return;
        const miniBox = { x: miniBoss.x, y: miniBoss.y, width: 70, height: 70 };
        const touching = intersects({ x: playerX, y: playerY, width: playerWidth, height: playerHeight }, miniBox);
        const stomped = touching && verticalSpeed >= 0 && previousPlayerY + playerHeight <= miniBoss.y + 18;
        if (stomped) {
            miniBoss.health--;
            playerY = miniBoss.y - playerHeight;
            verticalSpeed = jumpPower * .62;
            jumpCount = 1;
            document.querySelectorAll(".mini-boss")[index]?.classList.add("hit");
            window.setTimeout(() => document.querySelectorAll(".mini-boss")[index]?.classList.remove("hit"), 180);
            if (miniBoss.health <= 0) {
                miniBoss.defeated = true;
                document.querySelectorAll(".mini-boss")[index]?.classList.add("defeated");
                statusLabel.textContent = "Mini-boss shattered. The route is clear.";
            } else {
                statusLabel.textContent = `Mini-boss damaged. ${miniBoss.health} hit remaining.`;
            }
        } else if (touching) {
            if (shieldCharges > 0) { shieldCharges--; playerX = miniBoss.x - playerWidth - 8; statusLabel.textContent = "Shield absorbed the mini-boss impact."; }
            else showGameOver("A mini-boss slammed into your hull.");
        }
    });
    levelAsteroids.forEach((asteroid, index) => { if (!asteroid.claimed && Math.abs(playerX + 24 - asteroid.x) < 42 && Math.abs(playerY + 28 - asteroid.y) < 58) { asteroid.claimed = true; const claimedAsteroids = getClaimedAsteroids(currentLevel); claimedAsteroids.add(index); saveClaimedAsteroids(currentLevel, claimedAsteroids); if (asteroid.special) { specialAsteroids++; localStorage.setItem("orbit-special-claims", String(specialAsteroids)); } else { asteroidsClaimed++; localStorage.setItem("orbit-claims", String(asteroidsClaimed)); } claimLabel.textContent = `${levelAsteroids.filter((item) => item.claimed).length} / ${levelAsteroids.length}`; statusLabel.textContent = asteroid.special ? "Special asteroid secured. Spend it in the roll wheel." : boss ? "Asteroid impact. Titan armor is cracking." : "Asteroid claimed. This one is secured permanently."; document.querySelectorAll(".asteroid")[index]?.classList.add("claimed"); damageBoss(); } });
    if (boss && playerX > boss.x - 120 && !boss.defeated) { playerX = boss.x - 125; statusLabel.textContent = "Titan Core blocks the beacon. Claim asteroids to break it."; updatePlayerPosition(); }
    if (playerX > levels[currentLevel].length * TILE_WIDTH - 100 && gameStarted && (!boss || boss.defeated)) showWinScreen();
}

function activatePowerup(kind: PowerupKind) { if (kind === "shield") { shieldCharges += 1; statusLabel.textContent = "Shield bubble online. One hit will be absorbed."; } else if (kind === "boost") { boostTimer = 420; statusLabel.textContent = "Thruster boost online. Right movement is amplified."; } else if (kind === "rapid") { rapidUntil = performance.now() + 10000; rapidTimer = 10000; cannonTimer = 10000; statusLabel.textContent = "Rapid fire online for 10 seconds. Hold Shoot."; } else { cannonTimer = Number.POSITIVE_INFINITY; statusLabel.textContent = "Cannon online until hull breach. Press E or Shoot."; } updatePowerupHud(); }
function useInventoryPowerup(kind: PowerupKind) { const inventory = getInventory(); if (inventory[kind] < 1) { statusLabel.textContent = `No ${powerupLabels[kind]} power-ups in the hold.`; return; } inventory[kind]--; saveInventory(inventory); activatePowerup(kind); statusLabel.textContent = `${powerupLabels[kind]} launched from the hold.`; }
function updatePowerupHud() { const inventory = getInventory(); document.querySelectorAll<HTMLButtonElement>(".hud-power").forEach((button) => { const kind = button.classList.contains("shield") ? "shield" : button.classList.contains("boost") ? "boost" : button.classList.contains("rapid") ? "rapid" : "cannon" as PowerupKind; const timer = kind === "shield" ? (shieldCharges ? ` x${shieldCharges}` : "") : kind === "cannon" && cannonTimer === Number.POSITIVE_INFINITY ? " READY" : kind === "boost" && boostTimer > 0 ? ` ${Math.ceil(boostTimer / 60)}s` : kind === "rapid" && rapidTimer > 0 ? ` ${Math.ceil(rapidTimer / 1000)}s` : ""; button.textContent = `${powerupLabels[kind]} ${inventory[kind]}${timer}`; button.disabled = inventory[kind] < 1; button.classList.toggle("active", Boolean(timer)); }); playerLabel.classList.toggle("shielded", shieldCharges > 0); }
function damageBoss() { if (!boss || boss.defeated) return; boss.health--; bossLabel.textContent = `TITAN ${boss.health}/${boss.maxHealth}`; const bossElement = document.querySelector(".boss"); bossElement?.classList.add("hit"); window.setTimeout(() => bossElement?.classList.remove("hit"), 180); if (boss.health <= 0) { boss.defeated = true; bossElement?.classList.add("defeated"); statusLabel.textContent = "Titan Core shattered. Reach the beacon for your reward."; } }

function getPrestigeRequirement(level: number) { return { normal: 100 + level * 50, special: 10 + level * 5 }; }
function getCompletedLevelCount() { return levels.filter((level, index) => !level.secret && !level.prestige && localStorage.getItem(`orbit-level-complete-${index}`) === "1").length; }
function tryPrestige() {
    if (prestigeLevel >= prestigeMax || localStorage.getItem("orbit-level-complete-prestige-gate") !== "1" || getCompletedLevelCount() < 20) return false;
    const requirement = getPrestigeRequirement(prestigeLevel);
    if (asteroidsClaimed < requirement.normal || specialAsteroids < requirement.special) return false;
    asteroidsClaimed -= requirement.normal;
    specialAsteroids -= requirement.special;
    prestigeLevel++;
    localStorage.setItem("orbit-claims", String(asteroidsClaimed));
    localStorage.setItem("orbit-special-claims", String(specialAsteroids));
    localStorage.setItem("orbit-prestige", String(prestigeLevel));
    return true;
}
function isSkinUnlocked(skin: { required: number; boss?: boolean; secret?: boolean; prestige?: number; golden?: boolean }) { return localStorage.getItem("orbit-unlock-skins") === "1" || (skin.golden ? getCompletedLevelCount() >= 20 : skin.prestige !== undefined ? prestigeLevel >= skin.prestige : skin.boss ? localStorage.getItem("orbit-boss-defeated") === "1" : skin.secret ? localStorage.getItem("orbit-secret-unlocked") === "1" : asteroidsClaimed >= skin.required); }
function getUnlockedSkinCount() { return skins.filter(isSkinUnlocked).length; }
function isAvatarUnlocked(avatar: AvatarStyle) { return localStorage.getItem("orbit-unlock-avatars") === "1" || (avatar.golden ? getCompletedLevelCount() >= 20 : avatar.prestige !== undefined ? prestigeLevel >= avatar.prestige : avatar.jackpot ? localStorage.getItem("orbit-jackpot-avatar") === "1" : true); }
function isTrailUnlocked(trail: TrailStyle) { return localStorage.getItem("orbit-unlock-trails") === "1" || (trail.golden ? getCompletedLevelCount() >= 20 : trail.boss ? localStorage.getItem("orbit-boss-defeated") === "1" : trail.secret ? localStorage.getItem("orbit-secret-unlocked") === "1" : asteroidsClaimed >= trail.required); }
function getUnlockedTrailCount() { return trails.filter(isTrailUnlocked).length; }
function formatTime(milliseconds: number) { const total = Math.max(0, Math.floor(milliseconds)); const minutes = Math.floor(total / 60000).toString().padStart(2, "0"); const seconds = Math.floor(total / 1000 % 60).toString().padStart(2, "0"); const millis = (total % 1000).toString().padStart(3, "0"); return `${minutes}:${seconds}.${millis}`; }