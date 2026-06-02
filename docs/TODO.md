# TODO

## Refactoring

### Migrate to TypeScript
- [x] build: add `typescript` and `@types/node` as dev dependencies
- [x] build: vulnerability fix
- [x] build: add `tsconfig.json`
- [x] chore: rename all `.js` files to `.ts`
- [x] chore: update all imports to include `.js` extension
- [x] chore: update `package.json` start script to `.ts`
- [x] fix: resolve all TypeScript errors and warnings

### Types & Constants
- [x] feat: create `src/types/index.ts` -- interfaces for `Item`, `Quest`, `Dialogue`, `Cell`, `Action`, `Effect`, `Player`, `Class` etc.
- [x] refactor: apply types to existing codebase (e.g., `classes.ts`, `items.ts`, `effects.ts`)
- [x] fix: fix the `crown_of_widsom` typo
- [x] feat: create `src/constants.ts` -- for all hardcoded strings/numbers (e.g., ObjectType)

### Leveled Loot + NPC Barter Migration
- [x] refactor: update `constants.ts` to remove loot rarity and shop type constants; introduce `OBJECT_TYPE.ALCHEMY`
- [x] refactor: update `types.ts` to remove ShopType/LootRarity and add leveled item structure
- [x] refactor: refactor `loot.ts` from rarity buckets to leveled lists with field `list: LeveledListNode[]`, each node having `levelRequired` and `object` fields
- [x] feat: implement `.pickFrom()` method to choose a random item from the list based on the player's level and support nested list traversal with guardrails (visited list/depth limit) to prevent cycles
- [x] refactor: refactor `items.ts` to replace consumable typing with alchemy
- [x] feat: refactor `src/world/npcs.ts` NPC registry file to define NPC objects for smith and publican (inventory/barter flags)
- [x] refactor: rename `shop.ts` to `barter.ts` and rename `openShop` to `barter`
- [x] refactor: update barter logic to filter items based on NPC trade capabilities
- [x] refactor: update NPC inventory to use infinite stock for now (do not decrement NPC inventory)
- [x] refactor: update NPC inventory logic to support finite stock and restocking over time

### Data Separation
- [x] refactor: extract creature definitions from `systems/combat.ts` into `src/world/creatures.ts`
- [x] refactor: extract NPC dialogue into a separate content file
- [x] refactor: reorganize item definitions in `items.ts` and extract equipment logic into `src/systems/equipment.ts`

### Action System
- [x] feat: create `src/systems/action.ts` with
  - [x] `Action` interface with properties like `id`, `name`, `description`, `execute(player, target?)`, `condition?(player, target?)`
  - [x] `ACTIONS` registry with `fireball`, `cure_wounds`, `divine_smite`, etc.
  - [x] refactor: remove `castFireball()` and `divineHeal()` from `Player` class

### Rename and Rebrand
- [x] docs: audit outdated claims in README against current code
  - [x] docs: fix overstated or mistated features (e.g., "procedural world", "dynamic dialogues", "multi-stage quests")
- [x] chore: rename `text-rpg` to `morrotext` across the codebase and documentation 
- [x] docs: add a preview PNG to the README showcasing the game title
- [ ] docs: add a demo GIF to the README showcasing gameplay

### Cell Controller Refactor
- [ ] feat: add `isDead` flag to `MobileActor` and use it in `enterCell()` to exit loop
- [ ] refactor: refactor `enterCell()` to use a more robust player action system

### "So a leveled item is an 'object'"
- [x] refactor: rename `loot.ts` to `leveledItems.ts`, rename `generateLoot` to `pickFromLeveledItems`
- [x] refactor: split static item registry entries from runtime item objects
  - [x] feat: add `createAlchemy`/`createArmor`/`createMisc`/`createWeapon` factories
- [x] refactor: separate the `LeveledItem` registry from the logic
- [x] refactor: `leveledItems.ts` should not directly import `items.ts`

### Slim `Player.ts` & Actor Foundation
- [x] feat: create `src/actors/Actor.ts` base class with shared state and behavior:
  - [x] state: attributes, level, inventory, equipment
  - [x] methods: inventory add/remove, equipment equip/unequip
- [x] feat: create `src/actors/Creature.ts` class that extends `Actor` with creature-specific state/behavior (e.g., name, description)
- [x] feat: create `src/actors/NPC.ts` class that extends `Actor` with NPC-specific state/behavior (e.g., class, barterGold)
- [x] refactor: remove `startingItems` and `addStartingItems()` from `Player`
- [x] refactor: update `Player.inventory` to `Inventory` type instead of record
- [x] refactor: move shared logic from current `Player.ts` into `Actor.ts`
- [x] refactor: refactor `src/actors/Player.ts` to extend `Actor` and keep only player-specific concerns

### Quest & Dialogue Overhaul
- [x] feat: create `src/systems/quest.ts`.
  - [x] feat: implement `Quest` extend `GameObject` and add `isActive`, `isFinished`, `isStarted`, and `objectType` fields.
  - [x] refactor: migrate story flag writes into actual `Reference.data`/`tempData` helpers
  - [x] refactor: remove `activeQuests`, `completedQuests`, `storyFlags`, and `killCount` from `Player`
  - [x] fix: enforce stage monotonicity (can skip stages but can't go backwards)
- [x] feat: add `worldController` to `gameState`
- [x] refactor: remove deprecated helper functions `startQuest()` from `systems/quest.ts`
- [x] refactor: migrate dialogue content entries to include `script` fields where they should grant rewards or update journals
- [ ] feat: add dialogue text dynamic insertion like `%Name`/`%PCName`/`%rank`/`%faction` and implement a simple parser to replace those with runtime values
- [x] feat: add `mt.findQuest`
- [ ] fix: `mt.updateJournal()` should return false if the journal entry of the given index doesn't exist
- [ ] refactor: refactor `matchesFilters` in `systems/dialogue.ts`
- [ ] feat: add `StartScript` type

### Dialogue Engine Refactor
- [x] refactor: no NPC-specific code in dialogue engine
- [x] refactor: remove dialogue option `shop`
- [x] feat: gate barter dialogue options on NPC barter flags (only show if NPC has at least one set)
- [x] refactor: rename menu wording from “Shop” semantics to “Barter” where appropriate

### Data Handler
- [x] refactor: rename `areas.ts` to `cells.ts`
- [x] feat: use `game.dataHandler.nonDynamicData` for all base content (cells, classes, etc.). be globally accessible but isn't player-specific
- [x] feat: each `Cell` contains `activators`, `actors`, and `statics` — each a `ReferenceList` of `Reference` objects holding runtime `data`.
- [x] feat: Add `MobileActor`/`MobileCreature`/`MobileNPC`/`MobilePlayer` contract in `types.ts` to represent ephemeral runtime actors
- [x] feat: create a dedicated `mt` module under `core/`
- [x] refactor: move the existing state and getters from `gameState` into `mt` global and remove `gameState.ts`, for example, `mt.worldController` instead of `gameState.worldController`, `mt.getCell()` instead of `gameState.getCell()`, etc.
- [ ] feat: track all `MobileActor`s in `game.worldController.allMobileActors`
- [x] refactor: update startup in `engine.ts` so creating a new game also creates and registers the `MobilePlayer`, then insert it into `mt.worldController.allMobileActors`
- [x] feat: finish the `MobileActor` split so combat/runtime code stops depending on the old direct `Player` shape
- [ ] feat: populate cell reference lists from content so NPCs/statics/activators become real `Reference` instances
- [x] feat: start the next `mt` API slice for mutation methods like `createObject()`, and `createReference()`.
- [ ] refactor: remove legacy fields in `Action`

### More Architecture Overhaul
- [ ] feat: implement an event system
- [x] refactor: proper separation of concerns (e.g., separate UI, game logic, and data management)
  - [x] refactor(dialogue.ts): mixed data/UI/logic
  - [x] refactor(item.ts): mixed data/UI/logic