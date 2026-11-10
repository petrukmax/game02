// DOM interface: title/help/results, initiative tower, corner panels, action medallion, floats, log.

import { STATUS_INFO, DMG_LABEL, UPGRADES } from '../battle/data.js';
import { createPortraitURL } from './portraits.js';

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

export class HUD {
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
