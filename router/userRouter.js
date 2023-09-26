const express=require('express')
const path = require('path')
const router=express.Router()
const userController = require('../controller/userController')
const auth = require('../middlewares/userAuth.js')


router.get('/',userController.landingPage)

router.get('/signup',auth.userExist,userController.getSignup)

router.post('/signup',userController.postSignup)

router.get('/verifyEmail',auth.userExist,userController.verifyEmail)
router.post('/verifyEmail',userController.otpAuth)
router.get('/resendOtp',userController.resendOtp)
// Existing user
router.get('/login',auth.userExist,userController.login)
router.post('/login',userController.homeByLogin)

router.get('/shop',userController.shop)

router.get('/productPage',userController.productPage)

module.exports = router