const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { Users } = require('./models/user');

var app = express();

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


app.listen(3000, () => {
    console.log('Magic happens on 3000');
});

module.exports = {
    app
};
