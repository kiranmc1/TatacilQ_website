const userService = require('../services/Userservice');
const jwtUtils = require('../utils/jwt');

const isFlagEnabled = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
    }
    return false;
};

exports.register = async (req, res) => {
    try {
        const { email, phone, isAdmin = false } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const user = await userService.register(email, phone, { isAdmin });
        res.status(201).json({ user });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to register user' });
    }
};

exports.sendOtp = async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }

        const otp = await userService.sendOtp({ email, phone });
        res.json({ message: 'OTP sent', otp });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to send OTP' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, phone, code } = req.body;
        if ((!email && !phone) || !code) {
            return res.status(400).json({ message: 'Email/phone and OTP code are required' });
        }

        const user = await userService.verifyOtp({ email, phone, code });
        const token = jwtUtils.generateToken({
            id: user.id,
            email: user.email,
            role: isFlagEnabled(user.isAdmin) ? 'admin' : isFlagEnabled(user.isVendor) ? 'vendor' : 'user'
        });

        res.json({ token, user });
    } catch (err) {
        res.status(401).json({ message: err.message || 'Invalid OTP' });
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
            role: isFlagEnabled(user.isAdmin) ? 'admin' : isFlagEnabled(user.isVendor) ? 'vendor' : 'user'
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

exports.getMe = async (req, res) => {
    try {
        const user = await userService.getCurrentUser(req.user.id);
        res.json({ user });
    } catch (err) {
        res.status(404).json({ message: err.message || 'User not found' });
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

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await userService.getAllBrands();
        res.json(brands);
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Failed to fetch brands'
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

exports.getProducts = async (req, res) => {
    try {
        const products = await userService.getProducts(req.query.categoryId);
        res.json(products);
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Failed to fetch products'
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await userService.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Failed to fetch product'
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            categoryName,
            categoryId,
            categoryid,
            originalPrice,
            salePrice,
            discount,
            ratings,
            reviews,
            offers,
            ratingText,
            images,
            price,
            image,
            description,
        } = req.body;

        if (!name || !brand || (!categoryName && !categoryId && !categoryid)) {
            return res.status(400).json({ message: 'name, brand, and a category are required' });
        }

        const product = await userService.createProduct({
            ...req.body,
            name,
            brand,
            categoryName,
            categoryId: categoryId || categoryid,
            originalPrice: originalPrice ?? price ?? salePrice ?? 0,
            salePrice: salePrice ?? price ?? originalPrice ?? 0,
            discount: discount ?? 0,
            ratings: ratings ?? 0,
            reviews: reviews ?? 0,
            offers: offers ?? [],
            ratingText: ratingText ?? '',
            images: images ?? (image ? [image] : []),
            description: description ?? '',
            approved: true,
            vendorId: null,
            status: 'approved',
            display: 1
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to create product' });
    }
};

exports.submitVendorProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            categoryName,
            categoryId,
            categoryid,
            originalPrice,
            salePrice,
            discount,
            ratings,
            reviews,
            offers,
            ratingText,
            images,
            price,
            image,
            description,
        } = req.body;

        if (!name || !brand || (!categoryName && !categoryId && !categoryid)) {
            return res.status(400).json({ message: 'name, brand, and a category are required' });
        }

        const product = await userService.submitVendorProduct({
            ...req.body,
            name,
            brand,
            categoryName,
            categoryId: categoryId || categoryid,
            originalPrice: originalPrice ?? price ?? salePrice ?? 0,
            salePrice: salePrice ?? price ?? originalPrice ?? 0,
            discount: discount ?? 0,
            ratings: ratings ?? 0,
            reviews: reviews ?? 0,
            offers: offers ?? [],
            ratingText: ratingText ?? '',
            images: images ?? (image ? [image] : []),
            description: description ?? '',
            vendorId: req.user.id,
            approved: false,
            status: 'pending',
            display: 0
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to submit vendor product' });
    }
};

exports.getVendorProducts = async (req, res) => {
    try {
        const products = await userService.getVendorProducts(req.user.id);
        res.json(products);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to retrieve vendor products' });
    }
};

exports.getPendingVendorProducts = async (req, res) => {
    try {
        const products = await userService.getPendingVendorProducts();
        res.json(products);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to retrieve pending products' });
    }
};

exports.approveVendorProduct = async (req, res) => {
    try {
        const product = await userService.approveVendorProduct(req.params.id, req.user.id);
        res.json(product);
    } catch (err) {
        res.status(err.message === 'Not Found' ? 404 : 400).json({ message: err.message || 'Unable to approve vendor product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await userService.updateProduct(req.params.id, req.body);
        res.json(product);
    } catch (err) {
        res.status(err.message === 'Not Found' ? 404 : 400).json({ message: err.message || 'Unable to update product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await userService.deleteProduct(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(err.message === 'Not Found' ? 404 : 400).json({ message: err.message || 'Unable to delete product' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, imageUrl } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'name is required' });
        }

        const category = await userService.createCategory({ name, imageUrl });
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to create category' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await userService.updateCategory(req.params.id, req.body);
        res.json(category);
    } catch (err) {
        res.status(err.message === 'Not Found' ? 404 : 400).json({ message: err.message || 'Unable to update category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await userService.deleteCategory(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(err.message === 'Not Found' ? 404 : 400).json({ message: err.message || 'Unable to delete category' });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'name is required' });
        }

        const brand = await userService.createBrand({ name });
        res.status(201).json(brand);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to create brand' });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const brand = await userService.updateBrand(req.params.id, req.body);
        res.json(brand);
    } catch (err) {
        res.status(err.message === 'Not Found' ? 404 : 400).json({ message: err.message || 'Unable to update brand' });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        await userService.deleteBrand(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(err.message === 'Not Found' ? 404 : 400).json({ message: err.message || 'Unable to delete brand' });
    }
};