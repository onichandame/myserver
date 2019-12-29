const path=require('path')
const okitchen=require('okitchen')

const dft={
  name:'TableApps',
  cols:{
    maintainer:{
      type:'int',
      notnull:true,
      foreign:'TableUsers(rowid)'
    },
    name:{
      type:'text',
      notnull:true,
      unique:true
    },
    home:{
      type:'text',
      notnull:true,
      unique:true
    },
    redirect:{
      type:'text',
      notnull:true,
      unique:true
    },
    secret:{
      type:'text'
    },
    salt:{
      type:'text'
    },
    registered_at:{
      type:'int',
      notnull:true
    },
    approved_at:{
      type:'int'
    },
    approved_by:{
      type:'int',
      foreign:'TableUsers(rowid)'
    }
  }
}

/**
 * initiates files and databases
 * @memberof module:routers/app
 * @function init
 * @returns {Promise} resolves with nothing on success. rejects with error on failure
 */
module.exports=function(){
  return checkTable()

  function checkTable(){
    return okitchen.config.set('app.table',dft)
    .then(async ()=>{return okitchen.db.addtable(await okitchen.config.get('app.table'))})
    .then(async ()=>{return okitchen.db.checktable(await okitchen.config.get('app.table'))})
  }
}
