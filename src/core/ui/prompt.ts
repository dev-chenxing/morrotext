import * as inquirer from '@inquirer/prompts';

type Choice<Value> = {
    value: Value;
    name?: string;
    description?: string;
    short?: string;
    disabled?: boolean | string;
    type?: never;
};

export async function select<T = any>(opts: {message: string, choices: Choice<T>[]}): Promise<T> {
  return (await inquirer.select({ theme: {prefix: ""}, ...opts })) as T;
}

export async function input<T = any>(opts: {message: string, validate?: (input: string) => boolean | string}): Promise<T> {
  return (await inquirer.input({ ...opts })) as T;
}

export async function confirm<T = any>(opts: {message: string}): Promise<T> {
  return (await inquirer.confirm({ ...opts })) as T;
}

export async function number<T = any>(opts: {message: string}): Promise<T> {
  return (await inquirer.number({ ...opts })) as T;
}
