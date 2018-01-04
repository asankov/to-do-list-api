const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const TODOS = [{
    _id: new ObjectID(),
    text: 'First todo'
}, {
    _id: new ObjectID(),
    text: 'Second todo'
}];

beforeEach(done => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(TODOS);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', done => {
        var text = 'TEST TODO TEXT';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect( res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text }).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(err => done(err));
            })
    });

    it('should not create new todo with invalid data', done => {

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then(todos => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(err => done(err));
            })
    })
});

describe('GET /todos', () => {
   it('should get all todos', done => {

       request(app)
           .get('/todos')
           .expect(200)
           .expect(res => {
               expect(res.body.todos.length).toBe(2);
           })
           .end(done);
   })

    it('should return 204 when no todos found', done => {
        Todo.remove().then(() => {

            request(app)
                .get('/todos')
                .expect(204)
                .end(done)
        });
    })
});

describe('GET /todos/:id', () => {
    it('should return todo doc', done => {
        request(app)
            .get(`/todos/${TODOS[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(TODOS[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', done => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 for non valid object ids', done => {
        request(app)
            .get('/todos/123')
            .expect(400)
            .end(done);
    });
});