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
            const user = new mongoose.Types.ObjectId(req.session.user.user)
            const userWishList = await wishList.findOne({ UserId: user }).populate('Products')
            console.log(userWishList,"kklklk")
            res.render('user/wishList', { userWishList })
        } catch (err) {
            console.log(err, "err in the wishlist catch")
        }
    },
    AddToWishlist: async (req, res) => {
            try {
              const userId = new mongoose.Types.ObjectId(req.session.user.user);
              const productId = new mongoose.Types.ObjectId(req.params.id);
              const userWishlist = await wishList.findOne({ UserId: userId });
              if (userWishlist) {
                const sameItem = userWishlist.Products.some((item) =>
                  item.equals(productId)
                );
                if (sameItem) {
                  console.log(`Item already exists in the wishlist.`);
                  const response ={
                    success:false,
                    message : `Item already exists in the wishlist.`
                  }
                  res.json(response)
                } else {
                  const updatedWishlist = await wishList.findOneAndUpdate(
                    { UserId: userId },
                    { $push: { Products: productId } },
                    { new: true }
                  );
                }
              } else {
                console.log(`user wishlist not found`);
                const wishlist = new wishList({
                  UserId: userId,
                  Products: [productId],
                });
                wishlist.save();
              }
              const response = {
                success: true,
                productId,
              };
              res.json(response);
            } catch (error) {
              console.log(error, "error happened");
            }
          },
          RemoveFromWishList : async (req,res)=>{
            try {
                const productId = new mongoose.Types.ObjectId(req.params.id) ;
                const userId = new mongoose.Types.ObjectId(req.session.user.user) ;
                const removedItem = await wishList.findOneAndUpdate(
                    {
                        UserId: userId,
                    },
                  {
                    $pull: {
                        Products: productId,
                    },
                }
                );
                console.log("hiii")
                res.redirect("/wishlist");
              } catch (error) {
                console.log(error, "error happened");
              }
          }
}