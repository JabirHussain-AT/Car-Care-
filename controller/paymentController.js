const Razorpay = require('razorpay');
const crypto = require('crypto')
require('dotenv').config()
const mongoose = require('mongoose')
const Products = require('../models/productSchema')
const Order = require('../models/orderSchema')
const otpFunctions = require('../utilty/otpFunctions')

module.exports = {
    verifypayment: async (req, res) => {
        // console.log("verify payment : => ", req.body)
        const orderId = new mongoose.Types.ObjectId(req.body.order._id)
        let hmac = crypto.createHmac("sha256", 'ZMT0RhFuSsolnItPCtDxNqzv')
        console.log(req.body.payment.razorpay_payment_id, 'payment id:', req.body.payment.razorpay_order_id)

        hmac.update(req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        console.log("Generated HMAC:", hmac)

        if (hmac === req.body.payment.razorpay_signature) {
            console.log("HMAC validation success")

            const orderId = new mongoose.Types.ObjectId(req.body.order._id)
            // console.log('Order ID:', req.body.order._id)

            try {
                const updateOrderDocument = await Order.findByIdAndUpdate(orderId, { PaymentStatus: "Paid" })
                // console.log('Order update success:', updateOrderDocument)
                const content = "Succesfully placed your Order .it will be shipped with 1 working day .for more queries connect with our team 9007972782"
                const result = otpFunctions.sendMail(req, res, user.Email, content)
                res.json({ success: true })
            } catch (error) {
                console.error('Error updating order:', error)
                res.json({ success: false })
            }
        } else {
            console.log('HMAC validation failed');
            const order = await Order.findOne(orderId)
            const orderItems = order.Products.map(item => ({
                productId: item.ProductId,
                quantity: item.Quantity
            }));

            // Retrieve products based on the product IDs
            const products = await Products.find({ _id: { $in: orderItems.map(item => item.productId) } });
            //
            for (const orderItem of orderItems) {
                const product = products.find(product => orderItem.productId.equals(product._id));
                if (product) {
                    // Convert AvailableQuantity to a number if it's stored as a string
                    const currentQuantity = parseFloat(product.AvailableQuantity);
                    // Convert orderItem.quantity to a number if it's stored as a string
                    const orderQuantity = parseFloat(orderItem.quantity);
                    product.AvailableQuantity = currentQuantity + orderQuantity;

                    // Update stock quantity in the database for this product
                    await Products.updateOne({ _id: product._id }, { $set: { AvailableQuantity: product.AvailableQuantity } });
                    console.log("quantity added return bracuse payment failed")
                }
            }
            res.json({ failure: true })
        }
    }
}    