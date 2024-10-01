const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
  async register(ctx) {
    const { username, email, password } = ctx.request.body;

    if (!username || !email || !password) {
      return ctx.badRequest('Please provide username, email, and password');
    }

    const existingUser = await strapi.query('plugin::users-permissions.user').findOne({ where: { email } });
    if (existingUser) {
      return ctx.badRequest('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await strapi.query('plugin::users-permissions.user').create({
      data: {
        username,
        email,
        password: hashedPassword,
        confirmed: true,
      },
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, 'your-secret-key', { expiresIn: '1h' });

    return ctx.send({
      user: newUser,
      jwt: token,
    });
  },

  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Please provide email and password');
    }

    // Find user by email
    const user = await strapi.query('plugin::users-permissions.user').findOne({ where: { email } });
    if (!user) {
      return ctx.badRequest('Invalid credentials');
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return ctx.badRequest('Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAk73mybrg8KZinsQc9oQVfdK8lWGX/tHSZFIPrXN0IK68+xpB
7lTmywcnPWWGPeTQjia32rZInpIRhaI6HbCkmzik+FnWSXWP640QnTWzrS5bvzA7
quJzRMEIkMPG2542+P19nOcK2F05HFoIJrtGjVQ+GfkLFGcOeUp9uZNbj/cBx+1T
V0TYtROoUI+zoYN0iEPz9o0yfTvqbBEpioVRFXMN6A8OQZObGu07zwt+IFOpXOeD
mEyv2B1WjEyZtRpAy8GtKE2g/tE+PIin+h4zaw9+Bmy8FOVGW2vw/KQc7bKqP/WH
pX2OTZX0QNKaGzAegpcRsMMlR/gee9b9FOBaZwIDAQABAoIBAATZvkMEmgVXS8jv
TWLL5rIRLNSGthPNVb1UyGOnH7qW92i9wvO34TVB5d2T1hAgJrdpZAM6lYXHQUCu
7n4yYiUf0KLAEv3/GHDhBRj0PhLt1mCfjRtI1gSoMHIi9gYYhVuFZGNgs9rIrMBW
iwqifr19yjrWEga4dMwx+uYQhXgOKj1ck2OCc8GKt7HRk81bzFw1ITPX6gJkTHQB
zEdlbNVWnWdL+yNHEtcpbwQ2XIHxN4H3vuoPd7ttGx7De0msFm4HKm6WEYN/o9DY
sSJ3eW9OB8IIjiI36MzVzMniiY5HuiWCarCvbmgCHcCoXDrKLZN2beatEigpOthG
nNLFwDkCgYEAzEUvffW6NjLtijgIkOpHlnGHQ7uFFcgELd9mvYOe8p1+D4YWC00L
Q8t8WrpX7ureXypPYeCxh2Fcr0AQ24aaEQ5JV6P+E/MB1xZ7f0KnR10fTsCiYfaO
gCVpSQru6TqRslNU+89/UXYbZgNamlI3CoSn7Ody1BXlt1+ogG26OU0CgYEAuSf7
z5SkORhSTzWa+HyBqVdnDhto0Zi+1Ym9n2bzMPfN9cmESFP3ki0aZqfKwPHpZeW+
iSvhicKt8t0yBTFkDlVVYRZQ4zKeRHfjH2C8nW/DAWEeNhhijQNfn0vaoKAjVj7Q
MVx2g1fVPrXwnbrOSC++1c/61PSYA4uHoQOlKIMCgYAFer2hZVwPZCJXGNWx/Xba
JEV6naceRHVIPbvlzYgP/gWJqREiUHjC4sx9Ko59TDOW3e2vNHXOqd/wm4lYOi4b
0wRIo4+HPXeJK4M4kLMoCOl0FVrFwfVknpxKZ06tVvLdk7qt3o0NxFtLyz888IOl
dpWCl1rPMZ8t4hUFDOx36QKBgQCbspm3luD5+g/M9+DXL6vBAPRyEm50QiPHYUqJ
boL2HIufMdQBFkrLKw5WYKbI1SRVQXqV0saXl5O69HKJl1zyCKQBPkjKpNgd70qY
KjqxkTfEQyyqhJrqxXl1dM3l4IOWlL9xorUuAYAaedhaaqnoXe310iy1QvFJmd11
cqFBjQKBgEJ4HpGsSKSm7JcfFiAfRRm+h/KhdCA6jkH38FEzf4C0gZJ5HKC88njE
If7btiwOHReEgNY23IYx/hlGekiHVpPnMuJRC5TakeriPpKcCE61EsAHCWhI4VIQ
tIjFon89uUF2iMwRT4OjXniPmk41zRYXTIOUArQqoAkcPTFYbqdS
-----END RSA PRIVATE KEY-----
`, {  algorithm: 'RS256', expiresIn: '1h' });

    return ctx.send({
      jwt: token,
      user,
    });
  },
};
