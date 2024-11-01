const Supplier = require('../models/supplierModel');
const Holiday = require('../models/holidayModel');
const Integration = require('../models/integrationModel');

exports.createSupplier = async (req, res) => {
    const { name, email, address, deliveryAreas } = req.body;

    try {
        const supplier = new Supplier({ name, email, address, deliveryAreas });
        await supplier.save();
        res.status(201).json({ status: true, supplier: supplier });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to create supplier' });
    }
};

exports.getSupplier = async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('holidays paymentIntegration');
        res.json({ status: true, suppliers: suppliers });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get suppliers' });
    }
};

exports.setHoliday = async (req, res) => {
    const { supplierId, holidays } = req.body;

    try {
        const holiday = new Holiday({ supplier: supplierId, holidays });
        await holiday.save();

        await Supplier.findByIdAndUpdate(supplierId, { holidays: holiday._id });

        res.status(201).json({ status: true, holiday: holiday});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to create holiday' });
    }
};

exports.paymentIntegration = async (req, res) => {
    const { supplierId, cardPayment, integrationDetails } = req.body;

    try {
        const integration = new Integration({ supplier: supplierId, cardPayment, integrationDetails });
        await integration.save();

        await Supplier.findByIdAndUpdate(supplierId, { paymentIntegration: integration._id });

        res.status(201).json({ status: true, integration: integration});
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to create payment integration' });
    }
};