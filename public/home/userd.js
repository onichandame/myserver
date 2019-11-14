$(document).ready(function(){
  updateuser()
})

function updateuser(){
  const key='sid'
  const sid=localStorage.getItem(key)

  let detail=sid ? request() : Promise.resolve()

  detail.finally(finalize)

  function request(){
    return getXHR('GET','/oauth/request','',{
      Authorization:`Bearer ${sid}`
    })
    .then(res=>{
      if(typeof res != 'object') return Promise.reject()
      const username=res.username
      const email=res.email
      const created_at=res.created_at
      const active=res.active
      const permission=res.permission
      if(!(username && email && created_at && Number.isInteger(active) && Number.isInteger(permission))) return Promise.reject()
      if(active<1) return Promise.reject()
      return res
    })
  }

  function finalize(user){
    let struc=(!(user && user.username && user.email && user.created_at && user.active && user.permission)) ? anonymous() : loggedin()
    return struc
    .then(update)

    function loggedin(){
      let res={}
      res.text=user.username
      res.href='/member/dashboard'
      res.menu=[]
      let upper=[]
      let lower=[]
      let profile={}
      profile.text='Profile'
      profile.href='/member/dashboard'
      upper.push(profile)
      let logout={}
      logout.text='Log out'
      logout.id='logout'
      lower.push(logout)
      res.menu.push(upper)
      res.menu.push(lower)
      return Promise.resolve(res)
    }

    function anonymous(){
      let res={}
      res.text='guest'
      res.href='#'
      res.menu=[]
      res.menu.push([])
      let lower=[]
      let login={}
      login.text='Log in'
      login.id='login'
      lower.push(login)
      res.menu.push(lower)
      return Promise.resolve(res)
    }

    function update(obj){
      if(!(obj && obj.text && obj.href && obj.menu)) return Promise.reject()
      return loadScript('/menu.js')
      .then(()=>{
        resetMenu($('#user'),obj)
      })
    }
  }
}
