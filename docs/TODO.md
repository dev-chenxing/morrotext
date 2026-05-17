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

### "So a leveled item is an 'object'"
- [ ] refactor: rename `loot.ts` to `leveledItems.ts`, rename `generateLoot` to `pickFromLeveledItems`
- [ ] refactor: instead of `useItem`, create a `createItem` factory function that takes an item registry entry and returns a new instance of that item
- [ ] refactor: separate the `LeveledItem` registry from the logic
- [ ] refactor: `leveledItems.ts` should not directly import `items.ts`

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
- [ ] feat: create `src/systems/quest.ts`.
  - [x] feat: implement `Quest` extend `GameObject` and add `isActive`, `isFinished`, `isStarted`, and `objectType` fields.
  - [ ] refactor: migrate story flag writes into actual `Reference.data`/`tempData` helpers
  - [ ] refactor: remove `activeQuests`, `completedQuests`, `storyFlags`, and `killCount` from `Player`
  - [ ] feat: enforce stage monotonicity (can skip stages but can't go backwards)
- [ ] feat: add `worldController` to `gameState`
- [ ] refactor: refactor dialogue to prioritized dialogue entries that each have a condition and result
- [ ] refactor: remove deprecated helper functions `startQuest()` from `world/quests.ts`
- [ ] refactor: migrate dialogue content entries to include `script` fields where they should grant rewards or update journals

### Dialogue Engine Refactor
- [ ] refactor: no NPC-specific code in dialogue engine
- [ ] refactor: remove dialogue option `shop`
- [ ] feat: gate barter dialogue options on NPC barter flags (only show if NPC has at least one set)
- [ ] refactor: rename menu wording from “Shop” semantics to “Barter” where appropriate

### Data Handler
- [x] refactor: rename `areas.ts` to `cells.ts`
- [ ] feat: use `game.dataHandler.nonDynamicData` for all base content (cells, classes, etc.). be globally accessible but isn't player-specific
- [ ] feat: each `Cell` contains `activators`, `actors`, and `statics` — each a `ReferenceList` of `Reference` objects holding runtime `data`.
- [ ] feat: populate cell reference lists from content so NPCs/statics/activators become real `Reference` instances
- [ ] feat: Add `Mobile` types to represent ephemeral runtime actors (combat/spawns) and track them in `game.worldController.allMobileActors`.
- [ ] feat: finish the `MobileActor` split so runtime combat actors stop depending on the old actor-stat layout

### Game State & Entry Point
- [ ] feat: create `src/GameState.ts` to hold `player`, `questManager`, `dataHandler` and pass it to all systems instead of singletons or direct imports
- [ ] refactor: remove `setInterval(updateEffects)` and replace with `Actor.onTick()` calls from the main game loop in `game.ts`

### Extensibility
- [ ] feat: make the code easier to add classes, quests, NPCs, etc.

### More Architecture Overhaul
- [ ] feat: implement an event system
- [ ] refactor: proper separation of concerns (e.g., separate UI, game logic, and data management)
  - [ ] refactor(dialogue.ts): mixed data/UI/logic
  - [ ] refactor(item.ts): mixed data/UI/logic