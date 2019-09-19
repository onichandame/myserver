const express = require('express')
const path = require('path')
var router=express.Router()
var output=path.resolve(__dirname,'output.js')

router.all('/newuser',require(path.resolve(__dirname,'newuser.js')),output)

router.all('/authenticate',require(path.resolve(__dirname,'authenticate.js')),output)

router.all('/activate',require(path.resolve(__dirname,'activate.js')),output)

router.all('/newapp',require(path.resolve(__dirname,'newapp.js')),output)

module.exports=router
