const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ProductSchema = new Schema({
    ProductName: {
        type: String,
        required: true,
      },
      Price: {
        type: Number,
        required: true,
      },
      Description: {
        type: String,
        required: true,
      },
      BrandName: {
        type: String,
        required: true,
      },
      Tags: {
          type: Array,
      },
      images: {
        type: Array,
        required: true,
      },
      AvailableQuantity: {
        type: Number,
        required: true,
      },
      Category: {
        type: String,
        required: true,
      },
      DiscountAmount: {
        type: Number,
      },
      Status: {
        type: String,
        required: true
      },
      Variation: {
        type: String,
      },
      UpdatedOn: {
        type: String,
      },
      Display: {
        type: String,
        required: true
      },
      Specification1: {
        type: String
      },
      Specification2: {
        type: String
      },
      Specification3: {
        type: String
      },
      Specification4: {
        type: String
      },
      variants :{
        type:Array
      }
   
    
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;

