const express = require('express')
const path = require('path')
var router=express.Router()

router.get('/newuser',require(path.resolve(__dirname,'newuser.js')))

// deluser?client_id&secret
// POST: user id&token
router.post('/deluser',require(path.resolve(__dirname,'deluser.js')))

// delapp?client_id&secret
// POST: app id&token
router.post('/delapp',require(path.resolve(__dirname,'delapp.js')))

// resetuser?client_id&secret
// POST: user id&token
router.post('/resetuser',require(path.resolve(__dirname,'resetuser.js')))

// request
// POST: token
router.post('/request',require(path.resolve(__dirname,'request.js')))

// authorise?response_type&client_id&redirect_uri&scope
router.all('/authorise',require(path.resolve(__dirname,'authorise.js')))

// token?client_id&client_secret&grant_type&code&redirect_uri
router.get('/token',require(path.resolve(__dirname,'token.js')))

router.get('/newapp',require(path.resolve(__dirname,'newapp.js')))

// All above endpoints receives sid as cookies

module.exports=router
