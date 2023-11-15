const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const categoryOfferSchema = new Schema({
  CategoryName:{type:Schema.Types.ObjectId,required:true,ref:'Category'},
  Percentage: { type: Number, required: true, },
  expiryDate:{type :Date, required : true},
  Status: { type: String, required: true},
});

const categoryOffer = mongoose.model('categoryOffer', categoryOfferSchema);

module.exports = categoryOffer;

