const Users = require('../models/userSchema')
const Admin = require('../models/adminSchema')
const Orders = require('../models/orderSchema')
const Product = require('../models/productSchema')
const Coupon = require('../models/couponSchema')
const CouponHistory = require('../models/couponHistorySchema')
const Category = require('../models/categorySchema')
const Banner = require('../models/bannerSchema')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const moment = require('moment')
const { constants } = require('crypto')
require('dotenv').config


module.exports = {
    addCoupons: async (req, res) => {
        res.render('admin/addCoupon', { message: req.flash() })
    },
    postaddCoupons: async (req, res) => {
        try{

            console.log(req.body)
            const exist = await Coupon.findOne({CouponName :req.body.CouponName })
            if(exist !== null){
                req.flash('uniqueErr',"its already exists.Coupon Name Must be unique")
                res.redirect('/admin/addCoupon');
            }else{

                req.body.CouponCreatedDate = moment(new Date()).format('llll')
                req.body.CouponExpiryDate = moment(req.body.CouponExpiryDate).format('llll')
                const createCoupon = await Coupon.create(req.body)
                res.redirect('/admin/Coupons')
            }
        }catch(err){
            if (err.code === 11000) {
                console.error('Coupon code must be unique.');
                req.flash('uniqueErr',"its already exists Code Code Must be unique")
                res.redirect('/admin/addCoupon');
              } else {
                // Handle other errors
                console.error('Error in adding coupon:', err);
                throw err; // Rethrow the error if you want to propagate it further
              }
        }
        },
    Coupons: async (req, res) => {
        const coupon = await Coupon.find()
        res.render('admin/Coupons', { message: req.flash(), coupons: coupon })
    },
    //user coupon  validation
    validateCoupon: async (req, res) => {
        const CouponCode = req.body.couponCode
        const user = req.session.user.user
        // console.log(req.body)
        console.log(CouponCode, "is here")
        const couponExist = await Coupon.findOne({ CouponCode: CouponCode })
        // console.log(CouponCode)

        if (couponExist !== null) {
            if (couponExist.CouponIssuedTo === 'public') {
                if (couponExist.Users.includes(user)) {
                    res.json({
                        status: false,
                        message: `Its already Used ..Sorry !`
                    })

                } else {
                    if (couponExist.MinOrderAmount <= req.body.subtotalAmount) {
                        const momentDate = moment(couponExist.CouponExpiryDate);
                        const currentDate = moment();
                        // console.log(momentDate.isBefore(currentDate),"nokkaam")
                        if (!momentDate.isBefore(currentDate)) {
                            couponExist.Users.push(user);
                            await couponExist.save();
                            res.json({
                                status: true,
                                couponAmount: couponExist.CouponValue
                            })
                            //    const couponStatus = await CouponHistory.findOneAndUpdate({UserId:user,CouponCode:CouponCode})
                        } else {
                            res.json({
                                status: false
                            })
                        }
                    } else {
                        res.json({
                            status: false,
                            message: `Cart need Minimum Total Amount ${couponExist.MinOrderAmount} for getting this coupon`
                        })

                    }
                }
            } else {
                const couponUsed = await CouponHistory.findOne({ UserId: user, CouponCode: CouponCode })
                console.log(couponUsed, "uamanfuafiasj")
                if (couponUsed !== null) {
                    if (couponUsed.Status === 'Not Used') {
                        // console.log(couponExist)

                        if (couponExist.MinOrderAmount <= req.body.subtotalAmount) {
                            const momentDate = moment(couponExist.CouponExpiryDate);
                            const currentDate = moment();
                            // console.log(momentDate.isBefore(currentDate),"nokkaam")
                            if (!momentDate.isBefore(currentDate)) {
                                couponUsed.Status = "Used"
                                couponUsed.save()
                                res.json({
                                    status: true,
                                    couponAmount: couponExist.CouponValue
                                })
                                //    const couponStatus = await CouponHistory.findOneAndUpdate({UserId:user,CouponCode:CouponCode})
                            } else {
                                res.json({
                                    status: false
                                })
                            }
                        } else {
                            res.json({
                                status: false,
                                message: `Cart need Minimum Total Amount ${couponExist.MinOrderAmount} for getting this coupon`
                            })
                        }
                    } else {
                        res.json({
                            status: false,
                            message: `This Coupon Code is already Used`
                        })

                    }
                } else {
                    res.json({
                        status: false,
                        message: `This Coupon Code Not Available`
                    })
                }


            }
        } else {
            res.json({
                status: false,
                message: `This is not valid Coupon`
            })
        }
    },
    deleteCoupon: async (req, res) => {
        try {
            const coupon = req.params.couponId
            const result = await Coupon.findOneAndDelete({ _id: coupon })
            console.log(result, "deleted")

            if (result) {
                console.log(`Coupon ${coupon} deleted successfully`);
                req.flash("CouponDeleted", "Coupon Deleted Successfully");
                res.redirect('/admin/Coupons');
            }

        } catch (error) {
            console.log(error, "inside catch at delete coupon");
        }
    },
    editCoupon: async (req, res) => {
        const id = req.params.id
        const coupon = await Coupon.findOne({ _id: id })
        res.render('admin/editCoupon.ejs', { message: req.flash(), Coupon: coupon })
    },
    posteditCoupon: async (req, res) => {
        try {
            // Extract data from the form submission
            const { CouponName, CouponCode, CouponValue, CouponIssuedTo, MinOrderAmount, CouponExpiryDate } = req.body;

            // Assuming you have fetched the coupon based on ID
            const coupon = await Coupon.findById(req.params.id);

            // Update coupon data
            coupon.CouponName = CouponName;
            coupon.CouponCode = CouponCode;
            coupon.CouponValue = CouponValue;
            coupon.CouponIssuedTo = CouponIssuedTo;
            coupon.MinOrderAmount = MinOrderAmount;
            coupon.CouponExpiryDate = CouponExpiryDate;

            // Save the updated coupon
            await coupon.save();

            res.redirect('/admin/Coupons'); // Redirect to coupon list page
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}