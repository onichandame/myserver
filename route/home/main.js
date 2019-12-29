const express = require('express')
const path = require('path')
var router=express.Router()

router.use(require(path.resolve(__dirname,'gateway.js')))

router.get('/about',(req,res,next)=>{
  res.render(path.resolve('home','about.pug'))
})

router.get('/app',(req,res,next)=>{
  res.render(path.resolve('home','app.pug'))
})

router.get('/',(req,res,next)=>{
  res.render(path.resolve('home','home.pug'))
})

module.exports=router
