let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt  = require('passport-jwt').ExtractJwt;
let User        = require('../models/User');
let config      = require('./config');

module.exports = function(passport) {
  let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.auth.secret
  };

  passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    User.findById(jwtPayload._id)
      .then(user => {
        done(null, user ? user : false);
      })
      .catch(err => {
        done(err, false);
      });
  }));
};
