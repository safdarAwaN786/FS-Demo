const jwt = require('jsonwebtoken');
const User = require('../models/AccountCreation/UserModel');
require('dotenv').config()

const attachUserToRequest = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '');
        const decoded = jwt.verify(token, process.env.securitycode); 
        const user = await User.findById(decoded.user.id);

        if (!user) {
            throw new Error();
        }

        req.token = token
        req.user = user; // Attach the user object to the request
        next();
    } catch (e) {
        console.log(e);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = attachUserToRequest;