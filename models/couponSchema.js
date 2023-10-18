const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CouponSchema = new Schema({
  CouponName : {type:String,required : true},
  CouponCreatedDate :{ type: String},
  CouponExpiryDate: { type: String},
  CouponCode: { type: String, required: true, unique: true },
  CouponValue: { type: Number, required: true },
  CouponIssuedTo : { type: String, required: true },
  Status : {type:String,default:"Active"},
  MinOrderAmount: { type: Number },
  Limit: { type: Number },
});

const Coupon = mongoose.model('Coupon', CouponSchema);
module.exports = Coupon

