import { functionMap } from "../main";
import { ELZFunction } from "./ELZFunction";
import { ParsedToken } from "../core/Parser";
import { ELZError } from "./ELZError";
import { ArgType } from "../typings";

export class CompiledFunction {
  data: ELZFunction;
  token: ParsedToken;
  constructor(data: ELZFunction, token: ParsedToken) {
    this.data = data;
    this.token = token;

    if (token.isFunctionToken && token.functionData) {
      if (!functionMap.has(token.functionData.name)) {
        ELZError.CompileError("invalid_function", {
          token: "$" + token.functionData.name,
        });
      }

      if (data.size < token.size) {
        ELZError.CompileError("invalid_args_count", {
          token: token.token,
          expected: data.size.toString(),
          got: token.size.toString(),
        });
      }
      let args = token.parsedArgs ?? [];
      for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        let fnArg = data.data.args[i];
        if (arg.type !== ArgType.Unknown) {
          if (arg.type !== fnArg.type) {
            ELZError.CompileError("invalid_arg_type", {
              token: token.token,
              arg: fnArg.name,
              expected: ArgType[fnArg.type] as string,
              got: ArgType[arg.type] as string,
            });
          }
        } else if (arg.tokens.length == 1) {
          if (arg.tokens[0].functionData) {
            let func = functionMap.get(arg.tokens[0].functionData.name);
            arg.type = func?.data?.return ?? ArgType.Unknown;

            if (arg.type !== fnArg.type) {
              ELZError.CompileError("invalid_arg_type", {
                token: token.token,
                arg: fnArg.name,
                expected: ArgType[fnArg.type] as string,
                got: ArgType[arg.type] as string,
              });
            }
          }
        } else {
          let tokens = arg.tokens;
          if (tokens.some((token: ParsedToken) => token.functionData == null)) {
            arg.type = ArgType.String;
          } else {
            let func = functionMap.get(
              tokens[
                tokens.findIndex(
                  (token: ParsedToken) => token.functionData !== null,
                ) ?? 0
              ]?.functionData?.name ?? "",
            );
            arg.type = func?.data?.return ?? ArgType.Unknown;
          }
          if (arg.type !== fnArg.type) {
            ELZError.CompileError("invalid_arg_type", {
              token: token.token,
              arg: fnArg.name,
              expected: ArgType[fnArg.type] as string,
              got: ArgType[arg.type] as string,
            });
          }
        }
      }
    }
  }
}
