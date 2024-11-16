const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const session = require('express-session');
const cors = require('cors');

// Initialize Express app
const app = express();

// MongoDB connection
const dblink = process.env.MONGODBLINK;
mongoose.connect(dblink)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("Database Connection Error: ", err));

// User Schema
const Users = new mongoose.Schema({
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

// Portfolio Schema
const PortfolioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', Users);
const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send a welcome email
function sendWelcomeEmail(userEmail, userName) {
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: userEmail,
        subject: 'Welcome to Our Platform!',
        text: `Hello ${userName},\n\nThank you for signing up! We're excited to have you on board.\n\nBest regards,\nThe Portfolio Masters`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Middleware for checking if user is admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    res.status(403).json({ error: 'Only admins can perform this action' });
}

// Routes
app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/public/signup.html");
});

app.post("/signup", async (req, res) => {
    const data = {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age,
        gender: req.body.gender,
        email: req.body.email,
        password: req.body.password,
        isAdmin: false
    };

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return res.redirect('/signup?message=' + encodeURIComponent('Invalid email format.'));
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
        return res.redirect('/signup?message=' + encodeURIComponent('Username already exists. Please choose a different username.'));
    } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;

        // Create and save user
        const newUser = new User(data);
        await newUser.save();

        // Send welcome email
        sendWelcomeEmail(data.email, data.firstName);

        // Redirect to login page
        res.redirect('/login?message=' + encodeURIComponent('Account created successfully. Please login.'));
    }
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.post("/login", async (req, res) => {
    try {
        const check = await User.findOne({ username: req.body.username });
        if (!check) {
            res.redirect('/login?message=' + encodeURIComponent('Username not found.'));
            return;
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.redirect('/login?message=' + encodeURIComponent('Incorrect password.'));
        } else {
            req.session.user = check;
            res.redirect('/home');
        }
    } catch (error) {
        res.redirect('/login?message=' + encodeURIComponent('Error occurred during login.'));
    }
});

app.get("/home", (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + "/public/home.html");
    } else {
        res.redirect('/login?message=' + encodeURIComponent('Please log in to access the home page.'));
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out, please try again.');
        }
        res.redirect('/login?message=' + encodeURIComponent('You have successfully logged out.'));
    });
});

app.get("/create", (req, res) => {
    res.sendFile(__dirname + "/public/createPortfolio.html"); // Assuming your create form is in createPortfolio.html
});

// Portfolio Routes (CRUD)
app.get("/api/portfolios", async (req, res) => {
    try {
        const portfolios = await Portfolio.find();  // Make sure Portfolio model is correct
        res.json(portfolios);  // Return the portfolio data as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolios' });
    }
});


app.post("/api/portfolios", async (req, res) => {
    try {
        const newPortfolio = new Portfolio(req.body);
        await newPortfolio.save();
        res.status(201).json(newPortfolio);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create portfolio' });
    }
});

app.put("/api/portfolios/:id", isAdmin, async (req, res) => {
    try {
        const updatedPortfolio = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPortfolio);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update portfolio' });
    }
});

app.delete("/api/portfolios/:id", isAdmin, async (req, res) => {
    try {
        await Portfolio.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Portfolio deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete portfolio' });
    }
});

// Get the current logged-in user's role
app.get('/api/getUserRole', (req, res) => {
    if (req.session.user) {
        res.json({ role: req.session.user.isAdmin ? 'admin' : 'user' });
    } else {
        res.status(403).json({ error: 'User not logged in' });
    }
});


// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
