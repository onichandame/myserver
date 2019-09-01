module.exports.sendActivationCode=function(secret,email,req){
  var nodemailer=require('nodemailer')
  var sender=nodemailer.createTransport({host:'smtp.163.com',
                                         port:25,
                                         secure:false,
                                         auth:{user:'ku.china@163.com',
                                               pass:'1995115'}})
  sender.verify(function(err,success){
    if(err){
      console.log('failed to connect to email')
    }else{
      sender.sendMail({from:'account@xiaoweb.com',
      to:email,
      subject:'Activate your account',
      text:req.baseUrl+''})
    }
  })
}
module.exports.sendMail=function(title,correspondent,text){
  var nodemailer=require('nodemailer')
  let transporter=nodemailer.createTransport({
    sendmail:true,
    newline:'windows',
    path:''
  })
}
