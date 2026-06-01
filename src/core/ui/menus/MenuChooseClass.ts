import { list } from "../prompt.ts";

export async function showChooseClassMenu(): Promise<string> {
  const classChoices = mt.dataHandler.nonDynamicData.classes
    .filter((gameClass) => gameClass.playable)
    .map((gameClass) => ({
      name: `${gameClass.name} — ${gameClass.description}`,
      value: gameClass.id,
      short: gameClass.name,
    }));

  const { classId } = await list<{ classId: string }>({
    name: "classId",
    message: "Choose your class:",
    choices: classChoices,
  });

  return classId;
}
