import { IKAObject, Defines } from "../typings";
import { ContextParser } from "./ContextParser";
import { ContextVariables } from "./ContextVariables";
import { ELZError } from "./ELZError";
import { CompiledFunction } from "./CompiledFunction";

export interface IRuntime {
  variables: ContextVariables;
  functionData: CompiledFunction | null;
}
export class Context {
  defines = Defines;
  parse = new ContextParser(this);
  error = ELZError;
  runtime: IRuntime;
  constructor(runtime: IKAObject | null = null) {
    this.runtime = {
      variables: runtime?.variables ?? new ContextVariables(this),
      functionData: runtime?.functionData ?? null,
    } as IRuntime;
  }

  get function() {
    let data = this.runtime.functionData;
    if (data && data.token.functionData)
      return `${data.token.functionData.tag}[${data.token.args.join(";")}]`;
    return "";
  }

  get variables() {
    return this.runtime?.variables;
  }

  varName(name: string) {
    if (!this.variables.valid(name)) return "";
    return `__$${name}$__`;
  }
  return(code = "") {
    return {
      runtime: {
        variables: this.runtime.variables,
        functionData: this.runtime.functionData,
      },
      code,
    };
  }
}
