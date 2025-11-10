import AuthController from "../controllers/auth.controller.mjs";

export default async function authRoute(fastify, options) {
  const authcontroller = new AuthController(fastify);

  // --- LOGIN ROUTE ---

  fastify.post("/two-step-verify",{
    schema:{
      body:{
        type:"object",
        required:["otp","email"],
        properties:{
          otp:{type:"string"},
          email:{type:"string",format:"email"}
        },
        additionalProperties:false,
      },
      response:{
        200:{
          type:"object",
          properties:{
            status:{type:"string"},
            data:{
              access_token:{type:"strign"},
              refresh_token:{type:"string"},
              session_token:{type:"string"}
            }
          }
        }
      }
    }
  },authcontroller.two_step_verify)

  fastify.get("/verify-email",{
    schema:{
      querystring:{
        type:"object",
        required:["token"],
        properties:{
          token:{type:"string"}
        }
      },
      response:{
        200:{
          type:"object",
          properties:{
            status:{type:"string"}
          }
        }
      }
    }
  },authcontroller.verifyEmail);
  
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
            message:{type:"string"}
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
