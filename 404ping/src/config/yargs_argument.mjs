const yargArgument = {
  // ---- Arguments for sending requests ----
  request_arg: (yargs) => {
    return yargs
      .usage("Usage: 404ping <url> [options]")
      .positional("url", {
        type: "string",
        describe: "The API endpoint URL you want to request",
        demandOption: true,
      })
      .option("method", {
        alias: "X",
        type: "string",
        default: "GET",
        describe:
          "HTTP method to use. Allowed: GET, POST, PUT, DELETE. Default: GET",
      })
      .option("data", {
        alias: "d",
        type: "string",
        describe:
          "Request body in JSON format (use with POST or PUT). Example: '{\"key\":\"value\"}'",
      })
      .option("header", {
        alias: "H",
        type: "array",
        describe:
          "Custom headers. Use multiple -H options or an array. Format: 'Key: Value'. Example: -H 'Authorization: Bearer token'",
      })
      .example(
        "404ping https://api.example.com/user -X POST -d '{\"name\":\"John\"}' -H 'Authorization: Bearer token'",
        "Send a POST request with JSON body and Authorization header"
      )
      .check((argv) => {
        // Validate HTTP method
        const allowed = ["GET", "POST", "PUT", "DELETE"];
        if (!allowed.includes(argv.method.toUpperCase())) {
          throw new Error(`Invalid HTTP method: ${argv.method}`);
        }

        // Validate JSON body
        if (argv.data) {
          try {
            JSON.parse(argv.data);
          } catch {
            throw new Error(`Invalid JSON in --data: ${argv.data}`);
          }
        }

        // Validate headers
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

  // ---- Arguments for setting variables ----
  set_arg: (yargs) => {
    return yargs
      .usage("Usage: 404ping set <variables> [options]")
      .positional("variables", {
        type: "array",
        describe:
          "Variables to set in 'key:value' format. Example: host:google.com token:abc123",
        demandOption: true,
      })
      .option("global", {
        alias: "g",
        type: "boolean",
        describe:
          "Save variables globally to variable.json so they can be used in requests with {{variable}} placeholders",
      })
      .example(
        "404ping set host:google.com token:abc123 -g",
        "Set host and token globally"
      )
      .check((argv) => {
        argv.variables.forEach((v) => {
          if (!v.includes(":")) {
            throw new Error(
              `Invalid variable format: "${v}". Must be "key:value"`
            );
          }
          const [key, value] = v.split(":").map((s) => s.trim());
          if (!key || !value) {
            throw new Error(
              `Invalid variable: "${v}". Key and Value cannot be empty`
            );
          }
        });
        return true;
      });
  },
};

export default yargArgument;
