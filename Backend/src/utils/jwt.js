const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const expiresIn = '1h';

if (!secret) {
    throw new Error('JWT_SECRET is not configured');
}

exports.generateToken = (payload) => {
    return jwt.sign(payload, secret, { expiresIn });
};

exports.verifyToken = (token) => {
    return jwt.verify(token, secret);
};