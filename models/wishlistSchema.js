const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const wishListSchema = new Schema({
  UserId: { type: Schema.Types.ObjectId, required: true},
  Products: [{
    ProductId: { type: Schema.Types.ObjectId, required: true , ref:"Product" },
 }],
})
const wishlist = mongoose.model('wishlist', wishListSchema);

module.exports  = wishlist;

