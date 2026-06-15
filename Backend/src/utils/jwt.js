const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secret';
const expiresIn = '1h';

exports.generateToken = (payload) => {
    return jwt.sign(payload, secret, { expiresIn });
};

exports.verifyToken = (token) => {
    return jwt.verify(token, secret);
};