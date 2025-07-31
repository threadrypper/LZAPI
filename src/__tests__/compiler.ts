import { Compiler } from "../index";
const code = `
$log[Test 1]
$let[n;6]
$log[Test 2: n = $get[n]]
$log[Test 3: $get[n] + $get[n]]
$log[Test 4: $log[Hello]]
`;

let compiler = Compiler.compile(code);

compiler.code().then((o) => {
  console.log(o);
});
