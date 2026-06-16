const bcrypt = require('bcrypt');
const userrepo = require('../repositories/userRepository');

exports.login = async (email, password) => {
    const user = await userrepo.findByEmail(email);

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const { _id, password: _, ...rest } = user;
    return {
        id: _id ? _id.toString() : rest.id,
        ...rest
    };
};

exports.register = async (email, password, extra = {}) => {
    const existingUser = await userrepo.findByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userrepo.createUser({
        email,
        password: hashedPassword,
        ...extra
    });

    return newUser;
};

exports.getDashboard = async (userid, loggedinuser) => {
    if (
        String(userid) !== String(loggedinuser.id) &&
        loggedinuser.role !== 'admin'
    ) {
        throw new Error('Forbidden');
    }

    return await userrepo.getDashboardData(userid);
};

exports.getAllCategories = async () => {
    return await userrepo.getAllCategories();
};

exports.getAllHomeProducts = async () => {
    return await userrepo.getAllHomeProducts();
};

