const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const secretKey = require('../config/config').key.privateKey;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findOne({ _id: jwt_payload._id, email: jwt_payload.email, isActive: true });
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
