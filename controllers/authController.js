const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const tokenBlacklist = require('../utils/tokenBlacklist');
const Otp = require('../models/otp'); // Create this model (shown below)

// Signup
// Signup function
// Signup function
exports.signup = async (req, res) => {
  const { 
    employee_id, 
    name, 
    email, 
    phone, 
    password, 
    department, 
    role, 
    joining_date, 
    status, 
    is_admin, 
    profile_photo_url, 
    address 
  } = req.body;

  try {
    // Ensure employee_id is provided
    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    // Validate and convert joining_date to a proper Date object
    const parsedJoiningDate = new Date(joining_date);
    if (isNaN(parsedJoiningDate)) {
      return res.status(400).json({ success: false, message: 'Invalid joining date format. Use "YYYY-MM-DD".' });
    }

    // Ensure is_admin is a boolean
    const isAdmin = typeof is_admin === 'boolean' ? is_admin : is_admin === 'true';

    // Check if user already exists (email or phone)
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
    }

    // Create new user
    const user = await User.create({
      employee_id,
      name,
      email,
      phone,
      password_hash: password,  // Password will be hashed automatically by schema pre-save hook
      department,
      role,
      joining_date: parsedJoiningDate,  // Use parsed valid Date
      status: status || 'active',  // Default to 'active' if not provided
      is_admin: isAdmin,  // Use proper boolean
      profile_photo_url: profile_photo_url || '',
      address: address || '',
    });

    // Generate token after successful signup
    const token = generateToken(user._id);

    // Send the response with the token
    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response with the token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        profile_photo_url: user.profile_photo_url,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested to reset the password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};




//otp logins
// Send OTP to email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  console.log('---------')
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 mins

    await Otp.create({
      email,
      code: otpCode,
      expiresAt,
    });

    await sendEmail({
      email: user.email,
      subject: 'Your OTP Code',
      message: `Your OTP is ${otpCode}. It expires in 3 minutes.`,
    });

    res.status(200).json({ success: true, message: 'OTP sent to registered email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP and login
exports.verifyOtp = async (req, res) => {
  const { email, code } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email, code });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(410).json({ success: false, message: 'OTP expired' });
    }

    await Otp.deleteMany({ email }); // Invalidate all OTPs for this email

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};