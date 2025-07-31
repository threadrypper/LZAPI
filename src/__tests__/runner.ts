import { prompt } from "../functions/prompt";
import { readdir } from "../functions/readdir";
import { join } from "path";
import chalk from "chalk";

const skipInput = true;
const alwaysRunTests: string[] = ["compiler"];

interface Test {
  name: string;
  path: string;
  runPath: string;
}

const testFiles = readdir(__dirname);
const tests = new Map<string, Test>();
for (let tf of testFiles) {
  if (tf.endsWith(".js")) {
    const path = tf;
    const name = tf.replace(__dirname, "").split(".")[0].slice(1);
    if (name == "runner") continue;
    const runPath = "./" + name + ".js";

    tests.set(name.toLowerCase(), { name, path, runPath });
  }
}

async function main() {
  let toRun: string[] = [];
  let promptMessage = [
    alwaysRunTests.length
      ? "Always run tests: " +
        alwaysRunTests.map((name: string) => chalk.cyan(name)).join(", ")
      : "No always running tests..",
    `Available Tests [${chalk.cyan.bold(tests.size)}]: ${Array.from(
      tests.keys(),
    )
      .map((name: string) => chalk.cyan(name))
      .join(", ")}`,
    `Enter the ${chalk.grey("Test names")} to run, separated by a space.`,
    "> ",
  ].join("\n");

  for (let art of alwaysRunTests) {
    if (!tests.has(art.toLowerCase())) continue;
    toRun.push(art);
  }
  if (!skipInput) {
    let userInput = (await prompt(promptMessage)) || "";
    if (userInput.length) {
      let splits = userInput.split(" ");
      for (let split of splits) {
        if (!tests.has(split.toLowerCase())) continue;
        if (toRun.some((t: string) => t.toLowerCase() == split.toLowerCase())) {
          let index = toRun.findIndex(
            (t: string) => t.toLowerCase() == split.toLowerCase(),
          );
          toRun.splice(index, 1);
        } else {
          toRun.push(split);
        }
      }
    }
  }

  toRun = [...new Set(toRun)];

  if (!toRun.length) {
    console.log(chalk.red("No tests to run"));
  } else {
    console.log(`Running Tests [${chalk.bold.cyan(toRun.length)}]:`);
    console.log("-".repeat(process.stdout.columns));
    for (let test of toRun) {
      const t = tests.get(test.toLowerCase());
      if (!t) continue;
      console.log(
        chalk.green(
          `Running ${chalk.bold(t.name)} [${chalk.grey.italic(t.path)}]`,
        ),
      );
      require(t.runPath);
      console.log("-".repeat(process.stdout.columns));
    }
  }
}

main();
