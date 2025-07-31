import { Context } from "./Context";

interface D {
  value: any;
  type: "string" | "number" | "boolean" | "object" | "array" | "function";
}
export class ContextVariables {
  cache = new Map<string, D>();
  constructor(public ctx: Context) {
    let oldVariables = ctx.variables;
    if (oldVariables) {
      for (let key of oldVariables?.keys() || []) {
        this.cache.set(key, oldVariables.get(key) as D);
      }
    }
  }

  set(name: string, [value, type]: [any, D["type"]]) {
    this.cache.set(name, { value, type } as D);
  }

  get(name: string) {
    return this.cache.get(name);
  }

  has(name: string) {
    return this.get(name) == undefined;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  valid(name: string) {
    return (
      typeof name == "string" &&
      name.length > 0 &&
      /^[a-z0-9][a-z0-9_]*$/.test(name)
    );
  }
}
