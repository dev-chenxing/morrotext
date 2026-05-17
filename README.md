# Terminal RPG - Text-Based Adventure Game

![Terminal RPG Demo](preview.png)

Text-RPG is a command-line role-playing game built with Node.js that brings classic RPG adventures to your terminal. Featuring quests, turn-based combat, and a small world to explore.

## Features

- 🧙 **Three Playable Classes**: Warrior, Mage, and Cleric with unique abilities
- 🗺️ **Procedural World**: Explore forests, towns, and ruins
- ⚔️ **Turn-Based Combat**: Battle goblins, skeletons, and void cultists
- 📜 **Quest System**: Complete multi-stage quests with rewards
- 🛠️ **Economy**: Gather resources and trade with NPCs
- 🎒 **Inventory System**: Equip weapons, armor, and accessories
- 🌟 **Character Progression**: Level up and enhance your stats
- 🤝 **NPC Interactions**: Dynamic dialogues that change based on your progress

## Installation

1. Ensure you have [Node.js](https://nodejs.org/) (v18+) installed
2. Clone this repository:
   ```bash
   git clone https://github.com/your-username/text-rpg.git
   cd text-rpg
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## How to Play

Start your adventure:
```bash
npm start
```

**Basic Controls:**
- Navigate menus with arrow keys
- Select options with Enter
- Exit the game anytime with Ctrl+C

## Gameplay Preview

![demo.gif](demo.gif)

## Development

This project uses modern JavaScript with ES Modules and features:

- **Modular Architecture**:
  ```
  /src
  ├── actors       # Player class
  ├── world        # Cells, quests, loot tables
  ├── items        # Weapons, armor, alchemy
  ├── systems      # Combat, dialogue, shop
  ├── ui           # Menu systems and HUD
  └── utils        # Helper functions
  ```

To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## Dependencies

- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - Interactive command-line prompts
- [Chalk](https://github.com/chalk/chalk) - Terminal string styling
- [Figlet](https://github.com/patorjk/figlet.js) - ASCII art text generation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Embark on your text-based adventure today!** ✨