const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController')
const upload = require('../middlewares/upload.js')
const userController = require('../controller/userController')
const auth = require('../middlewares/adminAuth')


//admin users 
router.get('/users',auth.adminTokenAuth,adminController.users)
router.get('/users/:id',adminController.postUsers)

//add admin 
router.get('/addAdmin',adminController.addAdmin)
router.post('/addAdmin',adminController.postaddAdmin)

router.get('/login',auth.adminExist,adminController.login)
router.post('/login',adminController.postLogin)

router.get('/addCategory',adminController.addCatogory)
router.post('/addCategory',upload.single('Images',1),adminController.postaddCategory)

router.get('/editCategory/:id',auth.adminTokenAuth,adminController.editCategory)
router.post('/editCategory/:id',upload.single('Images',1),adminController.postEditCategory)

router.get('/viewCategory',auth.adminTokenAuth,adminController.viewCategory)
router.get('/viewCategory/:id',adminController.postViewCategory)

router.get('/addProduct',adminController.getAddProduct)
router.post('/addProduct',upload.array('images',3),adminController.postAddProduct)

router.get('/editProduct/:id',adminController.editProduct)
router.post('/editProduct/:id',upload.array('Images',3),adminController.postEditProduct)

router.get('/productView',auth.adminTokenAuth,adminController.getProductview)
router.get('/productView/:id',adminController.postProductview)

router.get('/orderDetials',auth.adminTokenAuth,adminController.orderTable)
router.put('/order/update-status/:orderId',adminController.updateStatus)
router.get('/order/details/:orderId',adminController.orderViewMore)



module.exports = router