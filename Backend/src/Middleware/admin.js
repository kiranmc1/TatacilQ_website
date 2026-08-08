const userrepo = require('../repositories/userRepository');

const isFlagEnabled = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
    }
    return false;
};

module.exports = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const user = await userrepo.findById(req.user.id);
        if (!user || !isFlagEnabled(user.isAdmin)) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: 'Unable to validate admin access' });
    }
};
