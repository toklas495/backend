import fs from "fs/promises";
import { join } from "path";
import constant from "../config/constant.mjs"; // adjust according to your structure
import __dirname from "../../approotdir.mjs";

let VARIABLE_JSON = null;
const filepath = join(__dirname, constant.VARIABLE_FILE_PATH);

/**
 * Save or update variables in the JSON file.
 * Merges with existing variables if present.
 * @param {Object} variables - Key-value pairs to store
 */
export async function setVariable(variables) {
  try {
    let existing = {};

    try {
      const content = await fs.readFile(filepath, "utf-8");
      existing = JSON.parse(content);
    } catch (err) {
      if (err.code !== "ENOENT" && !err.message.includes("Unexpected end of JSON input")) {
        throw err;
      }
      if (err.message.includes("Unexpected end of JSON input")) {
        console.error("Warning: Variable file is corrupted! Overwriting...");
      }
    }

    const mergedVariables = { ...existing, ...variables };
    await fs.writeFile(filepath, JSON.stringify(mergedVariables, null, 2), "utf-8");

    // Update cached variables
    VARIABLE_JSON = JSON.stringify(mergedVariables);

  } catch (error) {
    console.error("Error saving variables:", error.message);
    throw error;
  }
}

/**
 * Read the variable JSON file (cached after first read)
 * @returns {Promise<string>} JSON string of variables
 */
async function readFile() {
  if (VARIABLE_JSON) return VARIABLE_JSON;

  try {
    const content = await fs.readFile(filepath, "utf-8");
    VARIABLE_JSON = content;
    return VARIABLE_JSON;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Warning: variable.json file not found!");
      return "{}"; // return empty JSON object string
    }
    throw error;
  }
}

/**
 * Replace all {{variable}} placeholders in a string with values from variable file
 * @param {string} input - String containing {{variables}}
 * @returns {Promise<string>} - String with variables replaced
 */
export async function variableParser(input) {
  try {
    if (typeof input !== "string") return input;

    const content = await readFile();
    const cachedVars = JSON.parse(content);

    return input.replace(/{{(.*?)}}/g, (_, key) => {
      key = key.trim();
      if (cachedVars[key] !== undefined) return cachedVars[key];
      console.warn(`Warning: variable "{{${key}}}" not found!`);
      return `{{${key}}}`; // leave placeholder if not found
    });
  } catch (error) {
    console.error("Error parsing variables:", error.message);
    throw error;
  }
}
