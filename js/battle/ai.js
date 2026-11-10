// Enemy decision-making. Uses only public battle state and the same action rules as the player.

import { ABILITIES } from './data.js';

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

export function chooseEnemyAction(battle, unit) {
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
