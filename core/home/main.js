const express = require('express')
const path = require('path')
var router=express.Router()

router.get('/about',(req,res,next)=>{
  res.render('about.pug')
})

router.get('/app',(req,res,next)=>{
  res.render('app.pug')
})

router.get('/',(req,res,next)=>{
  res.render('home.pug')
})

module.exports=router