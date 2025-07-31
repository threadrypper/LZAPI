import { ELZFunction } from "../structures/ELZFunction";
import { readdir } from "../functions/readdir";
const functionMap = new Map<string, ELZFunction>();

let files = readdir(__dirname + "/functions").filter((file: string) =>
  file.endsWith(".js"),
);

for (let file of files) {
  let category = file.split("/")[file.split("/").length - 2];
  const func = require(
    `./functions/${category}/${file.split("/").pop()}`,
  ).default;

  func.path = file;
  func.category = category;
  functionMap.set(func.data.name, func);
}

export { functionMap };
