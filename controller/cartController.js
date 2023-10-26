const Users = require('../models/userSchema')
const OTP = require('../models/otpSchema')
const Admin = require('../models/adminSchema')
const Products = require('../models/productSchema')
const Category = require('../models/categorySchema')
const Orders = require('../models/orderSchema')
const Cart = require('../models/cartSchema')
const CouponHistory = require('../models/couponHistorySchema')
const bcrypt = require('bcrypt')
const { log } = require('handlebars')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const moment = require('moment')
const Banner = require('../models/bannerSchema')
const mongoose = require('mongoose')
require('dotenv').config()
const otpFunctions = require('../utilty/otpFunctions')
const razorpay = require('../utilty/onlinePayment')
const { Mongoose } = require('../config/dbconnection')
const { getDefaultHighWaterMark } = require('nodemailer/lib/xoauth2')
const onlinePayment = require('../utilty/onlinePayment')
const invoice = require('../utilty/invoiceCreater')

module.exports = {
    cart: async (req, res) => {
        const user = req.session.user
        userCart = await Cart.findOne({ UserId: user.user }).populate('Products.ProductId')
        res.render('user/cart', { user: user, userCart: userCart })
    },
    addtoCart: async (req, res) => {
        try {
            const product_id = req.params.id
            // console.log(product_id, 'from act')

            const user = new mongoose.Types.ObjectId(req.session.user.user)

            // console.log(user, "from anirudh")
            console.log(user, "its from add to cart")
            const cart = await Cart.findOne({ UserId: user })

            if (cart) {
                // console.log("saferr");
                const userid = user.user

                const existing = cart.Products.find((product) => product.ProductId === (product_id))
                if (existing) {
                    // console.log("iam here")

                    await Cart.findOneAndUpdate(
                        { "UserId": user, "Products.ProductId": product_id },
                        { $inc: { "Products.$.Quantity": 1 } }
                    );

                } else {
                    cart.Products.push({
                        ProductId: product_id,
                        Quantity: 1
                    })
                    await cart.save()
                }

            } else {
                console.log("i am in cart else");
                const quantity = 1
                await Cart.create({
                    TotalAmount: 0,
                    UserId: user,
                    Products: [{ ProductId: product_id, Quantity: quantity }]
                })

            }
            res.redirect('/cart')
        } catch (error) {
            throw error
            console.log("add to cart");
            res.redirect('/cart')
        }
    },
    deleteFromCart: async (req, res) => {
        const product_id = req.params.id
        const user = req.session.user.user
        const updatedCart = await Cart.findOneAndUpdate(
            { UserId: user },
            { $pull: { "Products": { ProductId: product_id } } },
            { new: true }
        );
        console.log("delete : ", updatedCart)
        res.redirect('/cart')
    },
    updatingQuantity: async (req, res) => {
        try {
            const { productId, change } = req.body

            const userId = req.session.user.user;

            const userCart = await Cart.findOne({ UserId: userId })
            const product = await Products.findById(productId);
            if (!userCart || !product) {
                return res.status(404).json({ error: 'Product or cart not found' });
            }
            const cartItem = userCart.Products.find(item => item.ProductId === (productId));
            if (!cartItem) {
                return res.status(404).json({ error: 'Product or cart not found' });
            }
            const newQuantity = cartItem.Quantity + parseInt(change)
            if (newQuantity <= 0) {
                userCart.Products = userCart.Products.filter(item => !item.ProductId === (productId));
            } else {
                cartItem.Quantity = newQuantity;
            }

            await userCart.save()
            res.json({ message: 'Quantity updated successfully', newQuantity });


        } catch (error) {
            console.error('Error updating quantity:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    confirmStock: async (req, res) => {
        // console.log("called confirm stock");
        try {

            const userId = req.session.user.user
            const userCart = await Cart.findOne({ UserId: userId })
            const outOfStockProducts = []
            // console.log(ConfirmStock,"confirm stock")

            for (const cartProduct of userCart.Products) {
                const product = await Products.findById(cartProduct.ProductId);
                if (!product || product.AvailableQuantity < cartProduct.Quantity) {
                    outOfStockProducts.push(cartProduct.ProductId);
                }
            }
            let ConfirmedStock
            if (outOfStockProducts.length > 0) {
                ConfirmedStock = false
               return res.json({message: 'Some products are out of stock',outOfStockProducts,ConfirmedStock})
            }
            
            return res.json({ConfirmedStock:true})

        } catch (err) {
            console.log(err, "err in the confirm stock time ")
        }

    },
    postCart: async (req, res) => {
        console.log("hiiiii")
        const user = req.session.user.user
        const TotalAmount = parseFloat(req.body.hiddenTotalAmount.replace(/[^\d.]/g, ""))
        const toUpdate = await Cart.findOne({ UserId: user })
        await toUpdate.updateOne({ TotalAmount: TotalAmount }, { upsert: true }, { new: true })
        console.log(toUpdate,"to update")
        res.json({postcart:true})
        
    }
}