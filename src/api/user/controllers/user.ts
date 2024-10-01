module.exports = {
  async me(ctx) {
    const userId = ctx.state.user.id; // Get user ID from JWT
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId } });

    if (!user) {
      return ctx.notFound("User not found");
    }

    return ctx.send({ user });
  },
};
