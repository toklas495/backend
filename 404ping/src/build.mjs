import Request from "./utils/asyncRequestHandle.mjs";
import http from 'http';
import { URL as URLBUILDER } from 'url';

export default async function builder(args) {
    const request = new Request(http);
    const { method, url, data, header } = args || {};

    try {
        const urlparams = new URLBUILDER(url);

        // --- Headers ---
        const headers = {};
        if (header && header.length) {
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
            if (typeof data === 'string') {
                try { body = JSON.parse(data); } 
                catch { /* if not JSON, leave as string */ }
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
        if (error.code === "ERR_INVALID_URL") {
            console.error("INVALID URL:", url);
        } else {
            // Clean curl-style error
            console.error("Error:", error.message);
        }
        process.exit(1); // exit with non-zero code on error
    }
}
