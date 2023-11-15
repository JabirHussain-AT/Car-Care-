// checkExpiry.js
const CategoryOffer = require('../models/categoryOfferScheama');
const Category = require('../models/categorySchema');
const Products = require('../models/productSchema')

async function checkExpiry() {
  try {
    const currentDate = new Date();
   
    // Find expired offers
    const expiredOffers = await CategoryOffer.find({ expiryDate: { $lte: currentDate } });

    if (expiredOffers.length > 0) {
      for (const offer of expiredOffers) {
        // Your action logic here
        
        const categoryId = await Category.findOne({_id:offer.CategoryName});
        const discountPercentage = offer.Percentage;
        // Find products associated with the expired category offer
        const productsToUpdate = await Products.find({ Category: categoryId.Name });

        // Update products associated with the expired category offer
        for (const product of productsToUpdate) {
          // Calculate the new discount amount based on the discount percentage
          const newDiscountAmount = product.DiscountAmount + (product.Price * discountPercentage / 100);
          const defaultAmount = newDiscountAmount - (product.Price * 10 /100)
          // Update the product discount amount and set IsInCategoryOffer to false
          await Products.updateOne(
            { _id: product._id },
            { $set: { DiscountAmount: Math.floor(defaultAmount), IsInCategoryOffer: false } }
          );
          await Products.updateOne(
            { _id: product._id },
            { $unset: { IsInCategoryOffer: 1 , OfferPercentage:1} }
          );
        }
        await CategoryOffer.deleteOne({ _id: offer._id });
        
      }
    }
  } catch (error) {
    console.error('Error checking expiry:', error);
  }
}

module.exports = checkExpiry;
