const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, 'aaa');

    user.tokens.push({
        access,
        token
    });

    return user.save().then(() => {
        return token;
    });
};

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

userSchema.pre('save', function(next) {
   var user = this;

   if (user.isModified('password')) {
       bcrypt.genSalt(10, (err, salt) => {
           bcrypt.hash(user.password, salt, (err, hash) => {
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