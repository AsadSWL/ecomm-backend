const Supplier = require('../models/supplierModel');
const Holiday = require('../models/holidayModel');

exports.createSupplier = async (req, res) => {
    const { icon, name, email, address, deliveryDays, holidays, status } = req.body;

    try {
        const holiday = new Holiday({ holidays });
        await holiday.save();

        const supplier = new Supplier({ icon: icon, name: name, email: email, address: address, deliveryDays: deliveryDays, holidays: holiday._id, status: status });
        await supplier.save();
        res.status(201).json({ status: true, supplier: supplier });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to create supplier' });
    }
};

exports.getSupplier = async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('holidays');
        res.json({ status: true, suppliers: suppliers });
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