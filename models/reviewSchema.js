const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    Rating :{
        
    }
})
const Review = mongoose.model("Review",ReviewSchema)
module.exports = Review