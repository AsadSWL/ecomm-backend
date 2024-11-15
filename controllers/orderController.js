const Order = require('../models/orderModel');
const Supplier = require('../models/supplierModel');
const Product = require('../models/productModel');

exports.placeOrder = async (req, res) => {
    const { branchId, supplierId, products, deliveryAddress } = req.body;

    try {
        const supplier = await Supplier.findById(supplierId);

        if (!supplier.deliveryAreas.includes(deliveryAddress)) {
            return res.status(400).json({ error: 'Supplier does not deliver to this area' });
        }

        let totalPrice = 0;
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (product) {
                totalPrice += product.price * item.quantity;
            } else {
                return res.status(404).json({ error: `Product with ID ${item.product} not found` });
            }
        }

        const order = new Order({ branch: branchId, supplier: supplierId, products, totalPrice, deliveryAddress });
        await order.save();

        res.status(201).json({ status: true, order: order});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to create order' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
          .populate('branch', 'firstname lastname email address')
          .populate('supplier', 'name email address')
          .populate('products.product', 'name price');
    
        res.json({ status: true, orders: orders});
      } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
      }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.find({ _id: req.params.id })
            .populate('branch', 'firstname lastname email address')
            .populate('supplier', 'name email address')
            .populate('products.product', 'name price category');
            
        res.json({ status: true, order: order});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};

exports.getOrdersForSupplier = async (req, res) => {
    try {
        const orders = await Order.find({ supplier: req.params.supplierId }).populate('branch products.product');
        res.json({ status: true, orders: orders});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};

exports.getOrdersForBranch = async (req, res) => {
    try {
        const orders = await Order.find({ branch: req.params.branchId }).populate('supplier products.product');
        res.json({ status: true, orders: orders});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};