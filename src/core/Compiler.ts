import { Parser, ParsedToken } from "./Parser";
import { CompiledFunction } from "../structures/CompiledFunction";
import { functionMap } from "../main";
import { ELZError } from "../structures/ELZError";
import { ELZFunction } from "../structures/ELZFunction";
import { Context, IRuntime } from "../structures/Context";
import { FunctionType, ArgType } from "../typings";

export type Compiled = CompiledFunction | string;

export class Compiler {
  tokens: Compiled[] = [];
  parser: Parser | null = null;
  ctx: Context;
  allStringTokens: boolean;
  constructor(parser: Parser | ParsedToken[], runtime: IRuntime | null = null) {
    let tokens: ParsedToken[];
    if (parser instanceof Parser) {
      tokens = parser.tokens;
      this.parser = parser;
    } else {
      tokens = parser;
      this.parser = tokens[0].parser;
    }
    this.ctx = new Context(runtime);

    for (let token of tokens) {
      if (token.isFunctionToken) {
        if (token.functionData && functionMap.has(token.functionData.name)) {
          let func = functionMap.get(token.functionData.name);
          let compiled = new CompiledFunction(func as ELZFunction, token);
          this.tokens.push(compiled);
        } else {
          ELZError.CompileError("invalid_function", {
            token: "$" + token.functionData?.name,
          });
        }
      } else {
        this.tokens.push(token.token);
      }
    }

    this.allStringTokens = this.tokens.every(
      (token) => typeof token === "string",
    );
  }

  async code() {
    let outputCode = "";
    if (this.allStringTokens) {
      return this.tokens.join("");
    }
    for (let token of this.tokens) {
      if (typeof token == "string") {
        outputCode += token;
        continue;
      }
      let func = token.data;
      this.ctx.runtime.functionData = token as CompiledFunction;
      let args: any = [];
      let pargs = token.token.parsedArgs;
      for (let arg of pargs) {
        let Arg: any;
        let type = arg.type;
        let tokens = arg.tokens;
        let compiled = new Compiler(tokens);
        let code = await compiled.code();
        let compiledTokens = compiled.tokens;
        for (let compiledToken of compiledTokens) {
          if (typeof compiledToken == "string") {
            if (type == ArgType.String) {
              if (!Arg) Arg = "";
              Arg += compiledToken;
            } else if (type == ArgType.Number) {
              Arg = code;
            }
            continue;
          }

          let func = compiledToken.data;
          if (func.data.return == ArgType.Void) {
            let newCode = compiledToken.token.token;
            let newCompiled = new Compiler(
              Parser.parse(newCode),
              this.ctx.runtime,
            );
            let newOutput = await newCompiled.code();
            let newCtx = newCompiled.ctx;
            newCtx.runtime.functionData = compiledToken;
            this.ctx = new Context(newCtx.runtime);
            outputCode += newOutput;
          } else {
            if (type == ArgType.String) {
              if (!Arg) Arg = "";
              Arg = code;
            } else if (type == ArgType.Number) {
              Arg = code;
            }
          }
          this.ctx = new Context({
            variables: this.ctx.variables,
            functionData: compiledToken,
          });
        }
        args.push(Arg);
      }
      outputCode += await this.executeFunc(func, ...args);
    }
    return outputCode;
  }

  async executeFunc(func: ELZFunction, ...args: any[]) {
    let f = await func.execute.execute(this.ctx, ...args);
    //f.runtime.functionData = this.ctx.runtime.functionData;
    this.ctx = new Context(f.runtime);
    console.log(args, "&", func.data.name);
    let funcCode = f.code;
    let functype = func.data.type;
    switch (functype) {
      case FunctionType.AsyncCallback:
        funcCode = `(await ${funcCode})`;
        break;
      case FunctionType.Setter:
        funcCode = `\n${funcCode}\n`;
        break;
      case FunctionType.Callback:
      case FunctionType.Getter:
        funcCode = `${funcCode}`;
        break;
      default:
      //never
    }
    return funcCode;
  }

  static compile(code: string) {
    return new Compiler(Parser.parse(code));
  }
}
