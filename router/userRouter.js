const express=require('express')
const path = require('path')
const router=express.Router()
const userController = require('../controller/userController')
const couponController = require('../controller/couponController')
const auth = require('../middlewares/userAuth.js')
const paymentController= require('../controller/paymentController')
const orderController = require('../controller/orderController')
const cartController = require('../controller/cartController')
const walletController = require('../controller/walletController')
const reviewController = require('../controller/reviewController')
const wishlistController = require('../controller/wishlistController')

//landing page
router.get('/',auth.userTokenAuth,userController.landingPage)

//home page
router.get('/home',auth.userTokenAuth,userController.home)

//Profile Page
router.get('/profile',auth.userTokenAuth,userController.profile)
router.post('/profile',auth.userTokenAuth,userController.postProfile)

//signup
router.get('/signup',auth.userExist,userController.getSignup)
router.post('/signup',userController.postSignup)

//product page
router.get('/product/:id',auth.userTokenAuth,userController.getproduct)

//verifyEmail and ot[]
router.get('/verifyEmail',userController.verifyEmail)
router.post('/verifyEmail',userController.otpAuth)
router.get('/resendOtp',userController.resendOtp)

// Existing user
router.get('/login',auth.userExist,userController.login)
router.post('/login',userController.postLogin)

//logout
router.get('/logout',userController.logout)

//shop
router.get('/shop',userController.shop)

//wishlist
router.get('/wishlist',auth.userTokenAuth,wishlistController.wishlist)
router.post('/wishlist/:id',auth.userTokenAuth,wishlistController.AddToWishlist)
router.get('/removeFromWishlist/:id',auth.userTokenAuth,wishlistController.RemoveFromWishList)

//forget Password
router.get('/forgetPass',userController.forgetPass)
router.post('/forgetPass',userController.postForgetPass)
router.get('/forgetOtp',userController.forgetOtp)
router.post('/forgetOtp/:email',userController.postforgetOtp)
router.get('/setNewPass/:email',userController.setNewPass)
router.post('/setNewPass/:email',userController.postsetNewPass)

//change Password
router.post('/changePassword',auth.userTokenAuth,userController.changePassword)


//cart
router.get('/cart',auth.userTokenAuth,cartController.cart)
router.get('/addToCart/:id',auth.userTokenAuth,cartController.addtoCart)
router.get('/deleteItem/:id',auth.userTokenAuth,cartController.deleteFromCart)
router.post('/updateQuantity',cartController.updatingQuantity)
router.post('/cart',auth.userTokenAuth,cartController.postCart)

//orderDetials
router.get('/orderDetials',auth.userTokenAuth,orderController.orderDetials)

router.get('/category/:id',auth.userTokenAuth,userController.categoryBased)
//CheckOut page
router.get('/checkOut',auth.userTokenAuth,userController.checkout)
router.post('/checkOut',auth.userTokenAuth,userController.postCheckOut)

//add address
router.get('/addAddress',auth.userTokenAuth,userController.addAddress)
router.post('/addAddress',auth.userTokenAuth,userController.postaddAddress)

//checkout time address creation post 
router.post('/checKoutaddAddress',auth.userTokenAuth,userController.postCheckAddAddress)


//edit Address
router.get('/Address',auth.userTokenAuth,userController.editAddress)
router.post('/editAddress/:addressId',auth.userTokenAuth,userController.postEditAddress)

//delete Address
router.get('/deleteAddress/:id',auth.userTokenAuth,userController.deleteAddress)

//order Placed
router.get('/orderPlaced/:id',auth.userTokenAuth,orderController.orderSuccess)

//order History
router.get('/orderHistory',auth.userTokenAuth,orderController.orderHistory)

//order detialed view
router.get('/order/:id',auth.userTokenAuth,orderController.orderDetialedView)

//invoice download 
router.post('/download-invoice',orderController.downloadInvoice)
router.get('/download-invoice/:id',auth.userTokenAuth,orderController.downloadfile)

//cancel order 
router.get('/cancelOrder/:id',auth.userTokenAuth,orderController.cancelOrder)


// router.post('/onlinePayment',auth.userTokenAuth,paymentController.OnlinePayment1)
router.post('/verify-payment',auth.userTokenAuth,paymentController.verifypayment)


//coupon validation
router.post('/validateCoupon',auth.userTokenAuth,couponController.validateCoupon) 

router.post('/removeCouponapplied',auth.userTokenAuth,couponController.removeAppliedCoupon)
//return order
router.post('/returnRequest/:id',auth.userTokenAuth,orderController.returnOrder) 

//user WalletHistory
router.get('/view-wallet-history',auth.userTokenAuth,walletController.walletHistory)

//submit Review
router.post('/submit-review',auth.userTokenAuth,reviewController.submitReview)

router.get('/confirmStock',auth.userTokenAuth,cartController.confirmStock)

module.exports = router