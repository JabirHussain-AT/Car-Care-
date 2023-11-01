const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const wishListSchema = new Schema({
  UserId: { type: Schema.Types.ObjectId, required: true},
  Products: {type:Array,ref:"Product"}
})
const wishlist = mongoose.model('wishlist', wishListSchema);

module.exports  = wishlist;

