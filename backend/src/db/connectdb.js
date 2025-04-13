const mongoose = require('mongoose');

// * Updated MongoDB Atlas SRV connection link
const dbConnect = 'mongodb+srv://safdar:sJQVITzTeIfUteRl@new-feat.ey8gy4c.mongodb.net/New-Feat';
// const dbConnect = 'mongodb://safdar:sJQVITzTeIfUteRl@ac-lhklqfk-shard-00-00.ey8gy4c.mongodb.net:27017,ac-lhklqfk-shard-00-01.ey8gy4c.mongodb.net:27017,ac-lhklqfk-shard-00-02.ey8gy4c.mongodb.net:27017/?ssl=true&replicaSet=atlas-x1sx76-shard-0&authSource=admin&retryWrites=true&w=majority&appName=New-Feat';


// const dbConnect = 'mongodb://localhost:27017/New-Feat';
// 
// * MongoDB Atlas connection using mongoose
mongoose.connect(dbConnect)
    .then(() => {
        console.log('Hurrah! MongoDB connection successfully established :)');
    })
    .catch((err) => {
        console.error('Sorry Bro! MongoDB is not connected :(', err.message);
    });



