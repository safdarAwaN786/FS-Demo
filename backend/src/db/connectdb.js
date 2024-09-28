const mongoose = require('mongoose');

// * Updated MongoDB Atlas SRV connection link
// const dbConnect = 'mongodb+srv://safdar:sJQVITzTeIfUteRl@new-feat.ey8gy4c.mongodb.net/New-Feat';
const dbConnect = 'mongodb://localhost:27017/New-Feat';

// * MongoDB Atlas connection using mongoose
mongoose.connect(dbConnect)
    .then(() => {
        console.log('Hurrah! MongoDB connection successfully established :)');
    })
    .catch((err) => {
        console.error('Sorry Bro! MongoDB is not connected :(', err.message);
    });



