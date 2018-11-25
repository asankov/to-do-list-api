const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const USER_IDS = [new ObjectID(), new ObjectID()];
const USERS = [{
  _id: USER_IDS[0],
  name: 'user_one',
  email: 'user_one@test.com',
  password: 'user_one_pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: USER_IDS[0], access: 'auth' }, 'aaa').toString()
  }]
}, {
  _id: USER_IDS[1],
  name: 'user_two',
  email: 'user_two@test.com',
  password: 'user_two_pass'
}];

const TODOS = [{
  _id: new ObjectID(),
  text: 'First todo'
}, {
  _id: new ObjectID(),
  text: 'Second todo',
  completed: false,
  completedAt: 100
}];

const populateTodos = done => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(TODOS);
  }).then(() => done());
};

const populateUsers = done => {
  User.deleteMany({}).then(() => {
    const userOne = new User(USERS[0]).save();
    const userTwo = new User(USERS[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  TODOS,
  USERS,
  populateTodos,
  populateUsers
};