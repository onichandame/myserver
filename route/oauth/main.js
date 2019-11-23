const express = require('express')
const path = require('path')

var router=express.Router()

router.get('/newuser',require(path.resolve(__dirname,'newuser.js')))

// deluser
// POST: id
router.post('/deluser',require(path.resolve(__dirname,'deluser.js')))

// delapp
// POST: id
router.post('/delapp',require(path.resolve(__dirname,'delapp.js')))

// resetuser
// POST: id/email
// GET
router.all('/resetuser',require(path.resolve(__dirname,'resetuser.js')))

// request
// GET?id
router.get('/user',require(path.resolve(__dirname,'user.js')))

// request
// GET?id
router.get('/app',require(path.resolve(__dirname,'app.js')))

// request
// GET?id&secret&<name|redirect_uri|type>
router.get('/updateapp',require(path.resolve(__dirname,'updateapp.js')))

// authorise?response_type&client_id&redirect_uri&scope
router.all('/authorise',require(path.resolve(__dirname,'authorise.js')))

// token?client_id&client_secret&grant_type&code&redirect_uri
router.get('/token',require(path.resolve(__dirname,'token.js')))

router.get('/newapp',require(path.resolve(__dirname,'newapp.js')))

// All above endpoints receives Authorisation header for security

module.exports=router
