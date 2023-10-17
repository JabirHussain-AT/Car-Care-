const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CouponHistorySchema = new Schema({
  UserId: { type:Schema.Types.ObjectId, required: true },
  CouponCode: { type: String, required: true },
  Status: { type: String, required: true },
});

const CouponHistory = mongoose.model('CouponHistory', CouponHistorySchema);

module.exports =  CouponHistory;

