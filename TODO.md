- when `Examine it carefully`, if the player is not cleric, they would not have a holy symbol, so they would not say "You notice faint inscriptions matching your holy symbol". 
- Player should be able to explore the ruins continuously. Right now, if the player picks the left passage, then we are only given the option to return to main menu, instead of keep exploring.
- organize the directory better
- player should be able to sell items
- the permanent mana increase from the ruins can only happen once.
- `useItem` message should not override itself. For example, if an item has both health and mana effect, it only shows the mana message and not the health message. 
- If you have completed a quest like `investigate_ruins`, the quest giver will try to give you the same quest again
- After you completed the slay goblin quest, there would be no goblin spawning anymore
- in `enterLocation`, there should be an option to explore to encounter enemy, instead of exiting and reentering
- we use `enterLocation` to exit dialogue, and immediately encounter enemy and enter combat, which interrupts player's flow. Maybe add a flag to `enterLocation` to fix this issue.
- after we reach level 5, the showPlayerStats display `EXP:    2050/undefined`. Please fix it.


- [ ] Class-based character progression
- [ ] 5+ locations with unique quests
- [x] 3+ enemy types with combat
- [ ] 5+ interactive NPCs
- [x] 20+ items with procedural generation
- [x] Multiple quest lines
- [ ] 3 distinct endings based on player choices