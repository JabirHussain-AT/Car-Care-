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
                     res.render('admin/offers',{ReferalOffers,categories,categoryOffers,message:req.flash() })

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
    
                    if(new Date(req.body.expiryDate) <= new Date()){
                        req.flash("error","please select a future date")
                       return res.redirect('/admin/offers')
                    }
                    req.body.CategoryName = new mongoose.Types.ObjectId(req.body.CategoryName)
                    req.body.Status = "Active"
                    const itsExistingOrnot = await categoryOffer.findOne({CategoryName:req.body.CategoryName})
                    if(itsExistingOrnot){
                        req.flash("existing","Its already exist ,can't apply again ,One active category Offer  is this")
                        res.redirect('/admin/offers')
                    }else{
                        
                        const addedCategory = await categoryOffer.create(req.body)
                        const currentDate = new Date()
                        const categoryOfferToapplay = await categoryOffer.findOne({
                        CategoryName:req.body.CategoryName,
                        Status:'Active',
                        expiryDate: {$gte: currentDate}
                        }).populate('CategoryName')
                        if(categoryOfferToapplay){
    
                                const categoryId=  categoryOfferToapplay.CategoryName
                                const discountAmount = categoryOfferToapplay
                                const category = await Category.findOne({_id:categoryId}) 
                                    // Fetch all products in the category
                                    
                               const productsInCategory = await Products.find({ Category: category.Name })
                            
                               for (const product of productsInCategory) {
                                const productPrice = product.Price
                                const discountAmount = (productPrice * req.body.Percentage) / 100
                                const discounted = product.Price - discountAmount
                                await Products.updateOne(
                                    { _id: product._id },
                                    { $set: { DiscountAmount: Math.floor(discounted), IsInCategoryOffer: true,OfferPercentage:req.body.Percentage } }
                                )
                            }
                        }
                        res.redirect('/admin/offers')
                    }
 
                 }catch(err){
                     console.log(err,"err in the add categoryoffer")
                 }
            },
            editCategoryOffer:  async (req,res)=>{
                try {
                    const updatedCategoryOffer = req.body;
            
                    // Check if req.body has expiryDate, and if not, retrieve the existing one
                    if (!req.body.expiryDate) {
                        const existingCategoryOffer = await categoryOffer.findOne({ _id: req.params.id });
                        updatedCategoryOffer.expiryDate = existingCategoryOffer.expiryDate;
                    }
                    // Ensure that CategoryName is a valid ObjectId
                    if (updatedCategoryOffer?.CategoryName) {
                        updatedCategoryOffer.CategoryName = new mongoose.Types.ObjectId(updatedCategoryOffer.CategoryName);
                    }
                    // Retrieve the existing category offer
                    const existingCategoryOffer = await categoryOffer.findOne({ _id: req.params.id }).populate('CategoryName');
            
                    // Update the category offer
                    await categoryOffer.findOneAndUpdate({ _id: req.params.id }, updatedCategoryOffer);
                    // Adjust product discounts
                    const productsToUpdate = await Products.find({ Category: existingCategoryOffer.CategoryName.Name });

                    for (const product of productsToUpdate) {
                        const newDiscountAmount = (product.Price * req.body.Percentage) / 100;
                        const discounted = product.DiscountAmount - newDiscountAmount
                        await Products.updateOne({ _id: product._id }, { $set: { DiscountAmount: discounted , OfferPercentage:req.body.Percentage } });
                    }
                  res.redirect('/admin/offers')
                }
                     catch(err){
                    console.log(err,"err in the  edit category offer")
                }
            },
            editCategoyOfferStatus :  async (req,res)=>{
                try{
                   const CategoryOffer= await categoryOffer.findOne({_id:req.params.id})
                   if (CategoryOffer) {
                    const newStatus = CategoryOffer.Status === "Active" ? "Inactive" : "Active";     
                    await categoryOffer.findOneAndUpdate({ _id: req.params.id }, { Status: newStatus });
                    res.json({success:true})
                  }
                  
                }catch(err){
                    console.log(err,"err in the edit referal offer")
                }
            }
            
    }