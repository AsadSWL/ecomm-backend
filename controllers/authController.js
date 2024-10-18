const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: false, message: 'User already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      role,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ status: true, token, user: { username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.isPasswordMatch(password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ status: true, token, user: { username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
        const message = `
            You are receiving this because you (or someone else) requested a password reset.
            Please click on the following link to reset your password:
            ${resetUrl}
        `;

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset',
            text: message
        });

        res.status(200).json({ status: true, message: 'Password reset link sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};


exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ status: false, message: 'Invalid or expired token' });
        }

        user.password = password;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ status: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};