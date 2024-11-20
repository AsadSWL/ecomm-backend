const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

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
            .populate({
                path: 'products.product',
                populate: {
                    path: 'supplier',
                    select: 'name email phone address' // Select supplier fields you want to include
                }
            })
            .populate('products.product.category', 'name description'); // Optional: Populate category if needed

        res.json({ status: true, order });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};

exports.getOrdersBySupplier = async (req, res) => {
    try {
        const supplierId = new mongoose.Types.ObjectId(req.params.supplierId);

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
                $lookup: {
                    from: 'users',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branchDetails',
                },
            },
            {
                $match: {
                    'productDetails.supplier': supplierId,
                },
            },
            {
                $project: {
                    branch: '$branchDetails',
                    totalPrice: 1,
                    deliveryDate: 1,
                    status: 1,
                    createdAt: 1,
                    products: {
                        $filter: {
                            input: '$productDetails',
                            as: 'product',
                            cond: { $eq: ['$$product.supplier', supplierId] },
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

// exports.getOrdersBySupplier = async (req, res) => {
//     try {
//         const supplierId = new mongoose.Types.ObjectId(req.params.supplierId);

//         const orders = await Order.aggregate([
//             // Lookup products
//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "products.product",
//                     foreignField: "_id",
//                     as: "productDetails",
//                 },
//             },

//             // Lookup branches
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "branch",
//                     foreignField: "_id",
//                     as: "branchDetails",
//                 },
//             },

//             // Add a field with filtered products by the supplier
//             {
//                 $addFields: {
//                     filteredProducts: {
//                         $filter: {
//                             input: "$productDetails",
//                             as: "product",
//                             cond: { $eq: ["$$product.supplier", supplierId] },
//                         },
//                     },
//                 },
//             },

//             // Match orders with at least one product from the supplier
//             {
//                 $match: {
//                     filteredProducts: { $ne: [] },
//                 },
//             },

//             // Format the response
//             {
//                 $project: {
//                     branch: "$branchDetails",
//                     totalPrice: 1,
//                     deliveryDate: 1,
//                     status: 1,
//                     createdAt: 1,
//                     products: {
//                         $map: {
//                             input: "$filteredProducts",
//                             as: "product",
//                             in: {
//                                 product: "$$product._id",
//                                 name: "$$product.name",
//                                 price: "$$product.price",
//                                 quantity: {
//                                     $arrayElemAt: [
//                                         "$products.quantity",
//                                         { $indexOfArray: ["$products.product", "$$product._id"] },
//                                     ],
//                                 },
//                             },
//                         },
//                     },
//                 },
//             },
//         ]);

//         res.json({ status: true, orders });
//     } catch (error) {
//         console.error("Error fetching orders by supplier:", error);
//         res.status(500).json({ status: false, error: "Failed to get orders" });
//     }
// };


exports.getSupplierOrder = async (req, res) => {
    try {
        const supplierId = new mongoose.Types.ObjectId(req.params.supplierId);
        const orderId = new mongoose.Types.ObjectId(req.params.orderId);

        const orderDetails = await Order.aggregate([
            { $match: { _id: orderId } },

            { $unwind: "$products" },

            {
                $lookup: {
                    from: "products", 
                    localField: "products.product",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },

            { $unwind: "$productDetails" },

            { $match: { "productDetails.supplier": supplierId } },

            {
                $lookup: {
                    from: "users",
                    localField: "branch",
                    foreignField: "_id",
                    as: "branchDetails",
                },
            },

            { $unwind: "$branchDetails" },

            {
                $group: {
                    _id: "$_id",
                    branch: { $first: "$branchDetails" },
                    deliveryDate: { $first: "$deliveryDate" },
                    status: { $first: "$status" },
                    createdAt: { $first: "$createdAt" },
                    totalPrice: { $first: "$totalPrice" },
                    products: {
                        $push: {
                            product: "$products.product",
                            quantity: "$products.quantity",
                            details: "$productDetails",
                        },
                    },
                },
            },
        ]);


        res.json({ status: true, order: orderDetails.length ? orderDetails[0] : [] });
    } catch (error) {
        console.error('Error fetching orders by supplier:', error);
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};

exports.getOrdersForBranch = async (req, res) => {
    try {
        const order = await Order.find({ branch: req.params.branchId })
            .populate('branch', 'firstname email address paymentMethod')
            .populate({
                path: 'products.product',
                populate: {
                    path: 'supplier',
                    select: 'name email phone address'
                }
            })
            .populate('products.product.category', 'name description');

        res.json({ status: true, order });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get orders' });
    }
};