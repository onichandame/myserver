const path=require('path')
const express = require('express')

var router=express.Router()

router.post('/login',require(path.resolve(__dirname,'login.js')))

router.post('/signup',require(path.resolve(__dirname,'signup.js')))

router.post('/activate',require(path.resolve(__dirname,'activate.js')))

/**
 * @module routers/auth
 */
module.exports=router
