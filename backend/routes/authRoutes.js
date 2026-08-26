const express = require('express');
const router = express.Router();
// Importing logoutUser
const { registerUser, authUser, logoutUser } = require('../controllers/authController');
const User = require('../models/User');
const nodemailer = require('nodemailer'); 

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser); // clears the lock on logout

// Change Password API 
router.put('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Account not found!" });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: "Your old password is incorrect!" });

    user.password = newPassword; 
    await user.save();
    res.json({ message: "Password changed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// Forgot Password - OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account exists with this email!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    console.log(`\n🔑 🔑 ADMIN PASSWORD RESET OTP: ${otp} 🔑 🔑\n`);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'GVS Admin - Password Reset OTP',
        text: `Your OTP to reset the password is: ${otp}. This is valid for only 10 minutes.`
      });
    }

    res.json({ message: "OTP sent. (If it doesn't arrive by email, check the backend console)" });
  } catch (err) {
    res.status(500).json({ message: "There was a problem sending the OTP." });
  }
});

// Verify OTP & Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, resetPasswordOtp: otp, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: "Invalid OTP or it has expired!" });

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "New password set successfully! Please login now." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;