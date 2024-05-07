// controllers/productsController.js
import Products from '../models/products.js';
import Customer from '../models/customer.js';
import passport from 'passport';
import pkg from 'express-flash-messages';
const { flash } = pkg;




export const home = async (req, res) => {
     console.log(req.flash.success);
  try {
    // Retrieve all products from the database
    const products = await Products.find();

    // Retrieve the user's cart details
    const userId = req.user._id;
    const customer = await Customer.findOne({ _id: userId }).populate('cart.items.productId');

    // Calculate the available quantity for each product
    const updatedProducts = products.map(product => {
      const productInCart = customer.cart.items.find(item => item.productId.toString() === product._id.toString());
      const quantityInCart = productInCart ? productInCart.quantity : 0;
      const availableQuantity = product.quantity - quantityInCart;
      return { ...product.toObject(), availableQuantity };
    });

    // Pass the updated products and the user object to the template
    res.render('shop', { products: updatedProducts, user: req.user, messages: req.flash() });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send(error);
  }
};


const products = [
    {
        name: 'Harvard',
        price: 30,
        quantity: 12,
        image: 'Harvard.png', // Link to Harvard.png in public/images folder
        description: "An acceptance to Harvard",
    },
    {
        name: 'Yale',
        price: 25,
        quantity: 3,
        image: 'Yale.png', // Link to Yale.png in public/images folder
        description: "An acceptance to Yale"
    },
    {
        name: 'UCLA',
        price: 25,
        quantity: 15,
        image: 'UCLA.png', // Link to UCLA.png in public/images folder
        description: "An acceptance to UCLA",
    },
    {
        name: 'Stanford',
        price: 25,
        quantity: 5,
        image: 'Stanford.png', // Link to Stanford.png in public/images folder
        description: "An acceptance to Stanford",
    },
    {
        name: 'SAT',
        price: 10,
        quantity: 5,
        image: 'SAT.png', // Link to SAT.png in public/images folder
        description: "A Perfect 1600 SAT score",
    },
    {
        name: 'GPA',
        price: 10,
        quantity: 15,
        image: 'GPA.png', // Link to GPA.png in public/images folder
        description: "A Perfect 4.0 GPA",
    }
];


async function addProducts() {
    try {
        const count = await Products.countDocuments();
        if (count === 0) { 
            const insertedProducts = await Products.insertMany(products);
            console.log('Multiple products saved to database:', insertedProducts);
        } else {
            console.log('Products already exist in the database.');
        }
    } catch (err) {
        console.error('Error saving products:', err);
    }
}

export const getProducts = async (req, res) => {
  const { name } = req.body;
  let query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
  }

  try {
    const products = await Product.find(query).sort({price: -1});
    res.json(products); // Send back JSON response
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send(error);
  }
};

export const viewCart = async (req, res) => {
    console.log('flash');
    console.log(req.flash.info);
  try {
    // Retrieve the user's cart details and pass it to the cart template
    const populatedCustomer = await Customer.findOne({ _id: req.user._id })
                                            .populate('cart.items.productId');
    res.render('cart', { user: populatedCustomer });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};

export const addToCart = async (req, res) => {
  try {
    let { productName, quantity } = req.body;
    quantity = parseInt(quantity);
    const product = await Products.findOne({ name: productName });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (product.quantity < quantity) {
      return res.status(400).send('Not enough quantity available in inventory');
    }

    const price = product.price;
    const productId = product._id.toString();
  
    const userId = req.user._id;
    let customer = await Customer.findOne({ _id: userId });
    if (!customer.cart) {
      customer.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
    } else {
      const itemIndex = customer.cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        customer.cart.items[itemIndex].quantity += quantity;
      } else {
        customer.cart.items.push({ productId, quantity, price });
      }
      customer.cart.totalQuantity += quantity;
      customer.cart.totalPrice += price * quantity;
    }

    // Update product quantity in the database
    product.quantity -= quantity;
    await product.save();

    await customer.save();
    const populatedCustomer = await Customer.findOne({ _id: userId })
                                            .populate('cart.items.productId');
    req.flash('success', 'Product added to cart');
    console.log('hi');
    console.log(req.flash('success'));
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};


// Add this function to mainController.js
export const clearCart = async (req, res) => {
  try {
    // Retrieve the user's cart and update the product quantities in the database
    const userId = req.user._id;
    const customer = await Customer.findOne({ _id: userId });

    // Iterate over each item in the cart
    for (const item of customer.cart.items) {
      // Find the corresponding product in the database
      const product = await Products.findById(item.productId);
      // Add back the quantity from the cart item to the product's quantity in the database
      product.quantity += item.quantity;
      // Save the updated product
      await product.save();
    }

    // Clear the user's cart
    customer.cart.items = [];
    customer.cart.totalQuantity = 0;
    customer.cart.totalPrice = 0;
    await customer.save();
      req.flash('info', 'hi')
    // Redirect to the cart page or any other appropriate page
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};

// mainController.js

export const checkout = async (req, res) => {
  try {
    // Retrieve the user's cart and update the customer's purchases and money
    const userId = req.user._id;
    const customer = await Customer.findOne({ _id: userId });

    // Calculate the total price of items in the cart
    const totalPrice = customer.cart.totalPrice;

    // Deduct the total price from the customer's money
    customer.money -= totalPrice;

    // Iterate over each item in the cart and add it to the purchases
    for (const item of customer.cart.items) {
      // Create a new purchase object
      const purchase = {
        product: item.productId,
        amount: item.quantity
      };
      // Push the purchase object to the purchases array in the customer schema
      customer.purchases.push(purchase);
    }

    // Clear the user's cart
    customer.cart.items = [];
    customer.cart.totalQuantity = 0;
    customer.cart.totalPrice = 0;

    // Save the updated customer document
    await customer.save();

    // Redirect to the cart page or any other appropriate page
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};

export const customerPage = async (req, res) => {
  try {
    // Retrieve the user's purchase history and current money balance
    const userId = req.user._id;
    const customer = await Customer.findOne({ _id: userId }).populate('purchases.product');

    if (!customer) {
      throw new Error("User not found");
    }

    // Render the customer.ejs page with user data
    res.render('customer', { user: customer });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};

export const addMoney = async (req, res) => {
  try {
    // Retrieve the user's ID
    const userId = req.user._id;

    // Find the user by ID and update their money balance
    const updatedUser = await Customer.findByIdAndUpdate(userId, { $inc: { money: 100 } }, { new: true });

    // Redirect back to the customer page after updating the money balance
    res.redirect('/customer');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};




// Call the function to add products
addProducts();
