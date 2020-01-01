const express = require('express')
const path = require('path')

var router=express.Router()

router.get('/avatar',require(path.resolve(__dirname,'avatar.js')))

router.get('/person',require(path.resolve(__dirname,'person.js')))

router.get('/experience',require(path.resolve(__dirname,'experience.js')))

router.get('/projects',require(path.resolve(__dirname,'projects.js')))

module.exports=router
