
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/user/me",
      handler: "user.me",
      config: {
        auth: false, 
        middlewares: ['global::jwt-verify-middleware']
      },
    },
  ],
};