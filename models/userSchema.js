const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  Name: {
      type: String,
    //   required: true 
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
  }],
  Orders: [{
  }],
});

const Users = mongoose.model('Users', UsersSchema);

module.exports = Users