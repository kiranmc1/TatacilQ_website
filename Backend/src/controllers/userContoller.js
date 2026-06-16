const userService = require('../services/Userservice');
const jwtUtils = require('../utils/jwt');

exports.register = async (req, res) => {
    try {
        const { email, password, isAdmin = false } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const user = await userService.register(email, password, { isAdmin });
        res.status(201).json({ user });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to register user' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const user = await userService.login(email, password);

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

exports.getAllHomeProducts = async (req, res) => {
    try {
        const products = await userService.getAllHomeProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Failed to fetch products'
        });
    }
};