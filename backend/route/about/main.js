const express = require('express')
const path = require('path')

var router=express.Router()

router.get('/contact',require(path.resolve(__dirname,'avatar.js')))

router.get('/legal',require(path.resolve(__dirname,'person.js')))

router.get('/announcement',require(path.resolve(__dirname,'experience.js')))

module.exports=router
