import { functionMap } from "../main";
import { ExpressLZ } from "../core/ExpressLZ";

export class FunctionManager {
  cache = functionMap;
  elz: ExpressLZ | null;
  constructor(elz: ExpressLZ | null) {
    this.elz = elz;
  }

  exists(func: string): boolean {
    return this.cache.has(func);
  }

  get(func: string) {
    return this.cache.get(func);
  }
}
