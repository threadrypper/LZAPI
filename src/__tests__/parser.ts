import { Parser } from "../index";

const code = `
$test[arg;arg;$test[arg]]
Non functional 
$test[arg2]
`;

const parser = Parser.parse(code);
console.log(parser.tokens[0].parsedArgs);
