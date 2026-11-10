import test from 'node:test';
import assert from 'node:assert/strict';

import { Battle } from '../js/battle/sim.js';
import { chooseEnemyAction } from '../js/battle/ai.js';
import { ABILITIES, ENCOUNTERS, createCampaignParty } from '../js/battle/data.js';

const watchtower = ENCOUNTERS[0];
const marsh = ENCOUNTERS[1];
const cathedral = ENCOUNTERS[2];

function newBattle(encounter = watchtower, seed = 1234, party = createCampaignParty()) {
  return new Battle({ encounter, seed, party });
}

function findUnit(battle, side, id) {
  return battle.units.find((unit) => unit.side === side && unit.id === id);
}

function allyPolicy(battle) {
  const unit = battle.currentUnit;
  const friends = battle.allies.filter((ally) => ally.alive);
  const wounded = friends
    .filter((ally) => ally.hp / ally.maxHp < 0.62)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

  const abilityReady = (id) => battle.abilityAvailable(unit, id);

  if (wounded && unit.abilities.includes('mend') && abilityReady('mend')) {
    return { action: 'ability', abilityId: 'mend', targetId: wounded.uid };
  }
  if (unit.id === 'aldric' && battle.round === 1 && abilityReady('war_cry')) {
    return { action: 'ability', abilityId: 'war_cry' };
  }
  if (unit.id === 'bran' && battle.round === 1 && abilityReady('shield_wall')) {
    return { action: 'ability', abilityId: 'shield_wall' };
  }
  if (unit.id === 'oszar' && abilityReady('flame_wave')) {
    const targets = battle.getValidTargets(unit, 'ability', 'flame_wave');
    if (targets.length >= 2) return { action: 'ability', abilityId: 'flame_wave' };
  }
  if (unit.id === 'mirelle' && abilityReady('piercing_shot')) {
    const targets = battle.getValidTargets(unit, 'ability', 'piercing_shot');
    const target = targets.sort((a, b) => a.hp - b.hp)[0];
    if (target) return { action: 'ability', abilityId: 'piercing_shot', targetId: target.uid };
  }
  if (unit.id === 'vela' && abilityReady('smite')) {
    const targets = battle.getValidTargets(unit, 'ability', 'smite');
    const target = targets.find((enemy) => enemy.traits.includes('undead')) || targets[0];
    if (target) return { action: 'ability', abilityId: 'smite', targetId: target.uid };
  }

  const targets = battle.getValidTargets(unit, 'attack');
  if (!targets.length) return { action: 'defend' };
  const target = targets.sort((a, b) => a.hp - b.hp)[0];
  return { action: 'attack', targetId: target.uid };
}

function runToEnd(seed = 7, encounter = watchtower) {
  const battle = newBattle(encounter, seed);
  battle.start();
  let guard = 0;
  while (!battle.outcome && guard < 400) {
    guard += 1;
    const unit = battle.currentUnit;
    assert.ok(unit, 'A battle must always have a current unit.');
    const plan =
      unit.side === 'ally' ? allyPolicy(battle) : chooseEnemyAction(battle, unit);
    assert.ok(plan, `AI must produce a plan for ${unit.name}`);
    const result = battle.performAction(unit.uid, plan.action, plan);
    assert.ok(result.ok, `${unit.name} action rejected: ${result.error}`);
    if (!battle.outcome) battle.finishTurn();
  }
  assert.ok(battle.outcome, `Battle did not finish in 400 actions (seed ${seed}).`);
  return battle;
}

test('initiative order follows initiative, side, and slot ties', () => {
  const battle = newBattle();
  battle.start();
  const order = battle.order.map((unit) => `${unit.side}:${unit.name}:${unit.slot}`);
  assert.deepEqual(order, [
    'ally:Mirelle:B1',
    'enemy:Crossbowman:B1',
    'enemy:Crossbowman:B2',
    'ally:Oszar:B0',
    'enemy:Brigand:F0',
    'enemy:Brigand:B0',
    'ally:Aldric:F1',
    'ally:Vela:B2',
    'enemy:Ghoul:F1',
    'ally:Bran:F0',
  ]);
  assert.equal(battle.currentUnit.name, 'Mirelle');
  assert.equal(battle.phase, 'player');
  assert.equal(battle.round, 1);
});

test('melee cannot reach the back rank until the front rank is dead', () => {
  const battle = newBattle();
  battle.start();
  const aldric = findUnit(battle, 'ally', 'aldric');
  const backBrigand = battle.units.find(
    (unit) => unit.side === 'enemy' && unit.id === 'brigand' && unit.rank === 'B',
  );
  let targets = battle.getValidTargets(aldric, 'attack').map((unit) => unit.uid);
  assert.ok(targets.length > 0);
  assert.ok(!targets.includes(backBrigand.uid), 'Back rank must be protected.');

  for (const enemy of battle.enemies) {
    if (enemy.rank === 'F') enemy.alive = false;
  }
  targets = battle.getValidTargets(aldric, 'attack').map((unit) => unit.uid);
  assert.ok(targets.includes(backBrigand.uid), 'Back rank opens after the front falls.');
});

test('ranged units can target the back rank while the front stands', () => {
  const battle = newBattle();
  battle.start();
  const mirelle = findUnit(battle, 'ally', 'mirelle');
  const backBrigand = battle.units.find(
    (unit) => unit.side === 'enemy' && unit.id === 'brigand' && unit.rank === 'B',
  );
  const targets = battle.getValidTargets(mirelle, 'attack').map((unit) => unit.uid);
  assert.ok(targets.includes(backBrigand.uid));
});

test('guard halves incoming damage and shields absorb before health', () => {
  const battleA = newBattle(watchtower, 99);
  const battleB = newBattle(watchtower, 99);
  const attackerA = findUnit(battleA, 'ally', 'aldric');
  const attackerB = findUnit(battleB, 'ally', 'aldric');
  const targetA = findUnit(battleA, 'enemy', 'brigand');
  const targetB = findUnit(battleB, 'enemy', 'brigand');
  const spec = { min: 30, max: 40, type: 'physical', critChance: 0 };
  const plain = battleA.rollDamage(attackerA, targetA, spec);
  targetB.statuses.guard = { turns: 1 };
  const guarded = battleB.rollDamage(attackerB, targetB, spec);
  assert.ok(guarded.amount < plain.amount, 'Guard must reduce damage.');
  assert.ok(guarded.amount >= 1);

  targetA.statuses.shield = { turns: 3, amount: 100 };
  const hpBefore = targetA.hp;
  const events = [];
  battleA.applyDamage(attackerA, targetA, { amount: 40, crit: false, type: 'physical' }, events);
  assert.equal(targetA.hp, hpBefore);
  assert.equal(events[0].absorbed, 40);
});

test('abilities consume cooldowns and heal cannot overheal', () => {
  const battle = newBattle();
  battle.start();
  const oszar = findUnit(battle, 'ally', 'oszar');
  const vela = findUnit(battle, 'ally', 'vela');
  const enemy = findUnit(battle, 'enemy', 'brigand');

  battle.phase = 'player';
  battle.actingUnit = oszar;
  battle.turnIndex = battle.order.indexOf(oszar);
  const firebolt = battle.performAction(oszar.uid, 'ability', {
    abilityId: 'firebolt',
    targetId: enemy.uid,
  });
  assert.ok(firebolt.ok);
  assert.equal(oszar.cooldowns.firebolt, ABILITIES.firebolt.cooldown);
  assert.equal(battle.abilityAvailable(oszar, 'firebolt'), false);

  vela.hp = vela.maxHp - 10;
  const events = [];
  battle.healUnit(vela, 999, events);
  assert.equal(vela.hp, vela.maxHp);
});

test('poison ticks at turn start and stun skips the next turn', () => {
  const battle = newBattle();
  battle.start();
  const first = battle.currentUnit;
  const victim = battle.order[battle.turnIndex + 1];

  battle.applyStatus(victim, { id: 'poison', turns: 3, damage: 15 }, [], first);
  const hp = victim.hp;
  const tickEvents = [];
  battle.tickStartOfTurn(victim, tickEvents);
  assert.ok(victim.hp < hp, 'Poison must deal damage at turn start.');
  assert.ok(tickEvents.some((event) => event.type === 'damage' && event.source === 'poison'));

  victim.statuses.stun = { turns: 1 };
  const endEvents = battle.performAction(first.uid, 'defend');
  assert.ok(endEvents.ok);
  const advance = battle.finishTurn();
  assert.ok(
    advance.some((event) => event.type === 'skip' && event.unitId === victim.uid),
    'Stunned unit must be skipped.',
  );
  assert.notEqual(battle.currentUnit?.uid, victim.uid);
});

test('victory is declared exactly once when the last enemy dies', () => {
  const battle = newBattle();
  battle.start();
  const mirelle = findUnit(battle, 'ally', 'mirelle');
  const enemies = battle.enemies;
  const survivors = enemies.filter((enemy) => !(enemy.rank === 'F' && enemy.id === 'brigand'));
  for (const enemy of survivors) {
    battle.killUnit(enemy, []);
  }
  const front = enemies.find((enemy) => enemy.rank === 'F' && enemy.id === 'brigand');
  front.hp = 1;
  battle.phase = 'player';
  battle.actingUnit = mirelle;
  battle.turnIndex = battle.order.indexOf(mirelle);
  const result = battle.performAction(mirelle.uid, 'attack', { targetId: front.uid });
  assert.ok(result.ok);
  const victories = result.events.filter((event) => event.type === 'victory');
  assert.equal(victories.length, 1);
  assert.equal(battle.phase, 'victory');
  assert.equal(battle.outcome, 'victory');
  assert.ok(!battle.enemies.some((enemy) => enemy.alive));
});

test('full encounters resolve without deadlock and stay inside reasonable rounds', () => {
  for (const encounter of [watchtower, marsh, cathedral]) {
    const battle = runToEnd(11, encounter);
    assert.ok(battle.round <= 40, `${encounter.name} took too many rounds: ${battle.round}`);
    assert.ok(['victory', 'defeat'].includes(battle.outcome));
  }
});

test('identical seed and choices produce identical results', () => {
  const battleA = runToEnd(2024, marsh);
  const battleB = runToEnd(2024, marsh);
  const a = battleA.snapshot();
  const b = battleB.snapshot();
  a.log = [];
  b.log = [];
  assert.deepEqual(a, b);
});

test('dead units are removed from targeting and the queue', () => {
  const battle = newBattle();
  battle.start();
  const enemy = findUnit(battle, 'enemy', 'brigand');
  const events = [];
  battle.killUnit(enemy, events);
  assert.ok(events.some((event) => event.type === 'death'));
  assert.ok(!battle.order.includes(enemy));
  const mirelle = findUnit(battle, 'ally', 'mirelle');
  const targets = battle.getValidTargets(mirelle, 'attack').map((unit) => unit.uid);
  assert.ok(!targets.includes(enemy.uid));
});

test('change row respects occupancy and updates rank protection', () => {
  const battle = newBattle();
  battle.start();
  const aldric = findUnit(battle, 'ally', 'aldric');
  assert.equal(aldric.rank, 'F');
  assert.equal(battle.shiftDestination(aldric), null, 'Front slot B1 is occupied by Mirelle.');
  const bran = findUnit(battle, 'ally', 'bran');
  assert.equal(battle.shiftDestination(bran), null, 'Front slot B0 is occupied by Oszar.');

  const vela = findUnit(battle, 'ally', 'vela');
  battle.phase = 'player';
  battle.actingUnit = vela;
  battle.turnIndex = battle.order.indexOf(vela);
  const result = battle.performAction(vela.uid, 'shift');
  assert.ok(result.ok);
  assert.equal(vela.rank, 'F');
  assert.equal(vela.slot, 'F2');
});

test('change row falls back to another free slot in the other rank', () => {
  const battle = newBattle();
  battle.start();
  const mirelle = findUnit(battle, 'ally', 'mirelle');
  assert.equal(mirelle.rank, 'B');
  // B1 is occupied by Mirelle, but F2 is free; the old same-column rule
  // refused the move and left Change Row dead for most of the party.
  assert.equal(battle.shiftDestination(mirelle), 'F2');
  battle.phase = 'player';
  battle.actingUnit = mirelle;
  battle.turnIndex = battle.order.indexOf(mirelle);
  const result = battle.performAction(mirelle.uid, 'shift');
  assert.ok(result.ok, result.error);
  assert.equal(mirelle.slot, 'F2');
  assert.equal(mirelle.rank, 'F');
});

test('Smite deals bonus damage to undead', () => {
  const battle = newBattle(cathedral, 5);
  battle.start();
  const vela = findUnit(battle, 'ally', 'vela');
  const skeleton = battle.units.find((unit) => unit.side === 'enemy' && unit.traits.includes('undead'));
  const plain = battle.rollDamage(vela, skeleton, {
    min: 100, max: 100, type: 'holy', critChance: 0,
  });
  const smite = battle.rollDamage(vela, skeleton, {
    min: 100, max: 100, type: 'holy', critChance: 0,
    bonusVs: 'undead', bonusAmount: 0.5,
  });
  assert.ok(smite.amount > plain.amount, 'Undead must take extra holy damage.');
  assert.ok(smite.amount >= Math.round(plain.amount * 1.35), `Expected about +50%, got ${plain.amount} -> ${smite.amount}`);
});

test('the Hollow King enrages below half health', () => {
  const battle = newBattle(cathedral, 9);
  battle.start();
  const king = findUnit(battle, 'enemy', 'hollow_king');
  king.hp = Math.ceil(king.maxHp * 0.52);
  const events = [];
  battle.applyDamage(null, king, { amount: 20, base: 20, crit: false, type: 'physical', resist: 0 }, events);
  assert.ok(king.statuses.enrage, 'Boss enrage must trigger once below 50% health.');
  assert.ok(events.some((event) => event.type === 'status' && event.status === 'enrage'));
});

test('defend action applies guard and halves a deterministic hit', () => {
  const battle = newBattle(watchtower, 77);
  battle.start();
  const actor = battle.currentUnit;
  assert.equal(actor.side, 'ally');
  const result = battle.performAction(actor.uid, 'defend');
  assert.ok(result.ok, result.error);
  assert.ok(actor.statuses.guard, 'Defend must store a guard status.');
  assert.equal(actor.statuses.guard.turns, 1);

  const attacker = findUnit(battle, 'enemy', 'brigand');
  const spec = { min: 40, max: 40, type: 'physical', critChance: 0 };
  const guarded = battle.rollDamage(attacker, actor, spec);
  delete actor.statuses.guard;
  const plain = battle.rollDamage(attacker, actor, spec);
  assert.ok(guarded.amount < plain.amount, 'Guard must reduce incoming damage.');
  assert.equal(guarded.amount, Math.max(1, Math.round(plain.amount / 2)));
});

test('fallen units leave the turn order but stay on the roster', () => {
  const battle = newBattle(watchtower, 21);
  battle.start();
  const enemy = findUnit(battle, 'enemy', 'brigand');
  const events = [];
  battle.killUnit(enemy, events);
  assert.ok(!battle.order.includes(enemy), 'Dead units must not act.');
  assert.ok(battle.fallen.includes(enemy), 'Dead units must remain available to the tower.');
  assert.equal(battle.fallen.length, 1);
  assert.ok(!battle.getValidTargets(battle.currentUnit, 'attack').some((unit) => unit.uid === enemy.uid));
});
