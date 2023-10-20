const Users = require('../models/userSchema')
const Admin = require('../models/adminSchema')
const Orders = require('../models/orderSchema')
const Product = require('../models/productSchema')
const Category = require('../models/categorySchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const moment = require('moment')
require('dotenv').config()




module.exports = {
    users: async (req, res) => {
        const search = req.query.search || ''
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
    login: (req, res) => {
        res.render('admin/adminLogin',{message:req.flash()})
    },
    postLogin: async (req, res) => {
        try {
            //super admin
            if (req.body.Password == process.env.SUPADM_PASS && req.body.Email == process.env.SUPER_ADMIN) {
                res.redirect('/admin/addAdmin')
            }
            //admin
            console.log(req.body)
            const Email = req.body.Email
            const admin = await Admin.findOne({ Email: Email })
            if (admin) {
                Password = await bcrypt.compare(req.body.Password, admin.Password)
                if (admin.Email === req.body.Email && Password) {
                    console.log('admin is fine');
                    const accessToken = jwt.sign({ user: admin._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
                    res.cookie("adminJwt", accessToken, { maxAge: 60 * 1000 * 60 })
                    console.log("hey admin here")
                    req.session.admin = admin
                    res.redirect('/admin/users')
                } else {

                    req.flash("notMatching", ' password not matching')
                    res.redirect('/admin/login')
                }
            } else {
                req.flash("error", ' there is no such email')
                res.redirect('/admin/login')
            }
        } catch {
            console.log("its error in admin login catch")
        }

    },
    getProductview: async (req, res) => {
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
    postProductview: async (req, res) => {
        try {
            const id = req.params.id;
            const productStatus = await Product.findById(id)
            if (productStatus.Display === "Active") {
                await Product.updateOne({ _id: id }, { Display: "Inactive" })
                res.redirect('/admin/productView')
            }
            else {
                await Product.updateOne({ _id: id }, { Display: 'Active' })
                // console.log(productStatus);
                res.redirect('/admin/productView')
            }
        }
        catch (error) {
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
        res.render('admin/admin-addAdmin', { message: req.flash() })
    },
    postaddAdmin: async (req, res) => {
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
    getAddProduct: (req, res) => {
        res.render('admin/admin-addProduct')
    },
    postAddProduct: async (req, res) => {
        console.log(req.body)
        console.log(req.files)
        try {
            const productType = req.body.productType

            const variations = []
            console.log(req.body);
            if (productType === 'Tyre') {

                const tyreSize = req.body.Tyre;

                variations.push({ value: tyreSize })
            } else if (productType === 'Oil') {
                console.log("inside oil");
                const oilSize = req.body.Oil;
                variations.push({ value: oilSize })
            }
            console.log(variations);
            req.body.Variation = variations[0].value
            req.body.images = req.files.map(val => val.filename)
            req.body.Display = "Active"
            req.body.Status = "in Stock"
            const newDate= new Date()
            req.body.UpdatedOn = moment(newDate).format('MMMM Do YYYY, h:mm:ss a')
            const uploaded = await Product.create(req.body)
            res.redirect('/admin/productView')

        }
        catch (error) {
            console.log('An Error happened');
            throw error
        }
    },
    editProduct: async (req, res) => {
        const id = req.params.id
        const product = await Product.findOne({ _id: id })
        console.log(Product);
        res.render('admin/admin-editProduct', { product: product })
    },
    postEditProduct: async (req, res) => {
        console.log(req.params.id);
        console.log(req.body)
        console.log(req.files)
        const {existingImage1,existingImage2,existingImage3}=req.body
        try {
            const id = req.params.id
            const productType = req.body.productType

            const variations = []
            console.log(req.body);
            if (productType === 'Tyre') {

                const tyreSize = req.body.Tyre;

                variations.push({ value: tyreSize })
            } else if (productType === 'Oil') {
                console.log("inside oil");
                const oilSize = req.body.Oil;
                variations.push({ value: oilSize })
            }
            console.log(variations);
            req.body.Variation = variations[0].value
            
            // req.body.images = req.files.map(val => val.filename)
            req.body.images = [existingImage1,existingImage2,existingImage3]
            req.body.Display = "Active"
            req.body.Status = "in Stock"
            req.body.updateOn = moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')
            const updatingProduct = await Product.findOneAndUpdate({ _id: id },
                (req.body)
            )

            res.redirect('/admin/productView')

        }
        catch (error) {
            console.log('An Error happened');
            throw error
        }
    },
    addCatogory: (req, res) => {
        console.log("yes");
        res.render('admin/addCatogory',{message:req.flash()})
    },
    postaddCategory: async (req, res) => {
        const { Name} = req.body
        try {
            const category = await Category.findOne({ Name: { $regex: new RegExp('^' + Name + '$', 'i') } })
            if(category)
            {
                req.flash("Category","Category Already Exists..")
                res.redirect('/admin/addCategory')
            }else{
          
                console.log(req.file,"file upload")
                req.body.Images = req.file.filename
           
            console.log(req.body.Images)
            const uploaded = await Category.create({
                Name: Name,
                Images: req.body.Images
            })
            res.redirect('/admin/viewCategory')
            }  
        
        }
        catch (error) {
            throw error
        }
    },
    viewCategory: async (req, res) => {

        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 10; // Number of items per page
        const skip = (page - 1) * perPage;

        // Query the database for products, skip and limit based on the pagination
        const Categories = await Category.find()
            .skip(skip)
            .limit(perPage).lean();

        const totalCount = await Category.countDocuments();

        res.render('admin/viewCategory', {
            Categories,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
        });

    },
    postViewCategory: async (req, res) => {
        try {

            const id = req.params.id;
            const CategoryDisplay = await Category.findById(id)
            if (CategoryDisplay.Display === "Active") {
                await Category.updateOne({ _id: id }, { Display: "Inactive" })
                res.redirect('/admin/viewCategory')
            }
            else {
                await Category.updateOne({ _id: id }, { Display: "Active" })
                // console.log(productStatus);
                res.redirect('/admin/viewCategory')
            }

        } catch (error) {
            throw error
        }


    },
    editCategory: async (req, res) => {
        try{
            const id = req.params.id
            const catogory = await Category.findOne({ _id: id })
            console.log(catogory,"is it here?")
            res.render('admin/editCategory', { category: catogory})
        }catch(error)
        {
            console.log("error in the edit category catch")
        }
       
    },
    postEditCategory: async (req, res) => {
        try {
            const id = req.params.id
            console.log(req.file)
            const update = await Category.findOneAndUpdate({
                _id: id
            }, {
                Name: req.body.ProductName,
                Images:  req.file.filename
            })
            res.redirect('/admin/viewCategory')
        }
        catch (error) {
            throw error
        }
    },
    orderTable:async(req,res)=>{
        try {

            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;
            const  returnRequested = await Orders.find({ Status: 'Return Requested' })
            // Query the database for products, skip and limit based on the pagination
            const order = await Orders.find()
                .skip(skip)
                .limit(perPage).lean();

            const totalCount = await Users.countDocuments();

            res.render('admin/orderDetials', {
                order,
                returnRequested,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });

        }
        catch (error) {
            console.log(error.message ,"from ordertable admin catch")
        }
       
        // res.render('admin/orderDetials',{order:orders})
    },
    updateStatus: async (req, res) => {
        const orderId = req.params.orderId;
        const { status } = req.body;
    
        try {
            // Update the order status in the database
            const updatedOrder = await Orders.findByIdAndUpdate(orderId, { Status: status }, { new: true });
    
            // If the status is "Delivered," update the payment status to "paid"
            if (status.toLowerCase() === 'delivered') {
                updatedOrder.DeliveredDate = moment(new Date()).format('llll')
                updatedOrder.LastReturnDate =  moment().add(14, 'days').format('llll'),
                updatedOrder.PaymentStatus = 'Paid';
            }else{
                updatedOrder.PaymentStatus = 'Pending';
            }
    
            // If the status is "rejected," update the payment status to "order rejected"
            if (status.toLowerCase() === 'rejected') {
                updatedOrder.PaymentStatus = 'order rejected';
            }
    
            // Save the changes to the order
            await updatedOrder.save();
    
            // Respond with the updated order
            res.json(updatedOrder);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    orderViewMore:async (req,res)=>{
        const orderId = req.params.orderId
        const orderDetials  = await Orders.findOne({_id:orderId}).populate("Products.ProductId")
        // console.log(orderDetials)
        res.render('admin/admin- orderDetials',{order:orderDetials})

    }
}

