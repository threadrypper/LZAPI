import chalk from "chalk";
import { statSync } from "fs";
import { readdir } from "../functions/readdir";
const _package = require("../../package.json");

function info() {
  let includedFiles: string[] = [];

  let distFiles = readdir("dist");
  for (let distFile of distFiles) {
    if (!distFile.includes("__tests__")) {
      includedFiles.push(distFile.replace(process.cwd(), ""));
    }
  }

  includedFiles.push("README.md", "package.json");

  console.log(chalk.cyan("Name: ") + chalk.bold(_package.name));
  console.log(chalk.cyan("Version: ") + chalk.bold(_package.version));
  console.log(chalk.cyan("Description: ") + chalk.bold(_package.description));

  console.log("");
  console.log(chalk.cyan("Files: "));
  let totalSize = 0;
  let ext = new Map<string, number>();
  includedFiles.sort().forEach((file: string) => {
    let size = getFileSize(file);
    totalSize += size;
    console.log("- " + chalk.bold(file) + " (" + chalk.bold(size) + "kb)");

    let fileExt = file.split("/").pop() as string;
    fileExt = fileExt.replace(fileExt.split(".").shift() as string, "");
    ext.set(fileExt, (ext.get(fileExt) || 0) + size);
  });
  console.log(
    chalk.cyan("Total Size: ") + chalk.bold(totalSize.toFixed(2)) + "kb",
  );
  console.log(chalk.cyan("Total Files: ") + chalk.bold(includedFiles.length));
  /* Distribution Table (size) */
  console.log("");
  console.log(chalk.cyan("Distribution Table (Size): "));
  let sizeTable: [string, number][] = [];
  ext.forEach((value: number, key: string) => {
    sizeTable.push([key, value]);
  });
  sizeTable.sort(function (a: [string, number], b: [string, number]) {
    return b[1] - a[1];
  });
  for (let st of sizeTable) {
    console.log(
      "- " + chalk.bold(st[0]) + " (" + chalk.bold(st[1].toFixed(2)) + "kb)",
    );
  }
}

function getFileSize(path: string) {
  return Number((statSync(path).size / 1024).toFixed(2));
}

info();
