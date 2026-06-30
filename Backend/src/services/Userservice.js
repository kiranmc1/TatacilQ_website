const bcrypt = require('bcrypt');
const userrepo = require('../repositories/userRepository');
const notification = require('../utils/notification');

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

    try {
        await notification.sendOtpNotification({ email, phone, code });
        return { message: 'OTP has been sent' };
    } catch (err) {
        // If notification provider is not configured (dev environment), fall back
        // to returning the OTP so frontend can continue during development.
        console.warn('OTP delivery failed, falling back to development mode:', err.message);
        return { code, method, value, warning: 'notification_failed' };
    }
};

const getUsernameFromEmail = (email, phone) => {
    if (email) {
        const namePart = email.split('@')[0] || '';
        return namePart.replace(/[^a-zA-Z0-9._-]/g, '') || namePart;
    }
    return phone ? phone.toString() : undefined;
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
        user = await userrepo.createUser({
            email,
            phone,
            username: getUsernameFromEmail(email, phone),
            createdAt: new Date()
        });
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
        username: extra.username || getUsernameFromEmail(email, phone),
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

exports.getCurrentUser = async (userId) => {
    const user = await userrepo.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

exports.getAllCategories = async () => {
    return await userrepo.getAllCategories();
};

exports.getAllBrands = async () => {
    return await userrepo.getAllBrands();
};

exports.getAllHomeProducts = async () => {
    return await userrepo.getAllHomeProducts();
};

exports.getProducts = async (categoryId) => {
    return await userrepo.getProducts(categoryId);
};

exports.getProductById = async (productId) => {
    return await userrepo.getProductById(productId);
};

exports.createProduct = async (productData) => {
    const normalized = { ...productData };

    if (normalized.categoryName) {
        const category = await userrepo.findCategoryByName(normalized.categoryName);
        if (!category) {
            throw new Error('Category not found');
        }
        normalized.categoryid = category.id || category._id?.toString();
        delete normalized.categoryName;
    }

    if (!normalized.categoryid && normalized.categoryId) {
        normalized.categoryid = normalized.categoryId;
    }

    if (normalized.originalPrice == null && normalized.salePrice != null) {
        normalized.originalPrice = normalized.salePrice;
    }

    if (normalized.salePrice == null && normalized.originalPrice != null) {
        normalized.salePrice = normalized.originalPrice;
    }

    if (normalized.discount == null && normalized.originalPrice && normalized.salePrice) {
        normalized.discount = Math.round(((normalized.originalPrice - normalized.salePrice) / normalized.originalPrice) * 100) || 0;
    }

    if (normalized.approved == null) {
        normalized.approved = normalized.vendorId ? false : true;
    }

    if (!normalized.status) {
        normalized.status = normalized.vendorId ? 'pending' : 'approved';
    }

    if (normalized.display == null) {
        normalized.display = normalized.approved ? 1 : 0;
    }

    if (normalized.vendorId && !normalized.submittedAt) {
        normalized.submittedAt = new Date();
    }

    return await userrepo.createProduct(normalized);
};

exports.submitVendorProduct = async (productData) => {
    return await exports.createProduct({
        ...productData,
        approved: false,
        status: 'pending',
        submittedAt: new Date(),
    });
};

exports.getVendorProducts = async (vendorId) => {
    return await userrepo.getProductsByVendor(vendorId);
};

exports.getPendingVendorProducts = async () => {
    return await userrepo.getPendingVendorProducts();
};

exports.approveVendorProduct = async (productId, adminId) => {
    return await userrepo.approveProductById(productId, adminId);
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

