const Order = require('../models/orderModel');
const Supplier = require('../models/supplierModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

exports.adminAccess = (req, res) => {
    res.status(200).json({ message: 'Welcome Admin' });
};

exports.branchAccess = (req, res) => {
    res.status(200).json({ message: 'Welcome Branch' });
};

exports.getDashboardStats = async (req, res) => {
    try {
        const suppliers = await Supplier.countDocuments();
        const branches = await User.find({ role: 'branch' }).countDocuments();
        const orders = await Order.countDocuments();
        const products = await Product.countDocuments();
        const sales = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSum: { $sum: "$totalPrice" }
                }
            }
        ]);
        
        const stats = {
            "suppliers": suppliers,
            "branches": branches,
            "orders": orders,
            "products": products,
            "sales": sales.length > 0 ? sales[0].totalSum : 0,
        }

        res.status(201).json({ status: true, stats: stats });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get stats' });
    }
}