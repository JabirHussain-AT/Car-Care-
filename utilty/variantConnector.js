const Product = require('../models/productSchema')

 module.exports = {
     VariantConnector : async(mainProductId,VarientProductId)=>{
        const mainProduct =await  Product.findOne({_id:mainProductId})
        const newVarient = await Product.findOne({_id:VarientProductId})
      await mainProduct.updateOne({
         $push: { variants: VarientProductId}
        })
      await newVarient.updateOne({
         $push: { variants:mainProductId }
        })

        console.log(newVarient,"hehhhhe")
     }
 }