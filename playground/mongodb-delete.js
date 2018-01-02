const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log('Unable to connect to MongoDB', err);
        return;
    }
    console.log('Connected to MongoDB server');

    db.collection('Todos').deleteMany({text: 'Do something'}).then(result => {
        console.log(result);
    });

    db.collection('Todos').deleteOne({text: 'Do something'}).then(result => {
        console.log(result);
    });

    db.collection('Todos').findOneAndDelete({completed: false}).then(result => {
        console.log(result);
    });

    db.collection('Users').deleteMany({name: 'some name'}).then(result => {
        console.log('Delete all users with name "some name"');
        console.log(result);
    });

    db.collection('Users').findOneAndDelete({_id: ObjectID('5a4a317d4807de8b2b6a50df')}).then(result => {
       console.log(result);
    })
});