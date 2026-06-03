import * as inquirer from "@inquirer/prompts";
import { createPrompt, useKeypress, useState, type Status } from "@inquirer/core";
import chalk from "chalk";

export type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  type?: never;
};

const theme = {
  style: {
    message: (text: string) => chalk.black(text),
    answer: (text: string) => chalk.yellow(text),
    highlight: (text: string) => chalk.yellow(text),
  },
};

export async function ask<T = any>(opts: {
  actor: string;
  message: string;
  default?: string;
  required?: boolean;
}): Promise<T> {
  return (await inquirer.input({
    theme: { ...theme, prefix: chalk.bold.blue(opts.actor) + ":" },
    message: chalk.bold(opts.message),
    default: opts.default,
    required: opts.required,
  })) as T;
}

export async function confirm<T = any>(opts: { message: string }): Promise<T> {
  return (await inquirer.confirm({ theme, ...opts })) as T;
}

export async function input<T = any>(opts: {
  message: string;
  validate?: (input: string) => boolean | string;
}): Promise<T> {
  return (await inquirer.input({ theme, ...opts })) as T;
}

export async function number<T = any>(opts: { message: string }): Promise<T> {
  return (await inquirer.number({ theme, ...opts })) as T;
}

const _pressToContinue = createPrompt((_config, done) => {
  const [status, setStatus] = useState<Status>("idle");

  useKeypress(() => {
    setStatus("done");
    done("");
  });

  return status === "done" ? "" : chalk.gray("⏎ Press Enter to continue...");
});

export async function pressToContinue(): Promise<void> {
  await _pressToContinue({});
}

export async function select<T = any>(opts: {
  prefix?: string;
  message?: string;
  choices: Choice<T>[];
}): Promise<T> {
  return (await inquirer.select({
    theme: opts.prefix ? { ...theme, prefix: chalk.blue(opts.prefix) } : theme,
    message: opts.message ?? "",
    choices: opts.choices,
  })) as T;
}
