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
    // USER CONTROLLS
    orderDetials: (req, res) => {
        res.render('user/orderDetials')
    },
    orderSuccess: (req, res) => {
        res.render('user/orderSuccess')
    },
    orderHistory: async (req, res) => {
        const user = req.session.user.user
        const userId = new mongoose.Types.ObjectId(user)

        const order = await Orders.find({ UserId: userId })
        console.log(order)
        const momentFormattedDate = moment("");
        res.render('user/orderHistory', { orderHistory: order })
    },
    orderDetialedView: async (req, res) => {
        try {
            const orderId = req.params.id
            const orderDetials = await Orders.findOne({ _id: orderId }).populate("Products.ProductId")
            // console.log(orderDetials)


            res.render('user/orderDetialedView', { order: orderDetials })
        } catch (err) {
            console.log(err, "err in the order detialedview");
            throw err
        }
    },
    downloadInvoice: async (req, res) => {
        try {
            console.log("njn,,,,asijdiaj")
            const orderData = await Orders.findOne({ _id: req.body.orderId }).populate('Products.ProductId');
            const filePath = await invoice.order(orderData);
            console.log(filePath, "jiiiinnn");
            const orderId = orderData._id

            res.json({ orderId });
        } catch (error) {
            console.error("Error in downloadInvoice:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    downloadfile: (req, res) => {
        const id = req.params.id
        const filePath = `D:/E_COMMERCE_project/public/pdf/${id}.pdf`
        res.download(filePath, `invoice.pdf`);
    },
    returnOrder: async (req, res) => {
        // console.log(req.params.id,"order id in return",req.body.returnReason);
        const order = await Orders.findByIdAndUpdate({ _id: req.params.id },
            { Status: "Return Requested", returnReason: req.body.returnReason },
            { new: true }
        )
        console.log(order, "from return order in order controller ")

    },


    // ADMIN CONTROLLS 
    manageReturn: async (req, res) => {
        const order = await Orders.find({ Status: 'Return Requested' })
        console.log(order, "from the manage return in order controller")
        res.render('admin/returnRequests', { orders: order })
    },
    rejectReturn : async (req,res)=>{
        try{
        console.log(req.params.orderId,"from reject return in order Controller")
         const order = await Orders.findByIdAndUpdate(req.params.orderId,{Status:"Delivered (Return Rejected)"})
        // await order.updateOne({_id:req.params.orderId},{Status:"Delivered(Return Rejected"})
    }catch(error){
        console.log("error in the rejecet return catch block");
        throw error
    }
    },
    acceptReturn : async (req,res)=>{
        console.log(req.params.orderId,"from accept return in order Controller")
    },
    viewReturnProducts :async (req,res)=>{
        console.log(req.params.orderId,"from view Products in return in order Controller")
    },
}