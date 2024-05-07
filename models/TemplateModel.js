import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const ProductsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 100
  },
  quantity: {
    type: Number,
    required: true,
    default: 10
  },
  sales: [{ 
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    amount: { type: Number}
  }]
});

const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  purchases: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number, required: true },
  }]
});

CustomerSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

CustomerSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// Check if the model exists before compiling it
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

// Check if the model exists before compiling it
const ProductsModel = mongoose.models.Products || mongoose.model('Products', ProductsSchema);

export { Customer, ProductsModel };
