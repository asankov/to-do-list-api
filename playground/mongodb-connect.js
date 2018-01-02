const MongoClient = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log('Unable to connect to MongoDB', err);
        return;
    }
    console.log('Connected to MongoDB server');

    db.collection('Todos').insertOne({
        text: 'Read "Computer Science" distilled',
        completed: false
    }, (err, result) => {
        if (err) {
            console.log('Failed to write task', err);
            return;
        }
        console.log(result.ops);
    });

    db.collection('Users').insertOne({
        name: 'Anton Sankov',
        age: 21,
        location: 'Samokov'
    }, (err, result) => {
        if (err) {
            console.log('Failed to write user', err);
            return;
        }
        console.log(result.ops);
    });

    db.close();
});