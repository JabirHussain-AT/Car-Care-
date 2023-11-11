const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController')
const upload = require('../middlewares/upload.js')
const userController = require('../controller/userController')
const bannerController = require('../controller/bannerController')
const couponController = require('../controller/couponController')
const auth = require('../middlewares/adminAuth')
const orderController = require('../controller/orderController')
const offerController = require('../controller/offerController.js')


//admin users 
router.get('/users',auth.adminTokenAuth,adminController.users)
router.get('/users/:id',adminController.postUsers)

//add admin 
router.get('/addAdmin',adminController.addAdmin)
router.post('/addAdmin',adminController.postaddAdmin)

router.get('/login',auth.adminExist,adminController.login)
router.post('/login',adminController.postLogin)

router.get('/Dashboard',auth.adminTokenAuth,adminController.Dashboard)
router.get('/download-sales-report',auth.adminTokenAuth,adminController.salesReport)
router.get('/download-salesReport-pdf',auth.adminTokenAuth,adminController.salesReportPdf)


router.get('/count-orders-by-day',auth.adminTokenAuth,adminController.getCount)
router.get('/count-orders-by-month',auth.adminTokenAuth,adminController.getCount)
router.get('/count-orders-by-year',auth.adminTokenAuth,adminController.getCount)

router.get('/categorySales-by-day',auth.adminTokenAuth,adminController.getCategorySales)
router.get('/categorySales-by-month',auth.adminTokenAuth,adminController.getCategorySales)
router.get('/categorySales-by-year',auth.adminTokenAuth,adminController.getCategorySales)

router.get('/paymentSales-by-day',auth.adminTokenAuth,adminController.getpaymentSales)
router.get('/paymentSales-by-month',auth.adminTokenAuth,adminController.getpaymentSales)
router.get('/paymentSales-by-year',auth.adminTokenAuth,adminController.getpaymentSales)

router.get('/addCategory',adminController.addCatogory)
router.post('/addCategory',upload.single('Images',1),adminController.postaddCategory)

//add category offer
router.post('/addCategoryOffer',auth.adminTokenAuth,offerController.addCategoryOffer)
router.post('/editCategoryOffer/:id',auth.adminTokenAuth,offerController.editCategoryOffer)
router.post('/editCategoryOfferStatus/:id',auth.adminTokenAuth,offerController.editCategoyOfferStatus)


router.get('/editCategory/:id',auth.adminTokenAuth,adminController.editCategory)
router.post('/editCategory/:id',upload.single('Images',1),adminController.postEditCategory)

router.get('/viewCategory',auth.adminTokenAuth,adminController.viewCategory)
router.get('/viewCategory/:id',adminController.postViewCategory)

router.get('/addProduct',adminController.getAddProduct)
router.post('/addProduct',upload.array('images',3),adminController.postAddProduct)

router.get('/editProduct/:id',adminController.editProduct)
router.post('/editProduct/:id',upload.fields([
    {name:'image1',maxCount:1},
    {name:'image2',maxCount:1},
    {name:'image3',maxCount:1},

]),adminController.postEditProduct)

router.get('/productView',auth.adminTokenAuth,adminController.getProductview)
router.get('/productView/:id',adminController.postProductview)

//add varient 
router.get('/addVariant/:productId',auth.adminTokenAuth,adminController.addVariants)
router.post('/addVarient/:productId',upload.array('images',3),adminController.postaddVarient)

router.get('/orderDetials',auth.adminTokenAuth,adminController.orderTable)
router.put('/order/update-status/:orderId',adminController.updateStatus)
router.get('/order/details/:orderId',adminController.orderViewMore)

router.get('/banner',auth.adminTokenAuth,bannerController.banner)

//offers referal and category
router.post('/add-referal-Offers',auth.adminTokenAuth,offerController.addReferaloffers)
router.post('/edit-referal-offer/:id',auth.adminTokenAuth,offerController.editReferaloffers)
router.get('/offers',auth.adminTokenAuth,offerController.offers)
router.get('/offers/:id',auth.adminTokenAuth,offerController.changeStatusOfoffers)


router.get('/addBanner',auth.adminTokenAuth,bannerController.addBanner)
router.post('/addBanner',auth.adminTokenAuth,upload.fields([
    { name: 'Image', maxCount: 1 },
    { name: 'carouselImage1', maxCount: 1 },
    { name: 'carouselImage2', maxCount: 1 },
    { name: 'carouselImage3', maxCount: 1 },
]),bannerController.submitAddBanner)

//banner activate ,delete
router.post('/activate-banner/:bannerID',auth.adminTokenAuth,bannerController.activateBanner)
router.post('/delete-banner/:bannerID',auth.adminTokenAuth,bannerController.deleteBanner)



//delete coupon
router.post('/delete-coupon/:couponId',auth.adminTokenAuth,couponController.deleteCoupon)

//add coupon
router.get('/addCoupon',auth.adminTokenAuth,couponController.addCoupons)
router.post('/addCoupon',auth.adminTokenAuth,couponController.postaddCoupons)

//edit coupon
router.get('/editCoupon/:id',auth.adminTokenAuth,couponController.editCoupon)
router.post('/editCoupon/:id',auth.adminTokenAuth,couponController.posteditCoupon)

//coupons
router.get('/Coupons',auth.adminTokenAuth,couponController.Coupons)

//return requests
router.get('/manage-return-requests',auth.adminTokenAuth,orderController.manageReturn)
router.get('/reject-return-request/:orderId',auth.adminTokenAuth,orderController.rejectReturn)
router.get('/return-accepted/:orderId',auth.adminTokenAuth,orderController.acceptReturn)
router.get('/return-order-detials/:orderId',auth.adminTokenAuth,orderController.viewReturnProducts)
router.get('/verify-return/:orderId',auth.adminTokenAuth, orderController.verifyReturn)

//review management 
router.get('/review-manage',auth.adminTokenAuth,adminController.reviewManagement)
router.get('/delete-review/:id',auth.adminTokenAuth,adminController.deleteReview)

router.get('/logout',auth.adminTokenAuth,adminController.logout)



module.exports = router