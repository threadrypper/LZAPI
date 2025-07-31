import { Context } from "./Context";

export class ContextParser {
  constructor(public ctx: Context) {}

  string(input: any): string {
    let str = "";
    switch (typeof input) {
      case "string":
        str = input as string;
        break;
      case "object":
        str = JSON.stringify(input);
        break;
      default:
        str = input.toString();
    }

    str = str.replace(/"/g, '\\"').replace(/\n/g, "\\n");

    return str;
  }
}
