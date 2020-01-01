var meta={auth_server:'/oauth'}
meta.request_uri=meta.auth_server+'/request'
meta.validate_uri=meta.auth_server+'/validate'
meta.auth_uri=meta.auth_server+'/authorise?response_type=token&client_id=0&redirect_uri&scope=read write'

var currentPage=''

$(document).ready(function(){
  getUserName()
  $('a').attr('href','javascript:void(0);')
  $('a.x-navbar').click(function(){
    $that=$(this)
    if($that.hasClass('active')){
    }else{
      $('.x-navbar').removeClass('active')
      $that.addClass('active')
    }
  })
  $('#home').click(function(){home()})
  $('#app').click(function(){app()})
  $('#about').click(function(){about()})
  $('#home').click()
})
function home(){
  $('#root').append('<div class="col-xs-3" id="left"></div><div class="col-xs-9" id="main"></div>')
}
function app(){
  apps=[{title:'Worklog',
         description:'Record your jobs everyday. In the future it will act as a planmaker for individules and corporations.',
         icon:'/app/worklog/worklog.jpg',
         href:'/app/worklog'}]
  $('#root').append(appCards(apps))
  $('#root').append('<a href="/oauth/register-app" class="col-xs-12">Register your own app</a>')
}
function appCards(props){
  var result=''
  props.forEach((val,ind,arr)=>{
    result+=addCard(val.title,val.description,val.icon,val.href)
  })
  return result
}
function addCard(title,description,icon,href){
  return ('<a class="col-xs-12 col-sm-6 col-md-4 col-lg-3 card justify-content-center" style="width: 20rem;" href="'+href+'">'+
    '<img class="card-img-top" src="'+icon+'"></img>'+
    '<div class="card-body"><h5 class="card-title text-center">'+title+'</h5><p class="card-text">'+description+'</p></div>'+
    '</a>'
  )
}
function about(){
}
function getUserName(){
  if(typeof(Storage)!='undefined'){
    let token=localStorage.getItem("tok")
    if(token){
      let xhr=new XMLHttpRequest()
      xhr.open('POST',meta.validate_uri)
      xhr.setRequestHeader('Content-Type','application/json')
      xhr.send(JSON.stringify({token:token}))
      xhr.onload=function(){
        named(JSON.parse(xhr.response).username)
      }
      xhr.onerror=function(){
        anonymous()
      }
    }else{
      anonymous()
    }
  }else{
    anonymous()
  }
}
function anonymous(){
  $('#user').append('<a class="nav-link x-navbar" role="button" href="'+meta.auth_uri+'">Login</a>')
}
function named(uname){
  $('#user').append('<a href="#" class="nav-link dropdown-toggle x-navbar" data="dropdown" role="button" aria-haspopup="true" aria-expanded="false">'+uname+'</a>'+
    '<span class="caret">')
  $('#user').after('<ul class="dropdown-menu bg-dark">'+
    '<li><a class="nav-link x-navbar" href="#">Profile</a></li>'+
    '<li role="separator" class="divider">'+
    '<li><a class="nav-link x-navbar" href="#">Log out</a></li>'+
    '</ul>')
}
