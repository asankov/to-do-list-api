const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { Users } = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
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
        res.send({todos});
    }, error => {
        res.status(400).send(error);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

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
   var id = req.params.id;

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

app.listen(port, () => {
    console.log(`Magic happens on ${port}`);
});

module.exports = {
    app
};