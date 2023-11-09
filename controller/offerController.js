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
const ReferalOffer = require('../models/referalOfferSchema')
const categoryOffer = require('../models/categoryOfferScheama')

module.exports = {
            offers : async(req,res)=>{
                try{
                    const ReferalOffers = await ReferalOffer.find()
                    const categories = await Category.find()
                    const categoryOffers  = await categoryOffer.find().populate('CategoryName')
                     res.render('admin/offers',{ReferalOffers,categories,categoryOffers })

                }catch(err){
                    console.log(err,"err in the offer console")
                }
            },
            addReferaloffers : async (req,res)=>{
                try{
                    const create = await ReferalOffer.create(req.body)
                    res.redirect('/admin/offers')

                }catch(err){
                    
                    console.log(err,"err in the add offer")
                }
            },
            editReferaloffers : async (req,res)=>{
                try{
                   const referalOffer = await ReferalOffer.findOneAndUpdate({_id:req.params.id},{
                    Amount:req.body.Amount,
                    Amount_For_Referal_Used : req.body.Amount_For_Referal_Used,
                    Status : req.body.Status
                   })
                   res.redirect('/admin/offers')

                }catch(err){
                    console.log(err,"err in the edit referal offer")
                }
            },
            changeStatusOfoffers : async (req,res)=>{
                try{
                   const referalOffer = await ReferalOffer.findOne({_id:req.params.id})
                   if(referalOffer?.Status === "Active"){
                       await ReferalOffer.updateOne({_id:req.params.id},{Status:"Inactive"})
                   }else{
                    await ReferalOffer.updateOne({_id:req.params.id},{Status:"Active"})
                   }
                   res.redirect('/admin/offers')

                }catch(err){
                    console.log(err,"err in the edit referal offer")
                }
            },
            addCategoryOffer : async (req,res)=>{
                try{
                    console.log(req.body.CategoryName)
                    req.body.CategoryName = new mongoose.Types.ObjectId(req.body.CategoryName)
                    req.body.Status = "Active"
                    const addedCategory = await categoryOffer.create(req.body)
                    const currentDate = new Date()
                    const categoryOfferToapplay = await categoryOffer.findOne({
                    CategoryName:req.body.CategoryName,
                    Status:'Active',
                    expiryDate: {$gte: currentDate}
                    }).populate('CategoryName')
                    if(categoryOfferToapplay){

                            const categoryId=  categoryOfferToapplay.CategoryName
                            const discountAmount = categoryOfferToapplay.Amount
                            const category = await Category.find({_id:categoryId})    
                            await Products.updateMany(
                                { Category: categoryOfferToapplay.CategoryName.Name},
                                { $inc: { DiscountAmount: -discountAmount }, $set: { IsInCategoryOffer: true } }
                            )
                    }
                    res.redirect('/admin/offers')
 
                 }catch(err){
                     console.log(err,"err in the edit categoryoffer")
                 }
            }
            
    }