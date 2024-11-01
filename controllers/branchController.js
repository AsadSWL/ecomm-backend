const User = require('../models/userModel');

exports.createBranch = async (req, res) => {
    const { firstname, lastname, username, email, password, role } = req.body;
    try {
        const user = new User({ firstname, lastname, username, email, password, role });
        await user.save();
        res.status(201).json({ status: true, message: "Branch created successfully" });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to create branch' });
    }
};

exports.getBranches = async (req, res) => {
    try {
        const branches = await User.find({ role: 'branch' }).select('-password');
        res.json({ status: true, branches: branches });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Failed to get branches' });
    }
};
