const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController')
const auth = require('../middlewares/userAuth.js')


router.get('/',adminController.users)
module.exports = router