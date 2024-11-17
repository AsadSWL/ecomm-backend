const Order = require('../models/orderModel');
const Supplier = require('../models/supplierModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.adminAccess = (req, res) => {
    res.status(200).json({ message: 'Welcome Admin' });
};

exports.branchAccess = (req, res) => {
    res.status(200).json({ message: 'Welcome Branch' });
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, email } = req.body;
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate(userId, { firstname, lastname, email }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const authPayload = {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(authPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile.' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        
        const isMatch = await user.isPasswordMatch(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password.' });
    }
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