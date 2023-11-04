const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    Rating :{
        type:Number
    },
    UserId : {
        type:Schema.Types.ObjectId,
        required:true,
        ref : 'Users'
    },
    ProductId : {
        type:Schema.Types.ObjectId,
        required : true
    },
    Comment : {
        type:String,
        required : true
    },
    Date : {
        type : Date,
        required : true
    }
})
const Review = mongoose.model("Review",ReviewSchema)
module.exports = Review