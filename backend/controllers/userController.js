const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const { panNumber, name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ panNumber });
    if (existingUser) return res.status(400).json({ message: 'PAN already registered' });

    const user = await User.create({ panNumber, name, email, password });
    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { panNumber, password } = req.body;
  try {
    const user = await User.findOne({ panNumber });
    if (!user) return res.status(400).json({ message: 'Invalid PAN or password' });

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) return res.status(400).json({ message: 'Invalid PAN or password' });

    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
