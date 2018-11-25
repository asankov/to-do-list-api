const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }]
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'aaa');

  user.tokens.push({
    access,
    token
  });

  return user.save().then(() => {
    return token;
  });
};

userSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({ $pull: { tokens: { token } } })
}

userSchema.statics.findByToken = function (token) {
  const User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'aaa');
  } catch (err) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

userSchema.statics.findByCredentials = function (email, password) {
  const User = this;

  return User.findOne({ email }).then(user => {
    if (!user) return Promise.reject();

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (_, res) => {
        if (res) resolve(user);

        reject();
      })
    })
  })
};

userSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (_, salt) => {
      bcrypt.hash(user.password, salt, (_, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };