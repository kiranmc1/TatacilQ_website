const userrepo = require('../repositories/userRepository');

exports.login = async (id, email) => {
    const user = await userrepo.findById(id);

    if (!user || user.email !== email) {
        throw new Error('Invalid credentials');
    }

    return user;
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

