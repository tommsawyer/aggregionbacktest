let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', function(next) {
  let user = this;

  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }

        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = function(pw) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pw, this.password, function(err, isMatch) {
      if (err) {
        return reject(err);
      }

      resolve(!!isMatch);
    });
  });
};

module.exports = mongoose.model('User', UserSchema);
