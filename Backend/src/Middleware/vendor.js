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
        const user = await userrepo.findById(req.user?.id);
        if (!user || !isFlagEnabled(user.isVendor)) {
            return res.status(403).json({ message: 'Vendor access required' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Unable to validate vendor access' });
    }
};
