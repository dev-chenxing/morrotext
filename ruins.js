import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";

export async function exploreRuins(player) {
    console.log(chalk.yellow(figlet.textSync('ANCIENT RUINS', { font: 'Small' })));
    console.log(chalk.gray("You stand before the entrance of a long-forgotten civilization..."));

    // Initial chamber
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'The path splits ahead:',
        choices: [
            'Take the left passage',
            'Take the right passage',
            'Explore the central chamber',
            'Leave the ruins'
        ]
    });

    switch (action) {
        case 'Explore the central chamber':
            return await handleArtifactChamber(player);

        case 'Take the left passage':
            console.log(chalk.cyan("\nYou find a hidden alcove with ancient carvings..."));
            if (player.addItem('ancient_tablet', 1)) console.log("Found an Ancient Tablet!");
            break;

        case 'Take the right passage':
            console.log(chalk.red("\nYou trigger a trap!"));
            const trapDamage = Math.floor(Math.random() * 15) + 10;
            player.hp = Math.max(1, player.hp - trapDamage);
            console.log(`Took ${trapDamage} damage!`);
            break;
    }

    return true;
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
                player.addItem('crown_of_wisdom');
                console.log(chalk.yellow("You carefully lift the artifact from its pedestal."));
                player.storyFlags.hasArtifact = true;
                return true;

            case 'Examine it carefully':
                if (player.class === 'cleric') {
                    console.log(chalk.cyan("\nYou notice faint inscriptions matching your holy symbol..."));
                    console.log(chalk.green("Divine energy flows through you!"));
                    player.maxMana += 20;
                    player.mana = player.maxMana;
                } else {
                    console.log(chalk.cyan("\nYou notice faint inscriptions matching your holy symbol..."));
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