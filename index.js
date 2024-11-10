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

