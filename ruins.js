import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { updateQuestProgress } from "./quests.js";

export async function exploreRuins(player, location) {
    console.log(chalk.yellow(figlet.textSync('ANCIENT RUINS', { font: 'Small' })));
    console.log(chalk.gray("You stand before the entrance of a long-forgotten civilization..."));

    let exploring = true;
    while (exploring && player.hp > 0) {
        const hasDecipheredTablet = player.hasItem('deciphered_tablet');
        const hasArtifact = player.hasItem('ancient_artifact');
        const choices = [];

        if (!hasArtifact) {
            if (hasDecipheredTablet) {
                console.log(chalk.green("\nYour deciphered tablet glows, revealing a hidden path!"));
                choices.push('Follow the tablet\'s map to the artifact chamber');
            }
        }

        choices.push(
            'Explore the central chamber',
            'Search the left passage',
            'Investigate the right passage',
            'Check for hidden rooms',
            'Return to entrance'
        );

        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'What will you do?',
            choices
        });

        switch (action) {
            case 'Follow the tablet\'s map to the artifact chamber':
            case 'Search for the artifact':
                await handleArtifactChamber(player);
                break;

            case 'Explore the central chamber':
                console.log(chalk.yellow("\nYou find ancient murals depicting forgotten battles."));
                if (Math.random() > 0.7) {
                    console.log(chalk.green("Found a health potion in a broken urn!"));
                    player.addItem('health_potion');
                }
                break;

            case 'Search the left passage':
                console.log(chalk.cyan("\nYou discover a library of stone tablets..."));
                if (!player.hasItem('ancient_tablet')) {
                    player.addItem('ancient_tablet');
                    console.log(chalk.green("You carefully extract an intact Ancient Tablet!\nThe Hermit might decipher it."));
                } else {
                    console.log(chalk.gray("The remaining tablets are too damaged to read."));
                }
                break;

            case 'Investigate the right passage':
                console.log(chalk.red("\nYou trigger a booby trap!"));
                const trapDamage = Math.floor(Math.random() * 15) + 10;
                player.hp = Math.max(1, player.hp - trapDamage);
                console.log(`Took ${trapDamage} damage!`);
                break;

            case 'Check for hidden rooms':
                if (Math.random() > 0.5) {
                    console.log(chalk.green("\nYou discover a hidden alcove!"));
                    const loot = generateLoot('ruins');
                    player.addItem(loot);
                    console.log(`Found ${ITEMS[loot].name}!`);
                } else {
                    console.log(chalk.gray("\nYou find nothing but dust and cobwebs."));
                }
                break;

            case 'Return to entrance':
                console.log(chalk.yellow("\nYou return to the ruins entrance."));
                exploring = false;
                break;
        }

        // Random encounters
        if (exploring && player.hp > 0 && Math.random() > 0.6) {
            const enemy = getRandomEnemy(location.enemies);
            await startCombat(player, enemy, location);
        }
    }
    return { exit: true }
}

async function handleArtifactChamber(player) {
    console.log(chalk.yellow("\nYou enter a massive chamber with a glowing artifact on a pedestal..."));

    if (player.activeQuests.some(q => q.key === 'investigate_ruins')) {
        console.log(chalk.green("This must be the artifact the Hermit mentioned!"));

        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'What do you do?',
            choices: [
                'Take the artifact',
                'Examine it carefully',
                'Destroy it',
                'Leave it alone'
            ]
        });

        switch (action) {
            case 'Take the artifact':
                if (player.addItem('crown_of_wisdom')) {
                    console.log(chalk.yellow("You carefully lift the artifact from its pedestal."));
                    player.storyFlags.hasArtifact = true;

                    updateQuestProgress(
                        player,
                        'investigate_ruins',
                        1, // Progress to step 1
                        "Retrieved the Ancient Artifact! Return it to the Hermit in Darkwood Forest."
                    );
                }
                break

            case 'Examine it carefully':
                if (player.class === 'cleric' && player.hasItem('holy_symbol')) {
                    console.log(chalk.cyan("\nYou notice faint inscriptions matching your holy symbol..."));
                    console.log(chalk.green("Divine energy flows through you!"));
                    player.maxMana += 20;
                    player.mana = player.maxMana;
                } else {
                    console.log(chalk.cyan("\nYou study the artifact carefully but can't decipher its markings."));
                }
                break;

            case 'Destroy it':
                console.log(chalk.red("You smash the artifact with your weapon!"));
                console.log("A wave of dark energy explodes outward...");
                player.hp = Math.max(1, player.hp - 30);
                player.storyFlags.artifactDestroyed = true;
                return true;

            default:
                console.log(chalk.gray("You decide to leave it for now."));
                return false;
        }
    }

    console.log(chalk.yellow("A strange energy emanates from the artifact..."));
    return false;
}