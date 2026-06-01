import inquirer from "inquirer";

export async function list<T = any>(opts: any): Promise<T> {
  return (await inquirer.prompt([{ type: "list", ...opts }])) as T;
}

export async function input<T = any>(opts: any): Promise<T> {
  return (await inquirer.prompt([{ type: "input", ...opts }])) as T;
}

export async function confirm<T = any>(opts: any): Promise<T> {
  return (await inquirer.prompt([{ type: "confirm", ...opts }])) as T;
}

export async function number<T = any>(opts: any): Promise<T> {
  return (await inquirer.prompt([{ type: "number", ...opts }])) as T;
}

export default { list, input, confirm, number };
