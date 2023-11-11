const Users = require("../models/userSchema");
const OTP = require("../models/otpSchema");
const Admin = require("../models/adminSchema");
const Products = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Orders = require("../models/orderSchema");
const Reviews = require('../models/reviewSchema')
const Wallet = require("../models/walletHistorySchema");
const Cart = require("../models/cartSchema");
const CouponHistory = require("../models/couponHistorySchema");
const bcrypt = require("bcrypt");
const { log } = require("handlebars");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const moment = require("moment");
const Banner = require("../models/bannerSchema");
const mongoose = require("mongoose");
require("dotenv").config();
const otpFunctions = require("../utilty/otpFunctions");
const razorpay = require("../utilty/onlinePayment");
const { Mongoose } = require("../config/dbconnection");
const { getDefaultHighWaterMark } = require("nodemailer/lib/xoauth2");
const onlinePayment = require("../utilty/onlinePayment");
const invoice = require("../utilty/invoiceCreater");

module.exports = {
    submitReview  : async (req,res)=>{
        const savedReview = await Reviews.create({
            UserId : req.session.user.user,
            ProductId : req.body.ProductId,
            Comment : req.body.review,
            Date : new Date()
        })
        res.json({success:true})
    }
}