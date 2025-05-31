- instead of `checkQuestProgression`, which hardcodes quests in logic. We should progress quest after the player takes the ancient artifact and talk to the hermit
- Hermit takes the crown of wisdom from your inventory
- taking the artifact should progress the quest. 
- after returning the artifact, use the `completeQuest` function
- ```const quest = player.activeQuests.find(q => q.key === 'investigate_ruins');
                    if (quest) quest.progress = 2;``` Maybe implement a function for quest progress. It's important to give player feedback. 
- do not put effect data in items.js

- implement the stat boost of items
- implement lootTable of 'forest' and 'ruins'
- implement special artifact_chamber
- you can only visit the ancient ruins after you accepted the quest
- remove save and reload functionality
- when `Examine it carefully`, if the player is not cleric, they would not have a holy symbol. 
- Player should be able to explore the ruins fully. Right now, if the player picks the left passage, then we are only given the option to return to main menu, instead of keep exploring.
- implement the `unlock_secret` effect of ancient_tablet
- organize the directory better
- player should be able to sell items
- effects should not be able to stack, like the blessing and the permanent mana increase from the ancient tablet. implement a better effect system
- in `enterLocation`, `const npcKey = action.split('_')[1];` does not work since we have npcKey like `forest_warden`
- `useItem` message should not override itself. For example, if an item has both health and mana effect, it only shows the mana message and not the health message. 



- [ ] Class-based character progression
- [ ] 5+ locations with unique quests
- [x] 3+ enemy types with combat
- [ ] 5+ interactive NPCs
- [x] 20+ items with procedural generation
- [x] Multiple quest lines
- [ ] 3 distinct endings based on player choices