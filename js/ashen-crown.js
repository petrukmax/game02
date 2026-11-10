// Ashen Crown — generated bundle. Do not edit by hand.
// Built from the ES modules in js/ by `node build.mjs`.
// This is a classic script so the game runs from file:// and static hosting.
(function () {
  'use strict';

  const __definitions = Object.create(null);
  const __cache = Object.create(null);

  function __define(id, factory) {
    __definitions[id] = factory;
  }

  function __require(id) {
    if (__cache[id]) return __cache[id].exports;
    const factory = __definitions[id];
    if (!factory) throw new Error("Module not found: " + id);
    const module = { exports: {} };
    __cache[id] = module;
    factory(module, module.exports, __require);
    return module.exports;
  }

  // ---- js/battle/data.js -----------------------------------------------
  __define("js/battle/data.js", function (module, exports, __require) {
// Static battle content: hero and enemy templates, abilities, encounters, rewards.
// This file is shared by the simulation, the renderer, and the interface.

const ABILITIES = {
  war_cry: {
    id: 'war_cry',
    name: 'War Cry',
    desc: 'All living allies gain +30% damage for 2 rounds.',
    cooldown: 4,
    shape: 'allAllies',
    kind: 'buff',
    status: { id: 'warcry', turns: 2 },
    log: 'raises a war cry',
  },
  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    desc: 'Strike a front-rank enemy for 26-34 and stun it for 1 turn.',
    cooldown: 3,
    shape: 'single',
    kind: 'damage',
    range: 'melee',
    damage: [26, 34],
    damageType: 'physical',
    status: { id: 'stun', turns: 1 },
    log: 'slams a shield into',
  },
  shield_wall: {
    id: 'shield_wall',
    name: 'Shield Wall',
    desc: 'Grant every ally a shield that absorbs 70 damage.',
    cooldown: 4,
    shape: 'allAllies',
    kind: 'buff',
    status: { id: 'shield', turns: 3, amount: 70 },
    log: 'raises a shield wall',
  },
  piercing_shot: {
    id: 'piercing_shot',
    name: 'Piercing Shot',
    desc: 'Fire an armor-piercing arrow for 42-50 damage.',
    cooldown: 2,
    shape: 'single',
    kind: 'damage',
    range: 'any',
    damage: [42, 50],
    damageType: 'physical',
    armorPierce: 0.5,
    log: 'looses a piercing shot at',
  },
  rain_of_arrows: {
    id: 'rain_of_arrows',
    name: 'Rain of Arrows',
    desc: 'Hit every enemy for 24-32 damage.',
    cooldown: 4,
    shape: 'allEnemies',
    kind: 'damage',
    range: 'any',
    damage: [24, 32],
    damageType: 'physical',
    log: 'calls down a rain of arrows',
  },
  firebolt: {
    id: 'firebolt',
    name: 'Firebolt',
    desc: 'Hurl a bolt of fire for 50-62 damage.',
    cooldown: 2,
    shape: 'single',
    kind: 'damage',
    range: 'any',
    damage: [50, 62],
    damageType: 'fire',
    log: 'hurls a firebolt at',
  },
  flame_wave: {
    id: 'flame_wave',
    name: 'Flame Wave',
    desc: 'Burn the enemy front rank for 30-40 and apply burn.',
    cooldown: 4,
    shape: 'frontEnemies',
    kind: 'damage',
    range: 'any',
    damage: [30, 40],
    damageType: 'fire',
    status: { id: 'burn', turns: 2, damage: 12 },
    log: 'sends a wave of flame across',
  },
  mend: {
    id: 'mend',
    name: 'Mend',
    desc: 'Restore 90 hit points to an ally.',
    cooldown: 2,
    shape: 'singleAlly',
    kind: 'heal',
    range: 'any',
    heal: [90, 90],
    log: 'mends the wounds of',
  },
  smite: {
    id: 'smite',
    name: 'Smite',
    desc: 'Call down holy light for 38-46 damage. Undead take +50%.',
    cooldown: 2,
    shape: 'single',
    kind: 'damage',
    range: 'any',
    damage: [38, 46],
    damageType: 'holy',
    bonusVs: 'undead',
    bonusAmount: 0.5,
    log: 'calls holy light down on',
  },
  aimed_shot: {
    id: 'aimed_shot',
    name: 'Aimed Shot',
    desc: 'A careful bolt for 32-40 damage.',
    cooldown: 3,
    shape: 'single',
    kind: 'damage',
    range: 'any',
    damage: [32, 40],
    damageType: 'physical',
    log: 'takes aim at',
  },
  rend: {
    id: 'rend',
    name: 'Rending Claws',
    desc: 'Tear at a front-rank enemy for 30-36 and poison them.',
    cooldown: 3,
    shape: 'single',
    kind: 'damage',
    range: 'melee',
    damage: [30, 36],
    damageType: 'physical',
    status: { id: 'poison', turns: 3, damage: 14 },
    log: 'tears into',
  },
  miasma: {
    id: 'miasma',
    name: 'Miasma',
    desc: 'Poison the enemy front rank for 18-24 and apply poison.',
    cooldown: 3,
    shape: 'frontEnemies',
    kind: 'damage',
    range: 'any',
    damage: [18, 24],
    damageType: 'poison',
    status: { id: 'poison', turns: 3, damage: 12 },
    log: 'exhales a cloud of miasma over',
  },
  venom_arrow: {
    id: 'venom_arrow',
    name: 'Venom Arrow',
    desc: 'Deal 30-38 damage and poison the target.',
    cooldown: 3,
    shape: 'single',
    kind: 'damage',
    range: 'any',
    damage: [30, 38],
    damageType: 'poison',
    status: { id: 'poison', turns: 3, damage: 12 },
    log: 'fires a venom arrow at',
  },
  dark_mend: {
    id: 'dark_mend',
    name: 'Dark Mend',
    desc: 'Restore 75 hit points to an ally.',
    cooldown: 2,
    shape: 'singleAlly',
    kind: 'heal',
    range: 'any',
    heal: [75, 75],
    log: 'knits the flesh of',
  },
  hex: {
    id: 'hex',
    name: 'Hex',
    desc: 'Weaken an enemy for 2 rounds. Weakened units deal 25% less damage.',
    cooldown: 3,
    shape: 'single',
    kind: 'debuff',
    range: 'any',
    status: { id: 'weaken', turns: 2 },
    log: 'lays a hex on',
  },
  soul_rend: {
    id: 'soul_rend',
    name: 'Soul Rend',
    desc: 'Tear every hero for 35-45 cold damage and heal for 40% of the damage dealt.',
    cooldown: 3,
    shape: 'allEnemies',
    kind: 'damage',
    range: 'any',
    damage: [35, 45],
    damageType: 'cold',
    drain: 0.4,
    log: 'rends the souls of the party',
  },
  terror: {
    id: 'terror',
    name: 'Terror',
    desc: 'Strike one hero for 26-34 and stun them for 1 turn.',
    cooldown: 4,
    shape: 'single',
    kind: 'damage',
    range: 'any',
    damage: [26, 34],
    damageType: 'cold',
    status: { id: 'stun', turns: 1 },
    log: 'unleashes terror upon',
  },
  bone_mend: {
    id: 'bone_mend',
    name: 'Bone Mend',
    desc: 'Restore 80 hit points to an ally.',
    cooldown: 2,
    shape: 'singleAlly',
    kind: 'heal',
    range: 'any',
    heal: [80, 80],
    log: 'binds the bones of',
  },
  wither: {
    id: 'wither',
    name: 'Wither',
    desc: 'Weaken an enemy for 2 rounds.',
    cooldown: 3,
    shape: 'single',
    kind: 'debuff',
    range: 'any',
    status: { id: 'weaken', turns: 2 },
    log: 'withers',
  },
};

const HERO_TEMPLATES = [
  {
    id: 'aldric',
    name: 'Aldric',
    epithet: 'the Warden',
    role: 'Warden',
    level: 3,
    portrait: 'warden',
    model: 'knight',
    maxHp: 280,
    damage: [30, 40],
    damageType: 'physical',
    initiative: 14,
    armor: 7,
    resist: { physical: 5, fire: 0, cold: 0, holy: 0, poison: 0 },
    crit: 0.08,
    range: 'melee',
    abilities: ['war_cry', 'shield_bash'],
    traits: [],
    attackName: 'Long sword',
    bio: 'A sworn shield of the dying realm.',
  },
  {
    id: 'bran',
    name: 'Bran',
    epithet: 'the Bulwark',
    role: 'Shieldbearer',
    level: 3,
    portrait: 'shield',
    model: 'shield',
    maxHp: 320,
    damage: [24, 32],
    damageType: 'physical',
    initiative: 9,
    armor: 10,
    resist: { physical: 10, fire: 0, cold: 0, holy: 0, poison: 0 },
    crit: 0.05,
    range: 'melee',
    abilities: ['shield_wall', 'shield_bash'],
    traits: [],
    attackName: 'War hammer',
    bio: 'Silent, stubborn, and impossible to move.',
  },
  {
    id: 'mirelle',
    name: 'Mirelle',
    epithet: 'the Far Sight',
    role: 'Ranger',
    level: 3,
    portrait: 'ranger',
    model: 'archer',
    maxHp: 180,
    damage: [26, 34],
    damageType: 'physical',
    initiative: 23,
    armor: 3,
    resist: { physical: 0, fire: 0, cold: 0, holy: 0, poison: 10 },
    crit: 0.12,
    range: 'ranged',
    abilities: ['piercing_shot', 'rain_of_arrows'],
    traits: [],
    attackName: 'Long bow',
    bio: 'She counts the dead from a safe distance.',
  },
  {
    id: 'oszar',
    name: 'Oszar',
    epithet: 'the Cinder',
    role: 'Pyromancer',
    level: 3,
    portrait: 'pyromancer',
    model: 'mage',
    maxHp: 155,
    damage: [30, 38],
    damageType: 'fire',
    initiative: 18,
    armor: 2,
    resist: { physical: 0, fire: 35, cold: -15, holy: 0, poison: 0 },
    crit: 0.09,
    range: 'magic',
    abilities: ['firebolt', 'flame_wave'],
    traits: [],
    attackName: 'Ember staff',
    bio: 'A scholar who mistook ruin for revelation.',
  },
  {
    id: 'vela',
    name: 'Vela',
    epithet: 'the Lamp',
    role: 'Priest',
    level: 3,
    portrait: 'priest',
    model: 'priest',
    maxHp: 195,
    damage: [20, 26],
    damageType: 'holy',
    initiative: 12,
    armor: 3,
    resist: { physical: 0, fire: 0, cold: 10, holy: 25, poison: 10 },
    crit: 0.06,
    range: 'magic',
    abilities: ['mend', 'smite'],
    traits: [],
    attackName: 'Censer',
    bio: 'Her light is small, but it does not waver.',
  },
];

const ENEMY_TEMPLATES = {
  brigand: {
    id: 'brigand',
    name: 'Brigand',
    role: 'Raider',
    level: 2,
    portrait: 'brigand',
    model: 'brigand',
    maxHp: 170,
    damage: [22, 30],
    damageType: 'physical',
    initiative: 16,
    armor: 4,
    resist: { physical: 0, fire: 0, cold: 0, holy: 0, poison: 0 },
    crit: 0.07,
    range: 'melee',
    abilities: [],
    traits: [],
    attackName: 'Notched axe',
    tier: 1,
  },
  crossbowman: {
    id: 'crossbowman',
    name: 'Crossbowman',
    role: 'Marksman',
    level: 2,
    portrait: 'crossbow',
    model: 'crossbow',
    maxHp: 135,
    damage: [20, 28],
    damageType: 'physical',
    initiative: 21,
    armor: 2,
    resist: { physical: 0, fire: 0, cold: 0, holy: 0, poison: 0 },
    crit: 0.1,
    range: 'ranged',
    abilities: ['aimed_shot'],
    traits: [],
    attackName: 'Crossbow',
    tier: 1,
  },
  ghoul: {
    id: 'ghoul',
    name: 'Ghoul',
    role: 'Carrion',
    level: 2,
    portrait: 'ghoul',
    model: 'ghoul',
    maxHp: 150,
    damage: [20, 26],
    damageType: 'physical',
    initiative: 11,
    armor: 3,
    resist: { physical: 0, fire: -20, cold: 25, holy: -20, poison: 50 },
    crit: 0.06,
    range: 'melee',
    abilities: ['rend'],
    traits: ['undead'],
    attackName: 'Filthy claws',
    tier: 1,
  },
  lurker: {
    id: 'lurker',
    name: 'Bog Lurker',
    role: 'Mire Brute',
    level: 3,
    portrait: 'lurker',
    model: 'lurker',
    maxHp: 215,
    damage: [24, 32],
    damageType: 'poison',
    initiative: 8,
    armor: 6,
    resist: { physical: 5, fire: -15, cold: 10, holy: 0, poison: 60 },
    crit: 0.05,
    range: 'melee',
    abilities: ['miasma'],
    traits: ['beast'],
    attackName: 'Dripping talons',
    tier: 2,
  },
  cultist: {
    id: 'cultist',
    name: 'Cultist',
    role: 'Warlock',
    level: 3,
    portrait: 'cultist',
    model: 'cultist',
    maxHp: 160,
    damage: [26, 34],
    damageType: 'fire',
    initiative: 15,
    armor: 2,
    resist: { physical: 0, fire: 30, cold: 0, holy: -15, poison: 0 },
    crit: 0.08,
    range: 'magic',
    abilities: ['dark_mend', 'hex'],
    traits: [],
    attackName: 'Black flame',
    tier: 2,
  },
  marsh_archer: {
    id: 'marsh_archer',
    name: 'Marsh Archer',
    role: 'Poisoner',
    level: 3,
    portrait: 'marsharcher',
    model: 'archer',
    maxHp: 150,
    damage: [22, 30],
    damageType: 'poison',
    initiative: 20,
    armor: 2,
    resist: { physical: 0, fire: 0, cold: 0, holy: 0, poison: 40 },
    crit: 0.1,
    range: 'ranged',
    abilities: ['venom_arrow'],
    traits: [],
    attackName: 'Venom bow',
    tier: 2,
  },
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton Warrior',
    role: 'Undead',
    level: 4,
    portrait: 'skeleton',
    model: 'skeleton',
    maxHp: 200,
    damage: [26, 34],
    damageType: 'physical',
    initiative: 13,
    armor: 7,
    resist: { physical: 10, fire: 0, cold: 25, holy: -50, poison: 50 },
    crit: 0.08,
    range: 'melee',
    abilities: [],
    traits: ['undead'],
    attackName: 'Rusted blade',
    tier: 3,
  },
  adept: {
    id: 'adept',
    name: 'Bone Adept',
    role: 'Necromancer',
    level: 4,
    portrait: 'adept',
    model: 'adept',
    maxHp: 175,
    damage: [24, 30],
    damageType: 'cold',
    initiative: 17,
    armor: 3,
    resist: { physical: 0, fire: 0, cold: 40, holy: -25, poison: 50 },
    crit: 0.07,
    range: 'magic',
    abilities: ['bone_mend', 'wither'],
    traits: ['undead'],
    attackName: 'Grave chill',
    tier: 3,
  },
  hollow_king: {
    id: 'hollow_king',
    name: 'The Hollow King',
    role: 'Boss',
    level: 6,
    portrait: 'king',
    model: 'king',
    maxHp: 620,
    damage: [40, 52],
    damageType: 'cold',
    initiative: 15,
    armor: 8,
    resist: { physical: 10, fire: 0, cold: 40, holy: -25, poison: 50 },
    crit: 0.1,
    range: 'melee',
    reach: true,
    abilities: ['soul_rend', 'terror'],
    traits: ['undead', 'boss', 'enrage'],
    attackName: 'Crown blade',
    tier: 5,
  },
};

// Between-battle upgrades. Gold finally has a purpose: the war camp turns
// reward money into permanent party power or immediate recovery.
const UPGRADES = {
  sharpen: { name: 'Sharpen Blades', cost: 100, max: 4, desc: '+2 damage for every hero.' },
  armor: { name: 'Reinforce Armour', cost: 90, max: 4, desc: '+2 armour for every hero.' },
  heal: { name: 'Field Hospital', cost: 70, max: 99, desc: 'Restore every hero to full health.' },
};

const ENCOUNTERS = [  {
    id: 'watchtower',
    index: 1,
    name: 'Ruined Watchtower',
    subtitle: 'The dead keep watch.',
    theme: 'ruins',
    objective: 'Defeat every enemy on the field.',
    hint: 'Choose Attack, then click a highlighted enemy. Melee cannot reach the back rank while the front rank stands.',
    allies: [
      { id: 'aldric', slot: 'F1' },
      { id: 'bran', slot: 'F0' },
      { id: 'mirelle', slot: 'B1' },
      { id: 'oszar', slot: 'B0' },
      { id: 'vela', slot: 'B2' },
    ],
    enemies: [
      { id: 'brigand', slot: 'F0', name: 'Brigand' },
      { id: 'ghoul', slot: 'F1', name: 'Ghoul' },
      { id: 'brigand', slot: 'B0', name: 'Brigand' },
      { id: 'crossbowman', slot: 'B1', name: 'Crossbowman' },
      { id: 'crossbowman', slot: 'B2', name: 'Crossbowman' },
    ],
    reward: { xp: 320, gold: 110, clear: 60 },
  },
  {
    id: 'sunken_marsh',
    index: 2,
    name: 'The Sunken Marsh',
    subtitle: 'Something breathes beneath the water.',
    theme: 'marsh',
    objective: 'Break the mire cult before it spreads.',
    hint: 'Rain of Arrows and Flame Wave strike several enemies. Poison ticks at the start of a unit turn.',
    allies: [
      { id: 'aldric', slot: 'F1' },
      { id: 'bran', slot: 'F0' },
      { id: 'mirelle', slot: 'B1' },
      { id: 'oszar', slot: 'B0' },
      { id: 'vela', slot: 'B2' },
    ],
    enemies: [
      { id: 'lurker', slot: 'F0', name: 'Bog Lurker' },
      { id: 'lurker', slot: 'F1', name: 'Bog Lurker' },
      { id: 'lurker', slot: 'F2', name: 'Bog Lurker' },
      { id: 'cultist', slot: 'B1', name: 'Mire Cultist' },
      { id: 'marsh_archer', slot: 'B2', name: 'Marsh Archer' },
    ],
    reward: { xp: 420, gold: 160, clear: 90 },
  },
  {
    id: 'bone_cathedral',
    index: 3,
    name: 'The Bone Cathedral',
    subtitle: 'A crown waits on a throne of ribs.',
    theme: 'cathedral',
    objective: 'Destroy the Hollow King.',
    hint: 'The Hollow King drains life with Soul Rend. Strike the healer, then focus the crown.',
    allies: [
      { id: 'aldric', slot: 'F1' },
      { id: 'bran', slot: 'F0' },
      { id: 'mirelle', slot: 'B1' },
      { id: 'oszar', slot: 'B0' },
      { id: 'vela', slot: 'B2' },
    ],
    enemies: [
      { id: 'skeleton', slot: 'F0', name: 'Skeleton Warrior' },
      { id: 'hollow_king', slot: 'F1', name: 'The Hollow King', boss: true },
      { id: 'skeleton', slot: 'B0', name: 'Skeleton Warrior' },
      { id: 'adept', slot: 'B1', name: 'Bone Adept' },
      { id: 'skeleton', slot: 'B2', name: 'Skeleton Warrior' },
    ],
    reward: { xp: 600, gold: 300, clear: 200 },
  },
];

const SLOT_ORDER = ['F0', 'F1', 'F2', 'B0', 'B1', 'B2'];

const STATUS_INFO = {
  poison: { name: 'Poison', color: '#9BC24B', icon: '☠', desc: 'Loses health at the start of each turn.' },
  burn: { name: 'Burn', color: '#FF8A2A', icon: '≈', desc: 'Suffers fire damage at the start of each turn.' },
  stun: { name: 'Stunned', color: '#F2D06B', icon: '✦', desc: 'Skips the next action.' },
  weaken: { name: 'Weakened', color: '#B48CD6', icon: '↓', desc: 'Deals 25% less damage.' },
  guard: { name: 'Guarding', color: '#8FB7D9', icon: '◈', desc: 'Takes 50% less damage until the next turn.' },
  warcry: { name: 'War Cry', color: '#E0A34A', icon: '▲', desc: 'Deals 30% more damage.' },
  shield: { name: 'Shield', color: '#8FE7D4', icon: '◍', desc: 'Absorbs incoming damage.' },
  enrage: { name: 'Enraged', color: '#D95043', icon: '✹', desc: 'Deals more damage, but loses armor.' },
};

const DMG_LABEL = {
  physical: 'Physical',
  fire: 'Fire',
  cold: 'Cold',
  holy: 'Holy',
  poison: 'Poison',
};

function cloneTemplate(template) {
  return {
    ...template,
    damage: [...template.damage],
    resist: { ...template.resist },
    abilities: [...(template.abilities || [])],
    traits: [...(template.traits || [])],
  };
}

function createCampaignParty() {
  return HERO_TEMPLATES.map((hero) => ({
    ...cloneTemplate(hero),
    xp: 0,
    level: hero.level,
  }));
}

function xpToNextLevel(level) {
  return level * 100;
}

function grantCampaignXp(party, amount) {
  const levels = [];
  for (const hero of party) {
    hero.xp += amount;
    while (hero.xp >= xpToNextLevel(hero.level)) {
      hero.xp -= xpToNextLevel(hero.level);
      hero.level += 1;
      const previousMax = hero.maxHp;
      hero.maxHp = Math.round(hero.maxHp * 1.1);
      hero.damage = hero.damage.map((value) => Math.round(value * 1.08));
      // Levelling restores the new maximum's worth of vitality, not a full heal.
      // Attrition between encounters must still matter.
      hero.hp = Math.min(hero.maxHp, (hero.hp ?? previousMax) + (hero.maxHp - previousMax) + Math.round(hero.maxHp * 0.15));
      levels.push({ unitId: hero.id, name: hero.name, level: hero.level });
    }
  }
  return levels;
}

function preparePartyForNextBattle(party) {
  for (const hero of party) {
    if ((hero.hp ?? hero.maxHp) <= 0) {
      hero.hp = Math.round(hero.maxHp * 0.25);
    } else {
      hero.hp = Math.min(hero.maxHp, hero.hp + Math.round(hero.maxHp * 0.2));
    }
  }
}

function encounterById(id) {
  return ENCOUNTERS.find((entry) => entry.id === id) || null;
}

Object.assign(exports, { ABILITIES, HERO_TEMPLATES, ENEMY_TEMPLATES, UPGRADES, ENCOUNTERS, SLOT_ORDER, STATUS_INFO, DMG_LABEL, cloneTemplate, createCampaignParty, xpToNextLevel, grantCampaignXp, preparePartyForNextBattle, encounterById });

  });

  // ---- js/core/rng.js --------------------------------------------------
  __define("js/core/rng.js", function (module, exports, __require) {
// Deterministic pseudo-random generator (mulberry32).
// All combat rolls go through this so a seed + action sequence is reproducible.

class RNG {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
    this.state = this.seed;
  }

  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    if (hi <= lo) return lo;
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  chance(p) {
    return this.next() < p;
  }

  pick(list) {
    if (!list.length) return null;
    return list[Math.floor(this.next() * list.length)];
  }

  fork(salt = 0) {
    return new RNG((this.state ^ (salt * 2654435761)) >>> 0);
  }
}

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

Object.assign(exports, { RNG, hashString });

  });

  // ---- js/battle/sim.js ------------------------------------------------
  __define("js/battle/sim.js", function (module, exports, __require) {
// Authoritative turn-based battle simulation.
// No DOM, no Three.js. Everything here is deterministic given the seed and action sequence.

const { ABILITIES, ENEMY_TEMPLATES, HERO_TEMPLATES, SLOT_ORDER, STATUS_INFO, cloneTemplate } = __require("js/battle/data.js");
const { RNG } = __require("js/core/rng.js");

const oppositeRank = (rank) => (rank === 'F' ? 'B' : 'F');
const rankName = (rank) => (rank === 'F' ? 'front' : 'back');

function makeUnit(template, { side, slot, name, boss = false, hp, level, maxHp, damage }) {
  return {
    ...cloneTemplate(template),
    uid: `${side}-${slot}-${template.id}`,
    side,
    slot,
    rank: slot[0],
    col: Number(slot[1]),
    name: name || template.name,
    boss,
    maxHp: maxHp ?? template.maxHp,
    hp: hp ?? maxHp ?? template.maxHp,
    level: level ?? template.level,
    damage: damage ?? template.damage,
    statuses: {},
    cooldowns: {},
    alive: true,
    waitedThisRound: false,
    acted: false,
    dealt: 0,
    taken: 0,
    healed: 0,
    kills: 0,
  };
}

class Battle {
  constructor({ encounter, party = null, seed = 1, partySource = null } = {}) {
    if (!encounter) throw new Error('Battle requires an encounter.');
    this.encounter = encounter;
    this.seed = seed;
    this.rng = new RNG(seed);
    this.partySource = party || partySource || HERO_TEMPLATES.map((hero) => ({ ...cloneTemplate(hero), xp: 0 }));
    this.party = this.partySource;
    this.units = [];
    this.round = 0;
    this.order = [];
    this.fallen = [];
    this.turnIndex = 0;
    this.phase = 'idle';
    this.outcome = null;
    this.log = [];
    this.stats = {
      rounds: 0,
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      kills: 0,
      alliesLost: 0,
      crits: 0,
    };
    this.lastAction = null;
    this.actingUnit = null;
    this.pendingWait = 'advance';
    this.started = false;
    this.finished = false;
    this.buildUnits();
  }

  buildUnits() {
    const encounter = this.encounter;
    for (const entry of encounter.allies) {
      const partyHero =
        this.party.find((hero) => hero.id === entry.id) ||
        HERO_TEMPLATES.find((hero) => hero.id === entry.id);
      const template = partyHero || HERO_TEMPLATES[0];
      const unit = makeUnit(template, {
        side: 'ally',
        slot: entry.slot,
        name: entry.name || template.name,
        hp: Math.max(1, partyHero?.hp ?? template.maxHp),
        maxHp: partyHero?.maxHp ?? template.maxHp,
        level: partyHero?.level ?? template.level,
        damage: partyHero?.damage ?? template.damage,
      });
      unit.xp = partyHero?.xp ?? 0;
      this.units.push(unit);
    }
    for (const entry of encounter.enemies) {
      const template = ENEMY_TEMPLATES[entry.id];
      if (!template) throw new Error(`Unknown enemy template: ${entry.id}`);
      const unit = makeUnit(template, {
        side: 'enemy',
        slot: entry.slot,
        name: entry.name || template.name,
        boss: Boolean(entry.boss),
      });
      this.units.push(unit);
    }
  }

  get allies() {
    return this.units.filter((unit) => unit.side === 'ally');
  }

  get enemies() {
    return this.units.filter((unit) => unit.side === 'enemy');
  }

  getUnit(uid) {
    return this.units.find((unit) => unit.uid === uid) || null;
  }

  get currentUnit() {
    return this.order[this.turnIndex] || null;
  }

  get canAct() {
    return this.phase === 'player' || this.phase === 'enemy';
  }

  start() {
    if (this.started) return [];
    this.started = true;
    const events = [];
    this.phase = 'resolving';
    this.beginRound(events);
    this.beginTurn(events);
    return events;
  }

  beginRound(events) {
    this.round += 1;
    this.stats.rounds = this.round;
    for (const unit of this.units) {
      unit.waitedThisRound = false;
      unit.acted = false;
    }
    this.order = this.units
      .filter((unit) => unit.alive)
      .sort((a, b) => {
        if (b.initiative !== a.initiative) return b.initiative - a.initiative;
        if (a.side !== b.side) return a.side === 'ally' ? -1 : 1;
        return SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
      });
    this.turnIndex = 0;
    this.phase = 'resolving';
    events.push({ type: 'round', round: this.round });
    this.addLog(events, `Round ${this.round} begins.`, 'neutral');
  }

  beginTurn(events) {
    let safety = 0;
    while (safety < 40) {
      safety += 1;
      if (this.outcome) return;
      if (this.turnIndex >= this.order.length) {
        this.beginRound(events);
      }
      const actor = this.order[this.turnIndex];
      if (!actor) {
        this.checkOutcome(events);
        return;
      }
      if (!actor.alive) {
        this.turnIndex += 1;
        continue;
      }

      this.tickStartOfTurn(actor, events);
      if (this.checkOutcome(events)) return;
      if (!actor.alive) {
        this.turnIndex += 1;
        continue;
      }

      if (actor.statuses.stun) {
        actor.statuses.stun.turns -= 1;
        if (actor.statuses.stun.turns <= 0) delete actor.statuses.stun;
        events.push({ type: 'skip', unitId: actor.uid, reason: 'stun' });
        this.addLog(events, `${actor.name} is stunned and loses the turn.`, 'bad');
        this.tickEndOfTurn(actor, events);
        this.turnIndex += 1;
        continue;
      }

      actor.acted = true;
      this.actingUnit = actor;
      this.phase = actor.side === 'ally' ? 'player' : 'enemy';
      events.push({
        type: 'turn',
        unitId: actor.uid,
        side: actor.side,
        round: this.round,
      });
      return;
    }
    this.addLog(events, 'The battle stalls. No unit can act.', 'bad');
  }

  tickStartOfTurn(unit, events) {
    for (const key of Object.keys(unit.cooldowns)) {
      unit.cooldowns[key] = Math.max(0, unit.cooldowns[key] - 1);
    }

    if (unit.statuses.guard) {
      delete unit.statuses.guard;
      events.push({ type: 'statusEnd', unitId: unit.uid, status: 'guard' });
    }

    for (const dot of ['poison', 'burn']) {
      const status = unit.statuses[dot];
      if (!status) continue;
      const amount = this.applyDot(unit, dot, status.damage, events);
      if (amount > 0) {
        status.turns -= 1;
        if (status.turns <= 0) {
          delete unit.statuses[dot];
          events.push({ type: 'statusEnd', unitId: unit.uid, status: dot });
        }
      }
      if (!unit.alive) break;
    }
  }

  tickEndOfTurn(unit, events) {
    for (const key of ['warcry', 'weaken', 'shield']) {
      const status = unit.statuses[key];
      if (!status) continue;
      if (status.turns === Infinity) continue;
      status.turns -= 1;
      if (status.turns <= 0 || (key === 'shield' && status.amount <= 0)) {
        delete unit.statuses[key];
        events.push({ type: 'statusEnd', unitId: unit.uid, status: key });
      }
    }
  }

  getResist(unit, type) {
    const raw = unit.resist?.[type] ?? 0;
    const clamped = Math.max(-50, Math.min(75, raw));
    return clamped;
  }

  rollDamage(attacker, target, spec) {
    const base = this.rng.int(spec.min, spec.max);
    let multiplier = 1;
    if (attacker.statuses.warcry) multiplier += 0.3;
    if (attacker.statuses.weaken) multiplier -= 0.25;
    if (attacker.statuses.enrage) multiplier += 0.25;
    if (spec.bonusVs && target.traits?.includes(spec.bonusVs)) multiplier += spec.bonusAmount || 0.5;

    let crit = false;
    const critChance = spec.critChance ?? attacker.crit ?? 0.05;
    if (spec.canCrit !== false && this.rng.chance(critChance)) {
      crit = true;
      multiplier *= 1.6;
    }

    let armor = target.armor;
    if (target.statuses.enrage) armor = Math.max(0, armor - 3);
    let mitigation = spec.type === 'physical' ? armor : armor * 0.35;
    mitigation *= 1 - (spec.armorPierce || 0);

    const resist = this.getResist(target, spec.type);
    let amount = (base * multiplier - mitigation) * (1 - resist / 100);
    if (target.statuses.guard) amount *= 0.5;
    amount = Math.max(1, Math.round(amount));

    return { amount, base, crit, type: spec.type, resist };
  }

  applyDamage(attacker, target, roll, events, { status = null, drain = 0, source = 'attack' } = {}) {
    if (!target.alive) return 0;
    let incoming = roll.amount;
    let absorbed = 0;
    const shield = target.statuses.shield;
    if (shield && shield.amount > 0) {
      absorbed = Math.min(shield.amount, incoming);
      shield.amount -= absorbed;
      incoming -= absorbed;
      if (shield.amount <= 0) {
        delete target.statuses.shield;
        events.push({ type: 'statusEnd', unitId: target.uid, status: 'shield' });
      }
    }

    target.hp = Math.max(0, target.hp - incoming);
    target.taken += incoming;
    this.checkEnrage(target, events);
    if (attacker) {
      attacker.dealt += incoming;
      if (attacker.side === 'ally') this.stats.damageDealt += incoming;
      else this.stats.damageTaken += incoming;
    }
    if (roll.crit) this.stats.crits += 1;

    events.push({
      type: 'damage',
      actorId: attacker?.uid || null,
      targetId: target.uid,
      amount: incoming,
      absorbed,
      crit: roll.crit,
      damageType: roll.type,
      source,
      hpAfter: target.hp,
      maxHp: target.maxHp,
    });

    if (roll.crit) {
      this.addLog(events, `${target.name} is struck for ${incoming} (critical).`, 'good');
    } else {
      this.addLog(events, `${target.name} takes ${incoming} ${roll.type} damage${absorbed ? ` (${absorbed} absorbed)` : ''}.`, 'neutral');
    }

    if (drain > 0 && attacker && attacker.alive && incoming > 0) {
      this.healUnit(attacker, Math.max(1, Math.round(incoming * drain)), events, 'drain');
    }

    if (status && target.alive) {
      this.applyStatus(target, status, events, attacker);
    }

    if (target.hp <= 0 && target.alive) {
      this.killUnit(target, events);
    }
    return incoming;
  }

  applyDot(unit, type, base, events) {
    const resist = this.getResist(unit, type);
    let amount = Math.max(1, Math.round(base * (1 - resist / 100)));
    let absorbed = 0;
    const shield = unit.statuses.shield;
    if (shield && shield.amount > 0) {
      absorbed = Math.min(shield.amount, amount);
      shield.amount -= absorbed;
      amount -= absorbed;
      if (shield.amount <= 0) {
        delete unit.statuses.shield;
        events.push({ type: 'statusEnd', unitId: unit.uid, status: 'shield' });
      }
    }
    if (amount > 0) {
      unit.hp = Math.max(0, unit.hp - amount);
      unit.taken += amount;
      this.checkEnrage(unit, events);
      this.stats.damageTaken += unit.side === 'ally' ? amount : 0;
      events.push({
        type: 'damage',
        actorId: null,
        targetId: unit.uid,
        amount,
        absorbed,
        crit: false,
        damageType: type,
        source: type,
        hpAfter: unit.hp,
        maxHp: unit.maxHp,
      });
      this.addLog(events, `${unit.name} suffers ${amount} ${type} damage.`, 'bad');
      if (unit.hp <= 0) this.killUnit(unit, events);
    }
    return amount + absorbed;
  }

  checkEnrage(unit, events) {
    if (!unit.alive || unit.hp <= 0 || unit.statuses.enrage) return false;
    if (!unit.traits?.includes('enrage')) return false;
    if (unit.hp > unit.maxHp * 0.5) return false;
    this.applyStatus(unit, { id: 'enrage' }, events, unit);
    this.addLog(events, `${unit.name} is enraged by the wound!`, 'bad');
    return true;
  }

  healUnit(unit, amount, events, source = 'heal') {
    if (!unit.alive) return 0;
    const before = unit.hp;
    unit.hp = Math.min(unit.maxHp, unit.hp + amount);
    const healed = unit.hp - before;
    unit.healed += healed;
    if (unit.side === 'ally') this.stats.healingDone += healed;
    if (healed > 0) {
      events.push({
        type: 'heal',
        targetId: unit.uid,
        amount: healed,
        source,
        hpAfter: unit.hp,
        maxHp: unit.maxHp,
      });
    }
    return healed;
  }

  applyStatus(unit, status, events, source = null) {
    if (!unit.alive || !status) return;
    const current = unit.statuses[status.id];
    if (status.id === 'enrage') {
      unit.statuses.enrage = { turns: Infinity };
    } else if (status.id === 'guard') {
      // Guard is consumed at the start of the unit's own next turn.
      unit.statuses.guard = { turns: 1 };
    } else if (status.id === 'shield') {
      const amount = status.amount || 0;
      if (current) {
        current.amount += amount;
        current.turns = Math.max(current.turns, status.turns || 3);
      } else {
        unit.statuses.shield = { turns: status.turns || 3, amount };
      }
    } else if (status.id === 'poison' || status.id === 'burn') {
      unit.statuses[status.id] = {
        turns: Math.max(current?.turns || 0, status.turns || 1),
        damage: Math.max(current?.damage || 0, status.damage || 10),
      };
    } else if (status.id === 'stun') {
      unit.statuses.stun = { turns: 1 };
    } else if (status.id === 'warcry' || status.id === 'weaken') {
      unit.statuses[status.id] = {
        turns: Math.max(current?.turns || 0, status.turns || 1),
      };
    }

    events.push({
      type: 'status',
      unitId: unit.uid,
      status: status.id,
      turns: unit.statuses[status.id]?.turns ?? 0,
      sourceId: source?.uid || null,
    });
    const info = STATUS_INFO[status.id];
    this.addLog(events, `${unit.name} is affected by ${info?.name || status.id}.`, status.id === 'weaken' ? 'bad' : 'neutral');
  }

  killUnit(unit, events) {
    if (!unit.alive) return;
    unit.alive = false;
    unit.hp = 0;
    const orderIndex = this.order.indexOf(unit);
    if (orderIndex !== -1) {
      this.order.splice(orderIndex, 1);
      if (orderIndex <= this.turnIndex) {
        this.turnIndex = Math.max(-1, this.turnIndex - 1);
      }
    }
    // Dead units leave the turn order but stay on the roster so the initiative
    // tower can keep showing them, dimmed, for the rest of the battle.
    if (!this.fallen.includes(unit)) this.fallen.push(unit);
    events.push({ type: 'death', unitId: unit.uid, side: unit.side });
    this.addLog(events, `${unit.name} falls.`, unit.side === 'ally' ? 'bad' : 'good');
    if (unit.side === 'enemy') {
      this.stats.kills += 1;
      const killer = this.actingUnit;
      if (killer && killer.side === 'ally') killer.kills += 1;
    } else {
      this.stats.alliesLost += 1;
    }
    this.checkOutcome(events);
  }

  checkOutcome(events) {
    if (this.outcome) return true;
    const alliesAlive = this.allies.some((unit) => unit.alive);
    const enemiesAlive = this.enemies.some((unit) => unit.alive);
    if (!enemiesAlive) {
      this.outcome = 'victory';
      this.phase = 'victory';
      this.finished = true;
      events.push({ type: 'victory' });
      this.addLog(events, 'Victory. The field is ours.', 'good');
      return true;
    }
    if (!alliesAlive) {
      this.outcome = 'defeat';
      this.phase = 'defeat';
      this.finished = true;
      events.push({ type: 'defeat' });
      this.addLog(events, 'The party has fallen.', 'bad');
      return true;
    }
    return false;
  }

  addLog(events, text, tone = 'neutral') {
    this.log.push({ text, tone, round: this.round });
    if (this.log.length > 80) this.log.shift();
    events.push({ type: 'log', text, tone });
  }

  unitAt(side, slot) {
    return this.units.find((unit) => unit.side === side && unit.slot === slot && unit.alive) || null;
  }

  frontAlive(side) {
    return this.units.some((unit) => unit.side === side && unit.rank === 'F' && unit.alive);
  }

  canReach(actor, target, range) {
    if (!target.alive) return false;
    if (range !== 'melee' || actor.reach) return true;
    const frontExists = this.frontAlive(target.side);
    if (!frontExists) return true;
    return target.rank === 'F';
  }

  abilityValidTargets(actor, ability) {
    const enemies = this.units.filter((unit) => unit.side !== actor.side && unit.alive);
    const allies = this.units.filter((unit) => unit.side === actor.side && unit.alive);
    switch (ability.shape) {
      case 'single':
        return enemies.filter((unit) => this.canReach(actor, unit, ability.range || 'any'));
      case 'frontEnemies': {
        const front = enemies.filter((unit) => unit.rank === 'F');
        return front.length ? front : enemies;
      }
      case 'allEnemies':
        return enemies;
      case 'singleAlly':
        return allies;
      case 'allAllies':
        return allies;
      case 'self':
        return [actor];
      default:
        return [];
    }
  }

  abilityNeedsTarget(ability) {
    return ['single', 'singleAlly', 'self'].includes(ability.shape);
  }

  getValidTargets(actor, action, abilityId = null) {
    if (!actor || !actor.alive) return [];
    if (action === 'attack') {
      return this.units.filter(
        (unit) =>
          unit.side !== actor.side &&
          unit.alive &&
          this.canReach(actor, unit, actor.range),
      );
    }
    if (action === 'ability') {
      const ability = ABILITIES[abilityId];
      if (!ability || !actor.abilities.includes(abilityId)) return [];
      return this.abilityValidTargets(actor, ability);
    }
    return [];
  }

  abilityCooldown(actor, abilityId) {
    return Math.max(0, actor.cooldowns[abilityId] || 0);
  }

  abilityAvailable(actor, abilityId) {
    return actor.abilities.includes(abilityId) && this.abilityCooldown(actor, abilityId) <= 0;
  }

  shiftDestination(actor) {
    const rank = oppositeRank(actor.rank);
    // Prefer the same column, then adjacent columns, then any free slot. With a
    // five-hero party only one slot is free at a time, so a same-column-only
    // rule made Change Row useless for four heroes out of five.
    const columns = [actor.col, actor.col - 1, actor.col + 1, 0, 1, 2];
    const seen = new Set();
    for (const col of columns) {
      if (col < 0 || col > 2 || seen.has(col)) continue;
      seen.add(col);
      const slot = `${rank}${col}`;
      if (!this.unitAt(actor.side, slot)) return slot;
    }
    return null;
  }

  getActionsFor(actor) {
    const actions = [];
    const targets = this.getValidTargets(actor, 'attack');
    actions.push({
      id: 'attack',
      label: 'Attack',
      enabled: targets.length > 0,
      reason: targets.length ? '' : 'No reachable enemy.',
      targets: targets.map((unit) => unit.uid),
    });
    const abilities = actor.abilities.map((id) => {
      const ability = ABILITIES[id];
      const cd = this.abilityCooldown(actor, id);
      const valid = cd <= 0 ? this.getValidTargets(actor, 'ability', id) : [];
      return {
        id,
        name: ability.name,
        desc: ability.desc,
        cooldown: cd,
        enabled: cd <= 0 && (valid.length > 0 || !this.abilityNeedsTarget(ability)),
        reason: cd > 0 ? `Ready in ${cd} round${cd === 1 ? '' : 's'}.` : valid.length ? '' : 'No valid target.',
        needsTarget: this.abilityNeedsTarget(ability),
        targets: valid.map((unit) => unit.uid),
        shape: ability.shape,
        kind: ability.kind,
      };
    });
    actions.push({
      id: 'ability',
      label: 'Ability',
      enabled: abilities.some((entry) => entry.enabled),
      abilities,
    });
    actions.push({
      id: 'defend',
      label: 'Defend',
      enabled: true,
      reason: '',
    });
    actions.push({
      id: 'wait',
      label: 'Wait',
      enabled: !actor.waitedThisRound,
      reason: actor.waitedThisRound ? 'Already waited this round.' : '',
    });
    const dest = this.shiftDestination(actor);
    actions.push({
      id: 'shift',
      label: 'Change Row',
      enabled: Boolean(dest),
      reason: dest ? '' : 'No free slot in the other row.',
      destination: dest,
    });
    return actions;
  }

  performAction(actorUid, action, options = {}) {
    const events = [];
    const actor = this.getUnit(actorUid);
    if (!actor) return { ok: false, error: 'Unknown unit.', events };
    if (!this.canAct) return { ok: false, error: 'It is not a valid moment to act.', events };
    if (this.currentUnit?.uid !== actor.uid) return { ok: false, error: 'This unit is not active.', events };
    if (!actor.alive) return { ok: false, error: 'Dead units cannot act.', events };

    if (action === 'attack') {
      const target = this.getUnit(options.targetId);
      if (!target || !target.alive) return { ok: false, error: 'Choose a living enemy.', events };
      if (!this.getValidTargets(actor, 'attack').some((unit) => unit.uid === target.uid)) {
        return { ok: false, error: 'That enemy is protected by the front rank.', events };
      }
      this.phase = 'resolving';
      this.pendingWait = 'advance';
      this.lastAction = { actorId: actor.uid, action, targetId: target.uid };
      events.push({
        type: 'action',
        actorId: actor.uid,
        action,
        targetIds: [target.uid],
        label: `${actor.name} attacks ${target.name}`,
      });
      const roll = this.rollDamage(actor, target, {
        min: actor.damage[0],
        max: actor.damage[1],
        type: actor.damageType,
      });
      this.applyDamage(actor, target, roll, events);
      this.checkOutcome(events);
      if (this.outcome) this.phase = this.outcome;
      return { ok: true, events };
    }

    if (action === 'ability') {
      const ability = ABILITIES[options.abilityId];
      if (!ability || !actor.abilities.includes(ability.id)) {
        return { ok: false, error: 'That ability is not available.', events };
      }
      const cd = this.abilityCooldown(actor, ability.id);
      if (cd > 0) return { ok: false, error: `${ability.name} is ready in ${cd} rounds.`, events };
      const valid = this.abilityValidTargets(actor, ability);
      if (this.abilityNeedsTarget(ability) && valid.length === 0) {
        return { ok: false, error: 'No valid target.', events };
      }
      let targets = [];
      if (this.abilityNeedsTarget(ability)) {
        const target = this.getUnit(options.targetId);
        if (!target || !valid.some((unit) => unit.uid === target.uid)) {
          return { ok: false, error: 'Choose a valid target for this ability.', events };
        }
        targets = [target];
      } else {
        targets = valid;
      }

      this.phase = 'resolving';
      this.pendingWait = 'advance';
      this.lastAction = {
        actorId: actor.uid,
        action,
        abilityId: ability.id,
        targetIds: targets.map((unit) => unit.uid),
      };
      actor.cooldowns[ability.id] = ability.cooldown;
      events.push({
        type: 'action',
        actorId: actor.uid,
        action,
        abilityId: ability.id,
        targetIds: targets.map((unit) => unit.uid),
        label: `${actor.name} uses ${ability.name}`,
      });

      if (ability.kind === 'damage') {
        let drained = 0;
        for (const target of targets) {
          if (!target.alive) continue;
          const roll = this.rollDamage(actor, target, {
            min: ability.damage[0],
            max: ability.damage[1],
            type: ability.damageType,
            armorPierce: ability.armorPierce || 0,
            canCrit: true,
            bonusVs: ability.bonusVs,
            bonusAmount: ability.bonusAmount,
          });
          this.applyDamage(actor, target, roll, events, {
            status: ability.status,
            drain: 0,
          });
          drained += roll.amount;
        }
        if (ability.drain && drained > 0 && actor.alive) {
          this.healUnit(actor, Math.max(1, Math.round(drained * ability.drain)), events, 'drain');
        }
      } else if (ability.kind === 'heal') {
        for (const target of targets) {
          const amount = this.rng.int(ability.heal[0], ability.heal[1]);
          const healed = this.healUnit(target, amount, events);
          this.addLog(events, `${actor.name} restores ${healed} health to ${target.name}.`, 'good');
        }
      } else if (ability.kind === 'buff') {
        for (const target of targets) {
          this.applyStatus(target, ability.status, events, actor);
        }
        this.addLog(events, `${actor.name} ${ability.log}.`, 'good');
      } else if (ability.kind === 'debuff') {
        for (const target of targets) {
          this.applyStatus(target, ability.status, events, actor);
        }
        this.addLog(events, `${actor.name} ${ability.log} ${targets.map((unit) => unit.name).join(', ')}.`, 'good');
      }

      this.checkOutcome(events);
      if (this.outcome) this.phase = this.outcome;
      return { ok: true, events };
    }

    if (action === 'defend') {
      this.phase = 'resolving';
      this.pendingWait = 'advance';
      this.applyStatus(actor, { id: 'guard', turns: 1 }, events, actor);
      this.lastAction = { actorId: actor.uid, action, targetIds: [] };
      events.push({ type: 'action', actorId: actor.uid, action, targetIds: [], label: `${actor.name} defends` });
      this.addLog(events, `${actor.name} raises a guard.`, 'neutral');
      return { ok: true, events };
    }

    if (action === 'wait') {
      if (actor.waitedThisRound) return { ok: false, error: 'This unit already waited this round.', events };
      actor.waitedThisRound = true;
      const othersAfter = this.order
        .slice(this.turnIndex + 1)
        .filter((unit) => unit.alive);
      if (othersAfter.length === 0) {
        this.pendingWait = 'roundEnd';
      } else {
        this.pendingWait = 'stay';
        this.order.splice(this.turnIndex, 1);
        this.order.push(actor);
      }
      this.phase = 'resolving';
      this.lastAction = { actorId: actor.uid, action, targetIds: [] };
      events.push({ type: 'action', actorId: actor.uid, action, targetIds: [], label: `${actor.name} waits` });
      this.addLog(events, `${actor.name} waits for a better moment.`, 'neutral');
      return { ok: true, events };
    }

    if (action === 'shift') {
      const dest = this.shiftDestination(actor);
      if (!dest) return { ok: false, error: 'No free slot in the other row.', events };
      const from = actor.slot;
      actor.slot = dest;
      actor.rank = dest[0];
      actor.col = Number(dest[1]);
      this.pendingWait = 'advance';
      this.phase = 'resolving';
      this.lastAction = { actorId: actor.uid, action, targetIds: [] };
      events.push({
        type: 'shift',
        unitId: actor.uid,
        from,
        to: dest,
        label: `${actor.name} moves to the ${rankName(actor.rank)} rank`,
      });
      this.addLog(events, `${actor.name} changes to the ${rankName(actor.rank)} rank.`, 'neutral');
      return { ok: true, events };
    }

    return { ok: false, error: 'Unknown action.', events };
  }

  finishTurn() {
    const events = [];
    if (this.outcome) return events;
    const actor = this.actingUnit || this.currentUnit;
    if (!actor) return events;
    this.tickEndOfTurn(actor, events);
    if (this.pendingWait === 'stay') {
      // The actor was already moved to the end of the order; the next unit now occupies this index.
    } else if (this.pendingWait === 'roundEnd') {
      this.turnIndex = this.order.length;
    } else {
      this.turnIndex += 1;
    }
    this.pendingWait = 'advance';
    this.actingUnit = null;
    this.phase = 'resolving';
    this.beginTurn(events);
    return events;
  }

  // A compact, JSON-safe view used by tests, UI, and the browser inspection API.
  snapshot() {
    return {
      seed: this.seed,
      encounterId: this.encounter.id,
      round: this.round,
      phase: this.phase,
      outcome: this.outcome,
      turnIndex: this.turnIndex,
      activeUid: this.currentUnit?.uid || null,
      queue: this.order.filter((unit) => unit.alive).map((unit) => unit.uid),
      units: this.units.map((unit) => ({
        uid: unit.uid,
        id: unit.id,
        name: unit.name,
        side: unit.side,
        slot: unit.slot,
        rank: unit.rank,
        hp: unit.hp,
        maxHp: unit.maxHp,
        alive: unit.alive,
        level: unit.level,
        initiative: unit.initiative,
        statuses: Object.fromEntries(
          Object.entries(unit.statuses).map(([key, value]) => [key, value.amount ?? value.turns]),
        ),
        cooldowns: { ...unit.cooldowns },
        boss: unit.boss,
        range: unit.range,
      })),
      log: this.log.slice(-8),
      stats: { ...this.stats },
    };
  }
}

Object.assign(exports, { Battle });

  });

  // ---- js/battle/ai.js -------------------------------------------------
  __define("js/battle/ai.js", function (module, exports, __require) {
// Enemy decision-making. Uses only public battle state and the same action rules as the player.

const { ABILITIES } = __require("js/battle/data.js");

const PRIORITY_ROLE = {
  Priest: 34,
  Pyromancer: 28,
  Ranger: 20,
  Warden: 10,
  Shieldbearer: 6,
};

function livingAllies(battle, unit) {
  return battle.units.filter((other) => other.side === unit.side && other.alive);
}

function livingEnemies(battle, unit) {
  return battle.units.filter((other) => other.side !== unit.side && other.alive);
}

function lowHpAlly(battle, unit, threshold = 0.65) {
  return livingAllies(battle, unit)
    .filter((ally) => ally.hp / ally.maxHp < threshold)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
}

function targetScore(battle, unit, target) {
  const missing = 1 - target.hp / target.maxHp;
  let score = missing * 42;
  score += PRIORITY_ROLE[target.role] || 4;
  if (target.rank === 'B') score += 7;
  if (target.statuses.guard) score -= 8;
  if (target.statuses.shield) score -= 4;
  if (target.hp <= 35) score += 18;
  return score;
}

function bestTarget(battle, unit, targets) {
  if (!targets.length) return null;
  // Roll the jitter once per candidate, then sort. Calling the RNG inside the
  // comparator made the ordering depend on sort internals and desynchronised
  // seeded replays.
  return targets
    .map((target) => ({ target, score: targetScore(battle, unit, target) + battle.rng.next() * 5 }))
    .sort((a, b) => b.score - a.score)[0].target;
}

function chooseEnemyAction(battle, unit) {
  if (!unit || !unit.alive) return null;

  const abilities = unit.abilities.map((id) => ({
    id,
    ability: ABILITIES[id],
    cooldown: battle.abilityCooldown(unit, id),
  }));

  // 1. Support: heal the most wounded ally.
  const wounded = lowHpAlly(battle, unit, 0.68);
  if (wounded) {
    const heal = abilities.find(
      (entry) => entry.cooldown <= 0 && entry.ability.kind === 'heal',
    );
    if (heal) {
      const targets = battle.getValidTargets(unit, 'ability', heal.id);
      const target = targets.find((ally) => ally.uid === wounded.uid) || wounded;
      if (target) {
        return { action: 'ability', abilityId: heal.id, targetId: target.uid };
      }
    }
  }

  // 2. Area damage when it hits at least two enemies.
  for (const entry of abilities) {
    if (entry.cooldown > 0 || entry.ability.kind !== 'damage') continue;
    if (!['frontEnemies', 'allEnemies'].includes(entry.ability.shape)) continue;
    const targets = battle.getValidTargets(unit, 'ability', entry.id);
    if (targets.length >= 2) {
      return { action: 'ability', abilityId: entry.id, targetId: null };
    }
  }

  // 3. Boss pressure: Terror the healer, Soul Rend when the party is clustered.
  const terror = abilities.find((entry) => entry.cooldown <= 0 && entry.id === 'terror');
  if (terror) {
    const targets = battle.getValidTargets(unit, 'ability', 'terror');
    const healer = targets.find((target) => target.role === 'Priest') || bestTarget(battle, unit, targets);
    if (healer) {
      return { action: 'ability', abilityId: 'terror', targetId: healer.uid };
    }
  }
  const soulRend = abilities.find((entry) => entry.cooldown <= 0 && entry.id === 'soul_rend');
  if (soulRend) {
    const targets = battle.getValidTargets(unit, 'ability', 'soul_rend');
    if (targets.length >= 2 && unit.hp / unit.maxHp < 0.85) {
      return { action: 'ability', abilityId: 'soul_rend', targetId: null };
    }
  }

  // 4. Debuff the most dangerous hero if it is not already weakened.
  for (const entry of abilities) {
    if (entry.cooldown > 0 || entry.ability.kind !== 'debuff') continue;
    const targets = battle
      .getValidTargets(unit, 'ability', entry.id)
      .filter((target) => !target.statuses.weaken);
    const target = bestTarget(battle, unit, targets);
    if (target) {
      return { action: 'ability', abilityId: entry.id, targetId: target.uid };
    }
  }

  // 5. Party buff on the opening round.
  for (const entry of abilities) {
    if (entry.cooldown > 0 || entry.ability.kind !== 'buff') continue;
    const targets = battle.getValidTargets(unit, 'ability', entry.id);
    if (targets.length && battle.round <= 1) {
      return { action: 'ability', abilityId: entry.id, targetId: null };
    }
  }

  // 6. Single-target abilities with status or heavy damage.
  for (const entry of abilities) {
    if (entry.cooldown > 0 || entry.ability.kind !== 'damage') continue;
    if (entry.ability.shape !== 'single') continue;
    const targets = battle.getValidTargets(unit, 'ability', entry.id);
    const target = bestTarget(battle, unit, targets);
    if (!target) continue;
    const isControl = entry.ability.status?.id === 'stun';
    const isPoison = entry.ability.status?.id === 'poison';
    if (isControl && target.role === 'Priest') {
      return { action: 'ability', abilityId: entry.id, targetId: target.uid };
    }
    if (isPoison && target.hp / target.maxHp > 0.45) {
      return { action: 'ability', abilityId: entry.id, targetId: target.uid };
    }
    if (entry.ability.damage?.[1] >= unit.damage[1] + 4 && battle.round % 2 === 0) {
      return { action: 'ability', abilityId: entry.id, targetId: target.uid };
    }
  }

  // 7. Basic attack.
  const attackTargets = battle.getValidTargets(unit, 'attack');
  const target = bestTarget(battle, unit, attackTargets);
  if (target) {
    return { action: 'attack', targetId: target.uid };
  }

  // 8. Nothing useful: guard if hurt, otherwise wait.
  if (unit.hp / unit.maxHp < 0.45) return { action: 'defend' };
  return { action: 'wait' };
}

Object.assign(exports, { chooseEnemyAction });

  });

  // ---- js/render/scene.js ----------------------------------------------
  __define("js/render/scene.js", function (module, exports, __require) {
// Canvas 2D battlefield renderer.
//
// Deliberately avoids WebGL: the prototype must open on any browser,
// including machines with hardware acceleration disabled. The battlefield is
// painted in a pseudo-perspective ("2.5D") style close to the Disciples II
// reference screenshots: a deep horizon, two ranks per side, large readable
// silhouettes, rim light, ground fog and projectile / spell effects.
//
// The renderer is presentation-only. It never mutates battle state.

const TAU = Math.PI * 2;

const THEMES = {
  ruins: {
    skyTop: '#0b0c12',
    skyMid: '#38281f',
    skyLow: '#a9663a',
    sun: '#ffb65e',
    sunX: 0.22,
    sunY: 0.3,
    groundTop: '#3b2a1d',
    groundMid: '#57402a',
    groundLow: '#17120e',
    groundLight: '#b98b55',
    fog: '#b88d5f',
    accent: '#e0a34a',
    ember: '#ff9a3c',
    mist: 'rgba(190,150,105,0.12)',
    props: 'ruins',
    ridge: '#0d0a09',
    wind: 1,
  },
  marsh: {
    skyTop: '#101712',
    skyMid: '#2e3b2c',
    skyLow: '#8d9a63',
    sun: '#d9e6a4',
    sunX: 0.74,
    sunY: 0.33,
    groundTop: '#33402e',
    groundMid: '#4c5a38',
    groundLow: '#151d16',
    groundLight: '#87906a',
    fog: '#a9b88c',
    accent: '#9bc24b',
    ember: '#b8e05a',
    mist: 'rgba(150,175,130,0.13)',
    props: 'marsh',
    ridge: '#101610',
    wind: 0.6,
  },
  cathedral: {
    skyTop: '#0d0d16',
    skyMid: '#2b2734',
    skyLow: '#75656a',
    sun: '#b9d9e3',
    sunX: 0.62,
    sunY: 0.3,
    groundTop: '#2f2e33',
    groundMid: '#46434a',
    groundLow: '#151519',
    groundLight: '#8a8580',
    fog: '#a7acb5',
    accent: '#8fe7d4',
    ember: '#8fe7d4',
    mist: 'rgba(160,175,190,0.1)',
    props: 'cathedral',
    ridge: '#0c0c13',
    wind: 0.35,
  },
};

const ART = {
  knight: {
    skin: '#a87c59', cloth: '#6f2525', metal: '#70777a', metalDark: '#2c3032',
    accent: '#d8b35c', weapon: 'sword', shield: true, cape: true, helmet: true,
  },
  shield: {
    skin: '#9c7453', cloth: '#2c4754', metal: '#666f74', metalDark: '#282e31',
    accent: '#c8a45a', weapon: 'hammer', shield: true, cape: false, helmet: true, bulky: true,
  },
  archer: {
    skin: '#9c7652', cloth: '#3d5534', metal: '#56634b', metalDark: '#20261c',
    accent: '#9bc24b', weapon: 'bow', shield: false, cape: true, hood: true,
  },
  mage: {
    skin: '#a67d5c', cloth: '#34263a', metal: '#63523c', metalDark: '#1d1723',
    accent: '#ff8a3c', weapon: 'staff', shield: false, cape: false, hood: true, glow: '#ff7a24',
  },
  priest: {
    skin: '#b08a6b', cloth: '#d8cdb2', metal: '#a88244', metalDark: '#403a2b',
    accent: '#ffe7a8', weapon: 'censer', shield: false, cape: false, hood: true, glow: '#ffe7a8',
  },
  brigand: {
    skin: '#956b4a', cloth: '#51351f', metal: '#5c5042', metalDark: '#241d16',
    accent: '#a85b3c', weapon: 'axe', shield: false, cape: false, hood: true,
  },
  crossbow: {
    skin: '#8f6b4e', cloth: '#272f33', metal: '#80878d', metalDark: '#202528',
    accent: '#9aa4ae', weapon: 'crossbow', shield: false, cape: false, hood: true,
  },
  ghoul: {
    skin: '#6d8066', cloth: '#374237', metal: '#4f594b', metalDark: '#181e18',
    accent: '#b7e05a', weapon: 'claws', shield: false, cape: false, hood: false, undead: true,
  },
  lurker: {
    skin: '#465c43', cloth: '#283427', metal: '#3b5034', metalDark: '#121a11',
    accent: '#c8e46a', weapon: 'claws', shield: false, cape: false, hood: false, beast: true,
    glow: '#b7e05a',
  },
  cultist: {
    skin: '#7c6a5b', cloth: '#421e23', metal: '#5e3f31', metalDark: '#1a0d0f',
    accent: '#d24c3d', weapon: 'staff', shield: false, cape: true, hood: true, glow: '#ff4a35',
  },
  skeleton: {
    skin: '#b8b09a', cloth: '#423f37', metal: '#615e53', metalDark: '#24221e',
    accent: '#8fe7d4', weapon: 'sword', shield: true, cape: false, helmet: true, undead: true,
  },
  adept: {
    skin: '#b3ab90', cloth: '#2a2734', metal: '#504958', metalDark: '#121116',
    accent: '#8fe7d4', weapon: 'staff', shield: false, cape: true, hood: true, undead: true,
    glow: '#8fe7d4',
  },
  king: {
    skin: '#b3ab90', cloth: '#1b1d24', metal: '#454a54', metalDark: '#0c0d11',
    accent: '#8fe7d4', weapon: 'greatsword', shield: false, cape: true, helmet: true,
    undead: true, tall: true, glow: '#8fe7d4',
  },
};

const UNIT_HEIGHT = 154;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

function lcg(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const c = a.map((value, index) => Math.round(lerp(value, b[index], t)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function tone(color, amount) {
  return amount >= 0 ? mix(color, '#ffffff', amount) : mix(color, '#000000', -amount);
}

function colorFrom(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `#${value.toString(16).padStart(6, '0')}`;
  return '#ffd8a0';
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rotation, 0, TAU);
}

/* ------------------------------------------------------------------ */
/* Background painting                                                 */
/* ------------------------------------------------------------------ */

function paintSky(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  const gradient = ctx.createLinearGradient(0, 0, 0, horizon + H * 0.08);
  gradient.addColorStop(0, theme.skyTop);
  gradient.addColorStop(0.58, theme.skyMid);
  gradient.addColorStop(0.9, theme.skyLow);
  gradient.addColorStop(1, theme.skyLow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, horizon + H * 0.08);

  // A break in the clouds where the low sun burns through.
  const sunX = W * theme.sunX;
  const sunY = H * theme.sunY;
  const glow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, W * 0.42);
  glow.addColorStop(0, rgba(theme.sun, 0.65));
  glow.addColorStop(0.22, rgba(theme.sun, 0.22));
  glow.addColorStop(1, rgba(theme.sun, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, horizon + H * 0.1);

  // A few cold stars survive above the smoke.
  for (let i = 0; i < 26; i += 1) {
    const sx = rand() * W;
    const sy = rand() * H * 0.2;
    ctx.fillStyle = `rgba(220, 226, 235, ${0.08 + rand() * 0.28})`;
    ellipse(ctx, sx, sy, 0.5 + rand() * 0.8, 0.5 + rand() * 0.8);
    ctx.fill();
  }

  // Layered storm clouds: broad, soft, horizontal.
  for (let layer = 0; layer < 5; layer += 1) {
    const yBase = H * (0.02 + layer * 0.072);
    const alpha = 0.17 - layer * 0.018;
    for (let i = 0; i < 18; i += 1) {
      const x = rand() * W;
      const y = yBase + rand() * H * 0.065;
      const rx = W * (0.035 + rand() * 0.18);
      const ry = H * (0.006 + rand() * 0.032);
      const cloud = ctx.createLinearGradient(x, y - ry, x, y + ry);
      cloud.addColorStop(0, `rgba(5, 5, 8, ${alpha + 0.06})`);
      cloud.addColorStop(0.55, `rgba(25, 18, 17, ${alpha})`);
      cloud.addColorStop(1, 'rgba(30, 22, 20, 0)');
      ctx.fillStyle = cloud;
      ellipse(ctx, x, y, rx, ry);
      ctx.fill();
      // A thin lit rim under the densest banks.
      if (layer > 1 && rand() > 0.62) {
        ctx.strokeStyle = rgba(theme.sun, 0.05 + rand() * 0.06);
        ctx.lineWidth = Math.max(0.6, H * 0.0012);
        ctx.beginPath();
        ctx.ellipse(x, y + ry * 0.72, rx * 0.86, ry * 0.55, 0, 0, Math.PI);
        ctx.stroke();
      }
    }
  }

  // Low, torn cloud bank catching the last light near the horizon.
  for (let i = 0; i < 9; i += 1) {
    const cx = W * (0.02 + i * 0.12 + rand() * 0.05);
    const cy = H * (0.16 + rand() * 0.12);
    const rx = W * (0.07 + rand() * 0.1);
    const ry = H * (0.008 + rand() * 0.016);
    const bank = ctx.createLinearGradient(cx, cy - ry * 3, cx, cy + ry * 2);
    bank.addColorStop(0, 'rgba(118, 89, 64, 0.12)');
    bank.addColorStop(0.45, 'rgba(62, 46, 38, 0.22)');
    bank.addColorStop(1, 'rgba(20, 15, 14, 0)');
    ctx.fillStyle = bank;
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy + ry);
    ctx.quadraticCurveTo(cx - rx * 0.3, cy - ry * 2.4, cx + rx * 0.15, cy - ry);
    ctx.quadraticCurveTo(cx + rx * 0.55, cy - ry * 2.6, cx + rx, cy + ry * 0.2);
    ctx.quadraticCurveTo(cx + rx * 0.4, cy + ry * 1.6, cx - rx, cy + ry);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(190, 140, 92, 0.08)';
    ctx.lineWidth = Math.max(0.6, H * 0.0012);
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.75, cy - ry * 0.2);
    ctx.quadraticCurveTo(cx, cy - ry * 1.8, cx + rx * 0.8, cy - ry * 0.1);
    ctx.stroke();
  }

  // Thin hot band right above the horizon.
  const band = ctx.createLinearGradient(0, horizon - H * 0.12, 0, horizon + 2);
  band.addColorStop(0, rgba(theme.sun, 0));
  band.addColorStop(0.7, rgba(theme.sun, 0.16));
  band.addColorStop(1, rgba(theme.sun, 0.42));
  ctx.fillStyle = band;
  ctx.fillRect(0, horizon - H * 0.12, W, H * 0.12);
}

function silhouetteSpikes(ctx, W, H, theme, rand, baseY, scale = 1) {
  ctx.fillStyle = theme.ridge;
  const step = W * 0.032;
  for (let x = -step; x < W + step; x += step) {
    const height = H * (0.012 + rand() * 0.055) * scale;
    const width = step * (0.45 + rand() * 0.7);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + width * 0.18, baseY - height * 0.3);
    ctx.lineTo(x + width * 0.45, baseY - height);
    ctx.lineTo(x + width * 0.62, baseY - height * 0.5);
    ctx.lineTo(x + width, baseY - height * (0.08 + rand() * 0.35));
    ctx.lineTo(x + width, baseY);
    ctx.closePath();
    ctx.fill();
  }
  // A softer second ridge behind the hard silhouette.
  ctx.fillStyle = rgba(theme.ridge, 0.45);
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= W; x += W * 0.05) {
    ctx.lineTo(x, baseY - H * (0.005 + rand() * 0.035));
  }
  ctx.lineTo(W, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawTower(ctx, x, baseY, w, h, color, rand) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, baseY);
  ctx.lineTo(x - w * 0.34, baseY - h * 0.9);
  ctx.lineTo(x - w * 0.42, baseY - h);
  ctx.lineTo(x - w * 0.2, baseY - h * 0.97);
  ctx.lineTo(x - w * 0.12, baseY - h * 0.86);
  ctx.lineTo(x + w * 0.24, baseY - h * 0.93);
  ctx.lineTo(x + w * 0.34, baseY - h * 0.78);
  ctx.lineTo(x + w * 0.5, baseY);
  ctx.closePath();
  ctx.fill();
  // Broken window slits.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 4; i += 1) {
    const wx = x - w * 0.18 + rand() * w * 0.3;
    const wy = baseY - h * (0.25 + rand() * 0.5);
    ctx.fillRect(wx, wy, Math.max(1, w * 0.05), Math.max(2, h * 0.06));
  }
}

function drawDeadTree(ctx, x, baseY, height, color, rand, flip = 1) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.2, height * 0.028);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + height * 0.05 * flip, baseY - height * 0.5, x + height * 0.14 * flip, baseY - height);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    const t = 0.36 + i * 0.11;
    const bx = x + height * 0.14 * flip * t * t;
    const by = baseY - height * t;
    const len = height * (0.13 + rand() * 0.18);
    const angle = (i % 2 ? 1 : -1) * (0.45 + rand() * 0.7);
    ctx.lineWidth = Math.max(1, height * 0.015 * (1 - t * 0.5));
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(angle) * len * flip,
      by - Math.sin(angle) * len * 0.6,
      bx + Math.cos(angle) * len * 1.6 * flip,
      by - Math.sin(angle) * len * 1.1,
    );
    ctx.stroke();
    if (i % 2 === 0) {
      const ex = bx + Math.cos(angle) * len * 1.6 * flip;
      const ey = by - Math.sin(angle) * len * 1.1;
      ctx.lineWidth = Math.max(0.8, height * 0.008);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex + len * 0.35 * flip, ey - len * 0.35);
      ctx.stroke();
    }
  }
}

function paintHorizon(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  silhouetteSpikes(ctx, W, H, theme, rand, horizon + 4, 0.7);

  if (theme.props === 'ruins') {
    drawTower(ctx, W * 0.82, horizon + 6, W * 0.055, H * 0.2, theme.ridge, rand);
    drawTower(ctx, W * 0.14, horizon + 4, W * 0.035, H * 0.12, theme.ridge, rand);
    // Broken wall line.
    ctx.fillStyle = theme.ridge;
    ctx.fillRect(W * 0.3, horizon - H * 0.018, W * 0.12, H * 0.022);
    ctx.fillRect(W * 0.33, horizon - H * 0.04, W * 0.025, H * 0.042);
    drawDeadTree(ctx, W * 0.08, horizon + 2, H * 0.16, theme.ridge, rand, 1);
    drawDeadTree(ctx, W * 0.93, horizon + 2, H * 0.2, theme.ridge, rand, -1);
  } else if (theme.props === 'marsh') {
    drawDeadTree(ctx, W * 0.16, horizon + 4, H * 0.24, theme.ridge, rand, 1);
    drawDeadTree(ctx, W * 0.88, horizon + 4, H * 0.27, theme.ridge, rand, -1);
    drawDeadTree(ctx, W * 0.36, horizon + 2, H * 0.15, theme.ridge, rand, 1);
    // Drowned statue / shrine.
    ctx.fillStyle = theme.ridge;
    ctx.fillRect(W * 0.7, horizon - H * 0.06, W * 0.012, H * 0.06);
    ellipse(ctx, W * 0.706, horizon - H * 0.066, W * 0.009, H * 0.012);
    ctx.fill();
  } else {
    // Gothic cathedral: ribs and broken spires.
    for (let i = 0; i < 5; i += 1) {
      const x = W * (0.08 + i * 0.21);
      const h = H * (0.16 + rand() * 0.15);
      drawTower(ctx, x, horizon + 5, W * 0.035, h, theme.ridge, rand);
      ctx.strokeStyle = theme.ridge;
      ctx.lineWidth = Math.max(1, W * 0.0016);
      ctx.beginPath();
      ctx.moveTo(x, horizon - h);
      ctx.lineTo(x - W * 0.03, horizon - h * 0.55);
      ctx.moveTo(x, horizon - h);
      ctx.lineTo(x + W * 0.03, horizon - h * 0.55);
      ctx.stroke();
    }
    drawDeadTree(ctx, W * 0.04, horizon + 3, H * 0.18, theme.ridge, rand, 1);
    drawDeadTree(ctx, W * 0.96, horizon + 3, H * 0.2, theme.ridge, rand, -1);
  }

  // Ground haze where the horizon meets the field.
  const haze = ctx.createLinearGradient(0, horizon - H * 0.03, 0, horizon + H * 0.14);
  haze.addColorStop(0, rgba(theme.fog, 0));
  haze.addColorStop(0.45, rgba(theme.fog, 0.22));
  haze.addColorStop(1, rgba(theme.fog, 0));
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizon - H * 0.03, W, H * 0.17);
}

function paintGround(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  const bottom = H * 1.02;
  const gradient = ctx.createLinearGradient(0, horizon, 0, bottom);
  gradient.addColorStop(0, theme.groundTop);
  gradient.addColorStop(0.38, theme.groundMid);
  gradient.addColorStop(1, theme.groundLow);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(W, horizon);
  ctx.lineTo(W, bottom);
  ctx.lineTo(0, bottom);
  ctx.closePath();
  ctx.fill();

  // Perspective scatter: fine texture near the horizon, coarse stones near camera.
  for (let i = 0; i < 2400; i += 1) {
    const t = rand();
    const y = horizon + Math.pow(t, 1.45) * (bottom - horizon);
    const spread = 0.18 + Math.pow(t, 1.2);
    const x = W * 0.5 + (rand() - 0.5) * W * spread;
    const r = (0.5 + rand() * 2.2) * (0.35 + t * 2.6);
    ctx.fillStyle = rand() > 0.58
      ? `rgba(0,0,0,${0.03 + rand() * 0.09})`
      : rgba(theme.groundLight, 0.03 + rand() * 0.08);
    ellipse(ctx, x, y, r, r * (0.3 + rand() * 0.5));
    ctx.fill();
  }

  // Cracks radiating from the centre line, like the cracked earth in 1.jpg.
  ctx.strokeStyle = 'rgba(9, 7, 6, 0.55)';
  for (let i = 0; i < 42; i += 1) {
    const t = 0.1 + rand() * 0.9;
    const y = horizon + Math.pow(t, 1.35) * (bottom - horizon);
    let x = W * (0.2 + rand() * 0.6);
    ctx.lineWidth = (0.6 + rand() * 2.1) * (0.4 + t * 1.8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    let py = y;
    let px = x;
    for (let s = 0; s < 6; s += 1) {
      px += (rand() - 0.5) * W * 0.045 * (0.4 + t);
      py += (rand() - 0.25) * H * 0.014 * (0.4 + t);
      ctx.lineTo(px, py);
      if (s === 2 && rand() > 0.45) {
        ctx.moveTo(px, py);
        ctx.lineTo(px + (rand() - 0.5) * W * 0.03, py + rand() * H * 0.02);
        ctx.moveTo(px, py);
      }
    }
    ctx.stroke();
    // A pale lip along one side of the deepest cracks.
    if (t > 0.45) {
      ctx.strokeStyle = rgba(theme.groundLight, 0.07 + rand() * 0.05);
      ctx.lineWidth = Math.max(0.5, ctx.lineWidth * 0.5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(9, 7, 6, 0.55)';
    }
  }

  // Broad patches of ash and scorched earth break up the flat plane.
  for (let i = 0; i < 22; i += 1) {
    const t = 0.2 + rand() * 0.78;
    const y = horizon + Math.pow(t, 1.25) * (bottom - horizon);
    const x = W * 0.5 + (rand() - 0.5) * W * (0.3 + t * 0.9);
    const rx = W * (0.03 + rand() * 0.11) * (0.4 + t);
    const ry = rx * (0.12 + rand() * 0.16);
    const patch = ctx.createRadialGradient(x, y, 1, x, y, rx);
    const dark = rand() > 0.45;
    patch.addColorStop(0, dark ? 'rgba(8, 7, 6, 0.28)' : rgba(theme.groundLight, 0.14));
    patch.addColorStop(1, 'rgba(10, 8, 6, 0)');
    ctx.fillStyle = patch;
    ellipse(ctx, x, y, rx, ry);
    ctx.fill();
  }

  // Scattered bones and broken masonry in the near field.
  for (let i = 0; i < 26; i += 1) {
    const t = 0.45 + rand() * 0.5;
    const y = horizon + Math.pow(t, 1.15) * (bottom - horizon);
    const x = W * 0.5 + (rand() - 0.5) * W * (0.5 + t * 1.1);
    const len = (4 + rand() * 13) * (0.4 + t);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rand() - 0.5) * 0.8);
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(190, 177, 146, 0.28)' : 'rgba(62, 52, 40, 0.55)';
    ctx.lineWidth = Math.max(1, len * 0.18);
    ctx.beginPath();
    ctx.moveTo(-len * 0.5, 0);
    ctx.lineTo(len * 0.5, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(190, 177, 146, 0.24)';
    ellipse(ctx, -len * 0.5, 0, len * 0.12, len * 0.1);
    ellipse(ctx, len * 0.5, 0, len * 0.12, len * 0.1);
    ctx.fill();
    ctx.restore();
  }

  // Larger rocks and debris.
  for (let i = 0; i < 90; i += 1) {
    const t = 0.18 + rand() * 0.8;
    const y = horizon + Math.pow(t, 1.25) * (bottom - horizon);
    const spread = 0.22 + t;
    const x = W * 0.5 + (rand() - 0.5) * W * spread;
    const size = (2 + rand() * 11) * (0.3 + t * 1.6);
    ctx.fillStyle = `rgba(20, 16, 13, ${0.22 + rand() * 0.25})`;
    ellipse(ctx, x, y, size, size * 0.34, (rand() - 0.5) * 0.4);
    ctx.fill();
    ctx.fillStyle = rgba(theme.groundLight, 0.16 + rand() * 0.14);
    ellipse(ctx, x - size * 0.15, y - size * 0.13, size * 0.6, size * 0.16);
    ctx.fill();
  }

  if (theme.props === 'marsh') {
    for (const [x, y, rx, ry] of [
      [0.22, 0.88, 0.18, 0.035],
      [0.78, 0.8, 0.2, 0.03],
      [0.52, 0.97, 0.24, 0.04],
    ]) {
      const pool = ctx.createRadialGradient(W * x, H * y, 1, W * x, H * y, W * rx);
      pool.addColorStop(0, 'rgba(35, 54, 47, 0.62)');
      pool.addColorStop(1, 'rgba(20, 30, 25, 0)');
      ctx.fillStyle = pool;
      ellipse(ctx, W * x, H * y, W * rx, H * ry);
      ctx.fill();
    }
  }
}

function paintProps(ctx, W, H, theme, rand) {
  const horizon = H * 0.36;
  const ridge = theme.ridge;
  if (theme.props === 'ruins') {
    // Foreground ruined wall on the far left, out of the formation's way.
    ctx.fillStyle = 'rgba(46, 38, 29, 0.95)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.92);
    ctx.lineTo(0, H * 0.5);
    ctx.lineTo(W * 0.05, H * 0.47);
    ctx.lineTo(W * 0.085, H * 0.56);
    ctx.lineTo(W * 0.07, H * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(90, 74, 54, 0.28)';
    ctx.fillRect(W * 0.012, H * 0.51, W * 0.008, H * 0.3);

    // A brazier / fire pillar near the left edge, echoing the reference fires.
    const fireX = W * 0.08;
    const fireY = H * 0.62;
    const glow = ctx.createRadialGradient(fireX, fireY, 2, fireX, fireY, W * 0.09);
    glow.addColorStop(0, rgba(theme.ember, 0.28));
    glow.addColorStop(1, rgba(theme.ember, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(fireX - W * 0.09, fireY - W * 0.09, W * 0.18, W * 0.18);
    for (let i = 0; i < 7; i += 1) {
      ctx.fillStyle = rgba(i % 2 ? '#ffd27a' : theme.ember, 0.2 + rand() * 0.25);
      ellipse(ctx, fireX + (rand() - 0.5) * W * 0.022, fireY - rand() * H * 0.1, W * 0.006, H * 0.03);
      ctx.fill();
    }

    // Fallen column on the right.
    ctx.save();
    ctx.translate(W * 0.9, H * 0.74);
    ctx.rotate(-0.18);
    ctx.fillStyle = 'rgba(55, 45, 34, 0.95)';
    roundRect(ctx, -W * 0.02, -H * 0.015, W * 0.14, H * 0.03, H * 0.01);
    ctx.fill();
    ctx.fillStyle = 'rgba(120, 98, 68, 0.25)';
    ctx.fillRect(-W * 0.02, -H * 0.015, W * 0.14, H * 0.006);
    ctx.restore();

    // Cursed soul-fire: the green flame from the reference field.
    for (const [fx, fy, scale] of [
      [W * 0.115, H * 0.665, 1],
      [W * 0.905, H * 0.7, 0.62],
    ]) {
      const glow = ctx.createRadialGradient(fx, fy, 2, fx, fy, W * 0.1 * scale);
      glow.addColorStop(0, 'rgba(150, 255, 120, 0.22)');
      glow.addColorStop(0.35, 'rgba(70, 200, 80, 0.09)');
      glow.addColorStop(1, 'rgba(40, 120, 60, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(fx - W * 0.1 * scale, fy - W * 0.1 * scale, W * 0.2 * scale, W * 0.2 * scale);
      for (let i = 0; i < 6; i += 1) {
        const h = H * (0.055 + rand() * 0.12) * scale;
        const sway = (rand() - 0.5) * W * 0.028 * scale;
        const base = W * (0.003 + rand() * 0.004) * scale;
        ctx.fillStyle = rgba(i % 3 === 0 ? '#d8ffa0' : i % 2 ? '#7be05c' : '#2f9d46', 0.12 + rand() * 0.16);
        ctx.beginPath();
        ctx.moveTo(fx - base + (rand() - 0.5) * base, fy);
        ctx.quadraticCurveTo(fx + sway * 0.4, fy - h * 0.55, fx + sway, fy - h);
        ctx.quadraticCurveTo(fx + sway * 0.15 + base, fy - h * 0.5, fx + base + (rand() - 0.5) * base, fy);
        ctx.closePath();
        ctx.fill();
      }
      // Charred brazier bowl.
      ctx.fillStyle = 'rgba(20, 17, 14, 0.95)';
      ellipse(ctx, fx, fy + 3, W * 0.016 * scale, H * 0.008 * scale);
      ctx.fill();
    }
  } else if (theme.props === 'marsh') {
    ctx.strokeStyle = 'rgba(72, 88, 50, 0.8)';
    ctx.lineWidth = Math.max(1, W * 0.0015);
    for (let cluster = 0; cluster < 5; cluster += 1) {
      const bx = W * (0.06 + rand() * 0.88);
      const by = H * (0.72 + rand() * 0.24);
      for (let i = 0; i < 9; i += 1) {
        const h = H * (0.035 + rand() * 0.09);
        ctx.beginPath();
        ctx.moveTo(bx + (rand() - 0.5) * W * 0.03, by);
        ctx.quadraticCurveTo(bx + (rand() - 0.5) * W * 0.04, by - h * 0.6, bx + (rand() - 0.5) * W * 0.05, by - h);
        ctx.stroke();
      }
    }
    // Drowned statue on the right.
    ctx.fillStyle = 'rgba(58, 68, 54, 0.9)';
    ctx.fillRect(W * 0.9, H * 0.5, W * 0.018, H * 0.18);
    ellipse(ctx, W * 0.909, H * 0.49, W * 0.012, H * 0.018);
    ctx.fill();
  } else {
    // Bone ribs framing the cathedral arena.
    ctx.strokeStyle = 'rgba(164, 156, 133, 0.24)';
    ctx.lineWidth = Math.max(2, W * 0.0035);
    for (const side of [-1, 1]) {
      const x = W * (side < 0 ? 0.05 : 0.95);
      ctx.beginPath();
      ctx.moveTo(x, H * 0.98);
      ctx.quadraticCurveTo(x + side * W * 0.03, H * 0.55, x + side * W * 0.09, H * 0.34);
      ctx.stroke();
      for (let i = 0; i < 5; i += 1) {
        const t = 0.32 + i * 0.12;
        const bx = x + side * W * 0.03 * t;
        const by = H * (0.98 - t * 0.62);
        ctx.lineWidth = Math.max(1, W * 0.0016);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + side * W * 0.045, by - H * 0.025, bx + side * W * 0.07, by - H * 0.055);
        ctx.stroke();
      }
    }
    // Candelabra glow.
    for (const x of [W * 0.18, W * 0.82]) {
      const y = H * 0.6;
      const glow = ctx.createRadialGradient(x, y, 1, x, y, W * 0.055);
      glow.addColorStop(0, rgba(theme.ember, 0.22));
      glow.addColorStop(1, rgba(theme.ember, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(x - W * 0.055, y - W * 0.055, W * 0.11, W * 0.11);
    }
  }

  // Bottom foreground rubble, kept dark so UI medallions sit on it cleanly.
  const bottomShade = ctx.createLinearGradient(0, H * 0.86, 0, H);
  bottomShade.addColorStop(0, 'rgba(6, 5, 4, 0)');
  bottomShade.addColorStop(1, 'rgba(6, 5, 4, 0.62)');
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, H * 0.86, W, H * 0.14);

  // Horizon ridge silhouette sits in front of the ground haze but behind units.
  ctx.fillStyle = 'rgba(10, 8, 8, 0.35)';
  ctx.fillRect(0, horizon - 2, W, 3);
}

function paintBackground(W, H, theme, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(W));
  canvas.height = Math.max(1, Math.round(H));
  const ctx = canvas.getContext('2d');
  const rand = lcg(seed);
  paintSky(ctx, W, H, theme, rand);
  paintHorizon(ctx, W, H, theme, rand);
  paintGround(ctx, W, H, theme, rand);
  paintProps(ctx, W, H, theme, rand);
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Unit sprites                                                        */
/* ------------------------------------------------------------------ */

function drawShadow(ctx, scale, width = 34) {
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, width * scale);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.25)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ellipse(ctx, 0, 2, width * scale, width * scale * 0.3);
  ctx.fill();
}

function drawHumanoid(ctx, unit, art, pose) {
  const dir = pose.dir;
  const h = UNIT_HEIGHT;
  const breathe = pose.breathe;
  const swing = pose.swing;
  const cast = pose.cast;
  const guard = pose.guard;
  const bulky = art.bulky ? 1.15 : 1;
  const tall = art.tall ? 1.22 : 1;
  const skin = art.skin;
  const cloth = art.cloth;
  const metal = art.metal;
  const dark = art.metalDark;
  const accent = art.accent;
  const undead = art.undead;

  ctx.save();
  ctx.translate(0, breathe);
  ctx.scale(dir, 1);

  // Cape / cloak mass behind the body.
  if (art.cape) {
    const cape = ctx.createLinearGradient(-8, -h * 0.72, 10, 0);
    cape.addColorStop(0, tone(cloth, 0.05));
    cape.addColorStop(0.55, cloth);
    cape.addColorStop(1, '#0b0807');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-10 * bulky, -h * 0.66);
    ctx.quadraticCurveTo(-26 * bulky, -h * 0.38, -20 * bulky, -h * 0.02);
    ctx.lineTo(6 * bulky, -h * 0.05);
    ctx.quadraticCurveTo(14 * bulky, -h * 0.4, 9 * bulky, -h * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.16);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Legs.
  const legTop = -h * 0.36;
  const legW = 7 * bulky;
  const stride = pose.walk ? Math.sin(pose.walkPhase) * 6 : 0;
  for (const side of [-1, 1]) {
    const x = side * 6 * bulky + (side < 0 ? stride : -stride) * 0.4;
    const legGrad = ctx.createLinearGradient(x, legTop, x, 0);
    legGrad.addColorStop(0, undead ? tone(skin, -0.2) : dark);
    legGrad.addColorStop(1, '#050505');
    ctx.fillStyle = legGrad;
    roundRect(ctx, x - legW / 2, legTop, legW, -legTop, 3);
    ctx.fill();
    // Boot.
    ctx.fillStyle = '#080706';
    roundRect(ctx, x - legW / 2 - 1, -5, legW + 3, 6, 3);
    ctx.fill();
    if (undead) {
      ctx.strokeStyle = rgba(skin, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 1, legTop + 5);
      ctx.lineTo(x + 1, -6);
      ctx.stroke();
    }
  }

  // Torso.
  const hipY = -h * 0.36;
  const shoulderY = -h * 0.68;
  const torsoW = 18 * bulky;
  const bodyGrad = ctx.createLinearGradient(-torsoW, shoulderY, torsoW, hipY);
  bodyGrad.addColorStop(0, undead ? tone(skin, -0.15) : tone(cloth, 0.18));
  bodyGrad.addColorStop(0.5, undead ? skin : metal);
  bodyGrad.addColorStop(1, dark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-torsoW * 0.7, hipY);
  ctx.quadraticCurveTo(-torsoW * 1.05, shoulderY + 10, -torsoW * 0.7, shoulderY);
  ctx.quadraticCurveTo(0, shoulderY - 5, torsoW * 0.7, shoulderY);
  ctx.quadraticCurveTo(torsoW * 1.05, shoulderY + 12, torsoW * 0.8, hipY);
  ctx.quadraticCurveTo(0, hipY + 8, -torsoW * 0.7, hipY);
  ctx.closePath();
  ctx.fill();

  // Belt.
  ctx.fillStyle = '#2a1d12';
  ctx.fillRect(-torsoW * 0.78, hipY - 7, torsoW * 1.58, 5);
  ctx.fillStyle = rgba(accent, 0.7);
  ctx.fillRect(-3, hipY - 8, 6, 7);

  // Chest highlight and rim.
  ctx.strokeStyle = rgba(accent, 0.4);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-torsoW * 0.5, shoulderY + 4);
  ctx.quadraticCurveTo(-torsoW * 0.2, shoulderY + 16, -torsoW * 0.45, hipY - 4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 236, 200, 0.22)';
  ctx.beginPath();
  ctx.moveTo(torsoW * 0.62, shoulderY + 3);
  ctx.quadraticCurveTo(torsoW * 0.82, shoulderY + 18, torsoW * 0.62, hipY - 3);
  ctx.stroke();

  // Shoulders / pauldrons.
  ctx.fillStyle = metal;
  for (const side of [-1, 1]) {
    ellipse(ctx, side * torsoW * 0.78, shoulderY + 5, 9 * bulky, 7 * bulky);
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Head and hood / helmet.
  const headY = -h * 0.79 + breathe * 0.5;
  const headR = art.tall ? 10 : 8.8;
  if (art.hood) {
    const hood = ctx.createLinearGradient(0, headY - 20, 0, headY + 12);
    hood.addColorStop(0, tone(cloth, 0.06));
    hood.addColorStop(1, dark);
    ctx.fillStyle = hood;
    ctx.beginPath();
    ctx.moveTo(-13, headY + 8);
    ctx.quadraticCurveTo(-15, headY - 16, 0, headY - 18);
    ctx.quadraticCurveTo(14, headY - 15, 13, headY + 8);
    ctx.quadraticCurveTo(6, headY + 16, 0, headY + 14);
    ctx.quadraticCurveTo(-7, headY + 16, -13, headY + 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = undead ? tone(skin, -0.08) : skin;
  ellipse(ctx, 1, headY + 2, headR, headR + 2);
  ctx.fill();
  // Face shadow deepens the eye sockets and keeps the head from reading as a
  // pale mask against the dark ground.
  ctx.fillStyle = 'rgba(8, 6, 5, 0.44)';
  ellipse(ctx, 4, headY + 5, headR * 0.8, headR * 0.92);
  ctx.fill();
  if (art.hood) {
    ctx.fillStyle = 'rgba(6, 5, 4, 0.46)';
    ctx.beginPath();
    ctx.moveTo(-10, headY - 4);
    ctx.quadraticCurveTo(0, headY - 14, 10, headY - 4);
    ctx.lineTo(8, headY + 1);
    ctx.quadraticCurveTo(0, headY - 5, -8, headY + 1);
    ctx.closePath();
    ctx.fill();
  }
  if (undead) {
    ctx.fillStyle = '#0b0b0b';
    ellipse(ctx, 4, headY, 7, 6);
    ctx.fill();
    ctx.fillStyle = art.glow || accent;
    ellipse(ctx, 2, headY - 1, 1.6, 1.6);
    ellipse(ctx, 7, headY - 1, 1.6, 1.6);
    ctx.fill();
  } else {
    // Eyes (a hint, not a cartoon face).
    ctx.fillStyle = '#17110d';
    ellipse(ctx, 3, headY - 1, 1.2, 1.6);
    ellipse(ctx, 7, headY - 1, 1.2, 1.6);
    ctx.fill();
    // Nose/jaw shadow.
    ctx.strokeStyle = 'rgba(30, 18, 12, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, headY + 4);
    ctx.lineTo(4, headY + 7);
    ctx.stroke();
  }

  if (art.helmet) {
    const helm = ctx.createLinearGradient(0, headY - 16, 0, headY + 10);
    helm.addColorStop(0, tone(metal, 0.3));
    helm.addColorStop(0.6, metal);
    helm.addColorStop(1, dark);
    ctx.fillStyle = helm;
    ctx.beginPath();
    ctx.moveTo(-12, headY + 4);
    ctx.quadraticCurveTo(-11, headY - 16, 2, headY - 16);
    ctx.quadraticCurveTo(14, headY - 12, 13, headY + 4);
    ctx.lineTo(9, headY + 7);
    ctx.lineTo(9, headY - 1);
    ctx.lineTo(4, headY + 1);
    ctx.lineTo(2, headY + 7);
    ctx.lineTo(-3, headY + 7);
    ctx.lineTo(-4, headY - 1);
    ctx.lineTo(-12, headY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    // Visor glow.
    ctx.fillStyle = rgba(art.glow || accent, 0.7);
    ctx.fillRect(5, headY - 1, 6, 1.6);
  }

  if (art.tall) {
    // Crown for the Hollow King.
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-12, headY - 16);
    ctx.lineTo(-9, headY - 28);
    ctx.lineTo(-4, headY - 20);
    ctx.lineTo(1, headY - 30);
    ctx.lineTo(5, headY - 20);
    ctx.lineTo(11, headY - 27);
    ctx.lineTo(12, headY - 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(accent, 0.35);
    ellipse(ctx, 1, headY - 22, 14, 4);
    ctx.fill();
  }

  // Arms. Back arm first, then weapon arm.
  const armY = shoulderY + 11;
  const armLen = h * 0.22;
  ctx.strokeStyle = undead ? tone(skin, -0.2) : tone(cloth, -0.1);
  ctx.lineCap = 'round';
  ctx.lineWidth = 7 * bulky;
  ctx.beginPath();
  ctx.moveTo(-torsoW * 0.6, armY);
  ctx.quadraticCurveTo(-torsoW * 1.25, armY + armLen * 0.45, -torsoW * 0.9, armY + armLen);
  ctx.stroke();

  if (art.shield) {
    // Shield on the forward arm.
    const shieldX = torsoW * 1.05;
    const shieldY = armY + 6 + (guard ? 4 : 0);
    ctx.save();
    ctx.translate(shieldX, shieldY);
    ctx.rotate(guard ? -0.18 : 0.05);
    const shieldGrad = ctx.createLinearGradient(-14, -24, 14, 24);
    shieldGrad.addColorStop(0, tone(metal, 0.22));
    shieldGrad.addColorStop(0.55, metal);
    shieldGrad.addColorStop(1, dark);
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.moveTo(-13, -22);
    ctx.quadraticCurveTo(0, -28, 13, -22);
    ctx.lineTo(11, 10);
    ctx.quadraticCurveTo(0, 24, -11, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.65);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = rgba(accent, 0.5);
    ellipse(ctx, 0, -4, 3, 3);
    ctx.fill();
    ctx.restore();
  }

  const armAngle = guard ? 0.5 : cast ? -1.1 : swing > 0 ? -1.4 + swing * 2.5 : 0.18;
  ctx.strokeStyle = undead ? tone(skin, -0.15) : tone(cloth, -0.18);
  ctx.lineWidth = 6.4 * bulky;
  ctx.beginPath();
  ctx.moveTo(torsoW * 0.58, armY);
  ctx.quadraticCurveTo(
    torsoW * 1.25,
    armY + Math.cos(armAngle) * armLen * 0.55,
    torsoW * 0.95 + Math.sin(armAngle) * armLen * 0.7,
    armY + Math.cos(armAngle) * armLen,
  );
  ctx.stroke();

  const handX = torsoW * 0.95 + Math.sin(armAngle) * armLen * 0.7;
  const handY = armY + Math.cos(armAngle) * armLen;
  ctx.fillStyle = undead ? tone(skin, -0.15) : skin;
  ellipse(ctx, handX, handY, 3.4, 3.1);
  ctx.fill();

  // Weapon.
  ctx.save();
  ctx.translate(handX, handY);
  if (art.weapon === 'sword' || art.weapon === 'greatsword') {
    const len = art.weapon === 'greatsword' ? 84 : 58;
    ctx.rotate(armAngle * 0.7 + (swing > 0 ? -1.2 + swing * 2.4 : -0.35));
    const blade = ctx.createLinearGradient(0, 0, 0, -len);
    blade.addColorStop(0, '#8d9297');
    blade.addColorStop(0.5, '#e6edf0');
    blade.addColorStop(1, '#aeb7bd');
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(-2.2, 0);
    ctx.lineTo(-1.4, -len);
    ctx.lineTo(0, -len - 6);
    ctx.lineTo(1.4, -len);
    ctx.lineTo(2.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(-4, -3, 8, 3);
    ctx.fillStyle = accent;
    ctx.fillRect(-1, -5, 2, 5);
  } else if (art.weapon === 'axe') {
    ctx.rotate(armAngle * 0.6 - 0.5);
    ctx.strokeStyle = '#4a3320';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -46);
    ctx.stroke();
    const axe = ctx.createLinearGradient(-16, -46, 16, -34);
    axe.addColorStop(0, tone(metal, -0.1));
    axe.addColorStop(0.6, tone(metal, 0.35));
    axe.addColorStop(1, dark);
    ctx.fillStyle = axe;
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.quadraticCurveTo(18, -48, 19, -34);
    ctx.quadraticCurveTo(10, -36, 0, -34);
    ctx.closePath();
    ctx.fill();
  } else if (art.weapon === 'hammer') {
    ctx.rotate(armAngle * 0.6 - 0.4);
    ctx.strokeStyle = '#47341e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -42);
    ctx.stroke();
    ctx.fillStyle = tone(metal, 0.12);
    roundRect(ctx, -13, -50, 26, 12, 3);
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (art.weapon === 'bow') {
    ctx.rotate(cast ? -0.4 : 0.1);
    ctx.strokeStyle = '#6a4a26';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(5, -6, 34, -1.15, 1.15);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235, 225, 195, 0.65)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(18, -36);
    ctx.lineTo(18, 24);
    ctx.stroke();
    // Arrow.
    ctx.strokeStyle = '#d8c8a0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(36, -6);
    ctx.stroke();
    ctx.fillStyle = '#c0b080';
    ctx.beginPath();
    ctx.moveTo(38, -6);
    ctx.lineTo(32, -9);
    ctx.lineTo(32, -3);
    ctx.closePath();
    ctx.fill();
  } else if (art.weapon === 'crossbow') {
    ctx.rotate(0);
    ctx.strokeStyle = '#5b4328';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.lineTo(26, -8);
    ctx.stroke();
    ctx.strokeStyle = art.metal;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(18, -22);
    ctx.quadraticCurveTo(28, -8, 18, 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(230,230,220,0.55)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(18, -22);
    ctx.lineTo(18, 6);
    ctx.stroke();
  } else if (art.weapon === 'staff') {
    ctx.rotate(-0.12);
    ctx.strokeStyle = '#4a3320';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(0, -56);
    ctx.stroke();
    const orbY = -60;
    const orb = ctx.createRadialGradient(0, orbY, 0, 0, orbY, 13);
    orb.addColorStop(0, '#fff6d8');
    orb.addColorStop(0.3, art.glow || accent);
    orb.addColorStop(1, rgba(art.glow || accent, 0));
    ctx.fillStyle = orb;
    ellipse(ctx, 0, orbY, 14, 14);
    ctx.fill();
  } else if (art.weapon === 'censer') {
    ctx.rotate(0.08 + (cast ? -0.4 : 0));
    ctx.strokeStyle = '#a88a52';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(12, 24, 4, 38);
    ctx.stroke();
    const glow = ctx.createRadialGradient(4, 40, 0, 4, 40, 16);
    glow.addColorStop(0, 'rgba(255, 244, 200, 0.9)');
    glow.addColorStop(0.35, rgba(art.glow || accent, 0.55));
    glow.addColorStop(1, rgba(art.glow || accent, 0));
    ctx.fillStyle = glow;
    ellipse(ctx, 4, 40, 16, 16);
    ctx.fill();
    ctx.fillStyle = art.metal;
    ellipse(ctx, 4, 40, 4, 4);
    ctx.fill();
  } else if (art.weapon === 'claws') {
    ctx.rotate(0);
    ctx.strokeStyle = tone(skin, 0.25);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(2, -4 + i * 3);
      ctx.quadraticCurveTo(14, -8 + i * 3, 20, -2 + i * 3);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Weapon glow for casters.
  if (cast && (art.weapon === 'staff' || art.weapon === 'censer')) {
    const glow = ctx.createRadialGradient(handX + 4, handY - 40, 0, handX + 4, handY - 40, 38);
    glow.addColorStop(0, rgba(art.glow || accent, 0.38));
    glow.addColorStop(1, rgba(art.glow || accent, 0));
    ctx.fillStyle = glow;
    ellipse(ctx, handX + 4, handY - 40, 38, 38);
    ctx.fill();
  }

  // Rim light: a thin bright edge on the light side.
  ctx.strokeStyle = 'rgba(255, 226, 170, 0.28)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(torsoW * 0.65, shoulderY + 2);
  ctx.quadraticCurveTo(torsoW * 0.9, shoulderY + 20, torsoW * 0.6, hipY);
  ctx.stroke();

  ctx.restore();
}

function drawBeast(ctx, unit, art, pose) {
  const dir = pose.dir;
  const breathe = pose.breathe;
  const swing = pose.swing;
  ctx.save();
  ctx.translate(0, breathe);
  ctx.scale(dir, 1);
  const h = UNIT_HEIGHT;

  // Massive hunched body: four legs, long arms, tendrils.
  ctx.fillStyle = '#101510';
  for (const [lx, ly, lw] of [[-26, -8, 9], [-12, -4, 8], [18, -6, 9], [30, -10, 8]]) {
    roundRect(ctx, lx, ly, lw, 42, 4);
    ctx.fill();
  }
  const body = ctx.createLinearGradient(-36, -h * 0.66, 24, -h * 0.3);
  body.addColorStop(0, tone(art.skin, 0.18));
  body.addColorStop(0.48, art.skin);
  body.addColorStop(1, '#131a12');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-40, -h * 0.34);
  ctx.quadraticCurveTo(-52, -h * 0.62, -18, -h * 0.7);
  ctx.quadraticCurveTo(10, -h * 0.78, 32, -h * 0.58);
  ctx.quadraticCurveTo(46, -h * 0.4, 30, -h * 0.24);
  ctx.quadraticCurveTo(0, -h * 0.14, -40, -h * 0.34);
  ctx.closePath();
  ctx.fill();

  // Spines.
  ctx.fillStyle = tone(art.skin, -0.35);
  for (let i = 0; i < 6; i += 1) {
    const x = -30 + i * 12;
    const y = -h * (0.68 + Math.sin(i) * 0.03);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y - 16 - (i % 3) * 6);
    ctx.lineTo(x + 8, y);
    ctx.closePath();
    ctx.fill();
  }

  // Head / maw at the front.
  const headX = 34;
  const headY = -h * 0.55;
  ctx.fillStyle = tone(art.skin, 0.1);
  ellipse(ctx, headX, headY, 22, 17);
  ctx.fill();
  ctx.fillStyle = '#0d120c';
  ellipse(ctx, headX + 12, headY + 3, 13, 9);
  ctx.fill();
  ctx.fillStyle = '#e9f0c0';
  for (let i = 0; i < 4; i += 1) {
    const tx = headX + 4 + i * 5;
    ctx.beginPath();
    ctx.moveTo(tx, headY);
    ctx.lineTo(tx + 1.5, headY - 5);
    ctx.lineTo(tx + 3, headY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = art.glow || '#b7e05a';
  ellipse(ctx, headX + 4, headY - 7, 2.5, 2);
  ellipse(ctx, headX + 16, headY - 5, 2.5, 2);
  ctx.fill();
  // Tendrils / arms.
  ctx.strokeStyle = tone(art.skin, -0.25);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(16, -h * 0.42);
  ctx.quadraticCurveTo(38, -h * 0.28 + swing * 22, 46, -h * 0.16);
  ctx.stroke();
  ctx.strokeStyle = tone(art.skin, -0.12);
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-30 + i * 6, -h * 0.36);
    ctx.quadraticCurveTo(-46 - i * 6, -h * 0.2, -52 - i * 4, -h * 0.1 + i * 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawUnitSprite(ctx, unit, art, pose) {
  if (art.beast) drawBeast(ctx, unit, art, pose);
  else drawHumanoid(ctx, unit, art, pose);
}

/* ------------------------------------------------------------------ */
/* Effects                                                             */
/* ------------------------------------------------------------------ */

class CanvasEffects {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.maxItems = 220;
  }

  clear() {
    this.items = [];
  }

  add(item) {
    if (this.items.length >= this.maxItems) this.items.shift();
    this.items.push({ age: 0, life: 0.5, ...item });
  }

  update(dt) {
    for (const item of this.items) item.age += dt;
    this.items = this.items.filter((item) => item.age < item.life);
    for (const item of this.items) item.update?.(item.age, dt);
  }

  draw(ctx, time) {
    for (const item of this.items) {
      const t = clamp(item.age / item.life, 0, 1);
      item.draw?.(ctx, t, time, item);
    }
  }

  burst(x, y, color, count = 12, power = 1) {
    const c = colorFrom(color);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * TAU;
      const speed = (40 + Math.random() * 130) * power;
      const life = 0.35 + Math.random() * 0.45;
      this.add({
        type: 'spark',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: 260,
        size: 1.4 + Math.random() * 3,
        color: c,
        life,
        draw: (ctx2, p, now, item) => {
          const px = item.x + item.vx * item.age;
          const py = item.y + item.vy * item.age + item.gravity * item.age * item.age * 0.5;
          ctx2.globalAlpha = 1 - p;
          ctx2.fillStyle = item.color;
          ellipse(ctx2, px, py, item.size * (1 - p * 0.5), item.size * (1 - p * 0.5));
          ctx2.fill();
          ctx2.globalAlpha = 1;
        },
      });
    }
  }

  impact(position, type, crit = false) {
    if (!position) return;
    const color = colorFrom(this.scene.typeColor(type));
    const { x, y } = position;
    this.add({
      type: 'ring',
      x, y, color, life: crit ? 0.5 : 0.38,
      draw: (ctx, p) => {
        ctx.strokeStyle = rgba(color, 0.8 * (1 - p));
        ctx.lineWidth = (crit ? 4 : 2.4) * (1 - p) + 0.5;
        ellipse(ctx, x, y, 12 + p * (crit ? 78 : 52), (12 + p * (crit ? 78 : 52)) * 0.34);
        ctx.stroke();
      },
    });
    this.add({
      type: 'flash',
      x, y, color, life: crit ? 0.24 : 0.16,
      draw: (ctx, p) => {
        const r = (crit ? 58 : 38) * (0.6 + p * 0.7);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba('#fff8e8', 0.7 * (1 - p)));
        g.addColorStop(0.35, rgba(color, 0.32 * (1 - p)));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ellipse(ctx, x, y, r, r * 0.8);
        ctx.fill();
      },
    });
    this.burst(x, y, color, crit ? 20 : 10, crit ? 1.4 : 1);
    this.shards(x, y, color, crit ? 9 : 5, crit ? 1.5 : 1);
  }

  shards(x, y, color, count = 6, power = 1) {
    const c = colorFrom(color);
    for (let i = 0; i < count; i += 1) {
      const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
      const speed = (60 + Math.random() * 150) * power;
      this.add({
        type: 'shard',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 12,
        size: 2 + Math.random() * 5,
        color: c,
        life: 0.5 + Math.random() * 0.4,
        draw: (ctx2, p, now, item) => {
          const px = item.x + item.vx * item.age;
          const py = item.y + item.vy * item.age + 420 * item.age * item.age;
          ctx2.save();
          ctx2.translate(px, py);
          ctx2.rotate(item.rot + item.spin * item.age);
          ctx2.globalAlpha = 1 - p;
          ctx2.fillStyle = item.color;
          ctx2.beginPath();
          ctx2.moveTo(-item.size, -item.size * 0.4);
          ctx2.lineTo(item.size, 0);
          ctx2.lineTo(-item.size * 0.4, item.size * 0.45);
          ctx2.closePath();
          ctx2.fill();
          ctx2.restore();
          ctx2.globalAlpha = 1;
        },
      });
    }
  }

  projectile(from, to, color, kind = 'orb') {
    if (!from || !to) return;
    const c = colorFrom(color);
    const life = kind === 'arrow' ? 0.3 : 0.4;
    this.add({
      type: 'projectile',
      life,
      draw: (ctx, p) => {
        const x = from.x + (to.x - from.x) * Math.min(1, p * 1.15);
        const y = from.y + (to.y - from.y) * Math.min(1, p * 1.15);
        const dy = to.y - from.y;
        const dx = to.x - from.x;
        const angle = Math.atan2(dy, dx);
        if (kind === 'arrow') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.strokeStyle = '#d9c7a0';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(12, 0);
          ctx.stroke();
          ctx.fillStyle = '#e8dcc0';
          ctx.beginPath();
          ctx.moveTo(15, 0);
          ctx.lineTo(7, -4);
          ctx.lineTo(7, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          const g = ctx.createRadialGradient(x, y, 0, x, y, kind === 'orb' ? 22 : 16);
          g.addColorStop(0, 'rgba(255,255,255,0.95)');
          g.addColorStop(0.25, rgba(c, 0.9));
          g.addColorStop(1, rgba(c, 0));
          ctx.fillStyle = g;
          ellipse(ctx, x, y, 22, 22);
          ctx.fill();
          // Trail.
          ctx.strokeStyle = rgba(c, 0.5);
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      },
    });
    // A soft launch puff.
    this.burst(from.x, from.y, c, 5, 0.6);
  }

  beam(from, to, color, width = 0.3) {
    if (!from || !to) return;
    const c = colorFrom(color);
    this.add({
      type: 'beam',
      life: 0.45,
      draw: (ctx, p) => {
        const alpha = Math.sin(Math.PI * Math.min(1, p * 1.2)) * 0.9;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const layers = [
          { w: width * 160 * (1 - p * 0.3), a: alpha * 0.2 },
          { w: width * 80 * (1 - p * 0.3), a: alpha * 0.45 },
          { w: width * 26 * (1 - p * 0.3), a: alpha * 0.9 },
        ];
        for (const layer of layers) {
          const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          grad.addColorStop(0, rgba(c, layer.a * 0.15));
          grad.addColorStop(0.75, rgba(c, layer.a));
          grad.addColorStop(1, rgba('#fff8e8', layer.a));
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(1, layer.w);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
        ctx.restore();
      },
    });
    this.burst(to.x, to.y, c, 12, 1.1);
  }

  spell(position, type) {
    if (!position) return;
    const color = colorFrom(type === 'holy' ? '#ffe7a8' : this.scene.typeColor(type));
    const { x, y } = position;
    this.add({
      type: 'rune',
      life: 0.8,
      draw: (ctx, p) => {
        const alpha = Math.sin(Math.PI * p) * 0.8;
        ctx.save();
        ctx.translate(x, y + 12);
        ctx.scale(1, 0.36);
        ctx.rotate(p * 2.4);
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 44 + p * 26, 0, TAU);
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 30 + p * 18, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < 6; i += 1) {
          const a = (i / 6) * TAU + p;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 34, Math.sin(a) * 34);
          ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
          ctx.stroke();
        }
        ctx.restore();
      },
    });
    this.burst(x, y, color, 16, 0.9);
    this.add({
      type: 'pillar',
      life: 0.6,
      draw: (ctx, p) => {
        const h = 150 * Math.sin(Math.PI * p);
        const g = ctx.createLinearGradient(x, y, x, y - h);
        g.addColorStop(0, rgba(color, 0.35 * (1 - p)));
        g.addColorStop(0.6, rgba(color, 0.12 * (1 - p)));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - 24, y - h, 48, h);
      },
    });
  }

  heal(position) {
    if (!position) return;
    const { x, y } = position;
    const color = '#b9e88a';
    this.add({
      type: 'healglow',
      life: 0.7,
      draw: (ctx, p) => {
        const r = 28 + p * 24;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255, 255, 220, ${0.5 * (1 - p)})`);
        g.addColorStop(0.35, rgba(color, 0.3 * (1 - p)));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ellipse(ctx, x, y, r, r * 1.2);
        ctx.fill();
      },
    });
    for (let i = 0; i < 16; i += 1) {
      const dx = (Math.random() - 0.5) * 50;
      const speed = 40 + Math.random() * 70;
      const life = 0.5 + Math.random() * 0.4;
      this.add({
        type: 'mote',
        fresh: true,
        life,
        draw: (ctx2, p, now, item) => {
          const px = x + dx + Math.sin(now * 3 + i) * 6;
          const py = y + 14 - speed * item.age;
          ctx2.globalAlpha = 1 - p;
          ctx2.fillStyle = i % 3 === 0 ? '#fff8ca' : color;
          ellipse(ctx2, px, py, 1.8 + (i % 2), 1.8 + (i % 2));
          ctx2.fill();
          ctx2.globalAlpha = 1;
        },
      });
    }
  }

  spirit(position) {
    if (!position) return;
    const { x, y } = position;
    const color = '#a8e7d4';
    this.add({
      type: 'spirit',
      life: 1.2,
      draw: (ctx, p) => {
        const py = y - p * 110;
        const px = x + Math.sin(p * 9) * 12;
        const alpha = (1 - p) * 0.8;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 20 + p * 10);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.3, rgba(color, alpha * 0.7));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ellipse(ctx, px, py, 20 + p * 10, 30 + p * 14);
        ctx.fill();
        ctx.strokeStyle = rgba(color, alpha * 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py + 18);
        ctx.quadraticCurveTo(px + Math.sin(p * 5) * 14, py + 40, px, py + 56);
        ctx.stroke();
      },
    });
  }

  ring(position, color, radius = 40) {
    if (!position) return;
    const c = colorFrom(color);
    this.add({
      type: 'ring',
      life: 0.45,
      draw: (ctx, p) => {
        ctx.strokeStyle = rgba(c, 0.7 * (1 - p));
        ctx.lineWidth = 3 * (1 - p) + 0.5;
        ellipse(ctx, position.x, position.y, radius + p * radius, (radius + p * radius) * 0.36);
        ctx.stroke();
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/* Unit view                                                           */
/* ------------------------------------------------------------------ */

class UnitView {
  constructor(scene, unit) {
    this.scene = scene;
    this.unit = unit;
    this.art = ART[unit.model] || ART.knight;
    this.phase = Math.random() * TAU;
    this.sx = 0;
    this.sy = 0;
    this.scale = 1;
    this.home = scene.slotScreen(unit);
    this.sx = this.home.x;
    this.sy = this.home.y;
    this.scale = this.home.scale;
    this.walkFrom = null;
    this.walkTo = null;
    this.walkT = 1;
    this.anim = null;
    this.hitTimer = 0;
    this.active = false;
    this.hover = false;
    this.targetValid = false;
    this.dead = false;
    this.deathT = 0;
    this.attackLunge = 0;
    this.targetX = this.home.x;
    this.targetY = this.home.y;
  }

  setSlot() {
    this.home = this.scene.slotScreen(this.unit);
    this.walkFrom = { x: this.sx, y: this.sy, scale: this.scale };
    this.walkTo = this.home;
    this.walkT = 0;
  }

  setActive(value) { this.active = value; }
  setHover(value) { this.hover = value; }
  setValidTarget(value) { this.targetValid = value; }

  playAction(action, targetView, abilityId = null) {
    this.anim = {
      type: action === 'ability' ? 'cast' : action,
      abilityId,
      duration: action === 'ability' ? 0.72 : action === 'attack' ? 0.55 : 0.45,
      t: 0,
      target: targetView ? { x: targetView.sx, y: targetView.sy } : null,
    };
  }

  playHit(crit = false) {
    this.hitTimer = crit ? 0.4 : 0.26;
    this.anim = null;
  }

  playDeath() {
    this.dead = true;
    this.deathT = 0;
    this.anim = null;
    const pos = this.scene.worldPosition(this.unit.uid);
    if (pos) this.scene.effects.spirit(pos);
  }

  update(dt, time) {
    if (this.dead) {
      this.deathT += dt;
      return;
    }
    if (this.walkT < 1 && this.walkFrom && this.walkTo) {
      this.walkT = Math.min(1, this.walkT + dt * 1.9);
      const e = this.walkT * this.walkT * (3 - 2 * this.walkT);
      this.sx = lerp(this.walkFrom.x, this.walkTo.x, e);
      this.sy = lerp(this.walkFrom.y, this.walkTo.y, e);
      this.scale = lerp(this.walkFrom.scale, this.walkTo.scale, e);
    } else {
      this.home = this.scene.slotScreen(this.unit);
      this.sx = lerp(this.sx, this.home.x, Math.min(1, dt * 10));
      this.sy = lerp(this.sy, this.home.y, Math.min(1, dt * 10));
      this.scale = lerp(this.scale, this.home.scale, Math.min(1, dt * 10));
    }

    this.attackLunge *= Math.pow(0.003, dt);
    if (this.anim) {
      this.anim.t += dt;
      if (this.anim.t >= this.anim.duration) this.anim = null;
    }
    if (this.hitTimer > 0) this.hitTimer = Math.max(0, this.hitTimer - dt);
  }

  bodyTop() {
    return this.sy - UNIT_HEIGHT * this.scale * 1.02;
  }

  hitTest(x, y) {
    const s = this.scale * this.scene.sizeK;
    const halfW = 34 * s;
    return x > this.sx - halfW && x < this.sx + halfW
      && y > this.sy - UNIT_HEIGHT * s * 1.05 && y < this.sy + 10 * s;
  }

  draw(ctx, time) {
    const scale = this.scale * this.scene.sizeK;
    const dir = this.unit.side === 'ally' ? 1 : -1;
    const bob = Math.sin(time * 1.7 + this.phase) * 1.4;
    let lunge = 0;
    let swing = 0;
    let cast = 0;
    let guard = 0;
    let walk = this.walkT < 1;
    let walkPhase = time * 11;

    if (this.anim) {
      const p = clamp(this.anim.t / this.anim.duration, 0, 1);
      const thrust = Math.sin(Math.PI * Math.min(1, p * 1.25));
      if (this.anim.type === 'attack') {
        lunge = thrust * 20;
        swing = thrust;
      } else if (this.anim.type === 'cast') {
        cast = Math.sin(Math.PI * p);
        lunge = -4 * cast;
      } else if (this.anim.type === 'defend') {
        guard = Math.sin(Math.PI * p);
      }
    }

    ctx.save();
    ctx.translate(this.sx + dir * lunge, this.sy);
    const deathP = this.dead ? clamp(this.deathT / 0.9, 0, 1) : 0;
    if (this.dead) {
      ctx.globalAlpha = Math.max(0, 1 - deathP);
      ctx.rotate(-dir * deathP * 0.9);
      ctx.translate(0, deathP * 10);
    }
    ctx.scale(scale, scale);

    // Shadow stays on the ground even while the body falls.
    if (!this.dead) drawShadow(ctx, 1, this.art.beast ? 46 : 34);

    // Active / target rings on the ground.
    if (this.active || this.hover || this.targetValid) {
      const color = this.targetValid ? '#d8574a' : this.active ? '#e0b34a' : '#f2e6c4';
      const alpha = this.targetValid ? 0.62 : this.active ? 0.55 + Math.sin(time * 3) * 0.16 : 0.5;
      ctx.save();
      ctx.scale(1, 0.34);
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = 2.4 / Math.max(0.2, this.scale);
      ctx.beginPath();
      ctx.arc(0, 2, (this.art.beast ? 54 : 38) / Math.max(0.2, this.scale), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Contact glow for active unit.
    if (this.active && !this.dead) {
      const g = ctx.createRadialGradient(0, -10, 2, 0, -10, 80);
      g.addColorStop(0, 'rgba(224, 179, 74, 0.16)');
      g.addColorStop(1, 'rgba(224, 179, 74, 0)');
      ctx.fillStyle = g;
      ellipse(ctx, 0, -10, 80, 34);
      ctx.fill();
    }

    if (this.hitTimer > 0) {
      const k = this.hitTimer / 0.4;
      ctx.shadowColor = '#ff7a5a';
      ctx.shadowBlur = 22 * k;
    } else {
      // A soft dark halo separates the silhouette from the painted ground.
      ctx.shadowColor = 'rgba(0,0,0,0.78)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
    }

    drawUnitSprite(ctx, this.unit, this.art, {
      dir,
      breathe: bob,
      swing,
      cast,
      guard,
      walk,
      walkPhase,
    });

    ctx.shadowBlur = 0;
    ctx.restore();

    // HP bar above the unit, only when damaged or inspected.
    if (!this.dead && (this.active || this.hover || this.unit.hp < this.unit.maxHp)) {
      const w = 44 * scale;
      const x = this.sx - w / 2;
      const y = this.bodyTop() - 12 * scale;
      ctx.fillStyle = 'rgba(6, 5, 4, 0.72)';
      roundRect(ctx, x - 1, y - 1, w + 2, 6 + 2, 2);
      ctx.fill();
      ctx.fillStyle = '#2a1c15';
      ctx.fillRect(x, y, w, 6);
      const pct = clamp(this.unit.hp / this.unit.maxHp, 0, 1);
      const grad = ctx.createLinearGradient(x, y, x + w, y);
      grad.addColorStop(0, pct < 0.3 ? '#8f2d24' : '#6f8b3f');
      grad.addColorStop(1, pct < 0.3 ? '#d8574a' : '#a8c45e');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w * pct, 6);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

class BattleScene {
  constructor(container) {
    this.container = container;
    this.unitViews = new Map();
    this.time = 0;
    this.shakeAmount = 0;
    this.themeName = 'ruins';
    this.theme = THEMES.ruins;
    this.embers = [];
    this.mist = [];
    this.reduceMotion = false;
    try {
      this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
    } catch {
      this.reduceMotion = false;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'battle-canvas';
    canvas.setAttribute('aria-label', 'Battlefield');
    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!this.ctx) {
      container.innerHTML = '<div class="render-error">This browser cannot create a 2D canvas. Try a current browser.</div>';
      throw new Error('2D canvas unavailable');
    }
    this.renderer = { domElement: canvas };
    this.effects = new CanvasEffects(this);
    this.resize();
    this.onResize = () => this.resize();
    this.resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(this.onResize, 120);
    });
    this.build('ruins');
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  typeColor(type) {
    return {
      physical: '#ffd8a0',
      fire: '#ff7a24',
      cold: '#8fe7d4',
      holy: '#ffe7a8',
      poison: '#9bc24b',
      heal: '#a8d98a',
      death: '#8fe7d4',
    }[type] || '#ffd8a0';
  }

  resize() {
    const W = Math.max(320, this.container.clientWidth || window.innerWidth);
    const H = Math.max(240, this.container.clientHeight || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = W;
    this.H = H;
    this.dpr = dpr;
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.canvas.style.width = `${W}px`;
    this.canvas.style.height = `${H}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.horizon = H * 0.36;
    this.groundBottom = H * 1.02;
    // Scale from both axes: a tall phone must not get desktop-sized units.
    this.sizeK = clamp(Math.min(W / 900, H / 590), 0.58, 1.42);
    this.background = paintBackground(W, H, this.theme, 1997);
    this.rebuildAtmosphere();
    for (const view of this.unitViews.values()) {
      view.home = this.slotScreen(view.unit);
    }
  }

  rebuildAtmosphere() {
    const rand = lcg(311 + this.themeName.length);
    this.embers = Array.from({ length: this.theme.props === 'marsh' ? 36 : 58 }, () => ({
      x: rand() * this.W,
      y: rand() * this.H * 0.9,
      vx: (rand() - 0.5) * (5 + this.theme.wind * 10),
      vy: -(6 + rand() * 18),
      size: 0.6 + rand() * 2.2,
      phase: rand() * TAU,
      alpha: 0.18 + rand() * 0.55,
    }));
    this.mist = Array.from({ length: 10 }, () => ({
      x: rand() * this.W,
      y: this.H * (0.46 + rand() * 0.35),
      rx: this.W * (0.09 + rand() * 0.16),
      ry: this.H * (0.012 + rand() * 0.03),
      vx: 3 + rand() * 9,
      alpha: 0.05 + rand() * 0.09,
    }));
  }

  build(themeName) {
    this.themeName = THEMES[themeName] ? themeName : 'ruins';
    this.theme = THEMES[this.themeName];
    this.background = paintBackground(this.W, this.H, this.theme, 1997 + this.themeName.length * 97);
    this.rebuildAtmosphere();
  }

  slotScreen(unit) {
    const side = unit.side;
    const rank = unit.rank;
    const col = unit.col;
    const zBase = rank === 'F' ? 4.95 : 2.95;
    const z = zBase + col * 0.55;
    // Columns spread across the field instead of stacking on one another, so
    // every silhouette stays readable at a glance.
    const base = rank === 'F' ? 1.85 : 4.15;
    const colOffset = (col - 1) * 0.8;
    const x = side === 'ally' ? -(base + colOffset) : (base + colOffset);
    const t = clamp(z / 10, 0, 1);
    const y = this.horizon + (this.groundBottom - this.horizon) * (0.08 + 0.92 * Math.pow(t, 1.32));
    const scale = 0.58 + 0.92 * t;
    const spread = Math.max(this.W / 12.5, 46);
    const margin = Math.min(64, this.W * 0.12);
    // On wide layouts the initiative tower eats the right edge; bias the field
    // slightly left so the outer enemy column is not hidden behind it.
    const centerX = this.W >= 900 ? this.W * 0.475 : this.W * 0.5;
    const sx = clamp(centerX + x * spread * scale, margin, this.W - margin);
    return { x: sx, y, scale };
  }

  spawnUnits(units) {
    this.unitViews.clear();
    for (const unit of units) {
      this.unitViews.set(unit.uid, new UnitView(this, unit));
    }
  }

  getView(uid) {
    return this.unitViews.get(uid) || null;
  }

  setActive(uid) {
    for (const [key, view] of this.unitViews) view.setActive(key === uid);
  }

  setTargets(validUids = []) {
    const valid = new Set(validUids);
    for (const [uid, view] of this.unitViews) view.setValidTarget(valid.has(uid));
  }

  clearTargets() {
    for (const view of this.unitViews.values()) view.setValidTarget(false);
  }

  setHover(uid) {
    for (const [key, view] of this.unitViews) view.setHover(key === uid);
  }

  syncSlots() {
    for (const view of this.unitViews.values()) view.setSlot();
  }

  worldPosition(uid) {
    const view = this.unitViews.get(uid);
    if (!view) return null;
    const s = view.scale * this.sizeK;
    return {
      x: view.sx,
      y: view.sy - UNIT_HEIGHT * s * 0.58,
      z: 0,
      clone() { return { ...this }; },
    };
  }

  project(position) {
    return { x: position.x, y: position.y, visible: true };
  }

  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const views = [...this.unitViews.values()]
      .filter((view) => !view.dead && view.unit.alive)
      .sort((a, b) => b.scale - a.scale);
    for (const view of views) {
      if (view.hitTest(x, y)) return view.unit.uid;
    }
    return null;
  }

  shake(amount = 0.15) {
    if (this.reduceMotion) return;
    this.shakeAmount = Math.max(this.shakeAmount, amount);
  }

  loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.time += dt;
    this.effects.update(dt);
    for (const view of this.unitViews.values()) view.update(dt, this.time);
    this.updateAmbient(dt);
    this.render();
    requestAnimationFrame(this.loop);
  }

  updateAmbient(dt) {
    for (const ember of this.embers) {
      ember.x += (ember.vx + Math.sin(this.time * 0.7 + ember.phase) * 5) * dt;
      ember.y += ember.vy * dt;
      if (ember.y < -10) {
        ember.y = this.H * 0.92;
        ember.x = Math.random() * this.W;
      }
      if (ember.x < -10) ember.x = this.W + 10;
      if (ember.x > this.W + 10) ember.x = -10;
    }
    for (const wisp of this.mist) {
      wisp.x += wisp.vx * dt * this.theme.wind;
      if (wisp.x - wisp.rx > this.W) wisp.x = -wisp.rx;
    }
    if (this.shakeAmount > 0.001) this.shakeAmount *= Math.pow(0.0015, dt);
    else this.shakeAmount = 0;
  }

  render() {
    const { ctx, W, H } = this;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    let ox = 0;
    let oy = 0;
    if (this.shakeAmount > 0.001) {
      ox = (Math.random() - 0.5) * this.shakeAmount * 34;
      oy = (Math.random() - 0.5) * this.shakeAmount * 22;
    }
    ctx.save();
    ctx.translate(ox, oy);

    ctx.drawImage(this.background, 0, 0, W, H);
    this.drawRays(ctx);
    this.drawMist(ctx);

    const views = [...this.unitViews.values()].sort((a, b) => a.scale - b.scale);
    for (const view of views) view.draw(ctx, this.time);

    this.effects.draw(ctx, this.time);
    this.drawEmbers(ctx);
    ctx.restore();

    // A subtle top-to-bottom vignette; CSS adds the ornate edge.
    const vig = ctx.createLinearGradient(0, 0, 0, H);
    vig.addColorStop(0, 'rgba(4,3,3,0.22)');
    vig.addColorStop(0.35, 'rgba(4,3,3,0)');
    vig.addColorStop(1, 'rgba(4,3,3,0.18)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  drawRays(ctx) {
    if (this.reduceMotion) return;
    const theme = this.theme;
    const sunX = this.W * theme.sunX;
    const sunY = this.H * theme.sunY;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i += 1) {
      const sway = Math.sin(this.time * 0.12 + i * 1.7) * this.W * 0.012;
      const spread = this.W * (0.035 + i * 0.018);
      const endX = sunX + sway + (i - 1.5) * this.W * 0.05;
      const endY = this.H * (0.95 + i * 0.01);
      const g = ctx.createLinearGradient(sunX, sunY, endX, endY);
      g.addColorStop(0, rgba(theme.sun, 0.07));
      g.addColorStop(0.55, rgba(theme.sun, 0.025));
      g.addColorStop(1, rgba(theme.sun, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(sunX + (i - 2) * 12, sunY);
      ctx.lineTo(endX - spread, endY);
      ctx.lineTo(endX + spread, endY);
      ctx.lineTo(sunX + (i - 1) * 16, sunY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawMist(ctx) {
    ctx.save();
    for (const wisp of this.mist) {
      const g = ctx.createRadialGradient(wisp.x, wisp.y, 1, wisp.x, wisp.y, wisp.rx);
      g.addColorStop(0, `rgba(210, 195, 165, ${wisp.alpha})`);
      g.addColorStop(1, 'rgba(210, 195, 165, 0)');
      ctx.fillStyle = g;
      ellipse(ctx, wisp.x, wisp.y, wisp.rx, wisp.ry);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEmbers(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ember of this.embers) {
      const flicker = 0.55 + Math.sin(this.time * 3 + ember.phase) * 0.45;
      ctx.fillStyle = rgba(this.theme.ember, ember.alpha * flicker);
      ellipse(ctx, ember.x, ember.y, ember.size, ember.size);
      ctx.fill();
    }
    ctx.restore();
  }
}

Object.assign(exports, { BattleScene });

  });

  // ---- js/ui/portraits.js ----------------------------------------------
  __define("js/ui/portraits.js", function (module, exports, __require) {
// Procedural canvas portraits for the initiative tower and corner panels.
// Stylized, original, and deliberately simple enough to read at 46 px.

const cache = new Map();

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const SCHEMES = {
  warden: { bg1: '#3c3020', bg2: '#0d1214', accent: '#c9a227', skin: '#c99a76', cloth: '#7c2f2f' },
  shield: { bg1: '#23343c', bg2: '#0c1012', accent: '#9d7d39', skin: '#a97c5d', cloth: '#2f4b58' },
  ranger: { bg1: '#26351f', bg2: '#0a0f0a', accent: '#9bc24b', skin: '#b08a66', cloth: '#3d5539' },
  pyromancer: { bg1: '#3b2418', bg2: '#100a0a', accent: '#ff7a24', skin: '#c79a7c', cloth: '#3a2a3f' },
  priest: { bg1: '#3a3324', bg2: '#0f0f0c', accent: '#ffe7a8', skin: '#caa182', cloth: '#d8cdb2' },
  brigand: { bg1: '#382719', bg2: '#0e0b08', accent: '#a85b3c', skin: '#b98d68', cloth: '#5a3b26' },
  crossbow: { bg1: '#2a2e30', bg2: '#0a0c0d', accent: '#9aa4ae', skin: '#a9805f', cloth: '#2c3438' },
  ghoul: { bg1: '#2c3a2c', bg2: '#090d09', accent: '#b7e05a', skin: '#7f8f78', cloth: '#3e493e' },
  lurker: { bg1: '#243424', bg2: '#080d08', accent: '#c8e46a', skin: '#536b4e', cloth: '#2d3a2c' },
  cultist: { bg1: '#3a1519', bg2: '#0e0607', accent: '#d24c3d', skin: '#8f7a6a', cloth: '#4b2328' },
  marsharcher: { bg1: '#263321', bg2: '#080c07', accent: '#9bc24b', skin: '#9d8a66', cloth: '#394a32' },
  skeleton: { bg1: '#2d3230', bg2: '#0b0d0d', accent: '#8fe7d4', skin: '#d8d0b6', cloth: '#4a473e' },
  adept: { bg1: '#25253a', bg2: '#08080e', accent: '#8fe7d4', skin: '#cfc6a8', cloth: '#2f2b3a' },
  king: { bg1: '#232735', bg2: '#060608', accent: '#8fe7d4', skin: '#cfc6a8', cloth: '#1e2028' },
};

function drawBackground(ctx, scheme) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, scheme.bg1);
  gradient.addColorStop(1, scheme.bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 160);

  const glow = ctx.createRadialGradient(64, 44, 4, 64, 44, 70);
  glow.addColorStop(0, `${scheme.accent}40`);
  glow.addColorStop(0.55, `${scheme.accent}10`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 160);

  // Dust motes.
  let seed = 17;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < 22; i += 1) {
    ctx.fillStyle = `rgba(240,225,190,${0.02 + rand() * 0.09})`;
    ctx.beginPath();
    ctx.arc(rand() * 128, rand() * 160, 0.5 + rand() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShoulders(ctx, scheme, wide = 1) {
  const g = ctx.createLinearGradient(0, 100, 0, 160);
  g.addColorStop(0, scheme.cloth);
  g.addColorStop(1, '#070708');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(4, 160);
  ctx.quadraticCurveTo(10, 112, 42 * wide, 102);
  ctx.quadraticCurveTo(64, 96, 86 * wide, 102);
  ctx.quadraticCurveTo(118, 112, 124, 160);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `${scheme.accent}55`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawNeck(ctx, scheme) {
  ctx.fillStyle = scheme.skin;
  ctx.beginPath();
  ctx.moveTo(54, 88);
  ctx.lineTo(74, 88);
  ctx.lineTo(77, 110);
  ctx.lineTo(51, 110);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(54, 98, 20, 10);
}

function drawFace(ctx, scheme, opts = {}) {
  const skin = scheme.skin;
  const grad = ctx.createLinearGradient(40, 40, 92, 105);
  grad.addColorStop(0, '#d9b496');
  grad.addColorStop(0.45, skin);
  grad.addColorStop(1, 'rgba(18,12,10,0.92)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(64, 68, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sculpted side shadow: the light comes from the upper left.
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(64, 68, 22, 28, 0, 0, Math.PI * 2);
  ctx.clip();
  const side = ctx.createLinearGradient(42, 44, 88, 100);
  side.addColorStop(0, 'rgba(255,240,210,0.10)');
  side.addColorStop(0.5, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = side;
  ctx.fillRect(40, 38, 50, 62);
  ctx.restore();

  // Brow shadow and eye sockets.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(64, 55, 19, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheekbones.
  ctx.fillStyle = 'rgba(255,230,200,0.07)';
  ctx.beginPath();
  ctx.ellipse(50, 73, 5, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(78, 73, 5, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Nose.
  ctx.fillStyle = 'rgba(60,34,26,0.45)';
  ctx.beginPath();
  ctx.moveTo(64, 61);
  ctx.lineTo(60, 77);
  ctx.lineTo(67, 78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,230,200,0.12)';
  ctx.fillRect(63, 62, 1.4, 12);

  // Mouth: thin, slightly downturned.
  ctx.strokeStyle = 'rgba(50,22,20,0.75)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(57, 86);
  ctx.quadraticCurveTo(64, 88, 71, 86);
  ctx.stroke();

  const eyeColor = opts.eye || scheme.accent;
  const eyeY = opts.eyeY ?? 66;
  for (const x of [55, 73]) {
    // Deep socket.
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.beginPath();
    ctx.ellipse(x, eyeY, 6.2, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!opts.hollow) {
      // Sclera kept dim so the portrait reads as oil paint, not cartoon.
      ctx.fillStyle = 'rgba(186,172,148,0.5)';
      ctx.beginPath();
      ctx.ellipse(x, eyeY + 0.4, 4.6, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x, eyeY + 0.6, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(8,8,7,0.95)';
      ctx.beginPath();
      ctx.arc(x, eyeY + 0.6, 1.05, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (opts.brow !== false) {
    ctx.strokeStyle = 'rgba(30,20,14,0.9)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(47, 59);
    ctx.lineTo(61, 62.5);
    ctx.moveTo(81, 59);
    ctx.lineTo(67, 62.5);
    ctx.stroke();
  }
}

function drawHood(ctx, color, rim = '#9bc24b') {
  const g = ctx.createLinearGradient(30, 20, 96, 110);
  g.addColorStop(0, rim);
  g.addColorStop(0.18, color);
  g.addColorStop(1, '#080a08');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(64, 16);
  ctx.quadraticCurveTo(103, 36, 100, 92);
  ctx.quadraticCurveTo(92, 118, 64, 120);
  ctx.quadraticCurveTo(36, 118, 28, 92);
  ctx.quadraticCurveTo(25, 36, 64, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.ellipse(64, 72, 24, 31, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLongHair(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(42, 40);
  ctx.quadraticCurveTo(34, 80, 38, 120);
  ctx.quadraticCurveTo(48, 108, 50, 76);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(86, 40);
  ctx.quadraticCurveTo(94, 80, 90, 120);
  ctx.quadraticCurveTo(80, 108, 78, 76);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(64, 38, 28, 18, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

function drawHelmet(ctx) {
  const g = ctx.createLinearGradient(34, 20, 92, 80);
  g.addColorStop(0, '#c3ccd3');
  g.addColorStop(0.5, '#6d777f');
  g.addColorStop(1, '#2c3237');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(64, 22);
  ctx.quadraticCurveTo(102, 34, 95, 76);
  ctx.lineTo(84, 72);
  ctx.quadraticCurveTo(84, 40, 64, 36);
  ctx.quadraticCurveTo(44, 40, 44, 72);
  ctx.lineTo(33, 76);
  ctx.quadraticCurveTo(26, 34, 64, 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9aa4ab';
  ctx.fillRect(60, 30, 8, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(44, 30, 4, 20);
}

function drawCrown(ctx, color = '#b08a3e') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(44, 32);
  ctx.lineTo(50, 12);
  ctx.lineTo(58, 26);
  ctx.lineTo(64, 8);
  ctx.lineTo(70, 26);
  ctx.lineTo(78, 12);
  ctx.lineTo(84, 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,235,180,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSkull(ctx) {
  const g = ctx.createLinearGradient(38, 34, 92, 102);
  g.addColorStop(0, '#e7e0c8');
  g.addColorStop(0.65, '#c9c0a2');
  g.addColorStop(1, '#7a725a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(64, 62, 27, 31, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(48, 82);
  ctx.lineTo(80, 82);
  ctx.lineTo(72, 108);
  ctx.lineTo(56, 108);
  ctx.closePath();
  ctx.fill();

  // Sockets.
  ctx.fillStyle = '#0a0c0b';
  ctx.beginPath();
  ctx.ellipse(53, 61, 8, 9, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(75, 61, 8, 9, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(143,231,212,0.9)';
  ctx.beginPath();
  ctx.arc(53, 62, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(75, 62, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Nose cavity and teeth.
  ctx.fillStyle = '#141512';
  ctx.beginPath();
  ctx.moveTo(64, 68);
  ctx.lineTo(59, 78);
  ctx.lineTo(69, 78);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,38,30,0.8)';
  ctx.lineWidth = 1;
  for (let x = 52; x <= 78; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x, 86);
    ctx.lineTo(x, 96);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(48, 86);
  ctx.quadraticCurveTo(64, 82, 80, 86);
  ctx.stroke();

  // Crack.
  ctx.strokeStyle = 'rgba(40,38,30,0.6)';
  ctx.beginPath();
  ctx.moveTo(84, 42);
  ctx.lineTo(78, 50);
  ctx.lineTo(82, 57);
  ctx.stroke();
}

function drawBeast(ctx, scheme, kind) {
  const g = ctx.createLinearGradient(30, 38, 100, 112);
  g.addColorStop(0, scheme.skin);
  g.addColorStop(1, '#1c241c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(64, 82, kind === 'lurker' ? 38 : 30, kind === 'lurker' ? 30 : 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wide jaw.
  ctx.beginPath();
  ctx.ellipse(64, 100, 26, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(20,24,18,0.8)';
  ctx.fill();
  ctx.fillStyle = '#ded6b8';
  for (let i = 0; i < 6; i += 1) {
    const x = 44 + i * 8;
    ctx.beginPath();
    ctx.moveTo(x, 98);
    ctx.lineTo(x + 3, 108);
    ctx.lineTo(x + 6, 98);
    ctx.closePath();
    ctx.fill();
  }

  // Eyes.
  const eyeY = kind === 'lurker' ? 66 : 70;
  for (const x of kind === 'lurker' ? [48, 80] : [54, 74]) {
    ctx.fillStyle = '#10140c';
    ctx.beginPath();
    ctx.ellipse(x, eyeY, kind === 'lurker' ? 11 : 8, kind === 'lurker' ? 9 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = scheme.accent;
    ctx.beginPath();
    ctx.ellipse(x, eyeY, kind === 'lurker' ? 5 : 3.5, kind === 'lurker' ? 6 : 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0d08';
    ctx.fillRect(x - (kind === 'lurker' ? 1.5 : 1), eyeY - 5, kind === 'lurker' ? 3 : 2, kind === 'lurker' ? 10 : 8);
  }

  // Gills / tendrils.
  if (kind === 'lurker') {
    ctx.strokeStyle = 'rgba(30,50,30,0.8)';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(34 + i * 3, 74 + i * 6);
      ctx.quadraticCurveTo(18, 90 + i * 8, 26, 118 + i * 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(94 - i * 3, 74 + i * 6);
      ctx.quadraticCurveTo(110, 90 + i * 8, 102, 118 + i * 5);
      ctx.stroke();
    }
  }
}

function createPortraitURL(key, size = 128) {
  const cacheKey = `${key}:${size}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const scheme = SCHEMES[key] || SCHEMES.warden;
  const canvas = document.createElement('canvas');
  // Render at 2x so the large corner medallions stay crisp on high-DPI screens.
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  drawBackground(ctx, scheme);

  if (key === 'ghoul') {
    drawShoulders(ctx, scheme, 1.05);
    drawBeast(ctx, scheme, 'ghoul');
    // Sunken cheeks and wisps.
    ctx.strokeStyle = 'rgba(20,30,20,0.55)';
    ctx.beginPath();
    ctx.moveTo(38, 80);
    ctx.quadraticCurveTo(50, 94, 42, 108);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(90, 80);
    ctx.quadraticCurveTo(78, 94, 86, 108);
    ctx.stroke();
  } else if (key === 'lurker') {
    drawShoulders(ctx, scheme, 1.2);
    drawBeast(ctx, scheme, 'lurker');
  } else if (key === 'skeleton' || key === 'adept' || key === 'king') {
    drawShoulders(ctx, scheme, key === 'king' ? 1.2 : 1);
    if (key !== 'skeleton') {
      drawHood(ctx, key === 'king' ? '#1b1e28' : scheme.cloth, scheme.accent);
    }
    drawSkull(ctx);
    if (key === 'king') {
      drawCrown(ctx);
      // Ghost-fire eyes.
      ctx.fillStyle = 'rgba(143,231,212,0.9)';
      ctx.beginPath();
      ctx.arc(53, 60, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(75, 60, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (key === 'adept') {
      ctx.strokeStyle = 'rgba(143,231,212,0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(34, 32);
      ctx.quadraticCurveTo(22, 12, 40, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(94, 32);
      ctx.quadraticCurveTo(106, 12, 88, 8);
      ctx.stroke();
    }
  } else if (key === 'cultist' || key === 'ranger' || key === 'marsharcher' || key === 'pyromancer' || key === 'priest') {
    drawShoulders(ctx, scheme);
    drawHood(ctx, key === 'priest' ? '#d8cdb2' : scheme.cloth, scheme.accent);
    drawFace(ctx, scheme, {
      eye: scheme.accent,
      eyeY: 70,
      brow: key === 'cultist' ? false : true,
      hollow: key === 'cultist',
    });
    if (key === 'pyromancer') {
      const g = ctx.createLinearGradient(0, 120, 0, 40);
      g.addColorStop(0, 'rgba(255,122,36,0.85)');
      g.addColorStop(1, 'rgba(255,122,36,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(20, 150);
      ctx.quadraticCurveTo(30, 90, 24, 50);
      ctx.quadraticCurveTo(44, 104, 40, 150);
      ctx.fill();
    }
    if (key === 'priest') {
      const halo = ctx.createRadialGradient(64, 22, 2, 64, 22, 30);
      halo.addColorStop(0, 'rgba(255,231,168,0.55)');
      halo.addColorStop(1, 'rgba(255,231,168,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(24, 0, 80, 60);
      ctx.strokeStyle = '#b08a3e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(64, 32, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (key === 'cultist') {
      drawHorns(ctx);
    }
    if (key === 'ranger' || key === 'marsharcher') {
      ctx.fillStyle = 'rgba(10,14,10,0.6)';
      ctx.beginPath();
      ctx.ellipse(64, 80, 22, 19, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#8a7040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 110, 30, -1.2, 1.2);
      ctx.stroke();
    }
  } else if (key === 'crossbow' || key === 'brigand' || key === 'shield') {
    drawShoulders(ctx, scheme, key === 'shield' ? 1.2 : 1);
    drawNeck(ctx, scheme);
    drawFace(ctx, scheme, { eye: scheme.accent, eyeY: 67 });
    if (key === 'crossbow') {
      drawHelmet(ctx);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(64, 48, 20, 34);
      ctx.strokeStyle = '#9aa4ab';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(86, 122);
      ctx.lineTo(104, 84);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(94, 100);
      ctx.lineTo(114, 96);
      ctx.stroke();
    } else if (key === 'brigand') {
      ctx.fillStyle = '#3a2a1c';
      ctx.beginPath();
      ctx.ellipse(64, 40, 29, 15, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8f2b2b';
      ctx.fillRect(38, 42, 52, 6);
      ctx.strokeStyle = 'rgba(120,60,40,0.8)';
      ctx.beginPath();
      ctx.moveTo(76, 50);
      ctx.lineTo(84, 64);
      ctx.stroke();
    } else {
      drawHelmet(ctx);
      ctx.fillStyle = 'rgba(20,28,24,0.75)';
      ctx.beginPath();
      ctx.moveTo(46, 88);
      ctx.quadraticCurveTo(64, 108, 84, 90);
      ctx.quadraticCurveTo(64, 100, 46, 88);
      ctx.fill();
      ctx.fillStyle = '#9d7d39';
      ctx.fillRect(54, 111, 20, 4);
    }
  } else {
    drawShoulders(ctx, scheme, 1.05);
    drawNeck(ctx, scheme);
    drawFace(ctx, scheme, { eye: scheme.accent, eyeY: 67 });
    drawLongHair(ctx, '#b98d58');
    drawHelmet(ctx);
    ctx.fillStyle = '#9d7d39';
    ctx.beginPath();
    ctx.moveTo(60, 36);
    ctx.lineTo(64, 20);
    ctx.lineTo(68, 36);
    ctx.closePath();
    ctx.fill();
  }

  // Universal painterly pass: warm key light, cool shadow, grain, vignette.
  const paint = ctx.createLinearGradient(0, 0, 128, 160);
  paint.addColorStop(0, 'rgba(255, 214, 150, 0.16)');
  paint.addColorStop(0.45, 'rgba(255, 214, 150, 0)');
  paint.addColorStop(1, 'rgba(24, 34, 40, 0.28)');
  ctx.fillStyle = paint;
  ctx.fillRect(0, 0, 128, 160);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const pool = ctx.createRadialGradient(44, 38, 4, 44, 38, 92);
  pool.addColorStop(0, 'rgba(255, 232, 190, 0.22)');
  pool.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, 128, 160);
  ctx.restore();

  // Sparse deterministic grain so the portraits read as painted canvas.
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000';
  for (let i = 0; i < 220; i += 1) {
    const gx = (i * 37) % 128;
    const gy = (i * 61) % 160;
    ctx.fillRect(gx, gy, 1, 1);
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(64, 70, 30, 64, 80, 94);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.72, 'rgba(0,0,0,0.22)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 128, 160);

  ctx.strokeStyle = `${scheme.accent}55`;
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 124, 156);

  const url = canvas.toDataURL('image/png');
  cache.set(cacheKey, url);
  return url;
}

function drawHorns(ctx) {
  ctx.strokeStyle = '#2a1a1a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(42, 32);
  ctx.quadraticCurveTo(24, 12, 30, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(86, 32);
  ctx.quadraticCurveTo(104, 12, 98, 4);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

Object.assign(exports, { createPortraitURL });

  });

  // ---- js/ui/hud.js ----------------------------------------------------
  __define("js/ui/hud.js", function (module, exports, __require) {
// DOM interface: title/help/results, initiative tower, corner panels, action medallion, floats, log.

const { STATUS_INFO, DMG_LABEL, UPGRADES } = __require("js/battle/data.js");
const { createPortraitURL } = __require("js/ui/portraits.js");

const esc = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function statusChips(unit, compact = false) {
  const entries = Object.entries(unit.statuses || {});
  if (!entries.length) return '';
  return entries
    .map(([key, value]) => {
      const info = STATUS_INFO[key] || { icon: '•', name: key, color: '#ccc' };
      let detail = '';
      if (key === 'shield') detail = value.amount ?? '';
      else if (value.turns === Infinity) detail = '∞';
      else detail = value.turns ?? '';
      return `<span class="status-chip" title="${esc(info.desc || info.name)}" style="border-color:${info.color}66">
        <span style="color:${info.color}">${info.icon}</span>${compact ? '' : esc(info.name)}<b>${detail}</b>
      </span>`;
    })
    .join('');
}

function resistText(unit) {
  const entries = Object.entries(unit.resist || {}).filter(([, value]) => value);
  if (!entries.length) return '—';
  return entries
    .map(([key, value]) => {
      const label = (DMG_LABEL[key] || key).slice(0, 4);
      return `${label} ${value > 0 ? '+' : ''}${value}%`;
    })
    .join(' · ');
}

class HUD {
  constructor(callbacks) {
    this.callbacks = callbacks || {};
    this.battle = null;
    this.busy = false;
    this.pending = null;
    this.inspectUid = null;
    this.lastAllyUid = null;
    this.fast = false;
    this.overlayOpen = false;
    this.portraitCache = new Map();
    this.floatCount = 0;

    this.el = {
      encounterTitle: document.getElementById('encounter-title'),
      roundLabel: document.getElementById('round-label'),
      roundPip: document.getElementById('round-pip'),
      queue: document.getElementById('queue-list'),
      turnSide: document.getElementById('turn-side'),
      logList: document.getElementById('log-list'),
      hint: document.getElementById('hint-banner'),
      allyPanel: document.getElementById('panel-ally'),
      enemyPanel: document.getElementById('panel-enemy'),
      allyPortrait: document.getElementById('ally-portrait'),
      enemyPortrait: document.getElementById('enemy-portrait'),
      allyName: document.getElementById('ally-name'),
      enemyName: document.getElementById('enemy-name'),
      allyLevel: document.getElementById('ally-level'),
      enemyLevel: document.getElementById('enemy-level'),
      allyRole: document.getElementById('ally-role'),
      enemyRole: document.getElementById('enemy-role'),
      allyHpFill: document.getElementById('ally-hp-fill'),
      enemyHpFill: document.getElementById('enemy-hp-fill'),
      allyHpText: document.getElementById('ally-hp-text'),
      enemyHpText: document.getElementById('enemy-hp-text'),
      allyStatuses: document.getElementById('ally-statuses'),
      enemyStatuses: document.getElementById('enemy-statuses'),
      actionZone: document.getElementById('action-zone'),
      wheel: document.getElementById('action-wheel'),
      targetHint: document.getElementById('target-hint'),
      abilityPopover: document.getElementById('ability-popover'),
      turnBanner: document.getElementById('turn-banner'),
      floatLayer: document.getElementById('float-layer'),
      tooltip: document.getElementById('tooltip'),
      overlay: document.getElementById('overlay'),
      overlayPanel: document.getElementById('overlay-panel'),
      btnSpeed: document.getElementById('btn-speed'),
      btnHelp: document.getElementById('btn-help'),
      btnSound: document.getElementById('btn-sound'),
      btnPause: document.getElementById('btn-pause'),
    };

    this.el.queue.addEventListener('click', (event) => {
      const card = event.target.closest('[data-uid]');
      if (card) this.callbacks.onInspect?.(card.dataset.uid);
    });

    this.el.queue.addEventListener('mouseover', (event) => {
      const card = event.target.closest('[data-uid]');
      if (card) {
        const unit = this.battle?.getUnit(card.dataset.uid);
        if (unit) this.showTooltip(unit, event.clientX, event.clientY);
      }
    });
    this.el.queue.addEventListener('mouseout', () => this.hideTooltip());

    this.el.wheel.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button || button.disabled) return;
      const action = button.dataset.action;
      this.callbacks.onAction?.(action);
    });

    this.el.abilityPopover.addEventListener('click', (event) => {
      const button = event.target.closest('[data-ability]');
      if (button && !button.disabled) this.callbacks.onAbility?.(button.dataset.ability);
    });

    this.el.overlay.addEventListener('click', (event) => {
      const button = event.target.closest('[data-overlay]');
      if (button) {
        this.callbacks.onOverlay?.(button.dataset.overlay);
      }
    });

    this.el.btnPause.addEventListener('click', () => this.callbacks.onPause?.());
    this.el.btnHelp.addEventListener('click', () => this.callbacks.onHelp?.());
    this.el.btnSound.addEventListener('click', () => this.callbacks.onMute?.());
    this.el.btnSpeed.addEventListener('click', () => this.callbacks.onSpeed?.());

    this.el.overlay.addEventListener('scroll', () => this.hideTooltip(), true);
  }

  setBattle(battle) {
    this.battle = battle;
    this.pending = null;
    this.inspectUid = battle.enemies.find((unit) => unit.alive)?.uid || null;
    this.lastAllyUid = battle.allies.find((unit) => unit.alive)?.uid || null;
    this.el.encounterTitle.textContent = `${battle.encounter.name}`;
    this.el.roundLabel.textContent = `Round 1`;
    this.el.roundPip.textContent = 'R1';
    this.hideAbilityPopover();
    this.clearTargeting();
    this.render();
  }

  setBusy(busy) {
    this.busy = busy;
    this.renderActions();
    this.el.turnBanner.classList.toggle('enemy', Boolean(this.battle && this.battle.currentUnit?.side === 'enemy'));
  }

  setFast(fast) {
    this.fast = fast;
    this.el.btnSpeed.classList.toggle('active', fast);
  }

  setMuted(muted) {
    this.el.btnSound.textContent = muted ? '×' : '♪';
    this.el.btnSound.classList.toggle('active', muted);
    this.el.btnSound.title = muted ? 'Sound off (M)' : 'Sound on (M)';
  }

  render() {
    if (!this.battle) return;
    const battle = this.battle;
    const current = battle.currentUnit;

    if (current?.side === 'ally') this.lastAllyUid = current.uid;
    if (current?.side === 'enemy' && !this.inspectUid) this.inspectUid = current.uid;

    this.el.roundLabel.textContent = `Round ${battle.round}`;
    this.el.roundPip.textContent = `R${battle.round}`;
    this.el.turnSide.textContent =
      battle.outcome === 'victory'
        ? 'VICTORY'
        : battle.outcome === 'defeat'
          ? 'DEFEAT'
          : current?.side === 'enemy'
            ? 'ENEMY TURN'
            : 'YOUR TURN';
    this.el.turnSide.parentElement?.classList.toggle('enemy', current?.side === 'enemy');

    this.renderQueue();
    this.renderLog();
    this.renderPanels();
    this.renderActions();

    const enemyTurn = current?.side === 'enemy';
    this.el.turnBanner.textContent = battle.outcome
      ? battle.outcome.toUpperCase()
      : enemyTurn
        ? 'ENEMY TURN'
        : this.pending
          ? 'CHOOSE A TARGET'
          : 'YOUR TURN';
    this.el.turnBanner.classList.toggle('enemy', enemyTurn);
  }

  renderQueue() {
    const battle = this.battle;
    const currentUid = battle.currentUnit?.uid;
    const currentIndex = battle.turnIndex;
    const card = (unit, { acted = false, active = false, dead = false } = {}) => {
      const hpPercent = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100));
      const low = hpPercent <= 30;
      return `<div class="queue-card ${unit.side} ${active ? 'current' : ''} ${acted ? 'acted' : ''} ${dead ? 'dead' : ''}"
        data-uid="${unit.uid}" title="${esc(unit.name)} — ${unit.hp}/${unit.maxHp} HP">
        <div class="queue-portrait"><img src="${this.portrait(unit)}" alt=""></div>
        <div class="queue-body">
          <div class="queue-name"><span>${esc(unit.name)}</span><em>Lv ${unit.level}</em></div>
          <div class="queue-hp"><i class="${low ? 'low' : ''}" style="width:${hpPercent}%"></i></div>
          <div class="queue-hp-text">${unit.hp} / ${unit.maxHp}</div>
          <div class="queue-statuses">${statusChips(unit, true)}</div>
        </div>
      </div>`;
    };
    const living = battle.order.map((unit, index) =>
      card(unit, { acted: index < currentIndex, active: unit.uid === currentUid }),
    );
    // Fallen units stay visible at the bottom of the tower, dimmed, for the
    // remainder of the battle so the player can read the round's history.
    const fallen = (battle.fallen || []).map((unit) => card(unit, { dead: true }));
    this.el.queue.classList.toggle('crowded', living.length + fallen.length > 8);
    this.el.queue.innerHTML = [...living, ...fallen].join('');
    const activeCard = this.el.queue.querySelector('.queue-card.current');
    if (activeCard) {
      const top = activeCard.offsetTop;
      const view = this.el.queue;
      if (top < view.scrollTop || top + activeCard.offsetHeight > view.scrollTop + view.clientHeight) {
        view.scrollTop = Math.max(0, top - 8);
      }
    }
  }

  renderPanels() {
    const battle = this.battle;
    const current = battle.currentUnit;
    let ally = battle.getUnit(this.lastAllyUid) || battle.allies.find((unit) => unit.alive);
    if (!ally || !ally.alive) ally = battle.allies.find((unit) => unit.alive) || battle.allies[0];
    let enemy = battle.getUnit(this.inspectUid);
    if (!enemy || !enemy.alive) {
      const activeAlly = current?.side === 'ally' ? current : battle.allies.find((unit) => unit.alive);
      enemy =
        (activeAlly ? battle.getValidTargets(activeAlly, 'attack')[0] : null) ||
        battle.enemies.find((unit) => unit.alive) ||
        battle.enemies[0];
      this.inspectUid = enemy?.uid || null;
    }

    if (ally) {
      this.el.allyPortrait.src = this.portrait(ally);
      this.el.allyName.textContent = ally.name;
      this.el.allyLevel.textContent = `Lv ${ally.level}`;
      this.el.allyRole.textContent = `${ally.role} · ${ally.attackName}`;
      const p = Math.max(0, Math.min(100, (ally.hp / ally.maxHp) * 100));
      this.el.allyHpFill.style.width = `${p}%`;
      this.el.allyHpFill.classList.toggle('low', p <= 30);
      this.el.allyHpText.textContent = `${ally.hp} / ${ally.maxHp}`;
      this.el.allyStatuses.innerHTML = statusChips(ally);
      this.el.allyPanel.classList.toggle('downed', !ally.alive);
    }
    if (enemy) {
      this.el.enemyPortrait.src = this.portrait(enemy);
      this.el.enemyName.textContent = enemy.name;
      this.el.enemyLevel.textContent = `Lv ${enemy.level}`;
      this.el.enemyRole.textContent = `${enemy.role} · ${enemy.attackName}`;
      const p = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
      this.el.enemyHpFill.style.width = `${p}%`;
      this.el.enemyHpFill.classList.toggle('low', p <= 30);
      this.el.enemyHpText.textContent = `${enemy.hp} / ${enemy.maxHp}`;
      this.el.enemyStatuses.innerHTML = statusChips(enemy);
      this.el.enemyPanel.classList.toggle('boss-target', Boolean(enemy.boss));
    }
  }

  renderActions() {
    const battle = this.battle;
    const current = battle?.currentUnit;
    const canAct = Boolean(
      battle &&
        battle.phase === 'player' &&
        current?.side === 'ally' &&
        !this.busy &&
        !battle.outcome,
    );
    const actions = canAct ? battle.getActionsFor(current) : [];
    const byId = Object.fromEntries(actions.map((entry) => [entry.id, entry]));
    for (const button of this.el.wheel.querySelectorAll('[data-action]')) {
      const id = button.dataset.action;
      const descriptor = byId[id];
      const enabled = Boolean(descriptor?.enabled) && canAct;
      button.disabled = !enabled;
      button.classList.toggle('pending', this.pending?.action === id);
      if (descriptor?.reason) button.title = descriptor.reason;
      else if (id === 'attack') button.title = 'Basic attack (1)';
      else if (id === 'ability') button.title = 'Class abilities (2)';
      else if (id === 'defend') button.title = 'Reduce incoming damage by 50% (3)';
      else if (id === 'wait') button.title = 'Act later this round (4)';
      else if (id === 'shift') button.title = 'Change front/back row (5)';
    }
  }

  showAbilityPopover(actor, abilities, open) {
    if (!open) {
      this.hideAbilityPopover();
      return;
    }
    const rows = abilities
      .map((entry) => {
        const cd = entry.cooldown > 0 ? `Ready in ${entry.cooldown}` : entry.enabled ? 'Ready' : entry.reason || 'No target';
        return `<button class="ability-option" data-ability="${entry.id}" ${entry.enabled ? '' : 'disabled'}>
          <span><strong>${esc(entry.name)}</strong><small>${esc(entry.desc)}</small></span>
          <span class="ability-cd ${entry.enabled ? '' : 'blocked'}">${esc(cd)}</span>
        </button>`;
      })
      .join('');
    this.el.abilityPopover.innerHTML = `<div class="ability-head"><span>ABILITIES</span><span>ESC TO CLOSE</span></div>${rows}`;
    this.el.abilityPopover.classList.remove('hidden');
  }

  hideAbilityPopover() {
    this.el.abilityPopover.classList.add('hidden');
  }

  showTargeting(hint, validCount = 0) {
    this.pending = this.pending || {};
    this.el.targetHint.textContent = hint;
    this.el.targetHint.classList.remove('hidden');
    this.el.targetHint.classList.toggle('invalid', validCount === 0);
  }

  setPending(action) {
    this.pending = action ? { action } : null;
    this.renderActions();
  }

  clearTargeting() {
    this.pending = null;
    this.el.targetHint.classList.add('hidden');
    this.hideAbilityPopover();
    this.renderActions();
  }

  flashHint(text, invalid = false) {
    this.el.hint.textContent = text;
    this.el.hint.classList.remove('hidden');
    this.el.hint.classList.toggle('invalid', invalid);
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => this.el.hint.classList.add('hidden'), 3800);
  }

  hideHint() {
    this.el.hint.classList.add('hidden');
  }

  renderLog() {
    const entries = this.battle.log.slice(-4).reverse();
    this.el.logList.innerHTML = entries
      .map((entry) => `<li class="${entry.tone || 'neutral'}">${esc(entry.text)}</li>`)
      .join('');
  }

  portrait(unit) {
    const key = unit.portrait || 'warden';
    if (!this.portraitCache.has(key)) this.portraitCache.set(key, createPortraitURL(key));
    return this.portraitCache.get(key);
  }

  floatAt(x, y, text, kind = 'damage') {
    if (this.floatCount > 26) return;
    const div = document.createElement('div');
    div.className = `float-text ${kind}`;
    div.textContent = text;
    div.style.left = `${Math.round(x)}px`;
    div.style.top = `${Math.round(y)}px`;
    this.el.floatLayer.appendChild(div);
    this.floatCount += 1;
    setTimeout(() => {
      div.remove();
      this.floatCount -= 1;
    }, 1050);
  }

  showTooltip(unit, x, y) {
    if (!unit) return;
    const statuses = Object.entries(unit.statuses || {})
      .map(([key, value]) => {
        const info = STATUS_INFO[key];
        return info ? `${info.icon} ${info.name}${value.turns === Infinity ? '' : ` (${value.turns})`}` : key;
      })
      .join(' · ');
    const cooldowns = Object.entries(unit.cooldowns || {})
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`)
      .join(' · ');
    this.el.tooltip.innerHTML = `
      <div class="tt-name">${esc(unit.name)} <span style="font-size:9px;color:#aa9a7d">Lv ${unit.level}</span></div>
      <div class="tt-row"><span>${esc(unit.role)}</span><span>${esc(DMG_LABEL[unit.damageType] || '')}</span></div>
      <div class="tt-row"><span>HP</span><span>${unit.hp} / ${unit.maxHp}</span></div>
      <div class="tt-row"><span>Initiative</span><span>${unit.initiative}</span></div>
      <div class="tt-row"><span>Damage</span><span>${unit.damage?.[0] ?? '?'}–${unit.damage?.[1] ?? '?'}</span></div>
      <div class="tt-row"><span>Armor / Crit</span><span>${unit.armor} / ${Math.round((unit.crit || 0) * 100)}%</span></div>
      <div class="tt-row"><span>Row</span><span>${unit.rank === 'F' ? 'Front' : 'Back'}</span></div>
      <div class="tt-row"><span>Resist</span><span>${resistText(unit)}</span></div>
      ${statuses ? `<div class="tt-status">${esc(statuses)}</div>` : ''}
      ${cooldowns ? `<div class="tt-status" style="color:#d58a7d">${esc(cooldowns)}</div>` : ''}
    `;
    this.el.tooltip.classList.remove('hidden');
    const rect = this.el.tooltip.getBoundingClientRect();
    const left = Math.min(window.innerWidth - rect.width - 8, Math.max(8, x + 16));
    const top = Math.min(window.innerHeight - rect.height - 8, Math.max(8, y + 14));
    this.el.tooltip.style.left = `${left}px`;
    this.el.tooltip.style.top = `${top}px`;
  }

  hideTooltip() {
    this.el.tooltip.classList.add('hidden');
  }

  showOverlay(html, { small = false } = {}) {
    this.el.overlayPanel.className = `overlay-panel${small ? ' small' : ''}`;
    this.el.overlayPanel.innerHTML = html;
    this.el.overlay.classList.remove('hidden');
    this.overlayOpen = true;
    this.hideTooltip();
  }

  hideOverlay() {
    this.el.overlay.classList.add('hidden');
    this.overlayOpen = false;
  }

  showTitle() {
    this.showOverlay(`
      <div class="title-screen">
        <div class="brand-sigil" aria-hidden="true">✦</div>
        <p class="eyebrow">A TACTICAL DARK FANTASY</p>
        <h2>ASHEN <span>CROWN</span></h2>
        <p class="overlay-lede">Five sworn souls. Three cursed fields. One hollow king.<br>
        Command the party through initiative-driven battles where the front rank is the only mercy.</p>
        <div class="overlay-actions">
          <button class="btn primary" data-overlay="start">Begin Campaign</button>
          <button class="btn" data-overlay="help-title">How to Play</button>
        </div>
        <div class="title-footer">Initiative combat · Two ranks · Original procedural art and sound</div>
      </div>
    `);
  }

  showHelp(inBattle = false) {
    this.showOverlay(`
      <p class="eyebrow">HOW TO PLAY</p>
      <h2>Command the <span>initiative</span></h2>
      <p class="overlay-lede">Combat is turn-based. Every living unit acts once per round in initiative order.
      Choose one action on your turn; the enemy does the same.</p>
      <div class="help-grid">
        <div>
          <h3>Actions</h3>
          <ul>
            <li><b>Attack</b> — basic weapon strike. Melee can only reach the enemy front rank.</li>
            <li><b>Ability</b> — class skill with a cooldown. Read its target rule.</li>
            <li><b>Defend</b> — take 50% less damage until your next turn.</li>
            <li><b>Wait</b> — act later this round. Once per round.</li>
            <li><b>Row</b> — swap front/back if the slot is free.</li>
          </ul>
        </div>
        <div>
          <h3>Battle rules</h3>
          <ul>
            <li>Front rank protects the back rank from melee. Ranged and magic ignore cover.</li>
            <li>Poison and burn tick at the start of the afflicted unit's turn.</li>
            <li>Stun skips the next action. Guard expires at the start of your next turn.</li>
            <li>Win by defeating every enemy. Lose if every hero falls.</li>
          </ul>
        </div>
        <div>
          <h3>Controls</h3>
          <div class="key-list">
            <kbd>1</kbd><span>Attack</span>
            <kbd>2</kbd><span>Open abilities</span>
            <kbd>3</kbd><span>Defend</span>
            <kbd>4</kbd><span>Wait</span>
            <kbd>5</kbd><span>Change row</span>
            <kbd>Tab</kbd><span>Cycle targets</span>
            <kbd>Enter</kbd><span>Confirm</span>
            <kbd>Esc</kbd><span>Cancel / pause</span>
            <kbd>M</kbd><span>Mute</span>
            <kbd>F</kbd><span>Fast presentation</span>
          </div>
        </div>
        <div>
          <h3>Reading the field</h3>
          <p>The right tower is the round order. Gold marks the active unit. The bottom corners show the acting hero
          and the inspected enemy. Red rings mark legal targets. Hover any unit for exact stats and statuses.</p>
        </div>
      </div>
      <div class="overlay-actions">
        <button class="btn primary" data-overlay="${inBattle ? 'resume' : 'help-back'}">${inBattle ? 'Resume' : 'Close'}</button>
      </div>
    `);
  }

  showIntro(battle) {
    const enemies = battle.enemies;
    const chips = enemies
      .map(
        (unit) => `<span class="enemy-chip"><img src="${this.portrait(unit)}" alt="">${esc(unit.name)}</span>`,
      )
      .join('');
    const indexLabel = ['I', 'II', 'III'][battle.encounter.index - 1] || battle.encounter.index;
    this.showOverlay(`
      <div class="battle-intro">
        <p class="eyebrow">BATTLE ${indexLabel}</p>
        <h2 class="encounter-name">${esc(battle.encounter.name)}</h2>
        <p class="overlay-lede">${esc(battle.encounter.subtitle)}</p>
        <div class="objective">${esc(battle.encounter.objective)}</div>
        <div class="hint-line">${esc(battle.encounter.hint)}</div>
        <div class="enemy-roster">${chips}</div>
        <div class="overlay-actions">
          <button class="btn primary" data-overlay="begin">Enter Battle</button>
        </div>
      </div>
    `);
  }

  showPause() {
    this.showOverlay(`
      <p class="eyebrow">BATTLE PAUSED</p>
      <h2>Take a <span>breather</span></h2>
      <p class="overlay-sub">The field is frozen. Your party, cooldowns, and the initiative order are preserved.</p>
      <div class="overlay-actions">
        <button class="btn primary" data-overlay="resume">Resume</button>
        <button class="btn" data-overlay="help-pause">How to Play</button>
        <button class="btn" data-overlay="restart">Restart Battle</button>
        <button class="btn ghost" data-overlay="title">Return to Title</button>
      </div>
    `, { small: true });
  }

  showVictory(summary) {
    const rows = [
      ['Rounds', summary.rounds],
      ['Damage dealt', summary.damageDealt],
      ['Damage taken', summary.damageTaken],
      ['Enemies defeated', summary.kills],
      ['Heroes lost', summary.alliesLost],
      ['Experience', `+${summary.xp}`],
      ['Gold', `+${summary.gold}`],
    ]
      .map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`)
      .join('');
    const levels = summary.levels?.length
      ? `<div class="level-list">${summary.levels
          .map((entry) => `<span class="level-chip">${esc(entry.name)} reached level ${entry.level}</span>`)
          .join('')}</div>`
      : '';
    const gold = summary.goldRemaining ?? summary.gold ?? 0;
    const bought = summary.upgrades || {};
    const camp = summary.nextBattle
      ? `<div class="war-camp">
          <div class="war-camp-head"><span>WAR CAMP</span><em>${gold} gold in the chest</em></div>
          <div class="war-camp-grid">
            ${Object.entries(UPGRADES).map(([key, upgrade]) => {
              const owned = bought[key] || 0;
              const capped = key !== 'heal' && owned >= upgrade.max;
              const noWounds = key === 'heal' && summary.canHeal === false;
              const disabled = capped || noWounds || gold < upgrade.cost;
              const state = key === 'heal'
                ? (noWounds ? 'Party at full health' : 'Restore the party')
                : `${owned} / ${upgrade.max} purchased`;
              return `<button class="war-upgrade" data-overlay="upgrade-${key}" ${disabled ? 'disabled' : ''}>
                <span><strong>${esc(upgrade.name)}</strong><small>${esc(upgrade.desc)}</small></span>
                <span class="war-cost">${upgrade.cost} <em>gold</em><i>${state}</i></span>
              </button>`;
            }).join('')}
          </div>
        </div>`
      : '';
    const next = summary.nextBattle
      ? `<button class="btn primary" data-overlay="continue">Continue</button>`
      : `<button class="btn primary" data-overlay="campaign">Claim the Crown</button>`;
    this.showOverlay(`
      <p class="eyebrow">BATTLE ${['I', 'II', 'III'][summary.encounter.index - 1] || ''} CLEARED</p>
      <h2>Victory</h2>
      <p class="overlay-lede">${summary.nextBattle ? 'The field is quiet. The road bends deeper into the dark.' : 'The Hollow King is undone. The ashen crown is yours.'}</p>
      <div class="summary-grid">${rows}</div>
      ${levels}
      ${camp}
      <div class="overlay-actions">${next}</div>
    `);
  }

  showDefeat(encounter) {
    this.showOverlay(`
      <p class="eyebrow">DEFEAT</p>
      <h2 class="defeat-title">The party falls</h2>
      <p class="overlay-lede">${esc(encounter.name)} claims another oath. The initiative order ends here — but the crown waits.</p>
      <div class="overlay-actions">
        <button class="btn primary" data-overlay="retry">Retry Battle</button>
        <button class="btn ghost" data-overlay="title">Return to Title</button>
      </div>
    `, { small: true });
  }

  showCampaign(summary) {
    const best = summary.best
      ? `Best campaign: ${summary.best.rounds} rounds, ${summary.best.losses} ${summary.best.losses === 1 ? 'hero' : 'heroes'} lost`
      : 'First completed campaign.';
    this.showOverlay(`
      <p class="eyebrow">CAMPAIGN COMPLETE</p>
      <h2>The Hollow King <span>Falls</span></h2>
      <p class="overlay-lede">Three fields. One crown. The ash settles over the Bone Cathedral.</p>
      <div class="summary-grid">
        <div class="summary-row"><span>Total rounds</span><strong>${summary.rounds}</strong></div>
        <div class="summary-row"><span>Total damage</span><strong>${summary.damageDealt}</strong></div>
        <div class="summary-row"><span>Enemies defeated</span><strong>${summary.kills}</strong></div>
        <div class="summary-row"><span>Heroes lost</span><strong>${summary.alliesLost}</strong></div>
        <div class="summary-row"><span>Gold earned</span><strong>${summary.gold}</strong></div>
        <div class="summary-row"><span>Final level</span><strong>${summary.level}</strong></div>
      </div>
      <p class="overlay-sub">${esc(best)}</p>
      <div class="overlay-actions">
        <button class="btn primary" data-overlay="restart-campaign">Play Again</button>
        <button class="btn ghost" data-overlay="title">Return to Title</button>
      </div>
    `);
  }

  setEncounterTitle(name) {
    this.el.encounterTitle.textContent = name;
  }

  hideActionUI(hidden) {
    this.el.actionZone.style.visibility = hidden ? 'hidden' : 'visible';
    this.el.allyPanel?.classList.toggle('hidden', hidden);
    this.el.enemyPanel?.classList.toggle('hidden', hidden);
  }
}

Object.assign(exports, { HUD });

  });

  // ---- js/audio/sfx.js -------------------------------------------------
  __define("js/audio/sfx.js", function (module, exports, __require) {
// Procedural sound effects with Web Audio. No music, no external assets.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.noiseBuffer = null;
    this.unlocked = false;
    try {
      this.muted = localStorage.getItem('ashen-crown-muted') === '1';
    } catch {
      this.muted = false;
    }
  }

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.32;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.makeNoise();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.unlocked = true;
    return true;
  }

  makeNoise() {
    const length = Math.floor(this.ctx.sampleRate * 1.2);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.32;
    try {
      localStorage.setItem('ashen-crown-muted', muted ? '1' : '0');
    } catch {
      // Storage is optional.
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  tone(freq, duration, options = {}) {
    const ctx = this.ctx;
    const when = ctx.currentTime + (options.delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = options.type || 'sine';
    osc.frequency.setValueAtTime(freq, when);
    if (options.endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFreq), when + duration);
    const volume = options.gain ?? 0.08;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    let node = osc;
    if (options.filter) {
      const filter = ctx.createBiquadFilter();
      filter.type = options.filter;
      filter.frequency.setValueAtTime(options.filterFreq || 900, when);
      node.connect(filter);
      node = filter;
    }
    node.connect(gain);
    gain.connect(this.master);
    osc.start(when);
    osc.stop(when + duration + 0.02);
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Already disconnected.
      }
    };
  }

  noise(duration, options = {}) {
    const ctx = this.ctx;
    const when = ctx.currentTime + (options.delay || 0);
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = options.filter || 'lowpass';
    filter.frequency.setValueAtTime(options.freq || 1200, when);
    if (options.endFreq) filter.frequency.exponentialRampToValueAtTime(Math.max(40, options.endFreq), when + duration);
    filter.Q.value = options.q ?? 0.8;
    const gain = ctx.createGain();
    const volume = options.gain ?? 0.12;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(when);
    source.stop(when + duration + 0.02);
    source.onended = () => {
      try {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        // Already disconnected.
      }
    };
  }

  play(name, options = {}) {
    if (this.muted) return;
    if (!this.ensure()) return;
    if (this.ctx.state !== 'running') return;
    try {
      this.fire(name, options);
    } catch {
      // Sound is optional.
    }
  }

  fire(name, options = {}) {
    switch (name) {
      case 'click':
        this.tone(520, 0.06, { type: 'square', gain: 0.035, endFreq: 640 });
        break;
      case 'select':
        this.tone(700, 0.08, { type: 'triangle', gain: 0.05, endFreq: 880 });
        break;
      case 'invalid':
        this.tone(150, 0.16, { type: 'sawtooth', gain: 0.05, endFreq: 110 });
        break;
      case 'sword':
        this.noise(0.2, { filter: 'bandpass', freq: 2600, endFreq: 700, gain: 0.09, q: 1.2 });
        this.tone(220, 0.08, { type: 'triangle', gain: 0.02, endFreq: 160 });
        break;
      case 'bow':
        this.noise(0.16, { filter: 'highpass', freq: 1400, endFreq: 3200, gain: 0.06 });
        this.tone(320, 0.12, { type: 'triangle', gain: 0.04, endFreq: 180 });
        break;
      case 'fire':
        this.noise(0.5, { filter: 'lowpass', freq: 2200, endFreq: 260, gain: 0.14, q: 0.6 });
        this.tone(180, 0.4, { type: 'sawtooth', gain: 0.04, endFreq: 70 });
        break;
      case 'holy':
        this.tone(660, 0.5, { type: 'sine', gain: 0.06 });
        this.tone(990, 0.5, { type: 'sine', gain: 0.04, delay: 0.06 });
        this.tone(1320, 0.7, { type: 'sine', gain: 0.03, delay: 0.12 });
        break;
      case 'poison':
        this.noise(0.45, { filter: 'lowpass', freq: 700, endFreq: 180, gain: 0.11, q: 3 });
        this.tone(95, 0.3, { type: 'sine', gain: 0.035, endFreq: 60 });
        break;
      case 'hit':
        this.noise(0.16, { filter: 'lowpass', freq: 900, endFreq: 120, gain: options.crit ? 0.18 : 0.11 });
        this.tone(options.crit ? 90 : 120, 0.16, { type: 'square', gain: options.crit ? 0.09 : 0.055, endFreq: 50 });
        if (options.crit) this.tone(1400, 0.12, { type: 'triangle', gain: 0.04, endFreq: 600 });
        break;
      case 'heal':
        this.tone(523, 0.25, { type: 'sine', gain: 0.045 });
        this.tone(659, 0.3, { type: 'sine', gain: 0.04, delay: 0.08 });
        this.tone(784, 0.4, { type: 'sine', gain: 0.035, delay: 0.16 });
        break;
      case 'shield':
        this.tone(300, 0.25, { type: 'triangle', gain: 0.05, endFreq: 620 });
        this.noise(0.2, { filter: 'highpass', freq: 1200, gain: 0.03 });
        break;
      case 'death':
        this.tone(180, 0.6, { type: 'sawtooth', gain: 0.05, endFreq: 50, filter: 'lowpass', filterFreq: 600 });
        this.noise(0.4, { filter: 'lowpass', freq: 500, endFreq: 90, gain: 0.06 });
        break;
      case 'round':
        this.tone(70, 0.5, { type: 'sine', gain: 0.07, endFreq: 45 });
        this.tone(140, 0.3, { type: 'triangle', gain: 0.03 });
        break;
      case 'victory':
        [392, 523, 659, 784].forEach((freq, index) => {
          this.tone(freq, 0.6, { type: 'triangle', gain: 0.055, delay: index * 0.13 });
        });
        break;
      case 'defeat':
        [220, 196, 165, 110].forEach((freq, index) => {
          this.tone(freq, 0.7, { type: 'sawtooth', gain: 0.04, delay: index * 0.16, filter: 'lowpass', filterFreq: 700 });
        });
        break;
      case 'step':
        this.tone(80, 0.06, { type: 'sine', gain: 0.015, endFreq: 55 });
        break;
      case 'boss':
        this.tone(60, 0.9, { type: 'sawtooth', gain: 0.07, endFreq: 32, filter: 'lowpass', filterFreq: 300 });
        this.noise(0.7, { filter: 'lowpass', freq: 400, endFreq: 80, gain: 0.07 });
        break;
      case 'stun':
        this.tone(880, 0.15, { type: 'square', gain: 0.03, endFreq: 440 });
        break;
      default:
        break;
    }
  }

  silence() {
    if (!this.ctx) return;
    try {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
    } catch {
      // Ignore.
    }
  }

  restore() {
    if (!this.ctx || this.muted) return;
    try {
      this.master.gain.setTargetAtTime(0.32, this.ctx.currentTime, 0.05);
    } catch {
      // Ignore.
    }
  }
}

Object.assign(exports, { SoundEngine });

  });

  // ---- js/main.js ------------------------------------------------------
  __define("js/main.js", function (module, exports, __require) {
// Ashen Crown — application shell.
// Owns the campaign, player input, presentation timing, and the link between
// the pure simulation (js/battle) and the Canvas 2D / DOM presentation layers.

const { Battle } = __require("js/battle/sim.js");
const { chooseEnemyAction } = __require("js/battle/ai.js");
const { ABILITIES, ENCOUNTERS, STATUS_INFO, UPGRADES, createCampaignParty, grantCampaignXp, preparePartyForNextBattle } = __require("js/battle/data.js");
const { BattleScene } = __require("js/render/scene.js");
const { HUD } = __require("js/ui/hud.js");
const { SoundEngine } = __require("js/audio/sfx.js");

const TYPE_COLOR = {
  physical: 0xffd8a0,
  fire: 0xff7a24,
  cold: 0x8fe7d4,
  holy: 0xffe7a8,
  poison: 0x9bc24b,
  heal: 0xa8d98a,
};

const TYPE_SOUND = {
  physical: 'sword',
  fire: 'fire',
  cold: 'shield',
  holy: 'holy',
  poison: 'poison',
};

const cloneParty = (party) =>
  party.map((hero) => ({
    ...hero,
    damage: [...hero.damage],
    resist: { ...hero.resist },
    abilities: [...hero.abilities],
    traits: [...hero.traits],
  }));

const emptyCampaign = () => ({
  rounds: 0,
  damageDealt: 0,
  kills: 0,
  alliesLost: 0,
  gold: 0,
  upgrades: { sharpen: 0, armor: 0 },
});

class App {
  constructor() {
    this.scene = null;
    this.hud = null;
    this.sound = new SoundEngine();
    this.battle = null;
    this.party = createCampaignParty();
    this.partySnapshot = null;
    this.encounterIndex = 0;
    this.seed = 1;
    this.mode = 'title';
    this.overlay = 'title';
    this.busy = false;
    this.fast = false;
    this.paused = false;
    this.pausedFrom = null;
    this.pending = null;
    this.targetIndex = 0;
    this.hoverUid = null;
    this.campaign = emptyCampaign();
    this.lastSummary = null;
    this.token = 0;
    this.helpOrigin = 'title';
    this.rewardGranted = false;
  }

  boot() {
    const sceneEl = document.getElementById('scene');
    try {
      this.scene = new BattleScene(sceneEl);
    } catch (error) {
      const overlay = document.getElementById('overlay');
      const panel = document.getElementById('overlay-panel');
      if (panel && overlay) {
        panel.innerHTML =
          '<p class="eyebrow">RENDERER UNAVAILABLE</p><h2>Battlefield <span>offline</span></h2>' +
          '<p class="overlay-lede">The 2D battlefield could not start. ' +
          'Reload the page. If the problem persists, open the browser console and report the error below.</p>' +
          `<pre class="render-error">${String(error && error.message ? error.message : error)}</pre>`;
        overlay.classList.remove('hidden');
      }
      console.error(error);
      return;
    }

    this.hud = new HUD({
      onAction: (action) => this.handleAction(action),
      onAbility: (id) => this.handleAbility(id),
      onOverlay: (action) => this.handleOverlay(action),
      onPause: () => this.togglePause(),
      onHelp: () => this.handleHelp(),
      onMute: () => this.toggleMute(),
      onSpeed: () => this.toggleSpeed(),
      onInspect: (uid) => this.inspect(uid, true),
    });

    this.hud.setFast(this.fast);
    this.hud.setMuted(this.sound.muted);
    this.hud.hideActionUI(true);
    this.hud.showTitle();
    this.mode = 'title';
    this.overlay = 'title';

    this.bindSceneInput();
    this.bindGlobalInput();
    this.installInspectionApi();

    const unlock = () => {
      this.sound.ensure();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  // ---------------------------------------------------------------- campaign

  get encounter() {
    return ENCOUNTERS[this.encounterIndex] || null;
  }

  beginCampaign() {
    this.party = createCampaignParty();
    this.partySnapshot = null;
    this.campaign = emptyCampaign();
    this.encounterIndex = 0;
    this.seed = Math.floor(Math.random() * 2000000000) + 1;
    this.lastSummary = null;
    this.startEncounter(0);
  }

  startEncounter(index, seed = null) {
    this.token += 1;
    this.encounterIndex = Math.max(0, Math.min(ENCOUNTERS.length - 1, index));
    if (seed !== null) this.seed = seed;
    const encounter = this.encounter;
    this.partySnapshot = cloneParty(this.party);
    this.rewardGranted = false;
    this.pending = null;
    this.paused = false;
    this.pausedFrom = null;
    this.targetIndex = 0;
    this.hoverUid = null;

    const battleSeed = ((this.seed + this.encounterIndex * 7919) % 2147483647) || 1;
    this.battle = new Battle({
      encounter,
      party: cloneParty(this.party),
      seed: battleSeed,
    });

    this.scene.build(encounter.theme);
    this.scene.effects.clear();
    this.scene.spawnUnits(this.battle.units);
    this.scene.setActive(null);
    this.scene.clearTargets();
    this.scene.setHover(null);

    this.hud.setBattle(this.battle);
    this.hud.hideActionUI(false);
    this.hud.setBusy(true);
    this.hud.setFast(this.fast);
    this.hud.setMuted(this.sound.muted);
    this.hud.showIntro(this.battle);

    this.mode = 'intro';
    this.overlay = 'intro';
    this.busy = true;
    this.sound.play('click');
  }

  async beginBattle() {
    if (!this.battle || this.mode !== 'intro') return;
    this.hud.hideOverlay();
    this.overlay = null;
    this.mode = 'resolving';
    this.busy = true;
    this.hud.setBusy(true);

    const token = this.token;
    const events = this.battle.start();
    await this.playEvents(events, token);
    if (token !== this.token) return;
    if (this.battle.outcome) {
      await this.concludeBattle(token);
      return;
    }
    await this.battleLoop(token);
  }

  async battleLoop(token) {
    while (token === this.token) {
      if (!this.battle) return;
      if (this.battle.outcome) {
        await this.concludeBattle(token);
        return;
      }
      const unit = this.battle.currentUnit;
      if (!unit) {
        this.hud.flashHint('The initiative order has stalled.', true);
        return;
      }
      if (unit.side === 'ally') {
        this.beginPlayerTurn(unit);
        return;
      }
      await this.enemyTurn(unit, token);
    }
  }

  beginPlayerTurn(unit) {
    this.busy = false;
    this.mode = 'player';
    this.pending = null;
    this.hud.clearTargeting();
    this.hud.hideAbilityPopover();
    this.hud.setBusy(false);
    this.hud.render();
    this.scene.setActive(unit.uid);
    this.scene.clearTargets();
    this.scene.setHover(null);
    if (!this.hud.inspectUid) {
      this.hud.inspectUid = this.battle.enemies.find((enemy) => enemy.alive)?.uid || null;
    }
    this.hud.render();
  }

  async enemyTurn(unit, token) {
    this.busy = true;
    this.mode = 'enemy';
    this.pending = null;
    this.hud.setBusy(true);
    this.hud.clearTargeting();
    this.hud.hideAbilityPopover();
    this.scene.clearTargets();
    this.scene.setActive(unit.uid);
    this.hud.render();

    await this.wait(430, token);
    if (token !== this.token) return;

    const plan = chooseEnemyAction(this.battle, unit) || { action: 'defend' };
    let result = this.battle.performAction(unit.uid, plan.action, plan);
    if (!result.ok) {
      this.hud.flashHint(`${unit.name}: ${result.error}`, true);
      result = this.battle.performAction(unit.uid, 'defend');
    }
    await this.playEvents(result.events, token);
    if (token !== this.token) return;

    if (!this.battle.outcome) {
      const endEvents = this.battle.finishTurn();
      await this.playEvents(endEvents, token);
    }
  }

  async submitPlayerAction(action, options = {}, { fromTargeting = false } = {}) {
    if (!this.battle) return;
    if (!fromTargeting) {
      if (this.busy || this.mode !== 'player') return;
    }
    const actor = this.battle.currentUnit;
    if (!actor || actor.side !== 'ally') return;

    this.busy = true;
    this.mode = 'resolving';
    this.hud.setBusy(true);
    this.hud.hideTooltip();

    const token = this.token;
    const result = this.battle.performAction(actor.uid, action, options);
    if (!result.ok) {
      this.busy = false;
      this.mode = 'player';
      this.hud.setBusy(false);
      this.hud.flashHint(result.error || 'That action is not available.', true);
      this.sound.play('invalid');
      return;
    }

    await this.playEvents(result.events, token);
    if (token !== this.token) return;

    if (!this.battle.outcome) {
      const endEvents = this.battle.finishTurn();
      await this.playEvents(endEvents, token);
    }
    if (token !== this.token) return;

    if (this.battle.outcome) {
      await this.concludeBattle(token);
      return;
    }
    await this.battleLoop(token);
  }

  async concludeBattle(token) {
    if (!this.battle) return;
    this.busy = true;
    this.mode = this.battle.outcome;
    this.hud.setBusy(true);
    this.hud.clearTargeting();
    this.scene.clearTargets();
    this.scene.setActive(null);
    this.pending = null;

    const outcome = this.battle.outcome;
    this.sound.play(outcome === 'victory' ? 'victory' : 'defeat');
    await this.wait(650, token);
    if (token !== this.token) return;

    if (outcome === 'victory') {
      if (!this.rewardGranted) this.buildVictorySummary();
      this.showVictoryScreen();
    } else {
      this.hud.showDefeat(this.battle.encounter);
      this.overlay = 'defeat';
      this.mode = 'defeat';
    }
  }

  buildVictorySummary() {
    const battle = this.battle;
    const reward = battle.encounter.reward;
    this.rewardGranted = true;

    for (const hero of this.party) {
      const unit = battle.allies.find((ally) => ally.id === hero.id);
      if (!unit) continue;
      hero.hp = unit.hp;
      hero.maxHp = unit.maxHp;
      hero.level = unit.level;
      hero.damage = [...unit.damage];
    }
    const levels = grantCampaignXp(this.party, reward.xp);
    const nextBattle = this.encounterIndex + 1 < ENCOUNTERS.length;

    this.campaign.rounds += battle.stats.rounds;
    this.campaign.damageDealt += battle.stats.damageDealt;
    this.campaign.kills += battle.stats.kills;
    this.campaign.alliesLost += battle.stats.alliesLost;
    this.campaign.gold += reward.gold;

    this.lastSummary = {
      encounter: battle.encounter,
      rounds: battle.stats.rounds,
      damageDealt: battle.stats.damageDealt,
      damageTaken: battle.stats.damageTaken,
      kills: battle.stats.kills,
      alliesLost: battle.stats.alliesLost,
      xp: reward.xp,
      gold: reward.gold,
      levels,
      nextBattle,
    };
  }

  showVictoryScreen() {
    if (!this.lastSummary) return;
    const healable = this.party.some((hero) => (hero.hp ?? hero.maxHp) < hero.maxHp);
    this.hud.showVictory({
      ...this.lastSummary,
      goldRemaining: this.campaign.gold,
      upgrades: this.campaign.upgrades,
      canHeal: healable,
    });
    this.overlay = 'victory';
    this.mode = 'victory';
  }

  applyUpgrade(kind) {
    const upgrade = UPGRADES[kind];
    if (!upgrade || !this.lastSummary) return;
    const bought = this.campaign.upgrades[kind] || 0;
    if (bought >= upgrade.max) {
      this.hud.flashHint(`${upgrade.name} is already at its limit.`, true);
      return;
    }
    if (kind === 'heal' && !this.party.some((hero) => (hero.hp ?? hero.maxHp) < hero.maxHp)) {
      this.hud.flashHint('The party is already at full health.', true);
      return;
    }
    if (this.campaign.gold < upgrade.cost) {
      this.hud.flashHint(`Not enough gold for ${upgrade.name}.`, true);
      return;
    }
    this.campaign.gold -= upgrade.cost;
    this.campaign.upgrades[kind] = bought + 1;
    for (const hero of this.party) {
      if (kind === 'sharpen') {
        hero.damage = hero.damage.map((value) => value + 2);
      } else if (kind === 'armor') {
        hero.armor += 2;
      } else {
        hero.hp = hero.maxHp;
      }
    }
    this.lastSummary.goldSpent = (this.lastSummary.goldSpent || 0) + upgrade.cost;
    this.sound.play('victory');
    this.showVictoryScreen();
    this.hud.flashHint(`${upgrade.name} purchased.`, false);
  }

  continueCampaign() {
    if (!this.battle || this.battle.outcome !== 'victory') return;
    const next = this.encounterIndex + 1;
    if (next >= ENCOUNTERS.length) {
      this.showCampaignScreen();
      return;
    }
    preparePartyForNextBattle(this.party);
    this.startEncounter(next);
  }

  showCampaignScreen() {
    const best = this.recordBest();
    const level = Math.max(...this.party.map((hero) => hero.level));
    this.hud.showCampaign({
      rounds: this.campaign.rounds,
      damageDealt: this.campaign.damageDealt,
      kills: this.campaign.kills,
      alliesLost: this.campaign.alliesLost,
      gold: this.campaign.gold,
      level,
      best: best,
    });
    this.overlay = 'campaign';
    this.mode = 'campaign';
    this.sound.play('victory');
  }

  recordBest() {
    const current = { rounds: this.campaign.rounds, losses: this.campaign.alliesLost };
    let best = null;
    try {
      best = JSON.parse(localStorage.getItem('ashen-crown-best') || 'null');
    } catch {
      best = null;
    }
    if (!best || typeof best !== 'object' || typeof best.rounds !== 'number') best = null;
    if (!best || current.rounds < best.rounds || (current.rounds === best.rounds && current.losses < best.losses)) {
      best = current;
      try {
        localStorage.setItem('ashen-crown-best', JSON.stringify(best));
      } catch {
        // Storage is optional.
      }
    }
    return best ? { rounds: best.rounds, losses: best.losses } : null;
  }

  returnToTitle() {
    this.token += 1;
    this.paused = false;
    this.busy = false;
    this.pending = null;
    this.pausedFrom = null;
    this.overlay = 'title';
    this.mode = 'title';
    if (this.battle) {
      this.battle = null;
      this.scene.effects.clear();
      this.scene.spawnUnits([]);
      this.scene.build('ruins');
      this.scene.setActive(null);
    }
    this.hud.hideActionUI(true);
    this.hud.clearTargeting();
    this.hud.hideAbilityPopover();
    this.hud.hideTooltip();
    this.hud.setBusy(false);
    this.hud.showTitle();
  }

  restartEncounter() {
    if (!this.battle) return;
    this.party = this.partySnapshot ? cloneParty(this.partySnapshot) : this.party;
    this.paused = false;
    this.startEncounter(this.encounterIndex);
  }

  // ---------------------------------------------------------------- actions

  handleAction(action) {
    if (!this.battle || this.busy || this.mode !== 'player') return;
    const actor = this.battle.currentUnit;
    if (!actor) return;

    if (action === 'attack') {
      const valid = this.battle.getValidTargets(actor, 'attack').map((unit) => unit.uid);
      this.startTargeting('attack', null, valid, 'Choose an enemy to strike.');
      return;
    }
    if (action === 'ability') {
      const entries = this.battle
        .getActionsFor(actor)
        .find((entry) => entry.id === 'ability')?.abilities || [];
      const open = this.hud.el.abilityPopover.classList.contains('hidden');
      this.hud.showAbilityPopover(actor, entries, open);
      this.hud.hideTooltip();
      return;
    }
    if (action === 'defend') {
      this.submitPlayerAction('defend');
      this.sound.play('click');
      return;
    }
    if (action === 'wait') {
      this.submitPlayerAction('wait');
      this.sound.play('click');
      return;
    }
    if (action === 'shift') {
      this.submitPlayerAction('shift');
      this.sound.play('click');
    }
  }

  handleAbility(id) {
    if (!this.battle || this.busy || this.mode !== 'player') return;
    const actor = this.battle.currentUnit;
    const ability = ABILITIES[id];
    if (!actor || !ability) return;
    if (!this.battle.abilityAvailable(actor, id)) {
      this.hud.flashHint(`${ability.name} is not ready.`, true);
      this.sound.play('invalid');
      return;
    }
    const valid = this.battle.getValidTargets(actor, 'ability', id);
    if (this.battle.abilityNeedsTarget(ability)) {
      if (!valid.length) {
        this.hud.flashHint(`No valid target for ${ability.name}.`, true);
        this.sound.play('invalid');
        return;
      }
      if (ability.shape === 'self') {
        this.submitPlayerAction('ability', { abilityId: id, targetId: actor.uid });
        this.sound.play('click');
        return;
      }
      this.startTargeting('ability', id, valid.map((unit) => unit.uid), `${ability.name} — choose a target.`);
      return;
    }
    this.submitPlayerAction('ability', { abilityId: id });
    this.sound.play('click');
  }

  startTargeting(action, abilityId, validUids, hintText) {
    if (!this.battle || this.busy) return;
    const actor = this.battle.currentUnit;
    if (!actor) return;
    const valid = this.battle.getValidTargets(actor, action, abilityId);
    const validIds = valid.map((unit) => unit.uid);
    // Never trust the caller's list: it may be null (attack) or stale.
    const candidates = Array.isArray(validUids)
      ? validUids.filter((uid) => validIds.includes(uid))
      : validIds;
    if (!candidates.length) {
      this.hud.flashHint(action === 'attack' ? 'No reachable enemy.' : 'No valid target.', true);
      this.sound.play('invalid');
      return;
    }

    this.pending = { action, abilityId, valid: candidates };
    this.targetIndex = 0;
    this.busy = true;
    this.hud.setBusy(true);
    this.hud.setPending(action);
    this.hud.showTargeting(hintText, candidates.length);
    this.scene.setTargets(candidates);

    const firstUid = candidates[0];
    const firstUnit = this.battle.getUnit(firstUid);
    if (firstUnit) this.hud.inspect(firstUid, false);

    const banner = this.hud.el.turnBanner;
    banner.textContent = 'CHOOSE A TARGET';
    banner.classList.toggle('enemy', false);
    this.sound.play('select');
  }

  cancelTargeting() {
    if (!this.pending) return;
    this.pending = null;
    this.hud.clearTargeting();
    this.scene.clearTargets();
    this.busy = false;
    this.mode = 'player';
    this.hud.setBusy(false);
    this.hud.render();
    this.hud.flashHint('Targeting cancelled.', false);
    this.sound.play('click');
  }

  cycleTarget() {
    if (!this.pending) return;
    const valid = this.pending.valid;
    if (!valid.length) return;
    this.targetIndex = (this.targetIndex + 1) % valid.length;
    const uid = valid[this.targetIndex];
    const unit = this.battle.getUnit(uid);
    if (unit) this.hud.inspect(uid, false);
    this.sound.play('click');
  }

  confirmTarget() {
    if (!this.pending) return;
    const uid = this.pending.valid[this.targetIndex] || this.pending.valid[0];
    this.chooseTarget(uid);
  }

  chooseTarget(uid) {
    if (!this.pending) return;
    const plan = this.pending;
    if (!plan.valid.includes(uid)) {
      this.hud.flashHint('That unit is not a legal target.', true);
      this.sound.play('invalid');
      return;
    }
    this.pending = null;
    this.hud.clearTargeting();
    this.scene.clearTargets();
    void this.submitPlayerAction(plan.action, { targetId: uid, abilityId: plan.abilityId }, { fromTargeting: true });
  }

  clearTargeting() {
    this.pending = null;
    this.hud.clearTargeting();
    this.scene.clearTargets();
  }

  inspect(uid, announce = false) {
    if (!uid || !this.battle) return;
    const unit = this.battle.getUnit(uid);
    if (!unit) return;
    this.hud.inspectUid = uid;
    this.hud.renderPanels();
    if (announce) this.sound.play('click');
  }

  // ---------------------------------------------------------------- input

  bindSceneInput() {
    const canvas = this.scene.renderer.domElement;
    let lastMove = 0;

    canvas.addEventListener('pointermove', (event) => {
      if (!this.battle || this.paused) return;
      if (event.pointerType === 'touch') return;
      const now = performance.now();
      if (now - lastMove < 40) return;
      lastMove = now;
      const uid = this.scene.pick(event.clientX, event.clientY);
      if (uid !== this.hoverUid) {
        this.hoverUid = uid;
        this.scene.setHover(uid);
      }
      const unit = uid ? this.battle.getUnit(uid) : null;
      if (unit) this.hud.showTooltip(unit, event.clientX, event.clientY);
      else this.hud.hideTooltip();
      canvas.style.cursor = this.pending?.valid.includes(uid) ? 'crosshair' : 'pointer';
    });

    canvas.addEventListener('pointerleave', () => {
      this.hoverUid = null;
      this.scene.setHover(null);
      this.hud.hideTooltip();
      canvas.style.cursor = 'default';
    });

    canvas.addEventListener('click', (event) => {
      if (!this.battle || this.paused) return;
      const uid = this.scene.pick(event.clientX, event.clientY);
      if (this.pending) {
        if (uid) this.chooseTarget(uid);
        else this.hud.flashHint('Choose a highlighted target.', true);
        return;
      }
      if (uid) {
        this.inspect(uid, true);
        const unit = this.battle.getUnit(uid);
        if (unit) this.hud.showTooltip(unit, event.clientX, event.clientY);
      }
    });
  }

  bindGlobalInput() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      const key = event.key;

      if (key === 'm' || key === 'M') {
        this.toggleMute();
        return;
      }
      if (key === 'f' || key === 'F') {
        this.toggleSpeed();
        return;
      }
      if (key === 'h' || key === 'H') {
        this.handleHelp();
        return;
      }
      if (key === 'Escape') {
        event.preventDefault();
        this.handleEscape();
        return;
      }

      if (!this.battle || this.paused) return;
      if (this.pending) {
        if (key === 'Tab') {
          event.preventDefault();
          this.cycleTarget();
          return;
        }
        if (key === 'Enter') {
          event.preventDefault();
          this.confirmTarget();
          return;
        }
        if (key === 'Escape') return;
        if (key === '1') {
          event.preventDefault();
          this.cancelTargeting();
          return;
        }
      }

      if (!this.battle || this.busy || this.mode !== 'player') return;
      const actions = { 1: 'attack', 2: 'ability', 3: 'defend', 4: 'wait', 5: 'shift' };
      if (actions[key]) {
        event.preventDefault();
        this.handleAction(actions[key]);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sound.silence();
        if (this.canPause()) this.pauseBattle();
      } else {
        this.sound.restore();
      }
    });
  }

  handleEscape() {
    if (this.hud.el.abilityPopover && !this.hud.el.abilityPopover.classList.contains('hidden')) {
      this.hud.hideAbilityPopover();
      return;
    }
    if (this.pending) {
      this.cancelTargeting();
      return;
    }
    if (this.overlay === 'pause' || this.overlay === 'help-battle') {
      this.resumeBattle();
      return;
    }
    if (this.overlay === 'help-title') {
      this.closeHelp();
      return;
    }
    if (this.overlay) {
      if (this.overlay === 'victory') {
        this.showVictoryScreen();
        return;
      }
      if (this.overlay === 'defeat') {
        this.hud.showDefeat(this.battle?.encounter || ENCOUNTERS[0]);
        this.overlay = 'defeat';
        return;
      }
      if (this.overlay === 'campaign') {
        this.showCampaignScreen();
        return;
      }
      return;
    }
    if (this.canPause()) this.pauseBattle();
  }

  // ---------------------------------------------------------------- overlays

  handleOverlay(action) {
    this.sound.ensure();
    this.sound.play('click');
    switch (action) {
      case 'start':
        this.beginCampaign();
        break;
      case 'help-title':
        this.showHelpScreen('title');
        break;
      case 'help-pause':
        this.showHelpScreen('battle');
        break;
      case 'help-back':
        this.closeHelp();
        break;
      case 'begin':
        this.beginBattle();
        break;
      case 'resume':
        this.resumeBattle();
        break;
      case 'restart':
      case 'retry':
        this.restartEncounter();
        break;
      case 'title':
        this.returnToTitle();
        break;
      case 'continue':
        this.continueCampaign();
        break;
      case 'upgrade-sharpen':
      case 'upgrade-armor':
      case 'upgrade-heal':
        this.applyUpgrade(action.replace('upgrade-', ''));
        break;
      case 'campaign':
        this.showCampaignScreen();
        break;
      case 'restart-campaign':
        this.beginCampaign();
        break;
      default:
        break;
    }
  }

  handleHelp() {
    if (this.overlay === 'help-title' || this.overlay === 'help-battle') return;
    if (this.battle && !this.battle.outcome) {
      this.showHelpScreen('battle');
      return;
    }
    this.showHelpScreen(this.battle?.outcome ? 'result' : 'title');
  }

  showHelpScreen(origin) {
    this.helpOrigin = origin;
    if (origin === 'battle') {
      if (!this.battle || this.battle.outcome) return;
      if (!this.paused) {
        this.pausedFrom = this.mode;
        this.paused = true;
        this.mode = 'paused';
      }
      this.hud.showHelp(true);
      this.overlay = 'help-battle';
      return;
    }
    this.hud.showHelp(origin === 'battle');
    this.overlay = origin === 'battle' ? 'help-battle' : 'help-title';
  }

  closeHelp() {
    if (this.helpOrigin === 'battle') {
      this.resumeBattle();
      return;
    }
    if (this.helpOrigin === 'result') {
      if (this.battle?.outcome === 'victory') this.showVictoryScreen();
      else if (this.battle?.outcome === 'defeat') {
        this.hud.showDefeat(this.battle.encounter);
        this.overlay = 'defeat';
        this.mode = 'defeat';
      } else {
        this.returnToTitle();
      }
      return;
    }
    this.hud.showTitle();
    this.overlay = 'title';
    this.mode = 'title';
  }

  canPause() {
    if (!this.battle || this.battle.outcome) return false;
    if (this.paused) return false;
    if (!['player', 'enemy', 'resolving'].includes(this.mode)) return false;
    // Enemy turns and animations are exactly when a player may want to stop;
    // the presentation loop already blocks inside wait() while paused.
    return true;
  }

  pauseBattle() {
    if (!this.canPause()) return;
    this.pausedFrom = this.mode;
    this.paused = true;
    this.mode = 'paused';
    this.hud.showPause();
    this.overlay = 'pause';
    this.sound.play('click');
  }

  resumeBattle() {
    if (!this.battle) return;
    if (this.battle.outcome) {
      if (this.battle.outcome === 'victory') this.showVictoryScreen();
      else {
        this.hud.showDefeat(this.battle.encounter);
        this.overlay = 'defeat';
        this.mode = 'defeat';
      }
      return;
    }
    this.paused = false;
    this.mode = this.pausedFrom || (this.battle.currentUnit?.side === 'ally' ? 'player' : 'enemy');
    this.pausedFrom = null;
    this.overlay = null;
    this.hud.hideOverlay();
    this.hud.setBusy(this.mode !== 'player');
    this.hud.render();
    this.sound.play('click');
  }

  togglePause() {
    if (this.overlay === 'pause' || this.overlay === 'help-battle') {
      this.resumeBattle();
      return;
    }
    if (this.canPause()) this.pauseBattle();
  }

  toggleMute() {
    const muted = this.sound.toggleMuted();
    this.hud.setMuted(muted);
    if (!muted) this.sound.play('click');
  }

  toggleSpeed() {
    this.fast = !this.fast;
    this.hud.setFast(this.fast);
    this.hud.flashHint(this.fast ? 'Fast presentation enabled.' : 'Normal presentation.', false);
    this.sound.play('click');
  }

  // -------------------------------------------------------------- presentation

  async wait(ms, token) {
    let remaining = Math.max(0, ms * (this.fast ? 0.42 : 1));
    while (remaining > 0) {
      if (token !== undefined && token !== this.token) return;
      if (!this.paused) {
        const step = Math.min(remaining, 55);
        await new Promise((resolve) => setTimeout(resolve, step));
        remaining -= step;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }
  }

  async playEvents(events, token) {
    if (!events || !events.length) return;
    for (const event of events) {
      if (token !== this.token) return;
      switch (event.type) {
        case 'round':
          this.hud.render();
          this.hud.flashHint(`Round ${event.round} begins.`);
          this.sound.play('round');
          await this.wait(320, token);
          break;
        case 'turn': {
          this.scene.setActive(event.unitId);
          this.hud.render();
          const unit = this.battle.getUnit(event.unitId);
          if (unit?.side === 'enemy') await this.wait(220, token);
          else await this.wait(90, token);
          break;
        }
        case 'action':
          await this.presentAction(event, token);
          break;
        case 'damage':
          await this.presentDamage(event, token);
          break;
        case 'heal':
          this.presentHeal(event);
          await this.wait(220, token);
          break;
        case 'status':
          this.presentStatus(event);
          await this.wait(150, token);
          break;
        case 'statusEnd':
          this.hud.render();
          break;
        case 'shift':
          this.scene.syncSlots();
          this.sound.play('step');
          this.hud.render();
          await this.wait(360, token);
          break;
        case 'skip':
          this.presentSkip(event);
          await this.wait(320, token);
          break;
        case 'death':
          this.presentDeath(event);
          await this.wait(620, token);
          break;
        case 'victory':
        case 'defeat':
          this.hud.render();
          await this.wait(520, token);
          break;
        case 'log':
          this.hud.renderLog();
          break;
        default:
          break;
      }
    }
    this.hud.render();
  }

  async presentAction(event, token) {
    const actor = this.battle.getUnit(event.actorId);
    const view = this.scene.getView(event.actorId);
    if (!actor || !view) return;
    const target = event.targetIds?.[0] ? this.battle.getUnit(event.targetIds[0]) : null;
    const targetView = target ? this.scene.getView(target.uid) : null;

    if (event.action === 'attack') {
      view.playAction('attack', targetView);
      this.sound.play(actor.range === 'melee' ? 'sword' : 'bow');
      if (actor.range !== 'melee') {
        const from = this.scene.worldPosition(actor.uid);
        const to = target ? this.scene.worldPosition(target.uid) : null;
        if (from && to) {
          this.scene.effects.projectile(from, to, TYPE_COLOR[actor.damageType] || TYPE_COLOR.physical, actor.range === 'ranged' ? 'arrow' : 'orb');
        }
      }
      await this.wait(actor.range === 'melee' ? 230 : 180, token);
      return;
    }

    if (event.action === 'ability') {
      const ability = ABILITIES[event.abilityId];
      view.playAction('ability', targetView, event.abilityId);
      const type = ability?.damageType || (ability?.kind === 'heal' ? 'heal' : 'holy');
      if (ability?.kind === 'damage') this.sound.play(TYPE_SOUND[type] || 'fire');
      else if (ability?.kind === 'heal') this.sound.play('heal');
      else if (ability?.kind === 'debuff') this.sound.play('poison');
      else this.sound.play('shield');

      if (ability?.kind === 'damage') {
        const from = this.scene.worldPosition(actor.uid);
        for (const targetId of event.targetIds || []) {
          const targetUnit = this.battle.getUnit(targetId);
          if (!targetUnit) continue;
          const to = this.scene.worldPosition(targetUnit.uid);
          if (!from || !to) continue;
          const color = TYPE_COLOR[type] || TYPE_COLOR.physical;
          if (type === 'holy') {
            const sky = { x: from.x, y: from.y - 190, z: 0 };
            this.scene.effects.beam(sky, to, color, 0.3);
          } else {
            this.scene.effects.projectile(from, to, color, 'orb');
          }
        }
        if (ability.shape === 'allAllies' || ability.shape === 'self') {
          this.scene.effects.spell(this.scene.worldPosition(actor.uid), type);
        }
      } else if (ability?.kind === 'heal') {
        // Individual heal events carry targetId and are presented by presentHeal().
        // The action event only knows the target list, so do not spawn a second burst here.
      } else if (ability?.kind === 'buff' || ability?.kind === 'debuff') {
        const focusId = event.targetIds?.[0] || actor.uid;
        const focus = this.scene.worldPosition(focusId);
        if (focus) this.scene.effects.spell(focus, type === 'physical' ? 'holy' : type);
      }
      await this.wait(330, token);
      return;
    }

    if (event.action === 'defend') {
      view.playAction('defend');
      this.sound.play('shield');
      this.floatOver(actor.uid, 'GUARD', 'status');
      await this.wait(220, token);
      return;
    }

    if (event.action === 'wait') {
      this.floatOver(actor.uid, 'WAIT', 'status');
      this.sound.play('click');
      await this.wait(160, token);
      return;
    }

    if (event.action === 'shift') {
      this.sound.play('step');
      this.hud.render();
      await this.wait(120, token);
    }
  }

  async presentDamage(event, token) {
    const unit = this.battle.getUnit(event.targetId);
    if (!unit) return;
    const view = this.scene.getView(event.targetId);
    const color = TYPE_COLOR[event.damageType] || TYPE_COLOR.physical;

    if (view) {
      view.playHit(Boolean(event.crit));
      const impact = this.scene.worldPosition(event.targetId);
      if (impact) this.scene.effects.impact(impact, event.damageType, Boolean(event.crit));
    }
    this.sound.play('hit', { crit: Boolean(event.crit) });
    if (event.crit || event.amount >= 45) this.scene.shake(event.crit ? 0.24 : 0.14);

    if (event.amount > 0) {
      this.floatOver(event.targetId, event.crit ? `-${event.amount}!` : `-${event.amount}`, event.crit ? 'crit' : 'damage');
    }
    if (event.absorbed > 0) {
      this.floatOver(event.targetId, `⊘ ${event.absorbed}`, 'absorb', 26);
    }
    if (event.amount > 0 || event.absorbed > 0) {
      this.hud.render();
      this.hud.renderQueue();
    }
    await this.wait(event.crit ? 300 : 210, token);
  }

  presentHeal(event) {
    const healedId = event.targetId;
    const position = healedId ? this.scene.worldPosition(healedId) : null;
    if (position) this.scene.effects.heal(position);
    if (healedId) this.floatOver(healedId, `+${event.amount}`, 'heal');
    this.sound.play('heal');
    this.hud.render();
  }

  presentStatus(event) {
    const info = STATUS_INFO[event.status];
    const label = info ? `${info.icon} ${info.name}` : event.status;
    this.floatOver(event.unitId, label, 'status');
    if (event.status === 'stun') this.sound.play('stun');
    else if (event.status === 'shield') this.sound.play('shield');
    else if (event.status === 'poison' || event.status === 'burn') this.sound.play('poison');
    else if (event.status === 'warcry' || event.status === 'enrage') this.sound.play('boss');
    this.hud.render();
  }

  presentSkip(event) {
    this.floatOver(event.unitId, 'STUNNED', 'status');
    this.sound.play('stun');
    this.hud.render();
  }

  presentDeath(event) {
    const view = this.scene.getView(event.unitId);
    if (view) view.playDeath();
    const unit = this.battle.getUnit(event.unitId);
    if (unit) {
      this.hud.inspectUid = this.battle.enemies.find((enemy) => enemy.alive)?.uid || this.hud.inspectUid;
    }
    this.sound.play('death');
    this.scene.shake(0.18);
    this.hud.render();
  }

  floatOver(uid, text, kind = 'damage', offsetY = 0) {
    const position = this.scene.worldPosition(uid);
    if (!position) return;
    const screen = this.scene.project(position);
    if (!screen.visible) return;
    const canvas = this.scene.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    this.hud.floatAt(
      rect.left + screen.x + (Math.random() - 0.5) * 18,
      rect.top + screen.y - 14 + offsetY,
      text,
      kind,
    );
  }

  // ------------------------------------------------------------- inspection

  installInspectionApi() {
    const app = this;
    window.__combat = {
      get state() {
        return {
          mode: app.mode,
          overlay: app.overlay,
          busy: app.busy,
          paused: app.paused,
          fast: app.fast,
          round: app.battle?.round ?? 0,
          phase: app.battle?.phase ?? 'idle',
          outcome: app.battle?.outcome ?? null,
          activeUid: app.battle?.currentUnit?.uid ?? null,
          pending: app.pending
            ? {
                action: app.pending.action,
                abilityId: app.pending.abilityId,
                valid: Array.isArray(app.pending.valid) ? [...app.pending.valid] : [],
              }
            : null,
          encounter: app.encounter?.id ?? null,
          encounterIndex: app.encounterIndex,
        };
      },
      snapshot: () => app.battle?.snapshot() ?? null,
      actions: () => {
        if (!app.battle?.currentUnit) return [];
        return app.battle.getActionsFor(app.battle.currentUnit);
      },
      targets: (action = 'attack', abilityId = null) => {
        if (!app.battle?.currentUnit) return [];
        return app.battle.getValidTargets(app.battle.currentUnit, action, abilityId).map((unit) => unit.uid);
      },
      startEncounter: (index = 0, seed = null) => {
        if (!app.party) app.party = createCampaignParty();
        app.startEncounter(index, seed ?? undefined);
        return app.state;
      },
      begin: () => app.beginBattle(),
      act: (action, targetId = null, abilityId = null) => app.submitPlayerAction(action, { targetId, abilityId }),
      chooseTarget: (uid) => app.chooseTarget(uid),
      cancel: () => app.cancelTargeting(),
      pause: () => app.pauseBattle(),
      resume: () => app.resumeBattle(),
      restart: () => app.restartEncounter(),
      title: () => app.returnToTitle(),
      setFast: (fast) => {
        app.fast = Boolean(fast);
        app.hud.setFast(app.fast);
      },
      setMuted: (muted) => {
        app.sound.setMuted(Boolean(muted));
        app.hud.setMuted(app.sound.muted);
      },
      inspect: (uid) => app.inspect(uid, false),
      party: () => cloneParty(app.party),
    };
  }
}

const app = new App();
app.boot();

  });

  __require("js/main.js");
})();
