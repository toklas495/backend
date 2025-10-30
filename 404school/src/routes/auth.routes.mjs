import AuthController from "../controllers/auth.controller.mjs";

export default async function authRoute(fastify, options) {
  const authcontroller = new AuthController();

  // --- LOGIN ROUTE ---
  fastify.post("/login", {
    schema: {
      body: {
        type: "object",
        required: ["password"],
        additionalProperties: false,
        properties: {
          username: { type: "string", maxLength: 100 },
          email: { type: "string", format: "email" },
          password: { type: "string", maxLength: 100 }
        },
        oneOf: [
          { required: ["username", "password"] },
          { required: ["email", "password"] }
        ]
      },
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            data: {
              type: "object", // ✅ fixed typo
              properties: {
                access_token: { type: "string" },
                refresh_token: { type: "string" },
                session_token: { type: "string" }
              }
            }
          }
        }
      }
    }
  }, authcontroller.login);

  // --- REFRESH ROUTE ---
  fastify.post("/refresh", {
    schema: {
      body: {
        type: "object", // ✅ fixed "objct" → "object"
        required: ["refresh_token", "session_token"],
        additionalProperties: false,
        properties: {
          refresh_token: { type: "string" },
          session_token: { type: "string" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            data: {
              type: "object", // ✅ fixed "ojbect" → "object"
              properties: {
                access_token: { type: "string" },
                refresh_token: { type: "string" },
                session_token: { type: "string" }
              }
            }
          }
        }
      }
    }
  }, authcontroller.refresh);
}
