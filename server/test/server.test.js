const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { TODOS, USERS, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = 'TEST TODO TEXT';

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
   });

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
        const validId = TODOS[0]._id.toHexString();

        request(app)
            .get(`/todos/${validId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(TODOS[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', done => {
        const nonExistingId = new ObjectID().toHexString();

        request(app)
            .get(`/todos/${nonExistingId}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 for non valid object ids', done => {
        const nonValidId = '123';

        request(app)
            .get(`/todos/${nonValidId}`)
            .expect(400)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', done => {
        const validId = TODOS[0]._id.toHexString();

        request(app)
            .delete(`/todos/${validId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toEqual(TODOS[0].text);
            })
            .end((err, res)=> {
            if (err) {
                return done(err);
            }

            Todo.findById(validId).then(todo => {
                expect(todo).toBeNull();
                done();
            }).catch(err => done(err));
        })
    });

    it('should return 404 when no todo found', done => {
        const nonExistingId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${nonExistingId}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 for non valid object ids', done => {
        const nonValidId = '123';

        request(app)
            .delete(`/todos/${nonValidId}`)
            .expect(400)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', done => {
        const id = TODOS[0]._id.toHexString();
        const text = 'New text';

        request(app)
            .patch(`/todos/${id}`)
            .send({
                text,
                completed: true
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeDefined();
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', done => {
        const id = TODOS[1]._id.toHexString();
        const text = 'New text';

        request(app)
            .patch(`/todos/${id}`)
            .send({
                text,
                completed: false
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeNull();
            })
            .end(done);
    })
});

describe('GET /usersme', () => {
    it('should return user if authenticated', done => {
       request(app)
           .get('/usersme')
           .set('x-auth', USERS[0].tokens[0].token)
           .expect(200)
           .expect( res => {
               expect(res.body._id).toBe(USERS[0]._id.toHexString());
               expect(res.body.email).toBe(USERS[0].email);
           })
           .end(done);
    });

    it('should return 401 if not authenticated', done => {
        request(app)
            .get('/usersme')
            .expect(401)
            .expect( res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', done => {
        request(app)
            .post('/users')
            .send({
                name: 'user_one',
                email: 'test_one@test.com',
                password: 'password123!'
            })
            .expect(200)
            .expect( res => {
                expect(res.headers['x-auth']).toBeDefined();
                expect(res.body._id).toBeDefined();
                expect(res.body.email).toBe('test_one@test.com');
            })
            .end(err => {
                if (err) {
                    return done(err);
                }

                User.findOne({email: 'test_one@test.com'}).then(user => {
                    expect(user).toBeDefined();
                    expect(user.password).not.toBe('password123!');
                    done();
                }).catch(e => done(e));
            });
    });

    it('should return validation error if email is empty', done => {
        request(app)
            .post('/users')
            .send({
                name: 'test_two',
                password: 'password123!'
            })
            .expect(400)
            .end(done)
    });

    it('should return validation error if email is invalid', done => {
        request(app)
            .post('/users')
            .send({
                name: 'test_two',
                email: 'invalid_email',
                password: 'password123!'
            })
            .expect(400)
            .end(done)
    });

    it('should return validation error if password is empty', done => {
        request(app)
            .post('/users')
            .send({
                name: 'test_two',
                email: 'test_three@test.com'
            })
            .expect(400)
            .end(done)
    });

    it('should return validation error if password is shorter than 6 symbols', done => {
        request(app)
            .post('/users')
            .send({
                name: 'test_three',
                email: 'test_three@test.com',
                password: '123'})
            .expect(400)
            .end(done)
    });

    it('should not create user if email is already in use', done => {
        request(app)
            .post('/users')
            .send({
                name: 'test_four',
                email: USERS[0].email,
                password: 'password123!'
            })
            .expect(400)
            .end(done)
    });
});

describe('POST /users/login', () => {
    it('should login users and return and token', done => {
        request(app)
            .post('/users/login')
            .send({
                email: USERS[1].email,
                password: USERS[1].password
            })
            .expect(200)
            .expect(res => {
                expect(res.header['x-auth']).toBeDefined();
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                User.findById(USERS[1]._id).then(user => {
                    expect(user.tokens[0]['access']).toBe('auth');
                    expect(user.tokens[0]['token']).toBe(res.header['x-auth']);
                }).catch(e => done(e));
                done()
            });
    });

    it('should reject invalid login', done => {
        request(app)
            .post('/users/login')
            .send({
                email: USERS[1].email,
                password: 'invalid_password'
            })
            .expect(400)
            .expect(res => {
                expect(res.header['x-auth']).toBeUndefined();
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                User.findById(USERS[1]._id).then(user=>{
                    expect(user.tokens.length).toBe(0);
                }).catch(e => done(e));
                done()
            });
    });
});
