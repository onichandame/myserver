const path=require('path')
const fs=require('fs')
const fsp=fs.promises

const {addtable,insert,select,update}=require(path.resolve(__dirname,'..','core.js',)).db
const {hash}=require(path.resolve(__dirname,'..','core.js',)).encrypt

const tbls=[
  {
    name:'TableUser',
    cols:{
      username:'TEXT NOT NULL',
      active:'INT NOT NULL', //0: inactive; 1: active
      email:'TEXT NOT NULL',
      password:'TEXT NOT NULL',
      created_at:'INT NOT NULL',
      permission:'INT NOT NULL' //0: admin(only); 1: maintainer; 2: user
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

function configure(){
  return firstApp()

function firstApp(){
  return select('TableApp',['rowid'],'permission=2 LIMIT 1')
  .then(rows=>{
    if(rows.length) return
    else return createFirstApp()

    function createFirstApp(){
      const secret=randomstring.generate({
        length:20,
        charset:'alphabetic'
      })
      return hash(secret)
      .then(h=>{
        return insert('TableApp',{name:'main',redirect_uri:'',secret:h,type:1,permission:2})
        .then(lastid=>{
          let main={}
          main.cid=lastid
          main.secret=secret
          return fsp.writeFile(path.resolve(__dirname,'main.json'),JSON.stringify(main))
        })
      })
    }
  })
}
}

module.export=function(){
  let p=[]
  tbls.forEach(tbl=>{p.push(addtable(tbl))})
  return Promise.all(p)
  .then(configure)
}
