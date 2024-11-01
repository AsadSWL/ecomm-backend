const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

exports.addCategory = async (req, res) => {
    const { name, image } = req.body;

    try {
        const category = new Category({ name: name, image, image });
        await category.save();
        res.status(201).json({ status: true, category: category});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to add category' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ status: true, categories: categories});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get categories' });
    }
};

exports.addProduct = async (req, res) => {
    const { supplierId, categoryId, name, description, price, stock } = req.body;

    try {
        const product = new Product({ supplier: supplierId, category: categoryId, name, description, price, stock });
        await product.save();
        res.status(201).json({ status: true, product: product});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to add product' });
    }
};

exports.getProductsBySupplier = async (req, res) => {
    try {
        const products = await Product.find({ supplier: req.params.supplierId });
        res.json({ status: true, products: products});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get products' });
    }
};
