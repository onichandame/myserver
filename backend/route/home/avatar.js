const fs=require('fs')
const path=require('path')
const checkpath=require('checkpath')
const okitchen=require('okitchen')

const filepath=path.resolve(__dirname,'avatar.jpg')

module.exports=function(req,res){
  return checkpath(filepath,{type:'file',permission:'r'})
    .then(()=>{
      res.status(200)
      res.file=filepath
    })
    .catch(e=>{
      res.status(500)
      res.body=`Server failed. ${JSON.stringify(e)}`
    })
    .then(()=>{return okitchen.common.reply(res)})
}
