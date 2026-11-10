# PROGRESS — Ashen Crown Combat Prototype

Context-recovery file for the Disciples II-style tactical battle prototype.
Format: `[x]` done, `[~]` in progress, `[ ]` not started.
Last updated after the Canvas 2D rewrite, balance pass, War Camp, responsive pass, tests, and AUDIT_V2.

## Current state (post-fix)

- **Playable and self-contained.** `index.html` + vanilla ES modules + Canvas 2D; no build step, no CDN, no backend, no WebGL requirement.
- **Title:** Ashen Crown. All player-facing text, docs and progress labels are English.
- **Campaign:** 5 fixed heroes vs 5 enemies across 3 encounters (Ruined Watchtower → Sunken Marsh → Bone Cathedral); boss The Hollow King.
- **Combat:** initiative order, 2 rows × 3 columns, front-rank melee protection, Attack / Ability / Defend / Wait / Row, cooldowns, 8 statuses, deterministic seeded RNG, XP/levels, gold and War Camp upgrades.
- **Presentation:** Canvas 2D pseudo-perspective battlefield, painted sky/ground/props for 3 themes, procedural humanoid/beast sprites, idle/attack/cast/guard/hit/death poses, shadows, rim light, embers/mist/god rays, screen shake, floating numbers, projectiles/beams/heals.
- **UI:** reference-style initiative tower, corner medallions, central action wheel, toast/target hints, ability popover, title/help/intro/victory/defeat/campaign screens.
- **Tests:** 16/16 passing in `tests/combat.test.mjs`; balance scan and campaign scan pass without deadlock.

## Completed blocks

### Block 1 — Analysis and design brief [x]
- [x] Workspace, references (`1.jpg`, `2.jpg`, `3.jpg`), old docs and all source files read.
- [x] Disciples II pillars extracted: initiative tower, 2-row formation, front-rank protection, action medallion, floating damage, spell effects.
- [x] `disciples2_battle.md` written.

### Block 2 — Pure simulation [x]
- [x] `js/battle/data.js` — 5 heroes, 9 enemy templates, 14 abilities, 8 statuses, 3 encounters, rewards, XP/level rules, `UPGRADES`.
- [x] `js/core/rng.js` — deterministic mulberry32.
- [x] `js/battle/sim.js` — rounds, initiative sort, actions, targeting, damage with armor/resist/shield/guard, status ticks, kill/removal, outcome once, snapshot.
- [x] `js/battle/ai.js` — role-aware enemy decisions; RNG comparator fixed.
- [x] `tests/combat.test.mjs` — 16 regression tests.
- [x] `tests/balance-scan.mjs` — 3 encounters × 6 seeds.
- [x] `tests/campaign-scan.mjs` — campaign with XP, levels, recovery and upgrades.

### Block 3 — Renderer replacement (critical fix) [x]
- [x] Diagnosed the fake “No WebGL” error: old `js/render/scene.js:764` called undefined `makeRidgeTexture`; `App.boot` caught it and showed misleading WebGL copy.
- [x] Removed Three.js from `index.html` and deleted `js/render/models.js`, `js/render/effects.js`, `js/vendor/three.min.js`.
- [x] Rewrote `js/render/scene.js` as Canvas 2D (`paintBackground`, `drawHumanoid`, `drawBeast`, `UnitView`, `CanvasEffects`, `BattleScene`).
- [x] Boot fallback now reports the real error (`js/main.js:73-90`); no WebGL check anywhere.
- [x] Picking, slot projection, active/target/hover rings, shake, ambient embers/mist/rays preserved.
- [x] Visual pass: darker ruins palette, stronger clouds/stars/cloud banks, ash/bones/cracks, green soul-fire, deeper face shadows, rim light, spread formation.
- [x] Responsive scene scale: `sizeK = min(W/900, H/590)` and x-clamping for narrow screens (`js/render/scene.js:1876`, `:1912-1929`).

### Block 4 — Interface and reference layout [x]
- [x] `styles.css` reference-layout overrides: topbar, narrow framed initiative tower, 148 px circular medallions, central action medallion, toast banner, target hint, ability popover, hidden combat log.
- [x] Crowded tower: cards shrink to 46 px when 9+ combatants, so all 10 fit at 1200×800.
- [x] Mid-height (≤700 px) mosaic tower so 800×600 shows all 10 cards without silent scrolling.
- [x] Phone layout (≤620 px): horizontal initiative strip, stacked enemy/ally panels, compact action wheel.
- [x] Tooltip now shows damage range and resistances.
- [x] War Camp CSS and victory-screen upgrade buttons.

### Block 5 — Mechanics and balance [x]
- [x] `shiftDestination` falls back to adjacent/any free slot in the other rank.
- [x] Smite gets `bonusVs: 'undead'`, `bonusAmount: 0.5`; `rollDamage` applies it.
- [x] Boss enrage triggers at ≤50% HP via `checkEnrage`.
- [x] Extra Crossbowman in Watchtower (B1) and third Bog Lurker in Marsh (F2) to reduce trivial difficulty.
- [x] Extra Skeleton Warrior in Cathedral (B0) so the finale survives a damage-race check; no-progression parties now usually lose, progressed parties win in 9–10 rounds.
- [x] War Camp gold sink: Sharpen Blades (+2 damage, 100 gold, max 4), Reinforce Armour (+2 armour, 90 gold, max 4), Field Hospital (full heal, 70 gold).
- [x] Victory screen shows rounds, damage, kills, losses, XP, gold, level-ups and War Camp with costs/caps/disabled states.
- [x] `window.__combat` API retained: state, snapshot, actions, targets, startEncounter, begin, act, chooseTarget, cancel, pause/resume, restart, title, setFast/setMuted, inspect, party.
- [x] Favicon 404 fixed with an inline SVG data URI; viewport zoom no longer disabled.

### Block 6 — Audit and documentation [x]
- [x] `AUDIT_V2.md` written with verdict, 12 scores, TOP-10, full table, removal list, rebuild-vs-patch, must-not-break, bug repros, juice ideas, missing features, 3-stage roadmap.
- [x] Exact “No WebGL” cause documented (`makeRidgeTexture` ReferenceError, old `js/render/scene.js:764`).
- [x] Stale `AUDIT.md` and `FEATURE_AUDIT.md` removed.
- [x] `PROGRESS.md` and `README.md` rewritten for the Canvas 2D build.

## Verification commands

```bash
node --test tests/combat.test.mjs       # 16 pass, 0 fail
node tests/balance-scan.mjs            # 3 encounters × 6 seeds
node tests/campaign-scan.mjs           # full campaign with XP/upgrades
```

Local server on this machine must be Node (Python `http.server` returns empty replies):

```powershell
Start-Process node -ArgumentList "server.cjs" -WorkingDirectory "C:\Users\petrukmax\Documents\Opencode\Disciples" -WindowStyle Hidden
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:8124/index.html
```

Headless screenshots use `%TEMP%\probe.mjs` with Chrome `--headless=new --enable-unsafe-swiftshader`; step JSON must be UTF-8 **without BOM**.

## Known limitations (open)

- [ ] Unit/portrait art is still flat procedural vector art; the reference is painted. Biggest visual gap.
- [ ] No music/ambient bed; SFX only, mute only, no volume slider.
- [ ] Progression is stat-only; abilities never unlock, no perk choices.
- [ ] No save/load; refresh loses the campaign.
- [ ] Content is 3 encounters / 9 enemy templates / one boss (~15 min); low replayability.
- [ ] Combat log exists but is hidden (`styles.css:2822`); no event review/accessibility narration.
- [ ] Enemy AI is predictable and focus-fires low HP; no repositioning/healer protection.
- [ ] Phones are playable but cramped; 800×600 mosaic hides names.
- [ ] No damage preview; tooltip shows stats but not expected damage.
- [ ] War Camp purchase logic is not directly unit-tested (campaign scan re-implements it).
- [ ] Headless software rendering ~41 fps at 1200×800; no offscreen pose caching.
- [ ] No renderer/UI smoke test; visual regressions checked manually via screenshots.

## Next move

1. Extract `purchaseUpgrade(party, campaign, kind)` into `js/battle/data.js` and unit-test gold/max/heal guards.
2. Add a collapsible Chronicle drawer fed by `battle.log`; reuse it for `aria-live` announcements.
3. Add damage preview and persist Fast mode; shorten the default 430 ms enemy wait.
4. Add procedural ambience/music per theme.
5. Add save/load (`localStorage`, encounter boundary only) and a Continue button.
6. Add ability unlocks/perks at levels 4/5/6.
7. Only then invest in painted sprites and two new encounters.

## Key files

- `js/render/scene.js` — Canvas 2D battlefield, sprites, effects, picking, responsive projection.
- `js/main.js` — app shell, campaign, input, targeting, presentation queue, War Camp, `window.__combat`.
- `js/battle/sim.js` — pure turn engine.
- `js/battle/data.js` — templates, abilities, statuses, encounters, rewards, XP, upgrades.
- `js/battle/ai.js` — enemy decisions.
- `js/ui/hud.js` — DOM UI, queue, panels, tooltip, overlays, War Camp.
- `js/ui/portraits.js` — procedural portraits at 2× resolution.
- `js/audio/sfx.js` — procedural Web Audio SFX.
- `styles.css` — reference layout, responsive modes, War Camp, crowded tower.
- `AUDIT_V2.md` — current evidence-based audit and roadmap.
