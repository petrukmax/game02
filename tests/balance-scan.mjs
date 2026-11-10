import { Battle } from '../js/battle/sim.js';
import { chooseEnemyAction } from '../js/battle/ai.js';
import { ENCOUNTERS, createCampaignParty } from '../js/battle/data.js';

function policy(b) {
  const u = b.currentUnit;
  const friends = b.allies.filter((a) => a.alive);
  const wounded = friends.filter((a) => a.hp / a.maxHp < 0.62).sort((a, c) => a.hp / a.maxHp - c.hp / c.maxHp)[0];
  const ready = (id) => b.abilityAvailable(u, id);
  if (wounded && u.abilities.includes('mend') && ready('mend')) return { action: 'ability', abilityId: 'mend', targetId: wounded.uid };
  if (u.id === 'aldric' && b.round === 1 && ready('war_cry')) return { action: 'ability', abilityId: 'war_cry' };
  if (u.id === 'bran' && ready('shield_wall') && b.round <= 2) return { action: 'ability', abilityId: 'shield_wall' };
  if (u.id === 'oszar' && ready('flame_wave')) { const t = b.getValidTargets(u, 'ability', 'flame_wave'); if (t.length >= 2) return { action: 'ability', abilityId: 'flame_wave' }; }
  if (u.id === 'mirelle' && ready('rain_of_arrows')) { const t = b.getValidTargets(u, 'ability', 'rain_of_arrows'); if (t.length >= 3) return { action: 'ability', abilityId: 'rain_of_arrows' }; }
  if (u.id === 'mirelle' && ready('piercing_shot')) { const t = b.getValidTargets(u, 'ability', 'piercing_shot').sort((a, c) => a.hp - c.hp)[0]; if (t) return { action: 'ability', abilityId: 'piercing_shot', targetId: t.uid }; }
  if (u.id === 'vela' && ready('smite')) { const t = b.getValidTargets(u, 'ability', 'smite').sort((a, c) => a.hp - c.hp)[0]; if (t) return { action: 'ability', abilityId: 'smite', targetId: t.uid }; }
  const t = b.getValidTargets(u, 'attack').sort((a, c) => a.hp - c.hp)[0];
  return t ? { action: 'attack', targetId: t.uid } : { action: 'defend' };
}

function run(enc, seed) {
  const b = new Battle({ encounter: enc, seed, party: createCampaignParty() });
  b.start();
  let guard = 0;
  const rejected = [];
  while (!b.outcome && guard++ < 500) {
    const u = b.currentUnit;
    const plan = u.side === 'ally' ? policy(b) : chooseEnemyAction(b, u);
    const r = b.performAction(u.uid, plan.action, plan);
    if (!r.ok) { rejected.push(`REJECT ${u.name} ${JSON.stringify(plan)} ${r.error}`); break; }
    if (!b.outcome) b.finishTurn();
  }
  return {
    outcome: b.outcome,
    rounds: b.round,
    allies: b.allies.map((u) => `${u.name}:${u.hp}/${u.maxHp}`),
    enemies: b.enemies.map((u) => `${u.name}:${u.hp}/${u.maxHp}`),
    rejected,
  };
}

for (const enc of ENCOUNTERS) {
  for (const seed of [1, 2, 3, 7, 11, 42]) {
    const r = run(enc, seed);
    console.log(enc.id, seed, r.outcome, 'r' + r.rounds, '|', r.allies.join(', '), '|', r.enemies.join(', '));
    if (r.rejected.length) console.log('  ', r.rejected.join('; '));
  }
}
