// Assuming you have a Products model
const Products = require('../models/products');

const updateProductQuantities = async (orderItems) => {
  try {
    // Retrieve products based on the product IDs
    const products = await Products.find({ _id: { $in: orderItems.map(item => item.productId) } });

    // Update stock quantities in the database
    for (const orderItem of orderItems) {
      const product = products.find(product => orderItem.productId.equals(product._id));
      if (product) {
        product.AvailableQuantity += orderItem.quantity; // Increase the quantity back
        // Update stock quantity in the database for this product
        await Products.updateOne({ _id: product._id }, { $set: { AvailableQuantity: product.AvailableQuantity } });
      }
    }
    console.log("Quantity updated successfully");
  } catch (error) {
    console.error('Error updating product quantities:', error);
    throw error;
  }
};

module.exports =  updateProductQuantities
