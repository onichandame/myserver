const path=require('path')
const okitchen=require('okitchen')

const adduser=require(path.resolve(__dirname,'common','adduser.js'))

const dft_signup={
  name:'TableSignup',
  cols:{
    email:{
      type:'text',
      notnull:true,
      unique:true
    },
    signup_at:{
      type:'int',
      notnull:true
    },
    salt:{
      type:'text',
      notnull:true
    },
    secret:{
      type:'text',
      unique:true,
      notnull:true
    }
  }
}

const dft_user={
  name:'TableUsers',
  cols:{
    uname:{
      type:'text',
      notnull:true,
      unique:true
    },
    email:{
      type:'text',
      notnull:true,
      unique:true
    },
    password:{
      type:'text'
    },
    salt:{
      type:'text',
      notnull:true
    },
    level:{
      type:'int',
      notnull:true,
      check:'level<3'//0:admin;1:app-admin;2:user
    },
    created_at:{
      type:'int',
      notnull:true
    },
    status:{
      type:'int',
      notnull:true,
      check:'status>=0 AND status<5'//0:active;1:suspecious;2:blocked;3:banned;4:permanently banned
    },
    banned_at:{
      type:'int'
    },
    recover_in:{
      type:'int'
    }
  }
}

dft_session={
  name:'TableSession',
  cols:{
    user:{
      type:'int',
      notnull:true,
      foreign:'TableUsers(rowid)'
    },
    key:{
      type:'text',
      notnull:true,
      unique:true
    },
    salt:{
      type:'text',
      notnull:true
    },
    created_at:{
      type:'int',
      notnull:true
    },
    expires_in:{
      type:'int',
      notnull:true
    }
  }
}

const dft_admin={
  uname:'admin',
  email:'admin@admin',
  password:'admin',
  level:0,
  status:0
}

module.exports=async function(){
  return checkTable()
  .then(()=>{return checkAdmin()})
  .catch(e=>{return okitchen.logger.error(e)})

  function checkTable(){
    return okitchen.config.set('auth.table',dft_user)
    .then(async ()=>{return okitchen.db.addtable(await okitchen.config.get('auth.table'))})
    .then(async ()=>{return okitchen.db.checktable(await okitchen.config.get('auth.table'))})
    .then(()=>{return okitchen.config.set('session.table',dft_session)})
    .then(async ()=>{return okitchen.db.addtable(await okitchen.config.get('session.table'))})
    .then(async ()=>{return okitchen.db.checktable(await okitchen.config.get('session.table'))})
    .then(()=>{return okitchen.config.set('signup.table',dft_signup)})
    .then(async ()=>{return okitchen.db.addtable(await okitchen.config.get('signup.table'))})
    .then(async ()=>{return okitchen.db.checktable(await okitchen.config.get('signup.table'))})
  }

  function checkAdmin(){
    return okitchen.config.get('auth.table')
    .then(tbl=>{
      return okitchen.db.selectOne(tbl.name,[1],'level=0')
      .then(row=>{
        if(!row) return adduser(dft_admin)
      })
    })
  }
}
