const path=require('path')
const fs=require('fs')
const fsp=fs.promises
const addtable=require(path.resolve(global.basedir,'core','db','addtable.js'))
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const update=require(path.resolve(global.basedir,'core','db','update.js'))

const tbls=[
  {
    name:'TableUser',
    cols:{
      username:'TEXT NOT NULL',
      active:'INT NOT NULL',
      email:'TEXT NOT NULL',
      password:'TEXT NOT NULL',
      created_at:'TEXT NOT NULL',
      permission:'INT NOT NULL',
      last_login:'TEXT'
    }
  },
  {
    name:'TableApp',
    cols:{
      name:'TEXT NOT NULL',
      redirect_uri:'TEXT NOT NULL',
      secret:'TEXT NOT NULL',
      type:'INT NOT NULL',
      approved_by:'INT NOT NULL',
      permissioni:'INT NOT NULL'
    }
  },
  {
    name:'TableError',
    cols:{
      code:'INT NOT NULL',
      description:'TEXT NOT NULL',
      solutions:'TEXT NOT NULL'
    }
  }
]

function storeError(e){
  return select('TableError',['description','solutions'],'code='+e.code)
  .then(rows=>{
    if(rows.length!=1)
      return rows.length
    else
      if(!(rows[0].description==e.description&&rows[0].solutions==JSON.stringify(e.solutions)))
        return 1
      else
        return -1
  })
  .then(flag=>{
    if(!flag)
      return insert('TableError',e)
    else if(flag<0)
      return update('TableError',e,'code='+e.code)
  })
}

function configure(){
  return fsp.readFile(path.resolve(__dirname,'error.json'),'utf8')
  .then(data=>{
    const rows=JSON.parse(data)
    let p=[]
    rows.forEach(row=>{p.push(storeError(row))})
    return Promise.all(p)
  })
}

function init(){
  let p=[]
  tbls.forEach(tbl=>{p.push(addtable(tbl))})
  return Promise.all(p)
  .then(configure)
}

module.exports=init
