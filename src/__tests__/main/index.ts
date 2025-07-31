import { ExpressLZ, Methods } from "../../index";
import { join } from "path";

const expressLZ = new ExpressLZ({
  port: 80,
  jsonSpaces: 0,
  outFile: join(__dirname, "app.js"),
});

expressLZ.routes.add({
  route: "/",
  method: Methods.GET,
  code: `
$log[Hello World!]
`,
});

expressLZ.compile().then((elz) => {
  console.log(elz);
});
