const Users = require('../models/userSchema')
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const pdf = require('html-pdf');
const fs = require('fs');
const VariantConnector = require('../utilty/variantConnector')
const Admin = require('../models/adminSchema')
const Orders = require('../models/orderSchema')
const Product = require('../models/productSchema')
const Category = require('../models/categorySchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const moment = require('moment')
const variantConnector = require('../utilty/variantConnector')
const pdfMaker = require('../utilty/salesReportPdf')
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
        res.render('admin/adminLogin', { message: req.flash() })
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
    Dashboard: async (req, res) => {
        try {
            // const orders = await Orders.find().limit(10)
            // res.render('admin/dashboard',{orders:orders})
            const bestSeller = await Orders.aggregate([
                {
                    $unwind: "$Products",
                },
                {
                    $group: {
                        _id: "$Products.ProductId",
                        totalCount: { $sum: "$Products.Quantity" },
                    },
                },
                {
                    $sort: {
                        totalCount: -1,
                    },
                },
                {
                    $limit: 10,
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "productDetails",
                    },
                },
                {
                    $unwind: "$productDetails",
                },
            ]);
            console.log(bestSeller, 'JHijediufuier')
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;

            // Query the database for products, skip and limit based on the pagination
            const orders = await Orders.find()
                .skip(skip)
                .limit(perPage).lean();

            const totalCount = await Orders.countDocuments();

            res.render('admin/dashboard', {
                bestSeller,
                orders,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });
        } catch (error) {
            console.log(error, "from the catch of admin dashboard")
        }
    },
    salesReport: async (req, res) => {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        console.log(startDate,endDate,"jfsdjfjfsdjhhhsghghgg")



      





        const generateSalesData = async () => {
            try {
                // Fetch orders data from the database
                const orders = await Orders.find({
                    DeliveredDate: { $exists: true },
                    PaymentStatus: 'Paid',
                    OrderedDate: {
                        $gte: moment.utc(startDate).format("llll"),
                        $lte: moment.utc(endDate).format("llll"),
                    },
                }).populate('Products.ProductId');
                    
             // Filter by payment status
              
                console.log(orders,"order is coming or not")

                // Map orders data to the required format for Excel
                return orders.map(order => {
                    const products = order.Products.map(product => ({
                        product: product.ProductId.ProductName,
                        quantity: product.Quantity,
                        userId: order.UserId,
                        price: product.ProductId.DiscountAmount,
                        total: product.Quantity * product.ProductId.DiscountAmount,
                    }));

                    // Calculate total amount for the order
                    const totalAmount = products.reduce((total, product) => total + product.total, 0);

                    return {
                        order: order._id,
                        orderedDate: order.OrderedDate, // Add the ordered date
                        products,
                        totalAmount,
                    };
                });
            } catch (error) {
                throw error;
            }
        };

        try {
            // Generate Excel Report
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

            // Add some sample data
            worksheet.columns = [
                { header: 'User Id', key: 'User', width: 30 },
                { header: 'Order', key: 'order', width: 30 },
                { header: 'Ordered Date', key: 'orderedDate', width: 30 }, // Add Ordered Date column
                { header: 'Price', key: 'price', width: 10 },
                { header: ' ₹ Total Sales ', key: 'total', width: 15 },
            ];

            const salesData = await generateSalesData();

            // Add sales data to the worksheet
            let totalAmount = 0; // Initialize total amount for each order
            salesData.forEach(order => {
                order.products.forEach(product => {
                    worksheet.addRow({
                        User: product.userId,
                        order: order.order,
                        orderedDate: order.orderedDate, // Include ordered date
                        price: order.totalAmount,
                        total: totalAmount += order.totalAmount, // Sum of each order's total amount
                    });
                });
            });

            // Set response headers for Excel download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

            // Send the workbook as a buffer
            workbook.xlsx.write(res).then(() => {
                res.end();
            });
        } catch (err) {
            console.log(err, 'err in the sales report');
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
    addVariants: async (req, res) => {
        const id = req.params.productId
        const product = await Product.findOne({ _id: id })
        // console.log(Product);
        res.render('admin/addVarient', { product: product })
    },
    postaddVarient: async (req, res) => {
        console.log(req.body, "req.body")
        console.log(req.files, "req.files")

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
        const newDate = new Date()
        req.body.UpdatedOn = moment(newDate).format('MMMM Do YYYY, h:mm:ss a')
        const createdProduct = await Product.create(req.body)
        // Now Call the function to Create Connention of varients
        // console.log( createdProduct._id,"Created Product")
        const mainProductId = new mongoose.Types.ObjectId(req.params.productId)
        const connected = variantConnector.VariantConnector(mainProductId, createdProduct._id)


        res.redirect('/admin/productView')

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
           

            // const variations = []
            // console.log(req.body);
            // if (productType === 'Tyre') {

            //     const tyreSize = req.body.Tyre;

            //     variations.push({ value: tyreSize })
            // } else if (productType === 'Oil') {
            //     console.log("inside oil");
            //     const oilSize = req.body.Oil;
            //     variations.push({ value: oilSize })
            // }
            // console.log(variations);
            if(req.body.Variation1 === '')
            {
                 req.body.Variation = req.body.Variation2
            }else{
                req.body.Variation = req.body.Variation1
            }
            req.body.images = req.files.map(val => val.filename)
            req.body.Display = "Active"
            req.body.Status = "in Stock"
            const newDate = new Date()
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
        const { existingImage1, existingImage2, existingImage3 } = req.body
        try {
            const id = req.params.id
           
            let images = [];
            const existingProduct = await Product.findById(id);
            if (existingProduct) {
                images.push(...existingProduct.images);
            }
            //updating again if its having
            for (let i = 0; i < 3; i++) {
                const fieldName = `image${i + 1}`;
                if (req.files[fieldName] && req.files[fieldName][0]) {
                    images[i] = req.files[fieldName][0].filename;
                }
            }

           



            if(req.body.Category ==='Lubricants')
            {
                 req.body.Variation = req.body.Variation2
            }else{
                req.body.Variation = req.body.Variation1
            }

            // req.body.images = req.files.map(val => val.filename)
            req.body.images = images
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
        res.render('admin/addCatogory', { message: req.flash() })
    },
    postaddCategory: async (req, res) => {
        const { Name } = req.body
        try {
            const category = await Category.findOne({ Name: { $regex: new RegExp('^' + Name + '$', 'i') } })
            if (category) {
                req.flash("Category", "Category Already Exists..")
                res.redirect('/admin/addCategory')
            } else {

                console.log(req.file, "file upload")
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
        try {
            const id = req.params.id
            const catogory = await Category.findOne({ _id: id })
            console.log(catogory, "is it here?")
            res.render('admin/editCategory', { category: catogory })
        } catch (error) {
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
                Images: req.file.filename
            })
            res.redirect('/admin/viewCategory')
        }
        catch (error) {
            throw error
        }
    },
    orderTable: async (req, res) => {
        try {

            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;
            const returnRequested = await Orders.find({ Status: 'Return Requested' })
            // Query the database for products, skip and limit based on the pagination
            const order = await Orders.find()
                .skip(skip)
                .limit(perPage).lean();

            const totalCount = await Orders.countDocuments();
            let hasNext = false;
            let hasPrev = false;
            if (totalCount > page) {
                hasNext = true
            }
            if (page > 1) {
                hasPrev = true;
            }
            // totalPages: Math.ceil(totalCount / perPage),

            res.render('admin/orderDetials', {
                order,
                returnRequested,
                currentPage: page,
                perPage,
                totalCount,
                hasNext,
                hasPrev,
            });

        }
        catch (error) {
            console.log(error.message, "from ordertable admin catch")
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
                updatedOrder.LastReturnDate = moment().add(14, 'days').format('llll'),
                    updatedOrder.PaymentStatus = 'Paid';
            } else {
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
    orderViewMore: async (req, res) => {
        const orderId = req.params.orderId
        const orderDetials = await Orders.findOne({ _id: orderId }).populate("Products.ProductId")
        // console.log(orderDetials)
        res.render('admin/admin- orderDetials', { order: orderDetials })

    },
    reviewManagement: (req, res) => {
        const review = []
        res.render('admin/reviewManagement', { reviews: review })
    },
    getCount: async (req, res) => {
        try {
            const orders = await Orders.find({
                Status: {
                    $nin: ["Returned", "Cancelled", "Rejected"]
                }
            });
            const orderCountsByDay = {};
            const orderNumberByDay = {};
            const orderCountsByMonthYear = {};
            const orderCountsByYear = {};
            let labels;
            let data;
            let Count;
            console.log('outside')
            orders.forEach((order) => {
                console.log('inside')
                const orderDate = moment(order.OrderedDate, "ddd, MMM D, YYYY h:mm A");
                const dayMonthYear = orderDate.format("YYYY-MM-DD");
                const monthYear = orderDate.format("YYYY-MM");
                const year = orderDate.format("YYYY");

                if (req.url === "/count-orders-by-day") {
                    console.log("count");
                    // Count orders by day
                    if (!orderCountsByDay[dayMonthYear]) {
                        orderCountsByDay[dayMonthYear] = order.TotalAmount;
                    } else {
                        orderCountsByDay[dayMonthYear] += order.TotalAmount;
                    }

                    //
                    //for count or number of sales

                    if (!orderNumberByDay[dayMonthYear]) {
                        orderNumberByDay[dayMonthYear] = 1;
                    } else {
                        orderNumberByDay[dayMonthYear]++;
                    }
                    const ordersNumbersByDay = Object.keys(orderNumberByDay).map(
                        (dayMonthYear) => ({
                            _id: dayMonthYear,
                            count: orderNumberByDay[dayMonthYear],
                        })
                    );
                    Count = ordersNumbersByDay.map((entry) => entry.count);


                    //
                    const ordersByDay = Object.keys(orderCountsByDay).map(
                        (dayMonthYear) => ({
                            _id: dayMonthYear,
                            count: orderCountsByDay[dayMonthYear],
                        })
                    );
                    ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
                    labels = ordersByDay.map((entry) =>
                        moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
                    );
                    data = ordersByDay.map((entry) => entry.count);
                    // console.log(data,"data",ordersByDay,"orderby day")
                } else if (req.url === "/count-orders-by-month") {
                    // Count orders by month-year
                    if (!orderCountsByMonthYear[monthYear]) {
                        orderCountsByMonthYear[monthYear] = order.TotalAmount;
                    } else {
                        orderCountsByMonthYear[monthYear] += order.TotalAmount;
                    }
                    const ordersByMonthYear = Object.keys(orderCountsByMonthYear).map(
                        (monthYear) => ({
                            _id: monthYear,
                            count: orderCountsByMonthYear[monthYear],
                        })
                    );
                    //   
                    //
                    //for count or number of sales

                    if (!orderNumberByDay[monthYear]) {
                        orderNumberByDay[monthYear] = 1;
                    } else {
                        orderNumberByDay[monthYear]++;
                    }
                    const ordersNumbersByDay = Object.keys(orderNumberByDay).map(
                        (dayMonthYear) => ({
                            _id: dayMonthYear,
                            count: orderNumberByDay[dayMonthYear],
                        })
                    );
                    Count = ordersNumbersByDay.map((entry) => entry.count);


                    // 



                    ordersByMonthYear.sort((a, b) => (a._id < b._id ? -1 : 1));
                    labels = ordersByMonthYear.map((entry) =>
                        moment(entry._id, "YYYY-MM").format("MMM YYYY")
                    );
                    data = ordersByMonthYear.map((entry) => entry.count);
                } else if (req.url === "/count-orders-by-year") {
                    // Count orders by year
                    if (!orderCountsByYear[year]) {
                        orderCountsByYear[year] = order.TotalAmount;
                    } else {
                        orderCountsByYear[year] += order.TotalAmount;
                    }
                    const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
                        _id: year,
                        count: orderCountsByYear[year],
                    }));

                    //
                    //for count or number of sales

                    if (!orderNumberByDay[year]) {
                        orderNumberByDay[year] = 1;
                    } else {
                        orderNumberByDay[year]++;
                    }
                    const ordersNumbersByDay = Object.keys(orderNumberByDay).map(
                        (dayMonthYear) => ({
                            _id: dayMonthYear,
                            count: orderNumberByDay[dayMonthYear],
                        })
                    );
                    Count = ordersNumbersByDay.map((entry) => entry.count);


                    //


                    ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
                    labels = ordersByYear.map((entry) =>
                        moment(entry._id, "YYYY").format("YYYY")
                    );
                    data = ordersByYear.map((entry) => entry.count);
                }
            });
            console.log(data);
            console.log(labels)

            res.json({ labels, data, Count });
        } catch (err) {
            console.error(err);
        }
    },
    salesReportPdf: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            // Fetch orders data from the database for the specified date range
            console.log(moment.utc(startDate, 'llll').toISOString())
            // Convert JavaScript Date objects to the format used in MongoDB (Moment.js format)
    
            // Specify the start and end dates in JavaScript Date objects
            const orders = await Orders.find({
                DeliveredDate: { $exists: true },
                PaymentStatus: 'Paid',
                OrderedDate: {
                    $gte: moment.utc(startDate).startOf('day').format("llll"),
                    $lte: moment.utc(endDate).endOf('day').format("llll"),
                },
            }).populate('Products.ProductId');
            

            const totalAmountSum = orders.reduce((sum, order) => sum + order.TotalAmount, 0);
            // console.log(orders, "orders are this again")

            pdfMaker.downloadPdf(req, res, orders, startDate, endDate,totalAmountSum)

        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },



}
