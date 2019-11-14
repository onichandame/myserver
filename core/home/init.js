const addtable=require(path.resolve(global.basedir,'core','db','addtable.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))

function init(){
  const tbl={
    name:'TableHome',
    cols:{
      redirect_uri:'TEXT NOT NULL',
      secret:'TEXT',
      admin:'INT'
    }
  }
  const dft={
    redirect_uri:'/login'
  }

  return checkTbl()
  .then(checkAdmin)

  function checkTbl(){
    return addtable(tbl)
  }

  function checkAdmin(){
    return select('TableHome',['admin'])
    .then(rows=>{
      if(rows.length<1) return Promise.reject(1)
      if(!(Number.isInteger(rows[0].admin) && rows[0].redirect_uri && rows[0].secret)) return Promise.reject(2)
    })
    .catch(e=>{
      if(e==1) return insert('TableHome',dft)
      else if(e==2) return drop('TableHome').then(()=>{return insert('TableHome',dft)})
      else return Promise.reject(e)
    })
  }
}
