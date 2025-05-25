import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateLoot } from './loot.js';

export async function startCombat(player, enemy) {
    console.log(chalk.red(`\nA wild ${enemy.name} appears!`));

    while (player.hp > 0 && enemy.hp > 0) {
        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Choose your action:',
            choices: [
                'Attack',
                'Use Item',
                ...(player.class === 'rogue' ? ['Flee'] : [])
            ]
        });

        switch (action) {
            case 'Attack':
                const playerDmg = Math.max(0, player.attack - enemy.defense);
                enemy.hp -= playerDmg;
                console.log(chalk.red(`You dealt ${playerDmg} damage!`));

                const enemyDmg = Math.max(0, enemy.attack - player.defense);
                player.hp -= enemyDmg;
                console.log(chalk.yellow(`${enemy.name} dealt ${enemyDmg} damage!`));
                break;

            case 'Use Item':
                const { item } = await inquirer.prompt({
                    type: 'list',
                    name: 'item',
                    message: 'Select item:',
                    choices: [...player.inventory, 'Cancel']
                });

                if (item !== 'Cancel') {
                    // Handle item usage logic
                    return startCombat(player, enemy); // Refresh combat state
                }
                break;

            case 'Flee':
                if (Math.random() > 0.7) {
                    console.log(chalk.blue('Escaped successfully!'));
                    return;
                }
                console.log(chalk.red('Failed to escape!'));
                break;
        }

        // Combat status update
        console.log(chalk.cyan(`\n${player.name}: ${player.hp}HP`));
        console.log(chalk.cyan(`${enemy.name}: ${enemy.hp}HP\n`));
    }
    if (player.hp > 0) {
        console.log(chalk.green(`\nVictory! Gained ${enemy.gold} gold!`));
        player.gold += enemy.gold;
        const loot = generateLoot();
        console.log(chalk.blue(`Found ${loot}!`));
        player.inventory.push(loot);
    } else {
        console.log(chalk.red('\nGAME OVER'));
        process.exit();
    }
}

export function createEnemy(type) {
    const enemies = {
        goblin: {
            name: 'Goblin',
            hp: 30,
            attack: 8,
            defense: 4,
            gold: 25
        },
        // Add more enemies...
    };
    return { ...enemies[type] };
}