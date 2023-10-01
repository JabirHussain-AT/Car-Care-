const express=require('express')
const path = require('path')
const router=express.Router()
const userController = require('../controller/userController')
const auth = require('../middlewares/userAuth.js')


router.get('/',userController.landingPage)

router.get('/signup',auth.userExist,userController.getSignup)

router.post('/signup',userController.postSignup)

router.get('/product/:id',userController.getproduct)

router.get('/verifyEmail',auth.userExist,userController.verifyEmail)
router.post('/verifyEmail',userController.otpAuth)
router.get('/resendOtp',userController.resendOtp)
// Existing user
router.get('/login',auth.userExist,userController.login)
router.post('/login',userController.postLogin)

 router.get('/logout',userController.logout)
router.get('/shop',userController.shop)

router.get('/forgetPass',userController.forgetPass)
router.post('/forgetPass',userController.postForgetPass)
router.get('/forgetOtp',userController.forgetOtp)
router.post('/forgetOtp',userController.forgetOtp)

module.exports = router