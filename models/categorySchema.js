const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CategorySchema = new Schema({
  Name: { type: String, required: true, },
  Display:{type : String, required : true,default :"Active" },
  Images: [{ type: String, required: true, }],
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;

