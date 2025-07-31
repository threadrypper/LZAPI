import { statSync, readdirSync } from "fs";
import { join } from "path";

export function readdir(path: string): string[] {
  let results: string[] = [];
  let files = readdirSync(path);
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let stats = statSync(join(path, file));
    if (stats.isDirectory()) {
      results = results.concat(readdir(join(path, file)));
    } else {
      results.push(join(path, file));
    }
  }
  return results;
}
