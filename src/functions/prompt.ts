import { stdin, stdout } from "process";
import { createInterface } from "readline";

export async function prompt(q: string) {
  const itf = createInterface(stdin, stdout);
  return new Promise<string>((r) => {
    itf.question(q, (input) => {
      itf.close();
      r(input);
    });
  });
}
