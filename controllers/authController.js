import Customer from '../models/customer.js';
import passport from 'passport';

export const login = (req, res) => {
  res.render('login');
}

export const verifyLogin = 
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: false });

export const register = (req, res) => {
  res.render('register');
}

export const verifyRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new Customer({ username, password });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.send(error.message);
  }
};

export const logout = (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    // Redirect or respond after successful logout
    res.redirect('/');
  });
}                        

// Middleware to check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
