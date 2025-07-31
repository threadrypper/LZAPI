import { ArgType, FunctionType } from "../typings";
import { Context, IRuntime } from "./Context";

export interface IArg {
  name: string;
  description: string;
  type: ArgType;
  required: boolean;
  rest: boolean;
  execute: boolean;
}

export interface Return {
  code: string;
  runtime: IRuntime;
}

export interface IELZFunction {
  name: string;
  description: string;
  args: IArg[];
  return: ArgType;
  type: FunctionType;
  execute: ELZExecutable;
}

export class ELZFunction {
  size: number;
  path: string | null = null;
  category: string | null = null;
  execute: ELZExecutable;
  constructor(public data: IELZFunction) {
    let args = data.args;
    this.size = 0;
    for (let arg of args) {
      if (arg.rest) {
        this.size = Infinity;
        break;
      }
      this.size++;
    }
    this.execute = this.data.execute;
  }

  static execute(callback: (ctx: Context, ...args: any[]) => Return) {
    return new ELZExecutable(callback);
  }
}

export class ELZExecutable {
  isAsync: boolean;
  constructor(public callback: (ctx: Context, ...args: any[]) => Return) {
    this.isAsync = this.callback.toString().includes("async");
  }

  async execute(ctx: Context, ...args: any[]) {
    if (this.isAsync) {
      return await this.callback(ctx, ...args);
    } else {
      return this.callback(ctx, ...args);
    }
  }
}
