import inquirer from "inquirer";

export async function showChooseClassMenu(): Promise<string> {
  const classChoices = mt.dataHandler.nonDynamicData.classes
    .filter((gameClass) => gameClass.playable)
    .map((gameClass) => ({
      name: `${gameClass.name} — ${gameClass.description}`,
      value: gameClass.id,
      short: gameClass.name,
    }));

  const { classId } = await inquirer.prompt<{ classId: string }>({
    type: "list",
    name: "classId",
    message: "Choose your class:",
    choices: classChoices,
  });

  return classId;
}
