const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secret';

module.exports = (req, res, next) => {
    try {
        const auth = req.headers.authorization;

        if (!auth) {
            return res.status(401).json({
                message: 'Access token required'
            });
        }

        const parts = auth.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                message: 'Invalid Authorization format'
            });
        }

        const token = parts[1];
        const decoded = jwt.verify(token, secret);

        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        };
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};