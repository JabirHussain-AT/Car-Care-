const Users = require('../models/userSchema')
const Admin = require('../models/adminSchema')
const Orders = require('../models/orderSchema')
const Product = require('../models/productSchema')
const Coupon = require('../models/couponSchema')
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
        res.render('admin/addCoupon', { message: true })
    },
    postaddCoupons: async (req, res) => {
        console.log(req.body)
        req.body.CouponCreatedDate = moment(new Date()).format('llll')
        req.body.CouponExpiryDate = moment(req.body.CouponExpiryDate).format('llll')
        const createCoupon = await Coupon.create(req.body)
    },
    Coupons: async (req, res) => {
        const coupon = await Coupon.find()
        res.render('admin/Coupons', { message: true, coupons: coupon })
    },
    //user coupon  validation
    validateCoupon: async (req, res) => {
        const CouponCode = req.body.couponCode
        // console.log(req.body)
        console.log(CouponCode, "is here")
        const couponExist = await Coupon.findOne({ CouponCode: CouponCode })
        console.log(couponExist)
        if (couponExist) {
            if (couponExist.MinOrderAmount <= req.body.subtotalAmount) {
                const momentDate = moment(couponExist.CouponExpiryDate);
                const currentDate = moment();
                // console.log(momentDate.isBefore(currentDate),"nokkaam")
                if (!momentDate.isBefore(currentDate)) {
                    res.json({
                        status: true,
                        couponAmount: couponExist.CouponValue
                    })
                } else {
                    res.json({
                        status: false
                    })
                }
            }else{
                  res.json({
                     status:false,
                     message:`Cart need Minimum Total Amount ${couponExist.MinOrderAmount} for getting this coupon`
                  })
            }
        } else {
            res.json({
                status: false
            })
        }
    }
}