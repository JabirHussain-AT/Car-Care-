const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ReferalOfferSchema = new Schema({
  Amount: { type: Number, required: true, },
 Amount_For_Referal_Used:{type : Number, required : true},
  Status: { type: String, required: true},
});

const ReferalOffer = mongoose.model('ReferalOffer', ReferalOfferSchema);

module.exports = ReferalOffer;

