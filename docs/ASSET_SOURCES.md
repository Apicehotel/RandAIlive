# Asset and rendering sources

RandAILive's active 2.5D HD renderer does **not** copy StarNet artwork.

## Kenney asset library

- Source mirror: https://github.com/shorepine/kenney
- License: CC0 1.0
- Use in this branch: evaluated as the preferred source for future selective furniture/environment sprites. No binary Kenney artwork is vendored yet; current floors and furniture are procedural Rand assets.

## RealmForge

- Repository: https://github.com/mattiaa95/realmforge
- License: MIT for code; repository documents Kenney CC0 assets.
- Use in this branch: reference for Phaser 3 isometric projection conventions, 2:1 tile sizing and procedural texture generation. RandAILive implements its own modules and hotel world.

## Rand procedural artwork

The files below are original project code/assets generated at runtime:

- src/iso/iso-textures.js
- src/iso/iso-props.js
- src/iso/iso-renderer.js

These produce the active HD materials, 2.5D furniture and cutaway hotel walls without requiring third-party binary art.
