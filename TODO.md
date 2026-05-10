# TODO

## Refactoring

### Code quality / maintainability
- [ ] fix: fix the `crown_of_widsom` typo
- [ ] refactor: remove magic strings/numbers everywhere

### Migrate to TypeScript
- [x] build: add `typescript` and `@types/node` as dev dependencies
- [x] build: vulnerability fix
- [ ] chore: create `tsconfig.json` with `NodeNext` module and resolution, `ES2022` target `strict` mode
- [ ] chore: rename all `.js` files to `.ts`
- [ ] chore: update all imports to include `.js` extension (NodeNext requirement)
- [ ] chore: update `package.json` start script to `.ts`

### Extensibility
- [ ] feat: make the code easier to add classes, quests, NPCs, etc.

### Architecture overhaul
- [ ] feat: implement a state manager
- [ ] feat: implement an event system
- [ ] refactor: proper separation of concerns (e.g., separate UI, game logic, and data management)
  - [ ] refactor(Player.js): too many responsibilities (e.g., managing player stats, inventory, quests, etc.)
  - [ ] refactor(game.js): god object with 17 imports
  - [ ] refactor(dialogue.js): mixed data/UI/logic
  - [ ] refactor(item.js): mixed data/UI/logic