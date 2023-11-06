const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ShippedAddressSchema = new Schema({
  Name: { type: String, required: true },
  Address: { type: String, required: true },
  Pincode: { type: String, required: true },
  City: { type: String, required: true },
  State: { type: String, required: true },
  Mobile: { type: String, required: true },
});

const OrdersSchema = new Schema({
  UserId: { type:Schema.Types.ObjectId, required: true, unique:false },
  Products: [{
        ProductId :{type:Schema.Types.ObjectId,ref:"Product"},
        Quantity:{type:Number},
   }],
  OrderedDate: { type: Date, required: true },
  DeliveredDate: { type: Date },
  LastReturnDate: { type: Date },
  ExpectedDeliveryDate: { type: Date },
  Status: { type: String, required: true ,default:'Order Attempted'},
  ShippedAddress :{type: ShippedAddressSchema,required : true},
  PaymentMethod :{type : String},
  PaymentStatus :{type : String,default:"Pending"},
  TransactionId:{type:String},
  returnReason : {type:String},
  TotalAmount: { type: Number, required: true },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;

