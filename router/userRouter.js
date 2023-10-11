const express=require('express')
const path = require('path')
const router=express.Router()
const userController = require('../controller/userController')
const auth = require('../middlewares/userAuth.js')

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
router.get('/product/:id',userController.getproduct)

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
router.get('/cart',auth.userTokenAuth,userController.cart)
router.get('/addToCart/:id',auth.userTokenAuth,userController.addtoCart)
router.get('/deleteItem/:id',userController.deleteFromCart)
router.post('/updateQuantity',userController.updatingQuantity)
router.post('/cart',auth.userTokenAuth,userController.postCart)

//orderDetials
router.get('/orderDetials',auth.userTokenAuth,userController.orderDetials)

router.get('/category/:id',auth.userTokenAuth,userController.categoryBased)
//CheckOut page
router.get('/checkOut',auth.userTokenAuth,userController.checkout)
router.post('/orderPlaced',auth.userTokenAuth,userController.postCheckOut)

//add address
router.get('/addAddress',auth.userTokenAuth,userController.addAddress)
router.post('/addAddress',auth.userTokenAuth,userController.postaddAddress)

//edit Address
router.get('/Address',auth.userTokenAuth,userController.editAddress)
router.post('/editAddress/:addressId',auth.userTokenAuth,userController.postEditAddress)

//delete Address
router.get('/deleteAddress/:id',auth.userTokenAuth,userController.deleteAddress)

//order Placed
router.get('/orderPlaced',auth.userTokenAuth,userController.orderSuccess)

//order History
router.get('/orderHistory',auth.userTokenAuth,userController.orderHistory)

//order detialed view
router.get('/order/:id',auth.userTokenAuth,userController.orderDetialedView)


router.get('/cancelOrder/:id',auth.userTokenAuth,userController.cancelOrder)
//profile

module.exports = router