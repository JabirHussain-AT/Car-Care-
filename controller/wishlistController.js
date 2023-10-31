const Users = require('../models/userSchema')
const OTP = require('../models/otpSchema')
const Admin = require('../models/adminSchema')
const Products = require('../models/productSchema')
const Category = require('../models/categorySchema')
const wishList = require('../models/wishlistSchema')
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
    wishlist: async (req, res) => {
        try {
            const user = req.session.user
            const userWishList = await wishList.findOne({ UserId: user.user }).populate('Products')
            res.render('user/wishList', { userWishList })
        } catch (err) {
            console.log(err, "err in the wishlist catch")
        }
    },
    AddToWishlist: async (req, res) => {
        try {
            const user = req.session.user;
            const productId = req.params.id;
            const productIdToAdd = new mongoose.Types.ObjectId(productId)
            // Find the user's wishlist
            let userWishlist = await wishList.findOne({ UserId: user.user });

            if (!userWishlist) {
                // If the wishlist doesn't exist, create a new one
                const newWishlist = await wishList.create({ UserId: user.user, Products: [] });
                userWishlist = newWishlist;
            }

            // Add the product to the 
            console.log(productIdToAdd,"nokkkinokkam")
            await  userWishlist.Products.push({ ProductId: productIdToAdd });
            await userWishlist.save();

            // Populate the Products field to get product details
            const populatedWishlist = await wishList.findById(userWishlist._id).populate('Products');
            console.log(populatedWishlist,"popoulated")

            res.render('user/wishList', { userWishList: populatedWishlist });
        } catch (err) {
            console.error(err, "Error in the wishlist catch");
            res.status(500).send('Internal Server Error');
        }
    }
}