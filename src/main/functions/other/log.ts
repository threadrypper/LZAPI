import { ELZFunction } from "../../../structures";
import { ArgType, FunctionType } from "../../../typings";
export default new ELZFunction({
  name: "log",
  description: "Logs a message to the console.",
  args: [
    {
      name: "text",
      description: "The text to log.",
      type: ArgType.String,
      required: true,
      rest: false,
      execute: true,
    },
  ],
  return: ArgType.Void,
  type: FunctionType.Callback,
  execute: ELZFunction.execute((ctx, text: string) => {
    return ctx.return(`console.log("${ctx.parse.string(text)}")`);
  }),
});
