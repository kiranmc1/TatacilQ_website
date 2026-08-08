const { ObjectId } = require('mongodb');
const { connectDb } = require('../config/db');

const toUserPayload = (user) => {
    if (!user) return null;

    const { _id, password, ...rest } = user;
    return {
        id: _id ? _id.toString() : rest.id,
        ...rest
    };
};

exports.findById = async (id) => {
    const db = await connectDb();

    const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { id };

    const user = await db.collection('Users').findOne(query);
    return toUserPayload(user);
};

exports.findByEmail = async (email) => {
    const db = await connectDb();
    return await db.collection('Users').findOne({ email });
};

exports.findByPhone = async (phone) => {
    const db = await connectDb();
    return await db.collection('Users').findOne({ phone });
};

exports.saveOtp = async ({ method, value, code, expiresAt }) => {
    const db = await connectDb();
    const result = await db.collection('Otps').insertOne({
        method,
        value,
        code,
        expiresAt,
        used: false,
        createdAt: new Date()
    });
    return result.insertedId;
};

exports.getValidOtp = async ({ method, value, code }) => {
    const db = await connectDb();
    return await db.collection('Otps').findOne({
        method,
        value,
        code,
        used: false,
        expiresAt: { $gt: new Date() }
    });
};

exports.markOtpUsed = async (otpId) => {
    const db = await connectDb();
    await db.collection('Otps').updateOne(
        { _id: otpId },
        { $set: { used: true, usedAt: new Date() } }
    );
};

exports.createUser = async (userData) => {
    const db = await connectDb();
    const result = await db.collection('Users').insertOne(userData);
    const createdUser = await db.collection('Users').findOne({ _id: result.insertedId });
    return toUserPayload(createdUser);
};

exports.getDashboardData = async (userId) => {
    const db = await connectDb();

    const user = await db.collection('Users').findOne({
        _id: new ObjectId(userId)
    });

    const totalProducts = await db.collection('products').countDocuments();
    const recentProducts = await db.collection('products')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ _id: 1, name: 1, price: 1, image: 1, categoryId: 1, brandId: 1, createdAt: 1 })
        .toArray();

    return {
        user: toUserPayload(user),
        stats: {
            totalProducts,
            totalCategories: await db.collection('Categories').countDocuments()
        },
        recentProducts
    };
};

exports.getAllCategories = async () => {
    const db = await connectDb();

    const categories = await db.collection('Categories')
        .find({})
        .project({ _id: 1, name: 1, imageUrl: 1 })
        .toArray();

    return categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        imageUrl: category.imageUrl
    }));
};

exports.getAllBrands = async () => {
    const db = await connectDb();

    const brands = await db.collection('Brands')
        .find({})
        .project({ _id: 1, name: 1 })
        .toArray();

    return brands.map((brand) => ({
        id: brand._id.toString(),
        name: brand.name
    }));
};

exports.getAllHomeProducts = async () => {
    const db = await connectDb();

    const products = await db.collection('Products')
        .find({ approved: true, display: 1 })
        .sort({ createdAt: -1 })
        .project({ _id: 1, name: 1, price: 1, image: 1, categoryId: 1, brandId: 1, createdAt: 1 })
        .toArray();

    return products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        image: product.image,
        categoryId: product.categoryId ? product.categoryId.toString() : null,
        brandId: product.brandId ? product.brandId.toString() : null,
        createdAt: product.createdAt
    }));
};

const normalizeProduct = (product) => {
    if (!product) return null;

    const sourceId = product._id ? product._id.toString() : null;

    return {
        ...product,
        id: product.id ?? sourceId,
        _id: sourceId,
        image: product.image || (Array.isArray(product.images) ? product.images[0] : null),
        images: Array.isArray(product.images)
            ? product.images
            : product.image
                ? [product.image]
                : [],
        originalPrice: product.originalPrice ?? product.price ?? 0,
        salePrice: product.salePrice ?? product.price ?? 0,
        discount: product.discount ?? 0,
        ratings: product.ratings ?? 0,
        reviews: product.reviews ?? 0,
        offers: Array.isArray(product.offers)
            ? product.offers
            : product.offer
                ? [product.offer]
                : [],
        ratingText: product.ratingText || '',
        categoryid: product.categoryid ?? product.categoryId ?? null,
        categoryId: product.categoryid ?? product.categoryId ?? null,
        display: product.display != null ? product.display : (product.approved ? 1 : 0),
    };
};

exports.getProducts = async (categoryId) => {
    const db = await connectDb();

    const query = categoryId ? { categoryid: categoryId, approved: true, display: 1 } : { approved: true, display: 1 };
    const products = await db.collection('Products').find(query).toArray();

    return products.map(normalizeProduct);
};

exports.getProductsByVendor = async (vendorId) => {
    const db = await connectDb();
    const products = await db.collection('Products').find({ vendorId }).sort({ submittedAt: -1 }).toArray();
    return products.map(normalizeProduct);
};

exports.getPendingVendorProducts = async () => {
    const db = await connectDb();
    const products = await db.collection('Products')
        .find({ approved: false, status: 'pending' })
        .sort({ submittedAt: -1 })
        .toArray();
    return products.map(normalizeProduct);
};

exports.approveProductById = async (productId, adminId) => {
    const db = await connectDb();
    
    // First, find the product to verify it exists and is pending
    let findQuery;
    if (ObjectId.isValid(productId)) {
        findQuery = { $or: [{ _id: new ObjectId(productId) }, { id: productId }] };
    } else {
        findQuery = { $or: [{ id: productId }, { id: Number(productId) }] };
    }

    const existingProduct = await db.collection('Products').findOne(findQuery);
    
    if (!existingProduct) {
        throw new Error('Not Found');
    }

    // Verify it's actually pending before approving
    if (existingProduct.approved || existingProduct.status !== 'pending') {
        throw new Error('Product is not pending approval');
    }

    // Now approve it
    const result = await db.collection('Products').findOneAndUpdate(
        findQuery,
        {
            $set: {
                approved: true,
                status: 'approved',
                display: 1,
                approvedAt: new Date(),
                approvedBy: adminId,
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    if (!result.value) {
        throw new Error('Not Found');
    }

    return normalizeProduct(result.value);
};

exports.getProductById = async (productId) => {
    const db = await connectDb();

    const query = ObjectId.isValid(productId)
        ? { $or: [{ _id: new ObjectId(productId) }, { id: productId }, { id: Number(productId) }] }
        : { $or: [{ id: productId }, { id: Number(productId) }] };

    const product = await db.collection('Products').findOne(query);
    return normalizeProduct(product);
};

exports.findCategoryByName = async (name) => {
    const db = await connectDb();
    const normalizedName = (name || '').trim();

    if (!normalizedName) {
        return null;
    }

    return await db.collection('Categories').findOne({
        name: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
};

exports.createProduct = async (productData) => {
    const db = await connectDb();
    const now = new Date();
    const nextId = (await db.collection('Products').countDocuments()) + 1;

    const result = await db.collection('Products').insertOne({
        ...productData,
        id: nextId,
        createdAt: now,
        updatedAt: now
    });

    const product = await db.collection('Products').findOne({ _id: result.insertedId });
    return normalizeProduct(product);
};

exports.updateProduct = async (productId, updates) => {
    const db = await connectDb();

    const result = await db.collection('Products').findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );

    if (!result.value) {
        throw new Error('Not Found');
    }

    const product = result.value;
    return {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        categoryId: product.categoryId ? product.categoryId.toString() : null,
        brandId: product.brandId ? product.brandId.toString() : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };
};

exports.deleteProduct = async (productId) => {
    const db = await connectDb();
    const result = await db.collection('Products').deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount !== 1) {
        throw new Error('Not Found');
    }
};

exports.createCategory = async (categoryData) => {
    const db = await connectDb();
    const now = new Date();

    const result = await db.collection('Categories').insertOne({
        ...categoryData,
        createdAt: now,
        updatedAt: now
    });

    const category = await db.collection('Categories').findOne({ _id: result.insertedId });
    return {
        id: category._id.toString(),
        name: category.name,
        imageUrl: category.imageUrl,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    };
};

exports.updateCategory = async (categoryId, updates) => {
    const db = await connectDb();

    const result = await db.collection('Categories').findOneAndUpdate(
        { _id: new ObjectId(categoryId) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );

    if (!result.value) {
        throw new Error('Not Found');
    }

    const category = result.value;
    return {
        id: category._id.toString(),
        name: category.name,
        imageUrl: category.imageUrl,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    };
};

exports.deleteCategory = async (categoryId) => {
    const db = await connectDb();
    const result = await db.collection('Categories').deleteOne({ _id: new ObjectId(categoryId) });

    if (result.deletedCount !== 1) {
        throw new Error('Not Found');
    }
};

exports.createBrand = async (brandData) => {
    const db = await connectDb();
    const now = new Date();

    const result = await db.collection('Brands').insertOne({
        ...brandData,
        createdAt: now,
        updatedAt: now
    });

    const brand = await db.collection('Brands').findOne({ _id: result.insertedId });
    return {
        id: brand._id.toString(),
        name: brand.name,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt
    };
};

exports.updateBrand = async (brandId, updates) => {
    const db = await connectDb();

    const result = await db.collection('Brands').findOneAndUpdate(
        { _id: new ObjectId(brandId) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );

    if (!result.value) {
        throw new Error('Not Found');
    }

    const brand = result.value;
    return {
        id: brand._id.toString(),
        name: brand.name,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt
    };
};

exports.deleteBrand = async (brandId) => {
    const db = await connectDb();
    const result = await db.collection('Brands').deleteOne({ _id: new ObjectId(brandId) });

    if (result.deletedCount !== 1) {
        throw new Error('Not Found');
    }
};