#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import builder from './src/build.mjs' 
import yargArgument from "./src/config/yargs_argument.mjs";

yargs(hideBin(process.argv))
  .scriptName("404ping")
  .usage("$0 <cmd> [args]")
  .command(
    "request <url>",
    "Send HTTP Request",
    yargArgument.request_arg,
    async (argv) => {
      await builder.requestHandler(argv);
    }
  )
  .command(
    "set <variables..>", // note the ".." to make it an array
    "Set Variables",
    yargArgument.set_arg,
    async (argv) => {
      await builder.setVariableHandler(argv);
    }
  )
  .fail((msg, err, yargsInstance) => {
    // Print only the error message (curl-style)
    console.error("Error:", err ? err.message : msg);
    // Show help briefly if you want
    console.log("\nUsage:\n", yargsInstance.help());
    process.exit(1);
  })
  .help()
  .parse();
