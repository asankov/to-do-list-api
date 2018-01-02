const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const TODOS = [{text: 'First todo'}, {text: 'Second todo'}];

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
