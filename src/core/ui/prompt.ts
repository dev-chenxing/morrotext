import * as inquirer from "@inquirer/prompts";
import chalk from "chalk";

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  type?: never;
};

const theme = {
  prefix: "",
  style: {
    answer: (text: string) => chalk.yellow(text),
    highlight: (text: string) => chalk.yellow(text),
  },
};

export async function select<T = any>(opts: { message: string; choices: Choice<T>[] }): Promise<T> {
  return (await inquirer.select({ theme, ...opts })) as T;
}

export async function input<T = any>(opts: {
  message: string;
  validate?: (input: string) => boolean | string;
}): Promise<T> {
  return (await inquirer.input({ theme, ...opts })) as T;
}

export async function confirm<T = any>(opts: { message: string }): Promise<T> {
  return (await inquirer.confirm({ theme, ...opts })) as T;
}

export async function number<T = any>(opts: { message: string }): Promise<T> {
  return (await inquirer.number({ theme, ...opts })) as T;
}

// export async function pressToContinue(): Promise<void> {
//   const message = "Press Enter to continue...";
//   await inquirer.input({
//     theme: {
//       ...theme,
//       prefix: "⏎",
//       style: { ...theme.style, message: (text: string) => chalk.gray(text) },
//     },
//     message,
//     transformer: () => "",
//   });
// }

export async function pressToContinue(): Promise<void> {
  const message = "Press Enter to continue...";
  await inquirer.select({
    theme: {
      ...theme,
      icon: { cursor: chalk.gray("⏎") },
      style: { ...theme.style, answer: () => "", keysHelpTip: () => undefined },
    },
    message: "",
    choices: [{ value: null, name: message, short: "" }],
  });
}
