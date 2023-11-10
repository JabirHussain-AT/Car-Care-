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
        const discountAmount = offer.Amount;

        // Update products associated with the expired category offer
       const products = await Products.updateMany(
          { Category: categoryId.Name },
          { $inc: { DiscountAmount: discountAmount }, $set: { IsInCategoryOffer: false } }
        );
        await CategoryOffer.deleteOne({ _id: offer._id });
        
      }
    }
  } catch (error) {
    console.error('Error checking expiry:', error);
  }
}

module.exports = checkExpiry;
