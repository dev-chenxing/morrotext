import inquirer from "inquirer";
import chalk from "chalk";
import { openShop } from "./shop.js";
import { completeQuest, isQuestAvailable, QUESTS } from "../world/quests.js";
import { resolveDynamic } from "../utils/dynamicUtils.js"

export const npcDialogues = {
  blacksmith: {
    name: "Blacksmith",
    dialogues: {
      initial: {
        question: "Steel and iron! What can I forge for you today?",
        options: [
          {
            text: 'Browse weapons and armor',
            action: 'open_shop',
            shop: 'blacksmith'
          },
          {
            text: 'Ask about special orders',
            action: 'special_orders',
          },
          { text: "Leave", action: "leave" }
        ]
      },
      special_orders: {
        question: (player) => {
          if (isQuestAvailable(player, 'special_orders')) { return "I need rare materials for a special commission. Can you help?" }
          else {
            return "Have you brought what I need?"
          }
        },
        options: [
          {
            text: "I'll gather the materials",
            action: 'start_quest',
            quest: 'special_orders',
            condition: (player) => isQuestAvailable(player, 'special_orders')
          },
          {
            text: "[Hand over materials] I have everything",
            action: 'complete_special_orders',
            condition: (player) =>
              player.activeQuests.some(quest => quest.key === 'special_orders') && player.getInventoryCount('void_essence') >= 5
          },
          {
            text: "I'm still gathering materials",
            action: 'leave',
            condition: (player) => player.activeQuests.some(quest => quest.key === 'special_orders')
          },
          {
            text: "What do you need exactly?",
            action: 'material_details'
          }
        ]
      },
      material_details: {
        question: "I need 5 Void Essence. You can find them in the ruins.",
        options: [
          {
            text: "I accept the task.",
            action: 'start_quest',
            quest: 'special_orders',
            condition: (player) => isQuestAvailable(player, 'special_orders')
          },
          {
            text: "That sounds difficult.",
            action: 'leave',
            condition: (player) => isQuestAvailable(player, 'special_orders')
          },
          {
            text: "I'm still gathering materials",
            action: 'leave',
            condition: (player) => player.activeQuests.some(quest => quest.key === 'special_orders')
          },
        ]
      },
      complete_special_orders: {
        question: "Magnificient! With these materials, I can forge weapons worthy of legends! \
Take this masterwork hammer - it should serve you well.",
        options: [
          {
            text: "Thank you",
            action: 'complete_quest',
            quest: 'special_orders'
          }
        ]
      }
    }
  },
  innkeeper: {
    name: "Innkeeper",
    dialogues: {
      initial: {
        question: "Welcome to the Rusty Tankard! What'll it be?",
        options: [
          {
            text: "Rest for the night (10 gold)",
            action: "rest",
            cost: 10
          },
          {
            text: 'Buy supplies',
            action: 'open_shop',
            shop: 'general'
          },
          {
            text: "Hear local rumors",
            action: "rumor"
          },
          { text: "Return to tavern hall", action: "leave" }
        ]
      },
      rumor: {
        question: "They say the ancient ruins north of town hold powerful artifacts... but also terrible dangers.",
        options: [
          { text: "Tell me more about the artifact", action: "artifact_info" },
          { text: "That's enough", action: "leave" }

        ]
      },
      artifact_info: {
        question: "Word is the Hermit knows about such things. Strange lights come from the ruins at night...",
        options: [
          { text: "Where can I find this Hermit?", action: "hermit_location" },
          { text: "What kind of relic is it?", action: "relic_details" }
        ]
      },
      hermit_location: {
        question: "He lives in a shack deep in Darkwood Forest. But beware - the way is dangerous!",
        options: [{ text: "I'll take my chances", action: "leave" }]
      },
      relic_details: {
        question: "Some say it's a crown that grants wisdom, others a sword that slays dragons. Who knows?",
        options: [{ text: "Fascinating...", action: "leave" }]
      }
    }
  },
  hermit: {
    name: "Old Hermit",
    dialogues: {
      initial: {
        question: (player) => {
          if (player.completedQuests.some(q => q.key === 'investigate_ruins')) {
            return "The artifact is safe, thanks to you. The forest is at peace now.";
          }
          return "The ancient ruins are dangerous... but the artifact must be recovered!";
        },
        options: [
          {
            text: "I've retrieved the ancient artifact",
            action: "return_artifact",
            condition: (player) => player.getInventoryCount('crown_of_wisdom') > 0
          },
          {
            text: "I found this ancient tablet",
            action: "show_tablet",
            condition: (player) => player.hasItem('ancient_tablet')
          },
          {
            text: "Accept quest",
            action: "start_quest",
            quest: "investigate_ruins",
            condition: (player) => isQuestAvailable(player, 'investigate_ruins')
          },
          { text: "Maybe later", action: "leave" }
        ]
      },
      show_tablet: {
        question: "By the old gods! Where did you find this? This tablet contains the key to the artifact chamber!",
        options: [
          {
            text: "What does it say?",
            action: "translate_tablet"
          },
        ]
      },
      translate_tablet: {
        question: "It speaks of a hidden passage behind the throne of the ancient king. The artifact lies beyond... but beware the guardians! I've marked your map with the location. The artifact is powerful, but dangerous.",
        options: [
          {
            text: "Thank you, hermit",
            action: "complete_tablet"
          }
        ]
      },
      return_artifact: {
        question: "By the gods! You've done it! This will help us protect our town.",
        options: [
          {
            text: "[Hand over artifact]",
            action: "complete_quest",
            quest: "investigate_ruins"
          }
        ]
      }
    }
  },
  priestess: {
    name: "High Prietess Elara",
    dialogues: {
      initial: {
        question: "The light guides you, child. How may the church assist?",
        options: [
          { text: "Receive blessing (50 gold)", action: "blessing", cost: 50 },
          { text: "Learn holy prayer", action: "prayer" },
          { text: "Seek guidance", action: "guidance" },
          { text: "Leave", action: "leave" }
        ]
      },
      guidance: {
        question: "Darkness gathers in the ancient ruins. The artifact must be secured before the cultists find it.",
        options: [
          { text: "What artifact?", action: "artifact_info" },
          { text: "Who are the cultists?", action: "cultists_info" }
        ]
      },
      artifact_info: {
        question: "A relic of immense power from the First Age. It could save or doom us all.",
        options: [{ text: "I understand", action: "return" }]
      },
      cultists_info: {
        question: "Followers of the Void God. They seek to unleash ancient evils upon the world.",
        options: [{ text: "I'll stop them", action: "return" }]
      }
    }
  },
  forest_warden: {
    name: "Ranger Alden",
    dialogues: {
      initial: {
        question: "The forest reeks of goblin filth. You here to help?",
        options: [
          {
            text: "I've cleared the goblins",
            action: "complete_quest",
            quest: "slay_goblins",
            condition: (player) => {
              const quest = player.activeQuests.find(q => q.key === 'slay_goblins');
              return quest && player.getInventoryCount('goblin_ear') >= 5;
            }
          },
          {
            text: "I'll clear the infestation",
            action: "start_quest",
            quest: "slay_goblins",
            condition: (player) => isQuestAvailable(player, 'slay_goblins')
          },
          { text: "Leave", action: "leave" }
        ]
      },
    }
  }
};

async function handleDialogueAction(player, action, data, npcKey) {
  const npc = npcDialogues[npcKey];
  switch (action) {
    case 'open_shop':
      await openShop(player, data.shop);
      return { exit: false };

    case "rest":
      if (player.gold >= data.cost) {
        player.gold -= data.cost;
        player.hp = player.maxHp;
        return {
          message: chalk.green("You rest fully and recover all HP!"),
          exit: true
        };
      }
      return {
        message: chalk.red("Not enough gold for a room!"),
        exit: false
      };

    case 'rumor':
    case 'artifact_info':
    case 'guidance':
    case 'cultists_info':
    case 'hermit_location':
    case 'relic_details':
    case 'more_rumors':
    case 'show_tablet':
    case 'translate_tablet':
    case 'return_artifact':
    case 'special_orders':
    case 'material_details':
    case 'complete_special_orders':
      // These are handled through dialogue state transitions

      let message = "I've nothing more to say."
      if (npc.dialogues[action]) {
        message = resolveDynamic(npc.dialogues[action].question, player)
      }

      return {
        nextState: action,
        message: message
      };

    case 'complete_tablet':
      player.removeItem('ancient_tablet');
      player.addItem('deciphered_tablet');
      return {
        message: chalk.green("The Hermit deciphered the tablet! He marked a map to the artifact chamber."),
        exit: true
      };

    case "start_quest":
      if (!player.activeQuests.some(q => q.key === data.quest)) {
        player.activeQuests.push({
          key: data.quest,
          ...QUESTS[data.quest],
          progress: 0
        });
        return {
          message: `Quest started: "${QUESTS[data.quest].title}"`,
          exit: true
        };
      }
      return {
        message: "Quest already active!",
        exit: false
      };

    case "complete_quest":
      if (data.quest === 'investigate_ruins') {
        // Verify requirements
        if (!player.removeItem('crown_of_wisdom')) {
          return {
            message: "You don't have the required item!",
            exit: true
          };
        }
        // Story progression
        player.storyFlags.artifactSecured = true;
        console.log(chalk.yellow("\nThe Hermit places the artifact in the town vault."));
        completeQuest(player, 'investigate_ruins')
        return {
          exit: true
        };
      } else if (data.quest === 'slay_goblins') {
        console.log("You've done us a great service! Here's your reward.")
        console.log(chalk.green("\nThe forest is now safe from goblin raids!"));
        completeQuest(player, data.quest)
        return {
          exit: true
        };
      } else if (data.quest === 'special_orders') {
        // Remove quest items
        player.removeItem('void_essence', 5);

        // Complete quest
        completeQuest(player, 'special_orders');
        return {
          exit: true
        };
      }

    case "blessing":
      if (player.gold >= data.cost) {
        player.gold -= data.cost;

        player.applyEffect('blessing')
        return {
          exit: true
        };
      }
      return {
        message: chalk.red("Not enough gold for blessing!"),
        exit: false
      };

    case "prayer":
      player.mana = player.maxMana;
      return {
        message: chalk.blue("Divine energy renews your spirit!"),
        exit: true
      };

    case "leave":
      return { message: "Come back anytime!", exit: true };

    default:
      return {
        message: "Safe travels, adventurer!",
        exit: true
      };
  }
}

export async function talkToNPC(npcKey, player) {
  const npc = npcDialogues[npcKey];

  if (!npc) {
    console.log(chalk.red(`NPC ${npcKey} not found!`));
    return;
  }
  let currentState = 'initial';

  console.log(chalk.cyan(`\n=== ${npc.name} ===`));

  while (true) {

    const dialogue = npc.dialogues[currentState];
    if (!dialogue) break;
    const choices = dialogue.options.filter(option => {
      return !option.condition || option.condition(player);
    }).map(opt => ({
      name: opt.text,
      value: { action: opt.action, data: opt }
    }));

    // Resolve dynamic question
    const question = resolveDynamic(dialogue.question, player);

    const { choice } = await inquirer.prompt({
      type: "list",
      name: "choice",
      message: question,
      choices
    });

    const result = await handleDialogueAction(
      player,
      choice.action,
      choice.data,
      npcKey
    );

    if (result.nextState) {
      currentState = result.nextState;
    } else if (result.message) {
      console.log(chalk.yellow(`\n${result.message}`));
    }

    if (result.effect) {
      result.effect(); // Execute the effect callback
    }

    if (result.exit) {
      break;
    }
  }
}

export function getNPCName(npcKey) {
  if (!npcDialogues[npcKey]) {
    throw new Error(`Missing NPC data for: ${npcKey}`);
  }
  return npcDialogues[npcKey].name;
}
