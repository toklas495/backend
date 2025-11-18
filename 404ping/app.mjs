#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import builder from "./src/build.mjs";

yargs(hideBin(process.argv))
  .scriptName("404ping")
  .usage("$0 <cmd> [args]")
  .command(
    "request <url>",
    "Send HTTP Request",
    (yargs) => {
      return yargs
        .positional("url", {
          type: "string",
          describe: "API endpoint URL",
        })
        .option("method", {
          alias: "X",
          default: "GET",
          describe: "HTTP method",
        })
        .option("data", {
          alias: "d",
          describe: "JSON body",
        })
        .option("header", {
          alias: "H",
          type: "array",
          describe: "Headers (-H 'Key: Value')",
        })
        .check((argv) => {
          // validate HTTP method
          const allowed = ["GET", "POST", "PUT", "DELETE"];
          if (!allowed.includes(argv.method.toUpperCase())) {
            throw new Error(`Invalid HTTP method: ${argv.method}`);
          }

          // validate JSON body
          if (argv.data) {
            try {
              JSON.parse(argv.data);
            } catch {
              throw new Error(`Invalid JSON in --data: ${argv.data}`);
            }
          }

          // validate headers
          if (argv.header) {
            argv.header.forEach((h) => {
              if (!h.includes(":")) {
                throw new Error(
                  `Invalid header format: "${h}". Must be "Key: Value"`
                );
              }
              const [key, value] = h.split(":").map((s) => s.trim());
              if (!key || !value) {
                throw new Error(
                  `Invalid header: "${h}". Key and Value cannot be empty`
                );
              }
            });
          }

          return true;
        });
    },
    async (argv) => {
        await builder(argv)
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
