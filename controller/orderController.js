const Users = require("../models/userSchema");
const OTP = require("../models/otpSchema");
const Admin = require("../models/adminSchema");
const Products = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Orders = require("../models/orderSchema");
const Wallet = require('../models/walletHistorySchema')
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
  // USER CONTROLLS
  orderDetials: (req, res) => {
    res.render("user/orderDetials");
  },
  orderSuccess: (req, res) => {
    res.render("user/orderSuccess");
  },
  orderHistory: async (req, res) => {
    const user = req.session.user.user;
    const userId = new mongoose.Types.ObjectId(user);
    // const returnRequests = Orders.find({Status :'Return Requested'})
    const order = await Orders.find({ UserId: userId });
    console.log(order);
    const momentFormattedDate = moment("");
    res.render("user/orderHistory", { orderHistory: order });
  },
  orderDetialedView: async (req, res) => {
    try {
      const orderId = req.params.id;
      const orderDetials = await Orders.findOne({ _id: orderId }).populate(
        "Products.ProductId"
      );
      // console.log(orderDetials)

      res.render("user/orderDetialedView", { order: orderDetials });
    } catch (err) {
      console.log(err, "err in the order detialedview");
      throw err;
    }
  },
  downloadInvoice: async (req, res) => {
    try {
      console.log("njn,,,,asijdiaj");
      const orderData = await Orders.findOne({
        _id: req.body.orderId,
      }).populate("Products.ProductId");
      const filePath = await invoice.order(orderData);
      console.log(filePath, "jiiiinnn");
      const orderId = orderData._id;

      res.json({ orderId });
    } catch (error) {
      console.error("Error in downloadInvoice:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  downloadfile: (req, res) => {
    const id = req.params.id;
    const filePath = `D:/E_COMMERCE_project/public/pdf/${id}.pdf`;
    res.download(filePath, `invoice.pdf`);
  },
  returnOrder: async (req, res) => {
    // console.log(req.params.id,"order id in return",req.body.returnReason);
    const order = await Orders.findByIdAndUpdate(
      { _id: req.params.id },
      { Status: "Return Requested", returnReason: req.body.returnReason },
      { new: true }
    );
    console.log(order, "from return order in order controller ");
  },
  cancelOrder: async (req, res) => {
    const orderId = req.params.id; // Assuming orderId is passed in the request parameters

    try {
      // Find the order by ID
      console.log("Cancellll");
      const order = await Orders.findById(orderId);

      //   if (!order) {
      //     return res.status(404).json({ message: 'Order not found' });
      //   }

      // Update order properties
      order.Status = "Cancelled";
      order.PaymentStatus = "Order Cancelled";

      // Save the updated order
      const updatedOrder = await order.save();

      // Respond with the updated order
      //   res.status(200).json(updatedOrder);
      const orderItems = updatedOrder.Products.map((item) => ({
        productId: item.ProductId,
        quantity: item.Quantity,
      }));

      // Retrieve products based on the product IDs
      const products = await Products.find({
        _id: { $in: orderItems.map((item) => item.productId) },
      });
      //
      for (const orderItem of orderItems) {
        const product = products.find((product) =>
          orderItem.productId.equals(product._id)
        );
        if (product) {
          // Convert AvailableQuantity to a number if it's stored as a string
          const currentQuantity = parseFloat(product.AvailableQuantity);
          // Convert orderItem.quantity to a number if it's stored as a string
          const orderQuantity = parseFloat(orderItem.quantity);
          product.AvailableQuantity = currentQuantity + orderQuantity;

          // Update stock quantity in the database for this product
          await Products.updateOne(
            { _id: product._id },
            { $set: { AvailableQuantity: product.AvailableQuantity } }
          );
          console.log("quantity added");
        }
      }
      //   console.log(orderItems,"blank")

      res.redirect("/orderHistory");
    } catch (error) {
      console.error("Error cancelling order:in cancel order", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // ADMIN CONTROLLS
  manageReturn: async (req, res) => {
    const order = await Orders.find({
      Status: { $in: ["Return Requested", "Return Accepted"] },
    });
    console.log(order, "from the manage return in order controller");
    res.render("admin/returnRequests", { orders: order });
  },
  rejectReturn: async (req, res) => {
    try {
      console.log(req.params.orderId, "from reject return in order Controller");
      const order = await Orders.findByIdAndUpdate(req.params.orderId, {
        Status: "Delivered (Return Rejected)",
      });
      // await order.updateOne({_id:req.params.orderId},{Status:"Delivered(Return Rejected"})
    } catch (error) {
      console.log("error in the rejecet return catch block");
      throw error;
    }
  },
  acceptReturn: async (req, res) => {
    try {
      const order = await Orders.findByIdAndUpdate(req.params.orderId, {
        Status: "Return Accepted",
      });
      console.log(req.params.orderId, "from accept return in order Controller");
    } catch (error) {
      console.log("error in the accept return ", error);
    }
  },

  viewReturnProducts: async (req, res) => {
    const orderId = req.params.orderId;
    console.log(
      req.params.orderId,
      "from view Products in return in order Controller"
    );
    const orderDetials = await Orders.findOne({ _id: orderId }).populate(
      "Products.ProductId"
    );
    // console.log(orderDetials)
    res.render("admin/admin- orderDetials", { order: orderDetials });
  },
  verifyReturn: async (req, res) => {
      try {
        
        const orderId = req.params.orderId;
        console.log(
          req.params.orderId,
          "from verify Products in return in order Controller"
        );
        const orderUpdate = await Orders.findByIdAndUpdate(orderId, {
          Status: "Returned",
          PaymentStatus:"Refunded"
        });
        console.log(orderUpdate, "updated");
        //On the time of return products reupdating the stock
        const orderItems =orderUpdate.Products.map((item) => ({
            productId: item.ProductId,
            quantity: item.Quantity,
          }));
        const products = await Products.find({
            _id: { $in: orderItems.map((item) => item.productId) },
          });
          //
          for (const orderItem of orderItems) {
            const product = products.find((product) =>
              orderItem.productId.equals(product._id)
            );
            if (product) {
              // Convert AvailableQuantity to a number if it's stored as a string
              const currentQuantity = parseFloat(product.AvailableQuantity);
              // Convert orderItem.quantity to a number if it's stored as a string
              const orderQuantity = parseFloat(orderItem.quantity);
              product.AvailableQuantity = currentQuantity + orderQuantity;
    
              // Update stock quantity in the database for this product
              await Products.updateOne(
                { _id: product._id },
                { $set: { AvailableQuantity: product.AvailableQuantity } }
              );
              console.log("quantity added");
            }
          }
          console.log("iam here",req.session)
          const userId = req.session.user.user
          const wallet = await Wallet.findOne({_id:userId})
        //   console.log(refund,"refund")
        if(wallet ===null)
        {
            await Wallet.create({
                UserId :userId,
                WalletAmount : orderUpdate.TotalAmount,
                Transactions :[
                    {
                        Amount :orderUpdate.TotalAmount,
                        Date :moment(new Date()).format('llll'),
                        State :'In'
                    }
                ],
                Order : orderUpdate._id
             })
        }else if(wallet){
            await wallet.updateOne({
                WalletAmount:wallet.WalletAmount + orderUpdate.TotalAmount,
                $push: {
                    Transactions: {
                        Amount:orderUpdate.TotalAmount,
                        Date: moment(new Date()).format('llll'),
                    }
                }
            })
        }
          res.redirect('/admin/manage-return-requests')
    } catch (error) {
        console.log("Error happened in verify return")
        throw error
    }
  },
};
