import { ExpressLZ } from "../core/ExpressLZ";
import { Parser } from "../core/Parser";
import { Methods, IKAObject } from "../typings";
import { ELZError } from "../structures/ELZError";

export interface ParsedRouteData {
  functions: string[];
  parsed: Parser;
}
export interface RouteData {
  route: string;
  method: Methods;
  file?: null | string;
  code: string;
  data?: null | ParsedRouteData;
}

export class RouteManager {
  routes = new Map<number, RouteData>();
  constructor(public elz: ExpressLZ) {}

  add(options: IKAObject = {}) {
    if (typeof options?.route !== "string") {
      ELZError.TypeError("invalid_type", {
        at: "RouteManager.add({ route })",
        token: options?.route,
        type: typeof options?.route,
        expected: "string",
      });
    }
    if (typeof options?.code !== "string") {
      ELZError.TypeError("invalid_type", {
        at: "RouteManager.add({ code })",
        token: options?.code,
        type: typeof options?.code,
        expected: "string",
      });
    }
    if (typeof options?.method !== "string") {
      ELZError.TypeError("invalid_type", {
        at: "RouteManager.add({ method })",
        token: options?.method,
        type: typeof options?.method,
        expected: "string",
      });
    }

    let route = {
      route: options.route,
      method: options.method,
      code: options.code,
      file: null,
      data: {
        functions: [],
        parsed: Parser.parse(options.code),
      },
    } as RouteData;

    if (route.data) {
      route.data.functions = [
        ...new Set(route.data.parsed.getFunctions().sort()),
      ];

      for (let func of route.data.functions) {
        if (!this.elz.functions.exists(func)) {
          ELZError.ParseError("invalid_function", {
            token: "$" + func,
          });
        }
      }
    }

    this.routes.set(this.routes.size, route);
  }
}
