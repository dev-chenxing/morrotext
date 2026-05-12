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
- [x] feat: create `src/types/index.ts` -- interfaces for `Item`, `Quest`, `Dialogue`, `Area`, `Action`, `Effect`, `Player`, `Class` etc.
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
- [ ] feat: keep stock inifinite for now (do not decrement NPC inventory)
- [ ] 

### Data Separation
- [ ] refactor: extract creature definitions from `systems/combat.ts` into `src/world/creatures.ts`
- [ ] refactor: extract NPC dialogue trees from `systems/dialogue.ts` to a separate dialogue content file, keeping only dialogue engine logic
- [ ] refactor: keep `items.ts` as pure data registry + `useItem()` logic, move `handleEquipment()` UI logic to a new `src/systems/equipment.ts`

### Action System
- [ ] feat: create `src/systems/action.ts` with
  - [x] `Action` interface with properties like `id`, `name`, `description`, `execute(player, target?)`, `condition?(player, target?)`
  - [x] `ACTIONS` registry with `fireball`, `cure_wounds`, `divine_smite`, etc.
  - [ ] `getClassActions(className: string): Action[]` function to return available actions for a given class
  - [x] refactor: remove `castFireball()` and `divineHeal()` from `Player` class
  - [ ] refactor: update `systems/combat.ts`'s `getAvailableActions()` and combat loop to use action registry instead of hardcoded logic

### Slim `Player.ts` & Actor Foundation
- [ ] feat: create `src/actors/Actor.ts` base class with shared state and behavior:
  - [ ] state: stats, level, inventory, equipment, effects
  - [ ] methods: inventory add/remove, equipment equip/unequip + stat recomputation, effect apply/tick/expire
- [ ] feat: create `src/actors/Creature.ts` class that extends `Actor` with creature-specific state/behavior (e.g., name, description)
- [ ] feat: create `src/actors/NPC.ts` class that extends `Actor` with NPC-specific state/behavior (e.g., name, description, class, barter gold)
- [ ] refactor: move shared logic from current `Player.ts` into `Actor.ts`
- [ ] refactor: refactor `src/actors/Player.ts` to extend `Actor` and keep only player-specific concerns:
  - [ ] levelUpProgress
- [ ] refactor: replace timer-based `updateEffects()` with explicit `onTick()` calls from the game loop
- [ ] refactor: update all consuming systems (`combat`, `items`, `shop`, `hud`, `ruins`, `dialogue`) to use the new inheritance contract


### Quest Manager
- [ ] feat: create `src/systems/QuestManager.ts` that owns active/completed quest maps, current stage per quest, and imports quest definitions from `world/quests.ts`.
  - [ ] feat: expose centralized quest API (e.g., `setQuestStage`, `getQuestStage`)
  - [ ] feat: enforce stage monotonicity (can skip stages but can't go backwards)
- [ ] refactor: refactor dialogue to prioritized dialogue entries that each have a condition and result
- [ ] refactor: update quest menu rendering to read from journal entries and current stage metadata rather than raw objective indexes
- [ ] refactor: replace old save/state quest shape with the new QuestManager snapshot format
- [ ] refactor: remove deprecated helper functions `startQuest()` from `world/quests.ts`
- [ ] refactor: delete obsolete player quest fields and replace all `player.quests` manipulations with `QuestManager` API calls
- [ ] refactor: update `game.ts` to construct and pass `QuestManager` instance

### Dialogue Engine Refactor
- [ ] refactor: no NPC-specific code in dialogue engine
- [ ] refactor: remove dialogue option `shop`
- [ ] feat: gate barter dialogue options on NPC barter flags (only show if NPC has at least one set)
- [ ] refactor: rename menu wording from “Shop” semantics to “Barter” where appropriate

### Data Handler
- [ ] feat: create `src/dataHandler/index.ts` as a data handler for data like current area, state, etc. that needs to be globally accessible but isn't player-specific
- [ ] feat: create `src/dataHandler/nonDynamicData.ts` as a non-dynamic data store:
  - [ ] `classes.ts`
  - [ ] `state.ts`: story flags
  - [ ] methods: `setFlag`, `hasFlag`
- [ ] refactor: move all story flags from `Player.ts` into `state.ts`
- [ ] refactor: keep save/serialization shape deterministic (plain object output from state)

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