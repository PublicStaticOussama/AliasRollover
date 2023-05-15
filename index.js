import dotenv from "dotenv";
import { ConsoleColor } from "./src/utils/ConsoleColor.js";
import { fetchRolloverIndices, rollover } from "./src/main/index.js";
import { rolloverCondition } from "./src/main/RolloverCondition.js";
import { Command } from "commander";
import { client } from "./src/elastic/client.js";
import fs from "fs";
import { Logger } from "./src/utils/Logger.js";
dotenv.config();

const program = new Command();

program.requiredOption("-p, --pattern <pattern>", "Alias wildcard pattern");

program.parse();

const opts = program.opts();

// console.log(ConsoleColor.FgCyan, "Alias pattern:", opts.pattern, Consol);
Logger.cyan("Alias pattern:", opts.pattern);

const rolloverIndices = await fetchRolloverIndices(
  opts.pattern,
  rolloverCondition
);

if (rolloverIndices.length) await rollover(rolloverIndices);

// const res = await client.indices.getMapping({
//   index: [].map(({ index }) => index),
// });

// const data = fs.readFileSync("./blunder.json", "utf8");
// const blunders = JSON.parse(data);
// console.log(blunders[0]);
// console.log("=============================================;");
// console.log("=============================================;");

// const indices = blunders.map((blunder) => blunder.index);
// console.log(indices);
// console.log(indices.length);

// console.log("=============================================;");
// console.log("=============================================;");

// const res = await client.search({
//   index: indices,
// });

// const noneEmptyIndices = res.body.hits.hits.map((hit) => hit._index);
// console.log(noneEmptyIndices);
// const noneEmptyIndexSet = new Set(noneEmptyIndices);
// console.log(noneEmptyIndexSet);

// const i = indices.indexOf(noneEmptyIndices[0]);
// console.log("indexOf:", i);
// console.log(indices[i]);

// const res2 = await client.indices.delete({
//   index: indices,
// });

// console.log(res2.statusCode);
