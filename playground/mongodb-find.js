const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log('Unable to connect to MongoDB', err);
        return;
    }
    console.log('Connected to MongoDB server');

    db.collection('Todos').find({
        _id: new ObjectID("5a4a3076d24d1f8abc0fa44b")
    }).toArray().then(docs => {
        console.log('Todos:');
        console.log(JSON.stringify(docs, undefined, 2));
    }, err => {
        console.log('Unable to fetch Todos', err)
    });

    db.collection('Todos').find({}).count().then(count => {
        console.log(`Todos count: ${count}`);
    }, err => {
        console.log('Unable to fetch Todos', err)
    });

    db.collection('Users').find({name: "Anton Sankov"}).toArray().then(users => {
        console.log(JSON.stringify(users, undefined, 2));
    }, err => {
        console.log('Unable to fetch users.');
    })
});