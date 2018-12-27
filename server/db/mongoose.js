var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const option = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  reconnectTries: 30000
};

mongoose.connect(process.env.MONGODB_URI, option, e => console.log(e));

module.exports = {
  mongoose
};