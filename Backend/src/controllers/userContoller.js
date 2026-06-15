const userService = require('../services/Userservice');
const jwtUtils = require('../utils/jwt');

exports.login = async (req, res) => {
    try {
        const { id, email } = req.body;

        if (!id || !email) {
            return res.status(400).json({ message: 'id and email are required' });
        }

        const user = await userService.login(id, email);

        const token = jwtUtils.generateToken({
            id: user.id,
            email: user.email,
            role: user.isAdmin ? 'admin' : 'user'
        });

        res.json({ token });
    } catch (err) {
        res.status(401).json({ message: err.message || 'Invalid credentials' });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const result = await userService.getDashboard(req.params.id, req.user);
        res.json(result);
    } catch (err) {
        res.status(err.message === 'Forbidden' ? 403 : 500).json({
            message: err.message || 'Failed to fetch dashboard data'
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await userService.getAllCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Failed to fetch categories'
        });
    }
};