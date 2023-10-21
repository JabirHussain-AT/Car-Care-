const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose;
const addressSchema = new mongoose.Schema({
  Name: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  mobileNumber: String
});

const UsersSchema = new Schema({
  Name: {
      type: String,
    //   required: true 
    },
  MobNo : {
    type:String,
  },
  Email: {
     type: String,
      required: true, 
      unique: true 
    },
  Password: {
     type: String, 
     required: true, 
    //  unique: true 
},
  Status: { 
    type: String, 
    default:"Active",
    required: true },
  Address: [{
    type:addressSchema
  }],
  Wallet : {
     type:Number,
     default:0
  }
});

const Users = mongoose.model('Users', UsersSchema);

module.exports = Users