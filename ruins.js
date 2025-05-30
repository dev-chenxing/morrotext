import inquirer from "inquirer";
import chalk from "chalk";

export async function exploreRuins(player) {
    console.log(chalk.yellow("\nYou enter a massive chamber with a glowing artifact on a pedestal..."));

    if (player.activeQuests.some(q => q.key === 'investigate_ruins')) {
        console.log(chalk.green("This must be the artifact the Hermit mentioned!"));

        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'What do you do?',
            choices: [
                'Take the artifact',
                'Leave it alone',
                'Destroy it'
            ]
        });

        switch (action) {
            case 'Take the artifact':
                player.addItem('crown_of_wisdom');
                console.log(chalk.yellow("You carefully lift the artifact from its pedestal."));
                player.storyFlags.hasArtifact = true;
                return true;

            case 'Destroy it':
                console.log(chalk.red("You smash the artifact with your weapon!"));
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