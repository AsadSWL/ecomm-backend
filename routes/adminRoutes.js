const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');
const branchController = require('../controllers/branchController');
const supplierController = require('../controllers/supplierController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');

const router = express.Router();

// router.get('/admin', authMiddleware, roleMiddleware(['admin']), adminController.adminAccess);

// router.get('/branch', authMiddleware, roleMiddleware(['branch', 'admin']), adminController.branchAccess);

router.post('/create-branch', authMiddleware, roleMiddleware(['admin']), branchController.createBranch);
router.get('/get-branches', authMiddleware, roleMiddleware(['admin']), branchController.getBranches);

router.post('/create-supplier', authMiddleware, roleMiddleware(['admin']), supplierController.createSupplier);
router.get('/get-suppliers', authMiddleware, roleMiddleware(['branch', 'admin']), supplierController.getSupplier);
router.post('/set-holiday', authMiddleware, roleMiddleware(['admin']), supplierController.setHoliday);
router.post('/payment-integration', authMiddleware, roleMiddleware(['admin']), supplierController.paymentIntegration);

router.post('/add-category', authMiddleware, roleMiddleware(['admin']), productController.addCategory);
router.get('/get-categories', authMiddleware, roleMiddleware(['branch', 'admin']), productController.getCategories);
router.post('/add-product', authMiddleware, roleMiddleware(['admin']), productController.addProduct);
router.get('/get-products-by-suppliers/:supplierId', authMiddleware, roleMiddleware(['branch', 'admin']), productController.getProductsBySupplier);

router.post('/place-order', authMiddleware, roleMiddleware(['branch', 'admin']), orderController.placeOrder);
router.get('/get-all-orders', authMiddleware, roleMiddleware(['admin']), orderController.getAllOrders);
router.get('/get-orders-for-suppliers/:supplierId', authMiddleware, roleMiddleware(['admin']), orderController.getOrdersForSupplier);
router.get('/get-orders-for-branch/:branchId', authMiddleware, roleMiddleware(['admin']), orderController.getOrdersForBranch);


module.exports = router;
