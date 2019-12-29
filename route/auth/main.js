const path=require('path')
const express = require('express')

var router=express.Router()

router.get('/login',require(path.resolve(__dirname,'login.js')))

/**
 * @module routers/auth
 */
module.exports=router
