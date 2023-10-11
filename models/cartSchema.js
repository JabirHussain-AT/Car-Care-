const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CartSchema = new Schema({
  TotalAmount: { type: Number, required: true },
  UserId: { type: Schema.Types.ObjectId, required: true },
  Products: [{
     ProductId: { type: String, required: true , ref:"Product" },
     Quantity: { type: Number, required: true },
  }],
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports  = Cart;

