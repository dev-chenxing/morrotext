import { select } from "../prompt.ts";

export async function showChooseClassMenu(): Promise<string> {
  const classChoices = mt.dataHandler.nonDynamicData.classes
    .filter((gameClass) => gameClass.playable)
    .map((gameClass) => ({
      name: `${gameClass.name} — ${gameClass.description}`,
      value: { classId: gameClass.id },
      short: gameClass.name,
    }));

  const { classId } = await select<{ classId: string }>({
    message: "Choose your class:",
    choices: classChoices,
  });

  return classId;
}
