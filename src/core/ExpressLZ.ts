import { IKAObject, Defines } from "../typings";
import { defaultString, rangeNumber } from "../functions/defaults";
import { writeFileSync } from "fs";
import { RouteManager, FunctionManager } from "../managers";

export interface ExpressLZOptions {
  port: number;
  jsonSpaces: number;
  outFile: string;
}

export class ExpressLZ {
  options: ExpressLZOptions;
  routes = new RouteManager(this);
  functions = new FunctionManager(this);
  constructor(options: IKAObject) {
    this.options = {
      port: Math.round(rangeNumber(options?.port, 0, 65535, 80)),
      jsonSpaces: Math.round(rangeNumber(options?.jsonSpaces, 0, 10, 0)),
      outFile: defaultString(options?.outFile, "app.js"),
    } as ExpressLZOptions;
  }

  async compile() {
    let compiledCode = [
      `const ${Defines.express} = require("express");`,
      `const ${Defines.app} = ${Defines.express}();`,
      this.options.jsonSpaces
        ? `${Defines.app}.set("json spaces", ${this.options.jsonSpaces});\n`
        : "",
    ].join("\n");

    compiledCode += [
      `${Defines.app}.listen(${this.options.port}, () => {`,
      `  console.log("Listening on port ${this.options.port}");`,
      `});`,
    ].join("\n");

    try {
      writeFileSync(this.options.outFile, compiledCode);
    } catch (error: any) {
      throw new Error(
        `Failed to write to file: ${this.options.outFile}:\n${error.message}`,
      );
    }
    return this;
  }
}
