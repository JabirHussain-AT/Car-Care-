const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const BannerSchema = new Schema({
  BannerName: { type: String },
  Image: { type: String },
  Status :{type :String,default:"Disabled"},
  Date: { type: Date },
});

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner