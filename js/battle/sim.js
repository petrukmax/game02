// Authoritative turn-based battle simulation.
// No DOM, no Three.js. Everything here is deterministic given the seed and action sequence.

import { ABILITIES, ENEMY_TEMPLATES, HERO_TEMPLATES, SLOT_ORDER, STATUS_INFO, cloneTemplate } from './data.js';
import { RNG } from '../core/rng.js';

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

export class Battle {
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
