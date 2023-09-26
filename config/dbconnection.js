const mongoose = require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGO_HOST)

.then(()=>{
    console.log("Mongo db Connected")
}).catch(()=>{
console.log("Failed to connect");
})

module.exports = mongoose