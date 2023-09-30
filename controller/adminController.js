const Users = require('../models/userSchema')
const Admin = require('../models/adminSchema')
const Product = require('../models/productSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()




module.exports = {
    users: async (req, res) => {
        const search = req.query.searchN || ''
        try {

            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;
        
            // Query the database for products, skip and limit based on the pagination
            const users = await Users.find()
              .skip(skip)
              .limit(perPage).lean();
        
            const totalCount = await Users.countDocuments(); 
        
            res.render('admin/admin-users', {
              users,
              currentPage: page,
              perPage,
              totalCount,
              totalPages: Math.ceil(totalCount / perPage),
            });
            
        }
        catch (error) {
            console.log(error.message)
        }
        // res.render('admin/admin-users')
    },
    getProductview : async(req,res)=>{
        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;
        
            // Query the database for products, skip and limit based on the pagination
            const products = await Product.find()
              .skip(skip)
              .limit(perPage).lean();
        
            const totalCount = await Product.countDocuments(); 
        
            res.render('admin/admin-productView', {
              products,
              currentPage: page,
              perPage,
              totalCount,
              totalPages: Math.ceil(totalCount / perPage),
            });
       
    },
    postProductview :async(req,res)=>{
        try{
            const id = req.params.id;
         const productStatus = await Product.findById(id)
         if(productStatus.Display === "Active") {
            await Product.updateOne({_id:id},{Display :"Inactive"})
            res.redirect('/admin/productView')
         }
         else {
            await Product.updateOne({ _id: id }, { Display: 'Active' })
            // console.log(productStatus);
            res.redirect('/admin/productView')
        }
        }
        catch(error)
        {
            console.log("error in product display");
            throw error
        }
         
    },
    postUsers: async (req, res) => {
        try {

            const id = req.params.id
            console.log(req.params.id);
            const userData = await Users.findById(id)
            console.log(userData);
            if (userData.Status === "Active") {
                await Users.updateOne({ _id: id }, { Status: 'Deactivated' })
                req.session.destroy()
                console.log(userData);
                res.redirect('/admin/users')
            } else {
                await Users.updateOne({ _id: id }, { Status: 'Active' })
                console.log(userData);
                res.redirect('/admin/users')
            }
        } catch (error) {
            throw error
        }

    },
    addAdmin: async (req, res) => {
        res.render('admin/admin-addAdmin',{message:req.flash()})
    },
    postaddAdmin : async (req,res)=>{
        // req.body.Email = req.session.email
        
        if (req.body.Password === req.body.ConfirmPassword) {

            try {
        //         const userStatus = await Users.findOne({Email:req.body.email})
        // if(userStatus. == "Active" )
        // {
                req.body.Password = bcrypt.hashSync(req.body.Password, 10)
                const AdminData = await Admin.create(req.body)
                console.log(AdminData);
                // if (userData) {
                //     const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                //     res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                //     console.log("ivde ethi ?")
                //     res.render('user/landingPage', { user: true })
                // } else {
                //     console.log("anirudh");
                // }
            // }else{
            //     req.flash('banned','sorry you are banned by the admin')
            //     res.redirect('/signup')
            // }
            } catch (error) {
                console.log(error);
                if (error.code === 11000) {
                    req.session.error = "USer exists"
                    res.redirect('/admin/addAdmin')
                }
            }
        } else {

            req.flash('error', "password not matching")
            res.redirect('/admin/addAdmin') 
        }
    },
    getAddProduct :(req,res)=>{
        res.render('admin/admin-addProduct')
    },
    postAddProduct :async(req,res)=>{
        console.log(req.body)
            console.log(req.files)
        try{
            const productType = req.body.productType

            const variations = []
            console.log(req.body);
            if(productType==='Tyre'){

                const tyreSize = req.body.Tyre;

                variations.push({value:tyreSize})
            } else if(productType === 'Oil'){
                console.log("inside oil");
                const oilSize = req.body.Oil;
                variations.push({value:oilSize})
            }
            console.log(variations);
            req.body.Variation = variations[0].value
            req.body.images = req.files.map(val => val.filename)
            req.body.Display = "Active"
            req.body.Status ="in Stock"
            req.body.UpdatedOn = new Date();
            const uploaded = await Product.create(req.body)
            res.redirect('/admin/productView')

        }
        catch(error)
        {
            console.log('An Error happened');
            throw error
        }
    },
    editProduct :async(req,res)=>{
        const product = await Product.find()
        res.render('admin/admin-editProduct',{product:product[0]})
    },
    postEditProduct : async (req,res)=>{
        console.log(req.params.id);
        console.log(req.body)
            console.log(req.files)
        try{
            const id=req.params.id
            const productType = req.body.productType

            const variations = []
            console.log(req.body);
            if(productType==='Tyre'){

                const tyreSize = req.body.Tyre;

                variations.push({value:tyreSize})
            } else if(productType === 'Oil'){
                console.log("inside oil");
                const oilSize = req.body.Oil;
                variations.push({value:oilSize})
            }
            console.log(variations);
            req.body.Variation = variations[0].value
            req.body.images = req.files.map(val => val.filename)
            req.body.Display = "Active"
            req.body.Status ="in Stock"
            req.body.updateOn = new Date();
            const updatingProduct = await Product.findOneAndUpdate({_id:id},
                (req.body)
            )
                    
            res.redirect('/admin/productView')

        }
        catch(error)
        {
            console.log('An Error happened');
            throw error
        }
    }
    

}