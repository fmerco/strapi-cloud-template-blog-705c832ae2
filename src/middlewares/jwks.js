const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

module.exports = () => {
  const client = jwksClient({
    jwksUri: 'https://proper-bear-ed0eac23c6.strapiapp.com//.well-known/jwks.json',
  });

  function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err, null);
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      }
    });
  }

  return async (ctx, next) => {
    const token = ctx.request.header.authorization && ctx.request.header.authorization.split(' ')[1]; // Bearer token
    if (!token) {
      return ctx.unauthorized('No token provided');
    }

    try {
      jwt.verify(token, getKey, {}, (err, decoded) => {
        if (err) {
          return ctx.unauthorized('Invalid token');
        }
        ctx.state.user = decoded; // Add user information to the request context
      });
    } catch (err) {
      return ctx.unauthorized('Token verification failed');
    }

    await next();
  };
};
