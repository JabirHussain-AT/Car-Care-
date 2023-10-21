const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WalletSchema = new Schema({
    UserId : {type:String,required:true,unique:true},
    WalletAmount :{type:Number,required:true,default:0},
    Transactions :[
        {
            Amount : {type:Number ,required:true,},
            Date : {type:String,required : true},
            State :{type:String,required : true},
            Order : {type:Schema.Types.ObjectId,required:true}
        }
    ],
})
const Wallet = mongoose.model("Wallet",WalletSchema)
module.exports = Wallet