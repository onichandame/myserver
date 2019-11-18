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
      active:'INT NOT NULL', //0: inactive; 1: active
      email:'TEXT NOT NULL',
      password:'TEXT NOT NULL',
      created_at:'INT NOT NULL',
      permission:'INT NOT NULL' //0: admin(only); 1: maintainer; 2: user 3: guest
    }
  },
  {
    name:'TableApp',
    cols:{
      name:'TEXT NOT NULL',
      redirect_uri:'TEXT NOT NULL',
      secret:'TEXT NOT NULL',
      type:'INT NOT NULL', //0:web; 1:native
      approved_by:'INT',
      registered_by:'INT',
      permission:'INT NOT NULL' //1: read; 2: write
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

function firstApp(){
  return select('TableApp',['rowid'],'permission=2 LIMIT 1')
  .then(rows=>{
    if(rows.length) return
    else return Promise.reject(1)
  })
  .catch(e=>{
    if(e!=1) return Promise.reject(e)
    const secret=randomstring.generate({
      length:20,
      charset:'alphabetic'
    })
    return hash(secret)
    .then(h=>{
      return insert('TableApp',{name:'main',redirect_uri:'',secret:h,type:0,permission:2})
      .then(lastid=>{
        let main={}
        main.cid=lastid
        main.secret=secret
        return fsp.writeFile(path.resolve(__dirname,'main.json'),JSON.stringify(main))
      })
    })
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
  .then(firstApp)
}

function init(){
  let p=[]
  tbls.forEach(tbl=>{p.push(addtable(tbl))})
  return Promise.all(p)
  .then(configure)
}

module.exports=init