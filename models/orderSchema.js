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
        Quantity:{type:String}
   }],
  OrderedDate: { type: String, required: true },
  DeliveredDate: { type: String },
  LastReturnDate: { type: String },
  ExpectedDeliveryDate: { type: String },
  Status: { type: String, required: true ,default:'Order placed'},
  ShippedAddress :{type: ShippedAddressSchema,required : true},
  PaymentMethord :{type : String},
  PaymentStatus :{type : String,default:"Pending"},
  TransactionId:{type:String},
  TotalAmount: { type: Number, required: true },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;

