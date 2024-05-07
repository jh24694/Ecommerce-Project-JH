import mongoose from 'mongoose';
const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  price: Number,
  currentPrice: Number,
  quantity: Number,
  image: String, // Add image field to match maincontroller.js
  sales: [{ 
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    amount: { type: Number}
  }]
});

// Check if the model exists before compiling it
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
