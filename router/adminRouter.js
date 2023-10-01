const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController')
const auth = require('../middlewares/userAuth.js')
const upload = require('../middlewares/upload.js')
const userController = require('../controller/userController')


//admin users 
router.get('/users',adminController.users)
router.get('/users/:id',adminController.postUsers)

//add admin 
router.get('/addAdmin',adminController.addAdmin)
router.post('/addAdmin',adminController.postaddAdmin)



router.get('/addProduct',adminController.getAddProduct)
router.post('/addProduct',upload.array('images',3),adminController.postAddProduct)

router.get('/editProduct',adminController.editProduct)
router.post('/editProduct/:id',upload.array('images',3),adminController.postEditProduct)

router.get('/productView',adminController.getProductview)
router.get('/productView/:id',adminController.postProductview)


module.exports = router