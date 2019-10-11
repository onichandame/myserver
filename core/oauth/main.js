const express = require('express')
const path = require('path')
var router=express.Router()
var output=require(path.resolve(__dirname,'output.js'))

router.get('/newuser',require(path.resolve(__dirname,'newuser.js')),output)

// deluser?client_id&secret
// POST: user id&token
router.post('/deluser',require(path.resolve(__dirname,'deluser.js')),output)

// delapp?client_id&secret
// POST: app id&token
router.post('/delapp',require(path.resolve(__dirname,'delapp.js')),output)

// resetuser?client_id&secret
// POST: user id&token
router.post('/resetuser',require(path.resolve(__dirname,'resetuser.js')),output)

// request
// POST: token
router.post('/request',require(path.resolve(__dirname,'request.js')),output)

// authorise?response_type&client_id&redirect_uri&scope
router.all('/authorise',require(path.resolve(__dirname,'authorise.js')),output)

// token?client_id&client_secret&grant_type&code&redirect_uri
router.get('/token',require(path.resolve(__dirname,'token.js')),output)

router.get('/newapp',require(path.resolve(__dirname,'newapp.js')),output)

// All above endpoints receives sid as cookies

module.exports=router
