# Asset sources and license ledger

Last review: 2026-09-26.

This document separates assets actually shipped by RandAILive from packs and repositories that were only evaluated. A pack is not copied into the project until its license, visual consistency and technical cost have been checked.

## Shipped in this branch

| Source | Type | License | Files / use |
|---|---|---|---|
| Rand procedural artwork | Original code-generated materials and props | Project-owned | `src/iso/iso-textures.js`, `src/iso/iso-props.js`, `src/iso/iso-renderer.js` |
| [Phaser](https://github.com/phaserjs/phaser) | Runtime/rendering engine | MIT | Existing npm dependency; scene, input, camera and display list |

No third-party PNG, sprite sheet, texture, model, logo or sound file is vendored by this branch.

## Evaluated CC0 sources

| Source | License evidence | Evaluation | Decision |
|---|---|---|---|
| [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) | The official pack page states Creative Commons CC0 | 140 furniture/interior 3D files; coherent and safe source for a future rendered atlas | Not imported. Current procedural props are more visually uniform and avoid adding a 3D-to-sprite build step. |
| [Kenney isometric catalogue](https://kenney.nl/assets/tag:isometric) | Kenney asset pages expose the license per pack; candidate packs must still be checked individually | Useful for bases and generic isometric vocabulary | Not imported. No single hotel/interior pack matched the active Rand material system closely enough. |
| [Quaternius Ultimate House Interior Pack](https://quaternius.com/packs/ultimatehomeinterior.html) | Official page: free for personal and commercial projects; Quaternius catalogue identifies packs as CC0 | 120+ models including doors, kitchen and bathroom furniture | Not imported. Suitable candidate if the project later adds an offline Blender atlas pipeline. |
| [Quaternius Furniture Pack](https://quaternius.com/packs/furniture.html) | Official page: free for personal and commercial projects; catalogue uses CC0 | Generic furniture essentials | Not imported for the same style/pipeline reason. |

## Evaluated technical references

| Source | License | Evaluation / use |
|---|---|---|
| [Phaser official examples: depth sorting](https://labs.phaser.io/index.html?dir=depth%20sorting/) | Phaser examples are distributed with Phaser under MIT | Verified the engine’s depth model. RandAILive uses its own `x + y` depth calculation. |
| [Tiled documentation](https://doc.mapeditor.org/en/stable/manual/introduction/) | Documentation reference | Evaluated for an editor-driven pipeline. The current maps stay code/data generated to keep doors, obstacles and tests in one source of truth. |
| [RealmForge](https://github.com/mattiaa95/realmforge) | MIT; repository documents Kenney CC0 inputs | Evaluated in PR #21 for Phaser isometric conventions. No source file or binary asset is copied into RandAILive. |

## Explicit exclusions

- StarNet artwork, logos, sprite sheets, characters and branded material are not used.
- Packs with unclear, custom, non-redistributable or attribution-incompatible terms are not imported.
- Search-result thumbnails and preview images are never treated as licensed game assets.
- LimeZu and other marketplace packs were not incorporated because their pack-specific terms are not CC0/MIT/Apache-2.0 and would complicate redistribution.

## Procedure for future imports

1. Link the exact official source page and a stable license reference.
2. Record author, pack version, download date and asset filenames.
3. Store an unmodified copy of the license beside imported files.
4. Convert assets through a reproducible atlas pipeline; do not edit only the built output.
5. Check isometric angle, scale, palette, occlusion anchor and mobile memory use.
6. Add a visual regression screenshot and build-size check.
7. Update this ledger in the same Pull Request.
