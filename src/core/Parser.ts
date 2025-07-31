import { defaultBoolean } from "../functions/defaults";
import { IKAObject, ArgType } from "../typings";
import { ELZError } from "../structures";

export interface ParserOptions {
  fullDepth: boolean;
  skipNonFunctions: boolean;
}

export type FunctionPrefixType = "$" | "$.";
export enum FunctionPrefix {
  $ = "Normal",
  "$." = "Suppress",
}

export interface ParsedFunctionData {
  name: string;
  prefix: FunctionPrefixType;
  tag: string;
  full: string;
}

export interface ParsedArg {
  tokens: ParsedToken[];
  type: ArgType;
  index: number;
  parent: ParsedToken;
}

export class ParsedToken {
  args: string[] = [];
  parsedArgs: ParsedArg[] = [];
  size = 0;
  line = 0;
  column = 0;
  isFunctionToken: boolean = false;
  functionData: null | ParsedFunctionData = null;
  constructor(
    public token: string,
    position: number[],
    public parser: Parser,
  ) {
    this.line = position[0];
    this.column = position[1];
    this.isFunctionToken = token.startsWith("$");
    if (this.isFunctionToken) {
      let functionTag = token.split("[")[0];
      let functionPrefix = functionTag.replace(/[a-z]+$/i, "");
      let functionName = functionTag.replace(functionPrefix, "");
      let argText = token.replace(functionTag, "").slice(1, -1);

      if (!FunctionPrefix[functionPrefix as keyof typeof FunctionPrefix]) {
        ELZError.ParseError("invalid_prefix", {
          prefix: functionPrefix,
          token,
        });
      }

      if (!functionName) {
        ELZError.ParseError("missing_name", {
          token,
        });
      }

      this.functionData = {
        name: functionName,
        prefix: functionPrefix,
        tag: functionTag,
        full: token,
      } as ParsedFunctionData;
      if (argText.length > 0) this.args = this.#parseArgs(argText);
      this.size = this.args.length;

      if (parser.options.fullDepth && this.size) {
        let i = 0;
        for (let arg of this.args) {
          let argParser = new Parser(arg, {
            fullDepth: true,
            skipNonFunctions: false,
          });
          this.parsedArgs.push({
            tokens: argParser.tokens,
            type:
              argParser.tokens.length == 1 &&
              !argParser.tokens[0].isFunctionToken
                ? ArgType.String
                : ArgType.Unknown,
            index: i,
            parent: this,
          });
          i++;
        }
      }
    }
  }

  getFunctions(): string[] {
    if (!this.isFunctionToken) return [];
    let functions: string[] = [this.functionData?.name ?? ""];
    if (this.parser.options.fullDepth && this.size) {
      for (let args of this.parsedArgs) {
        for (let arg of args.tokens) {
          functions = functions.concat(arg.getFunctions());
        }
      }
    }
    return functions.filter((x: string) => x);
  }

  #parseArgs(argText: string) {
    let args: string[] = [];
    let arg = "";
    let depth = 0;
    for (let i = 0; i < argText.length; i++) {
      let c = argText[i];
      if (c == "[" || c == "]") {
        arg += c;
        depth += c == "[" ? 1 : -1;
      } else if (c == ";" && depth == 0) {
        if (arg) args.push(arg);
        arg = "";
      } else {
        arg += c;
      }
    }
    if (arg) args.push(arg);
    return args;
  }
}

export class Parser {
  options: ParserOptions;
  tokens: ParsedToken[] = [];
  constructor(
    public code: string,
    options: IKAObject,
  ) {
    this.options = {
      fullDepth: defaultBoolean(options?.fullDepth, false),
      skipNonFunctions: defaultBoolean(options?.skipNonFunctions, false),
    } as ParserOptions;
    this.#parse();
  }

  #parse() {
    let tokens: string[] = [];
    let depth = 0;
    let inFunction = false;
    let token = "";
    let tokenPos = new Map<string, number[]>();
    let rememberedPos = [0, 0];
    let lines = 1;
    let chars = 0;
    for (let i = 0; i < this.code.length; i++) {
      let c = this.code[i];
      if (c == "\n") {
        lines++;
        chars = -1;
      }
      chars++;
      if (c == "$" && !inFunction && depth == 0) {
        if (token) {
          tokens.push(token);
        }
        rememberedPos = [lines, chars];
        token = c;
        inFunction = true;
      } else if (c == "[" && inFunction) {
        token += c;
        depth++;
      } else if (c == "]" && inFunction) {
        token += c;
        depth--;
        if (depth == 0) {
          inFunction = false;
          tokenPos.set(token, rememberedPos);
          tokens.push(token);
          token = "";
        }
      } else {
        token += c;
      }
    }
    if (token) {
      tokens.push(token);
    }

    for (let token of tokens) {
      let pos = [tokenPos.get(token)?.[0] ?? 0, tokenPos.get(token)?.[1] ?? 0];
      if (this.options.skipNonFunctions && !token.startsWith("$")) continue;
      this.tokens.push(new ParsedToken(token, pos, this));
    }
  }

  getFunctions(): string[] {
    let functions: string[] = [];
    for (let token of this.tokens) {
      if (token.isFunctionToken) {
        let fs = token.getFunctions();
        functions.push(...fs);
      }
    }
    return [...new Set(functions)];
  }

  static parse(code: string) {
    return new Parser(code, {
      fullDepth: true,
      skipNonFunctions: true,
    });
  }
}
