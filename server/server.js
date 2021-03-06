const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save().then(doc => {
    res.send(doc);
  }, error => {
    res.status(400).send(error);
  });
});

app.get('/todos', (req, res) => {

  Todo.find().then(todos => {
    if (todos.length === 0) {
      res.status(204);
    }
    res.send({ todos });
  }, error => {
    res.status(400).send(error);
  });
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(400).send();
  }

  Todo.findById(id).then(todo => {
    if (!todo) {
      res.status(404).send();
    }

    res.send({ todo });
  }).catch(err => {
    res.status(400).send();
  })
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(400).send();
  }

  Todo.findByIdAndRemove(id).then(todo => {
    if (!todo) {
      res.status(404).send();
    }

    res.send({ todo });
  }).catch(err => {
    res.status(400).send();
  })
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    res.status(400).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
    if (!todo) {
      res.status(404).send();
    }

    res.send({ todo });
  }).catch(err => {
    res.status(400).send();
  })
});

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['name', 'email', 'password']);
  const user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then(token => {
    res.header('x-auth', token).send(user);
  }).catch(err => {
    res.status(400).send(err);
  })
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user);
    })
  }).catch(err => {
    res.status(400).send();
  });

});

app.get('/users/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(400).send();
  }

  User.findById(id).then(user => {
    if (!user) {
      res.status(404).send();
    }

    res.send({ user });
  }).catch(err => {
    res.status(400).send();
  })
});

app.get('/users/me/user', authenticate, (req, res) => {
  res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => res.status(200).send(),
    () => res.status(400).send()
  )
})

app.listen(port, () => {
  console.log(`Magic happens on ${port}`);
});

module.exports = {
  app
};
