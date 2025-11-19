import Request from "../utils/asyncRequestHandle.mjs";
import { URL as URLBUILDER } from "url";
import {variableParser} from '../utils/fileHandle.mjs';


export default async function RequestHandler(httpModule, args = {}) {
    const request = new Request(httpModule);
    let { method = "GET", url, data, header = [] } = args;

    if (!url) {
        console.error("ERROR: URL is required");
        process.exit(1);
    }

    // parse variable 
    url = await variableParser(url);
    method=await variableParser(method);
    data = typeof data==='string'?await variableParser(data):data;
    header = await Promise.all(header.map(h=>variableParser(h)));

    try {
        const urlparams = new URLBUILDER(url);

        // --- Headers ---
        const headers = {};
        if (header.length) {
            header.forEach(h => {
                if (!h.includes(":")) throw new Error(`Invalid header format: "${h}". Must be "Key: Value"`);
                const [key, value] = h.split(":").map(s => s.trim());
                if (!key || !value) throw new Error(`Invalid header: "${h}". Key and Value cannot be empty`);
                headers[key] = value;
            });
            request.addHeaders(headers);
        }

        // --- Method ---
        request.addMethod(method.toUpperCase());

        // --- Body ---
        if (data) {
            let body = data;
            if (typeof data === "string") {
                try {
                    body = JSON.parse(data);
                } catch {
                    // leave as string if not valid JSON
                }
            }
            request.addBody(body);
        }

        // --- URL parts ---
        request.addHost(urlparams.hostname);
        if (urlparams.port) request.addPort(Number(urlparams.port));
        request.addPath(urlparams.pathname + urlparams.search); // include query params

        // --- Send request ---
        const response = await request.send();
        console.log(response);

    } catch (error) {
        console.error(error)
        // Handle known errors first
        if (error.code === "ENOTFOUND") {
            console.error("Sorry! Invalid host");
        } else if (error.code === "ERR_INVALID_URL") {
            console.error("INVALID URL:", url);
        } else {
            console.error("ERROR:", error.message);
        }

        process.exit(1); // exit with non-zero code on error
    }
}
