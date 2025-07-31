import { ELZFunction } from "../../../structures/ELZFunction";
import { ArgType, FunctionType } from "../../../typings";

export default new ELZFunction({
  name: "let",
  description: "Creates a temporary variable",
  args: [
    {
      name: "name",
      description: "Variable Name",
      type: ArgType.String,
      required: true,
      rest: false,
      execute: true,
    },
    {
      name: "value",
      description: "Variable Value",
      type: ArgType.String,
      required: true,
      rest: false,
      execute: true,
    },
  ],
  return: ArgType.Void,
  type: FunctionType.Setter,
  execute: ELZFunction.execute((ctx, name: string, value: string) => {
    if (!ctx.variables.valid(name)) {
      ctx.error.FunctionError("invalid_variable_name", {
        name: name,
        token: ctx.function,
      });
    }
    ctx.variables.set(name, [value, "string"]);
    if (!ctx.variables.has(name)) {
      return ctx.return(
        `var ${ctx.varName(name)} = "${ctx.parse.string(value)}";`,
      );
    } else {
      return ctx.return(`${ctx.varName(name)} = "${ctx.parse.string(value)}";`);
    }
  }),
});
