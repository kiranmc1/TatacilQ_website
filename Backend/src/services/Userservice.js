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

exports.sendOtp = async ({ email, phone }) => {
    const method = email ? 'email' : 'phone';
    const value = email || phone;

    if (!value) {
        throw new Error('Email or phone is required to send OTP');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await userrepo.saveOtp({ method, value, code, expiresAt });

    // In a real app send SMS/email here. For development return the OTP.
    return { code, method, value };
};

exports.verifyOtp = async ({ email, phone, code }) => {
    const method = email ? 'email' : 'phone';
    const value = email || phone;

    if (!value || !code) {
        throw new Error('Email/phone and OTP code are required');
    }

    const otpRecord = await userrepo.getValidOtp({ method, value, code });
    if (!otpRecord) {
        throw new Error('Invalid or expired OTP');
    }

    await userrepo.markOtpUsed(otpRecord._id);

    let user = null;
    if (email) {
        user = await userrepo.findByEmail(email);
    } else {
        user = await userrepo.findByPhone(phone);
    }

    if (!user) {
        user = await userrepo.createUser({ email, phone, createdAt: new Date() });
    }

    const { _id, password: _, ...rest } = user;
    return {
        id: _id ? _id.toString() : rest.id,
        ...rest
    };
};

exports.register = async (email, phone, extra = {}) => {
    const existingUser = await userrepo.findByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const newUser = await userrepo.createUser({
        email,
        phone,
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

exports.createProduct = async (productData) => {
    return await userrepo.createProduct(productData);
};

exports.updateProduct = async (productId, updates) => {
    return await userrepo.updateProduct(productId, updates);
};

exports.deleteProduct = async (productId) => {
    return await userrepo.deleteProduct(productId);
};

exports.createCategory = async (categoryData) => {
    return await userrepo.createCategory(categoryData);
};

exports.updateCategory = async (categoryId, updates) => {
    return await userrepo.updateCategory(categoryId, updates);
};

exports.deleteCategory = async (categoryId) => {
    return await userrepo.deleteCategory(categoryId);
};

exports.createBrand = async (brandData) => {
    return await userrepo.createBrand(brandData);
};

exports.updateBrand = async (brandId, updates) => {
    return await userrepo.updateBrand(brandId, updates);
};

exports.deleteBrand = async (brandId) => {
    return await userrepo.deleteBrand(brandId);
};

