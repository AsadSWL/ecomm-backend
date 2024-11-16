const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/category_icons/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/product_images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadProductImage = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size for product image is 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
}).single('image');

const uploadCategoryIcon = multer({
    storage: categoryStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
}).single('image');

exports.addCategory = async (req, res) => {
    uploadCategoryIcon(req, res, async (err) => {
        if (err) {
            res.status(400).json({ status: false, error: err.message });
        }

        const { name } = req.body;
        const imageUrl = req.file ? `/uploads/category_icons/${req.file.filename}` : null;

        try {
            const category = new Category({ name: name, image: imageUrl });
            await category.save();
            res.status(201).json({ status: true, category });
        } catch (error) {
            res.status(500).json({ status: false, error: 'Failed to add category' });
        }
    });
};

exports.updateCategory = async (req, res) => {
    uploadCategoryIcon(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, error: err.message });
        }
        
        const { id, name } = req.body;
        const imageUrl = req.file ? `/uploads/category_icons/${req.file.filename}` : null;

        try {
            const updateData = { name };
            if (imageUrl) {
                updateData.image = imageUrl;
            }

            const category = await Category.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (!category) {
                return res.status(404).json({ status: false, error: 'Category not found' });
            }

            res.status(200).json({ status: true, category });
        } catch (error) {
            res.status(500).json({ status: false, error: 'Failed to update category' });
        }
    });
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ status: true, categories: categories});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get categories' });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find({ _id: req.params.id });
        res.json({ status: true, categories: categories});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get categories' });
    }
};


exports.addProduct = async (req, res) => {
    uploadProductImage(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, error: err.message });
        }

        const { supplier, category, name, sku, price, vat, status, description } = req.body;
        const productImageUrl = req.file ? `/uploads/product_images/${req.file.filename}` : null;

        const payload = {
            supplier: supplier,
            category: category,
            image: productImageUrl,
            name,
            sku,
            price,
            vat,
            status,
            description
        };

        try {
            const product = new Product(payload);

            await product.save();
            res.status(201).json({ status: true, product });
        } catch (error) {
            res.status(500).json({ status: false, error: 'Failed to add product' });
        }
    });
};

exports.updateProduct = async (req, res) => {
    uploadProductImage(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, error: err.message });
        }

        const { id, supplier, category, name, sku, price, vat, status, description } = req.body;
        const productImageUrl = req.file ? `/uploads/product_images/${req.file.filename}` : null;

        try {
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ status: false, error: 'Product not found' });
            }

            product.supplier = supplier;
            product.category = category;
            product.image = productImageUrl || product.image;
            product.name = name;
            product.sku = sku;
            product.price = price;
            product.vat = vat;
            product.status = status;
            product.description = description;

            await product.save();
            res.status(200).json({ status: true, product });
        } catch (error) {
            res.status(500).json({ status: false, error: 'Failed to update product' });
        }
    });
};

exports.getAllProduct = async (req, res) => {
    try {
        const products = await Product.find().populate('supplier', 'name').populate('category', 'name');
        res.json({ status: true, products: products});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get products' });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.find({ _id: req.params.id }).populate('supplier', 'name').populate('category', 'name');
        res.json({ status: true, product});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get products' });
    }
};

exports.getProductsBySupplier = async (req, res) => {
    try {
        const products = await Product.find({ supplier: req.params.supplierId }).populate('supplier', 'name').populate('category', 'name');
        res.json({ status: true, products: products});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get products' });
    }
};