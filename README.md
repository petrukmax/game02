# Ashen Crown — Tactical Battle Prototype

A Disciples II-style turn-based combat prototype in English. Canvas 2D only: no WebGL, no external assets, no backend, and no runtime dependencies. Players need only open `index.html`.

## Launch

**Double-click `index.html`.** No server, no install and no build step are required for players. The page loads one classic script (`js/ashen-crown.js`), so it also works when opened directly from disk with `file://`.

If you prefer a local server, any static server works. On Windows:

```bash
node server.cjs
# then open http://127.0.0.1:8124/
```

`python -m http.server 8888 --bind 127.0.0.1` also works. Open the page in a current Chrome, Edge, Firefox or Safari. A GPU is not required.

## Publishing to GitHub Pages

The repository is ready to publish as-is: all paths are relative, there are no external assets, and `.nojekyll` is included.

1. Create a repository on GitHub and push this folder to its default branch (`main` or `master`).
2. In **Settings → Pages → Build and deployment**, choose one of these sources:
   - **GitHub Actions** — the included workflow (`.github/workflows/pages.yml`) builds the bundle and deploys on every push.
   - **Deploy from a branch** — select the default branch and the `/ (root)` folder. The committed `js/ashen-crown.js` is used directly.
3. Open `https://<user>.github.io/<repository>/`.

The game is served from a subdirectory on project Pages, which is fine because `index.html` references `styles.css` and `js/ashen-crown.js` relatively.

### Rebuilding after editing the source modules

The playable file is generated from `js/main.js` and its imports:

```bash
node build.mjs
# or: npm run build
```

Commit the regenerated `js/ashen-crown.js` when deploying from a branch. When deploying with the included Actions workflow, the bundle is rebuilt automatically.

> Why a bundle? Browsers block ES module imports on `file://` for security (CORS). A classic script avoids that restriction, so the same build runs both from a double-clicked file and from GitHub Pages.

## Controls

| Key | Action |
| --- | ------ |
| `1` / click | Attack |
| `2` / click | Abilities (open list) |
| `3` / click | Defend |
| `4` / click | Wait |
| `5` / click | Change Row |
| `Tab` | Cycle target (during targeting) |
| `Enter` | Confirm target |
| `Esc` | Cancel / Pause / Resume |
| `M` | Mute / Unmute |
| `F` | Toggle fast presentation |
| `H` | Help |

Mouse/touch: hover for tooltip; click a unit to inspect; click a red ring to select a target; click the battlefield with no target selected to inspect.

## Campaign

Five heroes, three fields, one boss:

1. **Ruined Watchtower** — 5 enemies; teaches targeting, front-rank protection, Defend and Wait.
2. **The Sunken Marsh** — 5 enemies; introduces poison, area attacks and a healer.
3. **The Bone Cathedral** — 5 enemies; The Hollow King enrages below 50% HP.

Victory grants XP, gold and level-ups. Between battles, the **War Camp** turns gold into:

- **Sharpen Blades** — +2 damage for every hero (100 gold, max 4).
- **Reinforce Armour** — +2 armour for every hero (90 gold, max 4).
- **Field Hospital** — restore the party to full health (70 gold).

Levelling is automatic and scales HP/damage. Fallen heroes return at 25% HP for the next battle; the party also recovers 20% between battles. Defeat offers a retry that restores the pre-battle party.

## Architecture

- `index.html` — entry point and DOM shell; loads `js/ashen-crown.js` with a classic `<script>` tag.
- `js/ashen-crown.js` — generated, committed bundle of all `js/` modules. Runs from `file://` and static hosting.
- `build.mjs` — zero-dependency bundler that flattens the ES module graph into the classic script.
- `js/main.js` — `App`: campaign flow, input, targeting, presentation queue, overlays, War Camp, `window.__combat` inspection API.
- `js/battle/sim.js` — pure `Battle` simulation: initiative, rounds, actions, damage, statuses, victory/defeat.
- `js/battle/data.js` — hero/enemy templates, abilities, statuses, encounters, rewards, XP/levels, upgrades.
- `js/battle/ai.js` — enemy decision logic.
- `js/core/rng.js` — deterministic mulberry32.
- `js/render/scene.js` — Canvas 2D battlefield: painted background, procedural sprites, effects, picking, responsive projection.
- `js/ui/hud.js` — initiative tower, corner panels, action wheel, tooltip, floats, overlays.
- `js/ui/portraits.js` — procedural portraits at 2× resolution.
- `js/audio/sfx.js` — procedural Web Audio SFX (no music yet).
- `styles.css` — reference layout, compact/mosaic/phone breakpoints, War Camp.
- `AUDIT_V2.md` — current evidence-based audit, TOP-10, roadmap.
- `PROGRESS.md` — context-recovery log.

## Verification

Node 18+:

```bash
node build.mjs                      # regenerate js/ashen-crown.js
node --test tests/combat.test.mjs   # 16 tests
node tests/balance-scan.mjs         # 3 encounters × 6 seeds
node tests/campaign-scan.mjs        # full campaign with XP/levels/upgrades
```

Expected: bundle builds cleanly, 16 tests pass with 0 failures, every encounter resolves, and all scanned campaigns reach the Cathedral and win with progression.

## Known limitations

- Unit and portrait art is flat procedural vector art, not painted sprites; visuals are the largest remaining gap to Disciples II.
- No music or ambient bed, no volume slider.
- Progression is stat-only; abilities do not unlock and there are no perk choices.
- No save/load: refreshing the page loses the campaign.
- Content is three encounters (~15 minutes); replay value is limited.
- The combat log exists but is hidden; there is no event review yet.
- Phones are playable but cramped; the game is desktop-first (1200×800 is the intended layout, 800×600 is supported).
- Enemy AI is predictable and focuses low-HP targets.
- No damage preview before confirming an attack.
- War Camp purchase logic is covered indirectly by the campaign scan, not by a direct unit test.

## Inspection API

Open the console during play:

```js
window.__combat.state
window.__combat.snapshot()
window.__combat.actions()
window.__combat.targets('attack')
window.__combat.startEncounter(0, 7)
window.__combat.begin()
window.__combat.act('attack', '<uid>')
window.__combat.setFast(true)
```

All docs and player-facing text are in English.
