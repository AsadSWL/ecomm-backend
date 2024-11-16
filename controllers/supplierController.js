const Supplier = require('../models/supplierModel');
const Holiday = require('../models/holidayModel');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/supplier_icons/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadSupplierIcon = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
}).single('image');

exports.createSupplier = async (req, res) => {
    uploadSupplierIcon(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, error: err.message });
        }
        const { name, email, streetAddress, city, postcode, deliveryDays, holidays, status } = req.body;
        const imageUrl = req.file ? `/uploads/supplier_icons/${req.file.filename}` : null;

        try {
            const holidayList = holidays.split(',').map(h => h.trim());
            const holidayDates = holidayList
                .filter(item => !isNaN(Date.parse(item)))
                .map(item => new Date(item));

            const holiday = new Holiday({ holidays: holidayDates });
            await holiday.save();

            const address = {
                street: streetAddress,
                city: city,
                postcode: postcode
            }

            const deliveryDaysList = deliveryDays.split(',');

            const supplier = new Supplier({ icon: imageUrl, name: name, email: email, address: address, deliveryDays: deliveryDaysList, holidays: holiday._id, status: status });
            await supplier.save();

            res.status(201).json({ status: true, supplier });
        } catch (error) {
            res.status(500).json({ status: false, error: 'Failed to add supplier' });
        }
    });

};

exports.updateSupplier = async (req, res) => {
    uploadSupplierIcon(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, error: err.message });
        }

        const { id, name, email, streetAddress, city, postcode, deliveryDays, holidays, status } = req.body;
        const imageUrl = req.file ? `/uploads/supplier_icons/${req.file.filename}` : null;

        try {
            const supplier = await Supplier.findById(id);
            if (!supplier) {
                return res.status(404).json({ status: false, error: 'Supplier not found' });
            }

            let holiday;
            if (holidays) {
                const holidayList = holidays.split(',').map(h => h.trim());
                const holidayDates = holidayList
                    .filter(item => !isNaN(Date.parse(item)))
                    .map(item => new Date(item));

                // Create or update the holiday document
                if (supplier.holidays) {
                    holiday = await Holiday.findById(supplier.holidays);
                    holiday.holidays = holidayDates;
                    await holiday.save();
                } else {
                    holiday = new Holiday({ holidays: holidayDates });
                    await holiday.save();
                }
            }

            // Update supplier fields
            supplier.name = name || supplier.name;
            supplier.email = email || supplier.email;
            supplier.address = {
                street: streetAddress || supplier.address.street,
                city: city || supplier.address.city,
                postcode: postcode || supplier.address.postcode
            };
            supplier.deliveryDays = deliveryDays ? deliveryDays.split(',') : supplier.deliveryDays;
            supplier.status = status || supplier.status;
            supplier.icon = imageUrl || supplier.icon;

            await supplier.save();

            res.status(200).json({ status: true, supplier });
        } catch (error) {
            console.error('Error updating supplier:', error);
            res.status(500).json({ status: false, error: 'Failed to update supplier' });
        }
    });
};


exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('holidays');
        res.json({ status: true, suppliers: suppliers });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get suppliers' });
    }
};

exports.getSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.find({ _id: req.params.id }).populate('holidays');
        res.json({ status: true, supplier });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get suppliers' });
    }
};

exports.setHoliday = async (req, res) => {
    const { supplierId, newHolidays } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(supplierId)) {
            throw new Error('Invalid Supplier ID');
        }

        if (!Array.isArray(newHolidays) || !newHolidays.every((date) => !isNaN(new Date(date)))) {
            throw new Error('Invalid holidays format. Must be an array of valid dates.');
        }

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        let holidayDoc;

        if (supplier.holidays) {
            holidayDoc = await Holiday.findByIdAndUpdate(
                supplier.holidays,
                { holidays: newHolidays },
                { new: true }
            );
        } else {
            holidayDoc = new Holiday({ holidays: newHolidays });
            await holidayDoc.save();

            supplier.holidays = holidayDoc._id;
            await supplier.save();
        }

        console.log('Holidays updated successfully:', holidayDoc);
        res.json({ status: true, holiday: holidayDoc });
    } catch (error) {
        console.error('Error updating supplier holidays:', error);
        res.status(500).json({ status: false, error: 'Failed to create holiday' });
    }
};