const jwt = require("jsonwebtoken");
const fs = require("fs");

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const authHeader = ctx.request.headers.authorization;
    
    if (!authHeader) {
      console.log("Authorization header is missing");
      return ctx.unauthorized("Authorization header is missing");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Token is missing");
      return ctx.unauthorized("Token is missing");
    }

    try {
      const publicKey = fs.readFileSync("./public.key", "utf8");
      console.log("Public Key: ", publicKey);

      const decoded = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
        issuer: "https://proper-bear-ed0eac23c6.strapiapp.com",
        audience: "123",
      });

      console.log("JWT Decoded: ", decoded);

      ctx.state.user = {
        id: decoded.id,
        email: decoded.email,
      };

      await next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      return ctx.unauthorized("Invalid or expired token");
    }
  };
};
