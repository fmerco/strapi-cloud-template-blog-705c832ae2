const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");

module.exports = {
  async register(ctx) {
    const { username, email, password } = ctx.request.body;

    if (!username || !email || !password) {
      return ctx.badRequest("Please provide username, email, and password");
    }

    const existingUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { email } });
    if (existingUser) {
      return ctx.badRequest("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await strapi
      .query("plugin::users-permissions.user")
      .create({
        data: {
          username,
          email,
          password: hashedPassword,
          confirmed: true,
        },
      });

    const privateKey = fs.readFileSync("./private.key", "utf8");

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1h",
        header: {
          kid: "ErH_ggmM1XALsnoxly8Ce2xlYXHaqYDn0h1sv3pS7_4",
        },
      }
    );

    return ctx.send({
      user: newUser,
      jwt: token,
    });
  },

  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest("Please provide email and password");
    }

    // Find user by email
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { email } });
    if (!user) {
      return ctx.badRequest("Invalid credentials");
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return ctx.badRequest("Invalid credentials");
    }

    const privateKey = fs.readFileSync("./private.key", "utf8");

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      header: {
        kid: "ErH_ggmM1XALsnoxly8Ce2xlYXHaqYDn0h1sv3pS7_4",
      },
    });

    return ctx.send({
      jwt: token,
      user,
    });
  },
};
