// routes.js

// Import necessary modules and controllers
import express from 'express';
import * as ctrl from '../controllers/mainController.js';
import * as auth from '../controllers/authController.js';

const router = express.Router();

// Define routes
router.get('/login', auth.login);
router.post('/login', auth.verifyLogin);
router.get('/register', auth.register);
router.post('/register', auth.verifyRegister);
router.get('/logout', auth.logout);
router.get('/cart', auth.isAuthenticated, ctrl.viewCart); 
router.get('/customer', auth.isAuthenticated, ctrl.customerPage); // Route to customer page
router.post('/addMoney', auth.isAuthenticated, ctrl.addMoney); 

router.get('/', auth.isAuthenticated, ctrl.home);
router.post('/api/products', auth.isAuthenticated, ctrl.getProducts);

router.post('/addToCart', auth.isAuthenticated, ctrl.addToCart);
router.post('/clearCart', auth.isAuthenticated, ctrl.clearCart);
router.post('/checkout', auth.isAuthenticated, ctrl.checkout);

export default router;
