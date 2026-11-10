// Campaign-level balance scan: three encounters back to back with XP, levels,
// war-camp upgrades and the between-battle recovery rule.
import { Battle } from '../js/battle/sim.js';
import { chooseEnemyAction } from '../js/battle/ai.js';
import {
  ENCOUNTERS,
  UPGRADES,
  createCampaignParty,
  grantCampaignXp,
  preparePartyForNextBattle,
} from '../js/battle/data.js';

function policy(b) {
  const u = b.currentUnit;
  const friends = b.allies.filter((a) => a.alive);
  const wounded = friends
    .filter((a) => a.hp / a.maxHp < 0.62)
    .sort((a, c) => a.hp / a.maxHp - c.hp / c.maxHp)[0];
  const ready = (id) => b.abilityAvailable(u, id);
  if (wounded && u.abilities.includes('mend') && ready('mend')) {
    return { action: 'ability', abilityId: 'mend', targetId: wounded.uid };
  }
  if (u.id === 'aldric' && b.round === 1 && ready('war_cry')) {
    return { action: 'ability', abilityId: 'war_cry' };
  }
  if (u.id === 'bran' && ready('shield_wall') && b.round <= 2) {
    return { action: 'ability', abilityId: 'shield_wall' };
  }
  if (u.id === 'oszar' && ready('flame_wave')) {
    const t = b.getValidTargets(u, 'ability', 'flame_wave');
    if (t.length >= 2) return { action: 'ability', abilityId: 'flame_wave' };
  }
  if (u.id === 'mirelle' && ready('rain_of_arrows')) {
    const t = b.getValidTargets(u, 'ability', 'rain_of_arrows');
    if (t.length >= 3) return { action: 'ability', abilityId: 'rain_of_arrows' };
  }
  if (u.id === 'mirelle' && ready('piercing_shot')) {
    const t = b.getValidTargets(u, 'ability', 'piercing_shot').sort((a, c) => a.hp - c.hp)[0];
    if (t) return { action: 'ability', abilityId: 'piercing_shot', targetId: t.uid };
  }
  if (u.id === 'vela' && ready('smite')) {
    const t = b.getValidTargets(u, 'ability', 'smite').sort((a, c) => a.hp - c.hp)[0];
    if (t) return { action: 'ability', abilityId: 'smite', targetId: t.uid };
  }
  const t = b.getValidTargets(u, 'attack').sort((a, c) => a.hp - c.hp)[0];
  return t ? { action: 'attack', targetId: t.uid } : { action: 'defend' };
}

function buy(party, gold, upgrades) {
  const spent = [];
  for (const key of ['sharpen', 'armor', 'heal']) {
    const upgrade = UPGRADES[key];
    while (gold >= upgrade.cost && (upgrades[key] || 0) < upgrade.max) {
      if (key === 'heal' && !party.some((hero) => hero.hp < hero.maxHp)) break;
      gold -= upgrade.cost;
      upgrades[key] = (upgrades[key] || 0) + 1;
      spent.push(key);
      for (const hero of party) {
        if (key === 'sharpen') hero.damage = hero.damage.map((value) => value + 2);
        else if (key === 'armor') hero.armor += 2;
        else hero.hp = hero.maxHp;
      }
    }
  }
  return { gold, spent };
}

function playEncounter(party, encounter, seed) {
  const b = new Battle({ encounter, seed, party: structuredClone(party) });
  b.start();
  let guard = 0;
  while (!b.outcome && guard++ < 500) {
    const u = b.currentUnit;
    const plan = u.side === 'ally' ? policy(b) : chooseEnemyAction(b, u);
    const r = b.performAction(u.uid, plan.action, plan);
    if (!r.ok) return { battle: b, error: `${u.name}: ${r.error}` };
    if (!b.outcome) b.finishTurn();
  }
  return { battle: b, error: b.outcome ? null : 'stalemate' };
}

function syncParty(party, battle) {
  for (const hero of party) {
    const unit = battle.allies.find((ally) => ally.id === hero.id);
    if (!unit) continue;
    hero.hp = unit.hp;
    hero.maxHp = unit.maxHp;
    hero.level = unit.level;
    hero.damage = [...unit.damage];
  }
}

for (const seed of [1, 2, 3, 7, 11, 42]) {
  const party = createCampaignParty();
  const upgrades = {};
  let gold = 0;
  let result = 'victory';
  const log = [];
  for (const encounter of ENCOUNTERS) {
    const { battle, error } = playEncounter(party, encounter, seed + encounter.index * 7919);
    if (error) {
      result = `error(${error})`;
      break;
    }
    const losses = battle.allies.filter((unit) => !unit.alive).map((unit) => unit.name);
    log.push(
      `${encounter.id}=${battle.outcome}/r${battle.rounds ?? battle.round}` +
        (losses.length ? `(-${losses.join('+')})` : ''),
    );
    if (battle.outcome !== 'victory') {
      result = `defeat@${encounter.id}`;
      syncParty(party, battle);
      break;
    }
    syncParty(party, battle);
    grantCampaignXp(party, encounter.reward.xp);
    gold += encounter.reward.gold;
    const purchase = buy(party, gold, upgrades);
    gold = purchase.gold;
    if (purchase.spent.length) log.push(`buy:${purchase.spent.join(',')}`);
    preparePartyForNextBattle(party);
  }
  const levels = party.map((hero) => `${hero.name[0]}${hero.level}`).join(' ');
  console.log(
    `seed ${seed} ${result} | ${log.join(' | ')} | final L:${levels} | gold:${gold} | up:${JSON.stringify(upgrades)}`,
  );
  console.log(
    '  hp:',
    party.map((hero) => `${hero.name} ${hero.hp}/${hero.maxHp} dmg${hero.damage[0]}-${hero.damage[1]} arm${hero.armor}`).join(' | '),
  );
}
