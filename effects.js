import chalk from "chalk";

export const EFFECTS = {
    blessing: {
        id: 'blessing',
        name: 'Divine Blessing',
        type: 'buff',
        duration: 60, // 1 minute in seconds
        stats: { attack: 5, defense: 5 },
        onApply: () => {
            console.log(chalk.yellow("\nHoly light surrounds you! You feel empowered."));
        }
    },
};