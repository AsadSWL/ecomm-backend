const Order = require('../models/orderModel');
const Supplier = require('../models/supplierModel');
const Product = require('../models/productModel');

exports.placeOrder = async (req, res) => {
    const { branchId, products, deliveryDate } = req.body;

    try {

        let totalPrice = 0;
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (product) {
                totalPrice += product.price * item.quantity;
            } else {
                return res.status(404).json({ error: `Product with ID ${item.product} not found` });
            }
        }

        const order = new Order({ branch: branchId, products, totalPrice, deliveryDate });
        await order.save();

        res.status(201).json({ status: true, order: order });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to create order' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('branch', 'firstname lastname email address paymentMethod')
            .populate('products.product', 'supplier category image name sku price vat');

        res.json({ status: true, orders: orders });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.find({ _id: req.params.id })
            .populate('branch', 'firstname lastname email address paymentMethod')
            .populate('products.product', 'supplier category image name sku price vat');

        res.json({ status: true, order: order });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};

exports.getOrdersForSuppliers = async (req, res) => {
    try {
        const groupedOrders = await Order.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            {
                $unwind: '$productDetails',
            },
            {
                $group: {
                    _id: '$productDetails.supplier',
                    orders: {
                        $push: {
                            _id: '$_id',
                            branch: '$branch',
                            totalPrice: '$totalPrice',
                            deliveryDate: '$deliveryDate',
                            status: '$status',
                            createdAt: '$createdAt',
                        },
                    },
                    totalOrderValue: { $sum: '$totalPrice' },
                },
            },
            {
                $lookup: {
                    from: 'suppliers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'supplierDetails',
                },
            },
        ]);

        res.json({ status: true, orders: groupedOrders });
    } catch (error) {
        console.error('Error grouping orders by supplier:', error);
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};

exports.getOrdersBySupplier = async (req, res) => {
    try {
        const orders = await Order.aggregate([
          {
            $lookup: {
              from: 'products',
              localField: 'products.product',
              foreignField: '_id',
              as: 'productDetails',
            },
          },
          {
            $match: {
              'productDetails.supplier': mongoose.Types.ObjectId(req.params.supplierId),
            },
          },
          {
            $project: {
              branch: 1,
              totalPrice: 1,
              deliveryDate: 1,
              status: 1,
              createdAt: 1,
              products: {
                $filter: {
                  input: '$productDetails',
                  as: 'product',
                  cond: { $eq: ['$$product.supplier', mongoose.Types.ObjectId(req.params.supplierId)] },
                },
              },
            },
          },
        ]);
    
        res.json({ status: true, order: orders });
      } catch (error) {
        console.error('Error fetching orders by supplier:', error);
        res.status(500).json({ status: false, error: 'Failed to get orders' });
      }
};

exports.getOrdersForBranch = async (req, res) => {
    try {
        const orders = await Order.find({ branch: req.params.branchId }).populate('supplier products.product');
        res.json({ status: true, orders: orders });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};