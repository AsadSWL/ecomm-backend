const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/admin', authMiddleware, roleMiddleware(['admin']), adminController.adminAccess);

router.get('/branch', authMiddleware, roleMiddleware(['branch', 'admin']), adminController.branchAccess);

module.exports = router;
