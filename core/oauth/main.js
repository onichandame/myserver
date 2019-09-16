const express = require('express')
const path = require('path')
var router=express.Router()

router.use('/',require(path.resolve(__dirname,'output.js')))

router.all('/newuser',require(path.resolve(__dirname,'newuser.js')))

router.all('/authenticate',require(path.resolve(__dirname,'authenticate.js')))

router.all('/activate',require(path.resolve(__dirname,'activate.js')))

router.all('/newapp',require(path.resolve(__dirname,'newap.js')))

module.exports=router
