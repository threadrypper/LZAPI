import chalk from "chalk";
import { IKSObject } from "../typings";

export enum ErrorType {
  Error,
  ParseError,
  TypeError,
  CompileError,
  FunctionError,
}

export const ParseErrorTypes = [
  "invalid_prefix",
  "missing_name",
  "invalid_function",
];
export const TypeErrorTypes = ["invalid_type"];
export const CompileErrorTypes = [
  "invalid_args_count",
  "invalid_function",
  "invalid_arg_type",
];
export const FunctionErrorTypes = [
  "invalid_variable_name",
  "variable_already_exists",
  "variable_not_exists",
];

export class ELZError {
  constructor(
    public type: ErrorType,
    public message: string,
  ) {
    let stack = (new Error() as Error)?.stack?.split("\n") || [""];
    let stackMessage = stack.slice(3).join("\n");
    let stackFirst = stackMessage
      .split("\n")[0]
      .split("(")[1]
      .split(")")[0]
      .split(":")
      .slice(0, 2)
      .join(":");
    let Type = ErrorType[this.type];
    console.error(
      r(
        stackFirst +
          "\n" +
          b([`[ERROR] ${u(Type)}: ${this.message}`, stackMessage].join("\n")),
      ),
    );
    console.error({
      type: this.type,
      time: new Date().toISOString(),
    });
    process.exit(1);
  }

  static ParseError(type: string, data: IKSObject = {}) {
    let types = ParseErrorTypes;
    if (!types.includes(type)) {
      throw new Error(`Nah Bro?`);
    }
    let message = [];
    switch (type) {
      case types[0]:
        message.push(`Invalid prefix: ${data?.prefix}`);
        message.push(`  ${data?.token}`);
        message.push(`   ^`);
        break;
      case types[1]:
        message.push(`Missing function name:`);
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
        break;
      case types[2]:
        message.push(`Function Not Found:`);
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
        break;
      default:
      //never
    }

    return new ELZError(
      ErrorType.ParseError,
      message[0] ? message.join("\n") : "idunno",
    );
  }

  static TypeError(type: string, data: IKSObject = {}) {
    let types = TypeErrorTypes;
    if (!types.includes(type)) {
      throw new Error(`Nah Bro?`);
    }
    let message = [];
    switch (type) {
      case types[0]:
        message.push(`Invalid type: ${data?.type} [At ${data?.at}]`);
        message.push(`  typeof ${data?.token}`);
        message.push(`  ^`);
        if (data?.expected) message.push(`  Expected: ${data?.expected}`);
        break;
      default:
      //never
    }

    return new ELZError(
      ErrorType.TypeError,
      message[0] ? message.join("\n") : "idunno",
    );
  }

  static CompileError(type: string, data: IKSObject = {}) {
    let types = CompileErrorTypes;
    if (!types.includes(type)) {
      throw new Error(`Nah Bro?`);
    }
    let message = [];
    switch (type) {
      case types[0]:
        message.push(
          `Invalid args count [Expected ${data?.expected}, got ${data?.got}]:`,
        );
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
        break;
      case types[1]:
        message.push(`Invalid function:`);
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
        break;
      case types[2]:
        message.push(
          `Invalid arg type at ${data?.arg} [Expected ${data?.expected}, got ${data?.got}]`,
        );
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
      default:
      //never
    }
    return new ELZError(
      ErrorType.CompileError,
      message[0] ? message.join("\n") : "idunno",
    );
  }

  static FunctionError(type: string, data: IKSObject = {}) {
    let types = FunctionErrorTypes;
    if (!types.includes(type)) {
      throw new Error(`Nah Bro?`);
    }
    let message = [];
    switch (type) {
      case types[0]:
        message.push(`Invalid variable name: ${data?.name}`);
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
        break;
      case types[1]:
        message.push(`Variable already exists ${data?.name}:`);
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
        break;
      case types[2]:
        message.push(`Variable do not exists ${data?.name}:`);
        message.push(`  ${data?.token}`);
        message.push(`  ^`);
      default:
      //never
    }
    return new ELZError(
      ErrorType.FunctionError,
      message[0] ? message.join("\n") : "idunno",
    );
  }
}

function r(str: string) {
  return chalk.red(str);
}
function b(str: string) {
  return chalk.bold(str);
}
function u(str: string) {
  return chalk.underline(str);
}
