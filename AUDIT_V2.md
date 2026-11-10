# Ashen Crown вЂ” Post-Fix Audit (AUDIT_V2)

**Scope:** the current repository after the renderer replacement and the first fix pass.  
**Method:** source read-through, live headless-Chrome runs at 1200Г—800, 800Г—600 and 390Г—844, deterministic balance scans, campaign scan with XP/levels/upgrades, and 16 Node regression tests. No speculation below is presented as fact; hypotheses are labelled.

**Files actually read:** `index.html`, `styles.css`, `js/main.js`, `js/battle/sim.js`, `js/battle/data.js`, `js/battle/ai.js`, `js/core/rng.js`, `js/render/scene.js`, `js/ui/hud.js`, `js/ui/portraits.js`, `js/audio/sfx.js`, `tests/combat.test.mjs`, `tests/balance-scan.mjs`, `README.md`, `PROGRESS.md`, the three reference screenshots (`1.jpg`, `2.jpg`, `3.jpg`), and the now-removed `AUDIT.md`, `FEATURE_AUDIT.md`, `js/render/models.js`, `js/render/effects.js`.

---

## 0. The вЂњNo WebGLвЂќ failure вЂ” exact cause, now fixed

This was **not** a WebGL problem and never required hardware acceleration.

- The old Three.js scene called `makeRidgeTexture()` at **old `js/render/scene.js:764`**, but that function did not exist. Construction threw `ReferenceError: makeRidgeTexture is not defined`.
- `App.boot()` caught the exception and rendered the generic fallback copy that said WebGL was required (**old `js/main.js` boot path**). So every browser showed the same misleading вЂњNo WebGLвЂќ panel.
- The fix in the current build: Three.js was replaced with a Canvas 2D renderer (`js/render/scene.js:1-9`), the `<script>` for Three.js was removed from `index.html`, and the boot fallback now reports the real error text instead of blaming WebGL (`js/main.js:73-90`). A browser without WebGL now runs normally; a browser without 2D canvas gets an accurate message (`js/render/scene.js:1830-1833`).

**Verification:** headless Chrome at 1200Г—800, 800Г—600 and 390Г—844 boots with no exception, starts the campaign, enters the battle and reaches the player turn. Console now shows no 404 (favicon fixed) and no renderer exception.

---

## 1. Verdict

Ashen Crown is a compact, deterministic Disciples II-style skirmish game: five fixed heroes, two ranks, an initiative tower, three encounters and one boss. Its strongest asset is the simulation: the turn order, front-rank protection, cooldowns, statuses and seeded RNG are coherent and covered by 16 passing tests. The Canvas 2D rewrite removed the fake вЂњNo WebGLвЂќ blocker and the composition now reads much closer to the references: painted sky, horizon, ruins, a narrow initiative tower, corner medallions and a central action wheel. The remaining gap is mostly **feel and fantasy**, not correctness: units are still flat vector puppets, there is no music, progression is only +HP/+damage, there is no save, and the three encounters are over in roughly 15 minutes. The game is playable and understandable, but it is not yet memorable; the next work should buy atmosphere and replayability before adding more systems. Current overall score: **5.8/10**.

---

## 2. Scores (0вЂ“10)

| Aspect | Score | Justification |
|---|---:|---|
| Gameplay | **6.5** | The core loop is real: read initiative в†’ choose action в†’ target в†’ resolve в†’ next unit. Front/back ranks, Wait, Defend and Row change create decisions. But most turns collapse to вЂњattack the lowest HP enemyвЂќ; positioning is shallow and abilities are fixed per class. |
| Game feel | **5.5** | Floating damage, screen shake, hit flashes, projectiles and painted effects exist (`js/render/scene.js:1251-1600`). There is no hit-stop, no impact pause, no kill slow-motion, and sound is thin, so hits land softly. |
| Balance | **6.0** | After the fix pass, a no-progression party usually loses the Cathedral (4/6 seeds) while a party that levels and buys upgrades wins in 9вЂ“10 rounds. Watchtower is still a 4-round tutorial with almost no risk. `+2 damage Г—4` upgrades can flatten the late game. |
| Progression | **5.0** | XP, levels, gold and three War Camp upgrades exist (`js/battle/data.js:530-534`, `js/main.js:378-409`). Levels only scale HP/damage; no ability unlocks, no perk choice, no equipment, no save. |
| Onboarding | **7.0** | Title, How to Play, encounter intro, objective, hint line, target hint and a вЂњRound 1 beginsвЂќ toast are all present (`js/ui/hud.js:434-527`). A first-time player knows what to click. The tooltip did not show damage/resist until this pass. |
| UI/UX | **6.5** | The reference hierarchy is now clear at 1200Г—800: initiative tower, two corner medallions, central wheel. 800Г—600 uses a compact mosaic tower; phones use a horizontal strip. The combat log is hidden, the 800-wide tower drops names, and the phone layout is still cramped. |
| Visuals | **5.5** | The painted background, silhouettes, fog, embers and god rays carry the mood. Units and portraits are flat procedural vector art with pale mask-like faces; they are the single biggest gap to the reference screenshots. |
| Sound | **4.5** | Procedural Web Audio SFX only (`js/audio/sfx.js:1-216`). No music, no ambient bed, no volume slider, mute only. The silence between actions fights the gothic tone. |
| Content | **4.5** | Three encounters, nine enemy templates, one boss, three themes (`js/battle/data.js:536-607`). Roughly 15 minutes for a campaign; almost no reason to replay except a better result. |
| Technical | **6.5** | Pure sim separated from presentation, seeded RNG, 16 tests, 41 fps in headless software rendering at 1200Г—800. No save, no renderer/UI tests, lots of per-frame gradient allocation, one hidden/dead log panel. |
| Retention | **4.5** | No save, no meta-progression, no difficulty modes, no daily/endless mode, no codex. The campaign ends at the Cathedral and the result screen is the end. |
| Integrity / cohesion | **6.5** | Tone, terminology and art direction are consistent; all player-facing text is English; the static no-build architecture holds. Stale docs and Three.js dead code were the main coherence debt, now removed. |
| **Overall** | **5.8** | A solid tactical prototype with a trustworthy core and a much better first impression, but not yet a game that sustains an evening. |

---

## 3. TOP-10 problems that still spoil the feel

### 1. Units read as flat vector puppets, not painted Disciples II characters
- **What:** Bodies are stacked flat fills with hard outlines, tiny hands, pale mask faces and almost no material texture. They read as paper cut-outs next to the painted background.
- **Where:** `js/render/scene.js:712` `drawHumanoid`, `js/render/scene.js:1159` `drawBeast`, `js/render/scene.js:1697` `UnitView.draw`; portraits in `js/ui/portraits.js:389` `createPortraitURL`.
- **Why it hurts:** The reference fantasy is вЂњpainted dark-fantasy dioramaвЂќ; flat puppets break that fantasy every time the player looks at the field. This is the main reason the game still feels like a prototype.
- **Severity:** **critical** (for the stated visual goal).
- **Fix:** Replace the procedural body renderer with pre-rendered painted sprites (3вЂ“4 poses per unit, 256вЂ“384 px tall) or add a real texture pass: cloth folds, metal specular bands, face shading, rim light, contact shadows. Keep the Canvas 2D renderer and the current `UnitView` animation timing; swap only the sprite source.
- **Effort:** **high** (art production, not code).

### 2. No music or ambient bed
- **What:** Every action is a short procedural blip; between actions there is silence. No loop, no drone, no battle percussion, no victory theme.
- **Where:** `js/audio/sfx.js:1-216` (`SoundEngine.play` at `:120`); there is no music module and no ambient scheduler.
- **Why it hurts:** Disciples II lives on oppressive atmosphere. Silence makes the battlefield feel like a test harness.
- **Severity:** **critical**.
- **Fix:** Add one procedural ambient loop per theme (low drone + wind + distant bells) at 0.10вЂ“0.16 gain, ducking under SFX; a two-bar combat percussion layer that enters on round 1; a short victory/defeat cue. Keep it generated, no external files.
- **Effort:** **medium**.

### 3. Progression is stat-only; levels never unlock anything
- **What:** Every hero starts with both abilities. Level-ups only multiply HP and damage; there is no choice, no new button, no build identity.
- **Where:** `js/battle/data.js:653` `grantCampaignXp`; hero templates at `:247-340` already contain the full ability list; `js/main.js:378-409` only buys flat stats.
- **Why it hurts:** вЂњLevel 6вЂќ is a number, not a new toy. The player has no reason to care about the next level beyond a bigger HP bar.
- **Severity:** **critical**.
- **Fix:** Gate the second ability behind level 4, add one of two perks per level (e.g. Aldric: +guard duration or +counter damage; Oszar: +burn or +area), and show the choice on the victory screen. Start with 2вЂ“3 perk nodes per hero, not a full tree.
- **Effort:** **medium**.

### 4. No save/load; a refresh destroys the campaign
- **What:** Campaign state exists only in memory. Closing the tab loses gold, levels, upgrades and encounter index.
- **Where:** `js/main.js:48-71` constructor and `:129-137` `beginCampaign`; the only persisted value is mute in `js/audio/sfx.js:11`.
- **Why it hurts:** A 15-minute run is short enough to finish, but a crash or accidental refresh feels like wasted time. It also blocks longer campaigns.
- **Severity:** **important**.
- **Fix:** Serialize `{ encounterIndex, party, campaign, seed }` to `localStorage` after victory and at encounter start; offer вЂњContinueвЂќ on the title screen; version the schema. Do not persist mid-battle.
- **Effort:** **medium**.

### 5. Content is thin and replayability is low
- **What:** Three linear encounters, nine enemy templates, one boss, no elites, no modifiers, no side objectives.
- **Where:** `js/battle/data.js:536-607` `ENCOUNTERS`; enemy templates at `:344-526`.
- **Why it hurts:** After one successful run the player has seen every enemy and every line. The game ends exactly when it starts to teach its systems.
- **Severity:** **important**.
- **Fix:** Add two encounters (a bridge ambush and a crypt), 3вЂ“4 elite variants with one changed rule each, and one modifier per run (e.g. вЂњBlood Moon: +25% enemy damage, +50% goldвЂќ). Reuse existing templates first.
- **Effort:** **high**.

### 6. The combat log exists but is hidden
- **What:** `#log-panel` is in the DOM and `renderLog()` updates the last four entries, but CSS sets `display: none`; the player cannot review what happened.
- **Where:** `index.html:41-44`; `js/ui/hud.js:357-365` `renderLog`; `styles.css:2822` `#log-panel { display: none; }`.
- **Why it hurts:** When a unit dies from poison or a boss drains life, the float disappears and there is no way to reconstruct the event. This directly slows learning.
- **Severity:** **important**.
- **Fix:** Turn it into a collapsible вЂњChronicleвЂќ drawer (button in the top bar or a small tab above the wheel), or show the last event as a one-line ticker under the turn banner. Keep it off by default on narrow screens.
- **Effort:** **low**.

### 7. Enemy AI is predictable and focus-fires the weakest unit
- **What:** `bestTarget` scores by effective HP, low HP, healer role and guard, then always picks the top score. Enemies do not protect their healer, do not reposition, and rarely spread damage.
- **Where:** `js/battle/ai.js:38-45` `bestTarget`, `:48-133` `chooseEnemyAction`.
- **Why it hurts:** Once the player notices the pattern, battles become a damage race. The enemy never punishes a greedy back-rank dive or a clustered formation.
- **Severity:** **important**.
- **Fix:** Give each role a target rule: melee brutes prefer low-HP front-rank targets, archers prefer casters, healers retreat/guard, boss uses area attacks when 2+ heroes are below 60%. Add a small вЂњintentвЂќ hint above the enemy next turn.
- **Effort:** **medium**.

### 8. Upgrades can trivialize the late game
- **What:** Four Sharpen purchases give every hero +8 damage. The campaign scan buys two Sharpen before the Cathedral, reaches level 5 with a full heal, and still wins in 9вЂ“10 rounds; by the end it is level 6 with four Sharpen. Watchtower is a 4-round, near-zero-risk opener.
- **Where:** `js/battle/data.js:530-534` `UPGRADES`; `js/main.js:378-409` `applyUpgrade`; `tests/balance-scan.mjs` and `tests/campaign-scan.mjs`.
- **Why it hurts:** The final battle should be the peak; instead it is вЂњthe same fight with bigger numbers.вЂќ The Watchtower does not teach attrition because the party barely takes damage.
- **Severity:** **important**.
- **Fix:** Make upgrades percentage-based or cap Sharpen at 2; scale Cathedral enemy HP by the partyвЂ™s total damage; add one more enemy wave trigger at 50% boss HP. Make Watchtower cost at least one resource (a hero starts wounded or a scripted trap).
- **Effort:** **lowвЂ“medium**.

### 9. Small screens still lose information
- **What:** At 800Г—600 the initiative tower becomes a portrait mosaic with no names; at 390Г—844 the field is tight, bottom panels are compact, and two back-rank units can clamp to the same x position.
- **Where:** `styles.css:3061-3140` mid-height mosaic, `:3142-3280` phone block; `js/render/scene.js:1876` `sizeK`, `:1912-1929` `slotScreen` with x clamp.
- **Why it hurts:** The turn order is the core information of the game; hiding names is acceptable only if portraits are unmistakable, which they are not yet. On phones the field is playable but visually crowded.
- **Severity:** **important**.
- **Fix:** Keep a compact name label in mosaic cards (2вЂ“3 letters or a tooltip), or add a tap-to-expand tower. On phones, use a dedicated 2Г—3 formation with explicit rank rows and slightly smaller sprites; alternatively state вЂњdesktop-first, minimum 900Г—600вЂќ in the README.
- **Effort:** **medium**.

### 10. Accessibility is shallow
- **What:** The battlefield is a canvas with only an `aria-label`; damage floats are `aria-hidden`; the live log is `display:none`; legal targets are distinguished mainly by red rings; there is no volume slider, text-size control or key rebinding.
- **Where:** `index.html:12` scene container, `:101-102` float layer; `js/ui/hud.js:370-382` floats; `styles.css:2822` hidden log; `js/render/scene.js:1710-1780` rings/status visuals.
- **Why it hurts:** Players who cannot rely on color or hearing lose turn state, damage and target information.
- **Severity:** **important** (for a public release; **desirable** for a prototype).
- **Fix:** Add `aria-live="polite"` announcements for turn start, damage, death and victory (reuse the existing log text); add shape/icon differences to target rings; add a volume slider and a вЂњreduce motionвЂќ switch (the renderer already reads `prefers-reduced-motion` at `js/render/scene.js:1817-1822`).
- **Effort:** **medium**.

---

## 4. Full remaining-issues table

| # | Category | Problem | Location | Severity | Solution |
|---:|---|---|---|---|---|
| 1 | Pacing | Default enemy turns wait 430 ms before acting; each event also waits; five enemies feel sluggish without Fast mode. | `js/main.js:246`, `:951-963`, `:965-1030` | desirable | Lower base wait to 300вЂ“340 ms; persist Fast in `localStorage`; shorten non-damage event beats. |
| 2 | Onboarding | Damage formula is not explained: magic uses 35% of armor, armor is subtracted before resist, crit is Г—1.6. | `js/battle/sim.js:244-270` | desirable | Add a short вЂњDamageвЂќ row in How to Play; show a damage preview on target hover. |
| 3 | UX | No damage preview before confirming an attack. | `js/main.js:555-631`; `js/ui/hud.js:385-400` | important | Show вЂњexpected XвЂ“YвЂќ in the target hint/tooltip using min/max and known armor/resist. |
| 4 | UX | Tooltip now shows damage/resist, but ability descriptions are only in the popover; cooldown state is not visible on the wheel. | `js/ui/hud.js:304-322` | desirable | Add cooldown pips to the Ability button; show a compact ability tooltip on hover. |
| 5 | Progression | XP has no bar or numeric display during play; levels appear only as victory chips. | `js/ui/hud.js:541-590`; `js/battle/data.js:653-669` | desirable | Add вЂњXP 120/300вЂќ to the ally panel or victory screen. |
| 6 | Progression | War Camp shows only вЂњ0/4 purchasedвЂќ; it does not show the resulting party stat. | `js/ui/hud.js:541-579` | desirable | Show вЂњDamage 30вЂ“40 в†’ 32вЂ“42вЂќ and вЂњArmor 7 в†’ 9вЂќ before purchase. |
| 7 | Economy | Total gold (570) allows max Sharpen plus one Armor and one Field Hospital; the choice narrows by the last battle. | `js/battle/data.js:558,582,606,530-534` | desirable | Raise costs or reduce rewards; add a third meaningful sink (scout/reroll). |
| 8 | Balance | Watchtower rewards 320 XP and 110 gold and is nearly risk-free; it over-levels the party before Marsh. | `js/battle/data.js:536-559` | desirable | Reduce first reward to 240 XP / 90 gold or add a wounded hero start. |
| 9 | AI | Enemies never use Change Row; they cannot escape a bad front rank or protect a caster. | `js/battle/ai.js:48-133` | desirable | Add a вЂњretreat/guardвЂќ branch for low-HP casters; use `shift` when the front rank is dead. |
| 10 | Content | No enemy heal visual differentiation beyond portrait; Bone AdeptвЂ™s heal can feel invisible. | `js/render/scene.js:1463-1545`; `js/main.js:1139-1146` | desirable | Add a distinct green/white beam and a вЂњ+34вЂќ float over the healed enemy. |
| 11 | Content | One boss with one enrage threshold; no phase 2 or adds. | `js/battle/data.js:505-526`; `js/battle/sim.js:367` | important | Add a 50% HP summon or a second ability; reuse Skeleton template. |
| 12 | Narrative | No dialogue, interludes or character voice between battles; bios are hidden in data. | `js/battle/data.js:247-340` | desirable | Add 2вЂ“3 lines before each encounter and a short epilogue. |
| 13 | Audio | No volume slider; mute is binary; SFX can be harsh on repeated clicks. | `js/audio/sfx.js:40-53` | desirable | Add a 0вЂ“100 volume slider and a soft limiter; vary pitch slightly per hit. |
| 14 | Audio | No ambience per theme; Marsh and Cathedral sound identical to Ruins. | `js/audio/sfx.js:1-216` | important | Add theme-specific drones and one random distant cue every 20вЂ“40 s. |
| 15 | Visuals | Portraits are low-detail and inconsistent with the painted background; faces read as masks. | `js/ui/portraits.js:389` | important | Use the same painted-sprite pipeline as units or add shading/hatching; keep 2Г— resolution. |
| 16 | Visuals | Green soul-fire is a static cone baked into the background; it does not flicker or cast light on units. | `js/render/scene.js:594-621` | desirable | Move it to the animated ambient layer; add 2вЂ“3 layered tongues and a pulsing ground glow. |
| 17 | Visuals | Status effects are mostly color rings/chips; poison/burn are hard to see on the field. | `js/render/scene.js:1697-1780`; `js/ui/hud.js:13-28` | important | Add floating icons above the unit and a tinted ground decal. |
| 18 | UI | Dead combat log (`display:none`) still updates DOM, wasting work and hiding information. | `styles.css:2822`; `js/ui/hud.js:357` | desirable | Expose as a drawer or remove the DOM/update path. |
| 19 | UI | At 800Г—600 the tower mosaic hides names; at 1200Г—800 it only fits because of the 46 px crowded rule. | `styles.css:3033-3059`, `:3061-3140` | desirable | Add 2вЂ“3 letter name labels or a hover/tap tooltip on mosaic cards. |
| 20 | Mobile | 390Г—844 is playable but cramped; x-clamping can stack two back-rank units. | `styles.css:3142-3280`; `js/render/scene.js:1926-1931` | desirable | Dedicated narrow formation; or declare desktop-first in README. |
| 21 | Technical | 41 fps in headless software rendering at 1200Г—800; per-unit gradients are recreated every frame. | `js/render/scene.js:2001-2008`; `drawHumanoid` `:712` | desirable | Cache gradients per palette; pre-render unit poses to offscreen canvases; add an FPS overlay in dev. |
| 22 | Technical | No save/load; refresh loses the campaign. | `js/main.js:48-71`, `:129-137` | important | `localStorage` snapshot at encounter start/victory; Continue button. |
| 23 | Technical | War Camp purchase logic is not directly unit-tested; `campaign-scan.mjs` duplicates it. | `js/main.js:378-409`; `tests/campaign-scan.mjs:41-58` | desirable | Extract `purchaseUpgrade(party, campaign, kind)` into `data.js`; test max/gold/heal guards. |
| 24 | Technical | Fast mode is not persisted; mute is. | `js/main.js:60`, `:942-947`; `js/audio/sfx.js:11` | desirable | Persist fast in `localStorage` and restore on boot. |
| 25 | Technical | No renderer/UI smoke test; regressions in boot/HUD rely on manual screenshots. | `tests/` | desirable | Add a headless DOM smoke test (or a `window.__combat` boot assertion) to CI. |
| 26 | Accessibility | Canvas scene is not keyboard-focusable; targeting requires pointer or global keys. | `index.html:12`; `js/main.js:694-754` | important | Add roving focus to units or a keyboard target list; keep Tab/Enter flow. |
| 27 | Accessibility | Damage floats are `aria-hidden`; hidden log means no live announcement. | `index.html:101-102`; `js/ui/hud.js:370-382` | important | Add a visually hidden `aria-live` region fed by the same events. |
| 28 | Accessibility | No text-size/contrast setting; small 6вЂ“8 px labels in compact modes. | `styles.css:3033-3280` | desirable | Add a UI scale setting; keep min 9 px for critical labels. |
| 29 | Docs | `README.md` was stale (Three.js, WebGL, 13 tests, 4 enemies); `PROGRESS.md` still described the old renderer. | `README.md`, `PROGRESS.md` | important | Rewritten in this pass; keep them in sync with every release. |
| 30 | Repo | Dead Three.js files and stale audits shipped alongside the Canvas build. | `js/render/models.js`, `js/render/effects.js`, `js/vendor/three.min.js`, `AUDIT.md`, `FEATURE_AUDIT.md` | important | Removed in this pass; keep the repo lean. |

---

## 5. Removal list

**Removed in this pass**
- `js/render/models.js` вЂ” 18.8 KB of Three.js primitive models; no imports remain.
- `js/render/effects.js` вЂ” 10.9 KB Three.js `EffectLayer`; replaced by `CanvasEffects` (`js/render/scene.js:1251`).
- `js/vendor/three.min.js` вЂ” 670 KB dead dependency; the game now has no WebGL requirement.
- `AUDIT.md` and `FEATURE_AUDIT.md` вЂ” stale, contradicted the current code and confused context recovery; replaced by this report.

**Should be removed or hidden**
- `#log-panel` DOM plus `renderLog` updates: either expose the Chronicle or delete both; keeping a hidden live-updating panel is waste.
- `#vignette` is fine visually, but if a вЂњreduce motion/contrastвЂќ mode is added, it should be adjustable rather than fixed.
- The original Russian brief `РїСЂРѕРіСЂРµСЃСЃ.txt` (and `battle.md`, `game.md`, `disciples2_battle.md`) are design history, not runtime assets; keep them out of the shipped folder or move to `docs/`.
- Do not keep a second вЂњRowвЂќ control label that says вЂњChange RowвЂќ in help and вЂњRowвЂќ on the wheel; pick one term.

**Do not remove**
- The pure `Battle` simulation, seeded RNG, `window.__combat`, the Canvas 2D renderer, the War Camp, or the reference-layout hierarchy. These are the parts that work.

---

## 6. Rebuild vs patch

| Area | Decision | Why |
|---|---|---|
| `js/battle/sim.js`, `data.js`, `ai.js`, `rng.js` | **PATCH** | Deterministic, tested, understandable. Add content and AI branches; do not rewrite. |
| `js/render/scene.js` | **PATCH architecture, REPLACE art** | The Canvas loop, slot projection, effects and picking are sound. Swap the unit/portrait art source and add ambient/music hooks. |
| `js/ui/hud.js`, `styles.css` | **PATCH** | The reference layout works at 1200Г—800 and degrades to 800Г—600/phone. Add a log drawer, tooltip polish, accessibility hooks. |
| Audio | **REBUILD layer** | `SoundEngine` is fine for SFX; add a separate music/ambience scheduler instead of stretching `play()`. |
| Save/meta | **REBUILD from zero** | No save layer exists; add a small versioned `localStorage` module. |
| Mobile/controller layout | **REBUILD when it becomes a target** | Current responsive CSS is a compromise. A dedicated narrow layout is cheaper than endlessly patching the desktop deck. |
| Narrative | **PATCH data + small overlay** | Add interlude text to `ENCOUNTERS` and a pre-battle overlay; no engine work. |

---

## 7. What is done well and must not break

1. **Deterministic combat core.** `Battle` is pure and seed-driven; 16 tests pass, including identical-seed determinism, initiative ties, rank protection, guard/shield order, poison/stun, Smite vs undead, boss enrage and dead-unit removal (`tests/combat.test.mjs`).
2. **The false вЂњNo WebGLвЂќ path is gone.** The game boots on Canvas 2D with no hardware acceleration; the boot overlay now prints the real error (`js/main.js:73-90`).
3. **Reference composition.** Initiative tower on the right, large circular corner medallions, central action wheel, toast banner and target hint now match the screenshot hierarchy at 1200Г—800.
4. **Readable battle information.** HP bars, initiative order, active-unit highlight, target rings, floats, status chips and the ally/enemy panels all update from one snapshot.
5. **Turn flow and safety.** Targeting has cancel/confirm, pause works during enemy turns and animations, restart restores the pre-battle party snapshot, and dead units leave the order (`js/main.js:482-487`, `:951-963`).
6. **War Camp.** Gold finally has a purpose; the victory screen shows three upgrades, costs, caps, disabled states and a working purchase path (verified live: 110 в†’ 10 gold, Sharpen 1/4).
7. **No-build delivery.** Plain ES modules, static server, no bundler, no CDN, procedural assets, all-English UI.

---

## 8. Bugs and technical risks (with reproduction)

1. **Historical: fake вЂњNo WebGLвЂќ overlay.**
   - Repro (old build): open `index.html` in any browser в†’ overlay says WebGL is required.
   - Cause: `ReferenceError: makeRidgeTexture is not defined` at old `js/render/scene.js:764`; `App.boot` caught it and showed generic WebGL copy.
   - Status: **fixed**; current build boots and plays.

2. **Favicon 404.**
   - Repro (pre-fix): open the page, console shows `Failed to load resource: 404`.
   - Cause: no `<link rel="icon">`.
   - Status: **fixed** with an inline SVG data URI (`index.html:8`); final headless run shows no 404.

3. **10th initiative card clipped at 1200Г—800.**
   - Repro (pre-fix): start Watchtower at 1200Г—800 в†’ вЂњBranвЂќ card cut by the tower footer.
   - Cause: 10 cards Г— 53 px exceeded the 518 px queue height (`styles.css:3033-3059`).
   - Status: **fixed**; crowded cards are 46 px, last card bottom 583, tower bottom 624.

4. **800Г—600 tower hid half the order.**
   - Repro (pre-fix): start battle at 800Г—600 в†’ only 7 of 10 cards visible in a silent scroll list.
   - Cause: `#turn-tower` used the 154 px desktop list inside a 408 px tall panel.
   - Status: **fixed** with a 2-column mosaic at `max-height: 700px` (`styles.css:3061-3140`).

5. **Phone layout is cramped, not broken.**
   - Repro: open at 390Г—844, start battle в†’ horizontal initiative strip fits 10 cards; bottom deck stacks enemy over ally; the field is tight and far units can clamp to the same x.
   - Cause: perspective formation is designed for landscape; `slotScreen` clamps x at `js/render/scene.js:1926-1931`.
   - Status: **mitigated, not solved**; documented as a known limitation.

6. **Victory state keeps `busy: true`.**
   - Repro: finish a battle; `window.__combat.state` reports `mode: "victory"`, `busy: true`.
   - Cause: `concludeBattle` sets busy true and the overlay handlers bypass it.
   - Impact: cosmetic for players; API consumers should check `mode/overlay`, not `busy`.
   - Status: **accepted**, documented.

7. **AudioContext warnings in headless / scripted clicks.**
   - Repro: click via `element.click()` in headless Chrome в†’ repeated вЂњAudioContext was not allowed to startвЂќ warnings.
   - Cause: browser autoplay policy; synthetic clicks are not user activation. Real pointer/key gestures call `SoundEngine.ensure()` (`js/main.js:114-120`).
   - Status: **not a user-facing bug**; verified unlock path exists.

8. **Performance headroom.**
   - Repro: run at 1200Г—800 in headless SwiftShader в†’ ~41 fps over a 2 s RAF sample; canvas is 1200Г—800 at DPR 1.
   - Cause: full-scene Canvas 2D redraw plus per-unit gradients each frame (`js/render/scene.js:712-1245`, `:1998-2005`).
   - Status: **acceptable for desktop**; add offscreen pose caching before targeting low-end mobile.

9. **No save.**
   - Repro: start a campaign, refresh в†’ title screen, all progress gone.
   - Cause: state lives only in `App`; only mute is persisted.
   - Status: **open**, top roadmap item.

10. **War Camp purchase not directly unit-tested.**
    - Repro: inspect `tests/`; `applyUpgrade` is only exercised manually/live, while `campaign-scan.mjs` re-implements the buy loop.
    - Cause: upgrade logic sits in DOM-bound `App`.
    - Status: **open** test gap; extract a pure function.

11. **Hidden live log.**
    - Repro: inspect DOM в†’ `#log-panel` has entries but is `display:none`.
    - Impact: screen readers get no combat narration; players cannot review events.
    - Status: **open**.

---

## 9. Juice: 10вЂ“15 cheap, high-impact ideas

1. **Hit-stop:** freeze the presentation for 45вЂ“70 ms on crits and kills; 120 ms on the final enemy.
2. **Crit punch:** scale the floating number 1.0 в†’ 1.35 в†’ 1.0 over 180 ms and add a white flash on the target.
3. **Impact direction:** spawn sparks along the attackerв†’target vector, not a symmetric burst (`js/render/scene.js:1308` `impact`).
4. **Kill slow-motion:** 0.25 s at 35% speed, then a short desaturated frame, when the last enemy dies.
5. **Boss enrage moment:** one-screen red rim pulse + low drone + вЂњENRAGEDвЂќ banner when the King crosses 50%.
6. **Ground dust:** a small dust ring on Row change and on every melee step.
7. **Arrow feel:** stick the arrow in the target for 0.4 s before it fades; add a thin trail.
8. **Heal motes:** 8вЂ“12 rising green/white motes plus a soft two-note chime; float вЂњ+34вЂќ above the healed unit.
9. **Status burst:** when poison/burn/stun is applied, pop the status icon above the head and pulse the ground decal.
10. **Initiative reorder animation:** slide cards when Wait/Shift changes the order; highlight the moved card for 300 ms.
11. **Low-HP heartbeat:** subtle vignette pulse and a low thump when a hero drops below 25%.
12. **UI press feel:** 0.97 scale + 1 px inset on wheel buttons; a short tick on hover.
13. **Victory coin burst:** 12вЂ“20 gold sparks from the chest line on the victory screen.
14. **Target ring breathe:** legal targets pulse at 0.8 s; the hovered target gets a brighter inner ring.
15. **Ambient lightning:** every 20вЂ“40 s a distant flash and 0.6 s delayed rumble on the Cathedral theme.

---

## 10. What is missing (largest quality gains)

- **Damage preview / threat read:** expected damage, hit chance and вЂњwho will act nextвЂќ on hover.
- **Ability unlocks and perk choices:** the difference between level 3 and level 6 must be a new decision, not a bigger number.
- **Save/continue and a settings screen:** volume, UI scale, reduce motion, fast mode persistence.
- **Music and per-theme ambience:** the single cheapest way to make the game feel twice as expensive.
- **A codex/bestiary:** enemy resistances, abilities and lore; also solves the вЂњwhat killed me?вЂќ problem.
- **Two more encounters and elite variants:** content volume is the main retention ceiling.
- **Narrative interludes:** 2вЂ“3 lines before each battle and an epilogue; the data already has bios and subtitles.
- **A combat log drawer:** reviewable events, also the backbone of accessibility announcements.
- **Controller/gamepad and a dedicated phone layout:** only if those platforms are actually targets.

---

## 11. Prioritized roadmap

Impact and effort are 1вЂ“5; priority = impact Г· effort.

### Stage 1 вЂ” Quick wins (each 1вЂ“2 hours)

| Item | Impact | Effort | Priority |
|---|---:|---:|---:|
| Combat log drawer / one-line event ticker | 3 | 2 | **1.50** |
| Damage preview + full resist tooltip (resist row already added) | 4 | 2 | **2.00** |
| Persist Fast mode; shorten enemy wait 430 в†’ 320 ms | 2 | 1 | **2.00** |
| Hit-stop + crit punch | 3 | 2 | **1.50** |
| War Camp shows stat deltas before purchase | 2 | 2 | **1.00** |
| Mobile strip/name labels and 800Г—600 readability | 2 | 2 | **1.00** |
| Procedural ambient drone per theme | 3 | 2 | **1.50** |
| Victory coin burst + button press feel | 1 | 1 | **1.00** |

### Stage 2 вЂ” Substantial improvements

| Item | Impact | Effort | Priority |
|---|---:|---:|---:|
| Ability unlocks/perks at levels | 5 | 4 | **1.25** |
| Save/load + Continue | 5 | 4 | **1.25** |
| Damage preview / AI intent indicators | 4 | 2 | **2.00** |
| Role-based enemy AI + healer protection | 4 | 4 | **1.00** |
| Two new encounters + elite variants | 5 | 5 | **1.00** |
| Difficulty modes (Story / Standard / Ash) | 4 | 3 | **1.33** |
| Volume slider + theme ambience + victory theme | 3 | 2 | **1.50** |
| Codex / bestiary | 3 | 3 | **1.00** |

### Stage 3 вЂ” Deep rework

| Item | Impact | Effort | Priority |
|---|---:|---:|---:|
| Painted sprite pipeline (units + portraits) | 5 | 5 | **1.00** |
| Meta-progression / NG+ / endless | 5 | 5 | **1.00** |
| Dedicated phone/controller layout | 4 | 4 | **1.00** |
| Narrative interludes and epilogue | 4 | 5 | **0.80** |
| Content/mod pipeline for new encounters | 3 | 5 | **0.60** |

**Recommended order:** finish Stage 1, then take save/load + perks (Stage 2) before new content; atmosphere and progression will do more for retention than a fourth encounter that plays like the first three.

---

## Appendix вЂ” verification evidence

- `node --test tests/combat.test.mjs` в†’ **16 pass, 0 fail**.
- `node tests/balance-scan.mjs` в†’ all encounters resolve; Watchtower 4вЂ“5 rounds, Marsh 6вЂ“8, Cathedral 11вЂ“18 without progression (often defeat), 9вЂ“10 with progression.
- `node tests/campaign-scan.mjs` в†’ seeds 1, 2, 3, 7, 11, 42: all campaigns reach the Cathedral and win with levels/upgrades; final level 6; one hero loss on most seeds; 570 gold total, 10 left after sensible purchases.
- Headless Chrome at 1200Г—800, 800Г—600 and 390Г—844: no JS exceptions, no 404, player turn reached; screenshots inspected for tower clipping, panel overlap and scene readability.
- Live War Camp: Watchtower victory at seed 7 в†’ 110 gold; purchase Sharpen Blades в†’ 10 gold, вЂњ1 / 4 purchasedвЂќ; all buttons correctly disabled afterward.
