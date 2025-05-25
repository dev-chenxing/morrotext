import inquirer from 'inquirer';
import chalk from 'chalk';
import { ITEMS } from './items.js';

export const npcDialogues = {
    blacksmith: {
        initial: {
            question: "Need weapons? I have the best in town!",
            options: [
                {
                    text: `Buy ${ITEMS.steel_sword.name} (${ITEMS.steel_sword.value} gold)`,
                    action: 'buy',
                    itemId: 'steel_sword'
                },
                {
                    text: `Buy ${ITEMS.health_potion.name} (${ITEMS.health_potion.value} gold)`,
                    action: 'buy',
                    itemId: 'health_potion'
                },
                { text: 'Leave', action: 'leave' }
            ]
        }
    },
    innkeeper: {
        initial: {
            question: "Welcome to the Rusty Tankard! What'll it be?",
            options: [
                {
                    text: 'Rest for the night (10 gold)',
                    action: 'rest',
                    cost: 10
                },
                {
                    text: 'Hear local rumors',
                    action: 'rumor'
                },
                { text: 'Return to tavern hall', action: 'leave' }
            ]
        },
        rumor: {
            question: "They say the ancient ruins north of town hold powerful artifacts... but also terrible dangers.",
            options: [
                { text: 'Ask about artifacts', action: 'artifact_info' },
                { text: 'Return', action: 'leave' }
            ]
        }
    },
    hermit: {
        initial: {
            question: "The ancient ruins are dangerous... but the artifact must be recovered!",
            options: [
                { text: 'Accept quest', action: 'startQuest', quest: 'investigate_ruins' },
                { text: 'Maybe later', action: 'leave' }
            ]
        }
    }
};

export async function talkToNPC(npc, player) {
    const dialogue = npcDialogues[npc];
    let currentDialogue = dialogue.initial;
    while (true) {
        const { choice } = await inquirer.prompt({
            type: 'list',
            name: 'choice',
            message: currentDialogue.question,
            choices: currentDialogue.options.map(opt => opt.text)
        });

        const selectedOption = currentDialogue.options.find(opt => opt.text === choice);

        switch (selectedOption.action) {
            case 'buy':
                const item = ITEMS[selectedOption.itemId];
                if (player.gold >= item.value) {
                    player.gold -= item.value;
                    player.inventory.push(item.id);

                    return `You bought ${item.name}!`;
                }
                return "Not enough gold!";

            case 'rest':
                if (player.gold >= selectedOption.cost) {
                    player.gold -= selectedOption.cost;
                    player.hp = player.maxHp;
                    return chalk.green("You rest fully and recover all HP!");
                }
                return chalk.red("Not enough gold for a room!");

            case 'rumor':
                currentDialogue = dialogue.rumor;
                break;

            case 'artifact_info':
                return chalk.yellow("The old ones sealed away something powerful...\nMaybe the Hermit in the forest knows more?");

            case 'startQuest':
                if (!player.activeQuests.some(q => q.key === selectedOption.quest)) {
                    player.activeQuests.push({
                        key: selectedOption.quest,
                        ...quests[selectedOption.quest],
                        progress: 0
                    });
                    return 'Quest added to your journal!';
                }
                return 'You already have this quest!';

            case 'leave':
                return 'Come back anytime!';

            default:
                return '...';
        }
    }

}