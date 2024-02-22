const mongoose = require('mongoose')

// * This is the mongodb Atlas connection link
const dbConnect = 'mongodb+srv://trainingtuvsw:m6mgPX3bKa1nMB9I@new-feat.ey8gy4c.mongodb.net/New-Feat';

// * Theses are the parameters
const connectionParams = {
    useNewUrlParser: true, useUnifiedTopology: true,
    // Set connection timeout to 30 seconds (default is 30000ms)
};

// * This is the mongodb Atlas connection
mongoose.connect(dbConnect, connectionParams).then(() => {
    console.log('Hurrah! MongoDB connection successfully established :)');
}).catch((err) => {
    console.log('Sorry Bro! MongoDB is not connected :(', err);
})