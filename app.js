// Importing necessary modules
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import flash from 'connect-flash';
import configurePassport from './config/passport.js';
import dotenv from 'dotenv';
import crypto from 'crypto'; // Import crypto for generating session secret

// Importing models
import Customer from './models/customer.js';
import Product from './models/products.js';

dotenv.config({path: 'process.env'}); // Load environment variables

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URL, // Provide mongoUrl option
    
  })
}));

// Initialize flash messages middleware
app.use(flash());

// Middleware to make flash messages available in views
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

configurePassport(passport); // Configuring passport

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
try {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('Error connecting to MongoDB:', error);
}

// Define routes
import routes from './routes/routes.js'; 
app.use('/', routes);

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
