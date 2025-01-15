const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const tesseract = require('tesseract.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/pan_auth', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    panNumber: { type: String, required: true, unique: true },
    dob: { type: String, required: true },
    mobileNumber: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Route: Upload PAN, Extract Details, and Save to MongoDB
app.post('/upload-pan', upload.single('panCard'), async (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please try again.' });
        }

        // Extract details from PAN card
        const filePath = req.file.path;
        const result = await tesseract.recognize(filePath, 'eng');
        const text = result.data.text;

        // Extract PAN Number and DOB using regex
        const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
        const dobRegex = /\b(?:\d{2}\/\d{2}\/\d{4})\b/;
        const panNumber = text.match(panRegex)?.[0];
        const dob = text.match(dobRegex)?.[0];

        if (!panNumber || !dob) {
            return res.status(400).json({ message: 'Unable to extract PAN details. Please try again.' });
        }

        // Get user input from request body
        const { email, password, mobileNumber } = req.body;

        // Validate user input
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
        }

        // Check if PAN number or email already exists
        const existingUser = await User.findOne({ $or: [{ email }, { panNumber }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or PAN number already registered.' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save User to Database
        const newUser = new User({ email, password: hashedPassword, panNumber, dob, mobileNumber });
        await newUser.save();

        res.json({ message: 'User registered successfully', panNumber, dob });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
});

// Login Route: Verify User Credentials
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token, // Send the token in the response
            user: { email: user.email, panNumber: user.panNumber } // Optionally, send some user details
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
