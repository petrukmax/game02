// Ashen Crown — application shell.
// Owns the campaign, player input, presentation timing, and the link between
// the pure simulation (js/battle) and the Canvas 2D / DOM presentation layers.

import { Battle } from './battle/sim.js';
import { chooseEnemyAction } from './battle/ai.js';
import { ABILITIES, ENCOUNTERS, STATUS_INFO, UPGRADES, createCampaignParty, grantCampaignXp, preparePartyForNextBattle } from './battle/data.js';
import { BattleScene } from './render/scene.js';
import { HUD } from './ui/hud.js';
import { SoundEngine } from './audio/sfx.js';

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
