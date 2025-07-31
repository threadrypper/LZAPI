import { ELZFunction } from "../../../structures/ELZFunction";
import { ArgType, FunctionType } from "../../../typings";

export default new ELZFunction({
  name: "get",
  description: "Get the value from a temporary variable",
  args: [
    {
      name: "name",
      description: "Variable Name",
      type: ArgType.String,
      required: true,
      rest: false,
      execute: true,
    },
  ],
  return: ArgType.String,
  type: FunctionType.Getter,
  execute: ELZFunction.execute((ctx, name: string) => {
    if (!ctx.variables.valid(name)) {
      ctx.error.FunctionError("invalid_variable_name", {
        name: name,
        token: ctx.function,
      });
    }
    console.log(name);
    if (!ctx.variables.has(name)) {
      ctx.error.FunctionError("variable_not_exists", {
        name: name,
        token: ctx.function,
      });
    }
    return ctx.return(ctx.varName(name));
  }),
});
