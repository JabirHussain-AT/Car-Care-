const Users = require('../models/userSchema')
const Admin = require('../models/adminSchema')
const Orders = require('../models/orderSchema')
const Product = require('../models/productSchema')
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
    banner: async (req, res) => {
        const currentBanner = await Banner.findOne({ Status: "Enabled" })
        const banners = await Banner.find()
        // console.log(currentBanner,"currentBanner")
        res.render('admin/Banner', { currentBanner: currentBanner, banners: banners, message: req.flash() })
    },
    addBanner: (req, res) => {
        res.render('admin/addBanner')
    },
    submitAddBanner: async (req, res) => {
        // console.log(req.body);
        // console.log(req.file);
        try {
            if(req.files['carouselImage1'] &&
            req.files['carouselImage2'] &&
            req.files['carouselImage3']){
            const carosal = [
                req.files['carouselImage1'][0].filename,
                req.files['carouselImage2'][0].filename,
                req.files['carouselImage3'][0].filename,
            ];
            const newBanner = new Banner({
                BannerName: req.body.bannerName,
                Image: req.files['Image'][0].filename,
                Carosel: carosal,
                Date: new Date(),
            })
            
            await newBanner.save();
            res.redirect('/admin/banner')
        }else{
            const newBanner = new Banner({
                BannerName: req.body.bannerName,
                Image: req.files['Image'][0].filename,
                // Carosel: carosal,
                Date: new Date(),
            })
            await newBanner.save();
            res.redirect('/admin/banner')
        }
        } catch (err) {
            console.log(err, 'in the submit banner catch');
            throw err
        }
    },
    activateBanner: async (req, res) => {
        try {
            // Find the existing enabled banner
            const existingBanner = await Banner.findOne({ Status: "Enabled" });
            const bannerId = new mongoose.Types.ObjectId(req.params.bannerID)
            if (existingBanner._id == bannerId) {
                req.flash("existing", "Its the current Status")
                res.redirect('/admin/banner')
            }
            if (existingBanner) {
                // Change the status of the existing banner to "Disabled"
                existingBanner.Status = "Disabled";
                await existingBanner.save();
            }

            // Activate the new banner
            const banner = await Banner.findOneAndUpdate(
                { _id: req.params.bannerID },
                { Status: "Enabled" },
                { new: true } // Return the updated document
            );

            req.flash("BannerUpdated", "Banner Updated Successfully")
            res.redirect('/admin/banner')
        } catch (error) {
            // console.error("Error activating banner:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    deleteBanner: async (req, res) => {
        const banner = req.params.bannerID
        const result = await Banner.findOneAndDelete({ _id: banner })

        if (result) {
            // console.log(`Banner ${banner} deleted successfully`);
            req.flash("BannerDeleted", "Banner Deleted Successfully");
            res.redirect('/admin/banner');
        }
    }
    
}